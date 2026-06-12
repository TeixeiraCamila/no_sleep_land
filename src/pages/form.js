// Página de formulário: criação e edição de itens com validação e autocomplete
// Fluxo: page carrega options + dados existentes → view renderiza form → submit envia p/ API (create/update)
import { state } from "../store.js";
import { entertainmentAPI, isGuest, isLoggedIn, optionsAPI } from "../services/api.js";
import { renderForm, renderFormAccessDenied } from "../views/form.js";
import { initAutocompletes } from "../utils/autocomplete.js";

// Carrega opções, dados existentes (se edição) e renderiza formulário
export async function renderFormPage() {
  const app = document.getElementById("app");
  if (!app) {
    console.error("app not found");
    return;
  }

  const loggedIn = isLoggedIn();
  const guest = isGuest();

  // Convidados não podem criar/editar
  if (guest) {
    app.innerHTML = renderFormAccessDenied(true);
    return;
  }

  if (!loggedIn) {
    app.innerHTML = renderFormAccessDenied(false);
    return;
  }

  // Carrega opções dos selects (tipos, status, tags) e dados existentes (se edição)
  let options = {};
  try {
    options = await optionsAPI.get();
  } catch (e) {
    console.error("Error fetching options:", e);
  }

  // Se modo edição, busca dados existentes
  let existingData = null;
  if (state.params.id) {
    try {
      existingData = await entertainmentAPI.get(state.params.id);
    } catch (e) {
      console.error(e);
    }
  }

  // Determina modo baseado em dados existentes
  const isEditing = !!existingData;

  // Renderiza formulário com opções e dados (se edit)
  const html = renderForm(options, existingData, isEditing);
  app.innerHTML = html;

  // Inicializa autocompletes multi-select (studios, genres)
  initAutocompletes();

  // Configura submit do formulário
  const form = document.getElementById("form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Extrai dados do formulário e monta objeto de envio
      const formData = new FormData(form);
      const data = {};

      // Mapeia cada campo do formulário para o objeto de envio
      const fields = [
        "name",
        "status",
        "type",
        "rating",
        "dateStart",
        "dateEnd",
        "nacionalidade",
        "episodesSeen",
        "episodes",
      ];

      // Itera campos do formulário e monta estrutura de dados para API
      fields.forEach((field) => {
        const value = formData.get(field);
        if (value) {
          // Converte dateStart/dateEnd para objeto date aninhado
          if (field === 'dateStart' || field === 'dateEnd') {
            if (!data.date) data.date = {};
            if (field === 'dateStart' && value) data.date.start = value;
            if (field === 'dateEnd' && value) data.date.end = value;
          } else {
            data[field] = value;
          }
        }
      });

      // Extrai cover URL do input separadamente
      const coverUrl = formData.get("coverUrl");
      if (coverUrl) data.coverUrl = coverUrl;

      // Extrai arrays multi-select (studios, tags) do formulário
      const studios = formData.getAll("studios");
      if (studios.length) data.studios = studios;

      const tags = formData.getAll("tags");
      if (tags.length) data.tags = tags;

      // Envia para API (create ou update conforme modo)
      try {
        if (isEditing && state.params.id) {
          await entertainmentAPI.update(state.params.id, data);
        } else {
          await entertainmentAPI.create(data);
        }
        window.location.hash = "/list";
      } catch (error) {
        alert(`Erro: ${error.message}`);
      }
    });
  }
}
