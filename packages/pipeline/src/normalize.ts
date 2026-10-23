import type { ValoresDaLinha } from "./parse.ts";

export interface TensaoNormalizada {
  voltagens: number[];
  fases: string[];
}

export type ValorOficial = string | number | null | TensaoNormalizada;

export type ValoresOficiais = Record<string, ValorOficial>;

export interface LinhaComOficial {
  valores: ValoresDaLinha;
  oficial: ValoresOficiais;
}

const UNIDADE_NUMERICA = /\((?:Btu\/h|W|g|kWh|Wh\/Wh)\)$/;
const SUFIXO_UNIDADE = /(?:[A-Za-z]+\/[A-Za-z]+|[A-Za-z]+)$/;
const NUMERO = /^-?\d+(?:\.\d+)?$/;
// pt-BR: ponto entre grupos de três dígitos é separador de milhar (`12.000`,
// `1.234.567`), com decimal por vírgula (`1.000,50`). O formato en-US
// (`1,000.50`) fica de fora por decisão do ticket 23.
const NUMERO_PT_BR_MILHAR = /^(-?\d{1,3})((?:\.\d{3})+)(?:,(\d+))?$/;
const TOKEN_NUMERO = /\d+(?:[.,]\d+)?/g;

export const COLUNA_TENSAO = "Tensão (V)";
export const COLUNAS_CASING: ReadonlySet<string> = new Set(["Marca"]);

export function normalizarGrau(texto: string): string {
  return texto.replace(/\u00BA/g, "\u00B0");
}

export function normalizarEspacos(texto: string): string {
  return texto.replace(/\s+/g, " ").trim();
}

export function normalizarCasing(texto: string): string {
  return texto.toUpperCase();
}

export function colunaNumerica(nome: string): boolean {
  return UNIDADE_NUMERICA.test(nome);
}

export function parseNumero(texto: string): number | null {
  const bruto = texto.trim();
  if (bruto === "") {
    return null;
  }

  const limpo = bruto.replace(/\s+/g, "").replace(SUFIXO_UNIDADE, "");

  const milhar = NUMERO_PT_BR_MILHAR.exec(limpo);
  if (milhar !== null) {
    const [, inteiro = "", grupos = "", fracao] = milhar;
    // A parte inteira `0` nunca é milhar: `0.351` é decimal.
    if (Number(inteiro) !== 0) {
      const digitos = `${inteiro}${grupos}`.replace(/\./g, "");
      const valor = fracao === undefined ? digitos : `${digitos}.${fracao}`;
      return Number(valor);
    }
  }

  const decimal = limpo.replace(",", ".");
  return NUMERO.test(decimal) ? Number(decimal) : null;
}

export function parseTensao(texto: string): TensaoNormalizada | null {
  const bruto = texto.trim();
  if (bruto === "") {
    return null;
  }

  const abreParenteses = bruto.indexOf("(");
  const parteValores =
    abreParenteses >= 0 ? bruto.slice(0, abreParenteses) : bruto;
  const parteFases = abreParenteses >= 0 ? bruto.slice(abreParenteses + 1) : "";

  const voltagens = parteValores
    .split("-")
    .map((parte) => parseNumero(parte))
    .filter((valor): valor is number => valor !== null);

  if (voltagens.length === 0) {
    return null;
  }

  const fases = parteFases
    .replace(/\)/g, "")
    .split("/")
    .map((parte) => normalizarEspacos(parte))
    .filter((fase) => fase !== "");

  return { voltagens, fases };
}

export function contarValoresNumericos(texto: string): number {
  return texto.match(TOKEN_NUMERO)?.length ?? 0;
}

function normalizarTexto(nome: string, valor: string): string {
  let resultado = normalizarEspacos(normalizarGrau(valor));
  if (COLUNAS_CASING.has(nome)) {
    resultado = normalizarCasing(resultado);
  }
  return resultado;
}

function normalizarCampo(nome: string, valor: string): ValorOficial {
  if (nome === COLUNA_TENSAO) {
    return parseTensao(valor);
  }
  if (colunaNumerica(nome)) {
    return parseNumero(valor);
  }
  return normalizarTexto(nome, valor);
}

export function normalizarValores(valores: ValoresDaLinha): LinhaComOficial {
  const normalizados: ValoresDaLinha = {};
  const oficial: ValoresOficiais = {};

  for (const [nome, valor] of Object.entries(valores)) {
    const chave = normalizarGrau(nome);
    if (chave in normalizados) {
      throw new Error(`Nome de coluna duplicado após normalização: ${chave}`);
    }
    normalizados[chave] = valor;
    oficial[chave] = normalizarCampo(chave, valor);
  }

  return { valores: normalizados, oficial };
}
