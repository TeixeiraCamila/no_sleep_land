// Componente Kanban: grid de colunas por status com cards de itens e filtros por tipo
import { escape_html } from "../utils/html.js";
import { render_main } from "../views/content.js";
import { render_episodes } from "../utils/episodes.js";

// Shell do Kanban: sidebar + container com id derivado da página ("status-container", "ghibli-container")
export function render_kanban(logged_in, page = "status") {
  return render_main(logged_in, page, `${page}-container`);
}

// Opções de renderização: show_rating esconde a nota nos cards; type_options/active_type
// desenham a barra de filtros interna (hoje nenhum caller usa — a Status desenha a dela no shell)
export function render_kanban_items(
  items,
  status_options = [],
  { type_options = [], active_type = null, show_rating = true } = {},
) {
  // Definir a lista de colunas
  const status_groups = {};
  status_options.forEach((status) => {
    status_groups[status] = [];
  });

  items.forEach((item) => {
    const status = item.status || status_options[0];
    if (status && status_groups[status]) {
      status_groups[status].push(item);
    } else if (status_options[0]) {
      status_groups[status_options[0]].push(item);
    }
  });

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

  const type_filters =
    type_options.length > 0
      ? `
      <div class="type-filters flex flex-wrap gap-2 mb-4">
        ${type_options
          .map(
            (type) => `
          <button type="button" data-type="${escape_html(type)}"
            class="px-3 py-1 border border-zinc-700 rounded-sm text-sm transition-colors hover:border-white cursor-pointer
                  ${active_type === type ? "bg-white text-black hover:bg-zinc-200" : "text-zinc-300 bg-zinc-900"}">
            ${escape_html(type)}
          </button>
        `,
          )
          .join("")}
      </div>
    `
      : "";

  return `${type_filters}<div class="kanban__grid flex gap-4 overflow-x-auto">${content}</div>`;
}


export function render_kanban_card(item, { show_rating = true } = {}) {
  const episodes_display =
    item.episodesSeen != null || item.episodes != null
      ? `<p class="text-xs text-zinc-500"><span class="text-zinc-400">Ep:</span> ${item.episodesSeen ?? "-"}/${item.episodes ?? "-"}</p>`
      : "";

  const cover_html = item.coverUrl
    ? `<img src="${escape_html(item.coverUrl)}" alt="Capa" class="w-full my-0 mx-auto h-40 object-contain mb-2" onerror="this.style.display='none'" />`
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
