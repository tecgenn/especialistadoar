# 58 — Ofertas: Rótulo "Ver oferta" e Divulgação em Três Níveis

**What to build:** A Oferta de afiliado deixa de prometer um preço que o site não mostra: o rótulo passa a ser "Ver oferta" e a relação comercial fica declarada em três níveis discretos — junto do link, no rodapé e nos Termos de Uso. Junto do CTA, um marcador em texto pequeno e cor secundária diz que o link é de afiliado; a faixa de Ofertas troca o parágrafo longo por uma frase curta; o rodapé ganha uma linha ao lado da "Versão da tabela" apontando para os Termos. Nada de modal, banner, tooltip ou selo colorido: a divulgação existe para resguardar, não para chamar atenção.

**Blocked by:** 57 — Institucionais: Contato, Política de Privacidade e Termos de Uso

**Status:** done

- [x] O rótulo padrão da Oferta passa a "Ver oferta", inclusive na Oferta de produção
- [x] O cartão do CTA mostra a loja e, na mesma linha, um marcador "link de afiliado" em texto pequeno e cor de texto secundário
- [x] A faixa de Ofertas substitui o parágrafo atual por uma frase curta: link comercial, compra na loja e comissão sem custo ao visitante
- [x] O rodapé ganha uma linha discreta sobre links de afiliado, com link para os Termos de Uso, ao lado da "Versão da tabela"
- [x] Nenhum modal, banner, tooltip, ícone de alerta ou cor de destaque é usado na divulgação
- [x] Os atributos `rel="sponsored nofollow noopener"` e `target="_blank"` continuam centralizados num único componente
- [x] A Oferta continua aparecendo na ficha e na Análise, e o aviso acompanha o CTA em todos os lugares
- [x] Nenhum texto remanescente promete preço, desconto ou "menor preço"
- [x] Multi-loja continua funcionando sem mudança de contrato: uma Oferta nova é apenas uma linha no JSON do site
- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
