# Documento de Requisitos de Produto (PRD)

## 1. Visão do Produto

#### Nome do produto:

No Sleep Land

#### Descrição de uma linha:

SPA sem framework para catalogar e acompanhar a coleção pessoal de entretenimento (filmes, séries, animes, dramas) — busca, filtros, Kanban por status, detalhe e CRUD — com o workspace Notion como base, via `notion_api` (domínio **entertainment**).

#### Tipo de produto:

Ferramenta pessoal (Internal Tool), sem fins comerciais.

#### Plataforma principal:

Web (SPA Vanilla JS servida na Vercel; hash router).

---

## 2. Problema

#### Qual problema estamos resolvendo?

Uma coleção grande de entretenimento se espalha: o que estou vendo, o que planejo ver, o que dropiei, quantos episódios vi. Registrar isso no Notion à mão é abrir o database, achar o item e trocar propriedade uma por uma — e não existe visão de quadro nem busca rápida lá.

#### Por que esse problema importa?

A coleção só é útil se o estado de cada item estiver atualizado. Status desatualizado e episódio errado transformam a lista em ruído — e o "o que assistir hoje?" vira uma busca manual.

### Como os usuários resolvem isso hoje?

Abrindo o database do Notion na mão (lento, sem Kanban) ou usando ferramentas externas que não deixam moldar os campos (estúdio, nacionalidade, notas, status próprios).

---

## 3. Objetivo

#### Objetivo principal:

Ver a coleção inteira com busca e filtro, e atualizar status/progresso em segundos, sem abrir o Notion.

#### Objetivos secundários:

- Decidir o que assistir com a página "Watch Later" + sorteio "Decida por mim! 🎲".
- Permitir leitura sem login (modo visitante) sem nunca permitir escrita.
- Manter capas e metadados organizados (itens sem capa, pôster para compartilhar).

---

## 4. Usuários-alvo

### Usuário Tipo 1

#### Nome:

Dono/a (usuário único)

#### Descrição:

Quem mantém a coleção: cria, edita, arquiva e troca status. Entra com email + código de acesso (JWT de 30 dias).

#### Necessidades:

- Buscar e filtrar qualquer item em segundos.
- Atualizar status, episódios e notas sem fricção.
- Ver o quadro inteiro (Kanban) e o que assistir a seguir.

#### Pontos de dor:

- Atualizar item no Notion à mão é item por item.
- Não existe visão de quadro por status no fluxo de database.

### Usuário Tipo 2

#### Nome:

Visitante (guest)

#### Descrição:

Quem abre o link sem login (modo "Visitante"). Vê tudo, não escreve nada.

#### Necessidades:

- Navegar, buscar e ver detalhes sem barreira de login.

#### Pontos de dor:

- Compartilhar a coleção sem expor a capacidade de edição.

---

## 5. Histórias de usuário

Como usuário,

quero [ação]

para que [resultado].

- Como usuário, quero buscar por nome com debounce na listagem para achar um item sem sair da página.
- Como usuário, quero filtrar a lista por status e o Kanban por tipo para enxergar um recorte da coleção.
- Como usuário, quero trocar o status pela edição para manter o quadro atualizado.
- Como usuário, quero ver os episódios vistos/total no card para saber onde parei.
- Como usuário, quero criar/editar/arquivar itens com selects e autocomplete de estúdios e gêneros para preencher rápido.
- Como usuário, quero ver os "próximos para assistir" e sortear um para decidir o que assistir.
- Como visitante, quero navegar pela coleção sem login para mostrar sem expor escrita.
- Como usuário, quero criar um pôster a partir da OMDB para compartilhar um título.

---

## 6. Funcionalidades centrais

### Funcionalidade 1 — Listagem com busca e filtros

#### Propósito:

Ver a coleção em grid de cards com capa, status, avaliação e episódios, com busca e filtro sem recarregar o app.

#### Fluxo do usuário:

`#/list` → grid paginado (24 por página, "Carregar mais" por cursor) → digita na busca (debounce 300ms, vira `#/list/search=<termo>`, **server-side**) → clica num filtro de status (client-side, sobre o que já está carregado) → clicar no card abre o detalhe.

#### Critérios de aceite:

- Busca vai para a URL (compartilhável/recarregável) e tem botão de limpar.
- Filtro de status sobrevive à paginação e à busca.
- Falha de fetch mostra "Erro ao carregar listagem: …"; lista sem item mostra "Nenhum entretenimento encontrado."
- Filtro vazio (`Todos`) restaura a lista completa.

#### Casos de borda:

- Rota desconhecida cai na listagem (fallback silencioso — não existe tela 404).
- "Carregar mais" falhando mantém os itens já carregados e mostra o erro.

---

### Funcionalidade 2 — Kanban por status

#### Propósito:

Quadro com uma coluna por status (Done, Watching, Plan to watch, Dropped/Paused) para enxergar a coleção inteira de uma vez.

