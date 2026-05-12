import "./assets/style/style.css";

// APIs - comunicação com o backend
import {
  entertainmentAPI,
  optionsAPI,
  usersAPI,
  isLoggedIn,
  logout,
} from "./services/api.js";

// Views
import { renderHome } from "./views/home.js";
import { renderLogin } from "./views/login.js";
import { renderList, renderListItems } from "./views/list.js";
import { renderDetail } from "./views/detail.js";
import { renderForm, renderFormAccessDenied } from "./views/form.js";
import { renderKanban, renderKanbanItems } from "./views/kanban.js";

// Utils
import { escapeHtml } from "./utils/html.js";

const state = {
  currentRoute: "home", // Rota atual
  params: {}, // Parâmetros da rota (ex: id do item, termo de busca)
  items: [], // Lista de itens carregados da API
  options: null, // Opções do formulário
  user: null, // Usuário logado atualmente
  loading: false, // Indicador de carregamento
  error: null, // Mensagem de erro atual
};

// Disponibiliza funções globalmente para uso nos onclick dos templates
window.handleLogout = () => {
  logout();
  window.location.hash = "/";
};

// ============================================
// ROUTER - Sistema de navegação baseado em hash URL
// Formato: /rota ou /rota/parametro
// Exemplo: /list/search=anime, /detail/123, /edit/456
// ============================================
async function initRouter() {
  // Callback executado sempre que a URL mudar
  const handleHashChange = async () => {
    // Remove o '#' do início e obtém a rota
    // Ex: "/list" -> "/list" -> "list"
    const hash = window.location.hash.slice(1) || "/";

    // Divide a hash em partes para extrair rota e parâmetros
    // Ex: "list/search=anime" -> ["list", "search=anime"]
    const parts = hash.split("/").filter(Boolean);

    // Verifica se o usuário está autenticado
    const loggedIn = isLoggedIn();

    // Extrai a primeira parte da rota (padrão: home se vazio)
    const firstPart = parts[0] || "home";

    // ----------------------------------------
    // PROTEÇÃO DE ROTAS - Redirect automático
    // ----------------------------------------

    // Se não está logado E tenta acessar qualquer página que não seja login → vai para login
    if (!loggedIn && firstPart !== "login") {
      window.location.hash = "/login";
      return;
    }

    // Se está logado E tenta acessar página de login → vai para listagem
    if (loggedIn && firstPart === "login") {
      window.location.hash = "/list";
      return;
    }

    // ----------------------------------------
    // PARSING DA ROTA - Determina qual página renderizar
    // ----------------------------------------

    let route = "home"; // Rota padrão
    let params = {}; // Parâmetros extraídos da URL

    // Mapeamento de rotas para páginas
    // Supporta:
    //   /list - Lista de entretenimento
    //   /list/search=termo - Lista com filtro
    //   /detail/id - Detalhes de um item
    //   /create - Criar novo item
    //   /edit/id - Editar item existente
    //   /login - Página de login
    //   /status - Quadro Kanban por status

    if (parts[0] === "list") {
      route = "list";
      // Extrai parâmetro de busca da URL (ex: search=anime)
      const searchParam = parts.find((p) => p.startsWith("search="));
      if (searchParam) {
        params.search = decodeURIComponent(searchParam.replace("search=", ""));
      }
    }
    // /detail/123 - Exibe detalhes do item com ID 123
    else if (parts[0] === "detail" && parts[1]) {
      route = "detail";
      params = { id: parts[1] };
    }
    // /create - Formulário para criar novo item
    else if (parts[0] === "create") route = "create";
    // /edit/123 - Formulário para editar item com ID 123
    else if (parts[0] === "edit" && parts[1]) {
      route = "edit";
      params = { id: parts[1] };
    } else if (parts[0] === "login") route = "login";
    else if (parts[0] === "status") route = "status";

    // Atualiza o estado global com a rota atual
    state.currentRoute = route;
    state.params = params;

    // ----------------------------------------
    // RENDERIZAÇÃO - Executa a função appropriate
    // ----------------------------------------

    if (route === "list") await renderListPage();
    else if (route === "detail") await renderDetailPage();
    else if (route === "create" || route === "edit") await renderFormPage();
    else if (route === "login") await renderLoginPage();
    else if (route === "status") await renderStatusPage();
    else await renderListPage();
    
    toggleSideBar()
  };

  // Executa uma vez na inicialização para renderizar a página atual
  await handleHashChange();

  // Escuta mudanças futuras na hash (navegação do usuário)
  window.addEventListener("hashchange", handleHashChange);
}

