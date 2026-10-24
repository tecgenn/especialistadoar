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

**Status:** done

- [x] `DadosDeclarados.classe` e `Aparelho.situacao` existem no contrato TypeBox e o
      `schema.json` é derivado deles; a validação Ajv + invariantes continua falhando
      o build em violação.
- [x] A Classe é lida da coluna oficial, aparada e em maiúsculas; célula vazia vira
      `null`. Uma Classe fora de A–F não falha o build (ADR-0018).
- [x] `situacao` reflete os status dos Registros do Aparelho; teste com um Aparelho
      de Registros mistos (Ativo + Inativo) e um só inativo.
- [x] `ItemConsulta` e `projetarConsulta` trazem os campos novos; Variantes sem dado
      não contribuem com valores. Nada editorial entra no `consulta.json`.
- [x] Os goldens e snapshots são atualizados e o diff de `aparelhos.json` é só de
      campos novos (os `id`s são idênticos) — com a ressalva registrada abaixo.
- [x] O tamanho de `consulta.json` (hoje ~396 KB) e o de `aparelhos.json` (~3,1 MB)
      ficam registrados antes e depois neste ticket.
- [x] `docs/agentes.md` e `docs/agents/architecture.md` documentam os campos novos e
      a semântica de `situacao`; `README.md` se necessário.
- [x] `pnpm build` reproduz `data/build` e `reports` byte a byte depois de
      regenerar e commitar; `pnpm build:site`, lint, typecheck e testes verdes.

## Comments

### Implementação (2026-10-24)

- **Tamanhos:** `consulta.json` 403.491 B (~394 KB) → **698.556 B (~682 KB)**;
  `aparelhos.json` 3.232.280 B (~3,08 MB) → **3.406.926 B (~3,25 MB)**;
  `aparelhos.jsonl` 1.997.301 B → 2.104.901 B. O salto do dataset de consulta vem
  dos campos novos em 2.460 itens (`situacao`, `funcao`, `rotacao`, `classes`,
  `idrs`, `consumosKwh`); `consulta.json` continua sem indentação.
- **Ressalva ao "só campos novos":** os `id`s são idênticos e nenhum campo antigo
  mudou, mas **60 Aparelhos ganharam uma Variante**. A Classe entra na comparação
  que deduplica Variantes (`group.ts`), então Linhas da mesma tensão e mesmos
  Dados declarados que divergem só na Classe passam a ser Variantes distintas —
  ex.: `ap-bd1e231a0e9a`, Linhas 861 (`A`) e 2620 (`B`). É o comportamento que o
  ADR-0018 pede ("escolher uma delas descartaria dado em silêncio"), não um efeito
  colateral; as `classes` do `consulta.json` trazem as duas.
- **Base atual:** 2.460 Aparelhos, todos com Classe (`classes` não vazio); 2.314
  `ativo` e 146 `inativo`; 6 Classes distintas (A–F).
- **Testes:** novo `packages/pipeline/test/classe-situacao.test.ts` com fixture
  `amostra-classe.csv` (Classe aparada/maiúsculas, fora de A–F, vazia, divergente
  entre Variantes, Situação mista e só-inativa) + projeção no `consulta.json`. O
  golden `amostra-aparelhos.csv` ganhou a coluna de Classificação, então o snapshot
  de `consulta.json` passou a pinar `classes` com valor real. `temDadosDeclarados`
  ignora a Classe (guardado por teste) e a validação recusa `situacao` fora do
  contrato.
- **Checks:** Vitest 280/280 (29 arquivos), `tsc --noEmit` OK, Biome OK;
  `pnpm build` reproduz `data/build` byte a byte; `pnpm build:site` gera 2.462
  páginas; `reports/` inalterado.
