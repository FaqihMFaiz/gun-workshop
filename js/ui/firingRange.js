import { state } from '../state.js';
import { clamp } from '../engine/utils.js';
import { computeBuildMetrics } from '../engine/ballistics.js';
import { getAvailableFireModes, syncFireModeForPlatform } from '../engine/compatibility.js';
import { playMechanicalClick, playReloadSound, playWeaponFireSound } from '../audio.js';

export function renderRangeCanvas(computed) {
  const canvas = document.getElementById('ballistics-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2 + 12;

  ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y <= h; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  ctx.fillStyle = 'rgba(30, 41, 59, 0.75)';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy - 82, 26, 0, Math.PI * 2);
  ctx.roundRect(cx - 58, cy - 52, 116, 145, 18);
  ctx.fill();
  ctx.stroke();

  [55, 36, 18].forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = idx === 2 ? '#f59e0b' : 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = idx === 2 ? 2 : 1.2;
    ctx.stroke();
  });

  state.range.impacts.forEach((imp, idx) => {
    if (idx > 0 && !imp.pellet) {
      const prev = state.range.impacts[idx - 1];
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(imp.x, imp.y);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(imp.x, imp.y, imp.crit ? 5 : 4, 0, Math.PI * 2);
    ctx.fillStyle = imp.crit ? '#f43f5e' : (computed.isEnergy ? '#38bdf8' : '#fbbf24');
    ctx.fill();
  });

  syncFireModeForPlatform(computed.parts.platform);
  const availModes = getAvailableFireModes(computed.parts.platform);
  const fmBtn = document.getElementById('range-firemode-badge');
  fmBtn.textContent = availModes.length > 1
    ? `MODE: ${state.range.selectedFireMode} ↻`
    : `MODE: ${state.range.selectedFireMode}`;

  document.getElementById('range-ammo-count').textContent = `${state.range.ammo} / ${computed.capacity}`;
  const ammoPct = clamp((state.range.ammo / computed.capacity) * 100, 0, 100);
  document.getElementById('range-ammo-bar').style.width = `${ammoPct}%`;

  const heatEl = document.getElementById('range-heat-label');
  const isOverheat = state.range.heat >= 180;
  const isHot = state.range.heat >= 110 && !isOverheat;
  const heatMult = isOverheat ? 1.75 : isHot ? 1.25 : 1.0;
  const liveMoa = (computed.spreadMoa * heatMult).toFixed(1);
  heatEl.textContent = `BARREL: ${Math.round(state.range.heat)}\u00B0C${isOverheat ? ' [OVERHEAT]' : isHot ? ' [HOT]' : ''}`;
  heatEl.className = isOverheat
    ? 'text-xs font-mono font-bold text-rust-700'
    : isHot
      ? 'text-xs font-mono font-bold text-amber-700'
      : 'text-xs font-mono font-semibold text-olive-800';

  document.getElementById('range-shots-hit').textContent = String(state.range.shotsHit);
  document.getElementById('range-total-dmg').textContent = state.range.totalDamage.toLocaleString();
  document.getElementById('range-ttk-readout').textContent = `${computed.ttkSec}s`;
  document.getElementById('range-spread-readout').textContent = `${liveMoa} MOA`;
}

