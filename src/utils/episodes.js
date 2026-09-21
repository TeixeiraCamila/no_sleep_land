// Utilitário de formatação de episódios para exibição em cards e detalhes
// Usado por detail.js e status.js views; fallpadar "?" quando episódio não informado
import { escape_html } from "./html.js";

// Renderiza texto "Ep: X/Y" com fallback para "?" quando sem valor
export function render_episodes(episodes_seen, episodes) {
  if (!episodes_seen && !episodes) return "";
  return `<span class="text-zinc-500">Ep:</span> ${escape_html(String(episodes_seen ?? "?"))}/${escape_html(String(episodes ?? "?"))}`;
}
