# AGENTS.md — Padrões dos Projetos Notion API

Cada subprojeto (`backend__final`, `book_journal`, `dashboard_journal`, `no_sleep_land`) é um repositório Git separado.

## Padrão de Commits (todos os projetos)

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<escopo opcional>): <descrição em português>
```

**Tipos:**

- `feat:` — nova funcionalidade
- `fix:` — correção de bug
- `refactor:` — refatoração sem mudança de comportamento
- `docs:` — documentação
- `chore:` — tarefas de manutenção (deps, config, etc.)
- `style:` — formatação/CSS sem mudança de lógica

**Exemplos:**

```
feat: adiciona seção 'Lidos nesse ano' com agrupamento por mês
fix(books): search filter and cache invalidation
refactor: extrai helper de formatação de data
docs: expand README with full API documentation
```

**Merge commits:** manter o padrão gerado pelo Git.

### Regras para o Agente

- **Só commitar quando explicitamente solicitado** pelo usuário (`"faça commit"`, `"commita"`,`"comita"`, etc.)
- **Antes de commitar**, entrar em cada subprojeto (`backend__final`, `book_journal`, `dashboard_journal`, `no_sleep_land`) e verificar `git status` para detectar quais têm alterações
- **A cada 5 commits locais** (contados a partir do último push), fazer `git pull` automaticamente
- Commits devem ser atômicos: um commit por funcionalidade/mudança lógica

---

## Padrão de Comentários (todos os projetos)

### Geral

- **Idioma:** português
- **Propósito:** explicar o _que_ e o _porquê_, não o _como_ (o código já mostra o como)
- **Topo de arquivo:** comentário de 1 linha descrevendo a responsabilidade do arquivo
- **Topo de função/componente:** 1-2 linhas explicando o que faz
- **Inline:** reservado para lógica não óbvia ou decisão de design
- **Marcadores visuais:** `✅`, `❌`, `🔍`, `⚡`, `📝` para facilitar leitura de logs

### backend\_\_final

```js
// 1 linha no topo do arquivo com dependências e propósito
// Dependências: cliente Notion, cache global e mapeadores de dados

// Comentário antes de cada função exportada com o que ela faz
// Service: busca todas as páginas paginando até o fim

// Inline para explicações rápidas
const year = y.trim().slice(-4); // Extrai os últimos 4 caracteres como ano
```

### book_journal

```js
// Componente: 1 linha com `<script setup>` descrevendo o componente
// Card de livro com efeito flip 3D

// Função: JSDoc-style /** */ com descrição
/**
 * Formata data para exibição em português
 */
const formatDate = (dateString) => { ... }

// Bloco de template: comentário acima de seções relevantes
<!-- Capa do livro -->
```

### dashboard_journal

```ts
// Componente/função: comentário simples de 1 linha
// Dashboard com estatísticas e gráficos

// Lógica complexa: comentário inline explicando decisão
const year = currentYear; // fallback quando o ano não está disponível
```

### no_sleep_land

```js
// Máximo 3 linhas por comentário
// 1 linha por função
// Router com suporte a autenticação e hash-based navigation
```

---

## backend\_\_final (Node.js + Express + Notion API)

### JavaScript

- ES modules (`import`/`export`)
- Ponto e vírgula obrigatório
- `const` / `let` (nunca `var`)
- `export function` para funções públicas
- Aspas duplas `"`
- camelCase para variáveis e funções
- Comentários em português explicando o propósito

### Estrutura de Domínios

```
lib/domains/<domain>/
├── index.js      # Barrel: router + basePath
├── routes.js     # Rotas Express
├── controller.js # Handlers com validação Zod
├── service.js    # Lógica + chamadas Notion API + cache
├── schema.js     # Schemas Zod
└── mappers.js    # Notion ↔ API
```

### Boas Práticas

- Cache via `getCache()`/`set()` do `client.js`, chave baseada nos parâmetros
- Validação com Zod `safeParse()` no controller
- `try/catch` com `console.error` descritivo
- Erros HTTP: 400 (validação), 404 (não encontrado), 500 (erro interno)
- Obter cliente Notion via `getClient("books")`
- CORS configurado no `server.js`

---

## book_journal (Vue 3 + Pinia SPA)

### Vue

- Composition API com `<script setup>`
- Comentário descritivo no topo de cada componente
- Barrel exports (`index.js`) em cada pasta
- Imports com alias `@/`
- PascalCase para arquivos e pastas de componentes
- `defineProps`/`defineEmits` para props/eventos
- CSS escopado (`<style scoped>`)

### CSS — BEM

```css
.block {
}
.block__element {
}
.block--modifier {
}
```

- kebab-case
- Variáveis CSS do `vars.css`: `var(--accent)`, `var(--black)`, `var(--muted)`, etc.

### JavaScript

- Single quotes `'`
- Ponto e vírgula
- `const` / `let` (nunca `var`)
- camelCase

### Estrutura

```
src/
├── components/{books,features,forms,ui,layout,navigation,feedback}/
├── composables/
├── constants/
├── services/
├── stores/       (Pinia)
├── views/
└── utils/
```

---

## dashboard_journal (React 18 + TypeScript + TanStack Query)

### React + TypeScript

- Componentes funcionais com hooks
- TanStack Query v5 para data fetching (`useQuery`, `useSuspenseQuery`)
- CSS modules ou arquivos `.css` separados por componente/página
- Axios client centralizado
- strict mode desativado (por enquanto)

### CSS

- CSS custom properties no `global.css`
- Design kawaii/soft UI (pastéis, glassmorphism)
- Classes sem BEM específico, nomes semânticos em kebab-case
- Responsivo: breakpoints 1200px e 768px

### JavaScript / TypeScript

- TypeScript com tipos explícitos
- Pontos e vírgula
- camelCase
- Nomes em português nos componentes de UI

---

## no_sleep_land (Vanilla JS + Alpine.js + Tailwind CSS v4)

### JavaScript

- Módulos ES (`import`/`export`)
- Template literals para HTML (sem framework)
- Hash-based router
- Fetch API com auth header `X-User-Id`
- Utilitários em `src/utils/`

### CSS

- **Tailwind CSS v4** (via `@import "tailwindcss"`)
- Tema escuro (`background: #0a0a0a`)
- Classes utilitárias Tailwind + classes custom em `style.css`
- kebab-case para classes custom

### Estrutura

```
src/
├── api/
├── components/
├── pages/
├── utils/
├── views/        (template literals)
├── store.js      (estado global simples)
├── router.js     (hash-based)
└── types.js      (constantes)
```


##  DOCS

-  [Documentação](https://developers.notion.com/reference/intro):

