/**
 * Fonte única do diretório da coleção `analises`, usada pelo
 * `src/content.config.ts` e pelo glue de leitura. `ANALISES_BASE` permite que o
 * teste de build aponte para uma fixture fora do conteúdo publicado.
 *
 * O `base` do loader precisa ser uma URL `file:` — o Astro resolve o valor com
 * `new URL(base, root)`, e um caminho absoluto do Windows seria lido como scheme
 * (`C:`). Por isso o diretório é resolvido aqui e devolvido como file URL.
 */
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const EXTENSAO_ANALISES = ".mdx";

export const PADRAO_ANALISES = `**/*${EXTENSAO_ANALISES}`;

export function baseDeAnalises(): string {
  return pathToFileURL(
    resolve(
      process.cwd(),
      process.env.ANALISES_BASE ?? "./src/content/analises",
    ),
  ).href;
}

/**
 * Zero Análises é um estado válido — mas a content layer trata coleção vazia
 * como ausente e emite um warning de configuração a cada `getCollection`. Este
 * guarda evita a chamada nesse caso (o diretório só tem `.gitkeep`).
 */
export function temArquivosDeAnalise(): boolean {
  return readdirSync(fileURLToPath(baseDeAnalises()), {
    recursive: true,
    withFileTypes: true,
  }).some(
    (entrada) => entrada.isFile() && entrada.name.endsWith(EXTENSAO_ANALISES),
  );
}
