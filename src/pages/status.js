/**
 * ==========================================
 * STATUS PAGE - Página Kanban
 * ==========================================
 * Exibe quadro Kanban com entretenimento
 * organizado por status (Watching, Completed, etc)
 *
 * Fluxo:
 * 1. Carrega todos os itens + opções em paralelo
 * 2. Renderiza colunas baseadas nos status disponíveis
 * 3. Configura filtro de busca local
 *
 * @performance Filtra itens localmente (sem API extra)
 *              após carregar todos os dados uma vez
 */

// DEPENDÊNCIAS
import { state } from "../store.js";
import { entertainmentAPI, isLoggedIn, optionsAPI } from "../services/api.js";

import { renderStatus, renderStatusItems } from "../views/status.js";

import { setupDebouncedSearch } from "../utils/search.js";
import { DEBOUNCE_SEARCH } from "../constants.js";
/**
 * Renderiza página Kanban (quadro por status)
 */
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
    // ==========================================
    // CARREGA DADOS EM PARALELO
    // ==========================================
    // Busca todos os itens + opções simultaneamente
    // Mais rápido que sequential (um após outro)
    const [itemsResponse, optionsResponse] = await Promise.all([
      entertainmentAPI.listAll(),
      optionsAPI.get(),
    ]);

    // Normaliza resposta (API pode retornar de formas diferentes)
    const items = itemsResponse.data || itemsResponse;

    // Extrai opções de status do banco
    // Suporta diferentes formatos de chave ("Status" ou "status")
    let statusOptions = [];
    if (Array.isArray(optionsResponse.Status)) {
      statusOptions = optionsResponse.Status;
    } else if (Array.isArray(optionsResponse.status)) {
      statusOptions = optionsResponse.status;
    }

    // Armazena no estado global
    state.items = items;

    // ==========================================
    // RENDERIZA STATUS
    // ==========================================
    loadingEl.classList.add("hidden");
    statusContainer.classList.remove("hidden");
    statusContainer.innerHTML = renderStatusItems(items, statusOptions);

    // ==========================================
    // FILTRO LOCAL (SEM API)
    // ==========================================
    // Filtra itens em tempo real sem nova requisição
    // Muito mais rápido que filtrar no backend
    const sidebarSearchInput = document.getElementById("sidebar-search-input");
    if (sidebarSearchInput) {
      setupDebouncedSearch(
        sidebarSearchInput,
        DEBOUNCE_SEARCH,
        (searchTerm) => {
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
