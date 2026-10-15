import { join } from "node:path";
import { type Static, Type } from "@sinclair/typebox";
import { Ajv } from "ajv";
import { lerJsonl } from "./jsonl.ts";
import { normalizarValores } from "./normalize.ts";
import type { ValoresDaLinha } from "./parse.ts";

/**
 * Exceção manual: a única forma de alterar *conteúdo* de um campo de uma Linha
 * da tabela. Vive como artefato curado por uma pessoa, com motivo e fonte
 * registrados, e é aplicada no build sobre o Valor original — a normalização
 * roda depois, então uma diferença apenas de formato nunca precisa de exceção.
 */
export const ExcecaoManualSchema = Type.Object({
  versao: Type.String(),
  linha: Type.Number(),
  campo: Type.String(),
  valor: Type.String(),
  motivo: Type.String(),
  fonte: Type.String(),
});
export type ExcecaoManual = Static<typeof ExcecaoManualSchema>;

const ajv = new Ajv({ allErrors: true, strict: false });
const validarSchema = ajv.compile(ExcecaoManualSchema);

export const ARQUIVO_EXCECOES = "excecoes-manuais.jsonl";

export function lerExcecoes(dataDir: string): ExcecaoManual[] {
  return lerJsonl<ExcecaoManual>(join(dataDir, ARQUIVO_EXCECOES));
}

export function validarExcecoes(excecoes: ExcecaoManual[]): void {
  for (const excecao of excecoes) {
    const linha = excecao.linha;
    if (!validarSchema(excecao)) {
      throw new Error(
        `Exceção manual da Linha ${linha} viola o contrato: ${ajv.errorsText(validarSchema.errors)}`,
      );
    }
    if (excecao.motivo.trim() === "" || excecao.fonte.trim() === "") {
      throw new Error(`Exceção manual da Linha ${linha} exige motivo e fonte.`);
    }
  }
}

function valorOficial(campo: string, valor: string): unknown {
  return normalizarValores({ [campo]: valor }).oficial[campo];
}

/**
 * Aplica as Exceções de uma Linha sobre o Valor original antes da normalização.
 * Recusa correções que só mudariam formato (isso é papel das regras) ou que
 * apontariam um campo inexistente.
 */
export function aplicarExcecoes(
  valores: ValoresDaLinha,
  excecoes: ExcecaoManual[],
): ValoresDaLinha {
  if (excecoes.length === 0) {
    return valores;
  }

  const resultado = { ...valores };
  for (const excecao of excecoes) {
    const atual = resultado[excecao.campo];
    if (atual === undefined) {
      throw new Error(
        `Exceção manual aponta campo inexistente na Linha ${excecao.linha}: ${excecao.campo}`,
      );
    }
    const antes = valorOficial(excecao.campo, atual);
    const depois = valorOficial(excecao.campo, excecao.valor);
    // Só é "apenas formato" quando o Valor oficial já existia e não mudou; dois
    // valores inválidos que viram null não são equivalentes (é mudança de conteúdo).
    if (antes !== null && JSON.stringify(antes) === JSON.stringify(depois)) {
      throw new Error(
        `Exceção manual da Linha ${excecao.linha} é apenas diferença de formato; use uma regra de padronização.`,
      );
    }
    resultado[excecao.campo] = excecao.valor;
  }
  return resultado;
}
