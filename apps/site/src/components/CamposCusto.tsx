import { caminhosDoIcone } from "../lib/icones.ts";
import { indexarTarifas, type TarifasCuradas, UFS } from "../lib/tarifas.ts";
import { type CamposCustoControlados, UF_INFORMADA } from "./useCusto.ts";

/**
 * Os quatro campos da calculadora — UF, tarifa, horas e dias — usados tanto na
 * ficha (ticket 55) quanto no painel da comparação (ticket 56). É só a parte
 * visual: o estado, os handlers e a URL vêm do hook `useCusto`, e a tarifa de
 * referência da curadoria aparece aqui junto ao campo.
 *
 * O painel do ticket 77 usa o primitivo de campo do ticket 68 (mesmas classes
 * de `primitivos.css`): rótulo mono, unidade como sufixo decorativo, alvo de
 * 44 px, foco do sistema. O texto dos rótulos é o mesmo de antes — a unidade já
 * vem entre parênteses e o sufixo só repete o que falta na frase.
 */
export interface CamposCustoProps {
  campos: CamposCustoControlados;
  tarifas: TarifasCuradas;
  /** Prefixo dos `id` dos campos, para não colidir se duas ilhas dividem a página. */
  idPrefix?: string;
}

const SETA_BAIXO = caminhosDoIcone("seta-baixo");

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
      <div className="campo">
        <label className="campo-rotulo" htmlFor={id("uf")}>
          Estado (UF)
        </label>
        <div className="campo-controle">
          <select
            className="campo-entrada campo-select"
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
          <svg
            className="campo-seta"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            {SETA_BAIXO.map((caminho) => (
              <path key={caminho} d={caminho} />
            ))}
          </svg>
        </div>
      </div>

      <div className="campo">
        <label className="campo-rotulo" htmlFor={id("tarifa")}>
          Tarifa (R$/kWh)
        </label>
        <div className="campo-controle">
          {/* Texto, não `number`: a tarifa é digitada em pt-BR, com vírgula. */}
          <input
            className="campo-entrada"
            id={id("tarifa")}
            type="text"
            inputMode="decimal"
            value={tarifaTexto}
            onChange={(evento) => mudarTarifa(evento.target.value)}
            onBlur={normalizarTextos}
          />
        </div>
      </div>

      <div className="campo">
        <label className="campo-rotulo" htmlFor={id("horas")}>
          Horas por dia
        </label>
        <div className="campo-controle">
          <input
            className="campo-entrada"
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
          <span className="campo-sufixo" aria-hidden="true">
            h
          </span>
        </div>
      </div>

      <div className="campo">
        <label className="campo-rotulo" htmlFor={id("dias")}>
          Dias por mês
        </label>
        <div className="campo-controle">
          <input
            className="campo-entrada"
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
          <span className="campo-sufixo" aria-hidden="true">
            dias
          </span>
        </div>
      </div>

      {referencia === undefined ? null : (
        <p className="calculadora-referencia">
          Tarifa de referência de {referencia.nome} ({referencia.referencia}):{" "}
          {referencia.fonte}
        </p>
      )}
    </div>
  );
}
