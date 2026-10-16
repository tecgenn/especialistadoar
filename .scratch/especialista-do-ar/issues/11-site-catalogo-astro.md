# 11 — Site (catálogo Astro)

**What to build:** O catálogo público em Astro como **build estático**: páginas de
detalhe pré-renderizadas para cada Aparelho, mais **uma única ilha** de consulta
(filtros combináveis + busca textual) que roda **no cliente** — ver ADR-0008.

- A base é consumida numa cópia de build (`aparelhos.json` para as páginas de
  detalhe, `consulta.json` para a ilha); o site não é a fonte da verdade.
- A ilha reusa o módulo de consulta isomórfico (ticket 08) sobre `consulta.json`.
- O estado dos filtros e da busca vive na URL (`?marca=&tipo=&btu=&tensao=&q=`),
  para o resultado ser compartilhável e favoritável.
- O site **não** chama o Worker `/api/v1` — ele serve Agentes (ADR-0008).
- Conteúdo do site indexável (Pagefind fica para o conteúdo do site).

**Blocked by:** 10 — Documentação para agentes e teste de aceitação (portão). O portão precisa passar antes de investir no site.

**Status:** ready-for-agent

- [ ] O catálogo Astro publica os Aparelhos com Dados declarados (detalhe pré-renderizado).
- [ ] Busca e filtro interativos funcionam na única ilha, usando o módulo de consulta (08).
- [ ] O estado da consulta é refletido na URL e restaurado ao abrir o link.
- [ ] O site não realiza chamadas ao Worker.
- [ ] O conteúdo do site é indexável.
- [ ] O site é publicado como build estático.

## Origin

Migrado da issue #11 do GitHub (https://github.com/tecgenn/especialistadoar/issues/11) em 2026-10-14, ao mover o tracker deste repositório para markdown local.
