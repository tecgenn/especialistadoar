/**
 * Glue da coleção de Análises: lê o conteúdo do site (`astro:content`), aplica o
 * contrato puro de `src/lib/analises.ts` e devolve, além das Análises montadas, o
 * mapa `slug → entry` necessário para renderizar o corpo MDX.
 *
 * Fica fora de `src/lib/` de propósito: o `tsconfig` da raiz só inclui
 * `apps/site/src/lib/**` e não resolve `astro:content`.
 */
import { type CollectionEntry, getCollection } from "astro:content";
import { type Analise, montarAnalises } from "../lib/analises.ts";
import { temArquivosDeAnalise } from "./base-analises.ts";
import { ofertasDoAparelho } from "./ofertas.ts";

export type EntradaAnalise = CollectionEntry<"analises">;

export interface AnalisesCarregadas {
  /** Análises validadas, com `url` e ordenadas da mais recente para a mais antiga. */
  analises: Analise[];
  /** O entry renderizável de cada Análise, por `slug`. */
  entradas: Map<string, EntradaAnalise>;
}

async function lerAnalises(): Promise<AnalisesCarregadas> {
  if (!temArquivosDeAnalise()) {
    return { analises: [], entradas: new Map() };
  }
  const entradas = await getCollection("analises");
  const analises = montarAnalises(entradas.map((entrada) => entrada.data));
  const porSlug = new Map<string, EntradaAnalise>();
  for (const entrada of entradas) {
    porSlug.set(entrada.data.slug, entrada);
  }
  return { analises, entradas: porSlug };
}

let carregadas: Promise<AnalisesCarregadas> | undefined;

/**
 * Carrega e valida as Análises publicadas. Violação de contrato lança e falha o
 * build do site; zero Análises é um resultado válido. O resultado é memoizado
 * por build — o layout base consulta em toda página.
 */
export function carregarAnalises(): Promise<AnalisesCarregadas> {
  carregadas ??= lerAnalises();
  return carregadas;
}

/**
 * Constrói o mapa de Aparelhos analisados para a tabela.
 * Só entram Análises válidas cujo Aparelho está na Versão atual (idsDaBase).
 * O valor traz o título e a URL da Análise, e se o Aparelho tem link de afiliado.
 */
export function mapaAnalisados(
  analises: readonly Analise[],
  idsDaBase: ReadonlySet<string>,
): Map<string, { titulo: string; url: string; temLinkAfiliado: boolean }> {
  const mapa = new Map<
    string,
    { titulo: string; url: string; temLinkAfiliado: boolean }
  >();
  for (const analise of analises) {
    if (!idsDaBase.has(analise.aparelhoId)) {
      continue; // Aparelho Ausente: não entra no mapa
    }
    const ofertas = ofertasDoAparelho(analise.aparelhoId);
    mapa.set(analise.aparelhoId, {
      titulo: analise.titulo,
      url: analise.url,
      temLinkAfiliado: ofertas.length > 0,
    });
  }
  return mapa;
}
