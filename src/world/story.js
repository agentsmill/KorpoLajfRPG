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

  function start() {
    if (!flags.introDone) {
      sequence([
        ['Narrator', 'Poranek. Chmury jak backlog: ciężkie, ale na horyzoncie promień nadziei.'],
        ['Narrator', 'Wchodzisz do open space, gdzie każde biurko to osobny wszechświat.'],
      ], () => {
        openChoice(state, 'Gdzie skierujesz pierwsze kroki?', 'To zdecyduje, komu zaufasz jako pierwszemu.',
          [
            { id: 'it', label: 'Do IT – po prawdę ukrytą w logach.' },
            { id: 'hr', label: 'Do HR – po człowieczeństwo w procedurach.' },
            { id: 'mgmt', label: 'Do Management – po sens w chaosie roadmapy.' },
          ], (pick) => { flags.act1Choice = pick; flags.introDone = true; }
        );
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
    if (flags.twistDone && !flags.climaxDone && t >= 16 * 60 + 30) {
      flags.climaxDone = true;
      sequence([
        ['CEO', 'Dziękuję za wasz wkład. Zmieniamy strategię. Nie wszyscy zostaną.'],
        ['Ty', 'Nie oddamy naszej pracy bez walki. Zostaję po godzinach i kończę plan migracji.'],
      ]);
      addLog('Kulminacja: walka o zespół.');
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


