// View de listagem: grid de cards com botão "Carregar mais"
// Dependências: itemCard.js para cards, content.js para layout base
import { render_main } from "./content.js";
import { render_item_card } from "../components/itemCard.js";
import { escape_html } from "../utils/html.js";

export function render_list(
  logged_in,
  search_term = "",
  status_options = [],
  active_filter = null,
) {
  const filters_html = `
    <div class="status-filters flex flex-wrap gap-2 mb-6">
      <button type="button" data-status="" 
        class="px-3 py-1 border border-zinc-700 rounded-sm text-sm transition-colors hover:border-white cursor-pointer
              ${active_filter === null ? "bg-white text-black hover:bg-zinc-200" : "text-zinc-300 bg-zinc-900"}">
        Todos
      </button>
      ${status_options
        .map(
          (s) => `
        <button type="button" data-status="${escape_html(s)}"
          class="px-3 py-1 border border-zinc-700 rounded-sm text-sm transition-colors hover:border-white cursor-pointer
                ${active_filter === s ? "bg-white text-black hover:bg-zinc-200" : "text-zinc-300 bg-zinc-900"}">
          ${escape_html(s)}
        </button>
      `,
        )
        .join("")}
    </div>
  `;

  const main_html = render_main(logged_in, "list", "list-container");

  // Inserir filtros antes de #list-container
  return main_html.replace(
    '<div id="list-container" class="content-main"></div>',
    `${filters_html}
    <div id="list-container" class="content-main"></div>`,
  );
}

export function render_list_items(items, pagination) {
  if (items.length === 0) {
    return '<div class="list__empty col-span-full text-center py-8 text-zinc-500">Nenhum entretenimento encontrado.</div>';
  }

  const content = items.map((item) => render_item_card(item)).join("");

  const load_more_html = pagination?.hasMore
    ? `<div class="w-full flex justify-center mt-8">
        <button id="load-more"
          class="px-6 py-3 bg-zinc-800 text-zinc-300 border border-zinc-700
              hover:bg-zinc-700 hover:text-white cursor-pointer transition-all
                disabled:opacity-50 disabled:cursor-not-allowed"
          onclick="load_more()">
          Carregar mais
        </button>
      </div>`
    : "";

  return `<div class="list__grid flex flex-wrap gap-8">${content}</div>${load_more_html}`;
}
