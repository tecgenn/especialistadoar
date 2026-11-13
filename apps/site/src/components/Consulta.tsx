import {
  criarConsulta,
  type FiltrosConsulta,
  type ItemConsulta,
  type Consulta as MotorConsulta,
  ORDENS_CONSULTA,
  type OrdemConsulta,
  ordenar,
} from "@especialista-do-ar/api/consulta";
import { useCallback, useEffect, useState } from "react";
import {
  escreverEstado,
  FILTROS_PADRAO,
  lerEstado,
  temFiltroAtivo,
  temFiltroAvancado,
} from "../lib/estado";
import type { OpcoesConsulta } from "../lib/opcoes";
import {
  type CampoResumoFiltro,
  resumoDosFiltros,
} from "../lib/resumo-filtros";
import { colunasDaTabela, valorDaColuna } from "../lib/tabela";

/**
 * A ilha de consulta do site (ADR-0008): a tabela de Aparelhos com filtros
 * combináveis, busca textual e ordenação rodam **no cliente**, sobre o
 * `consulta.json` publicado, pelo módulo isomórfico do ticket 08
 * (`criarConsulta`/`ordenar`). O estado vive na URL. A consulta é 100% estática:
 * o dataset é baixado como arquivo.
 *
 * O layout (ticket 50) é uma coluna central de até 72 rem, sem barra lateral:
 * busca em largura total, a linha de "Pesquisa avançada" com os chips do recorte
 * efetivo (inclusive o padrão implícito de 220 V), o painel avançado recolhível
 * com Marca, Capacidade, Função, Tensão, Tipo e Classe, a vitrine de Análises e,
 * por fim, a linha de ordenação acima da tabela. A coluna "Análise" é a última e
 * só existe quando há ao menos uma Análise publicada.
 */
export interface PropsConsulta {
  /** Opções dos filtros, derivadas do dataset no build do site. */
  opcoes: OpcoesConsulta;
  /** URL do dataset enxuto de consulta (servido ao lado das páginas). */
  consultaUrl?: string;
  /** Mapa de Aparelhos analisados: aparelhoId → { titulo, url }. */
  analisados?: Map<string, { titulo: string; url: string }>;
}

/** Quantas linhas aparecem por vez na tabela. */
const TAMANHO_PAGINA = 50;

/** Quantos cartões a vitrine "Aparelhos com análise" exibe no máximo. */
const VITRINE_MAXIMO = 6;

/** Capacidades mais compradas: os analisados delas abrem a vitrine. */
const CAPACIDADES_DESTAQUE = [9000, 12000, 18000];

/** Os campos que a tabela sabe ordenar (as colunas ordenáveis do ticket 31). */
const CAMPOS_ORDENAVEIS = new Set<string>(ORDENS_CONSULTA);

/** Uma marca nos chips: `valor` é o filtro, `rotulo` o que se lê. */
interface OpcaoChip {
  valor: string;
  rotulo: string;
}

/** Uma classe nos chips: além do rótulo, a cor curada (opcional). */
interface OpcaoClasseChip extends OpcaoChip {
  cor?: string;
}

/**
 * Os chips de um filtro (ticket 22): botões com `aria-pressed`, que quebram
 * linha. Clicar no chip ativo limpa; o chamador decide o que "ativo" significa.
 */
function Chips({
  opcoes,
  estaAtivo,
  selecionar,
}: {
  opcoes: OpcaoChip[];
  estaAtivo: (valor: string) => boolean;
  selecionar: (valor: string) => void;
}) {
  if (opcoes.length === 0) {
    return null;
  }
  return (
    <div className="chips">
      {opcoes.map(({ valor, rotulo }) => (
        <button
          key={valor}
          type="button"
          aria-pressed={estaAtivo(valor)}
          onClick={() => selecionar(valor)}
        >
          {rotulo}
        </button>
      ))}
    </div>
  );
}

/**
 * Os chips de Classe (ticket 34, compactados no 45): como os demais, mas cada
 * botão carrega `data-classe` para o CSS pintar a classe energética (A–F) e a
 * cor curada. O rótulo visível é só a letra — a legenda do grupo já diz que é
 * Classe —, e o `aria-label` mantém o nome completo para leitores de tela.
 */
