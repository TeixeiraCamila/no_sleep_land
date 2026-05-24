import { escapeHtml } from "../utils/html.js";
import { renderSidebar } from "../components/sidebar.js";

function renderSelectField(name, label, options, existingValue) {
  if (!options || options.length === 0) return "";

  return `
    <div>
      <label class="block mb-2 text-sm text-gray-400">${label}</label>
      <select name="${name}" class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none">
        <option value="">Selecione...</option>
        ${options.map((opt) => `<option value="${escapeHtml(opt)}" ${existingValue === opt ? "selected" : ""}>${escapeHtml(opt)}</option>`).join("")}
      </select>
    </div>
  `;
}

function renderSelectFieldAlpine(name, label, options) {
  if (!options || options.length === 0) return "";

  return `
    <div>
      <label class="block mb-2 text-sm text-gray-400">${label}</label>
      <select name="${name}" x-model="${name}" class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none">
        <option value="">Selecione...</option>
        ${options.map((opt) => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join("")}
      </select>
    </div>
  `;
}

function renderAutocompleteSelect(
  name,
  label,
  options,
  existingValues,
  placeholder,
) {
  if (!options || options.length === 0) return "";

  const existing = Array.isArray(existingValues) ? existingValues : [];
  const optionsJson = JSON.stringify(options);
  const existingJson = JSON.stringify(existing);

  return `
    <div class="autocomplete-container" data-field-name="${name}">
      <label class="block mb-2 text-sm text-gray-400">${label}</label>
      <div class="relative">
        <input 
          type="text" 
          class="autocomplete-input w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none"
          placeholder="${placeholder || "Buscar..."}"
          data-options='${optionsJson}'
          data-selected='${existingJson}'
        />
        <div class="autocomplete-dropdown absolute z-50 w-full bg-black border border-gray-700 mt-1 max-h-48 overflow-y-auto hidden"></div>
      </div>
      <div class="autocomplete-selected flex flex-wrap gap-2 mt-2">
        ${existing
          .map(
            (val) => `
          <span class="autocomplete-tag inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 text-sm text-white">
            ${escapeHtml(val)}
            <button type="button" class="autocomplete-remove hover:text-red-400" data-value="${escapeHtml(val)}">&times;</button>
            <input type="hidden" name="${name}" value="${escapeHtml(val)}" />
          </span>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderMultiSelectField(name, label, options, existingValues) {
  return renderAutocompleteSelect(
    name,
    label,
    options,
    existingValues,
    "Buscar ou adicionar...",
  );
}

export function renderForm(options, existingData, isEditing) {
  const existingStudios = existingData?.studios || [];
  const existingTags = existingData?.tags || [];
  const existingDateStart = existingData?.date?.start || "";
  const existingDateEnd = existingData?.date?.end || "";

  const alpineData = JSON.stringify({
    status: existingData?.status || '',
    type: existingData?.type || '',
    episodesSeen: existingData?.episodesSeen || '1',
    episodes: existingData?.episodes || '1'
  });

  return `
    <div class="form-container relative">
      ${renderSidebar(false, null)}
      <main class="main-content p-8">
        <button id="btn-toggle-sidebar" class="btn-toggle p-2 bg-zinc-800 text-zinc-400 hover:bg-zinc-600 mb-4">
          ☰
        </button>
        
        <div class="max-w-3xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">${isEditing ? "Editar" : "Novo"} </h1>

      <form id="form"
            x-data='${alpineData}'
            x-init="
              if (type === 'Filme') { episodesSeen = '1'; episodes = '1' }
              $watch('type', val => { if (val === 'Filme') { episodesSeen = '1'; episodes = '1' } })
            "
            class="space-y-6 border border-gray-800 p-6">
        <div>
          <label class="block mb-2 text-sm text-gray-400">Nome *</label>
          <input type="text" name="name" required value="${escapeHtml(existingData?.name || "")}" 
            class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${renderSelectFieldAlpine("status", "Status", options.Status)}
          ${renderSelectFieldAlpine("type", "Tipo", options.Type)}
          ${renderSelectField("nacionalidade", "Nacionalidade", options.Nacionalidade, existingData?.nacionalidade)}
        </div>

        <div id="rating-field-wrapper" x-show="status === 'Done'">
          ${renderSelectField("rating", "Rating", options.Rating, existingData?.rating)}
        </div>

        <div id="episodes-field-wrapper" class="grid grid-cols-1 md:grid-cols-2 gap-4" x-show="type === 'Filme'">
          <div>
            <label class="block mb-2 text-sm text-gray-400">Episodes Seen</label>
            <input type="number" name="episodesSeen" x-model="episodesSeen"
              x-bind:disabled="type !== 'Filme'"
              class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none" min="0" />
          </div>

          <div>
            <label class="block mb-2 text-sm text-gray-400">Episodes</label>
            <input type="number" name="episodes" x-model="episodes"
              x-bind:disabled="type !== 'Filme'"
              class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none" min="0" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block mb-2 text-sm text-gray-400">Data Início</label>
            <input type="date" name="dateStart" value="${existingDateStart}" 
              class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none" />
          </div>

          <div id="date-end-field-wrapper" x-show="status === 'Done'">
            <label class="block mb-2 text-sm text-gray-400">Data Fim</label>
            <input type="date" name="dateEnd" value="${existingDateEnd}" 
              class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none" />
          </div>
        </div>

        ${renderMultiSelectField("studios", "Studios/Streaming", options["Studios/Streaming"], existingStudios)}
        ${renderMultiSelectField("tags", "Genres/Tags", options["Genres/Tags"], existingTags)}

        <div>
          <label class="block mb-2 text-sm text-gray-400">Cover URL</label>
          <input type="url" name="coverUrl" id="cover-url-input" value="${escapeHtml(existingData?.coverUrl || "")}"
            placeholder="Cole uma URL de imagem..."
            class="w-full p-3 bg-black border border-gray-700 text-white focus:border-white focus:outline-none"
            oninput="handleCoverPreview(this.value)" />
          <div id="cover-preview" class="mt-3">
            ${existingData?.coverUrl ? `<img src="${escapeHtml(existingData.coverUrl)}" alt="Cover preview" class="max-w-xs rounded border border-gray-700" onerror="this.parentElement.innerHTML='<span class=\\'text-red-500\\'>URL inválida</span>'" />` : ""}
          </div>
        </div>

        <div class="flex gap-4 pt-4">
          <button type="submit" class="cursor-pointer flex-1 py-3 border border-white hover:bg-white hover:text-black transition-all">${isEditing ? "Salvar" : "Criar"}</button>
          <button type="button" onclick="window.location.hash = '/list'" class="cursor-pointer px-6 py-3 border border-zinc-700 hover:border-white transition-all">Cancelar</button>
        </div>
      </form>
      </div>
    </main>
    </div>
  `;
}

export function renderFormAccessDenied(isGuest = false) {
  if (isGuest) {
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
