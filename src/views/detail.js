// View de detalhes: template HTML com informações completas do item + ações condicionais
// Renderiza campos dinamicamente; botões Editar/Deletar aparecem só se logged_in && !is_guest
import { render_main } from "./content.js";
import { escape_html } from "../utils/html.js";
import { format_date } from "../utils/date.js";
import { render_episodes } from "../utils/episodes.js";

// Template da página de detalhes (usa layout padrão)
export function render_detail(logged_in) {
  return `
    ${render_main(logged_in, "detail", "detail-container")}
  `;
}

// Renderiza conteúdo completo com dados do item e ações conforme permissão
export function render_detail_content(item, logged_in, is_guest) {
  // Botões de ação visíveis apenas para usuários logados (não convidados)
  const action_buttons =
    logged_in && !is_guest
      ? `
        <div class="flex gap-2 justify-end mt-8">
          <button onclick="window.location.hash = '/edit/${item?.id}'" class="cursor-pointer px-4 py-2 border border-zinc-700 hover:border-white transition-all">Edit</button>
          <button id="delete-btn" class="cursor-pointer px-4 py-2 border border-zinc-700 hover:border-white transition-all">Delete</button>
        </div>
      `
      : is_guest
        ? '<p class="text-sm text-zinc-500 mt-4">Guest: view-only</p>'
        : '<p class="text-sm text-zinc-500 mt-4">Sign in to edit or delete</p>';

  // Renderiza episódios e datas se disponíveis no item
  const episodes_display = 
  `
    ${item.episodes || item.episodesSeen ? `<div class="py-2 border-b border-zinc-800">${render_episodes(item.episodesSeen, item.episodes)}</div>` : ""}
  `;

  // Progresso vem do Notion como fórmula pronta (ex.: "▰▰▰ 42%"); só leitura
  const progress_display = 
  `
    ${item.progress ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Progress:</span> ${escape_html(item.progress)}</div>` : ""}
  `;

  // Capa em destaque no topo (mesmo padrão do watch-next)
  const cover_display = 
  `
    ${item?.coverUrl ? `<div class="flex justify-center mb-6"><img src="${escape_html(item.coverUrl)}" alt="Cover of ${escape_html(item.name)}" class="max-h-96 object-contain border border-zinc-800" onerror="this.parentElement.style.display='none'" /></div>` : ""}
  `;

  // Sinopse vinda da OMDB (campo Plot), exibida por último
  const plot_display = 
  `
    ${item.plot ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Plot:</span> <p class="whitespace-pre-line mt-1">${escape_html(item.plot)}</p></div>` : ""}
  `;
  
  // Formata data de início e fim para exibição
  const date_start = item?.date?.start ? format_date(item.date.start) : "";
  const date_end = item?.date?.end ? format_date(item.date.end) : "";
  // Exibe linha de data apenas se algum valor existir
  const date_display =
    date_start || date_end
      ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Date:</span> ${date_start}${date_end ? ` - ${date_end}` : ""}</div>`
      : "";

  return `
    <div class="max-w-2xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        
        <button onclick="window.location.hash = '/'" class="cursor-pointer px-4 py-2 border border-zinc-700 hover:border-white transition-all">Back</button>
      </div>

      ${cover_display}

      <div class="border border-zinc-800 p-6">
        ${
          item
            ? `
          ${item.status ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Status:</span> ${escape_html(item.status)}</div>` : ""}

          ${date_display}

          ${item.rating ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Rating:</span> ${escape_html(item.rating)}</div>` : ""}

          ${item.type?.length ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Type:</span> ${escape_html(item.type)}</div>` : ""}

          ${episodes_display}

          ${progress_display}

          ${item.nacionalidade ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Nationality:</span> ${escape_html(item.nacionalidade)}</div>` : ""}
          ${item.studios?.length ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Platforms:</span> ${escape_html(item.studios.join(", "))}</div>` : ""}
          ${item.tags?.length ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Genres:</span> ${escape_html(item.tags.join(", "))}</div>` : ""}

          ${plot_display}
        `
            : ""
        }
      </div>

      ${item ? action_buttons : ""}
    </div>
  `;
}
