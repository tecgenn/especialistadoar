# Anomalia sinaliza; nunca exclui o Aparelho

**Status:** aceito

A dúvida reaparece a cada exportação nova: diante de um punhado de Aparelhos com
dado suspeito, por que não removê-los da base servida em vez de corrigi-los ou
sinalizá-los? A decisão é que **Anomalia nunca exclui Aparelho**. A base servida
reflete o que a tabela publicou; o que corrige é a camada certa, conforme a
natureza do problema: **formato** se corrige no parser (regra determinística,
aplicada a toda Versão); **conteúdo** se corrige por Exceção manual, com motivo e
fonte (ADR-0006); o que não se sabe corrigir vira **Anomalia**, com o valor
original preservado, e aparece no Relatório de revisão. Excluir seria reescrever
o conjunto de Linhas da tabela: o Aparelho existe; o consumidor é que deixaria de
vê-lo.

## Considered Options

- **Excluir quando a anomalia atinge poucos Aparelhos (1–3)** — rejeitada. O
  número de afetados não diz nada sobre a natureza do erro: o ticket 20 corrigiu
  **5 Aparelhos**. Além disso, excluir cria **Ausentes fantasma** no diff
  seguinte (e "novos" no outro), quebra `id`/URL de fichas indexadas e joga fora
  dado bom junto com o campo suspeito.
- **Corrigir automaticamente por plausibilidade/heurística** — rejeitada: corrige
  sem rastro de quem decidiu o quê e esvazia o papel da Anomalia como sinal. O
  ADR-0006 exige motivo e fonte para alterar conteúdo.
- **Quarentena (marcar o Aparelho, mantendo-o na base)** — adiada: não há caso que
  justifique um campo novo no contrato, e "Aparelho sem dados declarados" já
  cobre o Aparelho sem dado utilizável.
- **Não sinalizar** — rejeitada: um número truncado é numericamente válido e
  voltaria em silêncio na próxima Versão.

## Consequences

- O ticket 20 corrigiu 5 Linhas por Exceção manual e **não** excluiu nenhum dos
  2.460 Aparelhos.
- `valor_implausivel` e os demais tipos de Anomalia só sinalizam; o detector não
  descarta nem corrige nada.
- **Ausência de dado não é Anomalia**: um Aparelho sem nenhum Dado declarado
  continua sendo o estado "Aparelho sem dados declarados" — fora de
  `aparelhos.json`, presente em `registros.jsonl`.
- Um valor não interpretável vira `null` **e** Anomalia; a Linha e o Aparelho
  permanecem (a não ser que não sobre nenhum Dado declarado).
- Erros novos da exportação se resolvem por **regra de formato** no parser ou por
  **Exceção manual** — nunca por corte de Aparelho.
- Fecha a política levantada na triagem do ticket 23 (separador de milhar).
