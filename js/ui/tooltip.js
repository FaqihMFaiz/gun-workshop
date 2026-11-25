import { CATEGORIES, MATERIAL_RATES } from '../data/catalog.js';
import { state } from '../state.js';
import { getPartById, formatGrams } from '../engine/utils.js';
import { getPartManufacturingProfile } from '../engine/manufacturing.js';
import { checkPartCompatibility } from '../engine/compatibility.js';
import { computeBuildMetrics } from '../engine/ballistics.js';
import { playMechanicalClick } from '../audio.js';

export function initTooltipController() {
  const tooltipEl = document.getElementById('armory-part-tooltip');
  if (!tooltipEl) return;

  let activeTooltipKey = null;

  const positionTooltip = (clientX, clientY) => {
    if (tooltipEl.classList.contains('hidden')) return;
    const pad = 16;
    const rect = tooltipEl.getBoundingClientRect();
    let left = clientX + pad;
    let top = clientY + pad;

    if (left + rect.width > window.innerWidth - 10) {
      left = clientX - rect.width - pad;
    }
    if (top + rect.height > window.innerHeight - 10) {
      top = clientY - rect.height - pad;
    }
    left = Math.max(8, left);
    top = Math.max(8, top);

    tooltipEl.style.left = `${Math.round(left)}px`;
    tooltipEl.style.top = `${Math.round(top)}px`;
  };

  const hidePartTooltip = () => {
    activeTooltipKey = null;
    tooltipEl.classList.add('hidden');
  };

  const showSummaryTooltip = (metricType, clientX, clientY) => {
    if (!metricType) return;
    const computed = computeBuildMetrics(state.selectedParts);
    const prod = computed.production;
    const mode = state.tooltipMode || 'materials';
    const key = `summary:${mode}:${metricType}:${JSON.stringify(state.selectedParts)}`;

    if (activeTooltipKey !== key) {
      activeTooltipKey = key;

      const isMatMode = mode === 'materials';
      const titles = {
        matCost:   { cat: isMatMode ? 'Materials Ledger' : 'Component Ledger', name: 'Material Cost Breakdown', tag: isMatMode ? 'By raw feedstock material (cost & mass)' : 'By installed component across 10 stations' },
        totalMats: { cat: isMatMode ? 'Materials Ledger' : 'Component Ledger', name: 'Total Materials Breakdown', tag: isMatMode ? 'By raw feedstock material (grams & % share)' : 'By installed component across 10 stations' },
        workerPay: { cat: isMatMode ? 'Materials Ledger' : 'Component Ledger', name: 'Worker Pay Breakdown', tag: isMatMode ? 'Allocated labor pay by feedstock material' : 'By installed component across 10 stations' },
        mfgTime:   { cat: isMatMode ? 'Materials Ledger' : 'Component Ledger', name: 'Manufacturing Time Breakdown', tag: isMatMode ? 'Allocated production hours by feedstock material' : 'By installed component across 10 stations' }
      };
      const meta = titles[metricType] || titles.totalMats;

      document.getElementById('tt-category').textContent = meta.cat;
      const statusEl = document.getElementById('tt-status');
      statusEl.textContent = isMatMode ? 'By Material' : 'By Component';
      statusEl.className = isMatMode
        ? 'text-[9px] font-mono uppercase px-1.5 py-0.5 bg-olive-100 text-olive-800 font-bold'
        : 'text-[9px] font-mono uppercase px-1.5 py-0.5 bg-paper-100 text-ink-900 font-bold';

      document.getElementById('tt-name').textContent = meta.name;
      document.getElementById('tt-tag').textContent = meta.tag;
      document.getElementById('tt-total-grams').textContent = formatGrams(prod.totalGrams);
      document.getElementById('tt-worker-pay').textContent = `$${prod.workerPay.toFixed(2)}`;
      document.getElementById('tt-mfg-time').textContent = `${prod.mfgHours} hrs`;
      document.getElementById('tt-mat-cost').textContent = `$${prod.materialCost.toFixed(2)}`;
      document.getElementById('tt-msrp').textContent = `$${computed.stats.cost.toLocaleString()}`;
      document.getElementById('tt-weight').textContent = `${computed.stats.weight.toFixed(2)} kg`;

      const matRowsEl = document.getElementById('tt-materials-rows');

      if (isMatMode) {
        const matStats = {};
        CATEGORIES.forEach(cat => {
          const part = computed.parts[cat.id];
          const mfg = getPartManufacturingProfile(cat.id, part, computed.capacity);
          if (mfg.totalGrams <= 0) return;
          Object.entries(mfg.materials).forEach(([mName, g]) => {
            const share = g / mfg.totalGrams;
            if (!matStats[mName]) matStats[mName] = { grams: 0, cost: 0, pay: 0, hrs: 0 };
            matStats[mName].grams += g;
            matStats[mName].cost += g * (MATERIAL_RATES[mName] || 0.015);
            matStats[mName].pay += mfg.workerPay * share;
            matStats[mName].hrs += mfg.mfgHours * share;
          });
        });

        const sorted = Object.entries(matStats).sort((a, b) => {
          if (metricType === 'matCost') return b[1].cost - a[1].cost;
          if (metricType === 'workerPay') return b[1].pay - a[1].pay;
          if (metricType === 'mfgTime') return b[1].hrs - a[1].hrs;
          return b[1].grams - a[1].grams;
        });

        matRowsEl.innerHTML = sorted.map(([mName, d]) => {
          const pct = prod.totalGrams > 0 ? ((d.grams / prod.totalGrams) * 100).toFixed(1) : '0.0';
          let valStr = '';
          if (metricType === 'totalMats') {
            valStr = `${formatGrams(d.grams)} <span class="text-ink-500 font-normal">(${pct}%)</span>`;
          } else if (metricType === 'matCost') {
            valStr = `$${d.cost.toFixed(2)} <span class="text-ink-500 font-normal">(${formatGrams(d.grams)})</span>`;
          } else if (metricType === 'workerPay') {
            valStr = `$${d.pay.toFixed(2)} <span class="text-ink-500 font-normal">(${d.hrs.toFixed(1)} hrs)</span>`;
          } else {
            valStr = `${d.hrs.toFixed(1)} hrs <span class="text-ink-500 font-normal">($${d.pay.toFixed(2)})</span>`;
          }
          return `
            <div class="flex items-center justify-between gap-2 border-b border-ink-900/10 pb-0.5">
              <span class="text-ink-700 font-medium truncate">${mName}</span>
              <span class="text-ink-900 font-semibold shrink-0">${valStr}</span>
            </div>
          `;
        }).join('');
      } else {
        matRowsEl.innerHTML = CATEGORIES.map(cat => {
          const p = computed.parts[cat.id];
          const mfg = getPartManufacturingProfile(cat.id, p, computed.capacity);
          let valueStr = '';
          if (metricType === 'totalMats') {
            valueStr = `${formatGrams(mfg.totalGrams)} <span class="text-ink-500 font-normal">($${mfg.materialCost.toFixed(2)})</span>`;
          } else if (metricType === 'matCost') {
            valueStr = `$${mfg.materialCost.toFixed(2)} <span class="text-ink-500 font-normal">(${formatGrams(mfg.totalGrams)})</span>`;
          } else if (metricType === 'workerPay') {
            valueStr = `$${mfg.workerPay.toFixed(2)} <span class="text-ink-500 font-normal">(${mfg.mfgHours} hrs)</span>`;
          } else {
            valueStr = `${mfg.mfgHours} hrs <span class="text-ink-500 font-normal">($${mfg.workerPay.toFixed(2)})</span>`;
          }
          return `
            <div class="flex items-center justify-between gap-2 border-b border-ink-900/10 pb-0.5">
              <span class="text-ink-700 truncate max-w-[165px]" title="${p.name}"><strong class="text-ink-900">${cat.short}:</strong> ${p.name}</span>
              <span class="text-ink-900 font-semibold shrink-0">${valueStr}</span>
            </div>
          `;
        }).join('');
      }
    }
    tooltipEl.classList.remove('hidden');
    positionTooltip(clientX, clientY);
  };

  const showPartCompareTooltip = (catId, partId, clientX, clientY) => {
    if (!catId || !partId) return;
    const key = `cmp:${catId}:${partId}:${state.selectedParts[catId]}:${state.selectedParts.magazine}`;
    if (activeTooltipKey !== key) {
      activeTooltipKey = key;
      const catObj = CATEGORIES.find(c => c.id === catId) || { name: catId, short: catId };
      const candPart = getPartById(catId, partId);
      const eqPart = getPartById(catId, state.selectedParts[catId]);
      if (!candPart || !eqPart) return;

      const isInstalled = candPart.id === eqPart.id;
      const compat = checkPartCompatibility(catId, candPart, state.selectedParts);
      const curMetrics = computeBuildMetrics(state.selectedParts);
      const previewSelection = { ...state.selectedParts, [catId]: candPart.id };
      const candMetrics = computeBuildMetrics(previewSelection);

      const curMfg = curMetrics.production;
      const candMfg = candMetrics.production;
      const deltaPrice = candMetrics.stats.cost - curMetrics.stats.cost;
      const deltaMatCost = candMfg.materialCost - curMfg.materialCost;
      const deltaPay = candMfg.workerPay - curMfg.workerPay;
      const deltaHrs = candMfg.mfgHours - curMfg.mfgHours;

      const fmtDelta = (val, prefix = '', suffix = '', invertGood = false, decimals = 0) => {
        const rounded = decimals > 0 ? Number(val.toFixed(decimals)) : Math.round(val);
        if (rounded === 0) return '<span class="text-ink-500">0</span>';
        const sign = rounded > 0 ? '+' : '';
        const isGood = invertGood ? rounded < 0 : rounded > 0;
        const cls = isGood ? 'text-olive-700 font-bold' : 'text-rust-700 font-bold';
        const formatted = decimals > 0 ? Math.abs(rounded).toFixed(decimals) : Math.abs(rounded).toLocaleString();
        return `<span class="${cls}">${sign}${rounded < 0 ? '-' : ''}${prefix}${formatted}${suffix}</span>`.replace('+-', '-');
      };

      document.getElementById('tt-category').textContent = `Compare vs. Equipped ${catObj.short}`;
      const statusEl = document.getElementById('tt-status');
      if (isInstalled) {
        statusEl.textContent = 'Equipped';
        statusEl.className = 'text-[9px] font-mono uppercase px-1.5 py-0.5 bg-olive-100 text-olive-800 font-bold';
      } else if (!compat.compatible) {
        statusEl.textContent = 'Incompatible';
        statusEl.className = 'text-[9px] font-mono uppercase px-1.5 py-0.5 bg-rust-600 text-white font-bold';
      } else {
        statusEl.textContent = 'Comparison';
        statusEl.className = 'text-[9px] font-mono uppercase px-1.5 py-0.5 bg-paper-200 text-ink-900 font-bold';
      }

      document.getElementById('tt-name').textContent = candPart.name;
      document.getElementById('tt-tag').textContent = isInstalled
        ? 'Currently installed in this station'
        : `vs. ${eqPart.name}`;

      document.getElementById('tt-total-grams').innerHTML = `$${candMetrics.stats.cost.toLocaleString()} ${isInstalled ? '' : fmtDelta(deltaPrice, '$', '', true)}`;
      document.getElementById('tt-worker-pay').innerHTML = `$${candMfg.workerPay.toFixed(0)} ${isInstalled ? '' : fmtDelta(deltaPay, '$', '', true, 0)}`;
      document.getElementById('tt-mfg-time').innerHTML = `${candMfg.mfgHours}h ${isInstalled ? '' : fmtDelta(deltaHrs, '', 'h', true, 1)}`;
      document.getElementById('tt-mat-cost').innerHTML = `$${candMfg.materialCost.toFixed(2)} ${isInstalled ? '' : fmtDelta(deltaMatCost, '$', '', true, 2)}`;
      document.getElementById('tt-msrp').textContent = `$${candPart.stats.cost.toLocaleString()}`;
      document.getElementById('tt-weight').innerHTML = `${candMetrics.stats.weight.toFixed(2)} kg ${isInstalled ? '' : fmtDelta(candMetrics.stats.weight - curMetrics.stats.weight, '', ' kg', true, 2)}`;

      const matRowsEl = document.getElementById('tt-materials-rows');
      if (!compat.compatible && !isInstalled) {
        matRowsEl.innerHTML = `<div class="text-rust-700 font-semibold leading-snug">Conflict: ${compat.reason}</div>`;
      } else {
        const cmpRows = [
          { label: 'Total Build Price', cur: `$${curMetrics.stats.cost.toLocaleString()}`, next: `$${candMetrics.stats.cost.toLocaleString()}`, diff: deltaPrice, pre: '$', suf: '', inv: true, dec: 0 },
          { label: 'Terminal Impact',   cur: curMetrics.stats.damage,      next: candMetrics.stats.damage,      diff: candMetrics.stats.damage - curMetrics.stats.damage, pre: '', suf: '', inv: false, dec: 0 },
          { label: 'Cyclic Rate',       cur: `${curMetrics.stats.fireRate}`, next: `${candMetrics.stats.fireRate}`, diff: candMetrics.stats.fireRate - curMetrics.stats.fireRate, pre: '', suf: ' RPM', inv: false, dec: 0 },
          { label: 'Effective Range',   cur: curMetrics.stats.range,       next: candMetrics.stats.range,       diff: candMetrics.stats.range - curMetrics.stats.range, pre: '', suf: '', inv: false, dec: 0 },
          { label: 'MOA Precision',     cur: curMetrics.stats.accuracy,    next: candMetrics.stats.accuracy,    diff: candMetrics.stats.accuracy - curMetrics.stats.accuracy, pre: '', suf: '', inv: false, dec: 0 },
          { label: 'Recoil Control',    cur: curMetrics.stats.control,     next: candMetrics.stats.control,     diff: candMetrics.stats.control - curMetrics.stats.control, pre: '', suf: '', inv: false, dec: 0 },
          { label: 'Handling',          cur: curMetrics.stats.mobility,    next: candMetrics.stats.mobility,    diff: candMetrics.stats.mobility - curMetrics.stats.mobility, pre: '', suf: '', inv: false, dec: 0 },
          { label: 'Armor Penetration', cur: curMetrics.stats.penetration, next: candMetrics.stats.penetration, diff: candMetrics.stats.penetration - curMetrics.stats.penetration, pre: '', suf: '', inv: false, dec: 0 },
          { label: 'Muzzle Velocity',   cur: `${curMetrics.velocityMs}`,   next: `${candMetrics.velocityMs}`,   diff: candMetrics.velocityMs - curMetrics.velocityMs, pre: '', suf: ' m/s', inv: false, dec: 0 }
        ];

        matRowsEl.innerHTML = cmpRows.map(r => `
          <div class="flex items-center justify-between gap-2 border-b border-ink-900/10 pb-0.5">
            <span class="text-ink-700">${r.label}</span>
            <span class="text-ink-900 font-semibold shrink-0">${r.next} <span class="text-[10px]">(${fmtDelta(r.diff, r.pre, r.suf, r.inv, r.dec)})</span></span>
          </div>
        `).join('');
      }
    }
    tooltipEl.classList.remove('hidden');
    positionTooltip(clientX, clientY);
  };

  const toggleTooltipModeBtn = document.getElementById('btn-toggle-tooltip-mode');
  if (toggleTooltipModeBtn) {
    toggleTooltipModeBtn.addEventListener('click', () => {
      state.tooltipMode = state.tooltipMode === 'materials' ? 'components' : 'materials';
      const lbl = document.getElementById('tooltip-mode-label');
      if (lbl) lbl.textContent = state.tooltipMode === 'materials' ? 'By Material' : 'By Component';
      activeTooltipKey = null;
      playMechanicalClick(560);
    });
  }

  document.body.addEventListener('mousemove', (e) => {
    const sumEl = e.target.closest('[data-summary-tooltip]');
    if (sumEl) {
      showSummaryTooltip(sumEl.getAttribute('data-summary-tooltip'), e.clientX, e.clientY);
      return;
    }
    const partCard = e.target.closest('[data-part-card]');
    if (partCard) {
      showPartCompareTooltip(state.activeCategory, partCard.getAttribute('data-part-card'), e.clientX, e.clientY);
      return;
    }
    if (activeTooltipKey) hidePartTooltip();
  });

  document.addEventListener('mouseleave', hidePartTooltip);
  window.addEventListener('scroll', hidePartTooltip, true);
}