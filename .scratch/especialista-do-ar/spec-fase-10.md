# Spec — Fase 10: Comparação de Aparelhos, tabela central e vitrine de Análises

## Problem Statement

Quem chega ao site para escolher um ar-condicionado precisa **comparar** dois ou três Aparelhos lado a lado — capacidade, consumo, IDRS, Classe, tensão —, mas hoje só consegue abrir uma ficha por vez e decorar os números. Não há seleção na tabela, não há página de comparação e não há link compartilhável de uma comparação.

A interface acumulou atritos:

1. **Tabela**: os filtros ocupam uma barra lateral fixa que espreme a tabela e obriga a rolar dentro do painel. A tabela tem 7 colunas iguais, sem lugar para selecionar Aparelhos nem para o selo "Análise" — que hoje fica escondido dentro da célula de Marca.
2. **Vitrine "Aparelhos com análise"**: o bloco foi feito para acompanhar os filtros, mas **desaparece** quando nenhum Aparelho analisado passa no recorte. É justamente aí que ele deveria continuar promovendo Análises — o visitante que filtra LG não vê nenhuma Análise e perde o caminho para uma boa alternativa de outra marca. Pior: quando um analisado passa no filtro, ele aparece **duas vezes**, na vitrine e puxado para o topo da tabela.
3. **Descoberta**: a comparação não tem porta de entrada no menu nem estado vazio explicando como usar.

## Solution

Uma sessão de **Comparação** de Aparelhos, até **3 modelos**, com duas portas de entrada que compartilham o mesmo contrato de URL:

- **Na tabela**, uma coluna de checkbox à esquerda permite selecionar até 3 Aparelhos; uma barra de ação mostra a contagem e leva para a comparação.
- **Na página `/comparar/`**, três campos de busca com sugestões (combobox) deixam montar a comparação do zero, sem passar pela tabela, e a comparação aparece como uma matriz neutra de atributos.

A seleção vive na URL (`?ids=`), sobrevive a recarregar, é compartilhável e não se mistura com os filtros.

Junto com isso, a tabela vira **central e compacta**: sem barra lateral, busca em largura total, "Pesquisa avançada" recolhível com resumo do recorte efetivo, ordenação acima da tabela e o selo "Análise" numa coluna própria à direita.

A vitrine "Aparelhos com análise" passa a ser **sempre visível** e a preencher até 6 cartões: primeiro os analisados que passam no recorte, depois Aparelhos similares de outras marcas — capacidade, marca conhecida, similaridade de atributos e recência da Análise, nessa ordem. A tabela deixa de puxar os analisados para o topo: eles ficam na ordem natural, destacados e com o selo.

## User Stories

### Comparação — entrada pela tabela

1. Como visitante da tabela, quero marcar Aparelhos com um checkbox na primeira coluna, para escolher o que vou comparar sem sair da lista.
2. Como visitante da tabela, quero ver no cabeçalho da coluna de seleção o rótulo "Comparar", para entender o que aqueles checkboxes fazem.
3. Como visitante da tabela, quero que o checkbox seja a primeira coisa da linha, para que a seleção não se confunda com os dados técnicos.
4. Como visitante da tabela, quero ver a contagem de modelos selecionados numa barra de ação, para saber quanto falta para comparar.
5. Como visitante da tabela, quero que o botão "Comparar" só habilite com 2 ou 3 modelos, para não abrir uma comparação de um item só.
6. Como visitante da tabela, quero que, ao chegar em 3 selecionados, os demais checkboxes fiquem desabilitados, para não perder a seleção por engano.
7. Como visitante da tabela, quero uma mensagem curta explicando o limite de 3, para entender por que não consigo marcar mais.
8. Como visitante da tabela, quero um botão "Limpar seleção", para recomeçar sem desmarcar um por um.
9. Como visitante da tabela, quero que a seleção sobreviva a recarregar a página e a mudanças de filtro, para não perder o que marquei enquanto refino o recorte.
10. Como visitante da tabela, quero que "Limpar filtros" não apague minha seleção, para que limpar o recorte não desfaça a comparação.
11. Como visitante no celular, quero o checkbox como primeira linha do cartão do Aparelho, para marcar sem abrir a ficha.
12. Como visitante da tabela, quero poder compartilhar a URL com a seleção, para mandar a comparação para outra pessoa.

### Comparação — página própria

