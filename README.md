# No Sleep Land

Frontend SPA para gerenciamento de entretenimento (filmes, séries, animes, dramas).

## Tecnologias

- **Vite** - Build tool
- **Vanilla JavaScript** - ES6+ (sem framework)
- **Tailwind CSS 4.x** - Estilização

## Quick Start

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`

## Configuração

Criar `.env`:
```env
VITE_API_URL=http://localhost:3000
```

## Páginas

| Rota | Descrição |
|------|-----------|
| `/list` | Listagem com busca e filtros |
| `/status` | Quadro Kanban por status |
| `/detail/:id` | Detalhes do item |
| `/create` | Criar novo item |
| `/edit/:id` | Editar item |
| `/login` | Login |

## Funcionalidades

### Listagem
- Grid de cards com capa, nome, status, rating
- Busca em tempo real por nome
- Filtragem por status
- Exibição de episódios (vistos/total)
- Exibição de data de início

### Visualização
- Página de detalhes com todos os campos
- Capa em tamanho maior
- Lista de studios e genres/tags
- Botões de editar e deletar (apenas usuários logados)

### Criação/Edição
- Formulário completo com todos os campos
- Selects para status, tipo, rating, nacionalidade
- Autocomplete múltiplo para studios e genres
- Campos numéricos para episódios
- Campos de data (início e fim)
- Preview de capa em tempo real via URL

### Kanban
- Quadro visual organizado por status
- Cards arrastáveis entre colunas
- Atualização automática do status

### Sistema
- Sidebar com navegação e busca
- Modo escuro (dark theme)
- Tratamento de erros com alertas
- Redirecionamento automático

## Abordagens

- **SPA** - Single Page Application sem roteamento de servidor
- **Hash routing** - Navegação via `window.location.hash`
- **State management** - Estado global simplificado via store.js
- **Template literals** - Renderização de HTML via JavaScript
- **Fetch API** - Comunicação REST com backend
- **localStorage** - Persistência de autenticação

## Autenticação

Informe o nome/email de um usuário do Notion. O ID é salvo no localStorage.

## Estrutura

```
src/
├── main.js           # Entry point + router
├── router.js         # Rotas
├── store.js          # Estado global
├── services/api.js   # Comunicação API
├── pages/            # Componentes de página
├── views/            # Renderização de views
├── components/       # Componentes reutilizáveis
└── utils/            # Utilitários
```

## Deploy (Vercel)

1. Importar repositório
2. Configurar `VITE_API_URL`
3. Deploy automático