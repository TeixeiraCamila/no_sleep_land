# AI Coding Agent Instructions (docs/AGENTS.md)

Instruções operacionais do agente de código para este projeto: transforma a documentação de `docs/` em fonte da verdade e define o workflow de trabalho.

> **Relação com o `AGENTS.md` da raiz:** a raiz é o arquivo **auto-carregado** com as convenções do workspace (idioma, commits, comentários, snake_case, comandos, stack, consumo de API). Este, dentro de `docs/`, é o **workflow**: fonte da verdade, planejamento, validação e atualização de documentação. Convenções de código **não** são repetidas aqui — vá ao da raiz. Conflito entre os dois → prevalece a raiz para convenções, este para workflow.

---

## 1. Contexto do projeto

Project:

No Sleep Land — SPA sem framework (Vanilla JS + Alpine no form) para gerenciar coleção pessoal de entretenimento, consumindo o `notion_api` (domínio **entertainment**, banco Notion).

Purpose:

Catalogar filmes/séries/animes/dramas com busca, filtros, Kanban por status, detalhe, CRUD e modo visitante somente leitura.

Primary Users:

Dono/a (login email+código, JWT) e visitante (guest, leitura pública).

---

## 2. Fonte da verdade

Antes de mudança significativa, ler a documentação relevante em `docs/`. Documentação principal:

- `PRD.md` — o que estamos construindo (requisitos, escopo, não-objetivos, perguntas em aberto).
- `DESIGN_SYSTEM.md` — como deve parecer (tema escuro, paleta de status, sidebar, estados, acessibilidade + pendências).
- `UX_FLOWS.md` — o que o usuário faz, passo a passo, com estados esperados por fluxo.
- `ARCHITECTURE.md` — como o sistema funciona (Page+View, guards, decisões técnicas, falhas).
- `DATABASE.md` — o que existe de dado (13 propriedades Notion, sem relations, gotchas do mapper).
- `API.md` — contratos: rotas, payloads, envelopes (que **variam por recurso**), formatos de erro.
- `SECURITY.md` — auth/guest/XSS/segredos/CORS e o que é aceito conscientemente.
- `CODE_STYLE.md` — nomenclatura, padrão Page/View, erros, tratamento de "sem lint".
- `TESTING.md` — validação real (build + fluxos manuais; **sem** framework de teste/lint).

Também vale:

- `../AGENTS.md` (raiz): convenções do workspace e stack deste repo.
- `README.md`: visão geral (inglês) — **contém divergências conhecidas** com o código (Kanban "arrastável", upload de capa, fontes, `GET /api/users`); em conflito com `API.md`/`PRD.md`, estes mandam (lista em `PRD.md` §12).
- `CRIAR_NOVA_PAGE.md`: passo a passo **atual** para criar uma page nova (Page + View, rota em `router.js` + `main.js`, sidebar, adapter de busca, guards, docs e validação).
- `COMPONENTES.md` e `CRIAR_NOVA_VIEW.md`: guias antigos de arquitetura/como criar view — **desatualizados** (`camelCase`, router antigo, rotas faltando); use `CRIAR_NOVA_PAGE.md` e corrija nomenclatura pelo `CODE_STYLE.md`.
- `filtros.md`: histórico das 3 features de filtro (shell × container, filtering client-side).
- `../../docs/parcelamento-despesas.md` e `notion_api/docs/auth.md`: backend (relevante ao mexer em API/auth).

Não contradizer esses documentos sem antes **identificar o conflito** (seção 8).

---

## 3. Regras gerais

- Entender o código existente antes de modificá-lo (copiar o padrão da página vizinha).
- Reusar `utils/` e `components/` existentes; sem utilitário duplicado.
- Seguir o design system: Tailwind primeiro, tema escuro, sem sombra, cores de status pelas classes `.done/.watching/.plan_to_watch/.dropped_paused`.
- Seguir a arquitetura: `views/` puras (template literal), `pages/` com estado/fetch, **fetch só em `services/api.js`** (não copiar o fetch cru de `pages/status.js`), ações de botão no registry `actions.js` (globais no `main.js`).
- Seguir `DATABASE.md`/`API.md`: não inventar campo, rota, envelope ou lista fixa de status/tipo (a fonte é o `/options`).
- Seguir `SECURITY.md`: `escape_html()` em **todo** dado interpolado; escrita só via `auth_request`; visitante nunca escreve; sem `VITE_` com segredo.
- Seguir `CODE_STYLE.md` + raiz (`snake_case` próprio, comentários pt-BR; UI em inglês na sidebar/form/detalhe e pt-BR no restante — ver `DESIGN_SYSTEM.md` §2).
- **Não inventar requisito de negócio** — se não está documentado, perguntar.
- Sem dependência nova sem combinar; sem mudança não relacionada.
- Respeitar gotchas documentados: filtros `studios`/`tags` são AND; `type` não filtra server-side; `/all` descarta "Sem título"; `PATCH /:id/status` e `/finished-this-year` existem mas o front não usa; `Quest`/`Progress` têm armadilha de mapper.

