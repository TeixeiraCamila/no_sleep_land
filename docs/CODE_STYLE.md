# Code Style & Conventions

Mantém o código consistente em todo o projeto. As convenções gerais (idioma, commits, comentários, snake_case) estão no `AGENTS.md` da **raiz do repositório** — este documento detalha as que têm regra local própria.

> Atenção: `docs/COMPONENTES.md` e `docs/CRIAR_NOVA_VIEW.md` ainda descrevem a convenção antiga (`camelCase`, `usersAPI`, `registerPages`) — estão **desatualizados**; em conflito, este documento e o código mandam.

---

## 1. Princípios gerais

- Código direto, sem abstração especulativa; reaproveitar utils e components existentes.
- Consistência vence novidade: copiar o padrão da página/vizinha mais parecida.
- Mudança focada: não tocar em arquivo não relacionado.
- Sem dependência nova sem combinar (hoje: Alpine + Tailwind; `html2canvas` só por CDN).

---

## 2. Nomenclatura

Functions / variables / parameters / handlers:

`snake_case` para identificadores **próprios** (padrão do projeto, commit `refactor: padroniza identificadores próprios em snake_case`): `render_list_page`, `escape_html`, `is_logged_in`, `auth_request`, `search_term`, `status_options`, `load_more_el`.

Exceptions (seguem o ecossistema, não converter):

- APIs e globals: `Alpine.start()`, `localStorage`, `window.location.hash`.
- Campos de payload/Notion: `dateStart`, `episodesSeen`, `coverUrl`, `studios`, `tags`.
- Ids de DOM e data-attributes: `load-more`, `sidebar-search-input`, `data-status`.
- Estado do store: `state.items`, `state.pagination`, `state.status_filter` (chave em camelCase do template, valor snake_case).

Components / "classes":

- Templates não têm componentes de framework; blocos reutilizáveis ficam em `src/components/` com nome `camelCase`/`lowercase` histórico (`kanban.js`, `pagination.js`, `sidebar.js`, `itemCard.js`) — manter o nome do arquivo existente.

Files:

- Mistura histórica: `kebab-case` (`watch-next.js`, `sidebar-search.js`), `camelCase` (`noCover.js`, `kanban.js`), `lowercase` (`list.js`, `detail.js`). **Não renomear em massa** (quebra imports e histórico); arquivo **novo** usa `kebab-case` ou `lowercase` consistente com a página.

Classes CSS:

- Custom em `kebab-case`/BEM (`.list_item__title`, `.sidebar__search-input`, `.form-container`); utilities Tailwind inline no template.

---

## 3. Estrutura de pastas

- Padrão **Page + View**: `pages/` = estado + fetch + listeners; `views/` = funções puras retornando template literals. Nunca fetch em `views/`.
- Ações de botões: `actions.js` (registry id → função com delegação de clique); views só escrevem o `id`, pages registram a função.
- Só `services/api.js` conhece `fetch` para a API (**exceção conhecida**: `pages/status.js` faz fetch cru — pendência, não padrão a copiar).
- `components/` = blocos reutilizáveis (sidebar, kanban, pagination, itemCard).
- `utils/` = funções puras (`html`, `date`, `episodes`, `search`, `autocomplete`, `sidebar-search`, `images`, `country`).
- CSS: Tailwind nos templates + `assets/style/style.css` (custom) + `assets/poster/style.css` (isolado do Poster).
- Registro de rota em **dois** lugares: `router.js` (`route_map`) e `main.js` (`register_pages`) — seguir `docs/CRIAR_NOVA_VIEW.md` para o passo a passo (com as correções deste doc).

---

## 4. Imports

- Módulos ES (`import`/`export`); caminhos **relativos** — o alias `@/` existe no `vite.config.js` mas não é usado em nenhum import; não introduzir agora (mistura de estilos).
- Ordem livre (sem lint que imponha): manter a ordem do arquivo existente.
- `main.js` importa pages/components/utils de um lugar só — novas dependências entram no topo do arquivo que as usa.

---

## 5. Pages e Views

Pages:

- Responsabilidade única por rota; montam o shell (com `String.replace` para injetar filtros sem sobrescrever o container — ver `docs/filtros.md`), escondem `#loading` e populam o container.
- Tratar sempre os três estados: loading, erro (`try/catch` + mensagem na tela) e vazio. **Kanban (`pages/status.js`) hoje não trata erro** — não usar como exemplo.
- Handlers disparados por **clique em botão** são registrados no registry de ações (`actions.js`): a view escreve `id` único no botão e a page chama `register_action(id, handler)` — globais (sidebar/login) são registradas no `main.js`. Os únicos `window.*` que restam são de **inputs** (`oninput`/`onchange` da capa).

