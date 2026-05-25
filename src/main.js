// Ponto de entrada: importa módulos, registra rotas e inicializa a aplicação
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

// Expõe globalmente para onclick nos templates HTML
window.handleLogout = handleLogout;
window.handleGuestLogin = handleGuestLogin;

import Alpine from 'alpinejs'
window.Alpine = Alpine

import { escapeHtml } from "./utils/html.js";
import { MAX_IMAGE_SIZE, IMAGE_FORMAT, IMAGE_QUALITY } from "./constants.js";
import { compressImage } from "./utils/images.js";

// Preview de capa por URL (valida e exibe ou mostra erro)
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

// Upload de imagem: comprime para base64 antes de enviar
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

// Mapeia rotas para funções de renderização
registerPages({
  list: renderListPage,
  detail: renderDetailPage,
  create: renderFormPage,
  edit: renderFormPage,
  login: renderLoginPage,
  status: renderStatusPage,
  noCover: renderNoCoverPage
});

// Inicializa Alpine, sidebar e router quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  Alpine.start();
  initToggleSidebar();
  initRouter();
});
