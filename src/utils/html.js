// Protege contra XSS convertendo caracteres especiais em entidades HTML
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}