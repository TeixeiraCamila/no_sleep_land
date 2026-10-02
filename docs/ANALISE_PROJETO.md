# Análise Completa do Projeto: No Sleep Land

> Data da análise: 13/09/2026

---

## 1. Resumo Executivo

O `no_sleep_land` é uma SPA **sem framework (Vanilla JS)** para catalogar e gerenciar uma coleção pessoal de entretenimento (filmes, séries, animes, dramas). Os dados são persistidos no **Notion** via API própria (`backend__final`, domínio *Entertainment*).

**Stack:** Vite 6 + Tailwind CSS v4 + Alpine.js (só no formulário) + Fetch API + hash routing + localStorage.

**Pontos fortes ✅**
- Arquitetura clara **Page + View** (lógica vs. template) e boa separação de responsabilidades.
- Camada de API centralizada com wrapper Fetch e auth por header `Authorization: Bearer`.
- Constantes centralizadas (`constants.js`), utilitários puros (`utils/`) e componentes reutilizáveis já extraídos (`sidebar`, `pagination`, `kanban`, `itemCard`).
- Documentação razoável (`README.md`, `docs/COMPONENTES.md`, `docs/CRIAR_NOVA_VIEW.md`, `AGENTS.md` com padrões).
- Busca com debounce, paginação cursor-based e compressão de imagem client-side (Canvas).

**Principais problemas ❌**
- Bugs funcionais em páginas existentes (busca do Status quebrada, agrupamento Kanban perde itens sem status).
- Debug residual (`console.log`) e código morto.
- Risco de XSS em `views/detail.js` e dependência global do `html2canvas` no `index.html`.
- Erro de tratamento inconsistente, estado global mutável e 9 funções expostas em `window`.
- Documentação desatualizada (`CRIAR_NOVA_VIEW.md` não reflete o router atual).
- Zero testes e zero tooling de lint/format.

**Recomendação geral:** o projeto está numa base sólida e madura o suficiente para investir em (1) correção dos bugs críticos, (2) padronização de erros/eventos, (3) testes automatizados e (4) um conjunto de features de alto valor (dashboard, filtros combinados, drag-and-drop real no Kanban, toasts). Não há necessidade de reescrever o stack.

---

## 2. Visão Geral

### 2.1 O que o app faz

| Capacidade | Módulo(s) |
|---|---|
| Listagem paginada com busca server-side + debounce | `pages/list.js`, `components/pagination.js` |
| Quadro Kanban por status com busca local | `pages/status.js`, `components/kanban.js` |
| Detalhes + editar/arquivar (soft delete) | `pages/detail.js`, `views/detail.js` |
| Criação/edição com autocomplete multi-select e preview de capa | `pages/form.js`, `utils/autocomplete.js` |
| Login por usuário do Notion + modo visitante | `pages/login.js` |
| Watch Next ("Decida por mim" com modal de sorteio) | `pages/watch-next.js` |
| Itens sem capa | `pages/noCover.js` |
| Kanban filtrado por estúdio "Ghibli" | `pages/ghibli.js` |
| **Poster Maker:** gera poster, busca OMDB, exporta PNG e envia para Cloudinary | `pages/poster.js` (novo) |

### 2.2 Rotas mapeadas (`src/router.js`)

| URL | Rota | Page |
|---|---|---|
| `#/list` / `#/list/search=` | `list` | `renderListPage` |
| `#/detail/:id` | `detail` | `renderDetailPage` |
| `#/create` | `create` | `renderFormPage` |
| `#/edit/:id` | `edit` | `renderFormPage` |
| `#/login` | `login` | `renderLoginPage` |
| `#/status` | `status` | `renderStatusPage` |
| `#/watchNext` | `watchNext` | `renderWatchNextPage` |
| `#/ghibli` | `ghibli` | `renderGhibliPage` |
| `#/poster` | `poster` | `renderPosterPage` |
| `#/noCover` | `noCover` | `renderNoCoverPage` |

