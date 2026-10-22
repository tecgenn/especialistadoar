import type { ItemConsulta } from "@especialista-do-ar/api/consulta";

/**
 * As opções dos filtros da ilha, derivadas do dataset de consulta no build do
 * site. Passá-las prontas evita um `<select>` vazio antes de a ilha baixar o
 * `consulta.json` e mantém a lista de valores coerente com a base publicada.
 */
export interface OpcoesConsulta {
  marcas: string[];
  tipos: string[];
  btus: number[];
  tensoes: number[];
}

/** Lista os valores distintos (ordenados) de cada campo filtrável. */
export function opcoesDe(dataset: ItemConsulta[]): OpcoesConsulta {
  const marcas = new Set<string>();
  const tipos = new Set<string>();
  const btus = new Set<number>();
  const tensoes = new Set<number>();

  for (const item of dataset) {
    // O filtro do catálogo é por Marca de catálogo (ADR-0016): as opções não
    // repetem a mesma família sob dois nomes oficiais.
    if (item.marcaCatalogo !== "") {
      marcas.add(item.marcaCatalogo);
    }
    if (item.tipo !== null && item.tipo !== "") {
      tipos.add(item.tipo);
    }
    for (const btu of item.capacidadesBtu) {
      btus.add(btu);
    }
    for (const tensao of item.tensoes) {
      tensoes.add(tensao);
    }
  }

  return {
    marcas: [...marcas].sort(),
    tipos: [...tipos].sort(),
    btus: [...btus].sort((a, b) => a - b),
    tensoes: [...tensoes].sort((a, b) => a - b),
  };
}
