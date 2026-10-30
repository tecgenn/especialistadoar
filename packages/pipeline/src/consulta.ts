import type { Aparelho } from "./aparelho.ts";
import type { ResolverMarcaCatalogo } from "./marcas-catalogo.ts";

/**
 * Contrato do dataset enxuto de consulta (`consulta.json`): uma projeção de cada
 * Aparelho com o que a consulta usa — identidade para exibir e linkar, Função,
 * e os valores sobre os quais filtrar (BTU, tensão, Classe, IDRS e consumo).
 * A base servida completa (`aparelhos.json`, ~3,25 MB) fica para as páginas de
 * detalhe; este é o artefato que a ilha do site baixa (~680 KB).
 * Ver ADR-0008 e ADR-0018.
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
  funcao: string | null;
  capacidadesBtu: number[];
  tensoes: number[];
  classes: string[];
  idrs: number[];
  consumosKwh: number[];
}

function numerosUnicos(valores: Array<number | null>): number[] {
  const presentes = valores.filter((valor): valor is number => valor !== null);
  return [...new Set(presentes)].sort((a, b) => a - b);
}

function textosUnicos(valores: Array<string | null>): string[] {
  const presentes = valores.filter((valor): valor is string => valor !== null);
  return [...new Set(presentes)].sort();
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
    funcao: aparelho.funcao,
    capacidadesBtu: numerosUnicos(
      aparelho.variantes.map((variante) => variante.dados.capacidadeNominalBtu),
    ),
    tensoes: numerosUnicos(
      aparelho.variantes.flatMap(
        (variante) => variante.tensao?.voltagens ?? [],
      ),
    ),
    classes: textosUnicos(
      aparelho.variantes.map((variante) => variante.dados.classe),
    ),
    idrs: numerosUnicos(
      aparelho.variantes.map((variante) => variante.dados.idrs),
    ),
    consumosKwh: numerosUnicos(
      aparelho.variantes.map((variante) => variante.dados.consumoAnualKwh),
    ),
  }));
}
