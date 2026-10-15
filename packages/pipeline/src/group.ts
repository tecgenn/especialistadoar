import { createHash } from "node:crypto";
import type {
  Aparelho,
  DadosDeclarados,
  RegistroInmetro,
  Tensao,
  Variante,
} from "./aparelho.ts";
import {
  COLUNA_TENSAO,
  type ValoresOficiais,
  type ValorOficial,
} from "./normalize.ts";
import type { ValoresDaLinha } from "./parse.ts";

/** Uma Linha da tabela já normalizada: original preservado + Valor oficial. */
export interface LinhaDaTabela {
  linha: number;
  versao: string;
  valores: ValoresDaLinha;
  oficial: ValoresOficiais;
}

const COLUNA_MARCA = "Marca";
const COLUNA_MODELO = "Modelo";
const COLUNA_UNIDADE_INTERNA = "Modelo Unidade Interna";
const COLUNA_UNIDADE_EXTERNA = "Modelo Unidade Externa";
const COLUNA_TIPO = "Tipo";
const COLUNA_FUNCAO = "Função";
const COLUNA_ROTACAO = "Rotação";
const COLUNA_FLUIDO = "Fluido Refrigerante";
const COLUNA_FLUIDO_ESPECIFICADO = "Se outro fluido refrigerante, especificar";
const COLUNA_REGISTRO = "Número do Registro";
const COLUNA_STATUS_REGISTRO = "Status do Registro";

/** Colunas numéricas que compõem os Dados declarados de uma variante. */
const COLUNAS_DADOS: ReadonlyArray<[string, keyof DadosDeclarados]> = [
  ["Capacidade de Refrigeração Nominal (Btu/h)", "capacidadeNominalBtu"],
  ["Capacidade de Refrigeração Nominal (W)", "capacidadeNominalW"],
  ["Potência Consumida no Modo Espera (W)", "potenciaEsperaW"],
  ["Capacidade a 35 °C e em Carga Total (W)", "capacidade35TotalW"],
  ["Potência Consumida a 35 °C e em Carga Total (W)", "potencia35TotalW"],
  ["Capacidade a 35 °C e em Carga Parcial (W)", "capacidade35ParcialW"],
  ["Potência Consumida a 35 °C e em Carga Parcial (W)", "potencia35ParcialW"],
  ["Capacidade a 29 °C e em Carga Parcial (W)", "capacidade29ParcialW"],
  ["Potência Consumida a 29 °C e em Carga Parcial (W)", "potencia29ParcialW"],
  ["Capacidade a 29 °C e Carga Total (W)", "capacidade29TotalW"],
  ["Potência Consumida a 29 °C e Carga Total (W)", "potencia29TotalW"],
  ["IDRS (Wh/Wh)", "idrs"],
  ["Consumo Anual de Energia (kWh)", "consumoAnualKwh"],
];

function comoTexto(valor: ValorOficial | undefined): string | null {
  if (typeof valor !== "string") {
    return null;
  }
  const texto = valor.trim();
  return texto === "" ? null : texto;
}

function comoNumero(valor: ValorOficial | undefined): number | null {
  return typeof valor === "number" ? valor : null;
}

function comoTensao(valor: ValorOficial | undefined): Tensao | null {
  if (valor === null || typeof valor !== "object") {
    return null;
  }
  return { voltagens: valor.voltagens, fases: valor.fases };
}

/** Chave canônica de identidade: marca + unid. interna + unid. externa, ou Modelo. */
export function chaveIdentidade(
  marca: string,
  unidadeInterna: string | null,
  unidadeExterna: string | null,
  modelo: string,
): string {
  const marcaCanonica = marca.trim().toUpperCase();
  if (unidadeInterna !== null && unidadeExterna !== null) {
    return `I:${marcaCanonica}|${unidadeInterna}|${unidadeExterna}`;
  }
  return `M:${marcaCanonica}|${modelo}`;
}

export function idDeChave(chave: string): string {
  return `ap-${createHash("sha256").update(chave).digest("hex").slice(0, 12)}`;
}

/** Chave de identidade de uma Linha da tabela, a partir dos Valores oficiais. */
export function chaveDaLinha(oficial: ValoresOficiais): string {
  return chaveIdentidade(
    comoTexto(oficial[COLUNA_MARCA]) ?? "",
    comoTexto(oficial[COLUNA_UNIDADE_INTERNA]),
    comoTexto(oficial[COLUNA_UNIDADE_EXTERNA]),
    comoTexto(oficial[COLUNA_MODELO]) ?? "",
  );
}

function extrairDados(oficial: ValoresOficiais): DadosDeclarados {
  const dados = {} as DadosDeclarados;
  for (const [coluna, campo] of COLUNAS_DADOS) {
    dados[campo] = comoNumero(oficial[coluna]);
  }
  return dados;
}

export function temDadosDeclarados(dados: DadosDeclarados): boolean {
  return Object.values(dados).some((valor) => valor !== null);
}

export function aparelhoTemDadosDeclarados(aparelho: Aparelho): boolean {
  return aparelho.variantes.some((variante) =>
    temDadosDeclarados(variante.dados),
  );
}

