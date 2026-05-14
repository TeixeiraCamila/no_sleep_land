/**
 * ==========================================
 * LIST PAGE - Página de Listagem
 * ==========================================
 * Exibe lista de entretenimento com:
 * - Busca em tempo real (header + sidebar)
 * - Debounce para evitar muitas requisições
 * - Toggle da sidebar
 * 
 * Fluxo:
 * 1. Renderiza template base
 * 2. Carrega dados da API
 * 3. Renderiza cards dos itens
 * 4. Configura listeners de busca
 */

// DEPENDÊNCIAS
import { state } from "../store.js";        // Estado global
import { entertainmentAPI, isLoggedIn } from "../services/api.js";  // API do backend

import { renderList, renderListItems } from "../views/list.js";  // Templates

/**
 * Renderiza a página de lista
 * @async - executa operações assíncronas (API calls)
 */
export async function renderListPage() {
  // Referência ao container principal
  const app = document.getElementById("app");
  if (!app) return;

  // Recupera termo de busca da URL (se houver)
  // Ex: #/list/search=anime → "anime"
  const searchTerm = state.params.search || "";

  // Renderiza o template base (estrutura HTML)
  // passing do status de login para mostrar/esconder botões
  app.innerHTML = renderList(isLoggedIn(), searchTerm);

  // ==========================================
  // REFERÊNCIAS DOM
  // ==========================================
  const loadingEl = document.getElementById("loading");
  const listContainer = document.getElementById("list-container");
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search");

  if (!loadingEl || !listContainer) return;

  /**
   * Executa busca na API
   * @param {string} search - Termo de busca (opcional)
   */
  const performSearch = async (search) => {
    // Feedback visual: mostra loading
    loadingEl.classList.remove("hidden");
    listContainer.classList.add("hidden");

    try {
      // Chamada API para buscar lista
      const response = await entertainmentAPI.list({
        search: search || undefined,  // undefined se vazio
      });

      // Armazena no estado global para uso em outras páginas
      state.items = response.data;

      // Renderiza resultados
      loadingEl.classList.add("hidden");
      listContainer.classList.remove("hidden");
      listContainer.innerHTML = renderListItems(response.data);
    } catch (error) {
      loadingEl.textContent = `Erro: ${error.message}`;
    }
  };

  // Busca inicial (com ou sem filtro)
  if (searchTerm) {
    performSearch(searchTerm);
  } else {
    performSearch("");
  }

  // ==========================================
  // CAMPO DE BUSCA NO HEADER
  // ==========================================
  // Implementa debounce: espera 300ms após parar de digitar
  // para evitar muitas requisições à API
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);  // Cancela timer anterior
      debounceTimer = setTimeout(() => {
        const search = e.target.value.trim();
        // Atualiza URL para persistir busca
        window.location.hash = search
          ? `#/list/search=${encodeURIComponent(search)}`
          : "#/list";
      }, 300);  // 300ms de espera
    });
  }


  // ==========================================
  // CAMPO DE BUSCA NA SIDEBAR
  // ==========================================
  // Mesmo comportamento do header, mas com delay maior
  const sidebarSearchInput = document.getElementById("sidebar-search-input");
  if (sidebarSearchInput) {
    let debounceTimer;
    sidebarSearchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const search = e.target.value.trim();
        window.location.hash = search
          ? `/list/search=${encodeURIComponent(search)}`
          : "/list";
      }, 600);  // 600ms para busca na sidebar
    });
  }

  // ==========================================
  // BOTÃO LIMPAR BUSCA
  // ==========================================
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      window.location.hash = "/list";
    });
  }
}