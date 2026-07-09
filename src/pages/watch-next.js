// Página Watch Next: busca paginada por status "Plan to watch"
// Fluxo: list({ status }) paginado → append no state → view com pagination
import { state } from "../store.js";
import { entertainmentAPI, isLoggedIn } from "../services/api.js";
import { renderWatchNext, renderWatchNextItems } from "../views/watch-next.js";
import { createPaginatedLoader } from "../components/pagination.js";

async function fetchWatchNext(params) {
  return entertainmentAPI.list({ status: "Plan to watch", ...params });
}

// Carrega itens com status "Plan to watch" e exibe em grid
export async function renderWatchNextPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const loggedIn = isLoggedIn();
  app.innerHTML = renderWatchNext(loggedIn);

  const loadingEl = document.getElementById("loading");
  const watchNextContainer = document.getElementById("watch-next-container");

  if (!loadingEl || !watchNextContainer) return;

  const { loadMore } = createPaginatedLoader(fetchWatchNext, renderWatchNextItems, "watch-next-container");

  try {
    const response = await fetchWatchNext({ pageSize: 24, startCursor: undefined });

    state.items = response.data;
    state.pagination = {
      cursor: response.pagination.nextCursor,
      hasMore: response.pagination.hasMore,
      loading: false,
    };

    loadingEl.classList.add("hidden");
    watchNextContainer.classList.remove("hidden");
    watchNextContainer.innerHTML = renderWatchNextItems(state.items, state.pagination);

    window.loadMoreWatchNext = () => loadMore();
  } catch (error) {
    console.error("Erro ao carregar Watch Next:", error);
    loadingEl.textContent = "Falha ao carregar itens. Tente novamente.";
  }
}