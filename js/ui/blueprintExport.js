import { CATEGORIES, CAMO_FINISHES } from '../data/catalog.js';
import { state } from '../state.js';
import { escapeHtml, formatGrams } from '../engine/utils.js';
import { getThemeSvgPalette } from './svgRenderer.js';

function getBlueprintCanvasPalette(theme) {
  const base = getThemeSvgPalette(theme);
  if (theme === 'blueprint') {
    return {
      ...base,
      pageBg: '#0b2545',
      matBg: '#0f3566',
      panelBg: '#102e54',
      headerBg: '#071b33',
      headerText: '#f0f9ff',
      border: '#7dd3fc',
      mutedText: '#7dd3fc',
      subText: '#bae6fd',
      barTrack: '#0a2548',
      barFill: '#38bdf8',
      accent: '#fbbf24',
      good: '#4ade80'
    };
  }
  if (theme === 'dark') {
    return {
      ...base,
      pageBg: '#111317',
      matBg: '#161920',
      panelBg: '#1b1f26',
      headerBg: '#0b0d10',
      headerText: '#f8fafc',
      border: '#475569',
      mutedText: '#94a3b8',
      subText: '#cbd5e1',
      barTrack: '#111419',
      barFill: '#94a3b8',
      accent: '#f87171',
      good: '#4ade80'
    };
  }
  return {
    ...base,
    pageBg: '#ebe6db',
    matBg: '#f7f4ec',
    panelBg: '#faf8f3',
    headerBg: '#262b22',
    headerText: '#f7f4ec',
    border: '#1c1b18',
    mutedText: '#6b675c',
    subText: '#3f3d36',
    barTrack: '#e7e0d2',
    barFill: '#1c1b18',
    accent: '#9e3223',
    good: '#3f4d37'
  };
}

function slugifyFilename(name) {
  return String(name || 'armorer-blueprint')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'armorer-blueprint';
}

