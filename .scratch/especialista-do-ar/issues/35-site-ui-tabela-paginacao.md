# 35 — Site: Tabela e Paginação

**What to build:** Tabela usa `COLUNAS_TABELA` atualizada (6 colunas: Marca, Modelo, BTU/h, Consumo (kWh), IDRS, Classe). Célula de classe exibe "Classe A, Classe B" com cores via CSS. Paginação numérica (1, 2, 3…) com 50 itens/página, funcionando no desktop e mobile (compacta: anterior/atual/próximo ou scroll horizontal). Substitui botão "Mostrar mais".

**Blocked by:** 33 — Site: Camada de Dados (filtros.json, opcoes.ts, tabela.ts, glue); 34 — Site: UI Filtros Redesign (Consulta.tsx)

**Status:** ready-for-agent

- [ ] Tabela renderiza 6 colunas conforme `COLUNAS_TABELA`
- [ ] `valorDaColuna` para `classe` retorna `"Classe A, Classe B"`…
- [ ] CSS para classes na tabela: `.tabela-aparelhos td[data-label="Classe"]` com cores por classe
- [ ] Componente de paginação `<nav className="paginacao">` com botões numerados
- [ ] Lógica: `totalPaginas = Math.ceil(resultados.length / 50)`, `paginaAtual` (1-based)
- [ ] Exibição inteligente: 1, ..., n-1, n, n+1, ..., último (máx 7 botões visíveis)
- [ ] Mobile: paginação com scroll horizontal ou botões anterior/atual/próximo
- [ ] Mudança de filtro/ordem reseta para página 1
- [ ] Testes em `apps/site/test/consulta.test.tsx`:
  - Paginação renderiza botões 1, 2, 3…
  - Clique em página altera linhas visíveis
  - Reset ao mudar filtro/ordem
  - Mobile: paginação usável
- [ ] `pnpm test` passa
- [ ] `pnpm typecheck` passa