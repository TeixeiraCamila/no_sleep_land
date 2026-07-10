// Card reutilizável de item para grid de listagem
// Dependências: html.js (escape, capa), date.js (formatação), episodes.js
import { escapeHtml, renderCoverImage } from "../utils/html.js";
import { formatDate } from "../utils/date.js";

export function renderItemCard(item, { showStatus = true, showDate = true, showType = true, onClick } = {}) {
  const dateDisplay = showDate && item?.date?.start
    ? `<p class="text-sm"><span class="text-zinc-500">Início:</span> ${formatDate(item.date.start)}</p>`
    : "";

  const coverHtml = renderCoverImage(item.coverUrl);

  const clickHandler = onClick
    ? `onclick="${onClick}"`
    : `onclick="window.location.hash = '/detail/${item.id}'"`;

  return `
    <div class="list_item min-w-72 flex-1 flex flex-col justify-start gap-8 p-4 border border-zinc-800 hover:border-zinc-600 cursor-pointer transition-all" ${clickHandler}>
      ${coverHtml}
      <div class="list_item__info flex-1 flex flex-col justify-between">
        <div class="list_item__header flex justify-between items-start mb-2 gap-1.5">
          <h3 class="list_item__title text-lg font-semibold">${escapeHtml(item.name)}</h3>
          ${showStatus && item.status ? `<span class="list_item__status text-xs px-2 py-1 border border-zinc-700 whitespace-nowrap">${escapeHtml(item.status)}</span>` : ""}
        </div>
        ${dateDisplay}
      </div>
    </div>
  `;
}