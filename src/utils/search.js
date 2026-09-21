// Utilitário de busca com debounce para evitar requisições excessivas à API
// Usado em list.js e status.js; delay configurado via constants.js (300ms header, 600ms sidebar)
export function setup_debounced_search(input, delay, callback) {
  let timeout;
  input.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(input.value), delay);
  });
}
