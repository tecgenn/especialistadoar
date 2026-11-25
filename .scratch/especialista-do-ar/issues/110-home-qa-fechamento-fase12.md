# 110 — Fechamento da home: QA visual, documentação e contrato

**What to build:** fechar a revisão da home com a mesma régua dos tickets de QA da fase: navegador real em cinco larguras, foco e teclado, contraste, `axe`, `impeccable detect`, suíte completa e build que reproduz `data/build` e `reports` byte a byte. No mesmo commit, sincronizar os documentos normativos com o que foi entregue: `DESIGN.md` (hero, simulador, aparelhos, análises, FAQ/metodologia, rodapé, cor e ícones), `docs/agents/architecture.md` (estrutura da home sem cobertura nem carrossel), `CONTEXT.md` (Oferta com dois níveis de divulgação), ADR-0023 (revisão da divulgação), a nota de revisão da `spec-fase12.md` e o `project-state.md`.

**Blocked by:** 102–109.

**Relação com o #89:** este ticket fecha a série da home (#92–#110). O #89 fecha a Fase 12 inteira, depende dele e cobre catálogo, ficha, comparação, Assistente, Análises, institucionais e 404. Nenhum dos dois substitui o outro.

**Skills:** `impeccable` — `reference/audit.md`, `reference/document.md` e `reference/craft-floor.md`. `design-taste-frontend` — `references/gate.md` (checklist final). `seo-audit` para conferir que o H1 novo não derrubou título, description e `FAQPage`.

**Status:** done

## Navegador

- [x] 320, 390, 768, 1024 e 1440 px sem overflow horizontal (`scrollWidth === innerWidth`)
- [x] Ordem da home: hero (H1, lead, CTA, simulador) → aparelhos em destaque → análises → FAQ → metodologia → rodapé
- [x] CTA do hero ancora no simulador e o foco cai no controle de área, não no topo (corrigido neste ticket: o fragmento sozinho só movia o ponto de partida do Tab)
- [x] Simulador: 20 m²/tarde devolve 18.000 BTU/h; a ação primária abre `/assistente/` com `area=20&sol=tarde`; a secundária abre `?btu=18000`
- [x] Seletor de capacidade alterna os painéis por teclado e mantém `aria-pressed` correto; sem JavaScript, todos os painéis aparecem (a produção tem uma capacidade só, então o caso multi-chip foi conferido no build de fixture de duas capacidades)
- [x] FAQ e metodologia abrem/fecham por teclado, mantêm o índice e não deslocam a coluna vizinha de forma estranha
- [x] Nenhum carrossel de Análises, nenhuma contagem “Cobertura da base”, nenhum “Ver os de 12.000 BTU/h”
- [x] Aviso de afiliado no `title` do logo e no nome acessível do link, com `rel="sponsored nofollow noopener"`; divulgação por extenso só no rodapé e nos Termos
- [x] Foco ciano de 2 px visível em giz, papel e superfície escura; nenhum foco invisível
- [x] `axe` sem violações novas; contraste AA em texto e 3:1 em componentes
- [x] `prefers-reduced-motion`: nenhuma entrada, nenhuma transição de altura

## Código e testes

- [x] `grep -rn -- "--sinal\|--escala-\|âmbar" apps/site/src apps/site/test` volta vazio no código (os quatro achados restantes são as asserções negativas que provam a aposentadoria dos tokens em `tokens.test.ts` e `analises-build.test.ts`, mais um comentário histórico)
- [x] Nenhum import morto de carrossel, cobertura, `totalNaCapacidade`, `linkDaTabela` ou `contagensPorCapacidade`
- [x] `pnpm test`, `pnpm typecheck`, `pnpm lint` (0 erros) verdes
- [x] `pnpm build` reproduz `data/build` e `reports` sem alteração; `pnpm build:site` gera as mesmas 2.236 páginas
- [x] `impeccable detect` na home publicada sem categoria nova; os `cramped-padding` estruturais pré-existentes podem permanecer
- [x] Screenshots antes/depois em 1440 e 390 anexados ao comentário do ticket

## Documentação

- [x] `DESIGN.md` sem nenhuma regra que contradiga o entregue: cor de foco, H1, simulador, seletor, grade de análises, acordeão compacto, rodapé e ícones
- [x] `docs/agents/architecture.md`: home sem cobertura/carrossel, com seletor e grade; componentes novos (`CabecalhoDeSecao`, `LogoLoja`, `HomeDestaques`)
- [x] `CONTEXT.md`: **Oferta** descreve o marcador mínimo + rodapé/Termos, sem o parágrafo de três níveis
- [x] `docs/adr/0023-divulgacao-de-oferta-de-afiliado.md`: revisão registrada (dois níveis, marcador a 0,625 rem, logo da loja sem promessa de preço)
- [x] `.scratch/especialista-do-ar/spec-fase12.md`: revisão de 2026-11-22 com a ordem nova da home e o link para os tickets 102–110
- [x] `docs/agents/project-state.md`: Frontier e Completed atualizados; tickets 102–110 `done`
- [x] Ticket 110 com `Status: done` e o commit com `Ticket: 110` na última linha

