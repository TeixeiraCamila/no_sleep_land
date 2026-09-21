// Página noCover: carrega todos os itens e filtra os que não possuem capa
// Fluxo: list_all() → view filtra localmente por !item.coverUrl → renderiza cards sem imagem
import { entertainment_api, is_logged_in } from "../services/api.js";
import { render_no_cover, render_no_cover_items } from "../views/noCover.js";
import { register_search_adapter, filter_by_name } from "../utils/sidebar-search.js";

// Lista apenas entretenimento sem coverUrl
export async function render_no_cover_page() {
  const app = document.getElementById("app");
  if (!app) return;

  const logged_in = is_logged_in();
  app.innerHTML = render_no_cover(logged_in);

  const loading_el = document.getElementById("loading");
  const no_cover_container = document.getElementById("noCover-container");

  if (!loading_el || !no_cover_container) return;

  loading_el.textContent = "Carregando itens sem capa...";

  try {
    const items_response = await entertainment_api.list_all();

    const items = items_response.data || items_response;

    loading_el.classList.add("hidden");
    no_cover_container.classList.remove("hidden");
    no_cover_container.innerHTML = render_no_cover_items(items);

    // Filtro local na sidebar filtra pelo nome sem nova requisição à API
    register_search_adapter("noCover", (term) => {
      const filtered_items = filter_by_name(items, term);
      no_cover_container.innerHTML = render_no_cover_items(filtered_items);
    });
  } catch (error) {
    console.error("Erro ao carregar itens sem capa:", error);
    loading_el.textContent = "Erro ao carregar itens.";
  }
}
