# Security Guidelines

Segurança é requisito de projeto desde o início. App pessoal (dono + visitante público), mas toda escrita é decidida no backend `notion_api`.

---

## 1. Autenticação

Authentication provider:

Própria, implementada no `notion_api` (`lib/domains/auth/*`) — email + **código de acesso** (`AUTH_ACCESS_CODE`), sem OAuth/fornecedor externo.

Methods:

- `POST /api/auth/login` `{ email, codigo }` → JWT **HS256**, 30 dias, assinado com `node:crypto`.
- Código comparado com `crypto.timingSafeEqual` **antes** de procurar o email (evita enumerar usuários do workspace).
- Validado contra `notion.users.list()`: só pessoa (`type === 'person'`) com email conferindo; bots não autenticam.
- `GET /api/auth/me` revalida no boot (`validateSession()`).

Session (front):

- `localStorage`: `SESSION_TOKEN`, `SESSION_USER`, `IS_GUEST` (`src/constants.js`), espelhados em memória em `services/api.js` para guards síncronos (`isLoggedIn`/`isGuest`/`isAuthorized`).
- **`GET /api/users` não existe mais** (removido por segurança): o navegador nunca viu a lista de usuários nem o código, só o token.

Guards:

- Router: sem sessão → `#/login`; logado em `#/login` → `#/list`.
- Wrapper `auth_request`: sem token → `Error("Você precisa entrar na sua conta para fazer isso.")` **antes** do fetch.
- Runtime: **qualquer `401`** fora de `POST /api/auth/login` → `persist_session()` (limpa tudo) → `#/login`.

---

## 2. Autorização

Roles:

- **Dono/a** (logado): CRUD completo.
- **Visitante** (guest, `IS_GUEST=true`, sem token): somente leitura.
- Sem RBAC/papéis adicionais (fora de escopo no PRD).

Permissions:

### Leitura (pública)

- Todas as `GET` de entertainment são públicas **por decisão consciente**: a coleção é para ser mostrada ao visitante. Quem tem a URL lê.

### Escrita (protegida — dupla barreira)

1. **UI**: guest não vê "+ Adicionar", `#/create`/`#/edit` mostram "Acesso Restrito", detalhe esconde Editar/Deletar.
2. **Backend**: `require_auth` em `POST/PATCH/DELETE` → `401 Autenticação necessária` sem token válido — tentativa por URL morre aqui.

Authorization must be enforced server-side:

Sim: a autoridade é o `requireAuth` do backend; os guards do front são conforto de navegação.

---

## 3. Segredos

Rules:

- Nunca credencial hardcoded; nunca commitar segredo de produção; nunca expor segredo privado ao cliente.
- Variáveis de ambiente; rodízio de credencial comprometida; secret store do provedor (Vercel).
- A integration key do Notion vive **só no backend** (regra de dependência, `ARCHITECTURE.md` §8).

Segredos do backend (nunca no front):

- `AUTH_ACCESS_CODE`, `AUTH_JWT_SECRET`, `NOTION_ENTERTAINMENT_API_KEY`, `NOTION_ENTERTAINMENT_DATABASE_ID`.

Pendência herdada do workspace:

- Segredos do `notion_api` já passaram por histórico git (documentado em `notion_api/docs/auth.md`) → rodízio pendente; tratar ao mexer no backend.

---

## 4. Variáveis de ambiente

Public (entram no bundle Vite — visíveis no browser **por construção**):

- `VITE_API_URL` — base da API (URL pública, sem segredo).
- `VITE_OMDB_API_KEY` — chave da OMDB **exposta no cliente** (uso pessoal; aceito, mas implica quota em risco de terceiros).
- `VITE_CLOUDINARY_CLOUD_NAME` + `VITE_CLOUDINARY_UPLOAD_PRESET` — preset **unsigned** de propósito (upload direto do browser).

Private (só no servidor / painel da Vercel):

- `AUTH_ACCESS_CODE`, `AUTH_JWT_SECRET`, `NOTION_ENTERTAINMENT_API_KEY`, `NOTION_ENTERTAINMENT_DATABASE_ID`, `CORS_ORIGINS` (mais as envs dos outros domínios).

Rules:

- `.env` gitignored (o `.env.exemple` versionado traz só os nomes).
- **Nunca** criar `VITE_` com segredo de verdade (todo `VITE_*` é público).
- Se a quota da OMDB virar problema: mover a busca para proxy no backend (decisão futura, não mudança silenciosa).

---

## 5. Segurança de API

Input validation:

