/**
 * Ofertas: links comerciais de afiliado para um Aparelho. Vivem **só no site**
 * (`apps/site/ofertas.json`), fora da base servida — nunca são um campo de
 * Aparelho e nunca entram em `data/build/` (ver CONTEXT.md e ADR-0010). Este
 * módulo é a parte pura: validação e indexação por Aparelho, sem I/O.
 */

export interface Oferta {
  /** O `id` do Aparelho (`ap-<12 hex>`) ao qual a Oferta pertence. */
  aparelhoId: string;
  /** A loja (ou programa de afiliados) do link. */
  loja: string;
  /** O rótulo do link exibido na página do Aparelho. */
  titulo: string;
  /** O endereço comercial (http/https). */
  url: string;
}

function campoEmBranco(valor: unknown): boolean {
  return typeof valor !== "string" || valor.trim() === "";
}

function ehHttp(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Valida o contrato das Ofertas. Recusa campo obrigatório em branco, URL que não
 * seja http/https e — quando `idsConhecidos` é informado — Oferta apontando para
 * um Aparelho inexistente (a guarda de build evita Oferta órfã). Também recusa
 * a mesma URL repetida para o mesmo Aparelho (Oferta duplicada).
 */
export function validarOfertas(
  ofertas: readonly Oferta[],
  idsConhecidos?: ReadonlySet<string>,
): void {
  if (!Array.isArray(ofertas)) {
    throw new Error("Ofertas precisa ser uma lista.");
  }

  const vistas = new Set<string>();
  ofertas.forEach((oferta, indice) => {
    const onde = `Oferta #${indice}`;
    if (campoEmBranco(oferta?.aparelhoId)) {
      throw new Error(`${onde}: \`aparelhoId\` é obrigatório.`);
    }
    if (campoEmBranco(oferta?.loja)) {
      throw new Error(`${onde}: \`loja\` é obrigatório.`);
    }
    if (campoEmBranco(oferta?.titulo)) {
      throw new Error(`${onde}: \`titulo\` é obrigatório.`);
    }
    if (campoEmBranco(oferta?.url)) {
      throw new Error(`${onde}: \`url\` é obrigatório.`);
    }
    if (!ehHttp(oferta.url)) {
      throw new Error(`${onde}: \`url\` precisa ser http(s): ${oferta.url}`);
    }
    if (idsConhecidos !== undefined && !idsConhecidos.has(oferta.aparelhoId)) {
      throw new Error(
        `${onde}: Aparelho inexistente na base servida: ${oferta.aparelhoId}`,
      );
    }
    const chave = `${oferta.aparelhoId}\u0000${oferta.url}`;
    if (vistas.has(chave)) {
      throw new Error(
        `${onde}: Oferta duplicada para o Aparelho ${oferta.aparelhoId}.`,
      );
    }
    vistas.add(chave);
  });
}

/** Agrupa as Ofertas por Aparelho, preservando a ordem do arquivo. */
export function indexarOfertas(
  ofertas: readonly Oferta[],
): Map<string, Oferta[]> {
  const porAparelho = new Map<string, Oferta[]>();
  for (const oferta of ofertas) {
    const lista = porAparelho.get(oferta.aparelhoId);
    if (lista === undefined) {
      porAparelho.set(oferta.aparelhoId, [oferta]);
    } else {
      lista.push(oferta);
    }
  }
  return porAparelho;
}
