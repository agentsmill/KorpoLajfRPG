// Procedural pixel-art spritesheets rendered to offscreen canvas (8x12 per frame)
export function createSprites() {
  const cache = new Map();

  function makeSprite(baseColor) {
    const key = baseColor;
    if (cache.has(key)) return cache.get(key);
    const canvas = document.createElement('canvas');
    const w = 12, h = 18; // bigger, clearer characters
    canvas.width = w * 3; // 3 frames walk cycle
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    for (let f = 0; f < 3; f++) {
      const ox = f * w;
      // outline shadow
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.fillRect(ox + 1, 4, 10, 12);
      // head
      ctx.fillStyle = shade(baseColor, 0);
      ctx.fillRect(ox + 2, 2, 8, 8);
      // eyes
      ctx.fillStyle = '#0b1220';
      ctx.fillRect(ox + 4, 5, 2, 2);
      ctx.fillRect(ox + 8, 5, 2, 2);
      // body
      ctx.fillStyle = shade(baseColor, -20);
      ctx.fillRect(ox + 3, 10, 6, 3);
      // legs animate
      ctx.fillStyle = shade(baseColor, -40);
      if (f === 0) { ctx.fillRect(ox + 3, 13, 3, 3); ctx.fillRect(ox + 8, 13, 3, 3); }
      if (f === 1) { ctx.fillRect(ox + 4, 13, 3, 3); ctx.fillRect(ox + 7, 13, 3, 3); }
      if (f === 2) { ctx.fillRect(ox + 5, 13, 3, 3); ctx.fillRect(ox + 6, 13, 3, 3); }
      // pastel accent scarf
      ctx.fillStyle = '#a5b4fc';
      ctx.fillRect(ox + 2, 9, 2, 2);
    }

    cache.set(key, canvas);
    return canvas;
  }

  function shade(hex, delta) {
    const c = parseInt(hex.slice(1), 16);
    let r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
    r = clamp(r + delta, 0, 255); g = clamp(g + delta, 0, 255); b = clamp(b + delta, 0, 255);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  return { makeSprite };
}


