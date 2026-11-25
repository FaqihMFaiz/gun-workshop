import { CAMO_FINISHES, PARTS_DB } from '../data/catalog.js';
import { state } from '../state.js';

export function getThemeSvgPalette(theme) {
  if (theme === 'blueprint') {
    return {
      line: '#bae6fd',
      bg: '#102e54',
      text: '#f0f9ff',
      activeBg: '#0284c7',
      activeText: '#ffffff',
      activeLine: '#fbbf24',
      dimLine: '#7dd3fc',
      viseFill: '#173f73',
      viseStroke: '#7dd3fc',
      cogStroke: '#fbbf24',
      cogFill: '#0f3566',
      chartGrid: '#1e4e8c',
      chartLine: '#bae6fd',
      chartArea: '#38bdf8',
      chartPoint: '#fbbf24'
    };
  }
  if (theme === 'dark') {
    return {
      line: '#94a3b8',
      bg: '#1e2229',
      text: '#f8fafc',
      activeBg: '#dc2626',
      activeText: '#ffffff',
      activeLine: '#f87171',
      dimLine: '#94a3b8',
      viseFill: '#272c36',
      viseStroke: '#64748b',
      cogStroke: '#f59e0b',
      cogFill: '#181b20',
      chartGrid: '#334155',
      chartLine: '#e2e8f0',
      chartArea: '#4ade80',
      chartPoint: '#f87171'
    };
  }
  return {
    line: '#3f3d36',
    bg: '#faf8f3',
    text: '#1c1b18',
    activeBg: '#9e3223',
    activeText: '#ffffff',
    activeLine: '#9e3223',
    dimLine: '#1c1b18',
    viseFill: '#d5cbb8',
    viseStroke: '#6b675c',
    cogStroke: '#9e3223',
    cogFill: '#faf8f3',
    chartGrid: '#d5cbb8',
    chartLine: '#1c1b18',
    chartArea: '#3f4d37',
    chartPoint: '#9e3223'
  };
}

