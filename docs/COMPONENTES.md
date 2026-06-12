# Componentes e Padrões — No Sleep Land

Documentação da arquitetura, componentes, padrões e boas práticas do projeto.

## Índice

1. [Arquitetura](#arquitetura)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [Padrões de Código](#padrões-de-código)
4. [Pages e Views](#pages-e-views)
5. [Router](#router)
6. [API Service](#api-service)
7. [Store](#store)
8. [Utils](#utils)
9. [Componentes](#componentes)
10. [Constantes](#constantes)
11. [Como Criar uma Nova View](#como-criar-uma-nova-view)

---

## Arquitetura

A aplicação segue uma arquitetura SPA sem framework, baseada nos padrões:

- **Page + View** — Separação entre lógica (pages) e template (views)
- **Hash routing** — Navegação via `window.location.hash`
- **Estado global** — Objeto compartilhado em `store.js`
- **Camada de API** — Wrapper sobre Fetch API em `services/api.js`
- **Alpine.js** — Usado apenas no formulário para reatividade declarativa

### Fluxo de Dados

```
hashchange → Router → Page (fetch + state) → View (template literal) → DOM
                          ↕
                  services/api.js (Fetch API)
                          ↕
                  Backend API (backend__final) → Notion CMS
```

---

## Estrutura de Arquivos

```
src/
├── main.js              # Entry point: Alpine, router, globals
├── router.js            # Hash router + page registration
├── store.js             # Estado global
├── constants.js         # Constantes centralizadas
├── services/
│   └── api.js           # Fetch wrapper + API methods
├── components/
│   └── sidebar.js       # Sidebar navigation
├── pages/               # Lógica de cada página
│   ├── list.js          # Listagem
│   ├── detail.js        # Detalhes
│   ├── form.js          # Criar/Editar
│   ├── login.js         # Login
│   ├── status.js        # Kanban
│   ├── noCover.js       # Sem capa
│   └── watch-next.js    # Próximos
├── views/               # Templates HTML
│   ├── content.js       # Template base (renderMain)
│   ├── list.js
│   ├── detail.js
│   ├── form.js
│   ├── login.js
│   ├── status.js
│   ├── noCover.js
│   └── watch-next.js
└── utils/               # Funções utilitárias puras
    ├── html.js          # escapeHtml
    ├── images.js        # compressImage
    ├── date.js          # Formatação de datas
    ├── episodes.js      # Formatação de episódios
    ├── search.js        # Debounce
    └── autocomplete.js  # Autocomplete multi-select
```

---

## Padrões de Código

### Nomenclatura
- **Arquivos:** `kebab-case.js` (ex: `no-cover.js`, `watch-next.js`)
- **Funções:** `camelCase` (ex: `renderListPage`, `escapeHtml`)
- **Constantes:** `UPPER_SNAKE_CASE` (ex: `LS_LOGGED_USER`)
- **Variáveis:** `camelCase`
- **IDs CSS:** `kebab-case`

### Módulos
- ES Modules (`import`/`export`)
- Cada arquivo exporta funções, nunca classes
- Views exportam funções de template (retornam string HTML)
- Pages exportam funções de renderização (manipulam DOM)

### CSS
- Tailwind CSS utility classes como padrão
- Classes customizadas apenas quando necessário
- Tema escuro via classes Tailwind (`bg-zinc-900`, `text-zinc-100`, etc)

---

## Pages e Views

### Page (pages/)

Arquivos em `pages/` contêm a **lógica** da página:

- Data fetching via API
- Manipulação de eventos
- Atualização do estado global
- Chamada da view para renderizar HTML

**Padrão:**
```js
import { state } from "../store.js";
import { entertainmentAPI, isLoggedIn } from "../services/api.js";
import { renderList, renderListItems } from "../views/list.js";

export async function renderListPage() {
  const app = document.getElementById("app");
  app.innerHTML = renderList(isLoggedIn());

  const container = document.getElementById("list-container");
  const loading = document.getElementById("loading");

  try {
    const response = await entertainmentAPI.list({});
    state.items = response.data;
    container.innerHTML = renderListItems(response.data);
  } catch (error) {
    console.error(error);
  }
}
```

### View (views/)

Arquivos em `views/` contêm apenas **templates HTML** em template literals:

- Funções puras sem efeitos colaterais
- Recebem dados e retornam string HTML
- Usam `escapeHtml()` para sanitizar inputs
- Usam `renderMain()` de `views/content.js` como template base

**Padrão:**
```js
import { escapeHtml } from "../utils/html.js";
import { renderMain } from "./content.js";

export function renderList(loggedIn) {
  return `${renderMain(loggedIn, "list", "list-container")}`;
}

export function renderListItems(items) {
  if (items.length === 0) {
    return '<div class="text-center py-8 text-zinc-500">Nenhum item encontrado.</div>';
  }
  return items.map(item => `
    <div class="item-card">
      <h3>${escapeHtml(item.name)}</h3>
      <span>${escapeHtml(item.status || '')}</span>
    </div>
  `).join('');
}
```

### Template Base (views/content.js)

```js
export function renderMain(loggedIn, pageId, containerId) {
  return `
    <div class="flex">
      <aside id="sidebar">...</aside>
      <main>
        <div id="loading" class="hidden">Carregando...</div>
        <div id="${containerId}" class="hidden"></div>
      </main>
    </div>
  `;
}
```

---

## Router

Hash-based router em `router.js`. Mapeia URLs para funções de página.

### Registro de Rotas

Em `main.js`:
```js
registerPages({
  list: renderListPage,
  detail: renderDetailPage,
  create: renderFormPage,
  edit: renderFormPage,
  login: renderLoginPage,
  status: renderStatusPage,
  noCover: renderNoCoverPage,
  watchNext: renderWatchNextPage,
});
```

### Mapa de Rotas

| URL | Rota | Page |
|-----|------|------|
| `#/list` | `list` | `renderListPage` |
| `#/list/search=termo` | `list` | `renderListPage` (com params) |
| `#/detail/:id` | `detail` | `renderDetailPage` |
| `#/create` | `create` | `renderFormPage` |
| `#/edit/:id` | `edit` | `renderFormPage` |
| `#/login` | `login` | `renderLoginPage` |
| `#/status` | `status` | `renderStatusPage` |
| `#/noCover` | `noCover` | `renderNoCoverPage` |
| `#/watchNext` | `watchNext` | `renderWatchNextPage` |

### Guard de Autenticação

O router redireciona para `/login` se o usuário não estiver autorizado. Usuários logados não veem a página de login.

---

## API Service

`services/api.js` contém o wrapper Fetch API e os endpoints.

### Núcleo

```js
async function request(url, options = {})        // Sem auth
async function authRequest(url, options = {})    // Com X-User-Id
```

### Endpoints Disponíveis

| Método | Função | Requer Auth |
|--------|--------|-------------|
| `entertainmentAPI.list(params)` | Listar | Não |
| `entertainmentAPI.listAll()` | Todos | Não |
| `entertainmentAPI.get(id)` | Detalhe | Não |
| `entertainmentAPI.create(data)` | Criar | Sim |
| `entertainmentAPI.update(id, data)` | Atualizar | Sim |
| `entertainmentAPI.delete(id)` | Deletar | Sim |
| `optionsAPI.get()` | Opções | Não |
| `usersAPI.list()` | Usuários | Não |
| `usersAPI.get(id)` | Usuário | Não |

### Auth

```js
import { isLoggedIn, isGuest, isAuthorized, logout } from "../services/api.js";
```

- `isLoggedIn()` — Usuário logado (tem ID no localStorage)
- `isGuest()` — Modo visitante
- `isAuthorized()` — Logado ou visitante
- `logout()` — Limpa dados de auth

---

## Store

Estado global compartilhado em `store.js`:

```js
export const state = {
  currentRoute: "/",
  params: {},
  items: [],
};
```

- `state.items` — Armazena listas de itens carregados
- `state.currentRoute` — Rota ativa
- `state.params` — Parâmetros extraídos da URL

---

## Utils

Funções puras em `utils/`:

| Arquivo | Funções | Descrição |
|---------|---------|-----------|
| `html.js` | `escapeHtml(str)` | Sanitiza strings para evitar XSS |
| `images.js` | `compressImage(file)` | Comprime imagem para base64 |
| `date.js` | `formatDate()`, etc | Formatação de datas |
| `episodes.js` | `formatEpisodes()`, etc | Formatação de episódios |
| `search.js` | `debounce(fn, delay)` | Debounce para busca |
| `autocomplete.js` | — | Lógica de autocomplete multi-select |

---

## Constantes

Centralizadas em `constants.js`:

```js
export const MAX_IMAGE_SIZE = 800;
export const IMAGE_QUALITY = 0.7;
export const DEBOUNCE_SEARCH = 300;
export const DEBOUNCE_SIDEBAR = 600;
export const AUTOCOMPLETE_BLUR_DELAY = 200;
export const LS_LOGGED_USER = "USER_LOGADO";
export const LS_GUEST = "USER_GUEST";
```

---

## Componentes

### Sidebar

`components/sidebar.js` — Navegação lateral com:
- Links para cada rota
- Botão de login/logout
- Busca com debounce
- Destaque da página ativa

---

## Como Criar uma Nova View

Veja o guia detalhado em [docs/CRIAR_NOVA_VIEW.md](./CRIAR_NOVA_VIEW.md).

### Resumo:

1. **Criar view** em `src/views/minha-nova.js` com funções de template
2. **Criar page** em `src/pages/minha-nova.js` com lógica e data fetching
3. **Registrar rota** em `src/router.js`
4. **Importar e registrar** em `src/main.js`
5. **Adicionar link** na sidebar se necessário
