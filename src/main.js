import { createGame } from './systems/game.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ui = {
  overlay: document.getElementById('overlay'),
  dialog: document.getElementById('dialog'),
  dialogName: document.getElementById('dialogName'),
  dialogText: document.getElementById('dialogText'),
  hudCoffee: document.getElementById('hudCoffee'),
  hudStress: document.getElementById('hudStress'),
  hudJira: document.getElementById('hudJira'),
  hudInvCount: document.getElementById('hudInvCount'),
  hudQuest: document.getElementById('hudQuest'),
  hudClock: document.getElementById('hudClock'),
  btnMusic: document.getElementById('btnMusic'),
  btnTimeMode: document.getElementById('btnTimeMode'),
  btnPopups: document.getElementById('btnPopups'),
  btnHelp: document.getElementById('btnHelp'),
  btnHelpClose: document.getElementById('btnHelpClose'),
  helpModal: document.getElementById('helpModal'),
  btnFinish: document.getElementById('btnFinish'),
  btnFactions: document.getElementById('btnFactions'),
  btnTracker: document.getElementById('btnTracker'),
  trackerModal: document.getElementById('trackerModal'),
  btnTrackerClose: document.getElementById('btnTrackerClose'),
  btnLog: document.getElementById('btnLog'),
  btnLogClose: document.getElementById('btnLogClose'),
  logModal: document.getElementById('logModal'),
  logList: document.getElementById('logList'),
  btnBingo: document.getElementById('btnBingo'),
  bingoModal: document.getElementById('bingoModal'),
  bingoGrid: document.getElementById('bingoGrid'),
  btnBingoClose: document.getElementById('btnBingoClose'),
  btnPhone: document.getElementById('btnPhone'),
  phoneModal: document.getElementById('phoneModal'),
  inboxList: document.getElementById('inboxList'),
  invList: document.getElementById('invList'),
  btnPhoneClose: document.getElementById('btnPhoneClose'),
  btnPause: document.getElementById('btnPause'),
  pauseModal: document.getElementById('pauseModal'),
  btnContinue: document.getElementById('btnContinue'),
  btnNewGame: document.getElementById('btnNewGame'),
  choiceModal: document.getElementById('choiceModal'),
  choiceTitle: document.getElementById('choiceTitle'),
  choiceBody: document.getElementById('choiceBody'),
  choiceList: document.getElementById('choiceList'),
  diceModal: document.getElementById('diceModal'),
  diceBody: document.getElementById('diceBody'),
  btnDiceClose: document.getElementById('btnDiceClose'),
  skillsModal: document.getElementById('skillsModal'),
  skillsCounter: document.getElementById('skillsCounter'),
  skillsConfirm: document.getElementById('skillsConfirm'),
  repIT: document.getElementById('repIT'),
  repHR: document.getElementById('repHR'),
  repMGMT: document.getElementById('repMGMT'),
  factionsModal: document.getElementById('factionsModal'),
  btnFactionsClose: document.getElementById('btnFactionsClose'),
  trackerList: document.getElementById('trackerList'),
  toast: document.getElementById('toast'),
  hudFaction: document.getElementById('hudFaction'),
  // joystick
  joy: document.getElementById('joy'),
  joyKnob: document.getElementById('joyKnob'),
};

const game = createGame({ canvas, ctx, ui });
game.start();

// Responsive canvas with DPR scaling
function resizeCanvas() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  // Reserve space for HUD (top) and on-screen controls (bottom) on mobile
  const hud = document.getElementById('hud');
  const dpad = document.getElementById('dpad');
  const act = document.getElementById('actionConfirm');
  const hudH = hud ? Math.ceil(hud.getBoundingClientRect().height) + 12 : 0;
  const bottomH = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
    ? Math.max(
        dpad ? Math.ceil(dpad.getBoundingClientRect().height) + 16 : 0,
        act ? Math.ceil(act.getBoundingClientRect().height) + 16 : 0
      )
    : 0;
  const availH = Math.max(200, vh - hudH - bottomH);
  // canvas aspect 4:3, maximize within width and available height
  let cssW = Math.min(vw, Math.round(availH * (4/3)));
  let cssH = Math.min(availH, Math.round(vw * 0.75));
  // maintain exact 4:3
  if (cssW / cssH > 4/3) cssW = Math.round(cssH * (4/3));
  else cssH = Math.round(cssW * 3/4);
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  const needW = Math.round(cssW * dpr);
  const needH = Math.round(cssH * dpr);
  if (canvas.width !== needW || canvas.height !== needH) {
    canvas.width = needW; canvas.height = needH;
  }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// D-Pad controls (coarse pointer devices)
(() => {
  const dpad = document.getElementById('dpad');
  if (!dpad) return;
  const held = { x:0, y:0 };
  let raf = 0;
  const speed = 1; // normalized unit per tick; game applies delta & speed
  function tick(){
    if ((held.x !== 0 || held.y !== 0) && window._joy) {
      window._joy.dx = held.x; window._joy.dy = held.y; window._joy.active = true;
    }
    raf = requestAnimationFrame(tick);
  }
  function startDir(x,y){ held.x = x; held.y = y; window._joy = { dx:x, dy:y, active:true }; if (!raf) raf = requestAnimationFrame(tick); }
  function endDir(){ held.x = 0; held.y = 0; window._joy = { dx:0, dy:0, active:false }; }
  dpad.querySelectorAll('.dpad-btn').forEach(btn => {
    const x = parseFloat(btn.dataset.x), y = parseFloat(btn.dataset.y);
    const start = (e)=>{ e.preventDefault(); startDir(x,y); };
    const end = (e)=>{ e.preventDefault(); endDir(); };
    btn.addEventListener('touchstart', start, {passive:false});
    btn.addEventListener('touchend', end, {passive:false});
    btn.addEventListener('touchcancel', end, {passive:false});
    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup', end);
    btn.addEventListener('mouseleave', end);
  });
})();

// Mobile confirm button triggers in-game interaction (like pressing E)
(() => {
  const btn = document.getElementById('actionConfirm');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (game.requestInteract) game.requestInteract();
  });
})();


