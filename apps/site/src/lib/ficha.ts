/**
 * Montagem da ficha técnica de um Aparelho (ticket 26).
 *
 * A base servida guarda os Dados declarados por Variante, uma por tensão. Aqui a
 * ficha funde as Variantes de dados idênticos (127 V e 220 V com os mesmos
 * números viram um bloco só), descarta as Variantes vazias e reduz as 13 linhas
 * repetidas a um resumo e a uma grade 2×2 das condições de ensaio. Lógica pura,
 * sem I/O: a página só renderiza o resultado.
 */

import type {
  DadosDeclarados,
  RegistroInmetro,
  Tensao,
  Variante,
} from "@especialista-do-ar/pipeline";
import { HORAS_ANO } from "./custo.ts";

/**
 * As tensões de um bloco: as voltagens unidas e as fases declaradas **por
 * voltagem**. A correspondência é preservada de propósito — fundir "220 V ·
 * monofásico, bifásico" com "380 V · trifásico" numa lista só de fases
 * associaria trifásico aos 220 V, o que é falso.
 */
export interface TensaoBloco {
  voltagens: number[];
  fasesPorVoltagem: Array<{ voltagem: number; fases: string[] }>;
}

/** Um conjunto de Dados declarados idênticos, com as tensões que o declaram. */
export interface BlocoVariante {
  tensao: TensaoBloco | null;
  dados: DadosDeclarados;
  linhas: number[];
}

/** Valores únicos do Aparelho, já ordenados (menor → maior; Classe A–F). */
export interface ResumoFicha {
  capacidadesBtu: number[];
  capacidadesW: number[];
  idrs: number[];
  classes: string[];
  consumosKwh: number[];
  potenciasEsperaW: number[];
}

export interface CelulaCondicao {
  capacidadeW: number | null;
  potenciaW: number | null;
}

export interface LinhaCondicoes {
  temperatura: 35 | 29;
  total: CelulaCondicao;
  parcial: CelulaCondicao;
}

export interface GradeCondicoes {
  /** Só as temperaturas que têm algum dado em alguma carga. */
  linhas: LinhaCondicoes[];
  /** Colunas com dado em alguma temperatura. */
  mostrarTotal: boolean;
  mostrarParcial: boolean;
}

const TEMPERATURAS: readonly (35 | 29)[] = [35, 29] as const;

const CAMPOS_NUMERICOS: readonly (keyof DadosDeclarados)[] = [
  "capacidadeNominalBtu",
  "capacidadeNominalW",
  "potenciaEsperaW",
  "capacidade35TotalW",
  "potencia35TotalW",
  "capacidade35ParcialW",
  "potencia35ParcialW",
  "capacidade29ParcialW",
  "potencia29ParcialW",
  "capacidade29TotalW",
  "potencia29TotalW",
  "idrs",
  "consumoAnualKwh",
] as const;

/** Uma Variante sem nenhum Valor declarado (exceto Classe) não aparece na ficha. */
function dadosVazios(dados: DadosDeclarados): boolean {
  return CAMPOS_NUMERICOS.every((campo) => dados[campo] === null);
}

function chaveDados(dados: DadosDeclarados): string {
  return JSON.stringify(dados, Object.keys(dados).sort());
}

function unirValores<T>(a: readonly T[], b: readonly T[]): T[] {
  return [...new Set([...a, ...b])];
}

function ordenarUnicos<T>(valores: T[], ordenar?: (a: T, b: T) => number): T[] {
  return unirValores(valores, []).sort(
    ordenar ?? ((x, y) => (x < y ? -1 : x > y ? 1 : 0)),
  );
}

function unirLinhas(a: readonly number[], b: readonly number[]): number[] {
  return ordenarUnicos([...a, ...b]);
}

function mesclarTensao(
  a: TensaoBloco | null,
  b: TensaoBloco | null,
): TensaoBloco | null {
  if (a === null) {
    return b;
  }
  if (b === null) {
    return a;
  }
  const porVoltagem = new Map<number, string[]>();
  for (const grupo of [...a.fasesPorVoltagem, ...b.fasesPorVoltagem]) {
    porVoltagem.set(grupo.voltagem, [
      ...(porVoltagem.get(grupo.voltagem) ?? []),
      ...grupo.fases,
    ]);
  }
  return {
    voltagens: ordenarUnicos([...a.voltagens, ...b.voltagens], (x, y) => x - y),
    fasesPorVoltagem: [...porVoltagem.entries()]
      .map(([voltagem, fases]) => ({ voltagem, fases: unirValores(fases, []) }))
      .sort((x, y) => x.voltagem - y.voltagem),
  };
}

