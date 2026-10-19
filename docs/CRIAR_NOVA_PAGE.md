# Criar uma Nova Page (guia genérico)

Passo a passo para adicionar uma tela nova no No Sleep Land, seguindo o padrão **Page + View** e as convenções de `CODE_STYLE.md` (em conflito, ele e o código mandam).

> **Substitui** `docs/CRIAR_NOVA_VIEW.md` e `docs/COMPONENTES.md`, que ainda descrevem a convenção antiga (`camelCase`, `renderListPage`, router em `if/else`). Use este.

---

## 0. Antes de começar

1. Ler o que for relevante em `docs/` (`CODE_STYLE.md`, `UX_FLOWS.md`, `DESIGN_SYSTEM.md`, `API.md`, `SECURITY.md`).
2. Escolher a **página de referência** e copiar a estrutura dela (regra: *consistência vence novidade*):
   - **Lista simples com filtro local** → `pages/noCover.js` + `views/noCover.js` (a mais enxuta).
   - **Lista com busca/paginação server-side** → `pages/watch-next.js`.
   - **Rota com parâmetro** → `pages/detail.js` (`state.params.id`).
   - **Formulário com Alpine** → `pages/form.js` (Alpine só existe aqui).
3. Responder rápido: a tela precisa de **rota nova** (hoje `#/noCover` não tem link na sidebar — evite repetir isso), de **endpoint novo** no backend, de **escrita** (exige sessão) ou só leitura?

---

## 1. View — template puro (`src/views/<rota>.js`)

Funções **puras**: entram dados, sai string HTML. **Nunca** `fetch`, `state`, DOM ou Alpine aqui.

```javascript
// views/exemplo.js: template da página exemplo (lista simples)
import { render_main } from "./content.js";
import { escape_html } from "../utils/html.js";

// Layout base: sidebar + #loading + container com id único
export function render_exemplo(logged_in) {
  return render_main(logged_in, "exemplo", "exemplo-container");
}

// Conteúdo: entra Array de itens, sai HTML pronto
export function render_exemplo_items(items) {
  if (!items.length) {
    return '<p class="text-center py-8 text-zinc-500">Nenhum item encontrado.</p>';
  }

  return `<div class="flex flex-wrap gap-8">
    ${items
      .map(
        (item) => `
      <article class="p-4 border border-zinc-800">
        <h3 class="font-semibold">${escape_html(item.name)}</h3>
      </article>`,
      )
      .join("")}
  </div>`;
}
```

Regras:

- **Todo** dado de usuário interpolado passa por `escape_html()` (`SECURITY.md` — não "simplificar" removendo).
- Layout sempre via `render_main(logged_in, active_page, container_id)` de `views/content.js` (ele já injeta a sidebar, o botão toggle, o `#loading` e o container).
- Estado **vazio** com mensagem na própria view (pt-BR, ex.: `"Nenhum item encontrado."`).
- Identificadores próprios em `snake_case`; arquivo novo em `kebab-case`/`lowercase`.
- Textos de UI: **inglês** em sidebar/form/detalhe, pt-BR no resto (`DESIGN_SYSTEM.md` §2).

---

## 2. Page — estado + dados (`src/pages/<rota>.js`)

Uma função `async` exportada por rota: monta o shell, esconde o loading, popula o container. `fetch` **só** via `services/api.js`.

