/**
 * Análises: peças editoriais em MDX sobre um único Aparelho, ligadas a ele pelo
 * `aparelhoId` e publicadas numa seção própria (`/analises/<slug>/`). Ver
 * `CONTEXT.md` (Análise) e ADR-0015. Este módulo é a parte pura — contrato,
 * validação, indexação e visibilidade condicional, sem I/O e sem Astro.
 */

import type {
  FiltrosConsulta,
  ItemConsulta,
} from "@especialista-do-ar/api/consulta";
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

/** `true` quando o campo opcional tem texto — e estreita o tipo para `string`. */
function temTexto(valor: string | null): valor is string {
  return valor !== null && valor.trim() !== "";
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

/**
 * O mínimo que o mapa de analisados precisa de um Aparelho da base servida: a
 * identidade e as capacidades declaradas (`capacidadesBtu` de `consulta.json`).
 */
export interface AparelhoComCapacidades {
  id: string;
  marca: string;
  modelo: string;
  capacidadesBtu: readonly number[];
}

/** Um Aparelho analisado, com a capacidade exata que o Assistente recomenda. */
export interface AnalisadoNaCapacidade {
  aparelhoId: string;
  titulo: string;
  url: string;
  marca: string;
  modelo: string;
  capacidadeBtu: number;
}

/**
 * Os links do CTA da tabela filtrada pela capacidade da Análise: uma ação por
 * capacidade distinta do Aparelho (as do `consulta.json`), em ordem crescente.
 * Um Aparelho pode registrar mais de uma capacidade (ticket 47) — nesse caso o
 * leitor recebe uma ação por capacidade, em vez de um palpite sobre qual é a
 * do artigo. Sem capacidade, sobra a tabela inteira.
 */
export function linksDaTabelaPorCapacidade(
  capacidades: readonly number[],
): Array<{ rotulo: string; href: string }> {
  const unicas = [...new Set(capacidades)].sort((a, b) => a - b);
  if (unicas.length === 0) {
    return [{ rotulo: "Ver todos os aparelhos", href: "/aparelhos/" }];
  }
  const numero = new Intl.NumberFormat("pt-BR");
  return unicas.map((capacidadeBtu) => ({
    rotulo: `Ver outros de ${numero.format(capacidadeBtu)} BTU/h`,
    href: `/aparelhos/?btu=${capacidadeBtu}`,
  }));
}

/**
 * Mapa build-time de Aparelhos analisados por capacidade (ticket 42): cada
 * Análise publicada entra sob **todas as capacidades** do seu Aparelho, como
 * declaradas na base servida. Um Aparelho ausente da Versão atual (Ausente) não
 * entra — nunca há card para um Aparelho que não está na tabela. A ordem é a das
 * Análises recebidas (da mais recente para a mais antiga).
 */
export function agruparAnalisadosPorCapacidade(
  analises: readonly Analise[],
  aparelhos: readonly AparelhoComCapacidades[],
): Map<number, AnalisadoNaCapacidade[]> {
  const porId = new Map(aparelhos.map((aparelho) => [aparelho.id, aparelho]));
  const mapa = new Map<number, AnalisadoNaCapacidade[]>();

  for (const analise of analises) {
    const aparelho = porId.get(analise.aparelhoId);
    if (aparelho === undefined) {
      continue; // Aparelho Ausente: fora da tabela, fora dos cards
    }
    for (const capacidadeBtu of new Set(aparelho.capacidadesBtu)) {
      const lista = mapa.get(capacidadeBtu) ?? [];
      lista.push({
        aparelhoId: aparelho.id,
        titulo: analise.titulo,
        url: analise.url,
        marca: aparelho.marca,
        modelo: aparelho.modelo,
        capacidadeBtu,
      });
      mapa.set(capacidadeBtu, lista);
    }
  }

  return mapa;
}

/** Quantos cartões a vitrine "Aparelhos com análise" exibe no máximo. */
export const VITRINE_MAXIMO = 6;

/**
 * Capacidades mais compradas: os analisados compatíveis delas abrem a vitrine.
 * É a ordem editorial original (ticket 44), mantida para os compatíveis; os
 * similares seguem a ordem do ticket 52.
 */
const CAPACIDADES_DESTAQUE = [9000, 12000, 18000];

/** Um Aparelho analisado, já com os dados de consulta que a vitrine usa. */
export interface AnalisadoVitrine {
  /** O Aparelho na base servida (`consulta.json`). */
  item: ItemConsulta;
  /** O título da Análise, exibido no cartão. */
  titulo: string;
  /** A URL pública da Análise. */
  url: string;
}

/** Um cartão da vitrine "Aparelhos com análise". */
export interface CartaoVitrine extends AnalisadoVitrine {
  /**
   * `true` quando o Aparelho é um **similar**: não passa no recorte ativo e é
   * oferecido como alternativa — nunca como recomendação de compra.
   */
  foraDoRecorte: boolean;
}

export interface OpcoesVitrine {
  /** Os Aparelhos que passam no recorte ativo, como o motor de consulta os devolve. */
  filtrados: readonly ItemConsulta[];
  /** O recorte ativo; o BTU explícito dele é a capacidade exata da ordenação. */
  recorte: FiltrosConsulta;
  /** As Marcas de catálogo curadas do site; as demais vêm depois. */
  marcasConhecidas?: readonly string[];
  /** O teto de cartões (seis, por padrão). */
  maximo?: number;
}

/** Compara sem caixa e sem espaços; o mesmo critério dos filtros de consulta. */
function normalizar(valor: string): string {
  return valor.trim().toLowerCase();
}

/**
 * "9.000 – 12.000 BTU/h" vira uma distância relativa ao alvo do recorte: o menor
 * |capacidade − alvo| / alvo entre as capacidades do Aparelho. Quanto menor,
 * mais perto do que a pessoa procura. Sem capacidade declarada — ou sem alvo —
 * a distância é máxima, para o Aparelho não fingir uma correspondência exata.
 */
function distanciaRelativa(
  capacidades: readonly number[],
  alvos: readonly number[],
): number {
  let menor = Number.POSITIVE_INFINITY;
  for (const capacidade of capacidades) {
    for (const alvo of alvos) {
      if (alvo <= 0) {
        continue;
      }
      const distancia = Math.abs(capacidade - alvo) / alvo;
      if (distancia < menor) {
        menor = distancia;
      }
    }
  }
  return Number.isFinite(menor) ? menor : Number.MAX_VALUE;
}

/** Os atributos que o recorte ativo tem em comum com um Aparelho. */
interface AtributosDoRecorte {
  tipos: Set<string>;
  funcoes: Set<string>;
  classes: Set<string>;
  tensoes: Set<number>;
}

/**
 * Os atributos presentes no conjunto filtrado — não só os valores explícitos do
 * filtro. Assim um recorte por marca (LG, por exemplo) também carrega o Tipo,
 * a Função, a Classe e a Tensão dos Aparelhos daquela marca, e os similares que
 * os repetem ficam à frente.
 */
function atributosDoRecorte(
  filtrados: readonly ItemConsulta[],
): AtributosDoRecorte {
  const tipos = new Set<string>();
  const funcoes = new Set<string>();
  const classes = new Set<string>();
  const tensoes = new Set<number>();

  for (const item of filtrados) {
    if (temTexto(item.tipo)) {
      tipos.add(normalizar(item.tipo));
    }
    if (temTexto(item.funcao)) {
      funcoes.add(normalizar(item.funcao));
    }
    for (const classe of item.classes) {
      classes.add(normalizar(classe));
    }
    for (const tensao of item.tensoes) {
      tensoes.add(tensao);
    }
  }

  return { tipos, funcoes, classes, tensoes };
}

/** Quantos desses quatro atributos o Aparelho repete do recorte. */
function similaridade(
  item: ItemConsulta,
  atributos: AtributosDoRecorte,
): number {
  let pontos = 0;
  if (temTexto(item.tipo) && atributos.tipos.has(normalizar(item.tipo))) {
    pontos += 1;
  }
  if (temTexto(item.funcao) && atributos.funcoes.has(normalizar(item.funcao))) {
    pontos += 1;
  }
  if (
    item.classes.some((classe) => atributos.classes.has(normalizar(classe)))
  ) {
    pontos += 1;
  }
  if (item.tensoes.some((tensao) => atributos.tensoes.has(tensao))) {
    pontos += 1;
  }
  return pontos;
}

/** A chave de ordenação por capacidade: exata, presente no recorte, distância. */
type ChaveCapacidade = readonly [faixa: number, distancia: number];

function chaveCapacidade(
  item: ItemConsulta,
  recorte: FiltrosConsulta,
  capacidadesFiltradas: ReadonlySet<number>,
  alvos: readonly number[],
): ChaveCapacidade {
  if (recorte.btu !== undefined && item.capacidadesBtu.includes(recorte.btu)) {
    return [0, 0];
  }
  if (
    item.capacidadesBtu.some((capacidade) =>
      capacidadesFiltradas.has(capacidade),
    )
  ) {
    return [1, 0];
  }
  return [2, distanciaRelativa(item.capacidadesBtu, alvos)];
}

function compararChaves(a: readonly number[], b: readonly number[]): number {
  const tamanho = Math.max(a.length, b.length);
  for (let indice = 0; indice < tamanho; indice += 1) {
    const diferenca = (a[indice] ?? 0) - (b[indice] ?? 0);
    if (diferenca !== 0) {
      return diferenca;
    }
  }
  return 0;
}

/**
 * Seleciona os cartões da vitrine "Aparelhos com análise" (ticket 52). A ordem
 * recebida em `analisados` é a das Análises — da mais recente para a mais antiga
 * (`montarAnalises`), e é o critério final de recência.
 *
 * Primeiro vêm os **compatíveis** (passam no recorte), na ordem editorial das
 * capacidades mais compradas e depois pela recência. Os **similares** completam
 * até `maximo` cartões, ordenados por: capacidade (correspondência exata com o
 * BTU do recorte → capacidade presente no conjunto filtrado → menor distância
 * relativa), Marca de catálogo conhecida, atributos em comum com o recorte
 * (Tipo, Função, Classe, Tensão) e recência. Num recorte vazio (nada passa nos
 * filtros) a capacidade não tem alvo e é pulada.
 *
 * A vitrine nunca mexe na contagem, na ordenação nem na paginação da tabela.
 */
export function montarVitrine(
  analisados: readonly AnalisadoVitrine[],
  opcoes: OpcoesVitrine,
): CartaoVitrine[] {
  const maximo = opcoes.maximo ?? VITRINE_MAXIMO;
  if (maximo <= 0 || analisados.length === 0) {
    return [];
  }

  const filtradosIds = new Set(opcoes.filtrados.map((item) => item.id));
  const capacidadesFiltradas = new Set(
    opcoes.filtrados.flatMap((item) => item.capacidadesBtu),
  );
  const recorteVazio = opcoes.filtrados.length === 0;
  const alvos =
    opcoes.recorte.btu !== undefined
      ? [opcoes.recorte.btu]
      : [...capacidadesFiltradas];
  const atributos = atributosDoRecorte(opcoes.filtrados);
  const marcasConhecidas = new Set(opcoes.marcasConhecidas ?? []);

  const compativeis: AnalisadoVitrine[] = [];
  const similares: AnalisadoVitrine[] = [];

  for (const analisado of analisados) {
    if (filtradosIds.has(analisado.item.id)) {
      compativeis.push(analisado);
    } else {
      similares.push(analisado);
    }
  }

  // Compatíveis: as capacidades mais compradas abrem; depois, a recência.
  const compativeisOrdenados = compativeis
    .map((analisado, indice) => ({ analisado, indice }))
    .sort((a, b) => {
      const destaqueA = a.analisado.item.capacidadesBtu.some((capacidade) =>
        CAPACIDADES_DESTAQUE.includes(capacidade),
      )
        ? 0
        : 1;
      const destaqueB = b.analisado.item.capacidadesBtu.some((capacidade) =>
        CAPACIDADES_DESTAQUE.includes(capacidade),
      )
        ? 0
        : 1;
      return destaqueA - destaqueB || a.indice - b.indice;
    })
    .map(({ analisado }) => analisado);

  // Similares: capacidade → marca conhecida → atributos em comum → recência.
  const similaresOrdenados = similares
    .map((analisado, indice) => ({ analisado, indice }))
    .sort((a, b) => {
      const capacidadeA = recorteVazio
        ? ([0, 0] as const)
        : chaveCapacidade(
            a.analisado.item,
            opcoes.recorte,
            capacidadesFiltradas,
            alvos,
          );
      const capacidadeB = recorteVazio
        ? ([0, 0] as const)
        : chaveCapacidade(
            b.analisado.item,
            opcoes.recorte,
            capacidadesFiltradas,
            alvos,
          );
      return (
        compararChaves(capacidadeA, capacidadeB) ||
        Number(marcasConhecidas.has(b.analisado.item.marcaCatalogo)) -
          Number(marcasConhecidas.has(a.analisado.item.marcaCatalogo)) ||
        similaridade(b.analisado.item, atributos) -
          similaridade(a.analisado.item, atributos) ||
        a.indice - b.indice
      );
    })
    .map(({ analisado }) => analisado);

  return [...compativeisOrdenados, ...similaresOrdenados]
    .slice(0, maximo)
    .map((analisado) => ({
      ...analisado,
      foraDoRecorte: !filtradosIds.has(analisado.item.id),
    }));
}
