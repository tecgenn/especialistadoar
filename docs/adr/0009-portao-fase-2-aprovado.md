# Portão da Fase 2 aprovado; o Worker fica como calculadora e fallback

**Status:** aceito

O **teste de aceitação da Fase 2** (o portão de decisão do PRD) foi rodado em
2026-10-17: um Agente fresco, sem o gabarito e sem o código-fonte, respondeu às 10
perguntas de `docs/aceitacao/perguntas.md` **só pela base publicada**. Resultado:
**10/10** (critério ≥ 8/10), sem intervenção humana. O relatório e a evidência
estão em `docs/aceitacao/portao-fase-2.md`; o gabarito, reconferido contra
`data/build/` pelo teste `packages/api/test/portao-fase-2.test.ts`, em
`docs/aceitacao/gabarito.json`.

**Decisão:** o projeto **segue para o site** (fase 3). A parte dinâmica da API
**não é o caminho principal**: 9 das 10 perguntas foram respondidas só com os
arquivos estáticos (inclusive filtros por marca/tipo/BTU/tensão e busca, via
`consulta.json`), e a única que exigiu `/api/v1` foi o **Valor calculado** — pelo
que a rota acrescenta (fórmula, entradas e o aviso de que não é Valor oficial),
não pelo cálculo em si.

## Considered Options

- **Seguir para o site mantendo o Worker inteiro** — rejeitada como leitura: o
  portão não deu evidência de necessidade para `/search` nem `/comparar`.
- **Seguir para o site e encolher o Worker já** — prematura: o Valor calculado
  ainda se justifica e é a única parte dinâmica usada; encolher agora removeria
  uma capacidade com uso real.
- **Reavaliar a API antes do site** — rejeitada: o critério de aprovação foi
  cumprido; reavaliar sem falha seria adiar a fase 3 sem motivo.

## Consequences

- **Fase 3 destravada** (site em Astro, ticket #11).
- O **Worker permanece**, mas com o papel rebaixado a *calculadora determinística
  + fallback*. `/search` e `/comparar` seguem disponíveis para Agentes, porém
  **sem evidência de necessidade** — candidatos naturais a sair se uma próxima
  rodada do portão mostrar que nem o Valor calculado é preciso. O PRD já prevê
  esse encolhimento.
- O **`consulta.json` publicado** é, para um Agente, tão bom quanto o `/search`:
  a busca/filtro estáticos cobrem o caso. Novos recursos de consulta devem
  começar pelo lado estático.
- O portão é **re-executável**: quando a API mudar de forma relevante, roda-se de
  novo e atualiza-se `docs/aceitacao/portao-fase-2.md`.
