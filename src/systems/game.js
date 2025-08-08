import { loadAssets } from './loader.js';
import { makeOfficeMap } from '../world/officeMap.js';
import { createPlayer } from '../world/player.js';
import { createNPCs } from '../world/npcs.js';
import { drawScene } from './render.js';
import { openDialog, closeDialog, openChoice } from './ui.js';
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
    zoom: 1,
    _interactRequested: false,
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
      // prefer bigger zoom on touch devices for readability
      try {
        const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        state.zoom = isTouch ? 1.8 : 1.0;
      } catch (e) { state.zoom = 1.0; }
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
      // WASD aliases
      const keyMap = { w:'arrowup', s:'arrowdown', a:'arrowleft', d:'arrowright' };
      window.addEventListener('keydown', (e)=>{ const m=keyMap[e.key.toLowerCase()]; if(m){e.preventDefault(); state.keys.add(m);} });
      window.addEventListener('keyup', (e)=>{ const m=keyMap[e.key.toLowerCase()]; if(m){ state.keys.delete(m);} });
      // assign sprites
      state.player.sprite = state.sprites.makeSprite('#06d6a0');
      for (const n of state.npcs) n.sprite = state.sprites.makeSprite(n.color, `${n.id}::${n.faction||'neutral'}`);
      // build NPC meta index for dialog avatars and subs
      state._npcMeta = Object.fromEntries(state.npcs.map(n => [n.id, { faction:n.faction, hair:n.hair, skin:n.skin, shirt:n.shirt, mood:n.mood, bio:n.bio, name:n.name }]));

      // UI modals
      ui.btnHelp?.addEventListener('click', () => ui.helpModal.classList.remove('hidden'));
      ui.btnHelpClose?.addEventListener('click', () => ui.helpModal.classList.add('hidden'));
      // Tracker modal
      ui.btnTracker?.addEventListener('click', () => { updateTracker(); ui.overlay?.classList.remove('hidden'); ui.trackerModal?.classList.remove('hidden'); });
      ui.btnTrackerClose?.addEventListener('click', () => { ui.trackerModal?.classList.add('hidden'); ui.overlay?.classList.add('hidden'); });
      ui.btnLog?.addEventListener('click', () => { updateLogUI(); ui.logModal.classList.remove('hidden'); });
      ui.btnLogClose?.addEventListener('click', () => ui.logModal.classList.add('hidden'));
      ui.btnBingo?.addEventListener('click', openBingo);
      ui.btnBingoClose?.addEventListener('click', () => ui.bingoModal.classList.add('hidden'));
      // Finish now (go to CEO)
      ui.btnFinish?.addEventListener('click', () => goToCEO());
      // Phone
      ui.btnPhone?.addEventListener('click', () => { updatePhoneUI(); ui.phoneModal?.classList.remove('hidden'); ui.overlay?.classList.remove('hidden'); });
      ui.btnPhoneClose?.addEventListener('click', () => { ui.phoneModal?.classList.add('hidden'); ui.overlay?.classList.add('hidden'); });
      // Tap anywhere on the dialog to advance (works on mobile)
      ui.dialog?.addEventListener('click', (e) => {
        if (e.target && (e.target.id === 'dialogClose')) return;
        state._interactRequested = true;
      });
      // Factions modal
      ui.btnFactions?.addEventListener('click', () => { ui.overlay?.classList.remove('hidden'); ui.factionsModal?.classList.remove('hidden'); });
      ui.btnFactionsClose?.addEventListener('click', () => { ui.factionsModal?.classList.add('hidden'); ui.overlay?.classList.add('hidden'); });
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
      // Time Mode switch (30/60/90/∞) – we use btnTimeMode if present
      ui.btnTimeMode?.addEventListener('click', () => {
        const seq = [510/(30*60), 510/(60*60), 510/(90*60), 0];
        const s = state.timeScale ?? seq[0];
        const idx = seq.findIndex(v => Math.abs((s||0) - v) < 1e-6);
        state.timeScale = seq[(idx + 1) % seq.length];
        // update HUD label if present
        const label = state.timeScale === 0 ? '∞' : (Math.abs(state.timeScale - 510/(60*60)) < 1e-6 ? '60m' : Math.abs(state.timeScale - 510/(90*60)) < 1e-6 ? '90m' : '30m');
        ui.btnTimeMode.textContent = `⏱️ ${label}`;
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
    // On-screen controls (D-Pad or programmatic tap-to-move)
    if (window._joy && window._joy.active) {
      move.x += Math.max(-1, Math.min(1, window._joy.dx || 0));
      move.y += Math.max(-1, Math.min(1, window._joy.dy || 0));
    }

    // tap-to-move steering if present
    const t = state._getTapTarget ? state._getTapTarget() : null;
    if (t) {
      const dx = t.x - state.player.x;
      const dy = t.y - state.player.y;
      const dist = Math.hypot(dx,dy);
      if (dist > 0.15) { move.x += dx/dist; move.y += dy/dist; }
      else { /* close enough: clear target */ state._getTapTarget = ()=>null; }
    }

    // Auto-interact when we approached position tapped on
    if (state._tapInteract) {
      const d2 = Math.hypot(state._tapInteract.x - state.player.x, state._tapInteract.y - state.player.y);
      if (d2 < 1.2) { state._interactRequested = true; state._tapInteract = null; }
    }

    // normalize
    if (move.x !== 0 && move.y !== 0) { move.x *= 0.7071; move.y *= 0.7071; }

    const nextX = state.player.x + move.x * speed * delta;
    const nextY = state.player.y + move.y * speed * delta;

    if (state.map.isWalkable(nextX, state.player.y)) state.player.x = nextX;
    if (state.map.isWalkable(state.player.x, nextY)) state.player.y = nextY;

    // Smooth camera follow (lerp)
    const vw = canvas.width / Math.max(1, state.zoom || 1);
    const vh = canvas.height / Math.max(1, state.zoom || 1);
    const targetCamX = state.player.x * 16 - vw / 2 + 8;
    const targetCamY = state.player.y * 16 - vh / 2 + 8;
    const lerp = 1 - Math.pow(0.001, delta); // frame-rate independent
    state.camera.x = Math.floor(state.camera.x + (targetCamX - state.camera.x) * lerp);
    state.camera.y = Math.floor(state.camera.y + (targetCamY - state.camera.y) * lerp);

      // interaction (keyboard E or mobile confirm button)
    if (state.keys.has('e') || state._interactRequested) {
      state.keys.delete('e');
      state._interactRequested = false;
      if (state.story.consumeInteraction()) return;
      // If dialogue is already active, advance it instead of starting a new one
      if (state.dialogue?.isActive && state.dialogue.isActive()) {
        state.dialogue.consumeInteraction();
        return;
      }
      // interaktywne obiekty (kuchnia/roślina)
      if (tryUseInteractive()) return;
      const target = state.npcs.find(n => Math.hypot(n.x - state.player.x, n.y - state.player.y) < 1.6);
      if (target) {
          state._currentNpcId = target.id;
        // route to dialogue trees by NPC id
        if (['janusz','hr','scrum','ceo','admin','pm','ux','qa','fin','ops','sec','sec2','mkt1','mkt2','law1','law2','rnd1','rnd2','diz1','acc1','lou1','ter1','ops2','sec3','ds1','pr1','it2','hr2','fac1','mkt3','rnd3','vip1'].includes(target.id)) {
          const treeId = (target.id === 'scrum' || target.id === 'pm') ? 'mgmt' : target.id;
          state.dialogue.start(treeId, 'start');
        } else {
          // Lekki smalltalk dla NPC bez drzewka
          const faction = (target.faction||'neutral').toUpperCase();
          const body = `Rozmawiasz z ${target.name}.`; 
          const opts = [
            { id:'hi', label:'Co słychać?' },
            { id:'advice', label:'Masz jakąś radę?' },
            { id:'bye', label:'Do zobaczenia' },
          ];
          openChoice(state, target.name, body, opts, (pick)=>{
            if (pick==='hi') addLog('Smalltalk: krótkie „cześć”.');
            if (pick==='advice') { addLog('Usłyszałeś drobną radę.'); state.player.stress = Math.max(0, state.player.stress - 2); }
          });
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

    updateInteractionHint();

    // time flow according to selected mode
    if ((state.timeScale ?? 510/(30*60)) > 0) {
      state.timeMinutes += delta * (state.timeScale ?? 510/(30*60));
    }
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
      // Tap-to-move: click/touch on canvas sets a target; player podąża
      let tapTarget = null;
      function setTapTarget(e){
        const rect = canvas.getBoundingClientRect();
        const cx = (e.touches?e.touches[0].clientX:e.clientX) - rect.left;
        const cy = (e.touches?e.touches[0].clientY:e.clientY) - rect.top;
        const scale = Math.max(1, state.zoom||1);
        const worldX = (cx * (canvas.width/rect.width) / scale + state.camera.x) / 16;
        const worldY = (cy * (canvas.height/rect.height) / scale + state.camera.y) / 16;
        tapTarget = { x: worldX, y: worldY };
        // prepare auto-interact when target is NPC or interactive tile
        const nearNpc = state.npcs.find(n => Math.hypot(n.x - worldX, n.y - worldY) < 0.9);
        if (nearNpc) state._tapInteract = { x: nearNpc.x, y: nearNpc.y };
        else {
          const tx = Math.round(worldX), ty = Math.round(worldY);
          const tt = state.map.get(tx, ty);
          if (tt && (tt.type==='espresso'||tt.type==='fridge'||tt.type==='plant'||tt.type==='printer')) state._tapInteract = { x: tx, y: ty };
        }
      }
      canvas.addEventListener('touchstart', (e)=>{ if (document.querySelector('.modal:not(.hidden)')) return; setTapTarget(e); }, {passive:false});
      canvas.addEventListener('mousedown', (e)=>{ if (document.querySelector('.modal:not(.hidden)')) return; setTapTarget(e); });

      requestAnimationFrame(loop);
      // integrate tapTarget into movement
      state._getTapTarget = ()=>tapTarget;
    });
  }

  function requestInteract() {
    state._interactRequested = true;
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
    // Add simple hotkeys: 1=30min, 2=60min, 3=90min, 4=∞
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === '1') state.timeScale = 510 / (30 * 60);
      if (e.key === '2') state.timeScale = 510 / (60 * 60);
      if (e.key === '3') state.timeScale = 510 / (90 * 60);
      if (e.key === '4') state.timeScale = 0;
      updateTimeModeButton();
    });

    // HUD button to cycle modes
    if (ui.btnTimeMode) {
      ui.btnTimeMode.onclick = () => {
        const seq = [510/(30*60), 510/(60*60), 510/(90*60), 0];
        const s = state.timeScale ?? seq[0];
        const idx = seq.findIndex(v => Math.abs((s||0) - v) < 1e-6);
        state.timeScale = seq[(idx + 1) % seq.length];
        updateTimeModeButton();
      };
      updateTimeModeButton();
    }
  }

  function updateTimeModeButton() {
    if (!ui.btnTimeMode) return;
    const s = state.timeScale ?? 510 / (30 * 60);
    let label = '30m';
    if (s === 0) label = '∞';
    else if (Math.abs(s - 510/(60*60)) < 1e-6) label = '60m';
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
    // auto route to CEO at 17:30 for limited modes
    if ((state.timeScale ?? 510/(30*60)) > 0 && t >= 17*60 + 30 && !state._autoCEO) {
      state._autoCEO = true;
      goToCEO();
    }
  }

  function updateInteractionHint() {
    // znajdź najbliższy obiekt interaktywny/NPC i ustaw hint
    let hint = null;
    const nearObj = (dx,dy)=> Math.hypot(dx,dy) < 1.4;
    // objects
    const px = Math.round(state.player.x), py = Math.round(state.player.y);
    const around = [[px,py],[px+1,py],[px-1,py],[px,py+1],[px,py-1]];
    for (const [x,y] of around) {
      const t = state.map.get(x,y); if (!t) continue;
      if (t.type==='espresso') hint = { label:'[E] Espresso' };
      if (t.type==='fridge') hint = { label:'[E] Lodówka' };
      if (t.type==='plant') hint = { label:'[E] Stefan' };
      if (t.type==='printer') hint = { label:'[E] Drukarka' };
      if (hint) break;
    }
    if (!hint) {
      const npc = state.npcs.find(n => Math.hypot(n.x - state.player.x, n.y - state.player.y) < 1.6);
      if (npc) hint = { label:`[E] Rozmowa: ${npc.name}` };
    }
    state._hint = hint;
  }

  function goToCEO() {
    const ceo = state.npcs.find(n => n.id === 'ceo');
    state.cinematic.active = true;
    state.cinematic.zoom = 2.0;
    state.cinematic.focus = ceo ? { x: ceo.x, y: ceo.y } : { x: state.player.x, y: state.player.y };
    setTimeout(() => {
      state.cinematic.active = false;
      if ((state.flags||{}).board_invite) state.dialogue.start('ceo', 'c1');
      else state.dialogue.start('ceo', 'start');
    }, 350);
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

  return { start, requestInteract };
}


