import type { FiltrosConsulta } from "@especialista-do-ar/api/consulta";

/**
 * O estado da consulta é `FiltrosConsulta` — o mesmo contrato que o módulo
 * isomórfico (ticket 08) aplica. Aqui só convertemos entre esse estado e a
 * querystring, para o resultado ficar na URL (`?marca=&tipo=&btu=&tensao=&q=`)
 * e ser compartilhável/favoritável (ADR-0008). Puro, sem DOM.
 */

/** Um parâmetro textual em branco é ausência de filtro. */
function texto(valor: string | null): string | undefined {
  const limpo = valor?.trim();
  return limpo === undefined || limpo === "" ? undefined : limpo;
}

/** Um parâmetro numérico inválido é ignorado (não quebra a consulta). */
function numero(valor: string | null): number | undefined {
  const limpo = texto(valor);
  if (limpo === undefined) {
    return undefined;
  }
  const n = Number(limpo);
  return Number.isFinite(n) ? n : undefined;
}

/** Lê o estado da consulta de uma querystring; entradas vazias ou inválidas caem fora. */
export function lerEstado(busca: URLSearchParams): FiltrosConsulta {
  // A marca é comparada sem diferenciar caixa pelo motor de consulta; normalizar
  // aqui mantém o mesmo valor canônico no chip, no `<select>` e na URL (um
  // `?marca=midea` acende o chip "Midea" e não cria uma opção duplicada).
  const marca = texto(busca.get("marca"))?.toUpperCase();
  const tipo = texto(busca.get("tipo"));
  const btu = numero(busca.get("btu"));
  const tensao = numero(busca.get("tensao"));
  const q = texto(busca.get("q"));
  return {
    ...(marca === undefined ? {} : { marca }),
    ...(tipo === undefined ? {} : { tipo }),
    ...(btu === undefined ? {} : { btu }),
    ...(tensao === undefined ? {} : { tensao }),
    ...(q === undefined ? {} : { q }),
  };
}

/** Serializa o estado em parâmetros, omitindo os filtros ausentes. */
export function escreverEstado(estado: FiltrosConsulta): URLSearchParams {
  const busca = new URLSearchParams();
  if (estado.marca !== undefined && estado.marca.trim() !== "") {
    busca.set("marca", estado.marca.trim());
  }
  if (estado.tipo !== undefined && estado.tipo.trim() !== "") {
    busca.set("tipo", estado.tipo.trim());
  }
  if (estado.btu !== undefined) {
    busca.set("btu", String(estado.btu));
  }
  if (estado.tensao !== undefined) {
    busca.set("tensao", String(estado.tensao));
  }
  if (estado.q !== undefined && estado.q.trim() !== "") {
    busca.set("q", estado.q.trim());
  }
  return busca;
}
