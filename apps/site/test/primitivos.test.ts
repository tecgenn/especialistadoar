import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  caminhosDoIcone,
  ICONES,
  type NomeDeIcone,
} from "../src/lib/icones.ts";
import {
  etiquetaDaClasse,
  idDaAjuda,
  idDoErro,
  idsDaDescricao,
} from "../src/lib/primitivos.ts";

const raiz = process.cwd();
const primitivosDir = join(raiz, "apps/site/src/components/primitivos");
const primitivosCss = readFileSync(
  join(raiz, "apps/site/src/styles/primitivos.css"),
  "utf8",
);
const globalCss = readFileSync(
  join(raiz, "apps/site/src/styles/global.css"),
  "utf8",
);

/** O bloco `{ … }` de um seletor simples, com o seletor que fecha nele. */
function bloco(css: string, seletor: string): string {
  const inicio = css.indexOf(`${seletor} {`);
  if (inicio === -1) throw new Error(`Seletor ausente: ${seletor}`);
  const fim = css.indexOf("}", inicio);
  return css.slice(inicio, fim + 1);
}

describe("etiqueta de Classe", () => {
  it("mostra a letra quando todas as Variantes têm a mesma Classe", () => {
    expect(etiquetaDaClasse(["A", "A", "A"])).toEqual({
      texto: "A",
      pior: "A",
      explicacao: "Classe energética A, declarada pelo INMETRO.",
    });
  });

  it("mostra a faixa da melhor à pior e usa o tom da pior", () => {
    expect(etiquetaDaClasse(["C", "A", "B"])).toEqual({
      texto: "A – C",
      pior: "C",
      explicacao: "Classes energéticas A a C entre as Variantes; a pior é C.",
    });
  });

  it("ignora a ordem, repetições e valores em branco", () => {
    expect(etiquetaDaClasse([" F ", "A", "", "A"])?.texto).toBe("A – F");
    expect(etiquetaDaClasse(["F", ""])?.pior).toBe("F");
  });

  it("sem Classe não há etiqueta", () => {
    expect(etiquetaDaClasse([])).toBeNull();
    expect(etiquetaDaClasse(["", "  "])).toBeNull();
  });

  it("recusa uma Classe fora de A–F em vez de inventar um tom", () => {
    expect(() => etiquetaDaClasse(["A", "G"])).toThrow(
      /Classe energética desconhecida/,
    );
  });
});

describe("descrições do campo", () => {
  it("associa ajuda e erro na ordem de leitura", () => {
    expect(idsDaDescricao("modelo", { ajuda: true, erro: true })).toBe(
      "modelo-ajuda modelo-erro",
    );
    expect(idsDaDescricao("modelo", { ajuda: true })).toBe("modelo-ajuda");
    expect(idsDaDescricao("modelo", { erro: true })).toBe("modelo-erro");
  });

  it("sem ajuda nem erro, o atributo não existe", () => {
    expect(idsDaDescricao("modelo", {})).toBeUndefined();
    expect(idDaAjuda("modelo")).toBe("modelo-ajuda");
    expect(idDoErro("modelo")).toBe("modelo-erro");
  });
});

describe("ícones", () => {
  it("resolve cada ícone em caminhos de <path>", () => {
    for (const nome of Object.keys(ICONES) as NomeDeIcone[]) {
      const caminhos = caminhosDoIcone(nome);
      expect(caminhos.length, nome).toBeGreaterThan(0);
      for (const caminho of caminhos) {
        expect(caminho, nome).toMatch(/^[Mm]/);
      }
    }
  });

  it("falha o build para um nome que não existe", () => {
    expect(() => caminhosDoIcone("estrela")).toThrow(/Ícone desconhecido/);
  });
});

