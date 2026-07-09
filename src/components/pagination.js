// Helper de paginação: extrai lógica de "Carregar mais" para evitar duplicação
// Dependências: state global para itens/pagination, função fetch, callback de render
import { state } from "../store.js";

export function createPaginatedLoader(fetchFn, renderFn, containerId) {
  const container = document.getElementById(containerId);

  const loadMore = async (extraParams = {}) => {
    if (state.pagination.loading || !state.pagination.hasMore) return;

    state.pagination.loading = true;
    const loadMoreBtn = document.getElementById("load-more");
    if (loadMoreBtn) loadMoreBtn.textContent = "Carregando...";

    try {
      const response = await fetchFn({
        pageSize: 24,
        startCursor: state.pagination.cursor,
        ...extraParams,
      });
      state.items = [...state.items, ...response.data];
      state.pagination = {
        cursor: response.pagination.nextCursor,
        hasMore: response.pagination.hasMore,
        loading: false,
      };
      if (container) container.innerHTML = renderFn(state.items, state.pagination);
    } catch (error) {
      console.error("Erro ao carregar mais:", error);
      state.pagination.loading = false;
      if (loadMoreBtn) loadMoreBtn.textContent = "Carregar mais";
    }
  };

  return { loadMore };
}