import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Guarda arquitetural (ADR-0008): a ilha do site importa o módulo de consulta
 * pelo entry isomórfico, nunca pelo entry Node. É o que mantém `fs` fora do
 * bundle do site; o dataset é baixado como arquivo estático.
 */
const srcDir = fileURLToPath(new URL("../src", import.meta.url));

function arquivosFonte(dir: string): string[] {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    return statSync(caminho).isDirectory() ? arquivosFonte(caminho) : [caminho];
  });
}

const fontes = arquivosFonte(srcDir).map((caminho) => ({
  caminho,
  texto: readFileSync(caminho, "utf8"),
}));

describe("a ilha do site usa o entry isomórfico", () => {
  it("importa o módulo de consulta pelo entry isomórfico", () => {
    const entryIsomorfico = '"@especialista-do-ar/api/consulta"';
    expect(fontes.some(({ texto }) => texto.includes(entryIsomorfico))).toBe(
      true,
    );
  });

  it("não importa o entry Node do pacote de API", () => {
    const raizNode = '"@especialista-do-ar/api"';
    const infratores = fontes
      .filter(({ texto }) => texto.includes(raizNode))
      .map(({ caminho }) => caminho);
    expect(infratores).toEqual([]);
  });
});
