import {
  DIRECOES_CONSULTA,
  type FiltrosConsulta,
  ORDENS_CONSULTA,
} from "@especialista-do-ar/api/consulta";

/**
 * O estado da consulta é `FiltrosConsulta` — o mesmo contrato que o módulo
 * isomórfico (ticket 08) aplica. Aqui só convertemos entre esse estado e a
 * querystring, para o resultado ficar na URL (`?marca=&tipo=&btu=&tensao=&q=`)
 * e ser compartilhável/favoritável (ADR-0008). Puro, sem DOM.
 *
 * **Filtros padrão (ticket 38).** Abrir `/aparelhos/` sem nenhum filtro na URL
 * aplica o recorte mais comum — Tipo Split Hi-Wall, Tensão 220 V e Classe A —
 * sem sujar a URL. O padrão é implícito: uma URL que traga **qualquer** chave de
 * filtro é o estado completo, e o padrão **não** é somado por cima (um link com
 * filtro próprio é respeitado). Para representar "nenhum filtro" — a pessoa
 * desligou os três do padrão —, `escreverEstado` grava as chaves do padrão
 * vazias; a presença da chave desliga o padrão na leitura e o estado continua
 * compartilhável.
 */

/** O recorte inicial de `/aparelhos/`, aplicado quando a URL não traz filtro. */
export const FILTROS_PADRAO: FiltrosConsulta = {
  tipo: "Split Hi-Wall",
  tensao: 220,
  classe: "A",
};

/** As chaves que são filtro; a ordenação não conta como filtro. */
const CAMPOS_DE_FILTRO = [
  "marca",
  "tipo",
  "btu",
  "tensao",
  "funcao",
  "classe",
  "q",
] as const;

type CampoDeFiltro = (typeof CAMPOS_DE_FILTRO)[number];

/** Um parâmetro textual em branco é ausência de filtro. */
function texto(valor: string | null): string | undefined {
  const limpo = valor?.trim();
  return limpo === undefined || limpo === "" ? undefined : limpo;
}

/** Um parâmetro numérico inválido é ignorado (não quebra a consulta). */
function numero(valor: string | null): number | undefined {
  const limpo = texto(valor);
  if (limpo === undefined) {
    return undefined;
  }
  const n = Number(limpo);
  return Number.isFinite(n) ? n : undefined;
}

/** Um parâmetro de lista fixa: valor desconhecido é ignorado. */
function opcao<T extends string>(
  valor: string | null,
  permitidos: readonly T[],
): T | undefined {
  const limpo = texto(valor)?.toLowerCase();
  return permitidos.find((permitido) => permitido === limpo);
}

/**
 * A forma normalizada de um valor de filtro. Texto é aparado e comparado sem
 * caixa; `undefined` e branco contam como ausência.
 */
function valorNormalizado(valor: FiltrosConsulta[CampoDeFiltro]): string {
  if (valor === undefined) {
    return "";
  }
  return typeof valor === "number" ? String(valor) : valor.trim().toLowerCase();
}

/** A impressão digital dos filtros, ignorando a ordenação. */
function chaveDosFiltros(estado: FiltrosConsulta): string {
  return CAMPOS_DE_FILTRO.map((campo) => valorNormalizado(estado[campo])).join(
    "\u0000",
  );
}

function igualAoPadrao(estado: FiltrosConsulta): boolean {
  return chaveDosFiltros(estado) === chaveDosFiltros(FILTROS_PADRAO);
}

function semFiltros(estado: FiltrosConsulta): boolean {
  return CAMPOS_DE_FILTRO.every(
    (campo) => valorNormalizado(estado[campo]) === "",
  );
}

/** "Limpar filtros" só aparece quando o estado difere do padrão. */
export function temFiltroAtivo(estado: FiltrosConsulta): boolean {
  return !igualAoPadrao(estado);
}

function lerFiltros(busca: URLSearchParams): FiltrosConsulta {
  // A marca é comparada sem diferenciar caixa pelo motor de consulta; normalizar
  // aqui mantém o mesmo valor canônico no chip, no `<select>` e na URL (um
  // `?marca=midea` acende o chip "Midea" e não cria uma opção duplicada).
  const marca = texto(busca.get("marca"))?.toUpperCase();
  const tipo = texto(busca.get("tipo"));
  const btu = numero(busca.get("btu"));
  const tensao = numero(busca.get("tensao"));
  const funcao = texto(busca.get("funcao"));
  const classe = texto(busca.get("classe"))?.toUpperCase();
  const q = texto(busca.get("q"));
  return {
    ...(marca === undefined ? {} : { marca }),
    ...(tipo === undefined ? {} : { tipo }),
    ...(btu === undefined ? {} : { btu }),
    ...(tensao === undefined ? {} : { tensao }),
    ...(funcao === undefined ? {} : { funcao }),
    ...(classe === undefined ? {} : { classe }),
    ...(q === undefined ? {} : { q }),
  };
}

function lerOrdenacao(busca: URLSearchParams): FiltrosConsulta {
  const ordem = opcao(busca.get("ordem"), ORDENS_CONSULTA);
  const dir = opcao(busca.get("dir"), DIRECOES_CONSULTA);
  return {
    ...(ordem === undefined ? {} : { ordem }),
    ...(dir === undefined ? {} : { dir }),
  };
}

/**
 * Lê o estado da consulta de uma querystring. Sem nenhuma chave de filtro, o
 * padrão entra como estado inicial; a ordenação é lida em qualquer caso.
 */
export function lerEstado(busca: URLSearchParams): FiltrosConsulta {
  const ordenacao = lerOrdenacao(busca);
  const trazFiltro = CAMPOS_DE_FILTRO.some((campo) => busca.has(campo));
  const filtros = trazFiltro ? lerFiltros(busca) : FILTROS_PADRAO;
  return { ...filtros, ...ordenacao };
}

function escreverFiltros(
  busca: URLSearchParams,
  estado: FiltrosConsulta,
): void {
  if (estado.marca !== undefined && estado.marca.trim() !== "") {
    busca.set("marca", estado.marca.trim());
  }
  if (estado.tipo !== undefined && estado.tipo.trim() !== "") {
    busca.set("tipo", estado.tipo.trim());
  }
  if (estado.btu !== undefined) {
    busca.set("btu", String(estado.btu));
  }
  if (estado.tensao !== undefined) {
    busca.set("tensao", String(estado.tensao));
  }
  if (estado.funcao !== undefined && estado.funcao.trim() !== "") {
    busca.set("funcao", estado.funcao.trim());
  }
  if (estado.classe !== undefined && estado.classe.trim() !== "") {
    busca.set("classe", estado.classe.trim());
  }
  if (estado.q !== undefined && estado.q.trim() !== "") {
    busca.set("q", estado.q.trim());
  }
}

/**
 * Serializa o estado em parâmetros. O padrão exato fica fora da URL; qualquer
 * outro estado vai completo, para a URL sozinha reconstruí-lo. O estado sem
 * filtros grava as chaves do padrão vazias, que o distinguem da URL limpa.
 */
export function escreverEstado(estado: FiltrosConsulta): URLSearchParams {
  const busca = new URLSearchParams();

  if (!igualAoPadrao(estado)) {
    if (semFiltros(estado)) {
      for (const campo of Object.keys(FILTROS_PADRAO) as CampoDeFiltro[]) {
        busca.set(campo, "");
      }
    } else {
      escreverFiltros(busca, estado);
    }
  }

  if (estado.ordem !== undefined) {
    busca.set("ordem", estado.ordem);
  }
  if (estado.dir !== undefined) {
    busca.set("dir", estado.dir);
  }
  return busca;
}
