// View de listagem: grid de cards com botão "Carregar mais"
// Dependências: itemCard.js para cards, content.js para layout base
import { render_main } from "./content.js";
import { render_item_card } from "../components/itemCard.js";

export function render_list(logged_in) {
  return render_main(logged_in, "list", "list-container");
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