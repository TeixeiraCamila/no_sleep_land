# Database

Fonte da verdade do modelo de dados. Não existe banco relacional: a fonte é **um único database Notion** — `| no sleep land |` — acessado exclusivamente pelo backend `notion_api` (domínio `entertainment`).

> O front nunca fala com o Notion (ver `ARCHITECTURE.md` §8). Nomes em inglês abaixo são as **propriedades reais do Notion**; `camelCase` são os **DTOs da API** (ver `API.md`).

---

## 1. Motor de database

Database:

Workspace Notion (`@notionhq/client`).

Hosting:

Notion (cloud). `NOTION_ENTERTAINMENT_DATABASE_ID` aponta **direto para o database** (não para página raiz): **não há discovery de child databases** (diferente do domínio `finances`). O id resolve via `resolve_database()` na factory.

Referência de schema:

`notion_api/lib/domains/entertainment/backup/notion_export.json` — dump real (2026-10-06): **13 propriedades, 282 linhas ativas**; gerado por `scripts/notion_export.mjs`.

---

## 2. Convenções de nomenclature

Database:

`| no sleep land |` (nome no Notion, sem efeito na API — o acesso é por id).

Propriedades:

Em inglês, com espaço e barra onde fizer sentido: `Name`, `Status`, `Type`, `Rating`, `Nacionalidade`, `Studios/Streaming`, `Genres/Tags`, `Quest`, `Cover`, `Date`, `Episodes`, `Episodes seen` (com espaço), `Progress`.

DTO da API:

`camelCase` misto PT/EN: `name`, `status`, `type`, `rating`, `nacionalidade`, `studios`, `tags`, `coverUrl`, `episodes`, `episodesSeen`, `date`, `obs`, `plot`, `progress`, `createdTime`, `lastEditedTime`, `id`.

Primary key:

`id` = UUID da página Notion (embutido; o backend **não** valida formato — gotcha: id malformado vira 400 com mensagem em inglês do SDK).

Foreign keys:

**Não existem relations.** Nenhuma propriedade `relation`/`rollup` — item não referencia outro registro (estúdios/gêneros são `multi_select`, não tabelas).

Timestamps:

`createdTime`/`lastEditedTime` vêm nativos do Notion (não são properties editáveis).

---

## 3. Tabelas (propriedades do database)

### "| no sleep land |"

Purpose:

Uma linha = um título da coleção (filme, série, anime, dorama, BL).

Columns (14):

| Propriedade Notion | Tipo | DTO | Conteúdo / observação |
|---|---|---|---|
| `Name` | title | `name` | vazio → DTO traz fallback `'Sem título'` (só no mapper; o `/all` **descarta** itens `Sem título`) |
| `Status` | **status** | `status` | `Dropped/Paused`, `Plan to watch`, `Watching`, `Done` (grupos To-do/In progress/Complete) |
| `Type` | select | `type` | `SERIES`, `DORAMA`, `ANIME`, `BL`, `FILMES` |
| `Rating` | select | `rating` | emojis: `🫰 💤 🦝 ⭐️ … ⭐️⭐️⭐️⭐️⭐️` |
| `Nacionalidade` | select | `nacionalidade` | 9 opções com flags (South Korea, Thailand, China, Japan, USA, Germany, Noruega, Brasil, Reino Unido) |
| `Studios/Streaming` | multi_select | `studios[]` | ~50 opções (estúdios, streamings, 🏴‍☠️Pirata) |
| `Genres/Tags` | multi_select | `tags[]` | ~55 opções (Action, Drama, Sci-fi…) |
| `Cover` | files | `coverUrl` | 1º arquivo (URL externa) |
| `Plot` | **rich_text** | `plot` | sinopse; preenchida pelo Gerar pôster (OMDB `plot=full`) ou manualmente no form |
| `Obs` | **rich_text** | `obs` | no schema/mapper do backend, **sem campo no form** (escrita manual no Notion ou API) |
| `Date` | date | `date: { start, end }` | 124 itens com `end` (usado pelo `/finished-this-year`) |
| `Episodes` | number | `episodes` | inteiro ≥ 0 |
| `Episodes seen` | number | `episodesSeen` | inteiro ≥ 0 |
| `Progress` | **formula** | `progress` | `if(seen/episodes>=1, "▰… 100%", barra + "%")` — **incompatível com o mapper** (ver §7) |

> `Quest` (multi_select) existia no backup de 10/2026 mas **foi removida do banco**; o `/options` não a devolve mais.

---

## 4. Relações

Não há relações entre registros — o modelo é uma tabela plana.

Relação implícita com **opções**: `Status`/`Type`/`Rating`/`Nacionalidade` são catálogos vivos no Notion; o front lê as opções via `GET /options` e **nunca** deve fixar listas de status/tipo no código (a fonte é o schema).

Progresso:

Calculado **pelo Notion** (formula `Progress`); o front renderiza localmente `Ep: X/Y` (`utils/episodes.js`) — não depende da fórmula.

---

## 5. Constraints

Required:

- `name` obrigatório **no create** (`Nome é obrigatório`); no update é opcional (mas `''` escreveria título vazio → vira "Sem título" no mapper).
- Demais campos opcionais/nullable no create e update.

Unique:

