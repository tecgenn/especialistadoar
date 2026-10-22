import type { Aparelho } from "./aparelho.ts";
import type { ResolverMarcaCatalogo } from "./marcas-catalogo.ts";

/**
 * Contrato do dataset enxuto de consulta (`consulta.json`): uma projeção de cada
 * Aparelho com o que a consulta usa — identidade para exibir e linkar, e os
 * valores sobre os quais filtrar (capacidade em BTU e tensão). A base servida
 * completa (`aparelhos.json`, ~3,2 MB) fica para as páginas de detalhe; este é o
 * artefato que a ilha do site baixa (~350 KB). Ver ADR-0008.
 *
 * `marca` é a Marca oficial do INMETRO; `marcaCatalogo` é a Marca de catálogo
 * (ADR-0016), igual a `marca` quando não há agrupamento curado. Só o dataset de
 * consulta carrega o campo — a base servida mantém a Marca oficial.
 */
export interface ItemConsulta {
  id: string;
  marca: string;
  marcaCatalogo: string;
  modelo: string;
  tipo: string | null;
  capacidadesBtu: number[];
  tensoes: number[];
}

function numerosUnicos(valores: Array<number | null>): number[] {
  const presentes = valores.filter((valor): valor is number => valor !== null);
  return [...new Set(presentes)].sort((a, b) => a - b);
}

/** Projeta a base servida no dataset enxuto de consulta. */
export function projetarConsulta(
  aparelhos: Aparelho[],
  marcaCatalogo: ResolverMarcaCatalogo,
): ItemConsulta[] {
  return aparelhos.map((aparelho) => ({
    id: aparelho.id,
    marca: aparelho.marca,
    marcaCatalogo: marcaCatalogo(aparelho.marca),
    modelo: aparelho.modelo,
    tipo: aparelho.tipo,
    capacidadesBtu: numerosUnicos(
      aparelho.variantes.map((variante) => variante.dados.capacidadeNominalBtu),
    ),
    tensoes: numerosUnicos(
      aparelho.variantes.flatMap(
        (variante) => variante.tensao?.voltagens ?? [],
      ),
    ),
  }));
}