13. Como visitante, quero um item "Comparar" no menu entre "Aparelhos" e "Assistente", para achar a ferramenta sem passar pela tabela.
14. Como visitante, quero abrir `/comparar/` sem nada selecionado e ver um estado vazio que explica a ferramenta, para saber o que fazer em seguida.
15. Como visitante, quero três campos de busca sempre visíveis, para montar a comparação do zero.
16. Como visitante, quero digitar marca, modelo, capacidade ou tipo num campo e ver sugestões, para não precisar saber o nome exato do modelo.
17. Como visitante, quero navegar pelas sugestões com o teclado, para escolher sem usar o mouse.
18. Como visitante, quero ver em cada sugestão marca, modelo, capacidade e tipo, para distinguir modelos parecidos.
19. Como visitante, quero que o modelo escolhido vire um cartão com "Trocar" e "Remover", para ajustar a comparação sem recomeçar.
20. Como visitante, quero que os campos sejam posicionais, para que remover o do meio aproxime os seguintes.
21. Como visitante, quero comparar com 1 modelo selecionado e ver um convite para adicionar outro, para não ficar numa tela vazia.
22. Como visitante, quero comparar 2 ou 3 modelos numa matriz de atributos, para decidir com os números lado a lado.
23. Como visitante, quero ver Marca, Modelo, link da ficha e o selo "Análise" no cabeçalho de cada coluna, para identificar cada modelo e saber se ele tem Análise.
24. Como visitante, quero comparar Tipo, Função, Capacidade, Tensão, Consumo anual, IDRS e Classe, para cobrir as decisões de compra.
25. Como visitante, quero uma comparação neutra, sem selo de "melhor valor", para não confundir um dado oficial com uma recomendação.
26. Como visitante, quero um botão "Limpar comparação", para zerar os três campos de uma vez.
27. Como visitante no celular, quero a matriz com a coluna de atributos fixa e rolagem horizontal, para manter o lado a lado.
28. Como visitante no celular, quero uma dica visível de que a matriz rola, para descobrir as outras colunas.
29. Como visitante, quero receber `/comparar/?ids=...` com a mesma seleção da tabela, para que a comparação abra pronta.
30. Como visitante, quero um aviso discreto quando um id do link é desconhecido ou repetido, para entender por que o modelo não apareceu.
31. Como visitante, quero que a URL da comparação baste para reconstruí-la em outro navegador, para não depender de estado guardado no meu dispositivo.

### Tabela central e filtros

32. Como visitante, quero a tabela centralizada numa coluna de leitura confortável, para não perseguir dados de ponta a ponta da tela.
33. Como visitante, quero a busca em largura total acima de tudo, para começar pelo caminho mais direto.
34. Como visitante, quero um botão "Pesquisa avançada" que abre os filtros, para que a página abra compacta.
35. Como visitante, quero ver um resumo dos filtros ativos em chips com "×", para saber o recorte sem abrir o painel.
36. Como visitante, quero que o resumo inclua o padrão implícito de 220 V, para enxergar o recorte efetivo.
37. Como visitante, quero que o "×" do 220 V desligue o padrão, para ver todas as tensões sem caçar o controle no painel.
38. Como visitante, quero que o painel avançado já abra quando a URL traz um filtro avançado, para não esconder um recorte vindo de link.
39. Como visitante, quero a ordenação numa linha compacta acima da tabela, para não confundi-la com um filtro.
40. Como visitante, quero os filtros e a busca acima da vitrine de Análises, para que a vitrine reflita o recorte.
41. Como visitante, quero que os filtros e a busca fiquem acima do bloco de analisados mesmo no celular, para manter a ordem de leitura.

### Tabela — colunas

42. Como visitante, quero a coluna "Análise" como a última à direita, para identificar de relance quais Aparelhos têm Análise.
43. Como visitante, quero o selo "Análise" com link para a Análise, para abrir o texto editorial.
44. Como visitante, quero que a coluna "Análise" só exista quando houver ao menos uma Análise publicada, para não exibir uma coluna vazia.
45. Como visitante, quero uma tabela mais compacta, com tipografia e espaçamento menores, para ver mais Aparelhos sem rolar.
46. Como visitante no celular, quero o selo "Análise" como última linha do cartão, para manter a mesma hierarquia do desktop.

### Vitrine "Aparelhos com análise"

47. Como visitante, quero que a vitrine nunca desapareça quando existe ao menos uma Análise publicada, para sempre ter um caminho editorial.
48. Como visitante, quero ver primeiro os analisados que passam no meu recorte, para que a vitrine converse com o que estou procurando.
49. Como visitante, quero que os cartões restantes tragam analisados de outras marcas com capacidade próxima, para ver uma alternativa quando a minha marca não tem Análise.
50. Como visitante, quero que a vitrine sempre preencha até 6 cartões quando houver Análises suficientes, para aproveitar a área.
51. Como visitante, quero uma legenda explicando quando os cartões estão fora do recorte, para não achar que o filtro foi ignorado.
52. Como visitante, quero ver capacidade e tipo em cada cartão, para avaliar a alternativa sem abrir a ficha.
53. Como visitante, quero que a tabela não puxe os analisados para o topo, para não ver o mesmo Aparelho duas vezes na mesma dobra.
54. Como visitante, quero que os analisados continuem destacados na tabela, com o selo à direita, para reconhecê-los na ordem natural.
55. Como visitante que filtra uma marca sem Análise, quero ainda ver Análises de outras marcas, para não sair de mãos vazias.

