// Camada de API: wrapper Fetch centralizado com autenticação via X-User-Id
// Depende de constants.js para chaves de localStorage e VITE_API_URL do .env
import { LS_GUEST, LS_LOGGED_USER } from "../constants.js";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

function get_user_id() {
  return localStorage.getItem(LS_LOGGED_USER);
}

// Núcleo compartilhado: request() e auth_request() usam a mesma lógica
// require_auth=true injeta header X-User-Id; FormData detectado automaticamente
async function api_request(url, options = {}, require_auth = false) {
  const headers = { ...options.headers };

  // Adiciona header de autenticação se requisição exigir
  if (require_auth) {
    const user_id = get_user_id();
    if (!user_id) {
      throw new Error("User not authenticated. Please login to continue.");
    }
    headers["X-User-Id"] = user_id;
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
      const error_data = await response.json().catch(() => ({}));
      throw new Error(
        error_data.message ||
          `HTTP Error ${response.status}: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    if (import.meta.env.DEV) {
      const prefix = require_auth ? "[API Auth Error]" : "[API Error]";
      console.error(`${prefix} ${options.method || "GET"} ${url}:`, error);
    }
    throw error;
  }
}

// Requisição sem autenticação
async function request(url, options = {}) {
  return api_request(url, options, false);
}

// Requisição autenticada (adiciona X-User-Id automaticamente)
async function auth_request(url, options = {}) {
  return api_request(url, options, true);
}

// API de entretenimento: CRUD completo via endpoints REST do backend Notion
// Fluxo: page chama método → api_request com fetch → retorna JSON → page armazena em state.items ou renderiza
export const entertainment_api = {
  // Lista com parâmetros opcionais (search, pageSize, startCursor, status)
  list: async (params) => {
    const search_params = new URLSearchParams();
    if (params?.pageSize) search_params.set("pageSize", String(params.pageSize));
    if (params?.startCursor)
      search_params.set("startCursor", params.startCursor);
    if (params?.search) search_params.set("search", params.search);
    if (params?.status) search_params.set("status", params.status);
    if (params?.studios) search_params.set("studios", params.studios);
    if (params?.tags) search_params.set("tags", params.tags);

    const query_string = search_params.toString();
    return request(`/api/entertainment${query_string ? `?${query_string}` : ""}`);
  },

  // Retorna todos os itens (sem paginação, útil para filtros locais)
  list_all: async () => {
    return request("/api/entertainment/all");
  },

  // Busca item individual por ID
  get: async (id) => {
    return request(`/api/entertainment/${id}`);
  },

  // Cria novo item (requer autenticação)
  create: async (data) => {
    return auth_request("/api/entertainment", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Atualiza item existente por ID (requer autenticação)
  update: async (id, data) => {
    return auth_request(`/api/entertainment/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Arqui/item (soft delete via API, requer autenticação)
  delete: async (id) => {
    return auth_request(`/api/entertainment/${id}`, {
      method: "DELETE",
    });
  },
};

// API de opções: carrega selects dinâmicos (status, tipos, tags)
// Usada por form.js (renderização do formulário) e status.js/ghibli.js (filtros Kanban)
export const options_api = {
  get: async () => {
    return request("/api/entertainment/options");
  },
};

// API de usuários: lista usuários do workspace Notion (para autenticação)
// Usada por login.js para validar credenciais contra o banco de usuários do Notion
export const users_api = {
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
// Hierarquia: is_authorized (mais permissivo) > is_logged_in > is_guest (mais restritivo)
// Verifica se existe usuário logado no localStorage
export function is_logged_in() {
  return !!get_user_id();
}

// Remove dados de autenticação do localStorage
export function logout() {
  localStorage.removeItem(LS_LOGGED_USER);
  localStorage.removeItem(LS_GUEST);
}

// Verifica se o usuário atual é convidado
export function is_guest() {
  return localStorage.getItem(LS_GUEST) === "true";
}

// Verifica se tem permissão (logado ou convidado)
export function is_authorized() {
  return is_logged_in() || is_guest();
}
