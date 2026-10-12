// View Ghibli: delega o template da página ao componente Kanban (sem exibição de rating)
import { render_kanban, render_kanban_items } from "../components/kanban.js";

export function render_ghibli(logged_in) {
  return render_kanban(logged_in, [], [], { page: "ghibli", show_rating: false });
}

export function render_ghibli_items(items, status_options) {
  return render_kanban_items(items, status_options, { show_rating: false });
}