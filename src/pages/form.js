/**
 * ==========================================
 * FORM PAGE - Página de Formulário
 * ==========================================
 * Serve tanto para CRIAR quanto para EDITAR.
 * A mesma função detecta qual modo usar
 * baseado em state.params.id.
 *
 * Fluxo (create):
 * 1. Verifica autenticação
 * 2. Carrega opções (tipos, status, tags)
 * 3. Renderiza formulário vazio
 * 4. Configura submit para criar
 *
 * Fluxo (edit):
 * 1. Verifica autenticação
 * 2. Carrega opções + dados existentes
 * 3. Renderiza formulário preenchido
 * 4. Configura submit para atualizar
 *
 * @mode "create" se state.params.id é vazio
 * @mode "edit" se state.params.id existe
 */

// DEPENDÊNCIAS
import { state } from "../store.js";
import { entertainmentAPI, isGuest, isLoggedIn, optionsAPI } from "../services/api.js";

import { renderForm, renderFormAccessDenied } from "../views/form.js";
import { initAutocompletes } from "../utils/autocomplete.js";

/**
 * Renderiza página de formulário (create/edit)
 */
export async function renderFormPage() {
  const app = document.getElementById("app");
  if (!app) {
    console.error("app not found");
    return;
  }

  const loggedIn = isLoggedIn();
  const guest = isGuest();

  // ==========================================
  // PROTEÇÃO: só usuários logados
  // ==========================================
  if (guest) {
    app.innerHTML = renderFormAccessDenied(true);
    return;
  }

  if (!loggedIn) {
    app.innerHTML = renderFormAccessDenied(false);
    return;
  }

  // ==========================================
  // CARREGAR DADOS
  // ==========================================

  // Busca opções disponíveis para selects
  // (tipos, status, tags, etc.)
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

  // ==========================================
  // AUTOCOMPLETES
  // ==========================================
  // Inicializa campos de autocomplete (multi-select)
  initAutocompletes();

  // ==========================================
  // CONFIGURA SUBMIT
  // ==========================================
  const form = document.getElementById("form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // Previne reload da página

      // ==========================================
      // EXTRAI DADOS DO FORMULÁRIO
      // ==========================================
      const formData = new FormData(form);
      const data = {};

      // Mapeia campos do formulário para o objeto
      // Apenas inclui campos com valor preenchido
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

      fields.forEach((field) => {
        const value = formData.get(field);
        if (value) {
          // Converter campos de data para objeto date
          if (field === 'dateStart' || field === 'dateEnd') {
            if (!data.date) data.date = {};
            if (field === 'dateStart' && value) data.date.start = value;
            if (field === 'dateEnd' && value) data.date.end = value;
          } else {
            data[field] = value;
          }
        }
      });

      // Cover URL do input
      const coverUrl = formData.get("coverUrl");
      if (coverUrl) data.coverUrl = coverUrl;

      // Campos com múltiplos valores (arrays)
      const studios = formData.getAll("studios");
      if (studios.length) data.studios = studios;

      const tags = formData.getAll("tags");
      if (tags.length) data.tags = tags;

      // ==========================================
      // ENVIA PARA API
      // ==========================================
      try {
        if (isEditing && state.params.id) {
          // Modo edição: atualiza existente
          await entertainmentAPI.update(state.params.id, data);
        } else {
          // Modo criação: cria novo registro
          await entertainmentAPI.create(data);
        }
        // Sucesso: retorna para lista
        window.location.hash = "/list";
      } catch (error) {
        alert(`Erro: ${error.message}`);
      }
    });
  }
}
