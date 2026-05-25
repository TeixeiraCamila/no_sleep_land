import { state } from "../store.js";
import { isLoggedIn, usersAPI, isGuest } from "../services/api.js";
import { renderLogin } from "../views/login.js";
import { LS_GUEST, LS_LOGGED_USER } from "../constants.js";

// Página de login: autentica usuário por nome/email via API do Notion
export async function renderLoginPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const loggedIn = isLoggedIn();

  // Se for convidado ou não logado: mostra formulário de login
  if (loggedIn) {
    app.innerHTML = renderLogin(true);
    return;
  }

  // Convidado vê o form também (pode fazer login como usuário)
  app.innerHTML = renderLogin(loggedIn);

  // Carrega lista de usuários da API do Notion
  const loadingEl = document.getElementById("loading");
  const formEl = document.getElementById("login-form");

  try {
    // Busca todos os usuários do workspace Notion
    const response = await usersAPI.list();
    const users = response.results;

    loadingEl.classList.add("hidden");
    formEl.classList.remove("hidden");

    // Configura submit: busca usuário que corresponda ao nome ou email
    const form = document.getElementById("login-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Normaliza credenciais para lowercase
        const formData = new FormData(form);
        const name = formData.get("name").toLowerCase();
        const email = formData.get("email").toLowerCase();

        const user = users.find((u) => {
          const userName = (u.name || "").toLowerCase();
          const userEmail = (u.person?.email || "").toLowerCase();
          return userName === name || userEmail === email;
        });

        if (user) {
          localStorage.setItem(LS_LOGGED_USER , user.id);
          window.location.hash = "/list";
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
  window.location.hash = "/list";
}
