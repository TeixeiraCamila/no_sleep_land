import { escapeHtml } from "./html.js";

// Renderiza texto "Ep: X/Y" com fallback para "?" quando sem valor
export function renderEpisodes(episodesSeen, episodes) {
  if (!episodesSeen && !episodes) return "";
  return `<span class="text-zinc-500">Ep:</span> ${escapeHtml(String(episodesSeen ?? "?"))}/${escapeHtml(String(episodes ?? "?"))}`;
}
