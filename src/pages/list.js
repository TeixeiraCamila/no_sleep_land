// Página de listagem: busca paginada com botão "Carregar mais"
// Fluxo: fetch por cursor → append em state.items → view com pagination
import { state } from "../store.js";
import { entertainmentAPI, isLoggedIn } from "../services/api.js";
import { renderList, renderListItems } from "../views/list.js";
import { setupDebouncedSearch } from "../utils/search.js";
import { DEBOUNCE_SEARCH, DEBOUNCE_SIDEBAR } from "../constants.js";

const PAGE_SIZE = 24; // itens por lote (max 100 permitido pela Notion API)

// Busca lote paginado da API
async function fetchItems(search, cursor) {
  const response = await entertainmentAPI.list({
    search: search || undefined,
    pageSize: PAGE_SIZE,
    startCursor: cursor || undefined,
  });
  return response; // { data: [...], pagination: { nextCursor, hasMore } }
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

  // Carrega primeira página e renderiza
  const performSearch = async (search) => {
    loadingEl.classList.remove("hidden");
    listContainer.classList.add("hidden");

    try {
      const response = await fetchItems(search, null);
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

  // Busca inicial
  await performSearch(searchTerm);

  // "Carregar mais": busca próximo lote e faz append nos itens existentes
  window.loadMore = async () => {
    if (state.pagination.loading || !state.pagination.hasMore) return;

    state.pagination.loading = true;
    const loadMoreBtn = document.getElementById("load-more");
    if (loadMoreBtn) loadMoreBtn.textContent = "Carregando...";

    try {
      const response = await fetchItems(
        state.params.search || "",
        state.pagination.cursor,
      );
      state.items = [...state.items, ...response.data];
      state.pagination = {
        cursor: response.pagination.nextCursor,
        hasMore: response.pagination.hasMore,
        loading: false,
      };
      listContainer.innerHTML = renderListItems(state.items, state.pagination);
    } catch (error) {
      console.error("Erro ao carregar mais:", error);
      state.pagination.loading = false;
      if (loadMoreBtn) loadMoreBtn.textContent = "Carregar mais";
    }
  };

  // Busca no header com debounce
  if (searchInput) {
    setupDebouncedSearch(searchInput, DEBOUNCE_SEARCH, (value) => {
      const search = value.trim();
      window.location.hash = search
        ? `/list/search=${encodeURIComponent(search)}`
        : "/list";
    });
  }

  // Busca na sidebar (delay maior para não atrapalhar navegação)
  const sidebarSearchInput = document.getElementById("sidebar-search-input");
  if (sidebarSearchInput) {
    setupDebouncedSearch(sidebarSearchInput, DEBOUNCE_SIDEBAR, (value) => {
      const search = value.trim();
      window.location.hash = search
        ? `/list/search=${encodeURIComponent(search)}`
        : "/list";
    });
  }

  // Botão para limpar busca e voltar à lista completa
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      window.location.hash = "/list";
    });
  }
}