describe("CSS dos primitivos", () => {
  it("entra no ponto único de entrada, depois da base", () => {
    expect(globalCss).toContain('@import "./primitivos.css";');
    expect(globalCss.indexOf('@import "./primitivos.css";')).toBeGreaterThan(
      globalCss.indexOf('@import "./base.css";'),
    );
  });

  it("dá 44 px e raio de 2 px ao botão, sem sombra em repouso", () => {
    const base = bloco(primitivosCss, ".botao");
    expect(base).toContain("min-height: 44px");
    expect(base).toContain("border-radius: var(--raio-xs)");
    expect(primitivosCss).not.toContain("box-shadow");
    expect(primitivosCss).not.toContain("999px");
  });

  it("define as três variantes com estados de hover, ativo e desabilitado", () => {
    expect(primitivosCss).toContain(".botao-primario:hover");
    expect(primitivosCss).toContain(".botao-secundario:hover");
    expect(primitivosCss).toContain(".botao-texto:hover");
    expect(primitivosCss).toContain(".botao-primario:active");
    expect(primitivosCss).toContain(".botao:disabled,");
    expect(primitivosCss).toContain("opacity: 0.45");
  });

  it("respeita prefers-reduced-motion no deslocamento do clique", () => {
    const guarda = primitivosCss.slice(
      primitivosCss.indexOf("@media (prefers-reduced-motion: no-preference)"),
    );
    expect(guarda).toContain(".botao-primario:active");
    expect(guarda).toContain("transform: translateY(1px)");
  });

  it("dá 44 px ao campo e à seta desenhada, com foco âmbar", () => {
    expect(bloco(primitivosCss, ".campo-entrada")).toContain(
      "min-height: 44px",
    );
    expect(primitivosCss).toContain("appearance: none");
    expect(bloco(primitivosCss, ".campo-entrada:focus-visible")).toContain(
      "outline: 2px solid var(--sinal)",
    );
    expect(bloco(primitivosCss, ".campo-seta")).toContain(
      "pointer-events: none",
    );
  });

  it("marca o erro com a cor da Classe F e mensagem visível", () => {
    expect(
      bloco(primitivosCss, '.campo[data-estado="erro"] .campo-entrada'),
    ).toContain("border-color: var(--classe-f)");
    expect(bloco(primitivosCss, ".campo-erro")).toContain(
      "color: var(--classe-f)",
    );
  });

  it("mantém o × do chip com alvo de 44 px e o chip sem pill", () => {
    const remover = bloco(primitivosCss, ".chip-remover");
    expect(remover).toContain("width: 44px");
    expect(remover).toContain("height: 44px");
    expect(bloco(primitivosCss, ".chip")).toContain(
      "border-radius: var(--raio-xs)",
    );
    expect(primitivosCss).toContain(
      '.chip[aria-pressed="true"],\n.chip-resumo[data-ativo]',
    );
  });

  it("pinta a etiqueta de Classe com fundo tonal a 10%", () => {
    const etiqueta = bloco(primitivosCss, ".etiqueta-classe");
    expect(etiqueta).toContain("background: color-mix(");
    expect(etiqueta).toContain("10%");
    for (const classe of ["A", "B", "C", "D", "E", "F"]) {
      expect(primitivosCss).toContain(
        `.etiqueta-classe[data-classe="${classe}"]`,
      );
    }
  });

  it("faz a leitura de dado sem caixa e a régua com hairline", () => {
    const leitura = bloco(primitivosCss, ".leitura");
    expect(leitura).toContain("border-top: 1px solid var(--linha)");
    expect(leitura).not.toContain("background");
    expect(leitura).not.toContain("box-shadow");
    expect(bloco(primitivosCss, ".regua-secao")).toContain(
      "border-top: 1px solid var(--linha)",
    );
  });

  it("esconde o texto de leitor de tela sem removê-lo da árvore", () => {
    expect(bloco(primitivosCss, ".apenas-leitor")).toContain("clip-path");
  });
});

describe("primitivos sem JavaScript de cliente", () => {
  const arquivos = readdirSync(primitivosDir).filter((nome) =>
    nome.endsWith(".astro"),
  );

  it("todo primitivo é um componente Astro", () => {
    expect(arquivos.length).toBeGreaterThanOrEqual(12);
  });

  it("nenhum primitivo hidrata, importa cliente ou injeta <script>", () => {
    for (const arquivo of arquivos) {
      const fonte = readFileSync(join(primitivosDir, arquivo), "utf8");
      expect(fonte, arquivo).not.toMatch(/client:/);
      expect(fonte, arquivo).not.toMatch(/<script/);
      expect(fonte, arquivo).not.toMatch(/from "react"/);
    }
  });
});
