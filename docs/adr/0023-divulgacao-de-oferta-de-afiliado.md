# Divulgação de Oferta de afiliado em dois níveis

**Status:** aceito — revisado em 2026-11-24 (ver notas de revisão)

**Data:** 2026-11-18

**Ticket:** 58 — Ofertas: Rótulo "Ver oferta" e Divulgação em Três Níveis

## Contexto

A Oferta nasceu como link comercial de afiliado, só no site, separada dos dados
técnicos (ADR-0010). Na prática ela tinha dois problemas: o rótulo **"Ver preço e
comprar"** prometia um preço que o site não exibe, e a transparência dependia de um
aviso único numa seção — quem chegava direto a um CTA podia clicar sem saber que o
link era comercial. Além disso, a Oferta não aparecia onde a decisão acontece (a
comparação), e a matriz precisava continuar neutra (ADR-0021).

## Decisão

A Oferta é identificada na tela por **"Ver oferta"** e a divulgação acontece em
**dois níveis**, ambos discretos (o texto abaixo é o vigente desde o fechamento da
Fase 12; as notas de revisão registram como se chegou aqui):

1. **Junto do link.** O CTA é um badge com o logotipo oficial da loja e o rótulo
   **"Ver oferta →"** fora dele, dentro do mesmo link. O aviso **"link de
   afiliado"** fica no `title` do logo — o tooltip nativo — e no nome acessível
   `Ver oferta — <loja> — link de afiliado`; não existe marcador visível nem nome
   de loja escrito. A faixa de Ofertas não repete parágrafo de divulgação.
2. **Institucional.** Os **Termos de Uso**, que dizem que o site não vende, não
   exibe preços e não processa pedidos, mais o bloco **"Transparência com o
   Leitor"** do rodapé de todas as páginas (independência, venda indireta e
   comissão sem custo adicional) e o banner do topo de cada Análise. O rodapé
   aparece inclusive em página sem Oferta: é letra miúda de transparência, não
   chamada comercial.

Regras que sustentam os dois níveis:

- **Rótulo padrão "Ver oferta"** (`ROTULO_OFERTA_PADRAO`): a Oferta não promete
  preço, desconto nem "menor preço". Uma Oferta pode sobrescrever o rótulo com
  `titulo`, mas o padrão é o da constante e a Oferta de produção não traz rótulo
  próprio.
- **Atributos centralizados**: `ATRIBUTOS_OFERTA`
  (`rel="sponsored nofollow noopener"`, `target="_blank"`) e `MARCADOR_OFERTA` vivem
  em `apps/site/src/lib/ofertas.ts`. `OfertaCartao` e o espelho `OfertaCartaoIsla`
  escrevem o mesmo link a partir dessas constantes, sem duplicar a política de
  `rel`, `target` e nome acessível. Assim o aviso, a nova aba e o `rel`
  acompanham **todo** CTA — ficha, Análise, destaques da home e comparação — sem
  duplicação de regra.
- **CTA na comparação, fora da matriz.** Com 2 ou 3 modelos, o cartão de cada
  modelo com Oferta publicada mostra o badge da loja e "Ver oferta →" na área de
  ações, ao lado de "Trocar" e "Remover". Modelo sem Oferta não gera CTA, espaço
  reservado nem botão desabilitado. A matriz de atributos (inclusive as linhas de
  custo estimado) continua sem linha, coluna, célula ou link comercial. As Ofertas
  são resolvidas e validadas no build (`ofertasPublicadas()`) e viajam nas props da
  ilha: o cliente não baixa `ofertas.json` nem faz chamada de rede nova.
- **Nada de modal, banner promocional ou selo colorido**, e nenhuma promessa de
  preço no texto dos CTAs ou das Análises (as duas frases do Samsung foram
  reescritas). O único tooltip do CTA é o `title` do logo, que apenas nomeia a
  relação comercial.

> **Revisão do ticket 108 (2026-11-23).** O nível 1 deixa de ser um marcador
> escrito visível: o CTA mostra o logotipo oficial da loja (Mercado Livre) e o
> aviso **"link de afiliado"** fica no `title` do logo — o tooltip nativo ao
> passar o ponteiro — e no nome acessível `Ver oferta — <loja> — link de
> afiliado`. A proibição de tooltip acima valia para selo promocional; este é o
> único tooltip do CTA e ele apenas nomeia a relação comercial. Os níveis 2 e 3
> continuam como descritos, e a Análise mantém o banner de transparência no topo.

> **Revisão visual do ticket 106 (2026-11-24).** O nível 1 passa a ser um badge
> de 2 px de raio com a cor oficial da loja: amarelo do Mercado Livre e fundo
> escuro da Amazon, cada um com o SVG oficial em 16 px de altura. O rótulo
> **"Ver oferta →"** fica fora do badge, dentro do mesmo link, e o nome da loja
> não é repetido em texto. O aviso continua só no `title` do logo e no nome
> acessível; os níveis 2 e 3 não mudam. O SVG do Mercado Livre existente foi
> mantido por ser path-based, e o da Amazon foi acrescentado com o wordmark
> branco e o sorriso laranja.

> **Fechamento da Fase 12 (ticket 110, 2026-11-24).** A divulgação passa a ter
> **dois níveis**, e este é o texto vigente sobre a apresentação:
>
> 1. **Junto do link** — o `title` do logo (tooltip nativo) e o nome acessível
>    `Ver oferta — <loja> — link de afiliado`. Não existe marcador visível: o
>    texto de `0,625 rem` que ficava dentro do link foi removido no ticket 108
>    junto do token `--texto-micro`, e o nome da loja também não aparece escrito.
> 2. **Institucional** — os Termos de Uso, onde a relação comercial, a ausência
>    de preços e de pedidos é explicada por extenso, mais o bloco "Transparência
>    com o Leitor" do rodapé de todas as páginas e o banner do topo de cada
>    Análise.
>
> O CTA não promete preço, desconto nem "menor preço": o rótulo é **"Ver oferta
> →"** e o badge com o logotipo oficial da loja é só identificação, nunca uma
> alegação comercial. A decisão original contava três níveis porque o marcador
> visível era um deles; sem ele, a transparência fica no link (nível 1) e no
> institucional (nível 2), que reúne os Termos, o rodapé e o banner da Análise.

> **Revisão do ADR-0010.** O ADR-0010 continua valendo no que é estrutural: a
> Oferta é um insumo curado **só do site** (`apps/site/ofertas.json`), validada no
> build, nunca um campo de Aparelho, nunca em `data/build/`, na API ou na consulta.
> Esta decisão revisa a **apresentação e a divulgação** — o rótulo que prometia
> preço, o aviso único que virou dois níveis e a entrada da Oferta na comparação —,
> e incorpora a revisão de 2026-10-19 que tornou a verificação de links manual
> (ADR-0014). Multi-loja continua suportado pelo contrato atual; abrir a Amazon é
> uma linha nova no JSON, sem código.

## Consequências

- O visitante decide com transparência sem que a página vire anúncio: a relação
  comercial está no tooltip e no nome acessível do CTA, e a matriz de dados fica
  imune ao comercial.
- Um CTA novo herda `rel`, `target` e o aviso só por usar o componente ou as
  constantes — o risco de um link comercial sem divulgação some no código, não na
  disciplina de quem escreve a página.
- O rodapé repete a informação em todas as páginas. É intencional e é barato; a
  alternativa (só onde há Oferta) esconderia a relação comercial de quem chega por
  um link direto.
- `data/build/` e `reports/` permanecem intocados: nada disso é dado de produto.