```javascript
// pages/exemplo.js: carrega itens e renderiza a página exemplo
import { entertainment_api, is_logged_in } from "../services/api.js";
import { render_exemplo, render_exemplo_items } from "../views/exemplo.js";
import { register_search_adapter, filter_by_name } from "../utils/sidebar-search.js";
import { register_action } from "../actions.js";

export async function render_exemplo_page() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = render_exemplo(is_logged_in());

  const loading_el = document.getElementById("loading");
  const container = document.getElementById("exemplo-container");
  if (!loading_el || !container) return;

  loading_el.textContent = "Carregando...";

  try {
    const response = await entertainment_api.list({ pageSize: 24 });
    const items = response.data || response;

    loading_el.classList.add("hidden");
    container.classList.remove("hidden");
    container.innerHTML = render_exemplo_items(items);

    // Busca da sidebar filtra em memória (sem nova requisição)
    register_search_adapter("exemplo", (term) => {
      container.innerHTML = render_exemplo_items(filter_by_name(items, term));
    });

    // Ações de botão: id no template → função aqui (nunca lógica em onclick)
    register_action("exemplo-refresh", () => render_exemplo_page());
  } catch (error) {
    console.error("Erro ao carregar exemplo:", error);
    loading_el.textContent = `Erro ao carregar: ${error.message}`;
  }
}
```

Regras:

- Tratar **os três estados**: loading (`#loading`), erro (`try/catch` com mensagem **na tela**) e vazio. Paginação/trava de loading (como o Kanban em `pages/status.js`) **não** é exemplo a seguir.
- Estado compartilhado em `state` (`store.js`) só quando outra página precisa dele (`state.items`, `state.params`, `state.currentRoute`).
- Parâmetros da URL chegam em `state.params` (ex.: `#/detalhe/123` → `state.params.id`).

---

## 3. Registrar a rota (dois lugares obrigatórios)

**a) `src/router.js` — `route_map`:**

```javascript
// no route_map, junto das demais
exemplo: () => ({ route: "exemplo", params: {} }),

// com parâmetro na URL (#/exemplo/123):
// exemplo: (parts) => ({ route: "exemplo", params: { id: parts[1] } }),
```

**b) `src/main.js` — import + `register_pages`:**

```javascript
import { render_exemplo_page } from "./pages/exemplo.js";

register_pages({
  // ...rotas existentes
  exemplo: render_exemplo_page,
});
```

Notas do router (não precisa reinventar):

- Sem sessão (`!is_authorized()`) → redireciona para `#/login` (só a rota `login` é isenta); logado em `#/login` → `#/list`.
- Rota **desconhecida cai em `list`** (não existe tela 404); rota registrada sem função de render → `console.error` e a tela fica como estava.
- Depois de cada render o router chama `setup_sidebar_search()` — a busca da sidebar já funciona sem código extra.

---

## 4. Navegação na sidebar (`src/components/sidebar.js`) — opcional

```javascript
<button onclick="window.location.hash = '/exemplo'" class="sidebar-btn ${active_page === "exemplo" ? "bg-zinc-800" : ""} cursor-pointer">
  Example
</button>
```

Sem este botão a tela só é alcançável por URL (é o caso de `#/noCover`, pendência registrada no `PRD.md` §12) — prefira expor na navegação. O `active_page` do `render_main` é o que acende o item.

---

## 5. Busca da sidebar (`src/utils/sidebar-search.js`)

- **Padrão (sem adapter):** digitar na sidebar navega para `#/list/search=<termo>` — serve para páginas sem busca própria.
- **Filtro local:** `register_search_adapter("<rota>", (term) => ...)` na page (ex.: `filter_by_name(items, term)`).
- **Busca server-side:** navegar na própria rota (ex.: `#/watchNext/search=<termo>`) e ler `state.params.search`.

---

## 6. Sessão e permissões (`SECURITY.md`)

- **Leitura** é pública; **escrita** (`create`/`update`/`delete`) sai só com `auth_request` (o wrapper do `services/api.js` já adiciona o `Authorization: Bearer`).
- Modo **visitante** (`is_guest()`): somente leitura — a UI esconde controles de escrita (botão "+ Add", Edit/Delete) e o backend responde `401` se tentar por URL.
- Guards síncronos em `services/api.js`: `is_authorized()` (leitura), `is_logged_in()` (escrita), `is_guest()`.
- Qualquer `401` fora do login limpa a sessão e volta para `#/login` automaticamente — não duplicar essa lógica.

---

## 7. Estados, erro e visual

