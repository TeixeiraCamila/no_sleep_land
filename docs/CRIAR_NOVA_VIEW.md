# Como Criar uma Nova View no No Sleep Land

## Estrutura de Arquivos

```
src/
├── pages/          # Lógica da página (API, eventos, DOM)
│   └── list.js     # → renderListPage()
├── views/          # Templates HTML (apenas renderização)
│   └── list.js     # → renderList()
├── router.js       # Rotas (#/list, #/detail, etc)
└── main.js         # Registro de páginas
```

---

## Passo 1: Criar a View (template)

Criar `src/views/minhanova.js`:

```javascript
import { escapeHtml } from "../utils/html.js";
import { renderMain } from "./content.js";

/**
 * Renderiza o template base da página
 * @param {boolean} loggedIn - Se usuário está logado
 * @returns {string} HTML da página
 */
export function renderMinhaNova(loggedIn) {
  return `
    ${renderMain(loggedIn, "minhanova", "minhanova-container")}
  `;
}

/**
 * Renderiza os itens da lista
 * @param {Array} items - Array de itens
 * @returns {string} HTML dos itens
 */
export function renderMinhaNovaItems(items) {
  if (items.length === 0) {
    return '<div class="text-center py-8 text-zinc-500">Nenhum item encontrado.</div>';
  }

  return items.map(item => `
    <div class="item-card p-4 border border-zinc-800">
      <h3>${escapeHtml(item.name)}</h3>
    </div>
  `).join('');
}
```

---

## Passo 2: Criar a Page (lógica)

Criar `src/pages/minhanova.js`:

```javascript
import { state } from "../store.js";
import { entertainmentAPI, isLoggedIn } from "../services/api.js";
import { renderMinhaNova, renderMinhaNovaItems } from "../views/minhanova.js";

/**
 * Renderiza a página - lógica principal
 */
export async function renderMinhaNovaPage() {
  const app = document.getElementById("app");
  if (!app) return;

  // Renderiza template base
  app.innerHTML = renderMinhaNova(isLoggedIn());

  // Referências DOM
  const loadingEl = document.getElementById("loading");
  const container = document.getElementById("minhanova-container");

  if (!loadingEl || !container) return;

  // Carrega dados
  loadingEl.classList.remove("hidden");

  try {
    const response = await entertainmentAPI.list({});
    state.items = response.data;

    loadingEl.classList.add("hidden");
    container.classList.remove("hidden");
    container.innerHTML = renderMinhaNovaItems(response.data);
  } catch (error) {
    loadingEl.textContent = `Erro: ${error.message}`;
  }
}
```

---

## Passo 3: Registrar no Router

Em `src/router.js`, adicionar no parsing de rotas (após linha 127):

```javascript
// /minhanova → minha nova página
else if (parts[0] === "minhanova") {
  route = "minhanova";
}
```

---

## Passo 4: Registrar no Main.js

Em `src/main.js`:

**Importar a função:**
```javascript
import { renderMinhaNovaPage } from "./pages/minhanova.js";
```

**Registrar no registerPages:**
```javascript
registerPages({
  // ...rotas existentes
  minhanova: renderMinhaNovaPage
});
```

---

## Passo 5: Adicionar item no Sidebar

Em `src/components/sidebar.js` - adicionar no nav:

```javascript
<button onclick="window.location.hash = '/minhanova'" class="sidebar-btn ${activePage === "minhanova" ? "bg-zinc-800" : ""} cursor-pointer">
  Minha Nova Página
</button>
```

---

## Estrutura de Rotas

| URL | Rota | Page Function |
|-----|------|---------------|
| `#/list` | list | renderListPage |
| `#/detail/123` | detail | renderDetailPage |
| `#/create` | create | renderFormPage |
| `#/edit/456` | edit | renderFormPage |
| `#/login` | login | renderLoginPage |
| `#/status` | status | renderStatusPage |
| `#/noCover` | noCover | renderNoCoverPage |
| `#/minhanova` | minhanova | renderMinhaNovaPage |

---

## Exemplo: Page com parâmetros de URL

Se a rota for `#/minhanova/123`, recuperar assim:

```javascript
// No router.js
else if (parts[0] === "minhanova" && parts[1]) {
  route = "minhanova";
  params = { id: parts[1] };
}

// Na page
const itemId = state.params.id;
```

---

## Funções Auxiliares Disponíveis

**API:**
- `entertainmentAPI.list(params)` - lista com filtros
- `entertainmentAPI.get(id)` - busca por ID
- `entertainmentAPI.create(data)` - cria novo
- `entertainmentAPI.update(id, data)` - atualiza
- `entertainmentAPI.delete(id)` - deleta (arquiva)

**Estado:**
- `state.items` - armazena lista atual
- `state.currentRoute` - rota atual
- `state.params` - parâmetros da URL

**Utils:**
- `escapeHtml(str)` - escapa HTML
- `isLoggedIn()` - verifica login
- `isAuthorized()` - verifica login ou guest

---

## Padrão Detail (com parâmetros)

Para páginas que precisam de dados antes de renderizar (ex: detail):

```javascript
// views/minhadetail.js
import { renderMain } from "./content.js";
import { escapeHtml } from "../utils/html.js";

export function renderMinhaDetail(loggedIn) {
  return `${renderMain(loggedIn, "minhadetail", "minhadetail-container")}`;
}

export function renderMinhaDetailContent(item, loggedIn, isGuest) {
  // Template com dados do item
  return `...`;
}

// pages/minhadetail.js
import { renderMinhaDetail, renderMinhaDetailContent } from "../views/minhadetail.js";

export async function renderMinhaDetailPage() {
  // Busca dados primeiro
  const item = await entertainmentAPI.get(state.params.id);
  
  // Renderiza container
  app.innerHTML = renderMinhaDetail(isLoggedIn());
  
  // Preenche conteúdo
  document.getElementById("minhadetail-container").innerHTML = 
    renderMinhaDetailContent(item, isLoggedIn(), isGuest());
}
```