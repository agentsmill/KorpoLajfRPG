export function createAudio(btn) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0.15;
  master.connect(ctx.destination);

  // Simple lo-fi: kick + hat + detuned saw chords + vinyl noise
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoiseBuffer(ctx);
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.02;
  noise.loop = true;
  noise.connect(noiseGain).connect(master);
  noise.start();

  const chord = makeDetunedSaw(ctx, [220, 277, 330]);
  chord.connect(master);

  const hatGain = ctx.createGain();
  hatGain.gain.value = 0.1;
  hatGain.connect(master);

  let running = true;
  let step = 0;
  const seqInterval = setInterval(() => {
    const t = ctx.currentTime;
    kick(ctx, master, t);
    if (step % 2 === 0) hat(ctx, hatGain, t);
    step = (step + 1) % 8;
  }, 600);

  btn?.addEventListener('click', () => {
    running = !running;
    if (running) {
      master.gain.value = 0.15;
      btn.textContent = '🎵 Lo‑fi: ON';
      if (ctx.state === 'suspended') ctx.resume();
    } else {
      master.gain.value = 0.0;
      btn.textContent = '🎵 Lo‑fi: OFF';
    }
  });

  return {
    toggle: () => btn?.click(),
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