> Sem rota de fallback explícita: rota desconhecida cai em `list`.

### 2.3 Estrutura atual de pastas

```
src/
├── main.js              # Entry point (Alpine, globals, registerPages)
├── router.js            # Hash router + routeMap + auth guard
├── store.js             # Estado global (state) + handleLogout
├── constants.js         # Constantes centralizadas
├── services/api.js      # request/authRequest + entertainmentAPI/optionsAPI/usersAPI + guards
├── components/
│   ├── sidebar.js       # Navegação lateral + busca + login/logout
│   ├── kanban.js        # Colunas Kanban + cards
│   ├── pagination.js    # createPaginatedLoader ("Carregar mais")
│   └── itemCard.js      # Card reutilizável de item
├── pages/               # Lógica + data fetching + eventos
│   ├── list.js detail.js form.js login.js
│   ├── status.js noCover.js watch-next.js ghibli.js poster.js
├── views/               # Templates HTML (template literals)
│   ├── content.js (renderMain) list.js detail.js form.js login.js
│   ├── status.js noCover.js watch-next.js ghibli.js poster.js
├── utils/
│   ├── html.js images.js date.js episodes.js search.js autocomplete.js
├── assets/
│   ├── style/style.css            # Tailwind + custom
│   └── poster/style.css           # Estilos escopados do Poster Maker
└── test/                # (não existe ainda — proposto)
```

---

## 3. Análise de Arquitetura

### 3.1 Fluxo de dados

```
hashchange → Router → Page (fetch + state) → View (template literal) → innerHTML
                          ↕
                 services/api.js (Fetch + Bearer token)
                          ↕
            backend__final (Express + Notion CMS)
```

### 3.2 Avaliação por camada

| Camada | Avaliação |
|---|---|
| **Router** | Funcional e simples. Pontos fracos: sem `AbortController` (race condition em navegação rápida) e sem lazy-render dinâmico. |
| **Pages** | Padrão consistente (render template → buscam DOM → fetch → injetam conteúdo). Desvios: `form.js` quebra o layout padrão; `poster.js` foge bastante do padrão das demais páginas (necessário, mas deve ser isolado). |
| **Views** | Funções puras na maioria. Exceções: `form.js` monta sidebar manualmente. |
| **Store** | Objeto global mutável, sem eventos/isolamento. Razoável para o tamanho, porém propenso a "vazamento" de estado entre rotas. |
| **Services** | Bem projetados (wrapper centralizado, FormData detectado, erros normalizados). |
| **Components** | Já existem bons componentes (sidebar, kanban, pagination, itemCard). Faltam Loading, EmptyState, Toast e Modal. |
| **Utils** | Puras e reutilizáveis. `escapeHtml` e `compressImage` sólidos. |

### 3.3 Boas decisões a preservar

- ✅ Wrapper `apiRequest` único com `requireAuth`: evita repetição e centraliza o header `Authorization: Bearer`.
- ✅ Normalização de resposta da API (`itemsResponse.data || itemsResponse`, `optionsResponse.Status || optionsResponse.status`) em `status.js`/`ghibli.js`.
- ✅ Extração de `createPaginatedLoader`, `renderKanban`, `renderItemCard`: reduziu duplicação real.
- ✅ Guard de autenticação centralizado no router (`isAuthorized`, `isLoggedIn`).
- ✅ Utilitário `escapeHtml` aplicado consistentemente na maioria dos campos.
- ✅ Constantes de imagem/debounce centralizadas (único ponto de ajuste).

---

## 4. Estado de Qualidade: Bugs e Code Smells Confirmados

### 4.1 Bugs funcionais ❌

> Cada bug traz: **Sintoma → Como reproduzir → Causa raiz → Correção sugerida**.

---

**BUG 1: Busca local do Kanban de Status não filtra (ou filtra dados de outra página)**. Severidade: **Alta**

