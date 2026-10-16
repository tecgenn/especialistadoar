# Diff sem estado: a Versão anterior é reconstruída do snapshot raw

**Status:** aceito

O Relatório de revisão compara a Versão da tabela atual com a anterior, mas o
build **não guarda estado entre versões**: a Versão anterior é reconstruída a
cada build re-rodando o pipeline (parse → normalização → Anomalias →
agrupamento) sobre o seu snapshot bruto imutável em `data/raw/`. Assim o
relatório é uma função pura de *(snapshot novo + snapshot anterior + Camada
curada)* — determinístico e reproduzível no CI e no local — e a única coisa que
precisa persistir é `data/raw/`, já versionada e identificada por sha256.

## Considered Options

- **Sem estado** (escolhida) — a Versão anterior é derivada das mesmas fontes
  puras que a atual; nada derivado é carregado adiante.
- **Guardar os derivados da Versão anterior** (ex.: o `aparelhos.jsonl` dela) e
  diferenciar contra eles — rejeitada: cria um segundo artefato a versionar, que
  pode divergir quando a Camada curada muda, e deixa de reproduzir o relatório a
  partir das fontes puras.
- **Ler os derivados anteriores do histórico do git** — rejeitada: acopla o
  build ao repositório e ao estado de um checkout, impossibilitando builds a
  partir só do diretório de dados.

## Consequences

- Só `data/raw/` precisa sobreviver para qualquer diff; se um snapshot for
  removido, perde-se a capacidade de diferenciar as Versões que o sucedem.
- O diff reflete a **Camada curada atual**, não um retrato congelado do passado:
  um Vínculo confirmado depois pode mudar a classificação de um relatório
  regenerado (o par deixa de aparecer como novo + Ausente). Como o relatório é
  produzido e aprovado no momento da revisão (ADR-0004), isso é aceitável.
- Cada build re-processa o CSV anterior (~7,5k Linhas) — custo desprezível
  nesta escala.
