import { escapeHtml } from "../utils/html.js";
import { renderMain } from "../views/content.js";
import { renderEpisodes } from "../utils/episodes.js";

export function renderKanban(loggedIn, items, statusOptions, { page = "status", showRating = true } = {}) {
  return renderMain(loggedIn, page, `${page}-container`);
}

export function renderKanbanItems(items, statusOptions, { showRating = true } = {}) {
  const uniqueStatuses = new Set();
  items.forEach((item) => {
    if (item.status) uniqueStatuses.add(item.status);
  });

  const statusGroups = {};
  uniqueStatuses.forEach((status) => {
    statusGroups[status] = [];
  });

  items.forEach((item) => {
    const status = item.status || uniqueStatuses[0];
    if (status && statusGroups[status]) {
      statusGroups[status].push(item);
    } else if (uniqueStatuses[0]) {
      statusGroups[uniqueStatuses[0]].push(item);
    }
  });

  const content = Object.entries(statusGroups)
    .map(
      ([status, statusItems]) => `
    <div class="min-w-70 w-md bg-zinc-900 rounded-lg flex flex-col">
      <div class="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h3 class="font-semibold">${status}</h3>
        <span class="text-xs bg-zinc-800 px-2 py-1 rounded-full text-zinc-400">${statusItems.length}</span>
      </div>
      <div class="p-3 flex flex-col gap-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        ${statusItems.length > 0 ? statusItems.map((item) => renderKanbanCard(item, { showRating })).join("") : '<p class="text-zinc-600 text-sm text-center">-</p>'}
      </div>
    </div>
  `,
    )
    .join("");

  return `<div class="flex gap-4 overflow-x-auto">${content}</div>`;
}

export function renderKanbanCard(item, { showRating = true } = {}) {
  const episodesDisplay = ((item.episodesSeen != null) || (item.episodes != null))
    ? `<p class="text-xs text-zinc-500"><span class="text-zinc-400">Ep:</span> ${item.episodesSeen ?? "-"}/${item.episodes ?? "-"}</p>`
    : "";

  const coverHtml = item.coverUrl
    ? `<img src="${escapeHtml(item.coverUrl)}" alt="Cover" class="w-full max-w-40 my-0 mx-auto h-40 object-contain mb-2" onerror="this.style.display='none'" />`
    : "";

  return `
    <div class="bg-zinc-800 p-3 rounded cursor-pointer hover:bg-zinc-700 transition-all" onclick="window.location.hash = '/detail/${item.id}'">
      ${coverHtml}
      <h4 class="text-sm font-medium break-all">${escapeHtml(item.name)}</h4>
      <div class="text-zinc-400">
        <div class="flex justify-between items-center">
          ${item.type?.length ? `<p class="text-xs">${escapeHtml(item.type)}</p>` : ""}
          ${item.rating && showRating ? `<span class="text-xs px-1.5 py-0.5 border border-zinc-700">${escapeHtml(item.rating)}</span>` : ""}
        </div>
        ${episodesDisplay}
      </div>
    </div>
  `;
}