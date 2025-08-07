export function openDialog(state, name, text) {
  const { overlay, dialog, dialogName, dialogText } = state.ui;
  overlay.classList.remove('hidden');
  dialog.classList.remove('hidden');
  dialogName.textContent = name;
  dialogText.textContent = text;
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


