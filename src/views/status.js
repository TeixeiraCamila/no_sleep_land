import { renderKanban, renderKanbanItems } from "../components/kanban.js";

export function renderStatus(loggedIn) {
  return renderKanban(loggedIn, [], [], { page: "status", showRating: true });
}

export function renderStatusItems(items, statusOptions) {
  return renderKanbanItems(items, statusOptions, { showRating: true });
}