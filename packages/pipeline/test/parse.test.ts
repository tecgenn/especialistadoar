import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseLinhas } from "../src/parse.ts";

const fixture = readFileSync(
  fileURLToPath(new URL("./fixtures/amostra.csv", import.meta.url)),
);
const exportVersionada = readFileSync(
  fileURLToPath(
    new URL("../../../data/raw/inmetro-export-2026-10-12.csv", import.meta.url),
  ),
);

describe("parseLinhas — cabeçalho", () => {
  it("remove o BOM da primeira coluna", () => {
    const { cabecalho } = parseLinhas(fixture);
    expect(cabecalho[0]).toBe("Marca");
  });

  it("apara o espaço à direita no nome de coluna", () => {
    const { cabecalho } = parseLinhas(fixture);
    expect(cabecalho).toContain("Capacidade a 29 ºC e Carga Total (W)");
    expect(cabecalho).not.toContain("Capacidade a 29 ºC e Carga Total (W) ");
  });

  it("decodifica o campo entre aspas que contém vírgula", () => {
    const { cabecalho } = parseLinhas(fixture);
    expect(cabecalho).toContain("Se outro fluido refrigerante, especificar");
  });
});

describe("parseLinhas — Linhas da tabela", () => {
  it("preserva cada Linha, inclusive as sem Dados declarados", () => {
    const { linhas } = parseLinhas(fixture);
    expect(linhas).toHaveLength(3);
    expect(linhas[1]?.["Capacidade de Refrigeração Nominal (Btu/h)"]).toBe("");
    expect(linhas[1]?.["Status do Registro"]).toBe("Inativo");
  });

  it("mantém o valor como publicado, sem aparar", () => {
    const { linhas } = parseLinhas(fixture);
    expect(linhas[2]?.["Se outro fluido refrigerante, especificar"]).toBe(
      " R-32, mistura ",
    );
  });

  it("mapeia os valores pelos nomes de coluna aparados", () => {
    const { linhas } = parseLinhas(fixture);
    expect(linhas[0]).toEqual({
      Marca: "Samsung",
      Modelo: "AR09MV",
      "Se outro fluido refrigerante, especificar": "",
      "Capacidade de Refrigeração Nominal (Btu/h)": "9000",
      "Capacidade a 29 ºC e Carga Total (W)": "2637",
      "Status do Registro": "Ativo",
    });
  });

  it("bate com o snapshot golden da amostra", () => {
    expect(parseLinhas(fixture)).toMatchSnapshot();
  });
});

describe("parseLinhas — exportação versionada real", () => {
  it("lê as 29 colunas e as 7474 Linhas da tabela", () => {
    const { cabecalho, linhas } = parseLinhas(exportVersionada);
    expect(cabecalho).toHaveLength(29);
    expect(linhas).toHaveLength(7474);
  });

  it("preserva as Linhas sem Dados declarados", () => {
    const { linhas } = parseLinhas(exportVersionada);
    const semDados = linhas.filter(
      (l) =>
        (l["Capacidade de Refrigeração Nominal (Btu/h)"] ?? "").trim() === "",
    );
    expect(semDados).toHaveLength(4593);
  });

  it("não deixa o BOM vazar para nenhum nome de coluna", () => {
    const { cabecalho } = parseLinhas(exportVersionada);
    for (const nome of cabecalho) {
      expect(nome).not.toContain("\uFEFF");
    }
    expect(cabecalho.every((c) => c === c.trim())).toBe(true);
  });
});
