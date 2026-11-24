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
import type { Oferta } from "../src/lib/ofertas.ts";
import {
  type TarifasCuradas,
  UFS,
  validarTarifas,
} from "../src/lib/tarifas.ts";
import { mesclarChaves } from "../src/lib/url.ts";

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
  {
    id: "ap-ffffffffffff",
    marca: "PHILCO",
    marcaCatalogo: "PHILCO",
    modelo: "Sem consumo",
    tipo: "Split Hi-Wall",
    funcao: "Frio",
    capacidadesBtu: [12000],
    tensoes: [220],
    classes: ["A"],
    idrs: [5],
    consumosKwh: [],
  },
];

/** A curadoria do teste, a mesma da ficha: SP a R$ 0,85/kWh. */
const tarifas: TarifasCuradas = validarTarifas({
  ufs: UFS.map(({ uf, nome }) => ({
    uf,
    nome,
    tarifa: uf === "SP" ? 0.85 : uf === "RJ" ? 0.95 : 0.9,
    referencia: "2026-11",
    fonte: "ANEEL",
  })),
});

/** Um Aparelho tem Análise: o selo aparece no cabeçalho da coluna. */
const analisados = new Map([
  [
    "ap-aaaaaaaaaaaa",
    { titulo: "Vale a pena o WindFree?", url: "/analises/windfree/" },
  ],
]);

/**
 * A Oferta de fixture (ticket 59): só o primeiro modelo da base tem uma. A
 * lista chega já resolvida e validada pelo build — a ilha não baixa nada.
 */
const ofertas: Oferta[] = [
  {
    aparelhoId: "ap-aaaaaaaaaaaa",
    loja: "Loja do teste",
    url: "https://loja.example.com/windfree",
  },
];

function servirConsulta(dataset: ItemConsulta[] = itens) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, json: async () => dataset })),
  );
}

/** Renderiza a ilha na URL dada e espera o dataset; o resto é comportamento. */
async function montar(url = "/comparar/", ofertasDaIlha = ofertas) {
  window.history.replaceState(null, "", url);
  render(
    <Comparar
      analisados={analisados}
      ofertas={ofertasDaIlha}
      tarifas={tarifas}
    />,
  );
  await waitFor(() =>
    expect(screen.queryByText("Carregando a base…")).toBeNull(),
  );
}

function idsDaUrl(): string | null {
  return new URLSearchParams(window.location.search).get("ids");
}

