import { useEffect, useState } from "react";
import {
  type EstadoCusto,
  escreverEstadoCusto,
  lerEstadoCusto,
} from "../lib/custo.ts";
import { type TarifasCuradas, tarifaDaUf } from "../lib/tarifas.ts";
import { caminhoComBusca, mesclarChaves } from "../lib/url.ts";

/**
 * O estado dos quatro campos da calculadora, compartilhado pela ficha
 * (`CalculadoraCusto`) e pela comparação (`Comparar`) — ticket 56. Toda a
 * aritmética e o contrato de URL continuam no módulo puro `src/lib/custo.ts`
 * (ADR-0022); aqui só vive o que é estado de ilha: os textos digitados, a leitura
 * e a escrita na URL.
 *
 * As chaves da calculadora são escritas com `mesclarChaves`, para não apagar
 * `?ids=` da comparação (e qualquer outra chave da página).
 */

/** As chaves da calculadora na querystring, iguais na ficha e na comparação. */
export const CHAVES_CUSTO = ["uf", "tarifa", "horas", "dias"] as const;

/** A opção "Tarifa informada" do `<select>` de UF (URL: `uf=` vazia). */
export const UF_INFORMADA = "";

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

/** Escreve a calculadora na URL sem apagar as outras chaves da página. */
function escreverCustoNaUrl(
  estado: EstadoCusto,
  tarifas: TarifasCuradas,
): void {
  const busca = mesclarChaves(
    new URLSearchParams(window.location.search),
    CHAVES_CUSTO,
    escreverEstadoCusto(estado, tarifas),
  );
  window.history.replaceState(
    null,
    "",
    caminhoComBusca(window.location.pathname, busca),
  );
}

export interface CamposCustoControlados {
  /** O estado já interpretado (o que a aritmética consome). */
  estado: EstadoCusto;
  /** Os textos dos campos, para inputs controlados em pt-BR. */
  tarifaTexto: string;
  horasTexto: string;
  diasTexto: string;
  /** Handlers dos quatro campos. */
  mudarUf: (valor: string) => void;
  mudarTarifa: (texto: string) => void;
  mudarHoras: (texto: string) => void;
  mudarDias: (texto: string) => void;
  /** Volta os textos ao último estado válido (usado no `onBlur`). */
  normalizarTextos: () => void;
}

export function useCusto(tarifas: TarifasCuradas): CamposCustoControlados {
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

  function normalizarTextos() {
    setTarifaTexto(textoDaTarifa(estado.tarifa));
    setHorasTexto(String(estado.horas));
    setDiasTexto(String(estado.dias));
  }

  return {
    estado,
    tarifaTexto,
    horasTexto,
    diasTexto,
    mudarUf,
    mudarTarifa,
    mudarHoras,
    mudarDias,
    normalizarTextos,
  };
}
