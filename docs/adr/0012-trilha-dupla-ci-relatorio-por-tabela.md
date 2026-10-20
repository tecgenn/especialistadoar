# Duas trilhas de CI/CD: o Relatório de revisão só em nova Versão da tabela

**Status:** aceito

O CI anexava o **Relatório de revisão** a **todo** Pull Request (job `report` do
`ci.yml`), o que gera e-mail a cada PR mesmo quando nada na tabela mudou ("0
novos, 0 alterados, 0 Ausentes"). As **Versões da tabela** mudam ~2–3×/ano; todo o
resto é código/site.

O `report` passa a rodar **só quando o PR traz uma nova Versão da tabela** — um
arquivo novo em `data/raw/`. A mesma esteira ganha **duas portas**:

- **Trilha Código/Site (frequente):** lint, typecheck, testes, `build:site`,
  deploy do site. **Sem** Relatório de revisão.
- **Trilha Tabela (raro):** novo CSV em `data/raw/` → pipeline → dataset →
  Relatório de revisão → deploy (site + base embutida).

A publicação continua **via PR** — o merge é a publicação (ADR-0004).

## Considered Options

- **Filtrar o job `report` por caminho** (`data/raw/**`) — escolhida: mesma
  esteira, portas diferentes, sem duplicar setup/gate.
- **Workflow separado só para a tabela** — duplicaria setup e o portão de PR.
- **Manter o Relatório em todo PR** — é exatamente o incômodo que motivou a
  decisão.

## Consequences

- PRs de código/site deixam de receber o comentário do Relatório (fim do e-mail
  "tudo 0").
- O gate de reprodutibilidade (`data/build`/`reports` batem com um build novo) e o
  `build` continuam rodando em **todo** PR.
- A trilha Tabela é disparada por um PR que adiciona
  `data/raw/inmetro-export-<data>.csv` e regenera `data/build` + `reports`.
- Passos manuais/serviços envolvidos ficam em `docs/agents/ci-cd-setup.md`.

## Implementação

**Atualizado em 2026-10-19 (ticket 14).** O filtro é aplicado pelo job `changes`
do `ci.yml`: ele lista os arquivos do PR pela API
(`github.rest.pulls.listFiles`) e marca `nova-versao` quando há um arquivo
**adicionado** (`status: added`) que casa `^data/raw/.+\.csv$`. O job `report`
passa a exigir esse flag (`needs.changes.outputs.nova-versao == 'true'`). O
`build`, o `build:site`, os testes e o gate de reprodutibilidade continuam
rodando em todo PR. Detalhes no runbook §1.4.
