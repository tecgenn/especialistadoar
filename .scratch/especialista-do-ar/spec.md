# Spec — Especialista do Ar (MVP: Fases 1–3)

## Problem Statement

Quem precisa saber as características técnicas de um aparelho de ar-condicionado (capacidade, consumo, IDRS, tensão) só tem hoje a exportação bruta de produtos do INMETRO: um CSV com milhares de Linhas da tabela, cabeçalho com BOM e campo entre aspas contendo vírgula, `º`/`°` misturados, tensões como `127-220`, campos numéricos que vêm com texto e muitas linhas sem Dados declarados. Interpretar isso à mão não escala e é um convite a erro.

O consumidor principal — um **Agente de IA** — não tem hoje uma base confiável, versionada e citável para responder perguntas sobre Aparelhos sem que alguém (ou algum agente) tenha de interpretar a exportação bruta a cada consulta.

## Solution

Uma base estruturada e versionada de **Aparelhos**, construída a partir da exportação oficial do INMETRO e consumida tanto como arquivos JSON estáticos quanto por uma API híbrida.

O pipeline registra a **Versão da tabela**, padroniza formato (sem perder o Valor original), sinaliza **Anomalias**, agrupa Linhas da tabela em Aparelhos, valida um contrato (`schema.json` + invariantes de domínio) e gera um **Relatório de revisão** a cada nova versão. A publicação passa por Pull Request — o merge é a publicação (ADR-0004).

O consumidor principal é um Agente de IA; por isso há um **portão de decisão** após a Fase 2: um teste de aceitação com um agente decide se o investimento no site se justifica.

## User Stories

1. Como consumidor da base (Agente de IA), quero consultar um Aparelho por ID, para citar dados oficiais sem abrir o CSV bruto.
2. Como Agente de IA, quero baixar a base inteira como arquivos JSON estáticos, para responder sem depender de uma rota dinâmica.
3. Como Agente de IA, quero saber qual é a Versão da tabela que estou lendo, para citar a proveniência corretamente.
4. Como Agente de IA, quero ver a proveniência de cada dado (Linha da tabela e Registro INMETRO de origem), para nunca confundir Valor oficial com Valor calculado.
5. Como Agente de IA, quero filtrar Aparelhos por capacidade (BTU), para comparar alternativas.
6. Como Agente de IA, quero filtrar Aparelhos por tensão, para achar o que serve na minha instalação.
7. Como Agente de IA, quero buscar Aparelhos textualmente, para encontrar por marca ou modelo.
8. Como Agente de IA, quero pedir um Valor calculado (ex.: custo anual com uma tarifa informada na consulta) e receber junto a fórmula e as entradas usadas, para não apresentá-lo como dado do INMETRO.
9. Como Agente de IA, quero comparar dois Aparelhos lado a lado, para decidir entre eles.
10. Como Agente de IA, quero que o caminho usado em cada resposta (estático ou dinâmico) seja logado, para que se saiba se o Worker se justifica.
11. Como operador do pipeline, quero ingerir uma nova exportação como snapshot raw imutável com sha256 e data de obtenção, para versionar sem sobrescrever nada.
12. Como operador do pipeline, quero que a ingestão seja idempotente por conteúdo, para rodar o build duas vezes sem duplicar dados.
13. Como operador do pipeline, quero que diferenças apenas de formato (casing, unidades-no-texto, `º`/`°`, tensão `127-220`, coerção numérica) sejam resolvidas por regra, para não tratar isso como exceção.
14. Como operador do pipeline, quero que o Valor original seja preservado ponta a ponta, para que o Valor oficial difira dele só por padronização de formato.
15. Como operador do pipeline, quero que valores fora do padrão virem uma Anomalia visível, para não derrubar o build nem esconder o sinal.
16. Como operador do pipeline, quero aplicar uma Exceção manual com motivo e fonte registrados, para ser a única forma de alterar conteúdo à mão.
17. Como revisor humano, quero ver um Vínculo sugerido e confirmá-lo, para que ele só passe a valer como identidade após aprovação de uma pessoa.
18. Como revisor humano, quero que um Vínculo confirmado guarde o par sugerido e quem confirmou, para manter a auditoria.
19. Como revisor humano, quero um Relatório de revisão a cada nova Versão da tabela, classificando novos, alterados, Ausentes, Anomalias novas e Vínculos sugeridos.
20. Como revisor humano, quero que um Aparelho que perdeu os Dados declarados não seja marcado como Ausente, e que o histórico registre que ele já teve dados.
21. Como revisor humano, quero que a causa de uma Ausência não seja presumida no relatório, para não inventar descontinuação/cancelamento.
22. Como revisor humano, quero publicar via Pull Request com o Relatório de revisão anexado, para revisar antes de ir ao ar.
23. Como mantenedor, quero que o CI rode build, validação e testes e bloqueie o merge em caso de falha.
24. Como mantenedor, quero que o Windows seja não-bloqueante e o Linux a referência, para controlar o custo de minutos de runner.
25. Como visitante do site, quero navegar um catálogo de Aparelhos com página por aparelho, para descobrir modelos.
26. Como visitante do site, quero buscar e filtrar de forma interativa, para achar o aparelho certo.
27. Como visitante do site, quero ver Ofertas (links de afiliado) por aparelho, sem que elas se misturem aos dados técnicos.
28. Como mantenedor, quero um job que verifique se as Ofertas continuam válidas, para não exibir links quebrados.
29. Como admin (pós-MVP), quero revisar e publicar por uma interface, para não depender de PR manual.
30. Como consumidor comercial, quero entender o acesso e eventuais limites por IP, para usar a base de forma previsível.

