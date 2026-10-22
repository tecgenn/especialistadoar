// @vitest-environment jsdom
import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Consulta from "../src/components/Consulta.tsx";
import type { FiltrosCurados } from "../src/lib/filtros.ts";
import { opcoesDe } from "../src/lib/opcoes.ts";

/**
 * A **única ilha** do site (ADR-0008) baixa o `consulta.json` publicado e aplica
 * filtros + busca **no cliente**, refletindo o estado na URL. Aqui mockamos o
 * `fetch` do dataset e exercitamos a ilha no DOM (jsdom).
 */
const itens: ItemConsulta[] = [
  {
    id: "lg-split",
    marca: "LG",
    marcaCatalogo: "LG",
    modelo: "Dual Inverter",
    tipo: "Split Hi-Wall",
    capacidadesBtu: [9000],
    tensoes: [220],
  },
  {
    id: "lg-janela",
    marca: "LG",
    marcaCatalogo: "LG",
    modelo: "Janela",
    tipo: "Janela",
    capacidadesBtu: [12000],
    tensoes: [127, 220],
  },
  {
    id: "midea-oficial",
    marca: "MIDEA",
    marcaCatalogo: "MIDEA",
    modelo: "Xtreme Save",
    tipo: "Split Hi-Wall",
    capacidadesBtu: [12000],
    tensoes: [220],
  },
  {
    id: "midea-springer",
    marca: "SPRINGER MIDEA",
    marcaCatalogo: "MIDEA",
    modelo: "Springer Inverter",
    tipo: "Split Hi-Wall",
    capacidadesBtu: [18000],
    tensoes: [220],
  },
  {
    id: "gree-split",
    marca: "GREE",
    marcaCatalogo: "GREE",
    modelo: "G-Top Inverter",
    tipo: "Split Hi-Wall",
    capacidadesBtu: [12000],
    tensoes: [220],
  },
];

/** Serve o dataset no `fetch` da ilha, como o navegador faria com `/consulta.json`. */
function servirConsulta() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, json: async () => itens })),
  );
}

/** Renderiza a ilha e espera o dataset carregar (fim do estado "Carregando"). */
async function montar(curadoria?: FiltrosCurados) {
  render(<Consulta opcoes={opcoesDe(itens, curadoria)} />);
  await screen.findByText(/aparelho\(s\) com Dados declarados/);
}

beforeEach(() => {
  servirConsulta();
  window.history.replaceState(null, "", "/");
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ilha de consulta (ADR-0008)", () => {
  it("carrega o consulta.json e lista todos os aparelhos", async () => {
    await montar();
    expect(screen.getByText("LG — Dual Inverter")).toBeDefined();
    expect(screen.getByText("GREE — G-Top Inverter")).toBeDefined();
    expect(screen.getAllByRole("link")).toHaveLength(5);
  });

  it("filtra por marca", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Marca"), {
      target: { value: "GREE" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByText("GREE — G-Top Inverter")).toBeDefined();
  });

  it("mostra a Marca de catálogo e filtra pela família (ADR-0016)", async () => {
    await montar();
    // As Marcas oficiais são MIDEA e SPRINGER MIDEA; o catálogo exibe o grupo.
    expect(screen.getByText("MIDEA — Springer Inverter")).toBeDefined();
    expect(screen.getByText("MIDEA — Xtreme Save")).toBeDefined();
    expect(screen.getByRole("option", { name: "MIDEA" })).toBeDefined();
    expect(screen.queryByRole("option", { name: "SPRINGER MIDEA" })).toBeNull();

    fireEvent.change(screen.getByLabelText("Marca"), {
      target: { value: "MIDEA" },
    });
    // O filtro da família traz a marca oficial e o alias, não um só.
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));
    expect(screen.getByText("MIDEA — Springer Inverter")).toBeDefined();
    expect(screen.getByText("MIDEA — Xtreme Save")).toBeDefined();
  });

  it("mantém um link antigo com o valor oficial visível no filtro", async () => {
    window.history.replaceState(null, "", "/?marca=SPRINGER%20MIDEA");
    render(<Consulta opcoes={opcoesDe(itens)} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    // O filtro continua valendo (67 na base real) e o `<select>` não mente.
    expect((screen.getByLabelText("Marca") as HTMLSelectElement).value).toBe(
      "SPRINGER MIDEA",
    );
    expect(screen.getByText("MIDEA — Springer Inverter")).toBeDefined();
  });

  it("filtra por tipo", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Tipo"), {
      target: { value: "Janela" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByText("LG — Janela")).toBeDefined();
  });

  it("filtra por capacidade (BTU)", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Capacidade (BTU/h)"), {
      target: { value: "9000" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByText("LG — Dual Inverter")).toBeDefined();
  });

  it("filtra por tensão", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Tensão (V)"), {
      target: { value: "127" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByText("LG — Janela")).toBeDefined();
  });

  it("combina filtro por campo com a busca textual (MiniSearch)", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Capacidade (BTU/h)"), {
      target: { value: "12000" },
    });
    fireEvent.change(screen.getByLabelText("Busca"), {
      target: { value: "inverter" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByText("GREE — G-Top Inverter")).toBeDefined();
  });

  it("só mostra 'Limpar filtros' com um filtro ativo", async () => {
    await montar();
    expect(screen.queryByRole("button", { name: "Limpar filtros" })).toBeNull();
    fireEvent.change(screen.getByLabelText("Marca"), {
      target: { value: "LG" },
    });
    expect(
      screen.getByRole("button", { name: "Limpar filtros" }),
    ).toBeDefined();
    fireEvent.change(screen.getByLabelText("Marca"), { target: { value: "" } });
    expect(screen.queryByRole("button", { name: "Limpar filtros" })).toBeNull();
  });

  it("reflete o estado na URL ao filtrar", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Marca"), {
      target: { value: "LG" },
    });
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get("marca")).toBe(
        "LG",
      ),
    );
  });

  it("restaura o estado da URL ao abrir o link", async () => {
    window.history.replaceState(null, "", "/?marca=GREE");
    render(<Consulta opcoes={opcoesDe(itens)} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect((screen.getByLabelText("Marca") as HTMLSelectElement).value).toBe(
      "GREE",
    );
  });
});

