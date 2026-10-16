# 06 — CI e publicação via PR

**What to build:** O portão de publicação: toda nova Versão da tabela passa por CI (build, validação e testes), vira um Pull Request com o Relatório de revisão anexado, e só publica no merge.

- GitHub Actions em matrix Linux + Windows; o Linux é a referência e o Windows é não-bloqueante no push (minutos de runner custam 2× em repo privado).
- O merge em `main` é a publicação (deploy dos artefatos).
- Nenhuma Versão da tabela vai ao ar sem revisão humana.

**Blocked by:** 05 — Diff entre versões e Relatório de revisão.

**Status:** done

- [x] O CI roda build, validação (Ajv + invariantes) e Vitest; uma falha bloqueia o merge.
- [x] O Relatório de revisão é anexado automaticamente ao Pull Request.
- [x] O Windows é não-bloqueante e o Linux é a referência.
- [x] O merge em `main` dispara o deploy dos artefatos publicados.
- [x] Não existe caminho de publicação que pule o portão do PR.

## Origin

Migrado da issue #6 do GitHub (https://github.com/tecgenn/especialistadoar/issues/6) em 2026-10-14, ao mover o tracker deste repositório para markdown local.
