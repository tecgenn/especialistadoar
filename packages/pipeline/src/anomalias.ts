import {
  colunaNumerica,
  contarValoresNumericos,
  parseNumero,
} from "./normalize.ts";
import type { ValoresDaLinha } from "./parse.ts";

export type TipoAnomalia =
  | "valor_multiplo"
  | "texto_em_campo_numerico"
  | "valor_implausivel";

export interface Anomalia {
  linha: number;
  versao: string;
  campo: string;
  valor: string;
  tipo: TipoAnomalia;
}

export interface ContextoAnomalia {
  linha: number;
  versao: string;
}

/**
 * Regra de plausibilidade de uma coluna numérica. É uma tabela, não um `if`:
 * acrescentar outra inconsistência é acrescentar uma linha aqui, sem mexer no
 * detector.
 */
interface RegraPlausibilidade {
  campo: string;
  /** Menor valor plausível, inclusive (na escala da regra). */
  minimo?: number;
  /** Maior valor plausível, inclusive (na escala da regra). */
  maximo?: number;
  /**
   * Quando presente, o valor é normalizado pela capacidade da mesma Linha antes
   * de comparar com a faixa: `valor / (capacidade / escala)`. Serve para regras
   * que só fazem sentido por 1.000 BTU/h (consumo).
   */
  porCapacidade?: { campo: string; escala: number };
}

export const CAPACIDADE_BTU = "Capacidade de Refrigeração Nominal (Btu/h)";
export const CONSUMO_ANUAL_KWH = "Consumo Anual de Energia (kWh)";

const REGRAS_PLAUSIBILIDADE: readonly RegraPlausibilidade[] = [
  // 6.000 BTU/h é a menor capacidade de um split residencial; abaixo disso o
  // valor foi truncado (ex.: `12` no lugar de `12000`) ou trocado com outra
  // coluna. O piso acompanha o separador de milhar (ticket 23): `1.000` agora é
  // um parse válido de 1000 BTU/h e não pode escapar do sinal. A Anomalia só
  // sinaliza — a correção é uma Exceção manual com motivo e fonte.
  { campo: CAPACIDADE_BTU, minimo: 6000 },
  // Consumo anual por 1.000 BTU/h. Na Versão atual os valores legítimos vão de
  // 17,5 a 91,2 (splits) e de 47,5 a 88,1 (Janela); há um vazio em 8–17 e outro
  // em 92–140, e os valores fora da faixa são de outra escala (kWh/mês da
  // etiqueta antiga) ou de carga total, não do consumo sazonal. A faixa larga
  // [10, 120] fica nos dois vazios e cobre os dois tipos. Só sinaliza; o
  // Aparelho continua na base (ADR-0017).
  {
    campo: CONSUMO_ANUAL_KWH,
    porCapacidade: { campo: CAPACIDADE_BTU, escala: 1000 },
    minimo: 10,
    maximo: 120,
  },
];

export function classificarAnomalia(valor: string): TipoAnomalia {
  return contarValoresNumericos(valor) >= 2
    ? "valor_multiplo"
    : "texto_em_campo_numerico";
}

function regraDoCampo(campo: string): RegraPlausibilidade | undefined {
  return REGRAS_PLAUSIBILIDADE.find((regra) => regra.campo === campo);
}

function normalizarPelaCapacidade(
  numero: number,
  regra: RegraPlausibilidade,
  valores: ValoresDaLinha,
): number | null {
  if (regra.porCapacidade === undefined) {
    return numero;
  }

  const { campo, escala } = regra.porCapacidade;
  const capacidade = parseNumero(valores[campo] ?? "");
  if (capacidade === null || capacidade <= 0) {
    return null;
  }

  return numero / (capacidade / escala);
}

function foraDaPlausibilidade(
  numero: number,
  regra: RegraPlausibilidade,
): boolean {
  if (regra.minimo !== undefined && numero < regra.minimo) {
    return true;
  }
  return regra.maximo !== undefined && numero > regra.maximo;
}

export function detectarAnomalias(
  valores: ValoresDaLinha,
  { linha, versao }: ContextoAnomalia,
): Anomalia[] {
  const anomalias: Anomalia[] = [];

  for (const [campo, valor] of Object.entries(valores)) {
    if (!colunaNumerica(campo) || valor.trim() === "") {
      continue;
    }

    const numero = parseNumero(valor);
    if (numero === null) {
      anomalias.push({
        linha,
        versao,
        campo,
        valor,
        tipo: classificarAnomalia(valor),
      });
      continue;
    }

    const regra = regraDoCampo(campo);
    if (regra === undefined) {
      continue;
    }

    const normalizado = normalizarPelaCapacidade(numero, regra, valores);
    if (normalizado !== null && foraDaPlausibilidade(normalizado, regra)) {
      anomalias.push({
        linha,
        versao,
        campo,
        valor,
        tipo: "valor_implausivel",
      });
    }
  }

  return anomalias;
}

/**
 * Linhas sinalizadas por consumo implausível. A consulta pública marca esses
 * Aparelhos como `suspeito` sem excluí-los da base (ADR-0017).
 */
export function linhasComConsumoImplausivel(
  anomalias: readonly Anomalia[],
): Set<number> {
  return new Set(
    anomalias
      .filter(
        (anomalia) =>
          anomalia.tipo === "valor_implausivel" &&
          anomalia.campo === CONSUMO_ANUAL_KWH,
      )
      .map((anomalia) => anomalia.linha),
  );
}