- **Sintoma:** o campo "Buscar..." da sidebar na página `#/status` não filtra os cards; em vez disso, mostra o conteúdo da **última lista visitada** (ex.: se veio de `#/list`, a busca filtra os itens da listagem; se abriu `#/status` direto, o Kanban fica vazio ao digitar).
- **Como reproduzir:** 1) abrir `#/status`; 2) digitar qualquer termo no campo de busca da sidebar; 3) o Kanban é re-renderizado com resultado errado/vazio em vez de filtrar os itens da tela.
- **Causa raiz:** em `pages/status.js` o fetch grava a lista apenas em `const items` (linha 32), mas **nunca** em `state.items`. O handler de busca (linha 54) filtra `state.items`, que por ser estado global compartilhado contém dados da última rota (definidos por `list.js:40`, `ghibli.js:27`, `watch-next.js:30` ou `noCover.js:31`).
- **Correção:** atribuir `state.items = items` após o fetch em `renderStatusPage` (linha ~33) **ou**, mais robusto, capturar `items` no closure do handler e filtrar a variável local em vez do estado global.

---

**BUG 2: Itens sem `status` somem do Kanban**. Severidade: **Alta**

- **Sintoma:** itens cujo campo `status` está vazio/indefinido não aparecem em nenhuma coluna do Kanban (Sumidouro de dados: não há erro visível, os itens apenas se perdem do quadro).
- **Como reproduzir:** 1) criar um item sem status (via API ou edição); 2) abrir `#/status`; 3) o item não aparece em coluna alguma.
- **Causa raiz:** em `components/kanban.js:19-36`, `uniqueStatuses` é um **`Set`**, e o fallback usa `uniqueStatuses[0]` (linhas 30 e 33). `Set` não suporta indexação, então `uniqueStatuses[0]` é sempre `undefined` e o branch `else` que deveria agrupar itens sem status **nunca executa**.
- **Correção:**
  ```js
  const grouped = items.reduce((acc, item) => {
    const key = item.status || "Outros";
    (acc[key] ||= []).push(item);
    return acc;
  }, {});
  ```

---

**BUG 3: Feedback de loading ausente no "Carregar mais" do Watch Next**. Severidade: Média

- **Sintoma:** ao clicar em "Carregar mais" em `#/watchNext`, o botão não muda para "Carregando..." (o texto permanece até o fetch terminar).
- **Como reproduzir:** 1) ir para `#/watchNext` com coleção com mais de 24 itens; 2) clicar em "Carregar mais"; 3) observar que o texto do botão não muda durante o carregamento.
- **Causa raiz:** `createPaginatedLoader` (`components/pagination.js:12`) procura o botão com `document.getElementById("load-more")` **fixo**. A view do Watch Next usa o id `#load-more-watch-next` (`views/watch-next.js:41`), então `loadMoreBtn` é `null` e o feedback é pulado.
- **Correção:** aceitar `buttonId` nas opções do loader: `createPaginatedLoader(fetchFn, renderFn, containerId, { buttonId = "load-more" })`.

---

**BUG 4: Formulário redereriza sidebar com estado errado de login**. Severidade: Média

- **Sintoma:** nas páginas `#/create` e `#/edit`, usuário autenticado vê o botão "Login" no rodapé da sidebar, o botão "+ Adicionar" desaparece e o "Blog" das demais páginas some.
- **Como reproduzir:** 1) logar; 2) abrir `#/create`; 3) observar a sidebar no estado deslogado.
- **Causa raiz:** `views/form.js:109` monta o layout manualmente com `renderSidebar(false, null)`: o parâmetro `loggedIn` é **hardcoded como `false`** e a página não usa o template base `renderMain()` (`views/content.js`).
- **Correção:** usar `renderMain(loggedIn, page, containerId)` como as demais views (o formulário já tem seu próprio container) e refletir `isGuest()` na sidebar.

