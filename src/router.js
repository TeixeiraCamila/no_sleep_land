import { state } from "./store.js";
import { isAuthorized, isLoggedIn } from "./services/api.js";

// Funções de renderização registradas por registerPages()
let renderFunctions = {};

// Associa nome da rota à função de renderização da página
export function registerPages(pages) {
  renderFunctions = pages;
}

// Inicializa o router: escuta mudanças na hash e renderiza a página correspondente
export async function initRouter() {
  const handleHashChange = async () => {
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

    // Define rota e parâmetros baseado na URL
    let route = "list";
    let params = {};

    if (parts[0] === "list") {
      route = "list";
      const searchParam = parts.find((p) => p.startsWith("search="));
      if (searchParam) {
        params.search = decodeURIComponent(searchParam.replace("search=", ""));
      }
    } else if (parts[0] === "detail" && parts[1]) {
      route = "detail";
      params = { id: parts[1] };
    } else if (parts[0] === "create") {
      route = "create";
    } else if (parts[0] === "edit" && parts[1]) {
      route = "edit";
      params = { id: parts[1] };
    } else if (parts[0] === "login") {
      route = "login";
    } else if (parts[0] === "status") {
      route = "status";
    } else if (parts[0] === "noCover") {
      route = "noCover";
    }

    state.currentRoute = route;
    state.params = params;

    // Renderiza a página
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
