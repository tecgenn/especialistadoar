import { describe, expect, it, vi } from "vitest";
import type { Oferta } from "../src/lib/ofertas.ts";
import {
  type BuscadorLink,
  renderizarRelatorioLinks,
  verificarOfertas,
} from "../src/lib/verificacao-links.ts";

function oferta(url: string, aparelhoId = "ap-a"): Oferta {
  return { aparelhoId, loja: "Loja", titulo: "Comprar", url };
}

describe("verificarOfertas", () => {
  it("reporta Oferta com status de erro, na ordem do arquivo", async () => {
    const buscar = vi.fn<BuscadorLink>(async (url) =>
      url.endsWith("quebrada")
        ? { ok: false, status: 404 }
        : { ok: true, status: 200 },
    );
    const ofertas = [
      oferta("https://x/ok"),
      oferta("https://x/quebrada"),
      oferta("https://x/ok2"),
    ];

    const { total, quebradas } = await verificarOfertas(ofertas, buscar);

    expect(total).toBe(3);
    expect(quebradas).toEqual([{ oferta: ofertas[1], motivo: "HTTP 404" }]);
  });

  it("trata falha de rede como link quebrado", async () => {
    const buscar: BuscadorLink = async () => {
      throw new Error("timeout");
    };

    const { quebradas } = await verificarOfertas([oferta("https://x")], buscar);

    expect(quebradas).toEqual([
      { oferta: oferta("https://x"), motivo: "timeout" },
    ]);
  });

  it("não marca nada quando todas respondem ok", async () => {
    const buscar: BuscadorLink = async () => ({ ok: true, status: 200 });

    const { total, quebradas } = await verificarOfertas(
      [oferta("https://a"), oferta("https://b")],
      buscar,
    );

    expect(total).toBe(2);
    expect(quebradas).toEqual([]);
  });

  it("com lista vazia não faz nenhuma busca", async () => {
    const buscar = vi.fn<BuscadorLink>(async () => ({ ok: true, status: 200 }));

    const { total, quebradas } = await verificarOfertas([], buscar);

    expect(total).toBe(0);
    expect(quebradas).toEqual([]);
    expect(buscar).not.toHaveBeenCalled();
  });
});

describe("renderizarRelatorioLinks", () => {
  it("registra de forma limpa quando não há quebrados", () => {
    const texto = renderizarRelatorioLinks({ total: 2, quebradas: [] });

    expect(texto).toContain("2 Oferta(s) verificada(s), nenhum link quebrado.");
    expect(texto).not.toContain("| Loja |");
  });

  it("lista URL, loja e motivo dos quebrados", () => {
    const quebrada = oferta("https://x/quebrada");

    const texto = renderizarRelatorioLinks({
      total: 3,
      quebradas: [{ oferta: quebrada, motivo: "HTTP 404" }],
    });

    expect(texto).toContain(
      "3 Oferta(s) verificada(s), 1 link(s) quebrado(s).",
    );
    expect(texto).toContain("| Loja | https://x/quebrada | HTTP 404 |");
  });

  it("escapa pipes e quebras de linha nas células", () => {
    const texto = renderizarRelatorioLinks({
      total: 1,
      quebradas: [
        {
          oferta: { ...oferta("https://x/a|b"), loja: "Loja | Oficial" },
          motivo: "falha\nde rede",
        },
      ],
    });

    expect(texto).toContain(
      "| Loja \\| Oficial | https://x/a\\|b | falha de rede |",
    );
  });

  it("preserva a ordem dos quebrados", () => {
    const texto = renderizarRelatorioLinks({
      total: 2,
      quebradas: [
        { oferta: oferta("https://x/primeira"), motivo: "HTTP 404" },
        { oferta: oferta("https://x/segunda"), motivo: "HTTP 500" },
      ],
    });

    expect(texto.indexOf("https://x/primeira")).toBeLessThan(
      texto.indexOf("https://x/segunda"),
    );
  });
});