---

**BUG 5: Campo "Cover URL" vazio no modo edição**. Severidade: Média (UX + risco de regressão de dado)

- **Sintoma:** ao editar um item com capa, o input "Cover URL" inicia **vazio** mesmo com a imagem aparecendo no preview abaixo. O usuário não sabe qual URL está salva e **não consegue remover a capa** pela UI.
- **Como reproduzir:** 1) abrir `#/edit/:id` de um item com `coverUrl`; 2) o campo URL está vazio; 3) tentar limpar a capa é impossível.
- **Causa raiz:** `views/form.js:157` fixa `value=""` no input em vez de `existingData?.coverUrl`.
- **Correção:** pré-preencher com `existingData?.coverUrl` (escapado) e, se for desejável remover a capa, um botão "Remover" que limpa o campo.

---

**BUG 6: Usuário visitante que loga continua sem permissões de escrita**. Severidade: **Alta (Auth)**

- **Sintoma:** quem entra como "Convidado" e depois faz login com usuário válido **continua sem permissão**: `#/create` mostra "Acesso Restrito", o botão de deletar não aparece no detalhe e o "+ Adicionar" some.
- **Como reproduzir:** 1) clicar "Convidado" na tela de login; 2) sem sair, navegar ao login como visitante (a tela de login continua acessível) e logar com usuário do Notion; 3) tentar acessar `#/create`.
- **Causa raiz:** `pages/login.js:55` grava `LS_LOGGED_USER` no submit, mas **não remove `LS_GUEST`**. Como `isGuest()` (services/api.js:151-153) lê `LS_GUEST === "true"` separadamente, o usuário fica **simultaneamente logado e visitante** (flag duplo), e todo o controle de escrita (`loggedIn && !isGuest()`) falha. `isLoggedIn()` e `isGuest()` não são mutuamente exclusivos.
- **Correção:** no fluxo de login com usuário, remover a flag de guest:
  ```js
  localStorage.setItem(LS_LOGGED_USER, user.id);
  localStorage.removeItem(LS_GUEST); // garante exclusividade logado x guest
  ```
  *(idealmente `isAuthorized()`/`isGuest()` deveriam derivar de uma única fonte.)*

---

**BUG 7: Campo de busca da sidebar inerte em 4 páginas**. Severidade: Média (UX)

- **Sintoma:** o input de busca da sidebar aparece em todas as páginas, mas **não faz nada** em `#/watchNext`, `#/noCover`, `#/detail` e `#/poster`.
- **Como reproduzir:** 1) abrir `#/watchNext`; 2) digitar um nome no campo "Buscar..."; 3) nada acontece.
- **Causa raiz:** `setupDebouncedSearch` só é registrado em `list.js`, `status.js` e `ghibli.js`. Nas demais páginas o elemento existe (vem de `renderSidebar`) mas sem listener.
- **Correção:** registrar um handler global na sidebar que navega para `/list/search=termo` (o app já suporta a rota com parâmetro), ou filtrar a lista ativa da página.

---

**BUG 8: XSS em estudios/tags na página de detalhes**. Severidade: **Alta (Segurança)**

- **Sintoma:** valores de `studios` e `tags` são renderizados cru; um valor contendo HTML/script seria interpretado pelo browser.
- **Como reproduzir:** item com `tags: ['<img src=x onerror=alert(1)>']` → ao abrir `#/detail/:id`, o payload executa.
- **Causa raiz:** `views/detail.js:61-62` interpolam `item.studios.join(", ")` e `item.tags.join(", ")` **sem** `escapeHtml` (o restante do template usa escape corretamente).
- **Correção:** `escapeHtml(item.studios.join(", "))` ou criar helper `renderListItems(values)`.

---

**BUG 9: Código morto: busca superior e botão "limpar busca" que não existem**. Severidade: Baixa

