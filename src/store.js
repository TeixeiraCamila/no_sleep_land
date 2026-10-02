// Store global: estado reativo compartilhado entre páginas (currentRoute, params, items)
// Router atualiza state.currentRoute/params; pages salvam items após fetch da API
import { logout } from "./services/api.js";

// Estado global compartilhado entre todas as páginas
export const state = {
  currentRoute: "/",
  params: {},
  items: [],

  pagination: {
    cursor: null,
    hasMore: false,
    loading: false,
  },

  // Filtro de status na listagem
  // null = Todos; string = nome exato do status (igual vem de options.Status)
  status_filter: null,

  // filtro por Type na página de Status (Kanban)
  // null = Todos; string = nome exato do Type (igual vem de options.Type)
  type_filter: null,
};

// remove usuário do localStorage e redireciona para lista
export async function handle_logout() {
  logout();
  window.location.hash = "/list";
}