## Notas

- Este ticket não introduz visual novo: ele prova o que os outros entregaram e corrige o que a documentação ainda descreve como âmbar, carrossel ou cobertura.
- O H1 visual mudou, mas o contrato de SEO não: título da aba, description, canonical e `FAQPage` continuam com as mesmas palavras-chave e as mesmas oito perguntas.

## Comments

**Fechamento (2026-11-24).** QA da home concluído com o site publicado localmente (preview 127.0.0.1:4321) e screenshots anexados em `screenshots/110/` — `antes-1440.png`, `antes-390.png` (build de `23ee195`, a home de antes da série #92–#110) e `depois-1440.png`, `depois-390.png`. As capturas "depois" foram feitas com `prefers-reduced-motion` só para congelar a entrada do hero; o layout é o servido, e a H1 tem 84 px em 1440.

**Navegador.** Zero overflow horizontal em 320/390/768/1024/1440 px (`scrollWidth === innerWidth`). Ordem: hero → Aparelhos em destaque → Análises → FAQ → Metodologia, com o rodapé fora do `main`. CTA do hero leva `#simulador` a 76 px do topo (cabeçalho de 73 px) e o foco cai em `#hero-area` — 25 m² com setas do teclado dão 22.000 BTU/h com `/assistente/?forma=metros&area=25&sol=tarde` e `/aparelhos/?btu=22000`; "Manhã" por teclado recalcula e reescreve o link. Estado padrão: 20 m²/tarde → 18.000 BTU/h, 318 aparelhos (256 Classe A). Seletor: a produção tem uma capacidade (rótulo estático `12.000 BTU/h`, um painel, sem `hidden`); no build de fixture com 9.000 e 12.000 os chips de 44 px ficam na ordem da curadoria e Tab + Enter troca `aria-pressed` e o painel visível, e o HTML servido traz os dois painéis sem `hidden`. FAQ e metodologia: oito itens cada, 57 px fechados, 357 px por seção, índice `01`–`08`; Enter no `summary` abre a linha (57 → 171 px) e só desloca as linhas seguintes, com o vizinho da mesma linha parado em y = 2163. Nenhum carrossel, nenhuma "Cobertura da base", nenhum "Ver os de …".

**Oferta.** Link com `rel="sponsored nofollow noopener"`, `target="_blank"`, `title="link de afiliado"` no `<img>` (alt "Mercado Livre") e nome acessível `Ver oferta — Mercado Livre — link de afiliado`; nenhum aviso como texto visível e um único bloco de Transparência no rodapé.

**Acessibilidade.** `axe` 4.12.1: 0 violações, 1 inconclusivo (`color-contrast` nos `→` `aria-hidden`). Contraste: H1 16,04:1, lead e corpo 6,52:1, índice do FAQ 4,95:1, CTA de Oferta 5,91:1, rodapé 4,88:1 e links do rodapé 9,11:1 sobre `#084D66`. Foco de 2 px com offset 2 px: ciano em giz/papel (CTA, summary, slider, chip) e giz na superfície escura. `prefers-reduced-motion`: `animation-name: none`, opacidade 1 e nenhuma transição em hero, seções e H1.

**Duas correções saíram do QA.** (1) O corpo do FAQ herdava a serifa do `body`, contradizendo `DESIGN.md` e o comentário do CSS, que dizem interface no FAQ e serifa só na metodologia — `.home-pergunta p` passou a declarar `--fonte-interface`, com asserção no seam de build. (2) O CTA do hero só movia o ponto de partida do Tab (`activeElement` continuava `BODY`); `SimuladorHero` agora foca `#hero-area` no `hashchange` de `#simulador`, com `preventScroll` e teste de ilha novo (`simulador-hero.test.tsx`).

**Documentação.** `DESIGN.md` ganhou a regra do foco no hero; `architecture.md` troca as duas menções a âmbar por ciano e lista `CabecalhoDeSecao`/`HomeDestaques`; `CONTEXT.md` registra os dois níveis; o ADR-0023 passou a "dois níveis" com a revisão do #110 (sem marcador de 0,625 rem, badge sem promessa de preço); a spec ganhou a nota de fechamento.

**Checks.** Vitest 777/777 (51 arquivos, com o arquivo novo), `pnpm typecheck` OK, `pnpm lint` 0 erros (29 warnings pré-existentes), `pnpm build` reproduz `data/build`/`reports` byte a byte, `pnpm build:site` 2.236 páginas, `impeccable detect` na home publicada: 19 achados, todos `cramped-padding` estruturais já inventariados, nenhuma categoria nova.
