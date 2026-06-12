// Utilitário de busca com debounce para evitar requisições excessivas
export function setupDebouncedSearch(input, delay, callback) {
  let timeout;
  input.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(input.value), delay);
  });
}
