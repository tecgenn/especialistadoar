# 37 — IDRS: Restaurar Separador Decimal e Limitar a 10

**What to build:** A base publicada e a consulta passam a mostrar o IDRS como 5,5 / 6,2 / 3,3 para as Linhas cuja exportação perdeu a vírgula decimal, sem tocar nos valores já decimais (9,71 permanece 9,71). A leitura da coluna IDRS é própria e compartilhada entre a normalização e o detector de Anomalias; uma regra de plausibilidade com teto 10 sinaliza apenas decimais realmente fora da faixa. Nenhuma Exceção manual nova: é formato, não conteúdo (ADR-0017).

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Inteiro sem separador e > 10 é lido com o ponto após o 1º dígito: 55→5,5; 62→6,2; 33→3,3; 971→9,71
- [ ] Valor já decimal (9.71, 6.20, 3,50) passa intacto
- [ ] Normalização e Anomalias usam a mesma leitura da coluna
- [ ] Os 4 registros reais (`ap-d328f750e73e`, `ap-8976ca4b3a7e`, `ap-2fac590865fe`, `ap-c827d71a3eb6`) deixam de exibir 55/62/33 e não viram Anomalia
- [ ] Regra de plausibilidade do IDRS com máximo 10 sinaliza decimal real acima do teto
- [ ] `data/build` e `reports` regenerados e reproduzíveis byte a byte
- [ ] Testes de normalização, anomalias e build verdes
