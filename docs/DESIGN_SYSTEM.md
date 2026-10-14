# Design System

## 1. Direção de design

#### Estilo:

Tema escuro utilitário (Tailwind) com cards de capa como herói e sidebar fixa à direita.

#### Humor:

"Noturno e direto" — tela escura para o conteúdo (capas coloridas) contrastar; sem decoração, sem sombra: borda e fundo separam camadas.

#### Princípios de design:

- Tailwind primeiro: utility classes para layout/estado; só o que não existe em utility vira classe custom (`kebab-case`/BEM) em `src/assets/style/style.css`.
- Fundo único `#0a0a0a` em todo o app; profundidade por borda (`border-zinc-700/800`, `hover:border-white`) e por overlay do modal — **sem `box-shadow`**.
- Cor codifica estado: o status do item é a única cor "de conteúdo" (paleta pastel de status); o resto é escala zinc.
- Sidebar colapsável por toggle (não por breakpoint): o conteúdo desliza, a estrutura não quebra.

---

## 2. Marca

#### Nome do produto:

No Sleep Land

#### Logo:

Tipográfico no topo da sidebar (`.sidebar__logo`, texto "No Sleep Land"). Não há asset de marca vetorial.

#### Voz da marca:

pt-BR curto e funcional ("Carregando...", "Nenhum entretenimento encontrado"), com emoji como acento pontual ("Decida por mim! 🎲"). Erro em português, sem jargão técnico.

---

## 3. Paleta de cores

#### Fundo:

`#0a0a0a` (`body`, `.main-content`) — tema escuro fixo.

#### Superfície (sidebar, modal, dropdowns):

`#18181b` (zinc-900); variações zinc-800/700 para camadas internas.

#### Texto:

`#ffffff` (títulos/valores), `#d4d4d8` (zinc-300, padrão), `#a1a1aa` (zinc-400) e `#71717a` (zinc-500, secundário).

#### Borda:

`border-zinc-700` / `border-zinc-800`; **hover** de card: `border-white` (destaque é borda branca, não sombra).

#### Estado ativo (filtros/botão selecionado):

`bg-white text-black` (alto contraste inverso); inativo: `text-zinc-300 bg-zinc-900`.

#### Cores de status (classes custom em `style.css`):

| Status | Fundo (coluna Kanban) | Texto variante `-itens` |
|---|---|---|
| Done | `#abcf85` (`.done`) | `.done-itens` `#abcf85` |
| Watching | `#97b4b2` (`.watching`) | `.watching-itens` |
| Plan to watch | `#b6ade4` (`.plan_to_watch`) | `.plan_to_watch-itens` |
| Dropped/Paused | `#fed271` (`.dropped_paused`) | `.dropped_paused-itens` |

#### Erro:

Sem token próprio: erro é texto/mensagem (`alert()`, `role="alert"` no login, toasts do poster).

#### Poster Maker (CSS isolado, custom properties):

`--color-bg: #d9d9d9` (área do pôster) — universo de cor próprio em `src/assets/poster/style.css`.

---

## 4. Tipografia

#### Fonte do app:

Fonte do sistema: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, …` (`style.css`, `body`).

#### Fontes Bebas Neue + Inter:

Carregadas no `index.html`, mas usadas **só pelo Poster Maker** (`.poster__title` = Bebas; `.poster-maker` = Inter). O `AGENTS.md`/README dizem "fontes Bebas Neue + Inter" — divergência conhecida: o app em si usa a fonte do sistema.

#### Escala:

Sem tokens próprios de tamanho/peso — Tailwind default + títulos por elemento. Números/contadores (Kanban) usam `font-semibold`/bold.

---

## 5. Espaçamento

#### Unidade base:

Escala do Tailwind (múltiplos de 4px): `gap-2/3/4/6/8`, `p-8` (área principal `.content-main`), `px/py-*` dos cards.

#### Observação:

Sem escala custom de espaçamento; valores arbitrários (`min-w-82`, `max-h-[calc(100vh-200px)]`, `translate3d(-250px, 20%, 0)`) são exceções pontuais.

---

## 6. Raios de borda

#### Pequeno:

`rounded-sm` (Tailwind: 2px) — badges, inputs pequenos.

#### Médio:

`rounded` / `rounded-md` pontuais.

#### Grande:

`rounded-lg` (8px) — cards, botões, modal.

#### Observação:

O BEM custom (`.list_item`, `.sidebar`) nem sempre declara raio — o visual vem do Tailwind no template correspondente.

---

## 7. Sombras

Nenhuma. Não há classes `shadow-*` nem `box-shadow` nas listagens; profundidade = borda + `hover:border-white` + overlay do modal (`rgba(0,0,0,.8)`).

---

## 8. Botões

#### Primário / ativo:

`bg-white text-black` com `hover:bg-zinc-200` (ex.: filtro selecionado).

#### Padrão:

`text-zinc-300 bg-zinc-900` + hover de borda/fundo; ações secundárias são botões de texto ("Editar", "Deletar", "Voltar").

#### Destaque lúdico:

"Decida por mim! 🎲" (Watch Next).

#### Perigo:

"Deletar" — sem estilo vermelho próprio; protegido por `confirm("Tem certeza?")`.

#### Desabilitado:

`disabled:opacity-50` (ex.: botão de submit durante envio).

#### Sem componente de botão:

cada template declara as classes inline; seguir o padrão da tela vizinha.

---

## 9. Inputs

#### Padrão:

Tailwind nos inputs do form (`border`, fundo escuro, `focus:border-white focus:outline-none`).

#### Login:

`<label for>` + `required` + `autoComplete` (`email`/`current-password`); erro em `role="alert" aria-live="polite"`.

#### Autocomplete (estúdios/gêneros):

Componente próprio (`.autocomplete-*`): input + dropdown `<div>` + tags removíveis; `noOptionsText` equivalente em pt-BR.

#### Foco:

Do Tailwind (`focus:border-white`); **sem** `:focus-visible` custom global (pendência).

#### Erro:

`alert("Erro: …")` no form; mensagens inline no login; toasts no poster.

---

## 10. Cards

- Card da lista (`.list_item` + grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`): capa, nome, status (cor) e episódios (`Ep: X/Y`).
- Card do Kanban (`components/kanban.js`): coluna por status, cabeçalho com cor do status, contagem e itens clicáveis → detalhe.
- Grid de capas sem capa (`.noCover__grid`), modal (`.modal-overlay` + `.modal-content`, max-w 32rem) e toast (`.toast`) completam as superfícies.

---

## 11. Navegação

#### Sidebar (única navegação):

Fixa à **direita**, `width: 15rem`, `background: #18181b`, `z-index: 5`; visível com `.sidebar.visible` (`opacity: 0 → 1`) e o conteúdo desloca com `.main-moved` (`translate3d(-250px, 20%, 0)`, transição 0.3s).

#### Itens:

Logo + busca da sidebar (`#sidebar-search-input`, debounce 600ms com adapter por rota) + nav: **Lista, Status, Assistir Depois, Ghibli, Criador de Pôster** + **"+ Adicionar"** (só logado, não-guest) + rodapé **Sair/Login**.

#### Toggle:

Botão `☰` (`#btn-toggle-sidebar`) no topo da área de conteúdo — funciona em qualquer viewport.

#### Cabeçalho:

Não há header global; cada view monta seu cabeçalho dentro de `main-content` (título + filtros/ações).

#### Observação:

`#/noCover` **não** tem item na sidebar (só por URL).

---

## 12. Estados

#### Carregando:

`#loading` global com "Carregando..." (`views/content.js`); "Carregando itens sem capa..." no noCover; botão de paginação vira "Carregando...".

#### Vazio:

"Nenhum entretenimento encontrado." (lista), coluna Kanban vazia mostra "-", poster "Nenhum resultado encontrado".

#### Erro:

"Erro ao carregar listagem: …" / "Erro ao carregar mais: …" / "Falha ao carregar itens. Tente novamente." (watch-next) / "Erro ao carregar itens." (noCover) / `alert("Erro: …")` (form). Pendência: o Kanban (`pages/status.js`) não captura erro próprio — promise rejeitada deixa o loading preso.

#### Permissão (estados cheios):

"Você já está logado" · "Acesso Restrito" + "Como convidado, você apenas pode visualizar os itens." · "Acesso Negado" + "Você precisa estar logado para acessar esta página." · detalhe: "Convidado: apenas visualização".

#### Sucesso:

Sem feedback próprio: navegação para `#/list` (CRUD/login); toast só no poster ("Copiado!", envio).

#### Desabilitado:

`disabled:opacity-50` (ver "Botões").

---

## 13. Ícones

#### Biblioteca:

Nenhuma. Emojis como ícone funcional (`☰` toggle, `🎲` sorteio, `×` fecha modal, ⭐ nas notas) e setas/seta de buscas em SVG inline pontuais.

#### Estilo:

Texto/emoji; sem sprite, sem lib de ícones.

---

## 14. Design responsivo

#### Mobile/Toggle:

Sidebar colapsável por botão em qualquer largura (**`style.css` não tem media query** — o colapso é por classe, não por breakpoint).

#### Grids:

Tailwind: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (lista); `md:`/`lg:` também em watch-next e form.

#### Kanban:

`overflow-x-auto` com colunas `min-w-70` (rolagem horizontal em telas estreitas).

#### Poster:

Único CSS com media queries: `@media (max-width: 1024px)` e `(max-width: 768px)`.

#### Breakpoints:

- Mobile: até 768px (`md:` = 768px, poster 768px)
- Tablet: 768–1024px (`lg:` = 1024px, poster 1024px)
- Desktop: acima de 1024px

#### Pendências:

`.main-moved` desloca o conteúdo 250px e 20% para baixo sem media query; em telas pequenas o `padding-right: 2rem` fixo e o toggle cobrem o topo.

---

## 15. Acessibilidade

Presente:

- `index.html` com `lang="pt-BR"`, meta description, viewport.
- Login: `label for`, `autocomplete`, `required`, erro com `role="alert" aria-live="polite"`.
- Poster: `label for` em todos os campos, toast `role="status" aria-live="polite"`.
- `alt` em imagens ("Capa", "Prévia da capa", "Pôster") + fallback `onerror`.
- Controles são `<button>` reais com `type` correto e `disabled`.
- Contraste do tema escuro (fundo `#0a0a0a`, texto branco); `focus:border-white` nos inputs.

Pendências (registradas para não virar regra):

- Nenhum `aria-*` fora de login/poster: nav da sidebar sem `aria-label`, toggle só com emoji (sem texto acessível), sem `aria-expanded`/`aria-controls`.
- Autocomplete: dropdown `<div>` sem `role="listbox"/"option"`, sem navegação por teclado; tags removíveis só por mouse.
- `.sidebar` com `opacity: 0` ainda **focável** pelo Tab quando oculta; sem skip link, sem `:focus-visible` custom.
- Modal do sorteio: sem `role="dialog"`, sem trap de foco, sem fechar por `Esc`/overlay (só o `×`).
- Labels do form principal sem `for`/`id` (associação implícita).
- Contraste de risco: cabeçalho de coluna do Kanban herda texto branco sobre os fundos pastel (`#abcf85`, `#b6ade4`…) — provável ratio < 4.5:1.
- Bug de classe: o contador do Kanban recebe `other-itens` inexistente (`kanban.js:52` indexa array) → as cores `-itens` nunca aplicam.
- Sem `prefers-reduced-motion`; sem `aria-live` em loading/erro das listas.
