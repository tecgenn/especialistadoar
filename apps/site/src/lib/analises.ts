/**
 * Análises: peças editoriais em MDX sobre um único Aparelho, ligadas a ele pelo
 * `aparelhoId` e publicadas numa seção própria (`/analises/<slug>/`). Ver
 * `CONTEXT.md` (Análise) e ADR-0015. Este módulo é a parte pura — contrato,
 * validação, indexação e visibilidade condicional, sem I/O e sem Astro.
 */

import type { Oferta } from "./ofertas.ts";

export interface AnaliseFrontmatter {
  /** O `id` do Aparelho (`ap-<12 hex>`) ao qual a Análise se refere. */
  aparelhoId: string;
  /** O identificador da URL pública (`/analises/<slug>/`). */
  slug: string;
  /** O H1 próprio da Análise. */
  titulo: string;
  /** A meta description (e o resumo no `analises.json`). */
  descricao: string;
  /** A data de publicação (`YYYY-MM-DD`). */
  data: string;
}

export interface Analise extends AnaliseFrontmatter {
  /** A URL pública da Análise, derivada do `slug`. */
  url: string;
}

/**
 * Uma Análise em destaque na home, com as Ofertas do seu Aparelho já resolvidas
 * no build. Um Aparelho fora da base servida (Ausente) fica sem Oferta: nunca há
 * CTA para um Aparelho que não está na Versão atual.
 */
export interface DestaqueAnalise {
  analise: Analise;
  ofertas: Oferta[];
}

const FORMATO_APARELHO_ID = /^ap-[0-9a-f]{12}$/;
const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

function campoEmBranco(valor: unknown): boolean {
  return typeof valor !== "string" || valor.trim() === "";
}

function urlDe(slug: string): string {
  return `/analises/${slug}/`;
}

/**
 * Valida o contrato das Análises: campos obrigatórios não vazios, formato do
 * `aparelhoId` e da `data`, `slug` sem barra, slug único e no máximo uma Análise
 * por Aparelho. Um `aparelhoId` bem formado que **não** está na base servida não
 * é erro: é o estado Ausente e a página degrada (ADR-0015).
 */
export function validarAnalises(analises: readonly AnaliseFrontmatter[]): void {
  if (!Array.isArray(analises)) {
    throw new Error("Análises precisa ser uma lista.");
  }

  const slugs = new Set<string>();
  const aparelhos = new Set<string>();

  analises.forEach((analise, indice) => {
    const onde = `Análise #${indice}`;
    if (campoEmBranco(analise?.aparelhoId)) {
      throw new Error(`${onde}: \`aparelhoId\` é obrigatório.`);
    }
    if (campoEmBranco(analise?.slug)) {
      throw new Error(`${onde}: \`slug\` é obrigatório.`);
    }
    if (campoEmBranco(analise?.titulo)) {
      throw new Error(`${onde}: \`titulo\` é obrigatório.`);
    }
    if (campoEmBranco(analise?.descricao)) {
      throw new Error(`${onde}: \`descricao\` é obrigatório.`);
    }
    if (campoEmBranco(analise?.data)) {
      throw new Error(`${onde}: \`data\` é obrigatório.`);
    }
    if (!FORMATO_APARELHO_ID.test(analise.aparelhoId)) {
      throw new Error(
        `${onde}: \`aparelhoId\` precisa seguir o formato ap-<12 hex>: ${analise.aparelhoId}`,
      );
    }
    if (analise.slug.includes("/")) {
      throw new Error(`${onde}: \`slug\` não pode conter "/": ${analise.slug}`);
    }
    if (!FORMATO_DATA.test(analise.data)) {
      throw new Error(
        `${onde}: \`data\` precisa seguir o formato YYYY-MM-DD: ${analise.data}`,
      );
    }
    if (slugs.has(analise.slug)) {
      throw new Error(`${onde}: slug repetido: ${analise.slug}`);
    }
    if (aparelhos.has(analise.aparelhoId)) {
      throw new Error(
        `${onde}: já existe uma Análise para o Aparelho ${analise.aparelhoId}.`,
      );
    }
    slugs.add(analise.slug);
    aparelhos.add(analise.aparelhoId);
  });
}

/**
 * Valida as Análises e devolve a lista montada — com a `url` derivada do `slug`
 * e ordenada da mais recente para a mais antiga. Não altera a entrada.
 */
export function montarAnalises(
  analises: readonly AnaliseFrontmatter[],
): Analise[] {
  validarAnalises(analises);
  return analises
    .map((analise) => ({ ...analise, url: urlDe(analise.slug) }))
    .sort((a, b) => (a.data === b.data ? 0 : a.data < b.data ? 1 : -1));
}

function indexarPor(
  analises: readonly Analise[],
  chave: (analise: Analise) => string,
): Map<string, Analise> {
  return new Map(analises.map((analise) => [chave(analise), analise]));
}

/** Indexa as Análises pelo `slug` (rota de detalhe). */
export function indexarAnalises(
  analises: readonly Analise[],
): Map<string, Analise> {
  return indexarPor(analises, (analise) => analise.slug);
}

/** Indexa as Análises pelo `aparelhoId` (link de volta na ficha do Aparelho). */
export function mapaPorAparelho(
  analises: readonly Analise[],
): Map<string, Analise> {
  return indexarPor(analises, (analise) => analise.aparelhoId);
}

/**
 * Projeta a lista publicada em `analises.json` — o inventário para Agentes.
 * Só os campos públicos, sem o corpo da Análise.
 */
export function listaAnalisesJson(analises: readonly Analise[]): Array<{
  slug: string;
  url: string;
  aparelhoId: string;
  titulo: string;
  descricao: string;
  data: string;
}> {
  return analises.map(({ slug, url, aparelhoId, titulo, descricao, data }) => ({
    slug,
    url,
    aparelhoId,
    titulo,
    descricao,
    data,
  }));
}

/** A seção de Análises (menu, índice, sitemap) só existe com ≥ 1 Análise. */
export function secaoVisivel(analises: readonly Analise[]): boolean {
  return analises.length > 0;
}
