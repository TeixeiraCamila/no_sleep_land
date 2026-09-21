import { render_kanban, render_kanban_items } from "../components/kanban.js";

export function render_status(logged_in) {
  return render_kanban(logged_in, [], [], { page: "status", show_rating: true });
}

export function render_status_items(items, status_options) {
  return render_kanban_items(items, status_options, { show_rating: true });
}