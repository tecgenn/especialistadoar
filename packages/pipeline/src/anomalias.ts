import {
  colunaNumerica,
  contarValoresNumericos,
  parseNumero,
} from "./normalize.ts";
import type { ValoresDaLinha } from "./parse.ts";

export type TipoAnomalia = "valor_multiplo" | "texto_em_campo_numerico";

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

export function classificarAnomalia(valor: string): TipoAnomalia {
  return contarValoresNumericos(valor) >= 2
    ? "valor_multiplo"
    : "texto_em_campo_numerico";
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
    if (parseNumero(valor) === null) {
      anomalias.push({
        linha,
        versao,
        campo,
        valor,
        tipo: classificarAnomalia(valor),
      });
    }
  }

  return anomalias;
}
