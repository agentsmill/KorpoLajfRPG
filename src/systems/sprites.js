// Procedural pixel-art spritesheets rendered to offscreen canvas (8x12 per frame)
export function createSprites() {
  const cache = new Map();

  function makeSprite(baseColor, seedKey = '') {
    const key = baseColor + '|' + seedKey;
    if (cache.has(key)) return cache.get(key);
    const canvas = document.createElement('canvas');
    const w = 12, h = 18; // bigger, clearer characters
    canvas.width = w * 3; // 3 frames walk cycle
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const rnd = mulberry32(hash(seedKey));
    // faction-based accents for stronger identity
    const fact = seedKey.includes('::it') ? 'it' : seedKey.includes('::hr') ? 'hr' : seedKey.includes('::mgmt') ? 'mgmt' : 'neutral';
    const pal = fact==='it' ? ['#38bdf8','#7dd3fc'] : fact==='hr' ? ['#fb7185','#fda4af'] : fact==='mgmt' ? ['#818cf8','#a5b4fc'] : ['#9ca3af','#cbd5e1'];
    const accColor = pick(pal, rnd);
    const hasHat = rnd() > 0.6;
    const hasBag = rnd() > 0.7;

    for (let f = 0; f < 3; f++) {
      const ox = f * w;
      // outline shadow
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.fillRect(ox + 1, 4, 10, 12);
      // head
      ctx.fillStyle = shade(baseColor, 0);
      ctx.fillRect(ox + 2, 2, 8, 8);
      if (hasHat) { ctx.fillStyle = shade(baseColor, -30); ctx.fillRect(ox+2,2,8,2); ctx.fillRect(ox+2,3,2,1); ctx.fillRect(ox+8,3,2,1); }
      // eyes
      ctx.fillStyle = '#0b1220';
      ctx.fillRect(ox + 4, 5, 2, 2);
      ctx.fillRect(ox + 8, 5, 2, 2);
      // body
      ctx.fillStyle = shade(baseColor, -20);
      ctx.fillRect(ox + 3, 10, 6, 3);
      if (hasBag) { ctx.fillStyle = shade(baseColor, -50); ctx.fillRect(ox+1,10,2,4); }
      // legs animate
      ctx.fillStyle = shade(baseColor, -40);
      if (f === 0) { ctx.fillRect(ox + 3, 13, 3, 3); ctx.fillRect(ox + 8, 13, 3, 3); }
      if (f === 1) { ctx.fillRect(ox + 4, 13, 3, 3); ctx.fillRect(ox + 7, 13, 3, 3); }
      if (f === 2) { ctx.fillRect(ox + 5, 13, 3, 3); ctx.fillRect(ox + 6, 13, 3, 3); }
      // pastel accent scarf
      ctx.fillStyle = accColor;
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
  function hash(s) { let h=1779033703^s.length; for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353); h=h<<13|h>>>19;} return (h>>>0)||1; }
  function mulberry32(a){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^t>>>15, t|1); t^=t+Math.imul(t^t>>>7, t|61); return ((t^t>>>14)>>>0)/4294967296; }; }
  function pick(arr, rnd){ return arr[Math.floor(rnd()*arr.length)] }

  return { makeSprite };
}


