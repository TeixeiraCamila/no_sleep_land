// View da página Status (Kanban por status)
// Feature: filtro por Type no topo, mantendo todas as colunas de Status visíveis
import { render_kanban, render_kanban_items } from "../components/kanban.js";
import { escape_html } from "../utils/html.js";

export function render_status(
  logged_in,
  type_options = [],
  active_filter = null,
) {
  // Barra de filtros por Type (seguindo mesmo padrão da listagem)
  // Renderizada no SHELL, fora de #status-container (não é sobrescrita ao re-renderizar)
  const filters_html = `
    <div class="type-filters flex flex-wrap gap-2 mb-6">
      <button type="button" data-type="" 
        class="px-3 py-1 border border-zinc-700 rounded-sm text-sm transition-colors hover:border-white cursor-pointer
               ${active_filter === null ? "bg-white text-black hover:bg-zinc-200" : "text-zinc-300 bg-zinc-900"}">
        Todos
      </button>
      ${type_options
        .map(
          (t) => `
        <button type="button" data-type="${escape_html(t)}"
          class="px-3 py-1 border border-zinc-700 rounded-sm text-sm transition-colors hover:border-white cursor-pointer
                 ${active_filter === t ? "bg-white text-black hover:bg-zinc-200" : "text-zinc-300 bg-zinc-900"}">
          ${escape_html(t)}
        </button>
      `,
        )
        .join("")}
    </div>
  `;

  const main_html = render_kanban(logged_in, "status");

  // Insere filtros ANTES de #status-container
  // Assim, ao atualizar innerHTML de #status-container, os filtros não são sobrescritos
  return main_html.replace(
    '<div id="status-container" class="content-main"></div>',
    `${filters_html}<div id="status-container" class="content-main"></div>`,
  );
}

export function render_status_items(items, status_options) {
  // Renderiza Kanban com itens já filtrados (por Type) e todas as colunas de Status
  return render_kanban_items(items, status_options, { show_rating: true });
}
