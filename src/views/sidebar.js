function renderSidebar(loggedIn, activePage) {
  return `
    <aside class="sidebar bg-zinc-900 border-l border-zinc-800 flex flex-col h-screen p-4 fixed right-0 top-0 w-60">
      <div class="sidebar__logo mb-6">
        <h2 class="text-xl font-bold">No Sleep Land</h2>
      </div>
      
      <div class="sidebar__search mb-6">
        <input type="text" id="sidebar-search-input" 
          class="sidebar__search-input w-full px-3 py-2 bg-black border border-zinc-700 text-white placeholder-zinc-500 focus:border-white focus:outline-none" 
          placeholder="Buscar..." />
      </div>
      
      <nav class="sidebar__nav flex flex-col gap-1">
        <button onclick="window.location.hash = '/list'" class="sidebar-btn ${activePage === 'list' ? 'bg-zinc-800' : ''} cursor-pointer">
          Lista
        </button>
        <button onclick="window.location.hash = '/status'" class="sidebar-btn ${activePage === 'status' ? 'bg-zinc-800' : ''} cursor-pointer">
          Status
        </button>
      </nav>
      
      <div class="sidebar__actions mt-auto pt-4">
        ${loggedIn ? `<button onclick="window.location.hash = '/create'" class="sidebar__add-btn w-full px-4 py-2 bg-white text-black font-semibold hover:bg-zinc-200 cursor-pointer">+ Adicionar</button>` : ''}
      </div>
      
      <div class="sidebar__footer mt-4 pt-4 border-t border-zinc-800">
        ${
          loggedIn
            ? `<button onclick="handleLogout()" class="w-full px-4 py-2 border border-zinc-700 text-zinc-400 hover:border-white hover:text-white cursor-pointer">Sair</button>`
            : `<button onclick="window.location.hash = '/login'" class="w-full px-4 py-2 border border-zinc-700 text-zinc-400 hover:border-white hover:text-white cursor-pointer">Login</button>`
        }
      </div>
    </aside>
  `
}

export { renderSidebar }