| Estado | Onde | Padrão |
|---|---|---|
| Loading | `#loading` (do `render_main`) | texto simples ("Carregando…") escondido ao render |
| Erro | `catch` da page | mensagem pt-BR **na tela** (`Erro ao carregar X: ${error.message}`) |
| Vazio | view | mensagem amigável em pt-BR |
| Sem permissão | page (antes do fetch) | tela de aviso com botão (`render_form_access_denied` é o exemplo) |

- Visual: `DESIGN_SYSTEM.md` — Tailwind primeiro, tema escuro (`#0a0a0a`), **sem sombra**, cores de status pelas classes `.done/.watching/.plan_to_watch/.dropped_paused`, fontes Bebas Neue + Inter.
- Classe custom nova → `kebab-case` em `src/assets/style/style.css`.
- Erro de escrita no form → `alert("Erro: " + error.message)`; sucesso → navegar para `#/list` (nunca `alert` de sucesso).

---

## 8. Ações de botão e Alpine

- Botão com lógica → a view escreve só o **id** (`<button id="exemplo-refresh">`) e a page registra com `register_action("exemplo-refresh", handler)`. Únicos `onclick`/`window.*` aceitos são navegação de hash (sidebar/Cancelar) e inputs de capa.
- Ações **globais** (sidebar/login) ficam no `main.js`; as da página, na própria page logo após o render.
- **Alpine.js** só no formulário (`x-data`, `x-show`, `x-model`, `$watch`) — não espalhar reatividade.

---

## 9. Documentação a atualizar

| O que mudou | Documento |
|---|---|
| Nova jornada/tela com estados | `UX_FLOWS.md` (novo fluxo + linha no checklist final) |
| Requisito/escopo de produto | `PRD.md` |
| Decisão técnica/estrutura | `ARCHITECTURE.md` |
| Rota/payload/envelope novo | `API.md` |
| Visual (cor, estado, a11y) | `DESIGN_SYSTEM.md` |
| Regra de segurança | `SECURITY.md` |
| Funcionalidades/árvore visível ao usuário | `README.md` |
| Arquivo novo em `src/` | árvore do `AGENTS.md` (raiz) |

---

## 10. Validação

1. `npm run build` (única checagem automática — **não** há lint/testes; não inventar scripts).
2. `npm run dev` (porta 5173) → percorrer o fluxo novo manualmente (`TESTING.md`): loading, erro (derrubar a API), vazio, busca da sidebar, permissão de guest.
3. Revisar o diff: escape de XSS em dado interpolado, guard de guest, mensagens em pt-BR, nenhum `console.log` de debug, nenhum arquivo fora do escopo.
4. Commit só quando pedido explicitamente (`<type>(<escopo>): descrição` em pt-BR).

---

## Checklist final

- [ ] View pura com `render_main` + `escape_html` em todo dado interpolado
- [ ] Page com loading/erro/vazio e fetch via `services/api.js`
- [ ] Rota registrada em `router.js` **e** `main.js`
- [ ] Link na sidebar (ou decisão consciente de rota só-por-URL)
- [ ] Adapter de busca definido (ou comportamento default aceito)
- [ ] Escrita protegida: `auth_request` + esconder controle do visitante
- [ ] Botões no registry `actions.js`
- [ ] Docs atualizadas + `npm run build` + fluxo manual
- [ ] Sem dependência nova, sem util duplicado, sem renomear arquivo

---

## Não faça

- `camelCase` em identificador próprio (`renderExemploPage`, `escapeHtml`) — convenção antiga dos guias desatualizados.
- `fetch` fora de `services/api.js` (o fetch cru de `pages/status.js` é pendência, não padrão).
- Copiar o Kanban como exemplo de tratamento de erro (hoje não trata).
- Lista fixa de status/tipo no front: a fonte é `GET /api/entertainment/options`.
- Enviar `progress` no payload: é **formula** do Notion, somente leitura (`DATABASE.md` §7).
- Tela 404: não existe (fallback para `#/list`) — não inventar sem combinar.
