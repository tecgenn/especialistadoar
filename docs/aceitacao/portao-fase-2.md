# Portão da Fase 2 — teste de aceitação com um Agente

Portão de decisão da Fase 2 (PRD, "Teste de aceitação com agente"): **um Agente
responde sozinho, sem humano no meio, usando só a base**. O resultado decide se o
projeto segue para o site (ticket #11) ou se a API é reavaliada antes.

## Como foi rodado

- **Data:** 2026-10-17.
- **Versão da tabela servida:** `ba3e2a66c5a089e02323fd07784da1a5400d2d11d4242159d7ae6efbb6e47407`
  (exportação de 2026-10-12, 7474 Linhas).
- **Agente:** uma sessão nova, **sem acesso ao gabarito** e sem o código-fonte do
  pipeline/worker. Recebeu só `docs/agentes.md` (como consumir a base) e
  `docs/aceitacao/perguntas.md` (as 10 perguntas).
- **Acesso:** a base **publicada** — estático em `https://especialista-do-ar.pages.dev/`
  e dinâmico em `https://especialista-do-ar-api.tecgenn.workers.dev/api/v1`.
  Regra: começar pelo estático; `/api/v1` só como fallback.
- **Prova:** `perguntas.md` tem as perguntas; o gabarito (com as respostas
  conferidas contra `data/build/`) fica em `gabarito.json` e é verificado por
  `packages/api/test/portao-fase-2.test.ts`.

## Resultado: 10/10 (critério: ≥ 8/10) — PASSOU

| # | Pergunta (resumo) | Caminho usado | Acerto |
|---|---|---|---|
| 1 | Versão da tabela (data, Linhas, hash) | estático (`manifest.json`) | ✅ |
| 2 | Total de Aparelhos e Anomalias | estático (`consulta.json` + `anomalias.jsonl`) | ✅ |
| 3 | Aparelho por ID + Registro + Linha | estático (`aparelhos.json`) | ✅ |
| 4 | Quantos Split Cassete | estático (`consulta.json`) | ✅ |
| 5 | Quantos 127 V / bivolt | estático (`consulta.json`) | ✅ |
| 6 | Quantos ELGIN Split Piso-teto | estático (`consulta.json`), confirmado no dinâmico (`/search`) | ✅ |
| 7 | Bivolt é um ou dois Aparelhos; Variantes | estático (`aparelhos.json` + `consulta.json`) | ✅ |
| 8 | Comparar consumo anual/IDRS de dois Aparelhos | estático (`aparelhos.json`) | ✅ |
| 9 | Custo anual estimado (tarifa R$ 0,95/kWh) | **dinâmico** (`/valor-calculado`) | ✅ |
| 10 | Anomalia da Linha 892 | estático (`anomalias.jsonl`) | ✅ |

Sem intervenção humana. Todas as respostas vieram com proveniência (Aparelho,
Registro INMETRO, Linha da tabela e a Versão da tabela). Os detalhes extras que o
Agente citou (linhas e registros do GREE; Linha/Registro do DAIKIN) foram
conferidos contra a base e batem.

## O caminho usado, em números

- **9 de 10** perguntas foram respondidas **só com o estático**.
- **1** exigiu o **dinâmico**: o custo anual estimado, porque a rota
  `/valor-calculado` é a que devolve **fórmula, entradas e o aviso** de que não é
  Valor oficial (o cálculo `818 × 0,95` seria reproduzível à mão, mas a resposta
  correta inclui esses metadados).
- Houve **1 chamada dinâmica extra** apenas como *confirmação* (pergunta 6).
- As rotas `/search` e `/comparar` **não foram necessárias** para nenhuma
  resposta: o `consulta.json` (estático) cobre filtros e busca.

## Decisão

**Passou. O projeto segue para o site (ticket #11).**

Registro honesto do que o portão mostrou, para orientar a Fase 3 e o tamanho do
Worker:

1. **A base estática sozinha respondeu 9/10** — inclusive filtros (marca, tipo,
   BTU, tensão) e busca, via `consulta.json`. O `consulta.json` publicado é, para
   um Agente, tão bom quanto o `/search` do Worker.
2. O **Worker se justificou por pouco**: só o `valor-calculado` foi usado, e por
   causa dos metadados (fórmula + entradas + aviso), não do cálculo em si.
3. Portanto: **manter o Worker**, mas tratá-lo como *calculadora determinística +
   fallback*, não como o caminho principal. Se numa próxima rodada do portão o
   `valor-calculado` também for dispensável, o Worker **encolhe** (o PRD prevê
   isso). `/search` e `/comparar` seguem disponíveis para Agentes, mas sem
   evidência de necessidade até aqui.

Este é o resultado que destrava o ticket #11 (site em Astro). O portão pode ser
re-executado quando a API mudar, atualizando o relatório.

## Anexo — evidência da rodada

Respostas que o Agente entregou (resumidas) e o comando exato que produziu cada
dado, para o 10/10 ser auditável sem depender da palavra de quem conduziu.

| # | Resposta do Agente | Caminho e comando |
|---|---|---|
| 1 | Versão da tabela obtida em **2026-10-12**, **7474 Linhas**, hash `ba3e2a66…b6e47407`, arquivo `raw/inmetro-export-2026-10-12.csv` | `estático` — `curl …/manifest.json` |
| 2 | **2460** Aparelhos e **15** Anomalias | `estático` — `.length` de `consulta.json`/`aparelhos.json`; `wc -l` de `anomalias.jsonl` |
| 3 | KENNEDY, `KEN01F12INT - KEN01F12EXT`, Split Hi-Wall; Registro `003694/2023` (Ativo); Linha 445 | `estático` — `aparelhos.json` (find por id) |
| 4 | **316** Split Cassete | `estático` — filtro em `consulta.json` |
| 5 | **124** em 127 V; **20** bivolt (19×`[127,220]`, 1×`[220,380]`) | `estático` — filtro em `consulta.json` |
| 6 | **31** ELGIN Split Piso-teto | `estático` (`consulta.json`), conferido no `dinâmico` (`/search`) |
| 7 | Um só Aparelho; atende **127 e 220 V**; **3 Variantes** (1 sem tensão, 220 V e 127 V) | `estático` — `aparelhos.json` + `consulta.json` |
| 8 | KENNEDY **818 kWh/ano**, IDRS **3,5**; DAIKIN **350 kWh/ano**, IDRS **8,3** → **DAIKIN consome menos** | `estático` — `aparelhos.json` |
| 9 | **R$ 777,10/ano** (`consumoAnualKwh × tarifa`; entradas: tarifa 0,95, consumo 818); não é Valor oficial | `dinâmico` — `curl …/api/v1/valor-calculado?id=ap-4693b862644d&tarifa=0.95` |
| 10 | Linha 892 — campo `Carga do Fluido Refrigerante (g)`, valor `640g / 600g / 690g`, tipo `valor_multiplo` | `estático` — `anomalias.jsonl` |

O acesso dinâmico foi ao Worker publicado:
`https://especialista-do-ar-api.tecgenn.workers.dev/api/v1` (2 chamadas no total,
muito abaixo do limite de 60 req/60 s).
