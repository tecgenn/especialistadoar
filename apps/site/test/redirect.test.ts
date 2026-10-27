// @vitest-environment jsdom
/// <reference lib="dom" />
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  destinoDosFiltrosAntigos,
  redirecionarFiltrosAntigos,
} from "../src/lib/redirect.ts";

/**
 * O script curto da home (ticket 29) leva os links antigos com filtros
 * (`/?marca=…`) para `/aparelhos/` com a mesma querystring. Testamos a parte
 * pura com o `location` do jsdom: nenhum redirecionamento real acontece.
 */
describe("redirect dos filtros antigos da home", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("leva os filtros para /aparelhos/ preservando a ordem dos parâmetros", () => {
    window.history.replaceState(null, "", "/?marca=MIDEA&btu=12000&q=inverter");
    const redirecionar = vi.fn();

    const redirecionou = redirecionarFiltrosAntigos(
      window.location,
      redirecionar,
    );

    expect(redirecionou).toBe(true);
    expect(redirecionar).toHaveBeenCalledWith(
      "/aparelhos/?marca=MIDEA&btu=12000&q=inverter",
    );
  });

  it("preserva a Marca oficial antiga com espaço na querystring", () => {
    window.history.replaceState(null, "", "/?marca=SPRINGER%20MIDEA");
    const redirecionar = vi.fn();

    redirecionarFiltrosAntigos(window.location, redirecionar);

    expect(redirecionar).toHaveBeenCalledWith(
      "/aparelhos/?marca=SPRINGER%20MIDEA",
    );
  });

  it("não redireciona a home sem parâmetros", () => {
    const redirecionar = vi.fn();

    const redirecionou = redirecionarFiltrosAntigos(
      window.location,
      redirecionar,
    );

    expect(redirecionou).toBe(false);
    expect(redirecionar).not.toHaveBeenCalled();
  });

  it("trata querystring vazia como ausência de filtros", () => {
    expect(destinoDosFiltrosAntigos("")).toBeNull();
    expect(destinoDosFiltrosAntigos("?")).toBeNull();
  });
});
