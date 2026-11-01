# Spec — Fase 8: Redesign dos Filtros e Tabela de Aparelhos

## Problem Statement

A interface atual de filtros e tabela na página `/aparelhos/` apresenta problemas de usabilidade e performance:

1. **Filtros confusos**: O menu "Marca" mostra "Todas" e abre com todas as marcas (incluindo as 10 já visíveis como chips), gerando duplicação visual. O mesmo ocorre com "Capacidade". O usuário não entende a diferença entre chips e select.
2. **Campos desnecessários**: Filtros de Rotação e Situação ocupam espaço mas têm pouco valor prático.
3. **Duplicatas na base**: Modelos com status "Excluído" no CSV do INMETRO criam Aparelhos duplicados (ex.: GRATTO ACST9F aparece com duas classes, dois consumos, dois IDRS — um "Incluido" e outro "Excluido").
4. **Tabela pouco legível**: "Consumo (kWh/ano)" verboso; "Classe" mostra só a letra (A, B) sem cor, dificultando leitura rápida.
5. **Botão "Mostrar mais"**: Carrega incrementalmente (50 itens por clique); mantido como solução de navegação simples e performática.
6. **Mobile**: Filtros ficam em grid horizontal, exigindo scroll; tabela vira cards (ok).

## Solution

Redesign completo da página `/aparelhos/` com:

1. **Exclusão no pipeline** de linhas com `Status do Modelo = "Excluido"` — elimina duplicatas na origem.
2. **Layout em duas colunas** (desktop): filtros à esquerda (sticky), tabela à direita (scroll próprio). No mobile: filtros empilhados acima da tabela.
3. **Busca no topo**, acima de todos os filtros.
4. **Marca**: 10 chips (marcas conhecidas) + select "Outras Marcas" **vazio** (sem opção "Todas"), listando apenas marcas NÃO nos chips.
5. **Capacidade**: 6 chips (9k, 12k, 18k, 24k, 30k, 36k BTU/h) + select "Outras Capacidades" **vazio**.
6. **Função**: Chips visíveis (2 valores: Frio, Quente/Frio).
7. **Tipo**: Chips visíveis (4 valores: Split Hi-Wall, Split Cassete, Split Piso-teto, Janela).
8. **Classe**: Chips coloridos (A=verde, B=azul, C=amarelo, D=laranja, E/F=vermelho) com rótulo "Classe A" etc.
9. **Tensão**: Select simples (valores numéricos).
10. **Ordenação**: Select apenas com 4 opções — Consumo, IDRS, BTU, Classe.
11. **Removidos**: Filtros de Rotação e Situação.
12. **Tabela**: Colunas — Marca, Modelo, BTU/h, **Consumo (kWh)**, IDRS, **Classe** (exibe "Classe A", "Classe B"… com cores).
13. **Botão "Mostrar mais"**: Carrega 50 itens por clique, sem paginação numerada; reset ao mudar filtro/ordem.
14. **Mobile**: Filtros empilhados acima da tabela; botão "Mostrar mais" funcional.

## User Stories

1. As a **visitante do site**, I want to **buscar aparelhos por termo livre** no topo da página, so that **encontro rapidamente o modelo que procuro sem navegar por filtros**.
2. As a **visitante do site**, I want to **filtrar por marca clicando em chips das 10 marcas mais conhecidas**, so that **a ação é imediata e visual, sem abrir menus**.
3. As a **visitante do site**, I want to **ver as demais marcas em um select "Outras Marcas" que abre vazio**, so that **não há duplicação com os chips e a lista fica limpa**.
4. As a **visitante do site**, I want to **filtrar por capacidade clicando em chips das 6 capacidades comuns**, so that **o filtro mais usado é acessível em um clique**.
5. As a **visitante do site**, I want to **ver outras capacidades em um select "Outras Capacidades" vazio**, so that **a interface não mostra "Todas" confusa e lista só o que não está nos chips**.
6. As a **visitante do site**, I want to **filtrar por função (Frio/Quente-Frio) e tipo (Split/Janela) via chips visíveis**, so that **campos com poucos valores ficam expostos, sem clique extra**.
7. As a **visitante do site**, I want to **filtrar por classe energética via chips coloridos (A=verde… F=vermelho) com rótulo "Classe X"**, so that **a leitura é imediata e a cor reforça a eficiência**.
8. As a **visitante do site**, I want to **ordenar a tabela apenas por Consumo, IDRS, BTU ou Classe**, so that **o menu de ordenação fica enxuto e relevante**.
9. As a **visitante do site**, I want to **ver a tabela com colunas: Marca, Modelo, BTU/h, Consumo (kWh), IDRS, Classe (com "Classe A" colorido)**, so that **a informação é legível e padronizada**.
10. As a **visitante mobile**, I want to **ver os filtros empilhados acima da tabela**, so that **não preciso rolar horizontalmente e todos os filtros ficam acessíveis**.
11. As a **sistema (pipeline)**, I want to **excluir linhas com Status do Modelo = "Excluido" no build**, so that **a base servida não tem duplicatas e reflete apenas modelos válidos**.
14. As a **desenvolvedor**, I want to **remover campos obsoletos (rotacao, situacao, suspeito) do dataset de consulta**, so that **o `consulta.json` fica menor e a ilha carrega mais rápido**.

