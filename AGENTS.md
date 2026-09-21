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
- Domínio de auth no front: header `X-User-Id` em escritas + guest mode + `isAuthorized`/`isLoggedIn`/`isGuest`
- Utilitários puros em `src/utils/` (html, images, date, episodes, search, autocomplete)
- `VITE_API_URL` do `.env` como base da API (fallback `/api`)

## CSS

- **Tailwind CSS v4** (via `@import "tailwindcss"`)
- **Tema escuro** (`background: #0a0a0a`), sidebar `zinc-900` à direita, fontes **Bebas Neue + Inter**
- Classes utilitárias Tailwind + classes custom kebab-case em `src/assets/style/style.css`
- Sidebar colapsável em mobile

## Consumo de API (notion_api)

`GET` `/api/entertainment` (+ `/all`, `/options`, `/:id`), `POST/PATCH/DELETE /api/entertainment` (escritas), `GET /api/users` (+ `/:id`). Fluxo:

```
Router → Pages (fetch + state) → Views (render HTML) → DOM
                           ↕
                  services/api.js (Fetch)
                           ↕
                  notion_api → Notion CMS
```

> **Auth (realidade):** escrever com auth envia o header `X-User-Id` (lido do `localStorage`), mas o backend **não valida** esse header: escritas de `entertainment` são públicas; a validação por JWT existe apenas para `books`. Os guards de permissão do front são a única camada real neste app.

## Estrutura

```
src/
├── main.js                  # Entry point + Alpine + router init
├── router.js                # Hash router + lazy rendering
├── store.js                 # Estado global simples
├── constants.js             # Constantes (localStorage keys, debounce, etc.)
├── services/
│   └── api.js               # Fetch wrapper + endpoints (request/authRequest)
├── components/
│   └── sidebar.js           # Sidebar de navegação
├── pages/                   # Lógica/estado: list, detail, form, login,
│                            #   status (Kanban), noCover, watch-next, poster
├── views/                   # Templates HTML: content, list, detail, form,
│                            #   login, status, noCover, watch-next
├── utils/                   # html, images, date, episodes, search, autocomplete
├── types/                   # Definições de tipo (documentação)
└── assets/style/style.css   # Tailwind + custom styles
```

## Docs

- `README.md`: visão geral, arquitetura, endpoints consumidos.
- `docs/`: `ANALISE_PROJETO.md`, `COMPONENTES.md`, `CRIAR_NOVA_VIEW.md`.