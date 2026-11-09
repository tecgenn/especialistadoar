import { useEffect, useRef, useState } from "react";
import {
  AMBIENTES,
  AREA_POR_REFERENCIA,
  calcularAssistente,
  DESCRICOES_AMBIENTE,
  type EstadoAssistente,
  escreverEstadoAssistente,
  etapaInicial,
  FAIXAS_PESSOAS,
  type FaixaPessoas,
  FORMAS_AREA,
  type FormaAreaNome,
  formatarBtu,
  formatarNumero,
  lerEstadoAssistente,
  REFERENCIAS,
  type ReferenciaArea,
  type RespostasAssistente,
  ROTULOS_AMBIENTE,
  ROTULOS_CONFIANCA,
  ROTULOS_PESSOAS,
  ROTULOS_REFERENCIA,
  ROTULOS_SOL,
  respostasDe,
  SOL_RESPOSTAS,
  type SolResposta,
} from "../lib/assistente.ts";

/**
 * A ilha do Assistente (ticket 41). Ela **não calcula**: coleta respostas,
 * conduz cinco telas e renderiza a Recomendação do Assistente vinda do módulo
 * puro `src/lib/assistente.ts`. O estado inteiro vive na URL, então recarregar e
 * compartilhar preservam o resultado (mesmo contrato da consulta, ADR-0008/0019).
 */
const TOTAL_ETAPAS = 5;

const TITULOS: Record<number, string> = {
  0: "Onde você vai usar o ar-condicionado?",
  1: "Qual é o tamanho do ambiente?",
  2: "Como é a incidência de sol?",
  3: "Quantas pessoas usam o ambiente?",
  4: "O que mais gera calor no ambiente?",
  5: "Sua capacidade recomendada",
};

function CartaoEscolha({
  titulo,
  descricao,
  ativo,
  aoEscolher,
}: {
  titulo: string;
  descricao?: string;
  ativo: boolean;
  aoEscolher: () => void;
}) {
  return (
    <button
      type="button"
      className="assistente-cartao"
      aria-pressed={ativo}
      onClick={aoEscolher}
    >
      <span className="assistente-cartao-titulo">{titulo}</span>
      {descricao === undefined ? null : (
        <span className="assistente-cartao-descricao">{descricao}</span>
      )}
    </button>
  );
}

function Contador({
  rotulo,
  valor,
  aoMenos,
  aoMais,
}: {
  rotulo: string;
  valor: number;
  aoMenos: () => void;
  aoMais: () => void;
}) {
  return (
    <div className="assistente-contador">
      <span className="assistente-contador-rotulo">{rotulo}</span>
      <div className="assistente-contador-botoes">
        <button
          type="button"
          aria-label={`Menos ${rotulo.toLowerCase()}`}
          onClick={aoMenos}
        >
          −
        </button>
        <span className="assistente-contador-valor" aria-live="polite">
          {valor}
        </span>
        <button
          type="button"
          aria-label={`Mais ${rotulo.toLowerCase()}`}
          onClick={aoMais}
        >
          +
        </button>
      </div>
    </div>
  );
}

function numeroDoTexto(texto: string): number | undefined {
  const limpo = texto.trim().replace(",", ".");
  if (limpo === "") {
    return undefined;
  }
  const valor = Number(limpo);
  return Number.isFinite(valor) ? valor : undefined;
}

