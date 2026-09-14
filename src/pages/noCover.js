// Página noCover: carrega todos os itens e filtra os que não possuem capa
// Fluxo: listAll() → view filtra localmente por !item.coverUrl → renderiza cards sem imagem
import { entertainmentAPI, isLoggedIn } from "../services/api.js";
import { renderNoCover, renderNoCoverItems } from "../views/noCover.js";
import { registerSearchAdapter, filterByName } from "../utils/sidebar-search.js";

// Lista apenas entretenimento sem coverUrl
export async function renderNoCoverPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const loggedIn = isLoggedIn();
  app.innerHTML = renderNoCover(loggedIn);

  const loadingEl = document.getElementById("loading");
  const noCoverContainer = document.getElementById("noCover-container");

  if (!loadingEl || !noCoverContainer) return;

  loadingEl.textContent = "Carregando itens sem capa...";

  try {
    const itemsResponse = await entertainmentAPI.listAll();

    const items = itemsResponse.data || itemsResponse;

    loadingEl.classList.add("hidden");
    noCoverContainer.classList.remove("hidden");
    noCoverContainer.innerHTML = renderNoCoverItems(items);

    // Filtro local na sidebar filtra pelo nome sem nova requisição à API
    registerSearchAdapter("noCover", (term) => {
      const filteredItems = filterByName(items, term);
      noCoverContainer.innerHTML = renderNoCoverItems(filteredItems);
    });
  } catch (error) {
    console.error("Erro ao carregar itens sem capa:", error);
    loadingEl.textContent = "Erro ao carregar itens.";
  }
}
