# 33 — Site: Camada de Dados (filtros.json, opcoes.ts, tabela.ts, glue)

**What to build:** A curadoria `filtros.json` ganha entrada `classes` com chips coloridos (A–F). `lib/filtros.ts` valida `classes`. `lib/opcoes.ts` deriva `classesChip` e remove `rotacoes`/`situacoes`. `lib/tabela.ts` atualiza `COLUNAS_TABELA` (6 colunas), rótulo "Consumo (kWh)", formatação "Classe A/B/C…". Glue `conteudo/filtros.ts` lê `classes` do JSON.

**Blocked by:** 31 — Pipeline: Filtro "Excluído" e Remoção de Campos Obsoletos

**Status:** ready-for-agent

- [ ] Em `filtros.json`: adicionar array `classes` com 6 objetos `{ valor: "A", rotulo: "Classe A", cor: "green" }` etc. (A=green, B=blue, C=yellow, D=orange, E=red, F=red)
- [ ] Em `lib/filtros.ts`: `FiltrosCurados` ganha `classes: MarcaCurada[]`; `validarFiltros` valida `cor` opcional
- [ ] Em `lib/opcoes.ts`: `OpcoesConsulta` remove `rotacoes`, `situacoes`; adiciona `classesChip: MarcaCurada[]`; `opcoesDe` deriva chips de classe do dataset + curadoria
- [ ] Em `lib/tabela.ts`: `COLUNAS_TABELA = [marca, modelo, btu, consumo, idrs, classe]`; rótulo consumo = "Consumo (kWh)"; `valorDaColuna` para `classe` retorna `"Classe A, Classe B"`…
- [ ] Em `conteudo/filtros.ts`: glue lê `classes` do `filtros.json` e passa para `opcoesDe`
- [ ] Atualizar testes em `apps/site/test/{filtros,filtros-glue,opcoes}.test.ts`
- [ ] `pnpm test` passa (apps/site)
- [ ] `pnpm typecheck` passa