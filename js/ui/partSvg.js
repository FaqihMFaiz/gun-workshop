const DEFAULT_CAMO = {
  primary: '#1e293b',
  secondary: '#334155',
  accent: '#f59e0b',
  trim: '#0f172a'
};

function renderPlatformThumb(part, c) {
  const s = part.shape || 'carbine';
  if (s === 'pistol') {
    return `
      <path d="M52 24 L126 24 L126 36 L86 36 L82 44 L66 44 L66 36 L52 36 Z" fill="${c.primary}" stroke="#64748b" stroke-width="1.3"/>
      <rect x="54" y="16" width="72" height="10" rx="1.5" fill="${c.trim}" stroke="#94a3b8" stroke-width="1.2"/>
      <path d="M56 36 L74 36 L68 58 L50 58 Z" fill="${c.secondary}" stroke="#64748b" stroke-width="1.2"/>
      <path d="M76 36 Q79 42 74 43" fill="none" stroke="${c.accent}" stroke-width="1.8"/>
    `;
  }
  if (s === 'bullpup') {
    return `
      <path d="M26 26 L138 26 L138 40 L108 40 L102 47 L88 47 L88 40 L48 40 L44 45 L26 45 Z" fill="${c.primary}" stroke="#64748b" stroke-width="1.3"/>
      <rect x="138" y="30" width="24" height="5" rx="1" fill="#334155" stroke="#94a3b8" stroke-width="1"/>
      <path d="M40 40 L54 40 L58 58 L42 58 Z" fill="${c.secondary}" stroke="#64748b" stroke-width="1.2"/>
      <path d="M88 40 L100 40 L94 56 L82 56 Z" fill="${c.trim}" stroke="#64748b" stroke-width="1.1"/>
      <line x1="48" y1="22" x2="132" y2="22" stroke="${c.accent}" stroke-width="1.8" stroke-dasharray="5 3"/>
    `;
  }
  if (s === 'ak') {
    return `
      <path d="M18 30 L50 30 L50 42 L26 46 L18 46 Z" fill="${c.secondary}" stroke="#64748b" stroke-width="1.2"/>
      <path d="M50 26 L134 26 L134 39 L84 39 L78 46 L64 46 L64 39 L50 39 Z" fill="${c.primary}" stroke="#64748b" stroke-width="1.3"/>
      <rect x="134" y="29" width="32" height="5" rx="1" fill="#334155" stroke="#94a3b8" stroke-width="1"/>
      <polygon points="152,29 158,20 162,20 162,34 152,34" fill="${c.trim}" stroke="#94a3b8" stroke-width="1"/>
      <path d="M90 39 L104 39 Q110 52 116 60 L102 62 Q94 52 90 39 Z" fill="#b45309" stroke="#f59e0b" stroke-width="1.2"/>
      <path d="M54 39 L66 39 L60 56 L48 56 Z" fill="${c.trim}" stroke="#64748b" stroke-width="1.1"/>
    `;
  }
  if (s === 'smg') {
    return `
      <rect x="28" y="28" width="24" height="8" rx="1.5" fill="${c.trim}" stroke="#64748b" stroke-width="1.1"/>
      <path d="M52 24 L124 24 L124 39 L84 39 L78 46 L66 46 L66 39 L52 39 Z" fill="${c.primary}" stroke="#64748b" stroke-width="1.3"/>
      <rect x="124" y="29" width="24" height="5" rx="1" fill="#334155" stroke="#94a3b8" stroke-width="1"/>
      <path d="M92 39 L102 39 Q106 50 110 59 L98 60 Q94 50 92 39 Z" fill="${c.trim}" stroke="#94a3b8" stroke-width="1.1"/>
      <path d="M56 39 L67 39 L62 56 L51 56 Z" fill="${c.secondary}" stroke="#64748b" stroke-width="1.1"/>
    `;
  }
  if (s === 'sniper') {
    return `
      <path d="M12 28 L46 28 L46 42 L12 45 Z" fill="${c.primary}" stroke="#64748b" stroke-width="1.2"/>
      <path d="M46 26 L128 26 L128 38 L82 38 L76 45 L62 45 L62 38 L46 38 Z" fill="${c.secondary}" stroke="#64748b" stroke-width="1.3"/>
      <rect x="128" y="29" width="42" height="5" rx="1" fill="#334155" stroke="#94a3b8" stroke-width="1"/>
      <rect x="54" y="14" width="52" height="8" rx="2" fill="${c.trim}" stroke="${c.accent}" stroke-width="1.1"/>
      <line x1="120" y1="38" x2="112" y2="57" stroke="#94a3b8" stroke-width="2"/>
      <line x1="122" y1="38" x2="132" y2="57" stroke="#64748b" stroke-width="2"/>
      <path d="M52 38 L62 38 L57 54 L47 54 Z" fill="${c.trim}" stroke="#64748b" stroke-width="1.1"/>
    `;
  }
  if (s === 'shotgun') {
    return `
      <path d="M16 30 L48 30 L48 41 L16 47 Z" fill="${c.primary}" stroke="#64748b" stroke-width="1.2"/>
      <path d="M48 25 L106 25 L106 39 L74 39 L68 45 L58 45 L58 39 L48 39 Z" fill="${c.primary}" stroke="#64748b" stroke-width="1.3"/>
      <rect x="106" y="28" width="54" height="5" rx="1" fill="#334155" stroke="#94a3b8" stroke-width="1"/>
      <rect x="106" y="34" width="48" height="4.5" rx="1" fill="#18181b" stroke="#64748b" stroke-width="1"/>
      <rect x="104" y="31" width="28" height="9" rx="2" fill="${c.secondary}" stroke="#64748b" stroke-width="1.1"/>
      <path d="M46 39 L58 39 L52 55 L40 55 Z" fill="${c.secondary}" stroke="#64748b" stroke-width="1.1"/>
    `;
  }
  if (s === 'lmg') {
    return `
      <rect x="14" y="28" width="32" height="14" rx="2" fill="${c.trim}" stroke="#64748b" stroke-width="1.2"/>
      <path d="M46 22 L126 22 L126 40 L84 40 L78 47 L64 47 L64 40 L46 40 Z" fill="${c.primary}" stroke="#64748b" stroke-width="1.3"/>
      <rect x="126" y="27" width="40" height="7" rx="1" fill="#334155" stroke="#94a3b8" stroke-width="1.1"/>
      <path d="M128 27 L132 17 L148 17 L152 27" fill="none" stroke="#3f3f46" stroke-width="2.2"/>
      <rect x="82" y="40" width="28" height="20" rx="2" fill="#364532" stroke="#1c1b18" stroke-width="1.2"/>
      <path d="M52 40 L63 40 L58 55 L47 55 Z" fill="${c.secondary}" stroke="#64748b" stroke-width="1.1"/>
    `;
  }
  // carbine default
  return `
    <path d="M18 29 L48 29 L48 41 L28 46 L18 46 Z" fill="${c.primary}" stroke="#64748b" stroke-width="1.2"/>
    <path d="M48 25 L132 25 L132 39 L84 39 L78 46 L64 46 L64 39 L48 39 Z" fill="${c.primary}" stroke="#64748b" stroke-width="1.3"/>
    <rect x="96" y="26" width="36" height="11" rx="1" fill="${c.secondary}" stroke="#64748b" stroke-width="1.1"/>
    <rect x="132" y="29" width="32" height="5" rx="1" fill="#334155" stroke="#94a3b8" stroke-width="1"/>
    <path d="M90 39 L104 39 L108 59 L94 59 Z" fill="${c.secondary}" stroke="#64748b" stroke-width="1.2"/>
    <path d="M54 39 L65 39 L60 55 L49 55 Z" fill="${c.trim}" stroke="#64748b" stroke-width="1.1"/>
  `;
}

