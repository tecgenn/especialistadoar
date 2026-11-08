# 48 — Documentação, SEO e Validação Completa da Fase 9

**What to build:** Fechamento da Fase 9: atualização de `docs/agents/architecture.md`, `README.md`, `CONTEXT.md` e `docs/agents/project-state.md`; confirmação da contagem de páginas (2.232, com a nova `/assistente/`); e execução da suíte completa para garantir que build, testes, typecheck e lint estão verdes, com `data/build` e `reports` reproduzíveis byte a byte.

**Blocked by:** 41 — Assistente: Motor Determinístico e Wizard; 42 — Assistente: CTAs com Aparelhos Analisados; 43 — Tabela: Setas, Coluna Tipo e Layout; 44 — Tabela: Selo "Análise" e Bloco "Com análise"; 45 — Filtros: Classe A–F e Layout Compacto; 46 — Home Nova; 47 — Análise: Banner de Transparência e CTAs em Cartão

**Status:** ready-for-agent

- [ ] `docs/agents/architecture.md` descreve o motor do Assistente, a ilha e o fluxo de dados no build
- [ ] `README.md` cita o Assistente, a rota `/assistente/` e o comando de validação da fase
- [ ] `CONTEXT.md` mantém os termos **Assistente**, **Recomendação do Assistente** e **Aparelho analisado** atualizados (selo "Análise", bloco "Com análise", aviso de afiliado fora da tabela)
- [ ] `docs/adr/0020-assistente-deterministico.md` presente e referenciado
- [ ] `docs/agents/project-state.md` registra a Fase 9 concluída e o próximo passo
- [ ] `pnpm build` reproduz `data/build` e `reports` byte a byte
- [ ] `pnpm build:site` gera 2.232 páginas (as 2.231 anteriores + `/assistente/`)
- [ ] `pnpm test` — todos os testes Vitest passam (pipeline + api + site)
- [ ] `pnpm typecheck` — `tsc --noEmit` OK em todo o monorepo
- [ ] `pnpm lint` — `biome check` OK
- [ ] Verificações manuais:
  - [ ] `/assistente/` abre, completa as 5 telas e mostra o resultado
  - [ ] Recarregar e compartilhar a URL do resultado preservam as respostas
  - [ ] Os CTAs do resultado levam à tabela filtrada e aos analisados
  - [ ] `/aparelhos/` mostra Tipo, as duas setas, o selo "Análise" e o bloco "Com análise"
  - [ ] Filtros cabem sem barra de rolagem interna e as classes aparecem como A–F
  - [ ] A home exibe os nove blocos e o FAQ
  - [ ] Uma Análise exibe o banner e os 3–4 CTAs em cartão
- [ ] Nenhum artefato de `data/build` ou `reports` alterado fora do esperado
