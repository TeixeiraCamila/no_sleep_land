// Busca centralizada da sidebar: um único listener decide o comportamento por rota
// Pages registram adapters via register_search_adapter (filtro local ou navegação); o router
// chama setup_sidebar_search() após cada render; rotas sem adapter buscam no server-side em /list
import { state } from "../store.js";
import { DEBOUNCE_SIDEBAR } from "../constants.js";

const adapters = {};

export function register_search_adapter(route, adapter) {
  adapters[route] = adapter;
}

export function filter_by_name(items, term) {
  const t = term.trim().toLowerCase();
  if (!t) return items;
  return items.filter((item) =>
    String(item.name || "").toLowerCase().includes(t),
  );
}

export function setup_sidebar_search() {
  const input = document.getElementById("sidebar-search-input");
  if (!input) return;

  let timeout;
  input.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const term = input.value.trim();
      const adapter = adapters[state.currentRoute];
      if (adapter) {
        adapter(term);
        return;
      }
      window.location.hash = term
        ? `/list/search=${encodeURIComponent(term)}`
        : "/list";
    }, DEBOUNCE_SIDEBAR);
  });
}