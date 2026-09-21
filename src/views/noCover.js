// View noCover: filtra e exibe itens sem imagem de capa
// Dependências: itemCard.js para cards, content.js para layout base
import { render_main } from "./content.js";
import { render_item_card } from "../components/itemCard.js";

export function render_no_cover(logged_in) {
  return render_main(logged_in, "noCover", "noCover-container");
}

export function render_no_cover_items(items) {
  const noCover = items.filter((item) => !item.coverUrl);
  const content = noCover.map((item) => render_item_card(item)).join("");
  return `<div class="noCover__grid flex flex-wrap gap-8">${content}</div>`;
}