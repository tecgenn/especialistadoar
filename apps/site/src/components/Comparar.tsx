import {
  criarConsulta,
  type ItemConsulta,
  type Consulta as MotorConsulta,
} from "@especialista-do-ar/api/consulta";
import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  escreverIds,
  lerIds,
  linhasDaComparacao,
  MAXIMO_COMPARACAO,
  resumoDaSugestao,
  textoDescartes,
} from "../lib/comparacao";

/**
 * A ilha da Comparação (ticket 49): três campos de busca que viram cartões e
 * uma matriz neutra de atributos para até três Aparelhos. A seleção vive na URL
 * (`?ids=`) no mesmo contrato da tabela (ADR-0021), então recarregar e
 * compartilhar preservam a comparação. Os dados vêm do `consulta.json` já
 * publicado e as sugestões usam o mesmo motor de busca da tabela.
 *
 * Nada aqui elege um "melhor valor": os valores são os Dados declarados do
 * INMETRO, na mesma leitura neutra da ficha.
 */
export interface PropsComparar {
  /** URL do dataset enxuto de consulta (servido ao lado das páginas). */
  consultaUrl?: string;
  /** Mapa de Aparelhos analisados: aparelhoId → { titulo, url }. */
  analisados?: Map<string, { titulo: string; url: string }>;
}

/** Quantas sugestões o combobox exibe por vez. */
const MAXIMO_SUGESTOES = 8;

/** O rótulo visível de cada um dos três campos posicionais. */
const ROTULOS_CAMPOS = ["Modelo 1", "Modelo 2", "Modelo 3"] as const;

const ID_DICA = "comparar-dica";

