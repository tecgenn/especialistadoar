# Classe e Situação entram no contrato público da base servida

**Status:** aceito

A tabela de Aparelhos do site precisa de duas informações que a base servida não
carrega: a **Classe** (faixa A a F que o INMETRO declara) e a **Situação** (se o
Aparelho tem Registro INMETRO ativo). A Classe existe no CSV bruto, na coluna
"Faixa de Classificação", e é descartada hoje; a Situação sai dos status dos
Registros, que a base já guarda. A decisão é incluir as duas **no contrato da base
servida** (`aparelhos.jsonl`/`.json` e `schema.json`) e projetá-las no
`consulta.json`, em vez de calculá-las só no site.

- **Classe** é lida da coluna oficial, por Linha, e fica em `dados` de cada
  Variante (`classe: string | null`), como os demais Dados declarados. Nunca é
  recalculada a partir do IDRS: classe e IDRS não andam juntos entre tipos de
  aparelho, e uma regra nossa daria ao site um número que não é Valor oficial.
- **Situação** fica no Aparelho (`situacao`): `ativo` quando ao menos um dos seus
  Registros INMETRO tem status Ativo, `inativo` caso contrário.

O contrato é consumido por Agentes, então acrescentar campo é barato, mas tirar
depois quebra quem já lê. É por isso que a decisão merece registro.

## Considered Options

- **Calcular a Classe a partir do IDRS** — rejeitada: a Classe depende do tipo de
  aparelho, e a referência pública que analisamos mostra Classe A com IDRS 5,7 ao
  lado de Classe B com 6,9. Recalcular criaria um dado que o INMETRO não declarou.
- **Só no `consulta.json`, fora da base servida** — rejeitada: o `consulta.json` é
  uma projeção. A fonte de verdade é a base servida, e o Agente que baixa
  `aparelhos.json` ficaria sem Classe nem Situação.
- **Situação só derivada no navegador** — rejeitada: criaria duas definições de
  "ativo" (o site e o Agente), que é o mesmo problema que o ADR-0016 evitou com a
  Marca de catálogo.
- **Classe no Aparelho, não na Variante** — rejeitada: a coluna é por Linha e as
  Variantes podem divergir (hoje 100 Aparelhos têm IDRS diferente entre
  Variantes). Escolher uma delas descartaria dado em silêncio.

## Consequences

- `aparelhos.jsonl`, `aparelhos.json` e `schema.json` mudam em **todos** os
  Aparelhos (campos novos, nulos quando a Linha não traz Classe). Os `id`s e as
  URLs das fichas não mudam.
- O portão de reprodutibilidade do CI exige que `data/build` seja regenerado e
  commitado junto com o código.
- `docs/agentes.md` documenta os dois campos e a semântica de `situacao`.
- Uma Classe fora de A a F não falha o build: o valor é guardado normalizado
  (aparado, em maiúsculas), porque o dado é do INMETRO e a Anomalia é o lugar de
  sinalizar o que parecer estranho (ADR-0017).
