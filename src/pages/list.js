// Página de listagem: busca paginada com botão "Carregar mais"
// Fluxo: fetch por cursor → append em state.items → view com pagination
// Feature 1: filtros de status no topo (client-side sobre itens carregados)
import { state } from "../store.js";
import {
  entertainment_api,
  is_logged_in,
  options_api,
} from "../services/api.js";
import { render_list, render_list_items } from "../views/list.js";
import { register_action } from "../actions.js";
import { setup_debounced_search } from "../utils/search.js";
import { DEBOUNCE_SEARCH } from "../constants.js";

async function fetch_items(params) {
  return entertainment_api.list({
    search: state.params.search || undefined,
    ...params,
  });
}

// Renderiza grid de cards com busca em tempo real via API + filtros de status
export async function render_list_page() {
  const app = document.getElementById("app");
  if (!app) return;

  const search_term = state.params.search || "";

  // Aplica filtro sobre state.items (client-side)
  // null = Todos; string = nome exato do status
  const apply_filter = (filter = state.status_filter) => {
    if (!filter) return state.items;
    return state.items.filter((item) => item.status === filter);
  };

  // 1. Busca primeira página + opções de status (paralelo)
  let first_response;
  let options_response = {};
  try {
    [first_response, options_response] = await Promise.all([
      fetch_items({
        search: search_term || undefined,
        pageSize: 24,
        startCursor: undefined,
      }),
      options_api.get().catch(() => ({})),
    ]);
  } catch (error) {
    app.innerHTML = `<div class="p-8 text-red-400">Erro ao carregar listagem: ${error.message}</div>`;
    return;
  }

  // 2. Extrai status_options
  let status_options = [];
  if (Array.isArray(options_response.Status)) {
    status_options = options_response.Status;
  } else if (Array.isArray(options_response.status)) {
    status_options = options_response.status;
  }

  // 3. Inicializa estado
  state.items = first_response.data;
  state.pagination = {
    cursor: first_response.pagination.nextCursor,
    hasMore: first_response.pagination.hasMore,
    loading: false,
  };
  state.status_filter = state.status_filter ?? null;

  const logged_in = is_logged_in();

  // 4. Renderiza shell + grid
  app.innerHTML = render_list(
    logged_in,
    search_term,
    status_options,
    state.status_filter,
  );

  const loading_el = document.getElementById("loading");
  const list_container = document.getElementById("list-container");
  if (!loading_el || !list_container) return;

  loading_el.classList.add("hidden");
  list_container.classList.remove("hidden");
  list_container.innerHTML = render_list_items(apply_filter(), state.pagination);

  // 5. Carregamento de mais itens (paginado + respeita filtro)
  // Ação registrada pelo id do botão #load-more
  register_action("load-more", async () => {
    if (state.pagination.loading || !state.pagination.hasMore) return;
    state.pagination.loading = true;
    try {
      const response = await fetch_items({
        search: state.params.search || undefined,
        startCursor: state.pagination.cursor,
        pageSize: 24,
      });
      state.items = [...state.items, ...response.data];
      state.pagination = {
        cursor: response.pagination.nextCursor,
        hasMore: response.pagination.hasMore,
        loading: false,
      };
      list_container.innerHTML = render_list_items(
        apply_filter(),
        state.pagination,
      );
    } catch (error) {
      state.pagination.loading = false;
      list_container.innerHTML = `<div class="col-span-full text-center py-8 text-red-400">Erro ao carregar mais: ${error.message}</div>`;
    }
  });

  // 6. Filtros (delegacao)
  app.addEventListener("click", (event) => {
    const target = event.target.closest("[data-status]");
    if (!target) return;

    const status_value = target.dataset.status;
    if (status_value === "") {
      state.status_filter = null;
    } else {
      state.status_filter = status_value;
    }

    list_container.innerHTML = render_list_items(apply_filter(), state.pagination);

    const filter_buttons = app.querySelectorAll(".status-filters [data-status]");
    filter_buttons.forEach((btn) => {
      const btn_status = btn.dataset.status;
      const is_active =
        (btn_status === "" && state.status_filter === null) ||
        btn_status === state.status_filter;
      if (is_active) {
        btn.classList.add("bg-white", "text-black", "hover:bg-zinc-200");
        btn.classList.remove("text-zinc-300", "bg-zinc-900");
      } else {
        btn.classList.remove("bg-white", "text-black", "hover:bg-zinc-200");
        btn.classList.add("text-zinc-300", "bg-zinc-900");
      }
    });
  });

  // 7. Busca
  const search_input_el = document.getElementById("search-input");
  if (search_input_el) {
    setup_debounced_search(search_input_el, DEBOUNCE_SEARCH, (value) => {
      const search = value.trim();
      window.location.hash = search
        ? `/list/search=${encodeURIComponent(search)}`
        : "/list";
    });
  }

  const clear_search_btn = document.getElementById("clear-search");
  if (clear_search_btn) {
    clear_search_btn.addEventListener("click", () => {
      window.location.hash = "/list";
    });
  }
}
