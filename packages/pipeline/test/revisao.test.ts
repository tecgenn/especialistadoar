import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { diretorioRelatorios, runBuild } from "../src/build.ts";
import { classificarRevisao, comoVinculoSugerido } from "../src/diff.ts";
import { chaveIdentidade } from "../src/group.ts";
import { escreverJsonl } from "../src/jsonl.ts";

const v1Path = fileURLToPath(
  new URL("./fixtures/versoes/v1.csv", import.meta.url),
);
const v2Path = fileURLToPath(
  new URL("./fixtures/versoes/v2.csv", import.meta.url),
);

let dataDir: string;

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), "especialista-revisao-"));
});

afterEach(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

function build(source: string, obtidoEm: string): ReturnType<typeof runBuild> {
  return runBuild({
    dataDir,
    source,
    origem: "teste",
    obtidoEm,
    reportsDir: join(dataDir, "reports"),
  });
}

describe("runBuild — Relatório de revisão entre duas Versões da tabela", () => {
  it("classifica novos, alterados, Ausentes, sem Dados declarados, Anomalias novas e Vínculos sugeridos", () => {
    build(v1Path, "2026-10-12");
    const { revisao } = build(v2Path, "2026-10-13");

    expect(revisao.novos.map((aparelho) => aparelho.modelo)).toEqual([
      "DD-09X",
      "EE-09",
    ]);
    expect(revisao.alterados).toHaveLength(1);
    expect(revisao.alterados[0]?.anterior.modelo).toBe("AB-09");
    expect(revisao.alterados[0]?.campos).toEqual(["variantes"]);
    expect(revisao.ausentes.map((aparelho) => aparelho.modelo)).toEqual([
      "BB-09",
      "DD-09",
    ]);
    expect(
      revisao.semDadosDeclarados.map((aparelho) => aparelho.modelo),
    ).toEqual(["CC-09"]);
    expect(revisao.anomaliasNovas).toHaveLength(1);
    expect(revisao.anomaliasNovas[0]).toMatchObject({
      campo: "IDRS (Wh/Wh)",
      valor: "abc",
    });
    expect(revisao.vinculosSugeridos).toHaveLength(1);
    expect(revisao.vinculosSugeridos[0]?.novo.modelo).toBe("DD-09X");
    expect(revisao.vinculosSugeridos[0]?.anterior.modelo).toBe("DD-09");
  });

  it("nomeia o relatório pela data da Versão da tabela e grava o golden", () => {
    build(v1Path, "2026-10-12");
    const { relatorio } = build(v2Path, "2026-10-13");

    expect(relatorio).toBe(join(dataDir, "reports/revisao-2026-10-13.md"));
    expect(readFileSync(relatorio, "utf8")).toMatchSnapshot();
  });

  it("não presume a causa de uma Ausência e registra que o Aparelho já teve dados", () => {
    build(v1Path, "2026-10-12");
    const { relatorio } = build(v2Path, "2026-10-13");
    const conteudo = readFileSync(relatorio, "utf8");

    expect(conteudo).toContain("A causa da ausência não é presumida");
    expect(conteudo).toContain("tinham Dados declarados na Versão anterior");
  });

  it("gera um relatório coerente para a primeira Versão da tabela", () => {
    const { relatorio } = build(v1Path, "2026-10-12");
    const conteudo = readFileSync(relatorio, "utf8");

    expect(relatorio).toBe(join(dataDir, "reports/revisao-2026-10-12.md"));
    expect(conteudo).toContain("Primeira Versão da tabela");
    expect(conteudo).toMatchSnapshot();
  });
});

describe("runBuild — Vínculo confirmado atravessa o diff entre Versões", () => {
  it("mantém o Aparelho como alterado, não como novo + Ausente", () => {
    build(v1Path, "2026-10-12");
    escreverJsonl(join(dataDir, "vinculos-confirmados.jsonl"), [
      {
        anterior: chaveIdentidade("DELTA", null, null, "DD-09"),
        novo: chaveIdentidade("DELTA", null, null, "DD-09X"),
        confirmadoPor: "revisora@exemplo",
      },
    ]);
    const { revisao } = build(v2Path, "2026-10-13");

    expect(revisao.novos.map((aparelho) => aparelho.modelo)).toEqual(["EE-09"]);
    expect(revisao.ausentes.map((aparelho) => aparelho.modelo)).toEqual([
      "BB-09",
    ]);
    expect(revisao.vinculosSugeridos).toHaveLength(0);
    expect(
      revisao.alterados.find((alterado) => alterado.anterior.modelo === "DD-09")
        ?.campos,
    ).toEqual(["modelo"]);
  });
});

describe("diretorioRelatorios — caminho do Relatório de revisão", () => {
  it("usa reports/ ao lado de data/ por padrão", () => {
    expect(diretorioRelatorios(join(tmpdir(), "especialista", "data"))).toBe(
      join(tmpdir(), "especialista", "reports"),
    );
  });
});

describe("comoVinculoSugerido — do Vínculo sugerido à confirmação", () => {
  it("o par sugerido, uma vez confirmado, funde os Aparelhos no diff", () => {
    build(v1Path, "2026-10-12");
    const { revisao } = build(v2Path, "2026-10-13");
    const sugestao = revisao.vinculosSugeridos[0];
    if (sugestao === undefined) {
      throw new Error("esperava um Vínculo sugerido");
    }

    escreverJsonl(join(dataDir, "vinculos-confirmados.jsonl"), [
      { ...comoVinculoSugerido(sugestao), confirmadoPor: "revisora@exemplo" },
    ]);
    const { revisao: revisaoConfirmada } = build(v2Path, "2026-10-14");

    expect(revisaoConfirmada.novos.map((aparelho) => aparelho.modelo)).toEqual([
      "EE-09",
    ]);
    expect(
      revisaoConfirmada.ausentes.map((aparelho) => aparelho.modelo),
    ).toEqual(["BB-09"]);
    expect(revisaoConfirmada.vinculosSugeridos).toHaveLength(0);
  });
});

describe("classificarRevisao — primeira Versão da tabela", () => {
  it("não classifica nada quando não há Versão anterior", () => {
    expect(classificarRevisao({ atuais: [], anteriores: null })).toEqual({
      novos: [],
      alterados: [],
      ausentes: [],
      semDadosDeclarados: [],
      anomaliasNovas: [],
      vinculosSugeridos: [],
    });
  });
});
