// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Comparar from "../src/components/Comparar.tsx";

/**
 * A ilha da Comparação (ticket 49): três campos de busca que viram cartões, a
 * matriz neutra e o contrato `?ids=` na URL. Os testes exercitam o que a pessoa
 * vê e o que a URL passa a conter — nunca o estado interno do componente.
 */
const itens: ItemConsulta[] = [
  {
    id: "ap-aaaaaaaaaaaa",
    marca: "SAMSUNG",
    marcaCatalogo: "SAMSUNG",
    modelo: "WindFree AI Pro",
    tipo: "Split Hi-Wall",
    funcao: "Frio",
    capacidadesBtu: [12000],
    tensoes: [220],
    classes: ["A"],
    idrs: [6.2],
    consumosKwh: [320],
  },
  {
    id: "ap-bbbbbbbbbbbb",
    marca: "LG",
    marcaCatalogo: "LG",
    modelo: "Dual Inverter",
    tipo: "Split Hi-Wall",
    funcao: "Frio",
    capacidadesBtu: [12000],
    tensoes: [220],
    classes: ["B"],
    idrs: [5.1],
    consumosKwh: [350],
  },
  {
    id: "ap-cccccccccccc",
    marca: "MIDEA",
    marcaCatalogo: "MIDEA",
    modelo: "Xtreme Save",
    tipo: "Split Hi-Wall",
    funcao: "Quente/Frio",
    capacidadesBtu: [9000, 12000],
    tensoes: [127, 220],
    classes: ["A"],
    idrs: [5.5],
    consumosKwh: [300],
  },
  {
    id: "ap-dddddddddddd",
    marca: "GREE",
    marcaCatalogo: "GREE",
    modelo: "G-Top Inverter",
    tipo: "Janela",
    funcao: "Frio",
    capacidadesBtu: [9000],
    tensoes: [220],
    classes: ["C"],
    idrs: [3.5],
    consumosKwh: [100],
  },
  {
    id: "ap-eeeeeeeeeeee",
    marca: "ELGIN",
    marcaCatalogo: "ELGIN",
    modelo: "Piso Teto",
    tipo: "Split Piso-teto",
    funcao: "Frio",
    capacidadesBtu: [30000],
    tensoes: [220],
    classes: ["D"],
    idrs: [2],
    consumosKwh: [150],
  },
];

/** Um Aparelho tem Análise: o selo aparece no cabeçalho da coluna. */
const analisados = new Map([
  [
    "ap-aaaaaaaaaaaa",
    { titulo: "Vale a pena o WindFree?", url: "/analises/windfree/" },
  ],
]);

function servirConsulta(dataset: ItemConsulta[] = itens) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, json: async () => dataset })),
  );
}

/** Renderiza a ilha na URL dada e espera o dataset; o resto é comportamento. */
async function montar(url = "/comparar/") {
  window.history.replaceState(null, "", url);
  render(<Comparar analisados={analisados} />);
  await waitFor(() =>
    expect(screen.queryByText("Carregando a base…")).toBeNull(),
  );
}

function idsDaUrl(): string | null {
  return new URLSearchParams(window.location.search).get("ids");
}

function campos(): HTMLElement[] {
  return screen.queryAllByRole("combobox");
}

function tabela(): HTMLElement {
  return screen.getByRole("table");
}

/** Os cabeçalhos de coluna visíveis (o primeiro, "Atributo", é sr-only). */
function colunas(): string[] {
  return within(tabela())
    .getAllByRole("columnheader")
    .slice(1)
    .map((coluna) => coluna.textContent ?? "");
}

function linhas(): string[] {
  return within(tabela())
    .getAllByRole("rowheader")
    .map((linha) => linha.textContent ?? "");
}

/** Escolhe uma sugestão digitando no campo indicado. */
async function escolherNoCampo(slot: number, termo: string, modelo: string) {
  fireEvent.change(campos()[slot] as HTMLElement, {
    target: { value: termo },
  });
  const opcao = await screen.findByRole("option", { name: new RegExp(modelo) });
  fireEvent.click(opcao);
}

beforeEach(() => {
  servirConsulta();
  window.history.replaceState(null, "", "/comparar/");
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Comparação vazia", () => {
  it("mostra os três campos e um estado que explica como comparar", async () => {
    await montar();

    expect(campos()).toHaveLength(3);
    expect(
      screen.getByRole("heading", { name: /nada para comparar/i }),
    ).toBeDefined();
    expect(screen.getByText(/Escolha até três modelos/)).toBeDefined();
    expect(
      screen.getByRole("link", { name: "Ver todos os aparelhos" }),
    ).toBeDefined();
    expect(screen.queryByRole("table")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Limpar comparação" }),
    ).toBeNull();
  });
});

