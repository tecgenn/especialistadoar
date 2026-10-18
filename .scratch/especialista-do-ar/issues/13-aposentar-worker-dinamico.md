# 13 — Aposentar o Worker dinâmico

**What to build:** A parte dinâmica da API (`/api/v1`) deixa de existir: a única
superfície pública de dados volta a ser a API estática (os arquivos JSON
publicados). O Worker dinâmico é removido do repositório e do pipeline de
publicação, e a fórmula do Valor calculado passa a ser documentação para Agentes
(ADR-0011).

- Remover o pacote do Worker e tudo que o sustenta: o deploy no workflow de
  publicação, a permissão de token de Workers e o limite por IP.
- Documentar o Valor calculado (fórmula, entradas e o aviso de que **não** é Valor
  oficial) no guia de Agentes, no lugar da seção dinâmica.
- Ajustar as referências remanescentes a `/api/v1` (docs de aceitação, README,
  comentários de teste) e anotar os ADR-0003/0009 apontando para o ADR-0011.
- Registrar, no ADR-0011, o hash de restauração do pacote e o comando de recuperação.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Nenhuma referência a `api/v1` no código ou nos workflows.
- [ ] A publicação não faz deploy de Worker; o token não exige permissão de Workers.
- [ ] A fórmula do Valor calculado está documentada para Agentes.
- [ ] `pnpm lint`, `typecheck`, `test`, `build` e `build:site` verdes; `data/build`/`reports` inalterados.
- [ ] ADR-0003/0009 anotados; ADR-0011 com o hash de restauração.

## Origin

Sessão de `grill-with-docs` de 2026-10-18 (Fase 4). Ver `spec-fase-4.md` e ADR-0011.