## Implementation Decisions

- **Fonte canônica:** a exportação CSV do INMETRO, não o PDF publicado — ver ADR-0001.
- **Stack:** TypeScript ESM sobre Node 24, monorepo pnpm workspaces, Vitest, `csv-parse`, `@sinclair/typebox` + `ajv`, Biome — ver ADR-0002.
- **API híbrida:** parte estática em arquivos JSON (sem Worker/cota) + Worker dinâmico em `/api/v1/...` sobre o dataset embutido — ver ADR-0003.
- **Publicação:** via Pull Request; merge é a publicação — ver ADR-0004.
- **Pipeline:** módulos `ingest`, `normalize`, `anomalias`, `group`, `validate`, `diff/report`, encadeados pelo orquestrador `build` — ver `docs/agents/architecture.md`.
- **Identidade do Aparelho:** marca + unidade interna + unidade externa (ou o campo Modelo quando as unidades não vêm separadas); tensão fora da identidade (bivolt é um só Aparelho). Cada marca é um Aparelho distinto.
- **Base servida:** só Aparelhos com Dados declarados; os demais seguem no histórico.
- **Artefatos de saída:** `aparelhos.jsonl`/`aparelhos.json`, `registros.jsonl`, `schema.json`, `manifest.json`, `anomalias.jsonl`, `excecoes-manuais.jsonl`, `vinculos-confirmados.jsonl` e o Relatório de revisão.
- **Fontes de detalhe:** `docs/prd.md`, `docs/agents/architecture.md` e `docs/adr/` — este issue é um resumo; não os duplica.

## Testing Decisions

- **O que é um bom teste:** verifica apenas comportamento externo — os artefatos gerados e o Relatório de revisão — não detalhes internos de implementação.
- **Seam única (a mais alta possível):** rodar o `build` ponta a ponta sobre o CSV versionado e snapshotar golden os artefatos (`registros.jsonl`, `aparelhos.jsonl`, `anomalias.jsonl`) e o Relatório de revisão. Preferir essa seam a seams por módulo; testes unitários isolados só quando a seam ponta-a-ponta não cobrir uma regra específica.
- **Módulos cobertos por essa seam:** `ingest`, `normalize`, `anomalias`, `group`, `validate`, `diff/report` — exercitados pela saída do build.
- **Prior art:** Vitest com snapshots golden de JSONL e do relatório (ADR-0002); Node 24 executa TS direto para o CLI.
- **Cenário crítico de regressão:** rodar o build duas vezes sobre o mesmo conteúdo não duplica nada (idempotente por conteúdo).
- **Invariantes que falham o build:** identidade única, só Aparelhos com Dados declarados na base servida, proveniência presente.

## Out of Scope

- Fase 4 — Admin (pós-MVP).
- Billing / API paga (cobrança fica para depois, atrás de um portão de pagamento).
- Código de barras como chave de identidade (fica no raw, sem uso por ora).
- Reingestão do PDF publicado (removido do projeto — ver ADR-0001).

## Further Notes

- **Termos de uso comercial do plano gratuito da Cloudflare** precisam ser confirmados antes de qualquer monetização.
- **`docs/prd.md` é a fonte de verdade do "porquê"** (fases, portão de decisão, perguntas abertas). Este é a porta de entrada no tracker; em caso de divergência, o PRD e os ADRs prevalecem.

## Origin

Migrado da issue #13 do GitHub (https://github.com/tecgenn/especialistadoar/issues/13) em 2026-10-14, ao mover o tracker deste repositório para markdown local.
