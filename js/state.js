import { PRESETS } from './data/presets.js';

export const STORAGE_KEY = 'armorer_bench_saved_v7';

export const state = {
  weaponName: '5.45mm Modernized Piston Assault Rifle',
  activeCategory: 'platform',
  hoveredPartId: null,
  camoId: 'obsidian',
  explodedView: false,
  showCallouts: true,
  tooltipMode: 'materials',
  audioEnabled: true,
  activeView: 'workbench',
  selectedParts: { ...PRESETS.kalashnikov_ak12_zenit.parts },
  pinnedBuild: null,
  savedBuilds: [
    { name: '5.45mm Piston Assault Rifle', camo: 'obsidian', parts: { ...PRESETS.kalashnikov_ak12_zenit.parts } },
    { name: '5.56mm Tropical Service Rifle', camo: 'solarian', parts: { ...PRESETS.pindad_ss2_v1.parts } },
    { name: '7.62mm Forced-Air Cooled GPMG', camo: 'obsidian', parts: { ...PRESETS.pkp_pecheneg_lmg.parts } },
    { name: '9mm Roller-Delayed SMG', camo: 'obsidian', parts: { ...PRESETS.hk_mp5a3_smg.parts } }
  ],
  range: {
    distance: 50,
    ammo: 30,
    maxAmmo: 30,
    heat: 24,
    recoilStack: 0,
    shotsHit: 0,
    totalDamage: 0,
    impacts: [],
    selectedFireMode: 'AUTO',
    lastShotAt: 0
  }
};

export function loadSavedBuilds() {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        state.savedBuilds = parsed;
      }
    }
  } catch (e) {}
}

export function persistSavedBuilds() {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedBuilds));
  } catch (e) {}
}

// Hydrate saved builds immediately on module load
loadSavedBuilds();