- **Sintoma:** `pages/list.js` procura `#search-input` (linha 25) e `#clear-search` (linha 27), que **não existem** no template atual (`renderList` → `renderMain` só tem a busca da sidebar). Os blocos `if (searchInput)` (linha 59) e `if (clearSearchBtn)` (linha 78) nunca executam.
- **Causa raiz:** remanescente de uma versão antiga da view com input no topo.
- **Correção:** remover o código morto (e decidir: ou documentar que a busca é só pela sidebar, ou reintroduzir o input superior na view).

### 4.2 Debug e código morto

| # | Arquivo:linha | Item |
|---|---|---|
| 7 | `components/kanban.js:38` | `console.log(statusGroups)` residual de debug. |
| 8 | `components/itemCard.js:7-14` | `dateDisplay`/`formatDate` computados, porém o marcador `${dateDisplay}` foi **removido** do markup: import e código mortos. |
| 9 | `components/kanban.js:3` | Import `renderEpisodes` nunca usado (o card usa markup inline). |
| 10 | `main.js:66-76` | `window.clearCoverUpload` definida globalmente mas **nunca referenciada** em nenhum template. |
| 11 | `pages/login.js:3` | Import `{ state }` não utilizado. |
| 12 | `package.json` | Sem scripts de `lint`, `format` ou `test`. |

### 4.3 Inconsistências

| # | Tema | Descrição |
|---|---|---|
| 13 | Idioma | Página Poster em **inglês** ("Search Movie", "No results found", "Generating..."), restante do app em pt-BR. Mensagens de erro divergentes (seção 4.4). |
| 14 | Erros | Formato diferente por página: `Erro: ${error.message}` (list/status/ghibli), "Falha ao carregar itens. Tente novamente." (watch-next), "Erro ao carregar itens." (noCover). |
| 15 | Nome de ids/classes | `-itens` mistura PT-BR com ids de status em inglês (`done-itens`, `plan_to_watch-itens`). |
| 16 | Docs | `docs/CRIAR_NOVA_VIEW.md` ainda descreve o router antigo (`else if parts[0]`) e util `debounce(fn)` que não existe mais; `docs/COMPONENTES.md` omite ghibli/poster e novos componentes. |
| 17 | Env | ~~Migração resolvida nesta revisão~~: chaves OMDB/Cloudinary movidas para o `.env` da raiz com prefixo `VITE_`, lidas via `import.meta.env`; `public/poster/.env` e `.env.exemple` foram removidos. |
| 18 | Duplicação de páginas | `ghibli.js` e `noCover.js` são filtros sobre listas, já unificados no template via `renderKanban`/`renderItemCard`; as rotas/pages ainda duplicam fluxo. |

### 4.4 Tratamento de erros atual (amostra)

| Página | Comportamento |
|---|---|
| list.js:51 | `loadingEl.textContent = "Erro: ${error.message}"` |
| status.js:66 | `loadingEl.textContent = "Erro: ${error.message}"` |
| ghibli.js:58 | idem |
| watch-next.js:44 | `"Falha ao carregar itens. Tente novamente."` |
| noCover.js:34 | `"Erro ao carregar itens."` |
| form.js:116 | `alert()` |

---

## 5. Análise de Segurança

| Risco | Arquivo | Recomendação |
|---|---|---|
| **XSS em detalhes** (studios/tags) | `views/detail.js:61-62` | Aplicar `escapeHtml` (ou helper `escapeList`) antes do `join`. |
| XSS no cabeçalho da coluna Kanban | `components/kanban.js:50` | Cabeçalho usa `${status}` sem escape; status vêm do servidor (risco baixo), mas escape é barato e preventivo. |
| `html2canvas` (lib de terceiros) global | `index.html:21` | Carregado via CDN em **todas** as páginas; idealmente dinâmico só na rota `/poster` como dependência npm e lazy import. |
| Chaves expostas no client | `pages/poster.js` | As chaves OMDB/Cloudinary são lidas do `.env` da raiz via `import.meta.env.VITE_*` (mesmo padrão de `VITE_API_URL` em `services/api.js`), portanto ficam no bundle. Mitigação atual: preset unsigned do Cloudinary. Para hardening: proxy server-side ou limitar pelo backend. |
| Token no `localStorage` | `services/api.js` | Quem roubar o `SESSION_TOKEN` usa a sessão até expirar (30 dias). Mitigação seria cookie HTTP-only, o que exige refatorar o backend. |

