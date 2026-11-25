import { CATEGORIES } from '../data/catalog.js';
import { clamp, getPartById } from './utils.js';
import { getPartManufacturingProfile } from './manufacturing.js';

const MAX_CACHE_SIZE = 64;
const metricsCache = new Map();

export function clearMetricsCache() {
  metricsCache.clear();
}

export function computeDamageAtDistance(baseDamage, rangeStat, distanceMeters) {
  const dropStart = 15 + (rangeStat * 0.65);
  const minDmg = Math.max(12, Math.round(baseDamage * 0.54));
  if (distanceMeters <= dropStart) return baseDamage;
  const factor = Math.min(1, (distanceMeters - dropStart) / 65);
  return Math.round(baseDamage - (baseDamage - minDmg) * factor);
}

export function computeBalancePoint(parts, capacity) {
  if (!parts || !parts.platform) {
    return { cgRatio: 0.5, cgPct: 50, balanceLabel: 'Balanced' };
  }

  const shape = parts.platform.shape || 'carbine';
  const isBullpup = shape === 'bullpup';
  const isPistol = shape === 'pistol';
  const isRevolver = shape === 'revolver';
  const isHandgun = isPistol || isRevolver;
  const isPdw = shape === 'pdw';
  const isShotgun = shape === 'shotgun';
  const isAmr = shape === 'amr';
  const barrelLenMm = parts.barrel ? (parts.barrel.lengthMm || 368) : 368;
  const magStyle = parts.magazine ? parts.magazine.style : '';

  const stations = {
    gripStock: isBullpup ? 0.18 : isHandgun ? 0.26 : 0.14,
    platform: isBullpup ? 0.45 : isHandgun ? 0.46 : 0.48,
    receiver: isBullpup ? 0.30 : isHandgun ? 0.48 : 0.44,
    magazine: isBullpup ? 0.26
      : isPistol ? 0.34
      : isRevolver ? 0.46
      : isPdw ? 0.48
      : magStyle === 'shotgun_tube' ? 0.68
      : 0.50,
    sight: 0.46,
    barrel: 0.66 + clamp((barrelLenMm - 120) / 650, 0, 1) * 0.16,
    muzzle: 0.94,
    underbarrel: 0.72,
    sling: 0.45
  };

  let weightedMoment = 0;
  let totalWeight = 0;

  Object.entries(stations).forEach(([catId, pos]) => {
    const part = parts[catId];
    const w = Math.max(0.02, part && part.stats && typeof part.stats.weight === 'number' ? part.stats.weight : 0.05);
    weightedMoment += w * pos;
    totalWeight += w;
  });

  const roundWeight = isShotgun ? 0.045 : isAmr ? 0.115 : isHandgun ? 0.012 : 0.014;
  const ammoMass = Math.max(0.05, (capacity || 10) * roundWeight);
  weightedMoment += ammoMass * stations.magazine;
  totalWeight += ammoMass;

  const rawRatio = totalWeight > 0 ? weightedMoment / totalWeight : 0.5;
  const cgRatio = Number(clamp(rawRatio, 0.18, 0.84).toFixed(3));
  const cgPct = Math.round(cgRatio * 100);
  const balanceLabel = cgPct <= 44 ? 'Rear-Heavy' : cgPct >= 56 ? 'Front-Heavy' : 'Balanced';

  return { cgRatio, cgPct, balanceLabel };
}

