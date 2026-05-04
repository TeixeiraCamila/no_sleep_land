import { renderSidebar } from './sidebar.js';

export function renderHome(loggedIn) {
  return `
    <div class="home-container relative overflow-hidden">
      ${renderSidebar(loggedIn, null)}
      <main class="main-content flex items-center justify-center min-h-screen">
        <button id="btn-toggle-sidebar" class="btn-toggle p-2 bg-zinc-800 text-zinc-400 hover:bg-zinc-600">
          ☰
        </button>
        <div class="text-center">
          <h1 class="text-5xl font-bold mb-4">No Sleep Land</h1>
          <p class="text-zinc-400 mb-8">Gerencie seu entretenimento</p>
        </div>
      </main>
    </div>
  `;
}