function toggleSideBar() {
  // ----------------------------------------
  // Botão toggle sidebar
  // ----------------------------------------
  const toggleBtn = document.getElementById("btn-toggle-sidebar");
  const mainContent = document.querySelector(".main-content");
  const sidebar = document.querySelector(".sidebar");

    if (toggleBtn && mainContent && sidebar) {

    toggleBtn.addEventListener("click", () => {
      mainContent.classList.toggle("main-moved");
      sidebar.classList.toggle("visible");
        });
    }
  
}

// ============================================
// PÁGINAS - Funções de renderização
// Cada função renderiza uma página específica
// ============================================

/**
 * Página Inicial (Home)
 * Exibe mensagem de boas-vindas e navegação
 */
function renderHomePage() {
  const app = document.getElementById("app");
  if (!app) return;

  // Renderiza o template da home passando estado de login
  app.innerHTML = renderHome(isLoggedIn());
}

/**
 * Página de Lista (List)
 * Exibe lista de entretenimento com busca em tempo real
 * Suporta busca no header e na sidebar
 */
async function renderListPage() {
  const app = document.getElementById("app");
  if (!app) return;

  // Recupera termo de busca dos parâmetros da rota
  const searchTerm = state.params.search || "";

  // Renderiza o template da lista
  app.innerHTML = renderList(isLoggedIn(), searchTerm);

  // Referências aos elementos DOM para manipulação
  const loadingEl = document.getElementById("loading");
  const listContainer = document.getElementById("list-container");
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search");

  // Verifica se elementos essenciais existem
  if (!loadingEl || !listContainer) return;

  /**
   * Executa a busca na API
   * @param {string} search - Termo de busca (opcional)
   */
  const performSearch = async (search) => {
    // Mostra indicador de carregamento
    loadingEl.classList.remove("hidden");
    listContainer.classList.add("hidden");

    try {
      // Chama API para buscar lista de entretenimento
      const response = await entertainmentAPI.list({
        search: search || undefined,
      });

      // Armazena itens no estado global
      state.items = response.data;

      // Oculta carregamento e exibe resultados
      loadingEl.classList.add("hidden");
      listContainer.classList.remove("hidden");
      listContainer.innerHTML = renderListItems(response.data);
    } catch (error) {
      // Exibe mensagem de erro na tela
      loadingEl.textContent = `Erro: ${error.message}`;
    }
  };

  // Executa busca inicial (com ou sem termo)
  if (searchTerm) {
    performSearch(searchTerm);
  } else {
    performSearch("");
  }

  // ----------------------------------------
  // Campo de busca no header
  // Implementa debounce para evitar muitas requisições
  // ----------------------------------------
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer); // Cancela busca anterior
      // Aguarda 300ms após último input antes de buscar
      debounceTimer = setTimeout(() => {
        const search = e.target.value.trim();
        // Atualiza URL com novo termo de busca
        window.location.hash = search
<<<<<<< HEAD
          ? `#/list/search=${encodeURIComponent(search)}`
          : '#/list'
      }, 300)
    })
  }

  // ----------------------------------------
  // Botão toggle sidebar
  // ----------------------------------------
  const toggleBtn = document.getElementById('btn-toggle-sidebar')
  const mainContent = document.querySelector('.main-content')
  // const sidebar = document.querySelector('.sidebar')
  
  if (toggleBtn && mainContent) {
    toggleBtn.addEventListener('click', () => {
      mainContent.classList.toggle('main-moved')
      // sidebar.classList.toggle('visible')
    })
=======
          ? `/list/search=${encodeURIComponent(search)}`
          : "/list";
      }, 300);
    });
