# Consumindo a base — guia para Agentes

Este documento é para um **Agente (consumidor)** — uma ferramenta de IA, um
programa ou uma pessoa — que quer responder perguntas sobre aparelhos de
ar-condicionado usando a base do Especialista do Ar, sem interpretar a exportação
bruta do INMETRO. O vocabulário do domínio (Aparelho, Variante, Linha da tabela,
Registro INMETRO, Anomalia, Valor oficial, Valor calculado…) está em `CONTEXT.md`
— use esses termos nas respostas.

## Regra de acesso: estático primeiro

**Comece pelos arquivos estáticos.** Eles são baratos, cacheáveis e não têm cota.
As rotas dinâmicas `/api/v1` existem como **fallback** (busca textual, comparação,
Valor calculado) e estão sujeitas a limite por IP.

Registre **o caminho usado em cada resposta** (estático ou dinâmico): é isso que
revela se o Worker se justifica (ver o portão da Fase 2 em
`docs/aceitacao/portao-fase-2.md`).

## Parte estática — arquivos JSON

Base publicada no Cloudflare Pages: **`https://especialista-do-ar.pages.dev/`**.

| Arquivo | O que traz | Use para |
|---|---|---|
| `manifest.json` | A Versão da tabela atual (hash, data de obtenção, origem, contagem de Linhas) | Citar a **proveniência** de qualquer resposta |
| `aparelhos.json` | A base servida completa (array de Aparelhos, com Variantes, Dados declarados, `linhas` e `registros`) | Consulta por ID e detalhe técnico |
| `consulta.json` | Dataset enxuto: por Aparelho, `id`, `marca`, `modelo`, `tipo`, `capacidadesBtu` e `tensoes` | Filtrar/buscar antes de buscar o detalhe |
| `schema.json` | JSON Schema do contrato de Aparelho | Validar o formato |
| `registros.jsonl` | As Linhas da tabela normalizadas (uma por Linha, com o Valor original) | Proveniência: voltar da Linha ao dado cru |
| `anomalias.jsonl` | Anomalias por Linha da tabela (campo, valor original, tipo) | Sinalizar dados suspeitos — não são erros fatais |
| `aparelhos.jsonl`, `excecoes-manuais.jsonl`, `vinculos-confirmados.jsonl` | Mesmas informações em JSON Lines / curadoria publicada | Streaming e auditoria |

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

# Filtrar/buscar localmente sobre o dataset enxuto (sem Worker, sem cota)
curl -s https://especialista-do-ar.pages.dev/consulta.json \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const itens=JSON.parse(d);console.log(itens.filter(i=>i.marca==='ELGIN'&&i.tipo==='Split Piso-teto').length)})"
```

O módulo de consulta isomórfico (`@especialista-do-ar/api/consulta`) implementa
esses filtros sobre o `consulta.json`: `marca` e `tipo` (texto, sem diferenciar
maiúsculas), `btu` (a capacidade nominal casa com qualquer Variante do Aparelho),
`tensao` (a voltagem casa com qualquer Variante) e `q` (busca textual sobre marca,
modelo e tipo). Um filtro em branco equivale a não filtrar.

## Parte dinâmica — `/api/v1` (fallback)

Worker: **`https://especialista-do-ar-api.tecgenn.workers.dev/api/v1`**.
Consumida só por Agentes — o site não chama estas rotas.

| Rota | Parâmetros | Devolve |
|---|---|---|
| `GET /search` | `q`, `marca`, `tipo`, `btu`, `tensao` | `{ resultados: ItemConsulta[], total }` |
| `GET /comparar` | `ids=<id>,<id>` (ao menos dois) | `{ aparelhos: Aparelho[] }` — `404` se algum id não existir |
| `GET /valor-calculado` | `id`, `tarifa` (R$/kWh, > 0) e, opcional, `tensao` | `{ id, marca, modelo, resultados, aviso }` |

**Limite por IP:** 60 requisições por 60 s. Ao estourar, a resposta é `429` com
`Retry-After: 60` — espere e repita; não insista. Prefira a parte estática a o
tempo todo.

```bash
curl -s "https://especialista-do-ar-api.tecgenn.workers.dev/api/v1/search?marca=ELGIN&tipo=Split%20Piso-teto"
curl -s "https://especialista-do-ar-api.tecgenn.workers.dev/api/v1/comparar?ids=ap-4693b862644d,ap-b0e771cbc5a3"
curl -s "https://especialista-do-ar-api.tecgenn.workers.dev/api/v1/valor-calculado?id=ap-4693b862644d&tarifa=0.95"
```

## Regras de citabilidade

- **Valor oficial** é o dado que veio da tabela do INMETRO, depois só das regras
  de padronização de formato. Cite-o como dado do INMETRO.
- **Valor calculado** é derivado (ex.: custo anual = `consumoAnualKwh × tarifa`).
  Sempre apresente junto a **fórmula** e as **entradas** usadas, e deixe claro que
  **não** é um Valor oficial. A rota `valor-calculado` já devolve `formula`,
  `entradas` e `aviso` — não os descarte.
- **Anomalia** é um sinal, não um erro: um campo que deveria ser numérico e veio
  com texto, ou com múltiplos números. O valor original é preservado; quem
  consulta decide como tratar.
- **Ausente** (um Aparelho de uma versão anterior que sumiu) não presume causa, e
  **Aparelho sem dados declarados** é um estado — não trate nenhum dos dois como
  "produto removido/cancelado".
- Toda resposta deve citar a **Versão da tabela** (`manifest.json`) de onde veio.

## Onde aprofundar

- Terminologia e conceitos: `CONTEXT.md`
- O que está publicado e por quê: `docs/agents/architecture.md` e `docs/adr/`
- O portão de decisão da Fase 2 (teste de aceitação): `docs/aceitacao/portao-fase-2.md`
