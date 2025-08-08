export function renderPortrait(ctx, meta, size = 128) {
  const W = size, H = size;
  ctx.imageSmoothingEnabled = false;
  // background halo by faction (pin‑up style gradient)
  const halo = meta.faction === 'it' ? '#0b3b5a' : meta.faction === 'hr' ? '#3b114a' : meta.faction === 'mgmt' ? '#3b2c0b' : '#0b1222';
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, shade(halo, 1.3));
  grad.addColorStop(0.5, shade(halo, 1.0));
  grad.addColorStop(1, shade(halo, 0.65));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // helper for pixel blocks
  const px = (x,y,w,h,color) => { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

  // head (rounded rectangle look)
  const skin = meta.skin || '#f1c27d';
  px(W*0.34, H*0.26, W*0.32, H*0.36, skin);
  px(W*0.32, H*0.28, W*0.04, H*0.06, skin); // left cheek
  px(W*0.64, H*0.28, W*0.04, H*0.06, skin); // right cheek

  // hair: base + highlight
  const hair = meta.hair || '#2f2f2f';
  px(W*0.28, H*0.18, W*0.44, H*0.14, hair);
  px(W*0.26, H*0.26, W*0.08, H*0.24, hair);
  px(W*0.66, H*0.26, W*0.08, H*0.24, hair);
  px(W*0.36, H*0.2, W*0.36, H*0.04, shade(hair,1.2)); // highlight band

  // eyes with shine
  const eyeY = Math.round(H*0.42);
  px(W*0.42, eyeY, 6, 6, '#0b0f1a');
  px(W*0.54, eyeY, 6, 6, '#0b0f1a');
  px(W*0.43, eyeY+1, 2, 2, '#d1d5db');
  px(W*0.55, eyeY+1, 2, 2, '#d1d5db');
  // eyelashes (pin‑up vibe) depending on mood
  if (meta.mood !== 'stern') {
    px(W*0.41, eyeY-2, 8, 2, '#0b0f1a');
    px(W*0.53, eyeY-2, 8, 2, '#0b0f1a');
  }

  // nose + blush
  px(W*0.495, H*0.48, 3, 6, shade(skin,0.85));
  px(W*0.38, H*0.50, 6, 4, '#fca5a5');
  px(W*0.62, H*0.50, 6, 4, '#fca5a5');

  // mouth/lips
  if (meta.mood === 'stern') {
    px(W*0.44, H*0.56, W*0.16, 3, '#0b0f1a');
  } else {
    px(W*0.44, H*0.555, W*0.16, 5, '#e11d48');
    px(W*0.44, H*0.56, W*0.16, 2, '#9f1239');
  }

  // accessories by faction
  if (meta.faction === 'hr') { // earrings
    px(W*0.34, H*0.52, 3, 6, '#fde68a');
    px(W*0.63, H*0.52, 3, 6, '#fde68a');
  }
  if (meta.faction === 'mgmt') { // tie
    px(W*0.495, H*0.62, 6, 12, '#7c3aed');
    px(W*0.49, H*0.74, 8, 12, '#6d28d9');
  }
  if (meta.faction === 'it') { // hoodie stripe
    px(W*0.28, H*0.70, W*0.44, 2, '#60a5fa');
  }

  // shirt/torso
  const shirt = meta.shirt || '#2563eb';
  px(W*0.28, H*0.62, W*0.44, H*0.24, shirt);
  px(W*0.28, H*0.86, W*0.44, 2, shade(shirt,0.7));

  // dithering vignette
  ditherVignette(ctx, W, H);
  // outline
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.strokeRect(0.5, 0.5, W-1, H-1);
}

function shade(hex, s) {
  const c = parseInt(hex.replace('#',''), 16);
  let r=(c>>16)&255, g=(c>>8)&255, b=c&255;
  r=Math.max(0,Math.min(255,Math.round(r*s))); g=Math.max(0,Math.min(255,Math.round(g*s))); b=Math.max(0,Math.min(255,Math.round(b*s)));
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}

function ditherVignette(ctx, W, H) {
  const img = ctx.getImageData(0,0,W,H); const d = img.data;
  for (let y=0;y<H;y++){
    for (let x=0;x<W;x++){
      const i=(y*W+x)*4; const nx=(x/W-0.5), ny=(y/H-0.5); const r=Math.sqrt(nx*nx+ny*ny);
      const v = Math.max(0, Math.min(0.22, r-0.38));
      d[i] = d[i]*(1-v); d[i+1]=d[i+1]*(1-v); d[i+2]=d[i+2]*(1-v);
      if (((x^y)&3)===0) { d[i]-=6; d[i+1]-=6; d[i+2]-=6; }
    }
  }
  ctx.putImageData(img,0,0);
}


