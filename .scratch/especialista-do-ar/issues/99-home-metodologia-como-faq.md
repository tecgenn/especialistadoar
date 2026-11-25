# 99 — Metodologia e INMETRO como FAQ (clique para abrir)

**What to build:** a seção "Metodologia e INMETRO" deixa de ser um texto longo exposto. Cada tópico vira um `<details>` nativo (clique para abrir), igual ao FAQ existente. O mesmo texto é preservado, e o JSON-LD `FAQPage` continua intacto. Fonte em mono para notas, sem promessa de economia.

**Blocked by:** None — can start immediately.

**Skills:** `design-taste-frontend` — `references/copy.md` (preservar o texto editorial) e `references/sections.md`. `impeccable` — `reference/typeset.md` (fonte mono nas notas de fonte) e `reference/craft-floor.md`. `ui-ux-pro-max` — `"faq accordion heading" --domain ux` e `"native details disclosure accessibility" --domain ux`.

**Status:** done

- [x] Metodologia convertida em `<details>` nativos (clique para abrir)
- [x] Mesmo texto editorial preservado
- [x] JSON-LD `FAQPage` continua idêntico em conteúdo
- [x] Fontes em mono para notas de fonte
- [x] Sem promessa de economia nem recomendação de compra
- [x] Testes de build conferem `<details>` fechados e conteúdo do FAQPage
- [x] `DESIGN.md` atualizado no mesmo commit (decisão final e termos relacionados revisados; `impeccable detect` e testes doc↔código conferidos)

## Comments

**Implementação (2026-11-21):** os oito parágrafos da metodologia viraram oito `<details class="home-tema">` nativos, fechados por padrão, com o tópico em `h3` dentro do `summary` — a mesma interação do FAQ, sem JavaScript. O texto editorial foi movido palavra por palavra, com os `<strong>` e o link para `/assistente/` intactos; só nasceram os oito títulos (De onde vêm os dados, O recorte da tabela, IDRS e Classe energética, Condições de ensaio, Vigência da classificação, Aparelhos Inverter, Simulador e Assistente, O que é estimativa). O CSS compartilha a regra de `summary`, marcador `+`/`−` em mono, alvo de 44 px e foco do FAQ (`.home-pergunta`/`.home-tema`), mas o corpo do `<details>` mantém a fonte de leitura em vez da tipografia de interface do FAQ, porque ali o papel é explicar. A nota **Fontes** fica fora dos `details`, em mono, sempre visível. O `FAQPage` não mudou: ele descreve `PERGUNTAS_FREQUENTES`, não a metodologia. `DESIGN.md`, `.scratch/especialista-do-ar/spec-fase12.md` e `docs/agents/architecture.md` registraram a decisão. Testes: 769/769, `pnpm typecheck`, `pnpm lint` (0 erros, 28 warnings pré-existentes), `pnpm build` reproduzindo os artefatos e `pnpm build:site` com 2.236 páginas. `impeccable detect` na home: 23 achados, todos `cramped-padding` estruturais já documentados (os oito novos são o mesmo padrão das seções com hairline). Browser: oito temas fechados, Enter abre o primeiro com o texto visível, foco âmbar de 2 px, resumo de 49 px, corpo em Source Serif, fontes em Azeret Mono e 0 px de overflow em 320/390/768/1440 px.