describe("combobox de modelos", () => {
  it("filtra o consulta.json e mostra marca, modelo, capacidade e tipo", async () => {
    await montar();

    fireEvent.change(campos()[0] as HTMLElement, {
      target: { value: "midea" },
    });

    const opcao = await screen.findByRole("option", {
      name: /Xtreme Save/,
    });
    expect(opcao.textContent).toContain("MIDEA");
    expect(opcao.textContent).toContain("9.000 – 12.000 BTU/h");
    expect(opcao.textContent).toContain("Split Hi-Wall");
    expect(
      (campos()[0] as HTMLInputElement).getAttribute("aria-expanded"),
    ).toBe("true");
  });

  it("navega com as setas e escolhe com Enter", async () => {
    await montar();

    const campo = campos()[0] as HTMLElement;
    fireEvent.change(campo, { target: { value: "gree" } });
    await screen.findByRole("option", { name: /G-Top Inverter/ });

    fireEvent.keyDown(campo, { key: "ArrowDown" });
    fireEvent.keyDown(campo, { key: "Enter" });

    expect(
      await screen.findByRole("button", {
        name: "Trocar GREE G-Top Inverter",
      }),
    ).toBeDefined();
    expect(idsDaUrl()).toBe("ap-dddddddddddd");
  });

  it("fecha a lista com Esc sem escolher", async () => {
    await montar();

    const campo = campos()[0] as HTMLElement;
    fireEvent.change(campo, { target: { value: "dual" } });
    await screen.findByRole("option", { name: /Dual Inverter/ });

    fireEvent.keyDown(campo, { key: "Escape" });

    expect(screen.queryByRole("option")).toBeNull();
    expect((campo as HTMLInputElement).value).toBe("");
    expect(idsDaUrl()).toBeNull();
  });

  it("escolher vira cartão com Trocar e Remover, e a matriz abre com um modelo", async () => {
    await montar();

    await escolherNoCampo(0, "midea", "Xtreme Save");

    expect(
      screen.getByRole("button", { name: "Trocar MIDEA Xtreme Save" }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Remover MIDEA Xtreme Save" }),
    ).toBeDefined();
    expect(idsDaUrl()).toBe("ap-cccccccccccc");
    expect(campos()).toHaveLength(2);
    expect(colunas()).toHaveLength(1);
    expect(colunas()[0]).toContain("MIDEA");
    expect(colunas()[0]).toContain("Xtreme Save");
    expect(colunas()[0]).toContain("Ver ficha");
    expect(screen.getByText(/Adicione um segundo modelo/)).toBeDefined();
  });

  it("não repete um Aparelho já escolhido nas sugestões", async () => {
    await montar();
    await escolherNoCampo(0, "midea", "Xtreme Save");

    fireEvent.change(campos()[0] as HTMLElement, {
      target: { value: "midea" },
    });

    expect(screen.queryByRole("option", { name: /Xtreme Save/ })).toBeNull();
    expect(screen.getByText("Nenhum modelo encontrado.")).toBeDefined();
  });
});

describe("estados de 2 e 3 modelos", () => {
  it("com 2 ou 3 ids abre a matriz lado a lado, na ordem da URL", async () => {
    await montar("/comparar/?ids=ap-bbbbbbbbbbbb,ap-aaaaaaaaaaaa");

    expect(campos()).toHaveLength(1);
    expect(colunas()).toHaveLength(2);
    expect(colunas()[0]).toContain("LG");
    expect(colunas()[0]).toContain("Dual Inverter");
    expect(colunas()[1]).toContain("SAMSUNG");
    expect(colunas()[1]).toContain("WindFree AI Pro");
    expect(colunas()[1]).toContain("Análise");
    expect(screen.queryByText(/Adicione um segundo modelo/)).toBeNull();
  });

  it("compara as sete linhas de atributos, com faixas quando há Variantes", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-cccccccccccc");

    expect(linhas()).toEqual([
      "Tipo",
      "Função",
      "Capacidade",
      "Tensão",
      "Consumo anual",
      "IDRS",
      "Classe",
    ]);
    const texto = tabela().textContent ?? "";
    expect(texto).toContain("Split Hi-Wall");
    expect(texto).toContain("Quente/Frio");
    expect(texto).toContain("9.000 – 12.000 BTU/h");
    expect(texto).toContain("127 – 220 V");
    expect(texto).toContain("300 kWh");
    expect(texto).toContain("6,2");
    expect(texto).toContain("5,5");
    expect(texto).toContain("Classe A");
  });

  it("com 3 modelos todos os campos viram cartões e a matriz tem três colunas", async () => {
    await montar(
      "/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb,ap-dddddddddddd",
    );

    expect(campos()).toHaveLength(0);
    expect(colunas()).toHaveLength(3);
    expect(colunas()[0]).toContain("SAMSUNG");
    expect(colunas()[1]).toContain("LG");
    expect(colunas()[2]).toContain("GREE");
  });

  it("o cabeçalho traz o link da ficha e o selo da Análise", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb");

    const fichas = within(tabela()).getAllByRole("link", { name: "Ver ficha" });
    expect(fichas.map((link) => link.getAttribute("href"))).toEqual([
      "/aparelhos/ap-aaaaaaaaaaaa",
      "/aparelhos/ap-bbbbbbbbbbbb",
    ]);
    expect(
      within(tabela())
        .getByRole("link", { name: "Análise" })
        .getAttribute("href"),
    ).toBe("/analises/windfree/");
  });

  it("dá a dica de rolagem da matriz no celular", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb");

    expect(screen.getByText(/Deslize a matriz para o lado/)).toBeDefined();
    const css = readFileSync(
      join(process.cwd(), "apps/site/src/styles/global.css"),
      "utf8",
    );
    expect(css).toMatch(
      /\.comparar-matriz-rolagem\s*\{[^}]*overflow-x:\s*auto/,
    );
    expect(css).toMatch(
      /\.comparar-matriz \.comparar-atributo\s*\{[^}]*position:\s*sticky/,
    );
    expect(css).toMatch(
      /@media \(max-width: 40rem\)[\s\S]*?\.comparar-dica\s*\{[^}]*display:\s*block/,
    );
  });
});

