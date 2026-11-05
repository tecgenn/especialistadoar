# 40 — Validação Completa: Build, Testes, Typecheck, Lint

**What to build:** Execução da suíte completa de validação para garantir que toda a Fase 8 integra corretamente: pipeline build reproduz artefatos, API testes passam, site builda páginas estáticas, todos os testes Vitest verdes, typecheck e biome OK. Confirmação dos critérios de aceite da spec, incluindo a correção do IDRS, os filtros padrão e o layout amplo.

**Blocked by:** 37 — IDRS: Restaurar Separador Decimal e Limitar a 10; 38 — Site: /aparelhos/ com Filtros Padrão; 39 — Site: /aparelhos/ em Layout Amplo e Responsivo

**Status:** done

- [x] `pnpm build` — pipeline reproduz `data/build` + `reports` byte a byte
- [x] `pnpm build:site` — gera páginas estáticas (contagem esperada após filtro "Excluído")
- [x] `pnpm test` — todos os testes Vitest passam (pipeline + api + site)
- [x] `pnpm typecheck` — `tsc --noEmit` OK em todo o monorepo
- [x] `pnpm lint` — `biome check` OK
- [x] Verificações manuais:
  - [x] Página `/aparelhos/` carrega sem erro
  - [x] Busca no topo funciona
  - [x] Chips de marca (10), capacidade (6), função (2), tipo (4), classe (6 coloridos) visíveis
  - [x] Selects "Outras Marcas" e "Outras Capacidades" abrem vazios (sem "Todas")
  - [x] Filtros funcionam e atualizam URL
  - [x] Ordenação só mostra 4 opções (btu, consumo, idrs, classe)
  - [x] Tabela tem 6 colunas: Marca, Modelo, BTU/h, Consumo (kWh), IDRS, Classe
  - [x] Classe exibe "Classe A" etc. com cores na tabela e nos chips
  - [x] Botão "Mostrar mais" aparece quando > 50 resultados
  - [x] Clique carrega mais 50 itens (desktop e mobile)
  - [x] Botão desaparece quando todos resultados visíveis
  - [x] Mudança de filtro/ordem reseta para 50 iniciais
  - [x] Mobile: filtros recolhíveis, tabela em cards
  - [x] "Limpar filtros" limpa só filtros, mantém ordenação
  - [x] Duplicata GRATTO ACST9F resolvida (apenas versão Incluído)
  - [x] IDRS: os 4 registros exibem 5,5 / 6,2 / 3,3; o 9,71 permanece; a regra de formato não cria Anomalia nova
  - [x] `/aparelhos/` abre com Split Hi-Wall + 220 V + Classe A e URL limpa
  - [x] Link com filtro próprio não recebe o padrão
  - [x] `/aparelhos/` usa a largura útil; as demais páginas mantêm o teto de 64 rem
  - [x] ≤ 64 rem: filtros em painel recolhível
  - [x] `grep -r "rotacao|situacao|suspeito" apps/site/dist` vazio
  - [x] `grep -r "rotacao|situacao" packages/api/dist` vazio (se houver dist)
- [x] Commit com artefatos regenerados (`data/build`, `reports`; `apps/site/dist` é gitignored, regenerado no build)
