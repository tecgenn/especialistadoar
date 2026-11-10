# Filtros padrão na consulta de Aparelhos

**Status:** aceito

**Data:** 2026-11-02

**Ticket:** 38 — Site: /aparelhos/ com Filtros Padrão

## Contexto

Abrir `/aparelhos/` sem querystring deveria mostrar o recorte mais comum — Tipo
`Split Hi-Wall`, Tensão `220` V e Classe `A` — sem escrever esses parâmetros na
URL, para que o link compartilhado fique limpo. Por outro lado, a pessoa pode
desligar o recorte (ex.: `?tipo=&tensao=&classe=`), e esse estado também precisa
ser compartilhável e sobreviver a recarga.

## Decisão

O padrão `FILTROS_PADRAO = { tipo: "Split Hi-Wall", tensao: 220, classe: "A" }`
é implícito:

- **URL limpa (sem nenhuma chave de filtro):** o padrão é aplicado na leitura
  (`lerEstado`), mas nada é escrito na URL (`escreverEstado` devolve vazio). A
  ordenação, quando presente, ainda é gravada.
- **URL com qualquer chave de filtro:** é o estado completo e explícito; o
  padrão **não** é somado por cima. Um link com filtro próprio (ex. `?marca=LG`)
  é respeitado.
- **Estado sem filtros (pessoa desligou o padrão):** `escreverEstado({})` grava
  as chaves do padrão vazias (`tipo=&tensao=&classe=`), o que desliga o padrão
  na leitura e mantém o link reconstruível.
- **Qualquer outro estado diferente do padrão:** todos os filtros explícitos
  são gravados (mesmo os iguais ao padrão), para a URL sozinha reconstruir o
  estado exato na recarga. Só o padrão exato fica fora da URL.

"Limpar filtros" volta ao padrão preservando a ordenação; o botão só aparece
quando o estado difere do padrão (`temFiltroAtivo`, ignorando a ordenação).

> **Nota (revisão do ticket 44, 2026-11-10):** o padrão encolheu para **só a
> Tensão `220` V** (`FILTROS_PADRAO = { tensao: 220 }`). Tipo `Split Hi-Wall` e
> Classe `A` deixam de ser aplicados implicitamente: quem abre `/aparelhos/` vê
> todos os 220 V. O mecanismo descrito aqui (padrão implícito, URL limpa, chave
> vazia `tensao=` para desligar, "Limpar filtros" preservando a ordenação)
> permanece o mesmo.

## Consequências

- Aditivo ao ADR-0008 (estado da consulta na URL): o padrão é aplicado implicitamente
  quando a URL não traz filtro, então a URL sozinha não descreve sempre o estado
  completo da tela — a exceção é documentada aqui. O contrato de compartilhamento
  continua valendo: qualquer URL reconstruível em `lerEstado` produz a mesma tela.
- `FILTROS_PADRAO`, `lerEstado`, `escreverEstado` e `temFiltroAtivo` vivem em
  `apps/site/src/lib/estado.ts`; `Consulta.tsx` importa-os e não replica a lógica.
