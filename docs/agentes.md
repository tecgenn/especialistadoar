# Consumindo a base — guia para Agentes

Este documento é para um **Agente (consumidor)** — uma ferramenta de IA, um
programa ou uma pessoa — que quer responder perguntas sobre aparelhos de
ar-condicionado usando a base do Especialista do Ar, sem interpretar a exportação
bruta do INMETRO. O vocabulário do domínio (Aparelho, Variante, Linha da tabela,
Registro INMETRO, Anomalia, Valor oficial, Valor calculado…) está em `CONTEXT.md`
— use esses termos nas respostas.

## Acesso: só arquivos estáticos

A base é **puramente estática**: não há API dinâmica nem limite de requisições.
Todos os dados vêm dos arquivos JSON publicados, que são baratos e cacheáveis. A
única capacidade que exigia cálculo — o **Valor calculado** — virou uma **fórmula
documentada** abaixo.

## Arquivos JSON publicados

Base publicada no Cloudflare Pages: **`https://especialista-do-ar.pages.dev/`**.

| Arquivo | O que traz | Use para |
|---|---|---|
| `manifest.json` | A Versão da tabela atual (hash, data de obtenção, origem, contagem de Linhas) | Citar a **proveniência** de qualquer resposta |
| `aparelhos.json` | A base servida completa (array de Aparelhos, com Variantes, Dados declarados, `linhas` e `registros`) | Consulta por ID e detalhe técnico |
| `consulta.json` | Dataset enxuto: por Aparelho, `id`, `marca` (oficial), `marcaCatalogo`, `modelo`, `tipo`, `funcao` e as listas `capacidadesBtu`, `tensoes`, `classes`, `idrs` e `consumosKwh` | Filtrar/buscar antes de buscar o detalhe |
| `schema.json` | JSON Schema do contrato de Aparelho | Validar o formato |
| `registros.jsonl` | As Linhas da tabela normalizadas (uma por Linha, com o Valor original) | Proveniência: voltar da Linha ao dado cru |
| `anomalias.jsonl` | Anomalias por Linha da tabela (campo, valor original, tipo) | Sinalizar dados suspeitos — não são erros fatais |
| `aparelhos.jsonl`, `excecoes-manuais.jsonl`, `vinculos-confirmados.jsonl`, `marcas-catalogo.jsonl` | Mesmas informações em JSON Lines / curadoria publicada | Streaming e auditoria |

O `id` de um Aparelho tem a forma `ap-<12 hex>` (ex.: `ap-4693b862644d`). Um
Aparelho aponta para uma ou mais `linhas` (o número 1-based da Linha da tabela) e
para um ou mais `registros` INMETRO (`numero`, `status`). A **Versão da tabela** é
a chave de proveniência: sempre cite `manifest.json` na resposta.

`data/build/` é **derivado** (gerado por `pnpm build`) — nunca edite à mão.

### Exemplos

```bash
# Versão da tabela (proveniência)
curl -s https://especialista-do-ar.pages.dev/manifest.json

# Detalhe de um Aparelho por ID
curl -s https://especialista-do-ar.pages.dev/aparelhos.json \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const a=JSON.parse(d).find(x=>x.id==='ap-4693b862644d');console.log(JSON.stringify(a,null,2))})"

# Filtrar/buscar localmente sobre o dataset enxuto (sem servidor, sem cota)
curl -s https://especialista-do-ar.pages.dev/consulta.json \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const itens=JSON.parse(d);console.log(itens.filter(i=>i.marca==='ELGIN'&&i.tipo==='Split Piso-teto').length)})"
```

O módulo de consulta isomórfico (`@especialista-do-ar/api/consulta`) implementa
esses filtros sobre o `consulta.json`: `marca` e `tipo` (texto, sem diferenciar
maiúsculas), `btu` (a capacidade nominal casa com qualquer Variante do Aparelho),
`tensao` (a voltagem casa com qualquer Variante) e `q` (busca textual sobre marca,
marcaCatalogo, modelo e tipo). Um filtro em branco equivale a não filtrar.

### Marca oficial × Marca de catálogo

Cada item traz duas marcas:

- `marca` — a **Marca oficial** do INMETRO, exatamente como está na tabela (e na
  ficha do Aparelho).
- `marcaCatalogo` — a **Marca de catálogo**: o agrupamento curado sob o nome que
  as pessoas procuram. É igual a `marca` quando não há agrupamento.

Na Versão atual, MIDEA agrupa `MIDEA` e `SPRINGER MIDEA` (163 Aparelhos) e
FUJITSU agrupa `FUJITSU/AIRSTAGE` e `AIRSTAGE` (26). O filtro `marca` casa a
`marcaCatalogo` **e** a `marca` oficial, então `marca: "MIDEA"` devolve 163 e
`marca: "SPRINGER MIDEA"` (o valor oficial antigo) devolve os 67 da família;
`q: "fujitsu"` encontra os 26. Use `marcaCatalogo` para agrupar, e `marca` quando
precisar citar o Valor oficial. A curadoria exata está em
`marcas-catalogo.jsonl`.

