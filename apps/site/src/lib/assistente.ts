/**
 * O **Assistente de dimensionamento** (ticket 41): uma heurística de mercado,
 * determinística e sem IA em runtime, que traduz respostas sobre o ambiente numa
 * capacidade comercial de ar-condicionado. A Recomendação do Assistente é um
 * **Valor calculado** — nunca um Valor oficial do INMETRO nem um cálculo de carga
 * térmica (ADR-0020).
 *
 * Este módulo é puro: coeficientes, cálculo, confiança e o contrato de URL vivem
 * aqui, longe da ilha. A ilha só coleta respostas e renderiza; a regra fica num
 * só lugar, auditável e coberta por testes de cenário.
 */

/** Ambientes que o wizard oferece na primeira tela. */
export const AMBIENTES = [
  "quarto",
  "sala",
  "escritorio",
  "cozinha",
  "comercio",
  "integrado",
] as const;
export type Ambiente = (typeof AMBIENTES)[number];

export const ROTULOS_AMBIENTE: Record<Ambiente, string> = {
  quarto: "Quarto",
  sala: "Sala",
  escritorio: "Escritório",
  cozinha: "Cozinha",
  comercio: "Comércio",
  integrado: "Ambiente integrado",
};

export const DESCRICOES_AMBIENTE: Record<Ambiente, string> = {
  quarto: "Onde você dorme e passa boa parte do tempo.",
  sala: "O espaço de convivência da casa.",
  escritorio: "Trabalho em casa ou uma sala comercial pequena.",
  cozinha: "Um ambiente que já esquenta com o fogão e os eletrodomésticos.",
  comercio: "Loja, consultório ou outro espaço com movimento de pessoas.",
  integrado: "Sala e cozinha, ou dois cômodos que trocam ar.",
};

/** Incidências de sol que entram na base por m². */
export const SOL = ["sem", "manha", "tarde", "dia-todo"] as const;
export type IncidenciaSolar = (typeof SOL)[number];
export type SolResposta = IncidenciaSolar | "nao-sei";

export const SOL_RESPOSTAS = [...SOL, "nao-sei"] as const;

export const ROTULOS_SOL: Record<SolResposta, string> = {
  sem: "Sem sol",
  manha: "Sol pela manhã",
  tarde: "Sol à tarde",
  "dia-todo": "Sol o dia todo",
  "nao-sei": "Não sei",
};

/** BTU/h por m² conforme a incidência solar (o "não sei" cai em `tarde`). */
export const TAXAS_SOL: Record<IncidenciaSolar, number> = {
  sem: 600,
  manha: 650,
  tarde: 750,
  "dia-todo": 800,
};

/** Referências visuais para quem não sabe as medidas. */
export const REFERENCIAS = ["pequeno", "medio", "grande"] as const;
export type ReferenciaArea = (typeof REFERENCIAS)[number];

export const AREA_POR_REFERENCIA: Record<ReferenciaArea, number> = {
  pequeno: 9,
  medio: 20,
  grande: 35,
};

export const ROTULOS_REFERENCIA: Record<ReferenciaArea, string> = {
  pequeno: "Pequeno (~9 m²)",
  medio: "Médio (~20 m²)",
  grande: "Grande (~35 m²)",
};

/** Faixas de pessoas: a conta usa o limite superior para não subdimensionar. */
export const FAIXAS_PESSOAS = ["1", "2", "3-4", "5-6", "7+"] as const;
export type FaixaPessoas = (typeof FAIXAS_PESSOAS)[number];

export const PESSOAS_POR_FAIXA: Record<FaixaPessoas, number> = {
  "1": 1,
  "2": 2,
  "3-4": 4,
  "5-6": 6,
  "7+": 8,
};

export const ROTULOS_PESSOAS: Record<FaixaPessoas, string> = {
  "1": "1 pessoa",
  "2": "2 pessoas",
  "3-4": "3 a 4 pessoas",
  "5-6": "5 a 6 pessoas",
  "7+": "7 ou mais",
};

/** As capacidades comerciais aceitas como arredondamento. */
export const CAPACIDADES_COMERCIAIS = [
  9000, 12000, 18000, 22000, 24000, 30000, 36000, 48000, 60000,
] as const;

