import { indexarTarifas, type TarifasCuradas, UFS } from "../lib/tarifas.ts";
import { type CamposCustoControlados, UF_INFORMADA } from "./useCusto.ts";

/**
 * Os quatro campos da calculadora — UF, tarifa, horas e dias — usados tanto na
 * ficha (ticket 55) quanto no painel da comparação (ticket 56). É só a parte
 * visual: o estado, os handlers e a URL vêm do hook `useCusto`, e a tarifa de
 * referência da curadoria aparece aqui junto ao campo.
 */
export interface CamposCustoProps {
  campos: CamposCustoControlados;
  tarifas: TarifasCuradas;
  /** Prefixo dos `id` dos campos, para não colidir se duas ilhas dividem a página. */
  idPrefix?: string;
}

export default function CamposCusto({
  campos,
  tarifas,
  idPrefix = "calculadora",
}: CamposCustoProps) {
  const {
    estado,
    tarifaTexto,
    horasTexto,
    diasTexto,
    mudarUf,
    mudarTarifa,
    mudarHoras,
    mudarDias,
    normalizarTextos,
  } = campos;
  const id = (campo: string) => `${idPrefix}-${campo}`;
  const referencia =
    estado.uf === null ? undefined : indexarTarifas(tarifas).get(estado.uf);

  return (
    <div className="calculadora-campos">
      <label htmlFor={id("uf")}>Estado (UF)</label>
      <select
        id={id("uf")}
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

      <label htmlFor={id("tarifa")}>Tarifa (R$/kWh)</label>
      {/* Texto, não `number`: a tarifa é digitada em pt-BR, com vírgula. */}
      <input
        id={id("tarifa")}
        type="text"
        inputMode="decimal"
        value={tarifaTexto}
        onChange={(evento) => mudarTarifa(evento.target.value)}
        onBlur={normalizarTextos}
      />

      <label htmlFor={id("horas")}>Horas por dia</label>
      <input
        id={id("horas")}
        type="number"
        inputMode="decimal"
        min="0"
        max="24"
        step="0.5"
        value={horasTexto}
        onChange={(evento) => mudarHoras(evento.target.value)}
        onBlur={normalizarTextos}
      />

      <label htmlFor={id("dias")}>Dias por mês</label>
      <input
        id={id("dias")}
        type="number"
        inputMode="numeric"
        min="1"
        max="31"
        step="1"
        value={diasTexto}
        onChange={(evento) => mudarDias(evento.target.value)}
        onBlur={normalizarTextos}
      />

      {referencia === undefined ? null : (
        <p className="calculadora-referencia">
          Tarifa de referência de {referencia.nome} ({referencia.referencia}):{" "}
          {referencia.fonte}
        </p>
      )}
    </div>
  );
}