### Classe

A **Classe** (`classe`, dentro do `dados` de cada **Variante**) é a faixa A a F que
o INMETRO declara na coluna "Faixa de Classificação", por Linha (ADR-0018). É um
**Valor oficial**, aparado e em maiúsculas; uma célula vazia vira `null`. **Nunca**
a recalcule a partir do IDRS: classe e IDRS não andam juntos entre tipos de
aparelho. Variantes podem divergir (a coluna é por Linha); por isso o
`consulta.json` traz `classes` como lista única e ordenada.

A **Situação** não é mais um campo do contrato: derive-a dos `registros` quando
precisar (Ativo quando ao menos um Registro INMETRO tem status Ativo); ela não
aparece no `aparelhos.json` nem no `consulta.json`.

O `consulta.json` também carrega `funcao` e as listas `idrs` e `consumosKwh`
(únicas, ordenadas, ignorando Variantes sem o dado), para filtrar e ordenar a
tabela sem baixar a base completa. `classes`, `idrs` e `consumosKwh` seguem a
mesma regra de `capacidadesBtu`: o valor de qualquer Variante do Aparelho conta.
O sinal de consumo implausível continua em `anomalias.jsonl`; o Aparelho não é
excluído nem ganha um campo `suspeito`.

## Valor calculado — fórmula documentada

Não há endpoint de cálculo: o Valor calculado é feito por você, a partir dos
**Valores oficiais** em `aparelhos.json`. A fórmula e as entradas são fixas:

- **Fórmula:** `valor = consumoAnualKwh × tarifa`
- **Entradas:** o `consumoAnualKwh` de uma **Variante** do Aparelho (kWh/ano) e a
  `tarifa` informada na consulta (R$/kWh, > 0) — a fórmula é fixa, as entradas
  variam por consulta e por Variante.
- **Saída:** o custo anual estimado em R$/ano, por Variante.

Regras:

- O cálculo é por **Variante**, não por Aparelho: um Aparelho bivolt pode ter mais
  de um consumo declarado. Apresente também a **tensão** da Variante usada.
- Se a consulta fixa uma tensão, use só as Variantes cujo `tensao.voltagens`
  contenha esse valor. Uma Variante **sem tensão** não casa com uma tensão pedida.
- `consumoAnualKwh` pode ser `null`: nessa Variante não há cálculo. Se nenhuma
  Variante casar, diga que não há Valor calculado para os parâmetros informados.
- Sempre apresente a **fórmula** e as **entradas** junto do resultado, e deixe
  claro que é um **Valor calculado**, não um Valor oficial do INMETRO.

Exemplo — KENNEDY `ap-4693b862644d`, tarifa R$ 0,95/kWh:

```bash
curl -s https://especialista-do-ar.pages.dev/aparelhos.json \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const a=JSON.parse(d).find(x=>x.id==='ap-4693b862644d');for(const v of a.variantes){const k=v.dados.consumoAnualKwh;if(k!=null)console.log(v.tensao?.voltagens??'sem tensão',k,'kWh/ano → R$',(k*0.95).toFixed(2))}})"
```

Resultado: 818 kWh/ano × 0,95 = **R$ 777,10/ano**.

## Regras de citabilidade

- **Valor oficial** é o dado que veio da tabela do INMETRO, depois só das regras
  de padronização de formato. Cite-o como dado do INMETRO.
- **Valor calculado** é derivado (ex.: custo anual = `consumoAnualKwh × tarifa`).
  Sempre apresente junto a **fórmula** e as **entradas** usadas, e deixe claro que
  **não** é um Valor oficial — ver "Valor calculado — fórmula documentada".
- **Anomalia** é um sinal, não um erro: um campo que deveria ser numérico e veio
  com texto (`texto_em_campo_numerico`), com múltiplos números (`valor_multiplo`) ou
  com um número válido, mas implausível para a coluna (`valor_implausivel`, ex.:
  capacidade nominal abaixo de 6.000 BTU/h ou consumo fora de 10–120 kWh por
  1.000 BTU/h). O valor original é preservado; quem consulta decide como tratar.
- **Ausente** (um Aparelho de uma versão anterior que sumiu) não presume causa, e
  **Aparelho sem dados declarados** é um estado — não trate nenhum dos dois como
  "produto removido/cancelado".
- Toda resposta deve citar a **Versão da tabela** (`manifest.json`) de onde veio.

## Onde aprofundar

- Terminologia e conceitos: `CONTEXT.md`
- O que está publicado e por quê: `docs/agents/architecture.md` e `docs/adr/`
- O portão de decisão da Fase 2 (registro histórico): `docs/aceitacao/portao-fase-2.md`
