/**
 * Glue da Marca de catálogo no build do site (ADR-0016): indexa o
 * `marcaCatalogo` do dataset de consulta por `aparelhoId` uma única vez, para a
 * ficha exibir o agrupamento curado sem reconstruir o mapa a cada página.
 */
import consultaJson from "@dados/consulta.json";
import type { ItemConsulta } from "@especialista-do-ar/api/consulta";

let indice: Map<string, string> | undefined;

/**
 * A Marca de catálogo do Aparelho, a partir do dataset de consulta — o mesmo
 * agrupamento que o filtro do catálogo usa. Cai na Marca oficial quando o
 * Aparelho não está no dataset, para a ficha nunca exibir uma marca vazia.
 */
export function marcaCatalogoDo(aparelho: {
  id: string;
  marca: string;
}): string {
  if (indice === undefined) {
    indice = new Map(
      (consultaJson as ItemConsulta[]).map((item) => [
        item.id,
        item.marcaCatalogo,
      ]),
    );
  }
  return indice.get(aparelho.id) ?? aparelho.marca;
}