function renderBarrelThumb(part, c) {
  const s = part.style || 'standard';
  if (s === 'gauss_rail') {
    return `
      <rect x="18" y="22" width="144" height="7" rx="1.5" fill="${c.secondary}" stroke="#38bdf8" stroke-width="1.3"/>
      <rect x="18" y="39" width="144" height="7" rx="1.5" fill="${c.secondary}" stroke="#38bdf8" stroke-width="1.3"/>
      <line x1="20" y1="34" x2="160" y2="34" stroke="#06b6d4" stroke-width="3" stroke-dasharray="10 5"/>
      <rect x="18" y="20" width="14" height="28" rx="1.5" fill="${c.trim}" stroke="#38bdf8" stroke-width="1.2"/>
    `;
  }
  if (s === 'integral_sd') {
    return `
      <rect x="18" y="28" width="22" height="12" rx="1" fill="#334155" stroke="#94a3b8" stroke-width="1.1"/>
      <rect x="38" y="21" width="120" height="26" rx="4" fill="${c.trim}" stroke="#94a3b8" stroke-width="1.4"/>
      <line x1="68" y1="21" x2="68" y2="47" stroke="#475569" stroke-width="1.8"/>
      <line x1="98" y1="21" x2="98" y2="47" stroke="#475569" stroke-width="1.8"/>
      <line x1="128" y1="21" x2="128" y2="47" stroke="#475569" stroke-width="1.8"/>
    `;
  }
  if (s === 'carbon') {
    return `
      <rect x="24" y="27" width="132" height="14" rx="2" fill="#18181b" stroke="#52525b" stroke-width="1.4"/>
      <line x1="34" y1="34" x2="146" y2="34" stroke="#3f3f46" stroke-width="8" stroke-dasharray="5 3"/>
      <rect x="24" y="26" width="14" height="16" rx="1" fill="#52525b" stroke="#94a3b8" stroke-width="1.1"/>
      <rect x="144" y="27" width="12" height="14" rx="1" fill="#52525b" stroke="#94a3b8" stroke-width="1.1"/>
      <rect x="58" y="20" width="16" height="24" rx="1.5" fill="${c.trim}" stroke="#64748b" stroke-width="1.2"/>
    `;
  }
  if (s === 'lmg_heavy' || s === 'lmg_pecheneg') {
    const len = s === 'lmg_pecheneg' ? 148 : 124;
    const x0 = Math.round((180 - len) / 2);
    return `
      <rect x="${x0}" y="27" width="${len}" height="16" rx="2" fill="#292524" stroke="#94a3b8" stroke-width="1.4"/>
      <path d="M${x0 + 14} 27 L${x0 + 20} 11 L${x0 + 54} 11 L${x0 + 60} 27" fill="none" stroke="#3f3f46" stroke-width="3.5" stroke-linejoin="round"/>
      <rect x="${x0 + 26}" y="8" width="24" height="7" rx="1.5" fill="#52525b" stroke="#1c1b18" stroke-width="1"/>
      ${[18, 36, 54, 72, 90, 108].filter(o => o < len - 18).map(o => `<rect x="${x0 + o}" y="32" width="10" height="4" rx="1" fill="#090a0c"/>`).join('')}
    `;
  }
  if (s === 'rpk_bipod') {
    return `
      <rect x="16" y="25" width="148" height="12" rx="1.5" fill="#292524" stroke="#94a3b8" stroke-width="1.3"/>
      <rect x="52" y="19" width="18" height="20" rx="1.5" fill="${c.trim}" stroke="#64748b" stroke-width="1.2"/>
      <line x1="136" y1="37" x2="114" y2="60" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
      <line x1="136" y1="37" x2="152" y2="60" stroke="#64748b" stroke-width="3" stroke-linecap="round"/>
    `;
  }
  if (s === 'ak_standard') {
    return `
      <rect x="24" y="28" width="132" height="11" rx="1.5" fill="#292524" stroke="#94a3b8" stroke-width="1.3"/>
      <polygon points="56,19 72,19 76,39 56,39" fill="${c.trim}" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="136,28 144,12 152,12 152,39 136,39" fill="${c.trim}" stroke="#94a3b8" stroke-width="1.2"/>
      <line x1="24" y1="42" x2="148" y2="42" stroke="#64748b" stroke-width="2"/>
    `;
  }
  const len = s === 'short' ? 92 : s === 'long_fluted' ? 148 : 122;
  const x0 = Math.round((180 - len) / 2);
  return `
    <rect x="${x0}" y="28" width="${len}" height="12" rx="1.5" fill="#292524" stroke="#94a3b8" stroke-width="1.3"/>
    <rect x="${x0 + 26}" y="21" width="16" height="22" rx="1.5" fill="${c.trim}" stroke="#64748b" stroke-width="1.1"/>
    <line x1="${x0}" y1="25" x2="${x0 + 26}" y2="25" stroke="#94a3b8" stroke-width="2"/>
    ${s === 'long_fluted' ? `<line x1="${x0 + 48}" y1="34" x2="${x0 + len - 8}" y2="34" stroke="${c.accent}" stroke-width="1.8" stroke-dasharray="9 4"/>` : ''}
  `;
}

