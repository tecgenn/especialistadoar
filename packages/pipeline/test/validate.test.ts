import { describe, expect, it } from "vitest";
import type { Aparelho } from "../src/aparelho.ts";
import { validarBaseServida } from "../src/validate.ts";
import { dadosVazios } from "./support.ts";

function aparelhoValido(overrides: Partial<Aparelho> = {}): Aparelho {
  return {
    id: "ap-000000000000",
    marca: "GREE",
    modelo: "GREE-09",
    unidadeInterna: null,
    unidadeExterna: null,
    tipo: null,
    funcao: null,
    rotacao: null,
    fluidoRefrigerante: null,
    fluidoEspecificado: null,
    linhas: [1],
    registros: [{ numero: "002/2021", status: "Ativo" }],
    variantes: [
      {
        tensao: { voltagens: [220], fases: ["monofásico"] },
        dados: dadosVazios({ capacidadeNominalBtu: 9000 }),
        linhas: [1],
      },
    ],
    ...overrides,
  };
}

describe("validarBaseServida — invariantes de domínio", () => {
  it("aceita uma base servida válida", () => {
    expect(() => validarBaseServida([aparelhoValido()])).not.toThrow();
  });

  it("falha em identidade duplicada", () => {
    expect(() =>
      validarBaseServida([
        aparelhoValido({ id: "ap-1" }),
        aparelhoValido({ id: "ap-2" }),
      ]),
    ).toThrow(/Identidade duplicada/);
  });

  it("falha com Aparelho sem Dados declarados na base servida", () => {
    expect(() =>
      validarBaseServida([
        aparelhoValido({
          variantes: [{ tensao: null, dados: dadosVazios(), linhas: [1] }],
        }),
      ]),
    ).toThrow(/sem Dados declarados/);
  });

  it("falha quando falta proveniência (sem Linhas ou sem Registros)", () => {
    expect(() =>
      validarBaseServida([aparelhoValido({ registros: [] })]),
    ).toThrow(/sem proveniência/);
    expect(() => validarBaseServida([aparelhoValido({ linhas: [] })])).toThrow(
      /sem proveniência/,
    );
  });

  it("falha quando o Aparelho viola o contrato", () => {
    const quebrado = aparelhoValido({
      linhas: "não é array" as unknown as number[],
    });
    expect(() => validarBaseServida([quebrado])).toThrow(/viola o contrato/);
  });
});
