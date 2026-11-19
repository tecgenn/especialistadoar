# 59 — CTA de Oferta nos Cartões da Comparação

**What to build:** Quem compara dois ou três Aparelhos passa a ter, no cartão de cada modelo, o caminho para a loja — sem que a matriz de dados seja tocada. O CTA aparece só quando aquele Aparelho tem Oferta publicada, com a mesma linguagem e o mesmo aviso de afiliado da ficha, e fica na área de ações do cartão, junto de "Trocar" e "Remover". A matriz continua sem qualquer elemento comercial.

**Blocked by:** 56 — Calculadora na Comparação; 58 — Ofertas: Rótulo "Ver oferta" e Divulgação em Três Níveis

**Status:** done

- [x] Cartão de cada modelo na comparação mostra o CTA "Ver oferta" quando o Aparelho tem Oferta publicada
- [x] O CTA usa a mesma linguagem e o mesmo marcador "link de afiliado" da ficha
- [x] O CTA fica na área de ações do cartão, junto de "Trocar" e "Remover", fora da matriz
- [x] Modelo sem Oferta não renderiza CTA, nem espaço reservado, nem botão desabilitado
- [x] A matriz de atributos não ganha linha, coluna ou célula com Oferta, preço ou link comercial
- [x] As Ofertas são resolvidas no build, como na ficha e na Análise, sem chamada de rede nova no cliente
- [x] Testes de ilha cobrem presença do CTA no modelo com Oferta, ausência no modelo sem Oferta e ausência de CTA na matriz
- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
