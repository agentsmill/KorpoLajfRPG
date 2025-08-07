export function renderPortrait(ctx, meta, size = 128) {
  const W = size, H = size;
  ctx.imageSmoothingEnabled = false;
  // background halo by faction
  const halo = meta.faction === 'it' ? '#0b3b5a' : meta.faction === 'hr' ? '#3b114a' : meta.faction === 'mgmt' ? '#3b2c0b' : '#0b1222';
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, shade(halo, 1.2));
  grad.addColorStop(1, shade(halo, 0.6));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // head
  const skin = meta.skin || '#f1c27d';
  ctx.fillStyle = skin;
  ctx.fillRect(W*0.34, H*0.28, W*0.32, H*0.34);

  // hair mass
  ctx.fillStyle = meta.hair || '#2f2f2f';
  ctx.fillRect(W*0.3, H*0.2, W*0.4, H*0.12);
  ctx.fillRect(W*0.28, H*0.28, W*0.07, H*0.2);
  ctx.fillRect(W*0.65, H*0.28, W*0.07, H*0.2);

  // eyes
  const eyeY = Math.round(H*0.42);
  ctx.fillStyle = '#0b0f1a';
  ctx.fillRect(Math.round(W*0.42), eyeY, 6, 6);
  ctx.fillRect(Math.round(W*0.54), eyeY, 6, 6);

  // mouth
  if (meta.mood === 'stern') {
    ctx.fillStyle = '#0b0f1a'; ctx.fillRect(Math.round(W*0.44), Math.round(H*0.54), Math.round(W*0.16), 3);
  } else {
    ctx.fillStyle = '#ef4444'; ctx.fillRect(Math.round(W*0.44), Math.round(H*0.545), Math.round(W*0.14), 5);
  }

  // shirt
  ctx.fillStyle = meta.shirt || '#2563eb';
  ctx.fillRect(Math.round(W*0.28), Math.round(H*0.62), Math.round(W*0.44), Math.round(H*0.24));

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


