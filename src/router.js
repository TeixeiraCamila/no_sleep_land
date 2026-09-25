// Router hash-based: mapeia URLs para funções de página com guard de autenticação
// Padrão Page+View: router chama página (lógica/dados), página delega à view (template)
import { state } from "./store.js";
import {
  is_authorized,
  is_logged_in,
  validate_session,
} from "./services/api.js";
import { setup_sidebar_search } from "./utils/sidebar-search.js";

// Funções de renderização registradas por register_pages()
let render_functions = {};

// Associa nome da rota à função de renderização da página
export function register_pages(pages) {
  render_functions = pages;
}

// Mapa de rotas: cada entrada extrai rota e parâmetros das partes da URL
const route_map = {
  // Rota list: extrai termo de busca da URL (ex: #/list/search=harry)
  list: (parts) => {
    const search_param = parts.find((p) => p.startsWith("search="));
    return {
      route: "list",
      params: search_param
        ? { search: decodeURIComponent(search_param.replace("search=", "")) }
        : {},
    };
  },
  detail: (parts) => ({ route: "detail", params: { id: parts[1] } }),
  create: () => ({ route: "create", params: {} }),
  edit: (parts) => ({ route: "edit", params: { id: parts[1] } }),
  login: () => ({ route: "login", params: {} }),
  status: () => ({ route: "status", params: {} }),
  noCover: () => ({ route: "noCover", params: {} }),
  watchNext: (parts) => {
    const search_param = parts.find((p) => p.startsWith("search="));
    return {
      route: "watchNext",
      params: search_param
        ? { search: decodeURIComponent(search_param.replace("search=", "")) }
        : {},
    };
  },
  ghibli: () => ({ route: "ghibli", params: {} }),
  poster: () => ({ route: "poster", params: {} }),
};

// Inicializa o router: escuta mudanças na hash e renderiza a página
export async function init_router() {
  const handle_hash_change = async () => {
    // Extrai partes da URL hash (ex: /detail/abc123 → ["detail", "abc123"])
    const hash = window.location.hash.slice(1) || "/";
    const parts = hash.split("/").filter(Boolean);

    const logged_in = is_logged_in();
    const first_part = parts[0] || "";

    // Redireciona para login se não autorizado
    if (!is_authorized() && first_part !== "login") {
      window.location.hash = "/login";
      return;
    }

    // Usuário logado não precisa ver login
    if (logged_in && first_part === "login") {
      window.location.hash = "/list";
      return;
    }

    // Lookup no mapa de rotas (fallback para list se não encontrado)
    const matcher = route_map[parts[0]];
    const { route, params } = matcher ? matcher(parts) : { route: "list", params: {} };

    // Atualiza estado global com rota e parâmetros atuais
    state.currentRoute = route;
    state.params = params;

    // Renderiza a página chamando a função registrada
    const render_fn = render_functions[route];
    if (render_fn) {
      await render_fn();
      // Listener único da busca da sidebar (decide o comportamento por rota)
      setup_sidebar_search();
    } else {
      console.error("No render function for route:", route);
    }
  };

  // Revalida o token guardado antes de decidir quem entra: o localStorage sozinho
  // não prova que o token ainda é aceito pelo backend
  await validate_session();

  // Renderiza na carga inicial e escuta mudanças
  await handle_hash_change();
  window.addEventListener("hashchange", handle_hash_change);
}
