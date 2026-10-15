# Dados declarados por Variante, tensão fora da identidade do Aparelho

**Status:** aceito

A identidade do Aparelho é marca + unid. interna + unid. externa (ou Modelo
quando as unidades não vêm separadas) e **exclui a tensão** — um Aparelho bivolt
continua sendo um só. Por isso os Dados declarados não cabem num único registro
por Aparelho: eles são carregados em **Variantes**, cada uma uma combinação de
tensão + Dados declarados com as Linhas da tabela que a produziram. Quando duas
Linhas do mesmo Aparelho e da mesma tensão divergem (por exemplo, capacidade
nominal diferente), elas viram Variantes distintas em vez de serem fundidas — a
base nunca escolhe um valor em silêncio. A base servida inclui todo Aparelho com
Dados declarados, **sem filtrar por Status do Modelo**; o rótulo de status não
decide o que é servido.

## Considered Options

- **Variantes por tensão** (escolhida) — preserva o bivolt como um Aparelho e
  mantém as divergências visíveis, sem perda silenciosa.
- **Um Dados declarados por Aparelho** — colapsa as tensões; um valor teria que
  ser escolhido arbitrariamente.
- **Fundir capacidades divergentes** (pegar a primeira ou a maior) — descarta
  dado do INMETRO sem sinalizar, o que colide com a promessa de não interpretar
  a exportação por conta própria.
- **Filtrar por Status do Modelo** — descartaria Aparelhos válidos com base num
  rótulo que não mede a completude dos dados.

## Consequences

- `aparelhos.jsonl` traz um array `variantes` por Aparelho; o `schema.json` exige
  `variantes` e a proveniência (`linhas` + `registros`).
- A exportação de 2026-10-12 rende 2460 Aparelhos com Dados declarados a partir
  de 2881 Linhas; o restante permanece em `registros.jsonl`.
- Consumidores escolhem a Variante de interesse pela tensão (ou comparam todas)
  em vez de ler um único bloco de Dados declarados.
- Divergências de capacidade aparecem como Variantes extras no artefato, em vez
  de sumirem.