## Implementation Decisions

### Pipeline (packages/pipeline)
- **Filtro de "Excluído"**: Aplicado em `parse.ts` logo após o parse do CSV, antes da normalização. Linhas com `Status do Modelo === "Excluido"` são descartadas. Isso afeta todos os artefatos downstream (`registros.jsonl`, `aparelhos.jsonl`, `consulta.json`, etc.).
- **Remoção de campos**: `rotacao`, `situacao`, `suspeito` removidos de `ItemConsulta` (consulta.ts), `Aparelho` e `DadosDeclarados` (aparelho.ts), e da derivação em `group.ts`.
- **Schema/Validação**: `validate.ts` e `schema.json` derivado atualizados para refletir tipos novos.
- **Tipos exportados**: `packages/pipeline/src/index.ts` exporta contratos atualizados.

### API Isomórfica (packages/api)
- **FiltrosConsulta**: Remove `rotacao`, `situacao`. Mantém `marca`, `tipo`, `btu`, `tensao`, `funcao`, `classe`, `q`, `ordem`, `dir`.
- **ORDENS_CONSULTA**: Reduzido a `["btu", "consumo", "idrs", "classe"]`.
- **ItemConsulta**: Remove `rotacao`, `situacao`, `suspeito`, `tensoes` (se não usado no site), `idrs`/`consumosKwh`/`classes`/`capacidadesBtu` permanecem como arrays para formatação de faixa.
- **combinaCampos**: Remove verificações de `rotacao` e `situacao`.
- **chaveDe/ordenar**: Suporta apenas as 4 ordens permitidas; lógica de suspeitos removida.
- **SITUACOES_CONSULTA**: Removido.

### Site — Dados e Opções (apps/site)
- **filtros.json**: Nova entrada `classes` com array de `{ valor, rotulo, cor }` para A–F.
- **lib/filtros.ts**: `FiltrosCurados` ganha `classes: MarcaCurada[]` (reuso da interface). `validarFiltros` valida `cor` opcional.
- **lib/opcoes.ts**: `OpcoesConsulta` remove `rotacoes`, `situacoes`; adiciona `classesChip: MarcaCurada[]`; `opcoesDe` deriva chips de classe do dataset + curadoria.
- **lib/tabela.ts**: `COLUNAS_TABELA = [marca, modelo, btu, consumo, idrs, classe]`. Rótulo de consumo = "Consumo (kWh)". `valorDaColuna` para `classe` retorna `"Classe A, Classe B"` etc.
- **conteudo/filtros.ts**: Glue lê `classes` do `filtros.json` e passa para `opcoesDe`.

### Site — UI (apps/site/src/components/Consulta.tsx)
- **Layout**: CSS Grid `.consulta-layout` com `grid-template-columns: 280px 1fr` (desktop), `1fr` (mobile ≤64rem). Sidebar `.filtros-sidebar` com `position: sticky; top: 1rem`.
- **Formulário**: `<form className="filtros">` com campos em ordem:
  1. Busca (`.campo-full`, `grid-column: 1/-1`)
  2. Marca — `<fieldset className="campo-chips">` com `<Chips>` + `<label className="select-outras">` contendo select vazio
  3. Capacidade — mesma estrutura
  4. Função — apenas `<Chips>` (2 valores: Frio, Quente/Frio)
  5. Tipo — apenas `<Chips>` (4 valores)
  6. Classe — `<ChipsClass>` com `data-classe` para CSS colorido
  7. Tensão — `<label>` simples
  8. Ordenar — `<label>` com select de 4 opções
  9. Botão "Limpar filtros" (só se filtro ativo)
- **ChipsClass**: Novo componente ou extensão de `Chips` que renderiza `button[data-classe="A"]` etc., com cor via CSS.
- **Selects "Outras…"**: `<option value="" disabled hidden>Outras Marcas</option>` (placeholder visual vazio); opções só marcas/capacidades não-chip.
- **Tabela**: Existente, usa `COLUNAS_TABELA` atualizada. Mobile já vira cards via CSS (`@media max-width: 40rem`).
- **Botão "Mostrar mais"**: Aparece quando há > 50 resultados; clique acrescenta 50 itens; desaparece quando todos visíveis. Lógica: `mostrados = paginacao.chave === chaveEstado ? paginacao.quantidade : 50`. Mudança de filtro/ordem reseta para 50 itens iniciais.

