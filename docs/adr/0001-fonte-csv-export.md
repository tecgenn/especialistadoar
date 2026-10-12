# Fonte da base: a exportação CSV do INMETRO, não o PDF publicado

**Status:** aceito

Usamos a exportação CSV de produtos do INMETRO como fonte canônica da base, e
não o PDF publicado. O CSV é um superconjunto: cobre ativos, cancelados e
inativos, inclui o código de barras, e é uma tabela plana pronta para ingestão.
O PDF lista apenas os ativos e é um layout de múltiplas colunas com células
mescladas, inviável de reparsear de forma confiável a cada versão. Como todo
ciclo de atualização traz um novo CSV, esse também é o formato sustentável do
fluxo.

## Considered Options

- **PDF publicado** — oficial, porém só-ativos, difícil de extrair e sem código de barras.
- **CSV export** (escolhido) — superconjunto, organizado, e é o formato do fluxo de atualização.

## Consequences

- O PDF fica fora do projeto. Um registro presente só no PDF (ex.: `011622/2023`, TCL) não entra na base.
- As ~4.000 linhas sem dados técnicos passam a existir na camada versionada, exigindo o estado `Aparelho sem dados declarados`.
