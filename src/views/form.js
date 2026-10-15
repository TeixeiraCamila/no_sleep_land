// Template do formulário: campos reativos com Alpine.js e autocomplete multi-select
import { escape_html } from "../utils/html.js";
import { render_sidebar } from "../components/sidebar.js";
import { poster_tool_markup } from "../components/poster_maker.js";

// Select estático: mapeia opções para tags <option> com valor inicial selecionado
function render_select_field(name, label, options, existing_value) {
  if (!options || options.length === 0) return "";

  return `
    <div>
      <label class="block mb-2 text-sm text-gray-400">${label}</label>
      <select name="${name}" class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none">
        <option value="">Selecione...</option>
        ${options.map((opt) => `<option value="${escape_html(opt)}" ${existing_value === opt ? "selected" : ""}>${escape_html(opt)}</option>`).join("")}
      </select>
    </div>
  `;
}

// Select reativo com Alpine.js: mapeia opções vinculadas ao estado x-model
function render_select_field_alpine(name, label, options) {
  if (!options || options.length === 0) return "";

  return `
    <div>
      <label class="block mb-2 text-sm text-gray-400">${label}</label>
      <select name="${name}" x-model="${name}" class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none">
        <option value="">Selecione...</option>
        ${options.map((opt) => `<option value="${escape_html(opt)}">${escape_html(opt)}</option>`).join("")}
      </select>
    </div>
  `;
}

