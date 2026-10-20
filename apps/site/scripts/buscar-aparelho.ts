import { fileURLToPath } from "node:url";
import { abrirApiEstatica } from "@especialista-do-ar/api";
import {
  buscarAparelhos,
  renderizarAparelhosEncontrados,
} from "../src/lib/buscar-aparelho.ts";

/**
 * Busca de Aparelhos para o frontmatter de uma Análise (ticket 16). Lê a base
 * servida publicada em `data/build/` (via API estática) e imprime marca, modelo,
 * potência(s) em BTU e o `id` — o valor do `aparelhoId`. Só leitura: não altera
 * nem cria artefato. Roda à mão via `pnpm aparelho:buscar "<termo>"`.
 */

const termo = process.argv.slice(2).join(" ").trim();

if (termo === "") {
  console.error('Uso: pnpm aparelho:buscar "<marca, modelo ou potência>"');
  process.exit(2);
}

const buildDir = fileURLToPath(
  new URL("../../../data/build/", import.meta.url),
);
const api = abrirApiEstatica(buildDir);

const encontrados = buscarAparelhos(api.listar(), termo);
console.log(renderizarAparelhosEncontrados(termo, encontrados));
