import { useEffect, useState } from "react";
import {
  calcularCusto,
  type EstadoCusto,
  escreverEstadoCusto,
  type Faixa,
  formatarFaixa,
  formatarKwh,
  formatarReais,
  HORAS_ANO,
  lerEstadoCusto,
} from "../lib/custo.ts";
import {
  indexarTarifas,
  type TarifasCuradas,
  tarifaDaUf,
  UFS,
} from "../lib/tarifas.ts";

/**
 * A ilha da calculadora de custo de energia (ticket 55). Ela **não** calcula: a
 * aritmética, a faixa de Variantes e o contrato de URL vivem no módulo puro
 * `src/lib/custo.ts` (ADR-0022). Aqui só há campos, resultado e a conta aberta.
 *
 * O estado inteiro vive na URL (`uf`, `tarifa`, `horas`, `dias`), com a regra de
 * padrões do ADR-0019: São Paulo, 8 h/dia e 30 dias não aparecem no link e um
 * `?uf=SP&horas=8` é normalizado. Valor inválido cai no padrão em silêncio.
 */

/** As chaves da calculadora na querystring, iguais na ficha e na comparação. */
const CHAVES_CUSTO = ["uf", "tarifa", "horas", "dias"] as const;

/** A opção "Tarifa informada" do `<select>` de UF (URL: `uf=` vazia). */
const UF_INFORMADA = "";

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

/** A tarifa no campo, com a vírgula decimal do pt-BR. */
function textoDaTarifa(valor: number): string {
  return String(valor).replace(".", ",");
}

function numeroDoTexto(texto: string): number | undefined {
  const limpo = texto.trim().replace(",", ".");
  if (limpo === "") {
    return undefined;
  }
  const valor = Number(limpo);
  return Number.isFinite(valor) ? valor : undefined;
}

/** A faixa dos consumos anuais declarados, para a primeira linha da conta. */
function faixaDoConsumo(consumos: readonly number[]): Faixa {
  return {
    minimo: Math.min(...consumos),
    maximo: Math.max(...consumos),
  };
}

/**
 * Escreve a calculadora na URL sem apagar outras chaves da página. A regra de
 * padrões é a do módulo puro — o padrão exato fica fora do link.
 */
function escreverCustoNaUrl(
  estado: EstadoCusto,
  tarifas: TarifasCuradas,
): void {
  const busca = new URLSearchParams(window.location.search);
  for (const chave of CHAVES_CUSTO) {
    busca.delete(chave);
  }
  for (const [chave, valor] of escreverEstadoCusto(estado, tarifas)) {
    busca.set(chave, valor);
  }
  const consulta = busca.toString();
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${consulta === "" ? "" : `?${consulta}`}`,
  );
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
  const [estado, setEstado] = useState<EstadoCusto>(() =>
    lerEstadoCusto(new URLSearchParams(), tarifas),
  );
  const [tarifaTexto, setTarifaTexto] = useState(textoDaTarifa(estado.tarifa));
  const [horasTexto, setHorasTexto] = useState(String(estado.horas));
  const [diasTexto, setDiasTexto] = useState(String(estado.dias));

  useEffect(() => {
    const lerDaUrl = () => {
      const lido = lerEstadoCusto(
        new URLSearchParams(window.location.search),
        tarifas,
      );
      setEstado(lido);
      setTarifaTexto(textoDaTarifa(lido.tarifa));
      setHorasTexto(String(lido.horas));
      setDiasTexto(String(lido.dias));
      // Um link redundante ou torto (`?uf=SP&horas=8`, `?horas=99`) abre já
      // normalizado: o padrão não fica na URL.
      escreverCustoNaUrl(lido, tarifas);
    };
    lerDaUrl();
    window.addEventListener("popstate", lerDaUrl);
    return () => window.removeEventListener("popstate", lerDaUrl);
  }, [tarifas]);

  function atualizar(parcial: Partial<EstadoCusto>) {
    setEstado((anterior) => {
      const proximo = { ...anterior, ...parcial };
      escreverCustoNaUrl(proximo, tarifas);
      return proximo;
    });
  }

  function mudarUf(valor: string) {
    if (valor === UF_INFORMADA) {
      // "Tarifa informada": mantém o valor digitado e desliga a tarifa por UF.
      atualizar({ uf: null });
      return;
    }
    const tarifa = tarifaDaUf(tarifas, valor) ?? estado.tarifa;
    atualizar({ uf: valor, tarifa });
    setTarifaTexto(textoDaTarifa(tarifa));
  }

  function mudarTarifa(texto: string) {
    setTarifaTexto(texto);
    const valor = numeroDoTexto(texto);
    if (valor !== undefined && valor > 0) {
      atualizar({ tarifa: valor });
    }
  }

  function mudarHoras(texto: string) {
    setHorasTexto(texto);
    const valor = numeroDoTexto(texto);
    if (valor !== undefined && valor >= 0 && valor <= 24) {
      atualizar({ horas: valor });
    }
  }

  function mudarDias(texto: string) {
    setDiasTexto(texto);
    const valor = numeroDoTexto(texto);
    if (valor !== undefined && valor >= 1 && valor <= 31) {
      atualizar({ dias: valor });
    }
  }

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

  const referencia =
    estado.uf === null ? undefined : indexarTarifas(tarifas).get(estado.uf);
  const entradas = resultado.entradas;
  const consumoAnual = faixaDoConsumo(entradas.consumosAnuaisKwh);

  return (
    <div className="calculadora">
      <div className="calculadora-campos">
        <label htmlFor="calculadora-uf">Estado (UF)</label>
        <select
          id="calculadora-uf"
          value={estado.uf ?? UF_INFORMADA}
          onChange={(evento) => mudarUf(evento.target.value)}
        >
          {UFS.map(({ uf, nome }) => (
            <option key={uf} value={uf}>
              {nome} ({uf})
            </option>
          ))}
          <option value={UF_INFORMADA}>Tarifa informada</option>
        </select>

        <label htmlFor="calculadora-tarifa">Tarifa (R$/kWh)</label>
        {/* Texto, não `number`: a tarifa é digitada em pt-BR, com vírgula. */}
        <input
          id="calculadora-tarifa"
          type="text"
          inputMode="decimal"
          value={tarifaTexto}
          onChange={(evento) => mudarTarifa(evento.target.value)}
          onBlur={() => setTarifaTexto(textoDaTarifa(estado.tarifa))}
        />

        <label htmlFor="calculadora-horas">Horas por dia</label>
        <input
          id="calculadora-horas"
          type="number"
          inputMode="decimal"
          min="0"
          max="24"
          step="0.5"
          value={horasTexto}
          onChange={(evento) => mudarHoras(evento.target.value)}
          onBlur={() => setHorasTexto(String(estado.horas))}
        />

        <label htmlFor="calculadora-dias">Dias por mês</label>
        <input
          id="calculadora-dias"
          type="number"
          inputMode="numeric"
          min="1"
          max="31"
          step="1"
          value={diasTexto}
          onChange={(evento) => mudarDias(evento.target.value)}
          onBlur={() => setDiasTexto(String(estado.dias))}
        />

        {referencia === undefined ? null : (
          <p className="calculadora-referencia">
            Tarifa de referência de {referencia.nome} ({referencia.referencia}
            ): {referencia.fonte}
          </p>
        )}
      </div>

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
