// View Watch Next: grid de cards com status "Plan to watch" (filtro server-side)
// Dependências: html.js (escape, capa), content.js (layout base)
import { escapeHtml, renderCoverImage } from "../utils/html.js";
import { renderMain } from "./content.js";

// Template da página Watch Next (usa layout padrão)
export function renderWatchNext(loggedIn) {
  return `
    ${renderMain(loggedIn, "watch-next", "watch-next-container")}
  `;
}

// Renderiza itens com suporte a paginação (itens já vêm filtrados da API)
export function renderWatchNextItems(items, pagination) {
  const content = items
    .map(
      (item) => `
    <div class="min-w-72 flex-1 flex flex-col justify-start gap-8 p-4 border border-zinc-800 hover:border-zinc-600 cursor-pointer transition-all" onclick="window.location.hash = '/edit/${item.id}'">
      <div>${renderCoverImage(item.coverUrl)}</div>
      <h3 class="font-semibold text-lg mb-2">${escapeHtml(item.name)}</h3> 
    </div>
  `,
    )
    .join("");

  // Botão "Carregar mais" específico para Watch Next
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
