// Página de detalhes: carrega item da API e gerencia ações de edição/exclusão
// Fluxo: page busca item por ID → render_detail_content() da view exibe → event listeners nos botões
import { state } from "../store.js";
import { entertainment_api, is_logged_in, is_guest } from "../services/api.js";
import { render_detail, render_detail_content } from "../views/detail.js";

// Carrega item da API e exibe informações completas
export async function render_detail_page() {
  const app = document.getElementById("app");
  if (!app || !state.params.id) return;

  const logged_in = is_logged_in();
  const guest = is_guest();

  // Renderiza template base
  app.innerHTML = render_detail(logged_in);

  const loading_el = document.getElementById("loading");
  const detail_container = document.getElementById("detail-container");

  if (!loading_el || !detail_container) return;

  try {
    const item = await entertainment_api.get(state.params.id);

    loading_el.style.display = "none";
    detail_container.innerHTML = render_detail_content(item, logged_in, guest);

    // Botão de excluir (apenas usuários logados, não convidados)
    if (logged_in && !guest) {
      const delete_btn = document.getElementById("delete-btn");
      if (delete_btn) {
        delete_btn.addEventListener("click", async () => {
          if (confirm("Tem certeza?")) {
            await entertainment_api.delete(item.id);
            window.location.hash = "/list";
          }
        });
      }
    }
  } catch (error) {
    console.error("Erro:", error);
    loading_el.textContent = `Erro: ${error.message}`;
  }
}