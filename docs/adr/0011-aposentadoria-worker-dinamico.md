# Aposentadoria do Worker dinâmico

**Status:** aceito

O ADR-0003 dividiu a API em **estática** (arquivos JSON, sem cota) e **dinâmica**
(Worker em `/api/v1/...`: busca, comparação e Valor calculado). O **portão da
Fase 2** (ADR-0009) já havia mostrado que 9 das 10 perguntas se respondem só com o
estático; o Worker ficou como *calculadora determinística + fallback*, sem
evidência de necessidade para `/search` e `/comparar`. Na revisão da Fase 4 ficou
claro que o único papel que sustentaria o Worker seria **ser o portão de acesso do
Agente** (medir/cobrar o consumo não-navegador). Como cobrar é apenas hipótese e a
API pública estática é um valor central do projeto (grátis, sem cota, o Agente
baixa o `.json` direto), **decidimos remover o Worker**.

`packages/worker` é removido; o deploy do Worker sai do `publish.yml`; a permissão
`Workers Scripts: Edit` sai do token; o limite por IP deixa de existir. A única
superfície pública de dados volta a ser a **API estática** (os arquivos JSON
publicados pelo site). O site já não usava o Worker (ADR-0008).

## Considered Options

- **Remover** (escolhida) — sem função comprovada; menos um deploy, uma permissão
  e uma superfície de rate-limit.
- **Manter como calculadora/fallback** (ADR-0009) — peso morto, sem evidência.
- **Encolher para só `/valor-calculado`** — mantém um deploy inteiro por uma
  fórmula que pode ser documentada.
- **Worker como portão único** (API fechada, com API key) — só se cobrança de
  Agente virar objetivo real; rejeitada agora.

## Consequences

- A rota `valor-calculado` deixa de existir: a **fórmula** e as **entradas** são
  documentadas em `docs/agentes.md` (e ficam candidatas a uma ilha no site depois,
  fora desta fase). O gabarito do portão (`docs/aceitacao/`) passa a referenciar a
  fórmula, não o endpoint.
- O **acesso do Agente** passa a ser o acesso aos `.json` — imensurável pela
  própria API. Mede-se, de modo grosso, pela analytics de zona da Cloudflare
  quando houver domínio próprio (ADR-0013).
- Revê o **ADR-0003** (a parte dinâmica deixa de existir) e **supera o ADR-0009**
  (a "calculadora" sai junto).
- **Restauração:** o pacote existe integralmente em
  `9e68732f63bea4b6d207995645e303082677c202` (HEAD no momento desta decisão; o
  último commit que o *modificou* foi `78a2a0273bda3d9d828b59e48a5c47c8f9c7960b`,
  2026-10-16). Para recuperá-lo:
  `git checkout 9e68732 -- packages/worker`.
- **Remoção (2026-10-19, ticket 13):** o comando acima foi conferido antes da
  remoção (`git ls-tree -r 9e68732 -- packages/worker` lista os seis arquivos do
  pacote). O `wrangler` continua nas devDependencies da raiz porque o deploy do
  **Pages** usa `wrangler-action`.
