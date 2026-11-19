import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { carregarTarifas } from "../src/conteudo/tarifas.ts";
import { UFS } from "../src/lib/tarifas.ts";

/**
 * O glue valida a curadoria **no build** (seam `TARIFAS_JSON`): o insumo
 * publicado precisa passar e um insumo inválido precisa falhar alto, citando a
 * UF, em vez de gerar "R$ NaN" na calculadora.
 */
const tarifasJson = fileURLToPath(new URL("../tarifas.json", import.meta.url));
const siteDir = fileURLToPath(new URL("../", import.meta.url));
const temporarios: string[] = [];
const envAnterior = process.env.TARIFAS_JSON;

function fixture(conteudo: unknown): string {
  const dir = mkdtempSync(join(siteDir, ".tarifas-fixture-"));
  temporarios.push(dir);
  const caminho = join(dir, "tarifas.json");
  writeFileSync(caminho, JSON.stringify(conteudo, null, 2));
  return caminho;
}

afterEach(() => {
  if (envAnterior === undefined) {
    delete process.env.TARIFAS_JSON;
  } else {
    process.env.TARIFAS_JSON = envAnterior;
  }
});

afterAll(() => {
  for (const dir of temporarios) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("curadoria das tarifas no build", () => {
  it("aceita o insumo publicado: 27 UFs com referência e fonte", () => {
    process.env.TARIFAS_JSON = tarifasJson;
    const tarifas = carregarTarifas();

    expect(tarifas.ufs).toHaveLength(27);
    expect(tarifas.ufs.map((tarifa) => tarifa.uf)).toEqual(
      UFS.map(({ uf }) => uf),
    );
    for (const tarifa of tarifas.ufs) {
      expect(tarifa.tarifa).toBeGreaterThan(0);
      expect(tarifa.referencia).toMatch(/^\d{4}-\d{2}$/);
      expect(tarifa.fonte.length).toBeGreaterThan(0);
    }
  });

  it("publica a tarifa de São Paulo como padrão da calculadora", () => {
    process.env.TARIFAS_JSON = tarifasJson;
    const sp = carregarTarifas().ufs.find((tarifa) => tarifa.uf === "SP");
    expect(sp?.tarifa).toBe(0.846);
  });

  it("falha o build com a UF na mensagem quando o insumo é inválido", () => {
    process.env.TARIFAS_JSON = fixture({
      ufs: [
        {
          uf: "SP",
          nome: "São Paulo",
          tarifa: 0,
          referencia: "2026-11",
          fonte: "ANEEL",
        },
      ],
    });
    expect(() => carregarTarifas()).toThrow(/UF SP: `tarifa`/);
  });

  it("falha o build com caminho claro quando o insumo não existe", () => {
    process.env.TARIFAS_JSON = join(siteDir, ".nao-existe", "tarifas.json");
    expect(() => carregarTarifas()).toThrow(/não foi possível ler/);
  });
});
