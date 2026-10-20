# 15 — Observabilidade: Web Analytics e relatório de links quebrados

**What to build:** O tráfego humano do site passa a ser medido (Cloudflare Web
Analytics) e o resultado da verificação diária das Ofertas fica visível no resumo
do run, sem e-mail (ADR-0013 e ADR-0014).

- O job de verificação de links deixa de falhar e publica no resumo do run a
  lista de links quebrados (URL, loja, motivo), com um aviso `::warning::` na
  contagem; sem quebrados, registra isso de forma limpa.
- Nada é commitado, nenhum PR/issue é criado e nenhum segredo novo é necessário.
- Habilitar o Web Analytics no projeto Pages (passo manual registrado no runbook
  de CI/CD).
- Documentar que medir o **acesso do Agente** exige domínio próprio (adiado).

**Blocked by:** None.

**Status:** done

- [x] O job de links não falha e publica o resultado no resumo do run.
- [x] O resultado só aparece quando o job roda (diário/manual); nenhum arquivo,
      PR ou issue é gerado.
- [x] O teste puro da verificação de links cobre o novo comportamento.
- [x] Web Analytics habilitado e documentado em CI/CD; ADR-0013 e ADR-0014
      registrados.

## Origin

Sessão de `grill-with-docs` de 2026-10-18 (Fase 4). Ver `spec-fase-4.md` e ADR-0013.

## Comments

**2026-10-19 — revisão na implementação.** O requisito original de publicar
`reports/links-quebrados.md` (commitado só quando a lista muda) foi trocado pelo
resumo do run. Com `main` protegida, o arquivo versionado exigiria um PR automático
e um PAT só para guardar o resultado; o mantenedor preferiu zero PR/issue para
saber dos links quebrados. A verificação diária independe de commits. Decisão
registrada no ADR-0014 e refletida no ADR-0013.
