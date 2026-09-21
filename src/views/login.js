// View de login: se logado mostra "já logado", senão exibe form de autenticação + botão convidado
export function render_login(logged_in) {
  if (logged_in) {
    return `
      <div class="min-h-screen flex flex-col items-center justify-center p-8">
        <h1 class="text-2xl font-bold mb-4">Você já está logado</h1>
        <div class="flex gap-4">
          <button onclick="window.location.hash = '/list'" class="cursor-pointer px-6 py-3 border border-white hover:bg-white hover:text-black transition-all">Ver Lista</button>
          <button onclick="handle_logout()" class="cursor-pointer px-6 py-3 border border-white hover:bg-white hover:text-black transition-all">Sair</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="login__page min-h-screen flex items-center p-8 justify-center">
      <div class="login__page--container w-full max-w-md p-8 border border-zinc-700">
        <h1 class="text-2xl font-bold mb-6 text-center">Login</h1>
        <div id="loading" class="text-center py-4 text-zinc-400">Carregando...</div>
        <form id="login-form" class="hidden space-y-4">
          <div>
            <label class="block mb-2 text-sm text-zinc-400">Nome</label>
            <input type="text" name="name" required class="w-full p-3 bg-black border border-zinc-700 text-white focus:border-white focus:outline-none" />
          </div>
          <div>
            <label class="block mb-2 text-sm text-zinc-400">Email</label>
            <input type="email" name="email" required class="w-full p-3 bg-black border border-zinc-700 text-white focus:border-white focus:outline-none" />
          </div>
          <div class="flex gap-2.5">
            <button type="submit" class="cursor-pointer w-full py-3 border border-white hover:bg-white hover:text-black transition-all">Entrar</button>
            <button onclick="handle_guest_login()" type="button" class="cursor-pointer w-full py-3 border border-white hover:bg-white hover:text-black transition-all">Convidado</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