>>>>>>> 2b1d94ff08b4185860722dcb61196c6515352dab
  }

  // ----------------------------------------
  // Campo de busca na sidebar
  // Mesmo comportamento de debounce
  // ----------------------------------------
  const sidebarSearchInput = document.getElementById("sidebar-search-input");
  if (sidebarSearchInput) {
    let debounceTimer;
    sidebarSearchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const search = e.target.value.trim();
        window.location.hash = search
          ? `/list/search=${encodeURIComponent(search)}`
          : "/list";
      }, 600);
    });
  }

  // ----------------------------------------
  // Botão para limpar busca
  // ----------------------------------------
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      window.location.hash = "/list";
    });
  }
}

/**
 * Página de Detalhes (Detail)
 * Exibe informações completas de um item
 * Permite exclusão apenas para usuários logados
 */
async function renderDetailPage() {
  const app = document.getElementById("app");
  // Verifica se tem elemento app e ID do item nos parâmetros
  if (!app || !state.params.id) return;

  const loggedIn = isLoggedIn();

  // Renderiza estrutura inicial com indicador de carregamento
  app.innerHTML = `<div class="text-center py-8 text-zinc-400" id="loading">Carregando...</div><div id="content"></div>`;

  const loadingEl = document.getElementById("loading");
  const contentEl = document.getElementById("content");

  if (!contentEl || !loadingEl) {
    console.error("Elementos não encontrados");
    return;
  }

  try {
    // Busca detalhes do item na API
    const item = await entertainmentAPI.get(state.params.id);

    // Oculta carregamento e renderiza conteúdo
    loadingEl.style.display = "none";
    contentEl.innerHTML = renderDetail(item, loggedIn);

    // Se usuário estiver logado, adiciona funcionalidade de exclusão
    if (loggedIn) {
      const deleteBtn = document.getElementById("delete-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
          // Confirmação antes de excluir
          if (confirm("Tem certeza?")) {
            await entertainmentAPI.delete(item.id);
            window.location.hash = "/list"; // Retorna para lista após excluir
          }
        });
      }
    }
  } catch (error) {
    console.error("Erro:", error);
    loadingEl.textContent = `Erro: ${error.message}`;
  }
}

/**
 * Inicializa campos de autocomplete para selects múltiplos
 */
function initAutocompletes() {
  const containers = document.querySelectorAll(".autocomplete-container");

  containers.forEach((container) => {
    const input = container.querySelector(".autocomplete-input");
    const dropdown = container.querySelector(".autocomplete-dropdown");
    const selectedContainer = container.querySelector(".autocomplete-selected");

    if (!input || !dropdown) return;

    const options = JSON.parse(input.dataset.options || "[]");
    const selectedValues = JSON.parse(input.dataset.selected || "[]");

    input.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();

      if (searchTerm === "") {
        dropdown.classList.add("hidden");
        return;
      }

      const filtered = options.filter(
        (opt) =>
          opt.toLowerCase().includes(searchTerm) &&
          !selectedValues.includes(opt),
      );

      if (filtered.length === 0) {
        // Permite adicionar novos valores
        dropdown.innerHTML = `
          <div class="autocomplete-option p-2 cursor-pointer hover:bg-zinc-800 text-zinc-400" data-value="${escapeHtml(e.target.value)}">
            + Adicionar "${escapeHtml(e.target.value)}"
          </div>
        `;
      } else {
        dropdown.innerHTML = filtered
          .map(
            (opt) => `
          <div class="autocomplete-option p-2 cursor-pointer hover:bg-zinc-800" data-value="${escapeHtml(opt)}">
            ${escapeHtml(opt)}
          </div>
        `,
          )
          .join("");
      }

      dropdown.classList.remove("hidden");
    });

    dropdown.addEventListener("click", (e) => {
      const option = e.target.closest(".autocomplete-option");
      if (!option) return;

      const value = option.dataset.value;
      if (!selectedValues.includes(value)) {
        selectedValues.push(value);
        addSelectedTag(
          container,
          input,
          selectedValues,
          value,
          selectedContainer,
        );
      }

      input.value = "";
      dropdown.classList.add("hidden");
    });

    selectedContainer.addEventListener("click", (e) => {
      const removeBtn = e.target.closest(".autocomplete-remove");
      if (!removeBtn) return;

      const value = removeBtn.dataset.value;
      const index = selectedValues.indexOf(value);
      if (index > -1) {
        selectedValues.splice(index, 1);
        const tag = removeBtn.closest(".autocomplete-tag");
        if (tag) tag.remove();
      }
    });

    input.addEventListener("blur", () => {
      setTimeout(() => dropdown.classList.add("hidden"), 200);
    });

    input.addEventListener("focus", () => {
      if (input.value.trim()) {
        input.dispatchEvent(new Event("input"));
      }
    });
  });
}

