# Spec — Fase 4: Observabilidade e aposentadoria do Worker

**Status:** done

## Problem Statement

Após o MVP (Fases 1–3) restam três atritos:

1. O **Worker dinâmico** (`/api/v1`) não tem evidência de necessidade (ADR-0009) e é
   peso morto no CI/CD: mais um deploy, uma permissão de token e uma superfície de
   rate-limit.
2. O **Relatório de revisão** é anexado a **todo** PR, gerando e-mail de "0 novos /
   0 alterados" a cada PR — quando as Versões da tabela mudam só ~2–3×/ano.
3. Não há como ver o **tráfego do site** nem saber **qual Oferta quebrou** de forma
   fácil.

## Solution

A Fase 4 é **observabilidade + limpeza**, não uma UI de admin — o conteúdo continua
no git, editado por PR comum (ADR-0013):

- **Aposentar o Worker dinâmico** (ADR-0011). O site já não o usava; `valor-calculado`
  vira **fórmula documentada**.
- **Trilha dupla de CI/CD** (ADR-0012): o Relatório de revisão só roda em PR que
  traz nova Versão da tabela (`data/raw/`); PRs de código/site ficam silenciosos.
- **Observabilidade** (ADR-0013): **Cloudflare Web Analytics** para o tráfego humano;
  **links quebrados** verificados **manualmente** (`pnpm verificar-links`, sem job
  agendado, e-mail, PR ou issue; ADR-0014); acesso do Agente **adiado** até haver
  domínio próprio.

## User Stories

1. Como mantenedor, quero que o Worker dinâmico deixe de existir, para remover
   deploy, permissão e limite sem função.
2. Como Agente, quero ainda poder calcular um custo estimado, para não perder a
   única capacidade dinâmica com uso real — agora como fórmula documentada.
3. Como mantenedor, quero receber o Relatório de revisão só quando uma nova Versão
   da tabela entra, para não ser avisado de "tudo 0".
4. Como mantenedor, quero saber qual Oferta quebrou sem depender de e-mail, para
   corrigir quando eu quiser.
5. Como mantenedor, quero ver o tráfego do site, para entender o uso.

## Implementation Decisions

- **Aposentadoria do Worker** — remover `packages/worker`; tirar o deploy do
  `publish.yml`; remover a permissão `Workers Scripts: Edit` do token e a §2.6 do
  `ci-cd-setup.md`; documentar a fórmula do Valor calculado. Ver ADR-0011.
- **Trilha dupla de CI/CD** — condicionar o job `report` a `data/raw/**`; a
  publicação continua via PR (ADR-0004). Ver ADR-0012.
- **Observabilidade** — Cloudflare Web Analytics (humano); links quebrados
  verificados à mão por `pnpm verificar-links`, sem arquivo/PR/issue e sem falhar.
  Ver ADR-0013 e ADR-0014.
- **Fora de escopo:** cobrança/API paga; medição do acesso do Agente (exige domínio
  próprio); blog/artigos (Fase 5); qualquer UI de admin.

## Testing Decisions

- **Aposentadoria:** `pnpm lint`, `typecheck`, `test`, `build`, `build:site` verdes;
  `data/build`/`reports` inalterados (gate de reprodutibilidade); nenhuma referência
  a `api/v1` no repositório ou nos workflows.
- **Trilha dupla:** um PR sem mudança em `data/raw/` não gera comentário de
  Relatório; um PR que adiciona `data/raw/*.csv` gera.
- **Links quebrados:** `pnpm verificar-links` imprime a lista (URL, loja, motivo) e
  não sai com código 1 por link quebrado (coberto no teste puro
  `verificacao-links`); não há workflow.

## Out of Scope

- Admin/UI (o "admin" da Fase 4 colapsa em observabilidade — ADR-0013).
- Blog/artigos e marketing (Fase 5).
- Domínio próprio e medição do acesso do Agente.

## Further Notes

- ADRs: 0011 (Worker), 0012 (trilha dupla), 0013 (observabilidade), 0014
  (verificação de links manual).
- Docs atualizadas: `CONTEXT.md`, `docs/prd.md`, `docs/agents/architecture.md`,
  `docs/agents/ci-cd-setup.md`, `docs/agentes.md`, `README.md`.

## Origin

Sessão de `grill-with-docs` de 2026-10-18 (Fase 4 do PRD).
