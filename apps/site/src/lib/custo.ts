/**
 * Calculadora de custo de energia — motor **puro** (sem DOM e sem Astro), no
 * mesmo formato do motor do Assistente (ADR-0020, ADR-0022).
 *
 * Traduz o consumo anual declarado no INMETRO para reais: o INMETRO mede o
 * consumo no ciclo de **2.080 h/ano** (≈ 5,7 h/dia), então
 *
 * - consumo por hora = consumo anual ÷ 2.080
 * - consumo mensal = consumo por hora × horas por dia × dias por mês
 * - custo mensal = consumo mensal × tarifa (R$/kWh)
 * - custo anual = custo mensal × 12
 *
 * O resultado é um **Valor calculado**: sempre carrega as entradas que o
 * produziram (tarifa, horas, dias e consumo), para a interface exibir a conta
 * aberta e o aviso de estimativa. Nunca é um Valor oficial do INMETRO.
 *
 * Um Aparelho com mais de uma Variante (consumos divergentes) devolve **faixa**
 * — mínimo e máximo sobre o menor e o maior consumo —, para não esconder a
 * divergência. Uma Variante devolve valor único (mínimo = máximo).
 */
import {
  indexarTarifas,
  type TarifasCuradas,
  tarifaDaUf,
  tarifaPadrao,
  UF_PADRAO,
} from "./tarifas.ts";

/** O ciclo de medição do INMETRO: 2.080 horas por ano. */
export const HORAS_ANO = 2080;

/** Uso padrão da calculadora: 8 h/dia e 30 dias no mês. */
export const HORAS_DIA_PADRAO = 8;
export const DIAS_MES_PADRAO = 30;

/** Um número, ou o mínimo e o máximo quando o Aparelho tem Variantes. */
export interface Faixa {
  minimo: number;
  maximo: number;
}

export interface EntradasCusto {
  /** O consumo anual (kWh/ano) de cada Variante com dado declarado. */
  consumosAnuaisKwh: readonly number[];
  /** R$/kWh. */
  tarifa: number;
  /** Horas de uso por dia (0–24). */
  horas: number;
  /** Dias de uso no mês (1–31). */
  dias: number;
}

export interface ResultadoCusto {
  entradas: {
    consumosAnuaisKwh: number[];
    tarifa: number;
    horas: number;
    dias: number;
  };
  consumoPorHoraKwh: Faixa;
  consumoMensalKwh: Faixa;
  custoMensal: Faixa;
  custoAnual: Faixa;
}

function numeroValido(valor: number): boolean {
  return Number.isFinite(valor);
}

function faixaDe(valores: readonly number[]): Faixa {
  return {
    minimo: Math.min(...valores),
    maximo: Math.max(...valores),
  };
}

/**
 * Calcula o custo estimado. Devolve `null` quando não há consumo utilizável ou
 * quando uma entrada está fora do contrato (a leitura da URL já cai no padrão em
 * silêncio; o `null` é a rede de segurança para a interface).
 */
export function calcularCusto(entradas: EntradasCusto): ResultadoCusto | null {
  const consumos = entradas.consumosAnuaisKwh.filter(
    (consumo) => numeroValido(consumo) && consumo > 0,
  );
  if (consumos.length === 0) {
    return null;
  }
  if (!numeroValido(entradas.tarifa) || entradas.tarifa <= 0) {
    return null;
  }
  if (
    !numeroValido(entradas.horas) ||
    entradas.horas < 0 ||
    entradas.horas > 24
  ) {
    return null;
  }
  if (!numeroValido(entradas.dias) || entradas.dias < 1 || entradas.dias > 31) {
    return null;
  }

  const consumoPorHora = consumos.map((consumo) => consumo / HORAS_ANO);
  const consumoMensal = consumoPorHora.map(
    (porHora) => porHora * entradas.horas * entradas.dias,
  );
  const custoMensal = consumoMensal.map((mensal) => mensal * entradas.tarifa);

  return {
    entradas: {
      consumosAnuaisKwh: consumos,
      tarifa: entradas.tarifa,
      horas: entradas.horas,
      dias: entradas.dias,
    },
    consumoPorHoraKwh: faixaDe(consumoPorHora),
    consumoMensalKwh: faixaDe(consumoMensal),
    custoMensal: faixaDe(custoMensal),
    custoAnual: faixaDe(custoMensal.map((mensal) => mensal * 12)),
  };
}

/** Um valor só (Variante única) ou mínimo e máximo distintos? */
export function ehFaixa(faixa: Faixa): boolean {
  return faixa.minimo !== faixa.maximo;
}

const MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const NUMERO = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** R$ 45,60 — duas casas, sempre com a unidade. */
export function formatarReais(valor: number): string {
  // O Intl usa espaço não separável depois do símbolo; um espaço comum deixa o
  // texto previsível no HTML, nos testes e ao copiar.
  return MOEDA.format(valor).replace(/\u00a0/g, " ");
}

