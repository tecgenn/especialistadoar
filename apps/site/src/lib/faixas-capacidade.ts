import type { FiltrosConsulta } from "@especialista-do-ar/api/consulta";

/**
 * As seis faixas comerciais de capacidade do filtro (ticket 60). Quem não sabe
 * quantos BTUs precisa começa por uma faixa; quem sabe mantém a capacidade
 * exata no `<select>` do mesmo campo.
 *
 * Os limites são fixos e comerciais, mas a lista exibida é **derivada dos dados
 * publicados**: uma faixa sem nenhum Aparelho na base não é renderizada. O
 * módulo é puro, sem DOM — a ilha só renderiza o que sai daqui, e o motor de
 * consulta aplica o intervalo (`btuMin`/`btuMax`) do pacote isomórfico.
 */
export interface FaixaCapacidade {
  /** Piso em BTU/h; ausente = sem piso. */
  min?: number;
  /** Teto em BTU/h; ausente = sem teto. */
  max?: number;
}

/** As faixas na ordem comercial, do menor para o maior. */
export const FAIXAS_CAPACIDADE: readonly FaixaCapacidade[] = [
  { max: 9000 },
  { min: 9001, max: 12000 },
  { min: 12001, max: 18000 },
  { min: 18001, max: 24000 },
  { min: 24001, max: 30000 },
  { min: 30001 },
];

/** A faixa contém a capacidade? Os dois limites entram no intervalo. */
export function faixaContem(
  faixa: FaixaCapacidade,
  capacidade: number,
): boolean {
  return (
    capacidade >= (faixa.min ?? -Infinity) &&
    capacidade <= (faixa.max ?? Infinity)
  );
}

/**
 * As faixas que têm pelo menos um Aparelho na base. As capacidades recebidas
 * são as da base publicada (`opcoes.btusChip` + `opcoes.btus`, sem repetição).
 */
export function faixasDeCapacidade(
  capacidades: readonly number[],
): FaixaCapacidade[] {
  return FAIXAS_CAPACIDADE.filter((faixa) =>
    capacidades.some((capacidade) => faixaContem(faixa, capacidade)),
  );
}

const formatar = (valor: number) => valor.toLocaleString("pt-BR");

/**
 * O rótulo curto da faixa, sem unidade: "Até 9.000", "12.001–18.000" ou
 * "Acima de 30.000". A faixa sem teto mostra o último valor coberto — "acima
 * de 30.000", não "acima de 30.001". É o que vai no eixo da régua de
 * capacidade, onde a unidade é declarada uma vez.
 */
export function rotuloDaFaixaCurto(faixa: FaixaCapacidade): string {
  if (faixa.min === undefined) {
    return `Até ${formatar(faixa.max ?? 0)}`;
  }
  if (faixa.max === undefined) {
    return `Acima de ${formatar(faixa.min - 1)}`;
  }
  return `${formatar(faixa.min)}–${formatar(faixa.max)}`;
}

/**
 * O rótulo legível da faixa: "Até 9.000 BTU/h", "12.001–18.000 BTU/h" ou
 * "Acima de 30.000 BTU/h".
 */
export function rotuloDaFaixa(faixa: FaixaCapacidade): string {
  return `${rotuloDaFaixaCurto(faixa)} BTU/h`;
}

/** A faixa gravada no estado, se houver — as duas chaves, e só elas. */
export function faixaDoEstado(
  estado: FiltrosConsulta,
): FaixaCapacidade | undefined {
  if (
    estado.btu !== undefined ||
    (estado.btuMin === undefined && estado.btuMax === undefined)
  ) {
    return undefined;
  }
  return {
    ...(estado.btuMin === undefined ? {} : { min: estado.btuMin }),
    ...(estado.btuMax === undefined ? {} : { max: estado.btuMax }),
  };
}

/** O estado está exatamente nesta faixa? (Para acender o chip.) */
export function estadoNaFaixa(
  estado: FiltrosConsulta,
  faixa: FaixaCapacidade,
): boolean {
  return (
    estado.btu === undefined &&
    estado.btuMin === faixa.min &&
    estado.btuMax === faixa.max
  );
}
