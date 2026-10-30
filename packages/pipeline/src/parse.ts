import { parse } from "csv-parse/sync";

export type ValoresDaLinha = Record<string, string>;

/** Uma Linha da tabela crua, com o número que a identifica no CSV original. */
export interface LinhaCrua {
  /**
   * Número da Linha da tabela: 1-based entre as Linhas de dados, sem contar o
   * cabeçalho. É o número usado pelas Exceções manuais e pela proveniência dos
   * Aparelhos, e não muda quando uma Linha anterior é descartada.
   */
  numero: number;
  valores: ValoresDaLinha;
}

export interface Tabela {
  cabecalho: string[];
  linhas: LinhaCrua[];
}

/** Linhas com este Status do Modelo não entram na base (duplicatas/obsoletas). */
export const COLUNA_STATUS_MODELO = "Status do Modelo";
export const STATUS_MODELO_EXCLUIDO = "Excluido";

export function parseLinhas(input: string | Uint8Array): Tabela {
  const registros: string[][] = parse(input, { bom: true });

  const primeira = registros[0];
  if (primeira === undefined) {
    return { cabecalho: [], linhas: [] };
  }

  const cabecalho = primeira.map((nome) => nome.trim());
  const linhas: LinhaCrua[] = [];

  registros.slice(1).forEach((campos, indice) => {
    const valores: ValoresDaLinha = {};
    for (let i = 0; i < cabecalho.length; i++) {
      const nome = cabecalho[i] as string;
      valores[nome] = campos[i] ?? "";
    }

    // O Status do Modelo é lido antes de qualquer normalização: a Linha
    // "Excluido" é descartada na origem e não gera Aparelho, Registro nem
    // Anomalia. O número original é preservado para as Linhas seguintes.
    if (valores[COLUNA_STATUS_MODELO] === STATUS_MODELO_EXCLUIDO) {
      return;
    }

    linhas.push({ numero: indice + 1, valores });
  });

  return { cabecalho, linhas };
}