export default function Assistente() {
  const [estado, setEstado] = useState<EstadoAssistente>({});
  const [tela, setTela] = useState(0);
  const [formArea, setFormArea] = useState<FormaAreaNome>("metros");
  const [areaTexto, setAreaTexto] = useState("");
  const [larguraTexto, setLarguraTexto] = useState("");
  const [comprimentoTexto, setComprimentoTexto] = useState("");
  const [erroArea, setErroArea] = useState<string | null>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const primeiraRenderizacao = useRef(true);

  useEffect(() => {
    const lerDaUrl = () => {
      const lido = lerEstadoAssistente(
        new URLSearchParams(window.location.search),
      );
      setEstado(lido);
      setTela(etapaInicial(lido));
      setFormArea(lido.forma ?? "metros");
      setAreaTexto(lido.area === undefined ? "" : String(lido.area));
      setLarguraTexto(lido.largura === undefined ? "" : String(lido.largura));
      setComprimentoTexto(
        lido.comprimento === undefined ? "" : String(lido.comprimento),
      );
      setErroArea(null);
    };
    lerDaUrl();
    window.addEventListener("popstate", lerDaUrl);
    return () => window.removeEventListener("popstate", lerDaUrl);
  }, []);

  // O foco precisa acompanhar a troca de tela, mesmo sem ler `tela` no corpo.
  // Na primeira renderização não roubamos o foco de quem acabou de abrir a página.
  // biome-ignore lint/correctness/useExhaustiveDependencies: foco por troca de etapa
  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    tituloRef.current?.focus();
  }, [tela]);

  function atualizar(parcial: Partial<EstadoAssistente>) {
    setEstado((anterior) => {
      const proximo = { ...anterior, ...parcial };
      const busca = escreverEstadoAssistente(proximo).toString();
      const url = `${window.location.pathname}${busca === "" ? "" : `?${busca}`}`;
      window.history.replaceState(null, "", url);
      return proximo;
    });
  }

  function escolherAmbiente(ambiente: (typeof AMBIENTES)[number]) {
    atualizar({ ambiente });
    setTela(1);
  }

  function continuarArea() {
    if (formArea === "metros") {
      const area = numeroDoTexto(areaTexto);
      if (area === undefined || area <= 0) {
        setErroArea("Informe uma área maior que zero.");
        return;
      }
      setErroArea(null);
      atualizar({
        forma: "metros",
        area,
        largura: undefined,
        comprimento: undefined,
        referencia: undefined,
      });
      setTela(2);
      return;
    }

    if (formArea === "dimensoes") {
      const largura = numeroDoTexto(larguraTexto);
      const comprimento = numeroDoTexto(comprimentoTexto);
      if (
        largura === undefined ||
        largura <= 0 ||
        comprimento === undefined ||
        comprimento <= 0
      ) {
        setErroArea("Informe largura e comprimento maiores que zero.");
        return;
      }
      setErroArea(null);
      atualizar({
        forma: "dimensoes",
        largura,
        comprimento,
        area: undefined,
        referencia: undefined,
      });
      setTela(2);
    }
  }

  function escolherReferencia(referencia: ReferenciaArea) {
    setErroArea(null);
    atualizar({
      forma: "referencia",
      referencia,
      area: undefined,
      largura: undefined,
      comprimento: undefined,
    });
    setTela(2);
  }

  function escolherSol(sol: SolResposta) {
    atualizar({ sol });
    setTela(3);
  }

  function escolherPessoas(pessoas: FaixaPessoas) {
    atualizar({ pessoas });
    setTela(4);
  }

  function ajustarContagem(
    campo: "eletronicos" | "lampadas" | "janelas",
    delta: number,
  ) {
    const valor = Math.max(0, (estado[campo] ?? 0) + delta);
    if (campo === "eletronicos") {
      atualizar({ eletronicos: valor });
    } else if (campo === "lampadas") {
      atualizar({ lampadas: valor });
    } else {
      atualizar({ janelas: valor });
    }
  }

  function verResultado() {
    atualizar({
      eletronicos: estado.eletronicos ?? 0,
      lampadas: estado.lampadas ?? 0,
      janelas: estado.janelas ?? 0,
    });
    setTela(5);
  }

  function voltar() {
    setTela((atual) => (atual === 5 ? 4 : Math.max(0, atual - 1)));
  }

  function recomecar() {
    setEstado({});
    setTela(0);
    setFormArea("metros");
    setAreaTexto("");
    setLarguraTexto("");
    setComprimentoTexto("");
    setErroArea(null);
    window.history.replaceState(null, "", window.location.pathname);
  }

  const respostas: RespostasAssistente | null = respostasDe(estado);
  const recomendacao =
    respostas === null ? null : calcularAssistente(respostas);
  const etapa = tela === TOTAL_ETAPAS ? TOTAL_ETAPAS : tela + 1;
  const percentual = (etapa / TOTAL_ETAPAS) * 100;

  return (
    <section className="assistente">
      <div className="assistente-progresso">
        <div
          className="assistente-progresso-trilha"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={TOTAL_ETAPAS}
          aria-valuenow={etapa}
          aria-valuetext={
            tela === TOTAL_ETAPAS ? "Resultado" : `Etapa ${etapa} de 5`
          }
          aria-labelledby="assistente-progresso-rotulo"
        >
          <span style={{ width: `${percentual}%` }} />
        </div>
        <p
          id="assistente-progresso-rotulo"
          className="assistente-progresso-texto"
        >
          {tela === TOTAL_ETAPAS ? "Resultado" : `Etapa ${etapa} de 5`}
        </p>
      </div>

      <h2 ref={tituloRef} tabIndex={-1} className="assistente-titulo">
        {TITULOS[tela]}
      </h2>

      {tela === 0 ? (
        <div className="assistente-cartoes">
          {AMBIENTES.map((ambiente) => (
            <CartaoEscolha
              key={ambiente}
              titulo={ROTULOS_AMBIENTE[ambiente]}
              descricao={DESCRICOES_AMBIENTE[ambiente]}
              ativo={estado.ambiente === ambiente}
              aoEscolher={() => escolherAmbiente(ambiente)}
            />
          ))}
        </div>
      ) : null}

      {tela === 1 ? (
        <div className="assistente-area">
          <div className="assistente-formas">
            {FORMAS_AREA.map((forma) => (
              <button
                key={forma}
                type="button"
                aria-pressed={formArea === forma}
                onClick={() => {
                  setFormArea(forma);
                  setErroArea(null);
                }}
              >
                {forma === "metros"
                  ? "Tenho a metragem (m²)"
                  : forma === "dimensoes"
                    ? "Tenho largura × comprimento"
                    : "Não sei as medidas"}
              </button>
            ))}
          </div>

          {formArea === "metros" ? (
            <label className="assistente-campo">
              <span>Área em metros quadrados</span>
              <input
                type="number"
                min="1"
                step="0.5"
                value={areaTexto}
                onChange={(evento) => setAreaTexto(evento.target.value)}
              />
            </label>
          ) : null}

          {formArea === "dimensoes" ? (
            <div className="assistente-dimensoes">
              <label className="assistente-campo">
                <span>Largura (m)</span>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={larguraTexto}
                  onChange={(evento) => setLarguraTexto(evento.target.value)}
                />
              </label>
              <label className="assistente-campo">
                <span>Comprimento (m)</span>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={comprimentoTexto}
                  onChange={(evento) =>
                    setComprimentoTexto(evento.target.value)
                  }
                />
              </label>
            </div>
          ) : null}

          {formArea === "referencia" ? (
            <div className="assistente-cartoes">
              {REFERENCIAS.map((referencia) => (
                <CartaoEscolha
                  key={referencia}
                  titulo={ROTULOS_REFERENCIA[referencia]}
                  descricao={`Cerca de ${AREA_POR_REFERENCIA[referencia]} m² — estimativa visual.`}
                  ativo={estado.referencia === referencia}
                  aoEscolher={() => escolherReferencia(referencia)}
                />
              ))}
            </div>
          ) : null}

          {erroArea === null ? null : (
            <p className="assistente-erro" role="alert">
              {erroArea}
            </p>
          )}

          <div className="assistente-acoes">
            <button type="button" onClick={voltar}>
              Voltar
            </button>
            {formArea === "referencia" ? null : (
              <button
                type="button"
                className="assistente-avancar"
                onClick={continuarArea}
              >
                Continuar
              </button>
            )}
          </div>
        </div>
      ) : null}

      {tela === 2 ? (
        <div className="assistente-opcoes">
          <div className="assistente-cartoes">
            {SOL_RESPOSTAS.map((sol) => (
              <CartaoEscolha
                key={sol}
                titulo={ROTULOS_SOL[sol]}
                descricao={
                  sol === "nao-sei"
                    ? "Assumimos sol à tarde, a opção conservadora."
                    : undefined
                }
                ativo={estado.sol === sol}
                aoEscolher={() => escolherSol(sol)}
              />
            ))}
          </div>
          <div className="assistente-acoes">
            <button type="button" onClick={voltar}>
              Voltar
            </button>
          </div>
        </div>
      ) : null}

      {tela === 3 ? (
        <div className="assistente-opcoes">
          <div className="assistente-cartoes">
            {FAIXAS_PESSOAS.map((faixa) => (
              <CartaoEscolha
                key={faixa}
                titulo={ROTULOS_PESSOAS[faixa]}
                ativo={estado.pessoas === faixa}
                aoEscolher={() => escolherPessoas(faixa)}
              />
            ))}
          </div>
          <div className="assistente-acoes">
            <button type="button" onClick={voltar}>
              Voltar
            </button>
          </div>
        </div>
      ) : null}

      {tela === 4 ? (
        <div className="assistente-equipamentos">
          <p className="assistente-ajuda">
            Conte o que fica ligado no ambiente. Pode deixar em zero o que não
            existir.
          </p>
          <Contador
            rotulo="Eletrônicos"
            valor={estado.eletronicos ?? 0}
            aoMenos={() => ajustarContagem("eletronicos", -1)}
            aoMais={() => ajustarContagem("eletronicos", 1)}
          />
          <Contador
            rotulo="Lâmpadas"
            valor={estado.lampadas ?? 0}
            aoMenos={() => ajustarContagem("lampadas", -1)}
            aoMais={() => ajustarContagem("lampadas", 1)}
          />
          <Contador
            rotulo="Janelas"
            valor={estado.janelas ?? 0}
            aoMenos={() => ajustarContagem("janelas", -1)}
            aoMais={() => ajustarContagem("janelas", 1)}
          />
          <div className="assistente-acoes">
            <button type="button" onClick={voltar}>
              Voltar
            </button>
            <button
              type="button"
              className="assistente-avancar"
              onClick={verResultado}
            >
              Ver resultado
            </button>
          </div>
        </div>
      ) : null}

      {tela === TOTAL_ETAPAS ? (
        <div className="assistente-resultado" role="status" aria-live="polite">
          {recomendacao === null ? (
            <p>Complete as respostas para ver a recomendação.</p>
          ) : (
            <>
              <p className="assistente-capacidade">
                {recomendacao.capacidadeRecomendadaBtu === null
                  ? "Mais de uma unidade (acima de 60.000 BTU/h)"
                  : `${formatarBtu(recomendacao.capacidadeRecomendadaBtu)} BTU/h`}
              </p>
              <p className="assistente-capacidade-rotulo">
                Capacidade comercial estimada
              </p>

              <p
                className={`assistente-confianca assistente-confianca-${recomendacao.confianca}`}
              >
                {ROTULOS_CONFIANCA[recomendacao.confianca]}
              </p>

              <p className="assistente-explicacao">{recomendacao.explicacao}</p>

              <div className="assistente-fatores-bloco">
                <h3>Fatores usados</h3>
                <ul className="assistente-fatores">
                  {recomendacao.fatores.map((fator) => (
                    <li key={fator.chave}>
                      <span className="assistente-fator-rotulo">
                        {fator.rotulo}
                      </span>
                      <span className="assistente-fator-detalhe">
                        {fator.detalhe}
                      </span>
                      <span className="assistente-fator-btu">
                        {fator.btu > 0
                          ? `+${formatarBtu(fator.btu)} BTU/h`
                          : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="assistente-soma">
                  Soma dos fatores:{" "}
                  <strong>
                    {formatarBtu(recomendacao.capacidadeCalculadaBtu)} BTU/h
                  </strong>
                  . Área considerada: {formatarNumero(recomendacao.areaM2)} m².
                </p>
              </div>

              {recomendacao.alternativaDividida === null ? null : (
                <p className="assistente-alternativa">
                  Alternativa prática: duas unidades de{" "}
                  {formatarBtu(recomendacao.alternativaDividida.capacidadeBtu)}{" "}
                  BTU/h.
                </p>
              )}

              {recomendacao.suposicoes.length === 0 ? null : (
                <div className="assistente-suposicoes">
                  <h3>O que assumimos</h3>
                  <ul>
                    {recomendacao.suposicoes.map((suposicao) => (
                      <li key={suposicao}>{suposicao}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="assistente-orientacoes">
                <h3>Como escolher e instalar</h3>
                <dl>
                  <dt>Tipo indicado</dt>
                  <dd>{recomendacao.orientacoes.tipo}</dd>
                  <dt>Inverter</dt>
                  <dd>{recomendacao.orientacoes.inverter}</dd>
                  <dt>Instalação</dt>
                  <dd>{recomendacao.orientacoes.instalacao}</dd>
                  <dt>Vedação</dt>
                  <dd>{recomendacao.orientacoes.vedacao}</dd>
                  <dt>Limpeza</dt>
                  <dd>{recomendacao.orientacoes.limpeza}</dd>
                </dl>
              </div>

              <p className="assistente-nota-tipo">
                Janela e portátil não são recomendados como primeira escolha.
              </p>

              <p className="assistente-aviso">
                Esta é uma estimativa calculada por uma heurística de mercado,
                não um dado oficial do INMETRO nem um cálculo de carga térmica.
                {recomendacao.avaliacaoTecnica
                  ? " Pelas características do ambiente, procure uma avaliação técnica antes de comprar."
                  : ""}
              </p>

              <div className="assistente-acoes">
                <button type="button" onClick={voltar}>
                  Voltar
                </button>
                <button type="button" onClick={recomecar}>
                  Recomeçar
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
