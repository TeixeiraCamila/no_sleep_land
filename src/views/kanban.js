import { renderSidebar } from './sidebar.js';
import { escapeHtml } from '../utils/html.js';

export function renderKanban(loggedIn) {
  return `
    <div class="status-container relative overflow-hidden">
      ${renderSidebar(loggedIn, 'status')}
      <main class="main-content p-8">
        <button id="btn-toggle-sidebar" class="btn-toggle p-2 bg-zinc-800 text-zinc-400 hover:bg-zinc-600">
          ☰
        </button>
        <div id="loading" class="text-center py-8 text-zinc-400">Carregando...</div>
        <div id="kanban-container" class="flex gap-4 overflow-x-auto"></div>
      </main>
    </div>
  `;
}

export function renderKanbanItems(items, statusOptions) {
  const uniqueStatuses = new Set();
  items.forEach(item => {
    if (item.status) uniqueStatuses.add(item.status);
  });

  let statuses = statusOptions && statusOptions.length > 0 ? statusOptions : Array.from(uniqueStatuses);
  
  if (uniqueStatuses.size > 0 && statuses.length === 0) {
    statuses = Array.from(uniqueStatuses);
  }

  const statusGroups = {};
  statuses.forEach(status => {
    statusGroups[status] = [];
  });

  const unclassified = [];

  items.forEach(item => {
    const status = item.status || statuses[0];
    if (status && statusGroups[status]) {
      statusGroups[status].push(item);
    } else if (statuses[0]) {
      statusGroups[statuses[0]].push(item);
    } else {
      unclassified.push(item);
    }
  });

  if (unclassified.length > 0) {
    unclassified.forEach(item => statusGroups['Uncategorized'].push(item));
    if (!statusGroups['Uncategorized']) {
      statuses.push('Uncategorized');
      statusGroups['Uncategorized'] = unclassified;
    }
  }

  return Object.entries(statusGroups).map(([status, statusItems]) => `
    <div class="min-w-70 max-w-70 bg-zinc-900 rounded-lg flex flex-col">
      <div class="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h3 class="font-semibold">${status}</h3>
        <span class="text-xs bg-zinc-800 px-2 py-1 rounded-full text-zinc-400">${statusItems.length}</span>
      </div>
      <div class="p-3 flex flex-col gap-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        ${statusItems.length > 0 ? statusItems.map(item => renderKanbanCard(item)).join('') : '<p class="text-zinc-600 text-sm text-center">-</p>'}
      </div>
    </div>
  `).join('');
}

function renderKanbanCard(item) {
  const episodesDisplay = (item.episodesSeen !== null && item.episodesSeen !== undefined) || (item.episodes !== null && item.episodes !== undefined)
    ? `<p class="text-sm text-zinc-400"><span class="text-zinc-500">Ep:</span> ${item.episodesSeen ?? '-'}/${item.episodes ?? '-'}</p>`
    : '';

  const coverHtml = item.coverUrl
    ? `<img src="${escapeHtml(item.coverUrl)}" alt="Cover" class="w-full max-w-40 my-0 mx-auto h-40 object-contain mb-2" onerror="this.style.display='none'" />`
    : '';

  return `
    <div class="bg-zinc-800 p-3 rounded cursor-pointer hover:bg-zinc-700 transition-all" onclick="window.location.hash = '#/detail/${item.id}'">
      ${coverHtml}
      <h4 class="text-sm font-medium break-all">${escapeHtml(item.name)}</h4>
      <div class="text-zinc-400">
        ${item.type?.length ? `<p class="text-xs">${item.type.join(', ')}</p>` : ''}
        ${episodesDisplay}
      </div>
    </div>
  `;
}