describe("contrato `ids` na URL", () => {
  it("descarta repetidos, desconhecidos e o excedente, e avisa quantos foram", async () => {
    await montar(
      "/comparar/?ids=ap-aaaaaaaaaaaa,ap-aaaaaaaaaaaa,ap-zzzzzzzzzzzz,ap-bbbbbbbbbbbb,ap-cccccccccccc,ap-dddddddddddd",
    );

    expect(
      screen.getByText(
        "3 ids repetidos ou desconhecidos foram descartados do link.",
      ),
    ).toBeDefined();
    expect(colunas()).toHaveLength(3);
    expect(colunas()[0]).toContain("SAMSUNG");
    expect(colunas()[1]).toContain("LG");
    expect(colunas()[2]).toContain("MIDEA");
  });

  it("avisa no singular quando só um id é descartado", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-aaaaaaaaaaaa");

    expect(
      screen.getByText(
        "Um id repetido ou desconhecido foi descartado do link.",
      ),
    ).toBeDefined();
    expect(colunas()).toHaveLength(1);
  });

  it("remover o cartão do meio aproxima os seguintes", async () => {
    await montar(
      "/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb,ap-cccccccccccc",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Remover LG Dual Inverter" }),
    );

    await waitFor(() => expect(colunas()).toHaveLength(2));
    expect(colunas()[0]).toContain("SAMSUNG");
    expect(colunas()[1]).toContain("MIDEA");
    expect(idsDaUrl()).toBe("ap-aaaaaaaaaaaa,ap-cccccccccccc");
  });

  it("Trocar devolve o campo no mesmo slot e substitui o modelo", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Trocar SAMSUNG WindFree AI Pro",
      }),
    );

    expect(campos()).toHaveLength(2);
    await waitFor(() =>
      expect(document.activeElement).toBe(campos()[0] ?? null),
    );

    await escolherNoCampo(0, "gree", "G-Top Inverter");

    expect(
      screen.getByRole("button", { name: "Trocar GREE G-Top Inverter" }),
    ).toBeDefined();
    expect(colunas()[0]).toContain("GREE");
    expect(colunas()[1]).toContain("LG");
    expect(idsDaUrl()).toBe("ap-dddddddddddd,ap-bbbbbbbbbbbb");
  });

  it("'Limpar comparação' zera os três campos e remove ids da URL", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb");

    fireEvent.click(screen.getByRole("button", { name: "Limpar comparação" }));

    await waitFor(() => expect(campos()).toHaveLength(3));
    expect(window.location.search).toBe("");
    expect(idsDaUrl()).toBeNull();
    expect(screen.queryByRole("table")).toBeNull();
    expect(
      screen.getByRole("heading", { name: /nada para comparar/i }),
    ).toBeDefined();
  });
});
