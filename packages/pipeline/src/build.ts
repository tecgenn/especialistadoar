import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { type Anomalia, detectarAnomalias } from "./anomalias.ts";
import { type Aparelho, SCHEMA_APARELHO } from "./aparelho.ts";
import { type ItemConsulta, projetarConsulta } from "./consulta.ts";
import { type ClassificacaoRevisao, classificarRevisao } from "./diff.ts";
import {
  ARQUIVO_EXCECOES,
  aplicarExcecoes,
  type ExcecaoManual,
  lerExcecoes,
  validarExcecoes,
} from "./excecoes.ts";
import {
  agruparAparelhos,
  aparelhoTemDadosDeclarados,
  chaveDaLinha,
  type LinhaDaTabela,
} from "./group.ts";
import {
  escreverManifest,
  lerManifest,
  type Manifest,
  PADRAO_NOME_RAW,
  registrarVersao,
  type VersaoDaTabela,
  versaoAtualDo,
} from "./ingest.ts";
import { escreverJsonl } from "./jsonl.ts";
import {
  ARQUIVO_MARCAS_CATALOGO,
  lerMarcasCatalogo,
  type MarcaCatalogo,
  montarMarcaCatalogo,
  validarMarcasCatalogo,
} from "./marcas-catalogo.ts";
import { normalizarValores } from "./normalize.ts";
import { parseLinhas } from "./parse.ts";
import { renderizarRelatorio } from "./report.ts";
import { validarBaseServida } from "./validate.ts";
import {
  ARQUIVO_VINCULOS,
  lerVinculosConfirmados,
  montarIdentidadeCanonica,
  type VinculoConfirmado,
  validarVinculosAplicaveis,
  validarVinculosConfirmados,
} from "./vinculos.ts";

export interface BuildOptions {
  dataDir: string;
  source?: string;
  origem?: string;
  obtidoEm?: string;
  reportsDir?: string;
}

export interface BuildResult {
  versao: VersaoDaTabela;
  manifest: Manifest;
  registros: LinhaDaTabela[];
  anomalias: Anomalia[];
  aparelhos: Aparelho[];
  consulta: ItemConsulta[];
  excecoes: ExcecaoManual[];
  vinculos: VinculoConfirmado[];
  marcasCatalogo: MarcaCatalogo[];
  revisao: ClassificacaoRevisao;
  relatorio: string;
}

function escreverJson(caminho: string, valor: unknown, indentar = true): void {
  const espaco = indentar ? 2 : undefined;
  writeFileSync(caminho, `${JSON.stringify(valor, null, espaco)}\n`);
}

export const ORIGEM_PADRAO = "INMETRO — exportação de produtos";

export function dataDeHoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export function diretorioRelatorios(dataDir: string): string {
  return resolve(dataDir, "..", "reports");
}

interface Processamento {
  registros: LinhaDaTabela[];
  anomalias: Anomalia[];
  excecoesAplicadas: Set<ExcecaoManual>;
}

/**
 * Parseia uma Versão da tabela aplicando as Exceções manuais daquela Versão e
 * produz as Linhas normalizadas e as Anomalias. Reutilizado tanto para a Versão
 * atual quanto para a anterior (que é reconstruída a partir do snapshot raw para
 * o diff).
 */
function processarLinhas(
  dataDir: string,
  versao: VersaoDaTabela,
  excecoesDaVersao: ExcecaoManual[],
): Processamento {
  const { linhas } = parseLinhas(readFileSync(join(dataDir, versao.arquivo)));
  const registros: LinhaDaTabela[] = [];
  const anomalias: Anomalia[] = [];
  const excecoesAplicadas = new Set<ExcecaoManual>();

  for (const { numero, valores: linhaCrua } of linhas) {
    const excecoesDaLinha = excecoesDaVersao.filter(
      (excecao) => excecao.linha === numero,
    );
    excecoesDaLinha.forEach((excecao) => {
      excecoesAplicadas.add(excecao);
    });
    const valoresCorrigidos = aplicarExcecoes(linhaCrua, excecoesDaLinha);
    const { valores, oficial } = normalizarValores(valoresCorrigidos);
    registros.push({ linha: numero, versao: versao.hash, valores, oficial });
    anomalias.push(
      ...detectarAnomalias(valores, { linha: numero, versao: versao.hash }),
    );
  }

  return { registros, anomalias, excecoesAplicadas };
}

