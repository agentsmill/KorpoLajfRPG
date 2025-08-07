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
  hudQuest: document.getElementById('hudQuest'),
  hudClock: document.getElementById('hudClock'),
  btnMusic: document.getElementById('btnMusic'),
  btnTimeMode: document.getElementById('btnTimeMode'),
  btnPopups: document.getElementById('btnPopups'),
  btnHelp: document.getElementById('btnHelp'),
  btnHelpClose: document.getElementById('btnHelpClose'),
  helpModal: document.getElementById('helpModal'),
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
  trackerList: document.getElementById('trackerList'),
  toast: document.getElementById('toast'),
  hudFaction: document.getElementById('hudFaction'),
};

const game = createGame({ canvas, ctx, ui });
game.start();

// Responsive canvas with DPR scaling
function resizeCanvas() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const cssW = canvas.clientWidth || 768;
  const cssH = Math.round(cssW * 0.75);
  canvas.style.height = cssH + 'px';
  const needW = Math.round(cssW * dpr);
  const needH = Math.round(cssH * dpr);
  if (canvas.width !== needW || canvas.height !== needH) {
    canvas.width = needW; canvas.height = needH;
  }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


