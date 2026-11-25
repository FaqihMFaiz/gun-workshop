export const CATEGORIES = [
  {
    id: 'platform', name: 'Platform', short: 'Platform',
    subtitle: 'Assault rifles, bullpups, SMGs, LMGs, shotguns, sniper chassis & handguns',
    overview: "The platform is the firearm's foundational chassis and operating layout (rifle, bullpup, SMG, LMG, shotgun, or handgun). It sets the base weight, balance, magazine placement, and determines which barrels, receivers, feeds, and attachments are mechanically compatible."
  },
  {
    id: 'barrel', name: 'Barrel', short: 'Barrel',
    subtitle: 'Standard, fluted match, quick-change LMG, compact SMG, integral SD & coil barrels',
    overview: "The barrel contains the chamber pressure and rifling that spins and stabilizes the projectile. Longer, heavier barrels increase muzzle velocity, effective range, and sustained-fire heat capacity, while shorter barrels reduce overall length and speed up close-quarters handling."
  },
  {
    id: 'receiver', name: 'Receivers / Capacitors', short: 'Receiver',
    subtitle: 'Bolt groups, belt feed trays, roller-delayed blowback & coilgun capacitors',
    overview: "The receiver houses the bolt carrier group, trigger pack, and gas or delayed-blowback mechanism (or the high-voltage capacitor bank in a coilgun). It governs the weapon's cartridge chambering, cyclic fire rate, recoil impulse, and mechanical reliability."
  },
  {
    id: 'gripStock', name: 'Grips & Stocks', short: 'Grip/Stock',
    subtitle: 'Collapsible stocks, folding wire stocks, hydraulic LMG buffers & precision rests',
    overview: "Grips and stocks anchor the firearm against your shoulder and firing hand. Precision and heavy buffer stocks maximize cheek-weld stability and recoil absorption, while folding or retractable wire stocks cut length and weight for rapid movement and vehicle entry."
  },
  {
    id: 'magazine', name: 'Magazines & Belt Boxes', short: 'Magazine',
    subtitle: 'Standard box mags, curved stick mags, rotary drums, 100/200-rd belt boxes & battery packs',
    overview: "Magazines and belt boxes feed ammunition into the action. Larger drums and linked LMG ammo boxes allow prolonged suppressive fire between reloads at the cost of added weight and slower reload cycles, whereas compact box mags keep the firearm nimble and fast to reload."
  },
  {
    id: 'ammo', name: 'Bullet Types / Ammo', short: 'Ammo',
    subtitle: 'FMJ Ball, Tungsten AP, Match OTM, Hollow Point, Subsonic AP, Sabot & Steel Dowels',
    overview: "The projectile and propellant load control terminal ballistics on impact. Tungsten-core AP rounds defeat steel and ceramic armor, hollow points maximize soft-tissue expansion, heavy OTM rounds hold tight sub-MOA groupings in wind, and subsonic loads eliminate the supersonic crack."
  },
  {
    id: 'sight', name: 'Sights', short: 'Sights',
    subtitle: 'Iron sights, red dots, holographic optics, 4x prisms, LPVO scopes & thermal sights',
    overview: "Sights align the bore with the target. Unmagnified iron sights and red dots offer wide peripheral vision and instant target acquisition at close range, while magnified prism, LPVO, and thermal scopes extend effective precision out to hundreds of meters with a slight ADS speed trade-off."
  },
  {
    id: 'muzzle', name: 'Muzzles', short: 'Muzzle',
    subtitle: 'Flash hiders, compensators, triple-baffle brakes & quick-detach suppressors',
    overview: "Muzzle devices redirect high-pressure propellant gases exiting the bore. Brakes and compensators vent gas sideways or upward to fight recoil and muzzle climb (increasing side blast), flash hiders conceal muzzle signature, and suppressors trap gas in internal baffles to drastically cut sound pressure."
  },
  {
    id: 'underbarrel', name: 'Underbarrel Attachments', short: 'Underbarrel',
    subtitle: 'Foregrips, 40mm grenade launchers, bayonets, weapon lights, lasers, bipods & rests',
    overview: "Underbarrel and forward-rail accessories expand the weapon's tactical role—foregrips improve recoil control, bipods and shooting bags lock down long-range precision, weapon lights and lasers aid low-light target ID, bayonets add close-quarters reach, and 40mm launchers deliver indirect explosive fire."
  },
  {
    id: 'sling', name: 'Slings', short: 'Sling',
    subtitle: 'Two-point padded nylon, heavy canvas two-point & single-point quick-detach slings',
    overview: "Slings secure the firearm to the operator during transitions and movement while adding an extra point of tension for steadier off-hand shooting. Two-point slings distribute heavy rifle and LMG weight evenly, while single-point slings prioritize fast shoulder-to-shoulder CQB transitions."
  }
];

export const CAMO_FINISHES = [
  { id: 'obsidian', name: 'Matte Black',       primary: '#1e293b', secondary: '#334155', accent: '#f59e0b', trim: '#0f172a' },
  { id: 'fde',      name: 'Flat Dark Earth',   primary: '#786246', secondary: '#967d5c', accent: '#f59e0b', trim: '#292218' },
  { id: 'arctic',   name: 'Alpine White',      primary: '#cbd5e1', secondary: '#94a3b8', accent: '#0ea5e9', trim: '#1e293b' },
  { id: 'solarian', name: 'Olive Drab Green',  primary: '#364532', secondary: '#4b5e45', accent: '#eab308', trim: '#1a2418' },
  { id: 'cyber',    name: 'Gunmetal Grey',     primary: '#3f4756', secondary: '#525c6e', accent: '#38bdf8', trim: '#090d16' }
];

// Industrial commodity / precision feedstock rates in USD per gram
export const MATERIAL_RATES = {
  'Chromoly Steel':     0.014,
  'Carbon Steel':       0.009,
  '7075-T6 Aluminum':   0.022,
  'Polymer':            0.011,
  'Carbon Fiber':       0.095,
  'Tungsten Carbide':   0.185,
  'Copper / Brass':     0.018,
  'Lead Core':          0.006,
  'Gunpowder':          0.085,
  'Optical Glass':      0.420,
  'Titanium / Inconel': 0.160,
  'Electronics / Li-Ion': 0.340,
  'Nylon / Canvas':     0.016,
  'Tritium / Phosphor': 14.50
};