- Zod em toda rota do entertainment (`schema.js`): `pageSize` 1–100, `year` 1900–2100, `status` não-vazio, campos desconhecidos descartados; criação exige `name`.
- Pendência: `id` de path é `z.string()` (não `z.uuid()`) — id malformado chega ao Notion e volta com 400 em inglês.

Rate limiting:

- Fila/token bucket do backend (3 req/s por integração) protege o Notion, **não é anti-abuso de usuário** (nunca rejeita). Não há rate limit de login por tentativa — limitação aceita em app pessoal.

CORS:

- Allowlist fechada: 4 fronts na Vercel + `localhost`/`127.0.0.1` + `CORS_ORIGINS`. Fora → `403 Bloqueado pelo CORS: Domínio não autorizado`.

Authentication/Authorization:

- Header `Authorization: Bearer` em toda escrita; JWT verificado com `timingSafeEqual` + checagem de `exp`.

Corpo:

- Limite 10 MB (`express.json({ limit: '10mb' })`). Imagem de capa **não** passa pelo backend (URL ou Cloudinary direto).

---

## 6. Proteção de dados

Sensitive data:

- Coleção pessoal de entretenimento (hábitos); sem PII de terceiros, sem dado financeiro. Sem senha persistida (código de acesso só é comparado, nunca guardado).

Encryption:

- HTTPS em toda comunicação (Vercel front/back; Cloudinary/OMDB também HTTPS). JWT HS256 = integridade (payload é legível — não colocar dado sensível nele).

XSS (o risco principal deste app):

- **Todo dado de usuário passa por `escape_html()`** antes de interpolar em template literal (`utils/html.js`; commit "escapa studios e tags contra XSS").
- Valores interpolados em `onclick`/`data-*` também escapados.
- CSP não configurada (depende do host) — pendência se o app evoluir.

Retention / Deletion:

- Sem retenção definida; exclusão = soft delete (`archived`). Ver `DATABASE.md` §8.

Front:

- Token no `localStorage` é lível por XSS — aceito em app pessoal atrás de HTTPS, mitigado pelo escape sistemático (decisão registrada em `ARCHITECTURE.md`, Decisão 3).

---

## 7. Logging

Never log:

- Código de acesso, tokens JWT, integration keys, payloads completos de escrita, `VITE_OMDB_API_KEY`.

Log:

- Erros de API em dev: `console.error("[API Error]" | "[API Auth Error]", method, url)` (só método+URL, sem body/headers).
- Backend: eventos de auth e erros (`console.error` com stack **só no servidor**), "⚠️ CORS bloqueado para origem: …".

Front:

- Sem log estruturado; mensagens de erro vão para a UI (`alert()`, `role="alert"`, toasts). Marcadores visuais (✅ ❌ 🔍 ⚡ 📝) valem para logs do backend.

---

## 8. Upload de arquivos

Backend:

- **Não aceita upload**: corpo só JSON/FormData (10MB); nenhuma rota de arquivo.

Front (Poster Maker):

- Upload de pôster vai **direto do browser ao Cloudinary** (`POST https://api.cloudinary.com/v1_1/<cloud>/image/upload`) com preset **unsigned** — aceito: o preset é público por design e o bucket é do projeto.
- Validar tipo/tamanho antes de enviar é responsabilidade do front (hoje: enviar PNG gerado pelo html2canvas).
- **Upload de capa está morto**: `handle_cover_upload`/`compress_image` referenciam inputs que não existem no form (só há campo de URL) — código órfão; não é caminho ativo de dados (ver PRD §12).

Allowed / limits:

- Capa: apenas **URL** (validação de formato + fallback `onerror`).
- Pôster: PNG gerado localmente.

---

## 9. Checklist de segurança

- [x] Autenticação implementada (login email+código, JWT HS256 30 dias, `timingSafeEqual`)
- [x] Autorização server-side (`require_auth` em toda escrita)
- [x] Visitante somente leitura (UI + backend) — `GET /api/users` removido
- [x] Validação server-side (Zod em todas as rotas)
- [x] XSS: `escape_html()` em todo dado interpolado
- [x] Segredos do Notion só no backend; `.env` gitignored
- [x] CORS com allowlist fechada
- [ ] `VITE_OMDB_API_KEY` pública no bundle — **aceito** (revisar se a quota/conta importar)
- [ ] Rate limit de login por tentativa — **não existe** (aceito em uso pessoal)
- [ ] `id` de path sem `z.uuid()` — pendência no backend
- [ ] Modal/autocomplete sem atributos ARIA e sidebar `opacity:0` focável — pendências de acessibilidade (`DESIGN_SYSTEM.md` §15)
- [ ] Sem `Content-Security-Policy` configurada — depende do host
- [ ] Dependências revisadas (`npm audit` no fluxo de manutenção; não há lint automatizado)
