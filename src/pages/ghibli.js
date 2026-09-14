import { entertainmentAPI, isLoggedIn, optionsAPI } from "../services/api.js";
import { renderGhibli, renderGhibliItems } from "../views/ghibli.js";
import { registerSearchAdapter, filterByName } from "../utils/sidebar-search.js";

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
      entertainmentAPI.list({ studios: "Ghibli", pageSize: 100 }),
      optionsAPI.get(),
    ]);

    const items = itemsResponse.data || itemsResponse;

    let statusOptions = [];
    if (Array.isArray(optionsResponse.Status)) {
      statusOptions = optionsResponse.Status;
    } else if (Array.isArray(optionsResponse.status)) {
      statusOptions = optionsResponse.status;
    }

    loadingEl.classList.add("hidden");
    ghibliContainer.classList.remove("hidden");
    ghibliContainer.innerHTML = renderGhibliItems(items, statusOptions);

    registerSearchAdapter("ghibli", (term) => {
      const filteredItems = filterByName(items, term);
      ghibliContainer.innerHTML = renderGhibliItems(filteredItems, statusOptions);
    });
  } catch (error) {
    console.error("Erro:", error);
    loadingEl.textContent = `Erro: ${error.message}`;
  }
}