import type { APIRoute, GetStaticPaths } from "astro";
import { carregarAnalises } from "../conteudo/analises.ts";
import { listaAnalisesJson, secaoVisivel } from "../lib/analises.ts";

/**
 * `analises.json` — o inventário de Análises para Agentes, na raiz do site.
 * Só é publicado quando existe pelo menos uma Análise; zero Análises não gera o
 * arquivo (ADR-0015). É artefato do site, nunca de `data/build/`.
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const { analises } = await carregarAnalises();
  if (!secaoVisivel(analises)) {
    return [];
  }
  return [{ params: { inventario: "analises" } }];
};

export const GET: APIRoute = async () => {
  const { analises } = await carregarAnalises();
  return new Response(
    `${JSON.stringify(listaAnalisesJson(analises), null, 2)}\n`,
    { headers: { "Content-Type": "application/json; charset=utf-8" } },
  );
};
