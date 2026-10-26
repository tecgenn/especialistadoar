import {
  DIRECOES_CONSULTA,
  type FiltrosConsulta,
  ORDENS_CONSULTA,
  SITUACOES_CONSULTA,
} from "@especialista-do-ar/api/consulta";

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

/** Um parâmetro de lista fixa: valor desconhecido é ignorado. */
function opcao<T extends string>(
  valor: string | null,
  permitidos: readonly T[],
): T | undefined {
  const limpo = texto(valor)?.toLowerCase();
  return permitidos.find((permitido) => permitido === limpo);
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
  const funcao = texto(busca.get("funcao"));
  const classe = texto(busca.get("classe"))?.toUpperCase();
  const rotacao = texto(busca.get("rotacao"));
  const situacao = opcao(busca.get("situacao"), SITUACOES_CONSULTA);
  const q = texto(busca.get("q"));
  const ordem = opcao(busca.get("ordem"), ORDENS_CONSULTA);
  const dir = opcao(busca.get("dir"), DIRECOES_CONSULTA);
  return {
    ...(marca === undefined ? {} : { marca }),
    ...(tipo === undefined ? {} : { tipo }),
    ...(btu === undefined ? {} : { btu }),
    ...(tensao === undefined ? {} : { tensao }),
    ...(funcao === undefined ? {} : { funcao }),
    ...(classe === undefined ? {} : { classe }),
    ...(rotacao === undefined ? {} : { rotacao }),
    ...(situacao === undefined ? {} : { situacao }),
    ...(q === undefined ? {} : { q }),
    ...(ordem === undefined ? {} : { ordem }),
    ...(dir === undefined ? {} : { dir }),
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
  if (estado.funcao !== undefined && estado.funcao.trim() !== "") {
    busca.set("funcao", estado.funcao.trim());
  }
  if (estado.classe !== undefined && estado.classe.trim() !== "") {
    busca.set("classe", estado.classe.trim());
  }
  if (estado.rotacao !== undefined && estado.rotacao.trim() !== "") {
    busca.set("rotacao", estado.rotacao.trim());
  }
  if (
    estado.situacao !== undefined &&
    estado.situacao.trim() !== "" &&
    estado.situacao.trim().toLowerCase() !== "todos"
  ) {
    busca.set("situacao", estado.situacao.trim());
  }
  if (estado.q !== undefined && estado.q.trim() !== "") {
    busca.set("q", estado.q.trim());
  }
  if (estado.ordem !== undefined) {
    busca.set("ordem", estado.ordem);
  }
  if (estado.dir !== undefined) {
    busca.set("dir", estado.dir);
  }
  return busca;
}
