import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type {
  Aparelho,
  ItemConsulta,
  Manifest,
  VersaoDaTabela,
} from "@especialista-do-ar/pipeline";
import { versaoAtualDo } from "@especialista-do-ar/pipeline";
import { describe, expect, it } from "vitest";
import { criarConsulta } from "../src/consulta.ts";

/**
 * Portão da Fase 2 (ticket #10): verifica o **gabarito** do teste de aceitação
 * contra a base servida real (`data/build/`). O gabarito não pode ficar velho
 * nem divergir dos artefatos: cada resposta esperada é reconferida aqui, e o CI
 * já garante que `data/build/` bate com um `pnpm build` novo.
 *
 * O gabarito é insumo do portão; as perguntas entregues ao Agente vivem em
 * `docs/aceitacao/perguntas.md` (sem o gabarito). Ver `docs/aceitacao/portao-fase-2.md`.
 */

const raiz = fileURLToPath(new URL("../../../", import.meta.url));

function lerJson<T>(caminho: string): T {
  return JSON.parse(readFileSync(`${raiz}${caminho}`, "utf8")) as T;
}

function lerJsonl<T>(caminho: string): T[] {
  const bruto = readFileSync(`${raiz}${caminho}`, "utf8").trim();
  return bruto === ""
    ? []
    : bruto.split("\n").map((linha) => JSON.parse(linha) as T);
}

type Verificacao =
  | {
      tipo: "manifest";
      campo: "obtidoEm" | "contagemLinhas" | "arquivo" | "origem" | "hash";
      esperado: unknown;
    }
  | { tipo: "contagem-aparelhos"; esperado: number }
  | { tipo: "contagem-anomalias"; esperado: number }
  | { tipo: "campo-aparelho"; id: string; caminho: string; esperado: unknown }
  | {
      tipo: "contagem-consulta";
      filtros: {
        marca?: string;
        tipo?: string;
        btu?: number;
        tensao?: number;
        variasTensoes?: boolean;
      };
      esperado: number;
    }
  | { tipo: "campo-consulta"; id: string; caminho: string; esperado: unknown }
  | {
      tipo: "valor-calculado";
      id: string;
      tarifa: number;
      esperadoConsumoKwh: number;
      esperadoFormula: string;
    }
  | {
      tipo: "anomalia";
      linha: number;
      campo: string;
      valor: string;
      tipoAnomalia: string;
    };

interface Pergunta {
  id: number;
  resposta: string;
  verificacoes: Verificacao[];
}

interface Gabarito {
  perguntas: Pergunta[];
}

const gabarito = lerJson<Gabarito>("docs/aceitacao/gabarito.json");
const manifest = lerJson<Manifest>("data/build/manifest.json");
const aparelhos = lerJson<Aparelho[]>("data/build/aparelhos.json");
const consulta = lerJson<ItemConsulta[]>("data/build/consulta.json");
const anomalias = lerJsonl<{
  linha: number;
  campo: string;
  valor: string;
  tipo: string;
}>(`data/build/anomalias.jsonl`);

const versao = versaoAtualDo(manifest) as VersaoDaTabela;

/** O módulo de consulta isomórfico — o mesmo que um Agente usa sobre `consulta.json`. */
const consultaModulo = criarConsulta(consulta);

/** Resolve um caminho com pontos (`registros.0.numero`) num objeto aninhado. */
function emCaminho(objeto: unknown, caminho: string): unknown {
  return caminho.split(".").reduce<unknown>((atual, chave) => {
    if (atual === null || atual === undefined) {
      return undefined;
    }
    return (atual as Record<string, unknown>)[chave];
  }, objeto);
}

function aparelhoPorId(id: string): Aparelho | undefined {
  return aparelhos.find((aparelho) => aparelho.id === id);
}

function itemPorId(id: string): ItemConsulta | undefined {
  return consulta.find((item) => item.id === id);
}