export function triggerSingleShot(aimX = 160, aimY = 172) {
  const computed = computeBuildMetrics(state.selectedParts);
  if (state.range.ammo <= 0) {
    playMechanicalClick(220);
    return;
  }

  state.range.ammo -= 1;
  state.range.lastShotAt = Date.now();
  const heatGain = computed.isEnergy ? 2 : (computed.parts.barrel.style === 'lmg_pecheneg' ? 4.5 : 8);
  state.range.heat = Math.min(260, state.range.heat + heatGain);

  const wrapper = document.getElementById('gun-svg-wrapper');
  const flash = document.getElementById('svg-muzzle-flash');
  if (wrapper) {
    wrapper.classList.remove('recoil-anim');
    void wrapper.offsetWidth;
    wrapper.classList.add('recoil-anim');
  }
  if (flash) {
    flash.classList.remove('muzzle-flash-active');
    void flash.offsetWidth;
    flash.classList.add('muzzle-flash-active');
  }
  const brass = document.getElementById('svg-brass-casing');
  if (brass && !computed.isEnergy) {
    brass.classList.remove('brass-casing-anim');
    void brass.offsetWidth;
    brass.classList.add('brass-casing-anim');
  }

  playWeaponFireSound(computed);
  if (state.range.selectedFireMode === 'BOLT-ACTION') {
    setTimeout(() => playMechanicalClick(740), 210);
  }

  const shotIdx = Math.min(18, state.range.impacts.length);
  const distFactor = state.range.distance / 50;
  const thermalPenalty = state.range.heat >= 180 ? 1.75 : state.range.heat >= 110 ? 1.25 : 1.0;
  const isShotgun = computed.parts.platform.shape === 'shotgun';

  if (isShotgun) {
    // 8-pellet 12-gauge pattern (tighter choke for sabot/flechette, wider for 00 buckshot)
    const pelletCount = 8;
    const isFlechette = computed.parts.ammo && computed.parts.ammo.id === 'ammo_12ga_flechette';
    const patternRadius = (isFlechette ? 16 : 30) * distFactor * thermalPenalty;
    const perPelletDmg = Math.max(4, Math.round(computed.stats.damage / pelletCount));
    let shellHits = 0;
    for (let p = 0; p < pelletCount; p++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * patternRadius;
      const px = clamp(aimX + Math.cos(angle) * r, 14, 306);
      const py = clamp(aimY + Math.sin(angle) * r, 14, 306);
      const isCrit = Math.hypot(px - 160, py - 90) <= 27;
      const dmg = Math.round(perPelletDmg * (isCrit ? 1.5 : 1.0));
      state.range.totalDamage += dmg;
      state.range.impacts.push({ x: px, y: py, dmg, crit: isCrit, pellet: true });
      shellHits++;
    }
    state.range.shotsHit += shellHits;
  } else {
    const spreadPx = ((105 - computed.stats.accuracy) * 0.28) * distFactor * thermalPenalty;
    const verticalClimb = Math.min(68, shotIdx * ((105 - computed.stats.control) * 0.16));
    const horizDrift = (Math.random() - 0.5) * spreadPx * 2.1;

    const hitX = clamp(aimX + horizDrift, 16, 304);
    const hitY = clamp(aimY - verticalClimb + (Math.random() - 0.5) * spreadPx, 16, 304);

    const distHead = Math.hypot(hitX - 160, hitY - 90);
    const isCrit = distHead <= 27;
    const shotDmg = Math.round(computed.stats.damage * (isCrit ? 1.65 : 1.0));

    state.range.shotsHit += 1;
    state.range.totalDamage += shotDmg;
    state.range.impacts.push({ x: hitX, y: hitY, dmg: shotDmg, crit: isCrit });
  }

  renderRangeCanvas(computed);
}

