# 31 — Pipeline: Filtro "Excluído" e Remoção de Campos Obsoletos

**What to build:** O pipeline passa a descartar linhas com `Status do Modelo = "Excluido"` logo após o parse do CSV, eliminando duplicatas na origem (ex.: GRATTO ACST9F com versões Incluído/Excluído). Remove os campos `rotacao`, `situacao`, `suspeito` dos tipos de consulta, Aparelho e DadosDeclarados, e atualiza schema/validação.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Em `parse.ts`, filtrar linhas onde `Status do Modelo === "Excluido"` antes da normalização
- [ ] Em `consulta.ts`: remover `rotacao`, `situacao`, `suspeito` de `ItemConsulta`; ajustar `projetarConsulta`
- [ ] Em `aparelho.ts`: remover `situacao` de `Aparelho` e `DadosDeclarados`; remover `SituacaoSchema`/`Situacao`
- [ ] Em `group.ts`: remover derivação de `situacao` dos status dos Registros; ajustar `temDadosDeclarados` se necessário
- [ ] Em `validate.ts`: atualizar invariantes para tipos novos
- [ ] Em `index.ts`: exportar tipos atualizados
- [ ] Atualizar testes e snapshots em `packages/pipeline/test/{parse,consulta,aparelho,group,validate,build}.test.ts`
- [ ] `pnpm build` passa e reproduz `data/build` byte a byte (artefatos menores, sem campos removidos, sem Aparelhos "Excluido")
- [ ] Verificar que `consulta.json` não contém `rotacao`, `situacao`, `suspeito`
- [ ] Verificar que contagem de Aparelhos diminuiu (~2.200–2.300 vs 2.460 anterior)