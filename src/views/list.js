// View de listagem: template HTML da página de grid de cards
// Dependências: html.js (escape, capa), content.js (layout base), date.js (formatação)
import { escapeHtml, renderCoverImage } from "../utils/html.js";
import { renderMain } from "./content.js";
import { formatDate } from "../utils/date.js";

// Template da página de listagem (usa layout padrão com content.js)
export function renderList(loggedIn) {
  return `
    ${renderMain(loggedIn, "list", "list-container")}
  `;
}

// Renderiza os cards da lista (cada item vira um card clicável)
// Mapeia array de itens para HTML; se vazio, exibe mensagem "Nenhum encontrado"
export function renderListItems(items) {
  if (items.length === 0) {
    return '<div class="list__empty col-span-full text-center py-8 text-zinc-500">Nenhum entretenimento encontrado.</div>';
  }

  // Mapeia cada item para um card clicável com capa, nome e status
  const content = items
    .map((item) => {

      // Exibe data de início se disponível
      const dateDisplay = item?.date?.start
        ? `<p class="text-sm"><span class="text-zinc-500">Início:</span> ${formatDate(item.date.start)}</p>`
        : "";

      const coverHtml = renderCoverImage(item.coverUrl);

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
