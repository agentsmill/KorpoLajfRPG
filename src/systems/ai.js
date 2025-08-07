// Simple wandering AI for NPCs (RimWorld-like ambience)
export function updateNPCs(state, deltaSeconds) {
  const npcs = state.npcs || [];
  for (const npc of npcs) {
    if (!npc.ai) npc.ai = createAI(npc);
    stepAI(npc, state, deltaSeconds);
  }
}

function createAI(npc) {
  return {
    mode: 'idle',
    wait: rand(1, 4),
    speed: 2 + Math.random() * 1.5, // tiles/sec
    target: null,
  };
}

function stepAI(npc, state, dt) {
  const ai = npc.ai;
  ai.wait -= dt;
  if (ai.mode === 'idle') {
    if (ai.wait <= 0) {
      ai.target = pickTargetNear(npc, state, 6 + Math.floor(Math.random() * 8));
      ai.mode = ai.target ? 'move' : 'idle';
      ai.wait = rand(2, 5);
    }
    return;
  }
  if (ai.mode === 'move' && ai.target) {
    const dx = ai.target.x - npc.x;
    const dy = ai.target.y - npc.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.1) { ai.mode = 'idle'; ai.wait = rand(1, 3); return; }
    const step = Math.min(dist, ai.speed * dt);
    const nx = npc.x + (dx / dist) * step;
    const ny = npc.y + (dy / dist) * step;
    // collision with map walkability
    if (state.map.isWalkable(nx, npc.y)) npc.x = nx; else ai.target = null;
    if (state.map.isWalkable(npc.x, ny)) npc.y = ny; else ai.target = null;
    return;
  }
}

function pickTargetNear(npc, state, radius) {
  const tries = 16;
  for (let i = 0; i < tries; i++) {
    const tx = Math.round(npc.x + rand(-radius, radius));
    const ty = Math.round(npc.y + rand(-radius, radius));
    if (state.map.isWalkable(tx, ty)) return { x: tx, y: ty };
  }
  return null;
}

function rand(a, b) { return a + Math.random() * (b - a); }