function ChipsClass({
  opcoes,
  estaAtivo,
  selecionar,
}: {
  opcoes: OpcaoClasseChip[];
  estaAtivo: (valor: string) => boolean;
  selecionar: (valor: string) => void;
}) {
  if (opcoes.length === 0) {
    return null;
  }
  return (
    <div className="chips classes-chips">
      {opcoes.map(({ valor, cor }) => (
        <button
          key={valor}
          type="button"
          aria-label={`Classe ${valor}`}
          aria-pressed={estaAtivo(valor)}
          data-classe={valor}
          style={
            cor === undefined
              ? undefined
              : ({ "--cor-classe": cor } as React.CSSProperties)
          }
          onClick={() => selecionar(valor)}
        >
          {valor}
        </button>
      ))}
    </div>
  );
}

/**
 * Um cabeçalho ordenável (ticket 43): as duas setas ficam **sempre visíveis**,
 * a direção ativa em destaque e a outra apagada — assim se descobre que o
 * cabeçalho é clicável. O botão alterna a direção; `aria-sort` fica no `th`.
 */
function Cabecalho({
  campo,
  rotulo,
  estado,
  alternar,
}: {
  campo: OrdemConsulta;
  rotulo: string;
  estado: FiltrosConsulta;
  alternar: (campo: OrdemConsulta) => void;
}) {
  const ativa = estado.ordem === campo;
  const direcao = ativa ? (estado.dir ?? "asc") : null;
  const ariaSort =
    direcao === "asc"
      ? "ascending"
      : direcao === "desc"
        ? "descending"
        : "none";
  return (
    <th scope="col" aria-sort={ariaSort} data-campo={campo}>
      <button type="button" onClick={() => alternar(campo)}>
        {rotulo}
        <span className="setas" aria-hidden="true">
          <span
            className={`seta seta-asc${direcao === "asc" ? " seta-ativa" : ""}`}
          >
            ↑
          </span>
          <span
            className={`seta seta-desc${direcao === "desc" ? " seta-ativa" : ""}`}
          >
            ↓
          </span>
        </span>
      </button>
    </th>
  );
}

/** O filtro desligado pelos "×" dos chips: um parcial por campo. */
const FILTRO_DESLIGADO: Record<CampoResumoFiltro, FiltrosConsulta> = {
  q: { q: undefined },
  marca: { marca: undefined },
  btu: { btu: undefined },
  funcao: { funcao: undefined },
  tensao: { tensao: undefined },
  tipo: { tipo: undefined },
  classe: { classe: undefined },
};

/**
 * O selo "Análise" (ticket 44, movido para a coluna própria no 50): etiqueta de
 * contorno — não a pílula azul dos chips — com link para a Análise e tooltip
 * contendo **apenas** o título. O `aria-describedby` leva o título a leitores de
 * tela.
 */
function SeloAnalise({
  itemId,
  analise,
}: {
  itemId: string;
  analise: { titulo: string; url: string };
}) {
  const tooltipId = `analise-tooltip-${itemId}`;
  return (
    <span className="analisado-selo">
      <a
        href={analise.url}
        className="analisado-link analisado-etiqueta"
        aria-describedby={tooltipId}
      >
        Análise
      </a>
      <span className="analisado-tooltip" role="tooltip" id={tooltipId}>
        {analise.titulo}
      </span>
    </span>
  );
}

