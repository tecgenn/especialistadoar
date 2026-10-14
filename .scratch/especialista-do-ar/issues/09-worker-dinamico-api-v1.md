# 09 — Worker dinâmico /api/v1

**What to build:** A parte dinâmica da API: um Worker na rota `/api/v1/...` que serve apenas busca, comparação entre Aparelhos e Valor calculado, sobre o dataset embutido.

- Valor calculado: derivado por conta determinística a partir de Valores oficiais e de entradas informadas por quem consulta (ex.: tarifa), sempre acompanhado da fórmula e das entradas usadas, para nunca ser confundido com um Valor oficial.
- O dataset é embutido: `aparelhos.jsonl`/`.json` são a fonte da verdade; o D1 é só plano B, derivado do JSONL.
- Acesso aberto no MVP, com regra de limite por IP na Cloudflare.

**Blocked by:** 08 — Módulo de consulta compartilhado com filtros e busca.

**Status:** ready-for-agent

- [ ] `/api/v1/...` serve busca, comparação e Valor calculado.
- [ ] Todo Valor calculado acompanha a fórmula e as entradas usadas.
- [ ] O Valor calculado nunca é apresentado como um Valor oficial.
- [ ] O Worker consome o dataset embutido, sem D1 como fonte da verdade.
- [ ] Existe regra de limite por IP.
- [ ] Testes cobrem cada rota dinâmica.

## Origin

Migrado da issue #9 do GitHub (https://github.com/tecgenn/especialistadoar/issues/9) em 2026-10-14, ao mover o tracker deste repositório para markdown local.
