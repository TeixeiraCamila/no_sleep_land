/**
 * GLOBAL STATE - Estado Global
 * @usage-pages Usado em todas as páginas
 * para armazenar: rota atual, itens carregados,
 * usuário logado, etc.
 **/

import { logout } from "./services/api.js";

export const state = {
  currentRoute: "/",    // Rota atual (ex: "list", "detail")
  params: {},          // Parâmetros da URL (ex: { id: "123", search: "anime" })
  items: [],          // Lista de entretenimento carregados da API
  options: null,     // Opções dos selects (tipos, status, tags)
  user: null,       // Usuário logado atualmente (objeto completo)
  loading: false,  // Indicador de carregamento global
  error: null,   // Mensagem de erro atual para exibir ao usuário
};

/**
 * LOGOUT - Encerrar Sessão
 * Remove o usuário do localStorage e redireciona
 * para a página inicial.
 **/
export async function handleLogout() {
  logout(); // Limpa localStorage
  window.location.hash = "/list"; // Redireciona para lista
}
