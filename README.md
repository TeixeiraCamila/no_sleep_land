# No Sleep Land - Frontend

Aplicação SPA para gerenciamento de entretenimento (filmes, séries, animes, dramas).

## Tecnologias

- **Vite** (build tool)
- **Vanilla JavaScript** (ES6+)
- **Tailwind CSS** 4.x

## Instalação

```bash
cd __front
npm install
```

## Configuração

Crie um arquivo `.env` (ou use `.env.exemplo` como referência):

```env
VITE_API_URL=http://localhost:3000/api
```

## Executar

```bash
# Desenvolvimento (hot-reload)
npm run dev

# Build para produção
npm run build

# Visualizar build de produção
npm run preview
```

## Funcionalidades

- **Listagem** - Visualizar todos os entretenimento em grid
- **Busca** - Filtrar itens por nome em tempo real
- **Visualização** - Ver detalhes completos de cada item
- **CRUD** - Criar, editar e deletar entretenimento (requer login)
- **Kanban** - Visualizar itens por status
- **Autocomplete** - Selects múltiplos com busca e sugestão
- **Preview de capa** - Visualizar capa via URL externa

## Páginas

- `/` - Redireciona para lista ou login
- `/list` - Listagem principal com busca
- `/status` - Quadro Kanban por status
- `/detail/:id` - Detalhes do item
- `/create` - Criar novo item
- `/edit/:id` - Editar item existente
- `/login` - Login de usuário

## Autenticação

O sistema autentica usando usuários do Notion:

1. Na página de login, insira o nome ou email de um usuário existente no banco de dados do Notion
2. O ID do usuário é armazenado no localStorage
3. Usuários logados podem criar, editar e deletar itens

## Interface

- **Sidebar** - Navegação, busca e ações
- **Grid de cards** - Exibição de itens com capa, nome, status e rating
- **Formulário** - Campos para todos os dados do entretenimento
- **Autocomplete** - Studios/Streaming e Genres/Tags com busca e múltipla seleção
- **Dark theme** - Interface escura com acentos em branco

## Estrutura do Projeto

```
__front/
├── index.html
├── package.json
├── vite.config.js
├── .env
└── src/
    ├── main.js                    # Entry point e router
    ├── services/
    │   └── api.js                 # Comunicação com API
    ├── views/
    │   ├── home.js
    │   ├── login.js
    │   ├── list.js                # Lista + grid de itens
    │   ├── detail.js              # Detalhes do item
    │   ├── form.js                # Formulário CRUD
    │   └── kanban.js              # Quadro Kanban
    ├── assets/style/
    │   └── style.css              # Estilos globais
    └── utils/
        └── html.js                # Utilitários HTML
```

## Integração com API

O frontend se comunica com a API em `/api/entertainment` para:

- `GET /` - Listar com paginação
- `GET /all` - Listar todos
- `GET /options` - Buscar opções dos selects
- `GET /:id` - Detalhes de um item
- `POST /` - Criar (requer auth)
- `PATCH /:id` - Atualizar (requer auth)
- `DELETE /:id` - Deletar (requer auth)

## Cores e Estilo

O projeto usa uma paleta escura:

- Background: `#0a0a0a`
- Sidebar: `#18181b` (zinc-900)
- Bordas: `#27272a` (zinc-800)
- Texto: `#fff` (principal), `#a1a1aa` (zinc-400)

## Licença

MIT