import { useState } from "react";
import {
  calcularAssistente,
  formatarBtu,
  formatarNumero,
  type IncidenciaSolar,
  type RespostasAssistente,
  SOL,
  TAXAS_SOL,
} from "../lib/assistente.ts";

/**
 * Simulador do hero (ticket 93). É a promessa da home executada na primeira
 * tela: a pessoa move a área, escolhe a incidência de sol e vê a capacidade
 * comercial que o motor do Assistente calcula — com a conta aberta e a
 * quantidade real de Aparelhos naquela capacidade no catálogo.
 *
 * A ilha não calcula nada por conta própria: `calcularAssistente` é a mesma
 * função pura do Assistente (ADR-0020), e as contagens vêm do build. Sem
 * JavaScript, o HTML já traz o estado padrão (20 m², sol à tarde) com o
 * resultado e o link; a ilha só acrescenta a interação.
 */
const AREA_MINIMA = 8;
const AREA_MAXIMA = 60;
const AREA_PADRAO = 20;
const SOL_PADRAO: IncidenciaSolar = "tarde";

/** Rótulos curtos dos chips: o texto completo do Assistente não cabe aqui. */
const ROTULOS_SOL_CURTOS: Record<IncidenciaSolar, string> = {
  sem: "Sem sol",
  manha: "Manhã",
  tarde: "Tarde",
  "dia-todo": "Dia todo",
};

export interface ResumoDaCapacidade {
  /** Aparelhos com essa capacidade exata. */
  total: number;
  /** Quantos desses declararam Classe A em ao menos uma Variante. */
  classeA: number;
}

interface Props {
  /** Aparelhos e eficiência por capacidade comercial, calculados no build. */
  resumos: Record<string, ResumoDaCapacidade>;
}

function respostasPara(
  area: number,
  sol: IncidenciaSolar,
): RespostasAssistente {
  return {
    ambiente: "sala",
    area: { forma: "metros", area },
    sol,
    pessoas: "1",
    eletronicos: 0,
    lampadas: 0,
    janelas: 2,
  };
}

export default function SimuladorHero({ resumos }: Props) {
  const [area, setArea] = useState(AREA_PADRAO);
  const [sol, setSol] = useState<IncidenciaSolar>(SOL_PADRAO);

  const recomendacao = calcularAssistente(respostasPara(area, sol));
  const capacidade = recomendacao.capacidadeRecomendadaBtu ?? 60000;
  const resumo = resumos[String(capacidade)] ?? { total: 0, classeA: 0 };
  const href = `/aparelhos/?btu=${capacidade}`;
  const preenchimento =
    ((area - AREA_MINIMA) / (AREA_MAXIMA - AREA_MINIMA)) * 100;

  return (
    <section className="hero-simulador" aria-labelledby="hero-simulador-titulo">
      <div className="hero-simulador-controles">
        <h2 className="hero-simulador-rotulo" id="hero-simulador-titulo">
          Simule o seu ambiente
        </h2>

        <div className="hero-area">
          <div className="hero-area-topo">
            <label className="hero-area-rotulo" htmlFor="hero-area">
              Área
            </label>
            <output className="hero-area-valor" htmlFor="hero-area">
              {formatarNumero(area)} m²
            </output>
          </div>
          <div className="hero-area-trilho">
            <span
              className="hero-area-preenchimento"
              style={{ width: `${preenchimento}%` }}
              aria-hidden="true"
            />
            <input
              id="hero-area"
              className="hero-area-campo"
              type="range"
              min={AREA_MINIMA}
              max={AREA_MAXIMA}
              step={1}
              value={area}
              aria-valuetext={`${formatarNumero(area)} metros quadrados`}
              onChange={(evento) => setArea(Number(evento.target.value))}
            />
          </div>
          <div className="hero-area-limites" aria-hidden="true">
            <span>{AREA_MINIMA} m²</span>
            <span>{AREA_MAXIMA} m²</span>
          </div>
        </div>

        <fieldset className="hero-sol">
          <legend className="hero-sol-rotulo">Incidência de sol</legend>
          <div className="hero-sol-opcoes">
            {SOL.map((opcao) => (
              <button
                key={opcao}
                className="hero-sol-opcao"
                type="button"
                aria-pressed={sol === opcao}
                onClick={() => setSol(opcao)}
              >
                {ROTULOS_SOL_CURTOS[opcao]}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="hero-simulador-resultado" aria-live="polite">
        <p className="hero-simulador-etiqueta">
          Capacidade comercial recomendada
        </p>
        <p className="hero-simulador-leitura">
          <strong key={capacidade} className="hero-simulador-numero">
            {formatarBtu(capacidade)}
          </strong>
          <span className="hero-simulador-unidade">BTU/h</span>
        </p>
        <p className="hero-simulador-conta">
          {formatarNumero(area)} m² × {formatarBtu(TAXAS_SOL[sol])} BTU/h/m² ={" "}
          {formatarBtu(recomendacao.capacidadeCalculadaBtu)} BTU/h calculados —
          arredondados para {formatarBtu(capacidade)}.
        </p>
        <p className="hero-simulador-oferta">
          {formatarBtu(resumo.total)}{" "}
          {resumo.total === 1 ? "aparelho" : "aparelhos"} de{" "}
          {formatarBtu(capacidade)} BTU/h no catálogo,{" "}
          {formatarBtu(resumo.classeA)} com Classe A.
        </p>
        <div className="hero-simulador-acoes">
          <a className="botao botao-primario" href={href}>
            Ver esses aparelhos
          </a>
          <a className="botao botao-secundario" href="/aparelhos/">
            Explorar o catálogo
          </a>
        </div>
        <p className="hero-simulador-nota">
          Estimativa de mercado, não é cálculo de carga térmica.{" "}
          <a href="/assistente/">Ajustar os outros fatores no Assistente</a>
        </p>
      </div>
    </section>
  );
}
