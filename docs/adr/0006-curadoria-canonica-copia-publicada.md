# Curadoria canônica em `data/`, cópia publicada em `data/build/`

**Status:** aceito

As duas formas sancionadas de alterar conteúdo — a **Exceção manual** e o
**Vínculo confirmado** — são arquivos JSONL editados à mão. Sua **fonte
canônica** fica na raiz de `data/` (`data/excecoes-manuais.jsonl`,
`data/vinculos-confirmados.jsonl`). O build lê essas fontes e **republica o
conjunto completo em `data/build/`**, regenerado a cada build. A razão é que
`data/build/` é a unidade publicável e servível: carregando a própria
proveniência (`registros.jsonl`) e a curadoria exata que a moldou, o consumidor
nunca precisa ler para fora dela.

## Considered Options

- **Cópias publicadas** (escolhida) — o bundle fica autossuficiente e o risco de
  drift é nulo, porque as cópias são regeneradas a cada build a partir da fonte
  canônica.
- **Base servida referencia `data/` diretamente** — sem duplicação, mas acopla o
  bundle publicado a um caminho fora dele.
- **Curadoria embutida na proveniência de cada registro** — proveniência mais rica
  por registro, mas acopla o formato da curadoria ao schema do registro e ainda
  exige as fontes canônicas.
- **Tornar `data/build/` a própria superfície editável** — rejeitada: `build/` é
  regenerado a cada build, então edições à mão se perderiam.

## Consequences

- `data/build/{excecoes-manuais,vinculos-confirmados}.jsonl` são **derivados** —
  nunca editar à mão; a superfície de edição é `data/`.
- As cópias são **resserializadas** a cada build (via `escreverJsonl`), não
  byte-idênticas à fonte.
