# 08 — Módulo de consulta compartilhado com filtros e busca

**What to build:** Um módulo de consulta compartilhado, consumido tanto pelas listas estáticas quanto pela API dinâmica: filtros por campo (capacidade em BTU, tensão) e busca textual.

- MiniSearch fica só para busca textual sobre os Aparelhos; o Pagefind fica para o conteúdo do site.
- Filtros por campo não dependem de busca textual.
- O mesmo módulo serve os dois modos de consumo, para não duplicar lógica.

**Blocked by:** 07 — API estática (arquivos JSON).

**Status:** ready-for-agent

- [ ] Um único módulo de consulta é usado pelo acesso estático e pelo dinâmico.
- [ ] Filtro por capacidade (BTU) retorna o conjunto correto.
- [ ] Filtro por tensão retorna o conjunto correto.
- [ ] Busca textual (MiniSearch) encontra Aparelhos por texto.
- [ ] Testes cobrem o módulo nos dois modos de consumo.

## Origin

Migrado da issue #8 do GitHub (https://github.com/tecgenn/especialistadoar/issues/8) em 2026-10-14, ao mover o tracker deste repositório para markdown local.
