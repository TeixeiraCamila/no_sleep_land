// Card reutilizável de item para grid de listagem
// Dependências: html.js (escape, capa), date.js (formatação), episodes.js
import { escape_html, render_cover_image } from "../utils/html.js";
import { format_date } from "../utils/date.js";

export function render_item_card(item, { show_status = true, show_date = true, show_type = true, on_click } = {}) {
  const date_display = show_date && item?.date?.start
    ? `<p class="text-sm"><span class="text-zinc-500">Início:</span> ${format_date(item.date.start)}</p>`
    : "";

  const cover_html = render_cover_image(item.coverUrl);

  const click_handler = on_click
    ? `onclick="${on_click}"`
    : `onclick="window.location.hash = '/detail/${item.id}'"`;

  return `
    <div class="list_item min-w-82 max-w-100 flex-1 flex flex-col justify-start gap-8 p-4 border border-zinc-800 hover:border-zinc-600 cursor-pointer transition-all" ${click_handler}>
      ${cover_html}
      <div class="list_item__info flex-1 flex flex-col justify-between">
        <div class="list_item__header flex justify-between items-start mb-2 gap-1.5">
          
          ${show_status && item.status ? `<span class="list_item__status text-xs px-2 py-1 border border-zinc-700 whitespace-nowrap">${escape_html(item.status)}</span>` : ""}
        </div>
      </div>
    </div>
  `;
}