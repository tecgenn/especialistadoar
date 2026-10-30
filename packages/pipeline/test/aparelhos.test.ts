import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Aparelho } from "../src/aparelho.ts";
import { runBuild } from "../src/build.ts";

const fixtureAparelhos = fileURLToPath(
  new URL("./fixtures/amostra-aparelhos.csv", import.meta.url),
);
const exportVersadaPath = fileURLToPath(
  new URL("../../../data/raw/inmetro-export-2026-10-12.csv", import.meta.url),
);

let dataDir: string;

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), "especialista-aparelhos-"));
});

afterEach(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

function build(source: string): ReturnType<typeof runBuild> {
  return runBuild({
    dataDir,
    source,
    origem: "teste",
    obtidoEm: "2026-10-12",
    reportsDir: join(dataDir, "reports"),
  });
}

function lerAparelhosJsonl(): Aparelho[] {
  return readFileSync(join(dataDir, "build/aparelhos.jsonl"), "utf8")
    .trimEnd()
    .split("\n")
    .map((linha) => JSON.parse(linha));
}

describe("runBuild — base servida (aparelhos.jsonl)", () => {
  it("gera um Aparelho por identidade, só com Dados declarados", () => {
    build(fixtureAparelhos);
    const aparelhos = lerAparelhosJsonl();
    expect(aparelhos.map((aparelho) => aparelho.modelo)).toEqual([
      "GREE-09",
      "K-09INT - K-09EXT",
      "LG-09",
    ]);
  });

  it("um Aparelho bivolt é um só, com uma variante por tensão", () => {
    build(fixtureAparelhos);
    const aparelhos = lerAparelhosJsonl();
    const gree = aparelhos.filter((aparelho) => aparelho.marca === "GREE");
    expect(gree).toHaveLength(1);
    expect(gree[0]?.variantes).toHaveLength(2);
    expect(
      gree[0]?.variantes.map((variante) => variante.tensao?.voltagens),
    ).toEqual([[127], [220]]);
  });

  it("agrega as Linhas e Registros de origem, sem repetir a variante idêntica", () => {
    build(fixtureAparelhos);
    const [gree] = lerAparelhosJsonl();
    expect(gree?.linhas).toEqual([1, 2, 6]);
    expect(gree?.registros).toEqual([
      { numero: "002/2021", status: "Ativo" },
      { numero: "004/2021", status: "Ativo" },
    ]);
    expect(
      gree?.variantes.find((variante) => variante.tensao?.voltagens[0] === 127)
        ?.linhas,
    ).toEqual([1, 6]);
  });

  it("marcas que compartilham um Registro INMETRO geram Aparelhos distintos", () => {
    build(fixtureAparelhos);
    const aparelhos = lerAparelhosJsonl();
    const compartilham = aparelhos.filter((aparelho) =>
      aparelho.registros.some((registro) => registro.numero === "002/2021"),
    );
    expect(compartilham.map((aparelho) => aparelho.marca)).toEqual([
      "GREE",
      "KENNEDY",
    ]);
    expect(new Set(compartilham.map((aparelho) => aparelho.id)).size).toBe(2);
  });

  it("usa modelo da unid. interna + externa na identidade quando separadas", () => {
    build(fixtureAparelhos);
    const kennedy = lerAparelhosJsonl().find(
      (aparelho) => aparelho.marca === "KENNEDY",
    );
    expect(kennedy?.unidadeInterna).toBe("K-09INT");
    expect(kennedy?.unidadeExterna).toBe("K-09EXT");
  });

  it("lê a coluna entre aspas com vírgula (fluido refrigerante especificado)", () => {
    build(fixtureAparelhos);
    const lg = lerAparelhosJsonl().find(
      (aparelho) => aparelho.modelo === "LG-09",
    );
    expect(lg?.fluidoRefrigerante).toBe("Outro");
    expect(lg?.fluidoEspecificado).toBe("R22");
  });

  it("deixa o Aparelho sem Dados declarados como Linha do histórico", () => {
    build(fixtureAparelhos);
    const registros = readFileSync(
      join(dataDir, "build/registros.jsonl"),
      "utf8",
    )
      .trimEnd()
      .split("\n")
      .map((linha) => JSON.parse(linha) as { valores: Record<string, string> });
    const linhaSemDados = registros.find(
      (registro) => registro.valores.Modelo === "LG-EMPTY",
    );
    expect(linhaSemDados).toBeDefined();
    expect(
      lerAparelhosJsonl().some((aparelho) => aparelho.modelo === "LG-EMPTY"),
    ).toBe(false);
  });

  it("gera um id estável e distinto por Aparelho", () => {
    build(fixtureAparelhos);
    const ids = lerAparelhosJsonl().map((aparelho) => aparelho.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => id.startsWith("ap-"))).toBe(true);
  });
});

describe("runBuild — espelho aparelhos.json e contrato schema.json", () => {
  it("aparelhos.json é espelho fiel de aparelhos.jsonl", () => {
    build(fixtureAparelhos);
    const viaJson = JSON.parse(
      readFileSync(join(dataDir, "build/aparelhos.json"), "utf8"),
    ) as Aparelho[];
    expect(viaJson).toEqual(lerAparelhosJsonl());
  });

  it("schema.json é derivado dos tipos TypeBox (draft-07, base servida)", () => {
    build(fixtureAparelhos);
    const schema = JSON.parse(
      readFileSync(join(dataDir, "build/schema.json"), "utf8"),
    );
    expect(schema.$schema).toBe("http://json-schema.org/draft-07/schema#");
    expect(Object.keys(schema.properties)).toContain("variantes");
    expect(schema.required).toContain("linhas");
    expect(schema.required).toContain("registros");
  });

  it("bate com os snapshots golden da base servida", () => {
    build(fixtureAparelhos);
    expect(
      readFileSync(join(dataDir, "build/aparelhos.jsonl"), "utf8"),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(dataDir, "build/aparelhos.json"), "utf8"),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(dataDir, "build/schema.json"), "utf8"),
    ).toMatchSnapshot();
  });
});

describe("runBuild — base servida da exportação versionada real", () => {
  it("agrupa 2227 Aparelhos com proveniência, sem identidade repetida", () => {
    const { aparelhos } = build(exportVersadaPath);
    expect(aparelhos).toHaveLength(2227);
    expect(
      aparelhos.every(
        (aparelho) =>
          aparelho.linhas.length > 0 && aparelho.registros.length > 0,
      ),
    ).toBe(true);
    expect(new Set(aparelhos.map((aparelho) => aparelho.id)).size).toBe(2227);
  });
});
