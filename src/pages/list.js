// Página de listagem: busca paginada com botão "Carregar mais"
// Fluxo: fetch por cursor → append em state.items → view com pagination
import { state } from "../store.js";
import { entertainment_api, is_logged_in } from "../services/api.js";
import { render_list, render_list_items } from "../views/list.js";
import { create_paginated_loader } from "../components/pagination.js";
import { setup_debounced_search } from "../utils/search.js";
import { DEBOUNCE_SEARCH } from "../constants.js";

async function fetch_items(params) {
  return entertainment_api.list({
    search: state.params.search || undefined,
    ...params,
  });
}

// Renderiza grid de cards com busca em tempo real via API
export async function render_list_page() {
  const app = document.getElementById("app");
  if (!app) return;

  const search_term = state.params.search || "";
  app.innerHTML = render_list(is_logged_in(), search_term);

  const loading_el = document.getElementById("loading");
  const list_container = document.getElementById("list-container");
  const search_input = document.getElementById("search-input");
  const clear_search_btn = document.getElementById("clear-search");

  if (!loading_el || !list_container) return;

  const { load_more } = create_paginated_loader(fetch_items, render_list_items, "list-container");

  const perform_search = async (search) => {
    loading_el.classList.remove("hidden");
    list_container.classList.add("hidden");

    try {
      const response = await fetch_items({ search: search || undefined, pageSize: 24, startCursor: undefined });
      state.items = response.data;
      state.pagination = {
        cursor: response.pagination.nextCursor,
        hasMore: response.pagination.hasMore,
        loading: false,
      };

      loading_el.classList.add("hidden");
      list_container.classList.remove("hidden");
      list_container.innerHTML = render_list_items(state.items, state.pagination);
    } catch (error) {
      loading_el.textContent = `Erro: ${error.message}`;
    }
  };

  window.load_more = () => load_more();

  await perform_search(search_term);

  if (search_input) {
    setup_debounced_search(search_input, DEBOUNCE_SEARCH, (value) => {
      const search = value.trim();
      window.location.hash = search
        ? `/list/search=${encodeURIComponent(search)}`
        : "/list";
    });
  }

  if (clear_search_btn) {
    clear_search_btn.addEventListener("click", () => {
      window.location.hash = "/list";
    });
  }
}