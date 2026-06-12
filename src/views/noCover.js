// View noCover: template HTML que filtra e exibe itens sem imagem de capa
// Filtro local: items.filter(!coverUrl) → renderiza cards no mesmo estilo da list view
import { escapeHtml, renderCoverImage } from "../utils/html.js";
import { renderMain } from "./content.js";

// Template da página de itens sem capa
export function renderNoCover(loggedIn) {
  return `
      ${renderMain(loggedIn, "noCover", "noCover-container")}
  `;
}

// Filtra itens sem coverUrl e renderiza cards
export function renderNoCoverItems(items) {
  // Filtra apenas itens que não possuem URL de capa
  const noCover = items.filter((item) => !item.coverUrl);

  // Mapeia cada item sem capa para um card na grid
  const content = noCover
    .map((item) => {
      const coverHtml = renderCoverImage(item.coverUrl);

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