#### Fluxo do usuário:

`#/status` → todas as colunas do schema (mesmo vazias, com "0" e "-") → filtro de tipo no topo (client-side) → busca local via adapter da sidebar → clique no card abre o detalhe.

#### Critérios de aceite:

- Colunas vêm das opções do `/options` (schema do Notion), não de lista fixa no front.
- Filtro de tipo e busca combinam sem perder o quadro.
- Cor de coluna codifica o status (ver `DESIGN_SYSTEM.md` §3).

#### Limitação registrada:

- **Não há drag-and-drop**: o status muda só pelo formulário de edição (o README promete "cards arrastáveis" — divergência conhecida, ver §12).

---

### Funcionalidade 3 — Detalhe e CRUD

#### Propósito:

Criar, editar e arquivar itens com o formulário completo (selects, autocomplete múltiplo, preview de capa).

#### Fluxo do usuário:

Detalhe (`#/detail/:id`) → **Editar** (`#/edit/:id`) ou **Deletar** (com `confirm("Tem certeza?")`) → no form: status, tipo, nota, datas, nacionalidade, episódios, estúdios (autocomplete multi), gêneros (autocomplete multi), capa por URL (com gerador de pôster embutido: busca OMDB → PNG → Cloudinary) → **Salvar**/**Criar** → volta para `#/list`.

#### Critérios de aceite:

- Criação nasce com Status `Plan to watch` (default defensivo contra opção renomeada no Notion); edição mantém o valor existente; placeholder "Selecione..." permanece.
- Status `Done` esconde Nota e Data Fim (Alpine `x-show`).
- Episódios Assistidos e Data Início só aparecem em `Watching`; esconder preserva o valor (continua no `FormData`).
- Tipo `Filme` força episódios em 1.
- Gerador de pôster embutido no form: o botão "Generate poster" usa o Nome como busca/título inicial, revela a ferramenta no bottom e rola até ela; upload no Cloudinary preenche automaticamente a URL da Capa e sua prévia.
- Seleção na OMDB preenche Nationality com o primeiro `Country`: casa com opção existente do Notion (`United States` → `🇺🇸 USA`, `Brazil` → `🇧🇷 Brasil`) ou cria opção nova no select (o Notion cria a propriedade ao salvar); sem Country (`N/A`/vazio) o campo não é tocado.
- Visitante vê "Restricted Access"; sem sessão vê "Access Denied"; escrita sem token é bloqueada **antes** do fetch e pelo backend (401).
- Erro do backend aparece em `alert("Erro: …")` com a mensagem em pt-BR.

#### Casos de borda:

- URL de capa inválida → "URL inválida" + fallback visual no `onerror`.
- Falha ao carregar options/detalhe → mensagem de erro na área de loading.

---

### Funcionalidade 4 — Sessão (login e visitante)

#### Propósito:

Escrita só de quem tem o código; leitura aberta.

#### Fluxo do usuário:

Sem sessão → guard do router manda para `#/login` → email + código → `POST /api/auth/login` → `{ token, user }` em `localStorage` → `#/list`. Ou botão **Visitante** → `IS_GUEST=true`, sem token → `#/list`. No boot, `validateSession()` chama `GET /api/auth/me`; qualquer 401 fora do login limpa a sessão e volta ao login.

#### Critérios de aceite:

- Visitante: UI esconde "+ Add", bloqueia `#/create`/`#/edit`, detalhe mostra "Guest: view-only"; o backend responde 401 se tentar por URL.
- Logado em `#/login` → redireciona para `#/list`.
- Erro de login exibe a mensagem do backend ("O código não confere.") — rotas `/api/auth/*` ficam fora do redirete automático de 401.

---

### Funcionalidade 5 — Assistir Depois (Watch Next) + sorteio

#### Propósito:

Fila do que vem a seguir, com um botão que decide por você.

#### Fluxo do usuário:

`#/watchNext` → `GET ?status=Plan to watch` (server-side, paginado) → busca local adaptada → **"Decida por mim! 🎲"** sorteia um item e abre modal → clique leva ao detalhe.

#### Critérios de aceite:

- Falha de fetch → "Falha ao carregar itens. Tente novamente."
- Modal fecha pelo `×`; itens levam ao detalhe.

---

### Funcionalidade 6 — Poster Maker

#### Propósito:

Gerar pôster de um título para compartilhar, buscando dados na OMDB e enviando a imagem ao Cloudinary.

#### Fluxo do usuário:

`#/poster` → busca OMDB (debounce 300ms, filtro de tipo) → preenche o form → pré-visualiza → **Baixar** (html2canvas, escala 2) → **Enviar** (Cloudinary, preset unsigned) → **Copiar** URL.

#### Critérios de aceite:

- Busca e upload exigem login ("Faça login…").
- Chaves ausentes viram mensagem clara ("Chave OMDB não configurada (.env)", "Cloudinary não configurado (.env)").

---

### Funcionalidade 7 — Páginas secundárias

- **Itens sem capa** (`#/noCover`): `list_all()` filtrando `!coverUrl`; sem link na sidebar (só por URL).
- **Ghibli** (`#/ghibli`): `?studios=Ghibli`, pageSize 100, renderiza em Kanban.

---

## 7. Não-objetivos

A seguir é propositalmente fora desta versão:

- Multiusuário com papéis/permissoes além de dono + visitante.
- Offline (Service Worker) e app nativo.
- Notificação de episódio novo.
- Integração com MyAnimeList/TMDB (a OMDB já entra só no Poster Maker).
- Estatísticas e gráficos; compartilhamento social da lista.
- Modo claro; TypeScript; telemetria/analytics.

---

## 8. Escopo do MVP

#### Obrigatórios:

- Guard de sessão + login (email/código) + modo visitante somente leitura.
- Listagem com busca, filtro de status e paginação por cursor.
- Detalhe completo; CRUD com autocomplete e preview de capa.
- Kanban por status com filtro de tipo.
- Watch Next com sorteio.

#### Desejáveis (já implementados):

- Páginas `noCover` e `Ghibli`; Poster Maker (OMDB + Cloudinary).

#### Futuros (README "Melhorias Futuras"):

- TypeScript · testes automatizados · upload de capa para CDN (hoje é URL; código de compressão existe órfão) · offline · notificações de episódios · MAL/TMDB · compartilhar lista · estatísticas · modo claro.

---

## 9. Métricas de sucesso

#### Métricas primárias:

- A coleção inteira é navegável (busca/filtro/Kanban) sem abrir o Notion.
- Trocar status/episódio leva menos de um minuto e reflete na listagem e no quadro.
- O visitante lê tudo sem conseguir escrever (401 garantido pelo backend).

#### Métricas secundárias:

- `npm run build` limpo a cada entrega.
- Um item novo entra com estúdios/gêneros selecionados em um único formulário.

Observação: o app não envia telemetria; o sucesso se mede no uso e na integridade dos dados.

---

## 10. Restrições

#### Técnicas:

- Sem framework: Vanilla JS (ES6+) + Alpine.js **só** no formulário; Fetch nativo (sem Axios); hash router próprio.
- Sem ESLint/Prettier/type-check/suíte de testes: a única validação automática é `npm run build`.
- Backend `notion_api` compartilhado com os outros 3 fronts: rate limit de ~3 req/s por integração + cache de 300s no servidor.
- Dependência nova exige decisão (o `html2canvas` já entra via CDN no `index.html`).
- Chaves `VITE_*` (API, OMDB, Cloudinary) ficam **visíveis no bundle** por decisão do Vite (ver `SECURITY.md`).

#### Negócio:

- Uso pessoal, sem prazo contratual nem SLA.
- Escritas autenticadas (JWT HS256); `.env` gitignored.

#### Design:

- Tema escuro fixo (sem modo claro nesta versão).
- Interface: sidebar, form e detalhe em **inglês**; restante da UI e erros em pt-BR (README é a exceção em inglês; tradução do restante é pendência).

#### Linha do tempo:

- Sem prazo definido; entregas incrementais, uma funcionalidade por commit.

---

## 11. Premissas

- Backend `notion_api` no ar (`https://notion-api-green.vercel.app`) com o domínio `entertainment` registrado (env `NOTION_ENTERTAINMENT_*` presentes).
- Workspace Notion com as propriedades do item existentes (opções de Status/Type vêm do schema).
- `VITE_API_URL` configurada; para o Poster, também `VITE_OMDB_API_KEY` e `VITE_CLOUDINARY_*`.
- Dono único e código de acesso não compartilhado; o modo visitante é público por design.

---

## 12. Perguntas em aberto

- Kanban: implementar drag-and-drop (o README promete) ou corrigir o README?
- `PATCH /:id/status` existe no backend mas o front nunca chama: usar no Kanban ou tirar dos docs?
- Upload de capa com compressão: o código existe (`main.js`, `images.js`) mas não está ligado ao form — religar ou remover?
- `src/types/` e `docs/ANALISE_PROJETO.md` são referenciados no `AGENTS.md`/README mas não existem — criar ou corrigir as referências?
- `#/noCover` não tem link na sidebar — expor na navegação?
- `console.log` de debug em `src/pages/poster.js` está modificado sem commit — remover?

---

## 13. Definição de pronto

O produto/funcionalidade está considerado completo quando:

- [ ] Requisitos implementados
- [ ] Fluxos críticos funcionam (login, visitante, listagem/busca, CRUD, Kanban, watch-next)
- [ ] `npm run build` passa (não há lint nem suíte de testes; validação é manual nos fluxos acima)
- [ ] Requisitos de segurança atendidos: escrita só com Bearer, guest bloqueado (UI + backend), XSS escapado, segredos fora do repositório
- [ ] Documentação atualizada (README, `docs/`)
