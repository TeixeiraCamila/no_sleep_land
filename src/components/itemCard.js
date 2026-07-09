// Card reutilizável de item para grid de listagem
// Dependências: html.js (escape, capa), date.js (formatação), episodes.js
import { escapeHtml, renderCoverImage } from "../utils/html.js";

export function renderItemCard(item, { showStatus = true, showDate = true, showType = true, onClick } = {}) {

  const coverHtml = renderCoverImage(item.coverUrl);

  const clickHandler = onClick
    ? `onclick="${onClick}"`
    : `onclick="window.location.hash = '/detail/${item.id}'"`;

  return `
    <div class="list_item min-w-72 flex-1 flex flex-col justify-start gap-8 p-4 border border-zinc-800 hover:border-zinc-600 cursor-pointer transition-all" ${clickHandler}>
      ${coverHtml}
      
    </div>
  `;
}
