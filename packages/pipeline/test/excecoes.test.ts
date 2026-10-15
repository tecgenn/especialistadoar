import { describe, expect, it } from "vitest";
import {
  aplicarExcecoes,
  type ExcecaoManual,
  validarExcecoes,
} from "../src/excecoes.ts";

function excecao(overrides: Partial<ExcecaoManual> = {}): ExcecaoManual {
  return {
    versao: "abc123",
    linha: 1,
    campo: "IDRS (Wh/Wh)",
    valor: "3,50",
    motivo: "dígito ilegível na exportação",
    fonte: "https://exemplo/errata",
    ...overrides,
  };
}

describe("validarExcecoes", () => {
  it("aceita uma Exceção manual com motivo e fonte", () => {
    expect(() => validarExcecoes([excecao()])).not.toThrow();
  });

  it("exige motivo registrado", () => {
    expect(() => validarExcecoes([excecao({ motivo: "   " })])).toThrow(
      /motivo/,
    );
  });

  it("exige fonte registrada", () => {
    expect(() => validarExcecoes([excecao({ fonte: "" })])).toThrow(/fonte/);
  });

  it("recusa registro que viola o contrato", () => {
    expect(() =>
      validarExcecoes([excecao({ linha: "um" as unknown as number })]),
    ).toThrow(/contrato/);
  });
});

describe("aplicarExcecoes — a correção de conteúdo sobre a Linha da tabela", () => {
  it("substitui o Valor original do campo corrigido, sem mutar a entrada", () => {
    const valores = { "IDRS (Wh/Wh)": "abc", Modelo: "X" };
    const resultado = aplicarExcecoes(valores, [excecao()]);
    expect(resultado["IDRS (Wh/Wh)"]).toBe("3,50");
    expect(resultado.Modelo).toBe("X");
    expect(valores["IDRS (Wh/Wh)"]).toBe("abc");
  });

  it("devolve a mesma Linha quando não há Exceção", () => {
    const valores = { Modelo: "X" };
    expect(aplicarExcecoes(valores, [])).toBe(valores);
  });

  it("recusa Exceção que é apenas diferença de formato", () => {
    expect(() =>
      aplicarExcecoes({ Marca: "gree" }, [
        excecao({ campo: "Marca", valor: "GREE" }),
      ]),
    ).toThrow(/formato/);
  });

  it("recusa Exceção sobre campo inexistente na Linha", () => {
    expect(() =>
      aplicarExcecoes({ Modelo: "X" }, [excecao({ campo: "Inexistente" })]),
    ).toThrow(/inexistente/);
  });

  it("aplica uma correção de conteúdo mesmo quando o original é inválido", () => {
    const resultado = aplicarExcecoes({ "IDRS (Wh/Wh)": "abc" }, [
      excecao({ valor: "N/A" }),
    ]);
    expect(resultado["IDRS (Wh/Wh)"]).toBe("N/A");
  });
});
