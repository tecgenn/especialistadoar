# 15 — Observabilidade: Web Analytics e relatório de links quebrados

**What to build:** O tráfego humano do site passa a ser medido (Cloudflare Web
Analytics) e a lista de Ofertas quebradas fica visível num arquivo versionado, sem
e-mail (ADR-0013).

- O job de verificação de links deixa de falhar e passa a escrever
  `reports/links-quebrados.md` com os links quebrados (URL, loja, motivo); sem
  quebrados, registra isso de forma limpa.
- O arquivo é commitado apenas quando a lista muda.
- Habilitar o Web Analytics no projeto Pages (passo manual registrado no runbook
  de CI/CD).
- Documentar que medir o **acesso do Agente** exige domínio próprio (adiado).

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] O job de links não falha e escreve `reports/links-quebrados.md`.
- [ ] O arquivo só muda/commita quando a lista muda.
- [ ] O teste puro da verificação de links cobre o novo comportamento.
- [ ] Web Analytics habilitado e documentado em CI/CD; ADR-0013 registrado.

## Origin

Sessão de `grill-with-docs` de 2026-10-18 (Fase 4). Ver `spec-fase-4.md` e ADR-0013.
