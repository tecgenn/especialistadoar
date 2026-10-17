# Portão da Fase 2 — perguntas do teste de aceitação

Dez perguntas reais para um Agente responder **sozinho**, usando só a base
publicada (comece pelos arquivos estáticos; as rotas `/api/v1` são fallback). O
gabarito fica em `gabarito.json` e **não** deve ser consultado pelo Agente. Onde
cada resposta foi buscada (estático ou dinâmico) precisa ficar registrado.

Formato de cada resposta: a resposta, os dados que a sustentam (com a
proveniência — Aparelho, Registro INMETRO e/ou Linha da tabela) e o caminho usado.

1. Qual é a Versão da tabela que a base está servindo hoje: quando a exportação
   foi obtida, quantas Linhas ela tem e como ela é identificada?

2. Quantos Aparelhos com Dados declarados a base servida tem ao todo, e quantas
   Anomalias foram sinalizadas?

3. Sobre o Aparelho de id `ap-4693b862644d`: qual a marca, o modelo e o tipo?
   Qual o Registro INMETRO (número e status) e de qual Linha da tabela ele veio?

4. Quantos Aparelhos do tipo **Split Cassete** existem na base servida?

5. Quantos Aparelhos atendem **127 V**? Quantos são **bivolt** (aceitam mais de
   uma tensão)?

6. Quantos Aparelhos da marca **ELGIN** são do tipo **Split Piso-teto**?

7. O modelo GREE `GJC07BK-A3NRND2A` (id `ap-06e4068d6f8f`) é um Aparelho ou dois?
   Quais tensões ele atende? Quantas Variantes ele tem?

8. Compare o custo energético anual declarado de dois Aparelhos de 12.000 BTU:
   KENNEDY `ap-4693b862644d` e DAIKIN `ap-b0e771cbc5a3`. Qual deles consome menos
   por ano? Cite o consumo anual (kWh/ano) e o IDRS de cada um.

9. Qual o **custo anual estimado** do Aparelho `ap-4693b862644d` com uma tarifa de
   **R$ 0,95/kWh**? Apresente o valor, a fórmula e as entradas usadas, deixando claro
   que não é um Valor oficial do INMETRO.

10. A Linha 892 traz uma Anomalia. Qual campo, qual valor original e que tipo de
    Anomalia é?
