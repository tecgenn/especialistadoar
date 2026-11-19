# Calculadora de custo de energia no site

**Status:** aceito

**Data:** 2026-11-18

**Ticket:** 54 — Calculadora: Motor Puro, Tarifas Curadas e Contrato de URL

## Contexto

O site publica os Dados declarados do INMETRO — capacidade, consumo anual, IDRS,
Classe — e compara até três Aparelhos, mas não respondia a pergunta que decide a
compra: **quanto isso custa na conta de luz**. Quem lê "416 kWh/ano" não consegue
traduzir o número em reais, não sabe que o consumo foi medido em 2.080 horas de
uso e não tem como comparar dois modelos pelo custo do seu próprio uso.

A solução precisava caber no site estático — sem backend, sem cota, sem chave de
API —, manter a comparação neutra (ADR-0021) e nunca confundir uma estimativa com
um Valor oficial do INMETRO. Também não podia transformar `data/build/` em
depósito de tarifa de energia: tarifa é insumo de apresentação, não dado de
produto.

## Decisão

A **calculadora de custo de energia** é um **Valor calculado** determinístico, no
mesmo formato do Assistente (ADR-0020): o motor puro faz a conta, a ilha React só
coleta entradas e renderiza.

- **Fórmula publicada** (`apps/site/src/lib/custo.ts`), sobre o ciclo de medição do
  INMETRO:
  - consumo por hora = consumo anual ÷ **2.080 h/ano**;
  - consumo mensal = consumo por hora × **horas por dia** × **dias por mês**;
  - custo mensal = consumo mensal × **tarifa** (R$/kWh);
  - custo anual = custo mensal × **12**.
  O resultado carrega sempre as **entradas** usadas (consumos, tarifa, horas,
  dias), para a interface abrir a conta passo a passo e exibir o aviso de
  estimativa. Nada é arredondado no motor: a formatação pt-BR (`Intl`, R$ com duas
  casas, kWh com duas casas) fica nas funções de apresentação.
- **Mais de uma Variante → faixa.** Um Aparelho com consumos divergentes devolve
  mínimo e máximo calculados sobre o menor e o maior consumo, em vez de esconder a
  divergência atrás de uma média. Uma Variante devolve valor único.
- **Tarifas curadas no site** (`apps/site/tarifas.json`), uma entrada por UF com
  `uf`, `nome`, `tarifa`, `referencia` (`AAAA-MM`) e `fonte`. É a **Tarifa de
  referência** do `CONTEXT.md`: insumo do site, como os chips de filtro e as
  Ofertas — **nunca** entra em `data/build/`, na API ou na consulta. O build do
  site **falha** se faltar uma das 27 UFs, se houver repetição, se a tarifa não
  for número positivo e finito, ou se `referencia`/`fonte` vierem em branco: uma
  tarifa ausente viraria "R$ NaN" na tela, então nunca é silêncio.
- **A tarifa digitada tem precedência** sobre a da UF e não é persistida em lugar
  nenhum. A opção **"Tarifa informada"** mantém o valor digitado sem associá-lo a
  nenhum estado.
- **Contrato de URL** `uf`, `tarifa`, `horas`, `dias`, idêntico na ficha e na
  comparação:
  - padrões `uf=SP` (tarifa da curadoria), `horas=8`, `dias=30`, que **não**
    aparecem na URL — a mesma regra do ADR-0019. Um link `?uf=SP&horas=8` é
    normalizado para URL limpa;
  - `uf=` vazia é "Tarifa informada" e desliga o padrão na leitura, como
    `tensao=`;
  - valores inválidos (UF inexistente, tarifa ≤ 0 ou não numérica, horas fora de
    0–24, dias fora de 1–31) caem no padrão em silêncio — um link torto abre a
    página, não o erro;
  - o canonical da ficha e da comparação continua limpo: a calculadora não cria
    página indexável nova;
  - é **estado de interface**, como `?ids=`: não entra em `FiltrosConsulta`.
- **Dois lugares, um cenário.** Na **ficha**, a seção "Consumo e custo" abre
  preenchida (São Paulo, R$ 0,846/kWh, 8 h/dia, 30 dias) com o **custo por mês**
  como número principal, o custo anual, o consumo mensal, a conta aberta, a data de
  referência e a fonte da tarifa, e o aviso de estimativa. Na **comparação**, um
  painel único no topo aplica os quatro campos a todos os modelos (só com 2 ou 3),
  cada cartão mostra consumo mensal, custo mensal e custo anual, e a matriz ganha a
  seção "Custo estimado (seu uso)" **depois** das linhas técnicas. O estado e os
  campos são compartilhados por `useCusto.ts`/`CamposCusto.tsx`, a aritmética
  continua só no motor puro, e `src/lib/url.ts` (`mesclarChaves`) junta as chaves
  da calculadora com `?ids=` para uma ilha não apagar o estado da outra.
- **A comparação segue neutra** (ADR-0021): abaixo da matriz, uma frase factual dá
  o maior, o menor e a diferença do custo anual, sem apontar modelo. Quando as
  capacidades diferem, um aviso explica que custo menor não significa maior
  eficiência e remete ao IDRS. Nenhum ★, "menor custo", "melhor" ou destaque de
  vencedor.
- **Nada muda no pipeline.** A calculadora lê os consumos já publicados em
  `aparelhos.json`/`consulta.json` e as tarifas do site; `data/build` e `reports`
  ficam byte a byte iguais.

## Consequências

- O site passa a responder "quanto custa no meu uso" sem backend, sem cota e sem
  guardar nada: as entradas vão só para a URL do próprio navegador, que é o que a
  Política de Privacidade passa a poder afirmar.
- A tarifa envelhece. Por isso a UF, o mês de referência, a fonte e o aviso de
  estimativa ficam **visíveis**, não em nota de rodapé — e quem consulta pode
  digitar a tarifa da própria conta. Atualizar as tarifas é um PR em
  `apps/site/tarifas.json`, com o mesmo gate do site.
- O padrão `uf=SP` faz a ficha abrir com um número real; o risco é o visitante de
  outro estado achar que aquele é o custo dele. O aviso e a troca de UF a um clique
  são a mitigação.
- O método de 2.080 h/ano e a neutralidade da comparação são o diferencial
  editorial: o custo é estimativa auditável, não promessa de economia nem critério
  de "melhor aparelho".
- Mudar a fórmula ou os coeficientes é decisão de produto: altera todos os
  resultados de uma vez e merece nota nova.
