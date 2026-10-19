// Página de formulário: criação e edição de itens com validação e autocomplete
// Fluxo: page carrega options + dados existentes → view renderiza form → submit envia p/ API (create/update)
import "../assets/poster/style.css";

import { state } from "../store.js";
import { entertainment_api, is_guest, is_logged_in, options_api } from "../services/api.js";
import { render_form, render_form_access_denied } from "../views/form.js";
import { init_autocompletes } from "../utils/autocomplete.js";
import { match_country_option } from "../utils/country.js";
import { init_poster_tool } from "../components/poster_maker.js";
import { register_action } from "../actions.js";

// Preenche o select de Nacionalidade com o Country da OMDB (primeiro país)
// Opção inexistente vira <option> temporário e o Notion cria a opção ao salvar
function fill_nationality(country) {
  const select = document.querySelector('#form select[name="nacionalidade"]');
  if (!select) return;

  const option_values = Array.from(select.options, (option) => option.value);
  const match = match_country_option(country, option_values);
  if (!match) return;

  if (!option_values.includes(match.value)) {
    const option = document.createElement("option");
    option.value = match.value;
    option.textContent = match.value;
    select.appendChild(option);
  }
  select.value = match.value;
}

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

  // Gera pôster embutido: no envio do Cloudinary preenche a Capa; na busca OMDB, o Plot
  const poster_tool = init_poster_tool(
    (cover_url) => {
      const cover_input = document.getElementById("cover-url-input");
      if (cover_input) cover_input.value = cover_url;
      window.handle_cover_preview(cover_url);
    },
    (movie) => {
      if (movie.Plot && movie.Plot !== "N/A") {
        const plot_input = document.getElementById("plot-input");
        if (plot_input) plot_input.value = movie.Plot;
      }
      fill_nationality(movie.Country);
    },
  );

  // Abre o gerador usando o Nome do form como busca/título inicial e rola até ele
  register_action("btn-open-poster", () => {
    const name_input = document.querySelector('#form input[name="name"]');
    poster_tool.open(name_input?.value.trim() || "");
  });

  // Configura submit do formulário
  // Exceção documentada: #form-submit é acionado pelo evento submit (clique ou Enter),
  // não pelo registry de ações — o botão mantém só o id para identificação única
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
        "plot",
        "obs",
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
