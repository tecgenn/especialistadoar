# 49 — Comparação: Contrato `ids` e Página `/comparar/`

**What to build:** A sessão de Comparação funcionando ponta a ponta: item "Comparar" no menu, página `/comparar/` com três campos de busca que viram cartões, e uma matriz neutra de atributos para até 3 Aparelhos. A seleção vive na URL em `?ids=`, na ordem escolhida, com máximo de 3, ids repetidos ou desconhecidos descartados e um aviso discreto quando algo é descartado. A página abre vazia com um estado que explica a ferramenta, mostra um convite com 1 modelo e a matriz com 2 ou 3; no celular a matriz mantém a coluna de atributos fixa com rolagem horizontal e uma dica visível.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Item "Comparar" no menu, entre Aparelhos e Assistente, levando a `/comparar/`
- [x] `/comparar/` sem `ids` mostra os três campos e um estado vazio que explica como comparar
- [x] Os três campos são comboboxes acessíveis: digitar filtra o `consulta.json` pelo mesmo motor de busca da tabela, ~8 sugestões com marca, modelo, capacidade e tipo; setas, Enter e Esc funcionam
- [x] O modelo escolhido vira um cartão com "Trocar" e "Remover"; os campos são posicionais e remover o do meio aproxima os seguintes
- [x] Com 1 modelo, aparece uma coluna e o convite para adicionar outro; com 2 ou 3, a matriz lado a lado
- [x] Cada coluna tem Marca, Modelo, link da ficha e selo "Análise" quando houver, no cabeçalho
- [x] As linhas comparam Tipo, Função, Capacidade, Tensão, Consumo anual, IDRS e Classe, com faixas quando o Aparelho tem mais de uma Variante
- [x] A comparação é neutra: nenhum destaque de "melhor valor"
- [x] `?ids=` preserva a ordem, aplica o limite de 3, descarta repetidos e desconhecidos e informa o descarte
- [x] "Limpar comparação" zera os três campos e remove `ids` da URL
- [x] No celular, a matriz rola na horizontal com a coluna de atributos fixa e uma dica visível
- [x] A página não indexa `ids`: canonical sem a chave
- [x] `CONTEXT.md` ganha **Comparação** e **Aparelho similar**; o ADR-0021 registra o limite de 3, o contrato `?ids=` separado dos filtros e a comparação neutra
- [x] Testes puros do contrato `ids` e das linhas da matriz; testes de ilha em jsdom para os estados 0/1/2/3, sugestões, troca, remoção e descarte
- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
