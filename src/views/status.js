// Template da página Kanban: agrupa itens por status em colunas
import { escapeHtml } from "../utils/html.js";
import { renderMain } from "./content.js";
import { renderEpisodes } from "../utils/episodes.js";

// Template da página Kanban (usa layout padrão)
export function renderStatus(loggedIn) {
  return `
    ${renderMain(loggedIn, "status", "status-container")}
  `;
}

// Agrupa itens por status em colunas e renderiza o quadro Kanban completo
export function renderStatusItems(items, statusOptions) {
  // Extrai status únicos dos itens para criar colunas
  const uniqueStatuses = new Set();
  items.forEach((item) => {
    if (item.status) uniqueStatuses.add(item.status);
  });

  let statuses =
    statusOptions && statusOptions.length > 0
      ? statusOptions
      : Array.from(uniqueStatuses);

  if (uniqueStatuses.size > 0 && statuses.length === 0) {
    statuses = Array.from(uniqueStatuses);
  }

  // Inicializa grupos vazios para cada status
  const statusGroups = {};
  statuses.forEach((status) => {
    statusGroups[status] = [];
  });

  // Distribui itens nos grupos pelo status (ou "Uncategorized" se sem status)
  const unclassified = [];

  items.forEach((item) => {
    const status = item.status || statuses[0];
    if (status && statusGroups[status]) {
      statusGroups[status].push(item);
    } else if (statuses[0]) {
      statusGroups[statuses[0]].push(item);
    } else {
      unclassified.push(item);
    }
  });

  // Move itens não classificados para grupo "Uncategorized"
  if (unclassified.length > 0) {
    unclassified.forEach((item) => statusGroups["Uncategorized"].push(item));
    if (!statusGroups["Uncategorized"]) {
      statuses.push("Uncategorized");
      statusGroups["Uncategorized"] = unclassified;
    }
  }

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
        ${statusItems.length > 0 ? statusItems.map((item) => renderStatusCard(item)).join("") : '<p class="text-zinc-600 text-sm text-center">-</p>'}
      </div>
    </div>
  `,
    )
    .join("");

  return `<div class="flex gap-4 overflow-x-auto">${content}</div>`;
}

// Card individual dentro de uma coluna Kanban com capa, nome e metadados
function renderStatusCard(item) {
  // Exibe episódios se o item tiver esse campo
  const episodesDisplay = `${(item.episodesSeen !== null && item.episodesSeen !== undefined) || (item.episodes !== null && item.episodes !== undefined) ? `<p class="text-xs text-zinc-500"><span class="text-zinc-400">Ep:</span> ${item.episodesSeen ?? "-"}/${item.episodes ?? "-"}</p>` : ""}`;

  // Renderiza capa se URL existir, esconde em caso de erro de carregamento
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
          ${item.rating ? `<span class="text-xs px-1.5 py-0.5 border border-zinc-700">${escapeHtml(item.rating)}</span>` : ""}
        </div>
        ${episodesDisplay}
      </div>
    </div>
  `;
}
