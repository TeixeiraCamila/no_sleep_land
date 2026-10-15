# UX Flows

Jornadas reais do usuário, passo a passo, conforme o código implementado hoje. É a referência do que a tela deve fazer em cada estado (carregando, vazio, erro, permissão).

Rotas: `src/router.js` (hash router, `route_map`). Regras visuais: `DESIGN_SYSTEM.md`.

---

## Fluxo 0 — Boot e guard

1. `index.html` carrega `/src/main.js` → `DOMContentLoaded` → `Alpine.start()`, `init_toggle_sidebar()`, `init_router()`.
2. `init_router()` roda `await validate_session()`: se existe `session.token`, chama `GET /api/auth/me`; falhou → `persist_session()` (limpa tudo) e segue para o guard.
3. Guard do router: sem sessão (`!is_authorized()`) e rota ≠ `#/login` → `window.location.hash = "/login"`; logado em `#/login` → `#/list`.
4. `handle_hash_change()` renderiza a rota → `setup_sidebar_search()` liga a busca da sidebar.

Rota desconhecida:

- **Não existe tela 404**: fallback silencioso para a listagem (`router.js` cai no `route: "list"`). Se a rota existe mas falta render function → `console.error` e a tela fica como estava.

---

## Fluxo 1 — Login (email + código)

Rota: `#/login`.

1. Já logado → a própria tela mostra "Você já está logado" + botões "Ver Lista"/"Sair".
2. Preenche **Email** e **Código de acesso** (`required`, `autoComplete` correto).
3. Submit vazio → "Preencha email e código para entrar."
4. `auth_api.login(email, codigo)` → `POST /api/auth/login` → `{ token, user }` → `start_session()` grava `SESSION_TOKEN` + `SESSION_USER` → `#/list`.
5. Erro → mensagem do backend na caixa `role="alert"` (ex.: **"O código não confere."** — rotas `/api/auth/*` ficam fora do redirete automático de 401).

Sucesso: entra na Lista com sidebar completa (+ Adicionar visível).

---

## Fluxo 2 — Modo visitante (guest)

1. Em `#/login`, botão **Visitante** → `start_guest_session()` → grava `IS_GUEST="true"` **sem token** → `#/list`.
2. Leitura normal (listagem, busca, filtro, detalhe, Kanban, watch-next).
3. Escrita some da UI: sidebar sem "+ Add"; `#/create`/`#/edit` mostram "Restricted Access" + "As a guest, you can only view items."; detalhe: "Guest: view-only" (sem Edit/Delete).
4. Tentativa por URL/direto: o wrapper de auth lança **"Você precisa entrar na sua conta para fazer isso."** antes do fetch; se chegar no backend sem token → `401` → limpa sessão e manda para `#/login`.

---

## Fluxo 3 — Logout

`handle_logout()` (botão "Sair" da sidebar ou tela "já logado") → `logout()` limpa token/user/guest → `#/list` (agora como sem sessão → guard leva ao login na navegação seguinte).

---

## Fluxo 4 — Listagem (`#/list`)

1. `Promise.all([fetch_items({search, pageSize: 24}), options_api.get()])` → falha: "Erro ao carregar listagem: …".
2. Loading global "Carregando..." escondido ao render; shell da lista montado com os **filtros de status** injetados antes do `#list-container` (`String.replace` — explicado em `docs/filtros.md`).
3. Grid de cards: capa, nome, status (cor), avaliação, episódios, data de início.
4. **Busca** (debounce 300ms): digitar muda a hash para `#/list/search=<termo>` → refetch **server-side**; `#clear-search` volta para `#/list`.
5. **Filtro de status**: cliques delegados em `[data-status]` → re-render só do `#list-container`; `""` = "Todos" (sem filtro). É **client-side** (sobre o que já carregou) e sobrevive a paginação e busca.
6. **"Carregar mais"**: paginação por cursor (`nextCursor`) com append em `state.items`; botão vira "Carregando..."; falha: "Erro ao carregar mais: …".

Vazio: "Nenhum entretenimento encontrado."

---

## Fluxo 5 — Detalhe (`#/detail/:id`)

1. `GET /api/entertainment/:id` → `render_detail_content(item, logged_in, guest)`; erro → "Erro: …" na área de loading.
2. Mostra capa grande no topo (se houver; some se a URL falhar), **Progresso** (fórmula do Notion, ex.: "▰▰▰ 42%") logo após os episódios, **Plot** (sinopse) no fim do card, e todos os campos, estudios e gêneros/tags. Cada bloco só renderiza se o campo existir (o mapper apaga vazios).
3. Botões **Edit** (`#/edit/:id`) e **Delete** aparecem só para `logged_in && !guest`; guest vê "Guest: view-only"; sem sessão, "Sign in to edit or delete".
4. **Deletar** → `confirm("Tem certeza?")` → `DELETE /:id` (soft delete no backend) → `#/list`.

---

## Fluxo 6 — Criar (`#/create`) e Editar (`#/edit/:id`)

1. Guard: guest → "Restricted Access"; sem sessão → "Access Denied" + botão "Sign In".
2. `Promise.all([options_api.get(), (edição) entertainment_api.get(id)])`.
3. Form montado com **Alpine.js** (`x-data` com `status`, `type`, `episodesSeen`, `episodes`):
   - Criação nasce com Status `Plan to watch` (default defensivo: só se a opção existir em `options.Status`); edição mantém o valor existente e o placeholder "Selecione..." permanece.
   - Tipo `Filme` (`x-show`) **esconde** Episódios Assistidos e Total de Episódios (valores ainda são forçados a 1 pelo `x-init`/`$watch('type')` e seguem no `FormData`); nos demais tipos nascem em `0` (edição preserva o valor existente).
   - Status `Done` (`x-show`) **mostra** Nota + Obs (textarea "Justifique a nota...") e Data Fim.
   - Status `Watching` (`x-show`) **mostra** Episódios Assistidos e Data Início (valores são preservados ao esconder — `x-show` não remove do `FormData`).
