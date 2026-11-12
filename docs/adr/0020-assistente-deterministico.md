# Assistente determinístico com heurística publicada

**Status:** aceito

**Data:** 2026-11-09

**Ticket:** 41 — Assistente: Motor Determinístico e Wizard

## Contexto

A pergunta que mais traz visitante ao site é "quantos BTUs preciso?". A tabela
exige que a pessoa já saiba o que filtrar, e o site não traduzia metragem, sol,
pessoas e equipamentos numa capacidade. A solução precisava responder isso sem
criar backend, custo por conversa, chave de API ou resposta não determinística —
o site é estático e a base publicada é a única fonte de dados.

## Decisão

O Assistente de dimensionamento é uma **heurística de mercado determinística**,
sem LLM, Worker ou IA em runtime:

- **Cinco telas, uma pergunta por tela** (ambiente; área; incidência de sol;
  pessoas; equipamentos + lâmpadas + janelas), com barra de progresso, "Voltar" e
  foco no título ao avançar. O estado inteiro vive na URL (`ambiente`, forma de
  área, `area`/dimensões, `sol`, `pessoas`, `eletronicos`, `lampadas`, `janelas`),
  então recarregar e compartilhar preservam o resultado.
- **Coeficientes fixos, num só lugar** (`apps/site/src/lib/assistente.ts`):
  - base por m² conforme a incidência solar: **600** (sem sol), **650** (manhã),
    **750** (tarde), **800** (dia todo) BTU/h;
  - **+600 BTU/h** por pessoa adicional, com a base cobrindo 1 pessoa; as faixas
    usam o limite superior (3–4 → 4; 5–6 → 6; 7+ → 8) para não subdimensionar;
  - **+600 BTU/h** por eletrônico; **+100 BTU/h** por lâmpada;
  - janelas: a base assume até **2**; **+200 BTU/h** a partir da 3ª.
  - Nenhum fator é aplicado duas vezes e o tipo de ambiente não multiplica a
    conta: ele escolhe o tipo indicado (Split Hi-Wall × Piso-teto/Cassete) e
    personaliza a explicação.
- **Arredondamento comercial para cima**: 9.000, 12.000, 18.000, 22.000, 24.000,
  30.000, 36.000, 48.000 e 60.000 BTU/h. Acima de 60.000 não há recomendação de
  um único aparelho: o resultado indica mais de uma unidade e avaliação técnica.
- **Alternativa dividida** quando metade da capacidade recomendada é uma
  capacidade comercial e ≥ 9.000 BTU/h (24.000 → 2 × 12.000; 36.000 → 2 × 18.000;
  etc.). O motor a expõe; o ticket 42 transforma isso em CTA.
- **Fallbacks explícitos**: área por referência visual (pequeno ~9 m², médio
  ~20 m², grande ~35 m²) e sol "não sei" assumem tarde (750 BTU/h/m²), sempre
  declarados no resultado. Confiança **alta** com área exata e respostas
  informadas; **média** com área estimada ou alguma suposição; **baixa** em
  comércio, cozinha ou ambiente integrado com área estimada.
- **Valor calculado, nunca oficial**: o resultado traz capacidade, fatores,
  explicação, confiança e orientações, e sempre se declara uma estimativa — não
  um dado do INMETRO nem um cálculo de carga térmica. Nunca promete economia.

O módulo puro é a única fonte da regra; a ilha React apenas coleta respostas e
renderiza. A Recomendação do Assistente está no `CONTEXT.md`.

## Consequências

- Os coeficientes ficam auditáveis e cobertos por testes de cenário. Mudá-los é
  uma decisão de produto que merece nova nota, porque altera todas as
  recomendações de uma vez.
- O Assistente funciona no site estático, sem cota, backend ou custo por
  conversa, e a URL sozinha reconstrói o resultado.
- A heurística pode divergir de um cálculo técnico de carga térmica. Por isso o
  resultado se declara estimativa e recomenda avaliação profissional em ambientes
  complexos ou acima de 60.000 BTU/h.
- O ticket 42 constrói os CTAs dos Aparelhos analisados sobre o mesmo resultado,
  sem duplicar a regra no cliente.