---

## 4. Planejamento

Antes de implementar tarefa não-trivial:

1. Ler a documentação relevante de `docs/` (seção 2).
2. Inspecionar o código existente (page + view + `services/api.js` + utils).
3. Identificar os arquivos afetados (page, view, `router.js` **e** `main.js` se for rota nova).
4. Identificar dependências (options do backend, estado no `store.js`, handlers `window.*`).
5. Identificar mudanças de banco/API (DTO/rota nova? muda `API.md`/`DATABASE.md`? o mapper do backend precisa de property?).
6. Identificar considerações de segurança (dados interpolados escapados? escrita exige sessão? guest?).
7. Identificar a validação necessária (fluxo manual de `TESTING.md` correspondente).
8. Montar plano curto e apresentar antes de codar.

---

## 5. Implementação

Durante a implementação:

- Mudança menor e focused (o menor conjunto correto).
- Reusar padrão estabelecido (copiar estrutura da page/view mais parecida).
- Preservar comportamento existente; evitar rewrite.
- Manter Page/View separados; estado no `store.js` quando compartilhado.
- Não alterar partes não relacionadas; não deixar `console.log` de debug no diff.

---

## 6. Validação

Após a implementação:

1. `npm run build` (única checagem automática — não há lint).
2. Verificar manualmente o fluxo crítico afetado (`TESTING.md` §5) com `npm run dev` (porta 5173).
3. Revisar o diff final: o que mudou, o que foi validado, problemas restantes, arquivos não intencionais.
4. Checar os pontos de atenção: escape de XSS em dado novo interpolado, guard de guest em UI nova, mensagens em pt-BR.

Não há suíte de testes nem lint: **não inventar** scripts (`TESTING.md` §7).

---

## 7. Documentação

Atualizar a documentação quando a implementação mudar:

| Mudança | Documento |
|---|---|
| Requisito/escopo de produto | `PRD.md` |
| Jornada/estado de tela | `UX_FLOWS.md` |
| Visual (cor, componente, estado, a11y) | `DESIGN_SYSTEM.md` |
| Estrutura/decisão técnica/falha | `ARCHITECTURE.md` |
| Schema/propriedade/opção Notion | `DATABASE.md` |
| Rota/payload/envelope/erro | `API.md` |
| Regra de segurança | `SECURITY.md` |
| Convenção de código | `CODE_STYLE.md` |
| Estratégia/comandos de validação | `TESTING.md` |
| Workflow do agente | este arquivo |

Se a mudança afetar o `README.md` (funcionalidades/endpoints), atualizar junto — e, se for o caso, corrigir divergência já conhecida (ver `PRD.md` §12).

---

## 8. Tratamento de conflito

Se requisitos conflitarem (README × código, `COMPONENTES.md` × `CODE_STYLE.md`, docs antigos × novos, raiz × `docs/AGENTS.md`):

**Não adivinhar.** Identificar o conflito, apontar os trechos e pedir esclarecimento antes de implementar.

Se o código violar doc conhecido (bug): tratar como divergência a reportar, não como "padrão novo" a seguir silenciosamente (ex.: fetch cru no Kanban de `pages/status.js`).

---

## 9. Critérios de conclusão

A tarefa só está completa quando:

- [ ] Requisitos satisfeitos (conforme `PRD.md`/plano aprovado)
- [ ] `npm run build` passa
- [ ] Fluxo crítico afetado verificado manualmente
- [ ] Nenhum arquivo não relacionado mudou (sem debug no diff)
- [ ] Segurança respeitada (`escape_html`, guest, Bearer, sem segredo)
- [ ] Documentação de `docs/` atualizada quando necessário

No fim, resumir: o que mudou, arquivos alterados, validações rodadas e seus resultados, problemas restantes e docs atualizados.
