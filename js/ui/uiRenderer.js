import { CATEGORIES, CAMO_FINISHES, PARTS_DB, MATERIAL_RATES } from '../data/catalog.js';
import { state } from '../state.js';
import { clamp, getPartById, formatGrams } from '../engine/utils.js';
import { getPartManufacturingProfile } from '../engine/manufacturing.js';
import { checkPartCompatibility } from '../engine/compatibility.js';

export function renderCategoryTabs() {
  const container = document.getElementById('category-tabs-container');
  const activeIdx = CATEGORIES.findIndex(c => c.id === state.activeCategory);
  document.getElementById('active-slot-counter').textContent = `Section ${activeIdx + 1} of ${CATEGORIES.length}`;

  const currentCatObj = CATEGORIES[activeIdx] || CATEGORIES[0];
  document.getElementById('current-category-title').textContent = currentCatObj.name;
  document.getElementById('current-category-subtitle').textContent = currentCatObj.subtitle;
  const ovEl = document.getElementById('current-category-overview');
  if (ovEl) ovEl.textContent = currentCatObj.overview || currentCatObj.subtitle;

  container.innerHTML = CATEGORIES.map((cat, idx) => {
    const isActive = cat.id === state.activeCategory;
    return `
      <button type="button" data-category-btn="${cat.id}"
        class="px-3 py-1.5 text-xs font-mono font-semibold border-t border-l border-r transition ${
          isActive
            ? 'bg-paper-100 border-ink-900 text-ink-900 -mb-[1px] pb-[7px]'
            : 'bg-paper-300/60 border-ink-900/30 text-ink-700 hover:bg-paper-100/70'
        }">
        ${idx + 1}. ${cat.short}
      </button>
    `;
  }).join('');
}

export function renderCamoSelector() {
  const container = document.getElementById('camo-selector');
  container.innerHTML = CAMO_FINISHES.map(camo => {
    const active = camo.id === state.camoId;
    return `
      <button type="button" data-camo-id="${camo.id}" title="${camo.name}"
        class="w-4 h-4 border transition ${active ? 'border-rust-600 ring-1 ring-rust-600 scale-110' : 'border-ink-900/60 opacity-80 hover:opacity-100'}"
        style="background-color: ${camo.primary};">
      </button>
    `;
  }).join('');
}

