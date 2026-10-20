# CI/CD e publicação — setup manual (GitHub + Cloudflare)

Este é o runbook das ações que **não vivem dentro do repositório**: são
configurações feitas à mão no GitHub e na Cloudflare. O código que automatiza o
CI/CD está versionado em `.github/`; esta página descreve tudo o que precisa
existir **fora do git** para que ele funcione de ponta a ponta.

## Para agentes

- **O que este arquivo representa:** a lista autoritativa e re-executável de todo
  passo **manual** exigido pelo pipeline de CI e pela publicação. Se uma ação não
  acontece sozinha ao rodar o `ci.yml`/`publish.yml`, ela pertence aqui.
- **Quando ler:** ao trabalhar em CI/CD, publicação, credenciais/segredos, deploy,
  proteção de branch, ou ao integrar um serviço externo novo (Cloudflare, DNS,
  domínio, etc.).
- **Quando atualizar:** no **mesmo PR/commit** que introduzir ou alterar qualquer
  item manual — novo segredo, nova variable, mudança de permissão de token, novo
  serviço de deploy, mudança na proteção de branch — atualize os comandos/passos e
  acrescente uma linha em "Registro de mudanças".
- **Regras de escrita:** nunca escreva o **valor** de um segredo aqui (só o nome);
  todo passo deve trazer o comando exato ou o caminho exato na UI; configurações
  do repositório (proteção de branch) ficam em `.github/branch-protection.json`,
  versionadas.
- **Definição de pronto:** uma pessoa com acesso admin ao repositório e à conta
  Cloudflare consegue ir do zero a um deploy verde seguindo só esta página, sem
  abrir o código-fonte.

## O que roda sozinho (contexto)

| Workflow | Dispara em | O que faz |
|---|---|---|
| `.github/workflows/ci.yml` | `pull_request` e `push` em `main` | Matrix Linux (referência) + Windows (não-bloqueante): lint, typecheck, `build` (validação Ajv + invariantes), `build:site` (build do site Astro) e Vitest; gate de reprodutibilidade (`data/build`/`reports` têm de bater com um build novo). Anexa o Relatório de revisão ao PR **só quando o PR adiciona uma nova Versão da tabela** (`data/raw/*.csv`) — ver §1.4. |
| `.github/workflows/publish.yml` | `push` em `main` (merge) | Rebuilda, publica o **site** (`apps/site/dist`, que já embute a base servida — `aparelhos.json`, `consulta.json`, …) no Cloudflare Pages; pula com aviso se as credenciais não existirem. |
| `.github/workflows/verificar-links.yml` | `schedule` (diário, 06:00 UTC) e `workflow_dispatch` | Verifica os links das Ofertas (`pnpm verificar-links`) e publica URL/loja/motivo dos quebrados no **resumo do run** (com aviso `::warning::`). **Não falha** por link quebrado: sem e-mail, sem PR, sem issue, sem segredos. |
| `.github/actions/setup/action.yml` | (composite usado pelos três) | Instala pnpm (versão lida de `packageManager`) + Node 24 + dependências. |

O **merge em `main` é a publicação** (ADR-0004). Nenhum caminho publica sem PR.

## Pré-requisitos

- `gh` autenticado com os escopos `repo` e `workflow`:
  `gh auth login` e depois `gh auth status`.
- Node 24 e pnpm instalados localmente (`node -v`, `pnpm -v`) — usado só para o
  `wrangler`.
- Acesso **admin** ao repositório `tecgenn/especialistadoar`.
- Conta na Cloudflare com acesso ao dashboard.

---

## Parte 1 — GitHub

### 1.1 Segredos e variáveis do repositório

Nomes consumidos pelo `publish.yml`:

| Nome | Tipo | Obrigatório | Uso |
|---|---|---|---|
| `CLOUDFLARE_API_TOKEN` | secret | sim (para publicar) | autentica o `wrangler` |
| `CLOUDFLARE_ACCOUNT_ID` | secret | sim (para publicar) | identifica a conta Cloudflare |
| `CLOUDFLARE_PAGES_PROJECT` | variable | não (default `especialista-do-ar`) | nome do projeto Pages |

Grave cada um (o comando abre um prompt; cole o valor e confirme — nunca passe o
valor na linha de comando, ele iria para o histórico do shell):

```bash
gh secret set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_ACCOUNT_ID
gh variable set CLOUDFLARE_PAGES_PROJECT --body especialista-do-ar
```

Confira os **nomes** (nunca os valores):

```bash
gh secret list
gh variable list
```

> Sem os segredos o **CI continua verde**; só o **deploy** é pulado com aviso. Isso
> é intencional, para não travar merges antes de a Cloudflare existir.

Pela UI o equivalente é **Settings → Secrets and variables → Actions**.

