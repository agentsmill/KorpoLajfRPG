export function setupEasterEggs(state) {
  state._secret = {
    llm1: () => egg(state, 'Prompt leak! Janusz właśnie wkleił system prompta do JIRY.'),
    llm2: () => egg(state, 'Hallucination detected: ekspres do kawy twierdzi, że jest serwerem bazy danych.'),
    llm3: () => egg(state, 'Rate limit: 429 – odłóż zadanie na następny sprint.'),
  };
  // Creative: office plant "Stefan" heals stress when you press P near kitchen
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'p') {
      const nearKitchen = state.player.x < 12 && state.player.y < 10;
      if (nearKitchen) {
        state.player.stress = Math.max(0, state.player.stress - 15);
        toast(state, '🌿 Stefan – biurowa roślina szepta: „Oddychaj”.');
      }
    }
  });
}

function egg(state, msg) {
  toast(state, msg);
}

function toast(state, msg) {
  const t = state.ui.toast; if (!t) return;
  t.textContent = msg; t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2200);
}


