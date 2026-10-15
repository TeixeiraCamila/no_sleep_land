// Registry de ações de botões: id único → função, com despacho por delegação de clique
// Views escrevem só o id no botão; quem registra a função é a page (ou o main.js para as globais)
const actions = {};

// Registra a função disparada pelo botão com esse id (sobrescreve a anterior)
export function register_action(id, handler) {
  actions[id] = handler;
}

// Listener único em document: cliques em qualquer botão com id registrado
// disparam a função correspondente; o id é a ligação entre botão e ação
export function init_actions() {
  document.addEventListener("click", (e) => {
    const handler = actions[e.target.id];
    if (handler) handler(e);
  });
}
