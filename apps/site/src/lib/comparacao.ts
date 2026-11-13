/**
 * A Comparação de Aparelhos (ticket 49): a seleção de até **3** modelos e a
 * matriz neutra que os confronta. Este módulo é a parte pura — sem DOM e sem
 * I/O. O contrato `ids` que ele lê e escreve é o **mesmo** na tabela e em
 * `/comparar/` (ADR-0021), e as linhas da matriz saem do `consulta.json`
 * reutilizando a formatação de faixa da ficha e da tabela.
 */

import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import { formatarFaixa } from "./ficha.ts";

/** O número máximo de Aparelhos por comparação. */
export const MAXIMO_COMPARACAO = 3;

/** O aviso de descarte concorda em número com o que foi descartado. */
export function textoDescartes(descartados: number): string {
  return descartados === 1
    ? "Um id repetido ou desconhecido foi descartado do link."
    : `${descartados} ids repetidos ou desconhecidos foram descartados do link.`;
}

/** Os Aparelhos válidos de uma URL `?ids=`, na ordem escolhida. */
export interface IdsComparacao {
  /** Ids válidos, sem repetição, na ordem da URL e no máximo 3. */
  ids: string[];
  /** Quantos ids foram descartados: repetidos, desconhecidos ou além do limite. */
  descartados: number;
}

/**
 * Os ids crus de `?ids=`, sem validar contra a base: deduplica, tira vazios e
 * corta no limite. Serve para não perder a seleção antes de o dataset chegar,
 * quando ainda não há como saber quais ids são conhecidos.
 */
export function lerIdsBrutos(busca: URLSearchParams): string[] {
  const brutos = (busca.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id !== "");
  return [...new Set(brutos)].slice(0, MAXIMO_COMPARACAO);
}

/**
 * Lê `?ids=id1,id2,id3` preservando a ordem e descartando, com contagem, o que
 * não pode entrar: ids repetidos, ids desconhecidos (fora de `conhecidos`) e o
 * que passar do limite de 3. Um `ids` vazio ou ausente é uma comparação vazia.
 */
export function lerIds(
  busca: URLSearchParams,
  conhecidos: ReadonlySet<string>,
): IdsComparacao {
  const brutos = (busca.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id !== "");

  const ids: string[] = [];
  let descartados = 0;
  for (const id of brutos) {
    if (
      ids.includes(id) ||
      !conhecidos.has(id) ||
      ids.length >= MAXIMO_COMPARACAO
    ) {
      descartados += 1;
      continue;
    }
    ids.push(id);
  }
  return { ids, descartados };
}

/**
 * Serializa a seleção em `?ids=` — a chave separada dos filtros. A ordem é
 * preservada; repetidos e vazios saem e o limite de 3 é aplicado. Sem ids, a
 * querystring fica vazia (a chave não aparece).
 */
export function escreverIds(ids: readonly string[]): URLSearchParams {
  const validos = [...new Set(ids.map((id) => id.trim()))].filter(
    (id) => id !== "",
  );
  const busca = new URLSearchParams();
  if (validos.length > 0) {
    busca.set("ids", validos.slice(0, MAXIMO_COMPARACAO).join(","));
  }
  return busca;
}

/** As linhas da matriz, na ordem em que aparecem na tela. */
export type CampoComparacao =
  | "tipo"
  | "funcao"
  | "capacidade"
  | "tensao"
  | "consumo"
  | "idrs"
  | "classe";

export interface LinhaComparacao {
  campo: CampoComparacao;
  rotulo: string;
  /** O texto de cada Aparelho, na mesma ordem das colunas. */
  valores: string[];
}

export const LINHAS_COMPARACAO: readonly {
  campo: CampoComparacao;
  rotulo: string;
}[] = [
  { campo: "tipo", rotulo: "Tipo" },
  { campo: "funcao", rotulo: "Função" },
  { campo: "capacidade", rotulo: "Capacidade" },
  { campo: "tensao", rotulo: "Tensão" },
  { campo: "consumo", rotulo: "Consumo anual" },
  { campo: "idrs", rotulo: "IDRS" },
  { campo: "classe", rotulo: "Classe" },
];

function textoOuTravessao(valor: string | null): string {
  return valor === null || valor.trim() === "" ? "—" : valor;
}

/**
 * O texto de uma linha para um Aparelho. Listas viram faixa quando o Aparelho
 * tem mais de uma Variante ("9.000 – 12.000 BTU/h"); Classe é sempre oficial e
 * dado ausente aparece como travessão. Nenhum valor é destacado como melhor.
 */
export function valorDaComparacao(
  item: ItemConsulta,
  campo: CampoComparacao,
): string {
  switch (campo) {
    case "tipo":
      return textoOuTravessao(item.tipo);
    case "funcao":
      return textoOuTravessao(item.funcao);
    case "capacidade":
      return formatarFaixa(item.capacidadesBtu, " BTU/h");
    case "tensao":
      return formatarFaixa(item.tensoes, " V");
    case "consumo":
      return formatarFaixa(item.consumosKwh, " kWh");
    case "idrs":
      return formatarFaixa(item.idrs);
    case "classe":
      return item.classes.map((classe) => `Classe ${classe}`).join(", ") || "—";
  }
}

/**
 * Monta a matriz a partir dos Aparelhos já na ordem das colunas: uma linha por
 * atributo, com um valor por Aparelho. Lista vazia rende as sete linhas com
 * travessões — a matriz nunca muda de forma conforme a seleção.
 */
export function linhasDaComparacao(
  itens: readonly ItemConsulta[],
): LinhaComparacao[] {
  return LINHAS_COMPARACAO.map(({ campo, rotulo }) => ({
    campo,
    rotulo,
    valores: itens.map((item) => valorDaComparacao(item, campo)),
  }));
}

/** O que uma sugestão do combobox mostra para distinguir modelos parecidos. */
export interface ResumoSugestao {
  marca: string;
  modelo: string;
  capacidade: string;
  tipo: string;
}

/** Marca, modelo, capacidade e tipo de um Aparelho, prontos para a sugestão. */
export function resumoDaSugestao(item: ItemConsulta): ResumoSugestao {
  const capacidade = formatarFaixa(item.capacidadesBtu);
  return {
    marca: item.marcaCatalogo,
    modelo: item.modelo,
    capacidade: capacidade === "—" ? "—" : `${capacidade} BTU/h`,
    tipo: textoOuTravessao(item.tipo),
  };
}