function tensaoDoBloco(tensao: Tensao): TensaoBloco {
  return {
    voltagens: [...tensao.voltagens],
    fasesPorVoltagem: tensao.voltagens.map((voltagem) => ({
      voltagem,
      fases: [...tensao.fases],
    })),
  };
}

/**
 * Funde as Variantes de `dados` idênticos num bloco só, unindo as tensões
 * ("127 / 220 V") e as Linhas da tabela; omite as Variantes vazias. A ordem dos
 * blocos é a da primeira Variante que os originou.
 */
export function agruparVariantes(
  variantes: readonly Variante[],
): BlocoVariante[] {
  const blocos = new Map<string, BlocoVariante>();
  for (const variante of variantes) {
    if (dadosVazios(variante.dados)) {
      continue;
    }
    const chave = chaveDados(variante.dados);
    const existente = blocos.get(chave);
    if (existente === undefined) {
      blocos.set(chave, {
        tensao:
          variante.tensao === null ? null : tensaoDoBloco(variante.tensao),
        dados: variante.dados,
        linhas: unirLinhas(variante.linhas, []),
      });
    } else {
      existente.tensao = mesclarTensao(
        existente.tensao,
        variante.tensao === null ? null : tensaoDoBloco(variante.tensao),
      );
      existente.linhas = unirLinhas(existente.linhas, variante.linhas);
    }
  }
  return [...blocos.values()];
}

function valoresNumericos(
  dados: readonly DadosDeclarados[],
  campo: keyof DadosDeclarados,
): number[] {
  const valores = dados
    .map((item) => item[campo])
    .filter((valor): valor is number => typeof valor === "number");
  return ordenarUnicos(valores);
}

/** Resume o Aparelho inteiro: capacidades, Classe, IDRS, consumo e espera. */
export function resumoDaFicha(blocos: readonly BlocoVariante[]): ResumoFicha {
  const dados = blocos.map((bloco) => bloco.dados);
  const classes = ordenarUnicos(
    dados
      .map((item) => item.classe)
      .filter((valor): valor is string => typeof valor === "string"),
  );
  return {
    capacidadesBtu: valoresNumericos(dados, "capacidadeNominalBtu"),
    capacidadesW: valoresNumericos(dados, "capacidadeNominalW"),
    idrs: valoresNumericos(dados, "idrs"),
    classes,
    consumosKwh: valoresNumericos(dados, "consumoAnualKwh"),
    potenciasEsperaW: valoresNumericos(dados, "potenciaEsperaW"),
  };
}

function celulaVazia(celula: CelulaCondicao): boolean {
  return celula.capacidadeW === null && celula.potenciaW === null;
}

/**
 * A grade 2×2 das condições de ensaio: temperatura (35 °C e 29 °C) × carga
 * (total e parcial). Linhas e colunas sem nenhum dado ficam de fora.
 */
export function gradeDeCondicoes(dados: DadosDeclarados): GradeCondicoes {
  const todas: LinhaCondicoes[] = TEMPERATURAS.map((temperatura) => ({
    temperatura,
    total: {
      capacidadeW: dados[
        `capacidade${temperatura}TotalW` as keyof DadosDeclarados
      ] as number | null,
      potenciaW: dados[
        `potencia${temperatura}TotalW` as keyof DadosDeclarados
      ] as number | null,
    },
    parcial: {
      capacidadeW: dados[
        `capacidade${temperatura}ParcialW` as keyof DadosDeclarados
      ] as number | null,
      potenciaW: dados[
        `potencia${temperatura}ParcialW` as keyof DadosDeclarados
      ] as number | null,
    },
  }));
  const linhas = todas.filter(
    (linha) => !celulaVazia(linha.total) || !celulaVazia(linha.parcial),
  );
  return {
    linhas,
    mostrarTotal: linhas.some((linha) => !celulaVazia(linha.total)),
    mostrarParcial: linhas.some((linha) => !celulaVazia(linha.parcial)),
  };
}

