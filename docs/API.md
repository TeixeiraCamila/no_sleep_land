# API

Fonte da verdade dos contratos de API consumidos por este frontend. Backend: `notion_api` (repositório irmão, domínio **entertainment**).

Base URL:

`VITE_API_URL` (produção: `https://notion-api-green.vercel.app`; fallback `""` de propósito — os caminhos já começam com `/api`, então o prefixo não é duplicado).

Autenticação:

`Authorization: Bearer <token>` aplicado em `auth_request()` (`src/services/api.js`) para toda escrita. Leituras usam `request()` (público). O login é a única chamada de auth que **não** dispara o redirete de 401.

> Erros chegam em pt-BR (regra); o front exibe `message` como está (`error_data.message`) e nunca traduz mensagem de terceiro.

---

## 1. Endpoints usados pelo front

| Método | Path | Auth | Uso no front |
|---|---|---|---|
| GET | `/api/entertainment?pageSize&startCursor&search&status&studios&tags` | 🔓 | Lista (`pageSize: 24`), Watch Next (`status=Plan to watch`), Ghibli (`studios=Ghibli`, `pageSize: 100`) |
| GET | `/api/entertainment/all` | 🔓 | Kanban (`pages/status.js`), noCover |
| GET | `/api/entertainment/options` | 🔓 | Form e Kanban (opções de Status/Type/…) |
| GET | `/api/entertainment/:id` | 🔓 | Detalhe e edição |
| POST | `/api/entertainment` | 🔒 | Criar item (`pages/form.js`) |
| PATCH | `/api/entertainment/:id` | 🔒 | Editar item (**também é assim que o status muda**) |
| DELETE | `/api/entertainment/:id` | 🔒 | Arquivar (detalhe, com `confirm`) |
| POST | `/api/auth/login` | 🔓 | Login `{ email, codigo }` → `{ token, user }` |
| GET | `/api/auth/me` | 🔒 | `validateSession()` no boot |

Endpoints **disponíveis na API sem uso no front**:

- `PATCH /api/entertainment/:id/status` — troca dedicada de status (o front usa o `PATCH /:id` do form; ver §4).
- `GET /api/entertainment/finished-this-year?year=AAAA` — itens com `date.end` no ano; nenhum frontend do workspace consome.

Endpoints que **não existem mais**: `GET /api/users` — removido por segurança (exibia emails do workspace); chamada cai no 404 global. O `AGENTS.md` da raiz já registra a remoção; o README raiz do workspace ainda a cita (resíduo desatualizado).

---

## 2. Contratos principais

### POST /api/auth/login

Request:

```json
{ "email": "pessoa@exemplo.com", "codigo": "<AUTH_ACCESS_CODE>" }
```

Response `200`:

```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…",
  "user": { "id": "…", "name": "…", "email": "…", "avatar_url": "…", "nivel": "…" } }
```

Erros: `401` "O código não confere." | "Esse email não está no arquivo." · `400` Zod ("Informe o email.", "Informe um email válido.", "Informe o código de acesso.").

### GET /api/auth/me

🔒 · `200` `{ "user": { "id", "name", "nivel" } }` (payload do JWT). Token inválido/expirado → `401`.

### GET /api/entertainment (lista)

Query: `pageSize` (1–100, **default real 100** — o front manda 24), `startCursor` (cursor Notion), `search`, `status`, `studios`, `tags` (strings). **`type` não existe** como filtro (descartado em silêncio pelo Zod — o Kanban filtra tipo no cliente). Vários valores em `studios`/`tags` (separados por vírgula) viram **AND** (precisa ter todos).

Response `200`:

```json
{
  "data": [
    { "id": "3f0c7a2b-…", "name": "O Grinch", "status": "Plan to watch",
      "type": "FILMES", "episodes": 1, "episodesSeen": 1,
      "tags": ["Christmas"], "coverUrl": "https://…",
      "date": { "start": "2025-12-01", "end": "2025-12-25" },
      "studios": ["…"], "rating": "⭐️⭐️", "nacionalidade": "🇺🇸 USA",
      "createdTime": "…", "lastEditedTime": "…" }
  ],
  "pagination": { "pageSize": 24, "hasMore": true, "nextCursor": "eyJ…" }
}
```

Notas:

- Campos vazios **não aparecem** no JSON (sem `coverUrl` ⇒ sem a chave; `[]` some).
- Sem `sort` configurado → ordem padrão do Notion.
- `search` → `Name contains` (server-side).

### GET /api/entertainment/all

Response `200` `{ "data": [ … ], "total": 282 }` — pagina internamente (100/página) até o fim e **descarta itens cujo título virou "Sem título"** (só aqui; o `list` normal os mantém). Query params são ignorados.

### GET /api/entertainment/options

Response `200` (objeto plano; chave = propriedade Notion):

```json
{
  "Nacionalidade": ["🇰🇷 South Korea", "…"],
  "Studios/Streaming": ["Wit Studio", "Netflix", "…"],
  "Status": ["Dropped/Paused", "Plan to watch", "Watching", "Done"],
  "Type": ["SERIES", "DORAMA", "ANIME", "BL", "FILMES"],
  "Genres/Tags": ["Action", "Drama", "…"],
  "Rating": ["🫰", "💤", "🦝", "⭐️⭐️⭐️⭐️⭐️", "…"]
}
```

