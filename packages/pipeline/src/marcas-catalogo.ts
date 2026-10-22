import { join } from "node:path";
import { type Static, Type } from "@sinclair/typebox";
import { Ajv } from "ajv";
import { lerJsonl } from "./jsonl.ts";

/**
 * Marca de catálogo: agrupamento editorial de Marcas oficiais sob o nome que as
 * pessoas procuram (por exemplo, `SPRINGER MIDEA` e `MIDEA` sob `MIDEA`). É uma
 * camada curada: a Marca oficial da base servida nunca é reescrita, o `id` e a
 * URL das fichas não mudam — o agrupamento só aparece no dataset de consulta.
 * Ver ADR-0016.
 */
export const MarcaCatalogoSchema = Type.Object({
  /** Marca oficial, exatamente como aparece na tabela do INMETRO. */
  marca: Type.String(),
  /** Marca sob a qual o catálogo agrupa. */
  catalogo: Type.String(),
  motivo: Type.String(),
  fonte: Type.String(),
});
export type MarcaCatalogo = Static<typeof MarcaCatalogoSchema>;

/** Resolve a Marca de catálogo de uma Marca oficial. */
export type ResolverMarcaCatalogo = (marca: string) => string;

const ajv = new Ajv({ allErrors: true, strict: false });
const validarSchema = ajv.compile(MarcaCatalogoSchema);

export const ARQUIVO_MARCAS_CATALOGO = "marcas-catalogo.jsonl";

export function lerMarcasCatalogo(dataDir: string): MarcaCatalogo[] {
  return lerJsonl<MarcaCatalogo>(join(dataDir, ARQUIVO_MARCAS_CATALOGO));
}

export function validarMarcasCatalogo(entradas: MarcaCatalogo[]): void {
  const vistas = new Set<string>();
  for (const entrada of entradas) {
    if (!validarSchema(entrada)) {
      throw new Error(
        `Marca de catálogo viola o contrato: ${ajv.errorsText(validarSchema.errors)}`,
      );
    }
    const marca = entrada.marca.trim();
    const catalogo = entrada.catalogo.trim();
    if (marca === "" || catalogo === "") {
      throw new Error("Marca de catálogo exige marca e catálogo não vazios.");
    }
    if (entrada.motivo.trim() === "" || entrada.fonte.trim() === "") {
      throw new Error(`Marca de catálogo de "${marca}" exige motivo e fonte.`);
    }
    if (marca === catalogo) {
      throw new Error(
        `Marca de catálogo de "${marca}" aponta para si mesma: ${catalogo}`,
      );
    }
    if (vistas.has(marca)) {
      throw new Error(`Marca de catálogo repetida para "${marca}".`);
    }
    vistas.add(marca);
  }
}

/**
 * Resolve a Marca de catálogo de uma Marca oficial. Só é aplicada a entrada cuja
 * marca de origem existe na Versão da tabela: marcas entram e saem da
 * exportação, e um alias órfão é ignorado — não é erro de build. O nome de
 * catálogo não precisa ser uma marca oficial (é um agrupamento editorial). A
 * resolução é de um nível: `catalogo` é o nome final exibido, não outro alias.
 */
export function montarMarcaCatalogo(
  entradas: MarcaCatalogo[],
  marcasDaVersao: Iterable<string>,
): ResolverMarcaCatalogo {
  const presentes = new Set(marcasDaVersao);
  const catalogoPorMarca = new Map(
    entradas
      .filter((entrada) => presentes.has(entrada.marca))
      .map((entrada) => [entrada.marca, entrada.catalogo]),
  );
  return (marca) => catalogoPorMarca.get(marca) ?? marca;
}
