// Camada de API: wrapper Fetch centralizado com autenticação via X-User-Id
// Depende de constants.js para chaves de localStorage e VITE_API_URL do .env
import { LS_GUEST, LS_LOGGED_USER } from "../constants.js";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

function getUserId() {
  return localStorage.getItem(LS_LOGGED_USER);
}

// Núcleo compartilhado: request() e authRequest() usam a mesma lógica
// requireAuth=true injeta header X-User-Id; FormData detectado automaticamente
async function apiRequest(url, options = {}, requireAuth = false) {
  const headers = { ...options.headers };

  // Adiciona header de autenticação se requisição exigir
  if (requireAuth) {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User not authenticated. Please login to continue.");
    }
    headers["X-User-Id"] = userId;
  }

  // Define Content-Type automaticamente (FormData deixa o browser definir)
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  } else if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${API_BASE}${url}`, { ...options, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `HTTP Error ${response.status}: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    if (import.meta.env.DEV) {
      const prefix = requireAuth ? "[API Auth Error]" : "[API Error]";
      console.error(`${prefix} ${options.method || "GET"} ${url}:`, error);
    }
    throw error;
  }
}

// Requisição sem autenticação
async function request(url, options = {}) {
  return apiRequest(url, options, false);
}

// Requisição autenticada (adiciona X-User-Id automaticamente)
async function authRequest(url, options = {}) {
  return apiRequest(url, options, true);
}

// API de entretenimento: CRUD completo via endpoints REST do backend Notion
// Fluxo: page chama método → apiRequest com fetch → retorna JSON → page armazena em state.items ou renderiza
export const entertainmentAPI = {
  // Lista com parâmetros opcionais (search, pageSize, startCursor, status)
  list: async (params) => {
    const searchParams = new URLSearchParams();
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
    if (params?.startCursor)
      searchParams.set("startCursor", params.startCursor);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.studios) searchParams.set("studios", params.studios);
    if (params?.tags) searchParams.set("tags", params.tags);

    const queryString = searchParams.toString();
    return request(`/api/entertainment${queryString ? `?${queryString}` : ""}`);
  },

  // Retorna todos os itens (sem paginação, útil para filtros locais)
  listAll: async () => {
    return request("/api/entertainment/all");
  },

  // Busca item individual por ID
  get: async (id) => {
    return request(`/api/entertainment/${id}`);
  },

  // Cria novo item (requer autenticação)
  create: async (data) => {
    return authRequest("/api/entertainment", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Atualiza item existente por ID (requer autenticação)
  update: async (id, data) => {
    return authRequest(`/api/entertainment/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Arqui/item (soft delete via API, requer autenticação)
  delete: async (id) => {
    return authRequest(`/api/entertainment/${id}`, {
      method: "DELETE",
    });
  },
};

// API de opções: carrega selects dinâmicos (status, tipos, tags)
// Usada por form.js (renderização do formulário) e status.js/ghibli.js (filtros Kanban)
export const optionsAPI = {
  get: async () => {
    return request("/api/entertainment/options");
  },
};

// API de usuários: lista usuários do workspace Notion (para autenticação)
// Usada por login.js para validar credenciais contra o banco de usuários do Notion
export const usersAPI = {
  // Lista todos os usuários do workspace
  list: async () => {
    return request("/api/users");
  },

  // Busca usuário individual por ID
  get: async (id) => {
    return request(`/api/users/${id}`);
  },
};

// Guards de autenticação: controlam acesso baseado em localStorage
// Hierarquia: isAuthorized (mais permissivo) > isLoggedIn > isGuest (mais restritivo)
// Verifica se existe usuário logado no localStorage
export function isLoggedIn() {
  return !!getUserId();
}

// Remove dados de autenticação do localStorage
export function logout() {
  localStorage.removeItem(LS_LOGGED_USER);
  localStorage.removeItem(LS_GUEST);
}

// Verifica se o usuário atual é convidado
export function isGuest() {
  return localStorage.getItem(LS_GUEST) === "true";
}

// Verifica se tem permissão (logado ou convidado)
export function isAuthorized() {
  return isLoggedIn() || isGuest();
}
