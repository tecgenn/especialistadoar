# 56 — Calculadora na Comparação

**What to build:** O custo de energia na comparação de Aparelhos, com o mesmo cenário da ficha. Um painel único no topo traz os quatro campos (UF, tarifa, horas, dias) e atualiza todos os modelos de uma vez; cada modelo ganha um cartão com consumo mensal, custo mensal e custo anual; e a matriz ganha a seção "Custo estimado (seu uso)" com as três linhas. Abaixo da matriz, uma frase factual mostra a diferença entre o maior e o menor custo anual, e um aviso aparece quando as capacidades não coincidem. A comparação continua neutra: nenhum valor marcado como melhor, nenhum destaque de vencedor.

**Blocked by:** 54 — Calculadora: Motor Puro, Tarifas Curadas e Contrato de URL

**Status:** done

- [x] Painel de entradas no topo da comparação, acima dos cartões e dos campos de busca
- [x] O painel só renderiza com 2 ou 3 modelos; com 1 modelo permanece apenas o convite para adicionar outro
- [x] Os quatro campos usam o mesmo módulo e os mesmos padrões da ficha, e a URL é a mesma (`uf`, `tarifa`, `horas`, `dias`)
- [x] Abrir um link gerado na ficha traz o mesmo recorte de tarifa e uso
- [x] Cartão de cada modelo mostra consumo mensal, custo mensal e custo anual, no mesmo formato da ficha
- [x] A matriz ganha a seção "Custo estimado (seu uso)" com Consumo mensal, Custo mensal e Custo anual, depois das linhas técnicas
- [x] Frase factual abaixo da matriz com a diferença entre o maior e o menor custo estimado por ano
- [x] Aviso quando as capacidades diferem, explicando que custo menor não significa maior eficiência e apontando o IDRS
- [x] Nenhum ★, nenhum "menor custo", nenhum "melhor" e nenhum destaque de vencedor em qualquer linha
- [x] No celular, o painel fica acima dos cartões e a matriz continua rolando na horizontal
- [x] Testes de ilha cobrem painel ausente com 1 modelo, presente com 2 e 3, os três números por modelo, a frase de diferença, o aviso de capacidades diferentes e a ausência de qualquer marcação de "melhor"
- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
