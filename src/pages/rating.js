// Página Rating: agrupa os itens concluídos (status Done) por nota em colunas com busca local
// Nota só faz sentido em título terminado, então itens de outros status ficam de fora
// Fluxo: /all + /options em paralelo → filtro Done → view agrupa por rating → busca filtra localmente
import { render_rating, render_rating_items } from "../views/rating.js";
import { entertainment_api, is_logged_in, options_api } from "../services/api.js";
import {
  register_search_adapter,
  filter_by_name,
} from "../utils/sidebar-search.js";

export async function render_rating_page() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = render_rating(is_logged_in());

  const loading_el = document.getElementById("loading");
  const container = document.getElementById("rating-container");
  if (!loading_el || !container) return;

  loading_el.textContent = "Carregando...";

  try {
    const [all_items, options_response] = await Promise.all([
      entertainment_api.list_all_items(),
      options_api.get().catch(() => ({})),
    ]);

    // Só o que foi concluído entra no quadro de notas
    const items = all_items.filter((item) => item.status === "Done");

    // Opções do catálogo (acesso defensivo minúsculo/maiúsculo, como o status.js)
    let rating_options = [];
    if (Array.isArray(options_response.Rating)) {
      rating_options = options_response.Rating;
    } else if (Array.isArray(options_response.rating)) {
      rating_options = options_response.rating;
    }

    loading_el.classList.add("hidden");
    container.classList.remove("hidden");

    // Sem item concluído a grade mostraria só colunas zeradas
    if (!items.length) {
      container.innerHTML =
        '<p class="text-center py-8 text-zinc-500">Nenhum item encontrado.</p>';
      return;
    }

    container.innerHTML = render_rating_items(items, rating_options);

    // Busca da sidebar filtra em memória mantendo as colunas (options no closure)
    register_search_adapter("rating", (term) => {
      container.innerHTML = render_rating_items(
        filter_by_name(items, term),
        rating_options,
      );
    });
  } catch (error) {
    console.error("Erro ao carregar rating:", error);
    loading_el.textContent = `Erro ao carregar: ${error.message}`;
  }
}