## Implementation Decisions

### Vocabulário e documentação

- **Comparação**: a seleção de até 3 Aparelhos e a matriz de atributos que os confronta. Vive em `/comparar/` e é endereçável por `?ids=`.
- **Aparelho similar**: Aparelho analisado que não passa no recorte ativo, mas é oferecido na vitrine por capacidade, marca conhecida, atributos em comum e recência da Análise. Não é uma recomendação de compra.
- **Aparelho analisado** (revisão): continua sendo o Aparelho com Análise publicada, com selo e destaque na tabela; a vitrine passa a ser **sempre visível**, preenche até 6 cartões e a tabela **não** promove analisados ao topo.
- **Filtros padrão** (revisão): o resumo da pesquisa avançada mostra o recorte efetivo, incluindo o 220 V implícito.
- Novo ADR-0021 "Comparação de Aparelhos no site": limite de 3, contrato `?ids=` separado dos filtros, comparação neutra e ausência de mudança no pipeline.
- `CONTEXT.md`, `docs/agents/architecture.md`, `README.md` e `docs/agents/project-state.md` são atualizados no ticket de fechamento.

### Contrato de URL da Comparação

- Chave única **`ids`**, usada tanto na tabela quanto em `/comparar/`: `?ids=id1,id2,id3`.
- Ordem preservada; máximo de **3**; ids repetidos e ids desconhecidos são descartados na leitura; a página avisa quantos foram descartados.
- Slots posicionais: o primeiro id ocupa o campo 1, o segundo o campo 2, o terceiro o campo 3; remover o do meio aproxima os seguintes.
- `ids` **não** entra em `FiltrosConsulta`: a leitura de filtros ignora a chave e a serialização de filtros nunca a escreve.
- Ao atualizar filtros, ordenação ou busca, a tabela preserva o `ids` corrente da URL; "Limpar filtros" também preserva; "Limpar seleção" remove só `ids`.
- `?ids=` é estado de interface: a página `/comparar/` publica canonical sem a chave e não entra no sitemap com ids.

### Módulos

- **Novo módulo puro de Comparação** (site, sem DOM): lê e escreve o contrato `ids` (ordem, limite, deduplicação, descarte com contagem), e monta as linhas da matriz a partir de `ItemConsulta` (Tipo, Função, Capacidade, Tensão, Consumo anual, IDRS, Classe), reutilizando a formatação de faixa já usada na tabela e na ficha.
- **`analises` (puro)**: ganha a seleção da vitrine — recebe os Aparelhos analisados com seus dados de consulta, o recorte ativo e a ordem das Análises, e devolve até 6 itens com um sinalizador de "fora do recorte".
- **Ilha da tabela**: checkbox como primeira coluna, selo "Análise" como última, barra de ação, layout central, busca e "Pesquisa avançada" com resumo, ordenação fora do painel, e a vitrine sempre visível. Deixa de agrupar analisados no topo.
- **Nova ilha de Comparação**: três comboboxes com sugestões, cartões de modelo com "Trocar"/"Remover", matriz de atributos, estado vazio e estados de 1, 2 e 3 modelos, aviso de ids descartados, "Limpar comparação".
- **Nova página `/comparar/`** e item "Comparar" no menu.
- O dataset continua sendo o `consulta.json` já publicado, baixado pela ilha; nenhuma chamada nova de API.

### Busca e combobox

- As sugestões usam o mesmo motor MiniSearch da tabela sobre o `consulta.json`, limitadas a ~8 resultados, mostrando marca, modelo, capacidade e tipo.
- Combobox acessível: papel de combobox, lista de opções, navegação por setas, Enter para escolher, Esc para fechar, foco visível.
- O modelo escolhido substitui o campo por um cartão compacto com "Trocar" (devolve o campo) e "Remover" (libera o slot).

### Ordem dos similares na vitrine

1. **Compatíveis**: analisados que passam no recorte ativo, sempre primeiro.
2. **Capacidade**: correspondência exata com o BTU do recorte; depois, capacidade presente no conjunto filtrado; depois, menor distância relativa de capacidade. Recorte vazio pula a capacidade.
3. **Marca conhecida**: as marcas curadas do site vêm antes das demais.
4. **Similaridade**: mais atributos em comum com o recorte (Tipo, Função, Classe, Tensão).
5. **Recência da Análise**: a mais recente desempata.

