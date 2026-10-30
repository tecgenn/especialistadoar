# 35 — Site: Tabela e "Mostrar mais"

**What to build:** Tabela usa `COLUNAS_TABELA` (6 colunas: Marca, Modelo, BTU/h, Consumo (kWh), IDRS, Classe). Célula de classe exibe "Classe A, Classe B" com cores via CSS. Botão "Mostrar mais" carrega 50 itens por clique, funcionando no desktop e mobile. Substitui paginação numérica.

**Blocked by:** 33 — Site: Camada de Dados; 34 — Site: UI Filtros Redesign

**Status:** ready-for-agent

- [ ] Tabela renderiza 6 colunas conforme `COLUNAS_TABELA`
- [ ] `valorDaColuna` para `classe` retorna `"Classe A, Classe B"`…
- [ ] CSS para classes na tabela: `.tabela-aparelhos td[data-label="Classe"]` com cores por classe
- [ ] Botão "Mostrar mais" aparece quando há mais de 50 resultados
- [ ] Clique acrescenta 50 itens à exibição
- [ ] Botão desaparece quando todos os resultados estão visíveis
- [ ] Mudança de filtro/ordem reseta para 50 itens iniciais
- [ ] Funciona no desktop e mobile
- [ ] Testes em `apps/site/test/consulta.test.tsx`:
  - "Mostrar mais" renderiza quando > 50 resultados
  - Clique incrementa linhas visíveis em 50
  - Botão some quando todos mostrados
  - Reset ao mudar filtro/ordem
- [ ] `pnpm test` passa
- [ ] `pnpm typecheck` passa