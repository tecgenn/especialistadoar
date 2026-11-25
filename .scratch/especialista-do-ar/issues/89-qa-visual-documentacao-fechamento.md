# 89 — QA visual, documentação e fechamento

**What to build:** a validação final do redesign e a carbonização das decisões. Todas as rotas são revisadas em cinco larguras, com screenshots lado a lado e checklist por página; o `DESIGN.md` é atualizado para refletir o que foi construído; um ADR registra a direção visual e o sistema; arquitetura, estado do projeto e README são sincronizados; a validação completa fecha a fase.

**Blocked by:** 86 — SEO e metadados; 87 — Acessibilidade; 88 — Performance; 90 — Navegação: prefetch seletivo; 110 — Fechamento da home (a série #92–#110 precisa estar `done`).

**Skills:** `design-taste-frontend` — `scripts/gate.mjs`, `scripts/shoot.mjs`, `scripts/consistency.mjs` + `references/gate.md`. `impeccable` — `reference/critique.md`, `reference/document.md`. `ui-ux-pro-max` — `"design system audit" --domain ux`.

**Status:** ready-for-agent

- [ ] Screenshots de `/`, `/aparelhos/`, uma ficha, `/comparar/?ids=…`, `/assistente/`, `/analises/`, o artigo, as três institucionais e o 404 em 390, 768, 1024, 1440 e 1920 px, arquivados e revisados.
- [ ] No catálogo, a tabela permanece tabela em 390, 768 e 1024 px, com rolagem horizontal contida, colunas de seleção/Modelo fixas e nenhuma rolagem horizontal da página; nenhum cartão de Aparelho aparece no lugar de uma linha.
- [ ] O prefetch seletivo do ticket 90 está ativo nos links de navegação e ausente na tabela e nos links de Oferta; nenhuma requisição duplicada no console.
- [ ] Checklist por página: hierarquia, densidade, estados, teclado, mobile, impressão (ficha), zero overflow, zero placeholder, zero promessa de preço/economia.
- [ ] Nenhuma página parece um template genérico; nenhum elemento decorativo sem função; as Cores de Classe são as únicas cores saturadas de dado e não resta resquício da escala térmica removida no #102.
- [ ] `DESIGN.md` reflete o sistema construído (tokens, componentes, medidas reais), sem divergir do CSS.
- [ ] ADR-0024 registra a direção "Instrumento de climatização", o sistema de três vozes, a paleta azul-frio do #92, o acento ciano do #102, o simulador do hero como única leitura de escala (a régua de capacidade foi removida no #94) e as decisões de contenção (sem dark mode, sem biblioteca de animação).
- [ ] `docs/agents/architecture.md`, `docs/agents/project-state.md` e `README.md` descrevem o novo sistema e a validação.
- [ ] `CONTEXT.md` ganha entradas para os termos que o redesign fixa na interface — "Instrumento de climatização", "Simulador do hero" e "Datasheet" — na linguagem ubíqua do projeto, sem renomear termos existentes. "Régua de capacidade" não entra: o componente saiu no #94.
- [ ] `PRODUCT.md` é revisado para continuar descrevendo o produto real depois do redesign, sem prometer o que a fase não entrega.
- [ ] `pnpm build && pnpm build:site && pnpm lint && pnpm typecheck && pnpm test` passam; `data/build` e `reports` sem diff; a contagem de páginas inclui o 404.
- [ ] Os tickets 66–90 e 92–110 estão `done` e não há pendência aberta; riscos residuais são registrados.
