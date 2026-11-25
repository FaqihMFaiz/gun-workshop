import { CATEGORIES, MATERIAL_RATES } from '../data/catalog.js';
import { PRESETS, PRESET_CATEGORIES } from '../data/presets.js';
import { state } from '../state.js';
import { clamp, escapeHtml, formatGrams } from '../engine/utils.js';
import { computeBuildMetrics } from '../engine/ballistics.js';
import { renderMiniWeaponSVG, getThemeSvgPalette } from './svgRenderer.js';

export function renderPresetRackModal() {
  const tabsEl = document.getElementById('preset-rack-tabs');
  const gridEl = document.getElementById('preset-rack-grid');
  const searchEl = document.getElementById('preset-rack-search');
  if (!tabsEl || !gridEl) return;

  if (searchEl && searchEl.value !== state.presetRackQuery) {
    searchEl.value = state.presetRackQuery;
  }

  tabsEl.innerHTML = PRESET_CATEGORIES.map(cat => {
    const active = state.presetRackCategory === cat;
    const count = cat === 'All'
      ? Object.keys(PRESETS).length
      : Object.values(PRESETS).filter(p => p.category === cat).length;
    return `
      <button type="button" data-rack-cat="${escapeHtml(cat)}"
        class="px-2.5 py-1 text-[11px] font-mono border transition ${
          active
            ? 'bg-olive-800 text-white border-ink-900 font-bold'
            : 'bg-paper-50 text-ink-900 border-ink-900/35 hover:border-ink-900 hover:bg-paper-100'
        }">
        ${escapeHtml(cat)} <span class="opacity-75">(${count})</span>
      </button>
    `;
  }).join('');

  const q = String(state.presetRackQuery || '').trim().toLowerCase();
  const entries = Object.entries(PRESETS).filter(([, p]) => {
    if (state.presetRackCategory !== 'All' && p.category !== state.presetRackCategory) return false;
    if (!q) return true;
    const m = computeBuildMetrics(p.parts);
    const hay = `${p.name} ${p.category} ${m.caliber} ${m.propulsion} ${m.fireMode}`.toLowerCase();
    return hay.includes(q);
  });

  if (entries.length === 0) {
    gridEl.innerHTML = `<div class="col-span-full p-6 text-center text-xs font-mono text-ink-700 border border-ink-900/25 bg-paper-50">No presets match this category or search filter.</div>`;
    return;
  }

  gridEl.innerHTML = entries.map(([key, preset]) => {
    const metrics = computeBuildMetrics(preset.parts);
    const miniSvg = renderMiniWeaponSVG(metrics, { camoId: preset.camo, twoToneEnabled: false });
    return `
      <button type="button" data-rack-preset="${escapeHtml(key)}"
        class="part-card-box p-3 border border-ink-900/40 hover:border-ink-900 bg-paper-50 hover:bg-paper-100 text-left flex flex-col gap-2 transition">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <span class="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 bg-paper-200 border border-ink-900/25 text-ink-700 font-semibold">${escapeHtml(preset.category)}</span>
            <h4 class="text-xs font-display font-bold uppercase text-ink-900 mt-1 leading-snug">${escapeHtml(preset.name)}</h4>
          </div>
          <span class="shrink-0 text-[10px] font-mono font-bold text-rust-700">${metrics.powerScore}/100</span>
        </div>

        <div class="text-[10px] font-mono text-ink-500 truncate">${escapeHtml(metrics.caliber)} &middot; ${escapeHtml(metrics.fireMode)}</div>

        <div class="h-20 px-2 py-1 bg-paper-100/90 border border-ink-900/15 flex items-center justify-center overflow-hidden">
          ${miniSvg}
        </div>

        <div class="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-ink-900/15 text-ink-700">
          <span>DMG <strong class="text-ink-900">${metrics.stats.damage}</strong> &middot; <strong class="text-ink-900">${metrics.stats.fireRate}</strong> RPM</span>
          <span>${metrics.stats.weight.toFixed(2)} kg &middot; <strong class="text-rust-700">$${metrics.stats.cost.toLocaleString()}</strong></span>
        </div>
      </button>
    `;
  }).join('');
}

