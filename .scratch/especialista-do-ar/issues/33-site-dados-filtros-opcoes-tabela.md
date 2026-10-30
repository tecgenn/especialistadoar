# 33 — Site: Camada de Dados (filtros.json, opcoes.ts, tabela.ts, glue)

**What to build:** A curadoria `filtros.json` ganha entrada `classes` com chips coloridos (A–F). `lib/filtros.ts` valida `classes`. `lib/opcoes.ts` deriva `classesChip` e remove `rotacoes`/`situacoes`. `lib/tabela.ts` atualiza `COLUNAS_TABELA` (6 colunas), rótulo "Consumo (kWh)", formatação "Classe A/B/C…". Glue `conteudo/filtros.ts` lê `classes` do JSON.

**Blocked by:** 31 — Pipeline: Filtro "Excluído" e Remoção de Campos Obsoletos

**Status:** done

- [x] Em `filtros.json`: adicionar array `classes` com 6 objetos `{ valor: "A", rotulo: "Classe A", cor: "green" }` etc. (A=green, B=blue, C=yellow, D=orange, E=red, F=red) — cores em hex (`#16a34a`, `#2563eb`, `#ca8a04`, `#ea580c`, `#dc2626`, `#dc2626`), o contrato aceita qualquer texto.
- [x] Em `lib/filtros.ts`: `FiltrosCurados` ganha `classes: MarcaCurada[]`; `validarFiltros` valida `cor` opcional
- [x] Em `lib/opcoes.ts`: `OpcoesConsulta` remove `rotacoes`, `situacoes`; adiciona `classesChip: MarcaCurada[]`; `opcoesDe` deriva chips de classe do dataset + curadoria
- [x] Em `lib/tabela.ts`: `COLUNAS_TABELA = [marca, modelo, btu, consumo, idrs, classe]`; rótulo consumo = "Consumo (kWh)"; `valorDaColuna` para `classe` retorna `"Classe A, Classe B"`…
- [x] Em `conteudo/filtros.ts`: glue lê `classes` do `filtros.json` e passa para `opcoesDe`
- [x] Atualizar testes em `apps/site/test/{filtros,filtros-glue,opcoes}.test.ts`
- [ ] `pnpm test` passa (apps/site) — **bloqueado pelo ticket 34**: `Consulta.tsx` ainda consome `rotuloSituacao`, `opcoes.rotacoes` e `opcoes.situacoes`, então `test/consulta.test.tsx` e `test/analises-build.test.ts` falham até a UI migrar. Os testes desta camada (filtros, opcoes, tabela, filtros-glue) passam: 27/27.
- [x] `pnpm typecheck` passa

## Comments

- 2026-10-29: A maior parte desta camada entrou junto do ticket 31 (commit `3e9adc4`), que precisou atualizar o site para o `typecheck` do monorepo. Este ticket fechou as lacunas reais: validação de `cor` em `validarFiltros` e cobertura de `classesChip`/`cor` em `filtros.test.ts`, `opcoes.test.ts` e `filtros-glue.test.ts`.
- Os chips de classe saem ordenados pela curadoria e só aparecem se existirem na base; o resto vai para o `<select>` — mesma regra de marcas e capacidades.
- O aceite de `pnpm test` da app do site fica pendente por dependência de UI (ticket 34), não por falta de trabalho desta camada.
