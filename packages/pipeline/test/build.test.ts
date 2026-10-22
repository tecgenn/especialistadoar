import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runBuild } from "../src/build.ts";
import { type Manifest, sha256Hex } from "../src/ingest.ts";
import { escreverJsonl } from "../src/jsonl.ts";

const fixturePath = fileURLToPath(
  new URL("./fixtures/amostra.csv", import.meta.url),
);
const fixtureBytes = readFileSync(fixturePath);
const anomaliasFixturePath = fileURLToPath(
  new URL("./fixtures/amostra-anomalias.csv", import.meta.url),
);
const exportVersadaPath = fileURLToPath(
  new URL("../../../data/raw/inmetro-export-2026-10-12.csv", import.meta.url),
);
const excecoesReaisPath = fileURLToPath(
  new URL("../../../data/excecoes-manuais.jsonl", import.meta.url),
);
const implausivelFixturePath = fileURLToPath(
  new URL("./fixtures/amostra-implausivel.csv", import.meta.url),
);

let dataDir: string;

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), "especialista-"));
});

afterEach(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

function buildCom(source: string): ReturnType<typeof runBuild> {
  return runBuild({
    dataDir,
    source,
    origem: "teste",
    obtidoEm: "2026-10-12",
    reportsDir: join(dataDir, "reports"),
  });
}

function build(): ReturnType<typeof runBuild> {
  return buildCom(fixturePath);
}

function buildExportacaoRealComCuradoria(): ReturnType<typeof runBuild> {
  copyFileSync(excecoesReaisPath, join(dataDir, "excecoes-manuais.jsonl"));
  return runBuild({
    dataDir,
    source: exportVersadaPath,
    origem: "teste",
    obtidoEm: "2026-10-12",
    reportsDir: join(dataDir, "reports"),
  });
}

function lerRegistros(): Array<{
  linha: number;
  versao: string;
  valores: Record<string, string>;
  oficial: Record<string, unknown>;
}> {
  return readFileSync(join(dataDir, "build/registros.jsonl"), "utf8")
    .trimEnd()
    .split("\n")
    .map((linha) => JSON.parse(linha));
}

function lerManifest(): Manifest {
  return JSON.parse(
    readFileSync(join(dataDir, "build/manifest.json"), "utf8"),
  ) as Manifest;
}

describe("runBuild — ingestão e manifesto", () => {
  it("grava o manifesto com hash, origem, data e contagem de Linhas", () => {
    const { versao } = build();
    expect(versao.hash).toBe(sha256Hex(fixtureBytes));
    expect(versao.origem).toBe("teste");
    expect(versao.obtidoEm).toBe("2026-10-12");
    expect(versao.contagemLinhas).toBe(3);
    expect(lerManifest().versoes).toHaveLength(1);
    expect(lerManifest().versaoAtual).toBe(versao.hash);
  });

  it("copia o snapshot raw imutável com nome datado", () => {
    build();
    expect(existsSync(join(dataDir, "raw/inmetro-export-2026-10-12.csv"))).toBe(
      true,
    );
    expect(
      readFileSync(join(dataDir, "raw/inmetro-export-2026-10-12.csv")),
    ).toEqual(fixtureBytes);
  });

  it("é idempotente por conteúdo: rodar duas vezes não duplica", () => {
    build();
    const antes = readFileSync(join(dataDir, "build/manifest.json"), "utf8");
    const segundo = build();
    const depois = readFileSync(join(dataDir, "build/manifest.json"), "utf8");
    expect(segundo.manifest.versoes).toHaveLength(1);
    expect(depois).toBe(antes);
  });
});

describe("runBuild — registros.jsonl", () => {
  it("preserva cada Linha com proveniência da Versão da tabela", () => {
    const { versao } = build();
    const linhas = readFileSync(join(dataDir, "build/registros.jsonl"), "utf8")
      .trimEnd()
      .split("\n")
      .map((linha) => JSON.parse(linha));
    expect(linhas).toHaveLength(3);
    expect(linhas[0]).toMatchObject({ linha: 1, versao: versao.hash });
    expect(linhas[0].valores.Marca).toBe("Samsung");
    expect(
      linhas[1].valores["Capacidade de Refrigeração Nominal (Btu/h)"],
    ).toBe("");
  });

  it("bate com os snapshots golden de registros.jsonl e manifest.json", () => {
    build();
    expect(
      readFileSync(join(dataDir, "build/registros.jsonl"), "utf8"),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(dataDir, "build/manifest.json"), "utf8"),
    ).toMatchSnapshot();
  });
});

describe("runBuild — descoberta do snapshot raw versionado", () => {
  it("constrói a partir do snapshot em data/raw quando não há --source", () => {
    mkdirSync(join(dataDir, "raw"), { recursive: true });
    copyFileSync(
      fixturePath,
      join(dataDir, "raw/inmetro-export-2026-10-12.csv"),
    );
    const { versao } = runBuild({
      dataDir,
      reportsDir: join(dataDir, "reports"),
    });
    expect(versao.hash).toBe(sha256Hex(fixtureBytes));
    expect(versao.obtidoEm).toBe("2026-10-12");
    expect(versao.contagemLinhas).toBe(3);
    expect(versao.origem).toContain("INMETRO");
  });

  it("reconstrói a partir da Versão da tabela atual do manifesto", () => {
    build();
    const { versao } = runBuild({
      dataDir,
      reportsDir: join(dataDir, "reports"),
    });
    expect(versao.hash).toBe(sha256Hex(fixtureBytes));
    expect(versao.contagemLinhas).toBe(3);
  });
});

