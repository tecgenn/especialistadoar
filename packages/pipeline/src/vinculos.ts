import { join } from "node:path";
import { type Static, Type } from "@sinclair/typebox";
import { Ajv } from "ajv";
import { lerJsonl } from "./jsonl.ts";

/**
 * Vínculo sugerido: indício de que um Aparelho novo é, na verdade, um Aparelho
 * Ausente com o texto do modelo corrigido. É só uma sugestão — nunca vale como
 * identidade até uma pessoa confirmar.
 */
export const VinculoSugeridoSchema = Type.Object({
  anterior: Type.String(),
  novo: Type.String(),
});
export type VinculoSugerido = Static<typeof VinculoSugeridoSchema>;

/**
 * Vínculo confirmado: um Vínculo sugerido aprovado por uma pessoa. Passa a valer
 * como identidade do Aparelho, guardando o par sugerido e quem confirmou.
 */
export const VinculoConfirmadoSchema = Type.Object({
  anterior: Type.String(),
  novo: Type.String(),
  confirmadoPor: Type.String(),
});
export type VinculoConfirmado = Static<typeof VinculoConfirmadoSchema>;

const ajv = new Ajv({ allErrors: true, strict: false });
const validarSchema = ajv.compile(VinculoConfirmadoSchema);

export const ARQUIVO_VINCULOS = "vinculos-confirmados.jsonl";

export function lerVinculosConfirmados(dataDir: string): VinculoConfirmado[] {
  return lerJsonl<VinculoConfirmado>(join(dataDir, ARQUIVO_VINCULOS));
}

/** A única porta pela qual um Vínculo sugerido passa a valer como identidade. */
export function confirmarVinculo(
  sugerido: VinculoSugerido,
  confirmadoPor: string,
): VinculoConfirmado {
  exigirConfirmadoPor(confirmadoPor);
  return {
    anterior: sugerido.anterior,
    novo: sugerido.novo,
    confirmadoPor,
  };
}

function exigirConfirmadoPor(confirmadoPor: string): void {
  if (confirmadoPor.trim() === "") {
    throw new Error("Vínculo confirmado exige quem confirmou.");
  }
}

export function validarVinculosConfirmados(
  vinculos: VinculoConfirmado[],
): void {
  for (const vinculo of vinculos) {
    const { anterior, novo, confirmadoPor } = vinculo;
    if (!validarSchema(vinculo)) {
      throw new Error(
        `Vínculo confirmado viola o contrato (um Vínculo sugerido precisa de confirmação): ${ajv.errorsText(validarSchema.errors)}`,
      );
    }
    exigirConfirmadoPor(confirmadoPor);
    if (anterior === novo) {
      throw new Error(
        `Vínculo confirmado precisa de identidades distintas: ${anterior}`,
      );
    }
  }
}

/**
 * Um Vínculo só faz sentido se o Aparelho novo está presente nesta Versão e a
 * identidade histórica (o Aparelho Ausente) não está — senão não haveria fusão.
 */
export function validarVinculosAplicaveis(
  vinculos: VinculoConfirmado[],
  identidadesPresentes: ReadonlySet<string>,
): void {
  for (const vinculo of vinculos) {
    if (!identidadesPresentes.has(vinculo.novo)) {
      throw new Error(
        `Vínculo confirmado aponta Aparelho inexistente nesta Versão da tabela: ${vinculo.novo}`,
      );
    }
    if (identidadesPresentes.has(vinculo.anterior)) {
      throw new Error(
        `Vínculo confirmado só vale para um Aparelho Ausente; a identidade histórica ainda está presente: ${vinculo.anterior}`,
      );
    }
  }
}

/**
 * Constrói o remapeamento de identidade a partir dos Vínculos confirmados: a
 * identidade histórica (anterior) é canônica e absorve o texto do Aparelho novo.
 */
export function montarIdentidadeCanonica(
  vinculos: VinculoConfirmado[],
): (chave: string) => string {
  const mapa = new Map(
    vinculos.map((vinculo) => [vinculo.novo, vinculo.anterior]),
  );
  return (chave) => {
    let atual = chave;
    const vistos = new Set<string>();
    while (mapa.has(atual)) {
      if (vistos.has(atual)) {
        throw new Error(`Ciclo em Vínculos confirmados: ${chave}`);
      }
      vistos.add(atual);
      atual = mapa.get(atual) as string;
    }
    return atual;
  };
}