### Site — Estilos (apps/site/src/styles/global.css)
- **Grid principal**: `.consulta-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; }` + mobile breakpoint.
- **Sidebar sticky**: `.filtros-sidebar { position: sticky; top: 1rem; max-height: calc(100vh - 2rem); overflow-y: auto; }`
- **Campo-chips**: `<fieldset>` com gap vertical; chips acima, select abaixo.
- **Chips de classe**: `.chips.classes-chips button[aria-pressed="true"][data-classe="A"] { background: #16a34a; }` etc. (verde/azul/amarelo/laranja/vermelho).
- **Select placeholder**: `.select-outras select:invalid { color: var(--texto-suave); }` + `option[value=""][disabled][hidden]`.
- **Botão "Mostrar mais"**: `.mostrar-mais { display: block; width: 100%; max-width: 300px; margin: 1.5rem auto 0; padding: 0.75rem 1rem; }` + mobile `max-width: 100%`.

### Seams de Teste (existentes, reutilizados)
1. **Pipeline**: `packages/pipeline/test/{parse,consulta,aparelho,group,validate,build}.test.ts` — golden snapshots de artefatos.
2. **API**: `packages/api/test/consulta.test.ts` — testa `filtrar`, `ordenar` com novos filtros/ordens.
3. **Site — Opções/Filtros**: `apps/site/test/{opcoes,filtros,filtros-glue}.test.ts` — derivação de opções e validação.
4. **Site — Ilha**: `apps/site/test/consulta.test.tsx` — renderização, interação, estado na URL, paginação.
5. **Site — Build**: `apps/site/test/analises-build.test.ts` — build completo com fixture.

## Testing Decisions

- **Princípio**: Testar comportamento externo (entrada → saída), não detalhes de implementação.
- **Pipeline**: Golden snapshots dos artefatos JSONL/JSON após build com CSV real e fixture. Verificar que linhas "Excluido" não aparecem em `aparelhos.jsonl` nem `consulta.json`. Verificar que `rotacao`, `situacao`, `suspeito` estão ausentes.
- **API Isomórfica**: Testes unitários de `criarConsulta().filtrar()` com combinações de filtros (marca, tipo, btu, tensao, funcao, classe, q) e `ordenar()` com as 4 ordens + direções. Verificar que filtros removidos são ignorados.
- **Site — Opções**: `opcoesDe` retorna `marcasChip`, `btusChip`, `classesChip` corretos; `marcas`/`btus`/`classes` (restantes) sem duplicatas; `rotacoes`/`situacoes` ausentes.
- **Site — Ilha (Consulta.tsx)**: Testes em jsdom/React Testing Library:
  - Renderiza chips de marca, capacidade, função, tipo, classe.
  - Selects "Outras Marcas/Capacidades" abrem vazios (sem "Todas").
  - Clique em chip altera URL e filtra resultados.
  - Select "Outras…" altera URL e filtra.
  - Ordenação só mostra 4 opções; mudança atualiza URL e reordena.
  - **"Mostrar mais"**: botão aparece quando > 50 resultados; clique incrementa 50; some quando todos mostrados; reset ao mudar filtro/ordem.
  - Mobile: layout empilhado (CSS), "Mostrar mais" funcional.
  - Busca no topo funciona.
  - "Limpar filtros" limpa só filtros, mantém ordenação.
- **Build do site**: `pnpm build:site` gera páginas sem erro; `grep -r "rotacao|situacao" apps/site/dist` vazio.

## Out of Scope

- Mudanças na ficha técnica do aparelho (`/aparelhos/[id]`) — mantém campos atuais.
- Mudanças na home, análises, ofertas.
- Mudanças na API estática (`packages/api/src/estatica.ts`) — só o módulo de consulta muda.
- Worker dinâmico (já removido na Fase 13).
- Migração de domínio próprio, analytics de agente.
- Validação de links de ofertas (já existe, manual).

## Further Notes

- **Impacto no `consulta.json`**: Redução estimada de ~10-15% no tamanho (remoção de 3 campos por item + menos Aparelhos por exclusão de "Excluído").
- **Contagem de Aparelhos**: Atual 2.460. Após filtro "Excluído", estimativa ~2.200–2.300 (baseado em ~500 linhas Excluido, mas algumas compartilham identidade com Incluido).
- **URLs existentes**: Parâmetros `?rotacao=...` e `?situacao=...` em links antigos serão ignorados graciosamente (`filtroDeTexto` retorna `undefined` para vazio/desconhecido).
- **Curadoria `filtros.json`**: Entrada `classes` é nova e obrigatória no build do site (validada em `index.astro` via `carregarFiltros()`).
- **ADRs respeitados**: ADR-0008 (consulta isomórfica no cliente), ADR-0016 (Marca de catálogo), ADR-0018 (Classe por Variante, não recalculada).
- **Ordem de implementação recomendada**: Pipeline → API → Site (dados) → Site (UI) → Testes → Validação completa.