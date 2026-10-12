# Kanban — no_sleep_land

SPA sem framework (Vanilla JS + Alpine.js + Tailwind v4 + Vite) para gerenciar entretenimento. Consome o `notion_api` (domínio **entertainment**).

Colunas: **Completo** · **Em desenvolvimento** · **Em pausa** · **Pode ser útil**

## Completo

- **Listagem paginada com busca** — grid de cards, busca server-side com debounce e "Carregar mais".
- **Filtro de Status na listagem** — client-side, preservado entre navegações (`store.js` → `status_filter`).
- **Kanban por Status** — todas as colunas do schema aparecem, mesmo vazias, ordenadas por `options.Status`.
- **Filtro por Type no Kanban + busca combinada** — Type aplica sobre os cards; a busca da sidebar filtra por cima.
- **Detalhes do item** — capa, status, datas, rating, tipo, episódios, plataformas e gêneros.
- **Criar/editar item** — formulário completo com Alpine.js e autocomplete multi-select de studios/tags.
- **Upload de capa com compressão** — imagem comprimida client-side (canvas → base64) + preview por URL.
- **Autenticação email + código (JWT)** — login, sessão em `localStorage` e revalidação via `/me` no boot.
- **Modo visitante** — lê mas não escreve; UI esconde os controles de escrita.
- **Auto-logout em 401** — qualquer 401 (fora do login) limpa a sessão e volta para `/login`.
- **Watch Next + "Decida por mim!"** — lista "Plan to watch" com paginação e modal de sorteio aleatório.
- **Itens sem capa** — página que filtra itens com `coverUrl` vazio.
- **Página Ghibli** — filtro server-side por estúdio "Ghibli".
- **Poster Maker** — busca OMDB, preview, download PNG (html2canvas) e upload Cloudinary com URL copiável.
- **Busca centralizada da sidebar** — um listener único com adapters por rota.
- **Componentes reutilizáveis** — card de item e loader de paginação.
- **Correção de XSS em studios/tags** — escape no detalhe e nos inputs do form.
- **Roteamento hash com guard** — mapa de rotas + redirecionamento de sessão.

## Em desenvolvimento

- **Filtro de Type no componente Kanban** — a assinatura aceita o filtro, mas o efeito real vive em `views/status.js`; código do componente desconectado.
- **Loading do "Carregar mais" no Watch Next** — o loader procura `#load-more`, mas a view usa `#load-more-watch-next`.
- **Formulário fora do padrão Page+View** — `views/form.js` monta a sidebar na mão e o "Cover URL" inicia vazio na edição.
- **Debug remanescente** — `console.log` em `components/kanban.js`.

## Em pausa

- **Drag-and-drop no Kanban** — o README descreve cards arrastáveis, mas não há DnD nem `PATCH /:id/status` no front.
- **Documentação `ANALISE_PROJETO.md`** — criada no commit `60854e1` e revertida em `5027d6c`; o `AGENTS.md` ainda a referencia.

## Pode ser útil

- **Dashboard/Home** — total, por status/tipo, média de rating e "concluídos no ano".
- **Estatísticas e gráficos** — visualizações da coleção.
- **Filtros combinados na listagem** — o backend já aceita `status`, `studios` e `tags`; falta UI.
- **Ordenação** — por nome, rating ou data de início.
- **Toasts + confirmação customizada de delete** — substituir `alert()`/`confirm()`.
- **Componentes novos** — toast, modal, loading/skeleton, empty state, error state.
- **Upload de capa via CDN** — Cloudinary no lugar do base64 no body.
- **Lazy loading de imagens + skeletons** — `loading="lazy"` nos cards.
- **Cache de options/lista e estado por página** — hoje `state.items` global pode vazar entre rotas.
- **Testes (Vitest/happy-dom) e lint/format** — não há `npm run lint`/`test`.
- **Carregar html2canvas só na rota `/poster`** — hoje é carregado globalmente.
- **Remover os globals de `window`** — 9 funções via event delegation.
- **Roadmap** — TypeScript progressivo, PWA/off-line, modo claro, notificações de novos episódios, integração TMDB/MAL, compartilhamento de lista.