export function buildComparisonRadarSVG(baseStats, currStats, theme = 'paper') {
  const pal = getThemeSvgPalette(theme);
  const axes = [
    { key: 'damage', label: 'DMG' },
    { key: 'range', label: 'RNG' },
    { key: 'accuracy', label: 'ACC' },
    { key: 'control', label: 'CTL' },
    { key: 'mobility', label: 'MOB' },
    { key: 'penetration', label: 'PEN' }
  ];
  const cx = 160;
  const cy = 132;
  const maxR = 86;

  const angleFor = (idx) => (-Math.PI / 2) + (idx * (2 * Math.PI)) / axes.length;
  const pointAt = (idx, ratio) => {
    const a = angleFor(idx);
    const r = maxR * clamp(ratio, 0.08, 1);
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  };

  const rings = [0.25, 0.5, 0.75, 1.0].map(ratio => {
    const pts = axes.map((_, i) => {
      const p = pointAt(i, ratio);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');
    return `<polygon points="${pts}" fill="none" stroke="${pal.chartGrid}" stroke-width="1" stroke-dasharray="${ratio < 1 ? '3 2' : '0'}"/>`;
  }).join('');

  const spokes = axes.map((ax, i) => {
    const outer = pointAt(i, 1);
    const lbl = pointAt(i, 1.22);
    return `
      <line x1="${cx}" y1="${cy}" x2="${outer.x.toFixed(1)}" y2="${outer.y.toFixed(1)}" stroke="${pal.chartGrid}" stroke-width="1"/>
      <text x="${lbl.x.toFixed(1)}" y="${(lbl.y + 3).toFixed(1)}" text-anchor="middle" fill="${pal.text}" font-family="IBM Plex Mono, monospace" font-size="10" font-weight="700">${ax.label}</text>
    `;
  }).join('');

  const polyFor = (statsObj, strokeCol, fillCol) => {
    const coords = axes.map((ax, i) => pointAt(i, (statsObj[ax.key] || 0) / 100));
    const ptsStr = coords.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const dots = coords.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.2" fill="${strokeCol}"/>`).join('');
    return `
      <polygon points="${ptsStr}" fill="${fillCol}" fill-opacity="0.22" stroke="${strokeCol}" stroke-width="2"/>
      ${dots}
    `;
  };

  const baseColor = theme === 'blueprint' ? '#38bdf8' : '#0284c7';
  const currColor = theme === 'dark' ? '#4ade80' : pal.cogStroke;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 264" class="w-full max-w-[320px] h-auto mx-auto">
    ${rings}
    ${spokes}
    ${polyFor(baseStats || {}, baseColor, baseColor)}
    ${polyFor(currStats || {}, currColor, currColor)}
    <g transform="translate(22, 248)">
      <rect x="0" y="-7" width="10" height="8" fill="${baseColor}" fill-opacity="0.45" stroke="${baseColor}" stroke-width="1.5"/>
      <text x="15" y="0" fill="${pal.text}" font-family="IBM Plex Mono, monospace" font-size="9.5" font-weight="600">Pinned Baseline</text>
      <rect x="148" y="-7" width="10" height="8" fill="${currColor}" fill-opacity="0.45" stroke="${currColor}" stroke-width="1.5"/>
      <text x="163" y="0" fill="${pal.text}" font-family="IBM Plex Mono, monospace" font-size="9.5" font-weight="600">Current Build</text>
    </g>
  </svg>`;
}

export function renderComparisonModal(currentMetrics) {
  const bodyEl = document.getElementById('compare-modal-body');
  if (!bodyEl || !state.pinnedBuild) return;

  const pin = state.pinnedBuild;
  const baseMetrics = pin.parts ? computeBuildMetrics(pin.parts) : null;
  const baseStats = baseMetrics ? baseMetrics.stats : pin.stats;

  const baseSvg = baseMetrics
    ? renderMiniWeaponSVG(baseMetrics, {
        camoId: pin.camoId || 'obsidian',
        furnitureCamoId: pin.furnitureCamoId || 'fde',
        twoToneEnabled: Boolean(pin.twoToneEnabled)
      })
    : '<div class="text-xs font-mono text-ink-500">Baseline preview unavailable</div>';
  const currSvg = renderMiniWeaponSVG(currentMetrics, {
    camoId: state.camoId,
    furnitureCamoId: state.furnitureCamoId,
    twoToneEnabled: state.twoToneEnabled
  });

  const radarSvg = buildComparisonRadarSVG(baseStats, currentMetrics.stats, state.theme);

  const fmtDiff = (diff, unit = '', higherGood = true, decimals = 0, prefix = '') => {
    if (Math.abs(diff) < 0.005) return '<span class="text-ink-500">0</span>';
    const good = higherGood ? diff > 0 : diff < 0;
    const sign = diff > 0 ? '+' : '-';
    const valStr = decimals > 0 ? Math.abs(diff).toFixed(decimals) : Math.round(Math.abs(diff)).toLocaleString();
    return `<span class="font-bold ${good ? 'text-olive-700' : 'text-rust-700'}">${sign}${prefix}${valStr}${unit}</span>`;
  };

  const baseLen = baseMetrics ? baseMetrics.lengthMm : (pin.lengthMm || 0);
  const baseScore = baseMetrics ? baseMetrics.powerScore : (pin.powerScore || 0);
  const baseVel = baseMetrics ? baseMetrics.velocityMs : (pin.velocityMs || 0);
  const baseAds = baseMetrics ? baseMetrics.adsMs : (pin.adsMs || 0);
  const baseReload = baseMetrics ? baseMetrics.reloadSec : (pin.reloadSec || 0);
  const baseDb = baseMetrics ? baseMetrics.acousticDb : (pin.acousticDb || 0);
  const baseGrams = baseMetrics ? baseMetrics.production.totalGrams : 0;
  const baseMatCost = baseMetrics ? baseMetrics.production.materialCost : 0;
  const basePay = baseMetrics ? baseMetrics.production.workerPay : 0;
  const baseHrs = baseMetrics ? baseMetrics.production.mfgHours : 0;

  const rows = [
    { label: 'Composite Index', base: `${baseScore}/100`, curr: `${currentMetrics.powerScore}/100`, diff: fmtDiff(currentMetrics.powerScore - baseScore, '', true) },
    { label: 'Overall Length', base: `${baseLen} mm`, curr: `${currentMetrics.lengthMm} mm`, diff: fmtDiff(currentMetrics.lengthMm - baseLen, ' mm', false) },
    { label: 'Dry Weight', base: `${baseStats.weight.toFixed(2)} kg`, curr: `${currentMetrics.stats.weight.toFixed(2)} kg`, diff: fmtDiff(currentMetrics.stats.weight - baseStats.weight, ' kg', false, 2) },
    { label: 'Est. Build Cost', base: `$${baseStats.cost.toLocaleString()}`, curr: `$${currentMetrics.stats.cost.toLocaleString()}`, diff: fmtDiff(currentMetrics.stats.cost - baseStats.cost, '', false, 0, '$') },
    { label: 'Muzzle Velocity', base: `${baseVel} m/s`, curr: `${currentMetrics.velocityMs} m/s`, diff: fmtDiff(currentMetrics.velocityMs - baseVel, ' m/s', true) },
    { label: 'ADS Handling', base: `${baseAds} ms`, curr: `${currentMetrics.adsMs} ms`, diff: fmtDiff(currentMetrics.adsMs - baseAds, ' ms', false) },
    { label: 'Reload Cycle', base: `${baseReload} s`, curr: `${currentMetrics.reloadSec} s`, diff: fmtDiff(currentMetrics.reloadSec - baseReload, ' s', false, 2) },
    { label: 'Sound Pressure', base: `${baseDb} dB`, curr: `${currentMetrics.acousticDb} dB`, diff: fmtDiff(currentMetrics.acousticDb - baseDb, ' dB', false) },
    { label: 'BOM Total Mass', base: formatGrams(baseGrams), curr: formatGrams(currentMetrics.production.totalGrams), diff: fmtDiff(currentMetrics.production.totalGrams - baseGrams, ' g', false) },
    { label: 'Material Cost', base: `$${baseMatCost.toFixed(2)}`, curr: `$${currentMetrics.production.materialCost.toFixed(2)}`, diff: fmtDiff(currentMetrics.production.materialCost - baseMatCost, '', false, 2, '$') },
    { label: 'Worker Pay', base: `$${basePay.toFixed(2)}`, curr: `$${currentMetrics.production.workerPay.toFixed(2)}`, diff: fmtDiff(currentMetrics.production.workerPay - basePay, '', false, 2, '$') },
    { label: 'Mfg Time', base: `${baseHrs} hrs`, curr: `${currentMetrics.production.mfgHours} hrs`, diff: fmtDiff(currentMetrics.production.mfgHours - baseHrs, ' hrs', false, 1) }
  ];

  const changedSlots = baseMetrics
    ? CATEGORIES.filter(c => baseMetrics.parts[c.id].id !== currentMetrics.parts[c.id].id)
    : [];

  bodyEl.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div class="p-3 bg-paper-100 border border-sky-700/60 border-l-4">
        <div class="flex items-center justify-between text-[10px] font-mono uppercase text-ink-500">
          <span>Pinned Baseline</span>
          <span class="font-bold text-ink-900">${baseScore}/100</span>
        </div>
        <div class="text-sm font-display font-bold uppercase text-ink-900 truncate mt-0.5">${escapeHtml(pin.name)}</div>
        <div class="h-24 mt-2 bg-paper-50 border border-ink-900/15 p-1 flex items-center justify-center">${baseSvg}</div>
      </div>

      <div class="p-3 bg-paper-100 border border-rust-600/80 border-l-4">
        <div class="flex items-center justify-between text-[10px] font-mono uppercase text-ink-500">
          <span>Current Workbench Build</span>
          <span class="font-bold text-ink-900">${currentMetrics.powerScore}/100</span>
        </div>
        <div class="text-sm font-display font-bold uppercase text-ink-900 truncate mt-0.5">${escapeHtml(state.weaponName)}</div>
        <div class="h-24 mt-2 bg-paper-50 border border-ink-900/15 p-1 flex items-center justify-center">${currSvg}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
      <div class="lg:col-span-5 p-3 bg-paper-100 border border-ink-900/25 flex flex-col items-center">
        <div class="text-[11px] font-mono uppercase font-bold text-ink-700 mb-1">6-Axis Ballistic Comparison</div>
        ${radarSvg}
      </div>

      <div class="lg:col-span-7 overflow-x-auto border border-ink-900/25 bg-paper-50">
        <table class="w-full text-xs font-mono">
          <thead class="bg-paper-200 border-b border-ink-900/30 text-[10px] uppercase text-ink-700">
            <tr>
              <th class="text-left py-1.5 px-2.5">Metric / BOM</th>
              <th class="text-right py-1.5 px-2.5">Baseline</th>
              <th class="text-right py-1.5 px-2.5">Current</th>
              <th class="text-right py-1.5 px-2.5">Delta</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ink-900/10">
            ${rows.map(r => `
              <tr>
                <td class="py-1 px-2.5 text-ink-700">${r.label}</td>
                <td class="py-1 px-2.5 text-right text-ink-500">${r.base}</td>
                <td class="py-1 px-2.5 text-right font-bold text-ink-900">${r.curr}</td>
                <td class="py-1 px-2.5 text-right">${r.diff}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="p-3 bg-paper-100 border border-ink-900/25">
      <div class="text-[11px] font-mono uppercase font-bold text-ink-700 mb-1.5">
        Changed Components (${changedSlots.length} / ${CATEGORIES.length})
      </div>
      ${changedSlots.length === 0
        ? '<p class="text-xs font-mono text-ink-500">Current parts match the pinned baseline identically.</p>'
        : `<div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-mono">
            ${changedSlots.map(c => `
              <div class="px-2 py-1 bg-paper-50 border border-ink-900/20 truncate">
                <strong class="text-ink-900">${escapeHtml(c.short)}:</strong>
                <span class="text-ink-500 line-through">${escapeHtml(baseMetrics.parts[c.id].name)}</span>
                &rarr;
                <span class="text-olive-800 font-semibold">${escapeHtml(currentMetrics.parts[c.id].name)}</span>
              </div>
            `).join('')}
          </div>`
      }
    </div>
  `;
}
