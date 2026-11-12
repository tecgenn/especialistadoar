# 49 — Comparação: Contrato `ids` e Página `/comparar/`

**What to build:** A sessão de Comparação funcionando ponta a ponta: item "Comparar" no menu, página `/comparar/` com três campos de busca que viram cartões, e uma matriz neutra de atributos para até 3 Aparelhos. A seleção vive na URL em `?ids=`, na ordem escolhida, com máximo de 3, ids repetidos ou desconhecidos descartados e um aviso discreto quando algo é descartado. A página abre vazia com um estado que explica a ferramenta, mostra um convite com 1 modelo e a matriz com 2 ou 3; no celular a matriz mantém a coluna de atributos fixa com rolagem horizontal e uma dica visível.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Item "Comparar" no menu, entre Aparelhos e Assistente, levando a `/comparar/`
- [ ] `/comparar/` sem `ids` mostra os três campos e um estado vazio que explica como comparar
- [ ] Os três campos são comboboxes acessíveis: digitar filtra o `consulta.json` pelo mesmo motor de busca da tabela, ~8 sugestões com marca, modelo, capacidade e tipo; setas, Enter e Esc funcionam
- [ ] O modelo escolhido vira um cartão com "Trocar" e "Remover"; os campos são posicionais e remover o do meio aproxima os seguintes
- [ ] Com 1 modelo, aparece uma coluna e o convite para adicionar outro; com 2 ou 3, a matriz lado a lado
- [ ] Cada coluna tem Marca, Modelo, link da ficha e selo "Análise" quando houver, no cabeçalho
- [ ] As linhas comparam Tipo, Função, Capacidade, Tensão, Consumo anual, IDRS e Classe, com faixas quando o Aparelho tem mais de uma Variante
- [ ] A comparação é neutra: nenhum destaque de "melhor valor"
- [ ] `?ids=` preserva a ordem, aplica o limite de 3, descarta repetidos e desconhecidos e informa o descarte
- [ ] "Limpar comparação" zera os três campos e remove `ids` da URL
- [ ] No celular, a matriz rola na horizontal com a coluna de atributos fixa e uma dica visível
- [ ] A página não indexa `ids`: canonical sem a chave
- [ ] `CONTEXT.md` ganha **Comparação** e **Aparelho similar**; o ADR-0021 registra o limite de 3, o contrato `?ids=` separado dos filtros e a comparação neutra
- [ ] Testes puros do contrato `ids` e das linhas da matriz; testes de ilha em jsdom para os estados 0/1/2/3, sugestões, troca, remoção e descarte
- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