/** Coeficientes fixos — o único lugar onde eles moram. */
const BTU_POR_PESSOA_ADICIONAL = 600;
const BTU_POR_ELETRONICO = 600;
const BTU_POR_LAMPADA = 100;
const JANELAS_INCLUIDAS_NA_BASE = 2;
const BTU_POR_JANELA_EXTRA = 200;

export const FORMAS_AREA = ["metros", "dimensoes", "referencia"] as const;
export type FormaAreaNome = (typeof FORMAS_AREA)[number];

export type FormaArea =
  | { forma: "metros"; area: number }
  | { forma: "dimensoes"; largura: number; comprimento: number }
  | { forma: "referencia"; referencia: ReferenciaArea };

/** As respostas completas que alimentam o motor. */
export interface RespostasAssistente {
  ambiente: Ambiente;
  area: FormaArea;
  sol: SolResposta;
  pessoas: FaixaPessoas;
  eletronicos: number;
  lampadas: number;
  janelas: number;
}

/** Um fator que entrou na conta, para a pessoa conferir a estimativa. */
export interface Fator {
  chave:
    | "ambiente"
    | "area"
    | "sol"
    | "pessoas"
    | "eletronicos"
    | "lampadas"
    | "janelas";
  rotulo: string;
  detalhe: string;
  btu: number;
}

export type NivelConfianca = "alta" | "media" | "baixa";

export const ROTULOS_CONFIANCA: Record<NivelConfianca, string> = {
  alta: "Confiança alta",
  media: "Confiança média",
  baixa: "Confiança baixa",
};

export type TipoIndicado =
  | "Split Hi-Wall"
  | "Split Piso-teto"
  | "Split Cassete";

export interface AlternativaDividida {
  unidades: 2;
  capacidadeBtu: number;
}

export interface Orientacoes {
  tipo: string;
  inverter: string;
  instalacao: string;
  vedacao: string;
  limpeza: string;
}

/** A Recomendação do Assistente — sempre um Valor calculado, nunca oficial. */
export interface RecomendacaoAssistente {
  /** A capacidade comercial acima da soma; `null` quando passa de 60.000. */
  capacidadeRecomendadaBtu: number | null;
  /** A soma crua dos fatores, antes do arredondamento comercial. */
  capacidadeCalculadaBtu: number;
  fatores: Fator[];
  confianca: NivelConfianca;
  suposicoes: string[];
  explicacao: string;
  tipoIndicado: TipoIndicado;
  orientacoes: Orientacoes;
  alternativaDividida: AlternativaDividida | null;
  excedeTeto: boolean;
  avaliacaoTecnica: boolean;
  areaM2: number;
}

/** A primeira capacidade comercial maior ou igual ao valor; `null` acima de 60k. */
export function capacidadeComercialAcima(btu: number): number | null {
  return CAPACIDADES_COMERCIAIS.find((capacidade) => capacidade >= btu) ?? null;
}

export function formatarBtu(valor: number): string {
  return Math.round(valor).toLocaleString("pt-BR");
}

export function formatarNumero(valor: number): string {
  return (Math.round(valor * 10) / 10).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
}

function areaEmMetros2(area: FormaArea): number {
  switch (area.forma) {
    case "metros":
      return area.area;
    case "dimensoes":
      return area.largura * area.comprimento;
    case "referencia":
      return AREA_POR_REFERENCIA[area.referencia];
  }
}

function validarContagem(nome: string, valor: number): void {
  if (!Number.isInteger(valor) || valor < 0) {
    throw new RangeError(
      `A contagem de ${nome} precisa ser um inteiro não negativo.`,
    );
  }
}

function tipoIndicadoPara(ambiente: Ambiente, areaM2: number): TipoIndicado {
  if (ambiente === "comercio") {
    return "Split Piso-teto";
  }
  if (areaM2 > 60) {
    return "Split Cassete";
  }
  return "Split Hi-Wall";
}

const FRASES_AMBIENTE: Record<Ambiente, string> = {
  quarto:
    "Para quartos, um Split Hi-Wall Inverter costuma ser a opção mais silenciosa e confortável à noite.",
  sala: "Para salas, prefira um Split Hi-Wall com boa vazão de ar e distribuição uniforme.",
  escritorio:
    "Em escritórios, o Split Hi-Wall mantém o ruído baixo durante o trabalho.",
  cozinha:
    "Cozinhas esquentam mais do que a área sugere: atente à exaustão e à limpeza dos filtros.",
  comercio:
    "Em comércio, Piso-teto ou Cassete distribuem melhor o ar em ambientes maiores e com mais gente.",
  integrado:
    "Em ambientes integrados, considere a área total a ser climatizada e o fluxo de ar entre os espaços.",
};

