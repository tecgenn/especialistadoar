# 16 — Buscar Aparelho para o frontmatter

**What to build:** um comando de linha que busca na base servida por marca, modelo ou
potência e imprime os Aparelhos encontrados com **marca, modelo, potências (BTU) e
`id`** — o valor que o mantenedor copia para o `aparelhoId` de uma Análise. Sem ele,
escolher os Aparelhos exige caçar um hash no JSON.

O comando é para autoria de conteúdo; não altera a base servida nem o pipeline.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] `pnpm aparelho:buscar "<termo>"` lista os Aparelhos que casam por marca, modelo
      ou potência, com marca, modelo, potências e `id`.
- [x] Busca sem resultado imprime uma mensagem clara (nada de saída vazia).
- [x] Lê a base servida publicada; não cria artefato novo nem toca `data/build/`.
- [x] Testes do módulo puro cobrem match por marca, por modelo, por potência e
      resultado vazio.
- [x] Comando documentado no README.
- [x] `pnpm build && pnpm lint && pnpm typecheck && pnpm test` verdes.

## Origin

Sessão de `grill-with-docs` de 2026-10-20 (Fase 5). Ver
`.scratch/especialista-do-ar/spec-fase-5.md`, ADR-0015 e `CONTEXT.md` (Análise).
