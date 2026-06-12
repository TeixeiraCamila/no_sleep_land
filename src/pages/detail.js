// Página de detalhes: carrega item da API e gerencia ações de edição/exclusão
import { state } from "../store.js";
import { entertainmentAPI, isLoggedIn, isGuest } from "../services/api.js";
import { renderDetail, renderDetailContent } from "../views/detail.js";

// Carrega item da API e exibe informações completas
export async function renderDetailPage() {
  const app = document.getElementById("app");
  if (!app || !state.params.id) return;

  const loggedIn = isLoggedIn();
  const guest = isGuest();

  // Renderiza template base
  app.innerHTML = renderDetail(loggedIn);

  const loadingEl = document.getElementById("loading");
  const detailContainer = document.getElementById("detail-container");

  if (!loadingEl || !detailContainer) return;

  try {
    const item = await entertainmentAPI.get(state.params.id);

    loadingEl.style.display = "none";
    detailContainer.innerHTML = renderDetailContent(item, loggedIn, guest);

    // Botão de excluir (apenas usuários logados, não convidados)
    if (loggedIn && !guest) {
      const deleteBtn = document.getElementById("delete-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
          if (confirm("Tem certeza?")) {
            await entertainmentAPI.delete(item.id);
            window.location.hash = "/list";
          }
        });
      }
    }
  } catch (error) {
    console.error("Erro:", error);
    loadingEl.textContent = `Erro: ${error.message}`;
  }
}