/**
 * Glue das Ofertas no build do site: lê `ofertas.json`, valida contra a base
 * servida e indexa por Aparelho. Fica fora de `src/lib/` (que é puro e testado
 * sem I/O), como o glue das Análises.
 *
 * `OFERTAS_JSON` permite que o teste de build use uma fixture de Ofertas sem
 * tocar no insumo publicado. Em produção o caminho é `apps/site/ofertas.json` —
 * as Ofertas continuam **site-only** e nunca entram em `data/build/` (ADR-0010).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import aparelhosJson from "@dados/aparelhos.json";
import type { Aparelho } from "@especialista-do-ar/pipeline";
import { indexarOfertas, type Oferta, validarOfertas } from "../lib/ofertas.ts";

const caminho = process.env.OFERTAS_JSON ?? join(process.cwd(), "ofertas.json");
const ofertas = JSON.parse(readFileSync(caminho, "utf8")) as Oferta[];

let indice: Map<string, Oferta[]> | undefined;

/**
 * As Ofertas do Aparelho, na ordem do arquivo; lista vazia quando não há
 * Oferta. A validação (inclusive de Oferta órfã) roda uma vez, no primeiro uso
 * do build e antes de qualquer Oferta ser renderizada.
 */
export function ofertasDoAparelho(aparelhoId: string): Oferta[] {
  if (indice === undefined) {
    const ids = new Set((aparelhosJson as Aparelho[]).map((item) => item.id));
    validarOfertas(ofertas, ids);
    indice = indexarOfertas(ofertas);
  }
  return indice.get(aparelhoId) ?? [];
}
