import { openDialog, closeDialog } from '../systems/ui.js';

export function createQuests(state) {
  const progress = {
    coffeeQuest: false,
    bingoQuest: false,
    rodoQuest: false,
  };

  function currentTitle() {
    if (!progress.coffeeQuest) return '☕ Kawa dla Janusza';
    if (!progress.bingoQuest) return '🧠 Buzzword Bingo';
    if (!progress.rodoQuest) return '📝 RODO w HR';
    return '🏆 Wszystko zrobione!';
  }

  function save() {
    localStorage.setItem('corpo-save', JSON.stringify({ progress }));
  }

  function load(loadedProgress) {
    Object.assign(progress, loadedProgress);
  }

  function onTalk(npc, state) {
    if (npc.id === 'janusz') {
      if (!progress.coffeeQuest) {
        openDialog(state, npc.name, 'Młody! Zrób mi kawę i zamknij te popupy, bo mam deploya na produkcję.');
        state.player.coffee += 1;
        state.player.stress += 5;
        progress.coffeeQuest = true;
        save();
        state.story?.notify('coffee_done');
      } else {
        openDialog(state, npc.name, 'Kawka była git. Jak coś, to pamiętaj: to działa, nie dotykaj.');
      }
    }

    if (npc.id === 'scrum') {
      if (!progress.bingoQuest) {
        openDialog(state, npc.name, 'Hej hej! Zróbmy szybkie syncowanie i zagrzejmy atmosferę na daily! Masz kartę Bingo?');
        state.player.jira += 1;
        state.player.stress += 8;
        progress.bingoQuest = true;
        save();
        state.story?.notify('bingo_done');
      } else {
        openDialog(state, npc.name, 'Super energii! Pamiętaj o ownershipie i synergiach cross-feature!');
      }
    }

    if (npc.id === 'hr') {
      if (!progress.rodoQuest) {
        openDialog(state, npc.name, 'Cześć! Potrzebuję Twój podpis pod nową zgodą RODO. Obiecuję, to już ostatni raz w tym kwartale.');
        state.player.stress += 10;
        progress.rodoQuest = true;
        save();
        state.story?.notify('rodo_done');
      } else {
        openDialog(state, npc.name, 'Świetnie! A teraz ankietka satysfakcji – tylko 72 pytania.');
      }
    }

    updateHUD(state);
  }

  function updateHUD(state) {
    // triggers re-render via HUD binding in render
  }

  return { currentTitle, onTalk, save, load };
}


