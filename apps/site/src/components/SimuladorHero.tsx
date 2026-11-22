import { useState } from "react";
import {
  calcularAssistente,
  escreverEstadoAssistente,
  formatarBtu,
  formatarNumero,
  type IncidenciaSolar,
  type RespostasAssistente,
  SOL,
  TAXAS_SOL,
} from "../lib/assistente.ts";
import { caminhosDoIcone } from "../lib/icones.ts";

/**
 * Simulador do hero (tickets 93 e 104). É a promessa da home executada na
 * primeira tela: a pessoa move a área, escolhe a incidência de sol e vê a
 * capacidade comercial que o motor do Assistente calcula — com a conta aberta
 * e a quantidade real de Aparelhos naquela capacidade no catálogo.
 *
 * A ilha não calcula nada por conta própria: `calcularAssistente` é a mesma
 * função pura do Assistente (ADR-0020), e as contagens vêm do build. Sem
 * JavaScript, o HTML já traz o estado padrão (20 m², sol à tarde) com o
 * resultado e as ações; a ilha só acrescenta a interação.
 */
const AREA_MINIMA = 8;
const AREA_MAXIMA = 60;
const AREA_PADRAO = 20;
const SOL_PADRAO: IncidenciaSolar = "tarde";
const CAMINHOS_SOL = caminhosDoIcone("sol");
const CAMINHOS_SETA = caminhosDoIcone("seta-direita");

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

/** O Assistente lê o mesmo contrato `forma`/`area`/`sol` do resto do site. */
function hrefDoAssistente(area: number, sol: IncidenciaSolar): string {
  const busca = escreverEstadoAssistente({ forma: "metros", area, sol });
  return `/assistente/?${busca.toString()}`;
}

export default function SimuladorHero({ resumos }: Props) {
  const [area, setArea] = useState(AREA_PADRAO);
  const [sol, setSol] = useState<IncidenciaSolar>(SOL_PADRAO);

  const recomendacao = calcularAssistente(respostasPara(area, sol));
  const capacidade = recomendacao.capacidadeRecomendadaBtu ?? 60000;
  const resumo = resumos[String(capacidade)] ?? { total: 0, classeA: 0 };
  const hrefCatalogo = `/aparelhos/?btu=${capacidade}`;
  const preenchimento =
    ((area - AREA_MINIMA) / (AREA_MAXIMA - AREA_MINIMA)) * 100;

  return (
    <section
      id="simulador"
      className="hero-simulador"
      aria-labelledby="hero-simulador-titulo"
    >
      <div className="hero-simulador-controles">
        <div className="hero-simulador-cabecalho">
          <h2 className="hero-simulador-titulo" id="hero-simulador-titulo">
            Descubra quantos BTUs o seu ambiente precisa
          </h2>
          <p className="hero-simulador-apoio">
            A área e o sol já bastam para uma primeira estimativa.
          </p>
        </div>

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
          <legend className="hero-sol-rotulo">
            <svg
              className="icone"
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              {CAMINHOS_SOL.map((caminho) => (
                <path key={caminho} d={caminho} />
              ))}
            </svg>
            Incidência de sol
          </legend>
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
        <p className="hero-simulador-etiqueta">Capacidade recomendada</p>
        <p className="hero-simulador-leitura">
          <strong key={capacidade} className="hero-simulador-numero">
            {formatarBtu(capacidade)}
          </strong>
          <span className="hero-simulador-unidade">BTU/h</span>
        </p>
        <dl className="hero-simulador-calculo">
          <div>
            <dt>Área × sol</dt>
            <dd>
              {formatarNumero(area)} m² × {formatarBtu(TAXAS_SOL[sol])} BTU/h/m²
            </dd>
          </div>
          <div>
            <dt>Capacidade calculada</dt>
            <dd>{formatarBtu(recomendacao.capacidadeCalculadaBtu)} BTU/h</dd>
          </div>
          <div>
            <dt>Faixa comercial</dt>
            <dd>{formatarBtu(capacidade)} BTU/h</dd>
          </div>
        </dl>
        <p className="hero-simulador-contagem">
          {`${formatarBtu(resumo.total)} ${
            resumo.total === 1 ? "aparelho" : "aparelhos"
          } de ${formatarBtu(capacidade)} BTU/h · ${formatarBtu(
            resumo.classeA,
          )} com Classe A`}
        </p>
        <div className="hero-simulador-acoes">
          <a
            className="botao botao-primario"
            href={hrefDoAssistente(area, sol)}
          >
            Continuar no Assistente
            <svg
              className="icone"
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              {CAMINHOS_SETA.map((caminho) => (
                <path key={caminho} d={caminho} />
              ))}
            </svg>
          </a>
          <a className="botao botao-secundario" href={hrefCatalogo}>
            Ver aparelhos de {formatarBtu(capacidade)} BTU/h
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
