/**
 * Tarifas de referência por UF — insumo **curado do site**
 * (`apps/site/tarifas.json`), como os chips dos filtros e as Ofertas: não é
 * dado do INMETRO, não entra em `data/build/` e não muda a base servida.
 *
 * Cada UF tem a tarifa residencial de referência em R$/kWh, o mês de referência
 * (`AAAA-MM`) e a fonte — sem eles o número envelhece em silêncio. A calculadora
 * só estima: a tarifa é ponto de partida, e quem consulta pode digitar a da
 * própria conta.
 *
 * Este módulo é a parte pura — contrato, validação e índices, sem I/O. A leitura
 * do arquivo fica no glue (`src/conteudo/tarifas.ts`).
 */

/** As 27 unidades da federação, com o nome que a interface mostra. */
export const UFS = [
  { uf: "AC", nome: "Acre" },
  { uf: "AL", nome: "Alagoas" },
  { uf: "AP", nome: "Amapá" },
  { uf: "AM", nome: "Amazonas" },
  { uf: "BA", nome: "Bahia" },
  { uf: "CE", nome: "Ceará" },
  { uf: "DF", nome: "Distrito Federal" },
  { uf: "ES", nome: "Espírito Santo" },
  { uf: "GO", nome: "Goiás" },
  { uf: "MA", nome: "Maranhão" },
  { uf: "MT", nome: "Mato Grosso" },
  { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MG", nome: "Minas Gerais" },
  { uf: "PA", nome: "Pará" },
  { uf: "PB", nome: "Paraíba" },
  { uf: "PR", nome: "Paraná" },
  { uf: "PE", nome: "Pernambuco" },
  { uf: "PI", nome: "Piauí" },
  { uf: "RJ", nome: "Rio de Janeiro" },
  { uf: "RN", nome: "Rio Grande do Norte" },
  { uf: "RS", nome: "Rio Grande do Sul" },
  { uf: "RO", nome: "Rondônia" },
  { uf: "RR", nome: "Roraima" },
  { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "São Paulo" },
  { uf: "SE", nome: "Sergipe" },
  { uf: "TO", nome: "Tocantins" },
] as const;

export type Uf = (typeof UFS)[number]["uf"];

/** A UF do estado padrão da calculadora (ADR-0022). */
export const UF_PADRAO: Uf = "SP";

/** Uma tarifa de referência: R$/kWh, com o mês e a fonte do valor. */
export interface TarifaReferencia {
  uf: string;
  nome: string;
  tarifa: number;
  /** Mês de referência no formato `AAAA-MM`. */
  referencia: string;
  fonte: string;
}

export interface TarifasCuradas {
  ufs: TarifaReferencia[];
}

function textoObrigatorio(valor: unknown, onde: string, campo: string): string {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new Error(`${onde}: \`${campo}\` é obrigatório.`);
  }
  return valor.trim();
}

/**
 * Valida a curadoria das tarifas **no build**: as 27 UFs, cada uma uma vez, com
 * tarifa numérica, positiva e finita, e `referencia`/`fonte` preenchidas. Uma UF
 * desconhecida ou ausente falha o build com a UF na mensagem — tarifa faltando
 * viraria "R$ NaN" na tela, então nunca é silêncio.
 */
export function validarTarifas(entrada: unknown): TarifasCuradas {
  if (
    entrada === null ||
    typeof entrada !== "object" ||
    Array.isArray(entrada)
  ) {
    throw new Error("Tarifas: a curadoria precisa ser um objeto com `ufs`.");
  }
  const { ufs } = entrada as { ufs?: unknown };
  if (!Array.isArray(ufs)) {
    throw new Error("Tarifas: `ufs` precisa ser uma lista.");
  }

  const conhecidas = new Map<string, string>(
    UFS.map(({ uf, nome }) => [uf, nome]),
  );
  const vistas = new Set<string>();
  const validadas: TarifaReferencia[] = ufs.map((item, indice) => {
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`Tarifa #${indice}: precisa ser um objeto com \`uf\`.`);
    }
    const bruto = item as Record<string, unknown>;
    const uf = textoObrigatorio(
      bruto.uf,
      `Tarifa #${indice}`,
      "uf",
    ).toUpperCase();
    const onde = `UF ${uf || `#${indice}`}`;

    if (!conhecidas.has(uf)) {
      throw new Error(`${onde}: UF desconhecida (não é uma das 27).`);
    }
    if (vistas.has(uf)) {
      throw new Error(`${onde}: UF duplicada.`);
    }
    vistas.add(uf);

    const { tarifa } = bruto;
    if (typeof tarifa !== "number" || !Number.isFinite(tarifa) || tarifa <= 0) {
      throw new Error(
        `${onde}: \`tarifa\` precisa ser um número positivo (R$/kWh).`,
      );
    }

    return {
      uf,
      nome: textoObrigatorio(bruto.nome, onde, "nome"),
      tarifa,
      referencia: textoObrigatorio(bruto.referencia, onde, "referencia"),
      fonte: textoObrigatorio(bruto.fonte, onde, "fonte"),
    };
  });

  const ausentes = UFS.filter(({ uf }) => !vistas.has(uf)).map(({ uf }) => uf);
  if (ausentes.length > 0) {
    throw new Error(
      `Tarifas: UF ausente na curadoria: ${ausentes.join(", ")}.`,
    );
  }

  return { ufs: validadas };
}

/** Índice UF → tarifa, para a leitura da URL e a interface. */
export function indexarTarifas(
  tarifas: TarifasCuradas,
): Map<string, TarifaReferencia> {
  return new Map(tarifas.ufs.map((tarifa) => [tarifa.uf, tarifa]));
}

/** A tarifa de referência de uma UF; `undefined` para UF desconhecida. */
export function tarifaDaUf(
  tarifas: TarifasCuradas,
  uf: string,
): number | undefined {
  return indexarTarifas(tarifas).get(uf.trim().toUpperCase())?.tarifa;
}

/**
 * A tarifa de referência da UF padrão. A curadoria validada garante SP, então o
 * retorno é sempre numérico — o fallback existe para o tipo, não para o build.
 */
export function tarifaPadrao(tarifas: TarifasCuradas): number {
  return tarifaDaUf(tarifas, UF_PADRAO) ?? 0;
}
