import { spawnSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Seam de renderização dos primitivos (ticket 68): um build real do Astro sobre
 * o fixture `test/primitivos-fixture`, que não é uma rota do site. O teste olha
 * o HTML gerado — rótulos associados, `aria-describedby`, estados de erro,
 * seleção e desabilitado, e a ausência de qualquer ilha ou JavaScript.
 */

const siteDir = fileURLToPath(new URL("../", import.meta.url));
const fixtureDir = join(siteDir, "test", "primitivos-fixture");
const distDir = join(fixtureDir, "dist");

// O binário do Astro vem do pacote resolvido, como no seam de build do site.
const exigir = createRequire(import.meta.url);
const pacoteAstro = exigir.resolve("astro/package.json");
const binAstro = join(
  dirname(pacoteAstro),
  (JSON.parse(readFileSync(pacoteAstro, "utf8")) as { bin: { astro: string } })
    .bin.astro,
);

let html = "";

beforeAll(() => {
  rmSync(distDir, { recursive: true, force: true });
  const build = spawnSync(
    process.execPath,
    [binAstro, "build", "--root", fixtureDir],
    { cwd: siteDir, encoding: "utf8" },
  );
  if (build.status !== 0) {
    throw new Error(
      `Build do fixture dos primitivos falhou:\n${build.stdout}\n${build.stderr}`,
    );
  }
  html = readFileSync(join(distDir, "index.html"), "utf8");
}, 120_000);

afterAll(() => {
  rmSync(distDir, { recursive: true, force: true });
});

/** Todas as tags de abertura de um nome (`a`, `button`, `input`, …). */
function tags(nome: string): RegExpMatchArray[] {
  return [...html.matchAll(new RegExp(`<${nome}\\b[^>]*>`, "g"))];
}

function tag(seletor: RegExp): string {
  const achado = html.match(seletor)?.[0];
  if (!achado) throw new Error(`Tag ausente: ${seletor}`);
  return achado;
}

describe("renderização dos primitivos", () => {
  it("não cria ilha, hidratação nem JavaScript de cliente", () => {
    expect(html).not.toContain("astro-island");
    expect(html).not.toContain("<script");
    expect(html).not.toMatch(/client:/);
  });

  it("monta a página com o CSS do site, sem dependência nova", () => {
    expect(html).toMatch(/<link rel="stylesheet" href="\/_astro\/[^"]+\.css">/);
  });

  it("renderiza o botão nas três variantes, como ação e como link", () => {
    expect(html).toContain('class="botao botao-primario" href="/aparelhos/"');
    expect(html).toContain(
      'class="botao botao-secundario" href="/assistente/"',
    );
    expect(html).toContain('class="botao botao-texto" href="/comparar/"');
    expect(html).toContain(
      '<button class="botao botao-secundario" type="submit">',
    );
  });

  it("desabilita o botão e não transforma o link desabilitado em link", () => {
    expect(html).toMatch(
      /<button class="botao botao-primario" type="button" disabled>/,
    );
    expect(html).toContain('class="botao botao-primario botao-desabilitado"');
    expect(html).toMatch(/aria-disabled="true"/);
    expect(html).not.toMatch(/<a[^>]+botao-desabilitado/);
  });

  it("associa rótulo, ajuda e erro do campo ao controle", () => {
    expect(html).toContain('<label class="campo-rotulo" for="modelo">');
    expect(html).toContain('id="modelo"');
    expect(html).toContain('aria-describedby="modelo-ajuda modelo-erro"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('<p class="campo-erro" id="modelo-erro">');
    expect(html).toContain("Informe o modelo do aparelho.");
  });

  it("mostra a ajuda e a unidade do campo, sem erro quando não há erro", () => {
    expect(html).toContain('aria-describedby="capacidade-ajuda"');
    expect(html).not.toContain('id="capacidade-erro"');
    expect(html).toContain('<span class="campo-sufixo" aria-hidden="true">');
    expect(html).toContain("BTU/h");
  });

  it("desabilita o campo e mantém o valor declarado", () => {
    expect(html).toMatch(/id="marca"[^>]*value="Samsung"[^>]*disabled/);
  });

  it("mantém o select nativo com a seta desenhada e a opção marcada", () => {
    expect(html).toContain('class="campo-entrada campo-select"');
    expect(html).toContain('<option value="" selected>');
    expect(html).toContain('<option value="janela" selected>');
    expect(html).toMatch(
      /<svg class="icone campo-seta"[^>]*aria-hidden="true"/,
    );
    expect(html).toContain('<option value="cassete" disabled>');
  });

  it("liga o erro do select ao controle com a mensagem visível", () => {
    expect(html).toContain('aria-describedby="tipo-erro-erro"');
    expect(html).toMatch(/id="tipo-erro"[^>]*aria-invalid="true"/);
    expect(html).toContain("Tipo fora da base.");
  });

  it("marca o chip de filtro pela seleção e o de resumo pela remoção", () => {
    expect(html).toContain(
      '<button type="button" class="chip chip-filtro" aria-pressed="true">',
    );
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain(
      'class="chip-remover" href="/aparelhos/?tipo=split"',
    );
    expect(html).toContain('aria-label="Remover filtro Marca: Samsung"');
    expect(html).toContain('<button class="chip-remover" type="button"');
    expect(html).toContain('aria-label="Remover filtro Tensão: 220 V"');
  });

  it("mostra a Classe única, a faixa da pior Classe e nada sem Classe", () => {
    expect(html).toMatch(
      /<span class="etiqueta-classe" data-classe="A" title="Classe energética A/,
    );
    expect(html).toContain(
      '<span class="etiqueta-classe" data-classe="C" title="Classes energéticas A a C entre as Variantes; a pior é C.">',
    );
    expect(html).toContain('<span aria-hidden="true">A – C</span>');
    const etiquetas = html.match(/class="etiqueta-classe"/g) ?? [];
    expect(etiquetas).toHaveLength(2);
  });

  it("renderiza a leitura com rótulo, valor, unidade, legenda e link", () => {
    expect(html).toContain('<dl class="leitura">');
    expect(html).toContain('<dt class="leitura-rotulo">Consumo anual</dt>');
    expect(html).toContain('<a class="leitura-link" href="#consumo-e-custo">');
    expect(html).toContain('<span class="leitura-unidade">kWh/ano</span>');
    expect(html).toContain(
      '<dd class="leitura-legenda">Ciclo de referência de 2.080 h/ano.</dd>',
    );
  });

  it("mostra a régua de seção com e sem contagem", () => {
    expect(html).toContain(
      '<p class="regua-rotulo">Cobertura da base</p><p class="regua-contagem">2.227 aparelhos</p>',
    );
    expect(html).toMatch(/<p class="regua-rotulo">Sem contagem<\/p>\s*<\/div>/);
  });

  it("renderiza a trilha como nav rotulado com a página atual no fim", () => {
    const trilha = tag(/<nav class="trilha"[^>]*>/);
    expect(trilha).toContain('aria-label="Trilha de navegação"');
    expect(html).toContain('<a href="/aparelhos/">Aparelhos</a>');
    expect(html).toContain(
      '<span aria-current="page">Samsung — WindFree AI Pro</span>',
    );
  });

  it("renderiza o aviso como nota, com e sem rótulo", () => {
    expect(html).toContain('class="aviso aviso-sinal" role="note"');
    expect(html).toContain('class="aviso aviso-frio" role="note"');
    expect(html).toContain("O custo é estimativa, não um Valor oficial.");
  });

  it("renderiza o estado vazio com frase e ação, e sem ação", () => {
    expect(html).toContain(
      '<p class="estado-vazio-titulo">Nenhum aparelho neste recorte</p>',
    );
    expect(html).toContain('<div class="estado-vazio-acao">');
    expect(html).toContain(
      '<a class="botao botao-primario" href="/aparelhos/">Limpar filtros</a>',
    );
    expect(html).toContain(
      '<p class="estado-vazio-frase">Este Aparelho não traz o dado do INMETRO, então não há o que calcular.</p>',
    );
  });

  it("desenha todo ícone em SVG inline, decorativo, com traço de 1,5 px", () => {
    const svgs = tags("svg");
    expect(svgs.length).toBeGreaterThan(4);
    for (const svg of svgs) {
      expect(svg[0]).toContain('aria-hidden="true"');
      expect(svg[0]).toContain('focusable="false"');
      expect(svg[0]).toContain('stroke-width="1.5"');
      expect(svg[0]).toContain('stroke="currentColor"');
      expect(svg[0]).toContain('fill="none"');
      expect(svg[0]).toContain('viewBox="0 0 24 24"');
    }
  });
});
