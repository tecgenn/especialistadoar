# 37 — Validação Completa: Build, Testes, Typecheck, Lint

**What to build:** Execução da suíte completa de validação para garantir que toda a Fase 8 integra corretamente: pipeline build reproduz artefatos, API testes passam, site builda páginas estáticas, todos os testes Vitest verdes, typecheck e biome OK. Confirmação dos critérios de aceite da spec.

**Blocked by:** 31 — Pipeline: Filtro "Excluído" e Remoção de Campos Obsoletos; 32 — API Isomórfica: Tipos, Filtros e Ordenação Atualizados; 33 — Site: Camada de Dados (filtros.json, opcoes.ts, tabela.ts, glue); 34 — Site: UI Filtros Redesign (Consulta.tsx); 35 — Site: Tabela e Paginação; 36 — Site: Estilos Globais (global.css)

**Status:** ready-for-agent

- [ ] `pnpm build` — pipeline reproduz `data/build` + `reports` byte a byte
- [ ] `pnpm build:site` — gera páginas estáticas (contagem esperada após filtro "Excluído")
- [ ] `pnpm test` — todos os testes Vitest passam (pipeline + api + site)
- [ ] `pnpm typecheck` — `tsc --noEmit` OK em todo o monorepo
- [ ] `pnpm lint` — `biome check` OK
- [ ] Verificações manuais:
  - [ ] Página `/aparelhos/` carrega sem erro
  - [ ] Busca no topo funciona
  - [ ] Chips de marca (10), capacidade (6), função (2), tipo (4), classe (6 coloridos) visíveis
  - [ ] Selects "Outras Marcas" e "Outras Capacidades" abrem vazios (sem "Todas")
  - [ ] Filtros funcionam e atualizam URL
  - [ ] Ordenação só mostra 4 opções (btu, consumo, idrs, classe)
  - [ ] Tabela tem 6 colunas: Marca, Modelo, BTU/h, Consumo (kWh), IDRS, Classe
  - [ ] Classe exibe "Classe A" etc. com cores na tabela e nos chips
  - [ ] Paginação 1, 2, 3… funciona (desktop e mobile)
  - [ ] Mobile: filtros empilhados, tabela em cards, paginação usável
  - [ ] "Limpar filtros" limpa só filtros, mantém ordenação
  - [ ] Duplicata GRATTO ACST9F resolvida (apenas versão Incluído)
  - [ ] `grep -r "rotacao|situacao|suspeito" apps/site/dist` vazio
  - [ ] `grep -r "rotacao|situacao" packages/api/dist` vazio (se houver dist)
- [ ] Commit com artefatos regenerados (`data/build`, `reports`, `apps/site/dist`)