/**
 * Os chips são a curadoria do site (ticket 22): marcas e capacidades conhecidas
 * a um clique, com o resto no `<select>`. O chip aceso **é** o valor do filtro —
 * sem dois valores de marca ao mesmo tempo.
 */
describe("chips de marca e capacidade", () => {
  const curadoria: FiltrosCurados = {
    marcas: [
      { valor: "MIDEA", rotulo: "Midea" },
      { valor: "LG", rotulo: "LG" },
      // Curada mas ausente da base: não aparece.
      { valor: "SAMSUNG", rotulo: "Samsung" },
    ],
    btus: [12000, 9000, 24000],
  };

  function chip(nome: string): HTMLElement {
    return screen.getByRole("button", { name: nome });
  }

  function pressionado(nome: string): string | null {
    return chip(nome).getAttribute("aria-pressed");
  }

  it("mostra as marcas e capacidades conhecidas como chips, sem as repetir no select", async () => {
    await montar(curadoria);

    expect(chip("Midea")).toBeDefined();
    expect(chip("LG")).toBeDefined();
    expect(chip("12.000")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Samsung" })).toBeNull();
    expect(screen.queryByRole("button", { name: "24.000" })).toBeNull();

    // O `<select>` guarda "Todas…" + o resto, sem duplicar o chip.
    expect(screen.queryByRole("option", { name: "MIDEA" })).toBeNull();
    expect(screen.getByRole("option", { name: "GREE" })).toBeDefined();
    expect(screen.queryByRole("option", { name: "12.000" })).toBeNull();
    expect(screen.getByRole("option", { name: "18.000" })).toBeDefined();

    expect(pressionado("Midea")).toBe("false");
  });

  it("filtra ao clicar no chip, acende o chip e escreve a URL", async () => {
    await montar(curadoria);
    fireEvent.click(chip("Midea"));

    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));
    expect(screen.getByText("MIDEA — Xtreme Save")).toBeDefined();
    expect(screen.getByText("MIDEA — Springer Inverter")).toBeDefined();
    expect(pressionado("Midea")).toBe("true");
    expect(new URLSearchParams(window.location.search).get("marca")).toBe(
      "MIDEA",
    );
  });

  it("clicar de novo no chip ativo limpa o filtro", async () => {
    await montar(curadoria);
    fireEvent.click(chip("Midea"));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));

    fireEvent.click(chip("Midea"));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(5));
    expect(pressionado("Midea")).toBe("false");
    expect(new URLSearchParams(window.location.search).get("marca")).toBeNull();
    expect(screen.queryByRole("button", { name: "Limpar filtros" })).toBeNull();
  });

  it("escolher no select desliga o chip (um valor de marca por vez)", async () => {
    await montar(curadoria);
    fireEvent.click(chip("Midea"));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));

    fireEvent.change(screen.getByLabelText("Marca"), {
      target: { value: "GREE" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(pressionado("Midea")).toBe("false");
    expect(new URLSearchParams(window.location.search).get("marca")).toBe(
      "GREE",
    );
  });

  it("restaura da URL o chip aceso", async () => {
    window.history.replaceState(null, "", "/?marca=MIDEA&btu=12000");
    render(<Consulta opcoes={opcoesDe(itens, curadoria)} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);

    expect(pressionado("Midea")).toBe("true");
    expect(pressionado("12.000")).toBe("true");
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
  });

  it("filtra por capacidade no chip e limpa no segundo clique", async () => {
    await montar(curadoria);
    fireEvent.click(chip("12.000"));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(3));
    expect(pressionado("12.000")).toBe("true");
    expect(new URLSearchParams(window.location.search).get("btu")).toBe(
      "12000",
    );

    fireEvent.click(chip("12.000"));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(5));
    expect(pressionado("12.000")).toBe("false");
  });

  it("um link antigo com o valor oficial não acende nem some do select", async () => {
    window.history.replaceState(null, "", "/?marca=SPRINGER%20MIDEA");
    render(<Consulta opcoes={opcoesDe(itens, curadoria)} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));

    expect(pressionado("Midea")).toBe("false");
    expect((screen.getByLabelText("Marca") as HTMLSelectElement).value).toBe(
      "SPRINGER MIDEA",
    );
  });

  it("acende o chip e filtra com a marca em minúsculas na URL", async () => {
    window.history.replaceState(null, "", "/?marca=midea");
    render(<Consulta opcoes={opcoesDe(itens, curadoria)} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);

    expect(pressionado("Midea")).toBe("true");
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));
    expect(screen.queryByRole("option", { name: "midea" })).toBeNull();
    expect((screen.getByLabelText("Marca") as HTMLSelectElement).value).toBe(
      "",
    );
  });
});
