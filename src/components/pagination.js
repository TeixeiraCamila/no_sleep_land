// Helper de paginação: extrai lógica de "Carregar mais" para evitar duplicação
// Dependências: state global para itens/pagination, função fetch, callback de render
import { state } from "../store.js";

export function create_paginated_loader(fetch_fn, render_fn, container_id) {
  const container = document.getElementById(container_id);

  const load_more = async (extra_params = {}) => {
    if (state.pagination.loading || !state.pagination.hasMore) return;

    state.pagination.loading = true;
    const load_more_btn = document.getElementById("load-more");
    if (load_more_btn) load_more_btn.textContent = "Carregando...";

    try {
      const response = await fetch_fn({
        pageSize: 24,
        startCursor: state.pagination.cursor,
        ...extra_params,
      });
      state.items = [...state.items, ...response.data];
      state.pagination = {
        cursor: response.pagination.nextCursor,
        hasMore: response.pagination.hasMore,
        loading: false,
      };
      if (container) container.innerHTML = render_fn(state.items, state.pagination);
    } catch (error) {
      console.error("Erro ao carregar mais:", error);
      state.pagination.loading = false;
      if (load_more_btn) load_more_btn.textContent = "Carregar mais";
    }
  };

  return { load_more };
}