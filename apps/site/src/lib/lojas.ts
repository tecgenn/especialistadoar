/**
 * Lojas com marca própria no CTA de Oferta (ticket 106). A parte pura: só
 * normalização do nome e a geometria das marcas. O SVG é inline em
 * `LogoLoja.astro` (e no equivalente React da Comparação), sem requisição,
 * arquivo de imagem ou pacote de logos.
 *
 * Os desenhos são marcas de linha na grade de 24 × 24, com traço de 1,5 px e
 * `currentColor`: nunca preenchimento amarelo, azul ou de qualquer outra cor.
 */

/** A grade compartilhada pelos dois desenhos. */
export const GRADE_DO_LOGO = "0 0 24 24";

export type ChaveLoja = "mercado-livre" | "amazon";

/** Os `d` dos `<path>` de cada marca, na ordem em que devem ser desenhados. */
export const CAMINHOS_DO_LOGO = {
  /** Aperto de mão do Mercado Livre, reduzido a traços contínuos. */
  "mercado-livre": [
    "M2.5 10.5 6 7a2.1 2.1 0 0 1 3 0l2.1 2.1",
    "M21.5 13.5 18 17a2.1 2.1 0 0 1-3 0l-2.1-2.1",
    "M8.1 11.1 10.7 8.5a1.5 1.5 0 0 1 2.1 0l3.2 3.2a1.5 1.5 0 0 1 0 2.1l-2.6 2.6",
    "M6 7 3.8 9.2a2.2 2.2 0 0 0 0 3.1L8 16.5",
    "M18 17l2.2-2.2a2.2 2.2 0 0 0 0-3.1L16 7.5",
    "M10.7 8.5 12.8 10.6",
    "M13.4 15.5 15.5 17.6",
  ],
  /** A "a" e o sorriso com seta da Amazon, como linha contínua. */
  amazon: [
    "M7 10.5c0-2.5 1.9-4.5 4.3-4.5s4.2 2 4.2 4.5v4",
    "M7 11.5h5",
    "M4 15.5c4.7 3.2 11.2 3.2 16 0",
    "m17 13.5 3 2-3 2",
  ],
} as const satisfies Record<ChaveLoja, readonly string[]>;

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

export interface DadosDoLogo {
  chave: ChaveLoja;
  nome: string;
  caminhos: readonly string[];
}

/** Resolve o desenho de uma loja; `null` manda o chamador para o fallback em texto. */
export function dadosDoLogoDaLoja(
  nome: string | null | undefined,
): DadosDoLogo | null {
  const chave = chaveDaLoja(nome);
  if (chave === null) {
    return null;
  }
  return {
    chave,
    nome: nomeDaLoja(chave),
    caminhos: CAMINHOS_DO_LOGO[chave],
  };
}
