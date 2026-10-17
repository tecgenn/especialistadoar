# 10 — Documentação para agentes e teste de aceitação (portão)

**What to build:** A documentação para Agentes e o teste de aceitação que é o portão de decisão da Fase 2: um Agente responde sozinho, sem humano no meio, usando só a base.

- O acesso começa pelos arquivos estáticos; `/search` só entra como fallback.
- O caminho usado em cada resposta (estático ou dinâmico) é logado — é o que revela se o Worker se justifica.
- Critério de aprovação: um conjunto de ~10 perguntas reais com gabarito, com acerto ≥ 8/10 sem intervenção humana.
- Decisão: se passar, segue para o site; se não, a API é reavaliada antes de investir no site (e o Worker encolhe se o estático sozinho bastar).

**Blocked by:** 09 — Worker dinâmico `/api/v1`.

**Status:** done

- [x] A documentação explica como um Agente consome a base, começando pelo estático.
- [x] Existe um conjunto de ~10 perguntas reais com gabarito.
- [x] Um Agente acerta ≥ 8/10 sem intervenção humana (10/10 — ver `docs/aceitacao/portao-fase-2.md`).
- [x] O caminho usado em cada resposta é logado (na tabela e no anexo do relatório).
- [x] O resultado está registrado como decisão explícita (seguir para o site — ADR-0009).

## Origin

Migrado da issue #10 do GitHub (https://github.com/tecgenn/especialistadoar/issues/10) em 2026-10-14, ao mover o tracker deste repositório para markdown local.
