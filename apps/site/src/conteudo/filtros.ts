/**
 * Glue da curadoria dos filtros no build do site: lê `filtros.json` e valida o
 * contrato antes de derivar as opções. Fica fora de `src/lib/` (que é puro e
 * testado sem I/O), como o glue das Ofertas e das Análises.
 *
 * `FILTROS_JSON` é a seam que deixa um teste apontar para uma fixture sem tocar
 * no insumo publicado. Em produção o caminho é `apps/site/filtros.json` — a
 * curadoria é **site-only**: nunca entra em `data/build/` nem na consulta (os
 * chips são uma decisão de apresentação, não um dado do INMETRO).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type FiltrosCurados, validarFiltros } from "../lib/filtros.ts";

/** Lê e valida a curadoria dos chips; um insumo inválido falha o build. */
export function carregarFiltros(): FiltrosCurados {
  const caminho =
    process.env.FILTROS_JSON ?? join(process.cwd(), "filtros.json");
  let conteudo: string;
  try {
    conteudo = readFileSync(caminho, "utf8");
  } catch (causa) {
    throw new Error(
      `Filtros: não foi possível ler ${caminho}: ${
        causa instanceof Error ? causa.message : String(causa)
      }`,
    );
  }
  return validarFiltros(JSON.parse(conteudo) as unknown);
}
