/**
 * Glue das tarifas de referência no build do site: lê `tarifas.json` e valida o
 * contrato antes de servir a calculadora. Fica fora de `src/lib/` (puro, testado
 * sem I/O), como o glue dos filtros e das Ofertas.
 *
 * `TARIFAS_JSON` é a seam que deixa um teste apontar para uma fixture sem tocar
 * no insumo publicado. Em produção o caminho é `apps/site/tarifas.json` — a
 * curadoria é **site-only**: nunca entra em `data/build/` nem na consulta.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type TarifasCuradas, validarTarifas } from "../lib/tarifas.ts";

/** Lê e valida as tarifas; um insumo inválido falha o build. */
export function carregarTarifas(): TarifasCuradas {
  const caminho =
    process.env.TARIFAS_JSON ?? join(process.cwd(), "tarifas.json");
  let conteudo: string;
  try {
    conteudo = readFileSync(caminho, "utf8");
  } catch (causa) {
    throw new Error(
      `Tarifas: não foi possível ler ${caminho}: ${
        causa instanceof Error ? causa.message : String(causa)
      }`,
    );
  }
  return validarTarifas(JSON.parse(conteudo) as unknown);
}