const ORIENTACOES: Record<TipoIndicado, Orientacoes> = {
  "Split Hi-Wall": {
    tipo: "Split Hi-Wall: a escolha usual para quartos, salas, escritórios e cozinhas residenciais.",
    inverter:
      "Prefira modelos Inverter: mantêm a temperatura com menos liga/desliga do compressor.",
    instalacao:
      "Dimensione a instalação com um profissional; a unidade e a vazão de ar precisam caber no ambiente.",
    vedacao:
      "Vede portas e janelas: a infiltração de ar quente aumenta a carga térmica.",
    limpeza:
      "Limpe os filtros a cada duas semanas e faça a manutenção preventiva uma vez por ano.",
  },
  "Split Piso-teto": {
    tipo: "Piso-teto: rende melhor em comércio e ambientes maiores, com boa distribuição de ar.",
    inverter:
      "Prefira modelos Inverter: mantêm a temperatura com menos liga/desliga do compressor.",
    instalacao:
      "Dimensione a instalação com um profissional; a unidade e a vazão de ar precisam caber no ambiente.",
    vedacao:
      "Vede portas e janelas: a infiltração de ar quente aumenta a carga térmica.",
    limpeza:
      "Limpe os filtros a cada duas semanas e faça a manutenção preventiva uma vez por ano.",
  },
  "Split Cassete": {
    tipo: "Cassete: indicado para ambientes grandes, com instalação no teto e distribuição uniforme.",
    inverter:
      "Prefira modelos Inverter: mantêm a temperatura com menos liga/desliga do compressor.",
    instalacao:
      "Dimensione a instalação com um profissional; a unidade e a vazão de ar precisam caber no ambiente.",
    vedacao:
      "Vede portas e janelas: a infiltração de ar quente aumenta a carga térmica.",
    limpeza:
      "Limpe os filtros a cada duas semanas e faça a manutenção preventiva uma vez por ano.",
  },
};

/**
 * Calcula a Recomendação do Assistente a partir das respostas completas.
 * O tipo de ambiente **não** multiplica a conta: ele escolhe o tipo indicado e
 * personaliza a explicação. Nenhum coeficiente é aplicado duas vezes.
 */
