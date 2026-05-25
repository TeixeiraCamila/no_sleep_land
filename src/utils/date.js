// Converte data ISO para formato local pt-BR
export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString("pt-BR")
}