export function renderPartsList() {
  const container = document.getElementById('parts-list-container');
  const parts = PARTS_DB[state.activeCategory] || [];
  const equippedId = state.selectedParts[state.activeCategory];

  container.innerHTML = parts.map(part => {
    const isEquipped = part.id === equippedId;
    const compat = checkPartCompatibility(state.activeCategory, part, state.selectedParts);
    const isBlocked = !compat.compatible && !isEquipped;

    const statItems = [];
    const statLabels = {
      damage: 'DMG', fireRate: 'RPM', range: 'RNG', accuracy: 'ACC',
      control: 'CTL', mobility: 'MOB', penetration: 'PEN'
    };
    Object.keys(statLabels).forEach(k => {
      const val = part.stats[k];
      if (val && val !== 0) {
        const isPos = val > 0;
        const sign = state.activeCategory === 'platform' ? '' : (isPos ? '+' : '');
        const textColor = state.activeCategory === 'platform'
          ? 'text-ink-700'
          : isPos
            ? 'text-olive-700 font-semibold'
            : 'text-rust-700 font-semibold';
        statItems.push(`<span class="text-[11px] font-mono ${textColor}">${statLabels[k]} ${sign}${val}</span>`);
      }
    });

    const eqMag = getPartById('magazine', state.selectedParts.magazine);
    const mfg = getPartManufacturingProfile(state.activeCategory, part, eqMag ? eqMag.capacity : 30);
    const matEntries = Object.entries(mfg.materials);
    const matSummaryHtml = matEntries.length
      ? matEntries.map(([mName, g]) => `<span>${mName}: <strong class="text-ink-900">${formatGrams(g)}</strong></span>`).join('<span class="text-ink-500/40">&middot;</span>')
      : '<span>No raw materials required</span>';

    return `
      <div data-part-card="${part.id}" data-incompatible="${isBlocked ? 'true' : 'false'}"
        class="px-4 py-3 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
          isEquipped
            ? 'bg-olive-100/80 border-l-4 border-l-olive-800 cursor-pointer'
            : isBlocked
              ? 'bg-paper-200/70 opacity-65 border-l-4 border-l-rust-600/70 cursor-not-allowed'
              : 'bg-paper-50 hover:bg-paper-100 border-l-4 border-l-transparent cursor-pointer'
        }">
        <div class="flex-1 min-w-0">
          <div class="flex items-center flex-wrap gap-2">
            <span class="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 border ${
              isEquipped
                ? 'bg-olive-800 text-white border-olive-800 font-bold'
                : isBlocked
                  ? 'bg-rust-700 text-white border-rust-700 font-bold'
                  : 'bg-paper-200 text-ink-700 border-ink-900/25'
            }">${isEquipped ? 'Installed' : isBlocked ? 'Incompatible' : part.tag}</span>
            <h3 class="text-sm font-bold ${isBlocked ? 'text-ink-500 line-through' : 'text-ink-900'}">${part.name}</h3>
          </div>
          <p class="text-xs text-ink-700 mt-1 leading-relaxed">${part.desc}</p>
          <div class="mt-1.5 px-2 py-1 bg-paper-200/60 border border-ink-900/15 text-[10px] font-mono text-ink-700 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span class="uppercase font-bold text-ink-500">Materials${mfg.rounds ? ` (${mfg.rounds}-rd load)` : ''}:</span>
            ${matSummaryHtml}
          </div>
          ${isBlocked ? `<div class="mt-1.5 text-[11px] font-mono font-semibold text-rust-700">Conflict: ${compat.reason}</div>` : ''}
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            ${statItems.join('<span class="text-ink-500/40">/</span>')}
          </div>
        </div>
        <div class="sm:text-right font-mono text-[11px] text-ink-700 shrink-0 grid grid-cols-2 sm:flex sm:flex-col gap-x-3 gap-y-0.5 border-t sm:border-t-0 pt-1.5 sm:pt-0 border-ink-900/10 min-w-[118px]">
          <div class="font-bold text-ink-900 text-xs">$${part.stats.cost.toLocaleString()} <span class="text-[10px] font-normal text-ink-500">MSRP</span></div>
          <div>Mat: <strong class="text-ink-900">$${mfg.materialCost.toFixed(2)}</strong></div>
          <div>Labor: <strong class="text-olive-800">$${mfg.workerPay.toFixed(2)}</strong></div>
          <div>Time: <strong class="text-rust-700">${mfg.mfgHours} hrs</strong></div>
          <div class="text-ink-500">${part.stats.weight >= 0 ? '+' : ''}${part.stats.weight.toFixed(2)} kg</div>
        </div>
      </div>
    `;
  }).join('');
}

export function renderQuickLoadoutStrip(computed) {
  const strip = document.getElementById('quick-loadout-strip');
  strip.innerHTML = CATEGORIES.map((cat, idx) => {
    const part = computed.parts[cat.id];
    const isAct = state.activeCategory === cat.id;
    const num = String(idx + 1).padStart(2, '0');
    return `
      <button type="button" data-category-btn="${cat.id}"
        class="p-2 border text-left transition ${
          isAct
            ? 'bg-olive-800 text-white border-ink-900'
            : 'bg-paper-50 text-ink-900 border-ink-900/35 hover:border-ink-900 hover:bg-paper-100'
        }">
        <div class="text-[9px] font-mono uppercase ${isAct ? 'text-paper-200' : 'text-ink-500'} truncate">
          ${num}. ${cat.short}
        </div>
        <div class="text-[11px] font-semibold truncate mt-0.5">${part.name}</div>
      </button>
    `;
  }).join('');
}

