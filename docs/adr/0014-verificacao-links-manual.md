# Verificação de links manual, sem job agendado

**Status:** aceito

O ADR-0010 previa um job **agendado** (GitHub Actions, diário) que verificava os
links das Ofertas. O ADR-0013 planejou publicar o resultado num arquivo versionado
`reports/links-quebrados.md`. Na implementação (ticket 15) ficou claro que nenhuma
das duas vale o custo:

- O arquivo versionado exigiria um PR automático — e um PAT, porque `main` está
  protegida e um PR criado com o `GITHUB_TOKEN` padrão não dispara o CI.
- O job agendado é infraestrutura e notificação (e-mail, resumo de run) para uma
  lista que hoje está **vazia** (`apps/site/ofertas.json` não tem Ofertas) e muda
  raramente. O mantenedor prefere rodar a verificação quando quiser.

**Decisão:** a verificação é **manual e sob demanda**, por `pnpm verificar-links`.
O comando imprime o resultado (URL, loja e motivo de cada link quebrado) no
terminal e **não falha** por link quebrado. Não há workflow agendado, arquivo
versionado, PR automático, issue nem segredo. Quando uma Oferta é corrigida, é um
PR comum em `apps/site/ofertas.json`.

## Considered Options

- **Job agendado + resumo do run** — automatiza a descoberta, mas é infraestrutura
  para uma lista vazia e sem e-mail; rejeitado (o mantenedor não quis Actions para
  isso).
- **Arquivo `reports/links-quebrados.md` via PR automático** — histórico em git,
  mas exigia PAT e PRs de robô; rejeitado.
- **Issue única** — visibilidade ativa, mas o mantenedor não quis depender de
  issues; rejeitado.
- **Verificação manual** (escolhida) — zero infraestrutura; você roda quando
  precisar.

## Consequences

- Nenhum workflow em `.github/workflows/` cuida de links; o CI (`ci.yml`) não roda
  a verificação.
- `pnpm verificar-links` é o único caminho; o resultado aparece no terminal.
- Como não há notificação ativa, quem quiser saber precisa rodar o comando.
- `ofertas.json` inválido ainda falha alto: é erro de configuração, não link
  quebrado.
