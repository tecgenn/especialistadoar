import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { type Oferta, validarOfertas } from "../src/lib/ofertas.ts";
import {
  type BuscadorLink,
  verificarOfertas,
} from "../src/lib/verificacao-links.ts";

/**
 * Job de verificação de links das Ofertas (ticket 12). Lê `ofertas.json` (site-only),
 * faz uma requisição a cada URL e **reporta as quebradas**; sai com código 1 se
 * houver alguma. Roda agendado (ver `.github/workflows/verificar-links.yml`) ou
 * à mão via `pnpm verificar-links`. Node 24 executa o TypeScript direto.
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

const { total, quebradas } = await verificarOfertas(ofertas, buscar);

for (const { oferta, motivo } of quebradas) {
  console.error(`✗ ${oferta.url} (${oferta.loja}): ${motivo}`);
}
console.log(
  `${total} Oferta(s) verificada(s), ${quebradas.length} quebrada(s).`,
);

if (quebradas.length > 0) {
  process.exitCode = 1;
}
