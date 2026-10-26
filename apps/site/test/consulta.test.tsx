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
 * filtros, busca e ordenação **no cliente**, refletindo o estado na URL. Aqui
 * mockamos o `fetch` do dataset e exercitamos a ilha no DOM (jsdom).
 */
const itens: ItemConsulta[] = [
  {
    id: "lg-split",
    marca: "LG",
    marcaCatalogo: "LG",
    modelo: "Dual Inverter",
    tipo: "Split Hi-Wall",
    situacao: "ativo",
    funcao: "Frio",
    rotacao: "Velocidade Variável",
    capacidadesBtu: [9000],
    tensoes: [220],
    classes: ["A"],
    idrs: [5],
    consumosKwh: [300],
    suspeito: false,
  },
  {
    id: "lg-janela",
    marca: "LG",
    marcaCatalogo: "LG",
    modelo: "Janela",
    tipo: "Janela",
    situacao: "inativo",
    funcao: "Frio",
    rotacao: "Velocidade Fixa",
    capacidadesBtu: [12000],
    tensoes: [127, 220],
    classes: ["B"],
    idrs: [3],
    consumosKwh: [50],
    suspeito: true,
  },
  {
    id: "midea-oficial",
    marca: "MIDEA",
    marcaCatalogo: "MIDEA",
    modelo: "Xtreme Save",
    tipo: "Split Hi-Wall",
    situacao: "ativo",
    funcao: "Quente/Frio",
    rotacao: "Velocidade Variável",
    capacidadesBtu: [12000],
    tensoes: [220],
    classes: ["A"],
    idrs: [4],
    consumosKwh: [200],
    suspeito: false,
  },
  {
    id: "midea-springer",
    marca: "SPRINGER MIDEA",
    marcaCatalogo: "MIDEA",
    modelo: "Springer Inverter",
    tipo: "Split Hi-Wall",
    situacao: "ativo",
    funcao: "Quente/Frio",
    rotacao: "Velocidade Variável",
    capacidadesBtu: [18000],
    tensoes: [220],
    classes: ["A"],
    idrs: [4.5],
    consumosKwh: [400],
    suspeito: false,
  },
  {
    id: "gree-split",
    marca: "GREE",
    marcaCatalogo: "GREE",
    modelo: "G-Top Inverter",
    tipo: "Split Hi-Wall",
    situacao: "ativo",
    funcao: "Frio",
    rotacao: "Velocidade Variável",
    capacidadesBtu: [12000],
    tensoes: [220],
    classes: ["C"],
    idrs: [3.5],
    consumosKwh: [100],
    suspeito: false,
  },
];

/** Serve o dataset no `fetch` da ilha, como o navegador faria com `/consulta.json`. */
function servirConsulta(dataset: ItemConsulta[] = itens) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, json: async () => dataset })),
  );
}

/** Renderiza a ilha e espera o dataset carregar (fim do estado "Carregando"). */
async function montar(curadoria?: FiltrosCurados) {
  render(<Consulta opcoes={opcoesDe(itens, curadoria)} />);
  await screen.findByText(/aparelho\(s\) com Dados declarados/);
}

/** Os modelos de cada linha de dados, na ordem renderizada. */
function modelosVisiveis(): string[] {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((linha) => linha.querySelector("a")?.textContent ?? "");
}

