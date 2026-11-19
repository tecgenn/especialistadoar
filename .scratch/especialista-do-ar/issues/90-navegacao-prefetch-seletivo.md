# 90 — Navegação: prefetch seletivo de links

**What to build:** reduzir a latência percebida entre páginas sem router de cliente e sem framework novo. O site continua MPA; o Astro pré-carrega o HTML de links de navegação intencionais no hover/foco, e a tabela do catálogo fica de fora para não disparar dezenas de requisições quando o mouse atravessa as linhas.

**Blocked by:** 67 — Shell global; 86 — SEO e metadados.

**Skills:** `design-taste-frontend` — `references/perf.md`. `ui-ux-pro-max` — `"link prefetch navigation" --domain ux`. Conferir a API de `prefetch` do Astro instalado via `context7` antes de editar a config.

**Status:** ready-for-agent

- [ ] `prefetch` habilitado em `apps/site/astro.config.mjs` com `defaultStrategy: 'hover'`; `prefetchAll` permanece no padrão `false`, então só links marcados são pré-carregados.
- [ ] `data-astro-prefetch` aplicado só a links de navegação deliberada: header, rodapé, CTAs da home, breadcrumbs, cartões de Análise, "Comparar" e "Ver ficha".
- [ ] Nunca há prefetch nas linhas da tabela do catálogo, em links externos, `mailto:` ou links de Oferta/afiliado; onde a composição puder herdar o atributo, usar `data-astro-prefetch="false"` explícito.
- [ ] Um hover típico na tabela não gera requisição; um hover no menu gera no máximo uma por destino, sem duplicar.
- [ ] O custo é medido e registrado: bytes do script de prefetch do Astro, número de requisições em uma navegação típica e ausência de erro no console.
- [ ] A navegação não piora LCP, CLS ou INP; o orçamento do ticket 88 continua respeitado.
- [ ] Nenhuma URL, conteúdo, dado ou ilha muda; `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build:site` permanecem verdes.
