import { LS_GUEST, LS_LOGGED_USER } from "../constants.js";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

function getUserId() {
  return localStorage.getItem(LS_LOGGED_USER);
}

// Núcleo compartilhado: request() e authRequest() usam a mesma lógica
async function apiRequest(url, options = {}, requireAuth = false) {
  const headers = { ...options.headers };

  if (requireAuth) {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User not authenticated. Please login to continue.");
    }
    headers["X-User-Id"] = userId;
  }

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

// Métodos da API de entretenimento (listar, criar, atualizar, deletar)
export const entertainmentAPI = {
  list: async (params) => {
    const searchParams = new URLSearchParams();
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
    if (params?.startCursor)
      searchParams.set("startCursor", params.startCursor);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);

    const queryString = searchParams.toString();
    return request(`/api/entertainment${queryString ? `?${queryString}` : ""}`);
  },

  listAll: async () => {
    return request("/api/entertainment/all");
  },

  get: async (id) => {
    return request(`/api/entertainment/${id}`);
  },

  create: async (data) => {
    return authRequest("/api/entertainment", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return authRequest(`/api/entertainment/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return authRequest(`/api/entertainment/${id}`, {
      method: "DELETE",
    });
  },
};

// Métodos da API de opções (status, tipos, tags)
export const optionsAPI = {
  get: async () => {
    return request("/api/entertainment/options");
  },
};

// Métodos da API de usuários
export const usersAPI = {
  list: async () => {
    return request("/api/users");
  },

  get: async (id) => {
    return request(`/api/users/${id}`);
  },
};

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
