import { state } from './state.js';

const AUDIO_ASSETS = {
  reload: 'assets/audio/m4-reload.mp3',
  shot: 'assets/audio/battle-rifle-shot.mp3'
};

let audioCtx = null;
const rawSampleBuffers = { reload: null, shot: null };
const rawFetchPromises = { reload: null, shot: null };
const decodedBuffers = { reload: null, shot: null };
const decodePromises = { reload: null, shot: null };

let activeReloadSource = null;
let activeReloadHtmlAudio = null;

function prefetchSampleArrayBuffer(key) {
  if (rawSampleBuffers[key]) return Promise.resolve(rawSampleBuffers[key]);
  if (rawFetchPromises[key]) return rawFetchPromises[key];
  if (typeof window === 'undefined' || typeof fetch !== 'function') {
    return Promise.resolve(null);
  }
  rawFetchPromises[key] = fetch(AUDIO_ASSETS[key])
    .then(res => (res && res.ok ? res.arrayBuffer() : null))
    .then(buf => {
      rawSampleBuffers[key] = buf;
      return buf;
    })
    .catch(() => null);
  return rawFetchPromises[key];
}

function decodeSampleBuffer(ctx, key) {
  if (!ctx) return Promise.resolve(null);
  if (decodedBuffers[key]) return Promise.resolve(decodedBuffers[key]);
  if (decodePromises[key]) return decodePromises[key];

  decodePromises[key] = prefetchSampleArrayBuffer(key)
    .then(raw => {
      if (!raw || typeof ctx.decodeAudioData !== 'function') return null;
      return ctx.decodeAudioData(raw.slice(0));
    })
    .then(audioBuf => {
      if (audioBuf) decodedBuffers[key] = audioBuf;
      return audioBuf;
    })
    .catch(() => {
      decodePromises[key] = null;
      return null;
    });

  return decodePromises[key];
}

function ensureAudioBuffersLoaded(ctx) {
  if (!ctx) return;
  decodeSampleBuffer(ctx, 'reload');
  decodeSampleBuffer(ctx, 'shot');
}

function getAudioCtx() {
  if (!state.audioEnabled) return null;
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  if (audioCtx) {
    ensureAudioBuffersLoaded(audioCtx);
  }
  return audioCtx;
}

if (typeof window !== 'undefined' && typeof fetch === 'function') {
  prefetchSampleArrayBuffer('reload');
  prefetchSampleArrayBuffer('shot');
}

export function playMechanicalClick(freq = 520) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.045);
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

function playSynthesizedReloadSound(ctx) {
  if (!ctx) return;
  const now = ctx.currentTime;

  const makeDistortionCurve = (amount) => {
    const samples = 256;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  };

  const grittyShaper = ctx.createWaveShaper();
  grittyShaper.curve = makeDistortionCurve(45);
  grittyShaper.oversample = '2x';
  grittyShaper.connect(ctx.destination);

  const metalClack = (offset, dur, centerFreq, q, vol, ringFreq = 0) => {
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.exp(-i / (ctx.sampleRate * dur * 0.28));
      const grit = (i % 19 < 4) ? 1.45 : 0.85;
      data[i] = (Math.random() * 2 - 1) * env * grit;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(centerFreq, now + offset);
    bp.Q.setValueAtTime(q, now + offset);

    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, now + offset);
    g.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);

    src.connect(bp);
    bp.connect(g);
    g.connect(grittyShaper);
    src.start(now + offset);

    if (ringFreq > 0) {
      const osc = ctx.createOscillator();
      const og = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(ringFreq, now + offset);
      osc.frequency.exponentialRampToValueAtTime(ringFreq * 0.55, now + offset + Math.min(dur, 0.045));
      og.gain.setValueAtTime(vol * 0.28, now + offset);
      og.gain.exponentialRampToValueAtTime(0.001, now + offset + Math.min(dur, 0.045));
      osc.connect(og);
      og.connect(grittyShaper);
      osc.start(now + offset);
      osc.stop(now + offset + Math.min(dur, 0.05));
    }
  };

  const metalScrape = (offset, dur, freqStart, freqEnd, vol) => {
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const t = i / len;
      const rasp = 0.55 + 0.45 * Math.sin(i * 0.17) * Math.cos(i * 0.043);
      const env = Math.sin(Math.PI * t);
      data[i] = (Math.random() * 2 - 1) * env * rasp;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(freqStart, now + offset);
    bp.frequency.linearRampToValueAtTime(freqEnd, now + offset + dur);
    bp.Q.setValueAtTime(2.6, now + offset);

    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, now + offset);
    g.gain.exponentialRampToValueAtTime(0.002, now + offset + dur);

    src.connect(bp);
    bp.connect(g);
    g.connect(grittyShaper);
    src.start(now + offset);
  };

  const bodyThud = (offset, freqStart, freqEnd, dur, vol) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freqStart, now + offset);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, now + offset + dur);
    g.gain.setValueAtTime(vol, now + offset);
    g.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + dur + 0.01);
  };

  metalClack(0.00, 0.04, 3400, 3.2, 0.22, 1650);
  metalScrape(0.03, 0.13, 1800, 1100, 0.18);
  metalScrape(0.28, 0.06, 1200, 2100, 0.15);
  bodyThud(0.33, 195, 58, 0.085, 0.36);
  metalClack(0.33, 0.055, 1950, 2.0, 0.28, 820);
  metalClack(0.375, 0.04, 4200, 3.8, 0.24, 2100);
  metalScrape(0.57, 0.11, 2100, 3900, 0.25);
  metalClack(0.67, 0.045, 2900, 2.8, 0.26, 1340);
  bodyThud(0.73, 240, 62, 0.09, 0.40);
  metalClack(0.73, 0.075, 2500, 1.8, 0.36, 1120);
  metalClack(0.745, 0.055, 5100, 4.0, 0.24, 2680);
}

