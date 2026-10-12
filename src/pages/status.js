// Página Kanban: agrupa todos os itens por status em colunas com busca local
// Carrega TODOS os itens (via /all + options); a view agrupa por status e filtra localmente
// Filtro por Type no topo (client-side), mantendo todas as colunas de Status visíveis
import { state } from "../store.js";
import { render_status, render_status_items } from "../views/status.js";
import { is_logged_in } from "../services/api.js";
import { options_api } from "../services/api.js";
import { register_search_adapter, filter_by_name } from "../utils/sidebar-search.js";

async function fetch_all_entertainment() {
  const base_url = import.meta.env.VITE_API_URL;
  const res = await fetch(`${base_url}/api/entertainment/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Erro ao buscar todos os itens: ${res.status}`);
  }

  const json = await res.json();
  // Retorno padrão do domínio: { data: [...] } ou array
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.data)) return json.data;
  return [];
}

// Carrega todos os itens e organiza por status em colunas
export async function render_status_page() {
  const app = document.getElementById("app");
  if (!app) return;

  const logged_in = is_logged_in();

  // Carrega TODOS os itens + opções (Status + Type) em paralelo
  const [all_items, options_response] = await Promise.all([
    fetch_all_entertainment(),
    options_api.get().catch(() => ({})),
  ]);

  const items = all_items;

  // Extrai opções de status
  let status_options = [];
  if (Array.isArray(options_response.Status)) {
    status_options = options_response.Status;
  } else if (Array.isArray(options_response.status)) {
    status_options = options_response.status;
  }

  // Extrai opções de Type
  let type_options = [];
  if (Array.isArray(options_response.Type)) {
    type_options = options_response.Type;
  } else if (Array.isArray(options_response.type)) {
    type_options = options_response.type;
  }

  // Salva todos os itens no estado global
  state.items = items;
  // Limpa paginação (não usada nesta página)
  state.pagination = {
    cursor: null,
    hasMore: false,
    loading: false,
  };
  // Inicializa filtro de Type (preserva anterior se existir)
  state.type_filter = state.type_filter ?? null;

  const apply_type_filter = (filter = state.type_filter, base_items = state.items) => {
    if (!filter) return base_items;
    return base_items.filter((item) => item.type === filter);
  };

  // Renderiza shell com filtros de Type
  app.innerHTML = render_status(logged_in, type_options, state.type_filter);

  const loading_el = document.getElementById("loading");
  const status_container = document.getElementById("status-container");
  if (!loading_el || !status_container) return;

  loading_el.classList.add("hidden");
  status_container.classList.remove("hidden");

  const base_initial = apply_type_filter();
  status_container.innerHTML = render_status_items(base_initial, status_options);

  // Busca local: filtra por termo DENTRO do filtro de Type ativo
  register_search_adapter("status", (term) => {
    const base = apply_type_filter(state.type_filter, state.items);
    const filtered_items = term ? filter_by_name(base, term) : base;
    status_container.innerHTML = render_status_items(filtered_items, status_options);
  });

  // Delegação de cliques nos botões de filtro por Type
  app.addEventListener("click", (event) => {
    const target = event.target.closest("[data-type]");
    if (!target) return;

    const type_value = target.dataset.type;
    if (type_value === "") {
      state.type_filter = null;
    } else {
      state.type_filter = type_value;
    }

    const search_input_el =
      document.getElementById("sidebar-search") ||
      document.getElementById("sidebar-search-input") ||
      document.querySelector(".search-input");
    const term_active = search_input_el?.value?.trim() || "";

    const base_filtered = apply_type_filter(state.type_filter, state.items);
    const filtered_items_final = term_active
      ? filter_by_name(base_filtered, term_active)
      : base_filtered;

    status_container.innerHTML = render_status_items(
      filtered_items_final,
      status_options,
    );

    const filter_buttons = app.querySelectorAll(".type-filters [data-type]");
    filter_buttons.forEach((btn) => {
      const btn_type = btn.dataset.type;
      const is_active =
        (btn_type === "" && state.type_filter === null) ||
        btn_type === state.type_filter;
      if (is_active) {
        btn.classList.add("bg-white", "text-black", "hover:bg-zinc-200");
        btn.classList.remove("text-zinc-300", "bg-zinc-900");
      } else {
        btn.classList.remove("bg-white", "text-black", "hover:bg-zinc-200");
        btn.classList.add("text-zinc-300", "bg-zinc-900");
      }
    });
  });
}