export function computeBuildMetrics(partSelectionMap) {
  const safeMap = partSelectionMap || {};
  const cacheKey = CATEGORIES.map(cat => safeMap[cat.id] || '').join('|');
  if (metricsCache.has(cacheKey)) {
    return metricsCache.get(cacheKey);
  }

  const parts = {};
  CATEGORIES.forEach(cat => {
    parts[cat.id] = getPartById(cat.id, safeMap[cat.id]);
  });

  const totals = {
    damage: 0,
    fireRate: 0,
    range: 0,
    accuracy: 0,
    control: 0,
    mobility: 0,
    penetration: 0,
    weight: 0,
    cost: 0
  };

  Object.values(parts).forEach(part => {
    if (!part || !part.stats) return;
    totals.damage += part.stats.damage || 0;
    totals.fireRate += part.stats.fireRate || 0;
    totals.range += part.stats.range || 0;
    totals.accuracy += part.stats.accuracy || 0;
    totals.control += part.stats.control || 0;
    totals.mobility += part.stats.mobility || 0;
    totals.penetration += part.stats.penetration || 0;
    totals.weight += part.stats.weight || 0;
    totals.cost += part.stats.cost || 0;
  });

  // Evaluate Real-World Engineering & Mechanical Synergies (Western & Non-Western)
  const synergies = [];
  const isCoilReceiver = parts.receiver.id.includes('capacitor');
  const isCoilBarrel = parts.barrel.id === 'bar_gauss_rail';
  const isLiIonMag = parts.magazine.id === 'mag_cryo_cell';
  const isSilenced = Boolean(parts.barrel.silenced || parts.muzzle.silenced);

  if ((parts.platform.id === 'plat_ak_series' || parts.receiver.id === 'rec_kalashnikov_stamped') &&
      (parts.gripStock.id === 'stk_zenitco_pt1' || parts.muzzle.id === 'muz_heavy_brake' || parts.muzzle.id === 'muz_pbs1_suppressor')) {
    totals.control += 8;
    totals.accuracy += 6;
    synergies.push({
      title: 'Modernized Stamped-Steel Piston Package',
      desc: 'Long-stroke piston receiver paired with aluminum folding stock and heavy brake/suppressor cuts vertical climb and holds optic zero.',
      type: 'amber'
    });
  }

  if (parts.platform.id === 'plat_pindad_ss2' && (parts.barrel.id === 'bar_ak_415' || parts.barrel.id === 'bar_standard_14')) {
    totals.accuracy += 6;
    totals.control += 6;
    synergies.push({
      title: 'Tropical Service Piston Match Spec',
      desc: 'Long-stroke tropical piston rifle paired with a 415mm chrome-lined barrel delivers high accuracy and mud resistance.',
      type: 'emerald'
    });
  }

  if (parts.platform.id === 'plat_qbz_95' && parts.receiver.id === 'rec_norinco_58') {
    totals.penetration += 8;
    totals.range += 6;
    synergies.push({
      title: '5.8x42mm High-Velocity Bullpup Ballistics',
      desc: 'Polymer bullpup chassis paired with 5.8x42mm short-stroke piston action retains flat trajectory and penetration at 930 m/s.',
      type: 'cyan'
    });
  }

  if ((parts.platform.id === 'plat_svd_dragunov' || parts.barrel.id === 'bar_integral_sd') && parts.sight.id === 'sgt_pso1_4x') {
    totals.accuracy += 9;
    totals.range += 7;
    synergies.push({
      title: 'Side-Mount 4x24 Ballistic Reticle Match',
      desc: '4x24 stadiametric rangefinding reticle is calibrated directly to 7.62x54mmR and heavy subsonic drop trajectories.',
      type: 'amber'
    });
  }

  if (parts.ammo && parts.ammo.subsonic && isSilenced) {
    totals.control += 9;
    totals.accuracy += 6;
    synergies.push({
      title: 'Subsonic + Baffled Suppressor Whisper Lock',
      desc: 'Heavy subsonic AP ammunition paired with a suppressor eliminates the supersonic flight crack, dropping report to ~119 dB.',
      type: 'emerald'
    });
  }

  if (parts.ammo && parts.ammo.id === 'ammo_m995_7n39_ap') {
    synergies.push({
      title: 'Tungsten-Carbide Level-IV Armor Defeat',
      desc: 'Tungsten-carbide penetrator core defeats up to 12mm RHA steel and military ceramic trauma plates at +26 Penetration.',
      type: 'amber'
    });
  }

  if (isCoilReceiver && isCoilBarrel && isLiIonMag) {
    totals.accuracy += 8;
    totals.control += 10;
    synergies.push({
      title: 'Complete 10-Stage IGBT Coil Architecture',
      desc: '63V 15S Li-Ion pack + 0.33F capacitor bank + 10-stage optical coils deliver virtually zero mechanical recoil and 96 dB whisper operation.',
      type: 'cyan'
    });
  }

  if (parts.receiver.id === 'rec_solarian_68' && parts.barrel.id === 'bar_carbon_wrapped') {
    totals.damage += 6;
    totals.penetration += 10;
    synergies.push({
      title: 'High-Pressure 6.8x51mm Hybrid Match',
      desc: '80,000 PSI bi-metal case receiver paired with the 13.5" Taper-Lok barrel achieves 915 m/s velocity and defeats level-IV armor plates.',
      type: 'amber'
    });
  }

  if (parts.muzzle.id === 'muz_suppressor_ti' && (parts.barrel.id === 'bar_standard_14' || parts.barrel.id === 'bar_cqb_short')) {
    totals.control += 6;
    totals.accuracy += 4;
    synergies.push({
      title: 'Suppressed Tactical Carbine Match',
      desc: 'Quick-detach rifle suppressor paired with 10.3"–14.5" carbine barrel reduces report to ~134 dB and eliminates 99% of first-round flash.',
      type: 'emerald'
    });
  }

  if (parts.sight.id === 'sgt_nvg_gen3' && ['ub_peq15', 'ub_perst4'].includes(parts.underbarrel.id)) {
    totals.accuracy += 10;
    totals.control += 6;
    totals.range += 6;
    synergies.push({
      title: 'Passive Night-Ops IR Targeting Suite',
      desc: 'Gen-3 night-vision scope paired with an infrared aiming laser enables zero-signature night engagements and +10 Accuracy.',
      type: 'cyan'
    });
  }

  if (parts.underbarrel.id === 'ub_lrf_computer' && ['sgt_sniper_5_25', 'sgt_sniper_lpvo'].includes(parts.sight.id)) {
    totals.accuracy += 9;
    totals.range += 8;
    synergies.push({
      title: 'Ballistic LRF + FFP Holdover Lock',
      desc: 'Weapon-mounted laser rangefinder feeds live distance data directly to the first-focal-plane reticle for extreme-range precision.',
      type: 'amber'
    });
  }

  if (parts.muzzle.id === 'muz_flow_ti') {
    totals.control += 5;
    totals.accuracy += 4;
    synergies.push({
      title: 'Flow-Through Zero-Gas-Blowback Suppression',
      desc: '3D-printed flow-through titanium suppressor vents propellant gas forward, eliminating bolt over-gassing and cutting thermal build-up.',
      type: 'emerald'
    });
  }

  if (parts.receiver.id === 'rec_an94_hyperburst') {
    totals.accuracy += 8;
    totals.control += 8;
    synergies.push({
      title: '1,800 RPM 2-Round Pulley Hyperburst',
      desc: 'Recoil-shifted pulley action fires a 2-round burst before recoil impulse reaches the shooter’s shoulder, stacking two hits on one point.',
      type: 'cyan'
    });
  }

  if (parts.platform.id === 'plat_amr_50' && parts.ammo && parts.ammo.id === 'ammo_slap_sabot') {
    totals.penetration += 10;
    totals.range += 8;
    synergies.push({
      title: '.50 BMG Sub-Caliber Sabot Armor Defeat',
      desc: 'Sabot light-armor-penetrator tungsten projectile achieves extreme velocity and punches through heavy armored vehicles.',
      type: 'amber'
    });
  }

  if (parts.sling.id === 'slg_lmg_harness' && ['lmg', 'amr', 'sniper'].includes(parts.platform.shape)) {
    totals.mobility += 10;
    totals.control += 6;
    synergies.push({
      title: 'Load-Bearing Machine-Gunner Harness',
      desc: 'Padded full-weight support harness distributes heavy LMG and anti-materiel chassis weight across the torso for faster transitions.',
      type: 'emerald'
    });
  }

  if (synergies.length === 0) {
    synergies.push({
      title: 'Standard Rail & Dovetail Tolerances Nominal',
      desc: 'All selected components meet real-world military tolerances. Pair matching subsonic, high-pressure, coilgun, or modernized piston parts for system bonuses.',
      type: 'slate'
    });
  }

  const finalStats = {
    damage: clamp(Math.round(totals.damage), 10, 100),
    fireRate: clamp(Math.round(totals.fireRate), 120, 1300),
    range: clamp(Math.round(totals.range), 15, 100),
    accuracy: clamp(Math.round(totals.accuracy), 15, 100),
    control: clamp(Math.round(totals.control), 15, 100),
    mobility: clamp(Math.round(totals.mobility), 15, 100),
    penetration: clamp(Math.round(totals.penetration), 10, 100),
    weight: Math.max(0.85, Number(totals.weight.toFixed(2))),
    cost: Math.round(totals.cost)
  };

  const receiverBaseLen = parts.platform.shape === 'bullpup' ? 235
    : parts.platform.shape === 'pistol' ? 88
    : parts.platform.shape === 'revolver' ? 96
    : parts.platform.shape === 'pdw' ? 255
    : parts.platform.shape === 'smg' ? 290
    : parts.platform.shape === 'lever' ? 390
    : parts.platform.shape === 'amr' ? 510
    : 425;
  const lengthMm = Math.round(
    receiverBaseLen +
    (parts.barrel.lengthMm || 368) +
    (parts.gripStock.lengthDeltaMm || 0) +
    (parts.muzzle.lengthMm || 45)
  );

  let velocityMs = Math.round((parts.platform.baseVelocity || 880) + (parts.barrel.velDelta || 0) + (parts.ammo ? (parts.ammo.velDelta || 0) : 0));
  if (parts.ammo && parts.ammo.subsonic) velocityMs = Math.min(velocityMs, 295);
  if (parts.ammo && parts.ammo.id === 'ammo_slap_sabot' && !parts.receiver.id.includes('capacitor')) velocityMs = Math.max(velocityMs, 1140);
  if (parts.receiver.id === 'rec_capacitor_pulse') velocityMs = 75;
  if (parts.receiver.id === 'rec_capacitor_overcharge') velocityMs = 135;
  if (parts.receiver.id === 'rec_solarian_68' && (!parts.ammo || !parts.ammo.subsonic)) velocityMs = Math.max(velocityMs, 915);
  if (parts.receiver.id === 'rec_norinco_58' && (!parts.ammo || !parts.ammo.subsonic)) velocityMs = Math.max(velocityMs, 930);
  velocityMs = clamp(velocityMs, 75, 1180);

  const adsMs = clamp(Math.round(300 - finalStats.mobility * 1.5 + (parts.sight.adsDeltaMs || 0) + (finalStats.weight * 12)), 115, 490);
  const reloadSec = Number(Math.max(1.2, (parts.magazine.reloadSec || 2.05) + (finalStats.weight > 5.0 ? 0.35 : 0)).toFixed(2));
  const rawDb = (parts.receiver.id.includes('capacitor'))
    ? 96
    : (parts.barrel.id === 'bar_integral_sd' && ['muz_suppressor_ti', 'muz_pbs1_suppressor', 'muz_flow_ti', 'muz_shotgun_salvo'].includes(parts.muzzle.id))
      ? 121
      : parts.barrel.id === 'bar_integral_sd'
        ? 127
        : (parts.muzzle.acousticDb || 165);
  const acousticDb = clamp(rawDb + (parts.ammo ? (parts.ammo.dbDelta || 0) : 0), 92, 178);

  const dps = Math.round((finalStats.damage * (finalStats.fireRate / 60)));
  const shotsToKill100 = Math.ceil(100 / finalStats.damage);
  const ttkSec = Number(((shotsToKill100 - 1) * (60 / finalStats.fireRate)).toFixed(2));
  const spreadMoa = Number(Math.max(0.4, ((105 - finalStats.accuracy) * 0.042)).toFixed(1));

  const powerScore = clamp(
    Math.round(
      (finalStats.damage * 0.22) +
      ((finalStats.fireRate / 12) * 0.16) +
      (finalStats.range * 0.16) +
      (finalStats.accuracy * 0.16) +
      (finalStats.control * 0.15) +
      (finalStats.mobility * 0.15)
    ),
    35, 99
  );

  // Aggregate complete weapon Bill of Materials (BOM), Labor Pay, and Manufacturing Time
  const bomTotals = {};
  let totalMaterialCost = 0;
  let totalWorkerPay = 0;
  let totalMfgHours = 0;
  let totalMaterialGrams = 0;

  CATEGORIES.forEach(cat => {
    const prof = getPartManufacturingProfile(cat.id, parts[cat.id], parts.magazine ? parts.magazine.capacity : 30);
    totalMaterialCost += prof.materialCost;
    totalWorkerPay += prof.workerPay;
    totalMfgHours += prof.mfgHours;
    totalMaterialGrams += prof.totalGrams;
    Object.entries(prof.materials).forEach(([mName, grams]) => {
      bomTotals[mName] = Number(((bomTotals[mName] || 0) + grams).toFixed(2));
    });
  });

  const capacity = parts.magazine.capacity || 30;
  const balance = computeBalancePoint(parts, capacity);

  const result = {
    parts,
    stats: finalStats,
    synergies,
    production: {
      materials: bomTotals,
      materialCost: Number(totalMaterialCost.toFixed(2)),
      workerPay: Number(totalWorkerPay.toFixed(2)),
      mfgHours: Number(totalMfgHours.toFixed(1)),
      totalGrams: Number(totalMaterialGrams.toFixed(2))
    },
    caliber: parts.receiver.caliberOverride || parts.platform.caliber,
    propulsion: parts.receiver.propulsion || parts.platform.propulsion,
    fireMode: parts.platform.fireMode,
    capacity,
    lengthMm,
    balance,
    velocityMs,
    adsMs,
    reloadSec,
    acousticDb,
    isSilenced,
    isEnergy: isCoilReceiver || isCoilBarrel,
    dps,
    ttkSec,
    spreadMoa,
    powerScore
  };

  if (metricsCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = metricsCache.keys().next().value;
    metricsCache.delete(oldestKey);
  }
  metricsCache.set(cacheKey, result);
  return result;
}