describe("runBuild — exportação versionada real", () => {
  it("constrói as 7474 Linhas da tabela com o hash do CSV versionado", () => {
    const bytes = readFileSync(exportVersadaPath);
    const { versao } = runBuild({
      dataDir,
      source: exportVersadaPath,
      origem: "teste",
      obtidoEm: "2026-10-12",
      reportsDir: join(dataDir, "reports"),
    });
    expect(versao.hash).toBe(sha256Hex(bytes));
    expect(versao.contagemLinhas).toBe(7474);

    const linhas = readFileSync(join(dataDir, "build/registros.jsonl"), "utf8")
      .trimEnd()
      .split("\n")
      .map((linha) => JSON.parse(linha));
    expect(linhas).toHaveLength(7474);
    expect(linhas[0].valores.Marca).toBe("Samsung");
    expect(linhas[7473]).toBeDefined();
  });
});

describe("runBuild — normalização de formato", () => {
  it("preserva o Valor original e grava o Valor oficial por Linha", () => {
    build();
    const linhas = lerRegistros();
    expect(
      linhas[0]?.valores["Capacidade de Refrigeração Nominal (Btu/h)"],
    ).toBe("9000");
    expect(
      linhas[0]?.oficial["Capacidade de Refrigeração Nominal (Btu/h)"],
    ).toBe(9000);
    expect(
      linhas[2]?.oficial["Se outro fluido refrigerante, especificar"],
    ).toBe("R-32, mistura");
    expect(linhas[1]?.oficial.Marca).toBe("LG");
  });

  it("devolve null para campo numérico sem dado", () => {
    build();
    const linhas = lerRegistros();
    expect(
      linhas[1]?.oficial["Capacidade de Refrigeração Nominal (Btu/h)"],
    ).toBeNull();
  });

  it("parseia a Tensão bivolt como uma só, com duas voltagens", () => {
    buildCom(anomaliasFixturePath);
    const linhas = lerRegistros();
    expect(linhas[0]?.valores["Tensão (V)"]).toBe(
      "127-220 (monofásico/bifásico)",
    );
    expect(linhas[0]?.oficial["Tensão (V)"]).toEqual({
      voltagens: [127, 220],
      fases: ["monofásico", "bifásico"],
    });
  });
});

describe("runBuild — Anomalias", () => {
  it("sinaliza Anomalias sem abortar o build", () => {
    const { anomalias } = buildCom(anomaliasFixturePath);
    expect(anomalias).toHaveLength(2);
    expect(anomalias.map((anomalia) => anomalia.tipo)).toEqual([
      "valor_multiplo",
      "texto_em_campo_numerico",
    ]);
    expect(anomalias[0]).toMatchObject({
      campo: "Carga do Fluido Refrigerante (g)",
      valor: "640g / 600g / 690g",
    });
    expect(anomalias[1]).toMatchObject({
      campo: "IDRS (Wh/Wh)",
      valor: "abc",
    });
  });

  it("não sinaliza unidade no texto nem campo vazio", () => {
    const { anomalias } = buildCom(anomaliasFixturePath);
    expect(anomalias.some((anomalia) => anomalia.valor === "290G")).toBe(false);
  });
});

describe("runBuild — Anomalias na exportação versionada real", () => {
  it("encontra as 15 Anomalias sem abortar o build", () => {
    const { registros, anomalias } = buildExportacaoRealComCuradoria();
    expect(registros).toHaveLength(7474);
    expect(anomalias).toHaveLength(15);
    expect(
      anomalias.every((anomalia) => anomalia.tipo === "valor_multiplo"),
    ).toBe(true);
    expect(
      anomalias.some((anomalia) => anomalia.valor === "640g / 600g / 690g"),
    ).toBe(true);
  });

  it("expõe as capacidades truncadas como valor_implausivel sem curadoria", () => {
    const { anomalias } = buildCom(exportVersadaPath);
    const implausiveis = anomalias.filter(
      (anomalia) => anomalia.tipo === "valor_implausivel",
    );
    expect(implausiveis.map((anomalia) => anomalia.linha)).toEqual([
      5278, 7133, 7200, 7428,
    ]);
  });

  // O golden é do build com a curadoria publicada: as Exceções corrigem as
  // capacidades truncadas e as 15 Anomalias são as mesmas da base servida.
  it("bate com o snapshot golden de anomalias.jsonl", () => {
    buildExportacaoRealComCuradoria();
    expect(
      readFileSync(join(dataDir, "build/anomalias.jsonl"), "utf8"),
    ).toMatchSnapshot();
  });
});

describe("runBuild — Anomalia de valor implausível", () => {
  it("sinaliza a capacidade truncada sem corrigir o Valor oficial", () => {
    const { anomalias, registros } = buildCom(implausivelFixturePath);
    expect(anomalias).toEqual([
      {
        linha: 1,
        versao: sha256Hex(readFileSync(implausivelFixturePath)),
        campo: "Capacidade de Refrigeração Nominal (Btu/h)",
        valor: "30",
        tipo: "valor_implausivel",
      },
    ]);
    expect(
      registros[0]?.oficial["Capacidade de Refrigeração Nominal (Btu/h)"],
    ).toBe(30);
  });

  it("deixa de sinalizar quando a capacidade é corrigida por Exceção manual", () => {
    escreverJsonl(join(dataDir, "excecoes-manuais.jsonl"), [
      {
        versao: sha256Hex(readFileSync(implausivelFixturePath)),
        linha: 1,
        campo: "Capacidade de Refrigeração Nominal (Btu/h)",
        valor: "30000",
        motivo: "valor truncado na exportação",
        fonte: "Capacidade de Refrigeração Nominal (W) = 8790 W na mesma Linha",
      },
    ]);

    const { anomalias } = buildCom(implausivelFixturePath);
    expect(anomalias).toEqual([]);
  });
});
