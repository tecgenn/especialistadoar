# 23 — Separador de milhar nos campos numéricos

**What to build:** o parser numérico passa a ter uma regra explícita para ponto de
milhar (`1.000`, `12.000`), sem confundir com decimal (`3.50`, `0,95`). Hoje
`parseNumero` só trata a vírgula como separador decimal e lê `1.000` como `1`: numa
exportação futura isso publicaria uma capacidade de 1 BTU/h e — desde o ticket 20 —
ainda a sinalizaria como `valor_implausivel`, escondendo a causa real (formato) atrás
de um sintoma de plausibilidade. A Versão atual da tabela não usa esse formato, então
`data/build` e `reports` não podem mudar; o que muda é o comportamento diante de uma
exportação nova.

**Contexto:** descoberto na revisão do ticket 20. O caso concreto é uma Linha com
`Capacidade de Refrigeração Nominal (Btu/h)` = `1.000`, que hoje vira `1`.

**Decisões em aberto (grill):**

- `1.000` é mil ou decimal? E `3.500`, `12.000`, `1.000,50`?
- A regra é “ponto seguido de exatamente três dígitos é milhar” ou uma lista de
  formatos aceitos (pt-BR e en-US)?
- A ambiguidade genuína (`3.500`) deve ser **recusada** (virar Anomalia) em vez de
  adivinhada?
- Vale para **todas** as colunas numéricas (`IDRS`, consumo, capacidades) ou só para
  as que exibem BTU/h?
- O que acontece com `registros.jsonl`/`aparelhos.json` quando o valor não é
  interpretável — `null` (comportamento de hoje) continua sendo a resposta?
- A regra de `valor_implausivel` herda o parser corrigido por construção; confirmar
  que o limite de 1.000 BTU/h continua fazendo sentido depois da correção.

**Blocked by:** Nenhum — pode ser avaliado já.

**Status:** needs-triage

- [ ] A regra de separador de milhar está decidida e registrada (formato aceito,
      ambiguidade e o que fazer com valor não interpretável).
- [ ] `parseNumero` (ou o normalizador) aplica a regra em todas as colunas numéricas,
      coberta por fixture com `1.000`, `12.000`, `3.50` e `1.000,50`.
- [ ] A Versão atual continua produzindo `data/build` e `reports` byte a byte, sem
      nenhum Aparelho ou Anomalia novo.
- [ ] Uma capacidade `1.000` deixa de ser lida como `1` e deixa de gerar
      `valor_implausivel` por engano.

## Comments

- **2026-10-22 — aberto na revisão do ticket 20.** O ticket 20 fechou a regra de
  plausibilidade com o parser atual; este ticket trata a causa (formato), não o
  sintoma. Não bloqueia os tickets 21 e 22.
