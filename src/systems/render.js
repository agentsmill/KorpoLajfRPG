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

      // pastel floors/walls
      ctx.fillStyle = tile.walkable ? '#1a2033' : '#14192b';
      ctx.fillRect(screenX, screenY, TILE, TILE);
      // grid highlight
      ctx.strokeStyle = 'rgba(255,255,255,.04)';
      ctx.strokeRect(screenX + 0.5, screenY + 0.5, TILE - 1, TILE - 1);

      // simple office accents
      if (tile.type === 'desk') {
        ctx.fillStyle = '#2b3352';
        ctx.fillRect(screenX + 2, screenY + 6, 12, 8);
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(screenX + 3, screenY + 7, 5, 3);
      }
      if (tile.type === 'kitchen') {
        ctx.fillStyle = '#2f3a63';
        ctx.fillRect(screenX + 1, screenY + 1, 14, 14);
        ctx.fillStyle = '#a5b4fc';
        ctx.fillRect(screenX + 6, screenY + 6, 4, 4);
        // coffee steam particles
        drawSteam(ctx, screenX + 8, screenY + 6);
        // Stefan plant
        ctx.fillStyle = '#34d399';
        ctx.fillRect(screenX + 3, screenY + 10, 2, 3);
        ctx.fillRect(screenX + 2, screenY + 9, 4, 1);
      }
      if (tile.type === 'meeting') {
        ctx.strokeStyle = '#2a3558';
        ctx.strokeRect(screenX + 1, screenY + 1, 14, 14);
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
  ui.hudQuest.textContent = state.quests.currentTitle();
}

export function drawScene(state, ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  drawGrid(ctx, state.map, state.camera, canvas);
  drawNPCs(ctx, state.npcs, state.camera);
  drawPlayer(ctx, state.player, state.camera);
  drawHUD(state, canvas);
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


