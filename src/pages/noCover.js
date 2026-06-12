// Página noCover: lista itens que não possuem imagem de capa
import { state } from "../store.js";
import { entertainmentAPI, isLoggedIn } from "../services/api.js";
import { renderNoCover, renderNoCoverItems } from "../views/noCover.js";

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

    state.items = items;
  } catch (error) {
    console.error("Erro ao carregar itens sem capa:", error);
    loadingEl.textContent = "Erro ao carregar itens.";
  }
}
