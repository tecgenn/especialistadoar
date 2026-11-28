import {
  calcularCusto,
  type Faixa,
  formatarFaixa,
  formatarKwh,
  formatarReais,
  HORAS_ANO,
} from "../lib/custo.ts";
import type { TarifasCuradas } from "../lib/tarifas.ts";
import CamposCusto from "./CamposCusto.tsx";
import { useCusto } from "./useCusto.ts";

/**
 * A ilha da calculadora de custo de energia na ficha (ticket 55) e o painel de
 * instrumento do ticket 77. Ela **não** calcula: a aritmética, a faixa de
 * Variantes e o contrato de URL vivem no módulo puro `src/lib/custo.ts`
 * (ADR-0022). Aqui só há o painel — campos à esquerda, a leitura do custo
 * mensal à direita com os dois fatores, a conta aberta em mono numerado e o
 * aviso de estimativa; os quatro campos vêm do `CamposCusto`, compartilhado com
 * a comparação (56).
 *
 * O estado inteiro vive na URL (`uf`, `tarifa`, `horas`, `dias`), com a regra de
 * padrões do ADR-0019: São Paulo, 8 h/dia e 30 dias não aparecem no link e um
 * `?uf=SP&horas=8` é normalizado. Valor inválido cai no padrão em silêncio.
 */

const NUMERO = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

const TARIFA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});

/** R$ 0,846/kWh — a tarifa com a precisão da curadoria, sempre com unidade. */
function formatarTarifa(valor: number): string {
  return `${TARIFA.format(valor).replace(/\u00a0/g, " ")}/kWh`;
}

function formatarHoras(valor: number): string {
  return NUMERO.format(valor);
}

/** A faixa dos consumos anuais declarados, para a primeira linha da conta. */
function faixaDoConsumo(consumos: readonly number[]): Faixa {
  return {
    minimo: Math.min(...consumos),
    maximo: Math.max(...consumos),
  };
}

interface PassoDaConta {
  rotulo: string;
  valor: string;
}

interface CalculadoraCustoProps {
  /** O consumo anual (kWh/ano) de cada Variante com dado declarado. */
  consumosAnuaisKwh: number[];
  tarifas: TarifasCuradas;
}

export default function CalculadoraCusto({
  consumosAnuaisKwh,
  tarifas,
}: CalculadoraCustoProps) {
  const campos = useCusto(tarifas);
  const { estado } = campos;

  const resultado =
    consumosAnuaisKwh.length === 0
      ? null
      : calcularCusto({
          consumosAnuaisKwh,
          tarifa: estado.tarifa,
          horas: estado.horas,
          dias: estado.dias,
        });

  // Sem consumo declarado não há conta: o painel mantém a leitura com um
  // travessão e explica a ausência no lugar dos campos (o mesmo estado vazio de
  // antes, agora com a forma do painel). Nenhum valor é inventado.
  if (resultado === null) {
    return (
      <div className="calculadora calculadora-sem-dados">
        <div className="calculadora-resultado">
          <p className="calculadora-rotulo">Custo estimado por mês</p>
          <p className="calculadora-principal calculadora-travessao">
            <span aria-hidden="true">—</span>
          </p>
          <p className="calculadora-explicacao">
            Este Aparelho não declara consumo anual no INMETRO, então não há
            como estimar o custo de energia.
          </p>
        </div>
      </div>
    );
  }

  const entradas = resultado.entradas;
  const consumoAnual = faixaDoConsumo(entradas.consumosAnuaisKwh);

  const passos: PassoDaConta[] = [
    {
      rotulo: "Consumo INMETRO",
      valor: `${formatarFaixa(consumoAnual, formatarKwh)} por ano`,
    },
    {
      rotulo: "Consumo por hora",
      valor: `${formatarFaixa(resultado.consumoPorHoraKwh, formatarKwh)} (÷ ${formatarHoras(HORAS_ANO)} h/ano)`,
    },
    {
      rotulo: "Uso informado",
      valor: `${formatarHoras(entradas.horas)} h/dia × ${formatarHoras(entradas.dias)} dias`,
    },
    {
      rotulo: "Consumo mensal",
      valor: formatarFaixa(resultado.consumoMensalKwh, formatarKwh),
    },
    { rotulo: "Tarifa", valor: formatarTarifa(entradas.tarifa) },
    {
      rotulo: "Custo mensal",
      valor: formatarFaixa(resultado.custoMensal, formatarReais),
    },
  ];

  return (
    <div className="calculadora">
      <CamposCusto campos={campos} tarifas={tarifas} />

      <div
        className="calculadora-resultado"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="calculadora-rotulo">Custo estimado por mês</p>
        <p className="calculadora-principal">
          {formatarFaixa(resultado.custoMensal, formatarReais)}
        </p>

        <dl className="calculadora-fatores">
          <div>
            <dt>Custo estimado por ano</dt>
            <dd>{formatarFaixa(resultado.custoAnual, formatarReais)}</dd>
          </div>
          <div>
            <dt>Consumo estimado por mês</dt>
            <dd>{formatarFaixa(resultado.consumoMensalKwh, formatarKwh)}</dd>
          </div>
        </dl>

        <h3 className="calculadora-conta-titulo">A conta aberta</h3>
        <ol className="calculadora-conta">
          {passos.map((passo) => (
            <li key={passo.rotulo}>
              <span className="calculadora-passo-rotulo">{passo.rotulo}</span>
              <span className="calculadora-passo-valor">{passo.valor}</span>
            </li>
          ))}
        </ol>

        <p className="calculadora-aviso">
          Estimativa calculada com as entradas informadas por você, a partir do
          consumo declarado no INMETRO. Não é um Valor oficial nem uma promessa
          de economia: a sua conta depende da distribuidora, dos tributos e do
          uso real.
        </p>
      </div>
    </div>
  );
}