---

## 6. Análise de Performance

| Item | Situação | Melhoria |
|---|---|---|
| `listAll()` em Status/Ghibli/NoCover | Busca a coleção inteira a cada navegação, sem cache | Cache curto de `options` e itens; paginação no Kanban quando a coleção crescer. |
| Re-render por `innerHTML` do container inteiro | A cada "Carregar mais" o grid inteiro é reconstruído | Aceitável no volume atual; se crescer, usar fragmentos/append. |
| Fontes Google + html2canvas | Carregados em todo o app | Mover para lazy na rota Poster. |
| Imagens de capa | Sem `loading="lazy"` e sem skeleton | Adicionar `loading="lazy"` (perf de scroll em listas grandes). |
| Compressão de imagem | Sem limite de tamanho de arquivo de origem | Guardar por tamanho máximo (ex.: 10MB) antes de comprimir. |

---

## 7. Refatorações Necessárias (Priorizadas)

### 7.1 Críticas (fazer primeiro: bugs e segurança)

1. **Corrigir busca no Kanban de Status:** atribuir `state.items = items` em `pages/status.js` (ou, melhor, capturar `items` no closure do handler em vez de depender do estado global).
2. **Corrigir agrupamento de itens sem status** no Kanban: criar coluna fallback ("Outros") em vez de indexar `Set`:
   ```js
   const grouped = items.reduce((acc, item) => {
     const key = item.status || "Outros";
     (acc[key] ||= []).push(item);
     return acc;
   }, {});
   ```
3. **Remover `console.log`** residual (`components/kanban.js:38`) e código morto (itens 8-11 da seção 4.2).
4. **Escape em studios/tags** do detalhe (`views/detail.js`) e no cabeçalho do Kanban.
5. **Parametrizar id do botão** em `createPaginatedLoader({ buttonId })` para o Watch Next ter feedback de loading.

### 7.2 Médias (consistência e robustez)

6. **Padronizar tratamento de erros:** criar `utils/flash.js` ou `components/toast.js` com `showToast(message, type)` e substituir os `alert()`/`confirm()` + mensagens divergentes.
7. **Eliminar funções globais no `window`** (9 hoje): usar **event delegation** ou um módulo único `globals.js`. Sugestão: delegar via `data-action` e um listener central.
8. **Antecipar race conditions no router:** token de renderização/`AbortController` para que fetch de rota antiga não sobrescreva a rota nova (já feito isoladamente em `poster.js:392`).
9. **Formulário alinhado ao padrão:** usar `renderMain` e preencher `coverUrl` no modo edição; refletir estado de login/guest na sidebar.
10. **Unificar idioma:** pôr Poster em pt-BR (ou isolar como "ferramenta standalone" explicitamente bilíngue).
11. **Cache de `options`:** uma chamada evitável; cache de 5 min no módulo (evita refetch a cada vez que entra em Status/Ghibli/Form).
12. **Rodar estado por página em vez de `state.items` global:** ou ao menos `reset` do estado ao trocar de rota.

### 7.3 Baixas (polimento)