export function buildSpecSheetSvg(computed, weaponSvgInnerHtml = '', options = {}) {
  const theme = options.theme || state.theme || 'paper';
  const pal = getBlueprintCanvasPalette(theme);
  const titleText = escapeHtml(options.weaponName || state.weaponName || 'Custom Build');

  const metalCamo = CAMO_FINISHES.find(c => c.id === (options.camoId || state.camoId)) || CAMO_FINISHES[0];
  const twoTone = options.twoToneEnabled !== undefined ? Boolean(options.twoToneEnabled) : Boolean(state.twoToneEnabled);
  const furnCamo = twoTone
    ? (CAMO_FINISHES.find(c => c.id === (options.furnitureCamoId || state.furnitureCamoId)) || metalCamo)
    : metalCamo;
  const finishDesc = twoTone ? `${metalCamo.name} / ${furnCamo.name} (2-Tone)` : metalCamo.name;

  const statRows = [
    { label: 'TERMINAL IMPACT', val: computed.stats.damage, max: 100, unit: '' },
    { label: 'CYCLIC RATE', val: computed.stats.fireRate, max: 1200, unit: ' RPM' },
    { label: 'EFFECTIVE RANGE', val: computed.stats.range, max: 100, unit: '' },
    { label: 'MOA PRECISION', val: computed.stats.accuracy, max: 100, unit: '' },
    { label: 'RECOIL CONTROL', val: computed.stats.control, max: 100, unit: '' },
    { label: 'HANDLING', val: computed.stats.mobility, max: 100, unit: '' },
    { label: 'PENETRATION', val: computed.stats.penetration, max: 100, unit: '' }
  ];

  const topMats = Object.entries(computed.production.materials || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const componentRowsSvg = CATEGORIES.map((cat, i) => {
    const part = computed.parts[cat.id];
    const y = 626 + i * 31;
    return `
      <text x="58" y="${y}" fill="${pal.mutedText}" font-family="IBM Plex Mono, monospace" font-size="11" font-weight="600">${String(i + 1).padStart(2, '0')} ${escapeHtml(cat.short.toUpperCase())}</text>
      <text x="176" y="${y}" fill="${pal.text}" font-family="IBM Plex Sans, sans-serif" font-size="12" font-weight="600">${escapeHtml(part ? part.name : '')}</text>
      <line x1="58" y1="${y + 8}" x2="520" y2="${y + 8}" stroke="${pal.border}" stroke-opacity="0.18" stroke-width="1"/>
    `;
  }).join('');

  const statRowsSvg = statRows.map((row, i) => {
    const y = 620 + i * 32;
    const pct = Math.max(4, Math.min(100, Math.round((row.val / row.max) * 100)));
    const w = Math.round((pct / 100) * 340);
    return `
      <text x="572" y="${y}" fill="${pal.subText}" font-family="IBM Plex Mono, monospace" font-size="10.5" font-weight="600">${row.label}</text>
      <text x="912" y="${y}" text-anchor="end" fill="${pal.text}" font-family="IBM Plex Mono, monospace" font-size="11" font-weight="700">${row.val}${row.unit}</text>
      <rect x="572" y="${y + 6}" width="340" height="8" fill="${pal.barTrack}" stroke="${pal.border}" stroke-opacity="0.4" stroke-width="1"/>
      <rect x="572" y="${y + 6}" width="${w}" height="8" fill="${pal.barFill}"/>
    `;
  }).join('');

  const matRowsSvg = topMats.map(([mName, grams], i) => {
    const y = 622 + i * 24;
    return `
      <text x="1084" y="${y}" fill="${pal.subText}" font-family="IBM Plex Mono, monospace" font-size="11">${escapeHtml(mName)}</text>
      <text x="1542" y="${y}" text-anchor="end" fill="${pal.text}" font-family="IBM Plex Mono, monospace" font-size="11" font-weight="700">${escapeHtml(formatGrams(grams))}</text>
      <line x1="1084" y1="${y + 6}" x2="1542" y2="${y + 6}" stroke="${pal.border}" stroke-opacity="0.15" stroke-width="1"/>
    `;
  }).join('');

  const balText = computed.balance ? `${computed.balance.balanceLabel} (${computed.balance.cgPct}%)` : 'Balanced (50%)';
  const synList = (computed.synergies || []).slice(0, 2).map((s, idx) => `
    <text x="1084" y="${876 + idx * 20}" fill="${pal.good}" font-family="IBM Plex Mono, monospace" font-size="10.5" font-weight="700">+ ${escapeHtml(s.title)}</text>
  `).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="1600" height="1000">
  <defs>
    <pattern id="bpGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${pal.border}" stroke-opacity="0.12" stroke-width="1"/>
    </pattern>
    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#57534e" />
      <stop offset="50%" stop-color="#292524" />
      <stop offset="100%" stop-color="#1c1917" />
    </linearGradient>
    <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047" />
      <stop offset="50%" stop-color="#ca8a04" />
      <stop offset="100%" stop-color="#854d0e" />
    </linearGradient>
    <linearGradient id="energyGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
    <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="1600" height="1000" fill="${pal.pageBg}"/>
  <rect x="28" y="28" width="1544" height="944" fill="${pal.panelBg}" stroke="${pal.border}" stroke-width="2.5"/>

  <!-- Header Title Block -->
  <rect x="28" y="28" width="1544" height="96" fill="${pal.headerBg}" stroke="${pal.border}" stroke-width="2"/>
  <rect x="48" y="48" width="132" height="36" fill="${pal.matBg}" stroke="${pal.border}" stroke-width="1.5"/>
  <text x="114" y="72" text-anchor="middle" fill="${pal.text}" font-family="Oswald, sans-serif" font-size="20" font-weight="700">FM 9-1005</text>

  <text x="198" y="70" fill="${pal.headerText}" font-family="Oswald, sans-serif" font-size="28" font-weight="700">${titleText}</text>
  <text x="198" y="96" fill="${pal.mutedText}" font-family="IBM Plex Mono, monospace" font-size="13">${escapeHtml(computed.propulsion)}  |  ${escapeHtml(computed.caliber)}  |  FINISH: ${escapeHtml(finishDesc)}</text>

  <rect x="1350" y="44" width="200" height="64" fill="${pal.matBg}" stroke="${pal.border}" stroke-width="1.5"/>
  <text x="1450" y="66" text-anchor="middle" fill="${pal.mutedText}" font-family="IBM Plex Mono, monospace" font-size="11" font-weight="600">COMPOSITE INDEX</text>
  <text x="1450" y="96" text-anchor="middle" fill="${pal.accent}" font-family="IBM Plex Mono, monospace" font-size="26" font-weight="700">${computed.powerScore} / 100</text>

  <!-- Main Drafting Viewport -->
  <rect x="44" y="140" width="1512" height="414" fill="${pal.matBg}" stroke="${pal.border}" stroke-width="1.8"/>
  <rect x="44" y="140" width="1512" height="414" fill="url(#bpGrid)"/>

  <!-- Telemetry Ribbon inside Drafting Frame -->
  <text x="64" y="168" fill="${pal.subText}" font-family="IBM Plex Mono, monospace" font-size="13" font-weight="600">LENGTH: ${computed.lengthMm} mm   |   MASS: ${computed.stats.weight.toFixed(2)} kg   |   EST. COST: $${computed.stats.cost.toLocaleString()}   |   BALANCE: ${escapeHtml(balText)}   |   FIRE MODE: ${escapeHtml(computed.fireMode)}</text>
  <line x1="44" y1="182" x2="1556" y2="182" stroke="${pal.border}" stroke-opacity="0.3" stroke-width="1.2"/>

  <!-- Centered Weapon SVG Drawing -->
  <g transform="translate(200, 178) scale(1.3)">
    ${weaponSvgInnerHtml}
  </g>

  <!-- Bottom Engineering Spec Sheet Columns -->
  <!-- Column 1: 10-Station Build Manifest -->
  <rect x="44" y="570" width="492" height="384" fill="${pal.matBg}" stroke="${pal.border}" stroke-width="1.5"/>
  <text x="58" y="596" fill="${pal.text}" font-family="Oswald, sans-serif" font-size="16" font-weight="700">10-STATION COMPONENT MANIFEST</text>
  <line x1="58" y1="604" x2="520" y2="604" stroke="${pal.border}" stroke-width="1.5"/>
  ${componentRowsSvg}

  <!-- Column 2: Performance Metrics & Ballistics -->
  <rect x="554" y="570" width="492" height="384" fill="${pal.matBg}" stroke="${pal.border}" stroke-width="1.5"/>
  <text x="572" y="596" fill="${pal.text}" font-family="Oswald, sans-serif" font-size="16" font-weight="700">BENCH &amp; BALLISTIC TELEMETRY</text>
  <line x1="572" y1="604" x2="1028" y2="604" stroke="${pal.border}" stroke-width="1.5"/>
  ${statRowsSvg}
  <rect x="572" y="852" width="456" height="86" fill="${pal.panelBg}" stroke="${pal.border}" stroke-opacity="0.45" stroke-width="1"/>
  <text x="590" y="878" fill="${pal.subText}" font-family="IBM Plex Mono, monospace" font-size="12">MUZZLE VELOCITY: <tspan fill="${pal.text}" font-weight="700">${computed.velocityMs} m/s</tspan></text>
  <text x="820" y="878" fill="${pal.subText}" font-family="IBM Plex Mono, monospace" font-size="12">ADS HANDLING: <tspan fill="${pal.text}" font-weight="700">${computed.adsMs} ms</tspan></text>
  <text x="590" y="902" fill="${pal.subText}" font-family="IBM Plex Mono, monospace" font-size="12">RELOAD CYCLE: <tspan fill="${pal.text}" font-weight="700">${computed.reloadSec} s</tspan></text>
  <text x="820" y="902" fill="${pal.subText}" font-family="IBM Plex Mono, monospace" font-size="12">ACOUSTIC: <tspan fill="${pal.text}" font-weight="700">${computed.acousticDb} dB</tspan></text>
  <text x="590" y="926" fill="${pal.subText}" font-family="IBM Plex Mono, monospace" font-size="12">SUSTAINED DPS: <tspan fill="${pal.accent}" font-weight="700">${computed.dps} DPS</tspan></text>
  <text x="820" y="926" fill="${pal.subText}" font-family="IBM Plex Mono, monospace" font-size="12">CAPACITY: <tspan fill="${pal.text}" font-weight="700">${computed.capacity} RD</tspan></text>

  <!-- Column 3: Manufacturing BOM & Synergies Stamp -->
  <rect x="1064" y="570" width="492" height="384" fill="${pal.matBg}" stroke="${pal.border}" stroke-width="1.5"/>
  <text x="1084" y="596" fill="${pal.text}" font-family="Oswald, sans-serif" font-size="16" font-weight="700">PRODUCTION &amp; MATERIALS LEDGER (BOM)</text>
  <line x1="1084" y1="604" x2="1542" y2="604" stroke="${pal.border}" stroke-width="1.5"/>
  ${matRowsSvg}
  <rect x="1084" y="794" width="458" height="58" fill="${pal.panelBg}" stroke="${pal.border}" stroke-opacity="0.5" stroke-width="1"/>
  <text x="1100" y="818" fill="${pal.mutedText}" font-family="IBM Plex Mono, monospace" font-size="10.5">TOTAL MASS: <tspan fill="${pal.text}" font-weight="700">${escapeHtml(formatGrams(computed.production.totalGrams))}</tspan></text>
  <text x="1320" y="818" fill="${pal.mutedText}" font-family="IBM Plex Mono, monospace" font-size="10.5">MAT COST: <tspan fill="${pal.text}" font-weight="700">$${computed.production.materialCost.toFixed(2)}</tspan></text>
  <text x="1100" y="838" fill="${pal.mutedText}" font-family="IBM Plex Mono, monospace" font-size="10.5">WORKER PAY: <tspan fill="${pal.good}" font-weight="700">$${computed.production.workerPay.toFixed(2)}</tspan></text>
  <text x="1320" y="838" fill="${pal.mutedText}" font-family="IBM Plex Mono, monospace" font-size="10.5">MFG TIME: <tspan fill="${pal.accent}" font-weight="700">${computed.production.mfgHours} hrs</tspan></text>

  <text x="1084" y="858" fill="${pal.mutedText}" font-family="IBM Plex Mono, monospace" font-size="10.5" font-weight="700">ACTIVE ARMORER NOTES:</text>
  ${synList}
</svg>`;
}

function getCurrentAssemblySvgMarkup() {
  const root = document.getElementById('svg-assembly-root');
  return root ? root.innerHTML : '';
}

function triggerDownloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadBlueprintSVG(computed) {
  const svgMarkup = buildSpecSheetSvg(computed, getCurrentAssemblySvgMarkup());
  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  triggerDownloadBlob(blob, `${slugifyFilename(state.weaponName)}-blueprint.svg`);
}

export function downloadBlueprintPNG(computed) {
  const svgMarkup = buildSpecSheetSvg(computed, getCurrentAssemblySvgMarkup());
  const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2400;
    canvas.height = 1500;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          triggerDownloadBlob(pngBlob, `${slugifyFilename(state.weaponName)}-blueprint.png`);
        }
        URL.revokeObjectURL(url);
      }, 'image/png');
    } else {
      URL.revokeObjectURL(url);
    }
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);
    downloadBlueprintSVG(computed);
  };

  img.src = url;
}

export function printSpecSheet() {
  if (typeof window !== 'undefined' && typeof window.print === 'function') {
    window.print();
  }
}
