// Camada de API: wrapper Fetch centralizado com sessão JWT via header Authorization
// Depende de constants.js para chaves de localStorage e VITE_API_URL do .env
import {
  LS_GUEST,
  LS_SESSION_TOKEN,
  LS_SESSION_USER,
} from "../constants.js";

// Fallback vazio de propósito: os caminhos já começam com /api, então prefixar
// "/api" aqui viraria /api/api/entertainment.
const API_BASE = import.meta.env.VITE_API_URL || "";

// Sessão em memória, espelhada do localStorage. Os guards são síncronos e não
// podem esperar fetch, por isso validamos o token uma vez no boot (validate_session).
const session = {
  token: localStorage.getItem(LS_SESSION_TOKEN),
  user: read_json(LS_SESSION_USER),
  guest: localStorage.getItem(LS_GUEST) === "true",
};

function read_json(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

// Grava a sessão (login) ou apaga tudo (logout/401)
function persist_session({ token, user, guest = false } = {}) {
  session.token = token || null;
  session.user = user || null;
  session.guest = Boolean(guest);

  if (token) localStorage.setItem(LS_SESSION_TOKEN, token);
  else localStorage.removeItem(LS_SESSION_TOKEN);

  if (user) localStorage.setItem(LS_SESSION_USER, JSON.stringify(user));
  else localStorage.removeItem(LS_SESSION_USER);

  if (session.guest) localStorage.setItem(LS_GUEST, "true");
  else localStorage.removeItem(LS_GUEST);
}

// Núcleo compartilhado: request() e auth_request() usam a mesma lógica
// require_auth=true exige token e injeta Authorization; FormData é detectado automaticamente
async function api_request(url, options = {}, require_auth = false) {
  const headers = { ...options.headers };

  // Adiciona header de autenticação se requisição exigir
  if (require_auth) {
    if (!session.token) {
      throw new Error("Você precisa entrar na sua conta para fazer isso.");
    }
    headers["Authorization"] = `Bearer ${session.token}`;
  }

  // Define Content-Type automaticamente (FormData deixa o browser definir)
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  } else if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${API_BASE}${url}`, { ...options, headers });

    // 401 fora do login = token expirado ou revogado: derruba a sessão e volta
    // para a tela de login. Só o POST /api/auth/login fica de fora, porque o
    // 401 dele é "código errado" e a mensagem precisa aparecer no formulário.
    if (response.status === 401 && url !== "/api/auth/login") {
      persist_session();
      if (window.location.hash !== "#/login") {
        window.location.hash = "/login";
      }
    }

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

// Requisição autenticada (adiciona Authorization: Bearer automaticamente)
async function auth_request(url, options = {}) {
  return api_request(url, options, true);
}

// API de autenticação: troca email + código por um token JWT
// O segredo nunca chega ao bundle: o navegador só envia as credenciais
export const auth_api = {
  login: async (email, codigo) => {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, codigo }),
    });
  },

  me: async () => {
    // Probe curto no boot: sem isto, rede ruim penduraria o carregamento
    return auth_request("/api/auth/me", { signal: AbortSignal.timeout(5000) });
  },
};

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

  // Devolve só o array do /all (o envelope é {data, total}) — usada pelas
  // páginas que querem a lista pronta sem repetir a checagem do envelope
  list_all_items: async () => {
    const res = await request("/api/entertainment/all");
    return Array.isArray(res?.data) ? res.data : [];
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

  // Arquiva item (soft delete via API, requer autenticação)
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

// Guards de sessão: leem o espelho em memória, sem I/O
// Hierarquia: is_authorized (mais permissivo) > is_logged_in > is_guest (mais restritivo)
export function is_logged_in() {
  return Boolean(session.token);
}

export function is_guest() {
  return session.guest && !session.token;
}

export function is_authorized() {
  return is_logged_in() || is_guest();
}

// Usuário da sessão ativa (null para visitante)
export function get_current_user() {
  return session.user;
}

// Abre sessão com o par { token, user } devolvido por /api/auth/login
export function start_session({ token, user }) {
  persist_session({ token, user });
}

// Entra como visitante: leitura sem token, sem direito de escrita
export function start_guest_session() {
  persist_session({ guest: true });
}

// Descarta token, usuário e flag de visitante
export function logout() {
  persist_session();
}

// Revalida o token guardado contra o /me no boot: sem isso, um token expirado
// continuaria parecendo sessão válida na UI e só falharia na primeira escrita.
// Só o 401 derruba (limpa e redireciona dentro de api_request); rede/5xx mantêm.
export async function validate_session() {
  if (!session.token) return is_authorized();

  try {
    await auth_api.me();
    return true;
  } catch {
    // Rede/timeout/5xx não provam nada sobre o token: só o 401 já limpou acima
    return is_authorized();
  }
}