interface AparelhoEmConstrucao {
  chave: string;
  marca: string;
  modelo: string;
  unidadeInterna: string | null;
  unidadeExterna: string | null;
  tipo: string | null;
  funcao: string | null;
  rotacao: string | null;
  fluidoRefrigerante: string | null;
  fluidoEspecificado: string | null;
  linhas: number[];
  registros: RegistroInmetro[];
  variantes: Variante[];
}

function preencher(atual: string | null, novo: string | null): string | null {
  return atual ?? novo;
}

function adicionarRegistro(
  registros: RegistroInmetro[],
  oficial: ValoresOficiais,
): void {
  const numero = comoTexto(oficial[COLUNA_REGISTRO]);
  if (numero === null) {
    return;
  }
  const status = comoTexto(oficial[COLUNA_STATUS_REGISTRO]) ?? "";
  const jaExiste = registros.some(
    (registro) => registro.numero === numero && registro.status === status,
  );
  if (!jaExiste) {
    registros.push({ numero, status });
  }
}

function adicionarVariante(
  aparelho: AparelhoEmConstrucao,
  linha: number,
  oficial: ValoresOficiais,
): void {
  const tensao = comoTensao(oficial[COLUNA_TENSAO]);
  const dados = extrairDados(oficial);
  const existente = aparelho.variantes.find(
    (variante) =>
      JSON.stringify(variante.tensao) === JSON.stringify(tensao) &&
      JSON.stringify(variante.dados) === JSON.stringify(dados),
  );
  if (existente !== undefined) {
    existente.linhas.push(linha);
    return;
  }
  aparelho.variantes.push({ tensao, dados, linhas: [linha] });
}

function finalizar(emConstrucao: AparelhoEmConstrucao): Aparelho {
  return {
    id: idDeChave(emConstrucao.chave),
    marca: emConstrucao.marca,
    modelo: emConstrucao.modelo,
    unidadeInterna: emConstrucao.unidadeInterna,
    unidadeExterna: emConstrucao.unidadeExterna,
    tipo: emConstrucao.tipo,
    funcao: emConstrucao.funcao,
    rotacao: emConstrucao.rotacao,
    fluidoRefrigerante: emConstrucao.fluidoRefrigerante,
    fluidoEspecificado: emConstrucao.fluidoEspecificado,
    linhas: emConstrucao.linhas,
    registros: emConstrucao.registros,
    variantes: emConstrucao.variantes,
  };
}

export interface OpcoesAgrupamento {
  /**
   * Remapeia a identidade de uma Linha antes de agrupar — usado para aplicar os
   * Vínculos confirmados (o Aparelho novo passa a valer como o histórico). O
   * padrão é a identidade sem remapeamento.
   */
  identidadeCanonica?: (chave: string) => string;
}

/** Agrupa Linhas da tabela em Aparelhos. Identidade exclui a tensão. */
export function agruparAparelhos(
  linhas: LinhaDaTabela[],
  { identidadeCanonica }: OpcoesAgrupamento = {},
): Aparelho[] {
  const porChave = new Map<string, AparelhoEmConstrucao>();

  for (const { linha, oficial } of linhas) {
    const marca = comoTexto(oficial[COLUNA_MARCA]) ?? "";
    const modelo = comoTexto(oficial[COLUNA_MODELO]) ?? "";
    const unidadeInterna = comoTexto(oficial[COLUNA_UNIDADE_INTERNA]);
    const unidadeExterna = comoTexto(oficial[COLUNA_UNIDADE_EXTERNA]);
    const identidade = chaveIdentidade(
      marca,
      unidadeInterna,
      unidadeExterna,
      modelo,
    );
    const chave = identidadeCanonica?.(identidade) ?? identidade;

    let aparelho = porChave.get(chave);
    if (aparelho === undefined) {
      aparelho = {
        chave,
        marca,
        modelo,
        unidadeInterna,
        unidadeExterna,
        tipo: comoTexto(oficial[COLUNA_TIPO]),
        funcao: comoTexto(oficial[COLUNA_FUNCAO]),
        rotacao: comoTexto(oficial[COLUNA_ROTACAO]),
        fluidoRefrigerante: comoTexto(oficial[COLUNA_FLUIDO]),
        fluidoEspecificado: comoTexto(oficial[COLUNA_FLUIDO_ESPECIFICADO]),
        linhas: [],
        registros: [],
        variantes: [],
      };
      porChave.set(chave, aparelho);
    } else {
      aparelho.modelo = preencher(aparelho.modelo, modelo) ?? "";
      aparelho.tipo = preencher(aparelho.tipo, comoTexto(oficial[COLUNA_TIPO]));
      aparelho.funcao = preencher(
        aparelho.funcao,
        comoTexto(oficial[COLUNA_FUNCAO]),
      );
      aparelho.rotacao = preencher(
        aparelho.rotacao,
        comoTexto(oficial[COLUNA_ROTACAO]),
      );
      aparelho.fluidoRefrigerante = preencher(
        aparelho.fluidoRefrigerante,
        comoTexto(oficial[COLUNA_FLUIDO]),
      );
      aparelho.fluidoEspecificado = preencher(
        aparelho.fluidoEspecificado,
        comoTexto(oficial[COLUNA_FLUIDO_ESPECIFICADO]),
      );
    }

    aparelho.linhas.push(linha);
    adicionarRegistro(aparelho.registros, oficial);
    adicionarVariante(aparelho, linha, oficial);
  }

  return [...porChave.values()].map(finalizar);
}