function stopActiveReload() {
  if (activeReloadSource) {
    try { activeReloadSource.stop(); } catch (e) {}
    activeReloadSource = null;
  }
  if (activeReloadHtmlAudio) {
    try {
      activeReloadHtmlAudio.pause();
      activeReloadHtmlAudio.currentTime = 0;
    } catch (e) {}
    activeReloadHtmlAudio = null;
  }
}

export function playReloadSound() {
  if (!state.audioEnabled) return;
  const ctx = getAudioCtx();
  stopActiveReload();

  if (ctx && decodedBuffers.reload) {
    const src = ctx.createBufferSource();
    src.buffer = decodedBuffers.reload;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.85, ctx.currentTime);
    src.connect(gain);
    gain.connect(ctx.destination);
    src.onended = () => {
      if (activeReloadSource === src) activeReloadSource = null;
    };
    activeReloadSource = src;
    src.start(ctx.currentTime);
    return;
  }

  if (typeof Audio !== 'undefined') {
    try {
      const el = new Audio(AUDIO_ASSETS.reload);
      el.volume = 0.85;
      activeReloadHtmlAudio = el;
      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => playSynthesizedReloadSound(ctx));
      }
      return;
    } catch (e) {}
  }

  playSynthesizedReloadSound(ctx);
}

function playSynthesizedFireSound(ctx, computed) {
  if (!ctx) return;
  const now = ctx.currentTime;
  const isSilenced = Boolean(computed && computed.isSilenced);
  const isEnergy = Boolean(computed && computed.isEnergy);

  const bufferSize = Math.floor(ctx.sampleRate * 0.16);
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * (isSilenced ? 0.025 : 0.055)));
  }
  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = isSilenced ? 'bandpass' : 'lowpass';
  filter.frequency.setValueAtTime(isSilenced ? 1100 : 2400, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(isSilenced ? 0.16 : 0.32, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  whiteNoise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  whiteNoise.start(now);

  if (isEnergy) {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.13);
    oscGain.gain.setValueAtTime(0.16, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }
}

export function playWeaponFireSound(computed) {
  if (!state.audioEnabled) return;
  const ctx = getAudioCtx();

  if (computed && computed.isEnergy) {
    playSynthesizedFireSound(ctx, computed);
    return;
  }

  const isSilenced = Boolean(computed && computed.isSilenced);
  const shape = computed && computed.parts && computed.parts.platform
    ? computed.parts.platform.shape
    : 'carbine';
  const basePitch = shape === 'amr' ? 0.84
    : shape === 'shotgun' ? 0.90
    : ['pistol', 'revolver', 'smg', 'pdw'].includes(shape) ? 1.14
    : 1.0;
  const pitchJitter = 1 + (Math.random() - 0.5) * 0.05;

  if (ctx && decodedBuffers.shot) {
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = decodedBuffers.shot;
    src.playbackRate.setValueAtTime(basePitch * pitchJitter, now);

    const gain = ctx.createGain();
    if (isSilenced) {
      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.setValueAtTime(1050, now);
      lpf.Q.setValueAtTime(0.9, now);
      gain.gain.setValueAtTime(0.26, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      src.connect(lpf);
      lpf.connect(gain);
    } else {
      gain.gain.setValueAtTime(0.78, now);
      src.connect(gain);
    }
    gain.connect(ctx.destination);
    src.start(now);
    return;
  }

  if (typeof Audio !== 'undefined') {
    try {
      const el = new Audio(AUDIO_ASSETS.shot);
      el.volume = isSilenced ? 0.28 : 0.78;
      el.playbackRate = basePitch * pitchJitter;
      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => playSynthesizedFireSound(ctx, computed));
      }
      return;
    } catch (e) {}
  }

  playSynthesizedFireSound(ctx, computed);
}

export function playSteelPingSound(distanceMeters = 50) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const flightDelay = Math.max(0.04, Math.min(0.65, (Number(distanceMeters) || 50) / 850));
  const hitAt = ctx.currentTime + flightDelay;
  const partials = [
    { freq: 1480, gain: 0.14, dur: 0.42 },
    { freq: 2290, gain: 0.09, dur: 0.34 },
    { freq: 3610, gain: 0.05, dur: 0.22 }
  ];
  partials.forEach(p => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(p.freq, hitAt);
    g.gain.setValueAtTime(p.gain, hitAt);
    g.gain.exponentialRampToValueAtTime(0.001, hitAt + p.dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(hitAt);
    osc.stop(hitAt + p.dur + 0.02);
  });
}

export function playArmorImpactSound(penetrated) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const hitAt = ctx.currentTime + 0.05;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  if (penetrated) {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1150, hitAt);
    osc.frequency.exponentialRampToValueAtTime(220, hitAt + 0.09);
    g.gain.setValueAtTime(0.15, hitAt);
    g.gain.exponentialRampToValueAtTime(0.001, hitAt + 0.095);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(hitAt);
    osc.stop(hitAt + 0.1);
  } else {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(210, hitAt);
    osc.frequency.exponentialRampToValueAtTime(68, hitAt + 0.12);
    g.gain.setValueAtTime(0.22, hitAt);
    g.gain.exponentialRampToValueAtTime(0.001, hitAt + 0.13);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(hitAt);
    osc.stop(hitAt + 0.14);
  }
}
