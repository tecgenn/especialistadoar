import type { ItemConsulta } from "@especialista-do-ar/pipeline";
import MiniSearch from "minisearch";

export type { ItemConsulta };

/** As colunas ordenáveis da tabela de Aparelhos (ticket 31). */
export const ORDENS_CONSULTA = ["btu", "consumo", "idrs", "classe"] as const;

export type OrdemConsulta = (typeof ORDENS_CONSULTA)[number];

/** Colunas de exibição da tabela (inclui as não-ordenáveis). */
export type ColunaExibicao =
  | OrdemConsulta
  | "marca"
  | "modelo"
  | "tipo"
  | "funcao";

export type DirecaoConsulta = "asc" | "desc";

export const DIRECOES_CONSULTA: readonly DirecaoConsulta[] = ["asc", "desc"];

export interface OrdenacaoConsulta {
  /** Coluna da ordenação; ausente = padrão A–Z (ou relevância, com busca). */
  ordem?: OrdemConsulta;
  /** Sentido da ordenação; padrão `asc`. */
  dir?: DirecaoConsulta;
}

export interface FiltrosConsulta extends OrdenacaoConsulta {
  /**
   * Marca do Aparelho, comparada sem diferenciar maiúsculas/minúsculas. Casa a
   * Marca de catálogo (o agrupamento curado) **e** a Marca oficial, para links
   * antigos com o valor oficial continuarem funcionando. Ver ADR-0016.
   */
  marca?: string;
  /** Tipo do Aparelho (idem). */
  tipo?: string;
  /** Capacidade nominal em BTU/h; casa com qualquer Variante do Aparelho. */
  btu?: number;
  /** Voltagem em V; casa com qualquer Variante do Aparelho. */
  tensao?: number;
  /** Função do Aparelho (ex.: `Frio`, `Quente/Frio`). */
  funcao?: string;
  /** Classe oficial (A–F) de qualquer Variante do Aparelho. */
  classe?: string;
  /** Busca textual sobre marca, modelo e tipo (MiniSearch). */
  q?: string;
}

export interface Consulta {
  /**
   * Aplica os filtros por campo e, se houver `q`, a busca textual — devolvendo a
   * interseção. Os filtros por campo não dependem da busca: sem `q`, não tocam o
   * índice textual. Com `q`, o resultado segue a ordem de relevância do
   * MiniSearch.
   */
  filtrar(filtros?: FiltrosConsulta): ItemConsulta[];
}

const CAMPOS_BUSCA = ["marca", "marcaCatalogo", "modelo", "tipo"] as const;

/** Normaliza um filtro textual; valor em branco é ausência de filtro. */
function filtroDeTexto(valor: string | undefined): string | undefined {
  const normalizado = valor?.trim().toLowerCase();
  return normalizado === undefined || normalizado === ""
    ? undefined
    : normalizado;
}

function combinaCampos(item: ItemConsulta, filtros: FiltrosConsulta): boolean {
  const marca = filtroDeTexto(filtros.marca);
  if (marca !== undefined) {
    const marcas = [item.marcaCatalogo, item.marca].map((valor) =>
      valor.trim().toLowerCase(),
    );
    if (!marcas.includes(marca)) {
      return false;
    }
  }
  const tipo = filtroDeTexto(filtros.tipo);
  if (tipo !== undefined && (item.tipo ?? "").trim().toLowerCase() !== tipo) {
    return false;
  }
  const funcao = filtroDeTexto(filtros.funcao);
  if (
    funcao !== undefined &&
    (item.funcao ?? "").trim().toLowerCase() !== funcao
  ) {
    return false;
  }
  const classe = filtroDeTexto(filtros.classe);
  if (
    classe !== undefined &&
    !item.classes.some((valor) => valor.trim().toLowerCase() === classe)
  ) {
    return false;
  }
  if (filtros.btu !== undefined && !item.capacidadesBtu.includes(filtros.btu)) {
    return false;
  }
  if (filtros.tensao !== undefined && !item.tensoes.includes(filtros.tensao)) {
    return false;
  }
  return true;
}

