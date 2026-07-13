// View Watch Next: grid de cards com status "Plan to watch" (filtro server-side) + modal de sorteio
// Dependências: itemCard.js para cards, content.js para layout base, html/date/episodes para detalhes
import { renderMain } from "./content.js";
import { renderItemCard } from "../components/itemCard.js";
import { escapeHtml } from "../utils/html.js";
import { formatDate } from "../utils/date.js";
import { renderEpisodes } from "../utils/episodes.js";

// View: layout base da página com modal de sorteio oculto
export function renderWatchNext(loggedIn) {
  const base = renderMain(loggedIn, "watch-next", "watch-next-container");
  return base + `
    <div id="random-modal" class="modal-overlay hidden">
      <div class="modal-content border border-zinc-700">
        <div class="flex justify-between items-center mb-4">
          <button onclick="closeRandomModal()"
            class="text-zinc-400 hover:text-white text-2xl leading-none cursor-pointer">&times;</button>
        </div>
        <div id="random-modal-body"></div>
      </div>
    </div>
  `;
}

// View: grid de itens com botão "Carregar mais" e botão de sorteio no topo
export function renderWatchNextItems(items, pagination) {
  const randomBtn = items.length > 0
    ? `<div class="w-full flex justify-center mb-6">
        <button onclick="randomFromWatchNext()"
          class="px-6 py-3 bg-zinc-800 text-zinc-300 border border-zinc-700
                 hover:bg-zinc-700 hover:text-white cursor-pointer transition-all">
        Decida por mim! 🎲
        </button>
       </div>`
    : "";

  const content = items.map((item) => renderItemCard(item)).join("");

  const loadMoreHtml = pagination?.hasMore
    ? `<div class="w-full flex justify-center mt-8">
        <button id="load-more-watch-next"
          class="px-6 py-3 bg-zinc-800 text-zinc-300 border border-zinc-700
                 hover:bg-zinc-700 hover:text-white cursor-pointer transition-all"
          onclick="loadMoreWatchNext()">
          Carregar mais
        </button>
      </div>`
    : "";

  return `${randomBtn}<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${content}</div>${loadMoreHtml}`;
}

// View: detalhes do item sorteado para exibir dentro do modal
export function renderRandomItem(item) {
  const dateStart = item?.date?.start ? formatDate(item.date.start) : "";
  const dateEnd = item?.date?.end ? formatDate(item.date.end) : "";
  const dateDisplay = dateStart || dateEnd
    ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Data:</span> ${dateStart}${dateEnd ? ` - ${dateEnd}` : ""}</div>`
    : "";
  const episodesDisplay = item.episodes || item.episodesSeen
    ? `<div class="py-2 border-b border-zinc-800">${renderEpisodes(item.episodesSeen, item.episodes)}</div>`
    : "";

  return `
    <div class="flex flex-col gap-4" onclick="window.location.hash = '/detail/${item.id}'">
      ${item.coverUrl
      ? `<div class="w-full max-h-64 overflow-hidden rounded flex justify-center cursor-pointer" >
            <img src="${escapeHtml(item.coverUrl)}" alt="Cover" class="h-64 object-contain" />
          </div>`
      : ""}
      <h3 class="text-2xl font-bold text-center">${escapeHtml(item.name)}</h3>
      
    </div>
  `;
}