function addSelectedTag(
  container,
  input,
  selectedValues,
  value,
  selectedContainer,
) {
  const tag = document.createElement("span");
  tag.className =
    "autocomplete-tag inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 text-sm text-white";
  tag.innerHTML = `
    ${escapeHtml(value)}
    <button type="button" class="autocomplete-remove hover:text-red-400" data-value="${escapeHtml(value)}">&times;</button>
    <input type="hidden" name="${input.closest(".autocomplete-container").dataset.fieldName}" value="${escapeHtml(value)}" />
  `;
  selectedContainer.appendChild(tag);
}

/**
 * Página de Formulário (Create/Edit)
 * Formulário para criar novo item ou editar existente
 * Requer autenticação para acesso
 */
async function renderFormPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const loggedIn = isLoggedIn();

  // Se não está logado, exibe mensagem de acesso negado
  if (!loggedIn) {
    app.innerHTML = renderFormAccessDenied();
    return;
  }

  // ----------------------------------------
  // Carrega dados necessários
  // ----------------------------------------

  // Busca opções disponíveis para selects (tipos, status, tags)
  let options = {};
  try {
    options = await optionsAPI.get();
  } catch (e) {
    console.error(e);
  }

  // Se modo edição, busca dados existentes do item
  let existingData = null;
  if (state.params.id) {
    try {
      existingData = await entertainmentAPI.get(state.params.id);
    } catch (e) {
      console.error(e);
    }
  }

  // Determina se é modo edição ou criação
  const isEditing = !!existingData;

  // Renderiza o formulário com opções e dados (se edição)
  app.innerHTML = renderForm(options, existingData, isEditing);

  // ----------------------------------------
  // Inicializa autocompletes
  // ----------------------------------------
  initAutocompletes();

  // ----------------------------------------
  // Configura envio do formulário
  // ----------------------------------------
  const form = document.getElementById("form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // Previne reload da página

      // Extrai dados do formulário
      const formData = new FormData(form);
      const data = {};

      // Mapeia cada campo do formulário para o objeto de dados
      // Apenas inclui campos com valor preenchido

      const name = formData.get("name");
      if (name) data.name = name;

      const status = formData.get("status");
      if (status) data.status = status;

      const type = formData.get("type");
      if (type) data.type = type;

      const rating = formData.get("rating");
      if (rating) data.rating = rating;

      const dateStart = formData.get("dateStart");
      if (dateStart) data.dateStart = dateStart;

      const dateEnd = formData.get("dateEnd");
      if (dateEnd) data.dateEnd = dateEnd;

      const nacionalidade = formData.get("nacionalidade");
      if (nacionalidade) data.nacionalidade = nacionalidade;

      const episodesSeen = formData.get("episodesSeen");
      if (episodesSeen) data.episodesSeen = episodesSeen;

      const episodes = formData.get("episodes");
      if (episodes) data.episodes = episodes;

      // Campos com múltiplos valores (checkboxes/selects múltiplos)
      const studios = formData.getAll("studios");
      if (studios.length) data.studios = studios;

      const tags = formData.getAll("tags");
      if (tags.length) data.tags = tags;

      const coverUrl = formData.get("coverUrl");
      if (coverUrl) data.coverUrl = coverUrl;

      try {
        // Decide entre criar novo ou atualizar existente
        if (isEditing && state.params.id) {
          await entertainmentAPI.update(state.params.id, data);
        } else {
          await entertainmentAPI.create(data);
        }
        // Redireciona para lista após sucesso
        window.location.hash = "/list";
      } catch (error) {
        alert(`Erro: ${error.message}`);
      }
    });
  }
}