O front lê `Status`, `Type`, `Nacionalidade`, `Rating`, `Studios/Streaming`, `Genres/Tags` (acesso defensivo minúsculo/maiúsculo). A propriedade `Quest` foi removida do banco (não aparece mais aqui).

### GET /api/entertainment/:id

Response `200`: **DTO puro** (sem envelope). Id inexistente → `404` "Entretenimento não encontrado".

### POST /api/entertainment

🔒 · `201` · DTO puro. Corpo (payload real de `pages/form.js`):

```json
{ "name": "Título", "status": "Watching", "type": "ANIME",
  "rating": "⭐️⭐️⭐️", "date": { "start": "2026-01-10", "end": null },
  "nacionalidade": "🇯🇵 Japan", "episodesSeen": "5", "episodes": "12",
  "plot": "Sinopse vinda da OMDB…",
  "coverUrl": "https://…", "studios": ["MAPPA"], "tags": ["Action"] }
```

Notas: `name` é obrigatório (`Nome é obrigatório`); `episodes*` podem chegar como string (pré-processador converte; `''` → `null`); `date` aceita `{start, end}` ou string; campos desconhecidos são descartados.

### PATCH /api/entertainment/:id

🔒 · `200` · DTO puro. Mesmo schema do create com campos opcionais. `''`/`null` **limpa** a propriedade. PATCH vazio → `500` "Nenhuma propriedade válida para atualizar" (sem `code`).

### PATCH /api/entertainment/:id/status

🔒 · `200` · DTO puro. Corpo **estrito**: só `status`.

```json
{ "status": "Done" }
```

- Outra chave no corpo → `400`: `Esta rota aceita apenas o campo "status". Recebidos: foo. Para outros campos, use PATCH /api/entertainment/:id.`
- Valor fora do schema → `400`: `Status inválido: "Foo". Valores aceitos: Dropped/Paused, Plan to watch, Watching, Done` (validação **dinâmica**, lida do Notion).
- `status: null` → `400` "Status é obrigatório" (nullable proibido de propósito).
- **O front não usa esta rota hoje** — o status muda pelo `PATCH /:id` do formulário.

### DELETE /api/entertainment/:id

🔒 · `200` `{ "success": true, "id": "<page-id>" }` (soft delete / `archived`).

### GET /api/entertainment/finished-this-year?year=AAAA

🔓 · `year` obrigatório inteiro 1900–2100 (`Ano inválido`). Envelope diferente (sem `data`):

```json
{ "results": [ { "id": "…", "name": "…", "date": { "start": "…", "end": "…" } } ],
  "has_more": false, "next_cursor": null, "total_count": 124, "year": 2026 }
```

`next_cursor` aqui é **offset numérico em string** (não é cursor Notion). Sem uso no workspace.

---

## 3. Formato de erro

Dois formatos — o front só consome `message`:

**(a) Via error_handler global** (401, 404, 429, 500, CORS):

```json
{ "error": "NotFoundError", "message": "Entretenimento não encontrado", "code": "NOT_FOUND" }
```

Códigos: `VALIDATION_ERROR`, `NOT_FOUND`, `AUTHENTICATION_ERROR`, `FORBIDDEN`, `RATE_LIMITED`, `NOTION_ERROR`, `INTERNAL_ERROR`. Stack **nunca** vai na resposta.

**(b) Erro de validação Zod** (devolvido direto pelo controller, **sem `code`**):

```json
{ "error": "Erro de validação", "message": "Nome é obrigatório",
  "details": [ { "path": "name", "message": "Nome é obrigatório" } ] }
```

Exceções conhecidas:

- 404 de rota inexistente (ex.: `/api/users`) → `{ "error": "Rota não encontrada", "message": "…", "availableRoutes": […] }`.
- CORS bloqueado → `403` `{"error":"Error","message":"Bloqueado pelo CORS: Domínio não autorizado"}`.
- `validation_error` vindo do Notion (ex.: id malformado) → mensagem **em inglês** do SDK.
- Update vazio → `500` "Nenhuma propriedade válida para atualizar" **sem `code`** (Error puro, não AppError).

---

## 4. Regras da API

- Validar toda entrada (Zod no backend; o form do front só dá conforto).
- Toda escrita com `Authorization: Bearer` (`require_auth`); leituras públicas por decisão de app pessoal.
- Envelopes inconsistentes **por recurso** (aprender, não uniformizar sem decisão): lista `{data, pagination}`, `/all` `{data, total}`, `/options` objeto puro, `/:id` DTO puro, `/finished-this-year` `{results, …}`.
- Params desconhecidos são descartados em silêncio (Zod strip) — não servem como feedback de erro (ex.: `type=` na lista "funciona" mas não filtra).
- Filtro `studios`/`tags` com vírgula = **AND**, não OR.
- Rate limit (~3 req/s, por integração) absorvido por fila no backend; mutações derrubam `clear_cache('entertainment')`.
- `GET /api/users` não existe (removido por segurança) — não recriar nem documentar como existente.

---

## 5. Quando a API muda

| Mudança | Atualizar |
|---|---|
| Rota nova/alterada | este arquivo + `src/services/api.js` + page correspondente |
| DTO novo/removido | este arquivo + `DATABASE.md` + views (`list`, `detail`, `form`) |
| Opções do schema (Status/Type/…) | `DATABASE.md` (o `/options` muda sozinho; o front não fixa listas) |
| Formato de erro | este arquivo + `src/services/api.js` (`error_data.message`) |
| Regra de negócio de status | este arquivo + `UX_FLOWS.md` (Kanban/form) |
