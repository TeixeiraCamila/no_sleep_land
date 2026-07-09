// View Watch Next: grid de cards com status "Plan to watch" (filtro server-side)
// Dependências: itemCard.js para cards, content.js para layout base
import { renderMain } from "./content.js";
import { renderItemCard } from "../components/itemCard.js";

export function renderWatchNext(loggedIn) {
  return renderMain(loggedIn, "watch-next", "watch-next-container");
}

export function renderWatchNextItems(items, pagination) {
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

  return `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${content}</div>${loadMoreHtml}`;
}