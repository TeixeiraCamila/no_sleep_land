/**
 * ==========================================
 * TOGGLE SIDEBAR - Controle de Visibilidade
 * ==========================================
 * Gerencia a abertura/fechamento da sidebar.
 * Usa event delegation que funciona mesmo
 * quando o elemento ainda não existe no DOM.
 * 
 * @css-classes
 * - .main-moved: desloca conteúdo principal
 * - .visible: mostra a sidebar
 */

export function initToggleSidebar() {
  document.addEventListener("click", (e) => {
    // Busca o botão quando o click acontece
    const toggleBtn = document.getElementById("btn-toggle-sidebar");
    if (!toggleBtn) return;

    // Verifica se o clique foi no botão de toggle
    if (!e.target.closest("#btn-toggle-sidebar")) return;

    const mainContent = document.querySelector(".main-content");
    const sidebar = document.querySelector(".sidebar");

    if (mainContent && sidebar) {
      mainContent.classList.toggle("main-moved");
      sidebar.classList.toggle("visible");
    }
  });
}