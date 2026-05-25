export function setupDebouncedSearch(input, delay, callback) {
  let timeout;
  input.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(input.value), delay);
  });
}
