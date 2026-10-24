# 30 — Remover a página `/busca/` e o Pagefind

**What to build:** a página `/busca/` repete a busca que o catálogo já tem (marca,
modelo e tipo) e carrega um índice Pagefind de ~11 MB. Ela sai junto com o item de
menu, a integração `astro-pagefind` e a dependência. `/busca/` e `/busca` passam a
redirecionar (301) para `/aparelhos/` por `apps/site/public/_redirects`, para nenhum
link antigo quebrar. Quando houver Análises suficientes, a busca delas entra na
lista de Análises, em ticket próprio.

**Blocked by:** 27 — Página Aparelhos.

**Status:** ready-for-agent

- [ ] `apps/site/src/pages/busca.astro`, a integração em `astro.config.mjs` e a
      dependência `astro-pagefind` (com `pnpm-lock.yaml`) saem; `dist/` não gera
      `pagefind/`.
- [ ] `public/_redirects` redireciona `/busca/` e `/busca` para `/aparelhos/` (301) e
      aparece em `dist/`.
- [ ] Nenhuma referência a Pagefind em código ou testes (`analises-build.test.ts`
      deixa de esperar o índice); a referência histórica nos tickets e specs antigos
      permanece.
- [ ] `docs/agents/architecture.md`, `docs/prd.md` e `README.md` deixam de citar a
      busca por Pagefind.
- [ ] `pnpm build:site` gera as 2.462 páginas (2.460 fichas, `/` e `/aparelhos/`) e o
      `dist` perde ~11 MB; lint, typecheck e testes verdes.
