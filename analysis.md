# Análise do Projeto — No Sleep Land

## Principais Features

- **Autenticação**: Login por usuário do Notion + modo visitante (guest), logout, guard de rotas, controle de permissões (escrita só para logados)
- **Listagem paginada**: Grid de cards com capa, busca server-side com debounce, paginação cursor-based ("Carregar mais", 24 itens/lote)
- **Detalhes do item**: Exibição completa com capa, rating, episódios, datas, estudios, gêneros; botões condicionais de editar/deletar
- **Criação/Edição**: Formulário completo com reatividade (Alpine.js), autocomplete multi-select (estudios/gêneros), preview de capa por URL, upload de imagem com compressão (Canvas API)
- **Quadro Kanban por status**: Colunas agrupadas por status com scroll, cards com capa e info, busca local
- **Watch Next**: Lista filtrada por "Plan to watch" com paginação
- **Itens sem capa**: Lista de itens que não possuem coverUrl
- **Página Ghibli**: Kanban específico para itens com tag "Ghibli"
- **Sidebar**: Navegação lateral com busca, botão "+ Adicionar" (logados), login/logout
- **Compressão de imagem client-side**: Canvas API com redimensionamento (max 800px) e compressão JPEG (qualidade 0.7)
- **Hash routing**: Roteamento SPA client-side via `window.location.hash`

---

## Features que Podem Ser Adicionadas

- **Filtros combinados na listagem** (status + tipo + rating, não só busca por nome)
- **Ordenação** (por nome, rating, data — client-side ou server-side)
- **Modo claro/escuro**
- **Drag and Drop real no Kanban** (README menciona mas não implementa)
- **Dashboard/Home page** com resumo e estatísticas
- **Estatísticas e gráficos** (distribuição por status, média de rating, total de itens)
- **Toast notifications** (substituir `alert()` e `confirm()` nativos)
- **Upload de imagem para CDN** (atualmente base64 no body)
- **Cache de dados** (evitar refetch ao navegar entre páginas)
- **Lazy loading de imagens** (`loading="lazy"`)
- **Testes automatizados** (zero atualmente)
- **TypeScript**
- **Service Worker para modo off-line**
- **Integração com APIs externas** (MyAnimeList, TMDB para auto-preenchimento)
- **Exportação de dados** (CSV/JSON)
- **Compartilhamento de lista**
- **Notificações de novos episódios**
- **Busca na sidebar funcional em todas as páginas**
- **Confirmação customizada de delete** (modal em vez de `confirm()`)
- **AbortController** para cancelar fetch ao mudar de rota

---

## Refatorações Necessárias

### Críticas
- **Duplicação massiva entre páginas Kanban**: `status.js` e `ghibli.js` (page e view) são praticamente idênticos — criar função compartilhada `loadAllItemsWithOptions()`
- **Duplicação de paginação**: `list.js` e `watch-next.js` têm a mesma lógica de `loadMore` — extrair um helper `createPaginatedLoader()`
- **Duplicação de cards**: HTML de card repetido em `list.js`, `noCover.js`, `watch-next.js` views
- **Estado global mutável**: `state` em `store.js` é objeto mutável sem eventos de mudança ou isolamento por página
- **Funções globais no `window`**: 9 funções expostas globalmente (`loadMore`, `handleLogout`, etc.) — migrar para eventos ou delegacia

### Médias
- **Tratamento de erros inconsistente**: Cada página trata erro de forma diferente (innerHTML, alert, mensagem fixa vs dinâmica, pt-BR vs inglês)
- **Idioma misto**: Mensagens de erro em inglês em `ghibli.js`, resto em português
- **`watch-next.js` redireciona para `/edit/:id`** em vez de `/detail/:id` ao clicar no card (provável bug)
- **`optionsAPI.get()` não utilizado** em `watch-next.js` (chamado mas resultado descartado)
- **Sidebra do formulário quebra padrão**: `form.js` view renderiza sidebar manualmente sem `renderMain()`, perdendo estado de login
- **`PAGE_SIZE` duplicado** em `list.js` e `watch-next.js`
- **Código morto em `ghibli.js`**: `uniqueStatuses.length` em um Set é sempre `undefined`

### Baixas
- **`escapeHtml` em números** em `episodes.js` (desnecessário)
- **`formatDate` vulnerável** a datas inválidas (retorna "Invalid Date")
- **`compressImage()` sem limite** de tamanho de arquivo (pode travar para imagens muito grandes)
- **`clearCoverUpload` nunca invocado** no template do formulário

---

## Componentizações que Fazem Sentido