function renderReceiverThumb(part, c) {
  const glow = part.coreColor || c.accent;
  const id = part.id || '';
  if (id.includes('capacitor')) {
    return `
      <rect x="24" y="16" width="132" height="36" rx="3" fill="${c.trim}" stroke="${glow}" stroke-width="1.6"/>
      <rect x="34" y="23" width="66" height="22" rx="2.5" fill="#090a0c" stroke="${glow}" stroke-width="1.4"/>
      <rect x="40" y="27" width="54" height="14" rx="1.5" fill="${glow}" fill-opacity="0.35"/>
      <line x1="56" y1="23" x2="56" y2="45" stroke="${glow}" stroke-width="1.8"/>
      <line x1="74" y1="23" x2="74" y2="45" stroke="${glow}" stroke-width="1.8"/>
      <circle cx="128" cy="34" r="10" fill="${c.primary}" stroke="${glow}" stroke-width="1.6"/>
    `;
  }
  if (id.includes('belt')) {
    return `
      <rect x="24" y="18" width="132" height="32" rx="2" fill="${c.primary}" stroke="#94a3b8" stroke-width="1.4"/>
      <rect x="28" y="13" width="124" height="6" rx="1" fill="${c.trim}" stroke="#64748b" stroke-width="1" stroke-dasharray="6 3"/>
      <rect x="56" y="26" width="64" height="18" rx="2" fill="#090a0c" stroke="${glow}" stroke-width="1.3"/>
      <line x1="66" y1="29" x2="66" y2="41" stroke="#eab308" stroke-width="3"/>
      <line x1="78" y1="29" x2="78" y2="41" stroke="#eab308" stroke-width="3"/>
      <line x1="90" y1="29" x2="90" y2="41" stroke="#eab308" stroke-width="3"/>
      <line x1="102" y1="29" x2="102" y2="41" stroke="#eab308" stroke-width="3"/>
    `;
  }
  if (id === 'rec_arcane_matrix') {
    return `
      <rect x="26" y="22" width="124" height="24" rx="2" fill="${c.trim}" stroke="#94a3b8" stroke-width="1.4"/>
      <rect x="66" y="26" width="44" height="11" rx="1.5" fill="#090a0c" stroke="${glow}" stroke-width="1.3"/>
      <line x1="42" y1="34" x2="26" y2="48" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
      <circle cx="24" cy="50" r="4.5" fill="${glow}" stroke="#1c1b18" stroke-width="1"/>
    `;
  }
  if (id === 'rec_shotgun_12ga') {
    return `
      <path d="M26 24 Q34 17 48 17 L148 17 L148 48 L26 48 Z" fill="${c.primary}" stroke="#94a3b8" stroke-width="1.4"/>
      <rect x="78" y="25" width="48" height="14" rx="2" fill="#090a0c" stroke="${glow}" stroke-width="1.4"/>
      <rect x="40" y="29" width="24" height="7" rx="1.5" fill="${c.secondary}" stroke="#94a3b8" stroke-width="1"/>
    `;
  }
  if (id === 'rec_kalashnikov_stamped') {
    return `
      <rect x="24" y="18" width="132" height="32" rx="2" fill="${c.trim}" stroke="#94a3b8" stroke-width="1.4"/>
      <rect x="82" y="24" width="52" height="14" rx="2" fill="#090a0c" stroke="${glow}" stroke-width="1.4"/>
      <path d="M52 42 L114 36" stroke="${glow}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="52" cy="42" r="4.5" fill="${glow}"/>
    `;
  }
  if (id === 'rec_hk_roller_9' || id === 'rec_hyperburst_9') {
    return `
      <rect x="34" y="18" width="112" height="30" rx="3" fill="${c.primary}" stroke="#94a3b8" stroke-width="1.4"/>
      <rect x="76" y="25" width="44" height="13" rx="2" fill="#090a0c" stroke="${glow}" stroke-width="1.4"/>
      <circle cx="54" cy="33" r="6" fill="${c.trim}" stroke="${glow}" stroke-width="1.4"/>
      <circle cx="130" cy="33" r="4" fill="${glow}"/>
    `;
  }
  return `
    <rect x="24" y="19" width="132" height="30" rx="2.5" fill="${c.trim}" stroke="#94a3b8" stroke-width="1.4"/>
    <rect x="72" y="26" width="56" height="14" rx="2" fill="#090a0c" stroke="${glow}" stroke-width="1.4"/>
    <line x1="88" y1="26" x2="88" y2="40" stroke="${glow}" stroke-width="1.6"/>
    <line x1="106" y1="26" x2="106" y2="40" stroke="${glow}" stroke-width="1.6"/>
    <circle cx="48" cy="34" r="6.5" fill="${c.primary}" stroke="${glow}" stroke-width="1.4"/>
  `;
}

