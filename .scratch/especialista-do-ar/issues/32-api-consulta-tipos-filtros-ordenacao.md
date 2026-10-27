# 32 — API Isomórfica: Tipos, Filtros e Ordenação Atualizados

**What to build:** O módulo isomórfico `@especialista-do-ar/api/consulta` reflete os novos contratos: `FiltrosConsulta` sem `rotacao`/`situacao`; `ORDENS_CONSULTA` apenas com `btu`, `consumo`, `idrs`, `classe`; `ItemConsulta` enxuto; `combinarCampos` e `chaveDe/ordenar` suportando só as 4 ordens; remoção de `SITUACOES_CONSULTA`.

**Blocked by:** 31 — Pipeline: Filtro "Excluído" e Remoção de Campos Obsoletos

**Status:** ready-for-agent

- [ ] Em `consulta.ts`: remover `rotacao`, `situacao` de `FiltrosConsulta`
- [ ] Atualizar `ORDENS_CONSULTA = ["btu", "consumo", "idrs", "classe"]`
- [ ] Remover `situacao`, `rotacao`, `suspeito`, `tensoes` de `ItemConsulta` (manter `idrs`, `consumosKwh`, `classes`, `capacidadesBtu` para formatação de faixa)
- [ ] Ajustar `combinaCampos`: remover verificações de `rotacao` e `situacao`
- [ ] Ajustar `chaveDe`/`ordenar`: suportar apenas as 4 ordens; remover lógica de `suspeito`
- [ ] Remover `SITUACOES_CONSULTA` e `SituacaoConsulta`
- [ ] Atualizar testes em `packages/api/test/consulta.test.ts`:
  - `filtrar()` com combinações de marca, tipo, btu, tensao, funcao, classe, q
  - `ordenar()` com as 4 ordens × asc/desc
  - Verificar que filtros removidos são ignorados
- [ ] `pnpm test` passa (packages/api)
- [ ] `pnpm typecheck` passa