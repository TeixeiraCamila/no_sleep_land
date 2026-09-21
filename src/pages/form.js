// Página de formulário: criação e edição de itens com validação e autocomplete
// Fluxo: page carrega options + dados existentes → view renderiza form → submit envia p/ API (create/update)
import { state } from "../store.js";
import { entertainment_api, is_guest, is_logged_in, options_api } from "../services/api.js";
import { render_form, render_form_access_denied } from "../views/form.js";
import { init_autocompletes } from "../utils/autocomplete.js";

// Carrega opções, dados existentes (se edição) e renderiza formulário
export async function render_form_page() {
  const app = document.getElementById("app");
  if (!app) {
    console.error("app not found");
    return;
  }

  const logged_in = is_logged_in();
  const guest = is_guest();

  // Convidados não podem criar/editar
  if (guest) {
    app.innerHTML = render_form_access_denied(true);
    return;
  }

  if (!logged_in) {
    app.innerHTML = render_form_access_denied(false);
    return;
  }

  // Carrega opções dos selects (tipos, status, tags) e dados existentes (se edição)
  let options = {};
  try {
    options = await options_api.get();
  } catch (e) {
    console.error("Error fetching options:", e);
  }

  // Se modo edição, busca dados existentes
  let existing_data = null;
  if (state.params.id) {
    try {
      existing_data = await entertainment_api.get(state.params.id);
    } catch (e) {
      console.error(e);
    }
  }

  // Determina modo baseado em dados existentes
  const is_editing = !!existing_data;

  // Renderiza formulário com opções e dados (se edit)
  const html = render_form(options, existing_data, is_editing);
  app.innerHTML = html;

  // Inicializa autocompletes multi-select (studios, genres)
  init_autocompletes();

  // Configura submit do formulário
  const form = document.getElementById("form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Extrai dados do formulário e monta objeto de envio
      const form_data = new FormData(form);
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
        const value = form_data.get(field);
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
      const cover_url = form_data.get("coverUrl");
      if (cover_url) data.coverUrl = cover_url;

      // Extrai arrays multi-select (studios, tags) do formulário
      const studios = form_data.getAll("studios");
      if (studios.length) data.studios = studios;

      const tags = form_data.getAll("tags");
      if (tags.length) data.tags = tags;

      // Envia para API (create ou update conforme modo)
      try {
        if (is_editing && state.params.id) {
          await entertainment_api.update(state.params.id, data);
        } else {
          await entertainment_api.create(data);
        }
        window.location.hash = "/list";
      } catch (error) {
        alert(`Erro: ${error.message}`);
      }
    });
  }
}
