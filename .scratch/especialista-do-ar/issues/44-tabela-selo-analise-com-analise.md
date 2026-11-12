# 44 — Tabela: Selo "Análise" e Bloco "Com análise"

**What to build:** O selo "Analisado" vira **"Análise"**, numa etiqueta de contorno distinta dos chips de filtro, com tooltip contendo apenas o título da Análise. As linhas analisadas ganham destaque sutil. Saem os cabeçalhos de grupo e o aviso de afiliado da tabela. Analisados que passam nos filtros continuam como primeiras linhas do resultado; os que não passam aparecem num bloco compacto **"Com análise"** acima da tabela, sem alterar contagem, ordenação ou "Mostrar mais".

**Blocked by:** 43 — Tabela: Setas, Coluna Tipo e Layout

**Status:** done

- [x] O rótulo visível passa de "Analisado" para "Análise"
- [x] O selo é uma etiqueta de contorno, visualmente diferente da pílula azul dos chips de filtro
- [x] Tooltip do selo contém apenas o título da Análise
- [x] Linha do analisado com fundo levemente destacado e borda de acento à esquerda
- [x] Removidas as linhas de cabeçalho de grupo ("Analisados por nós · contém links de afiliado", "Demais aparelhos")
- [x] Nenhum aviso de afiliado na tabela
- [x] Analisados que passam nos filtros aparecem antes dos demais, qualquer que seja a ordenação
- [x] Bloco "Com análise" acima da tabela lista até 3 analisados que **não** passam nos filtros atuais, com selo e link para a Análise
- [x] O bloco deixa explícito que está fora dos filtros atuais
- [x] Analisado que passa nos filtros não é duplicado no bloco "Com análise"
- [x] Com zero analisados fora do filtro, o bloco não é renderizado
- [x] Contagem de resultados segue refletindo só o que passou nos filtros
- [x] "Mostrar mais" continua paginando o resultado filtrado, sem os itens do bloco
- [x] Ordenação não é afetada pelo bloco "Com análise"
- [x] Testes: selo e tooltip, destaque de linha, ausência dos textos removidos, bloco com/sem analisados fora do filtro, contagem e paginação intactas
- [x] Testes em jsdom conferem que o bloco fica fora do elemento `<table>` e não interfere na contagem
- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes

## Revisão (2026-11-10)

Ajustes pedidos depois de olhar a tela — entram neste mesmo ticket.

- [x] Tabela com colunas de largura igual, conteúdo centralizado e recuo regular (fim do IDRS encostado na Classe); grade mais harmoniosa, cabeçalho em caixa alta discreta e linhas com respiro
- [x] Classe vira pílula colorida dentro da célula (o fundo da célula não é mais pintado)
- [x] Filtros padrão reduzidos a **apenas Tensão 220 V** — sem Tipo `Split Hi-Wall`, Classe `A` nem ordenação padrão
- [x] Bloco de analisados vira **"Aparelhos com análise"**: cartões próprios, acima e visualmente distintos da tabela
- [x] No recorte inicial o bloco mostra todos os analisados; com filtro ativo, só os que ficam fora do resultado
- [x] Sai a linha explicativa repetida; o bloco fica só com o título
- [x] Cada item do bloco mostra a Marca e o **título da Análise** (como no tooltip), não o nome do modelo
- [x] Testes e docs (`CONTEXT.md`, `architecture.md`, nota no ADR-0019) atualizados

## Revisão da vitrine (2026-11-10)

O bloco "Aparelhos com análise" deixa de avisar o que ficou de fora e vira
vitrine que acompanha os filtros.

- [x] O bloco mostra os analisados que **passam** no recorte (inclusive o padrão de Tensão 220 V)
- [x] Limite de 3 → **6** cartões
- [x] As capacidades mais compradas (9.000, 12.000 e 18.000 BTU/h) abrem a lista; as demais completam na ordem das Análises
- [x] Os cartões podem repetir um analisado que também aparece destacado na tabela
- [x] `CONTEXT.md` e `architecture.md` atualizados; testes da ilha reescritos
