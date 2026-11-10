# 45 — Filtros: Classe A–F e Layout Compacto

**What to build:** Os chips de Classe passam a mostrar só a letra (A–F), em uma única fileira, mantendo as cores curadas e recebendo `aria-label` "Classe A" etc. A barra lateral fica densa e bem distribuída — busca em largura total, Marca e Capacidade em grade, Função e Tensão lado a lado, Tipo em duas colunas, Classe em uma fileira, Ordenar em largura total e "Limpar filtros" no rodapé — sem qualquer barra de rolagem interna. Em telas baixas, a barra deixa de ser sticky e rola com a página.

**Blocked by:** 44 — Tabela: Selo "Análise" e Bloco "Com análise"

**Status:** done

- [x] Chips de Classe exibem apenas as letras A, B, C, D, E, F
- [x] Cada chip tem `aria-label` "Classe A" (e assim por diante)
- [x] As cores curadas das classes são mantidas
- [x] O grupo tem a legenda "Classe" e os seis chips cabem em uma fileira
- [x] O `<select>` de classes extras continua quando houver classes fora das curadas
- [x] Sidebar densa em blocos: busca full-width; Marca em 2 colunas; Capacidade em 3 colunas; Função e Tensão lado a lado; Tipo em 2 colunas; Classe em 6; Ordenar full-width com botão de direção
- [x] "Limpar filtros" no rodapé da barra lateral
- [x] Nenhum `overflow-y: auto` nem `max-height` cortando a barra lateral
- [x] Sticky apenas quando o painel cabe na altura da janela; em telas baixas, estático e rolando com a página
- [x] Todos os filtros existentes, chips e o contrato de URL permanecem funcionando
- [x] Chips menores e espaçamento reduzido, sem esconder nenhum filtro atrás de clique
- [x] Layout mobile continua funcional (painel recolhível acima dos resultados)
- [x] Testes: letras e `aria-label`, seis chips em uma fileira, ausência de rolagem interna no CSS, seleção de Classe ainda filtrando
- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
