import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export interface VersaoDaTabela {
  hash: string;
  arquivo: string;
  obtidoEm: string;
  origem: string;
  contagemLinhas: number | null;
}

export interface Manifest {
  versaoAtual: string | null;
  versoes: VersaoDaTabela[];
}

export interface RegistrarVersaoOptions {
  source: string;
  origem: string;
  obtidoEm: string;
}

export interface RegistroDeVersao {
  manifest: Manifest;
  versao: VersaoDaTabela;
}

const PREFIXO_RAW = "inmetro-export-";
export const PADRAO_NOME_RAW = /^inmetro-export-(\d{4}-\d{2}-\d{2})\.csv$/;

export function nomeArquivoRaw(obtidoEm: string): string {
  return `${PREFIXO_RAW}${obtidoEm}.csv`;
}

export function arquivoRaw(obtidoEm: string): string {
  return `raw/${nomeArquivoRaw(obtidoEm)}`;
}

export function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function caminhoManifest(dataDir: string): string {
  return join(dataDir, "build/manifest.json");
}

export function lerManifest(dataDir: string): Manifest {
  const caminho = caminhoManifest(dataDir);
  if (!existsSync(caminho)) {
    return { versaoAtual: null, versoes: [] };
  }
  return JSON.parse(readFileSync(caminho, "utf8")) as Manifest;
}

export function escreverManifest(dataDir: string, manifest: Manifest): void {
  mkdirSync(join(dataDir, "build"), { recursive: true });
  writeFileSync(
    caminhoManifest(dataDir),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

export function registrarVersao(
  dataDir: string,
  { source, origem, obtidoEm }: RegistrarVersaoOptions,
): RegistroDeVersao {
  const bytes = readFileSync(source);
  const hash = sha256Hex(bytes);
  const manifest = lerManifest(dataDir);

  const existente = manifest.versoes.find((versao) => versao.hash === hash);
  if (existente !== undefined) {
    return { manifest, versao: existente };
  }

  const arquivo = arquivoRaw(obtidoEm);
  const destino = join(dataDir, arquivo);

  if (existsSync(destino)) {
    if (sha256Hex(readFileSync(destino)) !== hash) {
      throw new Error(
        `Snapshot raw imutável já existe com conteúdo diferente: ${arquivo}`,
      );
    }
  } else if (resolve(source) !== resolve(destino)) {
    mkdirSync(join(dataDir, "raw"), { recursive: true });
    writeFileSync(destino, bytes);
  }

  const versao: VersaoDaTabela = {
    hash,
    arquivo,
    obtidoEm,
    origem,
    contagemLinhas: null,
  };
  manifest.versoes.push(versao);
  manifest.versaoAtual = hash;

  return { manifest, versao };
}
