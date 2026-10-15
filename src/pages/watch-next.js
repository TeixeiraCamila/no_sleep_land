// Página Watch Next: busca paginada por status "Plan to watch"
// Fluxo: list({ status }) paginado → append no state → view com pagination
import { state } from "../store.js";
import { entertainment_api, is_logged_in } from "../services/api.js";
import { render_watch_next, render_watch_next_items, render_random_item } from "../views/watch-next.js";
import { register_action } from "../actions.js";
import { create_paginated_loader } from "../components/pagination.js";
import { register_search_adapter } from "../utils/sidebar-search.js";

async function fetch_watch_next(params) {
  return entertainment_api.list({
    status: "Plan to watch",
    search: state.params.search || undefined,
    ...params,
  });
}

// Carrega itens com status "Plan to watch" e exibe em grid
export async function render_watch_next_page() {
  const app = document.getElementById("app");
  if (!app) return;

  const logged_in = is_logged_in();
  app.innerHTML = render_watch_next(logged_in);

  const loading_el = document.getElementById("loading");
  const watch_next_container = document.getElementById("watch-next-container");

  if (!loading_el || !watch_next_container) return;

  const { load_more } = create_paginated_loader(fetch_watch_next, render_watch_next_items, "watch-next-container");

  // Busca server-side: navega com o termo na URL (rota watchNext lê search=)
  register_search_adapter("watchNext", (term) => {
    window.location.hash = term
      ? `/watchNext/search=${encodeURIComponent(term)}`
      : "/watchNext";
  });

  try {
    const response = await fetch_watch_next({ pageSize: 24, startCursor: undefined });

    state.items = response.data;
    state.pagination = {
      cursor: response.pagination.nextCursor,
      hasMore: response.pagination.hasMore,
      loading: false,
    };

    loading_el.classList.add("hidden");
    watch_next_container.classList.remove("hidden");
    watch_next_container.innerHTML = render_watch_next_items(state.items, state.pagination);

    // Ações registradas pelos ids dos botões da página
    register_action("load-more-watch-next", () => load_more());
  } catch (error) {
    console.error("Erro ao carregar Watch Next:", error);
    loading_el.textContent = "Falha ao carregar itens. Tente novamente.";
  }

  // Sorteia um item aleatório dos carregados e abre o modal com seus detalhes
  register_action("btn-random-watch-next", () => {
    if (state.items.length === 0) return;
    const random_index = Math.floor(Math.random() * state.items.length);
    const item = state.items[random_index];
    const modal = document.getElementById("random-modal");
    const body = document.getElementById("random-modal-body");
    if (modal && body) {
      body.innerHTML = render_random_item(item);
      modal.classList.remove("hidden");
    }
  });

  // Fecha o modal de sorteio escondendo o overlay
  register_action("btn-close-random-modal", () => {
    const modal = document.getElementById("random-modal");
    if (modal) modal.classList.add("hidden");
  });
}