function busca(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

/**
 * Só os campos de busca, pelos rótulos visíveis — o `<select>` de UF do painel
 * também tem papel de combobox e não entra aqui.
 */
const ROTULOS_BUSCA = ["Modelo 1", "Modelo 2", "Modelo 3"] as const;

function campos(): HTMLElement[] {
  return ROTULOS_BUSCA.map((rotulo) =>
    screen.queryByRole("combobox", { name: rotulo }),
  ).filter((campo): campo is HTMLElement => campo !== null);
}

/** O painel de custo pelo título, sem depender de classe. */
function painelCusto(): HTMLElement | null {
  return screen.queryByRole("region", {
    name: /custo estimado — seu cenário/i,
  });
}

/** Os cartões de modelo são os `<article>` da ilha. */
function cartoes(): HTMLElement[] {
  return screen.queryAllByRole("article");
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
      "Consumo mensal",
      "Custo mensal",
      "Custo anual",
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

/** O custo de energia na comparação (ticket 56), no mesmo cenário da ficha. */
describe("custo estimado na comparação", () => {
  it("com um modelo só não há painel: permanece só o convite", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa");

    expect(screen.queryByLabelText("Estado (UF)")).toBeNull();
    expect(painelCusto()).toBeNull();
    expect(screen.getByText(/Adicione um segundo modelo/)).toBeDefined();
  });

  it("com 2 modelos o painel de quatro campos fica acima dos cartões", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb");

    for (const rotulo of [
      "Estado (UF)",
      "Tarifa (R$/kWh)",
      "Horas por dia",
      "Dias por mês",
    ]) {
      expect(screen.getByLabelText(rotulo)).toBeDefined();
    }
    const painel = painelCusto() as HTMLElement;
    const primeiroCartao = cartoes()[0] as HTMLElement;
    expect(painel).not.toBeNull();
    expect(
      painel.compareDocumentPosition(primeiroCartao) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("com 3 modelos o painel continua acima dos cartões", async () => {
    await montar(
      "/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb,ap-cccccccccccc",
    );

    expect(painelCusto()).not.toBeNull();
    expect(cartoes()).toHaveLength(3);
    const painel = painelCusto() as HTMLElement;
    const primeiroCartao = cartoes()[0] as HTMLElement;
    expect(
      painel.compareDocumentPosition(primeiroCartao) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("explica o método e deixa claro que o custo é estimativa, não Valor oficial", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb");

    const metodo = screen.getByText(/2\.080 h\/ano/);
    expect(metodo.textContent).toContain("12 meses iguais");
    expect(metodo.textContent).toContain("estimativa");
    expect(metodo.textContent).toContain("não um Valor oficial");
    expect(screen.getByText(/custos acima são estimativas/)).toBeDefined();
  });

  it("cada cartão mostra consumo mensal, custo mensal e custo anual", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb");

    const modelos = cartoes();
    expect(modelos).toHaveLength(2);
    // 320 kWh/ano no cenário padrão: 36,92 kWh/mês, R$ 31,38/mês, R$ 376,62/ano.
    expect(modelos[0]?.textContent).toContain("Consumo mensal");
    expect(modelos[0]?.textContent).toContain("36,92 kWh");
    expect(modelos[0]?.textContent).toContain("R$ 31,38");
    expect(modelos[0]?.textContent).toContain("R$ 376,62");
    // 350 kWh/ano: R$ 34,33/mês e R$ 411,92/ano.
    expect(modelos[1]?.textContent).toContain("40,38 kWh");
    expect(modelos[1]?.textContent).toContain("R$ 34,33");
    expect(modelos[1]?.textContent).toContain("R$ 411,92");
  });

  it("mostra as três linhas com travessão quando o modelo não declara consumo", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-ffffffffffff");

    const semConsumo = cartoes()[1] as HTMLElement;
    expect(semConsumo.textContent).toContain("Consumo mensal");
    expect(semConsumo.textContent).toContain("Custo mensal");
    expect(semConsumo.textContent).toContain("Custo anual");
    expect(semConsumo.textContent).toContain("Sem consumo declarado");
    expect(semConsumo.textContent?.match(/—/g)).toHaveLength(3);
  });

  it("a matriz ganha a seção 'Custo estimado (seu uso)' com as três linhas", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb");

    expect(tabela().textContent).toContain("Custo estimado (seu uso)");
    expect(linhas().slice(-3)).toEqual([
      "Consumo mensal",
      "Custo mensal",
      "Custo anual",
    ]);
    expect(tabela().textContent).toContain("R$ 376,62");
    expect(tabela().textContent).toContain("R$ 411,92");
  });

  it("mostra a frase factual com a diferença entre o maior e o menor custo anual", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb");

    const frase = screen.getByText(/diferença de R\$/);
    expect(frase.textContent).toContain("R$ 376,62");
    expect(frase.textContent).toContain("R$ 411,92");
    expect(frase.textContent).toContain("R$ 35,31");
  });

  it("avisa quando as capacidades diferem, apontando o IDRS", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-eeeeeeeeeeee");

    const aviso = screen.getByText(/capacidades diferentes/i);
    expect(aviso.textContent).toContain("IDRS");
    expect(aviso.textContent).toContain("eficiência");
  });

  it("não avisa quando as capacidades são iguais", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb");

    expect(screen.queryByText(/capacidades diferentes/i)).toBeNull();
  });

  it("não marca nenhum valor como melhor, ★ ou vencedor", async () => {
    await montar(
      "/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb,ap-cccccccccccc",
    );

    const texto =
      tabela().textContent +
      cartoes()
        .map((cartao) => cartao.textContent)
        .join("") +
      (screen.getByText(/dados técnicos são os Dados declarados/).textContent ??
        "");
    expect(texto).not.toMatch(/melhor/i);
    expect(texto).not.toMatch(/vencedor/i);
    expect(texto).not.toMatch(/menor custo/i);
    expect(texto).not.toContain("★");
  });

  it("abre um link vindo da ficha com o mesmo recorte de tarifa e uso", async () => {
    // O cenário é o que a ficha escreve na própria URL; a comparação só junta
    // `ids` às mesmas chaves, sem recalcular nem trocar os padrões.
    const daFicha = new URLSearchParams("uf=RJ&tarifa=1.2&horas=6&dias=22");
    const busca = mesclarChaves(
      daFicha,
      ["ids"],
      new URLSearchParams("ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb"),
    );
    await montar(`/comparar/?${busca.toString()}`);

    expect(
      (screen.getByLabelText("Estado (UF)") as HTMLSelectElement).value,
    ).toBe("RJ");
    expect(
      (screen.getByLabelText("Tarifa (R$/kWh)") as HTMLInputElement).value,
    ).toBe("1,2");
    expect(
      (screen.getByLabelText("Horas por dia") as HTMLInputElement).value,
    ).toBe("6");
    expect(
      (screen.getByLabelText("Dias por mês") as HTMLInputElement).value,
    ).toBe("22");
  });

  it("muda os números de todos os modelos de uma vez e mantém ids na URL", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb");

    fireEvent.change(screen.getByLabelText("Horas por dia"), {
      target: { value: "4" },
    });

    // 320 kWh/ano a 4 h/dia: 18,46 kWh/mês, R$ 15,69/mês.
    const modelos = cartoes();
    expect(modelos[0]?.textContent).toContain("18,46 kWh");
    expect(modelos[0]?.textContent).toContain("R$ 15,69");
    expect(modelos[1]?.textContent).toContain("R$ 17,16");
    expect(busca().get("ids")).toBe("ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb");
    expect(busca().get("horas")).toBe("4");
  });

  it("trocar a seleção não apaga o recorte da calculadora da URL", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb&uf=RJ");

    fireEvent.click(
      screen.getByRole("button", { name: "Remover LG Dual Inverter" }),
    );

    await waitFor(() => expect(idsDaUrl()).toBe("ap-aaaaaaaaaaaa"));
    expect(busca().get("uf")).toBe("RJ");
  });
});

