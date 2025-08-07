import { openDialog, closeDialog, openChoice } from '../systems/ui.js';

export function createStory(state) {
  const flags = {
    introDone: false,
    act1Choice: null,
    coffeeDone: false,
    bingoDone: false,
    rodoDone: false,
    twistDone: false,
    climaxDone: false,
    ended: false,
  };

  let activeSeq = null;
  // cinematic state
  state.cinematic = state.cinematic || { active: false, zoom: 1.6, focus: null };

  function start() {
    if (!flags.introDone) {
      sequence([
        ['Narrator', 'Poranek. Chmury jak backlog: ciężkie, ale na horyzoncie promień nadziei.'],
        ['Narrator', 'Jesteś stażystą. Jeszcze pachniesz nowością, ale w oczach masz głód przygody.'],
        ['Narrator', 'Mówią, że w tym biurze są frakcje: IT, HR i Management. Ale to tylko plotki… reputacja rodzi się z czynów.'],
        ['Narrator', 'Wieść niesie też, że najciekawsze rzeczy dzieją się w kuchni. Kawa paruje, tajemnice krążą.'],
        ['Narrator', 'Najpierw kilka zasad, potem stworzysz swój profil (talenty), a dzień zacznie się w Twoim boksie.'],
        ['Narrator', 'Dziś masz przygotować raport na zarząd 17:30: człowiek + liczba + ryzyko.'],
        ['Narrator', 'Twoja ścieżka nie jest rekrutacją do frakcji. To bycie człowiekiem w miejscu, gdzie liczby mówią głośniej.'],
      ], () => {
        flags.introDone = true;
        // Pokaż instrukcje, potem otwórz kreator talentów
        try {
          state.ui.helpModal?.classList.remove('hidden');
          const once = () => {
            state.ui.btnHelpClose?.removeEventListener('click', once);
            state._openSkills?.();
          };
          state.ui.btnHelpClose?.addEventListener('click', once);
        } catch (e) { state._openSkills?.(); }
      });
    }
  }

  function isCutscene() { return !!activeSeq; }

  function sequence(lines, onDone) {
    activeSeq = { lines: [...lines], onDone };
    next();
  }

  function next() {
    if (!activeSeq) return;
    const [name, text] = activeSeq.lines.shift() || [];
    if (name) {
      openDialog(state, name, text);
    } else {
      closeDialog(state);
      const done = activeSeq.onDone; activeSeq = null; if (done) done();
    }
  }

  function notify(eventId) {
    if (eventId === 'coffee_done') flags.coffeeDone = true;
    if (eventId === 'bingo_done') flags.bingoDone = true;
    if (eventId === 'rodo_done') flags.rodoDone = true;
  }

  function update(delta) {
    // plot beats by in-game time
    const t = Math.floor(state.timeMinutes || 9 * 60);
    if (flags.introDone && !flags.twistDone && flags.coffeeDone && flags.bingoDone && t >= 10 * 60 + 30) {
      flags.twistDone = true;
      const msg = flags.act1Choice === 'it'
        ? ['Admin', 'Przyszło pismo. Szukają winnych w logach, nie w decyzjach.']
        : flags.act1Choice === 'hr'
        ? ['HR Ania', 'Jest plan redukcji. Mogę coś zrobić… ale będzie kosztować zaufanie.']
        : ['PM', 'Pivot. Slajdy już gotowe, ale nikt nie policzył ludzi.'];
      sequence([
        ['Plotka', 'Słyszałeś? Będą cięcia. Nasz projekt podobno...'],
        msg,
      ]);
      addLog('Plot twist: Przewidywane zwolnienia i pivot.');
    }
    // ambient micro-events to build climate
    if (!flags._amb1 && t >= 12 * 60) {
      flags._amb1 = true; sequence([
        ['Open space', '„Słyszałeś? CFO nie pije już kawy, tylko ROI.”'],
      ]);
    }
    if (!flags._amb2 && t >= 15 * 60) {
      flags._amb2 = true; sequence([
        ['Korytarz', '„Był fire-drill, ale ogień w mailach większy.”'],
      ]);
    }
    if (!flags._amb3 && t >= 17 * 60 + 20) {
      flags._amb3 = true; sequence([
        ['Open space', 'Cisza przed zarządem. Nawet ekspres przestał prychać.'],
      ]);
    }
    if (flags.twistDone && !flags.climaxDone && t >= 17 * 60 + 30) {
      flags.climaxDone = true;
      // cinematic mode: zoom on board room
      const ceo = state.npcs.find(n => n.id === 'ceo');
      state.cinematic.active = true;
      state.cinematic.zoom = 2.0;
      state.cinematic.focus = ceo ? { x: ceo.x, y: ceo.y } : { x: state.player.x, y: state.player.y };
      sequence([
        ['Narrator', 'Szkło sali zarządu odbija twarze – jakbyś patrzył na różne wersje siebie.'],
        ['CEO', 'Prosto. Jaki jest sens waszego istnienia w budżecie?'],
        ['Narrator', 'Cisza, która waży jak decyzja.'],
      ], () => {
        state.cinematic.active = false;
        // automatycznie otwórz dialog CEO, jeśli masz wejściówkę
        if ((state.flags||{}).board_invite) {
          state.dialogue.start('ceo', 'c1');
        } else {
          state.dialogue.start('ceo', 'start');
        }
      });
      addLog('Kulminacja: zarząd i decyzje.');
    }
    if (!flags.ended && t >= 18 * 60) {
      flags.ended = true;
      ending();
    }
  }

  function ending() {
    // simple scoring: reputacja przez działania
    const score = (state.player.jira || 0) + (state.player.coffee || 0) - Math.floor((state.player.stress || 0) / 8);
    const path = flags.act1Choice || 'it';
    if (score >= 8) {
      sequence([
        ['Zespół', 'Postawiłeś się. Nie modom, tylko lękowi. Dzięki Tobie przetrwaliśmy.'],
        ['Ty', path === 'hr' ? 'Nikt nie jest tylko zasobem.' : path === 'it' ? 'W logach też jest ludzkie życie.' : 'Roadmapy są o ludziach, nie o slajdach.'],
        ['Narrator', 'Wychodzisz na deszcz. Każda kropla jak ciężar, który spada z barków.'],
        ['Narrator', 'Dzwonisz do bliskiej osoby. Mówisz tylko: „Jestem.”'],
      ]);
    } else if (score >= 4) {
      sequence([
        ['CEO', 'Zespół zostaje. Ale budżet…'],
        ['Ty', 'Nie zgadzam się na milczenie.'],
        ['Narrator', 'Nie uratowałeś wszystkiego. Ale ocaliłeś jedną rzecz: swoje sumienie.'],
      ]);
    } else {
      sequence([
        ['PM', 'Liczby się nie zepną.'],
        ['Narrator', 'Światła gasną. Na biurku zostaje kubek z niedopitą kawą.'],
        ['Narrator', 'Mówisz sobie: „Jeszcze kiedyś powiesz światu, jak to było naprawdę.”'],
      ]);
    }
  }

  function consumeInteraction() {
    if (activeSeq) { next(); return true; }
    return false;
  }

  function addLog(msg) {
    if (!state.log) state.log = [];
    const t = state.timeMinutes || 9 * 60;
    const h = String(Math.floor(t / 60)).padStart(2, '0');
    const m = String(Math.floor(t % 60)).padStart(2, '0');
    state.log.unshift(`[${h}:${m}] ${msg}`);
  }

  return { start, update, notify, isCutscene, consumeInteraction };
}


