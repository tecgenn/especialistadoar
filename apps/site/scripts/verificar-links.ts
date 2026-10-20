import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { type Oferta, validarOfertas } from "../src/lib/ofertas.ts";
import {
  type BuscadorLink,
  renderizarRelatorioLinks,
  verificarOfertas,
} from "../src/lib/verificacao-links.ts";

/**
 * Verificação de links das Ofertas, sob demanda (ticket 15). Lê `ofertas.json`
 * (site-only), faz uma requisição a cada URL e imprime o resultado (URL, loja e
 * motivo dos quebrados) no terminal; links quebrados não fazem o comando falhar.
 * Roda à mão via `pnpm verificar-links`. Node 24 executa o TypeScript direto.
 */

const caminhoOfertas = fileURLToPath(
  new URL("../ofertas.json", import.meta.url),
);

const TIMEOUT_MS = 10_000;

const buscar: BuscadorLink = async (url) => {
  const resposta = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: {
      "user-agent":
        "EspecialistaDoAr-link-check/1.0 (+https://especialista-do-ar.pages.dev)",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return { ok: resposta.ok, status: resposta.status };
};

const ofertas = JSON.parse(readFileSync(caminhoOfertas, "utf8")) as Oferta[];
validarOfertas(ofertas);

const relatorio = await verificarOfertas(ofertas, buscar);
console.log(renderizarRelatorioLinks(relatorio));
