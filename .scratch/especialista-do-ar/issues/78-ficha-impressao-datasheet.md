# 78 — Ficha: impressão do datasheet

**What to build:** a ficha pode ser impressa e levada para uma conversa de instalação. O papel mostra marca, modelo, versão da tabela, leituras principais, resumo, consumo e custo com os valores atuais, condições de ensaio, especificações e registros; navegação, botões, sombras e sticky desaparecem. A impressão é um requisito de produto, não um extra.

**Blocked by:** 76 — Ficha: corpo do datasheet; 77 — Ficha: calculadora de custo como painel de instrumento.

**Skills:** `impeccable` — `SKILL.md` + `reference/typeset.md`, `reference/polish.md`. `design-taste-frontend` — `references/perf.md`.

**Status:** done

- [x] Existe um `@media print` com tipografia em preto sobre branco, links visíveis e sem fundos escuros que consumam tinta.
- [x] Header, footer, navegação, botões, dock, índice sticky, sombras e animações são removidos ou reduzidos; o conteúdo não é cortado.
- [x] Um cabeçalho de impressão mostra marca, modelo, Versão da tabela e origem INMETRO.
- [x] Quebras de página controladas antes de Condições de ensaio e Especificações; títulos não ficam órfãos no fim da página.
- [x] A calculadora imprime os valores atuais (UF, tarifa, horas, dias, custo mensal/anual) e o aviso de estimativa.
- [x] Condições de ensaio e tabelas cabem em A4 retrato, com fonte legível e sem rolagem.
- [x] A faixa de Ofertas, se existir, mantém o aviso de afiliado; se não existir, nenhum espaço vazio é deixado.
- [x] Um teste de build confere a presença das regras de impressão e do cabeçalho de impressão na ficha.

**Implementação (2026-11-28):** a ficha ganhou a folha de papel. Em
`apps/site/src/pages/aparelhos/[id].astro`, um bloco `.ficha-impressao` oculto na
tela abre o artigo com o nome do site, `Marca — Modelo` e a linha mono
`Origem: INMETRO · Versão da tabela: <hash> · obtida em <data>`, lida do mesmo
`manifest.json` e do mesmo `versaoAtualDo` do rodapé; o link "Ver outros
aparelhos da marca" recebeu `.ficha-outros`, para sair do papel. `global.css`
ganhou `@page` (A4 retrato, 16mm × 14mm) e o bloco `@media print`: tokens em
preto sobre branco, zero sombras/animações/transições, fundos transparentes
dentro de `.aparelho`, cabeçalho/rodapé/navegação/trilha/ações/índice escondidos,
escala em pt, `break-after: avoid` nos títulos, `orphans`/`widows: 3` e
`break-before: page` em Condições de ensaio e Especificações. As tabelas de
ensaio perdem rolagem, `sticky` e `nowrap` e usam a largura do papel em 9 pt; a
calculadora imprime UF, tarifa, horas e dias como texto (valor e unidade juntos,
sem caixa nem seta), com a leitura em 18 pt, os fatores, a conta aberta e o aviso
de estimativa. Em `OfertaFaixa.astro` a divulgação de afiliado ganhou uma nota
visível só na impressão; em `primitivos/OfertaCartao.astro` o badge colorido dá
lugar ao nome da loja em texto (`data-loja` + `::before`), porque no papel não há
tooltip e o fundo escuro da Amazon gastaria tinta. `DESIGN.md` (seção Ficha, com
a exceção registrada à linha única da Versão da tabela, e componente Oferta)
registrou a decisão no mesmo commit. O teste de build `analises-build` confere o
cabeçalho de impressão e as regras; a contagem da Versão da tabela passou a
ignorar o bloco `.ficha-impressao` (ele não existe na tela).

**Checks:** Vitest 806/806 (51 arquivos), `pnpm typecheck` OK, `pnpm lint` 0
erros (69 warnings: os 56 pré-existentes mais 7 `noImportantStyles` e 6
`noDescendingSpecificity` do bloco de impressão), `pnpm build:site` gera 2.433
páginas e `data/build`/`reports` seguem intocados. No navegador (agent-browser,
preview 127.0.0.1:4321; PDF pela impressão do Chrome em A4): a ficha
`ap-03be1a749866` fecha em 4 páginas — capa com cabeçalho, leituras, resumo e
explicadores; calculadora + "Como calculamos"; condições de ensaio em folha
própria, com a tabela inteira (largura do papel, sem rolagem); especificações,
registros, proveniência e Ofertas, estas com "Ver oferta → · Amazon" e a nota de
afiliado. Com `?uf=RJ&horas=10` o papel mostra Rio de Janeiro, 0,971, 10 h, 30
dias, custo mensal R$ 43,58 e anual R$ 523,00 — os valores atuais, não os
padrões. A ficha de duas Variantes (`ap-50bd04d14145`) imprime IDRS e consumo em
faixa e as duas tabelas de ensaio sem quebrar. Na tela, `.ficha-impressao`,
`.ofertas-aviso-impressao` e `.oferta-cta-loja-impressao` seguem com
`display: none` e não há overflow horizontal. Divergência registrada: a ficha de
9.000 BTUs deixa a metade de baixo da primeira página em branco, porque a
calculadora inteira não quebra entre páginas e Condições de ensaio começa em
folha própria — preferível a cortar o painel.
