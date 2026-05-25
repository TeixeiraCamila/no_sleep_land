import { escapeHtml } from "../utils/html.js";
import { renderMain } from "./content.js";
import { formatDate } from "../utils/date.js";

// Template da página de listagem (usa layout padrão com content.js)
export function renderList(loggedIn) {
  return `
    ${renderMain(loggedIn, "list", "list-container")}
  `;
}

// Renderiza os cards da lista (cada item vira um card clicável)
export function renderListItems(items) {
  if (items.length === 0) {
    return '<div class="list__empty col-span-full text-center py-8 text-zinc-500">Nenhum entretenimento encontrado.</div>';
  }

  const content = items
    .map((item) => {

      const dateDisplay = item?.date?.start
        ? `<p class="text-sm"><span class="text-zinc-500">Início:</span> ${formatDate(item.date.start)}</p>`
        : "";

      const coverHtml = item.coverUrl
        ? `<div class="list_item__cover w-fit my-0 max-h-50 ">
          <img src="${escapeHtml(item.coverUrl)}" alt="Cover" class="w-full h-50  object-contain" onerror="this.style.display='none'" />
        </div>`
        : "";

      return `
    <div 
      class="list_item min-w-72 flex-1 flex flex-col justify-start gap-8 p-4 border border-zinc-800 hover:border-zinc-600 cursor-pointer transition-all" onclick="window.location.hash = '/detail/${item.id}'">
      ${coverHtml}
      <div class="list_item__info flex-1 flex flex-col justify-between">
        <div class="list_item__header flex justify-between items-start mb-2 gap-1.5">
          <h3 class="list_item__title text-lg font-semibold">${escapeHtml(item.name)}</h3>
          ${item.status ? `<span class="list_item__status text-xs px-2 py-1 border border-zinc-700 whitespace-nowrap">${escapeHtml(item.status)}</span>` : ""}
        </div>
      </div>
    </div>
  `;
    })
    .join("");

  return `<div class="list__grid flex flex-wrap gap-8"> ${content} </div>`;
}
