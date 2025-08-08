export function createProceduralQuests(state) {
  const pool = [
    { id: 'printer', title: '🖨️ Ożywić drukarkę', effect: s => { s.player.stress += 6; maybeToast(s, 'Drukarka wydrukowała lorem ipsum i paragon z 2007.'); } },
    { id: 'coffeeBeans', title: '☕ Zmielić ziarna premium z kuchni', effect: s => { s.player.coffee += 1; maybeToast(s, 'Aromat kawy obniżył stres.'); s.player.stress = Math.max(0, s.player.stress - 8); } },
    { id: 'dataTickets', title: '📊 Zbierz 3 Dane z tasków', effect: s => { s.player.jira += 3; maybeToast(s, 'Masz nowe liczby do raportu.'); } },
    { id: 'sanitizer', title: '🧴 Uzupełnić płyn do dezynfekcji', effect: s => { maybeToast(s, 'Twoje ręce pachną jak serwerownia po remoncie.'); } },
    { id: 'cactus', title: '🌵 Podlej biurowego kaktusa', effect: s => { s.player.stress = Math.max(0, s.player.stress - 4); maybeToast(s, 'Kaktus nie potrzebował, ale docenił.'); } },
    { id: 'retro', title: '🕹️ Znajdź retro‑plakat „No Bugs, No Glory”', effect: s => { maybeToast(s, 'Znalazłeś plakat – morale ++'); } },
  ];

  function roll() {
    const q = pool[Math.floor(Math.random() * pool.length)];
    q.effect(state);
    return q.title;
  }

  let lastToastAt = 0;
  function maybeToast(state, msg) {
    const now = Date.now();
    if (now - lastToastAt < 6000 || !state._popupsOn) return; // rate limit popups
    lastToastAt = now;
    const t = state.ui.toast; if (!t) return;
    t.textContent = msg; t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 2000);
  }

  return { roll };
}


