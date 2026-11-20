import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import {
  FAIXAS_CAPACIDADE,
  type FaixaCapacidade,
  faixaContem,
  rotuloDaFaixa,
  rotuloDaFaixaCurto,
} from "./faixas-capacidade.ts";

/**
 * A régua de capacidade da home (ticket 70): a assinatura do site e a primeira
 * navegação por recorte. Tudo aqui é puro e derivado do dataset publicado — não
 * há contagem escrita à mão e nada depende do cliente.
 *
 * A contagem de uma faixa é o número de Aparelhos com **ao menos uma Variante**
 * dentro dela. Como um Aparelho pode ter Variantes em faixas diferentes, ele é
 * contado em cada faixa em que aparece: a soma das seis pode passar do total de
 * Aparelhos, e a régua nunca apresenta essa soma como partição.
 */
export interface FaixaDaRegua {
  faixa: FaixaCapacidade;
  /** Rótulo do eixo, sem unidade (a unidade é declarada uma vez). */
  rotulo: string;
  /** Rótulo completo, com unidade — nome acessível e textos longos. */
  rotuloCompleto: string;
  /** Aparelhos com ao menos uma Variante na faixa. */
  contagem: number;
  /** Link para o mesmo recorte no catálogo (`btuMin`/`btuMax`). */
  href: string;
  /** Largura relativa (1–100) para a barra de proporção do celular. */
  proporcao: number;
}

/**
 * O link do catálogo para a faixa. A presença de uma chave de faixa desliga os
 * filtros padrão (ADR-0019), então o recorte mostra todas as tensões — o mesmo
 * conjunto que a régua contou. Faixa sem piso não grava `btuMin`; faixa sem
 * teto não grava `btuMax`.
 */
export function linkDaFaixa(faixa: FaixaCapacidade): string {
  const busca = new URLSearchParams();
  if (faixa.min !== undefined) {
    busca.set("btuMin", String(faixa.min));
  }
  if (faixa.max !== undefined) {
    busca.set("btuMax", String(faixa.max));
  }
  return `/aparelhos/?${busca.toString()}`;
}

/**
 * As seis faixas comerciais com as contagens reais da base, na ordem comercial.
 * Faixa sem nenhum Aparelho não é renderizada — a régua acompanha os dados.
 */
export function faixasDaRegua(
  dataset: readonly ItemConsulta[],
): FaixaDaRegua[] {
  const contagens = FAIXAS_CAPACIDADE.map((faixa) => ({
    faixa,
    contagem: dataset.filter((item) =>
      item.capacidadesBtu.some((capacidade) => faixaContem(faixa, capacidade)),
    ).length,
  })).filter(({ contagem }) => contagem > 0);

  const maior = contagens.reduce(
    (maximo, { contagem }) => Math.max(maximo, contagem),
    0,
  );

  return contagens.map(({ faixa, contagem }) => ({
    faixa,
    rotulo: rotuloDaFaixaCurto(faixa),
    rotuloCompleto: rotuloDaFaixa(faixa),
    contagem,
    href: linkDaFaixa(faixa),
    proporcao: maior === 0 ? 0 : Math.round((contagem / maior) * 100),
  }));
}
