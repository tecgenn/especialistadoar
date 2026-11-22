/**
 * O carrossel de Análises em destaque da home (ticket 97), na parte pura.
 *
 * A seção tem três estados, e só o último gira: sem Análise ela não existe; com
 * uma, é um destaque estático (não há para onde avançar); com duas ou mais, é um
 * carrossel com controles e rotação automática. A rotação é sempre opcional: o
 * botão de pausa, o ponteiro e o foco pausam, e `prefers-reduced-motion` a
 * desliga — o visitante continua navegando pelos controles.
 */

export type ModoDaSecaoDeAnalises = "oculta" | "unica" | "carrossel";

/** O intervalo da rotação automática, em milissegundos. */
export const INTERVALO_CARROSSEL_MS = 7000;

/** Sem Análise, oculta; com uma, estática; com duas ou mais, carrossel. */
export function modoDaSecaoDeAnalises(
  quantidade: number,
): ModoDaSecaoDeAnalises {
  if (quantidade <= 0) {
    return "oculta";
  }
  return quantidade === 1 ? "unica" : "carrossel";
}

/**
 * Leva um índice para dentro da lista, circularmente. Serve tanto para o
 * próximo quanto para o anterior e para um índice vindo de fora; uma lista
 * vazia devolve 0 em vez de `NaN`.
 */
export function normalizarIndice(indice: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return ((Math.trunc(indice) % total) + total) % total;
}

/** O próximo quadro, voltando ao primeiro depois do último. */
export function proximoIndice(indice: number, total: number): number {
  return normalizarIndice(normalizarIndice(indice, total) + 1, total);
}

/** O quadro anterior, dando a volta do primeiro para o último. */
export function indiceAnterior(indice: number, total: number): number {
  return normalizarIndice(normalizarIndice(indice, total) - 1, total);
}

export interface EstadoDaRotacao {
  /** Quantos quadros a seção tem. */
  total: number;
  /** `prefers-reduced-motion: reduce` está ativo. */
  reduzido: boolean;
  /** O visitante pausou no botão ou o ponteiro/foco está sobre o bloco. */
  pausado: boolean;
  /** O bloco está na tela e a aba visível. */
  visivel: boolean;
}

/**
 * A rotação automática só corre com mais de um quadro, sem movimento reduzido,
 * sem pausa e com o bloco visível. Nunca avança escondida nem atrás de uma
 * interação.
 */
export function deveAvancarAutomaticamente(estado: EstadoDaRotacao): boolean {
  return (
    estado.total > 1 && !estado.reduzido && !estado.pausado && estado.visivel
  );
}