### 1.2 Proteção de branch em `main`

A regra que garante "nenhum caminho publica sem PR" é uma configuração do
repositório, não um arquivo de workflow. Ela está versionada em
`.github/branch-protection.json` para poder ser reaplicada e auditada. Para
aplicar:

```bash
gh api -X PUT repos/tecgenn/especialistadoar/branches/main/protection \
  --input .github/branch-protection.json
```

Para ler o estado atual:

```bash
gh api repos/tecgenn/especialistadoar/branches/main/protection
```

O que o `branch-protection.json` exige:

- **Pull Request** antes do merge (0 aprovações obrigatórias — trabalhando sozinho,
  o PR não trava por falta de revisor).
- O check **`ci (ubuntu-latest)`** verde. O nome de um check é
  `<nome do job> (<valor da matrix>)`; se você renomear o job `ci` no `ci.yml`,
  **atualize este JSON no mesmo PR**.
- Sem force-push e sem deleção da branch.
- `enforce_admins: false` — o dono consegue contornar em emergência. Para impedir
  até o admin de pular, mude para `true`.

Pela UI: **Settings → Branches → Branch protection rules → `main`**.

### 1.3 Limpeza da branch do PR após o merge

O repositório está com **"Automatically delete head branches"** ligado
(`delete_branch_on_merge: true`): ao mergear um PR, o GitHub apaga a branch de
origem — evita o acúmulo de branches já mergeadas. É uma configuração do repo,
não versionada em arquivo. Para ligar/desligar:

```bash
# ligar
gh api -X PATCH repos/tecgenn/especialistadoar -f delete_branch_on_merge=true
# conferir
gh api repos/tecgenn/especialistadoar -q .delete_branch_on_merge
```

Pela UI: **Settings → General → Pull Requests → Automatically delete head
branches**.

Vale só para merges feitos pelo GitHub (PR): um merge local (`git merge` +
`git push`) não apaga nada. E a ref local `origin/<branch>` **não some sozinha** —
o Git a mantém como cache; limpe com `git fetch --prune` (ou configure
`fetch.prune=true`).

### 1.4 Duas trilhas de CI/CD (Código/Site × Tabela)

A mesma esteira (`ci.yml`) atende dois tipos de PR, distinguidos pelo que o PR
traz (ADR-0012):

| Trilha | Quando | O que roda |
|---|---|---|
| **Código/Site** (frequente) | PR sem arquivo novo em `data/raw/` | lint, typecheck, `build`, `build:site`, Vitest, gate de reprodutibilidade. **Sem** comentário de Relatório de revisão (fim do e-mail "0 novos / 0 alterados"). |
| **Tabela** (raro, ~2–3×/ano) | PR que **adiciona** `data/raw/inmetro-export-<data>.csv` | o mesmo acima **mais** o comentário do Relatório de revisão no PR. |

A distinção é feita pelo job `changes` do `ci.yml`: ele lista os arquivos do PR
pela API (`github.rest.pulls.listFiles`) e marca `nova-versao = true` quando há
um arquivo **adicionado** (`status: added`) que casa `^data/raw/.+\.csv$`. O job
`report` só roda com esse flag ligado. O gate de reprodutibilidade e o `build`
continuam rodando em **todo** PR — nada muda para a trilha Código/Site além do
silêncio do Relatório.

Para disparar a trilha Tabela: adicione o CSV bruto em `data/raw/`, rode
`pnpm build` e commite `data/build/` + `reports/revisao-<data>.md` no mesmo PR
(ver README, "Antes de dar push").

---

## Parte 2 — Cloudflare (Pages)

### 2.1 Conta e login

Crie/entre em <https://dash.cloudflare.com> e, localmente:

```bash
npx wrangler login     # abre o navegador (OAuth)
npx wrangler whoami    # mostra o Account ID e o e-mail da conta
```

### 2.2 Account ID

Copie o `Account ID` mostrado pelo `whoami` (ou, no dashboard, na barra lateral da
conta / em **Workers & Pages → Overview**). É o valor de `CLOUDFLARE_ACCOUNT_ID`.

### 2.3 Criar o projeto Pages

O `wrangler pages deploy` **não cria** o projeto automaticamente — crie-o uma vez:

```bash
npx wrangler pages project create especialista-do-ar --production-branch=main
```

O nome `especialista-do-ar` deve ser idêntico ao `CLOUDFLARE_PAGES_PROJECT`
(variable) e ao `--project-name` usado no `publish.yml`. Pela UI:
**Workers & Pages → Create → Pages → Direct Upload** — mas veja o aviso abaixo.

Um projeto **Direct Upload** (sem integração Git) **não tem UI** para configurar a
production branch: `Settings → Builds & deployments → Configure Production
deployments` só existe em projetos git-connected. Criado pelo dashboard, o projeto
assume `main` como production branch por padrão.

