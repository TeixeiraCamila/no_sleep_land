import { escapeHtml } from "../utils/html";
import { renderMain } from "./content.js";

export function renderNoCover(loggedIn) {
  return `
      ${renderMain(loggedIn, "noCover", "noCover-container")}
  `;
}

export function noCoverItems(items) {
  const noCover = items.filter((item) => !item.coverUrl);

  const content = noCover
    .map((item) => {
      const coverHtml = item.coverUrl
        ? `<div class="list_item__cover w-fit my-0 max-h-50 ">
          <img src="${escapeHtml(item.coverUrl)}" alt="Cover" class="w-full h-50  object-contain" onerror="this.style.display='none'" />
        </div>`
        : "";

      return `
          <div class="list_item min-w-72 flex-1 flex flex-col justify-start gap-8 p-4 border border-zinc-800 hover:border-zinc-600 cursor-pointer transition-all" onclick="window.location.hash = '/detail/${item.id}'">
            ${coverHtml}
              <div  class="list_item__info flex-1 flex flex-col justify-between">
              <div class="list_item__header flex justify-between items-start mb-2 gap-1.5">
                <h3 class="list_item__title text-lg font-semibold">${escapeHtml(item.name)}</h3>
              </div>
            </div>
          </div>
        `;
    })
    .join("");

  return `<div class="noCover__grid flex flex-wrap gap-8"> ${content} </div>`;
}