- **Kanban** (`components/kanban.js`): Unificar `views/status.js` e `views/ghibli.js` — `renderKanban(items, statusOptions)` com colunas e cards
- **ItemCard** (`components/itemCard.js`): Card reutilizável nas listas — `renderItemCard(item, { onClick, showStatus, showCover, showEpisodes })`
- **LoadMore** (`components/loadMore.js`): Botão "Carregar mais" + gerenciador de paginação
- **Loading** (`components/loading.js`): Spinner/mensagem de carregamento padronizada
- **EmptyState** (`components/emptyState.js`): Mensagem "Nenhum item encontrado."
- **FormFields** (`components/formFields.js`): Selects, multi-selects, date inputs reutilizáveis no formulário
- **Toast/Modal** (`components/toast.js`): Substituir `alert()`/`confirm()` por notificações não-bloqueantes
- **ErrorBoundary** por página: Tratamento de erro padronizado com fallback visual

---

## Features que Podem Ser Removidas

- **Página Ghibli** (`#/ghibli`): Funcionalmente idêntica ao Kanban com filtro `tags.includes("Ghibli")` — pode virar um filtro na página de status
- **Página NoCover** (`#/noCover`): Apenas `items.filter(!item.coverUrl)` — poderia ser um toggle/botão na listagem
- **`clearCoverUpload`**: Função exposta globalmente mas nunca usada no template
- **`optionsAPI.get()` em `watch-next.js`**: Chamada sem utilidade
- **`state` não utilizado em `login.js`**: Importado mas nunca referenciado

---

## Testes Automatizados

### Estratégia

Implementar testes unitários e de integração para garantir a confiabilidade do código e facilitar refatorações futuras. Priorizar funções puras e utilitários primeiro, depois páginas e componentes.

### Stack Sugerida

| Ferramenta | Função |
|------------|--------|
| Vitest | Test runner e assertions (já incluso no ecossistema Vite) |
| happy-dom | Simulação de DOM para testes (leve, sem browser) |
| @testing-library/jest-dom | Matchers adicionais para DOM |
| msw | Mock de API (service worker) para testes de integração |

### O que testar

#### Unitários (prioridade alta)
- `utils/html.js` — `escapeHtml` (XSS, caracteres especiais, null/undefined)
- `utils/date.js` — `formatDate` (ISO inválido, null, locale pt-BR)
- `utils/episodes.js` — `renderEpisodes` (com e sem valores, fallback "?")
- `utils/search.js` — `debounce` (timing, cancelamento)
- `utils/images.js` — `compressImage` (limite de tamanho, formato)
- `components/itemCard.js` — `renderItemCard` (renderiza com props variadas, sem capa, sem status)
- `components/kanban.js` — `renderKanbanItems` (agrupamento por status, filtra corretamente)

#### Integração (prioridade média)
- `services/api.js` — `entertainmentAPI.list()` mockado, verifica query params
- `pages/list.js` — `renderListPage` mockando API, verifica DOM gerado
- `pages/login.js` — fluxo de login/guest com localStorage mockado
- `router.js` — hash routing mapeia rotas corretamente

#### Setup

```bash
npm install -D vitest happy-dom @testing-library/jest-dom msw
```

Adicionar ao `package.json`:
```json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run"
}
```

Configurar `vite.config.js`:
```js
test: {
  environment: 'happy-dom',
  globals: true,
  setupFiles: './src/test/setup.js',
}
```

Estrutura de pastas proposta:
```
src/
└── test/
    ├── setup.js          # Configuração global (mock localStorage, etc.)
    ├── utils/
    │   ├── html.test.js
    │   ├── date.test.js
    │   ├── episodes.test.js
    │   └── search.test.js
    ├── components/
    │   ├── itemCard.test.js
    │   └── kanban.test.js
    └── pages/
        ├── list.test.js
        └── login.test.js
```

---

## Libs e Plugins Utilizados

### Produção
| Lib | Versão | Função |
|-----|--------|--------|
| alpinejs | ^3.15.12 | Reatividade declarativa no formulário |

### Desenvolvimento
| Lib | Versão | Função |
|-----|--------|--------|
| vite | ^6.2.2 | Build tool e dev server |
| tailwindcss | ^4.2.2 | Framework CSS utility-first |
| @tailwindcss/vite | ^4.2.2 | Plugin Tailwind para Vite |
| @tailwindcss/postcss | ^4.2.2 | Plugin Tailwind para PostCSS |
| postcss | ^8.5.10 | Processador CSS |
| autoprefixer | ^10.5.0 | Prefixos CSS automáticos |

### Tecnologias nativas (sem lib)
- **Fetch API** — comunicação REST
- **localStorage** — persistência de autenticação
- **Hash routing** — navegação SPA (`hashchange`)
- **Template literals** — renderização HTML
- **Canvas API** — compressão de imagem client-side
- **FileReader API** — leitura de arquivo para base64
- **ES Modules** — modularização (`import`/`export`)
