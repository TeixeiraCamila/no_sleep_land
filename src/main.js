// Ponto de entrada: importa módulos, registra rotas e inicializa a aplicação
// Arquitetura Page+View: pages/ (lógica + dados) → views/ (templates HTML), roteadas por router.js
import "./assets/style/style.css";

import { handleLogout } from "./store.js";
import { handleGuestLogin } from "./pages/login.js";
import { initRouter, registerPages } from "./router.js";
import { initToggleSidebar } from "./components/sidebar.js";
import { renderListPage } from "./pages/list.js";
import { renderDetailPage } from "./pages/detail.js";
import { renderFormPage } from "./pages/form.js";
import { renderLoginPage } from "./pages/login.js";
import { renderStatusPage } from "./pages/status.js";
import { renderNoCoverPage } from "./pages/noCover.js";
import { renderWatchNextPage } from "./pages/watch-next.js";
import { renderGhibliPage } from "./pages/ghibli.js";
import { renderPosterPage } from "./pages/poster.js";

// Expõe globalmente para onclick nos templates HTML
window.handleLogout = handleLogout;
window.handleGuestLogin = handleGuestLogin;

import Alpine from 'alpinejs'
window.Alpine = Alpine

import { escapeHtml } from "./utils/html.js";
import { compressImage } from "./utils/images.js";

// Preview de capa por URL com validação e fallback em caso de erro
window.handleCoverPreview = function (url) {
  const preview = document.getElementById("cover-preview");
  if (url) {
    preview.innerHTML = `<img src="${escapeHtml(url)}" alt="Cover preview" class="max-w-xs rounded border border-gray-700" onerror="this.parentElement.innerHTML='<span class=\\'text-red-500\\'>URL inválida</span>'" />`;
    preview.classList.remove("hidden");
  } else {
    preview.innerHTML = "";
    preview.classList.add("hidden");
  }
};

// Upload de imagem: comprime para base64 e preenche campo oculto
window.handleCoverUpload = async function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const uploadPreview = document.getElementById("cover-upload-preview");
  const uploadImg = document.getElementById("cover-upload-img");
  const coverDataInput = document.getElementById("cover-data-input");
  const coverUrlInput = document.getElementById("cover-url-input");
  const preview = document.getElementById("cover-preview");

  try {
    const compressedBase64 = await compressImage(file);
    coverDataInput.value = compressedBase64;
    coverUrlInput.value = "";
    preview.classList.add("hidden");
    uploadImg.src = compressedBase64;
    uploadPreview.classList.remove("hidden");
  } catch (error) {
    alert("Erro ao processar imagem: " + error.message);
    event.target.value = "";
  }
};

// Limpa upload de imagem e reseta campos
window.clearCoverUpload = function () {
  const fileInput = document.getElementById("cover-file-input");
  const coverDataInput = document.getElementById("cover-data-input");
  const coverUrlInput = document.getElementById("cover-url-input");
  const uploadPreview = document.getElementById("cover-upload-preview");

  if (fileInput) fileInput.value = "";
  if (coverDataInput) coverDataInput.value = "";
  if (coverUrlInput) coverUrlInput.value = "";
  if (uploadPreview) uploadPreview.classList.add("hidden");
};

// Registra todas as rotas no router (mapeia nome → função de página)
registerPages({
  list: renderListPage,
  detail: renderDetailPage,
  create: renderFormPage,
  edit: renderFormPage,
  login: renderLoginPage,
  status: renderStatusPage,
  noCover: renderNoCoverPage,
  watchNext: renderWatchNextPage,
  ghibli: renderGhibliPage,
  poster: renderPosterPage
});

// Inicializa Alpine.js, toggle da sidebar e router ao carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
  Alpine.start();
  initToggleSidebar();
  initRouter();
});