4. Autocomplete múltiplo para **Estúdios/Streaming** e **Gêneros/Tags** (dropdown filtra, "+ Adicionar" cria valor novo; tags em `<input type="hidden">` no FormData).
5. Preview de capa por URL (`handle_cover_preview`; URL inválida → "URL inválida" + fallback); na edição o campo inicia preenchido com a capa existente.
6. Gerador de pôster embutido (`components/poster_maker.js`): botão "🎬 Generate poster" ao lado do campo Nome revela a ferramenta no bottom do form, pré-preenche busca/título com o valor do Nome e rola até ela (`scrollIntoView`); busca OMDB → preview → download PNG ou upload Cloudinary que **auto-preenche a URL da Capa**; a seleção na busca OMDB também **auto-preenche o campo Plot** com a sinopse (`plot=full`; callback `on_details`).
7. Submit monta `{ name, status, type, rating, obs, date: {start, end}, nacionalidade, episodesSeen, episodes, plot, coverUrl, studios[], tags[] }` → `create` (POST) ou `update` (PATCH) → `#/list`. Valor vazio não é enviado (não limpa campo existente no Notion).
8. Erro → `alert("Erro: " + error.message)` (mensagem pt-BR do backend).

Estados: campos de data podem virar `null` (pré-processador do backend converte `''` → `null`); episódios chegam como string e o Zod converte em inteiro.

---

## Fluxo 7 — Kanban (`#/status`)

1. `Promise.all([fetch_all (/all), options_api.get()])` — **sem try/catch na page**: falha derruba a promise e o loading fica preso em "Carregando..." (pendência conhecida).
2. Colunas = todas as opções de `Status` (mesmo vazias: "0" e "-"), agrupadas por `status`; cor da coluna vem das classes de status.
3. **Filtro de tipo** no shell (client-side) + busca local da sidebar (adapter `register_search_adapter("status", …)` combinando tipo + nome).
4. Clique no card → detalhe.

**Sem drag-and-drop**: status muda só pelo formulário de edição (o README promete "cards arrastáveis" — divergência registrada no PRD §12).

---

## Fluxo 8 — Assistir Depois (`#/watchNext`) + sorteio

1. `GET /api/entertainment?status=Plan to watch` (server-side, `pageSize: 24`, "Carregar mais").
2. Busca da sidebar navega `#/watchNext/search=<termo>`.
3. **"Decida por mim! 🎲"** → sorteia um item de `state.items` → modal `#random-modal` → clique no item → `#/detail/:id`; `×` fecha.
4. Erro: "Falha ao carregar itens. Tente novamente."

---

## Fluxo 9 — Itens sem capa (`#/noCover`)

1. `list_all()` → view filtra `!item.coverUrl` → grid.
2. Loading: "Carregando itens sem capa..."; erro: "Erro ao carregar itens."
3. Sem link na sidebar (rota só acessível por URL — pendência de navegação no PRD).

---

## Fluxo 10 — Ghibli (`#/ghibli`)

1. `list({studios: "Ghibli", pageSize: 100})` + options em paralelo → Kanban em `#ghibli-container` (colunas por Status, rating escondido).
2. Busca da sidebar filtra localmente por nome; erro: "Erro: …".

---

## Fluxo 11 — Criador de Pôster (`#/poster`)

1. Resolve `VITE_OMDB_API_KEY`, `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET` — ausentes → toasts claros ("Chave OMDB não configurada (.env)", "Cloudinary não configurado (.env)").
2. Busca OMDB (debounce 300ms, filtro tipo movie/series/episode/all, requests paralelos) → seleção preenche o form.
3. **Pré-visualizar** → **Baixar** (html2canvas CDN, `scale: 2`, fundo `#D9D9D9`) → **Enviar** (Cloudinary, preset unsigned) → **Copiar** URL ("Copiado!").
4. Busca e upload exigem login: "Faça login para usar a busca de filmes." / "Faça login para fazer o upload do pôster."

---

## Checklist de estados por fluxo

| Fluxo | Loading | Vazio | Erro | Permissão | Sucesso |
|---|---|---|---|---|---|
| Boot | — | — | — | redirect `#/login` | rota atual |
| Login | botão desabilitado | — | caixa `role="alert"` | "Você já está logado" | `#/list` |
| Guest | — | — | — | "Restricted Access"/"Access Denied" | leitura liberada |
| Lista | "Carregando..." | "Nenhum entretenimento encontrado." | "Erro ao carregar listagem/mais: …" | — | grid |
| Detalhe | "Carregando..." | — | "Erro: …" | "Guest: view-only" | dados |
| Form | "Carregando..." | — | `alert("Erro: …")` | "Restricted Access"/"Access Denied" | `#/list` |
| Kanban | "Carregando..." (pode ficar **preso** em erro) | coluna "-" | não capturado | — | quadro |
| Ghibli | "Carregando..." | coluna "-" | "Erro: …" | — | quadro |
| Watch Next | "Carregando..." | — | "Falha ao carregar itens. Tente novamente." | — | lista/modal |
| noCover | "Carregando itens sem capa..." | grid vazio | "Erro ao carregar itens." | — | grid |
| Poster | debounce/busca | "Nenhum resultado encontrado" | toasts | "Faça login…" | download/upload/copy |
