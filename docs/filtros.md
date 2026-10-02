# Features - no_sleep_land

Documentação detalhada das funcionalidades implementadas. Descreve o que foi **adicionado/alterado**, em **ordem de implementação**, e o **impacto em cada arquivo**.

## Resumo

Foram implementadas 3 alterações principais:

1. **Listagem (`/list`)** — Filtros de Status no topo (barra fixa no shell). Filtro client-side sobre itens acumulados via paginação.
2. **Kanban (`/status`)** — Colunas de Status completas (todas as colunas do schema, mesmo vazias). Usa `status_options` como fonte e preserva a ordem.
3. **Kanban (`/status`)** — Filtros de Type no topo (combina com busca local). Carrega **todos** os cadastros via `GET /api/entertainment/all`.

---

## 1. Filtros de Status na Listagem (`/list`)

### O que foi alterado/adicionado

| Arquivo | Alteração | Detalhes |
|---|---|---|
| `src/store.js` | **Adicionado** | `status_filter: null` — estado global do filtro de Status. `null = Todos`; `string = nome exato do status` (igual a `options.Status`). Preservado entre navegações. |
| `src/views/list.js` | **Alterado** | Assinatura de `render_list()` passou para `(logged_in, search_term = "", status_options = [], active_filter = null)`. Barra de filtros HTML (`.status-filters`) criada e **injetada ANTES de `#list-container`** via `replace()` do HTML retornado por `render_main()`. Filtros ficam no **shell** (fixos). `render_list_items()` **simplificado**: removeu completamente os filtros; agora retorna apenas grid de cards + botão "Carregar mais". Adicionado `escape_html` no import. |
| `src/pages/list.js` | **Alterado** | Importa `options_api`. Cria `apply_filter()` (filtra `state.items` por `item.status === filter`, ou retorna todos se `null`). Carrega `status_options` via `options_api.get()` **em paralelo** com primeira página (`Promise.all`). Inicializa `state.status_filter = state.status_filter ?? null` (não reseta entre buscas/navegações). Renderiza `render_list()` com `status_options` + `active_filter`. Adiciona **delegação de cliques** em `[data-status]` (atualiza **apenas** `#list-container` com `apply_filter()` + atualiza **apenas** classes ativas dos botões). **Wrapper de `window.load_more`**: acumula itens com `state.items = [...state.items, ...response.data]`, atualiza paginação e re-renderiza grid aplicando filtro ativo. Busca (`setup_debounced_search`) mantém filtro ativo. Removido uso do `create_paginated_loader` (não necessário com wrapper customizado). |

### Ordem de execução (passos detalhados)

1. **state.js**: adiciona `status_filter` ao estado global.
2. **views/list.js**: isola filtros no shell (injetados via `replace` antes de `#list-container`), separando shell (estático) de conteúdo dinâmico (`#list-container`).
3. **pages/list.js**: busca primeira página + `options.Status` em paralelo; define filtro inicial (preserva existente); renderiza shell com botões; popula grid filtrado; implementa delegação + `load_more` com acumulação + reaplicação do filtro.

### Comportamento
- Filtros **não somem** ao carregar mais, trocar filtro ou refazer busca (vivem no shell).
- Filtro **client-side** sobre todos os itens já carregados (via cursor). Paginação continua respeitando filtro ativo.
- Busca server-side (API) + filtro client-side funcionam juntos (filtro permanece).

---

## 2. Colunas completas no Kanban (`/status`)

### O que foi alterado/adicionado

| Arquivo | Alteração | Detalhes |
|---|---|---|
| `src/components/kanban.js` | **Alterado** | `render_kanban_items()` agora define `status_list` priorizando **`status_options`** (array vindo da API, preserva ordem exata do schema/Notion). Fallback: se `status_options` vazio/indefinido → usa status únicos presentes nos itens. Cria `status_groups` inicializando **todos** os elementos de `status_list` com `[]` (arrays vazios) — garante colunas vazias. Distribui itens **apenas** em grupos existentes (match exato `item.status`); não força fallback para coluna arbitrária. Renderiza iterando **`status_list.map()`** (não `Object.entries()`) para preservar ordem das colunas. Removido `console.log(status_groups)` (código morto). |

### Ordem de execução

1. Lê `status_options` recebido por parâmetro.
2. Monta `status_list` = `status_options` (prioritário) ou `unique_statuses` (fallback).
3. Inicializa todos os grupos vazios para `status_list` → **todas as colunas são criadas**.
4. Mapeia itens existentes → preenche apenas colunas correspondentes.
5. Renderiza em ordem de `status_options` (consistente com schema).

### Comportamento
- **Todas as colunas** definidas em `options.Status` aparecem, mesmo com `0` itens (contador `0`, placeholder `-`).
- Ordem das colunas segue exatamente `status_options` (ordem do Notion/schema).
- Não quebra compatibilidade caso `status_options` não seja enviado (fallback).

