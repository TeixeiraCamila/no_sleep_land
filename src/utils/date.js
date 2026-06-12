// Utilitário de formatação de datas para exibição pt-BR
// Converte string ISO para formato local brasileiro (dd/mm/aaaa)
export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString("pt-BR")
}