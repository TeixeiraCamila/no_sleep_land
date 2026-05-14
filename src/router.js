/**
 * ==========================================
 * ROUTER - Sistema de Navegação
 * ==========================================
 * Controla a navegação usando hash URL.
 * Formato: #/rota ou #/rota/parametro
 * 
 * Exemplos:
 * - #/list          → Lista de entretenimento
 * - #/list/search=anime → Lista com filtro
 * - #/detail/123     → Detalhes do item 123
 * - #/create        → Formulário para criar
 * - #/edit/456      → Formulário para editar item 456
 * - #/login         → Página de login
 * - #/status        → Quadro Kanban por status
 * 
 * Fluxo de trabalho:
 * 1. Escuta mudanças na hash URL
 * 2. Extrai rota e parâmetros da URL
 * 3. Verifica autenticação (proteção de rotas)
 * 4. Executa a função de renderização da página
 */

import { state } from "./store.js";
import { isLoggedIn } from "./services/api.js";

// Armazena as funções de renderização das páginas
// É populado por registerPages() no main.js
let renderFunctions = {};

/**
 * Registra as páginas disponíveis no router
 * @param {Object} pages - Objeto com nome da rota e função
 */
export function registerPages(pages) {
  renderFunctions = pages;
}

/**
 * ==========================================
 * INICIALIZAÇÃO DO ROUTER
 * ==========================================
 * Configura o sistema de navegação:
 * - Executa uma vez na carga inicial
 * - Escuta mudanças futuras na URL
 */
export async function initRouter() {
  /**
   * Callback executado sempre que a URL mudar
   * (inicial + a cada clique em links)
   */
  const handleHashChange = async () => {
    // Extrai a hash da URL, removendo o "#"
    // Ex: "#/list" → "/list"
    const hash = window.location.hash.slice(1) || "/";

    // Divide em partes para extrair rota e parâmetros
    // Ex: "list/search=anime" → ["list", "search=anime"]
    const parts = hash.split("/").filter(Boolean);
    
    const loggedIn = isLoggedIn();
    const firstPart = parts[0] || "";  // Vazio se hash vazia ou "/"

    // ==========================================
    // REDIRECIONAMENTO DEFAULT
    // ==========================================
    // Se hash vazia ou "/" → redireciona para /list
    if (!firstPart || firstPart === "/") {
      window.location.hash = "/list";
      return;
    }

    // ==========================================
    // PROTEÇÃO DE ROTAS
    // ==========================================
    // Se não está logado E tenta acessar página
    // que não seja login → redireciona para login
    if (!loggedIn && firstPart !== "login") {
      window.location.hash = "/login";
      return;
    }

    // Se está logado E tenta acessar login
    // → redireciona para listagem
    if (loggedIn && firstPart === "login") {
      window.location.hash = "/list";
      return;
    }

    // ==========================================
    // PARSING DA ROTA
    // ==========================================
    // Determina qual página deve ser renderizada
    // baseado nas partes da URL
    let route = "list";   // Rota padrão é "list"
    let params = {};       // Parâmetros extraídos


    // Mapeamento de rotas para nomes internos
    if (parts[0] === "list") {
      route = "list";
      // Extrai parâmetro de busca da URL
      // Ex: "list/search=anime" → { search: "anime" }
      const searchParam = parts.find((p) => p.startsWith("search="));
      if (searchParam) {
        params.search = decodeURIComponent(searchParam.replace("search=", ""));
      }
    }
    // /detail/123 → detalhes do item
    else if (parts[0] === "detail" && parts[1]) {
      route = "detail";
      params = { id: parts[1] };
    }
    // /create → formulário vazio para criar
    else if (parts[0] === "create") {
      route = "create";
    }
    // /edit/456 → formulário com dados do item 456
    else if (parts[0] === "edit" && parts[1]) {
      route = "edit";
      params = { id: parts[1] };
    }
    // /login → página de autenticação
    else if (parts[0] === "login") {
      route = "login";
    }
    // /status → quadro kanban
    else if (parts[0] === "status") {
      route = "status";
    }

    // Atualiza o estado global com a rota atual
    // Permite que as páginas saibam qual é a rota
    state.currentRoute = route;
    state.params = params;

    // ==========================================
    // RENDERIZAÇÃO
    // ==========================================
    // Executa a função da página correspondente
    const renderFn = renderFunctions[route];
    if (renderFn) {
      await renderFn();  // Aguarda a página renderizar
    } else {
      console.error('No render function for route:', route);
    }
  };

  // Primeira execução: renderiza a página atual
  // baseando-se na URL quando a página carregou
  await handleHashChange();

  // Escuta mudanças futuras (navegação do usuário)
  // Cada vez que o usuário muda a hash, o callback roda
  window.addEventListener("hashchange", handleHashChange);
}