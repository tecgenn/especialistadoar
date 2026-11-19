# 62 — Ficha: Etiquetas, Cartões de Destaque, Índice e "Comparar este modelo"

**What to build:** A ficha ganha um topo com ponto focal e um caminho de leitura. Logo abaixo do título, etiquetas de Classe, situação e número de registro identificam o Aparelho antes de qualquer rolagem; três cartões de destaque mostram IDRS, Consumo anual e Capacidade; um índice de seções permite pular direto ao que interessa; e um link secundário "Comparar este modelo" leva o Aparelho para a comparação. A ficha deixa de ser uma sequência de listas de definição e passa a ter hierarquia.

**Blocked by:** 55 — Calculadora na Ficha: Seção "Consumo e custo"

**Status:** done

- [x] Etiquetas logo abaixo do H1 com Classe, situação (Ativo quando ao menos um Registro está Ativo) e número(s) de registro
- [x] Classe em faixa quando o Aparelho tem mais de uma; registro omitido quando não houver
- [x] Três cartões de destaque com IDRS, Consumo anual e Capacidade, cada um com unidade e legenda curta
- [x] Valores em faixa nos cartões quando o Aparelho tem mais de uma Variante
- [x] Índice de seções com âncoras para as seções que existem na página: Resumo, Consumo e custo, Condições de ensaio, Especificações, Registros, Proveniência e Ofertas
- [x] As âncoras levam à seção certa, com foco visível e sem esconder o título atrás do topo da tela
- [x] Link "Comparar este modelo" como ação secundária no topo, apontando para a comparação com o id do Aparelho
- [x] Abrir esse link mostra o Aparelho no primeiro campo e o convite para adicionar outro
- [x] O cartão de destaque de Consumo anual aponta para a seção "Consumo e custo" (ou traz o link para ela)
- [x] Nenhuma informação removida: identificação, Registros, Condições de ensaio e Proveniência continuam na página
- [x] No celular, os cartões empilham e o índice continua utilizável
- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
