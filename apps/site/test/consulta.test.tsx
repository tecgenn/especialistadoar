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
    modelo: "Dual Inverter",
    tipo: "Split Hi-Wall",
    capacidadesBtu: [9000],
    tensoes: [220],
  },
  {
    id: "lg-janela",
    marca: "LG",
    modelo: "Janela",
    tipo: "Janela",
    capacidadesBtu: [12000],
    tensoes: [127, 220],
  },
  {
    id: "gree-split",
    marca: "GREE",
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
async function montar() {
  render(<Consulta opcoes={opcoesDe(itens)} />);
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
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("filtra por marca", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Marca"), {
      target: { value: "GREE" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByText("GREE — G-Top Inverter")).toBeDefined();
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
