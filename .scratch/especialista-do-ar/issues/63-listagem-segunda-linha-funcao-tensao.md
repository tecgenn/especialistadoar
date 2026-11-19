# 63 — Listagem: Segunda Linha "Função · Tensão"

**What to build:** A tabela de Aparelhos passa a mostrar, numa segunda linha discreta sob o modelo, a Função e as Tensões do Aparelho — dados que hoje existem na base de consulta mas só aparecem como filtro. "Quente/Frio · 220 V" para um modelo simples; "Frio · 127 · 220 V" para um bivolt. A mudança é só de leitura: não cria coluna, não altera contagem, ordenação, seleção ou "Mostrar mais", e não toca no pipeline.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Cada linha da tabela mostra, sob o modelo, uma segunda linha com Função e Tensão
- [x] Aparelho bivolt lista as duas tensões ("127 · 220 V") e monofásico mostra a sua
- [x] Função ou Tensão ausente na base não deixa separador solto nem texto vazio
- [x] A segunda linha é visualmente secundária (tipografia menor e cor de texto secundário), sem competir com Marca e Modelo
- [x] Nenhuma coluna nova é criada e a altura da linha não cresce de forma a prejudicar a densidade da tabela
- [x] Contagem, ordenação, seleção para comparar e "Mostrar mais" continuam idênticos
- [x] No celular, a mesma informação aparece no cartão do Aparelho
- [x] Testes de ilha cobrem a presença da linha, o caso bivolt e o caso sem Função ou sem Tensão
- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
