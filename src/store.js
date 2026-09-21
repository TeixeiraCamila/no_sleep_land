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
};

// Remove usuário do localStorage e redireciona para lista
export async function handle_logout() {
  logout();
  window.location.hash = "/list";
}
