import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { baseDeAnalises, PADRAO_ANALISES } from "./conteudo/base-analises";

/**
 * Análises editoriais (ver CONTEXT.md e ADR-0015): um arquivo MDX por Análise,
 * ligado a um Aparelho pelo `aparelhoId`. A coleção fica fora da base servida —
 * nada aqui entra em `data/build/`, na API ou na consulta.
 *
 * O diretório vem de `base-analises.ts` (`ANALISES_BASE` permite que o teste de
 * build aponte para uma fixture fora do conteúdo publicado). O schema cobre só
 * tipos e obrigatoriedade; as regras de conteúdo ficam em `src/lib/analises.ts`.
 */
const analises = defineCollection({
  // O id do entry é o caminho do arquivo, **não** o `slug` do frontmatter: o
  // loader padrão usaria o slug como id e duas Análises com slug repetido
  // colapsariam numa só antes de o contrato poder recusá-las.
  loader: glob({
    pattern: PADRAO_ANALISES,
    base: baseDeAnalises(),
    generateId: ({ entry }) => entry.replace(/\.mdx$/, ""),
  }),
  schema: z.object({
    aparelhoId: z.string(),
    slug: z.string(),
    titulo: z.string(),
    descricao: z.string(),
    // O YAML interpreta `data: 2026-10-20` sem aspas como Date; normaliza para
    // a string `YYYY-MM-DD` que o módulo puro valida.
    data: z
      .union([z.string(), z.date()])
      .transform((valor) =>
        valor instanceof Date ? valor.toISOString().slice(0, 10) : valor,
      ),
  }),
});

export const collections = { analises };
