import type { FiltrosConsulta } from "@especialista-do-ar/api/consulta";
import type { OpcoesConsulta } from "./opcoes.ts";

/**
 * O resumo do recorte efetivo da tabela (ticket 50): uma linha de chips que
 * mostra **todos** os filtros que estão valendo — inclusive o padrão implícito
 * de Tensão 220 V —, cada um com um "×" para desligá-lo sem abrir a Pesquisa
 * avançada. Módulo puro, sem DOM: a ilha só renderiza o que sai daqui.
 */
export type CampoResumoFiltro =
  | "q"
  | "marca"
  | "btu"
  | "funcao"
  | "tensao"
  | "tipo"
  | "classe";

export interface FiltroResumo {
  campo: CampoResumoFiltro;
  /** O texto visível do chip, com o campo explícito ("Marca: Midea"). */
  rotulo: string;
  /** O nome acessível do botão que remove o filtro. */
  remover: string;
}

/** A ordem dos chips acompanha a leitura: busca e depois o painel avançado. */
const ORDEM_DOS_CHIPS: readonly CampoResumoFiltro[] = [
  "q",
  "marca",
  "btu",
  "funcao",
  "tensao",
  "tipo",
  "classe",
];

/**
 * O rótulo de cada filtro já formatado para leitura. A Marca sai da curadoria
 * quando o valor está entre os chips (um link antigo com a Marca oficial usa o
 * próprio valor); a capacidade leva o separador de milhar pt-BR e a Tensão leva
 * a unidade, porque "220" sozinho não diz nada.
 */
function rotuloDoFiltro(
  estado: FiltrosConsulta,
  campo: CampoResumoFiltro,
  opcoes: OpcoesConsulta,
): string | undefined {
  switch (campo) {
    case "q": {
      const q = estado.q?.trim();
      return q === undefined || q === "" ? undefined : `Busca: ${q}`;
    }
    case "marca": {
      const marca = estado.marca?.trim();
      if (marca === undefined || marca === "") {
        return undefined;
      }
      const curada = opcoes.marcasChip.find((item) => item.valor === marca);
      return `Marca: ${curada?.rotulo ?? marca}`;
    }
    case "btu":
      return estado.btu === undefined
        ? undefined
        : `Capacidade: ${estado.btu.toLocaleString("pt-BR")} BTU/h`;
    case "funcao": {
      const funcao = estado.funcao?.trim();
      return funcao === undefined || funcao === ""
        ? undefined
        : `Função: ${funcao}`;
    }
    case "tensao":
      return estado.tensao === undefined
        ? undefined
        : `Tensão: ${estado.tensao} V`;
    case "tipo": {
      const tipo = estado.tipo?.trim();
      return tipo === undefined || tipo === "" ? undefined : `Tipo: ${tipo}`;
    }
    case "classe": {
      const classe = estado.classe?.trim();
      return classe === undefined || classe === ""
        ? undefined
        : `Classe: ${classe}`;
    }
  }
}

/**
 * Monta os chips do recorte efetivo, na ordem de leitura. Um estado vazio (o
 * padrão desligado e nenhum outro filtro) rende uma lista vazia.
 */
export function resumoDosFiltros(
  estado: FiltrosConsulta,
  opcoes: OpcoesConsulta,
): FiltroResumo[] {
  const filtros: FiltroResumo[] = [];
  for (const campo of ORDEM_DOS_CHIPS) {
    const rotulo = rotuloDoFiltro(estado, campo, opcoes);
    if (rotulo !== undefined) {
      filtros.push({ campo, rotulo, remover: `Remover filtro ${rotulo}` });
    }
  }
  return filtros;
}
