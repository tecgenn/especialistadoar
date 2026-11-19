# 17 — Análises: índice editorial

**What to build:** o índice de Análises vira uma mesa editorial, não uma lista de cards: o primeiro artigo em destaque com imagem real e resumo, os demais em linhas com data, título, marca/modelo e capacidade. A rota continua condicional — sem Análise publicada, ela não existe.

**Blocked by:** 03 — Primitivos de interface e ícones.

**Skills:** `design-taste-frontend` — `SKILL.md` + `references/sections.md`, `references/photos.md`. `impeccable` — `reference/typeset.md`.

**Status:** ready-for-agent

- [ ] O H1, o lead e o comportamento condicional da rota são preservados (sem Análise, `getStaticPaths` devolve vazio e a rota não entra no menu nem no sitemap).
- [ ] O primeiro artigo é um destaque com imagem real, título, resumo, data e link; os demais são linhas de régua com metadata em mono.
- [ ] Nenhuma Análise, imagem ou dado é inventado; o conteúdo vem do mesmo carregador.
- [ ] Cada item linka para o artigo e, quando aplicável, para a ficha do Aparelho.
- [ ] No celular, a lista empilha em uma coluna, a imagem mantém proporção fixa e os alvos têm 44 px.
- [ ] O visual usa a mesma coluna de leitura/shell do resto do site e não cria uma linguagem nova.
- [ ] O teste de build confere a rota e os links; a suíte continua verde.
