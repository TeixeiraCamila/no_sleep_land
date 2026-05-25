import { state } from "../store.js";
import { entertainmentAPI, isLoggedIn } from "../services/api.js";
import { renderNoCover, noCoverItems } from "../views/noCover.js";

export async function renderNoCoverPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const loggedIn = isLoggedIn();
  app.innerHTML = renderNoCover(loggedIn);

  const loadingEl = document.getElementById("loading");
  const noCoverContainer = document.getElementById("noCover-container");

  if (!loadingEl || !noCoverContainer) return;

  try {
    const itemsResponse = await entertainmentAPI.listAll();

    // Normaliza resposta (API pode retornar de formas diferentes)
    const items = itemsResponse.data || itemsResponse;

    noCoverContainer.innerHTML = noCoverItems(items);

    // Armazena no estado global
    state.items = items;
  } catch (error) {
    console.error("Erro ao carregar itens sem capa:", error);
  }
}
