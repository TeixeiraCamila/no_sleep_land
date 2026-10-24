// View da página Rating: shell com container próprio e Kanban agrupado por nota
import { render_kanban, render_kanban_items } from "../components/kanban.js";

// page="rating" deriva o id do container e acende o item na sidebar
export function render_rating(logged_in) {
  return render_kanban(logged_in, "rating");
}

export function render_rating_items(items, rating_options) {
  return render_kanban_items(items, rating_options, { group_field: "rating" });
}
