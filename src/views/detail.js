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
      ? `<div class="flex gap-2 justify-end mt-8">
        <button onclick="window.location.hash = '/edit/${item?.id}'" class="cursor-pointer px-4 py-2 border border-zinc-700 hover:border-white transition-all">Editar</button>
        <button id="delete-btn" class="cursor-pointer px-4 py-2 border border-zinc-700 hover:border-white transition-all">Deletar</button>
      </div>`
      : is_guest
        ? '<p class="text-sm text-zinc-500 mt-4">Convidado: apenas visualização</p>'
        : '<p class="text-sm text-zinc-500 mt-4">Faça login para editar ou deletar</p>';

  // Renderiza episódios e datas se disponíveis no item
  const episodes_display = `${item.episodes || item.episodesSeen ? `<div class="py-2 border-b border-zinc-800">${render_episodes(item.episodesSeen, item.episodes)}</div>` : ""}`;
  // Formata data de início e fim para exibição
  const date_start = item?.date?.start ? format_date(item.date.start) : "";
  const date_end = item?.date?.end ? format_date(item.date.end) : "";
  // Exibe linha de data apenas se algum valor existir
  const date_display =
    date_start || date_end
      ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Data:</span> ${date_start}${date_end ? ` - ${date_end}` : ""}</div>`
      : "";

  return `
    <div class="max-w-2xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">${item ? escape_html(item.name) : ""}</h1>
        <button onclick="window.location.hash = '/'" class="cursor-pointer px-4 py-2 border border-zinc-700 hover:border-white transition-all">Voltar</button>
      </div>

      <div class="border border-zinc-800 p-6">
        ${
          item
            ? `
          ${item.status ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Status:</span> ${escape_html(item.status)}</div>` : ""}

          ${date_display}

          ${item.rating ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Rating:</span> ${escape_html(item.rating)}</div>` : ""}

          ${item.type?.length ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Tipo:</span> ${escape_html(item.type)}</div>` : ""}

          ${episodes_display}

          ${item.nacionalidade ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Nacionalidade:</span> ${escape_html(item.nacionalidade)}</div>` : ""}
          ${item.studios?.length ? `<div class="py-2 border-b border-zinc-800"><span class="text-zinc-500">Plataformas:</span> ${escape_html(item.studios.join(", "))}</div>` : ""}
          ${item.tags?.length ? `<div class="py-2"><span class="text-zinc-500">Gêneros:</span> ${escape_html(item.tags.join(", "))}</div>` : ""}
        `
            : ""
        }
      </div>

      ${item ? action_buttons : ""}
    </div>
  `;
}