export default function Comparar({
  consultaUrl = "/consulta.json",
  analisados = new Map(),
}: PropsComparar) {
  const [itens, setItens] = useState<ItemConsulta[] | null>(null);
  const [motor, setMotor] = useState<MotorConsulta | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ids, setIds] = useState<string[]>([]);
  const [descartados, setDescartados] = useState(0);
  /** O slot que voltou a ser campo pelo botão "Trocar". */
  const [editando, setEditando] = useState<number | null>(null);
  /** O texto digitado em cada um dos três campos. */
  const [textos, setTextos] = useState<string[]>(["", "", ""]);
  /** O campo com o combobox aberto (só um por vez). */
  const [campoAtivo, setCampoAtivo] = useState<number | null>(null);
  /** A sugestão destacada pelas setas; -1 = nenhuma. */
  const [ativo, setAtivo] = useState(-1);
  const camposRef = useRef<Array<HTMLInputElement | null>>([]);
  /** O campo que deve receber o foco depois do próximo render (ou null). */
  const [pedidoDeFoco, setPedidoDeFoco] = useState<{ slot: number } | null>(
    null,
  );

  // Um objeto novo a cada pedido faz o efeito rodar mesmo quando o slot se
  // repete (trocar o mesmo campo duas vezes).
  function pedirFoco(slot: number) {
    setPedidoDeFoco({ slot });
  }

  useEffect(() => {
    let cancelado = false;
    fetch(consultaUrl)
      .then((resposta) => {
        if (!resposta.ok) {
          throw new Error(`HTTP ${resposta.status}`);
        }
        return resposta.json() as Promise<ItemConsulta[]>;
      })
      .then((dataset) => {
        if (cancelado) {
          return;
        }
        setItens(dataset);
        setMotor(criarConsulta(dataset));
        const lidos = lerIds(
          new URLSearchParams(window.location.search),
          new Set(dataset.map((item) => item.id)),
        );
        setIds(lidos.ids);
        setDescartados(lidos.descartados);
      })
      .catch((causa: unknown) => {
        if (!cancelado) {
          setErro(causa instanceof Error ? causa.message : String(causa));
        }
      });
    return () => {
      cancelado = true;
    };
  }, [consultaUrl]);

  // Voltar/avançar no navegador reconstrói a seleção a partir da URL.
  useEffect(() => {
    if (itens === null) {
      return;
    }
    const conhecidos = new Set(itens.map((item) => item.id));
    const lerDaUrl = () => {
      const lidos = lerIds(
        new URLSearchParams(window.location.search),
        conhecidos,
      );
      setIds(lidos.ids);
      setDescartados(lidos.descartados);
      setEditando(null);
      setTextos(["", "", ""]);
      setCampoAtivo(null);
      setAtivo(-1);
    };
    window.addEventListener("popstate", lerDaUrl);
    return () => window.removeEventListener("popstate", lerDaUrl);
  }, [itens]);

  // Trocar e remover mudam os cartões; o foco vai para o campo indicado, para o
  // teclado continuar a montar a comparação.
  useEffect(() => {
    if (pedidoDeFoco === null) {
      return;
    }
    camposRef.current[pedidoDeFoco.slot]?.focus();
  }, [pedidoDeFoco]);

  /**
   * Aplica a seleção: cards ocupam os primeiros slots, na ordem dos ids. A URL
   * guarda só os ids; o aviso de descarte some porque a seleção foi refeita.
   */
  function atualizar(proximos: string[]) {
    const validos = [...new Set(proximos)];
    setIds(validos);
    setDescartados(0);
    setEditando(null);
    setTextos(["", "", ""]);
    setCampoAtivo(null);
    setAtivo(-1);
    const busca = escreverIds(validos).toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${busca === "" ? "" : `?${busca}`}`,
    );
    if (validos.length < MAXIMO_COMPARACAO) {
      pedirFoco(validos.length);
    }
  }

  function escolher(item: ItemConsulta) {
    if (editando !== null) {
      atualizar(ids.map((id, indice) => (indice === editando ? item.id : id)));
      return;
    }
    if (ids.includes(item.id) || ids.length >= MAXIMO_COMPARACAO) {
      return;
    }
    atualizar([...ids, item.id]);
  }

  function remover(indice: number) {
    atualizar(ids.filter((_, posicao) => posicao !== indice));
  }

  function trocar(indice: number) {
    setEditando(indice);
    setTextos(["", "", ""]);
    setCampoAtivo(indice);
    setAtivo(-1);
    pedirFoco(indice);
  }

  function limpar() {
    atualizar([]);
  }

  function definirTexto(slot: number, valor: string) {
    setTextos((anteriores) =>
      anteriores.map((texto, indice) => (indice === slot ? valor : texto)),
    );
    setAtivo(-1);
  }

  function aoTeclar(evento: KeyboardEvent<HTMLInputElement>, slot: number) {
    if (evento.key === "Escape") {
      evento.preventDefault();
      definirTexto(slot, "");
      if (editando === slot) {
        setEditando(null);
      }
      return;
    }
    if (!listaAberta) {
      return;
    }
    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      setAtivo((atual) => (atual + 1) % sugestoes.length);
      return;
    }
    if (evento.key === "ArrowUp") {
      evento.preventDefault();
      setAtivo((atual) => (atual <= 0 ? sugestoes.length - 1 : atual - 1));
      return;
    }
    if (evento.key === "Enter") {
      evento.preventDefault();
      const escolhido = sugestoes[ativo >= 0 ? ativo : 0];
      if (escolhido !== undefined) {
        escolher(escolhido);
      }
    }
  }

  const itensPorId = useMemo(
    () => new Map((itens ?? []).map((item) => [item.id, item])),
    [itens],
  );
  const selecionados = ids
    .map((id) => itensPorId.get(id))
    .filter((item): item is ItemConsulta => item !== undefined);
  const linhas = linhasDaComparacao(selecionados);

  const textoAtivo = campoAtivo === null ? "" : (textos[campoAtivo] ?? "");
  const sugestoes =
    motor === null || campoAtivo === null || textoAtivo.trim() === ""
      ? []
      : motor
          .filtrar({ q: textoAtivo })
          .filter((item) => !ids.includes(item.id))
          .slice(0, MAXIMO_SUGESTOES);
  const listaAberta =
    campoAtivo !== null && textoAtivo.trim() !== "" && sugestoes.length > 0;
  const idLista =
    campoAtivo === null ? undefined : `comparar-lista-${campoAtivo}`;

  return (
    <section className="comparar">
      <div className="comparar-campos">
        {ROTULOS_CAMPOS.map((rotulo, slot) => {
          const item = selecionados[slot];
          if (item !== undefined && editando !== slot) {
            const resumo = resumoDaSugestao(item);
            return (
              <article className="comparar-cartao" key={`cartao-${item.id}`}>
                <p className="comparar-cartao-marca">{item.marcaCatalogo}</p>
                <p className="comparar-cartao-modelo">{item.modelo}</p>
                <p className="comparar-cartao-resumo">
                  {resumo.capacidade}
                  <span aria-hidden="true"> · </span>
                  {resumo.tipo}
                </p>
                <div className="comparar-cartao-acoes">
                  <button
                    type="button"
                    aria-label={`Trocar ${item.marcaCatalogo} ${item.modelo}`}
                    onClick={() => trocar(slot)}
                  >
                    Trocar
                  </button>
                  <button
                    type="button"
                    aria-label={`Remover ${item.marcaCatalogo} ${item.modelo}`}
                    onClick={() => remover(slot)}
                  >
                    Remover
                  </button>
                </div>
              </article>
            );
          }

          const ativoNesteCampo = campoAtivo === slot;
          const idCampo = `comparar-campo-${slot}`;
          return (
            <div className="comparar-campo" key={rotulo}>
              <label htmlFor={idCampo}>{rotulo}</label>
              <input
                id={idCampo}
                ref={(elemento) => {
                  camposRef.current[slot] = elemento;
                }}
                type="text"
                role="combobox"
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={ativoNesteCampo && listaAberta}
                aria-controls={
                  ativoNesteCampo && listaAberta ? idLista : undefined
                }
                aria-activedescendant={
                  ativoNesteCampo && listaAberta && ativo >= 0
                    ? `comparar-opcao-${slot}-${ativo}`
                    : undefined
                }
                placeholder="Buscar marca, modelo ou tipo"
                value={textos[slot] ?? ""}
                onChange={(evento) => {
                  setCampoAtivo(slot);
                  definirTexto(slot, evento.target.value);
                }}
                onFocus={() => setCampoAtivo(slot)}
                onBlur={() => {
                  if (campoAtivo === slot) {
                    setCampoAtivo(null);
                    setAtivo(-1);
                  }
                }}
                onKeyDown={(evento) => aoTeclar(evento, slot)}
              />
              {ativoNesteCampo && listaAberta ? (
                <div className="comparar-sugestoes" role="listbox" id={idLista}>
                  {sugestoes.map((sugestao, indice) => {
                    const resumo = resumoDaSugestao(sugestao);
                    return (
                      <div
                        key={sugestao.id}
                        id={`comparar-opcao-${slot}-${indice}`}
                        role="option"
                        aria-selected={ativo === indice}
                        tabIndex={-1}
                        className={
                          ativo === indice ? "comparar-opcao-ativa" : undefined
                        }
                        onMouseDown={(evento) => evento.preventDefault()}
                        onClick={() => escolher(sugestao)}
                        onKeyDown={(evento) => {
                          if (evento.key === "Enter" || evento.key === " ") {
                            evento.preventDefault();
                            escolher(sugestao);
                          }
                        }}
                      >
                        <span className="comparar-sugestao-marca">
                          {resumo.marca}
                        </span>
                        <span className="comparar-sugestao-modelo">
                          {resumo.modelo}
                        </span>
                        <span className="comparar-sugestao-meta">
                          {resumo.capacidade}
                          <span aria-hidden="true"> · </span>
                          {resumo.tipo}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : null}
              {ativoNesteCampo &&
              textoAtivo.trim() !== "" &&
              sugestoes.length === 0 ? (
                <p className="comparar-sem-resultado" role="status">
                  Nenhum modelo encontrado.
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {descartados > 0 ? (
        <p className="comparar-aviso" role="status">
          {textoDescartes(descartados)}
        </p>
      ) : null}

      {ids.length > 0 ? (
        <p className="comparar-limpar">
          <button type="button" onClick={limpar}>
            Limpar comparação
          </button>
        </p>
      ) : null}

      {erro !== null ? (
        <p role="alert">Não foi possível carregar a base: {erro}.</p>
      ) : itens === null ? (
        <p role="status">Carregando a base…</p>
      ) : selecionados.length === 0 ? (
        <div className="comparar-vazio">
          <h2>Ainda não há nada para comparar</h2>
          <p>
            Escolha até três modelos nos campos acima — ou marque aparelhos na
            tabela — para ver capacidade, consumo, IDRS e Classe lado a lado. A
            seleção fica na URL, então o link abre a mesma comparação em outro
            navegador.
          </p>
          <p>
            <a href="/aparelhos/">Ver todos os aparelhos</a>
          </p>
        </div>
      ) : (
        <>
          {selecionados.length === 1 ? (
            <p className="comparar-convite">
              Adicione um segundo modelo para comparar os valores lado a lado.
            </p>
          ) : null}

          <div className="comparar-matriz-bloco">
            <p className="comparar-dica" id={ID_DICA}>
              Deslize a matriz para o lado para ver as outras colunas.
            </p>
            <section
              className="comparar-matriz-rolagem"
              aria-labelledby={ID_DICA}
            >
              <table
                className="comparar-matriz"
                data-colunas={selecionados.length}
              >
                <caption className="sr-only">
                  Comparação dos aparelhos selecionados, um por coluna
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="comparar-atributo">
                      <span className="sr-only">Atributo</span>
                    </th>
                    {selecionados.map((item) => {
                      const analise = analisados.get(item.id);
                      return (
                        <th scope="col" key={item.id} data-aparelho={item.id}>
                          <span className="comparar-coluna-marca">
                            {item.marcaCatalogo}
                          </span>
                          <span className="comparar-coluna-modelo">
                            {item.modelo}
                          </span>
                          <a
                            className="comparar-ficha"
                            href={`/aparelhos/${item.id}`}
                          >
                            Ver ficha
                          </a>
                          {analise === undefined ? null : (
                            <a
                              className="comparar-selo"
                              href={analise.url}
                              title={analise.titulo}
                            >
                              Análise
                            </a>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((linha) => (
                    <tr key={linha.campo}>
                      <th scope="row" className="comparar-atributo">
                        {linha.rotulo}
                      </th>
                      {selecionados.map((coluna, indice) => (
                        <td key={coluna.id} data-campo={linha.campo}>
                          {linha.valores[indice]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>

          <p className="comparar-nota">
            Os valores são os Dados declarados do INMETRO, reproduzidos como
            Valores oficiais. A comparação é neutra: nenhum valor é destacado
            como melhor.
          </p>
        </>
      )}
    </section>
  );
}
