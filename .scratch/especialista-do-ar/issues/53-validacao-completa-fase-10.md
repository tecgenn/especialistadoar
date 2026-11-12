# 53 — Documentação e Validação Completa da Fase 10

**What to build:** Fechamento da Fase 10: documentação atualizada (arquitetura, README, glossário e estado do projeto), ADR-0021 referenciado e a suíte completa verde, com `data/build` e `reports` reproduzíveis byte a byte. A validação manual percorre as duas portas de entrada da comparação, os estados 0/1/2/3, o limite de 3 na tabela, a preservação de `?ids=` ao filtrar, a tabela central com "Pesquisa avançada" e a vitrine sempre visível com similares.

**Blocked by:** 49 — Comparação: Contrato `ids` e Página `/comparar/`; 50 — Tabela Central: Busca, Pesquisa Avançada e Coluna Análise; 51 — Tabela: Seleção de até 3 Aparelhos para Comparar; 52 — Vitrine "Aparelhos com análise" sempre visível, com similares

**Status:** ready-for-agent

- [ ] `docs/agents/architecture.md` descreve a Comparação, a nova ilha e o contrato `?ids=`
- [ ] `README.md` cita a rota `/comparar/`, a seleção na tabela e o comando de validação da fase
- [ ] `CONTEXT.md` mantém **Comparação**, **Aparelho similar**, **Aparelho analisado** e **Filtros padrão** atualizados
- [ ] `docs/adr/0021-comparacao-de-aparelhos.md` presente e referenciado
- [ ] `docs/agents/project-state.md` registra a Fase 10 concluída e o próximo passo
- [ ] `pnpm build` reproduz `data/build` e `reports` byte a byte
- [ ] `pnpm build:site` gera a nova `/comparar/` e o total de páginas esperado
- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
- [ ] Verificações manuais:
  - [ ] `/comparar/` abre vazia, monta 1, 2 e 3 modelos e compartilha a URL
  - [ ] `/aparelhos/` marca até 3, desabilita o resto e leva a comparação pronta
  - [ ] Mudar filtro, busca e ordenação preserva a seleção; "Limpar filtros" também
  - [ ] A tabela segue a ordenação sem puxar analisados ao topo
  - [ ] Filtrar uma marca sem Análise mantém a vitrine com similares e a legenda
  - [ ] "Pesquisa avançada" abre pela URL, o resumo mostra o 220 V padrão e o "×" desliga
  - [ ] No celular: checkbox no topo do cartão, Análise no fim e matriz com rolagem
- [ ] Nenhum artefato de `data/build` ou `reports` alterado fora do esperado