export function renderFalloffChart(metrics) {
  const svg = document.getElementById('falloff-chart-svg');
  if (!svg) return;

  const baseDmg = metrics.stats.damage;
  const dropStart = 15 + (metrics.stats.range * 0.65);
  const minDmg = Math.max(12, Math.round(baseDmg * 0.54));

  const points = [0, 20, 40, 60, 80, 100, 120].map(dist => {
    let dmg = baseDmg;
    if (dist > dropStart) {
      const factor = Math.min(1, (dist - dropStart) / 65);
      dmg = Math.round(baseDmg - (baseDmg - minDmg) * factor);
    }
    const x = 24 + (dist / 120) * 224;
    const y = 90 - (dmg / 100) * 76;
    return { dist, dmg, x, y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} 92 L ${points[0].x.toFixed(1)} 92 Z`;

  svg.innerHTML = `
    <line x1="24" y1="18" x2="248" y2="18" stroke="#d5cbb8" stroke-width="1" stroke-dasharray="2 2"/>
    <line x1="24" y1="55" x2="248" y2="55" stroke="#d5cbb8" stroke-width="1" stroke-dasharray="2 2"/>
    <line x1="24" y1="92" x2="248" y2="92" stroke="#1c1b18" stroke-width="1.2"/>
    <path d="${areaD}" fill="#3f4d37" fill-opacity="0.12"/>
    <path d="${pathD}" fill="none" stroke="#1c1b18" stroke-width="2"/>
    ${points.filter((_, i) => i % 2 === 0).map(p => `
      <rect x="${p.x - 2.5}" y="${p.y - 2.5}" width="5" height="5" fill="#9e3223"/>
      <text x="${p.x}" y="${p.y - 6}" text-anchor="middle" fill="#1c1b18" font-family="IBM Plex Mono" font-size="8.5" font-weight="600">${p.dmg}</text>
      <text x="${p.x}" y="104" text-anchor="middle" fill="#6b675c" font-family="IBM Plex Mono" font-size="8">${p.dist}m</text>
    `).join('')}
  `;
}

export function renderTelemetryAndDeltas(currentMetrics, previewMetrics) {
  const isHovering = Boolean(state.hoveredPartId && previewMetrics);
  const activeMetrics = isHovering ? previewMetrics : currentMetrics;
  const baselineStats = state.pinnedBuild
    ? state.pinnedBuild.stats
    : (isHovering ? currentMetrics.stats : null);

  document.getElementById('header-propulsion-badge').textContent = activeMetrics.propulsion;
  document.getElementById('header-caliber-tag').textContent = activeMetrics.caliber;
  document.getElementById('telemetry-length').textContent = `${activeMetrics.lengthMm} mm`;
  document.getElementById('telemetry-mass').textContent = `${activeMetrics.stats.weight.toFixed(2)} kg`;
  document.getElementById('telemetry-cost').textContent = `$${activeMetrics.stats.cost.toLocaleString()}`;

  if (activeMetrics.production) {
    const prod = activeMetrics.production;
    const matCostEl = document.getElementById('telemetry-mat-cost');
    const totMatsEl = document.getElementById('telemetry-total-mats');
    const payEl = document.getElementById('telemetry-worker-pay');
    const timeEl = document.getElementById('telemetry-mfg-time');
    if (matCostEl) matCostEl.textContent = `$${prod.materialCost.toFixed(2)}`;
    if (totMatsEl) totMatsEl.textContent = formatGrams(prod.totalGrams);
    if (payEl) payEl.textContent = `$${prod.workerPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (timeEl) timeEl.textContent = `${prod.mfgHours} hrs`;

    // Populate Technical Data Sheet BOM Ledger
    const bomList = document.getElementById('bom-materials-list');
    if (bomList) {
      const sortedMats = Object.entries(prod.materials).sort((a, b) => b[1] - a[1]);
      bomList.innerHTML = sortedMats.map(([mName, grams]) => {
        const mCost = (grams * (MATERIAL_RATES[mName] || 0.015)).toFixed(2);
        return `
          <div class="flex items-center justify-between gap-2 border-b border-ink-900/10 pb-0.5">
            <span class="text-ink-700 truncate">${mName}</span>
            <span class="text-ink-900 font-semibold shrink-0">${formatGrams(grams)} <span class="text-ink-500 font-normal">($${mCost})</span></span>
          </div>
        `;
      }).join('');
    }
    const bomMassBadge = document.getElementById('bom-total-mass-badge');
    const bomMatCost = document.getElementById('bom-mat-cost');
    const bomPay = document.getElementById('bom-worker-pay');
    const bomTime = document.getElementById('bom-mfg-time');
    if (bomMassBadge) bomMassBadge.textContent = `${formatGrams(prod.totalGrams)} total`;
    if (bomMatCost) bomMatCost.textContent = `$${prod.materialCost.toFixed(2)}`;
    if (bomPay) bomPay.textContent = `$${prod.workerPay.toFixed(2)}`;
    if (bomTime) bomTime.textContent = `${prod.mfgHours} hrs`;
  }

  document.getElementById('overall-power-score').textContent = `${activeMetrics.powerScore} / 100`;
  document.getElementById('spec-velocity').textContent = `${activeMetrics.velocityMs} m/s`;
  document.getElementById('spec-ads').textContent = `${activeMetrics.adsMs} ms`;
  document.getElementById('spec-reload').textContent = `${activeMetrics.reloadSec} s`;
  document.getElementById('spec-acoustic').textContent = `${activeMetrics.acousticDb} dB ${activeMetrics.isSilenced ? '(Supp.)' : ''}`;
  document.getElementById('dps-badge').textContent = `${activeMetrics.dps} DPS`;

  const statConfigs = [
    { key: 'damage',      label: 'Terminal Impact',   max: 100, unit: '' },
    { key: 'fireRate',    label: 'Cyclic Rate',       max: 1200, unit: ' RPM' },
    { key: 'range',       label: 'Effective Range',   max: 100, unit: '' },
    { key: 'accuracy',    label: 'MOA Precision',     max: 100, unit: '' },
    { key: 'control',     label: 'Recoil Control',    max: 100, unit: '' },
    { key: 'mobility',    label: 'Handling',          max: 100, unit: '' },
    { key: 'penetration', label: 'Armor Penetration', max: 100, unit: '' }
  ];

  const barsContainer = document.getElementById('stats-bars-container');
  barsContainer.innerHTML = statConfigs.map(cfg => {
    const val = activeMetrics.stats[cfg.key];
    const pct = clamp(Math.round((val / cfg.max) * 100), 4, 100);
    let deltaHtml = '';
    let barColor = 'bg-ink-900';

    if (baselineStats) {
      const diff = val - baselineStats[cfg.key];
      if (diff !== 0) {
        const isPos = diff > 0;
        deltaHtml = `<span class="ml-1.5 text-[11px] font-mono font-bold ${isPos ? 'text-olive-700' : 'text-rust-700'}">(${isPos ? '+' : ''}${diff})</span>`;
        barColor = isPos ? 'bg-olive-700' : 'bg-rust-600';
      }
    }

    return `
      <div>
        <div class="flex items-baseline justify-between text-xs font-mono mb-1">
          <span class="text-ink-700">${cfg.label}</span>
          <span class="font-bold text-ink-900">${val}${cfg.unit}${deltaHtml}</span>
        </div>
        <div class="w-full h-2 bg-paper-200 border border-ink-900/40 overflow-hidden">
          <div class="h-full ${barColor} transition-all duration-150" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');

  const synContainer = document.getElementById('synergy-tags-container');
  document.getElementById('synergy-count-badge').textContent = `${activeMetrics.synergies.length} Note${activeMetrics.synergies.length > 1 ? 's' : ''}`;
  synContainer.innerHTML = activeMetrics.synergies.map(syn => {
    const accentBorder = syn.type === 'emerald'
      ? 'border-l-olive-700 bg-olive-100/50'
      : syn.type === 'amber' || syn.type === 'cyan'
        ? 'border-l-rust-600 bg-paper-100'
        : 'border-l-ink-500 bg-paper-100';
    return `
      <div class="p-3 border border-ink-900/20 border-l-4 ${accentBorder}">
        <div class="text-xs font-bold text-ink-900">${syn.title}</div>
        <div class="text-xs text-ink-700 mt-0.5 leading-snug">${syn.desc}</div>
      </div>
    `;
  }).join('');

  renderFalloffChart(activeMetrics);
}

export function renderSavedBuildsList() {
  const container = document.getElementById('saved-builds-list');
  container.innerHTML = state.savedBuilds.map((b, idx) => `
    <div class="flex items-center justify-between gap-2 bg-paper-100 border border-ink-900/25 px-2.5 py-1.5">
      <button type="button" data-load-saved="${idx}" class="text-xs font-mono text-ink-900 hover:text-rust-700 font-medium truncate text-left flex-1">
        ${b.name}
      </button>
      <button type="button" data-delete-saved="${idx}" title="Delete Slot" class="text-ink-500 hover:text-rust-700 text-xs px-1 font-mono font-bold">
        &times;
      </button>
    </div>
  `).join('');
}