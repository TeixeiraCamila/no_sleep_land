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
import { entertainmentAPI, isLoggedIn } from "../services/api.js";

import { renderDetail } from "../views/detail.js";

/**
 * Renderiza página de detalhes de um item
 */
export async function renderDetailPage() {
  const app = document.getElementById("app");
  
  // Sem ID nos parâmetros, não há o que exibir
  if (!app || !state.params.id) return;

  const loggedIn = isLoggedIn();

  // Renderiza estrutura inicial com loading
  app.innerHTML = `
    <div class="text-center py-8 text-zinc-400" id="loading">
      Carregando...
    </div>
    <div id="content"></div>
  `;

  const loadingEl = document.getElementById("loading");
  const contentEl = document.getElementById("content");

  if (!contentEl || !loadingEl) {
    console.error("Elementos não encontrados");
    return;
  }

  try {
    // Busca detalhes do item via API
    const item = await entertainmentAPI.get(state.params.id);

    // Oculta loading e renderiza conteúdo
    loadingEl.style.display = "none";
    contentEl.innerHTML = renderDetail(item, loggedIn);

    // ==========================================
    // BOTÃO DE EXCLUSÃO
    // ==========================================
    // Apenas usuários logados podem excluir
    if (loggedIn) {
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