/** 60,00 kWh — duas casas, sempre com a unidade. */
export function formatarKwh(valor: number): string {
  return `${NUMERO.format(valor)} kWh`;
}

/** "R$ 45,60" ou "R$ 45,60 – R$ 60,00" quando há faixa. */
export function formatarFaixa(
  faixa: Faixa,
  formatar: (valor: number) => string,
): string {
  if (!ehFaixa(faixa)) {
    return formatar(faixa.minimo);
  }
  return `${formatar(faixa.minimo)} – ${formatar(faixa.maximo)}`;
}

/**
 * O estado da calculadora na URL, compartilhado pela ficha e pela comparação
 * (ADR-0022). As chaves são `uf`, `tarifa`, `horas` e `dias`; o padrão (São
 * Paulo, 8 h/dia, 30 dias) **não** aparece na URL, como nos filtros (ADR-0019).
 *
 * `uf: null` é a opção **"Tarifa informada"**: a tarifa digitada vale sem estar
 * associada a nenhum estado, e a URL grava `uf=` vazia para desligar o padrão.
 * Uma `tarifa` presente na URL tem precedência sobre a da UF.
 */
export interface EstadoCusto {
  /** A UF escolhida, ou `null` para "Tarifa informada". */
  uf: string | null;
  tarifa: number;
  horas: number;
  dias: number;
}

function texto(valor: string | null): string | undefined {
  const limpo = valor?.trim();
  return limpo === undefined || limpo === "" ? undefined : limpo;
}

function numero(valor: string | null): number | undefined {
  const limpo = texto(valor);
  if (limpo === undefined) {
    return undefined;
  }
  const n = Number(limpo);
  return Number.isFinite(n) ? n : undefined;
}

function dentroDaFaixa(
  valor: string | null,
  minimo: number,
  maximo: number,
): number | undefined {
  const n = numero(valor);
  return n === undefined || n < minimo || n > maximo ? undefined : n;
}

/**
 * Lê o estado da calculadora da querystring. UF inexistente e qualquer valor
 * fora do contrato caem no padrão em silêncio — um link torto abre a página,
 * não o erro.
 */
export function lerEstadoCusto(
  busca: URLSearchParams,
  tarifas: TarifasCuradas,
): EstadoCusto {
  const indice = indexarTarifas(tarifas);
  const ufBruta = busca.get("uf");
  const ufDigitada = texto(ufBruta)?.toUpperCase();

  let uf: string | null;
  if (ufBruta !== null && texto(ufBruta) === undefined) {
    // `?uf=` vazia: "Tarifa informada".
    uf = null;
  } else if (ufDigitada !== undefined && indice.has(ufDigitada)) {
    uf = ufDigitada;
  } else {
    uf = UF_PADRAO;
  }

  const tarifaDigitada = (() => {
    const n = numero(busca.get("tarifa"));
    return n === undefined || n <= 0 ? undefined : n;
  })();
  const tarifaUf = uf === null ? undefined : indice.get(uf)?.tarifa;

  return {
    uf,
    tarifa: tarifaDigitada ?? tarifaUf ?? tarifaPadrao(tarifas),
    horas: dentroDaFaixa(busca.get("horas"), 0, 24) ?? HORAS_DIA_PADRAO,
    dias: dentroDaFaixa(busca.get("dias"), 1, 31) ?? DIAS_MES_PADRAO,
  };
}

/**
 * Serializa o estado na querystring. O padrão exato fica fora da URL — um link
 * `?uf=SP&horas=8` é normalizado para URL limpa —, e a tarifa só é escrita
 * quando difere da referência da UF escolhida (tarifa digitada) ou quando não há
 * UF ("Tarifa informada", que precisa do `uf=` vazio).
 */
export function escreverEstadoCusto(
  estado: EstadoCusto,
  tarifas: TarifasCuradas,
): URLSearchParams {
  const busca = new URLSearchParams();
  const indice = indexarTarifas(tarifas);
  const uf =
    estado.uf === null ? null : indice.has(estado.uf) ? estado.uf : UF_PADRAO;

  if (uf === null) {
    busca.set("uf", "");
    busca.set("tarifa", String(estado.tarifa));
  } else if (estado.tarifa !== tarifaDaUf(tarifas, uf)) {
    busca.set("uf", uf);
    busca.set("tarifa", String(estado.tarifa));
  } else if (uf !== UF_PADRAO) {
    busca.set("uf", uf);
  }

  if (estado.horas !== HORAS_DIA_PADRAO) {
    busca.set("horas", String(estado.horas));
  }
  if (estado.dias !== DIAS_MES_PADRAO) {
    busca.set("dias", String(estado.dias));
  }

  return busca;
}
