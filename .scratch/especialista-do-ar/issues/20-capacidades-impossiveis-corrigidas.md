# 20 — Capacidades impossíveis corrigidas e sinalizadas

**What to build:** o catálogo para de oferecer `12`, `30`, `120` e `16115` BTU/h como
capacidade. As cinco Linhas da tabela com valor truncado ou com BTU e Watts trocados
ganham Exceções manuais com motivo e fonte (seis exceções, nenhuma correção apenas de
formato) e o build regenera a base publicada — os quatro Aparelhos afetados passam a
exibir a capacidade real (12.000, 30.000 e 55.000 BTU/h) na ficha, na consulta e para
os Agentes. Em paralelo, o detector de Anomalias ganha o tipo `valor_implausivel`, com
regras de plausibilidade por coluna, estreando com "capacidade nominal abaixo de 1.000
BTU/h": a próxima Versão da tabela que trouxer o erro de novo o mostrará no Relatório
de revisão, sem correção automática e sem quebrar o build. Nenhum Aparelho é excluído
(seguem 2.460) e as 15 Anomalias da Versão atual não mudam.

**Blocked by:** Nenhum — pode começar já.

**Status:** ready-for-agent

- [ ] As Linhas 5278, 7133, 7200, 7428 e 3709 têm Exceção manual com `motivo` e `fonte`
      (a de 3709 cobre BTU e Watts), apontando a coluna de capacidade/potência que
      desmente o valor; uma correção apenas de formato continua sendo recusada.
- [ ] O `consulta.json` não oferece mais `12`, `30`, `120` nem `16115`; os quatro
      Aparelhos afetados aparecem com 12.000, 30.000 e 55.000 BTU/h, e nenhum `id` ou
      URL de ficha mudou.
- [ ] A regra `valor_implausivel` dispara para capacidade nominal abaixo de 1.000 BTU/h
      (coberta por fixture) e é uma tabela de regras por coluna, pronta para receber
      outras inconsistências sem mexer no detector.
- [ ] Na Versão atual o build segue com 2.460 Aparelhos e 15 Anomalias, e o
      `anomalias.jsonl` publicado não mudou.
- [ ] `pnpm build` reproduz `data/build` e `reports` byte a byte, e o corpo do PR
      registra que as Exceções são presas à Versão e precisam ser recadastradas quando
      entrar uma exportação nova.
