// Store global: estado compartilhado entre páginas e função de logout
import { logout } from "./services/api.js";

// Estado global compartilhado entre todas as páginas
export const state = {
  currentRoute: "/",
  params: {},
  items: [],
};

// Remove usuário do localStorage e redireciona para lista
export async function handleLogout() {
  logout();
  window.location.hash = "/list";
}