---

## 3. Filtro por Type no Kanban (`/status`)

### O que foi alterado/adicionado

| Arquivo | Alteração | Detalhes |
|---|---|---|
| `src/store.js` | **Adicionado** | `type_filter: null` — estado global do filtro de Type. `null = Todos`; `string = nome exato do Type` (igual a `options.Type`). Preservado entre navegações. |
| `src/views/status.js` | **Alterado** | Importa `escape_html`. `render_status()` passa a receber `(logged_in, type_options = [], active_filter = null)`. Cria barra de filtros HTML (`.type-filters`) com botões "Todos" + cada Type (com estado ativo). Insere filtros **ANTES de `#status-container`** via `replace()` no HTML retornado por `render_kanban()` → filtros ficam no **shell** (não sobrescritos). `render_status_items()` **sem alteração** (continua recebendo `(items, status_options)`) — preserva Feature 2 (todas colunas Status). |
| `src/pages/status.js` | **Alterado** | Importa `state`, `options_api`, `register_search_adapter`, `filter_by_name`. Adiciona `fetch_all_entertainment()` que chama **`GET ${VITE_API_URL}/api/entertainment/all`** (1 requisição, paginação automática no backend). Lê resposta aceitando `{ data: [...] }` ou `[...]`. Em `render_status_page()`: busca **TODOS os itens** (`/all`) + `options` (Status + Type) em `Promise.all`. Extrai `status_options` e `type_options` (defensivo: `Status`/`status`, `Type`/`type`). Salva `state.items = all_items`, limpa `state.pagination` (página sem paginação), define `state.type_filter = state.type_filter ?? null`. Cria `apply_type_filter()` (client-side por `item.type === filter`). Renderiza `render_status()` com shell de filtros. Registra `register_search_adapter("status", ...)` aplicando **Type + termo juntos**: base = `apply_type_filter()` → filtra por nome com `filter_by_name(base, term)`. Adiciona **delegação de cliques** em `[data-type]`: atualiza `state.type_filter`, lê termo de busca ativo (`#sidebar-search`/`#sidebar-search-input` ou `.search-input`), recalcula base (Type) + aplica `filter_by_name` se houver termo → re-renderiza `#status-container` com `render_status_items(filtered, status_options)`. Atualiza classes ativas dos botões de Type. |

### Ordem de execução (passos detalhados)

1. **store.js**: adiciona `type_filter`.
2. **views/status.js**: move filtros de Type para shell (antes de `#status-container`), mantém Kanban intacto.
3. **pages/status.js**: usa `/api/entertainment/all` para carregar **todos** os cadastros (sem loop no front). Carrega Status+Type. Renderiza shell com filtros de Type. Registra adapter combinando filtro de Type + busca local. Implementa delegação respeitando termo de busca ativo.

### Comportamento
- **Todos os cadastros** carregados de uma única vez (backend faz auto-paginação).
- Filtro por Type filtra **cards** dentro das colunas; **todas as colunas de Status permanecem visíveis** (Feature 2 mantida).
- Filtros por Type + busca local (`filter_by_name`) funcionam **combinados** (Type aplicado primeiro, busca por nome sobre resultado).
- Filtros fixos no shell (não sobrescritos por re-renderizações).
- `state.type_filter` é preservado entre navegações/retornos à página `/status`.

---

## Ordem global de implementação (resumo)

1. `src/store.js` — adiciona `status_filter`, `type_filter` (estado).
2. `src/components/kanban.js` — prioriza `status_options` para exibir todas colunas de Status.
3. `src/views/list.js` — move filtros de Status para shell, separa shell/conteúdo.
4. `src/pages/list.js` — implementa filtros de Status + wrapper de paginação com acumulação + delegação.
5. `src/views/status.js` — move filtros de Type para shell (reutilizando padrão).
6. `src/pages/status.js` — usa `/all`, extrai Status+Type, aplica filtro de Type + combina com busca local + delegação.

## Padrão arquitetural seguido

- **Shell vs Conteúdo dinâmico**: filtros renderizados via `replace()` **antes** do container alvo (`#list-container` / `#status-container`). Containers dinâmicos são **apenas** populados (innerHTML) → filtros nunca são sobrescritos.
- **Client-side filtering**: filtros aplicados sobre `state.items` (dados já carregados). Evita mudanças de contrato da API e mantém paginação/busca existentes consistentes.
- **Delegação de eventos**: 1 listener por página (no `app`) para botões de filtro → atualização mínima (só grid + classes ativas).
- **Defensivo**: extração de opções cobre chaves `Status/Type` maiúsculas/minúsculas. Tratamento de resposta `/all` aceita `{data}` ou array.
- **Performance/eficiência**: `/status` usa `GET /api/entertainment/all` (1 requisição) ao invés de loop no front.
