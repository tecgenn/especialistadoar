# 24 — Classe, Situação e campos da tabela na base e no `consulta.json`

**What to build:** a base servida passa a carregar a **Classe** (faixa A–F que o
INMETRO declara, lida da coluna "Faixa de Classificação", por Linha, dentro de
`dados` de cada Variante) e a **Situação** (`ativo` quando ao menos um Registro tem
status Ativo; `inativo` caso contrário), conforme o ADR-0018. O `consulta.json`
ganha o que a tabela de Aparelhos precisa: `situacao`, `funcao`, `rotacao`,
`classes`, `idrs` e `consumosKwh` (listas únicas e ordenadas, ignorando Variantes
sem dado, como `capacidadesBtu` já faz). A Classe nunca é recalculada a partir do
IDRS. `aparelhos.jsonl`, `aparelhos.json`, `schema.json` e `consulta.json` são
regenerados; `id` e URL de nenhum Aparelho mudam.

**Blocked by:** nenhum.

**Status:** ready-for-agent

- [ ] `DadosDeclarados.classe` e `Aparelho.situacao` existem no contrato TypeBox e o
      `schema.json` é derivado deles; a validação Ajv + invariantes continua falhando
      o build em violação.
- [ ] A Classe é lida da coluna oficial, aparada e em maiúsculas; célula vazia vira
      `null`. Uma Classe fora de A–F não falha o build (ADR-0018).
- [ ] `situacao` reflete os status dos Registros do Aparelho; teste com um Aparelho
      de Registros mistos (Ativo + Inativo) e um só inativo.
- [ ] `ItemConsulta` e `projetarConsulta` trazem os campos novos; Variantes sem dado
      não contribuem com valores. Nada editorial entra no `consulta.json`.
- [ ] Os goldens e snapshots são atualizados e o diff de `aparelhos.json` é só de
      campos novos (os `id`s são idênticos).
- [ ] O tamanho de `consulta.json` (hoje ~396 KB) e o de `aparelhos.json` (~3,1 MB)
      ficam registrados antes e depois neste ticket.
- [ ] `docs/agentes.md` e `docs/agents/architecture.md` documentam os campos novos e
      a semântica de `situacao`; `README.md` se necessário.
- [ ] `pnpm build` reproduz `data/build` e `reports` byte a byte depois de
      regenerar e commitar; `pnpm build:site`, lint, typecheck e testes verdes.