Não há unique de negócio (Notion não impõe; nomes duplicados são permitidos).

Sem `null`:

- `status` no update **dedicado** (`PATCH /:id/status`) não aceita `null` de propósito — `null` zeraria o Status e o mapper apagaria o campo.
- Nos updates gerais, `null`/`''` **limpa** a propriedade (mappers removem do DTO).

Types/limites:

- `episodesSeen`/`episodes`: pré-processador converte `''`/não-numérico → `null`, fração → `Math.floor`; Zod exige inteiro ≥ 0.
- Valores de `status` no `PATCH /:id/status` são validados **dinamicamente** contra `get_options().Status` (fonte = Notion): `Status inválido: "X". Valores aceitos: Dropped/Paused, Plan to watch, Watching, Done`.

---

## 6. Indexes

Não se aplica — Notion não expõe criação de índice.

O que ocupa esse papel:

- Filtros nativos do Notion gerados pelo backend: `Name contains` (search), `Status equals`, `Studios/Streaming contains`, `Genres/Tags contains` (AND entre valores de mesma query).
- **Sem `sort` configurado** para entertainment → a ordem é a padrão do Notion (diferente de `books`, que ordena `Name` asc).
- Cache `node-cache` no backend: `entertainment:list_*`, `entertainment:all`, `entertainment:get_options` (TTL 300s).

---

## 7. Validação de dados

- **Toda entrada passa por Zod** no backend (`lib/domains/entertainment/schema.js`): `pageSize` 1–100, `year` 1900–2100, `status` string trim ≥ 1, campos desconhecidos **descartados em silêncio** (strip).
- Mensagens customizadas em pt-BR no create/status; o resto cai no default **inglês** do Zod (gotcha conhecido).
- `id` de path: `z.string()` (não `z.uuid()` — pendência documentada no domínio).
- DTOs **nunca trazem campos vazios**: `mappers.js` apaga `null`, `undefined`, `''` e `[]` (só `id` é sempre mantido). Ex.: item sem capa **não tem** a chave `coverUrl` — o front checa `!item.coverUrl`.
- Divergência registrada: `progress` é `formula` no Notion mas o mapper lê/escreve como `rich_text` → **nunca aparece em GET** e, se enviado, o Notion responde 400 em inglês. O front não envia `progress` (compatível por acaso).

---

## 8. Soft delete

Usa soft delete?

**Sim.** `DELETE /:id` → `notion.pages.update({ page_id, archived: true })` → `{ "success": true, "id": "…" }`.

Detalhes:

- O Notion **não tem hard delete** pela API; arquivado sai das queries normais.
- O front chama no detalhe com `confirm("Tem certeza?")` (só logado).
- O export (`notion_export.mjs`) considera só linhas ativas (arquivadas não contam).

---

## 9. Auditoria

O app não grava criado por / atualizado por / apagado por.

O que existe:

- `createdTime`/`lastEditedTime` nativos do Notion (visíveis na interface do Notion; o DTO os expõe).
- Histórico de versões do Notion por página — fora do alcance da API/app.
- Não há activity log; uma trilha de auditoria exigiria database novo (fora do escopo).

---

## 10. Dados sensíveis

Sensitive fields:

- Não há senha, token ou PII de terceiros: a coleção é conteúdo pessoal (hábitos de consumo), não dado financeiro/saúde.

Protection:

- Acesso só pela API com integration key no servidor; escritas exigem Bearer (`requireAuth`), leituras são públicas por decisão de produto (ver `SECURITY.md`).
- O backend não loga payload de escrita; stack vai só para `console.error`.

Retention / Deletion:

- Retenção ilimitada; exclusão = soft delete (§8).

---

## 11. Regras de migração

Mudanças de schema devem:

1. Ser documentadas aqui (e em `API.md` se mudar DTO/rota).
2. Passar pela interface do Notion **e** pelo backup: regerar `lib/domains/entertainment/backup/notion_export.json` (`scripts/notion_export.mjs`) para manter a referência de schema fiel.
3. Ser testadas com dados reais (não há suíte automatizada).
4. Não quebrar o mapper: ele espera os nomes exatos (`Episodes seen` com espaço, `Studios/Streaming` com barra) — renomear property quebra leitura/escrita silenciosamente.
5. Considerar o cache: mutações limpam `entertainment:*`; mudança manual no Notion **não** limpa o cache de 300s (esperar TTL ou mutar).

Gotchas:

- Nova opção em `Status`/`Type` aparece sozinha no `/options` (fonte dinâmica) — mas o **Kanban** monta colunas das opções de Status: opção nova cria coluna nova automaticamente.
- Nova property `select`/`multi_select` aparece sozinha no `/options` (o front só lê as 6 chaves que conhece).
- Property nova **não** vira campo do DTO sem mapper em `mappers.js`.
- `Quest` ilustra o percurso: existe no schema, vaza no `/options`, mas sem mapper não é editável pelo app.

---

## 12. Seed data / restauração

- **Não existe script de seed** para entertainment (diferente de `finances`).
- Restauração/auditoria de schema: `backup/notion_export.json` (282 linhas) + `scripts/notion_export.mjs` regeneram o dump; serve para conferir propriedades e opções contra o código.
- Dados de desenvolvimento são criados pela própria UI (POST) ou direto no Notion.
