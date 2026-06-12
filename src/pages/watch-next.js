// Página Watch Next: filtra itens por status "Plan to watch" e exibe em grid
import { state } from "../store.js";
import { entertainmentAPI, isLoggedIn, optionsAPI } from "../services/api.js";
import { renderWatchNext, renderWatchNextItems } from "../views/watch-next.js";

// Carrega itens com status "Plan to watch" e exibe em grid
export async function renderWatchNextPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const loggedIn = isLoggedIn();

  // Renderiza template base
  app.innerHTML = renderWatchNext(loggedIn);

  const loadingEl = document.getElementById("loading");
  const watchNextContainer = document.getElementById("watch-next-container");

  if (!loadingEl || !watchNextContainer) return;

  try {
    // Carrega itens e opções em paralelo (mais rápido que sequencial)
    const [itemsResponse, optionsResponse] = await Promise.all([
      entertainmentAPI.listAll(),
      optionsAPI.get(),
    ]);

    // Normaliza resposta (API pode retornar de formas diferentes)
    const items = itemsResponse.data || itemsResponse;
    // Extrai opções de status (API pode retornar como "Status" ou "status")
    let statusOptions = [];
    if (Array.isArray(optionsResponse.Status)) {
      statusOptions = optionsResponse.Status;
    } else if (Array.isArray(optionsResponse.status)) {
      statusOptions = optionsResponse.status;
    }

    loadingEl.classList.add("hidden");
    watchNextContainer.classList.remove("hidden");
    watchNextContainer.innerHTML = renderWatchNextItems(items, statusOptions);


  } catch (error) {
    console.error("Error loading Watch Next items:", error);
    loadingEl.textContent = "Failed to load items. Please try again later.";
    return;
  }
}
