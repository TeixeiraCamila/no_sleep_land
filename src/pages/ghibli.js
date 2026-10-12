// Página Ghibli: lista itens do estúdio Ghibli com busca local e opções de status (Kanban)
import { entertainment_api, is_logged_in, options_api } from "../services/api.js";
import { render_ghibli, render_ghibli_items } from "../views/ghibli.js";
import { register_search_adapter, filter_by_name } from "../utils/sidebar-search.js";

export async function render_ghibli_page() {
  const app = document.getElementById("app");
  if (!app) return;

  const logged_in = is_logged_in();

  app.innerHTML = render_ghibli(logged_in);

  const loading_el = document.getElementById("loading");
  const ghibli_container = document.getElementById("ghibli-container");

  if (!loading_el || !ghibli_container) return;

  try {
    const [items_response, options_response] = await Promise.all([
      entertainment_api.list({ studios: "Ghibli", pageSize: 100 }),
      options_api.get(),
    ]);

    const items = items_response.data || items_response;

    let status_options = [];
    if (Array.isArray(options_response.Status)) {
      status_options = options_response.Status;
    } else if (Array.isArray(options_response.status)) {
      status_options = options_response.status;
    }

    loading_el.classList.add("hidden");
    ghibli_container.classList.remove("hidden");
    ghibli_container.innerHTML = render_ghibli_items(items, status_options);

    register_search_adapter("ghibli", (term) => {
      const filtered_items = filter_by_name(items, term);
      ghibli_container.innerHTML = render_ghibli_items(filtered_items, status_options);
    });
  } catch (error) {
    console.error("Erro:", error);
    loading_el.textContent = `Erro: ${error.message}`;
  }
}