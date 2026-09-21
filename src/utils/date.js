// Utilitário de formatação de datas para exibição pt-BR
// Converte string ISO para formato local brasileiro (dd/mm/aaaa)
export function format_date(date_str) {
  if (!date_str) return '';
  return new Date(date_str).toLocaleDateString("pt-BR")
}