export const PARTS_DB = {
  platform: [
    {
      id: 'plat_ar_carbine',
      name: '5.56mm Direct-Impingement Carbine',
      tag: 'ASSAULT CARBINE // 5.56x45MM',
      desc: 'Modular gas-impingement rotating-bolt carbine (2.92 kg empty, 700–970 RPM cyclic, 500 m point-target range).',
      stats: { damage: 36, fireRate: 800, range: 60, accuracy: 70, control: 68, mobility: 72, penetration: 55, weight: 2.35, cost: 1150 },
      caliber: '5.56x45mm Standard Ball',
      propulsion: 'Direct Impingement',
      fireMode: 'SAFE / SEMI / AUTO',
      baseVelocity: 880,
      shape: 'carbine'
    },
    {
      id: 'plat_ak_series',
      name: '5.45mm Stamped-Steel Assault Rifle',
      tag: 'EASTERN RIFLE // 5.45x39MM',
      desc: 'Long-stroke gas-piston stamped-steel service rifle (3.40–3.50 kg empty, 415 mm barrel, 650–700 RPM cyclic, 890 m/s velocity).',
      stats: { damage: 39, fireRate: 680, range: 64, accuracy: 67, control: 66, mobility: 70, penetration: 59, weight: 2.65, cost: 1050 },
      caliber: '5.45x39mm Steel-Core Ball',
      propulsion: 'Long-Stroke Gas Piston',
      fireMode: 'SAFE / AUTO / 2-RD / SEMI',
      baseVelocity: 890,
      shape: 'ak'
    },
    {
      id: 'plat_pindad_ss2',
      name: '5.56mm Tropical Piston Service Rifle',
      tag: 'SERVICE RIFLE // 5.56x45MM',
      desc: 'Long-stroke gas-piston service rifle engineered for humid tropical environments (449 mm barrel, 650–700 RPM, mud-resistant chassis).',
      stats: { damage: 38, fireRate: 700, range: 66, accuracy: 74, control: 71, mobility: 69, penetration: 57, weight: 2.75, cost: 1250 },
      caliber: '5.56x45mm Service Ball',
      propulsion: 'Long-Stroke Gas Piston',
      fireMode: 'SAFE / SEMI / AUTO',
      baseVelocity: 910,
      shape: 'carbine'
    },
    {
      id: 'plat_qbz_95',
      name: '5.8mm Polymer Bullpup Assault Rifle',
      tag: 'BULLPUP // 5.8x42MM',
      desc: 'Short-stroke gas-piston polymer bullpup rifle (3.25 kg empty, 743 mm overall length with 463 mm barrel, 650 RPM, 930 m/s velocity).',
      stats: { damage: 39, fireRate: 650, range: 67, accuracy: 73, control: 72, mobility: 78, penetration: 62, weight: 2.55, cost: 1180 },
      caliber: '5.8x42mm Heavy Ball',
      propulsion: 'Short-Stroke Piston',
      fireMode: 'SAFE / SEMI / AUTO / 3-RD',
      baseVelocity: 930,
      shape: 'bullpup'
    },
    {
      id: 'plat_bullpup',
      name: '5.56mm Short-Stroke Bullpup Rifle',
      tag: 'BULLPUP // 5.56x45MM',
      desc: 'Modular rear-magazine bullpup rifle placing the action in the buttstock (790 mm overall length with 508 mm barrel, 680–750 RPM).',
      stats: { damage: 38, fireRate: 720, range: 68, accuracy: 74, control: 65, mobility: 76, penetration: 58, weight: 2.85, cost: 1990 },
      caliber: '5.56x45mm Standard Ball',
      propulsion: 'Short-Stroke Piston',
      fireMode: '2-STAGE PROGRESSIVE',
      baseVelocity: 940,
      shape: 'bullpup'
    },
    {
      id: 'plat_svd_dragunov',
      name: '7.62mm Semi-Auto Marksman Rifle',
      tag: 'DMR // 7.62x54MMR',
      desc: 'Short-stroke gas-piston semi-automatic designated marksman rifle (4.30 kg with optic, 620 mm barrel, 830 m/s velocity, 800 m range).',
      stats: { damage: 78, fireRate: 280, range: 86, accuracy: 86, control: 56, mobility: 50, penetration: 82, weight: 3.55, cost: 2850 },
      caliber: '7.62x54mmR Rimmed Sniper',
      propulsion: 'Short-Stroke Piston',
      fireMode: 'SEMI-AUTO DMR',
      baseVelocity: 830,
      shape: 'sniper'
    },
    {
      id: 'plat_smg_pdw',
      name: '9mm Off-Axis Delayed-Blowback SMG',
      tag: 'SMG // 9x19MM DELAYED',
      desc: 'Articulated off-axis delayed-blowback submachine gun redirecting bolt mass downward (2.70 kg empty, 620 mm length, 1,200 RPM cyclic).',
      stats: { damage: 26, fireRate: 1100, range: 34, accuracy: 62, control: 78, mobility: 90, penetration: 34, weight: 2.15, cost: 1550 },
      caliber: '9x19mm / .45 Auto',
      propulsion: 'Off-Axis Delayed Blowback',
      fireMode: 'SEMI / 2-RD BURST / AUTO',
      baseVelocity: 385,
      shape: 'smg'
    },
    {
      id: 'plat_sniper_dmr',
      name: '8.6mm Multi-Caliber Bolt-Action Sniper',
      tag: 'SNIPER // 8.6x70MM MAGNUM',
      desc: 'Chassis-mounted bolt-action precision sniper rifle with 6-lug steel action, sub-0.5 MOA accuracy, and long-range magnum capability.',
      stats: { damage: 86, fireRate: 180, range: 92, accuracy: 92, control: 52, mobility: 42, penetration: 88, weight: 4.80, cost: 6450 },
      caliber: '8.6x70mm Magnum (250 gr)',
      propulsion: '6-Lug Bolt-Action',
      fireMode: 'BOLT-ACTION',
      baseVelocity: 915,
      shape: 'sniper'
    },
    {
      id: 'plat_shotgun',
      name: '12-Gauge Gas-Operated Combat Shotgun',
      tag: 'SHOTGUN // 12-GAUGE',
      desc: 'Dual-piston self-regulating gas-operated semi-auto combat shotgun (3.82 kg, 470 mm barrel, 50 m effective range).',
      stats: { damage: 90, fireRate: 280, range: 26, accuracy: 44, control: 46, mobility: 64, penetration: 42, weight: 3.15, cost: 2100 },
      caliber: '12-Gauge 00 Buckshot / Slug',
      propulsion: 'Dual-Piston Gas Semi-Auto',
      fireMode: 'SEMI-AUTO (7+1 TUBE)',
      baseVelocity: 405,
      shape: 'shotgun'
    },
    {
      id: 'plat_lmg',
      name: '5.56mm Squad Automatic LMG',
      tag: 'LMG // 5.56x45MM BELT',
      desc: 'Gas-operated, air-cooled open-bolt squad support light machine gun accepting linked belts and emergency box magazines (750–850 RPM).',
      stats: { damage: 40, fireRate: 800, range: 72, accuracy: 60, control: 56, mobility: 38, penetration: 64, weight: 5.85, cost: 4200 },
      caliber: '5.56x45mm Linked Belt',
      propulsion: 'Long-Stroke Open Bolt',
      fireMode: 'FULL AUTO',
      baseVelocity: 915,
      shape: 'lmg'
    },
    {
      id: 'plat_pkp_lmg',
      name: '7.62mm Forced-Air Cooled GPMG',
      tag: 'LMG // 7.62x54MMR BELT',
      desc: 'Heavy forced-air cooled general-purpose machine gun (8.2 kg empty, 658 mm barrel, 650–800 RPM, 825 m/s, 100/200-round steel belts).',
      stats: { damage: 64, fireRate: 680, range: 82, accuracy: 64, control: 50, mobility: 30, penetration: 80, weight: 6.40, cost: 5100 },
      caliber: '7.62x54mmR Linked Belt',
      propulsion: 'Long-Stroke Open Bolt',
      fireMode: 'FULL AUTO',
      baseVelocity: 825,
      shape: 'lmg'
    },
    {
      id: 'plat_mp5_smg',
      name: '9mm Roller-Delayed Submachine Gun',
      tag: 'SMG // 9x19MM ROLLER',
      desc: 'Closed-bolt roller-delayed blowback submachine gun (225 mm 3-lug barrel, ~800 RPM cyclic, exceptionally soft full-auto recoil).',
      stats: { damage: 27, fireRate: 800, range: 38, accuracy: 70, control: 82, mobility: 88, penetration: 34, weight: 2.35, cost: 2450 },
      caliber: '9x19mm Service Ball',
      propulsion: 'Roller-Delayed Blowback',
      fireMode: 'SAFE / SEMI / 3-RD / AUTO',
      baseVelocity: 400,
      shape: 'smg'
    },
    {
      id: 'plat_vityaz_smg',
      name: '9mm Straight-Blowback Submachine Gun',
      tag: 'SMG // 9x19MM BLOWBACK',
      desc: 'Closed-bolt straight-blowback 9x19mm submachine gun built on an assault-rifle receiver layout (237 mm barrel, 750 RPM, high-pressure rated).',
      stats: { damage: 28, fireRate: 750, range: 36, accuracy: 68, control: 78, mobility: 86, penetration: 40, weight: 2.45, cost: 1380 },
      caliber: '9x19mm High-Pressure AP',
      propulsion: 'Closed-Bolt Blowback',
      fireMode: 'SAFE / AUTO / SEMI',
      baseVelocity: 410,
      shape: 'smg'
    },
    {
      id: 'plat_arc_pistol',
      name: '10mm Modular Striker-Fired Handgun',
      tag: 'HANDGUN // MODULAR FCU',
      desc: 'Serialized stainless fire-control-unit handgun with reciprocating slide and grip-fed magazine (0.94 kg, 216 mm length, 15-round capacity).',
      stats: { damage: 31, fireRate: 480, range: 30, accuracy: 64, control: 76, mobility: 96, penetration: 40, weight: 0.72, cost: 799 },
      caliber: '10mm Auto / 9x19mm',
      propulsion: 'Striker-Fired Short Recoil',
      fireMode: 'SEMI-AUTO',
      baseVelocity: 390,
      shape: 'pistol'
    }
  ],

  barrel: [
    {
      id: 'bar_cqb_short',
      name: '10.3" (262mm) Short CQB Barrel',
      tag: '262 MM // CLOSE QUARTERS',
      desc: 'Cold hammer forged chrome-lined 1:7 twist short carbine barrel built for tight indoor spaces and vehicle entry.',
      stats: { damage: -3, fireRate: 35, range: -14, accuracy: -6, control: -5, mobility: 14, penetration: -5, weight: 0.52, cost: 348 },
      lengthMm: 262, velDelta: -95, style: 'short'
    },
    {
      id: 'bar_standard_14',
      name: '14.5" (368mm) Standard Service Carbine Barrel',
      tag: '368 MM // STANDARD PROFILE',
      desc: 'Standard chrome-lined 1:7 twist military carbine barrel with heavy flats under the handguard (910 m/s standard velocity).',
      stats: { damage: 0, fireRate: 0, range: 4, accuracy: 5, control: 4, mobility: 0, penetration: 2, weight: 0.72, cost: 295 },
      lengthMm: 368, velDelta: 30, style: 'standard'
    },
    {
      id: 'bar_ak_415',
      name: '16.3" (415mm) Chrome-Lined Gas-Block Barrel',
      tag: '415 MM // 90 DEG GAS BLOCK',
      desc: 'Cold hammer forged chrome-lined 415 mm barrel with 90-degree gas block and under-barrel cleaning rod lug (890 m/s velocity).',
      stats: { damage: 2, fireRate: 0, range: 8, accuracy: 6, control: 6, mobility: -2, penetration: 4, weight: 0.78, cost: 260 },
      lengthMm: 415, velDelta: 35, style: 'ak_standard'
    },
    {
      id: 'bar_carbon_wrapped',
      name: '13.5" (343mm) High-Pressure Taper-Lock Barrel',
      tag: '343 MM // HIGH-PRESSURE',
      desc: 'Heavy-chambered 13.5" forged barrel engineered to withstand 80,000 PSI hybrid-case pressures without throat erosion.',
      stats: { damage: 5, fireRate: 15, range: 9, accuracy: 9, control: 3, mobility: 6, penetration: 8, weight: 0.68, cost: 480 },
      lengthMm: 343, velDelta: 45, style: 'carbon'
    },
    {
      id: 'bar_rpk_590',
      name: '23.2" (590mm) Heavy Finned Support Barrel',
      tag: '590 MM // INTEGRATED BIPOD',
      desc: 'Heavy-profile 590 mm match/support barrel with folding front bipod assembly for sustained long-range accuracy.',
      stats: { damage: 9, fireRate: -25, range: 20, accuracy: 16, control: 14, mobility: -14, penetration: 11, weight: 1.25, cost: 490 },
      lengthMm: 590, velDelta: 75, style: 'rpk_bipod'
    },
    {
      id: 'bar_fluted_20',
      name: '20.0" (508mm) Heavy Fluted Match Barrel',
      tag: '508 MM // PRECISION MATCH',
      desc: 'Full-length 20-inch cold hammer forged heavy match barrel maximizing downrange muzzle velocity and sub-MOA consistency.',
      stats: { damage: 8, fireRate: -30, range: 18, accuracy: 15, control: 8, mobility: -11, penetration: 10, weight: 1.05, cost: 520 },
      lengthMm: 508, velDelta: 65, style: 'long_fluted'
    },
    {
      id: 'bar_integral_sd',
      name: '16.0" (410mm) Integrally Suppressed Ported Barrel',
      tag: '410 MM // INTEGRAL SUBSONIC',
      desc: 'Ported barrel enclosed in a full-length expansion-chamber suppressor sleeve that bleeds gas to drop rounds below the speed of sound.',
      stats: { damage: 4, fireRate: 20, range: -4, accuracy: 11, control: 15, mobility: 4, penetration: 12, weight: 0.82, cost: 640 },
      lengthMm: 410, velDelta: -180, style: 'integral_sd', silenced: true
    },
    {
      id: 'bar_mp5_225',
      name: '8.9" (225mm) 3-Lug Compact SMG Barrel',
      tag: 'SMG // 225 MM // 3-LUG CHF',
      desc: 'Cold hammer forged 9x19mm submachine gun barrel (1:10" twist, integrated 3-lug QD suppressor mount) for compact CQB maneuverability.',
      stats: { damage: -2, fireRate: 40, range: -12, accuracy: 4, control: 8, mobility: 14, penetration: -4, weight: 0.42, cost: 285 },
      lengthMm: 225, velDelta: 15, style: 'short'
    },
    {
      id: 'bar_m249_18',
      name: '18.0" (457mm) Quick-Change Heavy LMG Barrel',
      tag: 'LMG // 457 MM // CARRY HANDLE',
      desc: 'Heavy-walled quick-change chrome-lined squad-automatic barrel with integrated folding carry handle and gas regulator.',
      stats: { damage: 6, fireRate: 0, range: 14, accuracy: 10, control: 12, mobility: -12, penetration: 8, weight: 1.55, cost: 680 },
      lengthMm: 457, velDelta: 55, style: 'lmg_heavy'
    },
    {
      id: 'bar_pkp_658',
      name: '25.9" (658mm) Forced-Air Cooled Shroud Barrel',
      tag: 'LMG // 658 MM // FORCED-AIR',
      desc: 'Fluted 658 mm steel-jacketed barrel using muzzle venturi airflow to sustain 600-round rapid bursts without overheating.',
      stats: { damage: 11, fireRate: -15, range: 20, accuracy: 12, control: 14, mobility: -18, penetration: 12, weight: 2.15, cost: 890 },
      lengthMm: 658, velDelta: 75, style: 'lmg_pecheneg'
    },
    {
      id: 'bar_gauss_rail',
      name: '22.0" (560mm) 10-Stage Optical Induction Coil Barrel',
      tag: '560 MM // 10-STAGE COIL',
      desc: '10-stage electromagnetic coil accelerator barrel (8 optically controlled solid-state stages + 2 booster stages) for steel armatures.',
      stats: { damage: -6, fireRate: -20, range: -12, accuracy: 14, control: 22, mobility: -8, penetration: 6, weight: 1.45, cost: 850 },
      lengthMm: 560, velDelta: -320, style: 'gauss_rail'
    }
  ],

  receiver: [
    {
      id: 'rec_milspec_556',
      name: 'Forged 7075-T6 Direct-Impingement Receiver',
      tag: '5.56x45MM // STANDARD BOLT',
      desc: 'Hard-coat anodized 7075-T6 aluminum upper and lower receiver group with rotating bolt carrier assembly.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: 3, control: 4, mobility: 0, penetration: 0, weight: 0.62, cost: 320 },
      propulsion: 'Direct Impingement', caliberOverride: null, coreColor: '#f59e0b'
    },
    {
      id: 'rec_kalashnikov_stamped',
      name: '1.5mm Stamped-Steel Receiver + Hinged Railed Cover',
      tag: '5.45x39MM // LONG-STROKE',
      desc: 'Stamped-steel long-stroke gas-piston bolt carrier assembly with a rigid hinged top-rail dust cover for zero-holding optics.',
      stats: { damage: 4, fireRate: -20, range: 4, accuracy: 6, control: 8, mobility: 1, penetration: 5, weight: 0.68, cost: 410 },
      propulsion: 'Long-Stroke Gas Piston', caliberOverride: '5.45x39mm / 7.62x39mm', coreColor: '#eab308'
    },
    {
      id: 'rec_norinco_58',
      name: '5.8x42mm Short-Stroke Piston 4-Lug Receiver',
      tag: '5.8x42MM // SHORT-STROKE',
      desc: 'Short-stroke gas-piston rotating bolt with 4 locking lugs and a 3-position gas regulator chambered in high-velocity 5.8x42mm.',
      stats: { damage: 6, fireRate: 25, range: 8, accuracy: 8, control: 7, mobility: 3, penetration: 9, weight: 0.58, cost: 460 },
      propulsion: 'Short-Stroke Piston', caliberOverride: '5.8x42mm Heavy Ball', coreColor: '#10b981'
    },
    {
      id: 'rec_solarian_68',
      name: '6.8x51mm High-Pressure Hybrid-Case Receiver',
      tag: '6.8x51MM // 80,000 PSI',
      desc: 'Short-stroke gas-piston side-charging receiver reinforced for 80,000 PSI hybrid steel-brass rifle ammunition.',
      stats: { damage: 14, fireRate: -40, range: 12, accuracy: 6, control: -8, mobility: -4, penetration: 18, weight: 0.84, cost: 780 },
      propulsion: 'Short-Stroke Piston', caliberOverride: '6.8x51mm High-Pressure', coreColor: '#f59e0b'
    },
    {
      id: 'rec_hyperburst_9',
      name: 'Off-Axis Articulated Delayed-Blowback Receiver',
      tag: '9x19MM // HIGH CYCLIC',
      desc: 'Articulated toggle-link blowback assembly that drives the bolt and counter-mass downward behind the magazine well to tame muzzle climb.',
      stats: { damage: -6, fireRate: 160, range: -10, accuracy: 2, control: 16, mobility: 8, penetration: -10, weight: 0.48, cost: 540 },
      propulsion: 'Off-Axis Delayed Blowback', caliberOverride: '9x19mm / .45 Auto', coreColor: '#38bdf8'
    },
    {
      id: 'rec_capacitor_pulse',
      name: '0.33F Medium-Voltage Electrolytic Capacitor Bank',
      tag: '63V / 11KW // IGBT COIL CORE',
      desc: '0.33 Farad medium-voltage capacitor bank with solid-state IGBT switching (8 rps auto / 13 rps burst, virtually zero mechanical recoil).',
      stats: { damage: -8, fireRate: -20, range: -15, accuracy: 12, control: 24, mobility: -2, penetration: -8, weight: 1.35, cost: 1100 },
      propulsion: '11kW IGBT Capacitor Coil', caliberOverride: '6–8mm Steel Armature (20J)', coreColor: '#06b6d4'
    },
    {
      id: 'rec_capacitor_overcharge',
      name: '8-Stage High-Energy Gauss Capacitor Bank',
      tag: '100 J/S // HIGH-ENERGY GAUSS',
      desc: 'Portable shoulder-fired Gauss capacitor core capable of 100 Joules/sec charging and variable high-voltage electromagnetic discharge.',
      stats: { damage: 18, fireRate: -240, range: 8, accuracy: 14, control: 14, mobility: -18, penetration: 16, weight: 2.85, cost: 1750 },
      propulsion: 'High-Energy Gauss Capacitor', caliberOverride: '12.7mm Steel Armature', coreColor: '#f43f5e'
    },
    {
      id: 'rec_hk_roller_9',
      name: 'Roller-Delayed Blowback Stamped Receiver (9mm)',
      tag: 'SMG // 9x19MM // CLOSED-BOLT',
      desc: 'Two-piece roller-delayed bolt carrier group firing from a closed bolt for exceptionally smooth recoil and accurate first-round hits.',
      stats: { damage: -4, fireRate: 80, range: -6, accuracy: 10, control: 18, mobility: 8, penetration: -8, weight: 0.52, cost: 620 },
      propulsion: 'Roller-Delayed Blowback', caliberOverride: '9x19mm Service / AP', coreColor: '#38bdf8'
    },
    {
      id: 'rec_m249_belt',
      name: '5.56mm Open-Bolt Belt & Box Feed Tray Receiver',
      tag: 'LMG // 5.56MM // BELT FEED',
      desc: 'Reinforced stamped-steel open-bolt machine gun receiver with top-cover pawl feed tray accepting linked belts or emergency box mags.',
      stats: { damage: 4, fireRate: 50, range: 6, accuracy: -2, control: 8, mobility: -10, penetration: 6, weight: 1.45, cost: 840 },
      propulsion: 'Open-Bolt Belt Feed', caliberOverride: '5.56x45mm Linked Belt', coreColor: '#f59e0b'
    },
    {
      id: 'rec_pkp_belt',
      name: '7.62mm Two-Stage Rimmed Belt-Feed Action',
      tag: 'LMG // 7.62x54MMR // BELT',
      desc: 'Heavy-duty two-stage rimmed-cartridge belt feed receiver (100/200-round steel belts) engineered for severe mud and arctic reliability.',
      stats: { damage: 18, fireRate: -60, range: 14, accuracy: 2, control: -4, mobility: -14, penetration: 18, weight: 1.85, cost: 960 },
      propulsion: 'Open-Bolt 7.62R Belt', caliberOverride: '7.62x54mmR Linked Belt', coreColor: '#eab308'
    },
    {
      id: 'rec_arcane_matrix',
      name: '6-Lug Machined Steel Precision Bolt Action',
      tag: '8.6x70MM // 0.5 MOA ACTION',
      desc: 'Flat-bottomed machined steel precision receiver with a 6-lug rotary bolt in three pairs and a two-stage 1.5 kg adjustable match trigger.',
      stats: { damage: 20, fireRate: -180, range: 16, accuracy: 18, control: 6, mobility: -10, penetration: 22, weight: 1.15, cost: 1250 },
      propulsion: '6-Lug Precision Bolt', caliberOverride: '8.6x70mm Magnum Match', coreColor: '#a855f7'
    }
  ],

  gripStock: [
    {
      id: 'stk_telescopic',
      name: '6-Position Collapsible Tactical Stock & Polymer Grip',
      tag: 'COLLAPSIBLE // 0.34 KG',
      desc: 'Multi-position collapsible carbine buttstock with sloped cheek weld, battery storage tubes, and textured ergonomic pistol grip.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: 5, control: 9, mobility: 2, penetration: 0, weight: 0.34, cost: 115 },
      lengthDeltaMm: 0, style: 'telescopic'
    },
    {
      id: 'stk_zenitco_pt1',
      name: 'Machined Aluminum Telescopic Side-Folding Stock',
      tag: 'ALUMINUM FOLDER // 480 G',
      desc: 'Reinforced alloy side-folding telescopic buttstock (480 g, 212–312 mm length) with adjustable cheek riser and ergonomic grip.',
      stats: { damage: 0, fireRate: 0, range: 2, accuracy: 11, control: 14, mobility: 4, penetration: 0, weight: 0.48, cost: 390 },
      lengthDeltaMm: -10, style: 'zenitco'
    },
    {
      id: 'stk_skeleton_fold',
      name: 'Ultralight Left-Folding Skeleton Stock',
      tag: 'SIDE-FOLDING // 0.24 KG',
      desc: 'CNC-machined minimalist folding skeleton stock for paratrooper transport, vehicle carry, and rapid CQB target transitions.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: -3, control: -4, mobility: 15, penetration: 0, weight: 0.24, cost: 199 },
      lengthDeltaMm: -45, style: 'skeleton'
    },
    {
      id: 'stk_prs_precision',
      name: 'Precision Adjustable Marksman Stock (LOP & Comb)',
      tag: 'PRECISION // 788 G',
      desc: 'Heavy-duty adjustable precision rifle stock (788 g) with tool-less click dials for length-of-pull (343–378 mm) and cheek comb height.',
      stats: { damage: 0, fireRate: 0, range: 5, accuracy: 16, control: 17, mobility: -12, penetration: 0, weight: 0.79, cost: 255 },
      lengthDeltaMm: 55, style: 'precision'
    },
    {
      id: 'stk_hera_cqr',
      name: 'Skeletonized Thumbhole Marksman Stock',
      tag: 'THUMBHOLE // 0.48 KG',
      desc: 'Ergonomic thumbhole buttstock with detachable cheek rest locking the shooter into a rigid, repeatable firing position.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: 9, control: 18, mobility: -4, penetration: 0, weight: 0.48, cost: 165 },
      lengthDeltaMm: -15, style: 'thumbhole'
    },
    {
      id: 'stk_mp5_retract',
      name: '2-Position Retractable Steel Wire SMG Stock',
      tag: 'SMG // WIRE STOCK // 0.36 KG',
      desc: 'Dual-rail sliding steel stock that telescopes flush along the submachine gun receiver channels for compact carry.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: 3, control: 6, mobility: 14, penetration: 0, weight: 0.36, cost: 280 },
      lengthDeltaMm: -65, style: 'mp5_wire'
    },
    {
      id: 'stk_m249_para',
      name: 'Hydraulic-Buffer Collapsible Tubular LMG Stock',
      tag: 'LMG // HYDRAULIC BUFFER // 0.68 KG',
      desc: 'Heavy-duty rotating tubular paratrooper machine-gun stock housing an internal hydraulic recoil buffer for sustained bursts.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: 6, control: 18, mobility: -4, penetration: 0, weight: 0.68, cost: 340 },
      lengthDeltaMm: -35, style: 'lmg_para'
    },
    {
      id: 'stk_no_stock',
      name: 'Polymer Pistol Grip Module / Stockless Endplate',
      tag: 'STOCKLESS // 0.08 KG',
      desc: 'Handgun ergonomic polymer grip module with extended beavertail (or stockless sling endplate cap on compact SMGs) for maximum agility.',
      stats: { damage: 0, fireRate: 0, range: -4, accuracy: -10, control: -12, mobility: 24, penetration: 0, weight: 0.08, cost: 65 },
      lengthDeltaMm: -195, style: 'stockless'
    }
  ],

  magazine: [
    {
      id: 'mag_std_30',
      name: '30-Round Windowed Polymer Rifle Magazine',
      tag: '30-RD STANDARD // 142 G',
      desc: 'Standard 30-round impact-resistant polymer box magazine (142 g empty, 190 mm length) with side round-count witness windows.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: 0, control: 0, mobility: 0, penetration: 0, weight: 0.14, cost: 19 },
      capacity: 30, reloadSec: 2.05, style: 'standard_box'
    },
    {
      id: 'mag_bakelite_30',
      name: '30-Round Curved Phenolic-Resin Rifle Magazine',
      tag: '30-RD CURVED // 230 G',
      desc: 'Glass-reinforced phenolic resin 30-round rock-and-lock curved magazine with steel-reinforced feed lips for extreme cold durability.',
      stats: { damage: 1, fireRate: 0, range: 0, accuracy: 1, control: 3, mobility: 2, penetration: 1, weight: 0.23, cost: 85 },
      capacity: 30, reloadSec: 1.95, style: 'bakelite_ak'
    },
    {
      id: 'mag_fast_20',
      name: '20-Round Compact Low-Profile Box Magazine',
      tag: 'COMPACT // FAST RELOAD',
      desc: 'Short-body steel/polymer box magazine providing prone bipod clearance on rifles or flush-fit slide agility on handguns.',
      stats: { damage: 2, fireRate: 0, range: 0, accuracy: 4, control: 2, mobility: 10, penetration: 2, weight: 0.11, cost: 38 },
      capacity: 20, reloadSec: 1.50, style: 'short_fast'
    },
    {
      id: 'mag_ext_45',
      name: '45-Round Extended Support Box Magazine',
      tag: '45-RD EXTENDED // 260 G',
      desc: 'Extended curved squad-automatic box magazine delivering 50% more sustained ammunition capacity before reload.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: -2, control: -2, mobility: -5, penetration: 0, weight: 0.26, cost: 65 },
      capacity: 45, reloadSec: 2.40, style: 'extended'
    },
    {
      id: 'mag_drum_75',
      name: '60-Round Rotary Drum Magazine',
      tag: '60-RD DRUM // 581 G',
      desc: 'High-capacity polymer/steel rotary drum magazine (581 g empty) built for sustained suppressive fire without a full belt feed.',
      stats: { damage: 0, fireRate: 15, range: 0, accuracy: -5, control: -6, mobility: -15, penetration: 0, weight: 0.58, cost: 135 },
      capacity: 60, reloadSec: 3.25, style: 'drum'
    },
    {
      id: 'mag_smg_30',
      name: '30-Round Curved 9x19mm SMG Stick Magazine',
      tag: 'SMG // 30-RD 9MM // 170 G',
      desc: 'Slim double-stack curved 9x19mm steel/polymer submachine gun magazine enabling rapid reloads and minimal snag profile.',
      stats: { damage: 0, fireRate: 10, range: 0, accuracy: 2, control: 4, mobility: 8, penetration: 0, weight: 0.17, cost: 68 },
      capacity: 30, reloadSec: 1.55, style: 'smg_stick'
    },
    {
      id: 'mag_saw_200',
      name: '200-Round Linked Polymer LMG Belt Box (5.56mm)',
      tag: 'LMG // 200-RD BELT BOX',
      desc: 'Detachable 200-round hard-polymer ammunition box feeding disintegrating steel links directly into an LMG feed tray.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: -4, control: 6, mobility: -22, penetration: 0, weight: 1.85, cost: 160 },
      capacity: 200, reloadSec: 4.80, style: 'lmg_box'
    },
    {
      id: 'mag_pkp_100',
      name: '100-Round Stamped Steel GPMG Belt Box (7.62mm)',
      tag: 'LMG // 100-RD STEEL BELT',
      desc: 'Olive-drab stamped-steel under-receiver ammunition box carrying a 100-round non-disintegrating steel belt of full-power 7.62x54mmR.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: -3, control: 5, mobility: -18, penetration: 2, weight: 1.65, cost: 145 },
      capacity: 100, reloadSec: 4.40, style: 'lmg_box'
    },
    {
      id: 'mag_cryo_cell',
      name: '18-Round Armature Magazine + 63V Li-Ion Battery Pack',
      tag: '18-RD STEEL DOWEL // 63V LI-ION',
      desc: '18-round ferromagnetic dowel magazine (4.6–8.5 g alloy steel armatures) paired with a 300-shot 15S 63V lithium-ion power pack.',
      stats: { damage: 4, fireRate: 30, range: 4, accuracy: 5, control: 8, mobility: -4, penetration: 6, weight: 0.65, cost: 185 },
      capacity: 18, reloadSec: 1.85, style: 'energy_cell'
    }
  ],

  ammo: [
    {
      id: 'ammo_m855a1_fmj',
      name: 'Enhanced Penetrator Full Metal Jacket (FMJ Ball)',
      tag: 'STANDARD BALL // 62 GR',
      desc: 'Standard military semi-jacketed steel-tip penetrator over copper/lead core. Pierces 9.5 mm mild steel at 350 m.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: 2, control: 0, mobility: 0, penetration: 4, weight: 0.00, cost: 45 },
      velDelta: 0, dbDelta: 0, tipColor: '#d97706', jacketColor: '#f59e0b', caseColor: '#eab308', style: 'spitzer_fmj'
    },
    {
      id: 'ammo_m995_7n39_ap',
      name: 'Tungsten-Carbide Armor Piercing (Black Tip AP)',
      tag: 'ARMOR PIERCING // TUNGSTEN',
      desc: 'Sintered tungsten-carbide penetrator core defeating up to 12 mm RHA steel at 100 m and rifle-rated ceramic body armor plates.',
      stats: { damage: -3, fireRate: 0, range: 6, accuracy: 2, control: -5, mobility: 0, penetration: 26, weight: 0.02, cost: 195 },
      velDelta: 65, dbDelta: 3, tipColor: '#18181b', jacketColor: '#d97706', caseColor: '#eab308', style: 'spitzer_ap'
    },
    {
      id: 'ammo_mk262_otm',
      name: 'Heavy 77-Grain Open-Tip Match (OTM Sniper)',
      tag: 'SUB-MOA MATCH // 77 GR',
      desc: 'Heavy precision boat-tail Open-Tip Match projectile engineered for peak jacket concentricity and wind-bucking long-range groupings.',
      stats: { damage: 7, fireRate: 0, range: 12, accuracy: 14, control: -2, mobility: 0, penetration: 2, weight: 0.05, cost: 140 },
      velDelta: -35, dbDelta: 0, tipColor: '#fde047', jacketColor: '#ca8a04', caseColor: '#eab308', style: 'spitzer_otm'
    },
    {
      id: 'ammo_federal_jhp',
      name: 'Skived Jacketed Hollow Point (Expanding JHP)',
      tag: 'SOFT-TISSUE EXPANSION // JHP',
      desc: 'Skived copper-jacketed hollow point designed for rapid 1.8x mushroom expansion and maximum kinetic energy transfer with low over-penetration.',
      stats: { damage: 15, fireRate: 0, range: -8, accuracy: 3, control: 2, mobility: 0, penetration: -18, weight: 0.02, cost: 95 },
      velDelta: -25, dbDelta: -1, tipColor: '#f43f5e', jacketColor: '#fb7185', caseColor: '#cbd5e1', style: 'hollow_point'
    },
    {
      id: 'ammo_sp6_subsonic',
      name: 'Heavy 220–250gr Subsonic Armor-Piercing Round',
      tag: '290 M/S SUBSONIC // STEALTH',
      desc: 'Heavy hardened-core subsonic projectile travelling below Mach 1 (~295 m/s) to completely eliminate the supersonic flight crack.',
      stats: { damage: 6, fireRate: 0, range: -14, accuracy: 6, control: 12, mobility: 0, penetration: 12, weight: 0.12, cost: 150 },
      velDelta: -290, dbDelta: -14, tipColor: '#10b981', jacketColor: '#64748b', caseColor: '#78716c', style: 'subsonic_heavy', subsonic: true
    },
    {
      id: 'ammo_12ga_flechette',
      name: '12-Gauge Rifled Sabot Slug / Tungsten Flechette',
      tag: '12-GAUGE // ANTI-BARRIER',
      desc: 'Replaces standard 00 buckshot with a fin-stabilized tungsten dart pack or solid 1-oz rifled slug for extended range and barrier breaching.',
      stats: { damage: 12, fireRate: 0, range: 18, accuracy: 12, control: -8, mobility: -2, penetration: 20, weight: 0.15, cost: 110 },
      velDelta: 45, dbDelta: 2, tipColor: '#ef4444', jacketColor: '#dc2626', caseColor: '#eab308', style: 'shells_slug'
    },
    {
      id: 'ammo_ferro_armature',
      name: '6–8mm Alloy-Steel Ferromagnetic Dowel Armature',
      tag: 'COILGUN ARMATURE // 8.5 G',
      desc: 'Precision-ground 6–8 mm × 22 mm magnetic alloy steel cylindrical armature optimized for 10-stage optical induction coil barrels.',
      stats: { damage: 8, fireRate: 20, range: 6, accuracy: 10, control: 10, mobility: 2, penetration: 14, weight: -0.05, cost: 65 },
      velDelta: 0, dbDelta: -25, tipColor: '#38bdf8', jacketColor: '#06b6d4', caseColor: '#0284c7', style: 'ferro_slug'
    }
  ],

  sight: [
    {
      id: 'sgt_irons',
      name: 'Folding Aperture / Tangent Leaf Iron Sights',
      tag: '1.0x IRON SIGHTS // 50 G',
      desc: 'All-steel folding aperture or range-adjustable tangent leaf iron sights with zero ADS speed penalty and no battery dependency.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: 2, control: 0, mobility: 6, penetration: 0, weight: 0.05, cost: 140 },
      zoom: '1.0x', adsDeltaMs: -25, style: 'irons'
    },
    {
      id: 'sgt_reflex',
      name: 'Micro 2-MOA Enclosed Red Dot Reflex Sight',
      tag: '1.0x REFLEX // 130 G',
      desc: 'Compact 130 g enclosed reflex optic with crisp 2 MOA red dot, 50,000-hour battery life, and unobstructed peripheral field of view.',
      stats: { damage: 0, fireRate: 0, range: 4, accuracy: 8, control: 3, mobility: 3, penetration: 0, weight: 0.13, cost: 490 },
      zoom: '1.0x Reflex', adsDeltaMs: -5, style: 'reflex'
    },
    {
      id: 'sgt_holo_mag',
      name: 'Quick-Detach Holographic Weapon Sight (68 MOA Ring)',
      tag: '1.0x HOLOGRAPHIC // 318 G',
      desc: 'Parallax-free holographic weapon sight (318 g) projecting a 68 MOA outer speed ring and 1 MOA center dot with night-vision modes.',
      stats: { damage: 0, fireRate: 0, range: 8, accuracy: 11, control: 5, mobility: -2, penetration: 0, weight: 0.32, cost: 749 },
      zoom: '1.0x HWS', adsDeltaMs: 15, style: 'holo'
    },
    {
      id: 'sgt_pso1_4x',
      name: 'Side-Mount 4x24 Illuminated Rangefinding Scope',
      tag: '4x24 DOVETAIL // 600 G',
      desc: 'Fixed 4x24 mm side-rail telescopic marksman scope (600 g) featuring a 1.7 m stadiametric rangefinder and ballistic chevron holdovers.',
      stats: { damage: 0, fireRate: 0, range: 17, accuracy: 16, control: 3, mobility: -7, penetration: 0, weight: 0.60, cost: 580 },
      zoom: '4.0x24 Scope', adsDeltaMs: 40, style: 'pso1'
    },
    {
      id: 'sgt_acog_4x',
      name: 'Fixed 4x32 Fiber-Optic Combat Prism Scope',
      tag: '4.0x PRISM // 420 G',
      desc: 'Battery-free fixed 4x32 prism optic utilizing ambient fiber-optic and tritium illumination for rugged mid-range engagements.',
      stats: { damage: 0, fireRate: 0, range: 15, accuracy: 15, control: 4, mobility: -6, penetration: 0, weight: 0.42, cost: 1190 },
      zoom: '4.0x Fixed', adsDeltaMs: 35, style: 'acog'
    },
    {
      id: 'sgt_sniper_lpvo',
      name: '1–10x24 First-Focal-Plane Variable LPVO Scope',
      tag: '1–10x24 FFP // 609 G',
      desc: 'Variable-power first-focal-plane riflescope (609 g) with illuminated MRAD ballistic reticle scaling cleanly from 1x CQB to 10x precision.',
      stats: { damage: 0, fireRate: 0, range: 22, accuracy: 20, control: 2, mobility: -11, penetration: 0, weight: 0.61, cost: 2499 },
      zoom: '1.0x–10.0x FFP', adsDeltaMs: 65, style: 'sniper_scope'
    },
    {
      id: 'sgt_thermal_hud',
      name: '1.5–6x Uncooled Thermal Imaging Weapon Sight',
      tag: '1.5–6x THERMAL // 650 G',
      desc: '12-micron 60 Hz thermal imaging scope with White-Hot/Black-Hot palettes and digital drop reticle for smoke and total darkness.',
      stats: { damage: 2, fireRate: 0, range: 17, accuracy: 17, control: 6, mobility: -9, penetration: 4, weight: 0.65, cost: 2199 },
      zoom: '1.5x–6.0x Thermal', adsDeltaMs: 50, style: 'thermal'
    }
  ],

  muzzle: [
    {
      id: 'muz_thread_cap',
      name: 'Standard Slotted Birdcage Flash Hider',
      tag: 'STANDARD // 60 G',
      desc: 'Closed-bottom slotted military flash suppressor that disperses burning propellant gas and prevents prone ground dust kick-up.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: 2, control: 5, mobility: 2, penetration: 0, weight: 0.06, cost: 28 },
      acousticDb: 165, lengthMm: 45, style: 'birdcage', silenced: false
    },
    {
      id: 'muz_comp_pro',
      name: 'Ported Hybrid Flash Hider & Compensator',
      tag: 'HYBRID COMP // 110 G',
      desc: 'Ported compensator and flash suppressor reducing muzzle rise while preserving low night-time flash signature.',
      stats: { damage: 0, fireRate: 0, range: 2, accuracy: 6, control: 15, mobility: -1, penetration: 0, weight: 0.11, cost: 169 },
      acousticDb: 167, lengthMm: 68, style: 'compensator', silenced: false
    },
    {
      id: 'muz_heavy_brake',
      name: 'Dual/Triple-Baffle Heavy Muzzle Brake',
      tag: 'HEAVY BRAKE // 105 G',
      desc: 'Angled multi-chamber steel muzzle brake cutting measured recoil impulse by over 70% at the expense of loud lateral blast.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: 8, control: 20, mobility: -3, penetration: 0, weight: 0.11, cost: 115 },
      acousticDb: 172, lengthMm: 55, style: 'brake', silenced: false
    },
    {
      id: 'muz_suppressor_ti',
      name: 'Quick-Detach Rifle Sound Suppressor (5.56 / 6.8mm)',
      tag: 'SUPPRESSOR // 163 MM (482 G)',
      desc: 'High-temperature alloy baffle rifle silencer (482 g) reducing report to ~134 dB and eliminating first-round muzzle flash.',
      stats: { damage: 2, fireRate: 0, range: 6, accuracy: 8, control: 10, mobility: -8, penetration: 2, weight: 0.48, cost: 1196 },
      acousticDb: 134, lengthMm: 163, style: 'suppressor', silenced: true
    },
    {
      id: 'muz_pbs1_suppressor',
      name: 'Two-Chamber Stepped Steel Rifle Suppressor',
      tag: 'HEAVY SUPPRESSOR // 200 MM',
      desc: 'Rugged two-chamber stepped steel military sound suppressor (200 mm length, 640 g, ~132 dB report) built for heavy full-auto cycles.',
      stats: { damage: 1, fireRate: 0, range: 4, accuracy: 7, control: 12, mobility: -9, penetration: 1, weight: 0.64, cost: 480 },
      acousticDb: 132, lengthMm: 200, style: 'pbs1', silenced: true
    },
    {
      id: 'muz_smg_3lug',
      name: '3-Lug Quick-Detach 9mm SMG Sound Suppressor',
      tag: 'SMG // 3-LUG QD // 128 DB',
      desc: 'Push-and-twist 3-lug quick-detach 9mm submachine gun silencer rated for full-auto bursts on compact SMG platforms.',
      stats: { damage: 1, fireRate: 0, range: 3, accuracy: 6, control: 10, mobility: -4, penetration: 0, weight: 0.34, cost: 690 },
      acousticDb: 128, lengthMm: 155, style: 'suppressor', silenced: true
    },
    {
      id: 'muz_lmg_slotted',
      name: 'Long Slotted Heavy LMG Flash Suppressor',
      tag: 'LMG // 72 MM // VENTURI',
      desc: 'Heavy 72 mm slotted machine-gun flash suppressor designed to eliminate sustained-fire night flash and drive forced-air barrel cooling.',
      stats: { damage: 0, fireRate: 0, range: 3, accuracy: 5, control: 12, mobility: -3, penetration: 0, weight: 0.18, cost: 95 },
      acousticDb: 168, lengthMm: 72, style: 'brake', silenced: false
    },
    {
      id: 'muz_arc_focus',
      name: 'Optical Chrono-Gate & Booster Coil Stage',
      tag: 'INDUCTION GATE // BOOSTER',
      desc: 'Dual infrared optical gate and secondary capacitor booster stage that synchronizes final magnetic pulse timing at the muzzle crown.',
      stats: { damage: 6, fireRate: 0, range: 8, accuracy: 10, control: 4, mobility: -4, penetration: 10, weight: 0.28, cost: 320 },
      acousticDb: 96, lengthMm: 75, style: 'flux_choke', silenced: true
    }
  ],

  underbarrel: [
    {
      id: 'ub_none',
      name: 'Slick Forend (No Underbarrel Attachment)',
      tag: 'MINIMALIST // 0.00 KG',
      desc: 'Leaves the lower handguard and bayonet lug bare for minimum front-end weight and fastest handling.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: 0, control: 0, mobility: 4, penetration: 0, weight: 0.00, cost: 0 },
      style: 'none'
    },
    {
      id: 'ub_magpul_afg2',
      name: 'Angled Polymer Foregrip',
      tag: 'FOREGRIP // 72 G',
      desc: 'Low-profile 1913 rail angled foregrip (72 g) positioning the support hand high on the bore axis to mitigate muzzle rise.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: 4, control: 10, mobility: 4, penetration: 0, weight: 0.07, cost: 35 },
      style: 'grip_angled'
    },
    {
      id: 'ub_bcm_vertical',
      name: 'Compact Vertical Foregrip',
      tag: 'FOREGRIP // 54 G',
      desc: 'Lightweight forward-angled vertical foregrip (54 g) providing positive hand indexing and rapid full-auto recoil control.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: 3, control: 12, mobility: 2, penetration: 0, weight: 0.05, cost: 22 },
      style: 'grip_vertical'
    },
    {
      id: 'ub_m203_40mm',
      name: '40x46mm Pump-Action Underbarrel Grenade Launcher',
      tag: '40MM UBGL // 1.36 KG',
      desc: 'Single-shot pump-action 40 mm underbarrel grenade launcher (380 mm length, 1.36 kg unloaded, 76 m/s velocity, 400 m max range).',
      stats: { damage: 18, fireRate: 0, range: 4, accuracy: -4, control: 6, mobility: -14, penetration: 12, weight: 1.36, cost: 1650 },
      style: 'ubgl_m203'
    },
    {
      id: 'ub_gp25_kostyor',
      name: '40mm Muzzle-Loaded Underbarrel Grenade Launcher',
      tag: '40MM UBGL // 1.50 KG',
      desc: 'Compact muzzle-loaded 40 mm underbarrel grenade launcher with integrated grip (323 mm length, 1.50 kg unloaded, 76.5 m/s velocity).',
      stats: { damage: 19, fireRate: 0, range: 4, accuracy: -4, control: 5, mobility: -15, penetration: 12, weight: 1.50, cost: 1480 },
      style: 'ubgl_gp25'
    },
    {
      id: 'ub_okc3s_bayonet',
      name: '8.0" Carbon-Steel Combat Bayonet',
      tag: 'BAYONET // 203 MM BLADE',
      desc: 'Multipurpose combat bayonet (20.3 cm high-carbon steel blade, 0.43 kg mounted) locked onto the barrel lug and muzzle collar.',
      stats: { damage: 3, fireRate: 0, range: 0, accuracy: -2, control: 4, mobility: -4, penetration: 0, weight: 0.43, cost: 155 },
      style: 'bayonet_usmc'
    },
    {
      id: 'ub_6kh5_bayonet',
      name: 'Spear-Point Polymer-Grip Utility Bayonet',
      tag: 'BAYONET // WIRE-CUTTER',
      desc: 'Spear-point utility bayonet with insulated polymer grip attaching cleanly to the under-barrel lug and muzzle ring.',
      stats: { damage: 3, fireRate: 0, range: 0, accuracy: -1, control: 3, mobility: -3, penetration: 0, weight: 0.34, cost: 120 },
      style: 'bayonet_ak'
    },
    {
      id: 'ub_surefire_m640df',
      name: '1,500-Lumen Dual-Fuel Rifle Weapon Light (WML)',
      tag: 'WML // 1,500 LM // 156 G',
      desc: 'Hard-anodized high-output weapon-mounted light (1,500 lumens, 156 g w/ battery) on an adjustable forward rail mount.',
      stats: { damage: 0, fireRate: 0, range: 2, accuracy: 4, control: 2, mobility: -1, penetration: 0, weight: 0.16, cost: 359 },
      style: 'wml_scout'
    },
    {
      id: 'ub_tlr1_hl',
      name: '1,000-Lumen Compact Rail Weapon Light (WML)',
      tag: 'WML // 1,000 LM // COMPACT',
      desc: 'Compact 1,000-lumen aluminum weapon light with ambidextrous paddle switch tailored for handgun dust-cover rails and SMGs.',
      stats: { damage: 0, fireRate: 0, range: 1, accuracy: 4, control: 3, mobility: 0, penetration: 0, weight: 0.12, cost: 165 },
      style: 'wml_compact'
    },
    {
      id: 'ub_peq15',
      name: 'Tactical Visible-Red & Infrared Aiming Laser',
      tag: 'LASER // 213 G // RED + IR',
      desc: 'Rail-mounted dual-spectrum target pointer and infrared illuminator (213 g) projecting a visible red aiming laser and IR beam.',
      stats: { damage: 0, fireRate: 0, range: 4, accuracy: 9, control: 5, mobility: -2, penetration: 0, weight: 0.21, cost: 1850 },
      laserColor: '#dc2626', style: 'laser_peq'
    },
    {
      id: 'ub_perst4',
      name: 'Dual-Channel High-Visibility Green & IR Laser',
      tag: 'LASER // 210 G // GREEN + IR',
      desc: 'Machined metal dual-channel aiming laser (210 g) projecting a daylight-visible green laser for rapid close-quarters indexing.',
      stats: { damage: 0, fireRate: 0, range: 4, accuracy: 10, control: 4, mobility: -2, penetration: 0, weight: 0.21, cost: 680 },
      laserColor: '#16a34a', style: 'laser_perst'
    },
    {
      id: 'ub_harris_sbrm',
      name: '6–9" Spring-Loaded Swivel Bipod',
      tag: 'BIPOD // 368 G // NOTCHED',
      desc: 'Heat-treated steel and alloy swivel bipod (6–9 in spring-loaded notched legs, 368 g) mounted under the forward handguard.',
      stats: { damage: 0, fireRate: 0, range: 6, accuracy: 12, control: 15, mobility: -9, penetration: 0, weight: 0.37, cost: 135 },
      style: 'bipod_harris'
    },
    {
      id: 'ub_atlas_bt10',
      name: '5-Position CNC Aluminum Precision Bipod',
      tag: 'BIPOD // 312 G // 5-POS',
      desc: 'Machined aluminum 5-position folding precision bipod with 30° pan and cant capability for long-range marksman rifles.',
      stats: { damage: 0, fireRate: 0, range: 8, accuracy: 14, control: 14, mobility: -7, penetration: 0, weight: 0.31, cost: 245 },
      style: 'bipod_atlas'
    },
    {
      id: 'ub_bench_rest',
      name: 'Waxed-Canvas Heavy-Fill Shooting Bag Rest',
      tag: 'BENCH REST // SUPPORT BAG',
      desc: 'Heavy-fill waxed canvas barricade and bench shooting rest supporting the forend directly on the table for zero-sway accuracy testing.',
      stats: { damage: 0, fireRate: 0, range: 5, accuracy: 16, control: 18, mobility: -14, penetration: 0, weight: 0.95, cost: 115 },
      style: 'shooting_rest'
    }
  ],

  sling: [
    {
      id: 'slg_none',
      name: 'No Sling Installed',
      tag: 'BENCH ONLY // 0.00 KG',
      desc: 'Firearm stripped of carry slings for clean bench inspection and zero snagging.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: 0, control: 0, mobility: 2, penetration: 0, weight: 0.00, cost: 0 },
      style: 'none'
    },
    {
      id: 'slg_vickers_2pt',
      name: 'Quick-Adjust Padded 2-Point Nylon Combat Sling',
      tag: '2-POINT // QUICK-ADJUST',
      desc: '1.25" padded nylon two-point sling anchored from rear stock swivel to forward handguard loop with rapid pull-tab tensioner.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: 3, control: 6, mobility: 6, penetration: 0, weight: 0.16, cost: 68 },
      strapColor: '#4b5320', style: 'two_point'
    },
    {
      id: 'slg_6sh5_canvas',
      name: 'Heavy Cotton-Canvas 2-Point Military Sling',
      tag: '2-POINT // CANVAS + STEEL',
      desc: 'Rugged woven cotton-canvas rifle sling with stamped steel spring carabiner hooks and leather keeper.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: 2, control: 5, mobility: 4, penetration: 0, weight: 0.19, cost: 32 },
      strapColor: '#8f7d52', style: 'two_point'
    },
    {
      id: 'slg_magpul_ms3',
      name: 'Single-Point Quick-Detach Tactical Sling',
      tag: '1-POINT QD // CQB',
      desc: 'Single-point quick-detach sling anchored to the rear receiver endplate for instant weak-side CQB shoulder transitions.',
      stats: { damage: 0, fireRate: 0, range: 0, accuracy: 0, control: 2, mobility: 10, penetration: 0, weight: 0.17, cost: 58 },
      strapColor: '#27272a', style: 'one_point'
    }
  ]
};