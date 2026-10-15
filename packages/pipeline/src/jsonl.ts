import { existsSync, readFileSync, writeFileSync } from "node:fs";

/** Lê um arquivo JSON Lines. Ausente ou vazio devolve lista vazia. */
export function lerJsonl<T>(caminho: string): T[] {
  if (!existsSync(caminho)) {
    return [];
  }
  const conteudo = readFileSync(caminho, "utf8").trim();
  if (conteudo === "") {
    return [];
  }
  return conteudo.split("\n").map((linha) => JSON.parse(linha) as T);
}

/** Grava registros como JSON Lines, um objeto por linha, com newline final. */
export function escreverJsonl(caminho: string, registros: unknown[]): void {
  const jsonl = registros
    .map((registro) => JSON.stringify(registro))
    .join("\n");
  writeFileSync(caminho, `${jsonl}\n`);
}
