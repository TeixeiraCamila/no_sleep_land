// Utilitários HTML: sanitização XSS e renderização de elementos reutilizáveis
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Bloco HTML de capa (usado em list, noCover, status)
export function renderCoverImage(url) {
  if (!url) return "";
  return `<div class="list_item__cover w-fit my-0 max-h-50">
    <img src="${escapeHtml(url)}" alt="Cover" class="w-full h-50 object-contain" onerror="this.style.display='none'" />
  </div>`;
}