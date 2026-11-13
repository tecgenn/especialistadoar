# Comparação de Aparelhos no site

**Status:** aceito

**Data:** 2026-11-12

**Ticket:** 49 — Comparação: Contrato `ids` e Página `/comparar/`

## Contexto

Quem chega ao site para escolher um ar-condicionado precisa confrontar dois ou
três Aparelhos — capacidade, consumo, IDRS, Classe, tensão —, mas a tabela só
abre uma ficha por vez. Não havia porta de entrada para comparar, nem link que
reconstruísse uma comparação em outro navegador.

A comparação precisa funcionar no site estático, sem backend nem estado no
servidor, e não pode se confundir com um ranking: os números são os Dados
declarados do INMETRO e o site não recomenda um "melhor aparelho".

## Decisão

A **Comparação** é uma seleção de até **3** Aparelhos com uma matriz neutra de
atributos, acessível em `/comparar/` e endereçável por `?ids=id1,id2,id3`.

- **Limite de 3.** Três modelos cobrem a decisão de compra sem transformar a
  matriz numa planilha ilegível no celular. O limite vive numa constante
  (`MAXIMO_COMPARACAO`) usada pela página e, adiante, pela tabela.
- **Contrato `?ids=` separado dos filtros.** A chave `ids` é a única fonte da
  seleção, com a ordem preservada. Ela **não** entra em `FiltrosConsulta`: a
  leitura e a escrita dos filtros ignoram a chave, e a comparação nunca se perde
  ao mudar filtro, ordenação ou busca. Ids repetidos, desconhecidos e além do
  limite são descartados na leitura, contados, e a página avisa quantos caíram.
- **Estado de interface.** A seleção é reconstruída só pela URL, então o link
  abre a mesma comparação em outro navegador; não há histórico no servidor nem
  persistência local. A página `/comparar/` publica canonical sem `ids` e não
  indexa uma comparação específica.
- **Comparação neutra.** As linhas são Tipo, Função, Capacidade, Tensão, Consumo
  anual, IDRS e Classe, com faixa quando o Aparelho tem mais de uma Variante e
  travessão quando o valor falta. Nenhum valor recebe destaque de "melhor": a
  leitura editorial fica nas Análises.
- **Nada muda no pipeline.** A comparação lê o `consulta.json` já publicado, com
  as mesmas funções de formatação da tabela e da ficha; não há campo novo em
  `data/build/`, na API ou em `reports`.

O contrato `ids` e as linhas da matriz vivem em
`apps/site/src/lib/comparacao.ts` (puro, sem DOM), e a ilha
`apps/site/src/components/Comparar.tsx` só coleta a seleção e renderiza.

## Consequências

- Um link de comparação gerado na tabela e um link aberto direto em
  `/comparar/` são o mesmo contrato: a tabela (ticket 51) só precisa escrever e
  preservar `ids`.
- Recorte, busca e ordenação da tabela continuam sendo `FiltrosConsulta`; a
  comparação é um eixo independente, o que evita URLs com duas verdades.
- A matriz não vira recomendação nem preço: o site continua neutro e as Análises
  seguem sendo o único lugar de julgamento editorial.
- Sem JavaScript não há matriz, como na tabela: `/comparar/` publica o estado
  vazio e monta a seleção no cliente.
