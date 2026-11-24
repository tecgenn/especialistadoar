/**
 * Lojas com logotipo próprio no CTA de Oferta (tickets 106 e 108). A parte
 * pura: normalização do nome e as medidas reservadas de cada marca. Os dois
 * SVGs oficiais vivem em `src/assets/lojas/` e são importados pelos componentes
 * como arquivo — nenhuma marca é desenhada à mão em código.
 *
 * Cada logotipo entra num cartão pequeno com a cor da loja: amarelo do Mercado
 * Livre e fundo escuro da Amazon com o wordmark em branco. "Ver oferta" fica
 * fora do cartão, no mesmo link, e o nome da loja não é repetido em texto.
 */

export type ChaveLoja = "mercado-livre" | "amazon";

/** Medidas reservadas dos SVGs oficiais (largura/altura do viewBox). */
export const LOGOS_DAS_LOJAS = {
  "mercado-livre": { nome: "Mercado Livre", largura: 79, altura: 20 },
  amazon: { nome: "Amazon", largura: 66, altura: 20 },
} as const satisfies Record<
  ChaveLoja,
  { nome: string; largura: number; altura: number }
>;

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

/** Devolve a chave da marca ou `null` quando a loja não tem logotipo próprio. */
export function chaveDaLoja(nome: string | null | undefined): ChaveLoja | null {
  const normalizado = normalizar(nome);
  return ALIASES[normalizado as keyof typeof ALIASES] ?? null;
}

/** O nome canônico da loja, para o nome acessível do link. */
export function nomeDaLoja(chave: ChaveLoja): string {
  return LOGOS_DAS_LOJAS[chave].nome;
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

export type DadosDoLogo = {
  chave: ChaveLoja;
  nome: string;
  largura: number;
  altura: number;
};

/**
 * Resolve a marca da loja; `null` manda o chamador para o fallback em texto.
 * O chamador escolhe o arquivo pelo `chave` — os dois SVGs são locais.
 */
export function dadosDoLogoDaLoja(
  nome: string | null | undefined,
): DadosDoLogo | null {
  const chave = chaveDaLoja(nome);
  if (chave === null) {
    return null;
  }
  const { nome: nomeCanonico, largura, altura } = LOGOS_DAS_LOJAS[chave];
  return { chave, nome: nomeCanonico, largura, altura };
}
