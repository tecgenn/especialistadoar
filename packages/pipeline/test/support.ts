import type { DadosDeclarados } from "../src/aparelho.ts";

/** Dados declarados com todos os campos nulos, para compor cenários de teste. */
export function dadosVazios(
  overrides: Partial<DadosDeclarados> = {},
): DadosDeclarados {
  return {
    capacidadeNominalBtu: null,
    capacidadeNominalW: null,
    potenciaEsperaW: null,
    capacidade35TotalW: null,
    potencia35TotalW: null,
    capacidade35ParcialW: null,
    potencia35ParcialW: null,
    capacidade29ParcialW: null,
    potencia29ParcialW: null,
    capacidade29TotalW: null,
    potencia29TotalW: null,
    idrs: null,
    consumoAnualKwh: null,
    classe: null,
    ...overrides,
  };
}
