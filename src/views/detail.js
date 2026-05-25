import { renderMain } from "./content.js";
import { escapeHtml } from "../utils/html.js";
import { formatDate } from "../utils/date.js";
import { renderEpisodes } from "../utils/episodes.js";

export function renderDetail(loggedIn) {
  return `
    ${renderMain(loggedIn, "detail", "detail-container")}
  `;
}

export function renderDetailContent(item, loggedIn, isGuest) {
  const actionButtons =
    loggedIn && !isGuest
      ? `<div class="flex gap-2 justify-end mt-8">
        <button onclick="window.location.hash = '/edit/${item?.id}'" class="cursor-pointer px-4 py-2 border border-zinc-700 hover:border-white transition-all">Editar</button>
        <button id="delete-btn" class="cursor-pointer px-4 py-2 border border-zinc-700 hover:border-white transition-all">Deletar</button>
      </div>`
      : isGuest
        ? '<p class="text-sm text-zinc-500 mt-4">Convidado: apenas visualização</p>'
        : '<p class="text-sm text-zinc-500 mt-4">Faça login para editar ou deletar</p>';

  const episodesDisplay = `${item.episodes || item.episodesSeen ? `<div class="py-2 border-b border-zinc-800">${renderEpisodes(item.episodesSeen, item.episodes)}</div>` : ""}`;
  const dateStart = item?.date?.start ? formatDate(item.date.start) : "";
  const dateEnd = item?.date?.end ? formatDate(item.date.end) : "";
  const dateDisplay =
    dateStart || dateEnd
      ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Data:</span> ${dateStart}${dateEnd ? ` - ${dateEnd}` : ""}</div>`
      : "";

  return `
    <div class="max-w-2xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">${item ? escapeHtml(item.name) : ""}</h1>
        <button onclick="window.location.hash = '/'" class="cursor-pointer px-4 py-2 border border-zinc-700 hover:border-white transition-all">Voltar</button>
      </div>

      <div class="border border-zinc-800 p-6">
        ${
          item
            ? `
          ${item.status ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Status:</span> ${escapeHtml(item.status)}</div>` : ""}

          ${dateDisplay}

          ${item.rating ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Rating:</span> ${escapeHtml(item.rating)}</div>` : ""}

          ${item.type?.length ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Tipo:</span> ${escapeHtml(item.type)}</div>` : ""}

          ${episodesDisplay}

          ${item.nacionalidade ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Nacionalidade:</span> ${escapeHtml(item.nacionalidade)}</div>` : ""}
          ${item.studios?.length ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Plataformas:</span> ${item.studios.join(", ")}</div>` : ""}
          ${item.tags?.length ? `<div class="py-2"><span class="text-zinc-500">Gêneros:</span> ${item.tags.join(", ")}</div>` : ""}
        `
            : ""
        }
      </div>

      ${item ? actionButtons : ""}
    </div>
  `;
}
