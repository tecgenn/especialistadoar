/**
 * Conjunto de ícones de linha do site (ticket 68). Só geometria: cada ícone é
 * uma lista de `d` de `<path>` desenhada na grade de 24 × 24, com traço de
 * 1,5 px, extremidades redondas e `currentColor`. Nenhum pacote de ícones e
 * nenhum arquivo externo — o SVG é inline e decorativo (`aria-hidden`).
 */

export const ICONES = {
  /** Busca e campo de pesquisa. */
  lupa: ["M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z", "m16.2 16.2 4.8 4.8"],
  /** Select, acordeão, direção descendente. */
  "seta-baixo": ["m6 9 6 6 6-6"],
  /** Link de avanço e “próximo”. */
  "seta-direita": ["M5 12h14", "m13 6 6 6-6 6"],
  /** Voltar uma etapa. */
  "seta-esquerda": ["M19 12H5", "m11 18-6-6 6-6"],
  /** Remover filtro, fechar painel. */
  x: ["M6 6l12 12", "M18 6 6 18"],
  /** Contador para cima. */
  mais: ["M12 5v14", "M5 12h14"],
  /** Contador para baixo. */
  menos: ["M5 12h14"],
  /** Erro de campo e aviso. */
  alerta: ["M12 3 2.5 20h19L12 3Z", "M12 9v5", "M12 17h.01"],
  /** Nota de transparência e ajuda. */
  info: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M12 11v5", "M12 8h.01"],
  /** Imprimir a ficha. */
  impressora: ["M7 9V3h10v6", "M4 18v-7h16v7h-3", "M7 14h10v7H7z"],
  /** Pesquisa avançada e recorte. */
  filtro: ["M3 5h18", "M6 12h12", "M10 19h4"],
  /** Confirmação de etapa e resultado. */
  check: ["m4 12 5 5L20 6"],
  /** Aparelhos em destaque: identificação da seção de modelos. */
  "ar-condicionado": [
    "M4 6h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z",
    "M6 11h12",
    "M7 18c0 1.5 1 2 1 3",
    "M12 18c0 1.5 1 2 1 3",
    "M17 18c0 1.5 1 2 1 3",
  ],
  /** Análises em destaque: artigo editorial com linhas de texto. */
  analise: ["M6 3h9l4 4v14H6z", "M15 3v4h4", "M9 12h7", "M9 16h5"],
  /** Perguntas frequentes: balão de fala com a interrogação. */
  perguntas: [
    "M4 5h16v11H9l-5 4z",
    "M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.4v.3",
    "M12 15h.01",
  ],
  /** Metodologia: camadas de dados e de ensaio. */
  camadas: ["m12 3 9 5-9 5-9-5 9-5Z", "m3 12 9 5 9-5", "m3 16 9 5 9-5"],
  /** Controle de incidência de sol do simulador. */
  sol: [
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
    "M12 2v2",
    "M12 20v2",
    "M4.9 4.9l1.4 1.4",
    "M17.7 17.7l1.4 1.4",
    "M2 12h2",
    "M20 12h2",
    "M4.9 19.1l1.4-1.4",
    "M17.7 6.3l1.4-1.4",
  ],
} as const satisfies Record<string, readonly string[]>;

export type NomeDeIcone = keyof typeof ICONES;

/** Os `d` de um ícone pelo nome. Um nome desconhecido falha o build. */
export function caminhosDoIcone(nome: string): readonly string[] {
  if (!(nome in ICONES)) {
    throw new Error(
      `Ícone desconhecido: "${nome}". Nomes válidos: ${Object.keys(ICONES).join(", ")}.`,
    );
  }
  return ICONES[nome as NomeDeIcone];
}
