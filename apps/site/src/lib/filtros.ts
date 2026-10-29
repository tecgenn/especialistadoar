/**
 * Curadoria dos filtros do catálogo: as marcas conhecidas (com rótulo próprio),
 * as capacidades comuns e as classes energéticas que viram **chips** visíveis
 * na ilha de consulta. Vive só no site (`apps/site/filtros.json`), como as
 * Ofertas: não é dado do INMETRO, não entra em `data/build/` e não muda a
 * base servida.
 *
 * Este módulo é a parte pura — validação do contrato, sem I/O. A leitura do
 * arquivo fica no glue (`src/conteudo/filtros.ts`).
 */

/** Uma marca ou classe conhecida: `valor` é o filtro e `rotulo` o que se lê no chip. */
export interface MarcaCurada {
  valor: string;
  rotulo: string;
  /** Cor opcional para chips de classe (ex.: A=#16a34a). */
  cor?: string;
}

export interface FiltrosCurados {
  marcas: MarcaCurada[];
  btus: number[];
  classes: MarcaCurada[];
}

/** Curadoria vazia: o filtro cai no comportamento sem chips. */
export const FILTROS_VAZIOS: FiltrosCurados = {
  marcas: [],
  btus: [],
  classes: [],
};

function lista(valor: unknown, campo: string): unknown[] {
  if (!Array.isArray(valor)) {
    throw new Error(`Filtros: \`${campo}\` precisa ser uma lista.`);
  }
  return valor;
}

function textoObrigatorio(valor: unknown, onde: string, campo: string): string {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new Error(`${onde}: \`${campo}\` é obrigatório.`);
  }
  return valor.trim();
}

/**
 * Valida o contrato da curadoria: marca/classe com `valor` e `rotulo` preenchidos,
 * sem valor nem rótulo repetido (indiferente à caixa) e capacidade inteira
 * positiva, sem repetição. Um valor curado que não existe na base **não** é erro
 * — é escondido na derivação das opções (marcas entram e saem da tabela).
 */
export function validarFiltros(entrada: unknown): FiltrosCurados {
  if (
    entrada === null ||
    typeof entrada !== "object" ||
    Array.isArray(entrada)
  ) {
    throw new Error(
      "Filtros: a curadoria precisa ser um objeto com `marcas`, `btus` e `classes`.",
    );
  }
  const { marcas, btus, classes } = entrada as {
    marcas?: unknown;
    btus?: unknown;
    classes?: unknown;
  };

  const valoresVistos = new Map<string, string>();
  const rotulosVistos = new Map<string, string>();
  const marcasValidadas = lista(marcas, "marcas").map((item, indice) => {
    const onde = `Marca #${indice}`;
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`${onde}: precisa ter \`valor\` e \`rotulo\`.`);
    }
    const { valor, rotulo } = item as Record<string, unknown>;
    const valorLimpo = textoObrigatorio(valor, onde, "valor");
    const rotuloLimpo = textoObrigatorio(rotulo, onde, "rotulo");

    const chaveValor = valorLimpo.toUpperCase();
    const valorAnterior = valoresVistos.get(chaveValor);
    if (valorAnterior !== undefined) {
      throw new Error(
        `${onde}: marca duplicada: ${valorLimpo} (já curada como ${valorAnterior}).`,
      );
    }
    valoresVistos.set(chaveValor, valorLimpo);

    const chaveRotulo = rotuloLimpo.toUpperCase();
    const rotuloAnterior = rotulosVistos.get(chaveRotulo);
    if (rotuloAnterior !== undefined) {
      throw new Error(
        `${onde}: rótulo duplicado: ${rotuloLimpo} (já usado por ${rotuloAnterior}).`,
      );
    }
    rotulosVistos.set(chaveRotulo, valorLimpo);

    const cor = (item as Record<string, unknown>).cor as string | undefined;
    return { valor: valorLimpo, rotulo: rotuloLimpo, cor };
  });

  const classesValidadas = lista(classes, "classes").map((item, indice) => {
    const onde = `Classe #${indice}`;
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`${onde}: precisa ter \`valor\` e \`rotulo\`.`);
    }
    const { valor, rotulo } = item as Record<string, unknown>;
    const valorLimpo = textoObrigatorio(valor, onde, "valor");
    const rotuloLimpo = textoObrigatorio(rotulo, onde, "rotulo");

    const chaveValor = valorLimpo.toUpperCase();
    if (valoresVistos.has(chaveValor)) {
      throw new Error(`${onde}: valor duplicado: ${valorLimpo}.`);
    }
    valoresVistos.set(chaveValor, valorLimpo);

    const chaveRotulo = rotuloLimpo.toUpperCase();
    if (rotulosVistos.has(chaveRotulo)) {
      throw new Error(`${onde}: rótulo duplicado: ${rotuloLimpo}.`);
    }
    rotulosVistos.set(chaveRotulo, valorLimpo);

    const cor = (item as Record<string, unknown>).cor as string | undefined;
    return { valor: valorLimpo, rotulo: rotuloLimpo, cor };
  });

  const btusVistos = new Set<number>();
  const btusValidos = lista(btus, "btus").map((valor, indice) => {
    const onde = `Capacidade #${indice}`;
    if (typeof valor !== "number" || !Number.isInteger(valor) || valor <= 0) {
      throw new Error(
        `${onde}: a capacidade precisa ser um inteiro positivo (BTU/h).`,
      );
    }
    if (btusVistos.has(valor)) {
      throw new Error(`${onde}: capacidade duplicada: ${valor}.`);
    }
    btusVistos.add(valor);
    return valor;
  });

  return {
    marcas: marcasValidadas,
    btus: btusValidos,
    classes: classesValidadas,
  };
}
