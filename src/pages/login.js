// Página de login: autentica com email + código de acesso, ou entra como visitante
// O backend valida as credenciais e devolve o token; o front só guarda a sessão
import {
  auth_api,
  is_logged_in,
  start_guest_session,
  start_session,
} from "../services/api.js";
import { render_login } from "../views/login.js";

export async function render_login_page() {
  const app = document.getElementById("app");
  if (!app) return;

  // Quem já tem sessão não precisa do formulário
  if (is_logged_in()) {
    app.innerHTML = render_login(true);
    return;
  }

  app.innerHTML = render_login(false);

  const form = document.getElementById("login-form");
  const error_el = document.getElementById("login-error");
  const submit_btn = document.getElementById("login-submit");

  if (!form) return;

  const show_error = (message) => {
    if (error_el) {
      error_el.textContent = message;
      error_el.classList.remove("hidden");
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const form_data = new FormData(form);
    const email = String(form_data.get("email") || "").trim();
    const codigo = String(form_data.get("codigo") || "").trim();

    if (!email || !codigo) {
      show_error("Preencha email e código para entrar.");
      return;
    }

    if (submit_btn) submit_btn.disabled = true;
    error_el?.classList.add("hidden");

    try {
      const { token, user } = await auth_api.login(email, codigo);
      start_session({ token, user });
      window.location.hash = "/list";
    } catch (error) {
      // A mensagem do backend ("O código não confere.") chega intacta:
      // rotas /api/auth/* não disparam o redirete automático do 401.
      show_error(error.message);
      if (submit_btn) submit_btn.disabled = false;
    }
  });
}

export function handle_guest_login() {
  start_guest_session();
  window.location.hash = "/list";
}
