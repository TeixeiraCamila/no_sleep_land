// Página de listagem: busca itens na API e renderiza grid de cards com busca
import { state } from "../store.js";
import { entertainmentAPI, isLoggedIn } from "../services/api.js";
import { renderList, renderListItems } from "../views/list.js";
import { setupDebouncedSearch } from "../utils/search.js";
import { DEBOUNCE_SEARCH, DEBOUNCE_SIDEBAR } from "../constants.js";

// Renderiza grid de cards com busca em tempo real via API
export async function renderListPage() {
  // Referência ao container principal
  const app = document.getElementById("app");
  if (!app) return;

  const searchTerm = state.params.search || "";
  app.innerHTML = renderList(isLoggedIn(), searchTerm);

  const loadingEl = document.getElementById("loading");
  const listContainer = document.getElementById("list-container");
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search");

  if (!loadingEl || !listContainer) return;

  // Função de busca: chama API com termo e atualiza grid de resultados
  const performSearch = async (search) => {
    loadingEl.classList.remove("hidden");
    listContainer.classList.add("hidden");

    try {
      const response = await entertainmentAPI.list({
        search: search || undefined,
      });

      state.items = response.data;

      loadingEl.classList.add("hidden");
      listContainer.classList.remove("hidden");
      listContainer.innerHTML = renderListItems(response.data);
    } catch (error) {
      loadingEl.textContent = `Erro: ${error.message}`;
    }
  };

  // Dispara busca inicial com termo vindo da URL ou lista completa
  if (searchTerm) {
    performSearch(searchTerm);
  } else {
    performSearch("");
  }

  // Busca no header com debounce (espera usuário parar de digitar)
  if (searchInput) {
    setupDebouncedSearch(searchInput, DEBOUNCE_SEARCH, (value) => {
      const search = value.trim();
      window.location.hash = search
        ? `/list/search=${encodeURIComponent(search)}`
        : "/list";
    });
  }

  // Busca na sidebar (mesmo comportamento, delay maior)
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
