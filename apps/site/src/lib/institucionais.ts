/**
 * Definições compartilhadas das páginas institucionais (ticket 57). O e-mail é
 * uma constante única do site; a mesma lista de assuntos alimenta os links
 * `mailto:` da página de contato, e os metadados alimentam o `<head>` de cada
 * página e os links do rodapé. Módulo puro: sem Astro, sem I/O.
 */

/** Endereço único de contato do site, usado por todos os assuntos. */
export const EMAIL_CONTATO = "tecgenn@gmail.com";

export interface AssuntoContato {
  /** Texto visível na página. */
  rotulo: string;
  /** Assunto pré-preenchido no e-mail. */
  assunto: string;
  /** O que cabe naquele assunto. */
  descricao: string;
}

export const ASSUNTOS_CONTATO: readonly AssuntoContato[] = [
  {
    rotulo: "Dúvida",
    assunto: "Dúvida",
    descricao: "Perguntas sobre o site, os dados ou a calculadora.",
  },
  {
    rotulo: "Correção de dado do INMETRO",
    assunto: "Correção de dado do INMETRO",
    descricao:
      "Um valor que parece errado na ficha de um aparelho. Inclua o modelo e a fonte da correção.",
  },
  {
    rotulo: "Parceria",
    assunto: "Parceria",
    descricao: "Propostas de trabalho em conjunto com o site.",
  },
];

/** Link de e-mail com o assunto pré-preenchido e codificado para a URL. */
export function linkMailto(assunto: string): string {
  return `mailto:${EMAIL_CONTATO}?subject=${encodeURIComponent(assunto)}`;
}

export interface PaginaInstitucional {
  href: string;
  /** Título da aba e do `<title>`. */
  titulo: string;
  /** Texto visível no rodapé. */
  rotuloRodape: string;
  descricao: string;
}

export const PAGINAS_INSTITUCIONAIS: Record<
  "contato" | "privacidade" | "termos",
  PaginaInstitucional
> = {
  contato: {
    href: "/contato/",
    titulo: "Contato — Especialista do Ar",
    rotuloRodape: "Contato",
    descricao: `Fale com o Especialista do Ar: dúvidas, correção de dado do INMETRO e parcerias pelo e-mail ${EMAIL_CONTATO}.`,
  },
  privacidade: {
    href: "/politica-de-privacidade/",
    titulo: "Política de Privacidade — Especialista do Ar",
    rotuloRodape: "Política de Privacidade",
    descricao:
      "Como o Especialista do Ar trata dados: sem cadastro, sem cookies próprios, métricas do Cloudflare Web Analytics e direitos da LGPD.",
  },
  termos: {
    href: "/termos-de-uso/",
    titulo: "Termos de Uso — Especialista do Ar",
    rotuloRodape: "Termos de Uso",
    descricao:
      "Regras de uso do Especialista do Ar: dados oficiais do INMETRO, Valores calculados, Ofertas de afiliado e uso livre da base com atribuição.",
  },
};

/** Canonical da página institucional, sem querystring nem estado de interface. */
export function canonicalInstitucional(
  pagina: PaginaInstitucional,
  site: URL | undefined,
): string {
  return site ? new URL(pagina.href, site).href : pagina.href;
}