/**
 * O CTA de Oferta no cartão de cada modelo (ticket 59): mesma linguagem e mesmo
 * marcador da ficha, dentro da área de ações. A matriz continua neutra.
 */
describe("CTA de Oferta no cartão", () => {
  it("mostra 'Ver oferta' com loja e marcador no modelo que tem Oferta", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb");

    const comOferta = cartoes()[0] as HTMLElement;
    const cta = within(comOferta).getByRole("link", {
      name: "Ver oferta — Loja do teste — link de afiliado",
    });
    expect(cta.getAttribute("href")).toBe("https://loja.example.com/windfree");
    expect(cta.getAttribute("rel")).toBe("sponsored nofollow noopener");
    expect(cta.getAttribute("target")).toBe("_blank");
    expect(cta.className).toBe("oferta-cartao oferta-cta oferta-cta--com-logo");
    // Loja desconhecida: o nome continua legível como texto, sem SVG.
    expect(cta.querySelector(".loja-logo-fallback")?.textContent).toBe(
      "Loja do teste",
    );
    expect(cta.querySelector("svg.loja-logo")).toBeNull();
  });

  it("substitui o nome da loja pelo logotipo oficial ou pelo desenho de linha", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb", [
      {
        aparelhoId: "ap-aaaaaaaaaaaa",
        loja: "Mercado Livre",
        url: "https://www.mercadolivre.com.br/windfree",
      },
      {
        aparelhoId: "ap-bbbbbbbbbbbb",
        loja: "amazon",
        url: "https://www.amazon.com.br/dual-inverter",
      },
    ]);

    const primeiro = cartoes()[0] as HTMLElement;
    const segundo = cartoes()[1] as HTMLElement;
    const ctaUm = within(primeiro).getByRole("link", {
      name: "Ver oferta — Mercado Livre — link de afiliado",
    });
    const ctaDois = within(segundo).getByRole("link", {
      name: "Ver oferta — Amazon — link de afiliado",
    });

    // O Mercado Livre usa o SVG oficial da marca; a Amazon continua no desenho
    // de linha. O aviso de afiliado vive no `title` do logo, não em texto.
    const logoMercadoLivre = ctaUm.querySelector("img.loja-logo");
    expect(logoMercadoLivre?.getAttribute("alt")).toBe("Mercado Livre");
    expect(logoMercadoLivre?.getAttribute("src")).toMatch(
      /mercado-livre.*\.svg/,
    );
    expect(logoMercadoLivre?.getAttribute("title")).toBe("link de afiliado");
    expect(
      ctaDois.querySelector("svg.loja-logo")?.getAttribute("aria-label"),
    ).toBe("Amazon");
    expect(ctaDois.querySelector("svg.loja-logo title")?.textContent).toBe(
      "link de afiliado",
    );
    expect(primeiro.textContent).not.toContain("Mercado Livre");
    expect(segundo.textContent).not.toContain("amazon");
    // O aviso não é texto do CTA: só o `title` do logo o carrega.
    expect(
      ctaUm.querySelector(".oferta-cta-rotulo")?.textContent,
    ).not.toContain("link de afiliado");
    expect(
      ctaDois.querySelector(".oferta-cta-rotulo")?.textContent,
    ).not.toContain("link de afiliado");
  });

  it("fica na área de ações do cartão, junto de Trocar e Remover", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb");

    const acoes = cartoes()[0]?.querySelector(
      ".comparar-cartao-acoes",
    ) as HTMLElement;
    const cta = within(acoes).getByRole("link", { name: /Ver oferta/ });
    const trocar = within(acoes).getByRole("button", {
      name: "Trocar SAMSUNG WindFree AI Pro",
    });
    const remover = within(acoes).getByRole("button", {
      name: "Remover SAMSUNG WindFree AI Pro",
    });
    expect(cta).toBeDefined();
    expect(trocar).toBeDefined();
    expect(remover).toBeDefined();
    // A ordem do DOM é a ordem de leitura: a Oferta vem antes de "Trocar"
    // (ticket 69), nunca depois das ações destrutivas.
    expect(
      cta.compareDocumentPosition(trocar) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      trocar.compareDocumentPosition(remover) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("não renderiza CTA, espaço reservado nem botão desabilitado sem Oferta", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb");

    const semOferta = cartoes()[1] as HTMLElement;
    expect(within(semOferta).queryByRole("link")).toBeNull();
    expect(
      within(semOferta).queryByRole("button", { name: /oferta/i }),
    ).toBeNull();
    expect(
      within(semOferta)
        .getAllByRole("button")
        .map((botao) => botao.textContent),
    ).toEqual(["Trocar", "Remover"]);
    // Só o modelo com Oferta ganha um CTA — nada é reservado no outro cartão.
    expect(screen.getAllByRole("link", { name: /Ver oferta/ })).toHaveLength(1);
  });

  it("sem nenhuma Oferta publicada não há CTA em cartão nenhum", async () => {
    await montar("/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb", []);

    expect(screen.queryByRole("link", { name: /Ver oferta/ })).toBeNull();
    expect(screen.queryByText(/link de afiliado/)).toBeNull();
  });

  it("a matriz de atributos não ganha linha, coluna nem link comercial", async () => {
    await montar(
      "/comparar/?ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb,ap-cccccccccccc",
    );

    const matriz = within(tabela());
    expect(matriz.queryByRole("link", { name: /Ver oferta/ })).toBeNull();
    expect(tabela().textContent).not.toMatch(/oferta|afiliado/i);
    expect(tabela().querySelector('[rel~="sponsored"]')).toBeNull();
    // Os únicos links da matriz continuam sendo os internos de ficha e Análise.
    for (const link of matriz.getAllByRole("link")) {
      expect(link.getAttribute("href")).not.toContain("loja.example.com");
    }
  });
});
