# Observabilidade por dashboards; sem UI de admin na Fase 4

**Status:** aceito

A Fase 4 estava descrita como "Admin (pós-MVP) — interface administrativa para
revisão/publicação". Na revisão da fase, concluímos que **com o conteúdo no git**
(Ofertas e futuros artigos editados por PR comum) o "admin" perde o papel de editor
e resta a **observabilidade e os alertas**: tráfego do site, acesso do Agente e
links quebrados.

**Não vamos construir uma UI de admin.** A observabilidade vem de ferramentas
prontas:

- **Tráfego humano** → **Cloudflare Web Analytics** (grátis, sem cookies nem
  banner de consentimento — amigável à LGPD, nativo do Pages).
- **Acesso do Agente** (fetch dos `.json`) é **não-navegador**: o Web Analytics
  (beacon JS) não o mede. Ficará para quando houver **domínio próprio**, medido
  pela analytics de zona da Cloudflare por caminho — **adiado**.
- **Links quebrados** → o job deixa de gerar e-mail: para de falhar e passa a
  escrever **`reports/links-quebrados.md`** (commitado só quando a lista muda). É
  o lugar onde se vê *qual* link quebrou.

## Considered Options

- **Painel próprio** (`/admin` + Cloudflare Access + Pages Function) — trabalho de
  UI e de uma Function para exibir o que o dashboard já mostra; rejeitado agora.
- **Só dashboards + relatório de links** (escolhida) — zero UI, sem e-mail de
  ruído.
- **Manter o job de links falhando** — é o e-mail que se quer remover.

## Consequences

- Nada de código de UI de admin na Fase 4.
- `reports/links-quebrados.md` é a superfície de consulta de links quebrados; o
  job `verificar-links.yml` não falha mais.
- Medir o acesso do Agente exige **domínio próprio** + analytics de zona; enquanto
  não houver domínio, só o tráfego humano é medido.
- A "ação no admin para enviar tabela" não existe: subir uma tabela é um PR na
  trilha Tabela (ADR-0012).
