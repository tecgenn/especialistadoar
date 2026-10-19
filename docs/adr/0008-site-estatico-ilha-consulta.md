# Site estático com a consulta no cliente; o Worker serve só Agentes

**Status:** aceito

> **Nota (2026-10-19):** com o ADR-0011 o Worker deixou de existir; a decisão do
> site estático com a ilha isomórfica continua valendo — hoje o entry é importado
> só pela ilha.

O site é um **build estático** (Astro): páginas de detalhe pré-renderizadas para
cada Aparelho e **uma única ilha** para a consulta. Os filtros combináveis e a
busca textual rodam **no cliente**, sobre um dataset enxuto publicado em
`data/build/consulta.json` (~350 KB), com o estado dos filtros na URL. O **site
não chama o Worker**: o Worker `/api/v1` existe apenas para o **Agente
(consumidor)**. O módulo de consulta é **isomórfico** — um *entry point* puro em
`packages/api`, sem dependências de Node, importado tanto pela ilha quanto pelo
Worker — para que filtro e busca tenham uma só definição.

## Considered Options

- **Consulta no cliente** (escolhida) — a base servida é pequena (~350 KB
  enxuta), então buscar e filtrar localmente é instantâneo, não gasta cota do
  Worker e não paga latência de rede por interação; o mesmo módulo ainda serve o
  Worker.
- **Consulta no Worker** — nada iria ao navegador, mas cada interação custaria uma
  ida-e-volta e consumiria cota do plano gratuito com o tráfego do site.
- **Filtros por páginas estáticas (SSG por combinação)** — zero JS, mas não cobre
  busca textual nem combinações arbitrárias; não atende o modelo de consulta
  escolhido.

## Consequences

- Novo artefato derivado `data/build/consulta.json` (dataset enxuto de consulta),
  gerado pelo `pnpm build` e coberto pelo gate de reprodutibilidade. O site baixa
  esse arquivo, não o `aparelhos.json` inteiro (3,2 MB).
- O módulo de consulta vira um *entry point* isomórfico em `packages/api`; a
  leitura de arquivo (`estatica.ts`) permanece Node-only.
- O site não depende do Worker: um Worker fora do ar não derruba o site, e a cota
  gratuita fica reservada aos Agentes.
- O estado da consulta vive na URL (`?marca=&tipo=&btu=&tensao=&q=`), tornando o
  resultado compartilhável e favoritável.
