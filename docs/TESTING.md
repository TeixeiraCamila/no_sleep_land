# Testing

Define como a aplicação é validada. O projeto **não tem suíte de testes automatizados** e não tem sequer linter/type-check: "testes automatizados" está listado como melhoria futura no README, **não** como prática atual. Não adicionar framework de teste/lint sem decisão explícita de produto (ver PRD §10).

"O código parece correto" não basta: a validação é o build da máquina + verificação manual dos fluxos críticos.

---

## 1. Objetivos de teste

Funcionalidade crítica:

- Guard de sessão: sem sessão → `#/login`; visitante lê e **não** escreve; 401 limpa sessão.
- Listagem: busca server-side, filtro de status, paginação "Carregar mais".
- CRUD: criação/edição com condicionais do Alpine (Done esconde nota/fim, Filme força episódios 1) e payload correto.
- Kanban: colunas das opções do schema, filtro de tipo, clique → detalhe.
- Watch Next: filtro `Plan to watch` + sorteio.
- XSS: todo dado de usuário escapado (`escape_html`) — inclusivo studios/tags digitados.

---

## 2. Tipos de validação

### Validação automatizada (obrigatória em toda entrega)

- **Build**: `npm run build` (`vite build`) completa sem erro. É a **única** checagem automática (não há lint nem type-check).

### Validação manual (fluxos da seção 5)

Não existe integração/E2E automatizado. Verificação humana com `npm run dev` (ou `npm run preview`) contra backend local/produção.

### Unit testing (não aplicável hoje)

`src/utils/` (`html`, `date`, `episodes`, `search`, `autocomplete`, `country`) é puro e seria o alvo natural se houvesse framework — hoje é exercitado indiretamente nos fluxos manuais. **Não inventar** script de teste no `package.json`.

---

## 3. Ferramentas

Unit: nenhuma (não instalar sem decisão).

Integration: nenhuma automatizada; manual contra o `notion_api` (`VITE_API_URL` apontando para local ou produção).

E2E: nenhum; os fluxos da seção 5 fazem o papel.

Lint/Type-check: **não existem** — revisão de diff manual (ver `CODE_STYLE.md` §10).

---

## 4. Estrutura de testes

Não existe `tests/` nem arquivos `*.test.*`/`*.spec.*`. Se a suíte for criada (decisão de produto; item "Melhorias Futuras"), estrutura sugerida:

```text
tests/
├── unit/        # utils/ (html escape, date, episodes, search)
├── integration/ # (futuro, contra API de teste)
└── e2e/         # (futuro, fluxos da seção 5)
```

---

## 5. Fluxos críticos (verificação manual)

### Fluxo A — Boot e guard

Passos: abrir `#/list` sem sessão; logar; recarregar em `#/login`.

Esperado: redirect automático para `#/login`; logado em `#/login` → `#/list`; com token expirado, `validateSession()` limpa no boot.

### Fluxo B — Login e visitante

Passos: código errado → certo; depois "Visitante" → tentar `#/create` pela URL.

Esperado: código errado mostra "O código não confere." (sem redirete); sucesso entra com "+ Add" visível; visitante vê "Restricted Access" e não consegue escrever por URL (`401` → volta ao login).

### Fluxo C — Listagem, busca e filtro

Passos: buscar termo (esperar debounce), limpar, filtrar por status, "Carregar mais".

Esperado: hash vira `#/list/search=<termo>`; filtro client-side sobrevive a paginação; vazio → "Nenhum entretenimento encontrado."; falha → "Erro ao carregar listagem: …".

### Fluxo D — CRUD com regras do form

Passos: criar item (conferir Status inicial); editar para `status = Watching`; editar para `status = Done`; editar `type = Filme` com episódios 5; clicar em "Generate poster" com Nome preenchido; salvar com URL de capa inválida.

Esperado: criação nasce com `Plan to watch`; `Watching` mostra "Episodes Watched" e "Start Date"; `Done` esconde "Rating" e "End Date"; `Filme` zera episódios em 1; "Generate poster" revela a ferramenta no bottom com busca/título preenchidos e rola até ela; upload preenche a URL da Capa; vai para `#/list` após salvar; capa inválida → "Invalid URL" + fallback; erro de API → `alert("Erro: …")` em pt-BR.

### Fluxo E — Kanban

Passos: abrir `#/status`, filtrar tipo, buscar na sidebar, clicar num card; simular falha da API (derrubar backend).

Esperado: colunas = opções de Status (vazias com "-"); filtro+busca combinam; card abre detalhe; **falha**: hoje o loading fica preso (bug conhecido — registrar ao reproduzir).

### Fluxo F — Watch Next e sorteio

Passos: `#/watchNext`, "Decida por mim! 🎲", fechar modal, clicar no item.

Esperado: só `Plan to watch`; modal abre/fecha; item leva ao detalhe.

### Fluxo G — Escrita protegida (segurança)

Passos: limpar `SESSION_TOKEN` com a página aberta e tentar salvar um form; tentar `DELETE` sem token via console.

Esperado: "Você precisa entrar na sua conta para fazer isso." (antes do fetch) e/ou `401` do backend → sessão limpa → `#/login`.

---

## 6. Cobertura

Target:

Prático: `build` limpo + fluxos da seção 5 afetados verificados a cada entrega. Sem métrica de % de linhas (sem ferramenta).

Priorizar:

1. Guards de sessão/guest (única barreira de UI de escrita).
2. Payload do CRUD (campos `date`/`episodes`/arrays — erro aqui corrompe linha no Notion).
3. Busca/filtro/paginação (regressão silenciosa comum: shell × container re-renderizado).
4. Escape XSS em tudo que é digitado pelo usuário.
5. Estados de erro (hoje o Kanban é o ponto fraco).

---

## 7. Comandos

Test: não existe script de teste — **não inventar**.

Lint: não existe script de lint — **não inventar**.

Build (única validação automática):

```bash
npm run build
```

Dev / preview:

```bash
npm run dev      # porta 5173
npm run preview
```

---

## 8. Definição de pronto

- [ ] `npm run build` passa
- [ ] Fluxos críticos afetados verificados manualmente (seção 5)
- [ ] Nenhum arquivo não relacionado mudou (atenção a `console.log` de debug no diff)
- [ ] Regras de segurança respeitadas (guest bloqueado, `escape_html`, sem segredo no código)
- [ ] Documentação atualizada (`docs/` conforme a tabela do `AGENTS.md` deste diretório)
