import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const raiz = process.cwd();
const estilosDir = join(raiz, "apps/site/src/styles");
const tokensCss = readFileSync(join(estilosDir, "tokens.css"), "utf8");
const fontesCss = readFileSync(join(estilosDir, "fontes.css"), "utf8");
const baseCss = readFileSync(join(estilosDir, "base.css"), "utf8");
const globalCss = readFileSync(join(estilosDir, "global.css"), "utf8");
const primitivosCss = readFileSync(join(estilosDir, "primitivos.css"), "utf8");

/** Declarações `--token: valor;` na ordem em que aparecem. */
function declaracoes(css: string): Map<string, string> {
  const mapa = new Map<string, string>();
  for (const achado of css.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    const [, nome, valorDeclarado] = achado;
    if (nome && valorDeclarado) mapa.set(nome, valorDeclarado.trim());
  }
  return mapa;
}

const tokens = declaracoes(tokensCss);

function valor(token: string): string {
  let atual = tokens.get(token);
  while (atual) {
    const referencia = /^var\(--([\w-]+)\)$/.exec(atual);
    if (!referencia?.[1]) return atual;
    atual = tokens.get(referencia[1]);
  }
  throw new Error(`Token --${token} não resolvido`);
}

function rgb(hex: string): [number, number, number] {
  const limpo = hex.trim().replace("#", "");
  const expandido =
    limpo.length === 3
      ? limpo
          .split("")
          .map((c) => c + c)
          .join("")
      : limpo;
  if (!/^[0-9a-f]{6}$/i.test(expandido)) {
    throw new Error(`Cor não hexadecimal: ${hex}`);
  }
  const canais = [0, 2, 4].map(
    (i) => Number.parseInt(expandido.slice(i, i + 2), 16) / 255,
  );
  return [canais[0] ?? 0, canais[1] ?? 0, canais[2] ?? 0];
}

