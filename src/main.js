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

/**
 * Disponibiliza handleLogout globalmente
 * Necessário porque os templates HTML têm onclick
 * que chama esta função diretamente
 */
window.handleLogout = handleLogout;

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
});

/**
 * ==========================================
 * INICIALIZAÇÃO
 * ==========================================
 * Esperar o DOM estar pronto antes de iniciar
 * Evita erros de elementos não encontrados
 */
document.addEventListener("DOMContentLoaded", () => {
  initToggleSidebar();  // Configura clique na sidebar
  initRouter();         // Inicia sistema de rotas
});