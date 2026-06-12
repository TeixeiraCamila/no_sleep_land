// Página Kanban: agrupa todos os itens por status em colunas com busca local
// Fluxo: carrega dados + options em paralelo → view agrupa itens por status → busca filtra localmente
import { state } from "../store.js";
import { entertainmentAPI, isLoggedIn, optionsAPI } from "../services/api.js";
import { renderStatus, renderStatusItems } from "../views/status.js";
import { setupDebouncedSearch } from "../utils/search.js";
import { DEBOUNCE_SEARCH } from "../constants.js";

// Carrega todos os itens e organiza por status em colunas
export async function renderStatusPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const loggedIn = isLoggedIn();

  // Renderiza template base
  app.innerHTML = renderStatus(loggedIn);

  const loadingEl = document.getElementById("loading");
  const statusContainer = document.getElementById("status-container");

  if (!loadingEl || !statusContainer) return;

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
    statusContainer.classList.remove("hidden");
    statusContainer.innerHTML = renderStatusItems(items, statusOptions);

    // Filtro local na sidebar filtra pelo nome sem nova requisição à API
    const sidebarSearchInput = document.getElementById("sidebar-search-input");
    if (sidebarSearchInput) {
      setupDebouncedSearch(
        sidebarSearchInput,
        DEBOUNCE_SEARCH,
        (searchTerm) => {
          // Filtra itens pelo nome (case insensitive) e reagrupa por status
          const filteredItems = state.items.filter((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()),
          );
          statusContainer.innerHTML = renderStatusItems(
            filteredItems,
            statusOptions,
          );
        },
      );
    }
  } catch (error) {
    console.error("Erro:", error);
    loadingEl.textContent = `Erro: ${error.message}`;
  }
}
