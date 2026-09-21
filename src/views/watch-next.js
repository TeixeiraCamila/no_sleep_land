// View Watch Next: grid de cards com status "Plan to watch" (filtro server-side) + modal de sorteio
// Dependências: itemCard.js para cards, content.js para layout base, html/date/episodes para detalhes
import { render_main } from "./content.js";
import { render_item_card } from "../components/itemCard.js";
import { escape_html } from "../utils/html.js";
import { format_date } from "../utils/date.js";
import { render_episodes } from "../utils/episodes.js";

// View: layout base da página com modal de sorteio oculto
export function render_watch_next(logged_in) {
  const base = render_main(logged_in, "watch-next", "watch-next-container");
  return base + `
    <div id="random-modal" class="modal-overlay hidden">
      <div class="modal-content border border-zinc-700">
        <div class="flex justify-between items-center mb-4">
          <button onclick="close_random_modal()"
            class="text-zinc-400 hover:text-white text-2xl leading-none cursor-pointer">&times;</button>
        </div>
        <div id="random-modal-body"></div>
      </div>
    </div>
  `;
}

// View: grid de itens com botão "Carregar mais" e botão de sorteio no topo
export function render_watch_next_items(items, pagination) {
  const random_btn = items.length > 0
    ? `<div class="w-full flex justify-center mb-6">
        <button onclick="random_from_watch_next()"
          class="px-6 py-3 bg-zinc-800 text-zinc-300 border border-zinc-700
                 hover:bg-zinc-700 hover:text-white cursor-pointer transition-all">
        Decida por mim! 🎲
        </button>
       </div>`
    : "";

  const content = items.map((item) => render_item_card(item)).join("");

  const load_more_html = pagination?.hasMore
    ? `<div class="w-full flex justify-center mt-8">
        <button id="load-more-watch-next"
          class="px-6 py-3 bg-zinc-800 text-zinc-300 border border-zinc-700
                 hover:bg-zinc-700 hover:text-white cursor-pointer transition-all"
          onclick="load_more_watch_next()">
          Carregar mais
        </button>
      </div>`
    : "";

  return `${random_btn}<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${content}</div>${load_more_html}`;
}

// View: detalhes do item sorteado para exibir dentro do modal
export function render_random_item(item) {
  const date_start = item?.date?.start ? format_date(item.date.start) : "";
  const date_end = item?.date?.end ? format_date(item.date.end) : "";
  const date_display = date_start || date_end
    ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Data:</span> ${date_start}${date_end ? ` - ${date_end}` : ""}</div>`
    : "";
  const episodes_display = item.episodes || item.episodesSeen
    ? `<div class="py-2 border-b border-zinc-800">${render_episodes(item.episodesSeen, item.episodes)}</div>`
    : "";

  return `
    <div class="flex flex-col gap-4" onclick="window.location.hash = '/detail/${item.id}'">
      ${item.coverUrl
      ? `<div class="w-full max-h-64 overflow-hidden rounded flex justify-center cursor-pointer" >
            <img src="${escape_html(item.coverUrl)}" alt="Cover" class="h-64 object-contain" />
          </div>`
      : ""}
      <h3 class="text-2xl font-bold text-center">${escape_html(item.name)}</h3>
      
    </div>
  `;
}