function contagemConsulta(filtros: {
  marca?: string;
  tipo?: string;
  btu?: number;
  tensao?: number;
  variasTensoes?: boolean;
}): number {
  // Os filtros por campo vêm do módulo isomórfico real (o mesmo que um Agente
  // usa sobre `consulta.json`), para o gabarito ser conferido com a semântica
  // que o consumidor de fato tem — não com uma reimplementação paralela.
  const porCampo = consultaModulo.filtrar({
    marca: filtros.marca,
    tipo: filtros.tipo,
    btu: filtros.btu,
    tensao: filtros.tensao,
  });
  if (filtros.variasTensoes === undefined) {
    return porCampo.length;
  }
  // `variasTensoes` não é filtro do módulo: bivolt é derivado do dataset.
  return porCampo.filter(
    (item) => item.tensoes.length > 1 === filtros.variasTensoes,
  ).length;
}

describe("Portão da Fase 2 — gabarito do teste de aceitação", () => {
  it("o gabarito tem 10 perguntas, cada uma com resposta e verificações", () => {
    expect(gabarito.perguntas).toHaveLength(10);
    for (const pergunta of gabarito.perguntas) {
      expect(pergunta.resposta.trim()).not.toBe("");
      expect(pergunta.verificacoes.length).toBeGreaterThan(0);
    }
  });

  it("cada verificação do gabarito bate com a base servida", () => {
    for (const pergunta of gabarito.perguntas) {
      for (const verificacao of pergunta.verificacoes) {
        const rotulo = `pergunta #${pergunta.id} (${verificacao.tipo})`;
        switch (verificacao.tipo) {
          case "manifest": {
            expect(emCaminho(versao, verificacao.campo), rotulo).toEqual(
              verificacao.esperado,
            );
            break;
          }
          case "contagem-aparelhos": {
            expect(aparelhos.length, rotulo).toBe(verificacao.esperado);
            break;
          }
          case "contagem-anomalias": {
            expect(anomalias.length, rotulo).toBe(verificacao.esperado);
            break;
          }
          case "campo-aparelho": {
            const aparelho = aparelhoPorId(verificacao.id);
            expect(aparelho, rotulo).toBeDefined();
            expect(
              emCaminho(aparelho, verificacao.caminho),
              `${rotulo}: ${verificacao.id}.${verificacao.caminho}`,
            ).toEqual(verificacao.esperado);
            break;
          }
          case "contagem-consulta": {
            expect(contagemConsulta(verificacao.filtros), rotulo).toBe(
              verificacao.esperado,
            );
            break;
          }
          case "campo-consulta": {
            const item = itemPorId(verificacao.id);
            expect(item, rotulo).toBeDefined();
            expect(
              emCaminho(item, verificacao.caminho),
              `${rotulo}: ${verificacao.id}.${verificacao.caminho}`,
            ).toEqual(verificacao.esperado);
            break;
          }
          case "valor-calculado": {
            // A rota dinâmica (/api/v1/valor-calculado) não é chamada aqui: a
            // suíte é offline. O que este teste garante é que o **dado de
            // entrada** do cálculo (o consumo anual oficial) e a fórmula citada
            // no gabarito estão corretos; o comportamento da rota (fórmula,
            // entradas e aviso devolvidos) é coberto por
            // `packages/worker/test/rotas.test.ts` e exercitado na rodada real
            // do portão (ver `docs/aceitacao/portao-fase-2.md`).
            const aparelho = aparelhoPorId(verificacao.id);
            expect(aparelho, rotulo).toBeDefined();
            const consumos = aparelho?.variantes
              .map((variante) => variante.dados.consumoAnualKwh)
              .filter((consumo): consumo is number => consumo !== null);
            expect(consumos, rotulo).toContain(verificacao.esperadoConsumoKwh);
            const valor = verificacao.esperadoConsumoKwh * verificacao.tarifa;
            // A resposta citada no gabarito precisa trazer o valor calculado e a fórmula.
            expect(pergunta.resposta, rotulo).toContain(
              valor.toFixed(2).replace(".", ","),
            );
            expect(pergunta.resposta, rotulo).toContain(
              verificacao.esperadoFormula,
            );
            break;
          }
          case "anomalia": {
            const anomalia = anomalias.find(
              (candidata) => candidata.linha === verificacao.linha,
            );
            expect(anomalia, rotulo).toMatchObject({
              campo: verificacao.campo,
              valor: verificacao.valor,
              tipo: verificacao.tipoAnomalia,
            });
            break;
          }
        }
      }
    }
  });
});