function renderGripStockThumb(part, c) {
  const s = part.style || 'telescopic';
  if (s === 'stockless') {
    return `
      <rect x="64" y="16" width="16" height="24" rx="2" fill="${c.trim}" stroke="#64748b" stroke-width="1.3"/>
      <circle cx="62" cy="28" r="5" fill="none" stroke="${c.accent}" stroke-width="1.6"/>
      <path d="M84 24 L112 24 L102 58 L76 58 Z" fill="${c.secondary}" stroke="#64748b" stroke-width="1.4"/>
    `;
  }
  if (s === 'zenitco') {
    return `
      <rect x="34" y="21" width="94" height="10" rx="1.5" fill="${c.trim}" stroke="#94a3b8" stroke-width="1.3"/>
      <rect x="46" y="13" width="44" height="8" rx="1.5" fill="${c.secondary}" stroke="${c.accent}" stroke-width="1.1"/>
      <path d="M26 16 L44 16 L60 52 L26 55 Z" fill="${c.primary}" stroke="#94a3b8" stroke-width="1.3"/>
      <rect x="18" y="14" width="9" height="44" rx="2" fill="#090d16" stroke="#475569" stroke-width="1.2"/>
    `;
  }
  if (s === 'mp5_wire') {
    return `
      <line x1="36" y1="23" x2="146" y2="23" stroke="#52525b" stroke-width="3.5"/>
      <line x1="36" y1="39" x2="146" y2="39" stroke="#52525b" stroke-width="3.5"/>
      <path d="M26 16 L38 16 L38 54 L26 52 Z" fill="#18181b" stroke="#64748b" stroke-width="1.3"/>
      <rect x="136" y="18" width="16" height="28" rx="2" fill="${c.trim}" stroke="#64748b" stroke-width="1.2"/>
    `;
  }
  if (s === 'lmg_para') {
    return `
      <rect x="116" y="20" width="34" height="24" rx="2" fill="#27272a" stroke="#64748b" stroke-width="1.3"/>
      <line x1="36" y1="25" x2="118" y2="25" stroke="#52525b" stroke-width="5"/>
      <line x1="36" y1="38" x2="118" y2="38" stroke="#3f3f46" stroke-width="3.5"/>
      <path d="M24 14 L38 14 L38 56 L24 54 Z" fill="#18181b" stroke="#64748b" stroke-width="1.4"/>
    `;
  }
  if (s === 'skeleton') {
    return `
      <path d="M32 20 L146 20 L146 29 L56 50 L32 50 Z" fill="none" stroke="${c.secondary}" stroke-width="5.5" stroke-linejoin="round"/>
      <rect x="24" y="16" width="10" height="39" rx="2.5" fill="${c.trim}" stroke="#64748b" stroke-width="1.3"/>
    `;
  }
  if (s === 'precision') {
    return `
      <path d="M26 20 L148 20 L148 44 L80 54 L26 56 Z" fill="${c.primary}" stroke="#64748b" stroke-width="1.4"/>
      <rect x="44" y="13" width="52" height="8" rx="2" fill="${c.trim}" stroke="${c.accent}" stroke-width="1.1"/>
      <rect x="18" y="18" width="10" height="41" rx="2.5" fill="#0f172a" stroke="#475569" stroke-width="1.3"/>
    `;
  }
  if (s === 'thumbhole') {
    return `
      <path d="M24 20 L126 20 L148 56 L124 56 L104 40 L52 50 L24 52 Z" fill="${c.primary}" stroke="#64748b" stroke-width="1.4"/>
      <ellipse cx="92" cy="34" rx="18" ry="8" fill="#090a0c" stroke="#475569" stroke-width="1.2"/>
    `;
  }
  // telescopic
  return `
    <rect x="92" y="24" width="56" height="12" fill="${c.trim}" stroke="#64748b" stroke-width="1.2"/>
    <path d="M36 18 L112 18 L112 40 L66 56 L36 56 Z" fill="${c.primary}" stroke="#64748b" stroke-width="1.4"/>
    <rect x="28" y="18" width="9" height="38" rx="2" fill="#090d16"/>
  `;
}

