import { openDialog } from './ui.js';

const TILE = 16;

function drawGrid(ctx, map, camera, canvas) {
  const cols = Math.ceil(canvas.width / TILE) + 2;
  const rows = Math.ceil(canvas.height / TILE) + 2;
  const startCol = Math.floor(camera.x / TILE);
  const startRow = Math.floor(camera.y / TILE);
  const offX = posMod(camera.x, TILE);
  const offY = posMod(camera.y, TILE);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const tileX = startCol + x;
      const tileY = startRow + y;
      const tile = map.get(tileX, tileY);
      const screenX = x * TILE - offX;
      const screenY = y * TILE - offY;

      // RimWorld-like: distinct floors, walls and shadows
      if (!tile.walkable) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(screenX, screenY, TILE, TILE);
        // inner shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(screenX, screenY+TILE-3, TILE, 3);
      } else {
        const base = tile.type === 'desk' ? '#1b2440' : tile.type === 'kitchen' ? '#172035' : tile.type === 'meeting' ? '#16243a' : tile.type === 'server' ? '#101a2e' : '#151f36';
        ctx.fillStyle = base;
        ctx.fillRect(screenX, screenY, TILE, TILE);
        // subtle checker for texture
        if (((tileX + tileY) & 1) === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.025)';
          ctx.fillRect(screenX, screenY, TILE, TILE);
        }
      }

      // simple office accents
      if (tile.type === 'desk') {
        // desk + monitor shadow
        ctx.fillStyle = '#26334d'; ctx.fillRect(screenX + 2, screenY + 6, 12, 8);
        ctx.fillStyle = '#7dd3fc'; ctx.fillRect(screenX + 3, screenY + 7, 5, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(screenX+2, screenY+13, 12, 2);
      }
      if (tile.type === 'kitchen') {
        // minimalistyczna kuchnia: jeden blat, okap, światło; bez mnożenia lodówek
        ctx.fillStyle = '#263558'; ctx.fillRect(screenX + 1, screenY + 1, 14, 14);
        // blat
        ctx.fillStyle = '#1f2937'; ctx.fillRect(screenX + 2, screenY + 10, 12, 3);
        // kubki/kapsułki
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(screenX + 4, screenY + 9, 1, 1);
        ctx.fillStyle = '#93c5fd'; ctx.fillRect(screenX + 6, screenY + 9, 1, 1);
        // lampka/okap
        ctx.fillStyle = '#0f172a'; ctx.fillRect(screenX + 2, screenY + 3, 12, 1);
      }
      if (tile.type === 'plant') { ctx.fillStyle = '#34d399'; ctx.fillRect(screenX+6, screenY+8, 3, 5); ctx.fillStyle='#166534'; ctx.fillRect(screenX+5, screenY+7, 5, 1); }
      if (tile.type === 'fridge') { ctx.fillStyle = '#94a3b8'; ctx.fillRect(screenX+3,screenY+3,10,12); ctx.fillStyle='#0f172a'; ctx.fillRect(screenX+4,screenY+6,1,2);} 
      if (tile.type === 'espresso') { ctx.fillStyle = '#1f2937'; ctx.fillRect(screenX+4,screenY+8,8,4); ctx.fillStyle='#f59e0b'; ctx.fillRect(screenX+6,screenY+7,2,1); }
      if (tile.type === 'meeting') { ctx.strokeStyle = '#2a3558'; ctx.strokeRect(screenX + 1, screenY + 1, 14, 14); }
      if (tile.type === 'server') { ctx.fillStyle = '#0ea5e9'; ctx.fillRect(screenX+4, screenY+4, 2, 8); ctx.fillStyle = '#38bdf8'; ctx.fillRect(screenX+8, screenY+4, 2, 8); }
      if (tile.type === 'printer') {
        ctx.fillStyle = '#cbd5e1'; ctx.fillRect(screenX+3, screenY+6, 10, 7);
        ctx.fillStyle = '#0f172a'; ctx.fillRect(screenX+4, screenY+7, 8, 1);
        ctx.fillStyle = '#e2e8f0'; ctx.fillRect(screenX+5, screenY+4, 6, 2); // kartka
      }
    }
  }
}

