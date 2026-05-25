/**
 * ==========================================
 * LOGIN PAGE - Página de Autenticação
 * ==========================================
 * Autentica usuário comparando nome/email
 * com dados da API do Notion.
 *
 * Fluxo:
 * 1. Verifica se já está logado
 * 2. Se sim, mostra botão de logout
 * 3. Se não, carrega lista de usuários da API
 * 4. Compara credenciais do form com usuários
 * 5. Se válido, armazena ID no localStorage
 *
 * @auth Armazena "USER_LOGADO" no localStorage
 *       com o ID do usuário do Notion
 */

// DEPENDÊNCIAS
import { state } from "../store.js";
import { isLoggedIn, usersAPI, isGuest } from "../services/api.js";

import { renderLogin } from "../views/login.js";
import { LS_GUEST, LS_LOGGED_USER } from "../constants.js";

/**
 * Renderiza página de login
 */
export async function renderLoginPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const loggedIn = isLoggedIn();
  const guest = isGuest();

  // Se usuário logado (não convidado): mostra "já está logado"
  if (loggedIn) {
    app.innerHTML = renderLogin(true);
    return;
  }

  // Se é convidado: mostra formulário normal para poder fazer login como usuário
  // Não retorna aqui, permite que carregue o formulário de login

  // Se já está logado, mostra botão de logout
  app.innerHTML = renderLogin(loggedIn);

  // Se já logado, não precisa do formulário
  if (loggedIn) {
    return;
  }

  // ==========================================
  // CARREGA USUÁRIOS DA API
  // ==========================================
  const loadingEl = document.getElementById("loading");
  const formEl = document.getElementById("login-form");

  try {
    // Busca todos os usuários do workspace Notion
    const response = await usersAPI.list();
    const users = response.results;

    // Oculta loading, mostra formulário
    if (loadingEl) loadingEl.classList.add("hidden");
    if (formEl) formEl.classList.remove("hidden");

    // ==========================================
    // CONFIGURA SUBMIT
    // ==========================================
    const form = document.getElementById("login-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Normaliza credenciais para lowercase
        const formData = new FormData(form);
        const name = formData.get("name").toLowerCase();
        const email = formData.get("email").toLowerCase();

        // Busca usuário que corresponda
        // Compara nome OU email
        const user = users.find((u) => {
          const userName = (u.name || "").toLowerCase();
          const userEmail = (u.person?.email || "").toLowerCase();
          return userName === name || userEmail === email;
        });

        if (user) {
          // Sucesso: armazena ID do usuário
          localStorage.setItem(LS_LOGGED_USER , user.id);
          state.user = user; // Armazena no estado
          window.location.hash = "/list"; // Redireciona para lista
        } else {
          alert("Usuário não encontrado");
        }
      });
    }
  } catch (error) {
    if (loadingEl) loadingEl.textContent = `Erro: ${error.message}`;
  }
}

export function handleGuestLogin() {
  localStorage.setItem(LS_GUEST, "true");
  state.user = { id: "guest", name: "Convidado" };
  window.location.hash = "/list";
}
