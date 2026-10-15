#!/usr/bin/env node
import { resolve } from "node:path";
import { ORIGEM_PADRAO, runBuild } from "./build.ts";

const USO =
  "Uso: especialista build [--source <csv>] [--obtido-em <YYYY-MM-DD>] [--origem <texto>] [--data-dir <dir>]";

function argumento(nome: string): string | undefined {
  const indice = process.argv.indexOf(nome);
  return indice >= 0 ? process.argv[indice + 1] : undefined;
}

const primeiro = process.argv[2];
const comando =
  primeiro === undefined || primeiro.startsWith("--") ? "build" : primeiro;

if (comando !== "build") {
  console.error(USO);
  process.exit(1);
}

const source = argumento("--source");
const resultado = runBuild({
  dataDir: resolve(argumento("--data-dir") ?? "data"),
  source: source === undefined ? undefined : resolve(source),
  origem: argumento("--origem") ?? ORIGEM_PADRAO,
  obtidoEm: argumento("--obtido-em"),
});

console.log(
  `Versão da tabela ${resultado.versao.hash.slice(0, 12)} — ${resultado.versao.contagemLinhas} Linhas da tabela`,
);
console.log(`${resultado.anomalias.length} Anomalias`);
console.log(`${resultado.aparelhos.length} Aparelhos na base servida`);
console.log(
  `Artefatos em ${resolve(argumento("--data-dir") ?? "data", "build")}`,
);