function drawNPCs(ctx, npcs, camera) {
  for (const n of npcs) {
    const x = Math.floor(n.x * TILE - camera.x);
    const y = Math.floor(n.y * TILE - camera.y);
    if (n.sprite) {
      drawSprite(ctx, n.sprite, x, y);
    } else {
      ctx.fillStyle = n.color;
      ctx.fillRect(x - 6, y - 10, 12, 12);
      ctx.fillStyle = '#000';
      ctx.fillRect(x - 3, y - 7, 2, 2);
      ctx.fillRect(x + 1, y - 7, 2, 2);
    }
    // mini-ikonka frakcji nad NPC
    const f = n.faction || 'neutral';
    const fx = x;
    const fy = y - 20;
    ctx.save();
    ctx.translate(fx, fy);
    ctx.fillStyle = f === 'it' ? '#7dd3fc' : f === 'hr' ? '#fda4af' : f === 'mgmt' ? '#a5b4fc' : '#94a3b8';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

function drawPlayer(ctx, player, camera) {
  const x = Math.floor(player.x * TILE - camera.x);
  const y = Math.floor(player.y * TILE - camera.y);
  if (player.sprite) {
    drawSprite(ctx, player.sprite, x, y);
  } else {
    ctx.fillStyle = '#06d6a0';
    ctx.fillRect(x - 6, y - 10, 12, 12);
    ctx.fillStyle = '#000';
    ctx.fillRect(x - 3, y - 7, 2, 2);
    ctx.fillRect(x + 1, y - 7, 2, 2);
  }
}

function drawHUD(state, canvas) {
  const { ui } = state;
  ui.hudCoffee.textContent = String(state.player.coffee);
  ui.hudStress.textContent = String(Math.round(state.player.stress));
  ui.hudJira.textContent = String(state.player.jira);
  if (ui.hudInvCount) ui.hudInvCount.textContent = String((state.inventory||[]).length);
  ui.hudQuest.textContent = state.quests.currentTitle();
  // faction bars + dynamic affiliation label
  const it = Math.max(-100, Math.min(100, state.rep.it||0));
  const hr = Math.max(-100, Math.min(100, state.rep.hr||0));
  const mg = Math.max(-100, Math.min(100, state.rep.mgmt||0));
  if (ui.repIT) ui.repIT.style.width = `${(it+100)/2}%`;
  if (ui.repHR) ui.repHR.style.width = `${(hr+100)/2}%`;
  if (ui.repMGMT) ui.repMGMT.style.width = `${(mg+100)/2}%`;
}

export function drawScene(state, ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  const cine = state.cinematic;
  if (cine?.active) {
    const zoom = Math.max(1, Math.min(2.2, cine.zoom || 1.6));
    const focus = cine.focus || { x: state.player.x, y: state.player.y };
    const tempCam = {
      x: Math.floor(focus.x * TILE - (canvas.width / zoom) / 2 + 8),
      y: Math.floor(focus.y * TILE - (canvas.height / zoom) / 2 + 8),
    };
    ctx.save();
    ctx.scale(zoom, zoom);
    drawGrid(ctx, state.map, tempCam, canvas);
    drawNPCs(ctx, state.npcs, tempCam);
    drawPlayer(ctx, state.player, tempCam);
    ctx.restore();
    // letterbox bars
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    const barH = Math.round(canvas.height * 0.12);
    ctx.fillRect(0, 0, canvas.width, barH);
    ctx.fillRect(0, canvas.height - barH, canvas.width, barH);
    // subtle vignette
    const grad = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) * 0.2,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height) * 0.65
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    const zoom = Math.max(1, state.zoom || 1);
    const view = { width: canvas.width / zoom, height: canvas.height / zoom };
    ctx.save();
    ctx.scale(zoom, zoom);
    drawGrid(ctx, state.map, state.camera, view);
    drawNPCs(ctx, state.npcs, state.camera);
    drawPlayer(ctx, state.player, state.camera);
    ctx.restore();
  }
  // subtle dust particles overlay
  drawDust(ctx, canvas);
  drawHUD(state, canvas);
  drawObjectiveArrow(state, ctx, canvas);
  drawRoomLabel(state, ctx, canvas);
  drawZoneLabels(state, ctx, canvas);
  drawInteractiveHints(state, ctx);
  drawStressGlow(state, ctx, canvas);
  drawEHint(state, ctx, canvas);
}

let animTime = 0;
function drawSprite(ctx, sheet, x, y) {
  animTime = (animTime + 1) % 60;
  const frame = Math.floor(animTime / 20) % 3; // 3 frames
  const fw = sheet.width / 3;
  const fh = sheet.height;
  const scale = 2;
  const destW = fw * scale;
  const destH = fh * scale;
  const destX = Math.round(x - destW / 2);
  const destY = Math.round(y + 4 - destH);
  ctx.drawImage(sheet, frame * fw, 0, fw, fh, destX, destY, destW, destH);
}

function posMod(n, m) { const r = n % m; return r < 0 ? r + m : r; }

function drawSteam(ctx, cx, cy) {
  const t = (performance.now() / 1000) % 10;
  for (let i = 0; i < 3; i++) {
    const off = (t * 20 + i * 40) % 40;
    const y = cy - off * 0.1;
    const x = cx + Math.sin((off + i * 10) * 0.1) * 1.5;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(Math.round(x), Math.round(y), 1, 2);
  }
}

