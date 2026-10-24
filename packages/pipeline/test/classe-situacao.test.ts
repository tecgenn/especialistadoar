import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Aparelho } from "../src/aparelho.ts";
import { runBuild } from "../src/build.ts";

const fixtureClasse = fileURLToPath(
  new URL("./fixtures/amostra-classe.csv", import.meta.url),
);
const exportVersadaPath = fileURLToPath(
  new URL("../../../data/raw/inmetro-export-2026-10-12.csv", import.meta.url),
);

let dataDir: string;

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), "especialista-classe-"));
});

afterEach(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

function build(source: string): Aparelho[] {
  return runBuild({
    dataDir,
    source,
    origem: "teste",
    obtidoEm: "2026-10-12",
    reportsDir: join(dataDir, "reports"),
  }).aparelhos;
}

function porMarca(aparelhos: Aparelho[], marca: string): Aparelho {
  const encontrado = aparelhos.find((aparelho) => aparelho.marca === marca);
  if (encontrado === undefined) {
    throw new Error(`Aparelho da marca ${marca} não foi construído.`);
  }
  return encontrado;
}

describe("runBuild — Classe (ADR-0018)", () => {
  it("lê a Faixa de Classificação por Variante, aparada e em maiúsculas", () => {
    const alfa = porMarca(build(fixtureClasse), "ALFA");
    expect(alfa.variantes).toHaveLength(1);
    expect(alfa.variantes.map((variante) => variante.dados.classe)).toEqual([
      "A",
    ]);
  });

  it("preserva uma Classe fora de A–F sem falhar o build", () => {
    const beta = porMarca(build(fixtureClasse), "BETA");
    expect(beta.variantes[0]?.dados.classe).toBe("Z");
  });

  it("célula de Classe vazia vira null", () => {
    const gama = porMarca(build(fixtureClasse), "GAMA");
    expect(gama.variantes[0]?.dados.classe).toBeNull();
  });

  it("mantém Classes divergentes em Variantes distintas", () => {
    const delta = porMarca(build(fixtureClasse), "DELTA");
    expect(delta.variantes.map((variante) => variante.dados.classe)).toEqual([
      "B",
      "A",
    ]);
  });
});

describe("runBuild — Situação (ADR-0018)", () => {
  it("é ativo quando ao menos um Registro está Ativo (mesmo com um Inativo)", () => {
    const alfa = porMarca(build(fixtureClasse), "ALFA");
    expect(alfa.registros.map((registro) => registro.status)).toEqual([
      "Ativo",
      "Inativo",
    ]);
    expect(alfa.situacao).toBe("ativo");
  });

  it("é inativo quando nenhum Registro está Ativo", () => {
    const aparelhos = build(fixtureClasse);
    expect(porMarca(aparelhos, "BETA").situacao).toBe("inativo");
    expect(porMarca(aparelhos, "GAMA").situacao).toBe("ativo");
  });
});

describe("runBuild — Classe e Situação na exportação real", () => {
  it("todo Aparelho servido tem Classe e uma Situação derivada dos Registros", () => {
    const aparelhos = build(exportVersadaPath);
    expect(aparelhos).toHaveLength(2460);
    expect(
      aparelhos.filter((aparelho) =>
        aparelho.variantes.every((variante) => variante.dados.classe === null),
      ),
    ).toHaveLength(0);
    expect(
      aparelhos.filter((aparelho) => aparelho.situacao === "inativo"),
    ).toHaveLength(146);
  });
});