Views:

- Funções puras: entrada = dados, saída = string HTML. Sem fetch, sem `state`, sem efeitos.
- **Todo** dado de usuário interpolado passa por `escape_html()` (regra de segurança, ver `SECURITY.md`).
- Estados vazios/erro ficam na view com as mensagens já documentadas (`UX_FLOWS.md`).

Alpine.js:

- Só no formulário (`x-data`, `x-show`, `x-model`, `$watch`) para condicionar campos ao `status`/`type` — não espalhar reatividade para o resto do app.

---

## 6. Funções

- Uma lógica por função, nome que descreve o quê (`setup_debounced_search`, `render_episodes`, `filter_by_name`).
- Utils em `src/utils/` são **puras** (sem DOM/fetch) quando possível.
- Sem complexidade desnecessária; preferir duas funções claras a uma genérica com flag.

---

## 7. Tratamento de erro

Use:

- `throw new Error(mensagem_pt_BR)` nos serviços; quem chama captura e exibe na tela (`"Erro ao carregar listagem: ${error.message}"`) ou em `alert("Erro: " + error.message)` no form.
- A mensagem do backend (`error_data.message`) chega intacta via `api_request`: `error_data.message || "HTTP Error <status>: <statusText>"`.
- 401 → tratamento automático no wrapper (limpa sessão + `#/login`), **exceto** `POST /api/auth/login` (erro vai ao formulário).

Do not:

- `catch` vazio; `console.log` como tratamento (log de debug fica de fora do commit — ver PRD §12 sobre `poster.js`).
- Inventar mensagem técnica nova quando o backend já mandou uma em pt-BR.
- `alert()` para sucesso (padrão: navegar para `#/list`).

---

## 8. Comentários

- Explicam o **quê** e o **porquê**, nunca o como. 1 linha no topo de arquivo (responsabilidade), 1–2 no topo de função, inline só para decisão não óbvia; máximo 3 linhas; em pt-BR.
- Sem comentário que repete o código.

---

## 9. Logging

Use:

- Sem lib de log. Erros de API em dev: `console.error("[API Error]", method, url)` (só método+URL).
- Backend (quando mexer no `notion_api`): marcadores visuais ✅ ❌ 🔍 ⚡ 📝.

Rules:

- Nunca logar token, código de acesso, payload de escrita completo ou chaves `VITE_*`.
- Remover `console.log` de debug antes de commitar.

---

## 10. Formatação

Formatter:

Nenhum (sem Prettier) — seguir o estilo do arquivo (2 espaços, aspas do arquivo, ponto e vírgula como está).

Linter:

**Não existe** ESLint/Prettier/pre-commit no projeto (só `dev`, `build`, `preview`). A convenção de nomenclatura é humana/documentada aqui — revisar o diff manualmente.

Type checking:

Não existe (JS puro, sem TS nesta versão — TS é item futuro do PRD).

Build:

`npm run build` (`vite build`) é a única validação automática: roda antes de qualquer entrega.

---

## 11. Faça

- Reusar padrões existentes (copiar a página mais parecida como referência).
- Escapar todo dado interpolado (`escape_html`).
- Manter Page/View separados; ações de botão no registry `actions.js` (`register_action`), não em `onclick`/`window.*`.
- Seguir o `DESIGN_SYSTEM.md` para UI nova (Tailwind primeiro, tema escuro, sem sombra, cores de status pelas classes existentes).
- Atualizar doc quando a mudança afetar contrato/regra (tabela em `AGENTS.md` deste diretório).

## 12. Não faça

- Criar utilitário duplicado (já existem `escape_html`, `format_date`, `render_episodes`, `setup_debounced_search`, `filter_by_name`).
- Fetch cru fora de `services/api.js` (não seguir o exemplo de `pages/status.js`).
- Dependência nova sem combinar; renomear arquivo em massa.
- Ignorar o guard de guest ou "simplificar" removendo o `escape_html`.
- Misturar `camelCase` novo em identificadores próprios (docs antigos mandam isso — estão errados).
- Corrigir "às cegas" gotchas documentados (filtros `studios`/`tags` são AND, `type` não filtra server-side, `/all` descarta "Sem título", ordem de rotas do backend).
