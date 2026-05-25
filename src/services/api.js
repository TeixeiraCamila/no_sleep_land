/**
 * API service communication
 */
import { LS_GUEST, LS_LOGGED_USER } from "../constants.js";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

function getUserId() {
  return localStorage.getItem(LS_LOGGED_USER);
}

async function request(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  let finalOptions = { ...options, headers };

  // Se tem FormData (para uploads), usar multipart
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
    finalOptions = { ...options, headers: { ...headers } };
  }

  try {

    const response = await fetch(`${API_BASE}${url}`, finalOptions);

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
      console.error(`[API Error] ${options.method || "GET"} ${url}:`, error);
    }
    throw error;
  }
}

async function authRequest(url, options = {}) {
  const userId = getUserId();

  if (!userId) {
    throw new Error("User not authenticated. Please login to continue.");
  }

  const headers = {
    "X-User-Id": userId,
    ...options.headers,
  };

  // Se tem FormData, remover Content-Type para permitir o browser definir o boundary
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  } else if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
    });

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
      console.error(
        `[API Auth Error] ${options.method || "GET"} ${url}:`,
        error,
      );
    }
    throw error;
  }
}

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

export const optionsAPI = {
  get: async () => {
    return request("/api/entertainment/options");
  },
};

export const usersAPI = {
  list: async () => {
    return request("/api/users");
  },

  get: async (id) => {
    return request(`/api/users/${id}`);
  },
};

export function isLoggedIn() {
  return !!getUserId();
}

export function logout() {
  localStorage.removeItem(LS_LOGGED_USER);
  localStorage.removeItem(LS_GUEST);
}

export function isGuest() {
  return localStorage.getItem(LS_GUEST) === "true";
}

export function isAuthorized() {
  return isLoggedIn() || isGuest();
}
