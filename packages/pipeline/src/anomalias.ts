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
  /** Menor valor plausível, inclusive. */
  minimo: number;
}

const CAPACIDADE_BTU = "Capacidade de Refrigeração Nominal (Btu/h)";

const REGRAS_PLAUSIBILIDADE: readonly RegraPlausibilidade[] = [
  // 6.000 BTU/h é a menor capacidade de um split residencial; abaixo disso o
  // valor foi truncado (ex.: `12` no lugar de `12000`) ou trocado com outra
  // coluna. O piso acompanha o separador de milhar (ticket 23): `1.000` agora é
  // um parse válido de 1000 BTU/h e não pode escapar do sinal. A Anomalia só
  // sinaliza — a correção é uma Exceção manual com motivo e fonte.
  { campo: CAPACIDADE_BTU, minimo: 6000 },
];

export function classificarAnomalia(valor: string): TipoAnomalia {
  return contarValoresNumericos(valor) >= 2
    ? "valor_multiplo"
    : "texto_em_campo_numerico";
}

function regraDoCampo(campo: string): RegraPlausibilidade | undefined {
  return REGRAS_PLAUSIBILIDADE.find((regra) => regra.campo === campo);
}

function foraDaPlausibilidade(
  numero: number,
  regra: RegraPlausibilidade,
): boolean {
  return numero < regra.minimo;
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
    if (regra !== undefined && foraDaPlausibilidade(numero, regra)) {
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