const collator = new Intl.Collator("pt-BR", {
  numeric: true,
  sensitivity: "base",
});

/** A–Z por Marca de catálogo e modelo, com `id` como desempate estável. */
function ordemPadrao(a: ItemConsulta, b: ItemConsulta): number {
  return (
    collator.compare(a.marcaCatalogo, b.marcaCatalogo) ||
    collator.compare(a.modelo, b.modelo) ||
    collator.compare(a.id, b.id)
  );
}

/**
 * O valor que representa a coluna. Em lista, o menor valor para crescente e o
 * maior para decrescente — o mesmo critério para números e para Classe.
 */
function chaveDe(
  item: ItemConsulta,
  ordem: OrdemConsulta,
  dir: DirecaoConsulta,
): string | number | null {
  const ultimo = dir === "desc";
  switch (ordem) {
    case "classe":
      return ultimo
        ? (item.classes.at(-1) ?? null)
        : (item.classes.at(0) ?? null);
    case "btu":
      return ultimo
        ? (item.capacidadesBtu.at(-1) ?? null)
        : (item.capacidadesBtu.at(0) ?? null);
    case "consumo":
      return ultimo
        ? (item.consumosKwh.at(-1) ?? null)
        : (item.consumosKwh.at(0) ?? null);
    case "idrs":
      return ultimo ? (item.idrs.at(-1) ?? null) : (item.idrs.at(0) ?? null);
  }
}

/**
 * Ordena os Aparelhos da tabela (ticket 31). Sem `ordem`, aplica o padrão A–Z
 * por Marca de catálogo e modelo. Numa coluna, crescente usa o menor valor da
 * lista de cada Aparelho e decrescente o maior; quem não declara o valor fica no
 * fim. Nas ordenações por IDRS e consumo, os suspeitos (ticket 25) vão para o
 * fim nas duas direções — o dado implausível não domina o topo.
 */
export function ordenar(
  itens: readonly ItemConsulta[],
  { ordem, dir = "asc" }: OrdenacaoConsulta = {},
): ItemConsulta[] {
  const sinal = dir === "desc" ? -1 : 1;
  return [...itens].sort((a, b) => {
    if (ordem === undefined) {
      return ordemPadrao(a, b);
    }
    const va = chaveDe(a, ordem, dir);
    const vb = chaveDe(b, ordem, dir);
    if (va === null || vb === null) {
      if (va !== vb) {
        return va === null ? 1 : -1;
      }
      return ordemPadrao(a, b);
    }
    const comparacao =
      typeof va === "number" && typeof vb === "number"
        ? va - vb
        : collator.compare(String(va), String(vb));
    return comparacao * sinal || ordemPadrao(a, b);
  });
}

/**
 * Abre o módulo de consulta sobre o dataset enxuto já parseado. Recebe os dados
 * (não um caminho de arquivo) para ser usado no navegador — a ilha faz `fetch` +
 * `JSON.parse` do `consulta.json` — ou por qualquer consumidor que já tenha o
 * array em mãos.
 */
export function criarConsulta(dataset: ItemConsulta[]): Consulta {
  const indice = new MiniSearch<ItemConsulta>({
    fields: [...CAMPOS_BUSCA],
    stringifyField: (valor: unknown) => (valor == null ? "" : String(valor)),
    searchOptions: {
      boost: { marca: 2 },
      prefix: true,
      fuzzy: 0.2,
    },
  });
  indice.addAll(dataset);
  const porId = new Map(dataset.map((item) => [item.id, item]));

  return {
    filtrar(filtros = {}) {
      const porCampo = dataset.filter((item) => combinaCampos(item, filtros));
      const termo = filtros.q?.trim();
      if (termo === undefined || termo === "") {
        return porCampo;
      }

      const aceitos = new Set(porCampo.map((item) => item.id));
      const resultado: ItemConsulta[] = [];
      for (const { id } of indice.search(termo)) {
        const item = porId.get(id as string);
        if (item !== undefined && aceitos.has(item.id)) {
          resultado.push(item);
        }
      }
      return resultado;
    },
  };
}
