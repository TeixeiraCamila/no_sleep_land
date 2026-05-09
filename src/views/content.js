import { renderSidebar } from "./sidebar.js";

function renderMain(loggedIn, page, id) {
  return `
    <div class="content-container relative">
      ${renderSidebar(loggedIn, page)}
      <main class="main-content p-8">
        <button id="btn-toggle-sidebar" class="btn-toggle p-2 bg-zinc-800 text-zinc-400 hover:bg-zinc-600">
          ☰ 
        </button>
        <div id="loading" class="text-center py-8 text-zinc-400">Carregando...</div>
        <div id="${id}" ></div>
      </main>
    </div>
    `;
}

export { renderMain };
