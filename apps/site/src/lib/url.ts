/**
 * Um ajudante puro para o estado das ilhas na querystring. Duas ilhas vivem em
 * `/comparar/`: a seleção (`?ids=`, ADR-0021) e a calculadora (`?uf=` etc.,
 * ADR-0022). Cada uma substitui só as suas chaves — sem esta junção, escrever
 * uma apagaria a outra num `replaceState`.
 */

/**
 * Cópia de `atual` com `chaves` removidas e `novas` gravadas. As chaves de
 * `novas` também saem de `atual` antes de entrar, para não duplicar valores.
 * Não toca na busca recebida nem em `window`.
 */
export function mesclarChaves(
  atual: URLSearchParams,
  chaves: readonly string[],
  novas: URLSearchParams,
): URLSearchParams {
  const busca = new URLSearchParams(atual);
  const substituidas = new Set([...chaves, ...novas.keys()]);
  for (const chave of substituidas) {
    busca.delete(chave);
  }
  for (const [chave, valor] of novas) {
    busca.set(chave, valor);
  }
  return busca;
}

/** Serializa a busca para `replaceState`, sem o `?` quando está vazia. */
export function caminhoComBusca(
  caminho: string,
  busca: URLSearchParams,
): string {
  const consulta = busca.toString();
  return consulta === "" ? caminho : `${caminho}?${consulta}`;
}