function numero(valor: number): string {
  return valor.toLocaleString("pt-BR");
}

/** As etiquetas de identificação do topo da ficha (ticket 62). */
export interface EtiquetasFicha {
  /** As Classes únicas, na ordem A–F. */
  classes: string[];
  /** "A" · "A – C" · "—" — faixa quando o Aparelho declara mais de uma. */
  classe: string;
  /** Ativo quando ao menos um Registro está Ativo; senão, os status únicos. */
  situacao: string;
  /** Os números de Registro, na ordem da base; vazio quando não há. */
  registros: string[];
}

/**
 * A situação do Aparelho a partir dos Registros INMETRO: **Ativo** quando ao
 * menos um Registro está Ativo (o Aparelho continua no programa); senão, os
 * status presentes (hoje, "Inativo"). Sem Registro, "—".
 */
export function situacaoDosRegistros(
  registros: readonly RegistroInmetro[],
): string {
  if (registros.some((registro) => registro.status === "Ativo")) {
    return "Ativo";
  }
  const status = ordenarUnicos(
    registros
      .map((registro) => registro.status.trim())
      .filter((valor) => valor !== ""),
  );
  return status.length === 0 ? "—" : status.join(", ");
}

/** As etiquetas do topo: Classe (faixa quando divergente), situação e Registros. */
export function etiquetasDaFicha(
  resumo: ResumoFicha,
  registros: readonly RegistroInmetro[],
): EtiquetasFicha {
  return {
    classes: resumo.classes,
    classe: resumo.classes.length === 0 ? "—" : resumo.classes.join(" – "),
    situacao: situacaoDosRegistros(registros),
    registros: registros.map((registro) => registro.numero),
  };
}

/** Um cartão de destaque do topo da ficha (ticket 62). */
export interface CartaoDeDestaque {
  chave: "idrs" | "consumo" | "capacidade";
  rotulo: string;
  valor: string;
  legenda: string;
  /** Seção para onde o cartão leva; null quando não há seção associada. */
  ancora: `#${string}` | null;
}

/**
 * Os três cartões de destaque: IDRS, Consumo anual e Capacidade. Cada um traz a
 * unidade no valor e uma legenda curta; com mais de uma Variante, o valor vira
 * faixa (mínimo–máximo). O de Consumo anual leva a "Consumo e custo".
 */
export function cartoesDeDestaque(resumo: ResumoFicha): CartaoDeDestaque[] {
  return [
    {
      chave: "idrs",
      rotulo: "IDRS",
      valor: formatarFaixa(resumo.idrs),
      legenda: "Índice de eficiência energética (W/W)",
      ancora: null,
    },
    {
      chave: "consumo",
      rotulo: "Consumo anual",
      valor: formatarFaixa(resumo.consumosKwh, " kWh/ano"),
      legenda: `Medido pelo INMETRO em ${numero(HORAS_ANO)} h/ano`,
      ancora: "#consumo-e-custo",
    },
    {
      chave: "capacidade",
      rotulo: "Capacidade",
      valor: formatarFaixa(resumo.capacidadesBtu, " BTU/h"),
      legenda: "Capacidade nominal",
      ancora: null,
    },
  ];
}

/** Uma seção do índice da ficha, com a âncora que a abre. */
export interface SecaoDaFicha {
  id: string;
  rotulo: string;
}

/** A ordem de leitura da ficha (ticket 62). */
export const SECOES_DA_FICHA: readonly SecaoDaFicha[] = [
  { id: "resumo", rotulo: "Resumo" },
  { id: "consumo-e-custo", rotulo: "Consumo e custo" },
  { id: "condicoes-de-ensaio", rotulo: "Condições de ensaio" },
  { id: "especificacoes", rotulo: "Especificações" },
  { id: "registros", rotulo: "Registros" },
  { id: "proveniencia", rotulo: "Proveniência" },
  { id: "ofertas", rotulo: "Ofertas" },
];

