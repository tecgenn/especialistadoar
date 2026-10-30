import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { carregarFiltros } from "../src/conteudo/filtros.ts";

/**
 * O glue valida a curadoria **no build** (seam `FILTROS_JSON`): o insumo
 * publicado precisa passar e um insumo inválido precisa falhar alto, em vez de
 * gerar chips errados em silêncio.
 */
const filtrosJson = fileURLToPath(new URL("../filtros.json", import.meta.url));
const siteDir = fileURLToPath(new URL("../", import.meta.url));
const temporarios: string[] = [];
const envAnterior = process.env.FILTROS_JSON;

function fixture(conteudo: unknown): string {
  const dir = mkdtempSync(join(siteDir, ".filtros-fixture-"));
  temporarios.push(dir);
  const caminho = join(dir, "filtros.json");
  writeFileSync(caminho, JSON.stringify(conteudo, null, 2));
  return caminho;
}

afterEach(() => {
  if (envAnterior === undefined) {
    delete process.env.FILTROS_JSON;
  } else {
    process.env.FILTROS_JSON = envAnterior;
  }
});

afterAll(() => {
  for (const dir of temporarios) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("curadoria dos filtros no build", () => {
  it("aceita o insumo publicado: 10 marcas e 6 capacidades", () => {
    process.env.FILTROS_JSON = filtrosJson;
    const filtros = carregarFiltros();
    expect(filtros.marcas).toHaveLength(10);
    expect(filtros.btus).toEqual([9000, 12000, 18000, 24000, 30000, 36000]);
    expect(filtros.marcas.map((marca) => marca.rotulo)).toContain("Midea");
  });

  it("aceita o insumo publicado: 6 classes com cor", () => {
    process.env.FILTROS_JSON = filtrosJson;
    const filtros = carregarFiltros();
    expect(filtros.classes.map((classe) => classe.valor)).toEqual([
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
    ]);
    for (const classe of filtros.classes) {
      expect(classe.rotulo).toBe(`Classe ${classe.valor}`);
      expect(classe.cor).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("falha o build com a mensagem do contrato quando o insumo é inválido", () => {
    process.env.FILTROS_JSON = fixture({
      marcas: [{ valor: "MIDEA", rotulo: "" }],
      btus: [],
    });
    expect(() => carregarFiltros()).toThrow(/Marca #0.*rotulo/);
  });

  it("falha o build com caminho claro quando o insumo não existe", () => {
    process.env.FILTROS_JSON = join(siteDir, ".nao-existe", "filtros.json");
    expect(() => carregarFiltros()).toThrow(/não foi possível ler/);
  });
});
