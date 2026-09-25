// View de login: se logado mostra "já logado", senão exibe form de credenciais + entrada como visitante
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
        <form id="login-form" class="space-y-4">
          <div>
            <label for="login-email" class="block mb-2 text-sm text-zinc-400">Email</label>
            <input id="login-email" type="email" name="email" autocomplete="email" required
              class="w-full p-3 bg-black border border-zinc-700 text-white focus:border-white focus:outline-none" />
          </div>
          <div>
            <label for="login-codigo" class="block mb-2 text-sm text-zinc-400">Código de acesso</label>
            <input id="login-codigo" type="password" name="codigo" autocomplete="current-password" required
              class="w-full p-3 bg-black border border-zinc-700 text-white focus:border-white focus:outline-none" />
          </div>
          <p id="login-error" role="alert" aria-live="polite" class="hidden text-sm text-red-400"></p>
          <div class="flex gap-2.5">
            <button id="login-submit" type="submit" class="cursor-pointer w-full py-3 border border-white hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed">Entrar</button>
            <button onclick="handle_guest_login()" type="button" class="cursor-pointer w-full py-3 border border-white hover:bg-white hover:text-black transition-all">Visitante</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
