// Página Watch Next: busca paginada por status "Plan to watch"
// Fluxo: list({ status }) paginado → append no state → view com pagination
import { state } from "../store.js";
import { entertainmentAPI, isLoggedIn, optionsAPI } from "../services/api.js";
import { renderWatchNext, renderWatchNextItems } from "../views/watch-next.js";

const PAGE_SIZE = 24;

// Carrega itens com status "Plan to watch" e exibe em grid
export async function renderWatchNextPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const loggedIn = isLoggedIn();
  app.innerHTML = renderWatchNext(loggedIn);

  const loadingEl = document.getElementById("loading");
  const watchNextContainer = document.getElementById("watch-next-container");

  if (!loadingEl || !watchNextContainer) return;

  try {
    // Carrega primeira página + opções de status em paralelo
    const [response] = await Promise.all([
      entertainmentAPI.list({ status: "Plan to watch", pageSize: PAGE_SIZE }),
      optionsAPI.get(),
    ]);

    state.items = response.data;
    state.pagination = {
      cursor: response.pagination.nextCursor,
      hasMore: response.pagination.hasMore,
      loading: false,
    };

    loadingEl.classList.add("hidden");
    watchNextContainer.classList.remove("hidden");
    watchNextContainer.innerHTML = renderWatchNextItems(
      state.items,
      state.pagination,
    );

    // "Carregar mais": específico para Watch Next
    window.loadMoreWatchNext = async () => {
      if (state.pagination.loading || !state.pagination.hasMore) return;

      state.pagination.loading = true;
      try {
        const res = await entertainmentAPI.list({
          status: "Plan to watch",
          pageSize: PAGE_SIZE,
          startCursor: state.pagination.cursor,
        });
        state.items = [...state.items, ...res.data];
        state.pagination = {
          cursor: res.pagination.nextCursor,
          hasMore: res.pagination.hasMore,
          loading: false,
        };
        watchNextContainer.innerHTML = renderWatchNextItems(
          state.items,
          state.pagination,
        );
      } catch (error) {
        console.error("Erro ao carregar mais Watch Next:", error);
        state.pagination.loading = false;
      }
    };
  } catch (error) {
    console.error("Erro ao carregar Watch Next:", error);
    loadingEl.textContent = "Falha ao carregar itens. Tente novamente.";
  }
}