Se a production branch não for `main`, todo deploy do `publish.yml` cai como
**preview** (`https://<hash>.<projeto>.pages.dev`) em vez de produção. Verifique e,
se preciso, corrija pela API (o token precisa de `Cloudflare Pages: Edit`):

```bash
# ler a production branch atual (sem depender de jq)
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/especialista-do-ar" \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).result.production_branch))"

# corrigir para main
curl -X PATCH "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/especialista-do-ar" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"production_branch":"main"}'
```

> Em projeto Direct Upload a leitura pode vir `null`: a API não preenche
> `production_branch` até você defini-lo. O `PATCH` acima é idempotente, então
> aplicar direto para `main` já resolve — a leitura serve só para conferir depois.

O `publish.yml` fixa `--branch=main` no deploy, então a branch **do deploy** é
sempre `main`; o que decide produção × preview é a production branch **do
projeto**, acima.

### 2.4 Criar o API token

Dashboard → **My Profile → API Tokens → Create Token → Create Custom Token**:

- **Permissions:** `Account` · `Cloudflare Pages` · `Edit`
- **Account Resources:** inclua a conta usada acima
- (Opcional) **Permissions:** `Account` · `Account Settings` · `Read` — só se você
  usar `wrangler whoami` no CI.
- Crie e **copie o token** (ele aparece uma única vez). É o valor de
  `CLOUDFLARE_API_TOKEN`.

Depois, volte à seção 1.1 e grave o token + o Account ID como segredos.

> Se os termos de uso comercial do plano gratuito da Cloudflare forem confirmados
> (pergunta aberta em `docs/prd.md`), registre a decisão aqui.

### 2.5 (Opcional) Domínio próprio

**Pages → projeto → Custom domains → Set up a custom domain** e siga as
instruções de DNS. Registre aqui o domínio escolhido quando houver.

### 2.6 Remover o Worker aposentado (uma vez)

O Worker dinâmico **`especialista-do-ar-api`** foi **aposentado** (ADR-0011): o
`publish.yml` não o publica mais. O Worker já publicado em `workers.dev`,
porém, continua no ar até ser removido à mão — uma única vez:

```bash
npx wrangler delete especialista-do-ar-api
```

Pela UI: **Workers & Pages → `especialista-do-ar-api` → Settings → Delete**. Se
o token ainda tiver `Workers Scripts: Edit`, remova essa permissão (§2.4); ela
não é mais necessária.

> **Executado em 2026-10-19:** o Worker foi removido pelo dashboard e a permissão
> `Workers Scripts: Edit` foi dispensada do token. Este passo só volta a valer se
> o pacote for restaurado (ADR-0011) e publicado de novo.

### 2.7 Web Analytics (tráfego humano)

Cloudflare Web Analytics é grátis, sem cookies e sem banner de consentimento; o
snippet (beacon) é injetado pela própria Cloudflare no build do Pages.

**Habilitar (uma vez):**

1. Dashboard → **Workers & Pages** → projeto `especialista-do-ar`.
2. Aba **Metrics** → **Enable** em **Web Analytics**.

A Cloudflare adiciona o snippet automaticamente **no próximo deploy**; não há
mudança de código, segredo nem variable. Para ver os números: Dashboard →
**Web Analytics** → selecione a analytics do projeto.

**Verificação pós-deploy:** depois do próximo merge em `main`, abra a home
publicada e confira no HTML o beacon `static.cloudflareinsights.com/beacon.min.js`
(ou veja os primeiros page views no dashboard).

> **Executado em 2026-10-19 (ticket 15).** O snippet só passa a aparecer no
> próximo deploy do site.

**Limite:** o Web Analytics mede **tráfego humano** (beacon JS). O acesso do
**Agente** — `fetch` dos arquivos `.json`, sem navegador — não é medido. Isso exige
**domínio próprio** + analytics de zona da Cloudflare por caminho, **adiado**
(ADR-0013).

---

## Parte 3 — Primeiro deploy e verificação

1. Abra um PR (qualquer mudança) e confirme que o CI fica verde. O Relatório de
   revisão só aparece como comentário em PRs da trilha Tabela (ADR-0012).
2. Faça o merge. O workflow **Publish** roda: build → gate de reprodutibilidade →
   `pages deploy`.
3. Confirme a publicação:

   ```bash
   gh run list --workflow=Publish --limit 5
   gh run watch
   ```

   E abra a URL do projeto (ex.: `https://especialista-do-ar.pages.dev`).
4. O que é publicado é o **build do site** (`apps/site/dist`), que copia a base
   servida para a raiz junto das páginas. Abra a home (o catálogo) e confirme que
   `https://especialista-do-ar.pages.dev/aparelhos.json` (a API estática) continua
   servido na mesma URL de antes.

