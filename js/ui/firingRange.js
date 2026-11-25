import { state } from '../state.js';
import { clamp } from '../engine/utils.js';
import { computeBuildMetrics, computeDamageAtDistance } from '../engine/ballistics.js';
import { getAvailableFireModes, syncFireModeForPlatform } from '../engine/compatibility.js';
import {
  ARMOR_TARGETS,
  computeDistanceSpreadMultiplier,
  evaluateArmorPenetration,
  isPointOnTarget,
  computeLiveGroupMetrics
} from '../engine/rangeBallistics.js';
import {
  playMechanicalClick,
  playReloadSound,
  playWeaponFireSound,
  playSteelPingSound,
  playArmorImpactSound
} from '../audio.js';

function drawOpticReticle(ctx, sightStyle, aimX, aimY, visionMode) {
  ctx.save();
  const baseColor = visionMode === 'nvg' ? '#4ade80'
    : visionMode === 'thermal' ? '#38bdf8'
    : '#f43f5e';

  switch (sightStyle) {
    case 'rmr':
    case 'reflex': {
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(aimX, aimY, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.arc(aimX, aimY, 2.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'holo':
    case 'holo_3x': {
      if (sightStyle === 'holo_3x') {
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.28)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(aimX, aimY, 34, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(aimX, aimY, 14, 0, Math.PI * 2);
      ctx.stroke();
      // 4 cardinal hash ticks on EOTech ring
      [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(a => {
        ctx.beginPath();
        ctx.moveTo(aimX + Math.cos(a) * 11, aimY + Math.sin(a) * 11);
        ctx.lineTo(aimX + Math.cos(a) * 18, aimY + Math.sin(a) * 18);
        ctx.stroke();
      });
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.arc(aimX, aimY, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'pso1': {
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.78)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(aimX - 42, aimY); ctx.lineTo(aimX - 10, aimY);
      ctx.moveTo(aimX + 10, aimY); ctx.lineTo(aimX + 42, aimY);
      ctx.stroke();
      // Illuminated center chevron + drop chevrons
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.7;
      [0, 10, 20].forEach(dy => {
        ctx.beginPath();
        ctx.moveTo(aimX - 5, aimY + 5 + dy);
        ctx.lineTo(aimX, aimY + dy);
        ctx.lineTo(aimX + 5, aimY + 5 + dy);
        ctx.stroke();
      });
      // Rangefinder stadia arc
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(aimX - 36, aimY + 26);
      ctx.lineTo(aimX - 14, aimY + 26);
      ctx.quadraticCurveTo(aimX - 24, aimY + 14, aimX - 36, aimY + 12);
      ctx.stroke();
      break;
    }
    case 'acog':
    case 'canted_combo': {
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.7)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(aimX, aimY + 4); ctx.lineTo(aimX, aimY + 34);
      ctx.stroke();
      [12, 20, 28].forEach((dy, idx) => {
        const half = 6 - idx;
        ctx.beginPath();
        ctx.moveTo(aimX - half, aimY + dy);
        ctx.lineTo(aimX + half, aimY + dy);
        ctx.stroke();
      });
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(aimX, aimY, 8, Math.PI * 0.78, Math.PI * 2.22);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(aimX, aimY, 2, 0, Math.PI * 2);
      ctx.fill();
      if (sightStyle === 'canted_combo') {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(aimX + 26, aimY - 22, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(aimX + 26, aimY - 22, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'sniper_scope':
    case 'sniper_5_25': {
      const r = sightStyle === 'sniper_5_25' ? 68 : 54;
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(aimX, aimY, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(248, 250, 252, 0.85)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(aimX - r, aimY); ctx.lineTo(aimX + r, aimY);
      ctx.moveTo(aimX, aimY - r); ctx.lineTo(aimX, aimY + r);
      ctx.stroke();

      // Mil-dot stadia ticks
      ctx.fillStyle = '#f8fafc';
      for (let d = 10; d < r - 6; d += 10) {
        ctx.beginPath(); ctx.arc(aimX + d, aimY, 1.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(aimX - d, aimY, 1.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(aimX, aimY + d, 1.3, 0, Math.PI * 2); ctx.fill();
        if (sightStyle === 'sniper_5_25' && d <= 40) {
          ctx.strokeStyle = 'rgba(248, 250, 252, 0.5)';
          ctx.beginPath();
          ctx.moveTo(aimX - d * 0.45, aimY + d);
          ctx.lineTo(aimX + d * 0.45, aimY + d);
          ctx.stroke();
        }
      }
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(aimX, aimY, 1.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'thermal': {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.4;
      const b = 18;
      ctx.beginPath();
      ctx.moveTo(aimX - b, aimY - 8); ctx.lineTo(aimX - b, aimY - b); ctx.lineTo(aimX - 8, aimY - b);
      ctx.moveTo(aimX + 8, aimY - b); ctx.lineTo(aimX + b, aimY - b); ctx.lineTo(aimX + b, aimY - 8);
      ctx.moveTo(aimX - b, aimY + 8); ctx.lineTo(aimX - b, aimY + b); ctx.lineTo(aimX - 8, aimY + b);
      ctx.moveTo(aimX + 8, aimY + b); ctx.lineTo(aimX + b, aimY + b); ctx.lineTo(aimX + b, aimY + 8);
      ctx.moveTo(aimX - 10, aimY); ctx.lineTo(aimX - 3, aimY);
      ctx.moveTo(aimX + 3, aimY); ctx.lineTo(aimX + 10, aimY);
      ctx.moveTo(aimX, aimY - 10); ctx.lineTo(aimX, aimY - 3);
      ctx.moveTo(aimX, aimY + 3); ctx.lineTo(aimX, aimY + 10);
      ctx.stroke();
      break;
    }
    case 'nvg_gen3': {
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(aimX, aimY, 18, 0, Math.PI * 2);
      ctx.moveTo(aimX - 24, aimY); ctx.lineTo(aimX - 8, aimY);
      ctx.moveTo(aimX + 8, aimY); ctx.lineTo(aimX + 24, aimY);
      ctx.moveTo(aimX, aimY - 24); ctx.lineTo(aimX, aimY - 8);
      ctx.moveTo(aimX, aimY + 8); ctx.lineTo(aimX, aimY + 24);
      ctx.stroke();
      ctx.fillStyle = '#bbf7d0';
      ctx.beginPath();
      ctx.arc(aimX, aimY, 2.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default: {
      // Tritium 3-Dot Iron Sights
      ctx.fillStyle = '#27272a';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.fillRect(aimX - 16, aimY + 2, 10, 12);
      ctx.fillRect(aimX + 6, aimY + 2, 10, 12);
      ctx.fillRect(aimX - 2.5, aimY - 2, 5, 14);
      ctx.fillStyle = '#4ade80';
      ctx.beginPath(); ctx.arc(aimX - 11, aimY + 6, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(aimX + 11, aimY + 6, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(aimX, aimY + 1, 2.2, 0, Math.PI * 2); ctx.fill();
      break;
    }
  }
  ctx.restore();
}

export function renderRangeCanvas(computed) {
  const canvas = document.getElementById('ballistics-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  const sightStyle = computed.parts.sight ? computed.parts.sight.style : 'reflex';
  const visionMode = sightStyle === 'thermal' ? 'thermal'
    : sightStyle === 'nvg_gen3' ? 'nvg'
    : 'standard';
  const hasIrLaser = ['ub_peq15', 'ub_perst4', 'ub_lrf_computer'].includes(computed.parts.underbarrel.id);
  const targetType = state.range.targetType || 'paper';

  ctx.clearRect(0, 0, w, h);

  // 1. Bay Backdrop & Vision Mode Filter
  if (visionMode === 'thermal') {
    ctx.fillStyle = '#070a1c';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
  } else if (visionMode === 'nvg') {
    ctx.fillStyle = '#04170a';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.18)';
  } else {
    ctx.fillStyle = '#181917';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
  }

  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y <= h; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  const cx = w / 2;
  const cy = h / 2 + 12;

  // 2. Reactive Target Geometry
  if (ARMOR_TARGETS[targetType]) {
    const spec = ARMOR_TARGETS[targetType];
    ctx.save();
    ctx.fillStyle = visionMode === 'thermal' ? 'rgba(255, 247, 237, 0.85)'
      : visionMode === 'nvg' ? 'rgba(22, 101, 52, 0.72)'
      : targetType === 'armor_3a' ? 'rgba(51, 65, 85, 0.88)'
      : targetType === 'armor_3' ? 'rgba(71, 85, 105, 0.92)'
      : 'rgba(28, 25, 23, 0.94)';
    ctx.strokeStyle = visionMode === 'nvg' ? '#4ade80' : visionMode === 'thermal' ? '#fb923c' : '#94a3b8';
    ctx.lineWidth = 2.2;
    // Shooter's cut armor plate polygon
    ctx.beginPath();
    ctx.moveTo(128, 112);
    ctx.lineTo(192, 112);
    ctx.lineTo(214, 146);
    ctx.lineTo(214, 254);
    ctx.lineTo(106, 254);
    ctx.lineTo(106, 146);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner vitals / trauma backing box
    ctx.strokeStyle = visionMode === 'nvg' ? 'rgba(134, 239, 172, 0.5)' : 'rgba(248, 250, 252, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(126, 128, 68, 92);

    ctx.fillStyle = visionMode === 'thermal' ? '#1e293b' : visionMode === 'nvg' ? '#bbf7d0' : '#f8fafc';
    ctx.font = 'bold 12px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(spec.short, 160, 176);
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.fillStyle = visionMode === 'thermal' ? '#9a3412' : visionMode === 'nvg' ? '#86efac' : '#cbd5e1';
    ctx.fillText(`REQ PEN >= ${spec.reqPen}`, 160, 194);
    ctx.restore();
  } else if (targetType === 'steel') {
    ctx.save();
    // Hanging chains
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(126, 14); ctx.lineTo(126, 122);
    ctx.moveTo(194, 14); ctx.lineTo(194, 122);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = visionMode === 'thermal' ? 'rgba(255, 247, 237, 0.92)'
      : visionMode === 'nvg' ? 'rgba(34, 197, 94, 0.68)'
      : 'rgba(226, 232, 240, 0.88)';
    ctx.strokeStyle = visionMode === 'nvg' ? '#86efac' : '#f8fafc';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(cx, cy - 82, 26, 0, Math.PI * 2);
    ctx.roundRect(cx - 58, cy - 52, 116, 145, 16);
    ctx.fill();
    ctx.stroke();

    // Inner A-zone painted circle on AR500 steel
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.strokeStyle = visionMode === 'thermal' ? '#ea580c' : visionMode === 'nvg' ? '#052e16' : '#dc2626';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = visionMode === 'nvg' ? '#052e16' : '#334155';
    ctx.font = 'bold 9px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('AR500 STEEL', cx, cy + 78);
    ctx.restore();
  } else {
    // Paper Bullseye Silhouette
    ctx.fillStyle = visionMode === 'thermal' ? 'rgba(255, 247, 237, 0.88)'
      : visionMode === 'nvg' ? 'rgba(22, 101, 52, 0.65)'
      : 'rgba(30, 41, 59, 0.75)';
    ctx.strokeStyle = visionMode === 'thermal' ? '#fb923c'
      : visionMode === 'nvg' ? '#4ade80'
      : '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy - 82, 26, 0, Math.PI * 2);
    ctx.roundRect(cx - 58, cy - 52, 116, 145, 18);
    ctx.fill();
    ctx.stroke();

    [55, 36, 18].forEach((r, idx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = idx === 2
        ? (visionMode === 'thermal' ? '#dc2626' : visionMode === 'nvg' ? '#bbf7d0' : '#f59e0b')
        : (visionMode === 'thermal' ? 'rgba(234, 88, 12, 0.55)' : visionMode === 'nvg' ? 'rgba(74, 222, 128, 0.5)' : 'rgba(56, 189, 248, 0.45)');
      ctx.lineWidth = idx === 2 ? 2 : 1.2;
      ctx.stroke();
    });
  }

  // 3. Impacts & Tracer / Armor / Steel Feedback
  state.range.impacts.forEach((imp, idx) => {
    if (idx > 0 && !imp.pellet) {
      const prev = state.range.impacts[idx - 1];
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(imp.x, imp.y);
      ctx.strokeStyle = imp.tracer ? 'rgba(239, 68, 68, 0.55)' : 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = imp.tracer ? 1.8 : 1.2;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(imp.x, imp.y, imp.crit ? 5 : 4, 0, Math.PI * 2);
    if (imp.armorResult) {
      ctx.fillStyle = imp.armorResult.penetrated ? '#22c55e' : '#64748b';
      ctx.fill();
      ctx.strokeStyle = imp.armorResult.penetrated ? '#bbf7d0' : '#cbd5e1';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    } else if (imp.steelHit) {
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    } else {
      ctx.fillStyle = imp.incendiary
        ? '#f97316'
        : imp.tracer
          ? '#ef4444'
          : imp.crit
            ? '#f43f5e'
            : (computed.isEnergy ? '#38bdf8' : '#fbbf24');
      ctx.fill();
    }
  });

  // 4. NVG / IR Laser Beam & Vignette
  const aimX = state.range.aimPos && state.range.aimPos.active ? state.range.aimPos.x : 160;
  const aimY = state.range.aimPos && state.range.aimPos.active ? state.range.aimPos.y : 172;

  if (visionMode === 'nvg' && hasIrLaser) {
    ctx.save();
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.72)';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(298, 314);
    ctx.lineTo(aimX, aimY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#bbf7d0';
    ctx.beginPath();
    ctx.arc(aimX, aimY, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (visionMode === 'nvg') {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 118, w / 2, h / 2, 185);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(2, 10, 4, 0.78)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // 5. Live Optic Reticle Overlay
  drawOpticReticle(ctx, sightStyle, aimX, aimY, visionMode);

  // 6. Sync HUD Badges, Fire Mode, Armor Readout & Live MOA Group Telemetry
  syncFireModeForPlatform(computed.parts.platform);
  const availModes = getAvailableFireModes(computed.parts.platform);
  const fmBtn = document.getElementById('range-firemode-badge');
  if (fmBtn) {
    fmBtn.textContent = availModes.length > 1
      ? `MODE: ${state.range.selectedFireMode} ↻`
      : `MODE: ${state.range.selectedFireMode}`;
  }

  const opticBadge = document.getElementById('range-optic-badge');
  if (opticBadge) {
    const modeTag = visionMode === 'nvg'
      ? (hasIrLaser ? 'GEN-3 NVG + IR BEAM' : 'GEN-3 NVG')
      : visionMode === 'thermal'
        ? 'FLIR WHITE-HOT'
        : (computed.parts.sight.zoom || '1.0x');
    opticBadge.textContent = `OPTIC: ${computed.parts.sight.name} [${modeTag}]`;
  }

  const armorStatusEl = document.getElementById('range-armor-status');
  if (armorStatusEl) {
    const penEval = evaluateArmorPenetration(computed, targetType, state.range.distance);
    if (penEval.isArmor) {
      armorStatusEl.classList.remove('hidden');
      const verdict = penEval.penetrated ? 'PENETRATES' : 'STOPPED BY PLATE';
      armorStatusEl.textContent = `${penEval.armorLabel} (${state.range.distance}m): ${verdict} — Eff. Pen ${penEval.effectivePen} vs ${penEval.requiredPen} req`;
      armorStatusEl.className = penEval.penetrated
        ? 'px-2.5 py-1 text-[11px] font-mono font-bold border border-olive-700 bg-olive-100/75 text-olive-800'
        : 'px-2.5 py-1 text-[11px] font-mono font-bold border border-rust-600 bg-rust-100 text-rust-700';
    } else {
      armorStatusEl.classList.add('hidden');
    }
  }

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

  const groupMetrics = computeLiveGroupMetrics(
    state.range.impacts,
    state.range.distance,
    state.range.shotsFired,
    state.range.shotsHit
  );

  document.getElementById('range-shots-hit').textContent = `${state.range.shotsHit}/${state.range.shotsFired}`;
  const accPctEl = document.getElementById('range-accuracy-pct');
  if (accPctEl) accPctEl.textContent = `${groupMetrics.accuracyPct}% acc`;

  document.getElementById('range-total-dmg').textContent = state.range.totalDamage.toLocaleString();
  document.getElementById('range-ttk-readout').textContent = `${computed.ttkSec}s`;
  document.getElementById('range-spread-readout').textContent = groupMetrics.hasGroup
    ? `${groupMetrics.groupMoa} MOA (${groupMetrics.groupCm}cm)`
    : `${liveMoa} MOA (est)`;
}

export function triggerSingleShot(aimX = 160, aimY = 172) {
  const computed = computeBuildMetrics(state.selectedParts);
  if (state.range.ammo <= 0) {
    playMechanicalClick(220);
    return;
  }

  const now = Date.now();
  const elapsedMs = state.range.lastShotAt ? (now - state.range.lastShotAt) : Infinity;
  const decaySteps = Number.isFinite(elapsedMs) ? Math.max(0, (elapsedMs - 90) / 200) : Infinity;
  state.range.recoilStack = Number.isFinite(decaySteps)
    ? Math.max(0, (state.range.recoilStack || 0) - decaySteps)
    : 0;
  const shotIdx = Math.min(18, state.range.recoilStack);
  state.range.recoilStack = Math.min(18, state.range.recoilStack + 1);

  state.range.ammo -= 1;
  state.range.lastShotAt = now;
  const barrelHeat = computed.parts.barrel.style === 'lmg_pecheneg' ? 4.5
    : computed.parts.barrel.style === 'pencil_16' ? 12
    : 8;
  const muzzleHeatAdj = computed.parts.muzzle && computed.parts.muzzle.flowThrough ? -2 : 0;
  const ammoHeatAdj = (computed.parts.ammo && (computed.parts.ammo.tracer || computed.parts.ammo.incendiary)) ? 3 : 0;
  const heatGain = computed.isEnergy ? 2 : Math.max(2, barrelHeat + muzzleHeatAdj + ammoHeatAdj);
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
  } else if (state.range.selectedFireMode === 'PUMP-ACTION' || state.range.selectedFireMode === 'LEVER-ACTION') {
    setTimeout(() => playMechanicalClick(520), 185);
  }

  const targetType = state.range.targetType || 'paper';
  const distFactor = computeDistanceSpreadMultiplier(state.range.distance, computed.parts.sight);
  const thermalPenalty = state.range.heat >= 180 ? 1.75 : state.range.heat >= 110 ? 1.25 : 1.0;
  const isShotgun = computed.parts.platform.shape === 'shotgun';
  const isSingleSlug = Boolean(computed.parts.ammo && computed.parts.ammo.singleSlug);
  const isTracer = Boolean(computed.parts.ammo && computed.parts.ammo.tracer);
  const isIncendiary = Boolean(computed.parts.ammo && computed.parts.ammo.incendiary);
  const rangedDamage = computeDamageAtDistance(computed.stats.damage, computed.stats.range, state.range.distance);
  const penEval = evaluateArmorPenetration(computed, targetType, state.range.distance);

  if (isShotgun && !isSingleSlug) {
    const pelletCount = 8;
    const isFlechette = computed.parts.ammo && computed.parts.ammo.id === 'ammo_12ga_flechette';
    const patternRadius = (isFlechette ? 16 : 30) * distFactor * thermalPenalty;
    const perPelletDmg = Math.max(4, Math.round(rangedDamage / pelletCount));
    let steelTriggered = false;
    let armorTriggered = false;
    state.range.shotsFired += pelletCount;
    for (let p = 0; p < pelletCount; p++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * patternRadius;
      const px = clamp(aimX + Math.cos(angle) * r, 14, 306);
      const py = clamp(aimY + Math.sin(angle) * r, 14, 306);
      const hitCheck = isPointOnTarget(px, py, targetType);
      let dmg = 0;
      if (hitCheck.onTarget) {
        state.range.shotsHit += 1;
        if (penEval.isArmor) {
          dmg = penEval.penetrated ? Math.round(perPelletDmg * (hitCheck.isCrit ? 1.5 : 1.0)) : 0;
          armorTriggered = true;
        } else {
          dmg = Math.round(perPelletDmg * (hitCheck.isCrit ? 1.5 : 1.0));
          if (targetType === 'steel') steelTriggered = true;
        }
        state.range.totalDamage += dmg;
      }
      state.range.impacts.push({
        x: px,
        y: py,
        dmg,
        crit: hitCheck.isCrit,
        pellet: true,
        tracer: isTracer,
        incendiary: isIncendiary,
        steelHit: targetType === 'steel' && hitCheck.onTarget,
        armorResult: penEval.isArmor && hitCheck.onTarget ? penEval : null
      });
    }
    if (steelTriggered) playSteelPingSound(state.range.distance);
    if (armorTriggered) {
      state.range.lastPenResult = penEval;
      playArmorImpactSound(penEval.penetrated);
    }
  } else {
    const spreadPx = ((105 - computed.stats.accuracy) * 0.28) * distFactor * thermalPenalty;
    const verticalClimb = Math.min(68, shotIdx * ((105 - computed.stats.control) * 0.16));
    const horizDrift = (Math.random() - 0.5) * spreadPx * 2.1;

    const hitX = clamp(aimX + horizDrift, 16, 304);
    const hitY = clamp(aimY - verticalClimb + (Math.random() - 0.5) * spreadPx, 16, 304);
    const hitCheck = isPointOnTarget(hitX, hitY, targetType);

    state.range.shotsFired += 1;
    let shotDmg = 0;
    if (hitCheck.onTarget) {
      state.range.shotsHit += 1;
      if (penEval.isArmor) {
        state.range.lastPenResult = penEval;
        playArmorImpactSound(penEval.penetrated);
        shotDmg = penEval.penetrated
          ? Math.round(rangedDamage * (hitCheck.isCrit ? 1.65 : 1.0))
          : Math.round(rangedDamage * 0.08);
      } else {
        if (targetType === 'steel') playSteelPingSound(state.range.distance);
        shotDmg = Math.round(rangedDamage * (hitCheck.isCrit ? 1.65 : 1.0));
      }
      state.range.totalDamage += shotDmg;
    }

    state.range.impacts.push({
      x: hitX,
      y: hitY,
      dmg: shotDmg,
      crit: hitCheck.isCrit,
      tracer: isTracer,
      incendiary: isIncendiary,
      steelHit: targetType === 'steel' && hitCheck.onTarget,
      armorResult: penEval.isArmor && hitCheck.onTarget ? penEval : null
    });
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
    state.range.aimPos = { x: currentAimX, y: currentAimY, active: true };
  };

  const stopBurst = () => {
    if (burstInterval) {
      clearInterval(burstInterval);
      burstInterval = null;
    }
  };

  const stopFullAuto = () => {
    if (autoFireTimer) {
      clearInterval(autoFireTimer);
      autoFireTimer = null;
    }
  };

  const startFullAuto = (clientX, clientY) => {
    stopFullAuto();
    stopBurst();
    updateCanvasAim(clientX, clientY);
    const computed = computeBuildMetrics(state.selectedParts);
    syncFireModeForPlatform(computed.parts.platform);
    const mode = state.range.selectedFireMode;

    triggerSingleShot(currentAimX, currentAimY);

    if (['SEMI', 'BOLT-ACTION', 'PUMP-ACTION', 'LEVER-ACTION', 'REVOLVER'].includes(mode)) {
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

  document.getElementById('range-firemode-badge').addEventListener('click', () => {
    const computed = computeBuildMetrics(state.selectedParts);
    const modes = getAvailableFireModes(computed.parts.platform);
    if (modes.length <= 1) return;
    const nextIdx = (modes.indexOf(state.range.selectedFireMode) + 1) % modes.length;
    state.range.selectedFireMode = modes[nextIdx];
    playMechanicalClick(680);
    renderRangeCanvas(computed);
  });

  if (window._barrelCoolingInterval) clearInterval(window._barrelCoolingInterval);
  window._barrelCoolingInterval = setInterval(() => {
    if ((Date.now() - state.range.lastShotAt) > 380) {
      if (state.range.recoilStack > 0) {
        state.range.recoilStack = Math.max(0, state.range.recoilStack - 1.5);
      }
      if (state.range.heat > 24) {
        const computed = computeBuildMetrics(state.selectedParts);
        const coolStep = computed.parts.barrel.style === 'lmg_pecheneg' ? 8
          : (computed.parts.barrel.style === 'carbon' || computed.parts.barrel.style === 'pencil_16') ? 6.5
          : 4.5;
        state.range.heat = Math.max(24, state.range.heat - coolStep);
        if (state.activeView === 'range') {
          renderRangeCanvas(computed);
        }
      }
    }
  }, 350);

  rangeCanvas.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    startFullAuto(e.clientX, e.clientY);
  });
  rangeCanvas.addEventListener('mousemove', (e) => {
    updateCanvasAim(e.clientX, e.clientY);
    if (!autoFireTimer) {
      renderRangeCanvas(computeBuildMetrics(state.selectedParts));
    }
  });
  window.addEventListener('mouseup', stopFullAuto);
  rangeCanvas.addEventListener('mouseleave', () => {
    stopFullAuto();
    state.range.aimPos.active = false;
    renderRangeCanvas(computeBuildMetrics(state.selectedParts));
  });
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
    state.range.impacts = [];
    state.range.shotsFired = 0;
    state.range.shotsHit = 0;
    state.range.totalDamage = 0;
    playMechanicalClick(530);
    renderRangeCanvas(computeBuildMetrics(state.selectedParts));
  });

  const targetSelect = document.getElementById('range-target-select');
  if (targetSelect) {
    targetSelect.addEventListener('change', (e) => {
      state.range.targetType = e.target.value || 'paper';
      state.range.impacts = [];
      state.range.shotsFired = 0;
      state.range.shotsHit = 0;
      state.range.totalDamage = 0;
      state.range.lastPenResult = null;
      playMechanicalClick(560);
      renderRangeCanvas(computeBuildMetrics(state.selectedParts));
    });
  }

  document.getElementById('btn-range-reload').addEventListener('click', () => {
    stopBurst();
    stopFullAuto();
    const computed = computeBuildMetrics(state.selectedParts);
    state.range.ammo = computed.capacity;
    state.range.maxAmmo = computed.capacity;
    state.range.heat = 24;
    state.range.recoilStack = 0;
    playReloadSound();
    renderRangeCanvas(computed);
  });

  document.getElementById('btn-range-clear').addEventListener('click', () => {
    stopBurst();
    stopFullAuto();
    state.range.impacts = [];
    state.range.shotsFired = 0;
    state.range.shotsHit = 0;
    state.range.totalDamage = 0;
    state.range.lastPenResult = null;
    state.range.heat = 24;
    state.range.recoilStack = 0;
    renderRangeCanvas(computeBuildMetrics(state.selectedParts));
  });

  document.getElementById('btn-sim-burst').addEventListener('click', () => {
    stopBurst();
    stopFullAuto();
    const computed = computeBuildMetrics(state.selectedParts);
    const delayMs = Math.max(48, Math.round(60000 / Math.max(120, computed.stats.fireRate)));
    triggerSingleShot(160, 178);
    let count = 1;
    burstInterval = setInterval(() => {
      if (count >= 5 || state.range.ammo <= 0) {
        if (state.range.ammo <= 0 && count < 5) playMechanicalClick(210);
        stopBurst();
        return;
      }
      triggerSingleShot(160, 178);
      count++;
      if (count >= 5) stopBurst();
    }, delayMs);
  });
}
