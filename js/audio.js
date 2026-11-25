import { state } from './state.js';

let audioCtx = null;

function getAudioCtx() {
  if (!state.audioEnabled) return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
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

export function playReloadSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Hard-clipping waveshaper curve for raw steel-on-steel mechanical grit
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

  // Helper: rough metallic transient clack (filtered noise + cold steel ring)
  const metalClack = (offset, dur, centerFreq, q, vol, ringFreq = 0) => {
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      // Grainy envelope with micro-rattles
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

  // Helper: raspy steel/polymer slide scrape (mag drag or recoil spring pull)
  const metalScrape = (offset, dur, freqStart, freqEnd, vol) => {
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const t = i / len;
      // Amplitude-modulated rough friction texture
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

  // Helper: heavy hollow receiver thud
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

  // 1. Magazine catch paddle snap + rough magwell pull-out scrape (0.00s - 0.16s)
  metalClack(0.00, 0.04, 3400, 3.2, 0.22, 1650);
  metalScrape(0.03, 0.13, 1800, 1100, 0.18);

  // 2. Rock-and-lock fresh magazine insertion: dry contact, heavy seat thud, steel latch snap (0.31s - 0.42s)
  metalScrape(0.28, 0.06, 1200, 2100, 0.15);
  bodyThud(0.33, 195, 58, 0.085, 0.36);
  metalClack(0.33, 0.055, 1950, 2.0, 0.28, 820);
  metalClack(0.375, 0.04, 4200, 3.8, 0.24, 2100);

  // 3. Rough charging handle / bolt carrier pull back against stiff recoil spring (0.58s - 0.70s)
  metalScrape(0.57, 0.11, 2100, 3900, 0.25);
  metalClack(0.67, 0.045, 2900, 2.8, 0.26, 1340);

  // 4. Bolt carrier slams home into battery: violent steel-on-steel CLACK-CHUNK (0.73s - 0.85s)
  bodyThud(0.73, 240, 62, 0.09, 0.40);
  metalClack(0.73, 0.075, 2500, 1.8, 0.36, 1120);
  metalClack(0.745, 0.055, 5100, 4.0, 0.24, 2680);
}

export function playWeaponFireSound(computed) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  const bufferSize = ctx.sampleRate * 0.16;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * (computed.isSilenced ? 0.025 : 0.055)));
  }
  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = computed.isSilenced ? 'bandpass' : 'lowpass';
  filter.frequency.setValueAtTime(computed.isSilenced ? 1100 : 2400, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(computed.isSilenced ? 0.16 : 0.32, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  whiteNoise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  whiteNoise.start(now);

  if (computed.isEnergy) {
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