13. `formatDate` robusta para datas inválidas (retornar `""` em vez de "Invalid Date").
14. `compressImage` com guard de tamanho/tipo de arquivo.
15. Padronizar nomes de classes de status do Kanban (kebab-case, BEM) e remover `escapeHtml` desnecessário sobre números em `utils/episodes.js`.
16. ~~Concluído~~: chaves de env unificadas no `.env` da raiz com prefixo `VITE_` (padrão de `services/api.js`).
17. Atualizar `docs/COMPONENTES.md` e `docs/CRIAR_NOVA_VIEW.md` (padrão do router atual).
18. Adicionar scripts `lint` (ESLint) e `format` (Prettier): alinhar com padrão do `AGENTS.md`.

### 7.4 Matriz de esforço × impacto (refatorações)

| Item | Impacto | Esforço |
|---|---|---|
| Bug status-search (4.1-1) | Alto | Baixo |
| Bug guest-logado vira guest (4.1-6) | Alto | Baixo |
| XSS studios/tags (4.1-8) | Alto | Baixo |
| Kanban sem status (4.1-2) | Alto | Baixo |
| Padronizar erros/toasts | Alto | Médio |
| Remover globals de `window` | Médio | Médio |
| Cache de options | Médio | Baixo |
| Poster lazy-load | Médio | Baixo |

---

## 8. Componentizações Recomendadas

| Componente | Substitui | Descrição |
|---|---|---|
| `components/toast.js` | `alert()`/`confirm()`/mensagens de erro ad-hoc | Sistema de notificações não-bloqueante + confirmação customizada para delete. |
| `components/modal.js` | Modal manual do Watch Next (e futuro delete) | Reutilizável com overlay, esc e propagação de eventos. |
| `components/loading.js` | `loadingEl.textContent = ...` ad-hoc | Spinner/skeleton padronizado. |
| `components/emptyState.js` | Strings soltas ("Nenhum entretenimento encontrado.") | Estado vazio com ação sugerida (ex.: "Adicionar primeiro item"). |
| `components/errorState.js` | Blocos `catch` divergentes | Erro padronizado com botão "Tentar novamente". |
| `utils/dehydrate.js` / paginação por página | `state.pagination` global | Isolar paginação do estado global. |

---

## 9. Features Sugeridas (Priorizadas)

### 9.1 Alta prioridade (maior valor por esforço)

1. **Dashboard/Home (`#/home`):** resumo com contagem total, por status, média de rating, por tipo e lista "concluídos no ano". Fonte: `listAll()` + agregação local (uma chamada já usada por Status).
2. **Filtros combinados na listagem:** o backend já aceita `status`, `studios`, `tags` (`services/api.js:67-75`); falta apenas UI (chips/selects) na página list. Unifica também Ghibli e NoCover como filtros em vez de páginas separadas.
3. **Ordenação:** por nome, rating, data de início (client-side no modo "todos os itens" ou param no backend).
4. **Drag-and-drop real no Kanban:** mover card entre colunas faz `PATCH /api/entertainment/:id` com novo status (já existe `update`). Só uma lib leve (vanilla HTML5 DnD, sem dependência).
5. **Toasts + confirmação customizada de delete:** substitui `alert`/`confirm` e melhora UX e acessibilidade.
6. **Restringir ações do Poster ao usuário logado:** busca OMDB e upload Cloudinary exigem sessão (guest apenas visualiza).

> ✅ **Já implementado nesta revisão (item 6):** `pages/poster.js` recebe `isLoggedIn()` e `initPoster` bloqueia `searchMovies` e o upload com toast "Faça login para..." quando não há usuário logado. (Download e copy permanecem liberados.)

### 9.2 Média prioridade

6. **Busca global na sidebar em todas as páginas:** hoje só funciona em `list/status/ghibli`. Padronizar: sidebar sempre navega para `/list/search=termo`.
7. **Exportar coleção** (JSON/CSV) a partir de `listAll()`: útil para backup/portabilidade.
8. **Modo claro (light theme):** CSS custom properties em `style.css` para alternar tema (padrão já existe no Poster internamente).
9. **Lazy loading de imagens + skeletons** nos cards.
10. **Upload de capa via CDN** (Cloudinary unsigned) substituindo base64 no body: reduz payload e evita limite de tamanho.
11. **Cache/estado persistido:** lembrar último filtro/busca ao voltar (via `history`/`sessionStorage`).

