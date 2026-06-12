// Utilitário de formatação de datas para exibição pt-BR
export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString("pt-BR")
}