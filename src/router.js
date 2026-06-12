// Router hash-based: mapeia URLs para funções de página com guard de autenticação
import { state } from "./store.js";
import { isAuthorized, isLoggedIn } from "./services/api.js";

// Funções de renderização registradas por registerPages()
let renderFunctions = {};

// Associa nome da rota à função de renderização da página
export function registerPages(pages) {
  renderFunctions = pages;
}

// Mapa de rotas: cada entrada extrai rota e parâmetros das partes da URL
const routeMap = {
  // Rota list: extrai termo de busca da URL (ex: #/list/search=harry)
  list: (parts) => {
    const searchParam = parts.find((p) => p.startsWith("search="));
    return {
      route: "list",
      params: searchParam
        ? { search: decodeURIComponent(searchParam.replace("search=", "")) }
        : {},
    };
  },
  detail: (parts) => ({ route: "detail", params: { id: parts[1] } }),
  create: () => ({ route: "create", params: {} }),
  edit: (parts) => ({ route: "edit", params: { id: parts[1] } }),
  login: () => ({ route: "login", params: {} }),
  status: () => ({ route: "status", params: {} }),
  noCover: () => ({ route: "noCover", params: {} }),
  watchNext: () => ({ route: "watchNext", params: {} }),
  ghibli: () => ({ route: "ghibli", params: {} }),
};

// Inicializa o router: escuta mudanças na hash e renderiza a página
export async function initRouter() {
  const handleHashChange = async () => {
    // Extrai partes da URL hash (ex: /detail/abc123 → ["detail", "abc123"])
    const hash = window.location.hash.slice(1) || "/";
    const parts = hash.split("/").filter(Boolean);

    const loggedIn = isLoggedIn();
    const firstPart = parts[0] || "";

    // Redireciona para login se não autorizado
    if (!isAuthorized() && firstPart !== "login") {
      window.location.hash = "/login";
      return;
    }

    // Usuário logado não precisa ver login
    if (loggedIn && firstPart === "login") {
      window.location.hash = "/list";
      return;
    }

    // Lookup no mapa de rotas (fallback para list se não encontrado)
    const matcher = routeMap[parts[0]];
    const { route, params } = matcher ? matcher(parts) : { route: "list", params: {} };

    // Atualiza estado global com rota e parâmetros atuais
    state.currentRoute = route;
    state.params = params;

    // Renderiza a página chamando a função registrada
    const renderFn = renderFunctions[route];
    if (renderFn) {
      await renderFn();
    } else {
      console.error("No render function for route:", route);
    }
  };

  // Renderiza na carga inicial e escuta mudanças
  await handleHashChange();
  window.addEventListener("hashchange", handleHashChange);
}
