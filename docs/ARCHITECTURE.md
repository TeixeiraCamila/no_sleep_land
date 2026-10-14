# Architecture

Este documento define como a aplicação é estruturada tecnicamente: onde cada coisa mora, como as partes conversam e por que essa arquitetura foi escolhida.

## 1. Visão geral do sistema

Três camadas, dois repositórios e uma dependência externa:

- **Frontend** (`no_sleep_land`): SPA Vanilla JS servida estaticamente na Vercel. Nunca fala com o Notion: todo acesso sai pela API.
- **Backend** (`notion_api`): API REST Express 5 serverless na Vercel. Único ponto que conhece a integration key do Notion do domínio **entertainment**; valida com Zod, autentica escritas, cacheia leituras e devolve JSON em pt-BR.
- **Banco** (`Notion`): um único database `| no sleep land |` no workspace Notion é a fonte única dos dados. Sem banco relacional.

O mesmo backend serve outros 3 frontends (`books`, `dashboard`, `finances`); o `no_sleep_land` é o cliente do domínio `entertainment`.

---

## 2. Padrão de arquitetura

Pattern:

SPA sem framework com padrão **Page + View** (front) + monolito modular por domínios no backend (serverless) + BaaS (Notion como CMS/banco).

Reason:

- Sem framework: app de páginas leves sem estado complexo o bastante para justificar React/Vue; Alpine.js cobre só a reatividade do formulário.
- Page + View separa **estado/lógica** (`pages/`) de **template** (`views/` em template literals), mantendo o código testável visualmente sem tooling.
- Serverless na Vercel sem servidor próprio; o Notion já era a fonte de dados dos projetos (adotar banco próprio criaria duas verdades).

---

## 3. Stack tecnológica

Frontend:

Vanilla JavaScript (ES6+, módulos ES), Vite 6 (alias `@/` — não usado, imports são relativos), Tailwind CSS v4 (`@tailwindcss/vite`), Alpine.js 3 (só no formulário), Fetch API nativa, hash router próprio, `localStorage` para sessão. `html2canvas` e Google Fonts via CDN no `index.html`.

Backend:

Express 5 (ESM), Zod, `@notionhq/client`, `node-cache`, `cors`, `dotenv`. Sem framework de testes (não existe; não adicionar workflow).

Database:

Um database Notion (`NOTION_ENTERTAINMENT_DATABASE_ID` aponta **direto** para o database, sem discovery de child databases — detalhe em `DATABASE.md`).

Autenticação:

`POST /api/auth/login` (email + código) → JWT HS256 (30 dias) assinado com `node:crypto`. Sessão em `localStorage` (`SESSION_TOKEN`, `SESSION_USER`, `IS_GUEST`) espelhada em memória em `services/api.js`.

Storage:

- Dados: Notion.
- Sessão: `localStorage` + espelho em memória.
- Cache de leitura: `node-cache` no backend (TTL 300s, prefixado `entertainment:*`). **Não existe cache no front** (cada rota refetcha).

Hosting:

- Front: Vercel (SPA com rewrite de hash routing — `dist/`).
- Backend: `https://notion-api-green.vercel.app` (`.env` aponta para produção).

Pagamentos / E-mail / Analytics:

Não se aplicam (sem telemetria por decisão de produto).

Outros serviços:

- API do Notion (rate limit ~3 req/s por integração).
- **OMDB** (busca de filmes/séries no Poster Maker; chave na URL).
- **Cloudinary** (upload do pôster; preset unsigned).
- CORS com allowlist: os 4 fronts na Vercel + `localhost`/`127.0.0.1` + `CORS_ORIGINS`.

---

## 4. Componentes do sistema

### Frontend

Responsabilidades:

- Renderizar listas, Kanban, detalhe e formulários; guardar estado no `store.js`.
- Sessão (login/guest/logout) e guards (router + wrapper de auth).
- Escapar todo dado de usuário contra XSS (`escape_html`) antes de interpolar em template literals.
- Espelhar limites de UI (guest sem escrita); a autoridade é o backend.

### Backend (`notion_api`, domínio entertainment)

Responsabilidades:

- Único ponto de conexão com o Notion; esconder a integration key.
- Validar entrada com Zod; filtros server-side (`search`, `status`, `studios`, `tags`).
- Autenticar escritas (`require_auth`); leituras são públicas.
- Proteger o rate limit do Notion (fila token bucket 3 req/s) e cachear leituras 300s.
- Padronizar erro em JSON pt-BR (`lib/errors.js`), sem stack na resposta.

### Database (Notion)

Responsabilidades:

- Fonte única dos dados, editável também na interface do Notion.
- Guardar opções (Status/Type/Nacionalidade/Rating/Studios/Genres) — **o schema do Notion é a fonte das opções** (`/options` lê os selects).
- Calcular a barra de progresso (propriedade `Progress` é **formula** do Notion).
- Aceitar soft delete (`archived: true`); não existe hard delete.

---

## 5. Diagrama de arquitetura

