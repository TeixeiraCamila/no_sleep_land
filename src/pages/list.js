// Página de listagem: busca paginada com botão "Carregar mais"
// Fluxo: fetch por cursor → append em state.items → view com pagination
import { state } from "../store.js";
import { entertainmentAPI, isLoggedIn } from "../services/api.js";
import { renderList, renderListItems } from "../views/list.js";
import { createPaginatedLoader } from "../components/pagination.js";
import { setupDebouncedSearch } from "../utils/search.js";
import { DEBOUNCE_SEARCH, DEBOUNCE_SIDEBAR } from "../constants.js";

async function fetchItems(params) {
  return entertainmentAPI.list({
    search: state.params.search || undefined,
    ...params,
  });
}

// Renderiza grid de cards com busca em tempo real via API
export async function renderListPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const searchTerm = state.params.search || "";
  app.innerHTML = renderList(isLoggedIn(), searchTerm);

  const loadingEl = document.getElementById("loading");
  const listContainer = document.getElementById("list-container");
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search");

  if (!loadingEl || !listContainer) return;

  const { loadMore } = createPaginatedLoader(fetchItems, renderListItems, "list-container");

  const performSearch = async (search) => {
    loadingEl.classList.remove("hidden");
    listContainer.classList.add("hidden");

    try {
      const response = await fetchItems({ search: search || undefined, pageSize: 24, startCursor: undefined });
      state.items = response.data;
      state.pagination = {
        cursor: response.pagination.nextCursor,
        hasMore: response.pagination.hasMore,
        loading: false,
      };

      loadingEl.classList.add("hidden");
      listContainer.classList.remove("hidden");
      listContainer.innerHTML = renderListItems(state.items, state.pagination);
    } catch (error) {
      loadingEl.textContent = `Erro: ${error.message}`;
    }
  };

  window.loadMore = () => loadMore();

  await performSearch(searchTerm);

  if (searchInput) {
    setupDebouncedSearch(searchInput, DEBOUNCE_SEARCH, (value) => {
      const search = value.trim();
      window.location.hash = search
        ? `/list/search=${encodeURIComponent(search)}`
        : "/list";
    });
  }

  const sidebarSearchInput = document.getElementById("sidebar-search-input");
  if (sidebarSearchInput) {
    setupDebouncedSearch(sidebarSearchInput, DEBOUNCE_SIDEBAR, (value) => {
      const search = value.trim();
      window.location.hash = search
        ? `/list/search=${encodeURIComponent(search)}`
        : "/list";
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      window.location.hash = "/list";
    });
  }
}