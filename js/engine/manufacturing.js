import { MATERIAL_RATES } from '../data/catalog.js';

const mfgProfileCache = new WeakMap();

function setCachedProfile(part, cacheKey, profile) {
  let partCache = mfgProfileCache.get(part);
  if (!partCache) {
    partCache = new Map();
    mfgProfileCache.set(part, partCache);
  }
  partCache.set(cacheKey, profile);
  return profile;
}

export function getPartManufacturingProfile(category, part, magCapacity = 30) {
  if (!part) return { materials: {}, materialCost: 0, mfgHours: 0, workerPay: 0, totalGrams: 0 };
  const cacheKey = category === 'ammo' ? `ammo_${magCapacity}` : 'std';
  const existingCache = mfgProfileCache.get(part);
  if (existingCache && existingCache.has(cacheKey)) {
    return existingCache.get(cacheKey);
  }

  const wGrams = Math.max(0, Math.round((part.stats.weight || 0) * 1000));
  const materials = {};
  let mfgHours = 0;
  let hourlyRate = 34; // Skilled CNC machinist / armorer base wage ($/hr)

  const addMat = (name, grams) => {
    if (grams <= 0) return;
    materials[name] = Number(((materials[name] || 0) + grams).toFixed(2));
  };

  if (part.style === 'none' || (part.stats.cost === 0 && wGrams === 0)) {
    return setCachedProfile(part, cacheKey, { materials: {}, materialCost: 0, mfgHours: 0, workerPay: 0, totalGrams: 0 });
  }

  if (category === 'platform') {
    const billetFactor = 1.18; // Raw stock before CNC machining / stamping scrap
    const rawG = wGrams * billetFactor;
    if (part.shape === 'ak') {
      addMat('Carbon Steel', rawG * 0.62);
      addMat('Chromoly Steel', rawG * 0.22);
      addMat('Polymer', rawG * 0.16);
      mfgHours = 6.2; hourlyRate = 32;
    } else if (part.shape === 'bullpup') {
      addMat('Polymer', rawG * 0.44);
      addMat('7075-T6 Aluminum', rawG * 0.30);
      addMat('Chromoly Steel', rawG * 0.26);
      mfgHours = 7.4; hourlyRate = 36;
    } else if (part.shape === 'sniper') {
      addMat('Chromoly Steel', rawG * 0.56);
      addMat('7075-T6 Aluminum', rawG * 0.34);
      addMat('Carbon Fiber', rawG * 0.10);
      mfgHours = 12.5; hourlyRate = 44;
    } else if (part.shape === 'lmg') {
      addMat('Carbon Steel', rawG * 0.54);
      addMat('Chromoly Steel', rawG * 0.36);
      addMat('Polymer', rawG * 0.10);
      mfgHours = 11.2; hourlyRate = 38;
    } else if (part.shape === 'smg') {
      addMat('Carbon Steel', rawG * 0.42);
      addMat('Polymer', rawG * 0.38);
      addMat('7075-T6 Aluminum', rawG * 0.20);
      mfgHours = 5.4; hourlyRate = 35;
    } else if (part.shape === 'pistol') {
      addMat('Chromoly Steel', rawG * 0.55);
      addMat('Polymer', rawG * 0.38);
      addMat('Carbon Steel', rawG * 0.07);
      mfgHours = 3.2; hourlyRate = 34;
    } else if (part.shape === 'shotgun') {
      addMat('Chromoly Steel', rawG * 0.52);
      addMat('7075-T6 Aluminum', rawG * 0.28);
      addMat('Polymer', rawG * 0.20);
      mfgHours = 6.8; hourlyRate = 36;
    } else {
      // Direct-impingement / piston carbine
      addMat('7075-T6 Aluminum', rawG * 0.50);
      addMat('Chromoly Steel', rawG * 0.34);
      addMat('Polymer', rawG * 0.16);
      mfgHours = 6.5; hourlyRate = 36;
    }
  } else if (category === 'barrel') {
    const rawG = wGrams * 1.24; // Bar-stock drilling & rifling waste
    if (part.style === 'gauss_rail') {
      addMat('Copper / Brass', rawG * 0.46);
      addMat('Carbon Fiber', rawG * 0.26);
      addMat('Electronics / Li-Ion', rawG * 0.16);
      addMat('7075-T6 Aluminum', rawG * 0.12);
      mfgHours = 9.5; hourlyRate = 48;
    } else if (part.style === 'integral_sd') {
      addMat('Chromoly Steel', rawG * 0.62);
      addMat('Titanium / Inconel', rawG * 0.38);
      mfgHours = 5.8; hourlyRate = 42;
    } else if (part.style === 'carbon') {
      addMat('Chromoly Steel', rawG * 0.68);
      addMat('Carbon Fiber', rawG * 0.32);
      mfgHours = 4.6; hourlyRate = 40;
    } else if (part.style === 'lmg_heavy' || part.style === 'lmg_pecheneg') {
      addMat('Chromoly Steel', rawG * 0.82);
      addMat('Carbon Steel', rawG * 0.18);
      mfgHours = 6.4; hourlyRate = 38;
    } else {
      addMat('Chromoly Steel', rawG * 0.90);
      addMat('Carbon Steel', rawG * 0.10);
      mfgHours = part.lengthMm >= 500 ? 4.8 : 3.4; hourlyRate = 38;
    }
  } else if (category === 'receiver') {
    const rawG = wGrams * 1.22;
    if (part.id.includes('capacitor')) {
      addMat('Electronics / Li-Ion', rawG * 0.54);
      addMat('Copper / Brass', rawG * 0.24);
      addMat('7075-T6 Aluminum', rawG * 0.22);
      mfgHours = 8.8; hourlyRate = 48;
    } else if (part.id === 'rec_arcane_matrix') {
      addMat('Chromoly Steel', rawG * 0.88);
      addMat('Carbon Steel', rawG * 0.12);
      mfgHours = 7.6; hourlyRate = 45;
    } else if (part.id.includes('belt')) {
      addMat('Carbon Steel', rawG * 0.65);
      addMat('Chromoly Steel', rawG * 0.35);
      mfgHours = 6.5; hourlyRate = 38;
    } else if (part.id === 'rec_shotgun_12ga') {
      addMat('7075-T6 Aluminum', rawG * 0.50);
      addMat('Chromoly Steel', rawG * 0.42);
      addMat('Carbon Steel', rawG * 0.08);
      mfgHours = 4.6; hourlyRate = 38;
    } else {
      addMat('7075-T6 Aluminum', rawG * 0.52);
      addMat('Chromoly Steel', rawG * 0.48);
      mfgHours = 4.2; hourlyRate = 38;
    }
  } else if (category === 'gripStock') {
    const rawG = Math.max(80, wGrams * 1.10);
    if (part.style === 'zenitco' || part.style === 'skeleton') {
      addMat('7075-T6 Aluminum', rawG * 0.78);
      addMat('Carbon Steel', rawG * 0.12);
      addMat('Polymer', rawG * 0.10);
      mfgHours = 2.6; hourlyRate = 36;
    } else if (part.style === 'mp5_wire' || part.style === 'lmg_para') {
      addMat('Carbon Steel', rawG * 0.72);
      addMat('Polymer', rawG * 0.28);
      mfgHours = 2.9; hourlyRate = 35;
    } else if (part.style === 'precision') {
      addMat('Polymer', rawG * 0.56);
      addMat('7075-T6 Aluminum', rawG * 0.34);
      addMat('Carbon Steel', rawG * 0.10);
      mfgHours = 2.4; hourlyRate = 34;
    } else {
      addMat('Polymer', rawG * 0.84);
      addMat('Carbon Steel', rawG * 0.16);
      mfgHours = 0.85; hourlyRate = 28;
    }
  } else if (category === 'magazine') {
    const rawG = Math.max(90, wGrams * 1.08);
    if (part.style === 'energy_cell') {
      addMat('Electronics / Li-Ion', rawG * 0.68);
      addMat('Polymer', rawG * 0.24);
      addMat('Copper / Brass', rawG * 0.08);
      mfgHours = 2.2; hourlyRate = 42;
    } else if (part.style === 'shotgun_tube') {
      addMat('Chromoly Steel', rawG * 0.78);
      addMat('Carbon Steel', rawG * 0.14);
      addMat('Polymer', rawG * 0.08);
      mfgHours = 1.2; hourlyRate = 32;
    } else if (part.style === 'lmg_box') {
      addMat('Carbon Steel', rawG * 0.52);
      addMat('Polymer', rawG * 0.48);
      mfgHours = 1.9; hourlyRate = 30;
    } else if (part.style === 'drum') {
      addMat('Polymer', rawG * 0.64);
      addMat('Carbon Steel', rawG * 0.36);
      mfgHours = 1.65; hourlyRate = 32;
    } else {
      addMat('Polymer', rawG * 0.76);
      addMat('Carbon Steel', rawG * 0.24);
      mfgHours = 0.45; hourlyRate = 26;
    }
  } else if (category === 'ammo') {
    // Dynamically scaled to the equipped magazine/belt capacity (e.g., 18, 20, 30, 45, 60, 100, or 200 rounds)
    const rds = Math.max(1, magCapacity || 30);
    if (part.id === 'ammo_m995_7n39_ap') {
      addMat('Copper / Brass', 7.22 * rds);
      addMat('Tungsten Carbide', 2.08 * rds);
      addMat('Gunpowder', 1.62 * rds);
      mfgHours = 0.025 * rds; hourlyRate = 34;
    } else if (part.id === 'ammo_mk262_otm') {
      addMat('Copper / Brass', 7.60 * rds);
      addMat('Lead Core', 4.15 * rds);
      addMat('Gunpowder', 1.58 * rds);
      mfgHours = 0.020 * rds; hourlyRate = 32;
    } else if (part.id === 'ammo_federal_jhp') {
      addMat('Copper / Brass', 6.47 * rds);
      addMat('Lead Core', 4.76 * rds);
      addMat('Gunpowder', 0.56 * rds);
      mfgHours = 0.013 * rds; hourlyRate = 28;
    } else if (part.id === 'ammo_sp6_subsonic') {
      addMat('Copper / Brass', 6.93 * rds);
      addMat('Carbon Steel', 5.20 * rds);
      addMat('Lead Core', 3.73 * rds);
      addMat('Gunpowder', 0.71 * rds);
      mfgHours = 0.022 * rds; hourlyRate = 34;
    } else if (part.id === 'ammo_12ga_buckshot') {
      addMat('Polymer', 3.80 * rds);
      addMat('Copper / Brass', 2.70 * rds);
      addMat('Lead Core', 28.50 * rds);
      addMat('Gunpowder', 1.65 * rds);
      mfgHours = 0.018 * rds; hourlyRate = 28;
    } else if (part.id === 'ammo_12ga_flechette') {
      addMat('Polymer', 3.60 * rds);
      addMat('Copper / Brass', 2.70 * rds);
      addMat('Tungsten Carbide', 7.28 * rds);
      addMat('Gunpowder', 1.72 * rds);
      mfgHours = 0.026 * rds; hourlyRate = 30;
    } else if (part.id === 'ammo_ferro_armature') {
      addMat('Carbon Steel', 8.50 * rds);
      addMat('Copper / Brass', 0.25 * rds);
      mfgHours = 0.028 * rds; hourlyRate = 34;
    } else {
      addMat('Copper / Brass', 7.13 * rds);
      addMat('Carbon Steel', 1.14 * rds);
      addMat('Lead Core', 2.82 * rds);
      addMat('Gunpowder', 1.65 * rds);
      mfgHours = 0.012 * rds; hourlyRate = 26;
    }
  } else if (category === 'sight') {
    const rawG = Math.max(50, wGrams * 1.12);
    if (part.style === 'irons') {
      addMat('Carbon Steel', rawG * 0.96);
      addMat('Tritium / Phosphor', 0.04); // Trace luminous tritium vial
      mfgHours = 0.9; hourlyRate = 34;
    } else if (part.style === 'thermal') {
      addMat('7075-T6 Aluminum', rawG * 0.45);
      addMat('Electronics / Li-Ion', rawG * 0.35);
      addMat('Optical Glass', rawG * 0.20);
      mfgHours = 9.2; hourlyRate = 52;
    } else if (part.style === 'sniper_scope' || part.style === 'acog' || part.style === 'pso1') {
      addMat('7075-T6 Aluminum', rawG * 0.64);
      addMat('Optical Glass', rawG * 0.28);
      addMat('Carbon Steel', rawG * 0.08);
      if (part.style === 'acog') addMat('Tritium / Phosphor', 0.06);
      mfgHours = part.style === 'sniper_scope' ? 7.8 : 5.2; hourlyRate = 46;
    } else {
      addMat('7075-T6 Aluminum', rawG * 0.58);
      addMat('Electronics / Li-Ion', rawG * 0.26);
      addMat('Optical Glass', rawG * 0.16);
      mfgHours = 3.6; hourlyRate = 44;
    }
  } else if (category === 'muzzle') {
    const rawG = Math.max(60, wGrams * 1.25);
    if (part.style === 'suppressor' || part.style === 'pbs1') {
      addMat('Titanium / Inconel', rawG * 0.64);
      addMat('Chromoly Steel', rawG * 0.36);
      mfgHours = 5.4; hourlyRate = 44;
    } else if (part.style === 'flux_choke') {
      addMat('Copper / Brass', rawG * 0.50);
      addMat('Electronics / Li-Ion', rawG * 0.28);
      addMat('7075-T6 Aluminum', rawG * 0.22);
      mfgHours = 3.8; hourlyRate = 46;
    } else {
      addMat('Chromoly Steel', rawG);
      mfgHours = 1.1; hourlyRate = 34;
    }
  } else if (category === 'underbarrel') {
    const rawG = Math.max(50, wGrams * 1.15);
    if (part.style.startsWith('ubgl')) {
      addMat('7075-T6 Aluminum', rawG * 0.52);
      addMat('Chromoly Steel', rawG * 0.34);
      addMat('Polymer', rawG * 0.14);
      mfgHours = 7.2; hourlyRate = 40;
    } else if (part.style.startsWith('bayonet')) {
      addMat('Carbon Steel', rawG * 0.72);
      addMat('Polymer', rawG * 0.28);
      mfgHours = 2.1; hourlyRate = 32;
    } else if (part.style.startsWith('laser') || part.style.startsWith('wml')) {
      addMat('7075-T6 Aluminum', rawG * 0.52);
      addMat('Electronics / Li-Ion', rawG * 0.36);
      addMat('Optical Glass', rawG * 0.12);
      mfgHours = part.style.startsWith('laser') ? 4.8 : 2.2; hourlyRate = 44;
    } else if (part.style.startsWith('bipod')) {
      addMat('Carbon Steel', rawG * 0.62);
      addMat('7075-T6 Aluminum', rawG * 0.30);
      addMat('Polymer', rawG * 0.08);
      mfgHours = 2.4; hourlyRate = 34;
    } else if (part.style === 'shooting_rest') {
      addMat('Nylon / Canvas', rawG * 0.22);
      addMat('Polymer', rawG * 0.78); // Heavy polymer bead fill
      mfgHours = 0.75; hourlyRate = 24;
    } else {
      addMat('Polymer', rawG * 0.85);
      addMat('Carbon Steel', rawG * 0.15);
      mfgHours = 0.45; hourlyRate = 26;
    }
  } else if (category === 'sling') {
    const rawG = Math.max(150, wGrams * 1.05);
    addMat('Nylon / Canvas', rawG * 0.76);
    addMat('Carbon Steel', rawG * 0.24);
    mfgHours = 0.55; hourlyRate = 24;
  }

  let materialCost = 0;
  let totalGrams = 0;
  Object.entries(materials).forEach(([matName, g]) => {
    totalGrams += g;
    materialCost += g * (MATERIAL_RATES[matName] || 0.015);
  });

  const workerPay = Number((mfgHours * hourlyRate).toFixed(2));
  const res = {
    materials,
    materialCost: Number(materialCost.toFixed(2)),
    mfgHours: Number(mfgHours.toFixed(2)),
    workerPay,
    totalGrams: Number(totalGrams.toFixed(2)),
    rounds: category === 'ammo' ? magCapacity : null
  };
  return setCachedProfile(part, cacheKey, res);
}