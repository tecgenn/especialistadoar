/**
 * Contrato puro dos primitivos de interface (ticket 68). Nada aqui toca no DOM:
 * a etiqueta de Classe decide o texto, a cor e a explicação, e o campo decide
 * quais descrições o `aria-describedby` aponta.
 */

export const CLASSES_ENERGETICAS = ["A", "B", "C", "D", "E", "F"] as const;

export type ClasseEnergetica = (typeof CLASSES_ENERGETICAS)[number];

export interface EtiquetaDeClasse {
  /** Texto visível: `A` quando as Variantes concordam, `A – C` quando divergem. */
  texto: string;
  /** A pior Classe do conjunto: a letra, a borda e o fundo tonal usam o tom dela. */
  pior: ClasseEnergetica;
  /** Explicação para o `title` e para o leitor de tela. */
  explicacao: string;
}

function indiceDaClasse(classe: string): number {
  const indice = CLASSES_ENERGETICAS.indexOf(classe as ClasseEnergetica);
  if (indice === -1) {
    throw new Error(
      `Classe energética desconhecida: "${classe}". Use A, B, C, D, E ou F.`,
    );
  }
  return indice;
}

/**
 * A etiqueta da Classe de um Aparelho a partir das Classes das Variantes. Sem
 * Classe, devolve `null` e a etiqueta não é renderizada; com mais de uma, a
 * faixa vai da melhor à pior e o tom é o da pior — a cor nunca substitui a
 * letra.
 */
export function etiquetaDaClasse(
  classes: readonly string[],
): EtiquetaDeClasse | null {
  const ordenadas = [
    ...new Set(classes.map((classe) => classe.trim()).filter(Boolean)),
  ].sort((a, b) => indiceDaClasse(a) - indiceDaClasse(b));

  const primeira = ordenadas[0];
  const ultima = ordenadas.at(-1);
  if (!primeira || !ultima) return null;

  const melhor = primeira as ClasseEnergetica;
  const pior = ultima as ClasseEnergetica;

  if (melhor === pior) {
    return {
      texto: melhor,
      pior,
      explicacao: `Classe energética ${melhor}, declarada pelo INMETRO.`,
    };
  }

  return {
    texto: `${melhor} – ${pior}`,
    pior,
    explicacao: `Classes energéticas ${melhor} a ${pior} entre as Variantes; a pior é ${pior}.`,
  };
}

/** O `id` da ajuda e o do erro de um campo, derivados do `id` do controle. */
export function idDaAjuda(id: string): string {
  return `${id}-ajuda`;
}

export function idDoErro(id: string): string {
  return `${id}-erro`;
}

/**
 * O valor de `aria-describedby` de um campo: ajuda e erro associados, na ordem
 * de leitura. Sem nenhum dos dois, devolve `undefined` (e o atributo some).
 */
export function idsDaDescricao(
  id: string,
  estado: { ajuda?: boolean; erro?: boolean },
): string | undefined {
  const ids: string[] = [];
  if (estado.ajuda) ids.push(idDaAjuda(id));
  if (estado.erro) ids.push(idDoErro(id));
  return ids.length > 0 ? ids.join(" ") : undefined;
}
