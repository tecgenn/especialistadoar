import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Guarda arquitetural (ADR-0008): o site é puramente estático e **não chama o
 * Worker**; a consulta roda no cliente sobre `consulta.json`, pelo módulo
 * isomórfico. Isso não se observa na saída — por isso a guarda sobre o
 * texto-fonte.
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

describe("o site não chama o Worker", () => {
  it("nenhum arquivo-fonte referencia a rota dinâmica /api/v1", () => {
    const infratores = fontes
      .filter(({ texto }) => texto.includes("/api/v1"))
      .map(({ caminho }) => caminho);
    expect(infratores).toEqual([]);
  });

  it("importa o módulo de consulta pelo entry isomórfico, nunca o entry Node", () => {
    const raizNode = '"@especialista-do-ar/api"';
    const infratores = fontes
      .filter(({ texto }) => texto.includes(raizNode))
      .map(({ caminho }) => caminho);
    expect(infratores).toEqual([]);
  });
});
