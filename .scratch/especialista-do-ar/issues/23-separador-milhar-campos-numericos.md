# 23 — Separador de milhar nos campos numéricos

**What to build:** o parser numérico (`parseNumero`) passa a ter uma regra
explícita para o separador de milhar pt-BR (ponto entre grupos de três dígitos),
sem confundir com decimal (`3.50`, `0,95`). Hoje `1.000` é lido como `1`: numa
exportação futura isso publicaria uma capacidade de 1 BTU/h e — desde o ticket
20 — ainda a sinalizaria como `valor_implausivel`, escondendo a causa real
(formato) atrás de um sintoma de plausibilidade. A regra vale para **todas as
colunas numéricas**, não só BTU/h.

**Contexto:** descoberto na revisão do ticket 20. O caso concreto é uma Linha com
`Capacidade de Refrigeração Nominal (Btu/h)` = `1.000`, que hoje vira `1`.

**Correção de premissa (triagem, 2026-10-23):** o ticket dizia que “a Versão
atual da tabela não usa esse formato, então `data/build` não pode mudar”. Isso é
falso: há **uma** ocorrência em coluna numérica —

- Linha `2712` (índice interno; 2713 contando o cabeçalho) — `Carga do Fluido
  Refrigerante (g)` = `1.160`, Midea `42AGVQI24M5 / 38AGVQI24M5`, Aparelho
  `ap-28b4442a7c58`, Registro `006337/2023`.
- Hoje vira `1.16` g; com a regra passa a **`1160` g**. O valor é o correto
  (carga de um split de 24.000 BTU/h; 1,16 g não existe).
- Muda **só** esse campo em `data/build/registros.jsonl` (`oficial`; o `valores`
  original continua `"1.160"`). `aparelhos.json*`, `consulta.json`,
  `schema.json`, `anomalias.jsonl` e `reports/` não mudam (carga não é projetada
  no Aparelho).

## Decisões (triagem, 2026-10-23)

1. **Gramática: pt-BR apenas, determinística.**
   - Ponto seguido de exatamente 3 dígitos = milhar: `1.000` = 1000,
     `12.000` = 12000, `1.234.567` = 1234567.
   - Exceção: parte inteira `0` nunca é milhar — `0.351` = 0.351 (idem `0,351`).
   - Vírgula = decimal: `3,50` = 3.5; combinação pt-BR `1.000,50` = 1000.5.
   - Ponto com 1 ou 2 dígitos depois continua decimal: `3.50` = 3.5,
     `1.16` = 1.16.
   - Formato en-US (`1,000.50`) **não** é suportado: vira `null`.
   - Malformado (`1.00.0`) → `null`, como hoje.
   - Consequência aceita: `3.500` é 3500, não 3.5 — é o significado em pt-BR.
2. **Escopo: todas as 13 colunas numéricas** (Btu/h, W, g, Wh/Wh e kWh). É uma
   regra de parser, não uma regra por coluna; restringir a BTU/h deixaria o
   `1.160` g errado e criaria dois significados para o mesmo texto.
3. **Piso de plausibilidade: `< 6.000` BTU/h** (era `< 1.000`). Depois da
   correção, `1.000` é um parse válido de 1000 BTU/h e escaparia do piso antigo;
   `6.000` é a menor capacidade real da base. Hoje não muda nada: seguem 15
   Anomalias. A Anomalia continua sinalizando, nunca corrigindo.
4. **Valor não interpretável → `null`** (comportamento de hoje), com o original
   preservado em `valores` e a Linha mantida em `registros.jsonl`. Nenhum tipo
   novo de Anomalia: seguem `texto_em_campo_numerico` e `valor_multiplo`.
5. **Anomalia nunca exclui Aparelho** — política registrada no **ADR-0017**.
   Corrigir conteúdo é Exceção manual (com motivo e fonte); corrigir formato é
   regra do parser; detectar é Anomalia + Relatório de revisão.

**Blocked by:** Nenhum.

**Status:** done

- [x] `parseNumero` aplica a gramática acima em todas as colunas numéricas;
      fixture cobre `1.000`, `12.000`, `3.500`, `1.000,50`, `0.351`, `1.160`,
      `3.50` e o formato en-US `1,000.50` (→ `null`).
- [x] `data/build` continua reproduzível byte a byte a partir do raw (gate do
      CI); em relação ao build anterior, só
      `oficial["Carga do Fluido Refrigerante (g)"]` da Linha `2712` muda
      (`1.16` → `1160`); `aparelhos.json*`, `consulta.json`, `anomalias.jsonl` e
      `reports/` ficam idênticos.
- [x] Piso de `valor_implausivel` passa a `< 6.000` BTU/h, sem Anomalia nova na
      Versão atual e com `docs/agentes.md` atualizado.
- [x] Nenhum Aparelho excluído (seguem 2.460) e nenhum tipo de Anomalia novo.
- [x] Regra de formato registrada em `docs/agents/architecture.md` (módulo
      `normalize`).

**Out of scope:** suportar formato en-US; novo tipo de Anomalia para formato não
reconhecido (hoje cai em `valor_multiplo`/`texto_em_campo_numerico`); as ~26
Linhas com inconsistência na coluna de Watts; demais famílias de marca.

## Comments

- **2026-10-22 — aberto na revisão do ticket 20.** O ticket 20 fechou a regra de
  plausibilidade com o parser atual; este ticket trata a causa (formato), não o
  sintoma. Não bloqueia os tickets 21 e 22.
- **2026-10-23 — triagem (`/grill-with-docs`).** Decisões fechadas acima. A
  triagem encontrou a ocorrência de `1.160` g, que invalida o critério “nada
  muda em `data/build`” e passa a ser uma correção de dado aceita no PR. A
  política de não excluir Aparelhos por Anomalia foi registrada no **ADR-0017**.
