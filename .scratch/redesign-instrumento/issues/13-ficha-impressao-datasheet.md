# 13 — Ficha: impressão do datasheet

**What to build:** a ficha pode ser impressa e levada para uma conversa de instalação. O papel mostra marca, modelo, versão da tabela, leituras principais, resumo, consumo e custo com os valores atuais, condições de ensaio, especificações e registros; navegação, botões, sombras e sticky desaparecem. A impressão é um requisito de produto, não um extra.

**Blocked by:** 11 — Ficha: corpo do datasheet; 12 — Ficha: calculadora de custo como painel de instrumento.

**Skills:** `impeccable` — `SKILL.md` + `reference/typeset.md`, `reference/polish.md`. `design-taste-frontend` — `references/perf.md`.

**Status:** ready-for-agent

- [ ] Existe um `@media print` com tipografia em preto sobre branco, links visíveis e sem fundos escuros que consumam tinta.
- [ ] Header, footer, navegação, botões, dock, índice sticky, sombras e animações são removidos ou reduzidos; o conteúdo não é cortado.
- [ ] Um cabeçalho de impressão mostra marca, modelo, Versão da tabela e origem INMETRO.
- [ ] Quebras de página controladas antes de Condições de ensaio e Especificações; títulos não ficam órfãos no fim da página.
- [ ] A calculadora imprime os valores atuais (UF, tarifa, horas, dias, custo mensal/anual) e o aviso de estimativa.
- [ ] Condições de ensaio e tabelas cabem em A4 retrato, com fonte legível e sem rolagem.
- [ ] A faixa de Ofertas, se existir, mantém o aviso de afiliado; se não existir, nenhum espaço vazio é deixado.
- [ ] Um teste de build confere a presença das regras de impressão e do cabeçalho de impressão na ficha.
