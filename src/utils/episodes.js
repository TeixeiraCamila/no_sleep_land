import { escapeHtml } from "./html.js";

export function renderEpisodes(episodesSeen, episodes) {
  if (!episodesSeen && !episodes) return "";
  return `<span class="text-zinc-500">Ep:</span> ${escapeHtml(String(episodesSeen ?? "?"))}/${escapeHtml(String(episodes ?? "?"))}`;
}