```text
Usuário
   ↓  HTTPS (hash router)
Frontend SPA no_sleep_land (Vercel)
   Router → Pages (fetch + state) → Views (template literals) → DOM
   Alpine.js (form) · store.js · guards síncronos
   ↓  REST JSON: /api/entertainment/* · /api/auth/*   (Fetch + Bearer)
Backend notion_api (notion-api-green.vercel.app, serverless)
   CORS allowlist → rate limiter (fila 3 req/s) → rotas
   → controller (Zod) → service (cache 300s) → mappers
   ↓  @notionhq/client
API do Notion
   ↓
Database "| no sleep land |"
   (Poster Maker ↘ OMDB + Cloudinary — chamadas diretas do browser)
```

---

## 6. Fluxo de dados

Leitura (ex.: listagem):

1. Router resolve `#/list` → `render_list_page()`.
2. `Promise.all([fetch_items({search, pageSize: 24}), options_api.get()])`.
3. `services/api.js` monta URL (`VITE_API_URL` + `/api/entertainment?…`), `Content-Type: JSON`, e `Authorization` se auth.
4. Backend: CORS → rate limiter → Zod da query → `build_filters` (Notion filters) → cache 300s (hit → direto; miss → Notion paginado).
5. Resposta `{ data, pagination }` → `state.items` → `views/list.js` renderiza o grid (escape em cada campo).

Escrita (ex.: editar item):

1. Form (Alpine) valida localmente o básico → submit monta o payload.
2. `auth_request(PATCH /api/entertainment/:id)` com Bearer; sem token → erro **antes** do fetch.
3. Backend: `require_auth` valida JWT → Zod update → `map_properties` → `pages.update` → `clear_cache('entertainment')`.
4. Resposta = DTO do item → front navega para `#/list` (refetch na próxima visita da rota).
5. Qualquer 401 no caminho → front limpa sessão e manda para `#/login`.

---

## 7. Estrutura do projeto

Frontend (`no_sleep_land/src`):

```text
src/
├── main.js              # entry: Alpine, toggle sidebar, handlers globais, registro de rotas
├── router.js            # hash router + guard + lazy rendering (route_map)
├── store.js             # estado global simples + handle_logout
├── constants.js         # chaves de localStorage, debounce, limites de imagem
├── services/api.js      # Fetch wrapper (request/authRequest) + endpoints
├── components/          # sidebar, kanban, pagination, itemCard
├── pages/               # lógica/estado: list, detail, form, login, status,
│                        #   noCover, watch-next, ghibli, poster
├── views/               # templates puros (template literals): mesmo nome das pages + content
├── utils/               # html, images, date, episodes, search, autocomplete, sidebar-search
└── assets/              # style/style.css · poster/style.css · img/
```

Backend (`notion_api`):

```text
server.js                     # entry, CORS, registro dinâmico de domínios
lib/
├── client.js                 # cliente Notion, cache global, limited_client_call
├── rateLimiter.js            # token bucket por domínio (3 req/s, com fila)
├── errors.js                 # hierarquia de erros + error_handler global
└── domains/
    ├── index.js              # registro + env vars por domínio
    ├── factory.js            # CRUD genérico (list/all/options/:id/create/update/remove)
    ├── shared/validation.js  # format_zod_error
    ├── entertainment/        # routes, controller, service, schema, mappers, doc.md
    │   └── backup/notion_export.json   # dump real do database
    └── auth/                 # login, JWT (token), require_auth
```

---

## 8. Regras de dependência

- O front não fala com o Notion: nenhuma chave ou chamada direta ao Notion fora do `notion_api`.
- Só `services/api.js` conhece `fetch` para a API; pages não fazem `fetch` cru — **exceção conhecida**: `pages/status.js` chama `/api/entertainment/all` com `fetch` direto (duplicação de camada, pendência).
- Toda escrita passa por `auth_request()`; o guard de UI é conforto, a segurança decide no `requireAuth` do backend.
- `views/` são funções puras (sem fetch, sem estado); `pages/` orquestram. Handlers que os templates usam via `onclick` são expostos em `window.*` (`main.js`).
- Dado interpolado em template literal **sempre** passa por `escape_html()`.
- Sem dependência nova sem combinar (hoje: Alpine + Tailwind; html2canvas por CDN).
- Identificadores próprios em `snake_case`; APIs/ids do ecossistema seguem a convenção deles (ver `CODE_STYLE.md`).

---

## 9. Decisões técnicas

### Decisão 1 — SPA sem framework (Vanilla + Alpine só no form)

Context:

App de listagem/detalhe/formulário com um usuário; queria peso mínimo e build simples.

Alternatives:

React/Vue/Svelte; Alpine.js em tudo.

Reason:

Vite + template literals resolvem o caso; Alpine cobre a reatividade pontual do form (condicionar campos ao status/tipo) sem custo de componente. Custo aceito: sem Virtual DOM (re-render manual por rota) e sem type-check (ver Código 2).

