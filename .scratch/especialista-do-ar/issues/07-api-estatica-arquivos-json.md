# 07 — API estática (arquivos JSON)

**What to build:** A parte estática da API: a base consumível como arquivos JSON, sem Worker nem cota — consulta por ID, listas e a Versão da tabela.

- Publicar `aparelhos.jsonl`, `aparelhos.json`, `schema.json` e `manifest.json` como arquivos estáticos.
- Consulta por ID resolve um Aparelho; listas expõem os Aparelhos; a Versão da tabela fica disponível.
- Nada aqui envolve rota dinâmica.

**Blocked by:** 03 — Contrato, agrupamento em Aparelho e base servida.

**Status:** ready-for-agent

- [ ] Os artefatos da base são servidos como arquivos estáticos.
- [ ] Consulta por ID resolve um Aparelho.
- [ ] Listas de Aparelhos estão disponíveis.
- [ ] A Versão da tabela é exposta.
- [ ] Nenhuma rota dinâmica (Worker) é necessária para esses acessos.
- [ ] Testes cobrem o acesso estático.

## Origin

Migrado da issue #7 do GitHub (https://github.com/tecgenn/especialistadoar/issues/7) em 2026-10-14, ao mover o tracker deste repositório para markdown local.
