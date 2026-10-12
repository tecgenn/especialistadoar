# API híbrida: arquivos JSON estáticos + Worker dinâmico

**Status:** aceito

A base é consumida por agentes de IA e pelo site, então dividimos o acesso em
duas partes. A **estática** é servida como arquivos JSON — consulta por ID,
listas e a Versão da tabela — e não gasta Worker nem cota. A **dinâmica** é um
Worker na rota `/api/v1/...` que serve apenas busca, comparação e Valor
calculado. O dataset é **embutido**: os artefatos JSONL/JSON são a fonte da
verdade; o D1 entra só como plano B, derivado do JSONL. No MVP o acesso é aberto,
com regra de limite por IP na Cloudflare; se a cota diária apertar, o plano B é o
Workers Paid. Cobrança fica para depois, atrás de um portão de pagamento na
frente da parte dinâmica, sem mudar as respostas.

## Considered Options

- **API híbrida** (escolhida) — o que é estático não consome cota; o que é
  dinâmico fica isolado.
- **Tudo em Worker** — desperdiça cota em consultas que poderiam ser estáticas.
- **Tudo estático** — não cobre busca, comparação nem Valor calculado.
- **D1 desde já** — mais peças do que a v1 precisa.

## Consequences

- `aparelhos.jsonl` (uma linha por Aparelho) é o artefato canônico; `aparelhos.json`
  é o espelho para quem só faz `fetch` + `JSON.parse`.
- O teste de aceitação com agente (Fatia 2) exercita exatamente esse desenho e
  decide se o site vale o investimento.
- Os termos de uso comercial do plano gratuito da Cloudflare precisam ser
  confirmados antes de cobrar pelo acesso.