/** A Versão da tabela imediatamente anterior à informada, na ordem de ingestão. */
function versaoPrecedente(
  manifest: Manifest,
  versao: VersaoDaTabela,
): VersaoDaTabela | undefined {
  const indice = manifest.versoes.findIndex(
    (item) => item.hash === versao.hash,
  );
  return indice > 0 ? manifest.versoes[indice - 1] : undefined;
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
    const atual = versaoAtualDo(manifest);
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

  const excecoes = lerExcecoes(dataDir);
  validarExcecoes(excecoes);
  const vinculos = lerVinculosConfirmados(dataDir);
  validarVinculosConfirmados(vinculos);
  const marcasCatalogo = lerMarcasCatalogo(dataDir);
  validarMarcasCatalogo(marcasCatalogo);

  const excecoesDaVersao = excecoes.filter(
    (excecao) => excecao.versao === versao.hash,
  );

  const { registros, anomalias, excecoesAplicadas } = processarLinhas(
    dataDir,
    versao,
    excecoesDaVersao,
  );
  versao.contagemLinhas = registros.length;

  for (const excecao of excecoesDaVersao) {
    if (!excecoesAplicadas.has(excecao)) {
      throw new Error(
        `Exceção manual não corresponde a nenhuma Linha da Versão ${versao.hash.slice(0, 12)}: Linha ${excecao.linha}, campo ${excecao.campo}.`,
      );
    }
  }

  validarVinculosAplicaveis(
    vinculos,
    new Set(registros.map((registro) => chaveDaLinha(registro.oficial))),
  );
  const identidadeCanonica = montarIdentidadeCanonica(vinculos);

  const todosAparelhos = agruparAparelhos(registros, { identidadeCanonica });
  const aparelhos = todosAparelhos.filter(aparelhoTemDadosDeclarados);
  validarBaseServida(aparelhos);

  const consulta = projetarConsulta(
    aparelhos,
    montarMarcaCatalogo(
      marcasCatalogo,
      todosAparelhos.map((aparelho) => aparelho.marca),
    ),
  );

  const anterior = versaoPrecedente(manifest, versao);
  let aparelhosAnteriores: Aparelho[] | null = null;
  let anomaliasAnteriores: Anomalia[] = [];
  if (anterior !== undefined) {
    const processamentoAnterior = processarLinhas(
      dataDir,
      anterior,
      excecoes.filter((excecao) => excecao.versao === anterior.hash),
    );
    aparelhosAnteriores = agruparAparelhos(processamentoAnterior.registros, {
      identidadeCanonica,
    });
    anomaliasAnteriores = processamentoAnterior.anomalias;
  }

  const revisao = classificarRevisao({
    atuais: todosAparelhos,
    anteriores: aparelhosAnteriores,
    anomaliasAtuais: anomalias,
    anomaliasAnteriores,
  });

  const reportsDir = options.reportsDir ?? diretorioRelatorios(dataDir);
  const relatorio = join(reportsDir, `revisao-${versao.obtidoEm}.md`);

  const buildDir = join(dataDir, "build");
  mkdirSync(buildDir, { recursive: true });
  escreverJsonl(join(buildDir, "registros.jsonl"), registros);
  escreverJsonl(join(buildDir, "anomalias.jsonl"), anomalias);
  escreverJsonl(join(buildDir, "aparelhos.jsonl"), aparelhos);
  escreverJson(join(buildDir, "aparelhos.json"), aparelhos);
  // O dataset de consulta é o único artefato sem indentação: ele existe para o
  // navegador baixar, e o formato enxuto o mantém perto dos ~680 KB (ADR-0008).
  escreverJson(join(buildDir, "consulta.json"), consulta, false);
  escreverJson(join(buildDir, "schema.json"), SCHEMA_APARELHO);
  escreverJsonl(join(buildDir, ARQUIVO_EXCECOES), excecoes);
  escreverJsonl(join(buildDir, ARQUIVO_VINCULOS), vinculos);
  escreverJsonl(join(buildDir, ARQUIVO_MARCAS_CATALOGO), marcasCatalogo);

  escreverManifest(dataDir, manifest);

  mkdirSync(reportsDir, { recursive: true });
  writeFileSync(
    relatorio,
    renderizarRelatorio({
      versao,
      versaoAnterior: anterior,
      totalLinhas: registros.length,
      totalAparelhos: aparelhos.length,
      classificacao: revisao,
    }),
  );

  return {
    versao,
    manifest,
    registros,
    anomalias,
    aparelhos,
    consulta,
    excecoes,
    vinculos,
    marcasCatalogo,
    revisao,
    relatorio,
  };
}
