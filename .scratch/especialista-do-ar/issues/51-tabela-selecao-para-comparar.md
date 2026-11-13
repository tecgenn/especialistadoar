# 51 — Tabela: Seleção de até 3 Aparelhos para Comparar

**What to build:** A tabela ganha a coluna de seleção como primeira, com o cabeçalho "Comparar", e uma barra de ação entre os filtros e a vitrine de Aparelhos analisados. Marcar Aparelhos monta a seleção; ao chegar em 3, os checkboxes restantes ficam desabilitados com uma mensagem curta sobre o limite; não existe "selecionar todos". A barra mostra a contagem, habilita "Comparar" só com 2 ou 3 e oferece "Limpar seleção". A seleção vive em `?ids=` e é preservada quando a pessoa muda filtro, busca ou ordenação — e também por "Limpar filtros". No celular, o checkbox é a primeira linha do cartão.

**Blocked by:** 49 — Comparação: Contrato `ids` e Página `/comparar/`; 50 — Tabela Central: Busca, Pesquisa Avançada e Coluna Análise

**Status:** done

- [x] Checkbox como primeira coluna da tabela, com cabeçalho "Comparar"
- [x] Marcar e desmarcar atualiza a seleção e a URL em `?ids=`, na ordem de seleção
- [x] Com 3 selecionados, os demais checkboxes ficam desabilitados e uma mensagem explica o limite
- [x] Sem "selecionar todos"
- [x] Barra de ação acima da vitrine: contagem de modelos, "Comparar" habilitado apenas com 2 ou 3, e "Limpar seleção"
- [x] "Comparar" navega para `/comparar/?ids=...` com a mesma ordem
- [x] Mudar filtro, busca ou ordenação preserva `?ids=`
- [x] "Limpar filtros" não apaga a seleção; "Limpar seleção" remove só `ids`
- [x] Recarregar a página reconstrói a seleção a partir da URL, inclusive ids descartados com aviso
- [x] No celular, o checkbox é a primeira linha do cartão, com o rótulo "Comparar"
- [x] Testes da ilha cobrem seleção, limite, desabilitação, barra, navegação e preservação de `ids` em cada mudança de estado
- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
