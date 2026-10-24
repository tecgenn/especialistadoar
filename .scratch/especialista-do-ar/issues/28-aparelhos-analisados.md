# 28 — Aparelhos analisados (selo, topo da tabela e aviso de afiliado)

**What to build:** publicar uma Análise faz o Aparelho virar **analisado**: na tabela
ele ganha o selo "Analisado", um link "Ler análise" e aparece **antes dos demais,
dentro dos filtros ativos, também quando a pessoa ordena** (a ordenação vale em cada
grupo). O grupo tem um cabeçalho dentro da tabela, "Analisados por nós", com "·
contém links de afiliado" quando algum analisado do resultado tem Oferta; o grupo dos
demais ganha o cabeçalho "Demais aparelhos" só quando há analisados. O build do site
monta o mapa `aparelhoId → { titulo, url, temOferta }` a partir das Análises válidas
cujo Aparelho está na Versão atual e o passa à ilha por propriedade; a base e o
`consulta.json` não mudam, e com zero Análises nada aparece. O aviso de afiliado é
visível em todos os pontos: o selo tem tooltip (hover, foco e toque) com o aviso;
cada cartão de Oferta ganha a etiqueta "Link de afiliado"; a faixa de Ofertas avisa
que podemos receber comissão; a Análise mostra o aviso no topo quando o Aparelho
tem Oferta.

**Blocked by:** 27 — Página Aparelhos.

**Status:** ready-for-agent

- [ ] O mapa é construído no build por `carregarAnalises` + `ofertasDoAparelho`; um
      Aparelho Ausente da Versão atual não entra.
- [ ] Os analisados vêm primeiro dentro dos filtros, também com ordenação por coluna;
      com zero Análises a tabela é idêntica à do ticket 27.
- [ ] O selo é acionável por teclado e por toque, o tooltip tem `aria-describedby` e
      a informação do aviso também aparece em texto visível (cabeçalho do grupo).
- [ ] `OfertaCartao` mostra a etiqueta "Link de afiliado" e `OfertaFaixa` o aviso de
      comissão, na ficha, na Análise e no MDX.
- [ ] A Análise com Oferta mostra o aviso no topo; sem Oferta, nenhum aviso vazio.
- [ ] `consulta.json`, `aparelhos.json` e `analises.json` não ganham campo editorial
      ou comercial (guarda por teste).
- [ ] Testes: o mapa com fixture (válida, Ausente, sem Oferta), o grupo no topo com
      filtros e ordenação, o tooltip por teclado/toque e o aviso na Análise.
- [ ] Nota no `README.md` (§Escrever uma Análise): a ligação segue manual por
      `aparelhoId` (`pnpm aparelho:buscar`).
