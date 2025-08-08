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
import { createDialogue } from './dialogue.js';
import { updateNPCs } from './ai.js';

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
    rep: { it: 0, hr: 0, mgmt: 0 },
    objective: null,
    objectives: [],
    dialogue: null,
    skills: { emp: 0, log: 0, ret: 0, grit: 0 },
    flags: {},
    inventory: [],
    inbox: [],
    paused: false,
    // in‑game minutes advanced per real second; 9:00→17:30 (510 min) in 30 min → 510/1800 ≈ 0.2833
    timeScale: 510 / (30 * 60),
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
      state.dialogue = createDialogue(state);
      state.objective = { id: 'report', label: 'Przygotuj raport na 17:30: człowiek/liczba/ryzyko', x: 49, y: 29 };
      state.objectives = [ state.objective ];
      // Hard objective: board meeting at 17:30 (always visible w trackerze)
      state.objectives.push({ id: 'board_meeting', label: 'Spotkanie zarządu 17:30', x: 49, y: 29 });
      state._interactUntil = { espresso: 0, fridge: 0, stefan: 0 };

      const saved = JSON.parse(localStorage.getItem('corpo-save') || '{}');
      if (saved.state) {
        // restore minimal safe subset
        const s = saved.state;
        state.timeMinutes = s.timeMinutes ?? state.timeMinutes;
        state.rep = s.rep ?? state.rep;
        state.flags = s.flags ?? state.flags;
        state.skills = s.skills ?? state.skills;
        state.inventory = s.inventory ?? state.inventory;
        state.inbox = s.inbox ?? state.inbox;
        state.objectives = s.objectives ?? state.objectives;
        state.objective = s.objective ?? state.objective;
        state.player.stress = s.player?.stress ?? state.player.stress;
        state.player.jira = s.player?.jira ?? state.player.jira;
        state.player.coffee = s.player?.coffee ?? state.player.coffee;
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
      for (const n of state.npcs) n.sprite = state.sprites.makeSprite(n.color, `${n.id}::${n.faction||'neutral'}`);
      // build NPC meta index for dialog avatars and subs
      state._npcMeta = Object.fromEntries(state.npcs.map(n => [n.id, { faction:n.faction, hair:n.hair, skin:n.skin, shirt:n.shirt, mood:n.mood, bio:n.bio, name:n.name }]));

      // UI modals
      ui.btnHelp?.addEventListener('click', () => ui.helpModal.classList.remove('hidden'));
      ui.btnHelpClose?.addEventListener('click', () => ui.helpModal.classList.add('hidden'));
      // Tracker modal
      ui.btnTracker?.addEventListener('click', () => { updateTracker(); ui.trackerModal?.classList.remove('hidden'); ui.overlay?.classList.remove('hidden'); });
      ui.btnTrackerClose?.addEventListener('click', () => { ui.trackerModal?.classList.add('hidden'); ui.overlay?.classList.add('hidden'); });
      ui.btnLog?.addEventListener('click', () => { updateLogUI(); ui.logModal.classList.remove('hidden'); });
      ui.btnLogClose?.addEventListener('click', () => ui.logModal.classList.add('hidden'));
      ui.btnBingo?.addEventListener('click', openBingo);
      ui.btnBingoClose?.addEventListener('click', () => ui.bingoModal.classList.add('hidden'));
      // Phone
      ui.btnPhone?.addEventListener('click', () => { updatePhoneUI(); ui.phoneModal?.classList.remove('hidden'); ui.overlay?.classList.remove('hidden'); });
      ui.btnPhoneClose?.addEventListener('click', () => { ui.phoneModal?.classList.add('hidden'); ui.overlay?.classList.add('hidden'); });
      // Pause + autosave
      ui.btnPause?.addEventListener('click', () => { doPause(); });
      ui.btnContinue?.addEventListener('click', () => { doResume(); });
      ui.btnNewGame?.addEventListener('click', () => { localStorage.removeItem('corpo-save'); location.reload(); });
      // Popup toggle
      state._popupsOn = true;
      ui.btnPopups?.addEventListener('click', () => {
        state._popupsOn = !state._popupsOn;
        ui.btnPopups.textContent = state._popupsOn ? '🔔 Popups: ON' : '🔕 Popups: OFF';
      });

      setupSkillsSelection();
      setupTimeModes();
      state.story.start();
    });
  }

  function update(delta) {
    if (state.paused) return;
    // Stress balancer: movement affected łagodnie (min 60% prędkości), ale dialog gating robi robotę
    const stressFactor = 1 - Math.min(0.4, state.player.stress / 250);
    const baseSpeed = 8;
    const sprint = state.keys.has('shift');
    const speed = (baseSpeed * (sprint ? 1.5 : 1)) * stressFactor;
    const move = { x: 0, y: 0 };
    if (state.keys.has('arrowup') || state.keys.has('w')) move.y -= 1;
    if (state.keys.has('arrowdown') || state.keys.has('s')) move.y += 1;
    if (state.keys.has('arrowleft') || state.keys.has('a')) move.x -= 1;
    if (state.keys.has('arrowright') || state.keys.has('d')) move.x += 1;
    // virtual joystick influence (mobile)
    if (window._joy && window._joy.active) {
      move.x += Math.max(-1, Math.min(1, window._joy.dx || 0));
      move.y += Math.max(-1, Math.min(1, window._joy.dy || 0));
    }

    // normalize
    if (move.x !== 0 && move.y !== 0) { move.x *= 0.7071; move.y *= 0.7071; }

    const nextX = state.player.x + move.x * speed * delta;
    const nextY = state.player.y + move.y * speed * delta;

    if (state.map.isWalkable(nextX, state.player.y)) state.player.x = nextX;
    if (state.map.isWalkable(state.player.x, nextY)) state.player.y = nextY;

    // Smooth camera follow (lerp)
    const targetCamX = state.player.x * 16 - canvas.width / 2 + 8;
    const targetCamY = state.player.y * 16 - canvas.height / 2 + 8;
    const lerp = 1 - Math.pow(0.001, delta); // frame-rate independent
    state.camera.x = Math.floor(state.camera.x + (targetCamX - state.camera.x) * lerp);
    state.camera.y = Math.floor(state.camera.y + (targetCamY - state.camera.y) * lerp);

      // interaction
    if (state.keys.has('e')) {
      state.keys.delete('e');
      if (state.story.consumeInteraction()) return;
      // interaktywne obiekty (kuchnia/roślina)
      if (tryUseInteractive()) return;
      const target = state.npcs.find(n => Math.hypot(n.x - state.player.x, n.y - state.player.y) < 1.2);
      if (target) {
          state._currentNpcId = target.id;
        // route to dialogue trees by NPC id
        if (['janusz','hr','scrum','ceo','admin','pm','ux','qa','fin','ops','sec','sec2'].includes(target.id)) {
          const treeId = (target.id === 'scrum' || target.id === 'pm') ? 'mgmt' : target.id;
          state.dialogue.start(treeId, 'start');
        } else {
          state.quests.onTalk(target, state);
        }
        addLog(`Rozmowa: ${target.name}`);
        if (target.id === 'scrum') ui.btnBingo?.classList.remove('hidden');
      }
    }

    // NPC AI wandering
    updateNPCs(state, state.dt);

    // stress dynamics (sprint adds, idle decays)
    if (sprint && (move.x !== 0 || move.y !== 0)) {
      state.player.stress = Math.min(100, state.player.stress + delta * 6);
    } else {
      state.player.stress = Math.max(0, state.player.stress - delta * 2.5);
    }

    updateRoomLabel();

    // time flow according to selected mode
    state.timeMinutes += delta * (state.timeScale || 510/(30*60));
    ui.hudClock.textContent = formatTime(state.timeMinutes);
    updateFactionHUD();
    handleTimedEvents();
    state.story.update(delta);
    updateTracker();
  }

  function loop(t) {
    if (!state.running) return;
    if (state.paused) { requestAnimationFrame(loop); return; }
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

  function setupSkillsSelection() {
    const { skillsModal, skillsCounter, skillsConfirm } = ui;
    if (!skillsModal) return;
    // funkcja wywoływana po intro/story
    state._openSkills = () => { skillsModal.classList.remove('hidden'); ui.overlay?.classList.remove('hidden'); };
    const picks = new Set();
    document.querySelectorAll('#skillsModal .skill').forEach(btn => {
      btn.onclick = () => {
        const key = btn.dataset.skill;
        if (picks.has(key)) { picks.delete(key); btn.classList.remove('active'); }
        else if (picks.size < 2) { picks.add(key); btn.classList.add('active'); }
        skillsCounter.textContent = `Wybrane: ${picks.size}/2`;
        skillsConfirm.disabled = picks.size !== 2;
      };
    });
    skillsConfirm.onclick = () => {
      for (const k of picks) state.skills[k] += 2;
      skillsModal.classList.add('hidden');
      ui.overlay?.classList.add('hidden');
    };
  }

  function setupTimeModes() {
    // UI: use Help modal body to show modes explanation
    if (ui.helpModal) {
      const body = ui.helpModal.querySelector('.modal-body');
      if (body && !body.dataset.modes) {
        body.dataset.modes = '1';
        body.innerHTML += `<br/>- Tryby czasu: 30 min (domyślny), 60 min, 90 min – odkryjesz więcej ścieżek dialogowych.`;
      }
    }
    // Add simple hotkeys: 1=30min, 2=60min, 3=90min
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === '1') state.timeScale = 510 / (30 * 60);
      if (e.key === '2') state.timeScale = 510 / (60 * 60);
      if (e.key === '3') state.timeScale = 510 / (90 * 60);
      updateTimeModeButton();
    });

    // HUD button to cycle modes
    if (ui.btnTimeMode) {
      ui.btnTimeMode.onclick = () => {
        const s = state.timeScale || 510 / (30 * 60);
        const next = s <= 510/(30*60) + 1e-6 ? 510/(60*60) : s <= 510/(60*60) + 1e-6 ? 510/(90*60) : 510/(30*60);
        state.timeScale = next;
        updateTimeModeButton();
      };
      updateTimeModeButton();
    }
  }

  function updateTimeModeButton() {
    if (!ui.btnTimeMode) return;
    const s = state.timeScale || 510 / (30 * 60);
    let label = '30m';
    if (Math.abs(s - 510/(60*60)) < 1e-6) label = '60m';
    else if (Math.abs(s - 510/(90*60)) < 1e-6) label = '90m';
    ui.btnTimeMode.textContent = `⏱️ ${label}`;
  }

  function addLog(entry) {
    state.log.unshift(`[${formatTime(state.timeMinutes)}] ${entry}`);
    if (state.log.length > 50) state.log.pop();
  }

  function updateLogUI() {
    if (!ui.logList) return;
    ui.logList.innerHTML = state.log.map(li => `<div>${escapeHtml(li)}</div>`).join('');
  }

  function updatePhoneUI() {
    if (!ui.inboxList || !ui.invList) return;
    ui.inboxList.innerHTML = (state.inbox||[]).map(m => `<div>[${new Date(m.at).toLocaleTimeString()}] <b>${escapeHtml(m.from)}</b>: ${escapeHtml(m.text)}</div>`).join('') || '<i>Brak wiadomości</i>';
    const invHtml = (state.inventory||[]).map(i => `<div>• ${escapeHtml(i)}</div>`).join('') || '<i>Pusto</i>';
    const flags = state.flags || {};
    const pillars = [
      { k:'case_hr', label:'Człowiek' },
      { k:'case_it', label:'Liczba' },
      { k:'case_ops_risk', label:'Ryzyko' },
    ];
    const prog = pillars.map(p=>`<span>${p.label}: ${flags[p.k]? '✓':'—'}</span>`).join(' • ');
    const report = `<div style="margin-top:10px"><b>Raport 17:30</b><div>📊 Dane: ${state.player.jira||0}</div><div>${prog}</div></div>`;
    ui.invList.innerHTML = invHtml + report;
  }
  state._updatePhoneUI = updatePhoneUI;

  function updateTracker() {
    const list = ui.trackerList || document.getElementById('trackerList');
    if (!list) return;
    const items = (state.objectives || []).map((o, i) => `<li>${i === 0 ? '⭐ ' : ''}${escapeHtml(o.label || 'Cel')}</li>`);
    list.innerHTML = items.join('');
  }

  function updateFactionHUD() {
    if (!ui.hudFaction) return;
    const r = state.rep || { it:0, hr:0, mgmt:0 };
    const best = Object.entries(r).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]))[0];
    const label = best && Math.abs(best[1])>=10 ? (best[0].toUpperCase()) : '—';
    ui.hudFaction.textContent = label;
  }

  function doPause() {
    state.paused = true;
    saveGame();
    ui.pauseModal?.classList.remove('hidden');
    ui.overlay?.classList.remove('hidden');
  }

  function doResume() {
    ui.pauseModal?.classList.add('hidden');
    ui.overlay?.classList.add('hidden');
    state.paused = false;
  }

  function saveGame() {
    const snapshot = {
      state: {
        timeMinutes: state.timeMinutes,
        rep: state.rep,
        flags: state.flags,
        skills: state.skills,
        inventory: state.inventory,
        inbox: state.inbox,
        objectives: state.objectives,
        objective: state.objective,
        player: { stress: state.player.stress, jira: state.player.jira, coffee: state.player.coffee },
      }
    };
    localStorage.setItem('corpo-save', JSON.stringify(snapshot));
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
    // printer quest kickoff
    if ((!state._printerKick || t - state._printerKick > 9999) && t >= 9 * 60 + 10) {
      state._printerKick = t;
      addLog('Open space: „Drukarka znowu mieli. Ktoś ogarnie?”');
      // add objective to check printer
      const exists = (state.objectives||[]).some(o=>o.id==='printer_check');
      if (!exists) state.objectives.unshift({ id:'printer_check', label:'Sprawdź drukarkę w boksach', x: 20, y: 14 });
    }
  }

  // Interaktywne obiekty: kuchnia (lodówka/ekspres), roślina Stefan
  const interactCooldown = new Map();
  function canUse(key, cooldownSec) {
    const now = performance.now();
    const until = interactCooldown.get(key) || 0;
    if (now < until) return false;
    interactCooldown.set(key, now + cooldownSec*1000);
    return true;
  }

  function tryUseInteractive() {
    const px = Math.round(state.player.x);
    const py = Math.round(state.player.y);
    const around = [
      [px, py], [px+1, py], [px-1, py], [px, py+1], [px, py-1]
    ];
    for (const [x, y] of around) {
      const t = state.map.get(x, y);
      if (!t) continue;
      if (t.type === 'espresso') {
        if (!canUse('espresso', 15)) { showToast('Ekspres: chwilowe czyszczenie…'); return true; }
        state.player.coffee = (state.player.coffee||0) + 1;
        state.player.stress = clamp(state.player.stress - 12, 0, 100);
        showToast('☕ Espresso: +1 kawa, −12 stres');
        state.story.notify('coffee_done');
        return true;
      }
      if (t.type === 'fridge') {
        if (!canUse('fridge', 45)) { showToast('Lodówka: nic nowego.'); return true; }
        state.player.coffee = (state.player.coffee||0) + 1;
        state.player.stress = clamp(state.player.stress - 5, 0, 100);
        showToast('🥤 Lodówka: +1 kawa/kapsułka, −5 stres');
        return true;
      }
      if (t.type === 'plant') {
        if (!canUse('stefan', 40)) { showToast('Stefan już cię uspokoił.'); return true; }
        state.player.stress = clamp(state.player.stress - 10, 0, 100);
        showToast('🌿 „Stefan”: −10 stres');
        return true;
      }
      if (t.type === 'printer') {
        if (!canUse('printer', 20)) { showToast('🖨️ Drukarka: „Mielę…”'); return true; }
        // 30% szansa na zacięcie — stres +3, inaczej dane +1
        if (Math.random() < 0.3) {
          state.player.stress = clamp(state.player.stress + 3, 0, 100);
          showToast('🖨️ Zacięcie papieru! (+3 stres)');
        } else {
          state.player.jira = (state.player.jira||0) + 1; // „Dane” do raportu
          showToast('🖨️ Wydrukowane! 📊 +1 Dane');
          // complete objective if exists
          state.objectives = (state.objectives||[]).filter(o=>o.id!=='printer_check');
        }
        return true;
      }
    }
    return false;
  }

  function showToast(msg) {
    if (!ui.toast) return;
    // rate-limit
    const now = performance.now();
    if (state._toastUntil && now < state._toastUntil) return;
    state._toastUntil = now + 1000;
    ui.toast.textContent = msg;
    ui.toast.classList.remove('hidden');
    if (navigator.vibrate) { try { navigator.vibrate(18); } catch(e){} }
    clearTimeout(state._toastTimer);
    state._toastTimer = setTimeout(()=> ui.toast.classList.add('hidden'), 1200);
  }

  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  function updateRoomLabel() {
    const tile = state.map.get(state.player.x, state.player.y);
    const typeToName = { kitchen: 'Kuchnia', meeting: 'Sala konferencyjna', desk: 'Boksy' };
    state.roomName = typeToName[tile.type] || '';
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


