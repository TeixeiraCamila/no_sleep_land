import { state } from "../store.js";
import { entertainmentAPI, isLoggedIn, optionsAPI } from "../services/api.js";
import { renderGhibli, renderGhibliItems } from "../views/ghibli.js";
import { setupDebouncedSearch } from "../utils/search.js";
import { DEBOUNCE_SEARCH } from "../constants.js";

export async function renderGhibliPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const loggedIn = isLoggedIn();

  app.innerHTML = renderGhibli(loggedIn);

  const loadingEl = document.getElementById("loading");
  const ghibliContainer = document.getElementById("ghibli-container");

  if (!loadingEl || !ghibliContainer) return;

  try {
    const [itemsResponse, optionsResponse] = await Promise.all([
      entertainmentAPI.listAll(),
      optionsAPI.get(),
    ]);

    const items = itemsResponse.data || itemsResponse;
    state.items = items;

    let statusOptions = [];
    if (Array.isArray(optionsResponse.Status)) {
      statusOptions = optionsResponse.Status;
    } else if (Array.isArray(optionsResponse.status)) {
      statusOptions = optionsResponse.status;
    }

    loadingEl.classList.add("hidden");
    ghibliContainer.classList.remove("hidden");
    ghibliContainer.innerHTML = renderGhibliItems(items, statusOptions);

    const sidebarSearchInput = document.getElementById("sidebar-search-input");
    if (sidebarSearchInput) {
      setupDebouncedSearch(
        sidebarSearchInput,
        DEBOUNCE_SEARCH,
        (searchTerm) => {
          const filteredItems = state.items.filter((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()),
          );
          ghibliContainer.innerHTML = renderGhibliItems(
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