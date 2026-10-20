# 14 — Relatório de revisão só em nova Versão da tabela

**What to build:** O Relatório de revisão deixa de ser anexado a **todo** PR: ele
só é anexado quando o PR traz uma nova **Versão da tabela**, para que PRs de
código/site não gerem o comentário-e-mail de "0 novos / 0 alterados" (ADR-0012).

- Condicionar o job que publica o Relatório ao evento "o PR adiciona uma nova
  exportação em `data/raw/`" (filtro de caminho ou checagem dos arquivos alterados).
- Manter o portão de reprodutibilidade (`data/build`/`reports`) e o `build`
  rodando em **todo** PR.
- Documentar as duas trilhas (Código/Site e Tabela) no runbook de CI/CD.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] PR sem mudança em `data/raw/` não gera o comentário de Relatório (sem e-mail).
- [x] PR que adiciona uma nova exportação (`data/raw/…csv`) gera o comentário.
- [x] O portão de reprodutibilidade continua em todo PR.
- [x] Runbook de CI/CD atualizado; ADR-0012 registrado.

## Origin

Sessão de `grill-with-docs` de 2026-10-18 (Fase 4). Ver `spec-fase-4.md` e ADR-0012.
