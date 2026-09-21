// Página Kanban: agrupa todos os itens por status em colunas com busca local
// Fluxo: carrega dados + options em paralelo → view agrupa itens por status → busca filtra localmente
import { entertainment_api, is_logged_in, options_api } from "../services/api.js";
import { render_status, render_status_items } from "../views/status.js";
import { register_search_adapter, filter_by_name } from "../utils/sidebar-search.js";

// Carrega todos os itens e organiza por status em colunas
export async function render_status_page() {
  const app = document.getElementById("app");
  if (!app) return;

  const logged_in = is_logged_in();

  // Renderiza template base
  app.innerHTML = render_status(logged_in);

  const loading_el = document.getElementById("loading");
  const status_container = document.getElementById("status-container");

  if (!loading_el || !status_container) return;

  try {
    // Carrega itens e opções em paralelo
    const [items_response, options_response] = await Promise.all([
      entertainment_api.list_all(),
      options_api.get(),
    ]);

    // Normaliza resposta (API pode retornar de formas diferentes)
    const items = items_response.data || items_response;

    // Extrai opções de status (API pode retornar como "Status" ou "status")
    let status_options = [];
    if (Array.isArray(options_response.Status)) {
      status_options = options_response.Status;
    } else if (Array.isArray(options_response.status)) {
      status_options = options_response.status;
    }

    loading_el.classList.add("hidden");
    status_container.classList.remove("hidden");
    status_container.innerHTML = render_status_items(items, status_options);

    // Filtro local na sidebar filtra pelo nome sem nova requisição à API
    register_search_adapter("status", (term) => {
      const filtered_items = filter_by_name(items, term);
      status_container.innerHTML = render_status_items(filtered_items, status_options);
    });
  } catch (error) {
    console.error("Erro:", error);
    loading_el.textContent = `Erro: ${error.message}`;
  }
}
