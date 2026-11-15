# 55 — Calculadora na Ficha: Seção "Consumo e custo"

**What to build:** A calculadora de custo de energia visível na ficha do Aparelho, como seção "Consumo e custo". A pessoa escolhe a UF (ou digita a tarifa da própria conta), ajusta horas por dia e dias por mês, e vê o **custo por mês como número principal**, com custo por ano, consumo mensal e a conta aberta passo a passo logo abaixo. A seção abre já preenchida com o padrão de São Paulo, para o visitante entender o que ela faz sem digitar nada. Um bloco "Como calculamos" explica o método de 2.080 horas/ano com um exemplo numérico, e o resultado é marcado como estimativa, nunca como Valor oficial. O estado inteiro vive na URL.

**Blocked by:** 54 — Calculadora: Motor Puro, Tarifas Curadas e Contrato de URL

**Status:** ready-for-agent

- [ ] Seção "Consumo e custo" na ficha, com identidade de âncora para o índice de seções
- [ ] Campos: UF (27 estados mais a opção "Tarifa informada"), tarifa editável, horas por dia e dias por mês
- [ ] Trocar a UF atualiza a tarifa do campo; escolher "Tarifa informada" mantém o valor digitado e grava `uf=` na URL
- [ ] Custo por mês em destaque, com custo por ano e consumo mensal logo abaixo
- [ ] Detalhamento do cálculo passo a passo: consumo INMETRO, consumo por hora, uso informado, consumo mensal, tarifa e custo mensal
- [ ] "Como calculamos" com o padrão de 2.080 horas/ano (cerca de 5,7 h/dia) e a nota de 12 meses iguais
- [ ] Exemplo numérico pronto, com valores redondos, para quem quer entender sem digitar
- [ ] Aviso visível de que o resultado é estimativa calculada com as entradas informadas, não um Valor oficial nem promessa de economia
- [ ] Aparelho com mais de uma Variante mostra o custo como faixa; uma Variante mostra valor único
- [ ] Trocar qualquer campo atualiza o resultado na hora, sem recarregar, e escreve a URL com a regra de padrões
- [ ] Canonical da ficha continua sem as chaves da calculadora
- [ ] Rótulos associados aos campos, resultado anunciado como região viva e navegação por teclado funcionando
- [ ] No celular, campos e resultado empilhados na ordem de leitura
- [ ] Testes de ilha cobrem padrões, troca de UF, tarifa digitada, "Tarifa informada", horas e dias, faixa com duas Variantes, URL limpa no padrão e valor inválido caindo no padrão
- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
