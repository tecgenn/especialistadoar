import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runBuild } from "../src/build.ts";
import { type Manifest, sha256Hex } from "../src/ingest.ts";

const fixturePath = fileURLToPath(
  new URL("./fixtures/amostra.csv", import.meta.url),
);
const fixtureBytes = readFileSync(fixturePath);
const exportVersadaPath = fileURLToPath(
  new URL("../../../data/raw/inmetro-export-2026-10-12.csv", import.meta.url),
);

let dataDir: string;

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), "especialista-"));
});

afterEach(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

function build(): ReturnType<typeof runBuild> {
  return runBuild({
    dataDir,
    source: fixturePath,
    origem: "teste",
    obtidoEm: "2026-10-12",
  });
}

function lerManifest(): Manifest {
  return JSON.parse(
    readFileSync(join(dataDir, "build/manifest.json"), "utf8"),
  ) as Manifest;
}

describe("runBuild — ingestão e manifesto", () => {
  it("grava o manifesto com hash, origem, data e contagem de Linhas", () => {
    const { versao } = build();
    expect(versao.hash).toBe(sha256Hex(fixtureBytes));
    expect(versao.origem).toBe("teste");
    expect(versao.obtidoEm).toBe("2026-10-12");
    expect(versao.contagemLinhas).toBe(3);
    expect(lerManifest().versoes).toHaveLength(1);
    expect(lerManifest().versaoAtual).toBe(versao.hash);
  });

  it("copia o snapshot raw imutável com nome datado", () => {
    build();
    expect(existsSync(join(dataDir, "raw/inmetro-export-2026-10-12.csv"))).toBe(
      true,
    );
    expect(
      readFileSync(join(dataDir, "raw/inmetro-export-2026-10-12.csv")),
    ).toEqual(fixtureBytes);
  });

  it("é idempotente por conteúdo: rodar duas vezes não duplica", () => {
    build();
    const antes = readFileSync(join(dataDir, "build/manifest.json"), "utf8");
    const segundo = build();
    const depois = readFileSync(join(dataDir, "build/manifest.json"), "utf8");
    expect(segundo.manifest.versoes).toHaveLength(1);
    expect(depois).toBe(antes);
  });
});

describe("runBuild — registros.jsonl", () => {
  it("preserva cada Linha com proveniência da Versão da tabela", () => {
    const { versao } = build();
    const linhas = readFileSync(join(dataDir, "build/registros.jsonl"), "utf8")
      .trimEnd()
      .split("\n")
      .map((linha) => JSON.parse(linha));
    expect(linhas).toHaveLength(3);
    expect(linhas[0]).toMatchObject({ linha: 1, versao: versao.hash });
    expect(linhas[0].valores.Marca).toBe("Samsung");
    expect(
      linhas[1].valores["Capacidade de Refrigeração Nominal (Btu/h)"],
    ).toBe("");
  });

  it("bate com os snapshots golden de registros.jsonl e manifest.json", () => {
    build();
    expect(
      readFileSync(join(dataDir, "build/registros.jsonl"), "utf8"),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(dataDir, "build/manifest.json"), "utf8"),
    ).toMatchSnapshot();
  });
});

describe("runBuild — descoberta do snapshot raw versionado", () => {
  it("constrói a partir do snapshot em data/raw quando não há --source", () => {
    mkdirSync(join(dataDir, "raw"), { recursive: true });
    copyFileSync(
      fixturePath,
      join(dataDir, "raw/inmetro-export-2026-10-12.csv"),
    );
    const { versao } = runBuild({ dataDir });
    expect(versao.hash).toBe(sha256Hex(fixtureBytes));
    expect(versao.obtidoEm).toBe("2026-10-12");
    expect(versao.contagemLinhas).toBe(3);
    expect(versao.origem).toContain("INMETRO");
  });

  it("reconstrói a partir da Versão da tabela atual do manifesto", () => {
    build();
    const { versao } = runBuild({ dataDir });
    expect(versao.hash).toBe(sha256Hex(fixtureBytes));
    expect(versao.contagemLinhas).toBe(3);
  });
});

describe("runBuild — exportação versionada real", () => {
  it("constrói as 7474 Linhas da tabela com o hash do CSV versionado", () => {
    const bytes = readFileSync(exportVersadaPath);
    const { versao } = runBuild({
      dataDir,
      source: exportVersadaPath,
      origem: "teste",
      obtidoEm: "2026-10-12",
    });
    expect(versao.hash).toBe(sha256Hex(bytes));
    expect(versao.contagemLinhas).toBe(7474);

    const linhas = readFileSync(join(dataDir, "build/registros.jsonl"), "utf8")
      .trimEnd()
      .split("\n")
      .map((linha) => JSON.parse(linha));
    expect(linhas).toHaveLength(7474);
    expect(linhas[0].valores.Marca).toBe("Samsung");
    expect(linhas[7473]).toBeDefined();
  });
});
