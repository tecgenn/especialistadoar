# 22 — Chips de marca e capacidade no catálogo

**What to build:** os dois filtros do catálogo passam a abrir pelas marcas e capacidades
que as pessoas procuram. As 10 marcas conhecidas (Samsung, LG, Midea, TCL, Elgin,
Hisense, Daikin, Fujitsu, Hitachi, Gree) e as 6 capacidades comuns (9.000 a 36.000
BTU/h) viram chips visíveis, a um clique; cada `<select>` guarda "Todas…" mais o resto
(61 marcas, 42 capacidades). Um clique aplica o filtro e escreve a URL; clicar de novo no
chip ativo limpa; escolher no `<select>` desliga o chip, de modo que nunca há dois
valores ao mesmo tempo; "Limpar filtros" continua aparecendo só com filtro ativo. Os
chips quebram linha no celular e são anunciados como pressionados. A curadoria (marcas
com rótulo e capacidades) é um insumo do site, validado no build; valor curado ausente
da base é escondido em silêncio.

**Blocked by:** 21 — Marca de catálogo (Midea e Fujitsu).

**Status:** ready-for-agent

- [ ] A curadoria do site é validada no build (rótulo não vazio, sem duplicata,
      capacidade inteira positiva); valor curado que não existe na base é ocultado sem
      falhar o build.
- [ ] As opções derivadas no build trazem as marcas conhecidas na ordem curada e o resto
      alfabético, e as capacidades comuns crescentes separadas das demais (as seis em
      cima, as outras 42 abaixo).
- [ ] A ilha filtra ao clicar no chip e reflete na URL; segundo clique limpa; escolher no
      `<select>` desliga o chip; o estado restaurado da URL acende o chip certo.
- [ ] Os chips são alcançáveis por teclado e anunciados como pressionados por leitor de
      tela; no celular todos continuam visíveis, quebrando linha.
- [ ] `pnpm build:site` verde e nenhum artefato de `data/build` alterado por este
      ticket.