export function calcularAssistente(
  respostas: RespostasAssistente,
): RecomendacaoAssistente {
  const areaM2 = areaEmMetros2(respostas.area);
  if (!Number.isFinite(areaM2) || areaM2 <= 0) {
    throw new RangeError("A área precisa ser maior que zero.");
  }
  validarContagem("eletrônicos", respostas.eletronicos);
  validarContagem("lâmpadas", respostas.lampadas);
  validarContagem("janelas", respostas.janelas);

  const areaEstimada = respostas.area.forma === "referencia";
  const solIncerto = respostas.sol === "nao-sei";
  const solBase: IncidenciaSolar =
    respostas.sol === "nao-sei" ? "tarde" : respostas.sol;
  const taxa = TAXAS_SOL[solBase];

  const baseBtu = Math.round(areaM2 * taxa);
  const pessoas = PESSOAS_POR_FAIXA[respostas.pessoas];
  const pessoasAdicionais = Math.max(0, pessoas - 1);
  const pessoasBtu = pessoasAdicionais * BTU_POR_PESSOA_ADICIONAL;
  const eletronicosBtu = respostas.eletronicos * BTU_POR_ELETRONICO;
  const lampadasBtu = respostas.lampadas * BTU_POR_LAMPADA;
  const janelasExtras = Math.max(
    0,
    respostas.janelas - JANELAS_INCLUIDAS_NA_BASE,
  );
  const janelasBtu = janelasExtras * BTU_POR_JANELA_EXTRA;

  const capacidadeCalculadaBtu =
    baseBtu + pessoasBtu + eletronicosBtu + lampadasBtu + janelasBtu;
  const capacidadeRecomendadaBtu = capacidadeComercialAcima(
    capacidadeCalculadaBtu,
  );
  const excedeTeto = capacidadeRecomendadaBtu === null;

  const referencia =
    respostas.area.forma === "referencia" ? respostas.area.referencia : null;

  const fatores: Fator[] = [
    {
      chave: "ambiente",
      rotulo: "Ambiente",
      detalhe: `${ROTULOS_AMBIENTE[respostas.ambiente]} — define o tipo indicado e a explicação; não multiplica a conta.`,
      btu: 0,
    },
    {
      chave: "area",
      rotulo: "Área",
      detalhe:
        referencia === null
          ? `${formatarNumero(areaM2)} m²`
          : `${formatarNumero(areaM2)} m² (estimada por referência visual)`,
      btu: 0,
    },
    {
      chave: "sol",
      rotulo: "Incidência de sol",
      detalhe: `${ROTULOS_SOL[solBase]} — ${formatarBtu(taxa)} BTU/h por m²`,
      btu: baseBtu,
    },
    {
      chave: "pessoas",
      rotulo: "Pessoas",
      detalhe: `${ROTULOS_PESSOAS[respostas.pessoas]} (a base cobre 1; ${pessoasAdicionais} adicional(is) × ${formatarBtu(BTU_POR_PESSOA_ADICIONAL)} BTU/h)`,
      btu: pessoasBtu,
    },
    {
      chave: "eletronicos",
      rotulo: "Eletrônicos",
      detalhe: `${respostas.eletronicos} × ${formatarBtu(BTU_POR_ELETRONICO)} BTU/h`,
      btu: eletronicosBtu,
    },
    {
      chave: "lampadas",
      rotulo: "Lâmpadas",
      detalhe: `${respostas.lampadas} × ${formatarBtu(BTU_POR_LAMPADA)} BTU/h`,
      btu: lampadasBtu,
    },
    {
      chave: "janelas",
      rotulo: "Janelas",
      detalhe: `${respostas.janelas} janela(s) (a base cobre ${JANELAS_INCLUIDAS_NA_BASE}; ${janelasExtras} extra(s) × ${formatarBtu(BTU_POR_JANELA_EXTRA)} BTU/h)`,
      btu: janelasBtu,
    },
  ];

  let confianca: NivelConfianca;
  if (respostas.ambiente === "comercio" || respostas.ambiente === "cozinha") {
    confianca = "baixa";
  } else if (respostas.ambiente === "integrado" && areaEstimada) {
    confianca = "baixa";
  } else if (areaEstimada || solIncerto) {
    confianca = "media";
  } else {
    confianca = "alta";
  }

  const suposicoes: string[] = [];
  if (solIncerto) {
    suposicoes.push(
      "Você não sabia a incidência de sol; assumimos sol à tarde (750 BTU/h por m²), a opção conservadora.",
    );
  }
  if (referencia !== null) {
    suposicoes.push(
      `A área veio de uma referência visual (${ROTULOS_REFERENCIA[referencia]}), não de uma medida exata.`,
    );
  }
  if (respostas.ambiente === "integrado") {
    suposicoes.push(
      "Ambiente integrado: use a área total a ser climatizada, somando os espaços que trocam ar.",
    );
  }
  if (respostas.ambiente === "comercio" || respostas.ambiente === "cozinha") {
    suposicoes.push(
      "Comércio e cozinha têm cargas térmicas que variam ao longo do dia; a estimativa por área é um ponto de partida.",
    );
  }

  const tipoIndicado = tipoIndicadoPara(respostas.ambiente, areaM2);
  // Confiança baixa (comércio, cozinha ou integrado com área estimada) ou teto
  // excedido já cobrem a avaliação técnica; um integrado com área exata é de
  // confiança alta e não rebaixa sozinho (spec 92).
  const avaliacaoTecnica = excedeTeto || confianca === "baixa";

  const explicacao: string[] = [];
  if (capacidadeRecomendadaBtu === null) {
    explicacao.push(
      `A soma dos fatores chega a ${formatarBtu(capacidadeCalculadaBtu)} BTU/h, acima da maior capacidade comercial de um único aparelho (60.000 BTU/h). A recomendação é dividir o ambiente em mais de uma unidade e pedir uma avaliação técnica de carga térmica.`,
    );
  } else {
    explicacao.push(
      `A soma dos fatores dá ${formatarBtu(capacidadeCalculadaBtu)} BTU/h; a capacidade comercial imediatamente acima é ${formatarBtu(capacidadeRecomendadaBtu)} BTU/h.`,
    );
  }
  explicacao.push(FRASES_AMBIENTE[respostas.ambiente]);
  if (confianca === "baixa") {
    explicacao.push(
      "Pela complexidade do ambiente, peça uma avaliação técnica de carga térmica antes de comprar.",
    );
  }

  const metade =
    capacidadeRecomendadaBtu === null ? null : capacidadeRecomendadaBtu / 2;
  const alternativaDividida =
    metade !== null &&
    metade >= 9000 &&
    (CAPACIDADES_COMERCIAIS as readonly number[]).includes(metade)
      ? { unidades: 2 as const, capacidadeBtu: metade }
      : null;

  return {
    capacidadeRecomendadaBtu,
    capacidadeCalculadaBtu,
    fatores,
    confianca,
    suposicoes,
    explicacao: explicacao.join(" "),
    tipoIndicado,
    orientacoes: ORIENTACOES[tipoIndicado],
    alternativaDividida,
    excedeTeto,
    avaliacaoTecnica,
    areaM2,
  };
}