### Decisão 2 — Hash router + Page/View próprios

Context:

SPA estática em servidor sem configuração de rewrite de history API.

Alternatives:

`history.pushState` + server rewrite; lib de router.

Reason:

`window.location.hash` funciona em qualquer host estático sem config; `route_map` + guard em ~100 linhas. Custo aceito: URLs com `#` e fallback de rota desconhecida = listagem (sem 404 real).

### Decisão 3 — JWT stateless em localStorage (sem Axios)

Context:

Mesma Vercel com cold start; sem sessão em memória no servidor.

Alternatives:

Cookie/sessão server-side; refresh token.

Reason:

Fetch + header manual dispensam interceptor lib; guard síncrono lê o espelho em memória. Custo aceito: sem revogação, `localStorage` lível por XSS — mitigado por `escape_html()` + HTTPS + allowlist de CORS (ver `SECURITY.md`).

### Decisão 4 — Leitura cacheada só no backend (300s)

Context:

Notion limita ~3 req/s por integração e as listas paginam.

Alternatives:

Cache no front (staleTime); Redis.

Reason:

`node-cache` + fila de rate limit resolvem o gargalo uma vez para todos os clientes; o front refetcha por rota (simplicidade). Custo aceito: trocar de rota sempre custa um request (mitigado pelo cache do servidor). **Nenhum front usa TanStack/staleTime aqui** — não há camada de cache no cliente.

---

## 10. Considerações de desempenho

- Duas proteções no backend: cache 300s por combinação de query + fila token bucket (sem 429 em uso normal).
- `/all` pagina internamente (100/página) até o fim: com 282 itens é um punhado de chamadas ao Notion **na primeira vez** (depois cacheado 300s).
- Debounce no front: 300ms na busca da lista/poster, 600ms na sidebar — evita request por tecla.
- Paginação da lista usa cursor com "Carregar mais" (24/página) em vez de carregar tudo.
- Kanban/Ghibli/noCover usam `/all` (tudo de uma vez) — aceitável para a base atual; se crescer, o caminho é paginação ou filtro server-side.
- Imagens de capa: URL direta do Notion (sem proxy otimizador); `onerror` evita item quebrado.
- `html2canvas` com `scale: 2` gera PNG pesado — só sob demanda (poster).

---

## 11. Considerações de escalabilidade

- Front stateless (sem sessão no servidor) → escala horizontal na Vercel sem fricção.
- Gargalo é o Notion (3 req/s **compartilhados** entre os 4 frontends): mais tráfego = mais espera na fila, não erro.
- Cache em memória é por instância (cold start zera); se crescer, trocar por store externo é substituição local em `lib/client.js`.
- `/all` no Kanban não escala para milhares de itens; preparado: filtros server-side já existem (`status`, `studios`, `tags`), falta o front usá-los para o quadro.
- Base real: 282 itens (export de 2026-10-06) — ordem de grandeza tranquila.

---

## 12. Cenários de falha

Comportamento esperado em cada caso:

**Banco (Notion) indisponível:**

Service mapeia o erro (`map_notion_error`) → `error_handler` responde JSON pt-BR com status, sem stack (stack só no `console.error` do servidor). Front: mensagem na área de loading (ex.: "Erro ao carregar listagem: …"). Pendência: **o Kanban não captura erro** — promise rejeitada deixa "Carregando..." preso.

**Rate limit do Notion estourado:**

A fila do bucket absorve enquanto a taxa sustentar; fora dela → `429` "Limite de requisições atingido, tente novamente". Front: vira mensagem de erro genérica (sem retry).

**Request pendurada / timeout:**

Não há `AbortController`/timeout no Fetch nem timeout ao Notion no backend: a promise espera o browser/edge dencer. Pendência documentada; definir timeout é decisão futura.

**Serviço terceiro (OMDB/Cloudinary) falhar no Poster:**

Toasts próprios ("Erro na busca", "Falha no envio: …"); o restante do app não é afetado (só o poster usa essas chaves).

**Autenticação falhar:**

- Sem sessão → guard do router manda para `#/login`.
- Token expirado → `validateSession()` no boot detecta (`GET /api/auth/me`) e limpa; em runtime, **qualquer 401** fora de `POST /api/auth/login` limpa a sessão e redireciona para `#/login`.
- Código errado no login → `401` com a mensagem do backend exibida no formulário (login fica fora do redirete automático).
- Rotas de auth ausentes (envs `AUTH_*` não configuradas) → `/api/auth/*` não é registrada → 404 "Rota não encontrada".

**Origem bloqueada pelo CORS:**

403 `"Bloqueado pelo CORS: Domínio não autorizado"`; allowlist fechada (4 fronts + localhost).

**Rota desconhecida no front:**

Fallback silencioso para `#/list` (sem tela 404).

**Erro não capturado em página:**

`pages/status.js` (Kanban) é o único fluxo sem tratamento de falha de fetch — registrado como pendência em `UX_FLOWS.md` e `PRD.md` §12.
