import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { runBuild } from "@especialista-do-ar/pipeline";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { abrirApiEstatica } from "../src/index.ts";

const fixtureAparelhos = fileURLToPath(
  new URL(
    "../../pipeline/test/fixtures/amostra-aparelhos.csv",
    import.meta.url,
  ),
);

let dataDir: string;
let buildDir: string;

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), "especialista-api-"));
  buildDir = join(dataDir, "build");
  runBuild({
    dataDir,
    source: fixtureAparelhos,
    origem: "teste",
    obtidoEm: "2026-10-12",
    reportsDir: join(dataDir, "reports"),
  });
});

afterEach(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

describe("API estática — artefatos servidos", () => {
  it("publica os artefatos que a API estática consome", () => {
    for (const arquivo of [
      "aparelhos.jsonl",
      "aparelhos.json",
      "schema.json",
      "manifest.json",
    ]) {
      expect(existsSync(join(buildDir, arquivo))).toBe(true);
    }
  });

  it("abre a base servida e expõe a Versão da tabela", () => {
    const api = abrirApiEstatica(buildDir);
    const versao = api.versaoDaTabela();
    expect(versao.obtidoEm).toBe("2026-10-12");
    expect(versao.arquivo).toBe("raw/inmetro-export-2026-10-12.csv");
    expect(versao.origem).toBe("teste");
    expect(versao.contagemLinhas).toBe(6);
  });

  it("falha com artefato estático ausente", () => {
    rmSync(join(buildDir, "manifest.json"));
    expect(() => abrirApiEstatica(buildDir)).toThrow("manifest.json");
  });
});

describe("API estática — consulta por ID", () => {
  it("resolve um Aparelho pelo seu ID", () => {
    const api = abrirApiEstatica(buildDir);
    const kennedy = api.porId("ap-3db0d78621d7");
    expect(kennedy).toMatchObject({
      id: "ap-3db0d78621d7",
      marca: "KENNEDY",
      modelo: "K-09INT - K-09EXT",
      unidadeInterna: "K-09INT",
      unidadeExterna: "K-09EXT",
      registros: [{ numero: "002/2021", status: "Ativo" }],
      linhas: [3],
    });
    expect(kennedy?.variantes).toHaveLength(1);
    expect(kennedy?.variantes[0]?.dados.capacidadeNominalBtu).toBe(9000);
  });

  it("devolve undefined para um ID que não existe na base servida", () => {
    const api = abrirApiEstatica(buildDir);
    expect(api.porId("ap-000000000000")).toBeUndefined();
  });
});

describe("API estática — listas", () => {
  it("expõe os Aparelhos da base servida", () => {
    const api = abrirApiEstatica(buildDir);
    const aparelhos = api.listar();
    expect(aparelhos.map((aparelho) => aparelho.modelo)).toEqual([
      "GREE-09",
      "K-09INT - K-09EXT",
      "LG-09",
    ]);
    expect(aparelhos.map((aparelho) => aparelho.id)).toEqual([
      "ap-4e985f48c99e",
      "ap-3db0d78621d7",
      "ap-97ddaad7049d",
    ]);
  });
});
