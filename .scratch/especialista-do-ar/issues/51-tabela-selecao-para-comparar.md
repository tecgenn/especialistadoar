# 51 — Tabela: Seleção de até 3 Aparelhos para Comparar

**What to build:** A tabela ganha a coluna de seleção como primeira, com o cabeçalho "Comparar", e uma barra de ação entre os filtros e a vitrine de Aparelhos analisados. Marcar Aparelhos monta a seleção; ao chegar em 3, os checkboxes restantes ficam desabilitados com uma mensagem curta sobre o limite; não existe "selecionar todos". A barra mostra a contagem, habilita "Comparar" só com 2 ou 3 e oferece "Limpar seleção". A seleção vive em `?ids=` e é preservada quando a pessoa muda filtro, busca ou ordenação — e também por "Limpar filtros". No celular, o checkbox é a primeira linha do cartão.

**Blocked by:** 49 — Comparação: Contrato `ids` e Página `/comparar/`; 50 — Tabela Central: Busca, Pesquisa Avançada e Coluna Análise

**Status:** ready-for-agent

- [ ] Checkbox como primeira coluna da tabela, com cabeçalho "Comparar"
- [ ] Marcar e desmarcar atualiza a seleção e a URL em `?ids=`, na ordem de seleção
- [ ] Com 3 selecionados, os demais checkboxes ficam desabilitados e uma mensagem explica o limite
- [ ] Sem "selecionar todos"
- [ ] Barra de ação acima da vitrine: contagem de modelos, "Comparar" habilitado apenas com 2 ou 3, e "Limpar seleção"
- [ ] "Comparar" navega para `/comparar/?ids=...` com a mesma ordem
- [ ] Mudar filtro, busca ou ordenação preserva `?ids=`
- [ ] "Limpar filtros" não apaga a seleção; "Limpar seleção" remove só `ids`
- [ ] Recarregar a página reconstrói a seleção a partir da URL, inclusive ids descartados com aviso
- [ ] No celular, o checkbox é a primeira linha do cartão, com o rótulo "Comparar"
- [ ] Testes da ilha cobrem seleção, limite, desabilitação, barra, navegação e preservação de `ids` em cada mudança de estado
- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
