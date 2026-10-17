import type { ItemConsulta } from "@especialista-do-ar/pipeline";
import MiniSearch from "minisearch";

export type { ItemConsulta };

/**
 * O módulo de consulta isomórfico: lógica pura sobre o dataset enxuto
 * (`consulta.json`), **sem** dependências de Node — é importado tanto pela ilha
 * do site (navegador) quanto pelo Worker (Agente), com uma só definição. A
 * leitura de arquivo fica em `estatica.ts`, que é Node-only; separar por entry
 * point é o que impede `fs` de entrar no bundle do site. Ver ADR-0008.
 */
export interface FiltrosConsulta {
  /** Marca do Aparelho (comparação sem diferenciar maiúsculas/minúsculas). */
  marca?: string;
  /** Tipo do Aparelho (idem). */
  tipo?: string;
  /** Capacidade nominal em BTU/h; casa com qualquer Variante do Aparelho. */
  btu?: number;
  /** Voltagem em V; casa com qualquer Variante do Aparelho. */
  tensao?: number;
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

const CAMPOS_BUSCA = ["marca", "modelo", "tipo"] as const;

/** Normaliza um filtro textual; valor em branco é ausência de filtro. */
function filtroDeTexto(valor: string | undefined): string | undefined {
  const normalizado = valor?.trim().toLowerCase();
  return normalizado === undefined || normalizado === ""
    ? undefined
    : normalizado;
}

function combinaCampos(item: ItemConsulta, filtros: FiltrosConsulta): boolean {
  const marca = filtroDeTexto(filtros.marca);
  if (marca !== undefined && item.marca.trim().toLowerCase() !== marca) {
    return false;
  }
  const tipo = filtroDeTexto(filtros.tipo);
  if (tipo !== undefined && (item.tipo ?? "").trim().toLowerCase() !== tipo) {
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

/**
 * Abre o módulo de consulta sobre o dataset enxuto já parseado. Recebe os dados
 * (não um caminho de arquivo) para servir os dois ambientes de consumo — a ilha
 * faz `fetch` + `JSON.parse` do `consulta.json`; o Worker lê o mesmo artefato
 * embutido.
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