function renderMagazineThumb(part, c) {
  const s = part.style || 'standard_box';
  if (s === 'shotgun_tube') {
    return `
      <rect x="20" y="25" width="136" height="14" rx="3" fill="#292524" stroke="#94a3b8" stroke-width="1.3"/>
      <rect x="116" y="17" width="10" height="30" rx="1.5" fill="#3f3f46" stroke="#1c1b18" stroke-width="1.2"/>
      <rect x="148" y="23" width="12" height="18" rx="2" fill="#27272a" stroke="#94a3b8" stroke-width="1.2"/>
      <circle cx="42" cy="32" r="4" fill="${c.accent}"/>
    `;
  }
  if (s === 'drum') {
    return `
      <rect x="78" y="8" width="24" height="18" fill="${c.trim}" stroke="#64748b" stroke-width="1.3"/>
      <circle cx="90" cy="40" r="24" fill="${c.primary}" stroke="#94a3b8" stroke-width="1.6"/>
      <circle cx="90" cy="40" r="14" fill="${c.trim}" stroke="${c.accent}" stroke-width="1.3" stroke-dasharray="4 3"/>
      <circle cx="90" cy="40" r="5" fill="${c.accent}"/>
    `;
  }
  if (s === 'lmg_box') {
    const boxCol = part.id === 'mag_pkp_100' ? '#364532' : '#4b5320';
    return `
      <rect x="80" y="7" width="18" height="15" fill="#27272a" stroke="#1c1b18" stroke-width="1"/>
      <line x1="83" y1="10" x2="95" y2="10" stroke="#eab308" stroke-width="2.5"/>
      <line x1="83" y1="15" x2="95" y2="15" stroke="#eab308" stroke-width="2.5"/>
      <rect x="54" y="20" width="72" height="42" rx="2.5" fill="${boxCol}" stroke="#1c1b18" stroke-width="1.5"/>
      <text x="90" y="45" text-anchor="middle" fill="#e7e0d2" font-family="IBM Plex Mono" font-size="10" font-weight="700">${part.capacity || 100} RD</text>
    `;
  }
  if (s === 'energy_cell') {
    return `
      <path d="M72 10 L108 10 L112 60 L68 60 Z" fill="#0f172a" stroke="#06b6d4" stroke-width="1.6"/>
      <rect x="80" y="18" width="20" height="34" rx="2" fill="#06b6d4" fill-opacity="0.3" stroke="#38bdf8" stroke-width="1.1"/>
      <line x1="84" y1="27" x2="96" y2="27" stroke="#ffffff" stroke-width="1.8"/>
      <line x1="84" y1="35" x2="96" y2="35" stroke="#ffffff" stroke-width="1.8"/>
      <line x1="84" y1="43" x2="96" y2="43" stroke="#ffffff" stroke-width="1.8"/>
    `;
  }
  if (s === 'bakelite_ak') {
    return `
      <path d="M70 10 L102 10 Q112 38 124 59 L92 62 Q80 40 70 10 Z" fill="#b45309" stroke="#f59e0b" stroke-width="1.4"/>
      <path d="M80 20 Q92 38 102 56" fill="none" stroke="#78350f" stroke-width="2"/>
      <rect x="70" y="10" width="32" height="6" fill="#1e293b"/>
    `;
  }
  if (s === 'smg_stick') {
    return `
      <path d="M78 9 L98 9 Q104 35 112 59 L90 61 Q82 37 78 9 Z" fill="#1f2421" stroke="#64748b" stroke-width="1.4"/>
      <line x1="88" y1="16" x2="100" y2="54" stroke="#52525b" stroke-width="1.6"/>
    `;
  }
  if (s === 'short_fast') {
    return `
      <path d="M72 14 L104 14 L108 48 L76 48 Z" fill="${c.secondary}" stroke="#94a3b8" stroke-width="1.4"/>
      <path d="M75 48 L109 48 L104 57 L80 57 Z" fill="${c.accent}"/>
    `;
  }
  if (s === 'extended') {
    return `
      <path d="M70 8 L102 8 L120 62 L86 62 Z" fill="${c.secondary}" stroke="#94a3b8" stroke-width="1.4"/>
      <line x1="86" y1="17" x2="102" y2="54" stroke="${c.trim}" stroke-width="2.5"/>
    `;
  }
  return `
    <path d="M74 10 L104 10 L114 58 L82 58 Z" fill="${c.secondary}" stroke="#94a3b8" stroke-width="1.4"/>
    <rect x="86" y="21" width="9" height="28" rx="1.5" transform="rotate(-10 86 21)" fill="${c.accent}" fill-opacity="0.55" stroke="#475569" stroke-width="1"/>
  `;
}

function renderAmmoThumb(part) {
  const tip = part.tipColor || '#d97706';
  const jacket = part.jacketColor || '#f59e0b';
  const kase = part.caseColor || '#eab308';
  const s = part.style || 'spitzer_fmj';

  return `
    <rect x="34" y="49" width="112" height="12" rx="2" fill="#18181b" stroke="#52525b" stroke-width="1.2"/>
    ${[56, 90, 124].map(cx => {
      if (s === 'ferro_slug') {
        return `
          <rect x="${cx - 6}" y="12" width="12" height="37" rx="2.5" fill="#0284c7" stroke="#38bdf8" stroke-width="1.3"/>
          <line x1="${cx - 5}" y1="22" x2="${cx + 5}" y2="22" stroke="#e0f2fe" stroke-width="1.6"/>
          <line x1="${cx - 5}" y1="34" x2="${cx + 5}" y2="34" stroke="#e0f2fe" stroke-width="1.6"/>
        `;
      }
      if (s === 'shells_slug') {
        return `
          <rect x="${cx - 7}" y="31" width="14" height="18" fill="${kase}" stroke="#ca8a04" stroke-width="1"/>
          <rect x="${cx - 7}" y="10" width="14" height="22" rx="1" fill="${jacket}" stroke="${tip}" stroke-width="1.1"/>
        `;
      }
      return `
        <path d="M${cx - 6} 49 L${cx - 6} 28 L${cx - 3.5} 21 L${cx + 3.5} 21 L${cx + 6} 28 L${cx + 6} 49 Z" fill="${kase}" stroke="#a16207" stroke-width="1"/>
        <path d="M${cx - 3.5} 21 Q${cx} 4 ${cx + 3.5} 21 Z" fill="${jacket}"/>
        <path d="M${cx - 2} 13 Q${cx} 5 ${cx + 2} 13 Z" fill="${tip}"/>
      `;
    }).join('')}
  `;
}