export function renderWeaponSVG(computed) {
  const root = document.getElementById('svg-assembly-root');
  if (!root) return;

  const palette = getThemeSvgPalette(state.theme);
  const svgEl = document.getElementById('weapon-svg');
  const zoom = Number(state.zoomLevel) || 1;
  if (svgEl) {
    const vbW = 920 / zoom;
    const vbH = 380 / zoom;
    const maxOffsetX = Math.max(0, 920 - vbW);
    const maxOffsetY = Math.max(0, 380 - vbH);
    const rawPanX = state.zoomPan ? state.zoomPan.x : 0;
    const rawPanY = state.zoomPan ? state.zoomPan.y : 0;
    const panX = zoom > 1 ? Math.max(-maxOffsetX / 2, Math.min(maxOffsetX / 2, rawPanX)) : 0;
    const panY = zoom > 1 ? Math.max(-maxOffsetY / 2, Math.min(maxOffsetY / 2, rawPanY)) : 0;
    const minX = (920 - vbW) / 2 - panX;
    const minY = (380 - vbH) / 2 - panY;
    svgEl.setAttribute('viewBox', `${minX.toFixed(1)} ${minY.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`);
  }

  const guidesEl = document.getElementById('svg-bench-guides');
  if (guidesEl) {
    guidesEl.querySelectorAll('line').forEach(el => el.setAttribute('stroke', palette.dimLine));
    guidesEl.querySelectorAll('path, rect').forEach(el => {
      el.setAttribute('fill', palette.viseFill);
      el.setAttribute('stroke', palette.viseStroke);
    });
  }

  const camo = CAMO_FINISHES.find(c => c.id === state.camoId) || CAMO_FINISHES[0];
  const furnCamo = state.twoToneEnabled
    ? (CAMO_FINISHES.find(c => c.id === state.furnitureCamoId) || camo)
    : camo;
  const { parts } = computed;
  const exp = state.explodedView ? 1 : 0;

  const isBullpup = parts.platform.shape === 'bullpup';
  const isPistol = parts.platform.shape === 'pistol';
  const isRevolver = parts.platform.shape === 'revolver';
  const isHandgun = isPistol || isRevolver;
  const isAk = parts.platform.shape === 'ak';
  const isSniper = parts.platform.shape === 'sniper';
  const isAmr = parts.platform.shape === 'amr';
  const isShotgun = parts.platform.shape === 'shotgun';
  const isLmg = parts.platform.shape === 'lmg';
  const isPdw = parts.platform.shape === 'pdw';
  const isLever = parts.platform.shape === 'lever';
  const coreGlow = parts.receiver.coreColor || camo.accent;

  const off = {
    gripStock: { x: -38 * exp, y: 16 * exp },
    platform:  { x: 0,         y: 0 },
    receiver:  { x: 0,         y: -26 * exp },
    magazine:  { x: (isBullpup ? -12 : isPistol ? -8 : isPdw ? 0 : 6) * exp, y: (isPdw && parts.magazine.style === 'pdw_top50' ? -40 : 44) * exp },
    sight:     { x: 0,         y: -58 * exp },
    barrel:    { x: 42 * exp,  y: 0 },
    muzzle:    { x: 92 * exp,  y: 0 }
  };

  const barrelLenPx = parts.barrel.style === 'pistol_match' ? 76
    : parts.barrel.style === 'short' ? 115
    : parts.barrel.style === 'sbr_115' ? 132
    : parts.barrel.style === 'shotgun_14' ? 142
    : parts.barrel.style === 'carbon' ? 165
    : parts.barrel.style === 'shotgun_18' ? 195
    : parts.barrel.style === 'lmg_heavy' ? 205
    : parts.barrel.style === 'long_fluted' ? 230
    : parts.barrel.style === 'rpk_bipod' ? 245
    : parts.barrel.style === 'gauss_rail' ? 255
    : parts.barrel.style === 'bull_26' ? 255
    : parts.barrel.style === 'lmg_pecheneg' ? 260
    : parts.barrel.style === 'amr_29' ? 270
    : 175;
  const barrelStartX = isRevolver ? 392 : isPistol ? 426 : isPdw ? 470 : isBullpup ? 488 : isAmr ? 555 : isSniper ? 540 : isShotgun ? 540 : isLmg ? 528 : 520;
  const breechX = barrelStartX - 28;
  const fullBarrelLen = barrelLenPx + 28;
  const muzzleStartX = barrelStartX + barrelLenPx;

  // Layout anchor coordinates for Rear-Mag (Bullpup), Pistol Grip-Fed, or Standard Forward Magwell
  const magAnchorX = isBullpup ? 225 : isPistol ? 298 : isRevolver ? 344 : isPdw ? 380 : 404;
  const gripAnchorX = isBullpup ? 355 : 285;

  const activeCat = state.sidebarOpen ? state.activeCategory : null;
  const slotClass = (catId) => `svg-part ${activeCat === catId ? 'active-slot' : ''}`;

  // Platform-specific forend geometry so all underbarrel attachments scale & align cleanly
  const forendStartX = isHandgun ? 364 : isPdw ? 410 : isBullpup ? 430 : isAk ? 466 : 454;
  const handguardEndX = isRevolver ? 394 : isPistol ? 428 : isPdw ? 470 : isBullpup ? 492 : isAk ? 524 : isAmr ? 560 : (260 + (isSniper ? 245 : 210) + 56);
  const forendBottomY = isHandgun ? 198 : isAk ? 196 : 194;
  const forendWidth = Math.max(54, handguardEndX - forendStartX);
  const availUnderBarrel = Math.max(64, muzzleStartX - forendStartX - 6);
  const slingPart = parts.sling || PARTS_DB.sling[0];
  const ubPart = parts.underbarrel || PARTS_DB.underbarrel[0];

  let svgHTML = '';

  // 0. SLINGS (Rendered behind receiver/mag so straps drape naturally from real swivel anchors)
  if (slingPart && slingPart.style !== 'none') {
    const slx = 0;
    const sly = 26 * exp;
    svgHTML += `<g class="${slotClass('sling')}" data-slot="sling" transform="translate(${slx}, ${sly})">`;
    if (slingPart.style === 'lanyard') {
      const lx = isRevolver ? 274 : 268;
      const ly = 268;
      svgHTML += `
        <rect x="${lx - 5}" y="${ly - 4}" width="10" height="8" rx="1.5" fill="#27272a" stroke="#94a3b8" stroke-width="1.2"/>
        <path d="M${lx} ${ly + 4} C${lx - 18} ${ly + 20}, ${lx + 16} ${ly + 28}, ${lx - 12} ${ly + 40} C${lx - 26} ${ly + 48}, ${lx + 8} ${ly + 56}, ${lx - 14} ${ly + 66}" fill="none" stroke="#18181b" stroke-width="4" stroke-linecap="round"/>
      `;
    } else if (slingPart.style === 'two_point' || slingPart.style === 'three_point' || slingPart.style === 'lmg_harness') {
      const rearAnchorX = isBullpup ? 144 : isHandgun ? 268 : 132;
      const rearAnchorY = isBullpup ? 204 : isHandgun ? 266 : 212;
      const frontAnchorX = isHandgun ? 390 : handguardEndX - 24;
      const frontAnchorY = isHandgun ? 198 : 192;
      const midX = Math.round((rearAnchorX + frontAnchorX) / 2);
      const sw = slingPart.style === 'lmg_harness' ? 12 : 8;
      svgHTML += `
        <path d="M${rearAnchorX} ${rearAnchorY} Q${midX} 312 ${frontAnchorX} ${frontAnchorY}" fill="none" stroke="${slingPart.strapColor}" stroke-width="${sw}" stroke-linecap="round"/>
        <path d="M${rearAnchorX} ${rearAnchorY} Q${midX} 312 ${frontAnchorX} ${frontAnchorY}" fill="none" stroke="#1c1b18" stroke-width="1.2" stroke-dasharray="6 4" opacity="0.5"/>
        ${slingPart.style === 'three_point' ? `<line x1="${rearAnchorX + 75}" y1="242" x2="${frontAnchorX - 40}" y2="196" stroke="${slingPart.strapColor}" stroke-width="5" stroke-linecap="round"/>` : ''}
        <rect x="${rearAnchorX - 5}" y="${rearAnchorY - 4}" width="10" height="8" rx="1.5" fill="#27272a" stroke="#71717a" stroke-width="1.2"/>
        <rect x="${frontAnchorX - 5}" y="${frontAnchorY - 4}" width="10" height="8" rx="1.5" fill="#27272a" stroke="#71717a" stroke-width="1.2"/>
        <rect x="${midX - 10}" y="253" width="20" height="10" rx="2" fill="#18181b" stroke="#a1a1aa" stroke-width="1.2"/>
      `;
    } else if (slingPart.style === 'one_point') {
      const qdX = isBullpup ? 204 : isHandgun ? 270 : 254;
      const qdY = isBullpup ? 196 : isHandgun ? 266 : 194;
      svgHTML += `
        <path d="M${qdX} ${qdY} C${qdX - 24} ${qdY + 55}, ${qdX + 26} ${qdY + 78}, ${qdX + 4} ${qdY + 12}" fill="none" stroke="${slingPart.strapColor}" stroke-width="7" stroke-linecap="round"/>
        <rect x="${qdX - 5}" y="${qdY - 4}" width="10" height="9" rx="1.5" fill="#27272a" stroke="#a1a1aa" stroke-width="1.2"/>
      `;
    }
    svgHTML += `</g>`;
  }

  // 1. MAGAZINE (Rendered first on Pistols so it seats cleanly inside the pistol grip)
  const mx = off.magazine.x + (magAnchorX - 404);
  const my = off.magazine.y;
  const renderMagazineGroup = () => {
    let m = `<g class="${slotClass('magazine')}" data-slot="magazine" transform="translate(${(isShotgun || isLever) && parts.magazine.style === 'shotgun_tube' ? (20 * exp) : mx}, ${(isShotgun || isLever) && parts.magazine.style === 'shotgun_tube' ? (24 * exp) : my})">`;
    if (parts.magazine.style === 'revolver_cyl') {
      m += `
        <rect x="380" y="152" width="44" height="32" rx="3" fill="#3f3f46" stroke="#cbd5e1" stroke-width="1.6"/>
        <line x1="386" y1="162" x2="418" y2="162" stroke="#18181b" stroke-width="3.5"/>
        <line x1="386" y1="174" x2="418" y2="174" stroke="#18181b" stroke-width="3.5"/>
      `;
    } else if (parts.magazine.style === 'pdw_top50') {
      m += `
        <rect x="278" y="133" width="186" height="17" rx="3" fill="#0f172a" fill-opacity="0.86" stroke="#38bdf8" stroke-width="1.5"/>
        ${[292, 314, 336, 358, 380, 402, 424, 446].map(x => `<rect x="${x}" y="137" width="8" height="9" rx="1" fill="#eab308"/>`).join('')}
      `;
    } else if (parts.magazine.style === 'shotgun_tube') {
      const tubeLen = Math.max(96, barrelLenPx - 16);
      const tubeStartX = barrelStartX - 18;
      m += `
        <rect x="378" y="196" width="54" height="7" rx="1.5" fill="#18181b" stroke="#52525b" stroke-width="1.2"/>
        <rect x="${tubeStartX}" y="178" width="${tubeLen}" height="15" rx="3" fill="url(#metalGrad)" stroke="#1c1b18" stroke-width="1.5"/>
        <rect x="${tubeStartX + tubeLen - 34}" y="158" width="10" height="38" rx="1.5" fill="#27272a" stroke="#1c1b18" stroke-width="1.3"/>
        <rect x="${tubeStartX + tubeLen - 8}" y="176" width="12" height="19" rx="2" fill="#27272a" stroke="#52525b" stroke-width="1.3"/>
        <line x1="${tubeStartX + tubeLen - 4}" y1="178" x2="${tubeStartX + tubeLen - 4}" y2="193" stroke="#71717a" stroke-width="1.4"/>
      `;
    } else if (isPistol && parts.magazine.style !== 'drum') {
      const extLen = (parts.magazine.style === 'pistol_ext' || parts.magazine.style === 'extended') ? 54
        : (parts.magazine.style === 'pistol_flush' || parts.magazine.style === 'short_fast') ? 10 : 28;
      m += `
        <path d="M380 235 L412 235 L${406 - Math.round(extLen * 0.18)} ${274 + extLen} L${370 - Math.round(extLen * 0.18)} ${274 + extLen} Z" fill="${furnCamo.trim}" stroke="#64748b" stroke-width="1.6"/>
        <rect x="${366 - Math.round(extLen * 0.18)}" y="${270 + extLen}" width="42" height="9" rx="2" fill="${furnCamo.accent}"/>
      `;
    } else if (parts.magazine.style === 'drum') {
      m += `
        <rect x="385" y="198" width="38" height="40" fill="${furnCamo.trim}" stroke="#475569" stroke-width="1.5"/>
        <circle cx="404" cy="262" r="44" fill="${furnCamo.primary}" stroke="#64748b" stroke-width="2"/>
        <circle cx="404" cy="262" r="26" fill="${furnCamo.trim}" stroke="${furnCamo.accent}" stroke-width="1.5" stroke-dasharray="6 4"/>
        <circle cx="404" cy="262" r="8" fill="${furnCamo.accent}"/>
      `;
    } else if (parts.magazine.style === 'bakelite_ak') {
      m += `
        <path d="M384 198 L426 198 Q442 252 462 292 L416 298 Q396 254 384 198 Z" fill="#b45309" stroke="#f59e0b" stroke-width="1.6"/>
        <path d="M394 214 Q412 250 428 286" fill="none" stroke="#78350f" stroke-width="2.5"/>
        <rect x="384" y="198" width="42" height="8" fill="#1e293b"/>
      `;
    } else if (parts.magazine.style === 'energy_cell') {
      m += `
        <path d="M382 198 L430 198 L436 286 L386 286 Z" fill="#0f172a" stroke="${coreGlow}" stroke-width="2"/>
        <rect x="394" y="212" width="24" height="60" rx="3" fill="${coreGlow}" fill-opacity="0.28" stroke="${coreGlow}" stroke-width="1.2"/>
        <line x1="398" y1="226" x2="414" y2="226" stroke="#ffffff" stroke-width="2"/>
        <line x1="398" y1="242" x2="414" y2="242" stroke="#ffffff" stroke-width="2"/>
        <line x1="398" y1="258" x2="414" y2="258" stroke="#ffffff" stroke-width="2"/>
      `;
    } else if (parts.magazine.style === 'smg_stick') {
      m += `
        <path d="M390 198 L416 198 Q424 246 436 286 L408 290 Q396 248 390 198 Z" fill="#1f2421" stroke="#52525b" stroke-width="1.6"/>
        <line x1="403" y1="210" x2="420" y2="280" stroke="#3f3f46" stroke-width="2"/>
      `;
    } else if (parts.magazine.style === 'lmg_box' || parts.magazine.style === 'lmg_pouch') {
      const boxCol = parts.magazine.id === 'mag_pkp_100' ? '#364532' : '#4b5320';
      m += `
        <rect x="394" y="182" width="24" height="22" fill="#27272a" stroke="#1c1b18" stroke-width="1"/>
        <line x1="398" y1="186" x2="414" y2="186" stroke="#eab308" stroke-width="3"/>
        <line x1="398" y1="192" x2="414" y2="192" stroke="#eab308" stroke-width="3"/>
        <line x1="398" y1="198" x2="414" y2="198" stroke="#eab308" stroke-width="3"/>
        <rect x="366" y="204" width="84" height="${parts.magazine.style === 'lmg_pouch' ? 58 : 72}" rx="${parts.magazine.style === 'lmg_pouch' ? 10 : 3}" fill="${boxCol}" stroke="#1c1b18" stroke-width="1.8"/>
        <line x1="374" y1="222" x2="442" y2="222" stroke="#1c1b18" stroke-width="1.6" opacity="0.5"/>
        <text x="408" y="242" text-anchor="middle" fill="#e7e0d2" font-family="IBM Plex Mono" font-size="9" font-weight="700">${parts.magazine.capacity} RD</text>
      `;
    } else if (parts.magazine.style === 'sniper_box') {
      m += `
        <rect x="380" y="198" width="52" height="44" rx="2" fill="#1f2421" stroke="#94a3b8" stroke-width="1.6"/>
        <rect x="378" y="237" width="56" height="7" rx="1.5" fill="${furnCamo.trim}"/>
      `;
    } else if (parts.magazine.style === 'coupled_30') {
      m += `
        <path d="M380 198 L416 198 L430 288 L392 288 Z" fill="${furnCamo.secondary}" stroke="#64748b" stroke-width="1.6"/>
        <path d="M402 204 L436 204 L450 294 L414 294 Z" fill="${furnCamo.primary}" stroke="#64748b" stroke-width="1.6"/>
        <rect x="392" y="232" width="46" height="12" rx="2" fill="${furnCamo.accent}" stroke="#1c1b18" stroke-width="1.2"/>
      `;
    } else if (parts.magazine.style === 'short_fast') {
      m += `
        <path d="M385 198 L425 198 L430 255 L390 255 Z" fill="${furnCamo.secondary}" stroke="#64748b" stroke-width="1.6"/>
        <path d="M388 255 L432 255 L426 270 L394 270 Z" fill="${furnCamo.accent}"/>
      `;
    } else if (parts.magazine.style === 'extended') {
      m += `
        <path d="M384 198 L428 198 L456 314 L408 314 Z" fill="${furnCamo.secondary}" stroke="#64748b" stroke-width="1.8"/>
        <line x1="406" y1="215" x2="430" y2="298" stroke="${furnCamo.trim}" stroke-width="3"/>
      `;
    } else {
      m += `
        <path d="M385 198 L426 198 L442 290 L398 290 Z" fill="${furnCamo.secondary}" stroke="#64748b" stroke-width="1.6"/>
        <rect x="403" y="218" width="12" height="48" rx="2" transform="rotate(-10 403 218)" fill="${furnCamo.accent}" fill-opacity="0.45" stroke="#475569" stroke-width="1"/>
      `;
    }
    m += `</g>`;
    return m;
  };

  if (isPistol) {
    svgHTML += renderMagazineGroup();
  }

  // 2. GRIPS & STOCKS (Uses Furniture Finish in 2-Tone Mode)
  const gx = off.gripStock.x;
  const gy = off.gripStock.y;
  svgHTML += `<g class="${slotClass('gripStock')}" data-slot="gripStock" transform="translate(${gx}, ${gy})">`;
  if (isBullpup || isPdw) {
    if (parts.gripStock.style === 'pdw_twinrod') {
      svgHTML += `
        <line x1="128" y1="162" x2="210" y2="162" stroke="#71717a" stroke-width="4.5"/>
        <line x1="128" y1="186" x2="210" y2="186" stroke="#71717a" stroke-width="4.5"/>
        <rect x="114" y="154" width="16" height="44" rx="3" fill="#18181b" stroke="#94a3b8" stroke-width="1.4"/>
      `;
    } else if (parts.gripStock.style === 'precision') {
      svgHTML += `
        <path d="M128 150 L205 150 L205 210 L142 222 L128 222 Z" fill="${furnCamo.primary}" stroke="#64748b" stroke-width="1.8"/>
        <rect x="142" y="142" width="60" height="10" rx="3" fill="${furnCamo.trim}" stroke="${furnCamo.accent}" stroke-width="1.2"/>
        <rect x="114" y="150" width="14" height="72" rx="4" fill="#090d16" stroke="#475569" stroke-width="1.5"/>
      `;
    } else if (parts.gripStock.style === 'thumbhole') {
      svgHTML += `
        <path d="M135 152 L205 152 L205 208 L135 216 Z" fill="${furnCamo.primary}" stroke="#64748b" stroke-width="1.8"/>
        <rect x="122" y="152" width="13" height="64" rx="4" fill="#090d16"/>
        <path d="M355 202 L430 202 L442 268 L416 268 L402 224 L372 224 L358 274 L330 274 Z" fill="${furnCamo.secondary}" stroke="#64748b" stroke-width="1.6"/>
      `;
    } else {
      svgHTML += `
        <path d="M138 152 L202 152 L202 206 L154 214 L138 214 Z" fill="${furnCamo.primary}" stroke="#64748b" stroke-width="1.8"/>
        <rect x="124" y="152" width="14" height="62" rx="4" fill="#090d16" stroke="#475569" stroke-width="1.4"/>
      `;
    }
    if (parts.gripStock.style !== 'thumbhole') {
      svgHTML += `
        <path d="M${gripAnchorX} 202 L${gripAnchorX + 36} 202 L${gripAnchorX + 20} 274 L${gripAnchorX - 16} 274 Z" fill="${furnCamo.secondary}" stroke="#64748b" stroke-width="1.6"/>
        <line x1="${gripAnchorX - 2}" y1="222" x2="${gripAnchorX + 24}" y2="222" stroke="${furnCamo.trim}" stroke-width="2"/>
        <line x1="${gripAnchorX - 6}" y1="238" x2="${gripAnchorX + 20}" y2="238" stroke="${furnCamo.trim}" stroke-width="2"/>
        <path d="M442 196 L464 196 L456 254 L434 254 Z" fill="${furnCamo.trim}" stroke="#64748b" stroke-width="1.5"/>
      `;
    }
  } else if (isRevolver) {
    const gripCol = parts.gripStock.style === 'wood_fixed' ? '#78350f' : furnCamo.secondary;
    svgHTML += `
      <path d="M266 184 Q282 188 292 202 L320 202 L292 272 L254 264 L274 202 Z" fill="${gripCol}" stroke="#451a03" stroke-width="1.8"/>
    `;
  } else if (isPistol && parts.gripStock.style === 'stockless') {
    svgHTML += `
      <path d="M258 188 Q272 194 285 202 L324 202 L306 274 L266 274 L280 206 Z" fill="${furnCamo.secondary}" stroke="#64748b" stroke-width="1.8"/>
      <rect x="278" y="216" width="26" height="44" rx="3" transform="rotate(12 278 216)" fill="${furnCamo.trim}" opacity="0.65"/>
    `;
  } else {
    if (parts.gripStock.style === 'stockless') {
      svgHTML += `
        <rect x="242" y="158" width="22" height="44" rx="4" fill="${furnCamo.trim}" stroke="#475569" stroke-width="1.5"/>
        <circle cx="240" cy="180" r="8" fill="none" stroke="${furnCamo.accent}" stroke-width="2"/>
      `;
    } else if (parts.gripStock.style === 'wood_fixed') {
      svgHTML += `
        <path d="M112 158 L262 158 L262 196 L154 224 L112 224 Z" fill="#854d0e" stroke="#451a03" stroke-width="1.8"/>
        <rect x="102" y="158" width="11" height="66" rx="2" fill="#27272a"/>
      `;
    } else if (parts.gripStock.style === 'monte_carlo') {
      svgHTML += `
        <path d="M108 164 L230 162 L265 186 L256 208 L215 210 L165 232 L108 228 Z" fill="#7c3f1d" stroke="#451a03" stroke-width="1.8"/>
        <rect x="98" y="164" width="11" height="64" rx="2" fill="#18181b"/>
      `;
    } else if (parts.gripStock.style === 'top_fold_cage') {
      svgHTML += `
        <path d="M132 132 L272 132 L280 144 L132 144 Z" fill="#3f3f46" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="148" y="135" width="24" height="6" fill="#090a0c"/>
        <rect x="184" y="135" width="24" height="6" fill="#090a0c"/>
        <rect x="220" y="135" width="24" height="6" fill="#090a0c"/>
        <path d="M118 128 L134 128 L130 156 L116 154 Z" fill="#18181b" stroke="#64748b" stroke-width="1.4"/>
      `;
    } else if (parts.gripStock.style === 'underfolder') {
      svgHTML += `
        <rect x="122" y="170" width="140" height="10" rx="2" fill="#52525b" stroke="#94a3b8" stroke-width="1.4"/>
        <path d="M112 154 L126 154 L126 216 L112 212 Z" fill="#27272a" stroke="#94a3b8" stroke-width="1.5"/>
        <circle cx="254" cy="175" r="8" fill="${furnCamo.trim}" stroke="#94a3b8" stroke-width="1.4"/>
      `;
    } else if (parts.gripStock.style === 'pdw_twinrod') {
      svgHTML += `
        <line x1="132" y1="162" x2="262" y2="162" stroke="#71717a" stroke-width="4.5"/>
        <line x1="132" y1="186" x2="262" y2="186" stroke="#71717a" stroke-width="4.5"/>
        <path d="M118 152 L134 152 L134 214 L118 210 Z" fill="#18181b" stroke="#94a3b8" stroke-width="1.5"/>
      `;
    } else if (parts.gripStock.style === 'zenitco') {
      svgHTML += `
        <rect x="132" y="162" width="130" height="14" rx="2" fill="${furnCamo.trim}" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="148" y="148" width="66" height="12" rx="2" fill="${furnCamo.secondary}" stroke="${furnCamo.accent}" stroke-width="1.3"/>
        <path d="M122 152 L145 152 L175 218 L122 224 Z" fill="${furnCamo.primary}" stroke="#94a3b8" stroke-width="1.6"/>
        <rect x="108" y="148" width="14" height="80" rx="4" fill="#090d16" stroke="#475569" stroke-width="1.5"/>
      `;
    } else if (parts.gripStock.style === 'mp5_wire') {
      svgHTML += `
        <line x1="126" y1="162" x2="260" y2="162" stroke="#3f3f46" stroke-width="4.5"/>
        <line x1="126" y1="186" x2="260" y2="186" stroke="#3f3f46" stroke-width="4.5"/>
        <path d="M114 152 L130 152 L130 218 L114 214 Z" fill="#18181b" stroke="#1c1b18" stroke-width="1.6"/>
      `;
    } else if (parts.gripStock.style === 'lmg_para') {
      svgHTML += `
        <rect x="215" y="156" width="46" height="38" rx="2" fill="#27272a" stroke="#1c1b18" stroke-width="1.5"/>
        <line x1="118" y1="166" x2="218" y2="166" stroke="#52525b" stroke-width="7"/>
        <line x1="118" y1="184" x2="218" y2="184" stroke="#3f3f46" stroke-width="5"/>
        <path d="M104 150 L124 150 L124 226 L104 222 Z" fill="#18181b" stroke="#1c1b18" stroke-width="1.6"/>
      `;
    } else if (parts.gripStock.style === 'skeleton') {
      svgHTML += `
        <path d="M115 162 L260 162 L260 176 L145 215 L115 215 Z" fill="none" stroke="${furnCamo.secondary}" stroke-width="8" stroke-linejoin="round"/>
        <rect x="105" y="156" width="14" height="68" rx="4" fill="${furnCamo.trim}" stroke="#475569" stroke-width="1.5"/>
      `;
    } else if (parts.gripStock.style === 'precision') {
      svgHTML += `
        <path d="M90 156 L262 156 L262 204 L165 224 L90 228 Z" fill="${furnCamo.primary}" stroke="#64748b" stroke-width="1.8"/>
        <rect x="115" y="146" width="75" height="12" rx="3" fill="${furnCamo.trim}" stroke="${furnCamo.accent}" stroke-width="1.2"/>
        <rect x="80" y="154" width="14" height="76" rx="4" fill="#0f172a" stroke="#475569" stroke-width="1.5"/>
      `;
    } else if (parts.gripStock.style === 'thumbhole') {
      svgHTML += `
        <path d="M110 158 L265 158 L305 256 L265 256 L230 205 L150 222 L110 225 Z" fill="${furnCamo.primary}" stroke="#64748b" stroke-width="1.8"/>
        <ellipse cx="215" cy="192" rx="28" ry="14" fill="#080e1a" stroke="#334155" stroke-width="1.5"/>
      `;
    } else {
      svgHTML += `
        <rect x="175" y="162" width="90" height="20" fill="${furnCamo.trim}" stroke="#475569" stroke-width="1.5"/>
        <path d="M115 155 L215 155 L215 195 L155 226 L115 226 Z" fill="${furnCamo.primary}" stroke="#64748b" stroke-width="1.8"/>
        <rect x="104" y="155" width="12" height="71" rx="3" fill="#090d16"/>
      `;
    }
    if (parts.gripStock.style !== 'monte_carlo') {
      svgHTML += `
        <path d="M285 202 L322 202 L304 274 L268 274 Z" fill="${furnCamo.secondary}" stroke="#64748b" stroke-width="1.6"/>
        <line x1="282" y1="220" x2="310" y2="220" stroke="${furnCamo.trim}" stroke-width="2"/>
        <line x1="278" y1="236" x2="306" y2="236" stroke="${furnCamo.trim}" stroke-width="2"/>
      `;
    }
  }
  svgHTML += `</g>`;

  // 3. BARREL ASSEMBLY (Rendered behind Magazine Clamp, Platform Handguard & Receiver so breech seats cleanly inside)
  const bx = off.barrel.x;
  const by = off.barrel.y;
  svgHTML += `<g class="${slotClass('barrel')}" data-slot="barrel" transform="translate(${bx}, ${by})">`;
  if (parts.barrel.style === 'pistol_match') {
    svgHTML += `
      <rect x="${breechX}" y="158" width="${fullBarrelLen}" height="15" rx="2" fill="#52525b" stroke="#94a3b8" stroke-width="1.4"/>
      <line x1="${barrelStartX + barrelLenPx - 6}" y1="158" x2="${barrelStartX + barrelLenPx - 6}" y2="173" stroke="${camo.accent}" stroke-width="3"/>
    `;
  } else if (parts.barrel.style === 'shotgun_18' || parts.barrel.style === 'shotgun_14') {
    svgHTML += `
      <rect x="${breechX}" y="157" width="${fullBarrelLen}" height="18" rx="2" fill="url(#metalGrad)" stroke="#94a3b8" stroke-width="1.5"/>
      <rect x="${barrelStartX + barrelLenPx - 14}" y="150" width="8" height="8" rx="1" fill="${camo.accent}" stroke="#1c1b18" stroke-width="1"/>
    `;
  } else if (parts.barrel.style === 'bull_26' || parts.barrel.style === 'amr_29') {
    svgHTML += `
      <rect x="${breechX}" y="154" width="${fullBarrelLen}" height="24" rx="2" fill="url(#metalGrad)" stroke="#94a3b8" stroke-width="1.6"/>
      <line x1="${barrelStartX + 20}" y1="166" x2="${barrelStartX + barrelLenPx - 12}" y2="166" stroke="${camo.accent}" stroke-width="2.5" stroke-dasharray="14 6"/>
    `;
  } else if (parts.barrel.style === 'pencil_16') {
    svgHTML += `
      <rect x="${breechX}" y="162" width="${fullBarrelLen}" height="11" rx="1.5" fill="url(#metalGrad)" stroke="#64748b" stroke-width="1.4"/>
      <rect x="${barrelStartX + 42}" y="154" width="18" height="24" rx="2" fill="${camo.trim}" stroke="#475569" stroke-width="1.2"/>
      <line x1="${breechX + 8}" y1="158" x2="${barrelStartX + 42}" y2="158" stroke="#94a3b8" stroke-width="2"/>
    `;
  } else if (parts.barrel.style === 'gauss_rail') {
    svgHTML += `
      <rect x="${breechX}" y="154" width="${fullBarrelLen}" height="9" rx="2" fill="${camo.secondary}" stroke="#38bdf8" stroke-width="1.5"/>
      <rect x="${breechX}" y="175" width="${fullBarrelLen}" height="9" rx="2" fill="${camo.secondary}" stroke="#38bdf8" stroke-width="1.5"/>
      <line x1="${breechX}" y1="168" x2="${breechX + fullBarrelLen}" y2="168" stroke="#06b6d4" stroke-width="4" stroke-dasharray="14 8" filter="url(#glowFilter)"/>
    `;
  } else if (parts.barrel.style === 'integral_sd') {
    svgHTML += `
      <rect x="${breechX + 10}" y="152" width="${fullBarrelLen - 10}" height="32" rx="6" fill="${camo.trim}" stroke="#64748b" stroke-width="1.8"/>
      <line x1="${barrelStartX + 20}" y1="152" x2="${barrelStartX + 20}" y2="184" stroke="#334155" stroke-width="2"/>
      <line x1="${barrelStartX + 55}" y1="152" x2="${barrelStartX + 55}" y2="184" stroke="#334155" stroke-width="2"/>
      <line x1="${barrelStartX + 90}" y1="152" x2="${barrelStartX + 90}" y2="184" stroke="#334155" stroke-width="2"/>
    `;
  } else if (parts.barrel.style === 'ak_standard' || isAk) {
    svgHTML += `
      <rect x="${breechX}" y="160" width="${fullBarrelLen}" height="15" rx="2" fill="url(#metalGrad)" stroke="#64748b" stroke-width="1.5"/>
      <polygon points="${barrelStartX + 35},148 ${barrelStartX + 58},148 ${barrelStartX + 64},176 ${barrelStartX + 35},176" fill="${camo.trim}" stroke="#64748b" stroke-width="1.4"/>
      <polygon points="${barrelStartX + barrelLenPx - 36},160 ${barrelStartX + barrelLenPx - 22},124 ${barrelStartX + barrelLenPx - 10},124 ${barrelStartX + barrelLenPx - 10},176 ${barrelStartX + barrelLenPx - 36},176" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.4"/>
      <line x1="${breechX + 8}" y1="179" x2="${barrelStartX + barrelLenPx - 8}" y2="179" stroke="#64748b" stroke-width="2.5"/>
    `;
  } else if (parts.barrel.style === 'lmg_heavy' || parts.barrel.style === 'lmg_pecheneg') {
    svgHTML += `
      <rect x="${breechX}" y="156" width="${fullBarrelLen}" height="22" rx="2" fill="url(#metalGrad)" stroke="#1c1b18" stroke-width="1.6"/>
      <path d="M${barrelStartX + 12} 156 L${barrelStartX + 20} 130 L${barrelStartX + 74} 130 L${barrelStartX + 82} 156" fill="none" stroke="#27272a" stroke-width="5" stroke-linejoin="round"/>
      <rect x="${barrelStartX + 28}" y="125" width="38" height="10" rx="2" fill="#3f3f46" stroke="#1c1b18" stroke-width="1.2"/>
      ${[26, 48, 70, 92, 114, 136, 158, 180, 202, 224].filter(o => o < barrelLenPx - 28).map(o => `<rect x="${barrelStartX + o}" y="162" width="12" height="5" rx="1" fill="#090a0c"/>`).join('')}
    `;
  } else if (parts.barrel.style === 'carbon') {
    svgHTML += `
      <rect x="${breechX}" y="159" width="${fullBarrelLen}" height="18" rx="2" fill="#18181b" stroke="#52525b" stroke-width="1.5"/>
      <line x1="${barrelStartX + 8}" y1="168" x2="${barrelStartX + barrelLenPx - 14}" y2="168" stroke="#3f3f46" stroke-width="10" stroke-dasharray="6 4"/>
      <rect x="${breechX}" y="158" width="44" height="20" rx="1" fill="url(#metalGrad)" stroke="#94a3b8" stroke-width="1.2"/>
      <rect x="${barrelStartX + barrelLenPx - 14}" y="159" width="14" height="18" rx="1" fill="url(#metalGrad)" stroke="#94a3b8" stroke-width="1.2"/>
      <rect x="${barrelStartX + 42}" y="150" width="20" height="29" rx="2" fill="${camo.trim}" stroke="#475569" stroke-width="1.2"/>
      <line x1="${breechX + 8}" y1="154" x2="${barrelStartX + 42}" y2="154" stroke="#94a3b8" stroke-width="2.5"/>
    `;
  } else if (parts.barrel.style === 'rpk_bipod') {
    svgHTML += `
      <rect x="${breechX}" y="159" width="${fullBarrelLen}" height="17" rx="2" fill="url(#metalGrad)" stroke="#64748b" stroke-width="1.6"/>
      <rect x="${barrelStartX + 48}" y="150" width="24" height="28" rx="2" fill="${camo.trim}" stroke="#64748b" stroke-width="1.3"/>
      <line x1="${barrelStartX + barrelLenPx - 42}" y1="176" x2="${barrelStartX + barrelLenPx - 78}" y2="262" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
      <line x1="${barrelStartX + barrelLenPx - 42}" y1="176" x2="${barrelStartX + barrelLenPx - 18}" y2="262" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>
    `;
  } else {
    svgHTML += `
      <rect x="${breechX}" y="160" width="${fullBarrelLen}" height="16" rx="2" fill="url(#metalGrad)" stroke="#64748b" stroke-width="1.5"/>
      <rect x="${barrelStartX + 45}" y="152" width="22" height="28" rx="2" fill="${camo.trim}" stroke="#475569" stroke-width="1.2"/>
      <line x1="${breechX + 8}" y1="156" x2="${barrelStartX + 45}" y2="156" stroke="#94a3b8" stroke-width="2.5"/>
    `;
    if (parts.barrel.style === 'long_fluted') {
      svgHTML += `<line x1="${barrelStartX + 75}" y1="168" x2="${barrelStartX + barrelLenPx - 12}" y2="168" stroke="${camo.accent}" stroke-width="2" stroke-dasharray="12 6"/>`;
    }
  }
  svgHTML += `</g>`;

  if (!isPistol && parts.magazine.style !== 'pdw_top50') {
    svgHTML += renderMagazineGroup();
  }

  // 4. PLATFORM CHASSIS & HANDGUARD
  const px = off.platform.x;
  const py = off.platform.y;
  const handguardWidth = isPistol ? 95 : isSniper ? 245 : 210;
  svgHTML += `<g class="${slotClass('platform')}" data-slot="platform" transform="translate(${px}, ${py})">`;
  if (isRevolver) {
    svgHTML += `
      <path d="M266 154 L402 154 L402 186 L342 186 L332 216 L296 216 L292 194 L266 194 Z" fill="${camo.primary}" stroke="#94a3b8" stroke-width="1.8"/>
      <path d="M312 194 Q320 208 308 212" fill="none" stroke="${camo.accent}" stroke-width="3" stroke-linecap="round"/>
    `;
  } else if (isPdw) {
    svgHTML += `
      <path d="M196 154 L472 154 L472 198 L402 198 L386 226 L332 226 L332 202 L262 202 L248 214 L196 214 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="1.8"/>
      <path d="M358 202 Q364 216 354 220" fill="none" stroke="${camo.accent}" stroke-width="3" stroke-linecap="round"/>
      <rect x="414" y="160" width="44" height="34" rx="3" fill="${furnCamo.secondary}" stroke="#64748b" stroke-width="1.5"/>
    `;
  } else if (isAmr) {
    svgHTML += `
      <path d="M254 152 L560 152 L560 202 L348 202 L328 224 L284 224 L284 202 L254 202 Z" fill="${camo.primary}" stroke="#94a3b8" stroke-width="2"/>
      <path d="M312 202 Q318 216 308 219" fill="none" stroke="${camo.accent}" stroke-width="3" stroke-linecap="round"/>
      <rect x="462" y="162" width="32" height="10" rx="2" fill="#080e1a" stroke="#334155" stroke-width="1.1"/>
      <rect x="506" y="162" width="32" height="10" rx="2" fill="#080e1a" stroke="#334155" stroke-width="1.1"/>
      <path d="M268 140 L548 140 L548 148 L268 148 Z" fill="${camo.trim}" stroke="#475569" stroke-width="1.2" stroke-dasharray="8 4"/>
    `;
  } else if (isLever) {
    svgHTML += `
      <path d="M262 156 L456 156 L456 196 L354 196 L262 196 Z" fill="${camo.primary}" stroke="#94a3b8" stroke-width="1.8"/>
      <!-- Oversized Lever-Action Loop Guard -->
      <path d="M294 196 Q312 234 352 224 L362 196" fill="none" stroke="${camo.accent}" stroke-width="4.5" stroke-linejoin="round"/>
      <rect x="456" y="160" width="76" height="30" rx="3" fill="${furnCamo.secondary}" stroke="#64748b" stroke-width="1.6"/>
      <path d="M276 144 L448 144 L448 150 L276 150 Z" fill="${camo.trim}" stroke="#475569" stroke-width="1.2" stroke-dasharray="8 4"/>
    `;
  } else if (isBullpup) {
    svgHTML += `
      <path d="M192 152 L485 152 L485 198 L422 198 L406 224 L355 224 L355 202 L262 202 L252 212 L198 212 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="1.8"/>
      <rect x="198" y="196" width="54" height="12" rx="2" fill="${camo.trim}" stroke="#475569" stroke-width="1.2"/>
      <path d="M384 202 Q390 215 380 219" fill="none" stroke="${camo.accent}" stroke-width="3" stroke-linecap="round"/>
      <path d="M425 146 L495 146 L488 194 L425 194 Z" fill="${furnCamo.secondary}" stroke="#64748b" stroke-width="1.6"/>
      <rect x="440" y="162" width="28" height="8" rx="2" fill="#080e1a" stroke="#334155" stroke-width="1"/>
      <path d="M235 140 L488 140 L488 148 L235 148 Z" fill="${camo.trim}" stroke="#475569" stroke-width="1.2" stroke-dasharray="8 4"/>
    `;
  } else if (isPistol) {
    svgHTML += `
      <path d="M262 178 L430 178 L430 198 L352 198 L342 224 L298 224 L298 202 L262 202 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="1.8"/>
      <path d="M322 202 Q328 214 318 218" fill="none" stroke="${camo.accent}" stroke-width="3" stroke-linecap="round"/>
      <line x1="375" y1="198" x2="424" y2="198" stroke="${camo.accent}" stroke-width="2" stroke-dasharray="6 4"/>
    `;
  } else if (isAk) {
    svgHTML += `
      <path d="M260 158 L448 158 L448 202 L345 202 L328 222 L285 222 L285 202 L260 202 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="1.8"/>
      <path d="M312 202 Q318 214 308 218" fill="none" stroke="${camo.accent}" stroke-width="3" stroke-linecap="round"/>
      <path d="M448 148 L522 148 L522 166 L448 166 Z" fill="${camo.trim}" stroke="#64748b" stroke-width="1.5"/>
      <path d="M448 166 L528 166 L520 196 L448 196 Z" fill="${furnCamo.secondary}" stroke="#64748b" stroke-width="1.8"/>
      <rect x="462" y="162" width="18" height="6" rx="1.5" fill="#060a12"/>
      <rect x="488" y="162" width="18" height="6" rx="1.5" fill="#060a12"/>
      <path d="M272 142 L515 142 L515 148 L272 148 Z" fill="${camo.trim}" stroke="#475569" stroke-width="1.2" stroke-dasharray="8 4"/>
    `;
  } else if (isShotgun) {
    svgHTML += `
      <path d="M260 158 Q266 148 282 148 L458 148 L458 202 L342 202 L326 222 L285 222 L285 202 L260 202 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="1.8"/>
      <path d="M312 202 Q318 214 308 218" fill="none" stroke="${camo.accent}" stroke-width="3" stroke-linecap="round"/>
      <rect x="458" y="160" width="96" height="36" rx="4" fill="${furnCamo.secondary}" stroke="#64748b" stroke-width="1.8"/>
      <line x1="474" y1="166" x2="474" y2="190" stroke="${furnCamo.trim}" stroke-width="2.5"/>
      <line x1="488" y1="166" x2="488" y2="190" stroke="${furnCamo.trim}" stroke-width="2.5"/>
      <line x1="502" y1="166" x2="502" y2="190" stroke="${furnCamo.trim}" stroke-width="2.5"/>
      <line x1="516" y1="166" x2="516" y2="190" stroke="${furnCamo.trim}" stroke-width="2.5"/>
      <line x1="530" y1="166" x2="530" y2="190" stroke="${furnCamo.trim}" stroke-width="2.5"/>
      <path d="M285 142 L448 142 L448 148 L285 148 Z" fill="${camo.trim}" stroke="#475569" stroke-width="1.2" stroke-dasharray="8 4"/>
    `;
  } else if (isLmg) {
    svgHTML += `
      <path d="M256 154 L468 154 L468 208 L345 208 L326 226 L284 226 L284 204 L256 204 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="2"/>
      <path d="M312 206 Q318 218 308 221" fill="none" stroke="${camo.accent}" stroke-width="3" stroke-linecap="round"/>
      <rect x="464" y="156" width="76" height="42" rx="2" fill="${furnCamo.secondary}" stroke="#64748b" stroke-width="1.8"/>
      <circle cx="482" cy="172" r="4" fill="#090a0c"/>
      <circle cx="498" cy="172" r="4" fill="#090a0c"/>
      <circle cx="514" cy="172" r="4" fill="#090a0c"/>
      <circle cx="530" cy="172" r="4" fill="#090a0c"/>
      <rect x="478" y="182" width="46" height="7" rx="1.5" fill="#090a0c" stroke="#334155" stroke-width="1"/>
    `;
  } else {
    svgHTML += `
      <path d="M260 156 L470 156 L470 206 L345 206 L325 224 L285 224 L285 202 L260 202 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="1.8"/>
      <path d="M312 204 Q318 216 308 219" fill="none" stroke="${camo.accent}" stroke-width="3" stroke-linecap="round"/>
      <path d="M445 148 L${260 + handguardWidth + 60} 148 L${260 + handguardWidth + 50} 194 L445 194 Z" fill="${furnCamo.secondary}" stroke="#64748b" stroke-width="1.8"/>
      <rect x="462" y="164" width="26" height="8" rx="2" fill="#080e1a" stroke="#334155" stroke-width="1"/>
      <rect x="498" y="164" width="26" height="8" rx="2" fill="#080e1a" stroke="#334155" stroke-width="1"/>
      <path d="M268 142 L${260 + handguardWidth + 52} 142 L${260 + handguardWidth + 52} 148 L268 148 Z" fill="${camo.trim}" stroke="#475569" stroke-width="1.2" stroke-dasharray="8 4"/>
    `;
  }
  svgHTML += `</g>`;

  // 5. RECEIVERS / CAPACITORS
  const rx = off.receiver.x;
  const ry = off.receiver.y;
  svgHTML += `<g class="${slotClass('receiver')}" data-slot="receiver" transform="translate(${rx}, ${ry})">`;
  if (isBullpup || isPdw) {
    svgHTML += `
      <path d="M196 148 L428 148 L428 190 L196 190 Z" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.6"/>
      <rect x="208" y="158" width="74" height="22" rx="4" fill="#060a12" stroke="${coreGlow}" stroke-width="1.8"/>
      <rect x="214" y="163" width="62" height="12" rx="2" fill="${coreGlow}" fill-opacity="0.35"/>
      <line x1="228" y1="158" x2="228" y2="180" stroke="${coreGlow}" stroke-width="2"/>
      <line x1="246" y1="158" x2="246" y2="180" stroke="${coreGlow}" stroke-width="2"/>
      <line x1="264" y1="158" x2="264" y2="180" stroke="${coreGlow}" stroke-width="2"/>
      <circle cx="392" cy="168" r="8" fill="${camo.primary}" stroke="${coreGlow}" stroke-width="1.8"/>
    `;
  } else if (isRevolver) {
    svgHTML += `
      <rect x="276" y="148" width="118" height="14" rx="2" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.5"/>
      <path d="M266 154 L286 154 L276 176 L262 172 Z" fill="${camo.secondary}" stroke="#94a3b8" stroke-width="1.3"/>
    `;
  } else if (isPistol) {
    svgHTML += `
      <path d="M264 146 L430 146 L430 178 L264 178 Z" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.8"/>
      <rect x="332" y="152" width="44" height="16" rx="2" fill="#060a12" stroke="${coreGlow}" stroke-width="1.5"/>
      <line x1="276" y1="152" x2="272" y2="172" stroke="#64748b" stroke-width="2.2"/>
      <line x1="284" y1="152" x2="280" y2="172" stroke="#64748b" stroke-width="2.2"/>
      <line x1="292" y1="152" x2="288" y2="172" stroke="#64748b" stroke-width="2.2"/>
      <line x1="402" y1="152" x2="398" y2="172" stroke="#64748b" stroke-width="2.2"/>
      <line x1="410" y1="152" x2="406" y2="172" stroke="#64748b" stroke-width="2.2"/>
    `;
  } else if (isAk || ['rec_kalashnikov_stamped', 'rec_ak_milled', 'rec_an94_hyperburst'].includes(parts.receiver.id)) {
    svgHTML += `
      <path d="M266 146 L448 146 L448 188 L266 188 Z" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.6"/>
      <rect x="352" y="154" width="72" height="18" rx="3" fill="#060a12" stroke="${coreGlow}" stroke-width="1.6"/>
      <path d="M312 178 L398 172" stroke="${coreGlow}" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="312" cy="178" r="5" fill="${coreGlow}"/>
    `;
  } else if (isLmg) {
    const lidAngle = state.explodedView ? -20 : 0;
    svgHTML += `
      <rect x="272" y="158" width="186" height="36" rx="2" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.6"/>
      <rect x="342" y="162" width="84" height="24" rx="2" fill="#090a0c" stroke="${coreGlow}" stroke-width="1.6"/>
      <line x1="354" y1="166" x2="354" y2="182" stroke="#eab308" stroke-width="3.5"/>
      <line x1="368" y1="166" x2="368" y2="182" stroke="#eab308" stroke-width="3.5"/>
      <line x1="382" y1="166" x2="382" y2="182" stroke="#eab308" stroke-width="3.5"/>
      <line x1="396" y1="166" x2="396" y2="182" stroke="#eab308" stroke-width="3.5"/>
      <line x1="410" y1="166" x2="410" y2="182" stroke="#eab308" stroke-width="3.5"/>
      <g transform="rotate(${lidAngle} 456 156)">
        <path d="M268 144 L458 144 L462 158 L268 158 Z" fill="${camo.primary}" stroke="#94a3b8" stroke-width="1.6"/>
        <rect x="284" y="139" width="154" height="5" fill="${camo.trim}" stroke="#475569" stroke-width="1" stroke-dasharray="8 4"/>
        <rect x="264" y="145" width="10" height="12" rx="1.5" fill="${camo.accent}" stroke="#1c1b18" stroke-width="1"/>
        <circle cx="456" cy="154" r="4" fill="#94a3b8" stroke="#1c1b18" stroke-width="1.2"/>
      </g>
    `;
  } else {
    svgHTML += `
      <path d="M272 148 L452 148 L452 192 L272 192 Z" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.6"/>
      <rect x="348" y="158" width="76" height="22" rx="4" fill="#060a12" stroke="${coreGlow}" stroke-width="1.8"/>
      <rect x="354" y="163" width="64" height="12" rx="2" fill="${coreGlow}" fill-opacity="0.35"/>
      <line x1="368" y1="158" x2="368" y2="180" stroke="${coreGlow}" stroke-width="2"/>
      <line x1="388" y1="158" x2="388" y2="180" stroke="${coreGlow}" stroke-width="2"/>
      <line x1="408" y1="158" x2="408" y2="180" stroke="${coreGlow}" stroke-width="2"/>
      <circle cx="312" cy="170" r="9" fill="${camo.primary}" stroke="${coreGlow}" stroke-width="1.8"/>
    `;
  }
  svgHTML += `</g>`;

  if (isPdw && parts.magazine.style === 'pdw_top50') {
    svgHTML += renderMagazineGroup();
  }

  // 6. MUZZLE ATTACHMENT
  const mzX = off.muzzle.x;
  const mzY = off.muzzle.y;
  svgHTML += `<g class="${slotClass('muzzle')}" data-slot="muzzle" transform="translate(${mzX}, ${mzY})">`;
  if (parts.muzzle.style === 'pistol_comp') {
    svgHTML += `
      <rect x="${muzzleStartX}" y="154" width="28" height="24" rx="2" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.5"/>
      <rect x="${muzzleStartX + 8}" y="154" width="12" height="7" fill="#090a0c"/>
    `;
  } else if (parts.muzzle.style === 'breacher_choke') {
    svgHTML += `
      <rect x="${muzzleStartX}" y="155" width="38" height="22" rx="2" fill="#27272a" stroke="#94a3b8" stroke-width="1.5"/>
      <polygon points="${muzzleStartX + 38},154 ${muzzleStartX + 52},152 ${muzzleStartX + 44},161 ${muzzleStartX + 52},166 ${muzzleStartX + 44},171 ${muzzleStartX + 52},179 ${muzzleStartX + 38},178" fill="#52525b" stroke="#cbd5e1" stroke-width="1.2"/>
    `;
  } else if (parts.muzzle.style === 'shotgun_salvo') {
    svgHTML += `
      <rect x="${muzzleStartX}" y="148" width="118" height="36" rx="3" fill="#18181b" stroke="#94a3b8" stroke-width="1.8"/>
      <line x1="${muzzleStartX + 12}" y1="158" x2="${muzzleStartX + 108}" y2="158" stroke="#3f3f46" stroke-width="2"/>
      <line x1="${muzzleStartX + 12}" y1="174" x2="${muzzleStartX + 108}" y2="174" stroke="#3f3f46" stroke-width="2"/>
      <rect x="${muzzleStartX + 14}" y="148" width="8" height="36" fill="${camo.accent}" fill-opacity="0.7"/>
    `;
  } else if (parts.muzzle.style === 'flow_ti') {
    svgHTML += `
      <rect x="${muzzleStartX}" y="152" width="104" height="32" rx="5" fill="#475569" stroke="#cbd5e1" stroke-width="1.8"/>
      <line x1="${muzzleStartX + 14}" y1="160" x2="${muzzleStartX + 92}" y2="160" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 4"/>
      <line x1="${muzzleStartX + 14}" y1="176" x2="${muzzleStartX + 92}" y2="176" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 4"/>
    `;
  } else if (parts.muzzle.style === 'linear_comp') {
    svgHTML += `
      <rect x="${muzzleStartX}" y="155" width="44" height="24" rx="4" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="${muzzleStartX + 10}" y1="160" x2="${muzzleStartX + 36}" y2="160" stroke="${camo.accent}" stroke-width="2"/>
      <line x1="${muzzleStartX + 10}" y1="174" x2="${muzzleStartX + 36}" y2="174" stroke="${camo.accent}" stroke-width="2"/>
    `;
  } else if (parts.muzzle.style === 'suppressor') {
    svgHTML += `
      <rect x="${muzzleStartX}" y="151" width="112" height="34" rx="5" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.8"/>
      <rect x="${muzzleStartX + 12}" y="151" width="8" height="34" fill="${camo.accent}" fill-opacity="0.7"/>
      <line x1="${muzzleStartX + 42}" y1="155" x2="${muzzleStartX + 42}" y2="181" stroke="#475569" stroke-width="2"/>
      <line x1="${muzzleStartX + 72}" y1="155" x2="${muzzleStartX + 72}" y2="181" stroke="#475569" stroke-width="2"/>
    `;
  } else if (parts.muzzle.style === 'pbs1') {
    svgHTML += `
      <rect x="${muzzleStartX}" y="154" width="26" height="28" rx="2" fill="${camo.secondary}" stroke="#94a3b8" stroke-width="1.5"/>
      <rect x="${muzzleStartX + 26}" y="148" width="96" height="40" rx="6" fill="#090d16" stroke="#64748b" stroke-width="1.8"/>
      <line x1="${muzzleStartX + 52}" y1="148" x2="${muzzleStartX + 52}" y2="188" stroke="#334155" stroke-width="2"/>
      <line x1="${muzzleStartX + 88}" y1="148" x2="${muzzleStartX + 88}" y2="188" stroke="#334155" stroke-width="2"/>
    `;
  } else if (parts.muzzle.style === 'flux_choke') {
    svgHTML += `
      <polygon points="${muzzleStartX},152 ${muzzleStartX + 56},146 ${muzzleStartX + 56},190 ${muzzleStartX},184" fill="${camo.trim}" stroke="#06b6d4" stroke-width="2"/>
      <line x1="${muzzleStartX + 10}" y1="168" x2="${muzzleStartX + 54}" y2="168" stroke="#06b6d4" stroke-width="4" filter="url(#glowFilter)"/>
    `;
  } else if (parts.muzzle.style === 'compensator') {
    svgHTML += `
      <rect x="${muzzleStartX}" y="157" width="44" height="22" rx="2" fill="${camo.secondary}" stroke="#94a3b8" stroke-width="1.6"/>
      <polygon points="${muzzleStartX + 8},158 ${muzzleStartX + 14},158 ${muzzleStartX + 11},166 ${muzzleStartX + 5},166" fill="#090a0c"/>
      <polygon points="${muzzleStartX + 18},158 ${muzzleStartX + 24},158 ${muzzleStartX + 21},166 ${muzzleStartX + 15},166" fill="#090a0c"/>
      <line x1="${muzzleStartX + 30}" y1="160" x2="${muzzleStartX + 44}" y2="160" stroke="#090a0c" stroke-width="2.2"/>
      <line x1="${muzzleStartX + 30}" y1="176" x2="${muzzleStartX + 44}" y2="176" stroke="#090a0c" stroke-width="2.2"/>
    `;
  } else if (parts.muzzle.style === 'brake') {
    svgHTML += `
      <rect x="${muzzleStartX}" y="155" width="48" height="26" rx="3" fill="${camo.secondary}" stroke="#94a3b8" stroke-width="1.6"/>
      <rect x="${muzzleStartX + 10}" y="158" width="6" height="20" fill="#060a12"/>
      <rect x="${muzzleStartX + 22}" y="158" width="6" height="20" fill="#060a12"/>
      <rect x="${muzzleStartX + 34}" y="158" width="6" height="20" fill="#060a12"/>
    `;
  } else {
    svgHTML += `
      <rect x="${muzzleStartX}" y="158" width="34" height="20" rx="3" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="${muzzleStartX + 10}" y1="160" x2="${muzzleStartX + 26}" y2="160" stroke="${camo.accent}" stroke-width="2"/>
    `;
  }
  const flashX = muzzleStartX + (['suppressor', 'pbs1', 'shotgun_salvo', 'flow_ti'].includes(parts.muzzle.style) ? 124 : 52);
  svgHTML += `
    <g id="svg-muzzle-flash" class="opacity-0 pointer-events-none" transform="translate(${flashX}, 168)">
      <polygon points="0,0 45,-22 25,-6 68,0 25,6 45,22" fill="${computed.isEnergy ? '#38bdf8' : '#fbbf24'}" filter="url(#glowFilter)"/>
      <circle cx="12" cy="0" r="10" fill="#ffffff"/>
    </g>
  </g>`;

  // 7. SIGHTS / OPTICS
  const sx = off.sight.x;
  const sy = off.sight.y;
  svgHTML += `<g class="${slotClass('sight')}" data-slot="sight" transform="translate(${sx}, ${sy})">`;
  if (parts.sight.style === 'rmr') {
    const rxPos = isHandgun ? 335 : 352;
    svgHTML += `
      <rect x="${rxPos}" y="132" width="34" height="9" rx="1.5" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.3"/>
      <path d="M${rxPos + 4} 132 L${rxPos + 8} 116 Q${rxPos + 17} 111 ${rxPos + 26} 116 L${rxPos + 30} 132" fill="none" stroke="${camo.accent}" stroke-width="2.2"/>
      <circle cx="${rxPos + 17}" cy="123" r="2.5" fill="#f43f5e"/>
    `;
  } else if (parts.sight.style === 'sniper_5_25') {
    svgHTML += `
      <rect x="320" y="126" width="16" height="16" fill="${camo.trim}" stroke="#64748b"/>
      <rect x="414" y="126" width="16" height="16" fill="${camo.trim}" stroke="#64748b"/>
      <path d="M278 104 L430 98 L472 90 L472 136 L430 128 L278 124 Z" fill="${camo.primary}" stroke="#94a3b8" stroke-width="1.8"/>
      <rect x="366" y="85" width="24" height="14" rx="2" fill="${camo.accent}"/>
      <line x1="472" y1="92" x2="472" y2="134" stroke="#38bdf8" stroke-width="3"/>
    `;
  } else if (parts.sight.style === 'holo_3x') {
    svgHTML += `
      <rect x="308" y="112" width="46" height="28" rx="4" fill="#1f2421" stroke="#94a3b8" stroke-width="1.5"/>
      <circle cx="331" cy="126" r="6" fill="none" stroke="#ef4444" stroke-width="1.4"/>
      <rect x="360" y="110" width="66" height="30" rx="3" fill="${camo.primary}" stroke="#94a3b8" stroke-width="1.6"/>
      <rect x="372" y="116" width="38" height="18" rx="2" fill="#080e1a" stroke="${camo.accent}" stroke-width="1.3"/>
      <circle cx="391" cy="125" r="2.8" fill="#f43f5e"/>
    `;
  } else if (parts.sight.style === 'nvg_gen3') {
    svgHTML += `
      <rect x="318" y="102" width="114" height="38" rx="5" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
      <circle cx="416" cy="121" r="10" fill="#052e16" stroke="#22c55e" stroke-width="1.6"/>
      <circle cx="416" cy="121" r="4.5" fill="#4ade80"/>
      <rect x="338" y="110" width="48" height="18" rx="2" fill="#14532d" stroke="#22c55e" stroke-width="1"/>
    `;
  } else if (parts.sight.style === 'canted_combo') {
    svgHTML += `
      <path d="M322 108 L392 104 L414 98 L414 134 L392 128 L322 126 Z" fill="${camo.primary}" stroke="#94a3b8" stroke-width="1.8"/>
      <rect x="398" y="122" width="24" height="15" rx="2" transform="rotate(22 398 122)" fill="${camo.trim}" stroke="#38bdf8" stroke-width="1.3"/>
      <circle cx="408" cy="129" r="2.2" fill="#f43f5e"/>
    `;
  } else if (parts.sight.style === 'irons') {
    svgHTML += `
      <path d="M282 142 L292 118 L302 142 Z" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.5"/>
      <path d="M${isHandgun ? 412 : 475} 142 L${isHandgun ? 418 : 485} 122 L${isHandgun ? 424 : 495} 142 Z" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.5"/>
      <circle cx="${isHandgun ? 418 : 485}" cy="125" r="2.5" fill="#10b981"/>
    `;
  } else if (parts.sight.style === 'reflex') {
    svgHTML += `
      <rect x="345" y="128" width="46" height="14" rx="2" fill="${camo.trim}" stroke="#64748b" stroke-width="1.5"/>
      <path d="M352 128 L358 104 L378 104 L382 128" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <circle cx="368" cy="116" r="3" fill="#f43f5e"/>
    `;
  } else if (parts.sight.style === 'acog') {
    svgHTML += `
      <rect x="342" y="132" width="48" height="10" rx="1.5" fill="${camo.trim}" stroke="#64748b" stroke-width="1.3"/>
      <circle cx="352" cy="137" r="3" fill="#94a3b8"/>
      <circle cx="380" cy="137" r="3" fill="#94a3b8"/>
      <path d="M322 108 L392 104 L414 98 L414 134 L392 128 L322 126 Z" fill="${camo.primary}" stroke="#94a3b8" stroke-width="1.8"/>
      <rect x="336" y="102" width="52" height="5" rx="2" fill="#ef4444" stroke="#f59e0b" stroke-width="1"/>
      <line x1="414" y1="100" x2="414" y2="132" stroke="#38bdf8" stroke-width="2.5"/>
    `;
  } else if (parts.sight.style === 'pso1') {
    svgHTML += `
      <path d="M335 148 L355 118 L385 118 L372 148 Z" fill="#475569" stroke="#94a3b8" stroke-width="1.4"/>
      <rect x="275" y="104" width="165" height="18" rx="3" fill="#334155" stroke="#94a3b8" stroke-width="1.6"/>
      <path d="M248 102 L275 104 L275 122 L248 124 Z" fill="#090d16" stroke="#475569" stroke-width="1.4"/>
      <circle cx="362" cy="98" r="6" fill="${camo.accent}"/>
    `;
  } else if (parts.sight.style === 'sniper_scope') {
    svgHTML += `
      <rect x="325" y="126" width="16" height="16" fill="${camo.trim}" stroke="#64748b"/>
      <rect x="405" y="126" width="16" height="16" fill="${camo.trim}" stroke="#64748b"/>
      <path d="M295 104 L455 98 L455 130 L295 124 Z" fill="${camo.primary}" stroke="#94a3b8" stroke-width="1.8"/>
      <rect x="368" y="88" width="22" height="12" rx="2" fill="${camo.accent}"/>
      <line x1="455" y1="100" x2="455" y2="128" stroke="#38bdf8" stroke-width="3"/>
    `;
  } else if (parts.sight.style === 'thermal') {
    svgHTML += `
      <rect x="328" y="102" width="98" height="40" rx="5" fill="#0f172a" stroke="#a855f7" stroke-width="2"/>
      <rect x="342" y="110" width="52" height="20" rx="2" fill="#a855f7" fill-opacity="0.25" stroke="#a855f7" stroke-width="1.2"/>
      <circle cx="412" cy="120" r="6" fill="#10b981"/>
    `;
  } else {
    svgHTML += `
      <rect x="335" y="110" width="76" height="32" rx="4" fill="${camo.primary}" stroke="#94a3b8" stroke-width="1.8"/>
      <rect x="348" y="116" width="44" height="18" rx="2" fill="#080e1a" stroke="${camo.accent}" stroke-width="1.4"/>
      <circle cx="370" cy="125" r="3" fill="#f43f5e"/>
    `;
  }
  svgHTML += `</g>`;

  // 7A. UNIFIED UNDERBARREL ATTACHMENTS
  let ubAnchorX = forendStartX + forendWidth * 0.5;
  let ubAnchorY = forendBottomY + 18;

  if (ubPart && ubPart.style !== 'none') {
    const isLaser = ubPart.style.startsWith('laser') || ubPart.style === 'lrf_computer';
    const isBayonet = ubPart.style.startsWith('bayonet');
    const ubX = (isBayonet ? 64 : isLaser ? 18 : 12) * exp;
    const ubY = (isLaser && !isHandgun ? -32 : 30) * exp;
    svgHTML += `<g class="${slotClass('underbarrel')}" data-slot="underbarrel" transform="translate(${ubX}, ${ubY})">`;

    if (ubPart.style === 'ub_masterkey') {
      const mkX = forendStartX + 4;
      const mkY = forendBottomY - 1;
      const mkLen = Math.min(148, Math.max(72, Math.round(availUnderBarrel * 0.8)));
      ubAnchorX = mkX + mkLen * 0.55;
      ubAnchorY = mkY + 24;
      svgHTML += `
        <rect x="${mkX}" y="${mkY}" width="46" height="22" rx="2" fill="#27272a" stroke="#94a3b8" stroke-width="1.4"/>
        <rect x="${mkX + 44}" y="${mkY + 2}" width="${mkLen - 44}" height="10" rx="1" fill="#3f3f46" stroke="#1c1b18" stroke-width="1.3"/>
        <rect x="${mkX + 44}" y="${mkY + 13}" width="${Math.max(24, mkLen - 64)}" height="8" rx="1" fill="#18181b" stroke="#64748b" stroke-width="1"/>
        <rect x="${mkX + 20}" y="${mkY + 22}" width="22" height="11" rx="1.5" fill="#b45309" stroke="#1c1b18" stroke-width="1.1"/>
      `;
    } else if (ubPart.style === 'handstop') {
      const hx = forendStartX + Math.round(forendWidth * 0.4);
      const hy = forendBottomY;
      ubAnchorX = hx + 20;
      ubAnchorY = hy + 14;
      const ubCol = state.twoToneEnabled ? furnCamo.secondary : '#27272a';
      svgHTML += `
        <rect x="${hx - 6}" y="${hy - 1}" width="48" height="5" fill="#18181b"/>
        <path d="M${hx} ${hy + 4} L${hx + 36} ${hy + 4} L${hx + 36} ${hy + 15} L${hx + 22} ${hy + 15} L${hx + 16} ${hy + 9} L${hx} ${hy + 9} Z" fill="${ubCol}" stroke="#94a3b8" stroke-width="1.2"/>
      `;
    } else if (ubPart.style === 'grip_pod') {
      const vxPos = forendStartX + Math.round((forendWidth - 20) / 2);
      const vyPos = forendBottomY;
      ubAnchorX = vxPos + 10;
      ubAnchorY = vyPos + 54;
      const ubCol = state.twoToneEnabled ? furnCamo.secondary : '#27272a';
      svgHTML += `
        <rect x="${vxPos - 4}" y="${vyPos - 1}" width="28" height="7" rx="1" fill="#18181b" stroke="#1c1b18" stroke-width="1.2"/>
        <rect x="${vxPos}" y="${vyPos + 6}" width="20" height="24" rx="2" fill="${ubCol}" stroke="#1c1b18" stroke-width="1.4"/>
        <line x1="${vxPos + 4}" y1="${vyPos + 30}" x2="${vxPos - 14}" y2="${vyPos + 64}" stroke="#3f3f46" stroke-width="4" stroke-linecap="round"/>
        <line x1="${vxPos + 16}" y1="${vyPos + 30}" x2="${vxPos + 34}" y2="${vyPos + 64}" stroke="#18181b" stroke-width="4" stroke-linecap="round"/>
      `;
    } else if (ubPart.style === 'lrf_computer') {
      const lW = 48;
      const lx = handguardEndX - lW - 4;
      const ly = isHandgun ? forendBottomY : 122;
      ubAnchorX = lx + lW / 2;
      ubAnchorY = ly;
      svgHTML += `
        <rect x="${lx}" y="${ly}" width="${lW}" height="20" rx="2" fill="#364532" stroke="#1c1b18" stroke-width="1.4"/>
        <circle cx="${lx + lW - 9}" cy="${ly + 10}" r="4" fill="#090a0c" stroke="#22c55e" stroke-width="1.1"/>
        <line x1="${lx + lW}" y1="${ly + 10}" x2="885" y2="${ly + 10}" stroke="#22c55e" stroke-width="1.4" stroke-dasharray="10 4" opacity="0.65"/>
      `;
    } else if (ubPart.style === 'grip_angled') {
      const gW = Math.min(72, Math.max(46, forendWidth - 6));
      const gxPos = forendStartX + Math.round((forendWidth - gW) / 2);
      const gyPos = forendBottomY;
      const gH = isHandgun ? 16 : 22;
      ubAnchorX = gxPos + gW / 2;
      ubAnchorY = gyPos + gH;
      const ubCol = state.twoToneEnabled ? furnCamo.secondary : '#27272a';
      svgHTML += `
        <rect x="${gxPos}" y="${gyPos - 2}" width="${gW}" height="5" fill="#18181b"/>
        <polygon points="${gxPos},${gyPos + 2} ${gxPos + gW},${gyPos + 2} ${gxPos + gW - 14},${gyPos + gH} ${gxPos + 18},${gyPos + gH} ${gxPos + 6},${gyPos + 10}" fill="${ubCol}" stroke="#1c1b18" stroke-width="1.5"/>
        <line x1="${gxPos + 18}" y1="${gyPos + gH - 8}" x2="${gxPos + gW - 16}" y2="${gyPos + gH - 8}" stroke="#52525b" stroke-width="1.8" stroke-dasharray="4 3"/>
      `;
    } else if (ubPart.style === 'grip_vertical') {
      const vW = isHandgun ? 15 : 19;
      const vH = isHandgun ? 36 : 48;
      const vxPos = forendStartX + Math.round((forendWidth - vW) / 2);
      const vyPos = forendBottomY;
      ubAnchorX = vxPos + vW / 2;
      ubAnchorY = vyPos + vH;
      const ubCol = state.twoToneEnabled ? furnCamo.secondary : '#27272a';
      svgHTML += `
        <rect x="${vxPos - 5}" y="${vyPos - 1}" width="${vW + 10}" height="7" rx="1" fill="#18181b" stroke="#1c1b18" stroke-width="1.2"/>
        <polygon points="${vxPos},${vyPos + 6} ${vxPos + vW},${vyPos + 6} ${vxPos + vW + 3},${vyPos + vH} ${vxPos + 3},${vyPos + vH}" fill="${ubCol}" stroke="#1c1b18" stroke-width="1.5"/>
        <line x1="${vxPos + 3}" y1="${vyPos + Math.round(vH * 0.4)}" x2="${vxPos + vW - 1}" y2="${vyPos + Math.round(vH * 0.4)}" stroke="#52525b" stroke-width="1.6"/>
        <line x1="${vxPos + 4}" y1="${vyPos + Math.round(vH * 0.65)}" x2="${vxPos + vW}" y2="${vyPos + Math.round(vH * 0.65)}" stroke="#52525b" stroke-width="1.6"/>
      `;
    } else if (ubPart.style === 'ubgl_m203') {
      const mxPos = forendStartX + 4;
      const myPos = forendBottomY - 2;
      const tubeLen = Math.min(162, Math.max(68, Math.round(availUnderBarrel * 0.84)));
      const tubeH = isHandgun ? 18 : 23;
      const recW = isHandgun ? 26 : 38;
      const barrelClampX = Math.min(muzzleStartX - 18, Math.max(handguardEndX + 10, mxPos + tubeLen - 22));
      ubAnchorX = mxPos + tubeLen * 0.6;
      ubAnchorY = myPos + tubeH;
      svgHTML += `
        ${!isHandgun && barrelClampX > handguardEndX ? `<rect x="${barrelClampX}" y="174" width="10" height="${myPos - 168}" fill="#27272a" stroke="#1c1b18" stroke-width="1.2"/>` : ''}
        <rect x="${mxPos}" y="${myPos}" width="${recW}" height="${tubeH + 4}" rx="1.5" fill="#27272a" stroke="#1c1b18" stroke-width="1.5"/>
        <path d="M${mxPos + 6} ${myPos + tubeH + 4} L${mxPos + recW - 8} ${myPos + tubeH + 4} L${mxPos + recW - 11} ${myPos + tubeH + 15} L${mxPos + 4} ${myPos + tubeH + 15} Z" fill="none" stroke="#3f3f46" stroke-width="1.8"/>
        <path d="M${mxPos + 13} ${myPos + tubeH + 4} Q${mxPos + 16} ${myPos + tubeH + 11} ${mxPos + 10} ${myPos + tubeH + 13}" fill="none" stroke="#9e3223" stroke-width="2"/>
        <rect x="${mxPos + recW - 2}" y="${myPos + 3}" width="${tubeLen - recW + 2}" height="${tubeH - 2}" rx="1.5" fill="#3f3f46" stroke="#1c1b18" stroke-width="1.5"/>
        <rect x="${mxPos + recW + 4}" y="${myPos + 6}" width="${Math.max(18, tubeLen - recW - 24)}" height="${tubeH - 7}" rx="1.5" fill="#18181b" stroke="#52525b" stroke-width="1.1"/>
        ${[0, 9, 18, 27, 36, 45, 54].filter(o => o < tubeLen - recW - 32).map(o => `<line x1="${mxPos + recW + 9 + o}" y1="${myPos + 7}" x2="${mxPos + recW + 9 + o}" y2="${myPos + tubeH - 2}" stroke="#52525b" stroke-width="1.8"/>`).join('')}
        <rect x="${mxPos + tubeLen - 5}" y="${myPos + 2}" width="5" height="${tubeH}" fill="#18181b"/>
      `;
    } else if (ubPart.style === 'ubgl_gp25') {
      const gxPos = forendStartX + 6;
      const gyPos = forendBottomY - 2;
      const tubeLen = Math.min(122, Math.max(64, Math.round(availUnderBarrel * 0.68)));
      const tubeH = isHandgun ? 18 : 22;
      const gripH = isHandgun ? 26 : 36;
      const clampX = Math.min(muzzleStartX - 18, Math.max(handguardEndX + 8, gxPos + tubeLen - 26));
      ubAnchorX = gxPos + tubeLen * 0.65;
      ubAnchorY = gyPos + tubeH;
      svgHTML += `
        ${!isHandgun && clampX > handguardEndX ? `<rect x="${clampX}" y="174" width="12" height="${gyPos - 168}" fill="#27272a" stroke="#1c1b18" stroke-width="1.2"/>` : ''}
        <path d="M${gxPos + 4} ${gyPos + tubeH} L${gxPos + 22} ${gyPos + tubeH} L${gxPos + 14} ${gyPos + tubeH + gripH} L${gxPos - 2} ${gyPos + tubeH + gripH} Z" fill="#3b241d" stroke="#1c1b18" stroke-width="1.4"/>
        <rect x="${gxPos}" y="${gyPos}" width="34" height="${tubeH + 2}" rx="1.5" fill="#27272a" stroke="#1c1b18" stroke-width="1.5"/>
        <rect x="${gxPos + 32}" y="${gyPos + 1}" width="${tubeLen - 32}" height="${tubeH}" rx="1.5" fill="#3f3f46" stroke="#1c1b18" stroke-width="1.5"/>
        <rect x="${gxPos + tubeLen - 5}" y="${gyPos}" width="5" height="${tubeH + 2}" fill="#18181b"/>
      `;
    } else if (ubPart.style === 'laser_peq' || ubPart.style === 'laser_perst') {
      const lW = isHandgun ? 38 : Math.min(52, forendWidth - 6);
      const lx = handguardEndX - lW - 4;
      const ly = isHandgun ? forendBottomY : 124;
      const lH = isHandgun ? 14 : 18;
      const beamY = ly + Math.round(lH / 2);
      const lColor = ubPart.laserColor || '#dc2626';
      ubAnchorX = lx + lW / 2;
      ubAnchorY = isHandgun ? ly + lH : ly;
      svgHTML += `
        <rect x="${lx}" y="${ly}" width="${lW}" height="${lH}" rx="1.5" fill="${ubPart.style === 'laser_peq' ? '#786246' : '#1f2421'}" stroke="#1c1b18" stroke-width="1.4"/>
        <circle cx="${lx + lW - 8}" cy="${beamY}" r="3.5" fill="#090a0c" stroke="#71717a" stroke-width="1"/>
        <circle cx="${lx + lW - 8}" cy="${beamY}" r="1.8" fill="${lColor}"/>
        <line x1="${lx + lW}" y1="${beamY}" x2="885" y2="${beamY}" stroke="${lColor}" stroke-width="1.5" stroke-dasharray="10 4" opacity="0.72"/>
      `;
    } else if (ubPart.style === 'wml_scout' || ubPart.style === 'wml_compact') {
      const wLen = isHandgun ? 40 : (ubPart.style === 'wml_compact' ? 44 : Math.min(64, forendWidth));
      const wx = handguardEndX - wLen + (isHandgun ? 0 : 12);
      const wy = isHandgun ? forendBottomY : (forendBottomY - 14);
      ubAnchorX = wx + wLen / 2;
      ubAnchorY = wy + 16;
      svgHTML += `
        <polygon points="${wx + wLen},${wy + 2} ${wx + wLen + 105},${wy - 20} ${wx + wLen + 105},${wy + 34} ${wx + wLen},${wy + 14}" fill="#fde047" fill-opacity="0.14" class="pointer-events-none"/>
        <rect x="${wx}" y="${wy + 2}" width="${wLen - 12}" height="12" rx="1.5" fill="#27272a" stroke="#1c1b18" stroke-width="1.4"/>
        <rect x="${wx + wLen - 13}" y="${wy}" width="14" height="16" rx="1.5" fill="#3f3f46" stroke="#1c1b18" stroke-width="1.4"/>
        <line x1="${wx + wLen + 1}" y1="${wy + 2}" x2="${wx + wLen + 1}" y2="${wy + 14}" stroke="#fef08a" stroke-width="2.2"/>
      `;
    } else if (ubPart.style === 'bayonet_usmc' || ubPart.style === 'bayonet_ak') {
      const bayX = isHandgun ? 382 : (muzzleStartX - 36);
      const bayY = isHandgun ? forendBottomY : 176;
      const gripCol = ubPart.style === 'bayonet_usmc' ? '#786246' : '#3b241d';
      const gripLen = isHandgun ? 30 : 42;
      const bladeLen = isHandgun ? 56 : Math.min(112, Math.max(72, Math.round(barrelLenPx * 0.54)));
      ubAnchorX = bayX + gripLen + bladeLen * 0.35;
      ubAnchorY = bayY + 12;
      svgHTML += `
        <rect x="${bayX + gripLen - 10}" y="${bayY - 20}" width="6" height="33" rx="1" fill="#27272a" stroke="#1c1b18" stroke-width="1.3"/>
        <rect x="${bayX - 10}" y="${bayY}" width="${gripLen}" height="12" rx="1.5" fill="${gripCol}" stroke="#1c1b18" stroke-width="1.4"/>
        <polygon points="${bayX + gripLen - 4},${bayY} ${bayX + gripLen - 4 + bladeLen - 14},${bayY} ${bayX + gripLen - 4 + bladeLen},${bayY + 5.5} ${bayX + gripLen - 4 + bladeLen - 20},${bayY + 12} ${bayX + gripLen - 4},${bayY + 12}" fill="#71717a" stroke="#1c1b18" stroke-width="1.4"/>
        <line x1="${bayX + gripLen + 2}" y1="${bayY + 5}" x2="${bayX + gripLen - 4 + bladeLen - 18}" y2="${bayY + 5}" stroke="#e4e4e7" stroke-width="1.2"/>
      `;
    } else if (ubPart.style === 'bipod_harris' || ubPart.style === 'bipod_atlas') {
      const bpX = isHandgun ? 396 : (handguardEndX - 20);
      const bpY = forendBottomY;
      ubAnchorX = bpX + 18;
      ubAnchorY = 278;
      svgHTML += `
        <rect x="${bpX - 12}" y="${bpY - 1}" width="24" height="9" rx="1.5" fill="#27272a" stroke="#1c1b18" stroke-width="1.4"/>
        <line x1="${bpX - 4}" y1="${bpY + 8}" x2="${bpX - 32}" y2="338" stroke="#3f3f46" stroke-width="5" stroke-linecap="round"/>
        <line x1="${bpX + 4}" y1="${bpY + 8}" x2="${bpX + 40}" y2="338" stroke="#18181b" stroke-width="5" stroke-linecap="round"/>
        ${ubPart.style === 'bipod_harris' ? `<line x1="${bpX - 9}" y1="${bpY + 32}" x2="${bpX + 11}" y2="${bpY + 32}" stroke="#a1a1aa" stroke-width="2" stroke-dasharray="2 2"/>` : ''}
        <rect x="${bpX - 40}" y="334" width="15" height="7" rx="1.5" fill="#18181b"/>
        <rect x="${bpX + 33}" y="334" width="15" height="7" rx="1.5" fill="#18181b"/>
      `;
    } else if (ubPart.style === 'shooting_rest') {
      const rW = Math.min(78, Math.max(52, forendWidth + 6));
      const rstX = forendStartX + Math.round((forendWidth - rW) / 2);
      const rstY = forendBottomY;
      ubAnchorX = rstX + rW / 2;
      ubAnchorY = 278;
      svgHTML += `
        <path d="M${rstX + 6} ${rstY} Q${rstX + rW / 2} ${rstY + 10} ${rstX + rW - 6} ${rstY} L${rstX + rW + 12} 342 L${rstX - 12} 342 Z" fill="#8b7355" stroke="#1c1b18" stroke-width="1.8"/>
        <path d="M${rstX + 6} ${rstY + 24} Q${rstX + rW / 2} ${rstY + 32} ${rstX + rW - 6} ${rstY + 24}" fill="none" stroke="#5c4a35" stroke-width="2" stroke-dasharray="5 3"/>
        <rect x="${rstX + rW / 2 - 14}" y="${rstY + 56}" width="28" height="12" rx="1.5" fill="#3f3d36" stroke="#1c1b18" stroke-width="1"/>
      `;
    }
    svgHTML += `</g>`;
  }

  // 7B. AMMUNITION LOADING TRAY & CUTAWAY CARTRIDGE STAND (Bottom-Right of Bench)
  const amX = 24 * exp;
  const amY = 24 * exp;
  const ammoPart = parts.ammo || PARTS_DB.ammo[0];
  svgHTML += `<g class="${slotClass('ammo')}" data-slot="ammo" transform="translate(${715 + amX}, ${245 + amY})">
    <rect x="0" y="34" width="128" height="28" rx="3" fill="#18181b" stroke="#52525b" stroke-width="1.6"/>
    <rect x="6" y="39" width="116" height="18" rx="2" fill="#090a0c" stroke="#27272a" stroke-width="1"/>
    <text x="64" y="51" text-anchor="middle" fill="${ammoPart.tipColor}" font-family="IBM Plex Mono" font-size="8.5" font-weight="700">${ammoPart.style.replace('_', ' ').toUpperCase()}</text>
    ${[22, 48, 74, 100].map(cx => {
      if (ammoPart.style === 'ferro_slug') {
        return `
          <rect x="${cx - 5}" y="4" width="10" height="30" rx="2" fill="#0284c7" stroke="#38bdf8" stroke-width="1.3"/>
          <line x1="${cx - 4}" y1="12" x2="${cx + 4}" y2="12" stroke="#e0f2fe" stroke-width="1.5"/>
          <line x1="${cx - 4}" y1="22" x2="${cx + 4}" y2="22" stroke="#e0f2fe" stroke-width="1.5"/>
        `;
      } else if (ammoPart.style === 'shells_slug' || ammoPart.style === 'shells_dragon') {
        return `
          <rect x="${cx - 6}" y="18" width="12" height="16" fill="${ammoPart.caseColor}" stroke="#ca8a04" stroke-width="1"/>
          <rect x="${cx - 6}" y="2" width="12" height="18" rx="1" fill="${ammoPart.jacketColor}" stroke="${ammoPart.tipColor}" stroke-width="1"/>
        `;
      } else {
        return `
          <path d="M${cx - 5} 34 L${cx - 5} 16 L${cx - 3} 11 L${cx + 3} 11 L${cx + 5} 16 L${cx + 5} 34 Z" fill="${ammoPart.caseColor}" stroke="#a16207" stroke-width="1"/>
          <path d="M${cx - 3} 11 Q${cx} -6 ${cx + 3} 11 Z" fill="${ammoPart.jacketColor}"/>
          <path d="M${cx - 1.8} 4 Q${cx} -5 ${cx + 1.8} 4 Z" fill="${ammoPart.tipColor}"/>
        `;
      }
    }).join('')}
  </g>`;

  // 8. DYNAMIC BALANCE POINT (CENTER OF GRAVITY) MARKER
  if (state.showBalancePoint && computed && computed.balance) {
    const rearX = isHandgun ? 248 : (isBullpup || isPdw ? 140 : 108);
    const muzExt = parts.muzzle.style === 'none'
      ? 12
      : ['suppressor', 'pbs1', 'shotgun_salvo', 'flow_ti'].includes(parts.muzzle.style)
        ? 105
        : 44;
    const frontX = muzzleStartX + muzExt;
    const cgX = Math.round(rearX + computed.balance.cgRatio * (frontX - rearX));
    const cgY = 174;
    svgHTML += `
      <g class="pointer-events-none" data-cog-marker="true">
        <line x1="${cgX}" y1="112" x2="${cgX}" y2="232" stroke="${palette.cogStroke}" stroke-width="1.4" stroke-dasharray="4 3" opacity="0.88"/>
        <circle cx="${cgX}" cy="${cgY}" r="7.5" fill="${palette.cogFill}" stroke="${palette.cogStroke}" stroke-width="1.6"/>
        <path d="M${cgX} ${cgY} L${cgX} ${cgY - 7.5} A7.5 7.5 0 0 1 ${cgX + 7.5} ${cgY} Z" fill="${palette.cogStroke}"/>
        <path d="M${cgX} ${cgY} L${cgX} ${cgY + 7.5} A7.5 7.5 0 0 1 ${cgX - 7.5} ${cgY} Z" fill="${palette.cogStroke}"/>
        <rect x="${cgX - 24}" y="232" width="48" height="14" rx="2" fill="${palette.cogFill}" stroke="${palette.cogStroke}" stroke-width="1.1"/>
        <text x="${cgX}" y="242" text-anchor="middle" fill="${palette.cogStroke}" font-family="IBM Plex Mono" font-size="8" font-weight="700">CoG ${computed.balance.cgPct}%</text>
      </g>
    `;
  }

  // 9. CALLOUT LABELS OVERLAY
  if (state.showCallouts) {
    const callouts = (isBullpup || isPdw) ? [
      { cat: 'receiver',  label: 'RECEIVER',   x: 245 + rx, y: 52 + ry,  tx: 245 + rx, ty: 158 + ry },
      { cat: 'sight',     label: 'SIGHTS',     x: 372 + sx, y: 52 + sy,  tx: 372 + sx, ty: 108 + sy },
      { cat: 'barrel',    label: 'BARREL',     x: barrelStartX + 65 + bx, y: 74 + by, tx: barrelStartX + 65 + bx, ty: 156 + by },
      { cat: 'muzzle',    label: 'MUZZLE',     x: muzzleStartX + 38 + mzX, y: 92 + mzY, tx: muzzleStartX + 25 + mzX, ty: 155 + mzY },
      { cat: 'gripStock', label: 'GRIP/STOCK', x: 135 + gx, y: 298 + gy, tx: 155 + gx, ty: 212 + gy },
      { cat: 'magazine',  label: 'MAGAZINE',   x: 245 + off.magazine.x, y: 336 + my, tx: isPdw && parts.magazine.style === 'pdw_top50' ? 340 : (235 + off.magazine.x), ty: isPdw && parts.magazine.style === 'pdw_top50' ? 142 : (282 + my) },
      { cat: 'platform',  label: 'PLATFORM',   x: 375 + px, y: 336 + py, tx: 385 + px, ty: 222 + py },
      { cat: 'ammo',      label: 'BULLET / AMMO', x: 779 + amX, y: 336 + amY, tx: 779 + amX, ty: 307 + amY }
    ] : isHandgun ? [
      { cat: 'receiver',  label: 'RECEIVER',   x: 270 + rx, y: 52 + ry,  tx: 335 + rx, ty: 152 + ry },
      { cat: 'sight',     label: 'SIGHTS',     x: 378 + sx, y: 52 + sy,  tx: 368 + sx, ty: 112 + sy },
      { cat: 'barrel',    label: 'BARREL',     x: barrelStartX + 45 + bx, y: 74 + by, tx: barrelStartX + 45 + bx, ty: 160 + by },
      { cat: 'muzzle',    label: 'MUZZLE',     x: muzzleStartX + 38 + mzX, y: 92 + mzY, tx: muzzleStartX + 22 + mzX, ty: 158 + mzY },
      { cat: 'gripStock', label: 'GRIP/STOCK', x: 155 + gx, y: 298 + gy, tx: 275 + gx, ty: 235 + gy },
      { cat: 'magazine',  label: isRevolver ? 'CYLINDER' : 'MAGAZINE',   x: 285 + off.magazine.x, y: 338 + my, tx: isRevolver ? 344 : (288 + off.magazine.x), ty: isRevolver ? 172 : (296 + my) },
      { cat: 'platform',  label: 'PLATFORM',   x: 405 + px, y: 338 + py, tx: 375 + px, ty: 198 + py },
      { cat: 'ammo',      label: 'BULLET / AMMO', x: 779 + amX, y: 336 + amY, tx: 779 + amX, ty: 307 + amY }
    ] : [
      { cat: 'receiver',  label: 'RECEIVER',   x: 275 + rx, y: 52 + ry,  tx: 348 + rx, ty: 158 + ry },
      { cat: 'sight',     label: 'SIGHTS',     x: 385 + sx, y: 52 + sy,  tx: 375 + sx, ty: 108 + sy },
      { cat: 'barrel',    label: 'BARREL',     x: barrelStartX + 65 + bx, y: 74 + by, tx: barrelStartX + 65 + bx, ty: 156 + by },
      { cat: 'muzzle',    label: 'MUZZLE',     x: muzzleStartX + 38 + mzX, y: 92 + mzY, tx: muzzleStartX + 25 + mzX, ty: 155 + mzY },
      { cat: 'gripStock', label: 'GRIP/STOCK', x: 155 + gx, y: 298 + gy, tx: 175 + gx, ty: 222 + gy },
      { cat: 'platform',  label: 'PLATFORM',   x: 295 + px, y: 336 + py, tx: 330 + px, ty: 206 + py },
      { cat: 'magazine',  label: (isShotgun || isLever) && parts.magazine.style === 'shotgun_tube' ? 'TUBE MAG' : 'MAGAZINE', x: 435 + off.magazine.x, y: 336 + my, tx: (isShotgun || isLever) && parts.magazine.style === 'shotgun_tube' ? (barrelStartX + 45) : (415 + off.magazine.x), ty: (isShotgun || isLever) && parts.magazine.style === 'shotgun_tube' ? 188 : (278 + my) },
      { cat: 'ammo',      label: 'BULLET / AMMO', x: 779 + amX, y: 336 + amY, tx: 779 + amX, ty: 307 + amY }
    ];

    if (ubPart && ubPart.style !== 'none') {
      const isLaser = ubPart.style.startsWith('laser') || ubPart.style === 'lrf_computer';
      const labelX = isLaser && !isHandgun
        ? Math.min(640, Math.max(480, Math.round(ubAnchorX)))
        : Math.min(645, Math.max(585, Math.round(ubAnchorX)));
      callouts.push({
        cat: 'underbarrel',
        label: 'UNDERBARREL',
        x: labelX,
        y: isLaser && !isHandgun ? 26 : 336,
        tx: Math.round(ubAnchorX),
        ty: Math.round(ubAnchorY)
      });
    } else {
      callouts.push({
        cat: 'underbarrel',
        label: 'UNDERBARREL',
        x: Math.min(645, Math.max(560, Math.round(forendStartX + forendWidth * 0.5))),
        y: 336,
        tx: Math.round(forendStartX + forendWidth * 0.5),
        ty: forendBottomY
      });
    }

    const slingTargetX = isBullpup ? 144 : isHandgun ? 268 : 132;
    const slingTargetY = isBullpup ? 204 : isHandgun ? 266 : 212;
    callouts.push({
      cat: 'sling',
      label: 'SLING',
      x: 78,
      y: 256,
      tx: slingTargetX,
      ty: slingTargetY + (slingPart && slingPart.style !== 'none' ? 26 * exp : 0)
    });

    callouts.forEach(c => {
      const isAct = state.sidebarOpen && state.activeCategory === c.cat;
      const lineCol = isAct ? palette.activeLine : palette.line;
      const bgCol = isAct ? palette.activeBg : palette.bg;
      const txtCol = isAct ? palette.activeText : palette.text;
      svgHTML += `
        <g class="cursor-pointer" data-slot="${c.cat}">
          <line x1="${c.x}" y1="${c.y}" x2="${c.tx}" y2="${c.ty}" stroke="${lineCol}" stroke-width="${isAct ? '1.6' : '1'}" stroke-dasharray="3 2"/>
          <circle cx="${c.tx}" cy="${c.ty}" r="3" fill="${lineCol}"/>
          <rect x="${c.x - 46}" y="${c.y - 12}" width="92" height="18" fill="${bgCol}" stroke="${lineCol}" stroke-width="${isAct ? '1.5' : '1'}"/>
          <text x="${c.x}" y="${c.y}" text-anchor="middle" fill="${txtCol}" font-family="IBM Plex Mono" font-size="9.5" font-weight="600">${c.label}</text>
        </g>
      `;
    });
  }

  root.innerHTML = svgHTML;
}