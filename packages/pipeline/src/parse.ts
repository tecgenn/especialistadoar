import { parse } from "csv-parse/sync";

export type ValoresDaLinha = Record<string, string>;

export interface Tabela {
  cabecalho: string[];
  linhas: ValoresDaLinha[];
}

export function parseLinhas(input: string | Uint8Array): Tabela {
  const registros: string[][] = parse(input, { bom: true });

  const primeira = registros[0];
  if (primeira === undefined) {
    return { cabecalho: [], linhas: [] };
  }

  const cabecalho = primeira.map((nome) => nome.trim());
  const linhas = registros.slice(1).map((campos) => {
    const valores: ValoresDaLinha = {};
    for (let i = 0; i < cabecalho.length; i++) {
      const nome = cabecalho[i] as string;
      valores[nome] = campos[i] ?? "";
    }
    return valores;
  });

  return { cabecalho, linhas };
}