A vitrine preenche até 6 cartões sempre que houver Análises suficientes; o recorte define prioridade, nunca esvazia o bloco. Quando não há nenhum compatível, uma legenda explica que os cartões estão fora do recorte e cita a marca filtrada.

### Layout

- Tabela e filtros numa coluna única centralizada, com teto de 72 rem.
- Ordem vertical: busca → linha de "Pesquisa avançada" com chips do recorte efetivo e "Limpar filtros" → painel avançado (Marca, Capacidade, Função, Tensão, Tipo, Classe) → barra de seleção → vitrine → ordenação → tabela.
- O painel avançado abre automaticamente quando a URL traz filtro avançado; começa fechado.
- A tabela tem 9 colunas: seleção, Marca, Modelo, Tipo, BTU/h, Consumo, IDRS, Classe e Análise. Seleção e Análise têm largura fixa; as demais dividem o restante. A coluna Análise só é renderizada se houver ao menos uma Análise.
- No celular, cada Aparelho vira cartão com o checkbox como primeira linha e o selo "Análise" como última.
- A comparação mantém a matriz no celular: coluna de atributos fixa, colunas dos modelos com rolagem horizontal e dica visível.

## Testing Decisions

Um bom teste aqui exercita **comportamento externo**: o que a pessoa vê, o que a URL passa a conter e em que ordem os itens aparecem. Nada de testar estado interno de componente, nomes de classes ou detalhes de implementação.

Seams, do mais alto para o mais baixo:

1. **Ilhas no DOM (jsdom)** — o seam principal, já usado pela tabela e pelo Assistente. Cobre seleção, limite, barra de ação, preservação de `ids`, vitrine sempre visível e ordem dos cartões, comboboxes, estados 0/1/2/3 e a matriz.
2. **Módulo puro de Comparação** — contrato `ids` (ordem, limite, dedupe, desconhecidos, contagem de descartes) e valores das linhas da matriz.
3. **`analises` (puro)** — seleção e ordenação da vitrine, incluindo o caso de recorte vazio e o desempate por recência.

Prior art: os testes de ilha da consulta e do Assistente, e os testes puros de estado, análise e tabela já existentes.

Cobertura mínima por comportamento:

- Selecionar, desmarcar, chegar a 3 (demais desabilitados), "Comparar" habilitado só com 2–3, "Limpar seleção".
- `?ids=` preservado ao mudar filtro, ordenação e busca; removido só por "Limpar seleção"; "Limpar filtros" não o apaga.
- Página de comparação: 0 modelos (estado vazio), 1 (convite), 2 e 3 (matriz); adicionar por sugestão; trocar e remover; ids inválidos descartados com aviso.
- Vitrine: some nunca; compatíveis primeiro; similares completam até 6; legenda quando só há similares; nenhum analisado puxado ao topo da tabela.
- Coluna "Análise" à direita e coluna de seleção à esquerda; ausência da coluna Análise quando não há Análise.
- "Pesquisa avançada": começa fechada, abre com filtro na URL, resumo mostra o 220 V implícito e o "×" grava `tensao=`.

## Out of Scope

- Destaque de "melhor valor" (menor consumo, maior IDRS) na matriz.
- Comparação de preços, Ofertas ou links de afiliado lado a lado.
- Mais de 3 modelos por comparação.
- Guias e rankings editoriais.
- Persistir comparações no servidor, histórico de comparações ou imagens/PDF compartilháveis.
- Mudanças no pipeline, em `data/build`, na API ou em `reports`.
- Mudança do recorte padrão (o 220 V implícito continua).
- Renderização da matriz sem JavaScript: como a tabela, a comparação é uma ilha que baixa o `consulta.json`; o HTML publicado traz o estado vazio e o conteúdo é montado no cliente.

## Further Notes

- Hoje existe **uma única Análise publicada** (Samsung WindFree AI Pro 12.000). Na prática, a vitrine quase sempre mostrará esse Aparelho quando o recorte não for Samsung — o que é o comportamento desejado e o motivo da legenda de "fora do recorte".
- A vitrine continua sem alterar contagem, ordenação nem "Mostrar mais" da tabela.
- O menu passa a ter Aparelhos, Comparar, Assistente e, quando houver Análise publicada, Análises.
- O contrato `?ids=` é o mesmo nos dois lugares de propósito: um link de comparação gerado na tabela abre a página pronta, e a página pode ser usada sozinha.
- A comparação é neutra: os valores são oficiais (ou faixas, quando o Aparelho tem mais de uma Variante) e a leitura editorial fica nas Análises.
