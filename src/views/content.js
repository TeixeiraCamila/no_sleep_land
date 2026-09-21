// View base (layout padrão): estrutura comum com sidebar + header + container de conteúdo
// Todas as outras views usam render_main() para obter o layout compartilhado
import { render_sidebar } from "../components/sidebar.js";

// Estrutura padrão: sidebar + header + container de conteúdo
// Função layout: monta estrutura padrão (sidebar + header + container) para todas as páginas
// page define aba ativa na sidebar; id é o ID do container onde views injetam conteúdo
function render_main(logged_in, page, id) {
  return `
    <div class="content-container relative">
      ${render_sidebar(logged_in, page)}
      <main class="main-content p-8">
        <button id="btn-toggle-sidebar" class="btn-toggle p-2 bg-zinc-800 text-zinc-400 hover:bg-zinc-600">
          ☰ 
        </button>
        <div id="loading" class="text-center py-8 text-zinc-400">Carregando...</div>
        <div id="${id}" class="content-main"></div>
      </main>
    </div>
    `;
}

export { render_main };
