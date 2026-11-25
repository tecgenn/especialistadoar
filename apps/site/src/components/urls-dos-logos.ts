/**
 * URLs dos SVGs oficiais das lojas, resolvidas pelo Vite uma vez só. Astro e
 * React leem o mesmo mapa: manter as importações em cada componente criava duas
 * fontes de verdade para os mesmos dois arquivos.
 */
import logoAmazon from "../assets/lojas/amazon.svg?url";
import logoMercadoLivre from "../assets/lojas/mercado-livre.svg?url";
import type { ChaveLoja } from "../lib/lojas.ts";

export const URL_DOS_LOGOS_OFICIAIS: Record<ChaveLoja, string> = {
  "mercado-livre": logoMercadoLivre,
  amazon: logoAmazon,
};
