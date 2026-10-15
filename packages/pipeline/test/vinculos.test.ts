import { describe, expect, it } from "vitest";
import {
  confirmarVinculo,
  montarIdentidadeCanonica,
  type VinculoConfirmado,
  validarVinculosAplicaveis,
  validarVinculosConfirmados,
} from "../src/vinculos.ts";

function vinculo(
  overrides: Partial<VinculoConfirmado> = {},
): VinculoConfirmado {
  return {
    anterior: "M:GREE|GREE-09",
    novo: "M:GREE|GREE-09X",
    confirmadoPor: "revisora@exemplo",
    ...overrides,
  };
}

describe("confirmarVinculo — a única porta para aplicar um Vínculo sugerido", () => {
  it("guarda o par sugerido e quem confirmou", () => {
    expect(
      confirmarVinculo(
        { anterior: "M:GREE|GREE-09", novo: "M:GREE|GREE-09X" },
        "revisora@exemplo",
      ),
    ).toEqual(vinculo());
  });

  it("exige quem confirmou", () => {
    expect(() => confirmarVinculo({ anterior: "a", novo: "b" }, "   ")).toThrow(
      /confirmou/,
    );
  });
});

describe("validarVinculosConfirmados", () => {
  it("aceita um Vínculo confirmado", () => {
    expect(() => validarVinculosConfirmados([vinculo()])).not.toThrow();
  });

  it("recusa um Vínculo sugerido sem confirmação de uma pessoa", () => {
    const sugerido = {
      anterior: "M:GREE|GREE-09",
      novo: "M:GREE|GREE-09X",
    } as unknown as VinculoConfirmado;
    expect(() => validarVinculosConfirmados([sugerido])).toThrow();
  });

  it("recusa um par com a mesma identidade", () => {
    expect(() =>
      validarVinculosConfirmados([vinculo({ novo: "M:GREE|GREE-09" })]),
    ).toThrow(/distint/);
  });
});

describe("validarVinculosAplicaveis", () => {
  it("aceita quando o Aparelho novo existe nesta Versão da tabela", () => {
    expect(() =>
      validarVinculosAplicaveis(
        [vinculo()],
        new Set(["M:GREE|GREE-09X", "M:KENNEDY|K-09"]),
      ),
    ).not.toThrow();
  });

  it("recusa um Vínculo confirmado que aponta Aparelho inexistente", () => {
    expect(() =>
      validarVinculosAplicaveis([vinculo()], new Set(["M:OUTRO|X"])),
    ).toThrow(/inexistente/);
  });

  it("recusa um Vínculo quando a identidade histórica ainda está presente", () => {
    expect(() =>
      validarVinculosAplicaveis(
        [vinculo()],
        new Set(["M:GREE|GREE-09X", "M:GREE|GREE-09"]),
      ),
    ).toThrow(/Ausente/);
  });
});

describe("montarIdentidadeCanonica", () => {
  it("remapeia o Aparelho novo para a identidade histórica", () => {
    const canonica = montarIdentidadeCanonica([vinculo()]);
    expect(canonica("M:GREE|GREE-09X")).toBe("M:GREE|GREE-09");
    expect(canonica("M:KENNEDY|K-09")).toBe("M:KENNEDY|K-09");
  });

  it("resolve cadeias de Vínculos confirmados", () => {
    const canonica = montarIdentidadeCanonica([
      vinculo({ anterior: "M:GREE|GREE-09", novo: "M:GREE|GREE-09X" }),
      vinculo({ anterior: "M:GREE|GREE-09X", novo: "M:GREE|GREE-09Y" }),
    ]);
    expect(canonica("M:GREE|GREE-09Y")).toBe("M:GREE|GREE-09");
  });

  it("recusa um ciclo", () => {
    const canonica = montarIdentidadeCanonica([
      vinculo({ anterior: "a", novo: "b" }),
      vinculo({ anterior: "b", novo: "a" }),
    ]);
    expect(() => canonica("a")).toThrow(/Ciclo/);
  });
});