/** O `<select>` "Outras…" de um filtro: o resto fora dos chips curados. */
function SelectOutras({
  rotulo,
  valor,
  opcoes,
  onChange,
}: {
  rotulo: string;
  valor: string;
  opcoes: { valor: string; rotulo: string }[];
  onChange: (valor: string) => void;
}) {
  return (
    <label className="select-outras">
      <select
        aria-label={rotulo}
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
      >
        <option value="" disabled hidden>
          {rotulo}
        </option>
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Consulta({
  opcoes,
  consultaUrl = "/consulta.json",
  analisados = new Map(),
}: PropsConsulta) {
  const [motor, setMotor] = useState<MotorConsulta | null>(null);
  /** O dataset como veio do `consulta.json`, para o bloco "Com análise". */
  const [itens, setItens] = useState<ItemConsulta[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [estado, setEstado] = useState<FiltrosConsulta>(FILTROS_PADRAO);
  const [paginacao, setPaginacao] = useState({
    chave: "",
    quantidade: TAMANHO_PAGINA,
  });
  /** O painel "Pesquisa avançada" começa fechado e abre sozinho quando a URL
   *  traz um filtro avançado (ticket 50). */
  const [painelAberto, setPainelAberto] = useState(false);

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
        if (!cancelado) {
          setItens(dataset);
          setMotor(criarConsulta(dataset));
        }
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

  useEffect(() => {
    const lerDaUrl = () => {
      const busca = new URLSearchParams(window.location.search);
      setEstado(lerEstado(busca));
      // O painel abre para não esconder um recorte vindo de um link. O padrão
      // implícito de 220 V não conta: a URL limpa abre com o painel fechado.
      if (temFiltroAvancado(busca)) {
        setPainelAberto(true);
      }
    };
    lerDaUrl();
    window.addEventListener("popstate", lerDaUrl);
    return () => window.removeEventListener("popstate", lerDaUrl);
  }, []);

  const atualizar = useCallback((parcial: FiltrosConsulta) => {
    setEstado((anterior) => {
      const proximo: FiltrosConsulta = { ...anterior, ...parcial };
      // Um campo passado como `undefined` desliga o filtro — o merge sozinho
      // manteria o valor antigo (é assim que o "×" dos chips funciona).
      for (const campo of Object.keys(parcial) as (keyof FiltrosConsulta)[]) {
        if (proximo[campo] === undefined) {
          delete proximo[campo];
        }
      }
      const busca = escreverEstado(proximo).toString();
      const url = `${window.location.pathname}${busca === "" ? "" : `?${busca}`}`;
      window.history.replaceState(null, "", url);
      return proximo;
    });
  }, []);

  const limpar = useCallback(() => {
    // "Limpar filtros" volta ao recorte padrão (ticket 38) e mantém a ordenação
    // — a ordem escolhida não é um filtro (e o botão só aparece fora do padrão).
    const restante: FiltrosConsulta = {
      ...FILTROS_PADRAO,
      ...(estado.ordem === undefined ? {} : { ordem: estado.ordem }),
      ...(estado.dir === undefined ? {} : { dir: estado.dir }),
    };
    const busca = escreverEstado(restante).toString();
    const url = `${window.location.pathname}${busca === "" ? "" : `?${busca}`}`;
    window.history.replaceState(null, "", url);
    setEstado(restante);
  }, [estado]);

  /** O "×" de um chip: desliga só aquele filtro. Sem a Tensão do padrão, o
   *  estado vazio grava `tensao=` e a URL reconstrói o recorte sem o padrão. */
  const removerFiltro = (campo: CampoResumoFiltro) => {
    atualizar(FILTRO_DESLIGADO[campo]);
  };

  const alternar = (campo: OrdemConsulta) => {
    const direcaoAtual = estado.ordem === campo ? (estado.dir ?? "asc") : null;
    atualizar({
      ordem: campo,
      dir: direcaoAtual === "asc" ? "desc" : "asc",
    });
  };

  const trocarOrdem = (valor: string) => {
    if (valor === "") {
      atualizar({ ordem: undefined, dir: undefined });
      return;
    }
    const campo = valor as OrdemConsulta;
    atualizar({
      ordem: campo,
      dir: estado.ordem === campo ? (estado.dir ?? "asc") : "asc",
    });
  };

  /** Inverte o sentido da ordenação — o caminho do celular, onde o cabeçalho
   *  da tabela some e o cabeçalho clicável não está à mão. */
  const alternarDirecao = () => {
    if (estado.ordem === undefined) {
      return;
    }
    atualizar({ dir: (estado.dir ?? "asc") === "asc" ? "desc" : "asc" });
  };

  const filtrados = motor === null ? [] : motor.filtrar(estado);
  // Com busca e sem coluna escolhida, a ordem inicial é a relevância do
  // MiniSearch; A–Z e as colunas só entram quando a pessoa pede.
  const usarOrdenacao =
    estado.ordem !== undefined || (estado.q ?? "").trim() === "";
  const resultadosOrdenados = usarOrdenacao
    ? ordenar(filtrados, estado)
    : filtrados;

  // Divide em dois grupos: analisados primeiro (ordenados dentro do grupo), depois demais.
  const analisadosIds = new Set(analisados.keys());
  const grupoAnalisados: ItemConsulta[] = [];
  const grupoDemais: ItemConsulta[] = [];
  for (const item of resultadosOrdenados) {
    if (analisadosIds.has(item.id)) {
      grupoAnalisados.push(item);
    } else {
      grupoDemais.push(item);
    }
  }
  const resultados = [...grupoAnalisados, ...grupoDemais];

  // A vitrine "Aparelhos com análise" (ticket 44, revisto) fica **fora** da
  // tabela, acima dela, e não entra na contagem, na paginação nem na ordenação.
  // Ela acompanha os filtros ativos: mostra os analisados que passam no recorte
  // (os mesmos que aparecem destacados na tabela). As capacidades mais
  // compradas abrem a lista e as demais completam, na ordem das Análises (da
  // mais recente para a mais antiga), até VITRINE_MAXIMO cartões.
  const temFiltro = temFiltroAtivo(estado);
  const filtradosIds = new Set(filtrados.map((item) => item.id));
  const itensPorId = new Map((itens ?? []).map((item) => [item.id, item]));
  const analisadosFiltrados: ItemConsulta[] = [];
  for (const id of analisados.keys()) {
    const item = itensPorId.get(id);
    if (item !== undefined && filtradosIds.has(id)) {
      analisadosFiltrados.push(item);
    }
  }
  const emDestaque = analisadosFiltrados.filter((item) =>
    item.capacidadesBtu.some((capacidade) =>
      CAPACIDADES_DESTAQUE.includes(capacidade),
    ),
  );
  const demais = analisadosFiltrados.filter(
    (item) => !emDestaque.includes(item),
  );
  const comAnalise = [...emDestaque, ...demais].slice(0, VITRINE_MAXIMO);

  // Mudar filtro ou ordem volta para o início; "Mostrar mais" só cresce a
  // quantidade dentro do mesmo estado.
  const chaveEstado = escreverEstado(estado).toString();
  const mostrados =
    paginacao.chave === chaveEstado ? paginacao.quantidade : TAMANHO_PAGINA;
  const exibidos = resultados.slice(0, mostrados);

  // O chip aceso **é** o valor do filtro: o `<select>` "Outras…" não repete esse
  // valor, então mostra o placeholder enquanto o chip estiver ativo (um valor
  // por vez). Um link antigo pode trazer a Marca oficial (`?marca=SPRINGER
  // MIDEA`), fora dos chips: ela continua valendo e ganha uma opção própria no
  // `<select>` (ADR-0016).
  const valoresChip = new Set(opcoes.marcasChip.map((marca) => marca.valor));
  const marcasDoSelect =
    estado.marca !== undefined &&
    !valoresChip.has(estado.marca) &&
    !opcoes.marcas.includes(estado.marca)
      ? [...opcoes.marcas, estado.marca].sort()
      : opcoes.marcas;
  const marcaDoSelect =
    estado.marca !== undefined && marcasDoSelect.includes(estado.marca)
      ? estado.marca
      : "";
  const btuDoSelect =
    estado.btu !== undefined && opcoes.btus.includes(estado.btu)
      ? String(estado.btu)
      : "";

  const funcoes: OpcaoChip[] = opcoes.funcoes.map((funcao) => ({
    valor: funcao,
    rotulo: funcao,
  }));
  const tipos: OpcaoChip[] = opcoes.tipos.map((tipo) => ({
    valor: tipo,
    rotulo: tipo,
  }));
  const classesExtras = opcoes.classes;

  const colunas = colunasDaTabela(analisados.size > 0);
  const resumo = resumoDosFiltros(estado, opcoes);

  return (
    <section className="consulta">
      <form className="filtros" onSubmit={(evento) => evento.preventDefault()}>
        <label className="busca campo-full">
          <span>Busca</span>
          <input
            type="search"
            value={estado.q ?? ""}
            placeholder="Marca, modelo ou tipo"
            onChange={(evento) =>
              atualizar({ q: evento.target.value || undefined })
            }
          />
        </label>

        <div className="linha-pesquisa">
          <button
            type="button"
            className="botao-pesquisa-avancada"
            aria-expanded={painelAberto}
            aria-controls="pesquisa-avancada"
            onClick={() => setPainelAberto((aberto) => !aberto)}
          >
            Pesquisa avançada
          </button>

          <fieldset className="resumo-filtros">
            <legend className="sr-only">Filtros ativos</legend>
            {resumo.length === 0 ? (
              <p className="resumo-vazio">Nenhum filtro ativo.</p>
            ) : (
              resumo.map((filtro) => (
                <button
                  key={filtro.campo}
                  type="button"
                  className="chip-filtro"
                  data-campo={filtro.campo}
                  aria-label={filtro.remover}
                  onClick={() => removerFiltro(filtro.campo)}
                >
                  {filtro.rotulo}
                  <span className="chip-x" aria-hidden="true">
                    ×
                  </span>
                </button>
              ))
            )}
          </fieldset>

          {temFiltro ? (
            <button type="button" className="limpar-filtros" onClick={limpar}>
              Limpar filtros
            </button>
          ) : null}
        </div>

        <div
          className="filtros-avancados"
          id="pesquisa-avancada"
          hidden={!painelAberto}
        >
          <fieldset className="campo-chips campo-marca">
            <legend>Marca</legend>
            <Chips
              opcoes={opcoes.marcasChip}
              estaAtivo={(valor) => estado.marca === valor}
              selecionar={(valor) =>
                atualizar({
                  marca: estado.marca === valor ? undefined : valor,
                })
              }
            />
            <SelectOutras
              rotulo="Outras marcas"
              valor={marcaDoSelect}
              opcoes={marcasDoSelect.map((marca) => ({
                valor: marca,
                rotulo: marca,
              }))}
              onChange={(valor) => atualizar({ marca: valor || undefined })}
            />
          </fieldset>

          <fieldset className="campo-chips campo-capacidade">
            <legend>Capacidade</legend>
            <Chips
              opcoes={opcoes.btusChip.map((btu) => ({
                valor: String(btu),
                rotulo: btu.toLocaleString("pt-BR"),
              }))}
              estaAtivo={(valor) => estado.btu === Number(valor)}
              selecionar={(valor) => {
                const btu = Number(valor);
                atualizar({ btu: estado.btu === btu ? undefined : btu });
              }}
            />
            <SelectOutras
              rotulo="Outras capacidades"
              valor={btuDoSelect}
              opcoes={opcoes.btus.map((btu) => ({
                valor: String(btu),
                rotulo: btu.toLocaleString("pt-BR"),
              }))}
              onChange={(valor) =>
                atualizar({
                  btu: valor === "" ? undefined : Number(valor),
                })
              }
            />
          </fieldset>

          <fieldset className="campo-chips campo-funcao">
            <legend>Função</legend>
            <Chips
              opcoes={funcoes}
              estaAtivo={(valor) => estado.funcao === valor}
              selecionar={(valor) =>
                atualizar({
                  funcao: estado.funcao === valor ? undefined : valor,
                })
              }
            />
          </fieldset>

          <label className="campo-tensao">
            <span>Tensão (V)</span>
            <select
              value={estado.tensao === undefined ? "" : String(estado.tensao)}
              onChange={(evento) =>
                atualizar({
                  tensao:
                    evento.target.value === ""
                      ? undefined
                      : Number(evento.target.value),
                })
              }
            >
              <option value="">Todas</option>
              {opcoes.tensoes.map((tensao) => (
                <option key={tensao} value={tensao}>
                  {tensao}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="campo-chips campo-tipo">
            <legend>Tipo</legend>
            <Chips
              opcoes={tipos}
              estaAtivo={(valor) => estado.tipo === valor}
              selecionar={(valor) =>
                atualizar({ tipo: estado.tipo === valor ? undefined : valor })
              }
            />
          </fieldset>

          <fieldset className="campo-chips campo-classe">
            <legend>Classe</legend>
            <ChipsClass
              opcoes={opcoes.classesChip}
              estaAtivo={(valor) => estado.classe === valor}
              selecionar={(valor) =>
                atualizar({
                  classe: estado.classe === valor ? undefined : valor,
                })
              }
            />
            {classesExtras.length > 0 ? (
              <SelectOutras
                rotulo="Outras classes"
                valor={
                  estado.classe !== undefined &&
                  classesExtras.includes(estado.classe)
                    ? estado.classe
                    : ""
                }
                opcoes={classesExtras.map((classe) => ({
                  valor: classe,
                  rotulo: classe,
                }))}
                onChange={(valor) => atualizar({ classe: valor || undefined })}
              />
            ) : null}
          </fieldset>
        </div>
      </form>

      {erro !== null ? (
        <p role="alert">Não foi possível carregar a base: {erro}.</p>
      ) : (
        <>
          {motor === null ? (
            <p role="status">Carregando a base…</p>
          ) : comAnalise.length === 0 ? null : (
            <section
              className="com-analise"
              aria-labelledby="com-analise-titulo"
            >
              <h2 id="com-analise-titulo">Aparelhos com análise</h2>
              <ul>
                {comAnalise.map((item) => {
                  const analise = analisados.get(item.id);
                  return analise === undefined ? null : (
                    <li key={item.id}>
                      <a className="com-analise-item" href={analise.url}>
                        <span className="analisado-etiqueta">Análise</span>
                        <span className="com-analise-texto">
                          <span className="com-analise-marca">
                            {item.marcaCatalogo}
                          </span>
                          <span className="com-analise-titulo">
                            {analise.titulo}
                          </span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className="linha-ordenacao">
            {motor === null ? null : (
              <p role="status">
                {resultados.length} aparelho(s) com Dados declarados.
              </p>
            )}
            <label className="campo-ordenar">
              <span>Ordenar por</span>
              <select
                value={estado.ordem ?? ""}
                onChange={(evento) => trocarOrdem(evento.target.value)}
              >
                <option value="">
                  {estado.q === undefined || estado.q.trim() === ""
                    ? "Padrão (A–Z)"
                    : "Padrão (relevância)"}
                </option>{" "}
                {colunas
                  .filter((coluna) => CAMPOS_ORDENAVEIS.has(coluna.campo))
                  .map((coluna) => (
                    <option key={coluna.campo} value={coluna.campo}>
                      {coluna.rotulo}
                    </option>
                  ))}
              </select>
            </label>

            {/* Abaixo de 640 px o cabeçalho da tabela some (a linha vira cartão), então
                a direção precisa de um controle próprio — sem ele, o celular só
                ordenaria crescente. */}
            {estado.ordem !== undefined ? (
              <button
                type="button"
                className="ordem-direcao"
                aria-label={
                  estado.dir === "desc"
                    ? "Ordenar de forma crescente"
                    : "Ordenar de forma decrescente"
                }
                onClick={alternarDirecao}
              >
                {estado.dir === "desc" ? "Decrescente ↓" : "Crescente ↑"}
              </button>
            ) : null}
          </div>

          {motor === null ? null : (
            <>
              <table className="tabela-aparelhos">
                <caption className="sr-only">
                  Aparelhos de ar-condicionado, uma linha por Aparelho
                </caption>
                <colgroup>
                  {colunas.map((coluna) => (
                    <col key={coluna.campo} className={`col-${coluna.campo}`} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    {colunas.map((coluna) =>
                      CAMPOS_ORDENAVEIS.has(coluna.campo) ? (
                        <Cabecalho
                          key={coluna.campo}
                          campo={coluna.campo as OrdemConsulta}
                          rotulo={coluna.rotulo}
                          estado={estado}
                          alternar={alternar}
                        />
                      ) : (
                        <th
                          key={coluna.campo}
                          scope="col"
                          data-campo={coluna.campo}
                        >
                          {coluna.rotulo}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {exibidos.map((item) => {
                    const analise = analisados.get(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={
                          analise === undefined ? undefined : "linha-analisado"
                        }
                      >
                        {colunas.map((coluna) => {
                          const campo = coluna.campo;
                          if (campo === "analise") {
                            return (
                              <td
                                key={campo}
                                data-label={coluna.rotulo}
                                data-campo={campo}
                                className={
                                  analise === undefined
                                    ? "celula-analise-vazia"
                                    : undefined
                                }
                              >
                                {analise === undefined ? (
                                  "—"
                                ) : (
                                  <SeloAnalise
                                    itemId={item.id}
                                    analise={analise}
                                  />
                                )}
                              </td>
                            );
                          }
                          const valor = valorDaColuna(item, campo);
                          return (
                            <td
                              key={campo}
                              data-label={coluna.rotulo}
                              data-campo={campo}
                              data-classe={
                                campo === "classe" && item.classes.length > 0
                                  ? item.classes.join(" ")
                                  : undefined
                              }
                            >
                              {campo === "modelo" ? (
                                <a href={`/aparelhos/${item.id}`}>{valor}</a>
                              ) : campo === "classe" ? (
                                item.classes.length === 0 ? (
                                  "—"
                                ) : (
                                  <span className="classe-selos">
                                    {item.classes.map((classe) => (
                                      <span
                                        key={classe}
                                        className="classe-selo"
                                        data-classe={classe}
                                      >
                                        Classe {classe}
                                      </span>
                                    ))}
                                  </span>
                                )
                              ) : (
                                valor
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {resultados.length > mostrados ? (
                <button
                  type="button"
                  className="mostrar-mais"
                  onClick={() =>
                    setPaginacao({
                      chave: chaveEstado,
                      quantidade: mostrados + TAMANHO_PAGINA,
                    })
                  }
                >
                  Mostrar mais
                </button>
              ) : null}
            </>
          )}
        </>
      )}
    </section>
  );
}