function drawDust(ctx, canvas) {
  const n = 60;
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#ffffff';
  const t = performance.now() * 0.001;
  for (let i = 0; i < n; i++) {
    const x = (Math.sin(t * 0.13 + i) * 0.5 + 0.5) * canvas.width;
    const y = (Math.cos(t * 0.17 + i * 1.7) * 0.5 + 0.5) * canvas.height;
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  ctx.restore();
}

function drawObjectiveArrow(state, ctx, canvas) {
  const target = state.objective;
  if (!target || !state.ui.trackerText) return;
  state.ui.trackerText.textContent = target.label || 'Cel';
  const px = state.player.x * TILE - state.camera.x;
  const py = state.player.y * TILE - state.camera.y;
  const tx = target.x * TILE - state.camera.x;
  const ty = target.y * TILE - state.camera.y;
  const dx = tx - px, dy = ty - py;
  const ang = Math.atan2(dy, dx);
  const cxm = canvas.width - 24, cym = 24;
  ctx.save();
  ctx.translate(cxm, cym);
  ctx.rotate(ang);
  ctx.fillStyle = '#7dd3fc';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-10, 4);
  ctx.lineTo(-10, -4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawRoomLabel(state, ctx, canvas) {
  if (!state.roomName) return;
  ctx.save();
  ctx.fillStyle = 'rgba(26,32,51,0.7)';
  ctx.fillRect(canvas.width - 180, canvas.height - 28, 172, 22);
  ctx.strokeStyle = '#2a2f36';
  ctx.strokeRect(canvas.width - 180, canvas.height - 28, 172, 22);
  ctx.fillStyle = '#d8e1ff';
  ctx.font = '12px monospace';
  ctx.fillText(state.roomName, canvas.width - 168, canvas.height - 14);
  ctx.restore();
}

function drawZoneLabels(state, ctx, canvas) {
  const zones = state.map.zones || [];
  ctx.save();
  ctx.fillStyle = 'rgba(15,23,42,0.6)';
  ctx.strokeStyle = '#1f2937';
  ctx.font = '10px monospace';
  for (const z of zones) {
    const x = Math.floor(z.x * TILE - state.camera.x);
    const y = Math.floor(z.y * TILE - state.camera.y);
    const w = ctx.measureText(z.label).width + 10;
    ctx.fillRect(x - w/2, y - 18, w, 14);
    ctx.strokeRect(x - w/2, y - 18, w, 14);
    ctx.fillStyle = '#dbeafe';
    ctx.fillText(z.label, x - w/2 + 5, y - 7);
    ctx.fillStyle = 'rgba(15,23,42,0.6)';
  }
  ctx.restore();
}

function drawInteractiveHints(state, ctx) {
  // pulsujący wskaźnik przy ekspresie i lodówce, jeśli cooldown minął
  const t = (performance.now() * 0.005) % (Math.PI*2);
  const pulse = (Math.sin(t) * 0.5 + 0.5) * 0.6 + 0.2;
  const mark = (wx, wy, color) => {
    const sx = Math.floor(wx * TILE - state.camera.x + 8);
    const sy = Math.floor(wy * TILE - state.camera.y + 4);
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  };
  for (let y=0; y<state.map.height; y++) {
    for (let x=0; x<state.map.width; x++) {
      const t = state.map.get(x, y);
      if (!t || !t.type) continue;
      if (t.type === 'espresso' || t.type === 'fridge' || t.type === 'printer') {
        mark(x, y, t.type === 'espresso' ? '#f59e0b' : '#93c5fd');
      }
    }
  }
}

function drawEHint(state, ctx, canvas) {
  if (!state._hint) return;
  const msg = state._hint.label;
  ctx.save();
  ctx.font = '12px monospace';
  const w = Math.ceil(ctx.measureText(msg).width) + 12;
  const x = 12, y = canvas.height - 42;
  ctx.fillStyle = 'rgba(17,23,40,0.8)';
  ctx.fillRect(x, y, w, 24);
  ctx.strokeStyle = '#2a2f36';
  ctx.strokeRect(x, y, w, 24);
  ctx.fillStyle = '#dbeafe';
  ctx.fillText(msg, x + 6, y + 16);
  ctx.restore();
}

function drawStressGlow(state, ctx, canvas) {
  const s = Math.max(0, Math.min(100, state.player.stress||0));
  if (s < 40) return;
  const alpha = ((s-40)/60) * 0.25;
  ctx.save();
  ctx.fillStyle = `rgba(239,71,111,${alpha.toFixed(3)})`;
  ctx.fillRect(0,0,canvas.width, canvas.height);
  ctx.restore();
}


