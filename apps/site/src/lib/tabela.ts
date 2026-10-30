import type {
  ColunaExibicao,
  ItemConsulta,
} from "@especialista-do-ar/api/consulta";
import { formatarFaixa } from "./ficha.ts";

/**
 * Metadados da tabela de Aparelhos (ticket 31): as colunas de exibição na ordem
 * em que aparecem na tela. O rótulo serve ao cabeçalho, ao seletor "Ordenar por"
 * e ao cartão do celular (`data-label`).
 */
export interface ColunaTabela {
  campo: ColunaExibicao;
  rotulo: string;
}

export const COLUNAS_TABELA: readonly ColunaTabela[] = [
  { campo: "marca", rotulo: "Marca" },
  { campo: "modelo", rotulo: "Modelo" },
  { campo: "btu", rotulo: "BTU/h" },
  { campo: "consumo", rotulo: "Consumo (kWh)" },
  { campo: "idrs", rotulo: "IDRS" },
  { campo: "classe", rotulo: "Classe" },
];

/**
 * O texto de uma célula. Listas viram faixa quando têm mais de um valor
 * ("9.000 – 12.000"); dado ausente aparece como travessão.
 */
export function valorDaColuna(
  item: ItemConsulta,
  campo: ColunaExibicao,
): string {
  switch (campo) {
    case "marca":
      return item.marcaCatalogo;
    case "modelo":
      return item.modelo;
    case "btu":
      return formatarFaixa(item.capacidadesBtu);
    case "consumo":
      return formatarFaixa(item.consumosKwh);
    case "idrs":
      return formatarFaixa(item.idrs);
    case "classe":
      // Exibe "Classe A, Classe B" etc. com rótulo amigável
      return item.classes.map((c) => `Classe ${c}`).join(", ") || "—";
    case "tipo":
      return item.tipo === null || item.tipo === "" ? "—" : item.tipo;
    case "funcao":
      return item.funcao === null || item.funcao === "" ? "—" : item.funcao;
  }
}
