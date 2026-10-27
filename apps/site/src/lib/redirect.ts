/**
 * Os links antigos do catálogo (`/?marca=…&btu=…`) apontavam para a home, que
 * até o ticket 29 hospedava a ilha de consulta. Agora a tabela vive em
 * `/aparelhos/`: um script curto na home leva esses links para lá com a mesma
 * querystring. O `_redirects` do Cloudflare Pages não serve para isso porque não
 * separa a mesma URL por parâmetros (spec da Fase 7).
 *
 * Este módulo é a parte pura e testável (jsdom): recebe o `location.search` e a
 * função que redireciona, sem tocar em `window` diretamente.
 */

/** Destino da home antiga, ou `null` quando não há filtros na querystring. */
export function destinoDosFiltrosAntigos(search: string): string | null {
  if (search === "" || search === "?") {
    return null;
  }
  const querystring = search.startsWith("?") ? search : `?${search}`;
  return `/aparelhos/${querystring}`;
}

/** O mínimo de `Location` que o redirecionamento precisa (sem depender do DOM). */
export interface LocalizacaoDaHome {
  search: string;
}

/**
 * Redireciona a home antiga para `/aparelhos/` preservando a querystring —
 * ordem dos parâmetros e Marca oficial antiga (`?marca=SPRINGER MIDEA`)
 * inclusive. Devolve `true` quando redirecionou.
 */
export function redirecionarFiltrosAntigos(
  localizacao: LocalizacaoDaHome,
  redirecionar: (url: string) => void,
): boolean {
  const destino = destinoDosFiltrosAntigos(localizacao.search);
  if (destino === null) {
    return false;
  }
  redirecionar(destino);
  return true;
}
