import { describe, expect, it } from "vitest";
import { UFS, validarTarifas } from "../src/lib/tarifas.ts";

/**
 * A curadoria das tarifas é um insumo do site (`apps/site/tarifas.json`):
 * validação do contrato — 27 UFs, cada uma uma vez, com tarifa numérica e
 * positiva, mais mês de referência e fonte.
 */
function curadoriaValida(): { ufs: Record<string, unknown>[] } {
  return {
    ufs: UFS.map(({ uf, nome }) => ({
      uf,
      nome,
      tarifa: 0.9,
      referencia: "2026-11",
      fonte: "ANEEL",
    })),
  };
}

function comUf(
  uf: string,
  troca: Record<string, unknown>,
): { ufs: Record<string, unknown>[] } {
  const curadoria = curadoriaValida();
  curadoria.ufs = curadoria.ufs.map((entrada) =>
    entrada.uf === uf ? { ...entrada, ...troca } : entrada,
  );
  return curadoria;
}

describe("validação da curadoria das tarifas", () => {
  it("aceita as 27 UFs com tarifa, referência e fonte, preservando a ordem", () => {
    const validadas = validarTarifas(curadoriaValida());

    expect(validadas.ufs).toHaveLength(27);
    expect(validadas.ufs.map((tarifa) => tarifa.uf)).toEqual(
      UFS.map(({ uf }) => uf),
    );
    expect(validadas.ufs[0]).toEqual({
      uf: "AC",
      nome: "Acre",
      tarifa: 0.9,
      referencia: "2026-11",
      fonte: "ANEEL",
    });
  });

  it("normaliza a UF digitada em minúsculas", () => {
    const validadas = validarTarifas(comUf("SP", { uf: "sp" }));
    expect(validadas.ufs.find((tarifa) => tarifa.uf === "SP")).toBeDefined();
  });

  it("recusa UF desconhecida e cita a UF na mensagem", () => {
    const curadoria = curadoriaValida();
    curadoria.ufs[0] = { ...curadoria.ufs[0], uf: "XX" };
    expect(() => validarTarifas(curadoria)).toThrow(/UF XX: UF desconhecida/);
  });

  it("recusa UF repetida e cita a UF na mensagem", () => {
    const curadoria = curadoriaValida();
    curadoria.ufs.push({ ...curadoria.ufs[0] });
    expect(() => validarTarifas(curadoria)).toThrow(/UF AC: UF duplicada/);
  });

  it("recusa tarifa que não seja número positivo e finito", () => {
    for (const tarifa of [
      0,
      -0.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      "0.9",
    ]) {
      expect(() => validarTarifas(comUf("SP", { tarifa }))).toThrow(
        /UF SP: `tarifa`/,
      );
    }
  });

  it("recusa referência ou fonte em branco, citando a UF", () => {
    expect(() => validarTarifas(comUf("RJ", { referencia: "  " }))).toThrow(
      /UF RJ: `referencia` é obrigatório/,
    );
    expect(() => validarTarifas(comUf("MG", { fonte: "" }))).toThrow(
      /UF MG: `fonte` é obrigatório/,
    );
    expect(() => validarTarifas(comUf("BA", { nome: "" }))).toThrow(
      /UF BA: `nome` é obrigatório/,
    );
  });

  it("recusa uma UF ausente na curadoria, nomeando quem falta", () => {
    const curadoria = curadoriaValida();
    curadoria.ufs = curadoria.ufs.filter((entrada) => entrada.uf !== "TO");
    expect(() => validarTarifas(curadoria)).toThrow(
      /UF ausente na curadoria: TO/,
    );
  });

  it("recusa um insumo que não seja objeto com lista `ufs`", () => {
    expect(() => validarTarifas([])).toThrow(/objeto com `ufs`/);
    expect(() => validarTarifas({ ufs: "SP" })).toThrow(/lista/);
    expect(() => validarTarifas({ ufs: [null] })).toThrow(
      /precisa ser um objeto/,
    );
  });
});
