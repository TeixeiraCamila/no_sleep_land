// Componente Sidebar: navegação lateral com busca, links e ações de autenticação
// Renderizada por content.js (view base); recebe loggedIn e activePage via props
import { isGuest } from "../services/api.js";

// Template HTML da sidebar com navegação, busca e ações
export function renderSidebar(loggedIn, activePage) {
  return `
    <aside class="sidebar bg-zinc-900 flex flex-col h-screen p-4 fixed right-0 top-0 w-60">
      <div class="sidebar__logo mb-6">
        <h2 class="text-xl font-bold">No Sleep Land</h2>
      </div>
      
      <div class="sidebar__search mb-6">
        <input type="text" id="sidebar-search-input" 
          class="sidebar__search-input w-full px-3 py-2 bg-black border border-zinc-700 text-white placeholder-zinc-500 focus:border-white focus:outline-none" 
          placeholder="Buscar..." />
      </div>
      
      <nav class="sidebar__nav flex flex-col gap-1">
        <button onclick="window.location.hash = '/list'" class="sidebar-btn ${activePage === "list" ? "bg-zinc-800" : ""} cursor-pointer">
          Lista
        </button>
        <button onclick="window.location.hash = '/status'" class="sidebar-btn ${activePage === "status" ? "bg-zinc-800" : ""} cursor-pointer">
          Status
        </button>
      
        <button onclick="window.location.hash = '/watchNext'" class="sidebar-btn ${activePage === "watchNext" ? "bg-zinc-800" : ""} cursor-pointer">
          Watch Next
        </button>
        <button onclick="window.location.hash = '/ghibli'" class="sidebar-btn ${activePage === "ghibli" ? "bg-zinc-800" : ""} cursor-pointer">
          Ghibli
        </button>
      </nav>
      
      <div class="sidebar__actions mt-auto pt-4">
        ${loggedIn && !isGuest() ? `<button onclick="window.location.hash = '/create'" class="sidebar__add-btn w-full px-4 py-2 bg-white text-black font-semibold hover:bg-zinc-200 cursor-pointer">+ Adicionar</button>` : ""}
      </div>
      
      <div class="sidebar__footer mt-4 pt-4 border-t border-zinc-800">
        ${
          loggedIn
            ? `<button onclick="handleLogout()" class="w-full px-4 py-2 border border-zinc-700 text-zinc-400 hover:border-white hover:text-white cursor-pointer">Sair</button>`
            : `<button onclick="window.location.hash = '/login'" class="w-full px-4 py-2 border border-zinc-700 text-zinc-400 hover:border-white hover:text-white cursor-pointer">Login</button>`
        }
      </div>
    </aside>
  `;
}

// Toggle sidebar: desliza conteúdo e exibe/esconde painel lateral
export function initToggleSidebar() {
  document.addEventListener("click", (e) => {
    const toggleBtn = document.getElementById("btn-toggle-sidebar");
    if (!toggleBtn) return;

    // Ignora cliques fora do botão toggle
    if (!e.target.closest("#btn-toggle-sidebar")) return;

    const mainContent = document.querySelector(".main-content");
    const sidebar = document.querySelector(".sidebar");

    if (mainContent && sidebar) {
      mainContent.classList.toggle("main-moved");
      sidebar.classList.toggle("visible");
    }
  });
}