---

## Troubleshooting

| Sintoma | Causa provável | Ação |
|---|---|---|
| Publish verde mas "deploy ignorado" | segredos ausentes | gravar `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` (§1.1) |
| `Project not found` no deploy | projeto Pages ainda não existe | rodar §2.3 |
| `Authentication error` no deploy | token sem `Cloudflare Pages: Edit` ou conta errada | recriar o token (§2.4) |
| PR bloqueado por um check que não existe | o nome do job `ci` mudou | ajustar `.github/branch-protection.json` (§1.2) |
| Gate "Published artifacts match a fresh build" vermelho | `data/build`/`reports` desatualizados | rodar `pnpm build` e commitar |
| Deploy publica conteúdo antigo | merge não passou pelo PR / branch errada | revisar a proteção de branch (§1.2) |
| Deploy cai em **preview** em vez de produção | production branch do projeto ≠ `main` (projeto Direct Upload não tem UI) | corrigir pela API (§2.3) |
| Deploy falha com `ERR_PNPM_ADDING_TO_ROOT` ou `Command "wrangler" not found` | `wrangler` não está nas devDependencies da raiz e o `wrangler-action` não consegue instalá-lo num workspace pnpm | manter `wrangler` nas devDependencies da raiz (`pnpm add -D -w wrangler@4`); o action então usa o local |
| Run de `Verificar links` verde, com aviso de links quebrados | comportamento esperado (ADR-0014): link quebrado não falha o job | abrir o **resumo do run** para ver URL/loja/motivo e corrigir `apps/site/ofertas.json` por PR |

---

## Registro de mudanças

| Data | Mudança | Quem |
|---|---|---|
| 2026-10-15 | Criação. GitHub Actions (`ci.yml` + `publish.yml`), proteção de branch, Cloudflare Pages. | ticket #06 |
| 2026-10-16 | `publish.yml` fixa `--branch=main`; §2.3 documenta a production branch de projetos Direct Upload e a leitura/correção pela API (sem `jq`, usando Node). | ticket #06 |
| 2026-10-16 | Deploy do Worker dinâmico (`especialista-do-ar-api`) no `publish.yml`; token passa a exigir `Workers Scripts: Edit` (§2.4); nova §2.6 (Worker + regra de limite por IP). | ticket #09 |
| 2026-10-17 | §2.6: limite por IP passa a ser um *Rate Limiting binding* do Workers (`env.LIMITE_POR_IP` no `wrangler.jsonc`), já em `workers.dev`; regra de WAF vira alternativa com domínio próprio. | ticket #09 |
| 2026-10-17 | §1.3 (nova): "Automatically delete head branches" ligado (`delete_branch_on_merge: true`) e como podar a ref local. | ticket #10 |
| 2026-10-17 | Publicação passa a fazer o build do site (`pnpm build:site`) e a publicar `apps/site/dist` (que embute a base servida) em vez de `data/build`; CI ganha o passo `build:site`. Sem mudança de secrets/variables. | ticket #11 |
| 2026-10-17 | `wrangler` adicionado às devDependencies da raiz: o `wrangler-action` não consegue instalá-lo num workspace pnpm (`ERR_PNPM_ADDING_TO_ROOT`) e passa a usar o wrangler local (§ Troubleshooting). | ticket #11 |
| 2026-10-18 | Workflow agendado `verificar-links.yml` (diário + `workflow_dispatch`): roda `pnpm verificar-links` e reporta Ofertas com link quebrado. Sem segredos nem projeto novo. | ticket #12 |
| 2026-10-19 | Worker dinâmico aposentado (ADR-0011): sai o `wrangler deploy` do `publish.yml`, a permissão `Workers Scripts: Edit` do token (§2.4) e a antiga §2.6; a §2.6 passa a documentar a remoção única do Worker já publicado. O `wrangler` continua nas devDependencies da raiz porque o deploy do Pages usa `wrangler-action`. | ticket #13 |
| 2026-10-19 | Removido o Worker `especialista-do-ar-api` no dashboard da Cloudflare e dispensada a permissão `Workers Scripts: Edit` do token (§2.6). | ticket #13 |
| 2026-10-19 | Trilha dupla de CI/CD (ADR-0012): o job `report` só anexa o Relatório de revisão quando o PR adiciona `data/raw/*.csv` (novo job `changes`); nova §1.4. | ticket #14 |
| 2026-10-19 | Links quebrados deixam de falhar o job: o resultado vai para o resumo do run (aviso `::warning::`), sem PR/issue/arquivo (ADR-0014). Nova §2.7 habilita o Web Analytics (tráfego humano); acesso do Agente segue adiado. | ticket #15 |
