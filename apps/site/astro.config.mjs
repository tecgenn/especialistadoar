// @ts-check
import { cpSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import pagefind from "astro-pagefind";

/** Onde vivem os artefatos publicados (a base servida) — a raiz do repo. */
const buildDir = fileURLToPath(new URL("../../data/build", import.meta.url));

/**
 * Copia a base servida (`data/build/`) para a raiz do site publicado. O site é
 * um build estático: as páginas HTML ficam ao lado dos artefatos JSON, então a
 * API estática continua servida em URLs como `/aparelhos.json` e
 * `/consulta.json` (a ilha baixa esse último). Ver ADR-0003 e ADR-0008.
 */
function artefatosEstaticos() {
  return {
    name: "especialista-do-ar/artefatos-estaticos",
    hooks: {
      /** @param {{ dir: URL }} contexto */
      "astro:build:done": ({ dir }) => {
        if (!existsSync(buildDir) || !statSync(buildDir).isDirectory()) {
          throw new Error(
            `Artefatos publicados ausentes em ${buildDir} — rode \`pnpm build\` antes de construir o site.`,
          );
        }
        cpSync(buildDir, fileURLToPath(dir), { recursive: true });
      },
    },
  };
}

export default defineConfig({
  site: "https://especialista-do-ar.pages.dev",
  output: "static",
  integrations: [react(), sitemap(), pagefind(), artefatosEstaticos()],
  vite: {
    resolve: {
      // Os artefatos publicados são importados como JSON no build do site
      // (`aparelhos.json`, `consulta.json`, `manifest.json`).
      alias: { "@dados": buildDir },
    },
  },
});
