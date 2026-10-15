// Ponto de entrada: importa módulos, registra rotas e inicializa a aplicação
// Arquitetura Page+View: pages/ (lógica + dados) → views/ (templates HTML), roteadas por router.js
import "./assets/style/style.css";

import { handle_logout } from "./store.js";
import { handle_guest_login } from "./pages/login.js";
import { init_router, register_pages } from "./router.js";
import { init_actions, register_action } from "./actions.js";
import { init_toggle_sidebar } from "./components/sidebar.js";
import { render_list_page } from "./pages/list.js";
import { render_detail_page } from "./pages/detail.js";
import { render_form_page } from "./pages/form.js";
import { render_login_page } from "./pages/login.js";
import { render_status_page } from "./pages/status.js";
import { render_no_cover_page } from "./pages/noCover.js";
import { render_watch_next_page } from "./pages/watch-next.js";
import { render_ghibli_page } from "./pages/ghibli.js";
import { render_poster_page } from "./pages/poster.js";

import Alpine from 'alpinejs'
window.Alpine = Alpine

import { escape_html } from "./utils/html.js";
import { compress_image } from "./utils/images.js";

// Ações globais de botões: id no template → função no registry (despacho em init_actions)
register_action("sidebar-logout", handle_logout);
register_action("login-logout", handle_logout);
register_action("login-guest", handle_guest_login);

// Preview de capa por URL com validação e fallback em caso de erro
window.handle_cover_preview = function (url) {
  const preview = document.getElementById("cover-preview");
  if (url) {
    preview.innerHTML = `<img src="${escape_html(url)}" alt="Cover preview" class="max-w-xs rounded border border-gray-700" onerror="this.parentElement.innerHTML='<span class=\\'text-red-500\\'>Invalid URL</span>'" />`;
    preview.classList.remove("hidden");
  } else {
    preview.innerHTML = "";
    preview.classList.add("hidden");
  }
};

// Upload de imagem: comprime para base64 e preenche campo oculto
window.handle_cover_upload = async function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const upload_preview = document.getElementById("cover-upload-preview");
  const upload_img = document.getElementById("cover-upload-img");
  const cover_data_input = document.getElementById("cover-data-input");
  const cover_url_input = document.getElementById("cover-url-input");
  const preview = document.getElementById("cover-preview");

  try {
    const compressed_base64 = await compress_image(file);
    cover_data_input.value = compressed_base64;
    cover_url_input.value = "";
    preview.classList.add("hidden");
    upload_img.src = compressed_base64;
    upload_preview.classList.remove("hidden");
  } catch (error) {
    alert("Erro ao processar imagem: " + error.message);
    event.target.value = "";
  }
};

// Limpa upload de imagem e reseta campos
window.clear_cover_upload = function () {
  const file_input = document.getElementById("cover-file-input");
  const cover_data_input = document.getElementById("cover-data-input");
  const cover_url_input = document.getElementById("cover-url-input");
  const upload_preview = document.getElementById("cover-upload-preview");

  if (file_input) file_input.value = "";
  if (cover_data_input) cover_data_input.value = "";
  if (cover_url_input) cover_url_input.value = "";
  if (upload_preview) upload_preview.classList.add("hidden");
};

// Registra todas as rotas no router (mapeia nome → função de página)
register_pages({
  list: render_list_page,
  detail: render_detail_page,
  create: render_form_page,
  edit: render_form_page,
  login: render_login_page,
  status: render_status_page,
  noCover: render_no_cover_page,
  watchNext: render_watch_next_page,
  ghibli: render_ghibli_page,
  poster: render_poster_page
});

// Inicializa Alpine.js, delegação de ações, toggle da sidebar e router ao carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
  Alpine.start();
  init_actions();
  init_toggle_sidebar();
  init_router();
});
