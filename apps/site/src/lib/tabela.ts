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
  // Tipo é somente leitura (ticket 43): aparece após Modelo, mas não ordena.
  { campo: "tipo", rotulo: "Tipo" },
  { campo: "btu", rotulo: "BTU/h" },
  { campo: "consumo", rotulo: "Consumo (kWh)" },
  { campo: "idrs", rotulo: "IDRS" },
  { campo: "classe", rotulo: "Classe" },
];

/**
 * As colunas renderizadas na tabela de Aparelhos. A tag "Análise" não é uma
 * coluna de dados: é um elemento da linha (ticket 54), renderizado apenas para
 * aparelhos que têm Análise publicada, entre o checkbox de seleção e a Marca.
 */
export function colunasDaTabela(): ColunaTabela[] {
  return [...COLUNAS_TABELA];
}

/**
 * A segunda linha da célula do Modelo (ticket 63): Função e Tensões do
 * Aparelho, dados que eram só filtro. `Frio · 220 V` num modelo simples e
 * `Frio · 127 · 220 V` num bivolt. Função ou Tensão ausente não deixa separador
 * solto; sem nenhuma das duas, não há segunda linha.
 */
export function detalheDoAparelho(item: ItemConsulta): string | null {
  const funcao = item.funcao?.trim() ?? "";
  const tensoes = [...item.tensoes].sort((a, b) => a - b);
  const textoDasTensoes =
    tensoes.length === 0 ? "" : `${tensoes.join(" · ")} V`;
  const partes = [funcao, textoDasTensoes].filter((parte) => parte !== "");
  return partes.length === 0 ? null : partes.join(" · ");
}

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
