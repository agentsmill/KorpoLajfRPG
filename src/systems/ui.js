import { renderPortrait } from './portraits.js';
export function openDialog(state, name, text, sub = '') {
  const { overlay, dialog, dialogName, dialogText } = state.ui;
  overlay.classList.remove('hidden');
  dialog.classList.remove('hidden');
  dialogName.textContent = name;
  dialogText.textContent = text;
  const subEl = document.getElementById('dialogSub');
  if (subEl) subEl.textContent = sub || '';
  // draw avatar if present in npcMeta
  const cvs = document.getElementById('dialogAvatar');
  if (cvs) {
    const ctx = cvs.getContext('2d');
    ctx.clearRect(0,0,cvs.width,cvs.height);
    const meta = (state._npcMeta && state._npcMeta[state._currentNpcId]) || null;
    if (meta) renderPortrait(ctx, meta, Math.min(cvs.width, cvs.height));
  }
}

export function closeDialog(state) {
  const { overlay, dialog } = state.ui;
  overlay.classList.add('hidden');
  dialog.classList.add('hidden');
}

export function openChoice(state, title, body, options, onPick) {
  const { overlay, choiceModal, choiceTitle, choiceBody, choiceList } = state.ui;
  overlay.classList.remove('hidden');
  choiceModal.classList.remove('hidden');
  choiceTitle.textContent = title;
  choiceBody.textContent = body || '';
  choiceList.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = `• ${opt.label}`;
    btn.onclick = () => {
      closeChoice(state);
      onPick?.(opt.id);
    };
    choiceList.appendChild(btn);
  });
}

export function closeChoice(state) {
  const { overlay, choiceModal } = state.ui;
  overlay.classList.add('hidden');
  choiceModal.classList.add('hidden');
}

export function showDice(state, { title = 'Rzut', roll, dc, mod, success }) {
  const { overlay, diceModal, diceBody, btnDiceClose } = state.ui;
  if (!diceModal) return;
  overlay.classList.remove('hidden');
  diceModal.classList.remove('hidden');
  const icon = roll >= dc ? '✅' : '❌';
  const detail = `r: ${roll - mod} + m: ${mod} ${dc ? `≥ dc: ${dc}` : ''}`;
  diceBody.textContent = `${title}: ${icon} ${roll}${mod ? ` (mod ${mod>=0?'+':''}${mod})` : ''} ${dc ? `vs DC ${dc}` : ''}\n${detail}`;
  btnDiceClose.onclick = () => { diceModal.classList.add('hidden'); overlay.classList.add('hidden'); success?.(); };
}

// portrait drawing moved to portraits.js


