import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import {
  FILTROS_VAZIOS,
  type FiltrosCurados,
  type MarcaCurada,
} from "./filtros.ts";

/**
 * As opções dos filtros da ilha, derivadas do dataset de consulta no build do
 * site. Passá-las prontas evita um `<select>` vazio antes de a ilha baixar o
 * `consulta.json` e mantém a lista de valores coerente com a base publicada.
 *
 * Os chips saem da curadoria do site (ticket 22): `marcasChip`/`btusChip` são os
 * valores conhecidos que **existem** na base, na ordem curada; `marcas`/`btus`
 * são o resto, para o `<select>` de cada filtro (sem repetir um chip).
 */
export interface OpcoesConsulta {
  marcasChip: MarcaCurada[];
  marcas: string[];
  btusChip: number[];
  btus: number[];
  tipos: string[];
  tensoes: number[];
}

/**
 * Lista os valores distintos (ordenados) de cada campo filtrável. A curadoria é
 * opcional: sem ela, todos os valores vão para o `<select>` e não há chips. Um
 * valor curado ausente da base é escondido em silêncio — a lista é curadoria,
 * o dado manda.
 */
export function opcoesDe(
  dataset: ItemConsulta[],
  curadoria: FiltrosCurados = FILTROS_VAZIOS,
): OpcoesConsulta {
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

  const marcasChip = curadoria.marcas
    .filter((marca) => marcas.has(marca.valor))
    .map(({ valor, rotulo }) => ({ valor, rotulo }));
  const valoresChip = new Set(marcasChip.map((marca) => marca.valor));

  const btusChip = curadoria.btus
    .filter((btu) => btus.has(btu))
    .sort((a, b) => a - b);
  const btusChipSet = new Set(btusChip);

  return {
    marcasChip,
    marcas: [...marcas].filter((marca) => !valoresChip.has(marca)).sort(),
    btusChip,
    btus: [...btus]
      .filter((btu) => !btusChipSet.has(btu))
      .sort((a, b) => a - b),
    tipos: [...tipos].sort(),
    tensoes: [...tensoes].sort((a, b) => a - b),
  };
}
