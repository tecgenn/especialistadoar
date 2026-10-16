# Especialista do Ar

Base estruturada e versionada de aparelhos de ar-condicionado, construída a partir
da exportação oficial de produtos do INMETRO (um CSV) e consumida por agentes de
IA e por um site. O objetivo é que ninguém precise interpretar a exportação bruta.

- **Vocabulário e conceitos do domínio:** `CONTEXT.md`
- **Como o código está estruturado:** `docs/agents/architecture.md`
- **O que já está pronto e o que vem a seguir:** `docs/agents/project-state.md`
- **Decisões e porquês:** `docs/adr/`
- **Setup manual de CI e publicação (GitHub + Cloudflare):** `docs/agents/ci-cd-setup.md`

## Requisitos

- Node 24 (`node -v`)
- pnpm 10 (`corepack enable`, que passa a ler a versão de `packageManager`)

## Comandos

```bash
pnpm install

pnpm build       # CSV bruto + curadoria -> data/build/ + reports/
pnpm test        # suíte Vitest (uma passada)
pnpm test:watch  # Vitest em watch
pnpm typecheck   # tsc --noEmit
pnpm lint        # Biome (check, não altera)
pnpm lint:fix    # Biome (corrige)
pnpm format      # Biome format
```

## ⚠️ Antes de dar push

Rode a suíte completa **e** o build antes de enviar qualquer mudança:

```bash
pnpm build && pnpm lint && pnpm typecheck && pnpm test
```

E **commite os artefatos gerados junto com a mudança** sempre que ela tocar o CSV
bruto (`data/raw/`) ou a camada curada (`data/excecoes-manuais.jsonl`,
`data/vinculos-confirmados.jsonl`). O `pnpm build` regenera `data/build/` e
`reports/revisao-<data>.md`; esses arquivos são **commitados** e o CI falha se
divergirem de um build novo (o gate *"Published artifacts match a fresh build"*).

**Nunca edite `data/build/` à mão** — ele é derivado. Alterações de conteúdo
passam só pela camada curada (Exceção manual, Vínculo confirmado); o resto é regra
de formato no pipeline.

## Contribuição

Trabalhe em uma branch e abra um Pull Request para `main` (a branch é protegida por
PR + check do CI). O merge é a publicação (ADR-0004). Detalhes do fluxo e das ações
manuais necessárias em `docs/agents/ci-cd-setup.md` e `AGENTS.md`.
