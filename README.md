# No Sleep Land

SPA para gerenciamento de entretenimento — filmes, séries, animes, dramas e outros. Permite catalogar, acompanhar progresso, avaliar e organizar por status em um quadro Kanban.

## Descrição

Aplicação frontend sem framework (Vanilla JS) construída para gerenciar uma coleção pessoal de entretenimento. Os dados são persistidos no Notion via API própria. Inclui listagem com busca e filtros, quadro Kanban por status, formulário completo com autocomplete e preview de capa, e autenticação simples por usuário do Notion.

Consome a API do backend em `backend__final`, domínio **Entertainment**.

## Tecnologias

- **Vanilla JavaScript (ES6+)** — Sem framework
- **Vite 6** — Build tool
- **Tailwind CSS 4.x** — Estilização utility-first
- **Alpine.js** — Reatividade declarativa no formulário
- **Fetch API** — Comunicação REST
- **localStorage** — Persistência de autenticação
- **Hash routing** — Navegação client-side

## Funcionalidades

### Listagem
- Grid de cards com capa, nome, status e avaliação
- Busca em tempo real por nome com debounce
- Filtragem por status
- Exibição de episódios (vistos/total)
- Exibição de data de início

### Quadro Kanban
- Organização visual por status
- Cards arrastáveis entre colunas
- Atualização automática de status

### Detalhes
- Página com todos os campos do item
- Capa em tamanho maior
- Lista de estudios e gêneros/tags
- Botões de editar e deletar (apenas usuários logados)

### Criação/Edição
- Formulário completo com todos os campos
- Selects para status, tipo, avaliação, nacionalidade
- Autocomplete múltiplo para estudios e gêneros
- Preview de capa em tempo real via URL
- Upload de imagem com compressão

### Autenticação
- Login por seleção de usuário do Notion
- Modo visitante (guest)
- Controle de permissões para ações de escrita

## Layout

Tema escuro (dark theme) com sidebar de navegação e busca. Interface limpa e funcional com cards de capa visualmente destacados.

## Estrutura de Pastas

```
src/
├── main.js                  # Entry point + Alpine + router init
├── router.js                # Hash router + lazy rendering
├── store.js                 # Estado global
├── constants.js             # Constantes (debounce, localStorage keys, etc.)
├── services/
│   └── api.js               # Fetch API wrapper + endpoints
├── components/
│   └── sidebar.js           # Sidebar de navegação
├── pages/
│   ├── list.js              # Página de listagem
│   ├── detail.js            # Página de detalhes
│   ├── form.js              # Criação e edição
│   ├── login.js             # Login e guest
│   ├── status.js            # Kanban por status
│   ├── noCover.js           # Itens sem capa
│   └── watch-next.js        # Próximos para assistir
├── views/
│   ├── content.js           # Renderização de conteúdo
│   ├── list.js              # Template da listagem
│   ├── detail.js            # Template de detalhes
│   ├── form.js              # Template do formulário
│   ├── login.js             # Template de login
│   ├── status.js            # Template do Kanban
│   ├── noCover.js           # Template sem capa
│   └── watch-next.js        # Template "próximos"
├── utils/
│   ├── html.js              # escapeHtml e utilitários HTML
│   ├── images.js            # compressImage
│   ├── date.js              # Formatação de datas
│   ├── episodes.js          # Formatação de episódios
│   ├── search.js            # Debounce e busca
│   └── autocomplete.js      # Autocomplete multi-select
├── types/                   # Definições de tipo (documentação)
└── assets/
    └── style/
        └── style.css        # Tailwind + custom styles
```

## Instalação

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |

## Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:3000
```

## Arquitetura

A aplicação utiliza uma arquitetura **SPA sem framework**, com padrão **Page + View**:

- **Pages** (`pages/`) — Lógica de estado, data fetching e eventos
- **Views** (`views/`) — Templates HTML em template literals
- **Router** — Hash-based, mapeia rotas para funções de renderização
- **Store** — Estado global simplificado
- **Services** — Camada de API com Fetch
- **Utils** — Funções puras reutilizáveis
- **Alpine.js** — Reatividade declarativa apenas no formulário (x-data, x-show, x-model)

### Fluxo de dados

```
Router → Pages (fetch + state) → Views (render HTML) → DOM
                           ↕
                   services/api.js (Fetch)
                           ↕
                   Backend API → Notion CMS
```

### Abordagens
- Hash routing (`window.location.hash`)
- Template literals para renderização HTML
- Estado global via objeto compartilhado (`store.js`)
- localStorage para persistência de autenticação
- Fetch API nativa sem Axios

## Consumo de API

A aplicação consome os seguintes endpoints do backend `backend__final`:

| Endpoint | Uso |
|----------|-----|
| `GET /api/entertainment` | Listar itens (paginado) |
| `GET /api/entertainment/all` | Todos os itens |
| `GET /api/entertainment/options` | Opções de filtro |
| `GET /api/entertainment/:id` | Detalhe do item |
| `POST /api/entertainment` | Criar item (autenticado) |
| `PATCH /api/entertainment/:id` | Atualizar item (autenticado) |
| `DELETE /api/entertainment/:id` | Arquivar item (autenticado) |
| `GET /api/users` | Listar usuários |
| `GET /api/users/:id` | Detalhe do usuário |

### Autenticação nas requisições

Requisições de escrita incluem o header `X-User-Id` com o ID do usuário logado, obtido via `localStorage`.

## Responsividade

Layout responsivo com grid adaptável. Sidebar colapsável em mobile. Cards se reorganizam conforme a tela.

## Acessibilidade

- Navegação por teclado
- Contraste adequado (dark theme)
- Atributos alt em imagens
- Labels em campos de formulário
- Mensagens de erro claras

## Deploy

Deploy na **Vercel** como SPA:

```bash
# 1. Conecte o repositório na Vercel
# 2. Configure VITE_API_URL como variável de ambiente
# 3. O build é feito com: npm run build
```

## Melhorias Futuras

- [ ] TypeScript
- [ ] Testes automatizados
- [ ] Upload de imagem para CDN (atualmente base64)
- [ ] Modo off-line com Service Worker
- [ ] Notificações de novos episódios
- [ ] Integração com MyAnimeList/TMDB
- [ ] Compartilhamento de lista
- [ ] Estatísticas e gráficos de entretenimento
- [ ] Modo claro (light theme)
