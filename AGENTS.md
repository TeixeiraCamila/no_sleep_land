# AGENTS.md: no_sleep_land

SPA sem framework para gerenciar entretenimento (filmes, séries, animes, dramas). Consome o `notion_api` (domínio **entertainment**) para CRUD, listagem e opções.

## Convenções comuns a todos os projetos

### Idioma

- Código de produção, comentários e erros retornados ao cliente: **pt-BR**.
- README.md é o único arquivo de documentação em **inglês** (onde aplicável); o restante (`docs/`, `AGENTS.md`, comentários) é pt-BR.

### Commits (Conventional Commits)

Formato:

```
<type>(<escopo opcional>): <descrição em português>
```

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `refactor:` refatoração sem mudança de comportamento
- `docs:` documentação
- `chore:` manutenção (deps, config, etc.)
- `style:` formatação/CSS sem mudança de lógica

Regras:

- **Só commitar quando o usuário pedir explicitamente** ("faça commit", "commita", "comita"...)
- Commits atômicos: um commit por funcionalidade/mudança lógica
- Merge commits: manter o padrão gerado pelo Git
- **A cada 5 commits locais** (desde o último push), rodar `git pull` automaticamente

### Comentários

- Explicam o _que_ e o _porquê_, não o _como_ (o código já mostra o como)
- Topo de arquivo: 1 linha descrevendo a responsabilidade
- Topo de função/componente: 1–2 linhas
- Inline: reservado para lógica não óbvia ou decisão de design
- Marcadores visuais em logs: ✅ ❌ 🔍 ⚡ 📝
- Máximo 3 linhas por comentário

### JavaScript

- Identificadores próprios (variáveis, funções e parâmetros) em **snake_case**
- Componentes, chaves de dados/API e APIs de bibliotecas seguem a convenção do ecossistema

## Comandos

- `npm run dev`: servidor de desenvolvimento (Vite).
- `npm run build`: build de produção.
- `npm run preview`: preview do build.

## Stack

- **Vanilla JavaScript (ES6+)**: sem framework, módulos ES (`import`/`export`).
- **Vite 6** com alias `@/` e Tailwind via `@tailwindcss/vite`.
- **Tailwind CSS v4** (`@import "tailwindcss"`): estilização utility-first.
- **Alpine.js**: reatividade declarativa apenas no formulário (`x-data`, `x-show`, `x-model`).
- **Fetch API**: comunicação REST (sem Axios).
- **Hash-based router** (`window.location.hash`) e **localStorage** para auth.
- Arquitetura: padrão **Page + View**: `pages/` (estado/lógica) + `views/` (templates em template literals).

## JavaScript

- Template literals para renderizar HTML
- `POST /api/auth/login` com `{ email, codigo }` devolve `{ token, user }`; o `Authorization: Bearer <token>` viaja em toda escrita. Detalhes em `notion_api/docs/auth.md`.
- Sessão no `localStorage`: `SESSION_TOKEN` (JWT, 30 dias), `SESSION_USER` (JSON) e `IS_GUEST` (visitante). Espelhados em memória em `services/api.js` para os guards serem síncronos.
- Guarda de sessão: `isLoggedIn()`/`isGuest()`/`isAuthorized()`. Visitante é **somente leitura** — a UI esconde os controles de escrita e o backend responde `401` se ele tentar por URL.
- `validateSession()` chama `GET /api/auth/me` no boot: um token expirado no `localStorage` não passa por sessão válida.
- Qualquer `401` fora do `POST /api/auth/login` limpa a sessão e volta para `/login`.
- O front **não** consome mais `GET /api/users`: o navegador não conhece a lista de usuários nem o código, só o token.
- Utilitários puros em `src/utils/` (html, images, date, episodes, search, autocomplete, country)
- `VITE_API_URL` do `.env` como origem da API; os caminhos já começam com `/api`, então o prefixo não é duplicado.

## CSS

- **Tailwind CSS v4** (via `@import "tailwindcss"`)
- **Tema escuro** (`background: #0a0a0a`), sidebar `zinc-900` à direita, fontes **Bebas Neue + Inter**
- Classes utilitárias Tailwind + classes custom kebab-case em `src/assets/style/style.css`
- Sidebar colapsável em mobile

## Estrutura

```
src/
├── main.js                  # Entry point + Alpine + router + registro de ações globais
├── router.js                # Hash router + lazy rendering
├── store.js                 # Estado global simples
├── actions.js               # Registry de ações de botões (id → função)
├── constants.js             # Constantes (localStorage keys, debounce, etc.)
├── services/
│   └── api.js               # Fetch wrapper + endpoints (request/authRequest)
├── components/
│   └── sidebar.js           # Sidebar de navegação
├── pages/                   # Lógica/estado: list, detail, form, login,
│                            #   status (Kanban), noCover, watch-next, poster
├── views/                   # Templates HTML: content, list, detail, form,
│                            #   login, status, noCover, watch-next
├── utils/                   # html, images, date, episodes, search, autocomplete, country
├── types/                   # Definições de tipo (documentação)
└── assets/style/style.css   # Tailwind + custom styles
```

## Consumo de API (notion_api)

`GET` `/api/entertainment` (+ `/all`, `/options`, `/:id`), `POST/PATCH/DELETE /api/entertainment` e `PATCH /api/entertainment/:id/status` (escritas, exigem token), `POST /api/auth/login`, `GET /api/auth/me`. Fluxo:

```
Router → Pages (fetch + state) → Views (render HTML) → DOM
                           ↕
                  services/api.js (Fetch)
                           ↕
                  notion_api → Notion CMS
```

> **Auth:** as escritas enviam `Authorization: Bearer <token>`, que o backend valida via `requireAuth` (`401` sem token válido). O modo visitante não tem token: lê, mas não escreve.

## Docs

- `docs/`: fonte da verdade do projeto — `PRD.md`, `DESIGN_SYSTEM.md`, `UX_FLOWS.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `SECURITY.md`, `CODE_STYLE.md`, `TESTING.md`, `AGENTS.md` (workflow do agente; ler antes de mudança significativa).
- `docs/CRIAR_NOVA_PAGE.md`: passo a passo atual para criar uma page/view nova (Page + View, rota, sidebar, busca, guards, docs e validação).
- `docs/COMPONENTES.md` e `docs/CRIAR_NOVA_VIEW.md`: guias antigos (desatualizados em nomenclatura/router — em conflito, o `docs/CODE_STYLE.md` manda).
- `docs/filtros.md`: histórico das features de filtro.
- `README.md`: visão geral, arquitetura, endpoints consumidos (contém divergências conhecidas com o código — ver `docs/PRD.md` §12).