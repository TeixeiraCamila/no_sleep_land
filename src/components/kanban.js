import { escape_html } from "../utils/html.js";
import { render_main } from "../views/content.js";
import { render_episodes } from "../utils/episodes.js";

export function render_kanban(
  logged_in,
  items,
  status_options,
  { page = "status", show_rating = true } = {},
) {
  return render_main(logged_in, page, `${page}-container`);
}

export function render_kanban_items(
  items,
  status_options,
  { show_rating = true } = {},
) {
  const unique_statuses = new Set();
  items.forEach((item) => {
    if (item.status) unique_statuses.add(item.status);
  });

  const status_groups = {};
  unique_statuses.forEach((status) => {
    status_groups[status] = [];
  });

  items.forEach((item) => {
    const status = item.status || unique_statuses[0];
    if (status && status_groups[status]) {
      status_groups[status].push(item);
    } else if (unique_statuses[0]) {
      status_groups[unique_statuses[0]].push(item);
    }
  });

  console.log(status_groups);

  const sorted_status = {
    Done: "done",
    Watching: "watching",
    "Plan to watch": "plan_to_watch",
    "Dropped/Paused": "dropped_paused",
  };

  const content = Object.entries(status_groups)
    .map(
      ([status, status_items]) => `
    <div class="min-w-70 w-full bg-zinc-900 rounded-lg flex flex-col ${sorted_status[status] || "other"}">
      <div class="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h3 class="font-semibold">${status}</h3>
        <span class="text-xs bg-zinc-800 px-2 py-1 rounded-full  ${sorted_status[status] || "other"}-itens">${status_items.length}</span>
      </div>
      <div class="p-3 flex flex-col gap-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        ${status_items.length > 0 ? status_items.map((item) => render_kanban_card(item, { show_rating })).join("") : '<p class="text-zinc-600 text-sm text-center">-</p>'}
      </div>
    </div>
  `,
    )
    .join("");

  return `<div class="flex gap-4 overflow-x-auto">${content}</div>`;
}

export function render_kanban_card(item, { show_rating = true } = {}) {
  const episodes_display =
    item.episodesSeen != null || item.episodes != null
      ? `<p class="text-xs text-zinc-500"><span class="text-zinc-400">Ep:</span> ${item.episodesSeen ?? "-"}/${item.episodes ?? "-"}</p>`
      : "";

  const cover_html = item.coverUrl
    ? `<img src="${escape_html(item.coverUrl)}" alt="Cover" class="w-full max-w-40 my-0 mx-auto h-40 object-contain mb-2" onerror="this.style.display='none'" />`
    : "";

  return `
    <div class="bg-zinc-800 p-3 rounded cursor-pointer hover:bg-zinc-700 transition-all" onclick="window.location.hash = '/detail/${item.id}'">
      ${cover_html}
      <h4 class="text-sm font-medium break-all">${escape_html(item.name)}</h4>
      <div class="text-zinc-400">
        <div class="flex justify-between items-center">
          ${item.type?.length ? `<p class="text-xs">${escape_html(item.type)}</p>` : ""}
          ${item.rating && show_rating ? `<span class="text-xs px-1.5 py-0.5 border border-zinc-700">${escape_html(item.rating)}</span>` : ""}
        </div>
        ${episodes_display}
      </div>
    </div>
  `;
}