function renderSightThumb(part, c) {
  const s = part.style || 'irons';
  if (s === 'irons') {
    return `
      <rect x="34" y="45" width="112" height="6" rx="1" fill="${c.trim}" stroke="#64748b" stroke-width="1"/>
      <path d="M46 45 L56 18 L66 45 Z" fill="${c.trim}" stroke="#94a3b8" stroke-width="1.4"/>
      <path d="M118 45 L126 20 L134 45 Z" fill="${c.trim}" stroke="#94a3b8" stroke-width="1.4"/>
      <circle cx="126" cy="24" r="2.5" fill="#10b981"/>
    `;
  }
  if (s === 'reflex') {
    return `
      <rect x="58" y="42" width="64" height="12" rx="2" fill="${c.trim}" stroke="#64748b" stroke-width="1.4"/>
      <path d="M68 42 L76 16 L104 16 L110 42" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <circle cx="90" cy="29" r="3.5" fill="#f43f5e"/>
    `;
  }
  if (s === 'pso1') {
    return `
      <path d="M74 52 L88 32 L106 32 L98 52 Z" fill="#475569" stroke="#94a3b8" stroke-width="1.3"/>
      <rect x="44" y="18" width="110" height="16" rx="2.5" fill="#334155" stroke="#94a3b8" stroke-width="1.4"/>
      <path d="M24 16 L44 18 L44 34 L24 36 Z" fill="#090d16" stroke="#64748b" stroke-width="1.3"/>
      <circle cx="96" cy="14" r="5" fill="${c.accent}"/>
    `;
  }
  if (s === 'acog') {
    return `
      <rect x="64" y="44" width="52" height="9" rx="1.5" fill="${c.trim}" stroke="#64748b" stroke-width="1.2"/>
      <path d="M48 21 L108 17 L130 12 L130 46 L108 40 L48 38 Z" fill="${c.primary}" stroke="#94a3b8" stroke-width="1.5"/>
      <rect x="60" y="15" width="44" height="5" rx="2" fill="#ef4444" stroke="#f59e0b" stroke-width="1"/>
      <line x1="130" y1="14" x2="130" y2="44" stroke="#38bdf8" stroke-width="2.2"/>
    `;
  }
  if (s === 'sniper_scope') {
    return `
      <rect x="52" y="40" width="14" height="14" fill="${c.trim}" stroke="#64748b"/>
      <rect x="112" y="40" width="14" height="14" fill="${c.trim}" stroke="#64748b"/>
      <path d="M26 22 L152 15 L152 45 L26 38 Z" fill="${c.primary}" stroke="#94a3b8" stroke-width="1.5"/>
      <rect x="80" y="9" width="20" height="11" rx="2" fill="${c.accent}"/>
      <line x1="152" y1="17" x2="152" y2="43" stroke="#38bdf8" stroke-width="2.5"/>
    `;
  }
  if (s === 'thermal') {
    return `
      <rect x="44" y="15" width="92" height="38" rx="4" fill="#0f172a" stroke="#a855f7" stroke-width="1.8"/>
      <rect x="56" y="23" width="50" height="18" rx="2" fill="#a855f7" fill-opacity="0.28" stroke="#a855f7" stroke-width="1.2"/>
      <circle cx="122" cy="34" r="6" fill="#10b981"/>
    `;
  }
  // holo
  return `
    <rect x="52" y="18" width="76" height="32" rx="4" fill="${c.primary}" stroke="#94a3b8" stroke-width="1.6"/>
    <rect x="65" y="24" width="44" height="18" rx="2" fill="#080e1a" stroke="${c.accent}" stroke-width="1.3"/>
    <circle cx="87" cy="33" r="3" fill="#f43f5e"/>
  `;
}

