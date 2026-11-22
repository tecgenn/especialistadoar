# 105 — Remover “Cobertura da base” do meio da home

**What to build:** a faixa “Cobertura da base” — 2.236 aparelhos, 70 marcas, 44 capacidades — sai da home. Ela interrompe o caminho entre o simulador e os aparelhos em destaque, repete uma informação que o visitante não pediu e transforma a home num painel de vaidade. As contagens continuam existindo onde têm função: na `description` da página e nos números que o simulador devolve para a capacidade calculada. **Nenhuma contagem da base é recolocada no rodapé ou em outra seção** para compensar a remoção.

**Blocked by:** 102.

**Skills:** `impeccable` — `reference/distill.md` e `reference/craft-floor.md`. `design-taste-frontend` — `references/layout-v4.md` (ritmo entre seções).

**Status:** ready-for-agent

- [ ] `<section class="home-confianca">` removida de `index.astro`
- [ ] CSS `.home-confianca*` removido de `global.css`, inclusive do agrupamento de seções com hairline
- [ ] `porCapacidade` e `contagens` continuam sendo calculados apenas se ainda tiverem uso; `contarBase` permanece para a `description`
- [ ] Nenhuma contagem de aparelhos/marcas/capacidades aparece no rodapé, no hero ou na metodologia como substituta
- [ ] O respiro entre o simulador e a próxima seção não dobra: a seção seguinte assume a hairline superior
- [ ] Testes de build conferem a ausência de `.home-confianca`, de “Cobertura da base” e das três contagens no HTML
- [ ] `DESIGN.md` atualizado no mesmo commit, removendo a cobertura da ordem das seções e da descrição do hero

## Notas

- A remoção não é uma perda de transparência: a origem dos dados continua no rodapé (“Proveniência”), na metodologia e na nota de fontes que o #109 leva para o rodapé.
- Se um teste de contagem da home depender de `porCapacidade` só para a cobertura, ele sai junto. O #107 decide se `contagensPorCapacidade` ainda tem consumidor.
