import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { type Anomalia, detectarAnomalias } from "./anomalias.ts";
import {
  escreverManifest,
  lerManifest,
  type Manifest,
  PADRAO_NOME_RAW,
  registrarVersao,
  type VersaoDaTabela,
} from "./ingest.ts";
import { normalizarValores, type ValoresOficiais } from "./normalize.ts";
import { parseLinhas, type ValoresDaLinha } from "./parse.ts";

export interface LinhaDaTabela {
  linha: number;
  versao: string;
  valores: ValoresDaLinha;
  oficial: ValoresOficiais;
}

export interface BuildOptions {
  dataDir: string;
  source?: string;
  origem?: string;
  obtidoEm?: string;
}

export interface BuildResult {
  versao: VersaoDaTabela;
  manifest: Manifest;
  registros: LinhaDaTabela[];
  anomalias: Anomalia[];
}

function escreverJsonl(caminho: string, registros: unknown[]): void {
  const jsonl = registros
    .map((registro) => JSON.stringify(registro))
    .join("\n");
  writeFileSync(caminho, `${jsonl}\n`);
}

export const ORIGEM_PADRAO = "INMETRO — exportação de produtos";

export function dataDeHoje(): string {
  return new Date().toISOString().slice(0, 10);
}

function descobrirSnapshotRaw(dataDir: string): {
  source: string;
  obtidoEm: string;
} {
  const rawDir = join(dataDir, "raw");
  const arquivos = existsSync(rawDir) ? readdirSync(rawDir) : [];
  const datados = arquivos
    .map((nome) => ({ nome, match: PADRAO_NOME_RAW.exec(nome) }))
    .filter(({ match }) => match !== null);

  if (datados.length !== 1) {
    throw new Error(
      `Esperava exatamente um snapshot raw datado em ${rawDir}; encontrei ${datados.length}.`,
    );
  }

  const [primeiro] = datados;
  return {
    source: join(rawDir, primeiro?.nome as string),
    obtidoEm: primeiro?.match?.[1] as string,
  };
}

export function runBuild(options: BuildOptions): BuildResult {
  const { dataDir } = options;

  let manifest = lerManifest(dataDir);
  let versao: VersaoDaTabela;
  if (options.source !== undefined) {
    const registro = registrarVersao(dataDir, {
      source: options.source,
      origem: options.origem ?? ORIGEM_PADRAO,
      obtidoEm: options.obtidoEm ?? dataDeHoje(),
    });
    manifest = registro.manifest;
    versao = registro.versao;
  } else {
    const atual = manifest.versoes.find((v) => v.hash === manifest.versaoAtual);
    if (atual !== undefined) {
      versao = atual;
    } else {
      const snapshot = descobrirSnapshotRaw(dataDir);
      const registro = registrarVersao(dataDir, {
        source: snapshot.source,
        origem: options.origem ?? ORIGEM_PADRAO,
        obtidoEm: snapshot.obtidoEm,
      });
      manifest = registro.manifest;
      versao = registro.versao;
    }
  }

  const { linhas } = parseLinhas(readFileSync(join(dataDir, versao.arquivo)));
  versao.contagemLinhas = linhas.length;

  const registros: LinhaDaTabela[] = [];
  const anomalias: Anomalia[] = [];
  linhas.forEach((linhaCrua, indice) => {
    const linha = indice + 1;
    const { valores, oficial } = normalizarValores(linhaCrua);
    registros.push({ linha, versao: versao.hash, valores, oficial });
    anomalias.push(
      ...detectarAnomalias(valores, { linha, versao: versao.hash }),
    );
  });

  const buildDir = join(dataDir, "build");
  mkdirSync(buildDir, { recursive: true });
  escreverJsonl(join(buildDir, "registros.jsonl"), registros);
  escreverJsonl(join(buildDir, "anomalias.jsonl"), anomalias);

  escreverManifest(dataDir, manifest);

  return { versao, manifest, registros, anomalias };
}