// Input + dropdown + tags selecionadas para campos multi-valor (studios, genres)
// Mapeia valores existentes para tags com botão de remoção
function render_autocomplete_select(
  name,
  label,
  options,
  existing_values,
  placeholder,
) {
  if (!options || options.length === 0) return "";

  const existing = Array.isArray(existing_values) ? existing_values : [];
  const options_json = JSON.stringify(options);
  const existing_json = JSON.stringify(existing);

  return `
    <div class="autocomplete-container" data-field-name="${name}">
      <label class="block mb-2 text-sm text-gray-400">${label}</label>
      <div class="relative">
        <input 
          type="text" 
          class="autocomplete-input w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none"
          placeholder="${placeholder || "Buscar..."}"
          data-options='${options_json}'
          data-selected='${existing_json}'
        />
        <div class="autocomplete-dropdown absolute z-50 w-full bg-black border border-gray-700 mt-1 max-h-48 overflow-y-auto hidden"></div>
      </div>
      <div class="autocomplete-selected flex flex-wrap gap-2 mt-2">
        ${existing
          .map(
            (val) => `
          <span class="autocomplete-tag inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 text-sm text-white">
            ${escape_html(val)}
            <button type="button" class="autocomplete-remove hover:text-red-400" data-value="${escape_html(val)}">&times;</button>
            <input type="hidden" name="${name}" value="${escape_html(val)}" />
          </span>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

// Wrapper do autocomplete para campos de múltipla seleção
function render_multi_select_field(name, label, options, existing_values) {
  return render_autocomplete_select(
    name,
    label,
    options,
    existing_values,
    "Buscar ou adicionar...",
  );
}

// Formulário completo de criação/edição com Alpine.js para lógica condicional
export function render_form(options, existing_data, is_editing) {
  const existing_studios = existing_data?.studios || [];
  const existing_tags = existing_data?.tags || [];

  // Default de status só na criação; defensivo contra opção renomeada no Notion
  const default_status =
    !is_editing && (options.Status || []).includes("Plan to watch")
      ? "Plan to watch"
      : "";

  const alpine_data = JSON.stringify({
    status: existing_data?.status || default_status,
    type: existing_data?.type || '',
    episodesSeen: existing_data?.episodesSeen || '1',
    episodes: existing_data?.episodes || '1'
  });

  const form_fields = render_select_field("nacionalidade", "Nacionalidade", options.Nacionalidade, existing_data?.nacionalidade);
  const rating_field = render_select_field("rating", "Nota", options.Rating, existing_data?.rating);
  const existing_name = escape_html(existing_data?.name || "");

  return `
    <div class="form-container relative">
      ${render_sidebar(false, null)}
      <main class="main-content p-8">
        <button id="btn-toggle-sidebar" class="btn-toggle p-2 bg-zinc-800 text-zinc-400 hover:bg-zinc-600 mb-4">☰</button>
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold mb-6">${is_editing ? "Editar" : "Novo"}</h1>
          <form id="form"
                x-data='${alpine_data}'
                x-init="if (type === 'Filme') { episodesSeen = '1'; episodes = '1' }; $watch('type', val => { if (val === 'Filme') { episodesSeen = '1'; episodes = '1' } })"
                class="space-y-6 border border-gray-800 p-6">
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm text-gray-400">Nome *</label>
                <button type="button" id="btn-open-poster"
                  class="cursor-pointer text-xs px-3 py-1 border border-zinc-700 text-zinc-400 hover:border-white hover:text-white transition-all">
                  🎬 Gerar pôster
                </button>
              </div>
              <input type="text" name="name" required value="${existing_name}"
                class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${render_select_field_alpine("status", "Status", options.Status)}
              ${render_select_field_alpine("type", "Tipo", options.Type)}
              ${form_fields}
            </div>
            <div id="rating-field-wrapper" x-show="status === 'Done'">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${rating_field}
                <div>
                  <label class="block mb-2 text-sm text-gray-400">Obs</label>
                  <textarea name="obs" id="obs-input" rows="1" placeholder="Justifique a nota..."
                    class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none">${escape_html(existing_data?.obs || "")}</textarea>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div x-show="status === 'Watching' && type !== 'Filme'">
                <label class="block mb-2 text-sm text-gray-400">Episódios Assistidos</label>
                <input type="number" name="episodesSeen" x-model="episodesSeen" min="0"
                  class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none" />
              </div>
              <div x-show="type !== 'Filme'">
                <label class="block mb-2 text-sm text-gray-400">Episódios</label>
                <input type="number" name="episodes" x-model="episodes" min="0"
                  class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none" />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div x-show="status === 'Watching'">
                <label class="block mb-2 text-sm text-gray-400">Data Início</label>
                <input type="date" name="dateStart" value="${existing_data?.date?.start || ""}"
                  class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none" />
              </div>
              <div id="date-end-field-wrapper" x-show="status === 'Done'">
                <label class="block mb-2 text-sm text-gray-400">Data Fim</label>
                <input type="date" name="dateEnd" value="${existing_data?.date?.end || ""}"
                  class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none" />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${render_multi_select_field("studios", "Studios/Streaming", options["Studios/Streaming"], existing_studios)}
            ${render_multi_select_field("tags", "Genres/Tags", options["Genres/Tags"], existing_tags)}
            </div>
            <div>
              <label class="block mb-2 text-sm text-gray-400">URL da Capa</label>
              <input type="url" name="coverUrl" id="cover-url-input"
                value="${escape_html(existing_data?.coverUrl || "")}"
                placeholder="Cole uma URL de imagem..."
                class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none"
                oninput="handle_cover_preview(this.value)" />
              <div id="cover-preview" class="mt-3">
                ${existing_data?.coverUrl ? `<img src="${escape_html(existing_data.coverUrl)}" alt="Prévia da capa" class="border border-gray-700" onerror="this.parentElement.innerHTML='<span class=\\'text-red-500\\'>URL inválida</span>'" />` : ""}
              </div>
            </div>
            <div>
              <label class="block mb-2 text-sm text-gray-400">Plot</label>
              <textarea name="plot" id="plot-input" rows="4"
                placeholder="Sinopse do título (preenche automático pelo Gerar pôster)..."
                class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none">${escape_html(existing_data?.plot || "")}</textarea>
            </div>
            ${poster_tool_markup}
            <div class="flex gap-4 pt-4">
              <button type="submit" class="cursor-pointer flex-1 py-3 border border-white hover:bg-white hover:text-black transition-all">${is_editing ? "Salvar" : "Criar"}</button>
              <button type="button" onclick="window.location.hash = '/list'" class="cursor-pointer px-6 py-3 border border-zinc-700 hover:border-white transition-all">Cancelar</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `;
}

// Tela de erro quando usuário não tem permissão para criar/editar
export function render_form_access_denied(is_guest = false) {
  if (is_guest) {
    return `
      <div class="min-h-screen flex flex-col items-center justify-center p-8">
        <h1 class="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p class="text-gray-400 mb-4">Como convidado, você apenas pode visualizar os itens.</p>
        <button onclick="window.location.hash = '/list'" class="cursor-pointer px-6 py-3 border border-white hover:bg-white hover:text-black transition-all">Ver Lista</button>
      </div>
    `;
  }

  return `
    <div class="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 class="text-2xl font-bold mb-4">Acesso Negado</h1>
      <p class="text-gray-400 mb-4">Você precisa estar logado para acessar esta página.</p>
      <button onclick="window.location.hash = '/login'" class="cursor-pointer px-6 py-3 border border-white hover:bg-white hover:text-black transition-all">Fazer Login</button>
    </div>
  `;
}
