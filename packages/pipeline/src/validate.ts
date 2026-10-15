import { Ajv } from "ajv";
import { type Aparelho, AparelhoSchema } from "./aparelho.ts";
import { aparelhoTemDadosDeclarados, chaveIdentidade } from "./group.ts";

/**
 * Valida a base servida contra o contrato (Ajv) e as invariantes de domínio.
 * Qualquer violação é uma falha dura: aborta o build.
 */
export function validarBaseServida(aparelhos: Aparelho[]): void {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validar = ajv.compile(AparelhoSchema);
  const identidades = new Set<string>();

  for (const aparelho of aparelhos) {
    const id = aparelho.id;
    if (!validar(aparelho)) {
      throw new Error(
        `Aparelho ${id} viola o contrato: ${ajv.errorsText(validar.errors)}`,
      );
    }

    if (!aparelhoTemDadosDeclarados(aparelho)) {
      throw new Error(
        `Aparelho ${id} está na base servida sem Dados declarados.`,
      );
    }

    if (aparelho.linhas.length === 0 || aparelho.registros.length === 0) {
      throw new Error(
        `Aparelho ${id} sem proveniência: faltam Linhas da tabela ou Registros INMETRO.`,
      );
    }

    const chave = chaveIdentidade(
      aparelho.marca,
      aparelho.unidadeInterna,
      aparelho.unidadeExterna,
      aparelho.modelo,
    );
    if (identidades.has(chave)) {
      throw new Error(`Identidade duplicada na base servida: ${chave}`);
    }
    identidades.add(chave);
  }
}
