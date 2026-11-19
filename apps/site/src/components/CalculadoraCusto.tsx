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
 * A ilha da calculadora de custo de energia na ficha (ticket 55). Ela **não**
 * calcula: a aritmética, a faixa de Variantes e o contrato de URL vivem no módulo
 * puro `src/lib/custo.ts` (ADR-0022). Aqui só há o resultado e a conta aberta;
 * os quatro campos vêm do `CamposCusto`, compartilhado com a comparação (56).
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

  if (resultado === null) {
    return (
      <p className="calculadora-sem-dados">
        Este Aparelho não declara consumo anual no INMETRO, então não há como
        estimar o custo de energia.
      </p>
    );
  }

  const entradas = resultado.entradas;
  const consumoAnual = faixaDoConsumo(entradas.consumosAnuaisKwh);

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
        <p className="calculadora-secundario">
          Custo estimado por ano:{" "}
          {formatarFaixa(resultado.custoAnual, formatarReais)}
        </p>
        <p className="calculadora-secundario">
          Consumo estimado:{" "}
          {formatarFaixa(resultado.consumoMensalKwh, formatarKwh)} por mês
        </p>

        <h3 className="calculadora-conta-titulo">A conta aberta</h3>
        <ol className="calculadora-conta">
          <li>
            Consumo INMETRO: {formatarFaixa(consumoAnual, formatarKwh)} por ano
          </li>
          <li>
            Consumo por hora:{" "}
            {formatarFaixa(resultado.consumoPorHoraKwh, formatarKwh)} (÷{" "}
            {formatarHoras(HORAS_ANO)} h/ano)
          </li>
          <li>
            Uso informado: {formatarHoras(entradas.horas)} h/dia ×{" "}
            {formatarHoras(entradas.dias)} dias
          </li>
          <li>
            Consumo mensal:{" "}
            {formatarFaixa(resultado.consumoMensalKwh, formatarKwh)}
          </li>
          <li>Tarifa: {formatarTarifa(entradas.tarifa)}</li>
          <li>
            Custo mensal: {formatarFaixa(resultado.custoMensal, formatarReais)}
          </li>
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
