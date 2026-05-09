


import { escapeHtml } from "../utils/html.js";
import { renderMain } from "./main.js";
export function renderList(loggedIn) {
  return `
     ${renderMain(loggedIn, "list",'list-container' )}
  `;
}


export function renderListItems(items) {
  if (items.length === 0) {
    return '<div class="list__empty col-span-full text-center py-8 text-zinc-500">Nenhum entretenimento encontrado.</div>'
  }

  const content = items
    .map((item) => {
      const episodesDisplay =
        (item.episodesSeen !== null && item.episodesSeen !== undefined) ||
        (item.episodes !== null && item.episodes !== undefined)
          ? `<p class="list_item__episodes text-sm"><span class="list_item__label text-zinc-500">Ep:</span> ${item.episodesSeen ?? '-'}/${item.episodes ?? '-'}</p>`
          : ''

      const coverHtml = item.coverUrl
        ? `<div class="list_item__cover w-fit my-0"><img src="${escapeHtml(item.coverUrl)}" alt="Cover" class="w-full max-w-40 h-40 object-contain" onerror="this.style.display='none'" /></div>`
        : ''

      return `
    <div 
      class="list_item flex justify-start gap-8 p-4 border border-zinc-800 hover:border-zinc-600 cursor-pointer transition-all" onclick="window.location.hash = '/detail/${item.id}'">
      ${coverHtml}
      <div class="list_item__info flex-1 flex flex-col justify-between">
        <div class="list_item__header flex justify-between items-start mb-2 gap-1.5">
          <h3 class="list_item__title text-lg font-semibold">${escapeHtml(item.name)}</h3>
          ${item.status ? `<span class="list_item__status text-xs px-2 py-1 border border-zinc-700 whitespace-nowrap">${escapeHtml(item.status)}</span>` : ''}
        </div>
        <div class="list_item__details text-sm text-zinc-400">
          ${item.type?.length ? `<p><span class="list_item__label text-zinc-500">Tipo:</span> ${escapeHtml(item.type)}</p>` : ''}
          ${item.rating ? `<p><span class="list_item__label text-zinc-500">Rating:</span> ${escapeHtml(item.rating)}</p>` : ''}
          ${episodesDisplay}
        </div>
      </div>
    </div>
  `
    })
    .join('')

  return  `<div class="list__grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"> ${content} </div>`
}
