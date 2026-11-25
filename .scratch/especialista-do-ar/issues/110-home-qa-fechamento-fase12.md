# 110 — Fechamento da home: QA visual, documentação e contrato

**What to build:** fechar a revisão da home com a mesma régua dos tickets de QA da fase: navegador real em cinco larguras, foco e teclado, contraste, `axe`, `impeccable detect`, suíte completa e build que reproduz `data/build` e `reports` byte a byte. No mesmo commit, sincronizar os documentos normativos com o que foi entregue: `DESIGN.md` (hero, simulador, aparelhos, análises, FAQ/metodologia, rodapé, cor e ícones), `docs/agents/architecture.md` (estrutura da home sem cobertura nem carrossel), `CONTEXT.md` (Oferta com dois níveis de divulgação), ADR-0023 (revisão da divulgação), a nota de revisão da `spec-fase12.md` e o `project-state.md`.

**Blocked by:** 102–109.

**Relação com o #89:** este ticket fecha a série da home (#92–#110). O #89 fecha a Fase 12 inteira, depende dele e cobre catálogo, ficha, comparação, Assistente, Análises, institucionais e 404. Nenhum dos dois substitui o outro.

**Skills:** `impeccable` — `reference/audit.md`, `reference/document.md` e `reference/craft-floor.md`. `design-taste-frontend` — `references/gate.md` (checklist final). `seo-audit` para conferir que o H1 novo não derrubou título, description e `FAQPage`.

**Status:** ready-for-agent

## Navegador

- [ ] 320, 390, 768, 1024 e 1440 px sem overflow horizontal (`scrollWidth === innerWidth`)
- [ ] Ordem da home: hero (H1, lead, CTA, simulador) → aparelhos em destaque → análises → FAQ → metodologia → rodapé
- [ ] CTA do hero ancora no simulador e o foco cai no controle de área, não no topo
- [ ] Simulador: 20 m²/tarde devolve 18.000 BTU/h; a ação primária abre `/assistente/` com `area=20&sol=tarde`; a secundária abre `?btu=18000`
- [ ] Seletor de capacidade alterna os painéis por teclado e mantém `aria-pressed` correto; sem JavaScript, todos os painéis aparecem
- [ ] FAQ e metodologia abrem/fecham por teclado, mantêm o índice e não deslocam a coluna vizinha de forma estranha
- [ ] Nenhum carrossel de Análises, nenhuma contagem “Cobertura da base”, nenhum “Ver os de 12.000 BTU/h”
- [ ] Aviso de afiliado no `title` do logo e no nome acessível do link, com `rel="sponsored nofollow noopener"`; divulgação por extenso só no rodapé e nos Termos
- [ ] Foco ciano de 2 px visível em giz, papel e superfície escura; nenhum foco invisível
- [ ] `axe` sem violações novas; contraste AA em texto e 3:1 em componentes
- [ ] `prefers-reduced-motion`: nenhuma entrada, nenhuma transição de altura

## Código e testes

- [ ] `grep -rn -- "--sinal\|--escala-\|âmbar" apps/site/src apps/site/test` volta vazio (documentos históricos podem citar a decisão, o CSS não)
- [ ] Nenhum import morto de carrossel, cobertura, `totalNaCapacidade`, `linkDaTabela` ou `contagensPorCapacidade`
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm lint` (0 erros) verdes
- [ ] `pnpm build` reproduz `data/build` e `reports` sem alteração; `pnpm build:site` gera as mesmas 2.236 páginas
- [ ] `impeccable detect` na home publicada sem categoria nova; os `cramped-padding` estruturais pré-existentes podem permanecer
- [ ] Screenshots antes/depois em 1440 e 390 anexados ao comentário do ticket

## Documentação

- [ ] `DESIGN.md` sem nenhuma regra que contradiga o entregue: cor de foco, H1, simulador, seletor, grade de análises, acordeão compacto, rodapé e ícones
- [ ] `docs/agents/architecture.md`: home sem cobertura/carrossel, com seletor e grade; componentes novos (`CabecalhoDeSecao`, `LogoLoja`, `HomeDestaques`)
- [ ] `CONTEXT.md`: **Oferta** descreve o marcador mínimo + rodapé/Termos, sem o parágrafo de três níveis
- [ ] `docs/adr/0023-divulgacao-de-oferta-de-afiliado.md`: revisão registrada (dois níveis, marcador a 0,625 rem, logo da loja sem promessa de preço)
- [ ] `.scratch/especialista-do-ar/spec-fase12.md`: revisão de 2026-11-22 com a ordem nova da home e o link para os tickets 102–110
- [ ] `docs/agents/project-state.md`: Frontier e Completed atualizados; tickets 102–110 `done`
- [ ] Ticket 110 com `Status: done` e o commit com `Ticket: 110` na última linha

## Notas

- Este ticket não introduz visual novo: ele prova o que os outros entregaram e corrige o que a documentação ainda descreve como âmbar, carrossel ou cobertura.
- O H1 visual mudou, mas o contrato de SEO não: título da aba, description, canonical e `FAQPage` continuam com as mesmas palavras-chave e as mesmas oito perguntas.
