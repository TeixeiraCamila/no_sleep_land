/**
 * ==========================================
 * DETAIL PAGE - Página de Detalhes
 * ==========================================
 * Exibe informações completas de um item.
 * Permite exclusão apenas para usuários logados.
 * 
 * Fluxo:
 * 1. Verifica se tem ID do item nos parâmetros
 * 2. Busca dados do item na API
 * 3. Renderiza template com informações
 * 4. Configura botão de exclusão (se logado)
 * 
 * @param id - Recebe via state.params.id (da URL)
 */

// DEPENDÊNCIAS
import { state } from "../store.js";
import { entertainmentAPI, isLoggedIn, isGuest } from "../services/api.js";

import { renderDetail, renderDetailContent } from "../views/detail.js";

/**
 * Renderiza página de detalhes de um item
 */
export async function renderDetailPage() {
  const app = document.getElementById("app");
  
  // Sem ID nos parâmetros, não há o que exibir
  if (!app || !state.params.id) return;

  const loggedIn = isLoggedIn();
  const guest = isGuest();

  // Renderiza template base
  app.innerHTML = renderDetail(loggedIn);

  const loadingEl = document.getElementById("loading");
  const detailContainer = document.getElementById("detail-container");

  if (!loadingEl || !detailContainer) return;

  try {
    // Busca detalhes do item via API
    const item = await entertainmentAPI.get(state.params.id);

    // Oculta loading e renderiza conteúdo
    loadingEl.style.display = "none";
    detailContainer.innerHTML = renderDetailContent(item, loggedIn, guest);

    // ==========================================
    // BOTÃO DE EXCLUSÃO
    // ==========================================
    // Apenas usuários logados (não convidados) podem excluir
    if (loggedIn && !guest) {
      const deleteBtn = document.getElementById("delete-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
          // Confirmação antes de excluir
          if (confirm("Tem certeza?")) {
            await entertainmentAPI.delete(item.id);
            window.location.hash = "/list";  // Retorna para lista
          }
        });
      }
    }
  } catch (error) {
    console.error("Erro:", error);
    loadingEl.textContent = `Erro: ${error.message}`;
  }
}