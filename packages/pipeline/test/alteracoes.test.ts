import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Aparelho } from "../src/aparelho.ts";
import { runBuild } from "../src/build.ts";
import type { ExcecaoManual } from "../src/excecoes.ts";
import { chaveIdentidade, idDeChave } from "../src/group.ts";
import { sha256Hex } from "../src/ingest.ts";
import { escreverJsonl } from "../src/jsonl.ts";
import type { VinculoConfirmado } from "../src/vinculos.ts";

const fixturePath = fileURLToPath(
  new URL("./fixtures/amostra-alteracoes.csv", import.meta.url),
);
const fixtureBytes = readFileSync(fixturePath);
const versao = sha256Hex(fixtureBytes);

const identidadeAnterior = chaveIdentidade("GREE", null, null, "GREE-09");
const identidadeNova = chaveIdentidade("GREE", null, null, "GREE-09X");

let dataDir: string;

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), "especialista-alteracoes-"));
});

afterEach(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

function escrever(caminho: string, registros: unknown[]): void {
  escreverJsonl(join(dataDir, caminho), registros);
}

function excecaoDeIdrs(): ExcecaoManual {
  return {
    versao,
    linha: 2,
    campo: "IDRS (Wh/Wh)",
    valor: "3,50",
    motivo: "campo numérico veio com texto",
    fonte: "https://exemplo/errata",
  };
}

function vinculoGree(): VinculoConfirmado {
  return {
    anterior: identidadeAnterior,
    novo: identidadeNova,
    confirmadoPor: "revisora@exemplo",
  };
}

function build(): ReturnType<typeof runBuild> {
  return runBuild({
    dataDir,
    source: fixturePath,
    origem: "teste",
    obtidoEm: "2026-10-12",
  });
}

function lerAparelhosJsonl(): Aparelho[] {
  return readFileSync(join(dataDir, "build/aparelhos.jsonl"), "utf8")
    .trimEnd()
    .split("\n")
    .map((linha) => JSON.parse(linha) as Aparelho);
}

describe("runBuild — Exceção manual aplicada sobre a Linha da tabela", () => {
  it("corrige o Valor oficial e some com a Anomalia de conteúdo", () => {
    escrever("excecoes-manuais.jsonl", [excecaoDeIdrs()]);
    const { anomalias, registros } = build();

    expect(anomalias).toHaveLength(0);
    const corrigida = registros.find((registro) => registro.linha === 2);
    expect(corrigida?.valores["IDRS (Wh/Wh)"]).toBe("3,50");
    expect(corrigida?.oficial["IDRS (Wh/Wh)"]).toBe(3.5);
  });

  it("recusa Exceção que é apenas diferença de formato", () => {
    escrever("excecoes-manuais.jsonl", [
      { ...excecaoDeIdrs(), campo: "Marca", valor: "samsung" },
    ]);
    expect(() => build()).toThrow(/formato/);
  });

  it("recusa Exceção que não corresponde a nenhuma Linha da Versão", () => {
    escrever("excecoes-manuais.jsonl", [{ ...excecaoDeIdrs(), linha: 99 }]);
    expect(() => build()).toThrow(/nenhuma Linha/);
  });

  it("ignora Exceção de uma outra Versão da tabela", () => {
    escrever("excecoes-manuais.jsonl", [
      { ...excecaoDeIdrs(), versao: "outra" },
    ]);
    const { anomalias, registros } = build();

    expect(anomalias).toHaveLength(1);
    expect(anomalias[0]?.tipo).toBe("texto_em_campo_numerico");
    expect(
      registros.find((registro) => registro.linha === 2)?.oficial[
        "IDRS (Wh/Wh)"
      ],
    ).toBeNull();
  });
});

describe("runBuild — Vínculo confirmado passa a valer como identidade", () => {
  it("funde o Aparelho novo na identidade histórica, mantendo o texto atual", () => {
    escrever("vinculos-confirmados.jsonl", [vinculoGree()]);
    build();
    const aparelhos = lerAparelhosJsonl();

    const gree = aparelhos.filter((aparelho) => aparelho.marca === "GREE");
    expect(gree).toHaveLength(1);
    expect(gree[0]?.modelo).toBe("GREE-09X");
    expect(gree[0]?.id).toBe(idDeChave(identidadeAnterior));
    expect(
      aparelhos.some((aparelho) => aparelho.id === idDeChave(identidadeNova)),
    ).toBe(false);
  });

  it("recusa um Vínculo sugerido sem confirmação de uma pessoa", () => {
    escrever("vinculos-confirmados.jsonl", [
      { anterior: identidadeAnterior, novo: identidadeNova },
    ]);
    expect(() => build()).toThrow();
  });
});

describe("runBuild — artefatos publicados das alterações", () => {
  it("copia as Exceções e os Vínculos para a base publicada", () => {
    escrever("excecoes-manuais.jsonl", [excecaoDeIdrs()]);
    escrever("vinculos-confirmados.jsonl", [vinculoGree()]);
    const { excecoes, vinculos } = build();

    expect(excecoes).toEqual([excecaoDeIdrs()]);
    expect(vinculos).toEqual([vinculoGree()]);
    expect(
      readFileSync(join(dataDir, "build/excecoes-manuais.jsonl"), "utf8"),
    ).toBe(`${JSON.stringify(excecaoDeIdrs())}\n`);
    expect(
      readFileSync(join(dataDir, "build/vinculos-confirmados.jsonl"), "utf8"),
    ).toBe(`${JSON.stringify(vinculoGree())}\n`);
  });

  it("bate com os snapshots golden dos artefatos de alteração", () => {
    escrever("excecoes-manuais.jsonl", [excecaoDeIdrs()]);
    escrever("vinculos-confirmados.jsonl", [vinculoGree()]);
    build();

    expect(
      readFileSync(join(dataDir, "build/registros.jsonl"), "utf8"),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(dataDir, "build/aparelhos.jsonl"), "utf8"),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(dataDir, "build/excecoes-manuais.jsonl"), "utf8"),
    ).toMatchSnapshot();
    expect(
      readFileSync(join(dataDir, "build/vinculos-confirmados.jsonl"), "utf8"),
    ).toMatchSnapshot();
  });

  it("gera artefatos vazios quando não há alterações curadas", () => {
    build();
    expect(
      readFileSync(join(dataDir, "build/excecoes-manuais.jsonl"), "utf8"),
    ).toBe("\n");
    expect(
      readFileSync(join(dataDir, "build/vinculos-confirmados.jsonl"), "utf8"),
    ).toBe("\n");
  });
});