function renderMuzzleThumb(part, c) {
  const s = part.style || 'birdcage';
  if (s === 'suppressor') {
    return `
      <rect x="28" y="18" width="124" height="32" rx="5" fill="${c.trim}" stroke="#94a3b8" stroke-width="1.5"/>
      <rect x="42" y="18" width="10" height="32" fill="${c.accent}" fill-opacity="0.75"/>
      <line x1="78" y1="22" x2="78" y2="46" stroke="#475569" stroke-width="2"/>
      <line x1="112" y1="22" x2="112" y2="46" stroke="#475569" stroke-width="2"/>
    `;
  }
  if (s === 'pbs1') {
    return `
      <rect x="26" y="22" width="28" height="24" rx="2" fill="${c.secondary}" stroke="#94a3b8" stroke-width="1.4"/>
      <rect x="54" y="15" width="100" height="38" rx="5" fill="#090d16" stroke="#64748b" stroke-width="1.6"/>
      <line x1="84" y1="15" x2="84" y2="53" stroke="#334155" stroke-width="2"/>
      <line x1="120" y1="15" x2="120" y2="53" stroke="#334155" stroke-width="2"/>
    `;
  }
  if (s === 'flux_choke') {
    return `
      <polygon points="44,20 132,12 132,56 44,48" fill="${c.trim}" stroke="#06b6d4" stroke-width="1.8"/>
      <line x1="56" y1="34" x2="128" y2="34" stroke="#06b6d4" stroke-width="4"/>
    `;
  }
  if (s === 'compensator') {
    return `
      <rect x="46" y="22" width="88" height="24" rx="2.5" fill="${c.secondary}" stroke="#94a3b8" stroke-width="1.5"/>
      <polygon points="62,23 74,23 68,33 56,33" fill="#090a0c"/>
      <polygon points="82,23 94,23 88,33 76,33" fill="#090a0c"/>
      <line x1="106" y1="26" x2="134" y2="26" stroke="#090a0c" stroke-width="2.5"/>
      <line x1="106" y1="42" x2="134" y2="42" stroke="#090a0c" stroke-width="2.5"/>
    `;
  }
  if (s === 'brake') {
    return `
      <rect x="46" y="20" width="88" height="28" rx="3" fill="${c.secondary}" stroke="#94a3b8" stroke-width="1.5"/>
      <rect x="64" y="24" width="10" height="20" fill="#060a12"/>
      <rect x="85" y="24" width="10" height="20" fill="#060a12"/>
      <rect x="106" y="24" width="10" height="20" fill="#060a12"/>
    `;
  }
  return `
    <rect x="52" y="22" width="76" height="24" rx="3" fill="${c.trim}" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="72" y1="26" x2="112" y2="26" stroke="${c.accent}" stroke-width="2.5"/>
  `;
}

function renderUnderbarrelThumb(part, c) {
  const s = part.style || 'none';
  if (s === 'none') {
    return `
      <rect x="34" y="28" width="112" height="10" rx="1.5" fill="${c.trim}" stroke="#64748b" stroke-width="1.2" stroke-dasharray="6 4"/>
      <text x="90" y="52" text-anchor="middle" fill="#6b675c" font-family="IBM Plex Mono" font-size="8" font-weight="600">BARE FOREND RAIL</text>
    `;
  }
  if (s === 'grip_angled') {
    return `
      <rect x="46" y="18" width="88" height="6" fill="#18181b"/>
      <polygon points="48,24 132,24 114,46 68,46 56,33" fill="#27272a" stroke="#1c1b18" stroke-width="1.4"/>
      <line x1="70" y1="36" x2="112" y2="36" stroke="#71717a" stroke-width="1.8" stroke-dasharray="4 3"/>
    `;
  }
  if (s === 'grip_vertical') {
    return `
      <rect x="70" y="10" width="40" height="7" rx="1" fill="#18181b" stroke="#64748b" stroke-width="1"/>
      <polygon points="78,17 102,17 106,58 82,58" fill="#27272a" stroke="#1c1b18" stroke-width="1.4"/>
      <line x1="82" y1="32" x2="102" y2="32" stroke="#52525b" stroke-width="1.6"/>
      <line x1="83" y1="44" x2="103" y2="44" stroke="#52525b" stroke-width="1.6"/>
    `;
  }
  if (s === 'ubgl_m203') {
    return `
      <rect x="28" y="14" width="38" height="25" rx="1.5" fill="#27272a" stroke="#64748b" stroke-width="1.3"/>
      <path d="M34 39 L58 39 L55 51 L32 51 Z" fill="none" stroke="#3f3f46" stroke-width="1.6"/>
      <path d="M42 39 Q46 46 39 48" fill="none" stroke="#9e3223" stroke-width="2"/>
      <rect x="64" y="16" width="88" height="21" rx="1.5" fill="#3f3f46" stroke="#1c1b18" stroke-width="1.4"/>
      <rect x="70" y="20" width="66" height="13" rx="1" fill="#18181b" stroke="#52525b" stroke-width="1"/>
    `;
  }
  if (s === 'ubgl_gp25') {
    return `
      <path d="M36 36 L54 36 L47 61 L30 61 Z" fill="#5c362c" stroke="#1c1b18" stroke-width="1.3"/>
      <rect x="32" y="14" width="34" height="22" rx="1.5" fill="#27272a" stroke="#64748b" stroke-width="1.3"/>
      <rect x="64" y="15" width="82" height="20" rx="1.5" fill="#3f3f46" stroke="#1c1b18" stroke-width="1.4"/>
      <rect x="140" y="14" width="7" height="22" fill="#18181b"/>
    `;
  }
  if (s.startsWith('bayonet')) {
    const gripCol = s === 'bayonet_usmc' ? '#786246' : '#5c362c';
    return `
      <rect x="54" y="14" width="7" height="34" rx="1" fill="#27272a" stroke="#64748b" stroke-width="1.1"/>
      <rect x="18" y="28" width="40" height="12" rx="1.5" fill="${gripCol}" stroke="#1c1b18" stroke-width="1.3"/>
      <polygon points="61,28 144,28 162,34 140,40 61,40" fill="#71717a" stroke="#1c1b18" stroke-width="1.3"/>
      <line x1="68" y1="33" x2="140" y2="33" stroke="#e4e4e7" stroke-width="1.2"/>
    `;
  }
  if (s.startsWith('wml')) {
    return `
      <polygon points="122,22 168,12 168,54 122,42" fill="#fde047" fill-opacity="0.28"/>
      <rect x="36" y="25" width="66" height="16" rx="2" fill="#27272a" stroke="#64748b" stroke-width="1.3"/>
      <rect x="100" y="22" width="22" height="22" rx="2" fill="#3f3f46" stroke="#94a3b8" stroke-width="1.3"/>
      <line x1="123" y1="25" x2="123" y2="41" stroke="#fef08a" stroke-width="2.5"/>
    `;
  }
  if (s.startsWith('laser')) {
    const lCol = part.laserColor || '#dc2626';
    const bodyCol = s === 'laser_peq' ? '#786246' : '#1f2421';
    return `
      <rect x="38" y="20" width="66" height="24" rx="2" fill="${bodyCol}" stroke="#1c1b18" stroke-width="1.4"/>
      <circle cx="92" cy="32" r="5" fill="#090a0c" stroke="#71717a" stroke-width="1.1"/>
      <circle cx="92" cy="32" r="2.4" fill="${lCol}"/>
      <line x1="104" y1="32" x2="166" y2="32" stroke="${lCol}" stroke-width="2" stroke-dasharray="8 4"/>
    `;
  }
  if (s.startsWith('bipod')) {
    return `
      <rect x="74" y="11" width="32" height="10" rx="1.5" fill="#27272a" stroke="#64748b" stroke-width="1.3"/>
      <line x1="84" y1="21" x2="54" y2="57" stroke="#3f3f46" stroke-width="4.5" stroke-linecap="round"/>
      <line x1="96" y1="21" x2="126" y2="57" stroke="#18181b" stroke-width="4.5" stroke-linecap="round"/>
      ${s === 'bipod_harris' ? '<line x1="74" y1="36" x2="106" y2="36" stroke="#a1a1aa" stroke-width="2" stroke-dasharray="2 2"/>' : ''}
      <rect x="46" y="54" width="14" height="6" rx="1.5" fill="#18181b"/>
      <rect x="120" y="54" width="14" height="6" rx="1.5" fill="#18181b"/>
    `;
  }
  // shooting_rest
  return `
    <path d="M56 18 Q90 26 124 18 L142 58 L38 58 Z" fill="#8b7355" stroke="#1c1b18" stroke-width="1.6"/>
    <path d="M54 36 Q90 43 126 36" fill="none" stroke="#5c4a35" stroke-width="2" stroke-dasharray="5 3"/>
    <rect x="74" y="45" width="32" height="9" rx="1.5" fill="#3f3d36" stroke="#1c1b18" stroke-width="1"/>
  `;
}

