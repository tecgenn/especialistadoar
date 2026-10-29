# 32 — API Isomórfica: Tipos, Filtros e Ordenação Atualizados

**What to build:** O módulo isomórfico `@especialista-do-ar/api/consulta` reflete os novos contratos: `FiltrosConsulta` sem `rotacao`/`situacao`; `ORDENS_CONSULTA` apenas com `btu`, `consumo`, `idrs`, `classe`; `ItemConsulta` enxuto; `combinarCampos` e `chaveDe/ordenar` suportando só as 4 ordens; remoção de `SITUACOES_CONSULTA`.

**Blocked by:** 31 — Pipeline: Filtro "Excluído" e Remoção de Campos Obsoletos

**Status:** done

- [x] Em `consulta.ts`: remover `rotacao`, `situacao` de `FiltrosConsulta`
- [x] Atualizar `ORDENS_CONSULTA = ["btu", "consumo", "idrs", "classe"]`
- [x] Remover `situacao`, `rotacao`, `suspeito`, `tensoes` de `ItemConsulta` (manter `idrs`, `consumosKwh`, `classes`, `capacidadesBtu` para formatação de faixa). **Desvio consciente:** `tensoes` **permanece** — é usado pelo filtro `tensao` (`combinaCampos`) e pelas opções/tensão do site; removê-lo quebraria ambos. A ressalva da spec ("se não usado no site") vale aqui.
- [x] Ajustar `combinaCampos`: remover verificações de `rotacao` e `situacao`
- [x] Ajustar `chaveDe`/`ordenar`: suportar apenas as 4 ordens; remover lógica de `suspeito` (o comentário obsoleto que ainda citava suspeitos foi corrigido)
- [x] Remover `SITUACOES_CONSULTA` e `SituacaoConsulta`
- [x] Atualizar testes em `packages/api/test/consulta.test.ts`:
  - `filtrar()` com combinações de marca, tipo, btu, tensao, funcao, classe, q
  - `ordenar()` com as 4 ordens × asc/desc (cobertas em `test/ordenacao.test.ts`)
  - Verificar que filtros removidos são ignorados
- [x] `pnpm test` passa (packages/api) — 36/36
- [x] `pnpm typecheck` passa

## Comments

- 2026-10-29: O código já havia entrado junto do ticket 31 (commit `3e9adc4`, que precisou atualizar `packages/api` para o `typecheck` do monorepo). Este ticket fechou o que faltava: testes explícitos de `funcao`, `classe` e de filtros removidos ignorados, e a correção do comentário de `ordenar` que ainda falava de suspeitos.
- `ItemConsulta` continua com `tensoes` por necessidade do filtro de tensão e das opções do site (ver checklist).
- Nenhum artefato de `data/build/` ou `reports/` muda: é código/teste do entry isomórfico.
