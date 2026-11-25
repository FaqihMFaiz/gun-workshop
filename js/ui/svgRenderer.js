import { CAMO_FINISHES, PARTS_DB } from '../data/catalog.js';
import { state } from '../state.js';

export function renderWeaponSVG(computed) {
  const root = document.getElementById('svg-assembly-root');
  if (!root) return;

  const camo = CAMO_FINISHES.find(c => c.id === state.camoId) || CAMO_FINISHES[0];
  const { parts } = computed;
  const exp = state.explodedView ? 1 : 0;

  const isBullpup = parts.platform.shape === 'bullpup';
  const isPistol = parts.platform.shape === 'pistol';
  const isAk = parts.platform.shape === 'ak';
  const isSniper = parts.platform.shape === 'sniper';
  const isShotgun = parts.platform.shape === 'shotgun';
  const isLmg = parts.platform.shape === 'lmg';
  const coreGlow = parts.receiver.coreColor || camo.accent;

  const off = {
    gripStock: { x: -38 * exp, y: 16 * exp },
    platform:  { x: 0,         y: 0 },
    receiver:  { x: 0,         y: -26 * exp },
    magazine:  { x: (isBullpup ? -12 : isPistol ? -8 : 6) * exp, y: 44 * exp },
    sight:     { x: 0,         y: -58 * exp },
    barrel:    { x: 42 * exp,  y: 0 },
    muzzle:    { x: 92 * exp,  y: 0 }
  };

  const barrelLenPx = parts.barrel.style === 'short' ? 115
    : parts.barrel.style === 'long_fluted' ? 230
    : parts.barrel.style === 'rpk_bipod' ? 245
    : parts.barrel.style === 'gauss_rail' ? 255
    : 175;
  const barrelStartX = isPistol ? 430 : isBullpup ? 485 : 515;
  const muzzleStartX = barrelStartX + barrelLenPx;

  // Layout anchor coordinates for Rear-Mag (Bullpup), Pistol Grip-Fed, or Standard Forward Magwell
  const magAnchorX = isBullpup ? 225 : isPistol ? 298 : 404;
  const gripAnchorX = isBullpup ? 355 : 285;

  const activeCat = state.activeCategory;
  const slotClass = (catId) => `svg-part ${activeCat === catId ? 'active-slot' : ''}`;

  // Platform-specific forend geometry so all underbarrel attachments scale & align cleanly
  const forendStartX = isPistol ? 364 : isBullpup ? 430 : isAk ? 466 : 454;
  const handguardEndX = isBullpup ? 492 : isPistol ? 428 : isAk ? 524 : (260 + (isSniper ? 245 : 210) + 56);
  const forendBottomY = isPistol ? 198 : isAk ? 196 : 194;
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
    if (slingPart.style === 'two_point') {
      const rearAnchorX = isBullpup ? 144 : isPistol ? 268 : 132;
      const rearAnchorY = isBullpup ? 204 : isPistol ? 266 : 212;
      const frontAnchorX = isPistol ? 390 : handguardEndX - 24;
      const frontAnchorY = isPistol ? 198 : 192;
      const midX = Math.round((rearAnchorX + frontAnchorX) / 2);
      svgHTML += `
        <!-- Two-Point Tactical / Canvas Sling Catenary Strap -->
        <path d="M${rearAnchorX} ${rearAnchorY} Q${midX} 312 ${frontAnchorX} ${frontAnchorY}" fill="none" stroke="${slingPart.strapColor}" stroke-width="8" stroke-linecap="round"/>
        <path d="M${rearAnchorX} ${rearAnchorY} Q${midX} 312 ${frontAnchorX} ${frontAnchorY}" fill="none" stroke="#1c1b18" stroke-width="1.2" stroke-dasharray="6 4" opacity="0.5"/>
        <!-- Rear & Front QD Swivel Clasps -->
        <rect x="${rearAnchorX - 5}" y="${rearAnchorY - 4}" width="10" height="8" rx="1.5" fill="#27272a" stroke="#71717a" stroke-width="1.2"/>
        <rect x="${frontAnchorX - 5}" y="${frontAnchorY - 4}" width="10" height="8" rx="1.5" fill="#27272a" stroke="#71717a" stroke-width="1.2"/>
        <!-- Quick-Adjust Slider Buckle -->
        <rect x="${midX - 10}" y="253" width="20" height="10" rx="2" fill="#18181b" stroke="#a1a1aa" stroke-width="1.2"/>
      `;
    } else if (slingPart.style === 'one_point') {
      const qdX = isBullpup ? 204 : isPistol ? 270 : 254;
      const qdY = isBullpup ? 196 : isPistol ? 266 : 194;
      svgHTML += `
        <!-- Single-Point QD Endplate Sling Loop -->
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
    let m = `<g class="${slotClass('magazine')}" data-slot="magazine" transform="translate(${isShotgun ? (20 * exp) : mx}, ${isShotgun ? (24 * exp) : my})">`;
    if (isShotgun) {
      // Authentic Full-Length Under-Barrel Tubular Shotgun Magazine + Knurled Endcap & Barrel Clamp
      const tubeLen = Math.max(96, barrelLenPx - 16);
      const tubeStartX = barrelStartX - 18;
      m += `
        <!-- Bottom Receiver Loading Gate / Shell Lifter -->
        <rect x="378" y="196" width="54" height="7" rx="1.5" fill="#18181b" stroke="#52525b" stroke-width="1.2"/>
        <!-- Under-Barrel Tubular Magazine Cylinder -->
        <rect x="${tubeStartX}" y="178" width="${tubeLen}" height="15" rx="3" fill="url(#metalGrad)" stroke="#1c1b18" stroke-width="1.5"/>
        <!-- Magazine Tube Barrel Clamp Ring -->
        <rect x="${tubeStartX + tubeLen - 34}" y="158" width="10" height="38" rx="1.5" fill="#27272a" stroke="#1c1b18" stroke-width="1.3"/>
        <!-- Knurled Tube Endcap -->
        <rect x="${tubeStartX + tubeLen - 8}" y="176" width="12" height="19" rx="2" fill="#27272a" stroke="#52525b" stroke-width="1.3"/>
        <line x1="${tubeStartX + tubeLen - 4}" y1="178" x2="${tubeStartX + tubeLen - 4}" y2="193" stroke="#71717a" stroke-width="1.4"/>
      `;
    } else if (isPistol && parts.magazine.style !== 'drum') {
      // Handgun magazine protruding cleanly from the bottom of the pistol grip
      const extLen = parts.magazine.style === 'extended' ? 54 : parts.magazine.style === 'short_fast' ? 16 : 28;
      m += `
        <path d="M380 235 L412 235 L${406 - Math.round(extLen * 0.18)} ${274 + extLen} L${370 - Math.round(extLen * 0.18)} ${274 + extLen} Z" fill="${camo.trim}" stroke="#64748b" stroke-width="1.6"/>
        <rect x="${366 - Math.round(extLen * 0.18)}" y="${270 + extLen}" width="42" height="9" rx="2" fill="${camo.accent}"/>
      `;
    } else if (parts.magazine.style === 'drum') {
      m += `
        <rect x="385" y="198" width="38" height="40" fill="${camo.trim}" stroke="#475569" stroke-width="1.5"/>
        <circle cx="404" cy="262" r="44" fill="${camo.primary}" stroke="#64748b" stroke-width="2"/>
        <circle cx="404" cy="262" r="26" fill="${camo.trim}" stroke="${camo.accent}" stroke-width="1.5" stroke-dasharray="6 4"/>
        <circle cx="404" cy="262" r="8" fill="${camo.accent}"/>
      `;
    } else if (parts.magazine.style === 'bakelite_ak') {
      // Iconic curved orange-rust AG-4S Bakelite Kalashnikov 30-rd magazine
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
      // Slim curved 9x19mm SMG magazine (MP5 / PP-19 Vityaz)
      m += `
        <path d="M390 198 L416 198 Q424 246 436 286 L408 290 Q396 248 390 198 Z" fill="#1f2421" stroke="#52525b" stroke-width="1.6"/>
        <line x1="403" y1="210" x2="420" y2="280" stroke="#3f3f46" stroke-width="2"/>
      `;
    } else if (parts.magazine.style === 'lmg_box') {
      // Heavy 100/200-Round LMG Polymer/Steel Belt Box with Visible Brass Linked Belt Feeding Upward
      m += `
        <!-- Brass Linked Ammunition Belt Feeding into Receiver -->
        <rect x="394" y="182" width="24" height="22" fill="#27272a" stroke="#1c1b18" stroke-width="1"/>
        <line x1="398" y1="186" x2="414" y2="186" stroke="#eab308" stroke-width="3"/>
        <line x1="398" y1="192" x2="414" y2="192" stroke="#eab308" stroke-width="3"/>
        <line x1="398" y1="198" x2="414" y2="198" stroke="#eab308" stroke-width="3"/>
        <!-- Heavy LMG Ammo Box -->
        <rect x="366" y="204" width="84" height="72" rx="3" fill="${parts.magazine.id === 'mag_pkp_100' ? '#364532' : '#4b5320'}" stroke="#1c1b18" stroke-width="1.8"/>
        <line x1="374" y1="222" x2="442" y2="222" stroke="#1c1b18" stroke-width="1.6" opacity="0.5"/>
        <line x1="374" y1="258" x2="442" y2="258" stroke="#1c1b18" stroke-width="1.6" opacity="0.5"/>
        <text x="408" y="244" text-anchor="middle" fill="#e7e0d2" font-family="IBM Plex Mono" font-size="9" font-weight="700">${parts.magazine.capacity} RD</text>
      `;
    } else if (parts.magazine.style === 'short_fast') {
      m += `
        <path d="M385 198 L425 198 L430 255 L390 255 Z" fill="${camo.secondary}" stroke="#64748b" stroke-width="1.6"/>
        <path d="M388 255 L432 255 L426 270 L394 270 Z" fill="${camo.accent}"/>
      `;
    } else if (parts.magazine.style === 'extended') {
      m += `
        <path d="M384 198 L428 198 L456 314 L408 314 Z" fill="${camo.secondary}" stroke="#64748b" stroke-width="1.8"/>
        <line x1="406" y1="215" x2="430" y2="298" stroke="${camo.trim}" stroke-width="3"/>
      `;
    } else {
      m += `
        <path d="M385 198 L426 198 L442 290 L398 290 Z" fill="${camo.secondary}" stroke="#64748b" stroke-width="1.6"/>
        <rect x="403" y="218" width="12" height="48" rx="2" transform="rotate(-10 403 218)" fill="${camo.accent}" fill-opacity="0.45" stroke="#475569" stroke-width="1"/>
      `;
    }
    m += `</g>`;
    return m;
  };

  if (isPistol) {
    svgHTML += renderMagazineGroup();
  }

  // 2. GRIPS & STOCKS
  const gx = off.gripStock.x;
  const gy = off.gripStock.y;
  svgHTML += `<g class="${slotClass('gripStock')}" data-slot="gripStock" transform="translate(${gx}, ${gy})">`;
  if (isBullpup) {
    if (parts.gripStock.style === 'precision') {
      svgHTML += `
        <path d="M128 150 L205 150 L205 210 L142 222 L128 222 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="1.8"/>
        <rect x="142" y="142" width="60" height="10" rx="3" fill="${camo.trim}" stroke="${camo.accent}" stroke-width="1.2"/>
        <rect x="114" y="150" width="14" height="72" rx="4" fill="#090d16" stroke="#475569" stroke-width="1.5"/>
      `;
    } else if (parts.gripStock.style === 'thumbhole') {
      svgHTML += `
        <path d="M135 152 L205 152 L205 208 L135 216 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="1.8"/>
        <rect x="122" y="152" width="13" height="64" rx="4" fill="#090d16"/>
        <path d="M355 202 L430 202 L442 268 L416 268 L402 224 L372 224 L358 274 L330 274 Z" fill="${camo.secondary}" stroke="#64748b" stroke-width="1.6"/>
      `;
    } else {
      svgHTML += `
        <path d="M138 152 L202 152 L202 206 L154 214 L138 214 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="1.8"/>
        <rect x="124" y="152" width="14" height="62" rx="4" fill="#090d16" stroke="#475569" stroke-width="1.4"/>
      `;
    }
    if (parts.gripStock.style !== 'thumbhole') {
      svgHTML += `
        <path d="M${gripAnchorX} 202 L${gripAnchorX + 36} 202 L${gripAnchorX + 20} 274 L${gripAnchorX - 16} 274 Z" fill="${camo.secondary}" stroke="#64748b" stroke-width="1.6"/>
        <line x1="${gripAnchorX - 2}" y1="222" x2="${gripAnchorX + 24}" y2="222" stroke="${camo.trim}" stroke-width="2"/>
        <line x1="${gripAnchorX - 6}" y1="238" x2="${gripAnchorX + 20}" y2="238" stroke="${camo.trim}" stroke-width="2"/>
        <path d="M442 196 L464 196 L456 254 L434 254 Z" fill="${camo.trim}" stroke="#64748b" stroke-width="1.5"/>
      `;
    }
  } else if (isPistol && parts.gripStock.style === 'stockless') {
    // Authentic SIG P320 X-Series Beavertail & Polymer Grip Frame (no rear rifle stock)
    svgHTML += `
      <path d="M258 188 Q272 194 285 202 L324 202 L306 274 L266 274 L280 206 Z" fill="${camo.secondary}" stroke="#64748b" stroke-width="1.8"/>
      <rect x="278" y="216" width="26" height="44" rx="3" transform="rotate(12 278 216)" fill="${camo.trim}" opacity="0.65"/>
    `;
  } else {
    // Conventional Rear Buttstock
    if (parts.gripStock.style === 'stockless') {
      svgHTML += `
        <rect x="242" y="158" width="22" height="44" rx="4" fill="${camo.trim}" stroke="#475569" stroke-width="1.5"/>
        <circle cx="240" cy="180" r="8" fill="none" stroke="${camo.accent}" stroke-width="2"/>
      `;
    } else if (parts.gripStock.style === 'zenitco') {
      // Zenitco PT-1 D16T Machined Aluminum Telescopic Stock with Cheek Riser & Buttpad
      svgHTML += `
        <rect x="132" y="162" width="130" height="14" rx="2" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="148" y="148" width="66" height="12" rx="2" fill="${camo.secondary}" stroke="${camo.accent}" stroke-width="1.3"/>
        <path d="M122 152 L145 152 L175 218 L122 224 Z" fill="${camo.primary}" stroke="#94a3b8" stroke-width="1.6"/>
        <rect x="108" y="148" width="14" height="80" rx="4" fill="#090d16" stroke="#475569" stroke-width="1.5"/>
      `;
    } else if (parts.gripStock.style === 'mp5_wire') {
      // HK MP5A3 2-Position Retractable Steel Wire Stock
      svgHTML += `
        <line x1="126" y1="162" x2="260" y2="162" stroke="#3f3f46" stroke-width="4.5"/>
        <line x1="126" y1="186" x2="260" y2="186" stroke="#3f3f46" stroke-width="4.5"/>
        <path d="M114 152 L130 152 L130 218 L114 214 Z" fill="#18181b" stroke="#1c1b18" stroke-width="1.6"/>
      `;
    } else if (parts.gripStock.style === 'lmg_para') {
      // FN M249 PARA Hydraulic-Buffer Collapsible Tubular LMG Stock
      svgHTML += `
        <rect x="215" y="156" width="46" height="38" rx="2" fill="#27272a" stroke="#1c1b18" stroke-width="1.5"/>
        <line x1="118" y1="166" x2="218" y2="166" stroke="#52525b" stroke-width="7"/>
        <line x1="118" y1="184" x2="218" y2="184" stroke="#3f3f46" stroke-width="5"/>
        <path d="M104 150 L124 150 L124 226 L104 222 Z" fill="#18181b" stroke="#1c1b18" stroke-width="1.6"/>
      `;
    } else if (parts.gripStock.style === 'skeleton') {
      svgHTML += `
        <path d="M115 162 L260 162 L260 176 L145 215 L115 215 Z" fill="none" stroke="${camo.secondary}" stroke-width="8" stroke-linejoin="round"/>
        <rect x="105" y="156" width="14" height="68" rx="4" fill="${camo.trim}" stroke="#475569" stroke-width="1.5"/>
      `;
    } else if (parts.gripStock.style === 'precision') {
      svgHTML += `
        <path d="M90 156 L262 156 L262 204 L165 224 L90 228 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="1.8"/>
        <rect x="115" y="146" width="75" height="12" rx="3" fill="${camo.trim}" stroke="${camo.accent}" stroke-width="1.2"/>
        <rect x="80" y="154" width="14" height="76" rx="4" fill="#0f172a" stroke="#475569" stroke-width="1.5"/>
      `;
    } else if (parts.gripStock.style === 'thumbhole') {
      svgHTML += `
        <path d="M110 158 L265 158 L305 256 L265 256 L230 205 L150 222 L110 225 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="1.8"/>
        <ellipse cx="215" cy="192" rx="28" ry="14" fill="#080e1a" stroke="#334155" stroke-width="1.5"/>
      `;
    } else {
      svgHTML += `
        <rect x="175" y="162" width="90" height="20" fill="${camo.trim}" stroke="#475569" stroke-width="1.5"/>
        <path d="M115 155 L215 155 L215 195 L155 226 L115 226 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="1.8"/>
        <rect x="104" y="155" width="12" height="71" rx="3" fill="#090d16"/>
      `;
    }
    svgHTML += `
      <path d="M285 202 L322 202 L304 274 L268 274 Z" fill="${camo.secondary}" stroke="#64748b" stroke-width="1.6"/>
      <line x1="282" y1="220" x2="310" y2="220" stroke="${camo.trim}" stroke-width="2"/>
      <line x1="278" y1="236" x2="306" y2="236" stroke="${camo.trim}" stroke-width="2"/>
    `;
  }
  svgHTML += `</g>`;

  if (!isPistol) {
    svgHTML += renderMagazineGroup();
  }

  // 3. PLATFORM CHASSIS & HANDGUARD
  const px = off.platform.x;
  const py = off.platform.y;
  const handguardWidth = isPistol ? 95 : isSniper ? 245 : 210;
  svgHTML += `<g class="${slotClass('platform')}" data-slot="platform" transform="translate(${px}, ${py})">`;
  if (isBullpup) {
    svgHTML += `
      <path d="M192 152 L485 152 L485 198 L422 198 L406 224 L355 224 L355 202 L262 202 L252 212 L198 212 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="1.8"/>
      <rect x="198" y="196" width="54" height="12" rx="2" fill="${camo.trim}" stroke="#475569" stroke-width="1.2"/>
      <path d="M384 202 Q390 215 380 219" fill="none" stroke="${camo.accent}" stroke-width="3" stroke-linecap="round"/>
      <path d="M425 146 L495 146 L488 194 L425 194 Z" fill="${camo.secondary}" stroke="#64748b" stroke-width="1.6"/>
      <rect x="440" y="162" width="28" height="8" rx="2" fill="#080e1a" stroke="#334155" stroke-width="1"/>
      <path d="M235 140 L488 140 L488 148 L235 148 Z" fill="${camo.trim}" stroke="#475569" stroke-width="1.2" stroke-dasharray="8 4"/>
    `;
  } else if (isPistol) {
    // Authentic SIG Sauer P320 FCU Lower Frame + Under-Barrel Dust Cover Picatinny Rail
    svgHTML += `
      <path d="M262 178 L430 178 L430 198 L352 198 L342 224 L298 224 L298 202 L262 202 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="1.8"/>
      <path d="M322 202 Q328 214 318 218" fill="none" stroke="${camo.accent}" stroke-width="3" stroke-linecap="round"/>
      <!-- Under-barrel 1913 Accessory Rail Cuts -->
      <line x1="375" y1="198" x2="424" y2="198" stroke="${camo.accent}" stroke-width="2" stroke-dasharray="6 4"/>
    `;
  } else if (isAk) {
    // Kalashnikov Stamped Receiver Lower + Upper/Lower Handguard + Gas Tube
    svgHTML += `
      <path d="M260 158 L448 158 L448 202 L345 202 L328 222 L285 222 L285 202 L260 202 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="1.8"/>
      <path d="M312 202 Q318 214 308 218" fill="none" stroke="${camo.accent}" stroke-width="3" stroke-linecap="round"/>
      <!-- AK Upper Gas Tube & Lower Handguard with Vent Slots -->
      <path d="M448 148 L522 148 L522 166 L448 166 Z" fill="${camo.trim}" stroke="#64748b" stroke-width="1.5"/>
      <path d="M448 166 L528 166 L520 196 L448 196 Z" fill="${camo.secondary}" stroke="#64748b" stroke-width="1.8"/>
      <rect x="462" y="162" width="18" height="6" rx="1.5" fill="#060a12"/>
      <rect x="488" y="162" width="18" height="6" rx="1.5" fill="#060a12"/>
      <path d="M272 142 L515 142 L515 148 L272 148 Z" fill="${camo.trim}" stroke="#475569" stroke-width="1.2" stroke-dasharray="8 4"/>
    `;
  } else if (isShotgun) {
    // Dedicated Combat Shotgun Receiver & Ribbed Polymer Forend wrapping the Tubular Magazine
    svgHTML += `
      <path d="M260 158 Q266 148 282 148 L458 148 L458 202 L342 202 L326 222 L285 222 L285 202 L260 202 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="1.8"/>
      <path d="M312 202 Q318 214 308 218" fill="none" stroke="${camo.accent}" stroke-width="3" stroke-linecap="round"/>
      <!-- Ribbed Shotgun Forend Handguard -->
      <rect x="458" y="160" width="96" height="36" rx="4" fill="${camo.secondary}" stroke="#64748b" stroke-width="1.8"/>
      <line x1="474" y1="166" x2="474" y2="190" stroke="${camo.trim}" stroke-width="2.5"/>
      <line x1="488" y1="166" x2="488" y2="190" stroke="${camo.trim}" stroke-width="2.5"/>
      <line x1="502" y1="166" x2="502" y2="190" stroke="${camo.trim}" stroke-width="2.5"/>
      <line x1="516" y1="166" x2="516" y2="190" stroke="${camo.trim}" stroke-width="2.5"/>
      <line x1="530" y1="166" x2="530" y2="190" stroke="${camo.trim}" stroke-width="2.5"/>
      <path d="M285 142 L448 142 L448 148 L285 148 Z" fill="${camo.trim}" stroke="#475569" stroke-width="1.2" stroke-dasharray="8 4"/>
    `;
  } else if (isLmg) {
    // Dedicated Heavy Boxy LMG Stamped Receiver & Ventilated Heat-Shield Handguard
    svgHTML += `
      <path d="M256 154 L468 154 L468 208 L345 208 L326 226 L284 226 L284 204 L256 204 Z" fill="${camo.primary}" stroke="#64748b" stroke-width="2"/>
      <path d="M312 206 Q318 218 308 221" fill="none" stroke="${camo.accent}" stroke-width="3" stroke-linecap="round"/>
      <!-- Heavy Ventilated LMG Handguard & Belt-Feed Side Chute -->
      <rect x="464" y="156" width="76" height="42" rx="2" fill="${camo.secondary}" stroke="#64748b" stroke-width="1.8"/>
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
      <path d="M445 148 L${260 + handguardWidth + 60} 148 L${260 + handguardWidth + 50} 194 L445 194 Z" fill="${camo.secondary}" stroke="#64748b" stroke-width="1.8"/>
      <rect x="462" y="164" width="26" height="8" rx="2" fill="#080e1a" stroke="#334155" stroke-width="1"/>
      <rect x="498" y="164" width="26" height="8" rx="2" fill="#080e1a" stroke="#334155" stroke-width="1"/>
      <path d="M268 142 L${260 + handguardWidth + 52} 142 L${260 + handguardWidth + 52} 148 L268 148 Z" fill="${camo.trim}" stroke="#475569" stroke-width="1.2" stroke-dasharray="8 4"/>
    `;
  }
  svgHTML += `</g>`;

  // 4. RECEIVERS / CAPACITORS
  const rx = off.receiver.x;
  const ry = off.receiver.y;
  svgHTML += `<g class="${slotClass('receiver')}" data-slot="receiver" transform="translate(${rx}, ${ry})">`;
  if (isBullpup) {
    svgHTML += `
      <path d="M196 148 L428 148 L428 190 L196 190 Z" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.6"/>
      <rect x="208" y="158" width="74" height="22" rx="4" fill="#060a12" stroke="${coreGlow}" stroke-width="1.8"/>
      <rect x="214" y="163" width="62" height="12" rx="2" fill="${coreGlow}" fill-opacity="0.35"/>
      <line x1="228" y1="158" x2="228" y2="180" stroke="${coreGlow}" stroke-width="2"/>
      <line x1="246" y1="158" x2="246" y2="180" stroke="${coreGlow}" stroke-width="2"/>
      <line x1="264" y1="158" x2="264" y2="180" stroke="${coreGlow}" stroke-width="2"/>
      <circle cx="392" cy="168" r="8" fill="${camo.primary}" stroke="${coreGlow}" stroke-width="1.8"/>
    `;
  } else if (isPistol) {
    // SIG P320 Nitron Reciprocating Slide with Front/Rear Serrations & Ejection Port
    svgHTML += `
      <path d="M264 146 L430 146 L430 178 L264 178 Z" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.8"/>
      <rect x="332" y="152" width="44" height="16" rx="2" fill="#060a12" stroke="${coreGlow}" stroke-width="1.5"/>
      <line x1="276" y1="152" x2="272" y2="172" stroke="#64748b" stroke-width="2.2"/>
      <line x1="284" y1="152" x2="280" y2="172" stroke="#64748b" stroke-width="2.2"/>
      <line x1="292" y1="152" x2="288" y2="172" stroke="#64748b" stroke-width="2.2"/>
      <line x1="402" y1="152" x2="398" y2="172" stroke="#64748b" stroke-width="2.2"/>
      <line x1="410" y1="152" x2="406" y2="172" stroke="#64748b" stroke-width="2.2"/>
    `;
  } else if (isAk || parts.receiver.id === 'rec_kalashnikov_stamped') {
    // Ribbed / Zenitco B-33 Hinged Dust Cover + Iconic Kalashnikov Safety Selector Lever
    svgHTML += `
      <path d="M266 146 L448 146 L448 188 L266 188 Z" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.6"/>
      <rect x="352" y="154" width="72" height="18" rx="3" fill="#060a12" stroke="${coreGlow}" stroke-width="1.6"/>
      <!-- AK Safety Selector Lever Bar -->
      <path d="M312 178 L398 172" stroke="${coreGlow}" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="312" cy="178" r="5" fill="${coreGlow}"/>
    `;
  } else if (isLmg) {
    // Dedicated LMG Hinged Top-Cover Feed Tray (rotates upward when Exploded View is ON)
    const lidAngle = state.explodedView ? -20 : 0;
    svgHTML += `
      <!-- Exposed Internal Belt Feed Tray & Pawl Guide -->
      <rect x="272" y="158" width="186" height="36" rx="2" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.6"/>
      <rect x="342" y="162" width="84" height="24" rx="2" fill="#090a0c" stroke="${coreGlow}" stroke-width="1.6"/>
      <!-- Brass Belt Links Sitting in Feed Tray -->
      <line x1="354" y1="166" x2="354" y2="182" stroke="#eab308" stroke-width="3.5"/>
      <line x1="368" y1="166" x2="368" y2="182" stroke="#eab308" stroke-width="3.5"/>
      <line x1="382" y1="166" x2="382" y2="182" stroke="#eab308" stroke-width="3.5"/>
      <line x1="396" y1="166" x2="396" y2="182" stroke="#eab308" stroke-width="3.5"/>
      <line x1="410" y1="166" x2="410" y2="182" stroke="#eab308" stroke-width="3.5"/>
      <!-- Hinged Top Feed Cover Lid (pivots around front hinge pin at x=456, y=156) -->
      <g transform="rotate(${lidAngle} 456 156)">
        <path d="M268 144 L458 144 L462 158 L268 158 Z" fill="${camo.primary}" stroke="#94a3b8" stroke-width="1.6"/>
        <!-- Top Cover Picatinny Rail -->
        <rect x="284" y="139" width="154" height="5" fill="${camo.trim}" stroke="#475569" stroke-width="1" stroke-dasharray="8 4"/>
        <!-- Rear Top-Cover Release Latches -->
        <rect x="264" y="145" width="10" height="12" rx="1.5" fill="${camo.accent}" stroke="#1c1b18" stroke-width="1"/>
        <!-- Front Hinge Pivot Pin -->
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

  // 5. BARREL ASSEMBLY
  const bx = off.barrel.x;
  const by = off.barrel.y;
  svgHTML += `<g class="${slotClass('barrel')}" data-slot="barrel" transform="translate(${bx}, ${by})">`;
  if (parts.barrel.style === 'gauss_rail') {
    svgHTML += `
      <rect x="${barrelStartX}" y="154" width="${barrelLenPx}" height="9" rx="2" fill="${camo.secondary}" stroke="#38bdf8" stroke-width="1.5"/>
      <rect x="${barrelStartX}" y="175" width="${barrelLenPx}" height="9" rx="2" fill="${camo.secondary}" stroke="#38bdf8" stroke-width="1.5"/>
      <line x1="${barrelStartX}" y1="168" x2="${barrelStartX + barrelLenPx}" y2="168" stroke="#06b6d4" stroke-width="4" stroke-dasharray="14 8" filter="url(#glowFilter)"/>
    `;
  } else if (parts.barrel.style === 'integral_sd') {
    svgHTML += `
      <rect x="${barrelStartX - 10}" y="152" width="${barrelLenPx}" height="32" rx="6" fill="${camo.trim}" stroke="#64748b" stroke-width="1.8"/>
      <line x1="${barrelStartX + 20}" y1="152" x2="${barrelStartX + 20}" y2="184" stroke="#334155" stroke-width="2"/>
      <line x1="${barrelStartX + 55}" y1="152" x2="${barrelStartX + 55}" y2="184" stroke="#334155" stroke-width="2"/>
      <line x1="${barrelStartX + 90}" y1="152" x2="${barrelStartX + 90}" y2="184" stroke="#334155" stroke-width="2"/>
    `;
  } else if (parts.barrel.style === 'ak_standard' || isAk) {
    // AK / SS2 415mm Barrel with 45/90-deg Gas Block, Under-Barrel Cleaning Rod & Tall Front Sight Tower
    svgHTML += `
      <rect x="${barrelStartX}" y="160" width="${barrelLenPx}" height="15" rx="2" fill="url(#metalGrad)" stroke="#64748b" stroke-width="1.5"/>
      <!-- Gas Block -->
      <polygon points="${barrelStartX + 35},148 ${barrelStartX + 58},148 ${barrelStartX + 64},176 ${barrelStartX + 35},176" fill="${camo.trim}" stroke="#64748b" stroke-width="1.4"/>
      <!-- Tall AK Front Sight Post Tower near Muzzle -->
      <polygon points="${barrelStartX + barrelLenPx - 36},160 ${barrelStartX + barrelLenPx - 22},124 ${barrelStartX + barrelLenPx - 10},124 ${barrelStartX + barrelLenPx - 10},176 ${barrelStartX + barrelLenPx - 36},176" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.4"/>
      <!-- Cleaning Rod under barrel -->
      <line x1="${barrelStartX}" y1="179" x2="${barrelStartX + barrelLenPx - 8}" y2="179" stroke="#64748b" stroke-width="2.5"/>
    `;
  } else if (parts.barrel.style === 'lmg_heavy' || parts.barrel.style === 'lmg_pecheneg') {
    // Heavy Quick-Change LMG Barrel with Folding Carry Handle & Forced-Air Cooling Ribs
    svgHTML += `
      <rect x="${barrelStartX}" y="156" width="${barrelLenPx}" height="22" rx="2" fill="url(#metalGrad)" stroke="#1c1b18" stroke-width="1.6"/>
      <!-- LMG Quick-Change Barrel Carry Handle -->
      <path d="M${barrelStartX + 12} 156 L${barrelStartX + 20} 130 L${barrelStartX + 74} 130 L${barrelStartX + 82} 156" fill="none" stroke="#27272a" stroke-width="5" stroke-linejoin="round"/>
      <rect x="${barrelStartX + 28}" y="125" width="38" height="10" rx="2" fill="#3f3f46" stroke="#1c1b18" stroke-width="1.2"/>
      <!-- Cooling Vent Slots along Forced-Air Jacket -->
      ${[26, 48, 70, 92, 114, 136].filter(o => o < barrelLenPx - 28).map(o => `<rect x="${barrelStartX + o}" y="162" width="12" height="5" rx="1" fill="#090a0c"/>`).join('')}
    `;
  } else if (parts.barrel.style === 'rpk_bipod') {
    // Heavy RPK-74 / SVD 590mm Barrel with Folding Bipod Legs
    svgHTML += `
      <rect x="${barrelStartX}" y="159" width="${barrelLenPx}" height="17" rx="2" fill="url(#metalGrad)" stroke="#64748b" stroke-width="1.6"/>
      <rect x="${barrelStartX + 48}" y="150" width="24" height="28" rx="2" fill="${camo.trim}" stroke="#64748b" stroke-width="1.3"/>
      <!-- Deployed Bipod Legs -->
      <line x1="${barrelStartX + barrelLenPx - 42}" y1="176" x2="${barrelStartX + barrelLenPx - 78}" y2="262" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
      <line x1="${barrelStartX + barrelLenPx - 42}" y1="176" x2="${barrelStartX + barrelLenPx - 18}" y2="262" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>
    `;
  } else {
    svgHTML += `
      <rect x="${barrelStartX}" y="160" width="${barrelLenPx}" height="16" rx="2" fill="url(#metalGrad)" stroke="#64748b" stroke-width="1.5"/>
      <rect x="${barrelStartX + 45}" y="152" width="22" height="28" rx="2" fill="${camo.trim}" stroke="#475569" stroke-width="1.2"/>
      <line x1="${barrelStartX}" y1="156" x2="${barrelStartX + 45}" y2="156" stroke="#94a3b8" stroke-width="2.5"/>
    `;
    if (parts.barrel.style === 'long_fluted') {
      svgHTML += `<line x1="${barrelStartX + 75}" y1="168" x2="${barrelStartX + barrelLenPx - 12}" y2="168" stroke="${camo.accent}" stroke-width="2" stroke-dasharray="12 6"/>`;
    }
  }
  svgHTML += `</g>`;

  // 6. MUZZLE ATTACHMENT
  const mzX = off.muzzle.x;
  const mzY = off.muzzle.y;
  svgHTML += `<g class="${slotClass('muzzle')}" data-slot="muzzle" transform="translate(${mzX}, ${mzY})">`;
  if (parts.muzzle.style === 'suppressor') {
    svgHTML += `
      <rect x="${muzzleStartX}" y="151" width="112" height="34" rx="5" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.8"/>
      <rect x="${muzzleStartX + 12}" y="151" width="8" height="34" fill="${camo.accent}" fill-opacity="0.7"/>
      <line x1="${muzzleStartX + 42}" y1="155" x2="${muzzleStartX + 42}" y2="181" stroke="#475569" stroke-width="2"/>
      <line x1="${muzzleStartX + 72}" y1="155" x2="${muzzleStartX + 72}" y2="181" stroke="#475569" stroke-width="2"/>
    `;
  } else if (parts.muzzle.style === 'pbs1') {
    // Soviet PBS-1 / PBS-4 Stepped Two-Chamber Suppressor with Knurled Rear Lock Ring
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
  const flashX = muzzleStartX + (parts.muzzle.style === 'suppressor' || parts.muzzle.style === 'pbs1' ? 124 : 52);
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
  if (parts.sight.style === 'irons') {
    svgHTML += `
      <path d="M282 142 L292 118 L302 142 Z" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.5"/>
      <path d="M${isPistol ? 412 : 475} 142 L${isPistol ? 418 : 485} 122 L${isPistol ? 424 : 495} 142 Z" fill="${camo.trim}" stroke="#94a3b8" stroke-width="1.5"/>
      <circle cx="${isPistol ? 418 : 485}" cy="125" r="2.5" fill="#10b981"/>
    `;
  } else if (parts.sight.style === 'reflex') {
    svgHTML += `
      <rect x="345" y="128" width="46" height="14" rx="2" fill="${camo.trim}" stroke="#64748b" stroke-width="1.5"/>
      <path d="M352 128 L358 104 L378 104 L382 128" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <circle cx="368" cy="116" r="3" fill="#f43f5e"/>
    `;
  } else if (parts.sight.style === 'pso1') {
    // Soviet NPZ PSO-1 4x24 Dovetail Scope with Side-Mount Bracket & Rubber Eyecup
    svgHTML += `
      <path d="M335 148 L355 118 L385 118 L372 148 Z" fill="#475569" stroke="#94a3b8" stroke-width="1.4"/>
      <rect x="275" y="104" width="165" height="18" rx="3" fill="#334155" stroke="#94a3b8" stroke-width="1.6"/>
      <!-- Rubber Eyecup Accordion -->
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

  // 7A. UNIFIED UNDERBARREL ATTACHMENTS (Dynamically scaled & anchored to platform forend & barrel length)
  let ubAnchorX = forendStartX + forendWidth * 0.5;
  let ubAnchorY = forendBottomY + 18;

  if (ubPart && ubPart.style !== 'none') {
    const isLaser = ubPart.style.startsWith('laser');
    const isBayonet = ubPart.style.startsWith('bayonet');
    const ubX = (isBayonet ? 64 : isLaser ? 18 : 12) * exp;
    const ubY = (isLaser && !isPistol ? -32 : 30) * exp;
    svgHTML += `<g class="${slotClass('underbarrel')}" data-slot="underbarrel" transform="translate(${ubX}, ${ubY})">`;

    if (ubPart.style === 'grip_angled') {
      const gW = Math.min(72, Math.max(46, forendWidth - 6));
      const gxPos = forendStartX + Math.round((forendWidth - gW) / 2);
      const gyPos = forendBottomY;
      const gH = isPistol ? 16 : 22;
      ubAnchorX = gxPos + gW / 2;
      ubAnchorY = gyPos + gH;
      svgHTML += `
        <rect x="${gxPos}" y="${gyPos - 2}" width="${gW}" height="5" fill="#18181b"/>
        <polygon points="${gxPos},${gyPos + 2} ${gxPos + gW},${gyPos + 2} ${gxPos + gW - 14},${gyPos + gH} ${gxPos + 18},${gyPos + gH} ${gxPos + 6},${gyPos + 10}" fill="#27272a" stroke="#1c1b18" stroke-width="1.5"/>
        <line x1="${gxPos + 18}" y1="${gyPos + gH - 8}" x2="${gxPos + gW - 16}" y2="${gyPos + gH - 8}" stroke="#52525b" stroke-width="1.8" stroke-dasharray="4 3"/>
      `;
    } else if (ubPart.style === 'grip_vertical') {
      const vW = isPistol ? 15 : 19;
      const vH = isPistol ? 36 : 48;
      const vxPos = forendStartX + Math.round((forendWidth - vW) / 2);
      const vyPos = forendBottomY;
      ubAnchorX = vxPos + vW / 2;
      ubAnchorY = vyPos + vH;
      svgHTML += `
        <rect x="${vxPos - 5}" y="${vyPos - 1}" width="${vW + 10}" height="7" rx="1" fill="#18181b" stroke="#1c1b18" stroke-width="1.2"/>
        <polygon points="${vxPos},${vyPos + 6} ${vxPos + vW},${vyPos + 6} ${vxPos + vW + 3},${vyPos + vH} ${vxPos + 3},${vyPos + vH}" fill="#27272a" stroke="#1c1b18" stroke-width="1.5"/>
        <line x1="${vxPos + 3}" y1="${vyPos + Math.round(vH * 0.4)}" x2="${vxPos + vW - 1}" y2="${vyPos + Math.round(vH * 0.4)}" stroke="#52525b" stroke-width="1.6"/>
        <line x1="${vxPos + 4}" y1="${vyPos + Math.round(vH * 0.65)}" x2="${vxPos + vW}" y2="${vyPos + Math.round(vH * 0.65)}" stroke="#52525b" stroke-width="1.6"/>
      `;
    } else if (ubPart.style === 'ubgl_m203') {
      const mxPos = forendStartX + 4;
      const myPos = forendBottomY - 2;
      const tubeLen = Math.min(162, Math.max(68, Math.round(availUnderBarrel * 0.84)));
      const tubeH = isPistol ? 18 : 23;
      const recW = isPistol ? 26 : 38;
      const barrelClampX = Math.min(muzzleStartX - 18, Math.max(handguardEndX + 10, mxPos + tubeLen - 22));
      ubAnchorX = mxPos + tubeLen * 0.6;
      ubAnchorY = myPos + tubeH;
      svgHTML += `
        <!-- Forward Barrel Clamp Bracket connecting launcher tube up to barrel -->
        ${!isPistol && barrelClampX > handguardEndX ? `<rect x="${barrelClampX}" y="174" width="10" height="${myPos - 168}" fill="#27272a" stroke="#1c1b18" stroke-width="1.2"/>` : ''}
        <!-- M203 Upper Mounting Rail Clamp & Receiver -->
        <rect x="${mxPos}" y="${myPos}" width="${recW}" height="${tubeH + 4}" rx="1.5" fill="#27272a" stroke="#1c1b18" stroke-width="1.5"/>
        <path d="M${mxPos + 6} ${myPos + tubeH + 4} L${mxPos + recW - 8} ${myPos + tubeH + 4} L${mxPos + recW - 11} ${myPos + tubeH + 15} L${mxPos + 4} ${myPos + tubeH + 15} Z" fill="none" stroke="#3f3f46" stroke-width="1.8"/>
        <path d="M${mxPos + 13} ${myPos + tubeH + 4} Q${mxPos + 16} ${myPos + tubeH + 11} ${mxPos + 10} ${myPos + tubeH + 13}" fill="none" stroke="#9e3223" stroke-width="2"/>
        <!-- 40mm Rifled Barrel & Ribbed Sliding Forend -->
        <rect x="${mxPos + recW - 2}" y="${myPos + 3}" width="${tubeLen - recW + 2}" height="${tubeH - 2}" rx="1.5" fill="#3f3f46" stroke="#1c1b18" stroke-width="1.5"/>
        <rect x="${mxPos + recW + 4}" y="${myPos + 6}" width="${Math.max(18, tubeLen - recW - 24)}" height="${tubeH - 7}" rx="1.5" fill="#18181b" stroke="#52525b" stroke-width="1.1"/>
        ${[0, 9, 18, 27, 36, 45, 54].filter(o => o < tubeLen - recW - 32).map(o => `<line x1="${mxPos + recW + 9 + o}" y1="${myPos + 7}" x2="${mxPos + recW + 9 + o}" y2="${myPos + tubeH - 2}" stroke="#52525b" stroke-width="1.8"/>`).join('')}
        <!-- 40mm Muzzle Crown -->
        <rect x="${mxPos + tubeLen - 5}" y="${myPos + 2}" width="5" height="${tubeH}" fill="#18181b"/>
      `;
    } else if (ubPart.style === 'ubgl_gp25') {
      const gxPos = forendStartX + 6;
      const gyPos = forendBottomY - 2;
      const tubeLen = Math.min(122, Math.max(64, Math.round(availUnderBarrel * 0.68)));
      const tubeH = isPistol ? 18 : 22;
      const gripH = isPistol ? 26 : 36;
      const clampX = Math.min(muzzleStartX - 18, Math.max(handguardEndX + 8, gxPos + tubeLen - 26));
      ubAnchorX = gxPos + tubeLen * 0.65;
      ubAnchorY = gyPos + tubeH;
      svgHTML += `
        <!-- Steel Barrel-Lug Mount Bracket clamping GP-25 firmly to barrel -->
        ${!isPistol && clampX > handguardEndX ? `<rect x="${clampX}" y="174" width="12" height="${gyPos - 168}" fill="#27272a" stroke="#1c1b18" stroke-width="1.2"/>` : ''}
        <!-- Compact Bakelite Pistol Grip -->
        <path d="M${gxPos + 4} ${gyPos + tubeH} L${gxPos + 22} ${gyPos + tubeH} L${gxPos + 14} ${gyPos + tubeH + gripH} L${gxPos - 2} ${gyPos + tubeH + gripH} Z" fill="#3b241d" stroke="#1c1b18" stroke-width="1.4"/>
        <!-- GP-25 Receiver Housing & Quadrant Sight -->
        <rect x="${gxPos}" y="${gyPos}" width="34" height="${tubeH + 2}" rx="1.5" fill="#27272a" stroke="#1c1b18" stroke-width="1.5"/>
        <!-- 40mm VOG-25 Rifled Barrel Tube -->
        <rect x="${gxPos + 32}" y="${gyPos + 1}" width="${tubeLen - 32}" height="${tubeH}" rx="1.5" fill="#3f3f46" stroke="#1c1b18" stroke-width="1.5"/>
        <rect x="${gxPos + tubeLen - 5}" y="${gyPos}" width="5" height="${tubeH + 2}" fill="#18181b"/>
      `;
    } else if (ubPart.style === 'laser_peq' || ubPart.style === 'laser_perst') {
      const lW = isPistol ? 38 : Math.min(52, forendWidth - 6);
      const lx = handguardEndX - lW - 4;
      const ly = isPistol ? forendBottomY : 124;
      const lH = isPistol ? 14 : 18;
      const beamY = ly + Math.round(lH / 2);
      const lColor = ubPart.laserColor || '#dc2626';
      ubAnchorX = lx + lW / 2;
      ubAnchorY = isPistol ? ly + lH : ly;
      svgHTML += `
        <rect x="${lx}" y="${ly}" width="${lW}" height="${lH}" rx="1.5" fill="${ubPart.style === 'laser_peq' ? '#786246' : '#1f2421'}" stroke="#1c1b18" stroke-width="1.4"/>
        <circle cx="${lx + lW - 8}" cy="${beamY}" r="3.5" fill="#090a0c" stroke="#71717a" stroke-width="1"/>
        <circle cx="${lx + lW - 8}" cy="${beamY}" r="1.8" fill="${lColor}"/>
        <line x1="${lx + lW}" y1="${beamY}" x2="885" y2="${beamY}" stroke="${lColor}" stroke-width="1.5" stroke-dasharray="10 4" opacity="0.72"/>
      `;
    } else if (ubPart.style === 'wml_scout' || ubPart.style === 'wml_compact') {
      const wLen = isPistol ? 40 : (ubPart.style === 'wml_compact' ? 44 : Math.min(64, forendWidth));
      const wx = handguardEndX - wLen + (isPistol ? 0 : 12);
      const wy = isPistol ? forendBottomY : (forendBottomY - 14);
      ubAnchorX = wx + wLen / 2;
      ubAnchorY = wy + 16;
      svgHTML += `
        <polygon points="${wx + wLen},${wy + 2} ${wx + wLen + 105},${wy - 20} ${wx + wLen + 105},${wy + 34} ${wx + wLen},${wy + 14}" fill="#fde047" fill-opacity="0.14" class="pointer-events-none"/>
        <rect x="${wx}" y="${wy + 2}" width="${wLen - 12}" height="12" rx="1.5" fill="#27272a" stroke="#1c1b18" stroke-width="1.4"/>
        <rect x="${wx + wLen - 13}" y="${wy}" width="14" height="16" rx="1.5" fill="#3f3f46" stroke="#1c1b18" stroke-width="1.4"/>
        <line x1="${wx + wLen + 1}" y1="${wy + 2}" x2="${wx + wLen + 1}" y2="${wy + 14}" stroke="#fef08a" stroke-width="2.2"/>
      `;
    } else if (ubPart.style === 'bayonet_usmc' || ubPart.style === 'bayonet_ak') {
      const bayX = isPistol ? 382 : (muzzleStartX - 36);
      const bayY = isPistol ? forendBottomY : 176;
      const gripCol = ubPart.style === 'bayonet_usmc' ? '#786246' : '#3b241d';
      const gripLen = isPistol ? 30 : 42;
      const bladeLen = isPistol ? 56 : Math.min(112, Math.max(72, Math.round(barrelLenPx * 0.54)));
      ubAnchorX = bayX + gripLen + bladeLen * 0.35;
      ubAnchorY = bayY + 12;
      svgHTML += `
        <rect x="${bayX + gripLen - 10}" y="${bayY - 20}" width="6" height="33" rx="1" fill="#27272a" stroke="#1c1b18" stroke-width="1.3"/>
        <rect x="${bayX - 10}" y="${bayY}" width="${gripLen}" height="12" rx="1.5" fill="${gripCol}" stroke="#1c1b18" stroke-width="1.4"/>
        <polygon points="${bayX + gripLen - 4},${bayY} ${bayX + gripLen - 4 + bladeLen - 14},${bayY} ${bayX + gripLen - 4 + bladeLen},${bayY + 5.5} ${bayX + gripLen - 4 + bladeLen - 20},${bayY + 12} ${bayX + gripLen - 4},${bayY + 12}" fill="#71717a" stroke="#1c1b18" stroke-width="1.4"/>
        <line x1="${bayX + gripLen + 2}" y1="${bayY + 5}" x2="${bayX + gripLen - 4 + bladeLen - 18}" y2="${bayY + 5}" stroke="#e4e4e7" stroke-width="1.2"/>
      `;
    } else if (ubPart.style === 'bipod_harris' || ubPart.style === 'bipod_atlas') {
      const bpX = isPistol ? 396 : (handguardEndX - 20);
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
    <!-- Machined Brass/Steel Ammo Inspection Block -->
    <rect x="0" y="34" width="128" height="28" rx="3" fill="#18181b" stroke="#52525b" stroke-width="1.6"/>
    <rect x="6" y="39" width="116" height="18" rx="2" fill="#090a0c" stroke="#27272a" stroke-width="1"/>
    <text x="64" y="51" text-anchor="middle" fill="${ammoPart.tipColor}" font-family="IBM Plex Mono" font-size="8.5" font-weight="700">${ammoPart.style.replace('_', ' ').toUpperCase()}</text>
    <!-- 4 Standing Cartridges on Inspection Tray -->
    ${[22, 48, 74, 100].map(cx => {
      if (ammoPart.style === 'ferro_slug') {
        return `
          <rect x="${cx - 5}" y="4" width="10" height="30" rx="2" fill="#0284c7" stroke="#38bdf8" stroke-width="1.3"/>
          <line x1="${cx - 4}" y1="12" x2="${cx + 4}" y2="12" stroke="#e0f2fe" stroke-width="1.5"/>
          <line x1="${cx - 4}" y1="22" x2="${cx + 4}" y2="22" stroke="#e0f2fe" stroke-width="1.5"/>
        `;
      } else if (ammoPart.style === 'shells_slug') {
        return `
          <rect x="${cx - 6}" y="18" width="12" height="16" fill="#eab308" stroke="#ca8a04" stroke-width="1"/>
          <rect x="${cx - 6}" y="2" width="12" height="18" rx="1" fill="#dc2626" stroke="#f87171" stroke-width="1"/>
        `;
      } else {
        return `
          <!-- Cartridge Case -->
          <path d="M${cx - 5} 34 L${cx - 5} 16 L${cx - 3} 11 L${cx + 3} 11 L${cx + 5} 16 L${cx + 5} 34 Z" fill="${ammoPart.caseColor}" stroke="#a16207" stroke-width="1"/>
          <!-- Bullet Ogive & Colored Identification Tip -->
          <path d="M${cx - 3} 11 Q${cx} -6 ${cx + 3} 11 Z" fill="${ammoPart.jacketColor}"/>
          <path d="M${cx - 1.8} 4 Q${cx} -5 ${cx + 1.8} 4 Z" fill="${ammoPart.tipColor}"/>
        `;
      }
    }).join('')}
  </g>`;

  // 8. CALLOUT LABELS OVERLAY
  if (state.showCallouts) {
    const callouts = isBullpup ? [
      { cat: 'receiver',  label: 'RECEIVER',   x: 245 + rx, y: 52 + ry,  tx: 245 + rx, ty: 158 + ry },
      { cat: 'sight',     label: 'SIGHTS',     x: 372 + sx, y: 52 + sy,  tx: 372 + sx, ty: 108 + sy },
      { cat: 'barrel',    label: 'BARREL',     x: barrelStartX + 65 + bx, y: 74 + by, tx: barrelStartX + 65 + bx, ty: 156 + by },
      { cat: 'muzzle',    label: 'MUZZLE',     x: muzzleStartX + 38 + mzX, y: 92 + mzY, tx: muzzleStartX + 25 + mzX, ty: 155 + mzY },
      { cat: 'gripStock', label: 'GRIP/STOCK', x: 135 + gx, y: 298 + gy, tx: 155 + gx, ty: 212 + gy },
      { cat: 'magazine',  label: 'MAGAZINE',   x: 245 + off.magazine.x, y: 336 + my, tx: 235 + off.magazine.x, ty: 282 + my },
      { cat: 'platform',  label: 'PLATFORM',   x: 375 + px, y: 336 + py, tx: 385 + px, ty: 222 + py },
      { cat: 'ammo',      label: 'BULLET / AMMO', x: 779 + amX, y: 336 + amY, tx: 779 + amX, ty: 307 + amY }
    ] : isPistol ? [
      { cat: 'receiver',  label: 'RECEIVER',   x: 270 + rx, y: 52 + ry,  tx: 335 + rx, ty: 152 + ry },
      { cat: 'sight',     label: 'SIGHTS',     x: 378 + sx, y: 52 + sy,  tx: 368 + sx, ty: 112 + sy },
      { cat: 'barrel',    label: 'BARREL',     x: barrelStartX + 55 + bx, y: 74 + by, tx: barrelStartX + 55 + bx, ty: 160 + by },
      { cat: 'muzzle',    label: 'MUZZLE',     x: muzzleStartX + 38 + mzX, y: 92 + mzY, tx: muzzleStartX + 25 + mzX, ty: 158 + mzY },
      { cat: 'gripStock', label: 'GRIP/STOCK', x: 155 + gx, y: 298 + gy, tx: 275 + gx, ty: 235 + gy },
      { cat: 'magazine',  label: 'MAGAZINE',   x: 285 + off.magazine.x, y: 338 + my, tx: 288 + off.magazine.x, ty: 296 + my },
      { cat: 'platform',  label: 'PLATFORM',   x: 405 + px, y: 338 + py, tx: 375 + px, ty: 198 + py },
      { cat: 'ammo',      label: 'BULLET / AMMO', x: 779 + amX, y: 336 + amY, tx: 779 + amX, ty: 307 + amY }
    ] : [
      { cat: 'receiver',  label: 'RECEIVER',   x: 275 + rx, y: 52 + ry,  tx: 348 + rx, ty: 158 + ry },
      { cat: 'sight',     label: 'SIGHTS',     x: 385 + sx, y: 52 + sy,  tx: 375 + sx, ty: 108 + sy },
      { cat: 'barrel',    label: 'BARREL',     x: barrelStartX + 65 + bx, y: 74 + by, tx: barrelStartX + 65 + bx, ty: 156 + by },
      { cat: 'muzzle',    label: 'MUZZLE',     x: muzzleStartX + 38 + mzX, y: 92 + mzY, tx: muzzleStartX + 25 + mzX, ty: 155 + mzY },
      { cat: 'gripStock', label: 'GRIP/STOCK', x: 155 + gx, y: 298 + gy, tx: 175 + gx, ty: 222 + gy },
      { cat: 'platform',  label: 'PLATFORM',   x: 295 + px, y: 336 + py, tx: 330 + px, ty: 206 + py },
      { cat: 'magazine',  label: isShotgun ? 'TUBE MAG' : 'MAGAZINE', x: 435 + off.magazine.x, y: 336 + my, tx: isShotgun ? (barrelStartX + 45) : (415 + off.magazine.x), ty: isShotgun ? 188 : (278 + my) },
      { cat: 'ammo',      label: 'BULLET / AMMO', x: 779 + amX, y: 336 + amY, tx: 779 + amX, ty: 307 + amY }
    ];

    if (ubPart && ubPart.style !== 'none') {
      const isLaser = ubPart.style.startsWith('laser');
      const labelX = isLaser && !isPistol
        ? Math.min(640, Math.max(480, Math.round(ubAnchorX)))
        : Math.min(645, Math.max(585, Math.round(ubAnchorX)));
      callouts.push({
        cat: 'underbarrel',
        label: 'UNDERBARREL',
        x: labelX,
        y: isLaser && !isPistol ? 26 : 336,
        tx: Math.round(ubAnchorX),
        ty: Math.round(ubAnchorY)
      });
    }

    callouts.forEach(c => {
      const isAct = state.activeCategory === c.cat;
      const lineCol = isAct ? '#9e3223' : '#3f3d36';
      const bgCol = isAct ? '#9e3223' : '#faf8f3';
      const txtCol = isAct ? '#ffffff' : '#1c1b18';
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