import type { Oferta } from "./ofertas.ts";

/**
 * A verificação de links das Ofertas (ticket 12): a parte pura recebe a função de
 * busca por injeção, para não depender de rede no teste. O job
 * (`apps/site/scripts/verificar-links.ts`) liga o `fetch` real e roda agendado no
 * CI. Uma Oferta é "quebrada" quando a busca falha (rede/timeout) ou quando a
 * resposta tem status de erro (>= 400). Redirecionamentos são seguidos antes.
 */

export interface RespostaLink {
  ok: boolean;
  status: number;
}

export type BuscadorLink = (url: string) => Promise<RespostaLink>;

export interface LinkQuebrado {
  oferta: Oferta;
  motivo: string;
}

export interface RelatorioLinks {
  /** Total de Ofertas verificadas (inclui as quebradas). */
  total: number;
  quebradas: LinkQuebrado[];
}

/** Verifica cada Oferta; devolve as quebradas, na ordem do arquivo. */
export async function verificarOfertas(
  ofertas: readonly Oferta[],
  buscar: BuscadorLink,
): Promise<RelatorioLinks> {
  const quebradas: LinkQuebrado[] = [];

  for (const oferta of ofertas) {
    try {
      const resposta = await buscar(oferta.url);
      if (!resposta.ok) {
        quebradas.push({ oferta, motivo: `HTTP ${resposta.status}` });
      }
    } catch (causa) {
      quebradas.push({
        oferta,
        motivo: causa instanceof Error ? causa.message : String(causa),
      });
    }
  }

  return { total: ofertas.length, quebradas };
}
