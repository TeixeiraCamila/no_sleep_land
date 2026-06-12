// Template da página Watch Next: lista itens com status "Plan to watch"
import { escapeHtml, renderCoverImage } from "../utils/html.js";
import { renderMain } from "./content.js";

// Template da página Watch Next (usa layout padrão)
export function renderWatchNext(loggedIn) {
  return `
    ${renderMain(loggedIn, "watch-next", "watch-next-container")}
  `;
}

export function renderWatchNextItems(items) {
  // Filtra apenas itens com status "Plan to watch"
  const nextItems = items.filter((item) => item.status === "Plan to watch");

  // Mapeia itens filtrados para cards clicáveis com capa e nome
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${nextItems
        .map(
          (item) => `
        <div class="min-w-72 flex-1 flex flex-col justify-start gap-8 p-4 border border-zinc-800 hover:border-zinc-600 cursor-pointer transition-all" onclick="window.location.hash = '/edit/${item.id}'">
          <div>${ renderCoverImage(item.coverUrl)}</div>
          <h3 class="font-semibold text-lg mb-2">${escapeHtml(item.name)}</h3> 
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}