/**
 * O índice de seções com âncoras apenas para as seções que existem na página —
 * sem Oferta publicada não há link para "Ofertas", e um Aparelho sem
 * Especificações ou sem Registros não ganha âncora vazia.
 */
export function indiceDaFicha(presentes: ReadonlySet<string>): SecaoDaFicha[] {
  return SECOES_DA_FICHA.filter((secao) => presentes.has(secao.id)).map(
    (secao) => ({ ...secao }),
  );
}

/** "12.000" · "5.500 – 5.900" · "—" quando não há valor. */
export function formatarFaixa(valores: readonly number[], sufixo = ""): string {
  const primeiro = valores.at(0);
  const ultimo = valores.at(-1);
  if (primeiro === undefined || ultimo === undefined) {
    return "—";
  }
  const faixa =
    primeiro === ultimo
      ? numero(primeiro)
      : `${numero(primeiro)} – ${numero(ultimo)}`;
  return `${faixa}${sufixo}`;
}

/** "12.000 BTU/h (3.516 W)" — a capacidade térmica, não a potência elétrica. */
export function descreverCapacidade(resumo: ResumoFicha): string {
  const btu = formatarFaixa(resumo.capacidadesBtu);
  const watts = formatarFaixa(resumo.capacidadesW);
  if (btu === "—") {
    return watts === "—" ? "—" : `${watts} W`;
  }
  if (watts === "—") {
    return `${btu} BTU/h`;
  }
  return `${btu} BTU/h (${watts} W)`;
}

/**
 * "2.200 / 740 W" · "245 / — W" · "— / 8.680 W" · "—" — a célula mostra sempre
 * o par "capacidade / potência", com "—" no valor que a Linha não declara.
 */
export function formatarCelula(celula: CelulaCondicao): string {
  if (celulaVazia(celula)) {
    return "—";
  }
  const capacidade =
    celula.capacidadeW === null ? "—" : numero(celula.capacidadeW);
  const potencia = celula.potenciaW === null ? "—" : numero(celula.potenciaW);
  return `${capacidade} / ${potencia} W`;
}

/**
 * "127 / 220 V · monofásico" — quando todas as voltagens do bloco aceitam as
 * mesmas fases. Com fases diferentes por voltagem, cada voltagem aparece com as
 * suas ("127 / 220 V · 127 V: monofásico · 220 V: monofásico, bifásico"),
 * porque a lista única associaria fases à voltagem errada.
 */
function tensaoTexto(tensao: TensaoBloco | null): string {
  if (tensao === null || tensao.voltagens.length === 0) {
    return "—";
  }
  const voltagens = `${tensao.voltagens.join(" / ")} V`;
  const grupos = tensao.fasesPorVoltagem.filter(
    (grupo) => grupo.fases.length > 0,
  );
  if (grupos.length === 0) {
    return voltagens;
  }
  const fasesUnicas = new Set(grupos.map((grupo) => grupo.fases.join(", ")));
  if (fasesUnicas.size === 1) {
    const [grupo] = grupos;
    return `${voltagens} · ${grupo?.fases.join(", ")}`;
  }
  const porVoltagem = grupos
    .map((grupo) => `${grupo.voltagem} V: ${grupo.fases.join(", ")}`)
    .join(" · ");
  return `${voltagens} · ${porVoltagem}`;
}

/** Gera os títulos dos blocos, numerando só quando a mesma tensão se repete. */
export function titulosDosBlocos(blocos: readonly BlocoVariante[]): string[] {
  const rotulosTensao = blocos.map((bloco) => tensaoTexto(bloco.tensao));
  const blocosPorTensao = new Map<string, number>();
  for (const rotulo of rotulosTensao) {
    blocosPorTensao.set(rotulo, (blocosPorTensao.get(rotulo) ?? 0) + 1);
  }
  const vistosPorTensao = new Map<string, number>();
  return rotulosTensao.map((rotulo) => {
    const total = blocosPorTensao.get(rotulo) ?? 0;
    if (total < 2) {
      return `Tensão: ${rotulo}`;
    }
    const posicao = (vistosPorTensao.get(rotulo) ?? 0) + 1;
    vistosPorTensao.set(rotulo, posicao);
    return `Tensão: ${rotulo} · declaração ${posicao} de ${total}`;
  });
}
