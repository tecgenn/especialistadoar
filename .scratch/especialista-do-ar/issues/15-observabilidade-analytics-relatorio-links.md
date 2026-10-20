# 15 — Observabilidade: Web Analytics e relatório de links quebrados

**What to build:** O tráfego humano do site passa a ser medido (Cloudflare Web
Analytics) e a verificação de links das Ofertas fica disponível sob demanda, pelo
comando `pnpm verificar-links` (ADR-0013 e ADR-0014).

- `pnpm verificar-links` imprime no terminal a lista de links quebrados (URL,
  loja, motivo); com tudo certo, registra isso de forma limpa. Não falha por link
  quebrado.
- Não há workflow/job agendado; nada é commitado, nenhum PR/issue é criado e
  nenhum segredo novo é necessário. Corrigir uma Oferta é um PR comum em
  `apps/site/ofertas.json`.
- Habilitar o Web Analytics no projeto Pages (passo manual registrado no runbook
  de CI/CD).
- Documentar que medir o **acesso do Agente** exige domínio próprio (adiado).
- Documentar o comando no README.

**Blocked by:** None.

**Status:** done

- [x] `pnpm verificar-links` lista URL/loja/motivo dos links quebrados e não falha
      por link quebrado.
- [x] A verificação é manual: nenhum workflow agendado, arquivo, PR ou issue é
      gerado.
- [x] O teste puro da verificação de links cobre o comportamento.
- [x] Web Analytics habilitado e documentado em CI/CD; ADR-0013 e ADR-0014
      registrados; README explica como verificar links quebrados.

## Origin

Sessão de `grill-with-docs` de 2026-10-18 (Fase 4). Ver `spec-fase-4.md` e ADR-0013.

## Comments

**2026-10-19 — revisão na implementação.** O requisito original de publicar
`reports/links-quebrados.md` (commitado só quando a lista muda) foi trocado pelo
resumo do run. Com `main` protegida, o arquivo versionado exigiria um PR automático
e um PAT só para guardar o resultado; o mantenedor preferiu zero PR/issue para
saber dos links quebrados. A verificação diária independe de commits. Decisão
registrada no ADR-0014 e refletida no ADR-0013.

**2026-10-19 — decisão final: manual, sem Actions.** O job agendado também foi
descartado: é infraestrutura (e notificação por e-mail/resumo de run) para uma
lista hoje vazia e que muda raramente. A verificação passa a ser só
`pnpm verificar-links`, impressa no terminal e documentada no README; o workflow
`verificar-links.yml` foi removido. ADR-0014 reescrito para essa decisão.
