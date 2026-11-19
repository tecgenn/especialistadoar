import { describe, expect, it } from "vitest";
import {
  estadoNaFaixa,
  FAIXAS_CAPACIDADE,
  faixaContem,
  faixaDoEstado,
  faixasDeCapacidade,
  rotuloDaFaixa,
} from "../src/lib/faixas-capacidade.ts";

describe("faixas de capacidade (ticket 60)", () => {
  it("define as seis faixas comerciais, sem buraco entre elas", () => {
    expect(FAIXAS_CAPACIDADE.map(rotuloDaFaixa)).toEqual([
      "Até 9.000 BTU/h",
      "9.001–12.000 BTU/h",
      "12.001–18.000 BTU/h",
      "18.001–24.000 BTU/h",
      "24.001–30.000 BTU/h",
      "Acima de 30.000 BTU/h",
    ]);
  });

  it("inclui os dois limites no intervalo", () => {
    const segunda = FAIXAS_CAPACIDADE[1];
    expect(segunda).toBeDefined();
    if (segunda === undefined) {
      return;
    }
    expect(faixaContem(segunda, 9001)).toBe(true);
    expect(faixaContem(segunda, 12000)).toBe(true);
    expect(faixaContem(segunda, 9000)).toBe(false);
    expect(faixaContem(segunda, 12001)).toBe(false);
  });

  it("deriva dos dados só as faixas que têm Aparelho na base", () => {
    expect(faixasDeCapacidade([9000, 12000]).map(rotuloDaFaixa)).toEqual([
      "Até 9.000 BTU/h",
      "9.001–12.000 BTU/h",
    ]);
    expect(faixasDeCapacidade([18000]).map(rotuloDaFaixa)).toEqual([
      "12.001–18.000 BTU/h",
    ]);
    expect(faixasDeCapacidade([])).toEqual([]);
  });

  it("9.000 fica em 'até 9.000' e 9.001 na faixa seguinte", () => {
    expect(faixasDeCapacidade([9000, 9001]).map(rotuloDaFaixa)).toEqual([
      "Até 9.000 BTU/h",
      "9.001–12.000 BTU/h",
    ]);
  });

  it("lê a faixa do estado e ignora a capacidade exata", () => {
    expect(faixaDoEstado({ btuMin: 12001, btuMax: 18000 })).toEqual({
      min: 12001,
      max: 18000,
    });
    expect(faixaDoEstado({ btuMin: 30001 })).toEqual({ min: 30001 });
    expect(faixaDoEstado({ btu: 12000, btuMin: 9001, btuMax: 12000 })).toBe(
      undefined,
    );
    expect(faixaDoEstado({})).toBeUndefined();
  });

  it("acende a faixa exatamente igual ao estado", () => {
    const primeira = FAIXAS_CAPACIDADE[0];
    expect(primeira).toBeDefined();
    if (primeira === undefined) {
      return;
    }
    expect(estadoNaFaixa({ btuMax: 9000 }, primeira)).toBe(true);
    expect(estadoNaFaixa({ btuMin: 9001, btuMax: 9000 }, primeira)).toBe(false);
    expect(estadoNaFaixa({ btu: 9000 }, primeira)).toBe(false);
  });
});
