import { AUTOCOMPLETE_BLUR_DELAY } from "../constants.js";
import { escapeHtml } from "./html.js";

export function initAutocompletes() {
  const containers = document.querySelectorAll(".autocomplete-container");

  containers.forEach((container) => {
    const input = container.querySelector(".autocomplete-input");
    const dropdown = container.querySelector(".autocomplete-dropdown");
    const selectedContainer = container.querySelector(".autocomplete-selected");

    if (!input || !dropdown) return;

    const options = JSON.parse(input.dataset.options || "[]");
    const selectedValues = JSON.parse(input.dataset.selected || "[]");

    input.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();

      if (searchTerm === "") {
        dropdown.classList.add("hidden");
        return;
      }

      const filtered = options.filter(
        (opt) =>
          opt.toLowerCase().includes(searchTerm) &&
          !selectedValues.includes(opt),
      );

      if (filtered.length === 0) {
        // Permite adicionar novos valores
        dropdown.innerHTML = `
          <div class="autocomplete-option p-2 cursor-pointer hover:bg-zinc-800 text-zinc-400" data-value="${escapeHtml(e.target.value)}">
            + Adicionar "${escapeHtml(e.target.value)}"
          </div>
        `;
      } else {
        dropdown.innerHTML = filtered
          .map(
            (opt) => `
          <div class="autocomplete-option p-2 cursor-pointer hover:bg-zinc-800" data-value="${escapeHtml(opt)}">
            ${escapeHtml(opt)}
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
      if (!selectedValues.includes(value)) {
        selectedValues.push(value);
        addSelectedTag(
          container,
          input,
          selectedValues,
          value,
          selectedContainer,
        );
      }

      input.value = "";
      dropdown.classList.add("hidden");
    });

    selectedContainer.addEventListener("click", (e) => {
      const removeBtn = e.target.closest(".autocomplete-remove");
      if (!removeBtn) return;

      const value = removeBtn.dataset.value;
      const index = selectedValues.indexOf(value);
      if (index > -1) {
        selectedValues.splice(index, 1);
        const tag = removeBtn.closest(".autocomplete-tag");
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

export function addSelectedTag(
  container,
  input,
  selectedValues,
  value,
  selectedContainer,
) {
  const tag = document.createElement("span");
  tag.className =
    "autocomplete-tag inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 text-sm text-white";
  tag.innerHTML = `
    ${escapeHtml(value)}
    <button type="button" class="autocomplete-remove hover:text-red-400" data-value="${escapeHtml(value)}">&times;</button>
    <input type="hidden" name="${input.closest(".autocomplete-container").dataset.fieldName}" value="${escapeHtml(value)}" />
  `;
  selectedContainer.appendChild(tag);
}