export function initRangeEvents() {
  const rangeCanvas = document.getElementById('ballistics-canvas');
  let autoFireTimer = null;
  let burstInterval = null;
  let currentAimX = 160;
  let currentAimY = 172;

  const updateCanvasAim = (clientX, clientY) => {
    const rect = rangeCanvas.getBoundingClientRect();
    const scaleX = rangeCanvas.width / rect.width;
    const scaleY = rangeCanvas.height / rect.height;
    currentAimX = clamp((clientX - rect.left) * scaleX, 8, rangeCanvas.width - 8);
    currentAimY = clamp((clientY - rect.top) * scaleY, 8, rangeCanvas.height - 8);
  };

  const stopFullAuto = () => {
    if (autoFireTimer) {
      clearInterval(autoFireTimer);
      autoFireTimer = null;
    }
  };

  const startFullAuto = (clientX, clientY) => {
    stopFullAuto();
    updateCanvasAim(clientX, clientY);
    const computed = computeBuildMetrics(state.selectedParts);
    syncFireModeForPlatform(computed.parts.platform);
    const mode = state.range.selectedFireMode;

    // Fire initial shot
    triggerSingleShot(currentAimX, currentAimY);

    // SEMI & BOLT-ACTION fire 1 round per trigger press
    if (mode === 'SEMI' || mode === 'BOLT-ACTION') {
      return;
    }

    const delayMs = Math.max(48, Math.round(60000 / Math.max(120, computed.stats.fireRate)));
    const maxShots = mode === '2-RD BURST' ? 2 : mode === '3-RD BURST' ? 3 : Infinity;
    let shotsInPull = 1;

    autoFireTimer = setInterval(() => {
      if (shotsInPull >= maxShots || state.range.ammo <= 0) {
        if (state.range.ammo <= 0) playMechanicalClick(210);
        stopFullAuto();
        return;
      }
      triggerSingleShot(currentAimX, currentAimY);
      shotsInPull++;
      if (shotsInPull >= maxShots) stopFullAuto();
    }, delayMs);
  };

  // Interactive Fire Mode Selector Button
  document.getElementById('range-firemode-badge').addEventListener('click', () => {
    const computed = computeBuildMetrics(state.selectedParts);
    const modes = getAvailableFireModes(computed.parts.platform);
    if (modes.length <= 1) return;
    const nextIdx = (modes.indexOf(state.range.selectedFireMode) + 1) % modes.length;
    state.range.selectedFireMode = modes[nextIdx];
    playMechanicalClick(680);
    renderRangeCanvas(computed);
  });

  // Passive Real-Time Barrel Cooling Timer (cools barrel toward 24°C when idle)
  if (window._barrelCoolingInterval) clearInterval(window._barrelCoolingInterval);
  window._barrelCoolingInterval = setInterval(() => {
    if (state.range.heat > 24 && (Date.now() - state.range.lastShotAt) > 380) {
      const computed = computeBuildMetrics(state.selectedParts);
      const coolStep = computed.parts.barrel.style === 'lmg_pecheneg' ? 8 : computed.parts.barrel.style === 'carbon' ? 6.5 : 4.5;
      state.range.heat = Math.max(24, state.range.heat - coolStep);
      if (state.activeView === 'range') {
        renderRangeCanvas(computed);
      }
    }
  }, 350);

  rangeCanvas.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    startFullAuto(e.clientX, e.clientY);
  });
  rangeCanvas.addEventListener('mousemove', (e) => {
    if (autoFireTimer) updateCanvasAim(e.clientX, e.clientY);
  });
  window.addEventListener('mouseup', stopFullAuto);
  rangeCanvas.addEventListener('mouseleave', stopFullAuto);
  window.addEventListener('blur', stopFullAuto);

  rangeCanvas.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      e.preventDefault();
      startFullAuto(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });
  rangeCanvas.addEventListener('touchmove', (e) => {
    if (autoFireTimer && e.touches && e.touches[0]) {
      e.preventDefault();
      updateCanvasAim(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });
  window.addEventListener('touchend', stopFullAuto);

  document.getElementById('range-distance-select').addEventListener('change', (e) => {
    state.range.distance = Number(e.target.value) || 50;
    renderRangeCanvas(computeBuildMetrics(state.selectedParts));
  });

  document.getElementById('btn-range-reload').addEventListener('click', () => {
    const computed = computeBuildMetrics(state.selectedParts);
    state.range.ammo = computed.capacity;
    state.range.heat = 24;
    playReloadSound();
    renderRangeCanvas(computed);
  });

  document.getElementById('btn-range-clear').addEventListener('click', () => {
    state.range.impacts = [];
    state.range.shotsHit = 0;
    state.range.totalDamage = 0;
    state.range.heat = 24;
    renderRangeCanvas(computeBuildMetrics(state.selectedParts));
  });

  document.getElementById('btn-sim-burst').addEventListener('click', () => {
    if (burstInterval) clearInterval(burstInterval);
    let count = 0;
    burstInterval = setInterval(() => {
      triggerSingleShot(160, 178);
      count++;
      if (count >= 5) {
        clearInterval(burstInterval);
        burstInterval = null;
      }
    }, 95);
  });
}