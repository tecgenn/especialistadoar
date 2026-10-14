# 12 — Ofertas e verificação de links

**What to build:** As Ofertas (links comerciais de afiliado) exibidas apenas no site — nunca misturadas aos dados técnicos — e um job que verifica se esses links continuam válidos.

- Uma Oferta é um link comercial para um Aparelho; não faz parte da base servida.
- O job de verificação reporta links quebrados.

**Blocked by:** 11 — Site (catálogo Astro).

**Status:** ready-for-agent

- [ ] Ofertas aparecem apenas no site.
- [ ] Nenhum campo de Oferta vaza para a base servida (`aparelhos.jsonl`/`.json`).
- [ ] Existe um job de verificação de links que reporta os quebrados.
- [ ] O job roda de forma agendada ou no CI.

## Origin

Migrado da issue #12 do GitHub (https://github.com/tecgenn/especialistadoar/issues/12) em 2026-10-14, ao mover o tracker deste repositório para markdown local.