/* -------------------------------------------------------------------------- */
/* Estado do Assistente na URL                                                */
/* -------------------------------------------------------------------------- */

/**
 * As respostas parciais do wizard. Cada chave é uma pergunta; `undefined` é
 * "ainda não respondeu" e `0` é uma resposta válida (zero eletrônicos etc.).
 */
export interface EstadoAssistente {
  ambiente?: Ambiente;
  forma?: FormaAreaNome;
  area?: number;
  largura?: number;
  comprimento?: number;
  referencia?: ReferenciaArea;
  sol?: SolResposta;
  pessoas?: FaixaPessoas;
  eletronicos?: number;
  lampadas?: number;
  janelas?: number;
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

function positivo(valor: string | null): number | undefined {
  const n = numero(valor);
  return n === undefined || n <= 0 ? undefined : n;
}

function inteiroNaoNegativo(valor: string | null): number | undefined {
  const n = numero(valor);
  return n === undefined || !Number.isInteger(n) || n < 0 ? undefined : n;
}

function opcao<T extends string>(
  valor: string | null,
  permitidos: readonly T[],
): T | undefined {
  const limpo = texto(valor)?.toLowerCase();
  return permitidos.find((permitido) => permitido === limpo);
}

function positivoValor(valor: number | undefined): valor is number {
  return valor !== undefined && Number.isFinite(valor) && valor > 0;
}

function formaInferida(estado: EstadoAssistente): FormaAreaNome | undefined {
  if (positivoValor(estado.largura) && positivoValor(estado.comprimento)) {
    return "dimensoes";
  }
  if (estado.referencia !== undefined) {
    return "referencia";
  }
  if (positivoValor(estado.area)) {
    return "metros";
  }
  return undefined;
}

/** A área escolhida, se as respostas daquela forma estiverem completas. */
export function areaDe(estado: EstadoAssistente): FormaArea | null {
  const forma = estado.forma ?? formaInferida(estado);
  if (forma === "metros") {
    return positivoValor(estado.area)
      ? { forma: "metros", area: estado.area }
      : null;
  }
  if (forma === "dimensoes") {
    return positivoValor(estado.largura) && positivoValor(estado.comprimento)
      ? {
          forma: "dimensoes",
          largura: estado.largura,
          comprimento: estado.comprimento,
        }
      : null;
  }
  if (forma === "referencia") {
    return estado.referencia === undefined
      ? null
      : { forma: "referencia", referencia: estado.referencia };
  }
  return null;
}

/** Lê as respostas da querystring; valores desconhecidos são ignorados. */
export function lerEstadoAssistente(busca: URLSearchParams): EstadoAssistente {
  const estado: EstadoAssistente = {};

  const ambiente = opcao(busca.get("ambiente"), AMBIENTES);
  if (ambiente !== undefined) {
    estado.ambiente = ambiente;
  }

  const sol = opcao(busca.get("sol"), SOL_RESPOSTAS);
  if (sol !== undefined) {
    estado.sol = sol;
  }

  const pessoas = opcao(busca.get("pessoas"), FAIXAS_PESSOAS);
  if (pessoas !== undefined) {
    estado.pessoas = pessoas;
  }

  const eletronicos = inteiroNaoNegativo(busca.get("eletronicos"));
  if (eletronicos !== undefined) {
    estado.eletronicos = eletronicos;
  }
  const lampadas = inteiroNaoNegativo(busca.get("lampadas"));
  if (lampadas !== undefined) {
    estado.lampadas = lampadas;
  }
  const janelas = inteiroNaoNegativo(busca.get("janelas"));
  if (janelas !== undefined) {
    estado.janelas = janelas;
  }

  const forma = opcao(busca.get("forma"), FORMAS_AREA);
  const area = positivo(busca.get("area"));
  const largura = positivo(busca.get("largura"));
  const comprimento = positivo(busca.get("comprimento"));
  const referencia = opcao(busca.get("referencia"), REFERENCIAS);
  const formaEfetiva =
    forma ??
    (largura !== undefined && comprimento !== undefined
      ? "dimensoes"
      : referencia !== undefined
        ? "referencia"
        : area !== undefined
          ? "metros"
          : undefined);

  if (formaEfetiva === "metros" && area !== undefined) {
    estado.forma = "metros";
    estado.area = area;
  } else if (
    formaEfetiva === "dimensoes" &&
    largura !== undefined &&
    comprimento !== undefined
  ) {
    estado.forma = "dimensoes";
    estado.largura = largura;
    estado.comprimento = comprimento;
  } else if (formaEfetiva === "referencia" && referencia !== undefined) {
    estado.forma = "referencia";
    estado.referencia = referencia;
  }

  return estado;
}

/** Serializa o estado inteiro na querystring, preservando as contagens zero. */
export function escreverEstadoAssistente(
  estado: EstadoAssistente,
): URLSearchParams {
  const busca = new URLSearchParams();

  if (estado.ambiente !== undefined) {
    busca.set("ambiente", estado.ambiente);
  }

  const area = areaDe(estado);
  if (area !== null) {
    busca.set("forma", area.forma);
    if (area.forma === "metros") {
      busca.set("area", String(area.area));
    } else if (area.forma === "dimensoes") {
      busca.set("largura", String(area.largura));
      busca.set("comprimento", String(area.comprimento));
    } else {
      busca.set("referencia", area.referencia);
    }
  }

  if (estado.sol !== undefined) {
    busca.set("sol", estado.sol);
  }
  if (estado.pessoas !== undefined) {
    busca.set("pessoas", estado.pessoas);
  }
  if (estado.eletronicos !== undefined) {
    busca.set("eletronicos", String(estado.eletronicos));
  }
  if (estado.lampadas !== undefined) {
    busca.set("lampadas", String(estado.lampadas));
  }
  if (estado.janelas !== undefined) {
    busca.set("janelas", String(estado.janelas));
  }

  return busca;
}

/** As respostas completas, ou `null` enquanto falta alguma pergunta. */
export function respostasDe(
  estado: EstadoAssistente,
): RespostasAssistente | null {
  const area = areaDe(estado);
  if (
    area === null ||
    estado.ambiente === undefined ||
    estado.sol === undefined ||
    estado.pessoas === undefined ||
    estado.eletronicos === undefined ||
    estado.lampadas === undefined ||
    estado.janelas === undefined
  ) {
    return null;
  }
  return {
    ambiente: estado.ambiente,
    area,
    sol: estado.sol,
    pessoas: estado.pessoas,
    eletronicos: estado.eletronicos,
    lampadas: estado.lampadas,
    janelas: estado.janelas,
  };
}

/**
 * A tela inicial: a primeira pergunta sem resposta. Quando todas foram
 * respondidas, a URL abre direto no resultado (compartilhável).
 */
export function etapaInicial(estado: EstadoAssistente): number {
  if (estado.ambiente === undefined) {
    return 0;
  }
  if (areaDe(estado) === null) {
    return 1;
  }
  if (estado.sol === undefined) {
    return 2;
  }
  if (estado.pessoas === undefined) {
    return 3;
  }
  if (
    estado.eletronicos === undefined ||
    estado.lampadas === undefined ||
    estado.janelas === undefined
  ) {
    return 4;
  }
  return 5;
}