function cabecalho(nome: RegExp): HTMLElement {
  return screen.getByRole("columnheader", { name: nome });
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
  it("carrega o consulta.json e ordena A–Z por Marca de catálogo e modelo", async () => {
    await montar();
    expect(modelosVisiveis()).toEqual([
      "G-Top Inverter",
      "Dual Inverter",
      "Janela",
      "Springer Inverter",
      "Xtreme Save",
    ]);
  });

  it("mostra uma linha por Aparelho com as colunas da tabela", async () => {
    await montar();
    const [primeira] = screen.getAllByRole("row").slice(1);
    expect(primeira?.textContent).toContain("GREE");
    expect(primeira?.textContent).toContain("G-Top Inverter");
    expect(primeira?.textContent).toContain("12.000");
    expect(primeira?.textContent).toContain("100");
    expect(primeira?.textContent).toContain("3,5");
    expect(primeira?.textContent).toContain("C");
    expect(primeira?.textContent).toContain("Split Hi-Wall");
    expect(primeira?.textContent).toContain("Ativo");
  });

  it("marca cada célula com o rótulo da coluna, para o cartão no celular", async () => {
    await montar();
    const [primeira] = screen.getAllByRole("row").slice(1);
    const rotulos = [...(primeira?.querySelectorAll("td") ?? [])].map(
      (celula) => celula.getAttribute("data-label"),
    );
    expect(rotulos).toEqual([
      "Marca",
      "Modelo",
      "BTU/h",
      "Consumo (kWh/ano)",
      "IDRS",
      "Classe",
      "Tipo",
      "Situação",
    ]);
  });

  it("filtra por marca", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Marca"), {
      target: { value: "GREE" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByText("G-Top Inverter")).toBeDefined();
  });

  it("mostra a Marca de catálogo e filtra pela família (ADR-0016)", async () => {
    await montar();
    // As Marcas oficiais são MIDEA e SPRINGER MIDEA; o catálogo exibe o grupo.
    expect(screen.getByText("Springer Inverter")).toBeDefined();
    expect(screen.getByText("Xtreme Save")).toBeDefined();
    expect(screen.getByRole("option", { name: "MIDEA" })).toBeDefined();
    expect(screen.queryByRole("option", { name: "SPRINGER MIDEA" })).toBeNull();

    fireEvent.change(screen.getByLabelText("Marca"), {
      target: { value: "MIDEA" },
    });
    // O filtro da família traz a marca oficial e o alias, não um só.
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));
    expect(screen.getByText("Springer Inverter")).toBeDefined();
    expect(screen.getByText("Xtreme Save")).toBeDefined();
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
    expect(screen.getByText("Springer Inverter")).toBeDefined();
  });

  it("filtra por tipo", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Tipo"), {
      target: { value: "Janela" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByRole("link", { name: "Janela" })).toBeDefined();
  });

  it("filtra por capacidade (BTU)", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Capacidade (BTU/h)"), {
      target: { value: "9000" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByText("Dual Inverter")).toBeDefined();
  });

  it("filtra por tensão", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Tensão (V)"), {
      target: { value: "127" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByRole("link", { name: "Janela" })).toBeDefined();
  });

  it("filtra por função, Classe, rotação e Situação", async () => {
    await montar();

    fireEvent.change(screen.getByLabelText("Função"), {
      target: { value: "Quente/Frio" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));

    fireEvent.change(screen.getByLabelText("Função"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Classe"), {
      target: { value: "B" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByRole("link", { name: "Janela" })).toBeDefined();

    fireEvent.change(screen.getByLabelText("Classe"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Rotação"), {
      target: { value: "Velocidade Fixa" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));

    fireEvent.change(screen.getByLabelText("Rotação"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Situação"), {
      target: { value: "inativo" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByRole("link", { name: "Janela" })).toBeDefined();
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
    expect(screen.getByText("G-Top Inverter")).toBeDefined();
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

describe("ordenação da tabela", () => {
  it("começa sem coluna ordenada e ordena ao clicar no cabeçalho", async () => {
    await montar();
    expect(cabecalho(/Consumo/).getAttribute("aria-sort")).toBe("none");

    fireEvent.click(screen.getByRole("button", { name: /Consumo/ }));
    // O suspeito (50 kWh, o menor) vai para o fim mesmo em ordem crescente.
    await waitFor(() =>
      expect(modelosVisiveis()).toEqual([
        "G-Top Inverter",
        "Xtreme Save",
        "Dual Inverter",
        "Springer Inverter",
        "Janela",
      ]),
    );
    expect(cabecalho(/Consumo/).getAttribute("aria-sort")).toBe("ascending");
    expect(cabecalho(/Consumo/).querySelector("button")?.textContent).toContain(
      "↑",
    );
    expect(screen.getByText("consumo declarado suspeito")).toBeDefined();
    expect(new URLSearchParams(window.location.search).get("ordem")).toBe(
      "consumo",
    );
    expect(new URLSearchParams(window.location.search).get("dir")).toBe("asc");
  });

  it("clicar de novo inverte a direção", async () => {
    await montar();
    fireEvent.click(screen.getByRole("button", { name: /Consumo/ }));
    fireEvent.click(screen.getByRole("button", { name: /Consumo/ }));

    await waitFor(() =>
      expect(modelosVisiveis()).toEqual([
        "Springer Inverter",
        "Dual Inverter",
        "Xtreme Save",
        "G-Top Inverter",
        "Janela",
      ]),
    );
    expect(cabecalho(/Consumo/).getAttribute("aria-sort")).toBe("descending");
    expect(new URLSearchParams(window.location.search).get("dir")).toBe("desc");
  });

  it("restaura a ordem da URL ao abrir o link", async () => {
    window.history.replaceState(null, "", "/?ordem=idrs&dir=desc");
    render(<Consulta opcoes={opcoesDe(itens)} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);

    await waitFor(() =>
      expect(modelosVisiveis()).toEqual([
        "Dual Inverter",
        "Springer Inverter",
        "Xtreme Save",
        "G-Top Inverter",
        "Janela",
      ]),
    );
    expect(cabecalho(/IDRS/).getAttribute("aria-sort")).toBe("descending");
  });

  it("o seletor 'Ordenar por' repete as colunas", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Ordenar por"), {
      target: { value: "idrs" },
    });
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get("ordem")).toBe(
        "idrs",
      ),
    );
    expect(cabecalho(/IDRS/).getAttribute("aria-sort")).toBe("ascending");

    fireEvent.change(screen.getByLabelText("Ordenar por"), {
      target: { value: "" },
    });
    await waitFor(() =>
      expect(
        new URLSearchParams(window.location.search).get("ordem"),
      ).toBeNull(),
    );
    expect(modelosVisiveis()[0]).toBe("G-Top Inverter");
  });

  it("inverte a direção pelo botão, sem depender do cabeçalho da tabela", async () => {
    await montar();
    // Sem coluna escolhida não há direção para inverter.
    expect(
      screen.queryByRole("button", { name: /Ordenar de forma/ }),
    ).toBeNull();

    fireEvent.change(screen.getByLabelText("Ordenar por"), {
      target: { value: "consumo" },
    });
    const inverter = await screen.findByRole("button", {
      name: "Ordenar de forma decrescente",
    });
    fireEvent.click(inverter);

    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get("dir")).toBe(
        "desc",
      ),
    );
    expect(cabecalho(/Consumo/).getAttribute("aria-sort")).toBe("descending");
    expect(
      screen.getByRole("button", { name: "Ordenar de forma crescente" }),
    ).toBeDefined();
  });

  it("'Limpar filtros' limpa os filtros e mantém a ordenação", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Ordenar por"), {
      target: { value: "consumo" },
    });
    fireEvent.change(screen.getByLabelText("Marca"), {
      target: { value: "LG" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));

    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));

    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(5));
    const busca = new URLSearchParams(window.location.search);
    expect(busca.get("marca")).toBeNull();
    expect(busca.get("ordem")).toBe("consumo");
  });
});

describe("paginação", () => {
  it("mostra 50 linhas e 'Mostrar mais' acrescenta 50", async () => {
    const muitos: ItemConsulta[] = Array.from({ length: 60 }, (_, indice) => ({
      ...(itens[0] as ItemConsulta),
      id: `aparelho-${indice}`,
      modelo: `Modelo ${indice}`,
    }));
    servirConsulta(muitos);
    render(<Consulta opcoes={opcoesDe(muitos)} />);
    await screen.findByText("60 aparelho(s) com Dados declarados.");

    expect(screen.getAllByRole("link")).toHaveLength(50);
    fireEvent.click(screen.getByRole("button", { name: "Mostrar mais" }));
    expect(screen.getAllByRole("link")).toHaveLength(60);
    expect(screen.queryByRole("button", { name: "Mostrar mais" })).toBeNull();
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
    expect(screen.getByText("Xtreme Save")).toBeDefined();
    expect(screen.getByText("Springer Inverter")).toBeDefined();
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
