import type {
  ItemConsulta,
  OrdemConsulta,
} from "@especialista-do-ar/api/consulta";
import { formatarFaixa } from "./ficha.ts";

/**
 * Metadados da tabela de Aparelhos (ticket 27): os mesmos campos ordenáveis do
 * módulo isomórfico, na ordem em que aparecem na tela. O rótulo serve ao
 * cabeçalho, ao seletor "Ordenar por" e ao cartão do celular (`data-label`).
 */
export interface ColunaTabela {
  campo: OrdemConsulta;
  rotulo: string;
}

/** "Ativo" · "Inativo" — o rótulo da Situação na tela. */
export function rotuloSituacao(situacao: ItemConsulta["situacao"]): string {
  return situacao === "ativo" ? "Ativo" : "Inativo";
}

export const COLUNAS_TABELA: readonly ColunaTabela[] = [
  { campo: "marca", rotulo: "Marca" },
  { campo: "modelo", rotulo: "Modelo" },
  { campo: "btu", rotulo: "BTU/h" },
  { campo: "consumo", rotulo: "Consumo (kWh/ano)" },
  { campo: "idrs", rotulo: "IDRS" },
  { campo: "classe", rotulo: "Classe" },
  { campo: "tipo", rotulo: "Tipo" },
  { campo: "situacao", rotulo: "Situação" },
];

/**
 * O texto de uma célula. Listas viram faixa quando têm mais de um valor
 * ("9.000 – 12.000"); dado ausente aparece como travessão.
 */
export function valorDaColuna(
  item: ItemConsulta,
  campo: OrdemConsulta,
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
      return item.classes.join(", ") || "—";
    case "tipo":
      return item.tipo === null || item.tipo === "" ? "—" : item.tipo;
    case "situacao":
      return rotuloSituacao(item.situacao);
  }
}
