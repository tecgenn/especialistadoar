import { describe, expect, it, vi } from "vitest";
import type { Oferta } from "../src/lib/ofertas.ts";
import {
  type BuscadorLink,
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
