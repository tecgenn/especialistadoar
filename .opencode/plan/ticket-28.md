# Ticket 28 — Aparelhos analisados (selo, topo, aviso de afiliado)

## Plan

### 1. Build-time map of analisados
**File:** `apps/site/src/conteudo/analises.ts`
- Add function `mapaAnalisados(analises: readonly Analise[], idsDaBase: ReadonlySet<string>): Map<string, { titulo: string; url: string; temOferta: boolean }>`
- Only includes analyses whose `aparelhoId` is in the current Version's `idsDaBase`
- Returns map keyed by `aparelhoId`

### 2. Pass map to Consulta island
**File:** `apps/site/src/pages/aparelhos/index.astro`
- Import `mapaAnalisados` from `conteudo/analises.ts`
- Build `idsDaBase` from `aparelhos.json` (or `consulta.json`)
- Compute `analisadosMap = mapaAnalisados(analises, idsDaBase)`
- Pass `analisados={analisadosMap}` to `<Consulta />`

### 3. Consulta.tsx — Two groups + Analisado badge
**File:** `apps/site/src/components/Consulta.tsx`
- Add `analisados?: Map<string, { titulo: string; url: string; temOferta: boolean }>` to Props
- Split `resultados` into `analisados` and `demais` arrays (preserving order within each)
- Render group headers:
  - "Analisados por nós" + "· contém links de afiliado" when any analisado has `temOferta`
  - "Demais aparelhos" only when analisados exist
- For analisado rows: add badge "Analisado" with:
  - Link to the analysis
  - Tooltip with `aria-describedby` containing affiliate warning
  - Keyboard/touch accessible
- Ensure ordering applies within each group (analisados first, then order)

### 4. CSS for badge and tooltip
**File:** `apps/site/src/styles/global.css`
- `.analisado-selo` styles
- Tooltip styles with `aria-describedby` support
- Group header styles

### 5. Tests
**File:** `apps/site/test/consulta.test.tsx`
- Test group headers appear correctly
- Test analisados come first within filters
- Test badge renders with link and tooltip
- Test affiliate warning in group header when applicable
- Test zero analyses = no groups, same as ticket 27

### 6. Type updates
**File:** `apps/site/src/components/Consulta.tsx` — Props interface
**File:** `apps/site/src/pages/aparelhos/index.astro` — pass correct type

---

## Implementation Order
1. `conteudo/analises.ts` — add `mapaAnalisados` function
2. `pages/aparelhos/index.astro` — pass the map
3. `components/Consulta.tsx` — render groups, badge, tooltip
4. `styles/global.css` — styles
5. `test/consulta.test.tsx` — tests
6. Run tests, typecheck, build