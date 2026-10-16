# 08 — Módulo de consulta compartilhado com filtros e busca

**What to build:** Um módulo de consulta **isomórfico** (lógica pura, **sem**
dependências de Node), num *entry point* próprio de `packages/api`, sobre o
artefato derivado `data/build/consulta.json`: filtros por campo (capacidade em
BTU, tensão) e busca textual. É importado pela **ilha do site** (navegador) e pelo
**Worker** (Agente) — ver ADR-0008.

- O entry puro fica separado da leitura de arquivo (`estatica.ts` permanece
  Node-only): nada de `fs` pode entrar no bundle do site.
- MiniSearch fica só para busca textual sobre os Aparelhos; o Pagefind fica para o conteúdo do site.
- Filtros por campo não dependem de busca textual.
- O mesmo módulo serve os dois ambientes, para não duplicar lógica.
- O `pnpm build` passa a emitir `data/build/consulta.json` (dataset enxuto,
  ~350 KB), coberto pelo gate de reprodutibilidade.

**Blocked by:** 07 — API estática (arquivos JSON).

**Status:** ready-for-agent

- [ ] O build emite `data/build/consulta.json` e o gate de reprodutibilidade o cobre.
- [ ] Um único módulo de consulta (entry isomórfico) é usado pela ilha e pelo Worker.
- [ ] O entry de consulta não importa Node nem `fs`.
- [ ] Filtro por capacidade (BTU) retorna o conjunto correto.
- [ ] Filtro por tensão retorna o conjunto correto.
- [ ] Busca textual (MiniSearch) encontra Aparelhos por texto.
- [ ] Testes cobrem o módulo nos dois ambientes de consumo.

## Origin

Migrado da issue #8 do GitHub (https://github.com/tecgenn/especialistadoar/issues/8) em 2026-10-14, ao mover o tracker deste repositório para markdown local.
