export function createAudio(btn) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0.15;
  master.connect(ctx.destination);

  // Three lo-fi tracks: Chill, Night, Focus
  const tracks = [
    makeTrackChill(ctx, master),
    makeTrackNight(ctx, master),
    makeTrackFocus(ctx, master),
  ];
  let activeIdx = 0;
  tracks.forEach((t,i)=> t.setActive(i===activeIdx, ctx));

  let running = true;

  btn?.addEventListener('click', () => {
    running = !running;
    if (running) {
      master.gain.value = 0.15;
      btn.textContent = `🎵 Lo‑fi: ON (${['Chill','Night','Focus'][activeIdx]})`;
      if (ctx.state === 'suspended') ctx.resume();
    } else {
      master.gain.value = 0.0;
      btn.textContent = '🎵 Lo‑fi: OFF';
    }
  });

  // Right-click (or long press) cycles the track
  btn?.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    activeIdx = (activeIdx + 1) % tracks.length;
    tracks.forEach((t,i)=> t.setActive(i===activeIdx, ctx));
    if (running) btn.textContent = `🎵 Lo‑fi: ON (${['Chill','Night','Focus'][activeIdx]})`;
  });

  return {
    toggle: () => btn?.click(),
    setTrack: (i) => { activeIdx = (i%tracks.length+tracks.length)%tracks.length; tracks.forEach((t,idx)=>t.setActive(idx===activeIdx, ctx)); },
  };
}

function makeNoiseBuffer(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  return buffer;
}

function kick(ctx, dest, t) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);
  gain.gain.setValueAtTime(0.8, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc.connect(gain).connect(dest);
  osc.start(t);
  osc.stop(t + 0.31);
}

function hat(ctx, dest, t) {
  const node = ctx.createBufferSource();
  node.buffer = makeNoiseBuffer(ctx);
  const bp = ctx.createBiquadFilter();
  bp.type = 'highpass';
  bp.frequency.value = 8000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  node.connect(bp).connect(gain).connect(dest);
  node.start(t);
  node.stop(t + 0.051);
}

function makeDetunedSaw(ctx, freqs) {
  const merger = ctx.createGain();
  merger.gain.value = 0.05;
  for (const f of freqs) {
    for (const det of [-6, 0, 6]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = f * Math.pow(2, det / 1200);
      gain.gain.value = 0.15;
      osc.connect(gain).connect(merger);
      osc.start();
    }
  }
  return merger;
}

// Track builders
function makeTrackChill(ctx, master){
  const bus = ctx.createGain(); bus.connect(master);
  const noise = ctx.createBufferSource(); noise.buffer = makeNoiseBuffer(ctx); noise.loop = true; const nG=ctx.createGain(); nG.gain.value=0.02; noise.connect(nG).connect(bus); noise.start();
  const chord = makeDetunedSaw(ctx, [220, 277, 330]); chord.connect(bus);
  const hatG = ctx.createGain(); hatG.gain.value = 0.1; hatG.connect(bus);
  let step=0, timer; const start=()=>{ timer=setInterval(()=>{ const t=ctx.currentTime; kick(ctx,bus,t); if(step%2===0) hat(ctx,hatG,t); step=(step+1)%8; }, 600);};
  const stop=()=>{ clearInterval(timer); };
  return { setActive:(on,ctx)=>{ on?start():stop(); smooth(bus.gain, ctx, on?1:0); } };
}

function makeTrackNight(ctx, master){
  const bus = ctx.createGain(); bus.connect(master);
  const noise = ctx.createBufferSource(); noise.buffer = makeNoiseBuffer(ctx); noise.loop = true; const nG=ctx.createGain(); nG.gain.value=0.03; noise.connect(nG).connect(bus); noise.start();
  // mellow Rhodes-like triads via FM
  const carrier = ctx.createOscillator(); carrier.type='sine'; carrier.frequency.value=196;
  const mod = ctx.createOscillator(); mod.type='sine'; mod.frequency.value=3.2; const modGain=ctx.createGain(); modGain.gain.value=35; mod.connect(modGain).connect(carrier.frequency);
  const cG=ctx.createGain(); cG.gain.value=0.06; carrier.connect(cG).connect(bus); carrier.start(); mod.start();
  let step=0, timer; const start=()=>{ timer=setInterval(()=>{ const t=ctx.currentTime; if(step%4===0) softKick(ctx,bus,t); step=(step+1)%8; }, 680);};
  const stop=()=>{ clearInterval(timer); };
  return { setActive:(on,ctx)=>{ on?start():stop(); smooth(bus.gain, ctx, on?1:0); } };
}

function makeTrackFocus(ctx, master){
  const bus = ctx.createGain(); bus.connect(master);
  const pink = ctx.createBiquadFilter(); pink.type='lowpass'; pink.frequency.value=800;
  const noise = ctx.createBufferSource(); noise.buffer = makeNoiseBuffer(ctx); noise.loop = true; const nG=ctx.createGain(); nG.gain.value=0.015; noise.connect(pink).connect(nG).connect(bus); noise.start();
  const arpG = ctx.createGain(); arpG.gain.value=0.08; arpG.connect(bus);
  let step=0, timer; const notes=[220,247,262,294,330,349]; const start=()=>{ timer=setInterval(()=>{ const t=ctx.currentTime; const f=notes[step%notes.length]; blip(ctx,arpG,t,f); if(step%3===0) hat(ctx,bus,t); step++; }, 420);};
  const stop=()=>{ clearInterval(timer); };
  return { setActive:(on,ctx)=>{ on?start():stop(); smooth(bus.gain, ctx, on?1:0); } };
}

function softKick(ctx, dest, t){ const g=ctx.createGain(); g.gain.setValueAtTime(0.4,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.25); const o=ctx.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(90,t); o.frequency.exponentialRampToValueAtTime(45,t+0.25); o.connect(g).connect(dest); o.start(t); o.stop(t+0.26); }
function blip(ctx, dest, t, f){ const o=ctx.createOscillator(); o.type='triangle'; o.frequency.value=f; const g=ctx.createGain(); g.gain.setValueAtTime(0.3,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.12); o.connect(g).connect(dest); o.start(t); o.stop(t+0.13); }
function smooth(param, ctx, to){ try { const now=ctx.currentTime; const from=param.value; param.cancelScheduledValues(now); param.setValueAtTime(from, now); param.linearRampToValueAtTime(to, now+0.6);} catch(e) { param.value = to; } }


