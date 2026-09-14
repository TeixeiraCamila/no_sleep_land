// Busca centralizada da sidebar: um único listener decide o comportamento por rota
// Fluxo: pages registram adapters via registerSearchAdapter (filtro local ou navegação);
// o router chama setupSidebarSearch() após cada render; rotas sem adapter fazem busca
// server-side em /list (fallback)
import { state } from "../store.js";
import { DEBOUNCE_SIDEBAR } from "../constants.js";

const adapters = {};

export function registerSearchAdapter(route, adapter) {
  adapters[route] = adapter;
}

export function filterByName(items, term) {
  const t = term.trim().toLowerCase();
  if (!t) return items;
  return items.filter((item) =>
    String(item.name || "").toLowerCase().includes(t),
  );
}

export function setupSidebarSearch() {
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