function luminancia(hex: string): number {
  const [r = 0, g = 0, b = 0] = rgb(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(frente: string, fundo: string): number {
  const a = luminancia(frente);
  const b = luminancia(fundo);
  const [claro, escuro] = a >= b ? [a, b] : [b, a];
  return (claro + 0.05) / (escuro + 0.05);
}

describe("tokens do sistema visual", () => {
  it("declara a paleta, as vozes, o espaço, os raios, a elevação, o movimento, as larguras e o z-index", () => {
    const cores = [
      "tinta",
      "petroleo",
      "petroleo-profundo",
      "giz",
      "papel",
      "mineral",
      "linha",
      "linha-escura",
      "grafite",
      "mudo",
      "mudo-escuro",
      "foco",
      "foco-texto",
      "foco-lavado",
      "azul-frio",
      "azul-frio-hover",
      "azul-frio-ativo",
      "azul-frio-texto",
      "azul-frio-lavado",
      "azul-frio-escuro",
      "frio",
      "frio-texto",
      "frio-lavado",
      "classe-a",
      "classe-b",
      "classe-c",
      "classe-d",
      "classe-e",
      "classe-f",
    ];
    const tipografia = [
      "fonte-interface",
      "fonte-leitura",
      "fonte-mono",
      "texto-display",
      "texto-manchete",
      "texto-secao",
      "texto-bloco",
      "texto-corpo",
      "texto-ui",
      "texto-pequeno",
      "texto-micro",
      "texto-rotulo",
      "texto-leitura",
      "texto-unidade",
    ];
    const estrutura = [
      "esp-1",
      "esp-2",
      "esp-3",
      "esp-4",
      "esp-5",
      "esp-6",
      "esp-7",
      "esp-8",
      "esp-9",
      "esp-10",
      "esp-11",
      "raio-xs",
      "raio-sm",
      "raio-md",
      "sombra-sobreposicao",
      "mov-hover",
      "mov-painel",
      "mov-destaque",
      "curva",
      "largura-shell",
      "largura-leitura",
      "largura-catalogo",
      "calha",
      "altura-cabecalho",
      "z-conteudo",
      "z-barra",
      "z-dock",
      "z-painel",
      "z-menu",
    ];

    for (const token of [...cores, ...tipografia, ...estrutura]) {
      expect(tokens.has(token), `token --${token} ausente`).toBe(true);
    }
  });

  it("usa 0,625 rem no texto micro da divulgação de afiliado", () => {
    expect(valor("texto-micro")).toBe("0.625rem");
  });

  it("mantém a escala de espaço em múltiplos de 2, 4 ou 8 px", () => {
    const medidas = Array.from({ length: 11 }, (_, i) => i + 1).map((n) =>
      Number.parseInt(valor(`esp-${n}`), 10),
    );
    expect(medidas).toEqual([2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128]);
  });

  it("aposentou o âmbar de sinal e a escala térmica", () => {
    for (const token of [
      "sinal",
      "sinal-texto",
      "sinal-lavado",
      "escala-frio",
      "escala-neutro",
      "escala-morno",
      "escala-quente",
    ]) {
      expect(tokens.has(token), `--${token} ainda declarado`).toBe(false);
    }
    for (const css of [tokensCss, baseCss, primitivosCss, globalCss]) {
      expect(css).not.toMatch(/--sinal|--escala-/);
    }
  });

  it("usa o nome legado apenas como alias dos tokens novos", () => {
    const aliases = [
      ["texto", "tinta"],
      ["texto-suave", "grafite"],
      ["borda", "linha"],
      ["fundo", "papel"],
      ["superficie", "giz"],
      ["primaria", "azul-frio"],
    ] as const;
    for (const [legado, novo] of aliases) {
      expect(tokens.get(legado), `--${legado}`).toBe(`var(--${novo})`);
    }
  });
});

describe("contraste dos pares documentados", () => {
  const pares: Array<[string, string, number]> = [
    ["tinta", "giz", 4.5],
    ["tinta", "papel", 4.5],
    ["giz", "tinta", 4.5],
    ["foco", "giz", 3],
    ["foco", "papel", 3],
    ["foco-texto", "giz", 4.5],
    ["foco-texto", "papel", 4.5],
    ["grafite", "giz", 4.5],
    ["grafite", "papel", 4.5],
    ["mudo", "giz", 4.5],
    ["mudo", "papel", 4.5],
    ["mudo-escuro", "tinta", 4.5],
    ["mudo-escuro", "azul-frio-escuro", 4.5],
    ["frio-texto", "giz", 4.5],
    ["frio-texto", "papel", 4.5],
    ["azul-frio", "giz", 4.5],
    ["azul-frio", "papel", 4.5],
    ["azul-frio-hover", "giz", 4.5],
    ["azul-frio-hover", "papel", 4.5],
    ["azul-frio-ativo", "giz", 4.5],
    ["azul-frio-ativo", "papel", 4.5],
    ["azul-frio-texto", "giz", 4.5],
    ["azul-frio-texto", "papel", 4.5],
    ["giz", "azul-frio", 4.5],
    ["giz", "azul-frio-hover", 4.5],
    ["giz", "azul-frio-ativo", 4.5],
  ];

  it.each(pares)("--%s sobre --%s alcança %s:1", (frente, fundo, minimo) => {
    expect(contraste(valor(frente), valor(fundo))).toBeGreaterThanOrEqual(
      minimo,
    );
  });

  it("as Classes A–F passam AA sobre giz e papel", () => {
    for (const classe of ["a", "b", "c", "d", "e", "f"]) {
      const cor = valor(`classe-${classe}`);
      expect(
        contraste(cor, valor("giz")),
        `Classe ${classe.toUpperCase()} sobre giz`,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contraste(cor, valor("papel")),
        `Classe ${classe.toUpperCase()} sobre papel`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("chão visual: branco quase puro e neutro", () => {
  const chao = {
    giz: "#fdfdfb",
    papel: "#f8f8f7",
    mineral: "#ececeb",
    linha: "#d5d8d5",
  } as const;

  const inalterados = {
    tinta: "#0a1f22",
    petroleo: "#123f45",
    foco: "#0f8fa8",
    "foco-texto": "#0b6f83",
    frio: "#2f7f8c",
    "azul-frio": "#0e6b8a",
    "azul-frio-hover": "#1579a0",
    "azul-frio-ativo": "#0b5a73",
    "azul-frio-texto": "#0e6b8a",
    "azul-frio-escuro": "#084d66",
    "classe-a": "#1b6a4e",
    "classe-b": "#467536",
    "classe-c": "#6e691b",
    "classe-d": "#96601c",
    "classe-e": "#9f4529",
    "classe-f": "#8e2f35",
  } as const;

  function conferir(esperados: Readonly<Record<string, string>>): void {
    for (const [token, esperado] of Object.entries(esperados)) {
      expect(valor(token).toLowerCase(), `--${token}`).toBe(esperado);
    }
  }

  it("usa branco quase puro e neutro no chão", () => {
    conferir(chao);
  });

  it("o chão é neutro: nenhum canal verde predomina", () => {
    for (const token of ["giz", "papel"] as const) {
      const [r = 0, g = 0, b = 0] = rgb(valor(token)).map((c) => c * 255);
      expect(g, `--${token} com viés esverdeado`).toBeLessThanOrEqual(r);
      expect(b, `--${token} com viés amarelado`).toBeGreaterThanOrEqual(r - 4);
    }
  });

  it("mantém tinta, petróleo, ciano, frio e as Classes intactos", () => {
    conferir(inalterados);
  });

  it("o fundo da página é o papel claro, nunca uma superfície escura", () => {
    expect(baseCss).toMatch(/html\s*{[^}]*background:\s*var\(--papel\)/);
    expect(baseCss).toMatch(/body\s*{[^}]*background:\s*var\(--papel\)/);
  });
});

describe("fontes self-hosted", () => {
  const arquivos = [...fontesCss.matchAll(/url\("([^"]+\.woff2)"\)/g)]
    .map((achado) => achado[1])
    .filter((arquivo): arquivo is string => Boolean(arquivo));

  it("carrega as três famílias com font-display swap", () => {
    for (const familia of [
      "Schibsted Grotesk Variable",
      "Source Serif 4 Variable",
      "Azeret Mono Variable",
    ]) {
      expect(fontesCss).toContain(`"${familia}"`);
    }
    expect(fontesCss.match(/font-display:\s*swap/g)).toHaveLength(3);
  });

  it("usa apenas o subset latin", () => {
    expect(arquivos).toHaveLength(3);
    for (const arquivo of arquivos) {
      expect(arquivo).toContain("-latin-wght-normal.woff2");
      expect(arquivo).not.toMatch(/latin-ext|cyrillic|greek|vietnamese/);
    }
  });

  it("fica dentro do orçamento de 130 KB no primeiro carregamento", () => {
    const bytes = arquivos.reduce(
      (total, arquivo) => total + statSync(join(estilosDir, arquivo)).size,
      0,
    );
    expect(bytes).toBeLessThanOrEqual(130 * 1024);
  });

  it("declara fallbacks métricos para as três famílias", () => {
    for (const fallback of [
      "Grotesca Fallback",
      "Serifa Fallback",
      "Mono Fallback",
    ]) {
      const bloco = new RegExp(
        `@font-face\\s*{[^}]*"${fallback}"[^}]*}`,
        "s",
      ).exec(fontesCss)?.[0];
      if (!bloco) throw new Error(`Fallback ${fallback} ausente`);
      expect(bloco).toMatch(/size-adjust:\s*[\d.]+%/);
      expect(bloco).toMatch(/ascent-override:\s*[\d.]+%/);
      expect(bloco).toMatch(/descent-override:\s*[\d.]+%/);
    }
  });

  it("não faz requisição a CDN de fontes", () => {
    for (const css of [fontesCss, baseCss, tokensCss, globalCss]) {
      expect(css).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/);
    }
  });
});

describe("reset e base", () => {
  it("importa os três módulos antes das regras de componente", () => {
    const imports = globalCss.indexOf('@import "./base.css"');
    expect(globalCss.indexOf('@import "./tokens.css"')).toBe(0);
    expect(globalCss.indexOf('@import "./fontes.css"')).toBeLessThan(imports);
    expect(globalCss.indexOf("header,")).toBeGreaterThan(imports);
  });

  it("cobre box-sizing, mídia responsiva e a tipografia de corpo", () => {
    expect(baseCss).toMatch(/\*,\s*\*::before,\s*\*::after\s*{/);
    expect(baseCss).toMatch(/box-sizing:\s*border-box/);
    expect(baseCss).toMatch(/img,[\s\S]*max-width:\s*100%/);
    expect(baseCss).toMatch(
      /body\s*{[\s\S]*font-family:\s*var\(--fonte-leitura\)/,
    );
    expect(baseCss).toMatch(
      /h1,\s*h2,[\s\S]*font-family:\s*var\(--fonte-interface\)/,
    );
    expect(baseCss).toMatch(/::selection\s*{/);
  });

  it("pinta a seleção com o ciano lavado e a tinta, não com o ciano cheio", () => {
    const bloco = /::selection\s*{[^}]*}/.exec(baseCss)?.[0];
    expect(bloco).toContain("background: var(--foco-lavado)");
    expect(bloco).toContain("color: var(--tinta)");
    expect(bloco).not.toContain("background: var(--foco)");
  });

  it("não usa a serifa em navegação, tabela nem campo", () => {
    const bloco =
      /nav,\s*label,[\s\S]*?font-family:\s*var\(--fonte-interface\);/.exec(
        baseCss,
      );
    expect(bloco?.[0]).toContain("table");
    expect(bloco?.[0]).toContain("input");
  });

  it("mostra foco de 2 px ciano com afastamento e âncoras sob a barra", () => {
    expect(baseCss).toMatch(
      /:focus-visible\s*{[\s\S]*outline:\s*2px solid var\(--foco\)[\s\S]*outline-offset:\s*2px/,
    );
    expect(baseCss).toMatch(/scroll-margin-top:\s*calc\(/);
    expect(baseCss).toContain('[data-superficie="escura"] :focus-visible');
    expect(baseCss).not.toMatch(/footer\s*:focus-visible/);
  });

  it("desliga movimento e preserva bordas no alto contraste", () => {
    expect(baseCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*transition-duration:\s*0\.01ms !important/,
    );
    expect(baseCss).toMatch(
      /@media \(forced-colors: active\)[\s\S]*outline:\s*2px solid CanvasText/,
    );
  });
});
