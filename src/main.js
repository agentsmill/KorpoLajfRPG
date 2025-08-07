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
  btnPopups: document.getElementById('btnPopups'),
  btnHelp: document.getElementById('btnHelp'),
  btnHelpClose: document.getElementById('btnHelpClose'),
  helpModal: document.getElementById('helpModal'),
  btnLog: document.getElementById('btnLog'),
  btnLogClose: document.getElementById('btnLogClose'),
  logModal: document.getElementById('logModal'),
  logList: document.getElementById('logList'),
  btnBingo: document.getElementById('btnBingo'),
  bingoModal: document.getElementById('bingoModal'),
  bingoGrid: document.getElementById('bingoGrid'),
  btnBingoClose: document.getElementById('btnBingoClose'),
  choiceModal: document.getElementById('choiceModal'),
  choiceTitle: document.getElementById('choiceTitle'),
  choiceBody: document.getElementById('choiceBody'),
  choiceList: document.getElementById('choiceList'),
  toast: document.getElementById('toast'),
};

const game = createGame({ canvas, ctx, ui });
game.start();


