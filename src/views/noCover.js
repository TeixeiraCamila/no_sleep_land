// View noCover: filtra e exibe itens sem imagem de capa
// Dependências: itemCard.js para cards, content.js para layout base
import { renderMain } from "./content.js";
import { renderItemCard } from "../components/itemCard.js";

export function renderNoCover(loggedIn) {
  return renderMain(loggedIn, "noCover", "noCover-container");
}

export function renderNoCoverItems(items) {
  const noCover = items.filter((item) => !item.coverUrl);
  const content = noCover.map((item) => renderItemCard(item)).join("");
  return `<div class="noCover__grid flex flex-wrap gap-8">${content}</div>`;
}