/**
 * Página de Login
 * Autentica usuário comparando nome/email com dados da API
 * Armazena ID do usuário no localStorage
 */
async function renderLoginPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const loggedIn = isLoggedIn();

  // Se já está logado, mostra botão de logout
  app.innerHTML = renderLogin(loggedIn);

  if (loggedIn) {
    return;
  }

  // ----------------------------------------
  // Carrega lista de usuários para autenticação
  // ----------------------------------------

  const loadingEl = document.getElementById("loading");
  const formEl = document.getElementById("login-form");

  try {
    // Busca todos os usuários da API
    const response = await usersAPI.list();
    const users = response.results;

    // Oculta carregamento e exibe formulário
    if (loadingEl) loadingEl.classList.add("hidden");
    if (formEl) formEl.classList.remove("hidden");

    const form = document.getElementById("login-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Extrai credenciais do formulário e normaliza para lowercase
        const formData = new FormData(form);
        const name = formData.get("name").toLowerCase();
        const email = formData.get("email").toLowerCase();

        // Busca usuário que corresponda ao nome ou email digitado
        const user = users.find((u) => {
          const userName = (u.name || "").toLowerCase();
          const userEmail = (u.person?.email || "").toLowerCase();
          return userName === name || userEmail === email;
        });

        if (user) {
          // Armazena ID do usuário logado no localStorage
          localStorage.setItem("USER_LOGADO", user.id);
          state.user = user;
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

/**
 * Página de Status (Kanban)
 * Exibe quadro Kanban com itens organizados por status
 * Permite filtragem em tempo real
 */
async function renderStatusPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const loggedIn = isLoggedIn();
  app.innerHTML = renderKanban(loggedIn);

  const loadingEl = document.getElementById("loading");
  const kanbanContainer = document.getElementById("kanban-container");

  if (!loadingEl || !kanbanContainer) return;

  try {
    // ----------------------------------------
    // Carrega dados em paralelo
    // Busca todos os itens e opções simultaneamente
    // ----------------------------------------
    const [itemsResponse, optionsResponse] = await Promise.all([
      entertainmentAPI.listAll(),
      optionsAPI.get(),
    ]);

    // Normaliza resposta (pode vir como data ou array direto)
    const items = itemsResponse.data || itemsResponse;

    // Extrai opções de status (suporta diferentes formatos de chave)
    let statusOptions = [];
    if (Array.isArray(optionsResponse.Status)) {
      statusOptions = optionsResponse.Status;
    } else if (Array.isArray(optionsResponse.status)) {
      statusOptions = optionsResponse.status;
    }

    // Armazena no estado global
    state.items = items;

    // Oculta carregamento e renderiza Kanban
    loadingEl.classList.add("hidden");
    kanbanContainer.classList.remove("hidden");
    kanbanContainer.innerHTML = renderKanbanItems(items, statusOptions);

    // ----------------------------------------
    // Filtro de busca na sidebar
    // Filtra itens em tempo real sem nova requisição
    // ----------------------------------------
    const sidebarSearchInput = document.getElementById("sidebar-search-input");
    if (sidebarSearchInput) {
      let debounceTimer;
      sidebarSearchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const search = e.target.value.trim().toLowerCase();
          // Filtra items localmente pelo nome
          const filteredItems = search
            ? items.filter((item) => item.name?.toLowerCase().includes(search))
            : items;
          // Re-renderiza apenas os cards (não recarrega dados)
          kanbanContainer.innerHTML = renderKanbanItems(
            filteredItems,
            statusOptions,
          );
        }, 300);
      });
    }
  } catch (error) {
    console.error("Erro:", error);
    loadingEl.textContent = `Erro: ${error.message}`;
  }
}

// ============================================
// INICIALIZAÇÃO - Ponto de entrada da aplicação
// ============================================

/**
 * Inicia a aplicação quando o DOM estiver pronto
 * Configura o router e inicia o ciclo de vida da app
 */
document.addEventListener("DOMContentLoaded", () => {
  initRouter();
});
