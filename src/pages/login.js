// Página de login: autentica usuário via API do Notion ou entra como convidado
// Fluxo: carrega lista de usuários → formulário busca match por nome/email → salva user_id no localStorage
import { state } from "../store.js";
import { is_logged_in, users_api, is_guest } from "../services/api.js";
import { render_login } from "../views/login.js";
import { LS_GUEST, LS_LOGGED_USER } from "../constants.js";

// Autentica usuário por nome/email via API do Notion
export async function render_login_page() {
  const app = document.getElementById("app");
  if (!app) return;

  const logged_in = is_logged_in();

  // Se for convidado ou não logado: mostra formulário de login
  if (logged_in) {
    app.innerHTML = render_login(true);
    return;
  }

  // Convidado vê o form também (pode fazer login como usuário)
  app.innerHTML = render_login(logged_in);

  // Carrega lista de usuários da API do Notion
  const loading_el = document.getElementById("loading");
  const form_el = document.getElementById("login-form");

  try {
    // Busca todos os usuários do workspace Notion
    const response = await users_api.list();
    const users = response.results;

    loading_el.classList.add("hidden");
    form_el.classList.remove("hidden");

    // Configura submit: busca usuário que corresponda ao nome ou email
    const form = document.getElementById("login-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Normaliza credenciais para lowercase
        const form_data = new FormData(form);
        const name = form_data.get("name").toLowerCase();
        const email = form_data.get("email").toLowerCase();

        // Busca usuário pelo nome ou email (case insensitive)
        const user = users.find((u) => {
          const user_name = (u.name || "").toLowerCase();
          const user_email = (u.person?.email || "").toLowerCase();
          return user_name === name || user_email === email;
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
    if (loading_el) loading_el.textContent = `Erro: ${error.message}`;
  }
}

export function handle_guest_login() {
  localStorage.setItem(LS_GUEST, "true");
  window.location.hash = "/list";
}
