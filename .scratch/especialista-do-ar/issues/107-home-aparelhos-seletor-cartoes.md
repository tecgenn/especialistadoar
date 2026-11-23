# 107 — Aparelhos em destaque: seletor de capacidade e cartões separados

**What to build:** os blocos empilhados “Aparelhos de 12.000 BTUs em destaque” viram **uma única seção “Aparelhos em destaque”**, com um seletor de capacidade em chips no cabeçalho e os modelos em cartões separados. Cada cartão tem marca, modelo, capacidade, tipo, IDRS, consumo anual, “Ler análise” quando existir e uma linha de Oferta por loja, com o logo do #106. Saem a contagem “431 aparelhos nesta capacidade” e o link “Ver os de 12.000 BTU/h”: a seção é uma entrada editorial, não um atalho para a tabela. Com uma só capacidade com conteúdo — o caso de hoje —, o seletor não vira um chip solitário: a capacidade aparece como rótulo estático e os chips só nascem quando houver duas ou mais.

**Blocked by:** 106.

**Skills:** `design-taste-frontend` — `references/cards.md`, `references/sections-library.md` e `references/layout-v4.md`. `impeccable` — `reference/component-review.md` e `reference/craft-floor.md`. `ui-ux-pro-max` — `"segmented control selector" --domain ux` e `"product spec card" --domain ux`.

**Status:** done

## Estrutura

- [x] `HomeDestaquesPorCapacidade.astro` substituído por `HomeDestaques.astro`, que recebe todos os blocos e renderiza uma seção só
- [x] Cabeçalho com o `CabecalhoDeSecao` do #102: ícone `ar-condicionado`, título “Aparelhos em destaque” e lead curto (“Modelos com análise publicada ou oferta, por capacidade.”)
- [x] Seletor em chips com `aria-pressed`, alvo de 44 px e foco ciano; um painel por capacidade, com `hidden` nos inativos
- [x] Com uma capacidade, o cabeçalho mostra “12.000 BTU/h” como rótulo estático, sem chips e sem botão desabilitado
- [x] Sem JavaScript, todos os painéis aparecem (o script só esconde os inativos depois de inicializar); nenhum conteúdo depende de hidratação
- [x] A capacidade selecionada não vai para a URL: a seção não cria variantes indexáveis

## Cartões

- [x] Grade de 3 colunas ≥ 1024 px, 2 colunas ≥ 640 px, 1 coluna abaixo; `align-items: stretch`
- [x] Cartão com fundo giz, borda de 1 px `--linha`, raio 4 px, padding de 24 px e hover de borda `--tinta` — sem sombra, sem pill
- [x] Marca em mono pequena, modelo como link em grotesca, capacidade e tipo em uma linha secundária
- [x] IDRS e consumo anual em duas leituras com rótulo mono e valor tabular, como na ficha
- [x] Ações: “Ler análise” (quando houver) e uma linha por Oferta com `LogoLoja` + “Ver oferta” + marcador mínimo
- [x] Nenhum cartão vazio, nenhum CTA desabilitado e nenhum espaço reservado para Oferta ausente
- [x] Sem contagem de aparelhos, sem “Ver os de …” e sem carrossel
- [x] `totalNaCapacidade` removido das props e do build; `contagensPorCapacidade` e `linkDaTabela` removidos se ficarem sem consumidor
- [x] 0 px de overflow em 320/390/768/1024/1440 px; o seletor rola em uma linha no celular se precisar
- [x] Testes de build conferem a seção única, o seletor, os cartões, as Ofertas múltiplas e a ausência da contagem/atalho
- [x] `DESIGN.md`, seção “Aparelhos em destaque (home)”, atualizado no mesmo commit

## Notas

- O #96 decidiu “sem seletor” porque só havia uma capacidade com conteúdo. O produto pediu o seletor agora; a decisão é revertida de propósito e o `DESIGN.md` registra a condição (chips só com duas ou mais capacidades) para o componente não nascer com um controle de um item só.
- O seletor é progressivo: o HTML servido já tem todos os painéis. O script só alterna `hidden` e `aria-pressed`, sem framework e sem nova ilha React.
