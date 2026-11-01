# 35 — Site: Tabela e "Mostrar mais"

**What to build:** Tabela usa `COLUNAS_TABELA` (6 colunas: Marca, Modelo, BTU/h, Consumo (kWh), IDRS, Classe). Célula de classe exibe "Classe A, Classe B" com cores via CSS. Botão "Mostrar mais" carrega 50 itens por clique, funcionando no desktop e mobile. **Paginação numérica retirada:** substituída pelo botão "Mostrar mais" (não há paginação numerada).

**Blocked by:** 33 — Site: Camada de Dados; 34 — Site: UI Filtros Redesign

**Status:** done

- [x] Tabela renderiza 6 colunas conforme `COLUNAS_TABELA`
- [x] `valorDaColuna` para `classe` retorna `"Classe A, Classe B"`…
- [x] CSS para classes na tabela: `.tabela-aparelhos td[data-label="Classe"]` com cores por classe
- [x] Botão "Mostrar mais" aparece quando há mais de 50 resultados
- [x] Clique acrescenta 50 itens à exibição
- [x] Botão desaparece quando todos os resultados estão visíveis
- [x] Mudança de filtro/ordem reseta para 50 itens iniciais
- [x] Funciona no desktop e mobile
- [x] Testes em `apps/site/test/consulta.test.tsx`:
  - "Mostrar mais" renderiza quando > 50 resultados
  - Clique incrementa linhas visíveis em 50
  - Botão some quando todos mostrados
  - Reset ao mudar filtro/ordem
- [x] `pnpm test` passa
- [x] `pnpm typecheck` passa

## Comments

- 2026-10-31: Escopo já implementado nos commits 27, 33 e 34 (tabela.ts com COLUNAS_TABELA/valorDaColuna, Consulta.tsx com estado paginacao + "Mostrar mais", global.css com .mostrar-mais, testes em consulta.test.tsx e tabela.test.tsx). Nenhum artefato novo gerado — tudo já estava em data/build/reports. Paginação numérica retirada: substituída por "Mostrar mais" (não há paginação numerada). pnpm test (349/349), pnpm typecheck, pnpm lint, pnpm build e pnpm build:site (2229 páginas) todos verdes.