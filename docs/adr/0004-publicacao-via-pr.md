# Publicação da base via Pull Request aprovado

**Status:** aceito

O Relatório de revisão de cada nova Versão da tabela é publicado como um Pull
Request, junto do diff dos artefatos gerados. O **merge é a publicação**: a
revisão humana e o histórico ficam no GitHub, sem UI nem banco de admin na v1.
Nenhuma Versão da tabela vai ao ar sem passar por esse portão.

## Considered Options

- **PR** (escolhido) — reaproveita review + histórico do GitHub, sem infra extra.
- **UI de admin** — adiada para a Fatia 4.

## Consequences

- O CI roda build + validação + testes e anexa o Relatório de revisão ao PR.
- Merge em `main` dispara o deploy (Cloudflare Pages) dos artefatos publicados.

> **Atualizado em 2026-10-19 (ticket 14):** desde o ADR-0012, o Relatório de
> revisão só é anexado quando o PR **adiciona uma nova Versão da tabela**
> (`data/raw/*.csv`); PRs de código/site não o recebem.
