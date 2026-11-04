# 38 — Site: /aparelhos/ com Filtros Padrão

**What to build:** Ao abrir `/aparelhos/` sem querystring, a lista já vem recortada em Tipo Split Hi-Wall + Tensão 220 V + Classe A, sem escrever esses parâmetros na URL. Um link com filtro próprio é respeitado e não recebe o padrão por cima. "Limpar filtros" volta ao padrão, não ao vazio, preservando a ordenação; o botão só aparece quando o estado difere do padrão.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Carga limpa aplica o padrão e mostra 1.152 de 2.227 aparelhos na Versão atual, com URL sem parâmetros
- [x] Link com filtro próprio (ex.: `?marca=LG`) não recebe o padrão
- [x] "Limpar filtros" retorna ao padrão e mantém a ordenação
- [x] O botão "Limpar filtros" só aparece fora do padrão
- [x] Estado segue compartilhável; o padrão não aparece na URL
- [x] Testes de estado e da ilha verdes
