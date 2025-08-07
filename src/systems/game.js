import { loadAssets } from './loader.js';
import { makeOfficeMap } from '../world/officeMap.js';
import { createPlayer } from '../world/player.js';
import { createNPCs } from '../world/npcs.js';
import { drawScene } from './render.js';
import { openDialog, closeDialog } from './ui.js';
import { createQuests } from '../world/quests.js';
import { createAudio } from './lofi.js';
import { createSprites } from './sprites.js';
import { createProceduralQuests } from '../world/sideQuests.js';
import { setupEasterEggs } from '../world/easterEggs.js';
import { createStory } from '../world/story.js';

export function createGame({ canvas, ctx, ui }) {
  const state = {
    running: false,
    assets: null,
    map: null,
    player: null,
    npcs: [],
    quests: null,
    keys: new Set(),
    lastTime: 0,
    dt: 0,
    camera: { x: 0, y: 0 },
    ui,
    audio: null,
    sprites: null,
    sideQuests: null,
    timeMinutes: 9 * 60,
    log: [],
    story: null,
  };

  function init() {
    return loadAssets().then((assets) => {
      state.assets = assets;
      state.map = makeOfficeMap();
      state.player = createPlayer({ x: 5, y: 5 });
      state.npcs = createNPCs();
      state.quests = createQuests(state);
      state.sideQuests = createProceduralQuests(state);
      state.sprites = createSprites();
      state.audio = createAudio(ui.btnMusic);
      setupEasterEggs(state);
      state.story = createStory(state);

      const saved = JSON.parse(localStorage.getItem('corpo-save') || '{}');
      if (saved.progress) {
        state.quests.load(saved.progress);
      }

      window.addEventListener('keydown', (e) => {
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
        state.keys.add(e.key.toLowerCase());
        if (e.key === 'Escape') {
          closeDialog(state);
          ui.helpModal?.classList.add('hidden');
          ui.logModal?.classList.add('hidden');
          ui.bingoModal?.classList.add('hidden');
        }
        if (e.key.toLowerCase() === 'f1') state._secret?.llm1?.();
        if (e.key.toLowerCase() === 'f2') state._secret?.llm2?.();
        if (e.key.toLowerCase() === 'f3') state._secret?.llm3?.();
      });
      window.addEventListener('keyup', (e) => state.keys.delete(e.key.toLowerCase()));
      // assign sprites
      state.player.sprite = state.sprites.makeSprite('#06d6a0');
      for (const n of state.npcs) n.sprite = state.sprites.makeSprite(n.color);

      // UI modals
      ui.btnHelp?.addEventListener('click', () => ui.helpModal.classList.remove('hidden'));
      ui.btnHelpClose?.addEventListener('click', () => ui.helpModal.classList.add('hidden'));
      ui.btnLog?.addEventListener('click', () => { updateLogUI(); ui.logModal.classList.remove('hidden'); });
      ui.btnLogClose?.addEventListener('click', () => ui.logModal.classList.add('hidden'));
      ui.btnBingo?.addEventListener('click', openBingo);
      ui.btnBingoClose?.addEventListener('click', () => ui.bingoModal.classList.add('hidden'));
      // Popup toggle
      state._popupsOn = true;
      ui.btnPopups?.addEventListener('click', () => {
        state._popupsOn = !state._popupsOn;
        ui.btnPopups.textContent = state._popupsOn ? '🔔 Popups: ON' : '🔕 Popups: OFF';
      });

      state.story.start();
    });
  }

  function update(delta) {
    const stressFactor = 1 - Math.min(0.7, state.player.stress / 150);
    const speed = 4 * stressFactor; // tiles per second, slower with stress
    const move = { x: 0, y: 0 };
    if (state.keys.has('arrowup') || state.keys.has('w')) move.y -= 1;
    if (state.keys.has('arrowdown') || state.keys.has('s')) move.y += 1;
    if (state.keys.has('arrowleft') || state.keys.has('a')) move.x -= 1;
    if (state.keys.has('arrowright') || state.keys.has('d')) move.x += 1;

    // normalize
    if (move.x !== 0 && move.y !== 0) { move.x *= 0.7071; move.y *= 0.7071; }

    const nextX = state.player.x + move.x * speed * delta;
    const nextY = state.player.y + move.y * speed * delta;

    if (state.map.isWalkable(nextX, state.player.y)) state.player.x = nextX;
    if (state.map.isWalkable(state.player.x, nextY)) state.player.y = nextY;

    state.camera.x = Math.floor(state.player.x * 16 - canvas.width / 2 + 8);
    state.camera.y = Math.floor(state.player.y * 16 - canvas.height / 2 + 8);

    // interaction
    if (state.keys.has('e')) {
      state.keys.delete('e');
      if (state.story.consumeInteraction()) return;
      const target = state.npcs.find(n => Math.hypot(n.x - state.player.x, n.y - state.player.y) < 1.2);
      if (target) {
        state.quests.onTalk(target, state);
        addLog(`Rozmowa: ${target.name}`);
        if (target.id === 'scrum') ui.btnBingo?.classList.remove('hidden');
      }
    }

    // stress decay
    state.player.stress = Math.max(0, state.player.stress - delta * 2);

    // time flow (~1 min / 10s)
    state.timeMinutes += delta * 6;
    ui.hudClock.textContent = formatTime(state.timeMinutes);
    handleTimedEvents();
    state.story.update(delta);
  }

  function loop(t) {
    if (!state.running) return;
    state.dt = Math.min(0.05, (t - state.lastTime) / 1000);
    state.lastTime = t;
    update(state.dt);
    drawScene(state, ctx, canvas);
    requestAnimationFrame(loop);
  }

  function start() {
    if (state.running) return;
    init().then(() => {
      state.running = true;
      state.lastTime = performance.now();
      requestAnimationFrame(loop);
    });
  }

  function addLog(entry) {
    state.log.unshift(`[${formatTime(state.timeMinutes)}] ${entry}`);
    if (state.log.length > 50) state.log.pop();
  }

  function updateLogUI() {
    if (!ui.logList) return;
    ui.logList.innerHTML = state.log.map(li => `<div>${escapeHtml(li)}</div>`).join('');
  }

  function handleTimedEvents() {
    const t = Math.floor(state.timeMinutes);
    if (t === 9 * 60 + 5 && !state._dailyTriggered) {
      state._dailyTriggered = true;
      addLog('Daily stand-up! Scrum Masterka zaprasza.');
      ui.btnBingo?.classList.remove('hidden');
    }
    // occasional side quest every ~20 in-game minutes
    if ((!state._lastSide || t - state._lastSide >= 20) && state._popupsOn) {
      state._lastSide = t;
      const title = state.sideQuests.roll();
      addLog(`Side-quest: ${title}`);
    }
  }

  function openBingo() {
    const grid = ui.bingoGrid; if (!grid) return;
    ui.bingoModal.classList.remove('hidden');
    const words = shuffle([
      'synergia','ownership','value','roadmap','stakeholder','pivot','okr','paradigm','alignment','refactor',
      'scalability','handover','devops','async','cloud','ai','llm','prompt','agents','hallucination',
      'okr2','retrospektywa','backlog','discovery','design'
    ]).slice(0,25);
    grid.innerHTML = '';
    words.forEach(w => {
      const d = document.createElement('div');
      d.className = 'cell';
      d.textContent = w;
      d.onclick = () => { d.classList.toggle('on'); checkBingo(); };
      grid.appendChild(d);
    });
    ui.btnBingoClose.onclick = () => ui.bingoModal.classList.add('hidden');
  }

  function checkBingo() {
    const cells = Array.from(ui.bingoGrid.querySelectorAll('.cell')).map(c => c.classList.contains('on'));
    const idx = (r,c) => r*5+c;
    const lines = [];
    for (let r=0;r<5;r++) lines.push([0,1,2,3,4].map(c=>idx(r,c)));
    for (let c=0;c<5;c++) lines.push([0,1,2,3,4].map(r=>idx(r,c)));
    lines.push([0,6,12,18,24]);
    lines.push([4,8,12,16,20]);
    const win = lines.some(line => line.every(i => cells[i]));
    if (win && !state._bingoWon) {
      state._bingoWon = true;
      addLog('Bingo! Bonus za buzzword mastery.');
      state.player.stress = Math.max(0, state.player.stress - 20);
    }
  }

  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
  function formatTime(min){ const h=Math.floor(min/60), m=Math.floor(min%60); return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; }
  function escapeHtml(s){ return s.replace(/[&<>\"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }

  return { start };
}