### 9.3 Visão de longo prazo

12. **Testes automatizados** (seção 10): pré-requisito para refatorações maiores.
13. **TypeScript** (progressivo, começando por `utils/` e `services/`).
14. **Service Worker / modo off-line** + PWA.
15. **Auto-preenchimento com TMDB** no formulário (o Poster já demonstra o padrão com OMDB).
16. **Notificações de novos episódios** (posta x episódios vistos).
17. **Compartilhamento de lista** (URL com slug/feed).

---

## 10. Estratégia de Testes

Não existe nenhum teste hoje. Sugestão alinhada ao ecossistema Vite:

| Ferramenta | Função |
|---|---|
| **Vitest** | Runner + assertions (nativo do Vite) |
| **happy-dom** | Simulação de DOM |
| **@testing-library/jest-dom** | Matchers DOM |
| **msw** | Mock da API (service worker) |

**Alvos prioritários (unitários):**

- `utils/html.js`: `escapeHtml` (XSS, caracteres especiais, null/undefined) e `renderCoverImage`.
- `utils/date.js`: `formatDate` (ISO inválido, null, locale pt-BR), cobre o bug de "Invalid Date".
- `utils/episodes.js`: `renderEpisodes` (com/sem valores, fallback "?").
- `components/kanban.js`: `renderKanbanItems` (agrupa por status, itens sem status caem em "Outros"), cobre o bug #2.
- `components/pagination.js`: `createPaginatedLoader` (hasMore, cursor, erro).

**Integração:**

- `services/api.js`: `entertainmentAPI.list()` mockado, query params corretos.
- `pages/status.js`: busca local filtra itens corretamente, cobre o bug #1.
- `pages/login.js`: login de visitante remove a flag `LS_GUEST`, cobre o bug #6.
- `pages/poster.js`: busca e upload bloqueados sem `LS_LOGGED_USER`, liberados com usuário logado.
- `router.js`: hash maps para rotas e guard de auth.

**Setup sugerido:**

```json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run"
}
```

```js
// vite.config.js
test: { environment: "happy-dom", globals: true }
```

---

## 11. Roadmap Sugerido

**Fase 1: Estabilização (1 sprint)**
- Corrigir os 9 bugs funcionais da seção 4.1: prioridade para 1 (status-search), 2 (kanban), 6 (auth guest) e 8 (XSS); depois 3-5 e 7.
- Remover código morto e debug (4.2).
- Padronizar tratamento de erros (toast) e língua pt-BR.

**Fase 2: Estrutura (1 sprint)**
- Tooling: ESLint + Prettier + Vitest com os primeiros testes.
- Isolar estado por página; remover globals de `window`.
- Atualizar docs.

**Fase 3: Features de impacto (2-3 sprints)**
- Dashboard.
- Filtros combinados + ordenação na listagem.
- Drag-and-drop no Kanban.
- Lazy load do Poster (html2canvas, fontes) + unificar página como rota.

**Fase 4: Evolução**
- TypeScript progressivo, PWA/off-line, CDN para capas, integração TMDB.

---

## 12. Conclusão

O `no_sleep_land` tem **arquitetura sólida e código legível**, com decisões acertadas (Page+View, API wrapper, componentes reutilizáveis, constantes centralizadas). Os problemas encontrados são, em sua maioria, **bugs de tamanho médio e higiene de código**; a arquitetura permanece sólida, sem justificativa para reescrita.

A ordem recomendada é: **corrigir bugs críticos → padronizar erros/eventos → adicionar testes → implementar dashboard/filtros/drag-and-drop**. Com isso o projeto ganha confiabilidade para crescer as features de longo prazo (TypeScript, off-line, integrações externas) sem medo de regressões.