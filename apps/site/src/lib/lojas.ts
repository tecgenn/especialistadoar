/**
 * Lojas com marca própria no CTA de Oferta (tickets 106 e 108). A parte pura:
 * normalização do nome, a geometria da marca desenhada em linha e o nome do
 * arquivo do logotipo oficial. O Mercado Livre usa o SVG real da marca em
 * `src/assets/lojas/`; a Amazon continua desenhada em linha, dentro de
 * `LogoLoja.astro` (e no equivalente React da Comparação).
 *
 * Os desenhos de linha ficam na grade de 24 × 24, com traço de 1,5 px e
 * `currentColor` — a marca em arquivo é a única com as cores da loja.
 */

/** A grade compartilhada pelos desenhos de linha. */
export const GRADE_DO_LOGO = "0 0 24 24";

export type ChaveLoja = "mercado-livre" | "amazon";

/** Lojas com logotipo oficial em arquivo, em vez de desenho de linha. */
export type ChaveComArquivo = "mercado-livre";

/** As medidas reservadas do logotipo em arquivo (proporção de 920,12 × 233,88). */
export const MEDIDAS_DO_LOGO_MERCADO_LIVRE = {
  largura: 79,
  altura: 20,
} as const;

/** Os `d` dos `<path>` de cada marca desenhada, na ordem do desenho. */
export const CAMINHOS_DO_LOGO = {
  /** A "a" e o sorriso com seta da Amazon, como linha contínua. */
  amazon: [
    "M7 10.5c0-2.5 1.9-4.5 4.3-4.5s4.2 2 4.2 4.5v4",
    "M7 11.5h5",
    "M4 15.5c4.7 3.2 11.2 3.2 16 0",
    "m17 13.5 3 2-3 2",
  ],
} as const satisfies Record<
  Exclude<ChaveLoja, ChaveComArquivo>,
  readonly string[]
>;

const NOMES_DAS_LOJAS = {
  "mercado-livre": "Mercado Livre",
  amazon: "Amazon",
} as const satisfies Record<ChaveLoja, string>;

const ALIASES = {
  "mercado livre": "mercado-livre",
  mercadolivre: "mercado-livre",
  amazon: "amazon",
} as const;

/** Remove acento, caixa e espaços repetidos antes de comparar o nome da loja. */
function normalizar(nome: string | null | undefined): string {
  if (typeof nome !== "string") {
    return "";
  }
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/** Devolve a chave da marca ou `null` quando a loja não tem desenho próprio. */
export function chaveDaLoja(nome: string | null | undefined): ChaveLoja | null {
  const normalizado = normalizar(nome);
  return ALIASES[normalizado as keyof typeof ALIASES] ?? null;
}

/** O nome canônico da loja, para o `aria-label` do SVG. */
export function nomeDaLoja(chave: ChaveLoja): string {
  return NOMES_DAS_LOJAS[chave];
}

/**
 * O nome da loja dentro do nome acessível do link. Lojas conhecidas usam a
 * grafia canônica; as demais mantêm o texto publicado, sem espaços sobrando.
 */
export function nomeDaLojaParaLeitura(nome: string | null | undefined): string {
  const chave = chaveDaLoja(nome);
  if (chave !== null) {
    return nomeDaLoja(chave);
  }
  return typeof nome === "string" ? nome.trim() : "";
}

export type DadosDoLogo =
  | { tipo: "arquivo"; chave: ChaveComArquivo; nome: string }
  | {
      tipo: "desenho";
      chave: Exclude<ChaveLoja, ChaveComArquivo>;
      nome: string;
      caminhos: readonly string[];
    };

/**
 * Resolve a marca da loja; `null` manda o chamador para o fallback em texto.
 * A loja com arquivo devolve `tipo: "arquivo"` — o componente importa o SVG.
 */
export function dadosDoLogoDaLoja(
  nome: string | null | undefined,
): DadosDoLogo | null {
  const chave = chaveDaLoja(nome);
  if (chave === null) {
    return null;
  }
  if (chave === "mercado-livre") {
    return { tipo: "arquivo", chave, nome: nomeDaLoja(chave) };
  }
  return {
    tipo: "desenho",
    chave,
    nome: nomeDaLoja(chave),
    caminhos: CAMINHOS_DO_LOGO[chave],
  };
}
