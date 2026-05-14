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

import { renderKanban, renderKanbanItems } from "../views/kanban.js";

/**
 * Renderiza página Kanban (quadro por status)
 */
export async function renderStatusPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const loggedIn = isLoggedIn();
  
  // Renderiza template base
  app.innerHTML = renderKanban(loggedIn);

  const loadingEl = document.getElementById("loading");
  const kanbanContainer = document.getElementById("kanban-container");

  if (!loadingEl || !kanbanContainer) return;

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
    // RENDERIZA KANBAN
    // ==========================================
    loadingEl.classList.add("hidden");
    kanbanContainer.classList.remove("hidden");
    kanbanContainer.innerHTML = renderKanbanItems(items, statusOptions);

    // ==========================================
    // FILTRO LOCAL (SEM API)
    // ==========================================
    // Filtra itens em tempo real sem nova requisição
    // Muito mais rápido que filtrar no backend
    const sidebarSearchInput = document.getElementById("sidebar-search-input");
    if (sidebarSearchInput) {
      let debounceTimer;
      sidebarSearchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const search = e.target.value.trim().toLowerCase();
          
          // Filtra localmente pelo nome do item
          const filteredItems = search
            ? items.filter((item) => 
                item.name?.toLowerCase().includes(search)
              )
            : items;
          
          // Re-renderiza cards (mantém colunas)
          kanbanContainer.innerHTML = renderKanbanItems(
            filteredItems,
            statusOptions,
          );
        }, 300);
      });
    }
  } catch (error) {
    console.error("Erro:", error);
    loadingEl.textContent = `Erro: ${error.message}`;
  }
}