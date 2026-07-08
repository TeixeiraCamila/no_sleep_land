// View Ghibli: template HTML que filtra por tag "Ghibli" e renderiza colunas Kanban
// Mesmo padrão da view status.js: agrupa itens por status em colunas com scroll
import { escapeHtml } from "../utils/html.js";
import { renderMain } from "./content.js";
import { renderEpisodes } from "../utils/episodes.js";

export function renderGhibli(loggedIn) {
  return `
    ${renderMain(loggedIn, "ghibli", "ghibli-container")}
  `;
}

// Filtra itens pela tag "Ghibli" e os agrupa por status em colunas
export function renderGhibliItems(items, statusOptions) {
  // Filtra apenas itens que possuem a tag "Ghibli"
  const ghibliItems = items.filter(
    (item) => item.tags && item.tags.includes("Ghibli")
  );

  // Extrai status únicos dos itens Ghibli para criar colunas
  let uniqueStatuses = new Set();
  ghibliItems.forEach((item) => {
    if (item.status) uniqueStatuses.add(item.status);
  });

  if (uniqueStatuses.size > 0 && uniqueStatuses.length === 0) {
    uniqueStatuses = Array.from(uniqueStatuses);
  }

  // Inicializa grupos vazios e distribui itens por status
  const statusGroups = {};
  uniqueStatuses.forEach((status) => {
    statusGroups[status] = [];
  });

  // Aloca cada item Ghibli ao grupo de seu status
  ghibliItems.forEach((item) => {
    const status = item.status || uniqueStatuses[0];
    if (status && statusGroups[status]) {
      statusGroups[status].push(item);
    } else if (uniqueStatuses[0]) {
      statusGroups[uniqueStatuses[0]].push(item);
    }
  });

  // Mapeia cada grupo de status para uma coluna Kanban
  const content = Object.entries(statusGroups)
    .map(
      ([status, statusItems]) => `
    <div class="min-w-70 w-md bg-zinc-900 rounded-lg flex flex-col">
      <div class="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h3 class="font-semibold">${status}</h3>
        <span class="text-xs bg-zinc-800 px-2 py-1 rounded-full text-zinc-400">${statusItems.length}</span>
      </div>
      <div class="p-3 flex flex-col gap-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        ${statusItems.length > 0 ? statusItems.map(renderGhibliCard).join("") : '<p class="text-zinc-600 text-sm text-center">-</p>'}
      </div>
    </div>
  `,
    )
    .join("");

  if (content === "") {
    return '<div class="text-center py-8 text-zinc-500">Nenhum item Ghibli encontrado.</div>';
  }

  return `<div class="flex gap-4 overflow-x-auto">${content}</div>`;
}

// Card individual na coluna Ghibli com capa, nome e metadados
function renderGhibliCard(item) {
  // Exibe episódios se o item tiver esse campo
  const episodesDisplay = `${(item.episodesSeen !== null && item.episodesSeen !== undefined) || (item.episodes !== null && item.episodes !== undefined) ? `<p class="text-xs text-zinc-500"><span class="text-zinc-400">Ep:</span> ${item.episodesSeen ?? "-"}/${item.episodes ?? "-"}</p>` : ""}`;

  // Renderiza capa com fallback silencioso em caso de erro
  const coverHtml = item.coverUrl
    ? `<img src="${escapeHtml(item.coverUrl)}" alt="Cover" class="w-full max-w-40 my-0 mx-auto h-40 object-contain mb-2" onerror="this.style.display='none'" />`
    : "";

  return `
    <div class="bg-zinc-800 p-3 rounded cursor-pointer hover:bg-zinc-700 transition-all" onclick="window.location.hash = '/detail/${item.id}'">
      ${coverHtml}
      <h4 class="text-sm font-medium break-all">${escapeHtml(item.name)}</h4>
      <div class="text-zinc-400">
        ${item.type?.length ? `<p class="text-xs">${escapeHtml(item.type)}</p>` : ""}
        ${episodesDisplay}
      </div>
    </div>
  `;
}