function renderSlingThumb(part, c) {
  const s = part.style || 'none';
  const strap = part.strapColor || '#4b5320';
  if (s === 'none') {
    return `
      <rect x="78" y="25" width="24" height="14" rx="2" fill="${c.trim}" stroke="#64748b" stroke-width="1.3"/>
      <circle cx="90" cy="32" r="4" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
    `;
  }
  if (s === 'one_point') {
    return `
      <rect x="83" y="10" width="14" height="10" rx="1.5" fill="#27272a" stroke="#a1a1aa" stroke-width="1.2"/>
      <path d="M88 20 C56 44, 124 62, 92 20" fill="none" stroke="${strap}" stroke-width="6.5" stroke-linecap="round"/>
      <rect x="82" y="47" width="16" height="8" rx="1.5" fill="#18181b" stroke="#a1a1aa" stroke-width="1.1"/>
    `;
  }
  // two_point
  return `
    <path d="M30 20 Q90 62 150 20" fill="none" stroke="${strap}" stroke-width="7.5" stroke-linecap="round"/>
    <path d="M30 20 Q90 62 150 20" fill="none" stroke="#1c1b18" stroke-width="1.1" stroke-dasharray="5 3" opacity="0.5"/>
    <rect x="24" y="15" width="12" height="10" rx="1.5" fill="#27272a" stroke="#71717a" stroke-width="1.2"/>
    <rect x="144" y="15" width="12" height="10" rx="1.5" fill="#27272a" stroke="#71717a" stroke-width="1.2"/>
    <rect x="80" y="36" width="20" height="9" rx="1.5" fill="#18181b" stroke="#a1a1aa" stroke-width="1.1"/>
  `;
}

export function renderPartThumbnailSVG(category, part, camo) {
  const c = camo || DEFAULT_CAMO;
  const safePart = part || {};
  let inner = '';

  switch (category) {
    case 'platform':
      inner = renderPlatformThumb(safePart, c);
      break;
    case 'barrel':
      inner = renderBarrelThumb(safePart, c);
      break;
    case 'receiver':
      inner = renderReceiverThumb(safePart, c);
      break;
    case 'gripStock':
      inner = renderGripStockThumb(safePart, c);
      break;
    case 'magazine':
      inner = renderMagazineThumb(safePart, c);
      break;
    case 'ammo':
      inner = renderAmmoThumb(safePart);
      break;
    case 'sight':
      inner = renderSightThumb(safePart, c);
      break;
    case 'muzzle':
      inner = renderMuzzleThumb(safePart, c);
      break;
    case 'underbarrel':
      inner = renderUnderbarrelThumb(safePart, c);
      break;
    case 'sling':
      inner = renderSlingThumb(safePart, c);
      break;
    default:
      inner = `<rect x="40" y="20" width="100" height="28" rx="3" fill="${c.primary}" stroke="#64748b" stroke-width="1.4"/>`;
      break;
  }

  return `<svg viewBox="0 0 180 68" class="w-full h-16 overflow-visible pointer-events-none" aria-hidden="true">${inner}</svg>`;
}
