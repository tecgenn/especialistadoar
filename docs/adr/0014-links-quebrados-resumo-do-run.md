# Links quebrados no resumo do run, sem arquivo versionado

**Status:** aceito

O ADR-0013 previa `reports/links-quebrados.md` como o lugar onde se vê *qual* link
quebrou. Na implementação (ticket 15), o arquivo versionado se mostrou cerimônia
demais: `main` exige PR + check `ci (ubuntu-latest)`, então manter o arquivo
atualizado exigiria um PR automático — e um PAT, porque PR criado com o
`GITHUB_TOKEN` padrão não dispara o CI.

A verificação em si já existe e é **independente de commits**: o workflow
agendado roda diariamente (06:00 UTC) e por `workflow_dispatch`, lê
`apps/site/ofertas.json` e faz `fetch` em cada URL. O que faltava era só **onde
publicar o resultado** sem criar PR/issue/e-mail.

**Decisão:** o job publica o resultado no **resumo do run** (tabela com URL, loja e
motivo), emite um `::warning::` com a contagem e **não falha** por link quebrado.
Não há arquivo commitado, PR automático, issue nem segredo novo. O PR só aparece
quando uma Oferta é corrigida no `ofertas.json`.

## Considered Options

- **Arquivo versionado via PR automático** — histórico em git, mas exige PAT e
  gera PRs de robô; rejeitado (o gatilho era só guardar o resultado).
- **Falhar o job (e-mail)** — era o ruído que o ADR-0013 remove; rejeitado.
- **Issue única** — visibilidade ativa, mas o mantenedor não quis depender de
  issues; rejeitado.
- **Resumo do run** (escolhida) — zero infraestrutura, visível na aba Actions,
  sem notificação ativa.

## Consequences

- O resultado vive na aba **Actions → Verificar links das Ofertas**, no resumo do
  run; não há notificação ativa — é preciso abrir o run para ver.
- O histórico acompanha a retenção dos runs do GitHub Actions (não é permanente,
  como um arquivo em git seria).
- A verificação continua diária e também pode ser rodada à mão com
  `pnpm verificar-links`.
- `ofertas.json` inválido ainda falha alto: é erro de configuração, não link
  quebrado.
