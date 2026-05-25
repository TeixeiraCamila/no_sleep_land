/**
 * ==========================================
 * ENTRY POINT - Ponto de Entrada da Aplicação
 * ==========================================
 * Este é o primeiro arquivo executado quando
 * a página carrega. Sua responsabilidade é
 * apenas coordenar a inicialização dos módulos.
 *
 * Fluxo de execução:
 * 1. Imports carregam todos os módulos necessários
 * 2. Registrar as páginas no router
 * 3. Disponibilizar funções globalmente (window)
 * 4. Inicializar quando o DOM estiver pronto
 *
 * @description Não contém lógica de negócio,
 * apenas orchestration (orquestração)
 */

import "./assets/style/style.css";

// Módulo de estado global
// Armazena dados compartilhados entre páginas
import { handleLogout } from "./store.js";
import { handleGuestLogin } from "./pages/login.js";

// Sistema de navegação (hash-based routing)
// Controla qual página renderizar baseado na URL
import { initRouter, registerPages } from "./router.js";

// Componentes reutilizáveis
import { initToggleSidebar } from "./components/sidebar.js";

// Páginas da aplicação
// Cada página é uma função que renderiza uma view
import { renderListPage } from "./pages/list.js";
import { renderDetailPage } from "./pages/detail.js";
import { renderFormPage } from "./pages/form.js";
import { renderLoginPage } from "./pages/login.js";
import { renderStatusPage } from "./pages/status.js";
import { renderNoCoverPage } from "./pages/noCover.js";
/**
 * Disponibiliza handleLogout globalmente
 * Necessário porque os templates HTML têm onclick
 * que chama esta função diretamente
 */
window.handleLogout = handleLogout;
window.handleGuestLogin = handleGuestLogin;

import Alpine from 'alpinejs'
window.Alpine = Alpine

import { escapeHtml } from "./utils/html.js";
import { MAX_IMAGE_SIZE, IMAGE_FORMAT, IMAGE_QUALITY } from "./constants.js";
import { compressImage } from "./utils/images.js";

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

window.handleCoverUpload = async function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const uploadPreview = document.getElementById("cover-upload-preview");
  const uploadImg = document.getElementById("cover-upload-img");
  const coverDataInput = document.getElementById("cover-data-input");
  const coverUrlInput = document.getElementById("cover-url-input");
  const preview = document.getElementById("cover-preview");

  try {
    // Comprimir imagem antes de enviar
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

/**
 * ==========================================
 * REGISTRO DE PÁGINAS
 * ==========================================
 * O router precisa saber qual função chamar
 * para cada rota. Aqui mapeamos:
 * - "list"   → renderListPage
 * - "detail" → renderDetailPage
 * - "create" → renderFormPage (mesma função para criar)
 * - "edit"   → renderFormPage (mesma função para editar)
 * - "login"  → renderLoginPage
 * - "status" → renderStatusPage (kanban)
 */
registerPages({
  list: renderListPage,
  detail: renderDetailPage,
  create: renderFormPage,
  edit: renderFormPage,
  login: renderLoginPage,
  status: renderStatusPage,
  noCover: renderNoCoverPage
});

/**
 * ==========================================
 * INICIALIZAÇÃO
 * ==========================================
 * Esperar o DOM estar pronto antes de iniciar
 * Evita erros de elementos não encontrados
 */
document.addEventListener("DOMContentLoaded", () => {
  Alpine.start();
  initToggleSidebar();
  initRouter();
});
