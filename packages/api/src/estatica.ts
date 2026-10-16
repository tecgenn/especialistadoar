import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  type Aparelho,
  type Manifest,
  type VersaoDaTabela,
  versaoAtualDo,
} from "@especialista-do-ar/pipeline";

/**
 * A API estática: a base servida consumida como arquivos JSON puros, sem
 * Worker nem cota (ADR-0003). Os artefatos são servidos tais quais pelo
 * publish; este módulo é o acesso do lado do consumidor — consulta por ID,
 * listas e a Versão da tabela.
 */
export interface ApiEstatica {
  /** Consulta por ID: resolve um Aparelho da base servida, ou `undefined`. */
  porId(id: string): Aparelho | undefined;
  /** Os Aparelhos da base servida. */
  listar(): Aparelho[];
  /** A Versão da tabela que originou os artefatos lidos. */
  versaoDaTabela(): VersaoDaTabela;
}

function lerJson<T>(buildDir: string, arquivo: string): T {
  const caminho = join(buildDir, arquivo);
  if (!existsSync(caminho)) {
    throw new Error(
      `Artefato da API estática ausente: ${caminho} — rode \`pnpm build\` antes de consultar a base.`,
    );
  }
  return JSON.parse(readFileSync(caminho, "utf8")) as T;
}

/** Abre a base servida publicada em `buildDir` (o `data/build/` do repo). */
export function abrirApiEstatica(buildDir: string): ApiEstatica {
  const manifest = lerJson<Manifest>(buildDir, "manifest.json");
  const versao = versaoAtualDo(manifest);
  if (versao === undefined) {
    throw new Error(
      `Manifesto sem Versão da tabela atual em ${join(buildDir, "manifest.json")}.`,
    );
  }

  const aparelhos = lerJson<Aparelho[]>(buildDir, "aparelhos.json");
  const indice = new Map(aparelhos.map((aparelho) => [aparelho.id, aparelho]));

  return {
    porId: (id) => indice.get(id),
    listar: () => [...aparelhos],
    versaoDaTabela: () => versao,
  };
}
