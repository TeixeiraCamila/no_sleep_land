// Autocomplete multi-select para campos de studios e genres/tags
// Gerencia dropdown de opções filtradas, adição/remoção de tags e inputs hidden para o form
import { AUTOCOMPLETE_BLUR_DELAY } from "../constants.js";
import { escape_html } from "./html.js";

// Habilita busca/filtro multi-select em campos de studios e genres/tags
export function init_autocompletes() {
  const containers = document.querySelectorAll(".autocomplete-container");

  containers.forEach((container) => {
    const input = container.querySelector(".autocomplete-input");
    const dropdown = container.querySelector(".autocomplete-dropdown");
    const selected_container = container.querySelector(".autocomplete-selected");

    if (!input || !dropdown) return;

    const options = JSON.parse(input.dataset.options || "[]");
    const selected_values = JSON.parse(input.dataset.selected || "[]");

    input.addEventListener("input", (e) => {
      const search_term = e.target.value.toLowerCase().trim();

      if (search_term === "") {
        dropdown.classList.add("hidden");
        return;
      }

      // Filtra opções que correspondem ao termo e não estão selecionadas
      const filtered = options.filter(
        (opt) =>
          opt.toLowerCase().includes(search_term) &&
          !selected_values.includes(opt),
      );

      // Se não achou correspondência, permite criar novo valor
      if (filtered.length === 0) {
        // Permite adicionar novos valores
        dropdown.innerHTML = `
          <div class="autocomplete-option p-2 cursor-pointer hover:bg-zinc-800 text-zinc-400" data-value="${escape_html(e.target.value)}">
            + Add "${escape_html(e.target.value)}"
          </div>
        `;
      } else {
        // Mapeia opções filtradas para itens clicáveis no dropdown
        dropdown.innerHTML = filtered
          .map(
            (opt) => `
          <div class="autocomplete-option p-2 cursor-pointer hover:bg-zinc-800" data-value="${escape_html(opt)}">
            ${escape_html(opt)}
          </div>
        `,
          )
          .join("");
      }

      dropdown.classList.remove("hidden");
    });

    dropdown.addEventListener("click", (e) => {
      const option = e.target.closest(".autocomplete-option");
      if (!option) return;

      const value = option.dataset.value;
      if (!selected_values.includes(value)) {
        selected_values.push(value);
        add_selected_tag(
          container,
          input,
          selected_values,
          value,
          selected_container,
        );
      }

      input.value = "";
      dropdown.classList.add("hidden");
    });

    selected_container.addEventListener("click", (e) => {
      const remove_btn = e.target.closest(".autocomplete-remove");
      if (!remove_btn) return;

      const value = remove_btn.dataset.value;
      const index = selected_values.indexOf(value);
      if (index > -1) {
        selected_values.splice(index, 1);
        const tag = remove_btn.closest(".autocomplete-tag");
        if (tag) tag.remove();
      }
    });

    input.addEventListener("blur", () => {
      setTimeout(() => dropdown.classList.add("hidden"), AUTOCOMPLETE_BLUR_DELAY);
    });

    input.addEventListener("focus", () => {
      if (input.value.trim()) {
        input.dispatchEvent(new Event("input"));
      }
    });
  });
}

// Cria elemento DOM da tag selecionada com botão de remoção e input oculto
export function add_selected_tag(
  container,
  input,
  selected_values,
  value,
  selected_container,
) {
  const tag = document.createElement("span");
  tag.className =
    "autocomplete-tag inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 text-sm text-white";
  tag.innerHTML = `
    ${escape_html(value)}
    <button type="button" class="autocomplete-remove hover:text-red-400" data-value="${escape_html(value)}">&times;</button>
    <input type="hidden" name="${input.closest(".autocomplete-container").dataset.fieldName}" value="${escape_html(value)}" />
  `;
  selected_container.appendChild(tag);
}
