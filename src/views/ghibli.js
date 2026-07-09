import { renderKanban, renderKanbanItems } from "../components/kanban.js";

export function renderGhibli(loggedIn) {
  return renderKanban(loggedIn, [], [], { page: "ghibli", showRating: false });
}

export function renderGhibliItems(items, statusOptions) {
  return renderKanbanItems(items, statusOptions, { showRating: false });
}