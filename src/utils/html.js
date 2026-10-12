// Utilitários HTML: sanitização XSS e renderização de elementos reutilizáveis
// escape_html previne injeção XSS convertendo caracteres especiais para entidades HTML
export function escape_html(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Bloco HTML de capa (usado em list, noCover, status)
export function render_cover_image(url) {
  if (!url) return "";
  return `<div class="list_item__cover w-fit my-0 max-h-50">
    <img src="${escape_html(url)}" alt="Capa" class="w-full h-50 object-contain" onerror="this.style.display='none'" />
  </div>`;
}