// Componente Sidebar: navegação lateral com busca, links e ações de autenticação
// Renderizada por content.js (view base); recebe logged_in e active_page via props
import { is_guest } from "../services/api.js";

// Template HTML da sidebar com navegação, busca e ações
export function render_sidebar(logged_in, active_page) {
  return `
    <aside class="sidebar bg-zinc-900 flex flex-col h-screen p-4 fixed right-0 top-0 w-60">
      <div class="sidebar__logo mb-6">
        <h2 class="text-xl font-bold">No Sleep Land</h2>
      </div>
      
      <div class="sidebar__search mb-6">
        <input type="text" id="sidebar-search-input" 
          class="sidebar__search-input w-full px-3 py-2 bg-black border border-zinc-700 text-white placeholder-zinc-500 focus:border-white focus:outline-none" 
          placeholder="Search..." />
      </div>
      
      <nav class="sidebar__nav flex flex-col gap-1">
        <button onclick="window.location.hash = '/list'" class="sidebar-btn ${active_page === "list" ? "bg-zinc-800" : ""} cursor-pointer">
          List
        </button>
        <button onclick="window.location.hash = '/status'" class="sidebar-btn ${active_page === "status" ? "bg-zinc-800" : ""} cursor-pointer">
          Status
        </button>
      
        <button onclick="window.location.hash = '/watchNext'" class="sidebar-btn ${active_page === "watchNext" ? "bg-zinc-800" : ""} cursor-pointer">
          Watch Later
        </button>
        <button onclick="window.location.hash = '/ghibli'" class="sidebar-btn ${active_page === "ghibli" ? "bg-zinc-800" : ""} cursor-pointer">
          Ghibli
        </button>

        <button onclick="window.location.hash = '/poster'" class="sidebar-btn ${active_page === "poster" ? "bg-zinc-800" : ""} cursor-pointer">
          Poster Maker
        </button>
      </nav>
      
      <div class="sidebar__actions mt-auto pt-4">
        ${logged_in && !is_guest() ? `<button onclick="window.location.hash = '/create'" class="sidebar__add-btn w-full px-4 py-2 bg-white text-black font-semibold hover:bg-zinc-200 cursor-pointer">+ Add</button>` : ""}
      </div>
      
      <div class="sidebar__footer mt-4 pt-4 border-t border-zinc-800">
        ${
          logged_in
            ? `<button id="sidebar-logout" class="w-full px-4 py-2 border border-zinc-700 text-zinc-400 hover:border-white hover:text-white cursor-pointer">Sign out</button>`
            : `<button onclick="window.location.hash = '/login'" class="w-full px-4 py-2 border border-zinc-700 text-zinc-400 hover:border-white hover:text-white cursor-pointer">Login</button>`
        }
      </div>
    </aside>
  `;
}

// Toggle sidebar: desliza conteúdo e exibe/esconde painel lateral
export function init_toggle_sidebar() {
  document.addEventListener("click", (e) => {
    const toggle_btn = document.getElementById("btn-toggle-sidebar");
    if (!toggle_btn) return;

    // Ignora cliques fora do botão toggle
    if (!e.target.closest("#btn-toggle-sidebar")) return;

    const main_content = document.querySelector(".main-content");
    const sidebar = document.querySelector(".sidebar");

    if (main_content && sidebar) {
      main_content.classList.toggle("main-moved");
      sidebar.classList.toggle("visible");
    }
  });
}
