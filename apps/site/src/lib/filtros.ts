/**
 * Curadoria dos filtros do catálogo: as marcas conhecidas (com rótulo próprio)
 * e as capacidades comuns que viram **chips** visíveis na ilha de consulta.
 * Vive só no site (`apps/site/filtros.json`), como as Ofertas: não é dado do
 * INMETRO, não entra em `data/build/` e não muda a base servida.
 *
 * Este módulo é a parte pura — validação do contrato, sem I/O. A leitura do
 * arquivo fica no glue (`src/conteudo/filtros.ts`).
 */

/** Uma marca conhecida: `valor` é o filtro (`MIDEA`) e `rotulo` o que se lê no chip. */
export interface MarcaCurada {
  valor: string;
  rotulo: string;
}

export interface FiltrosCurados {
  marcas: MarcaCurada[];
  btus: number[];
}

/** Curadoria vazia: o filtro cai no comportamento sem chips. */
export const FILTROS_VAZIOS: FiltrosCurados = { marcas: [], btus: [] };

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
 * Valida o contrato da curadoria: marca com `valor` e `rotulo` preenchidos, sem
 * valor nem rótulo repetido (indiferente à caixa) e capacidade inteira positiva,
 * sem repetição. Um valor curado que não existe na base **não** é erro — é
 * escondido na derivação das opções (marcas entram e saem da tabela).
 */
export function validarFiltros(entrada: unknown): FiltrosCurados {
  if (
    entrada === null ||
    typeof entrada !== "object" ||
    Array.isArray(entrada)
  ) {
    throw new Error(
      "Filtros: a curadoria precisa ser um objeto com `marcas` e `btus`.",
    );
  }
  const { marcas, btus } = entrada as { marcas?: unknown; btus?: unknown };

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

    return { valor: valorLimpo, rotulo: rotuloLimpo };
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

  return { marcas: marcasValidadas, btus: btusValidos };
}
