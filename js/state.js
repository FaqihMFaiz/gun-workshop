import { PRESETS } from './data/presets.js';

export const STORAGE_KEY = 'armorer_bench_saved_v7';
export const THEME_STORAGE_KEY = 'armorer_bench_theme_v1';
const VALID_THEMES = new Set(['paper', 'blueprint', 'dark']);

export const state = {
  weaponName: '5.45mm Modernized Piston Assault Rifle',
  activeCategory: 'platform',
  sidebarOpen: false,
  hoveredPartId: null,
  camoId: 'obsidian',
  furnitureCamoId: 'fde',
  twoToneEnabled: false,
  theme: 'paper',
  zoomLevel: 1,
  zoomPan: { x: 0, y: 0 },
  showBalancePoint: true,
  explodedView: false,
  showCallouts: true,
  tooltipMode: 'materials',
  audioEnabled: true,
  activeView: 'workbench',
  sidebarFilter: {
    query: '',
    compatibleOnly: false,
    sortBy: 'default'
  },
  history: {
    past: [],
    future: [],
    limit: 40
  },
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

export function createBuildSnapshot() {
  return {
    weaponName: state.weaponName,
    camoId: state.camoId,
    furnitureCamoId: state.furnitureCamoId,
    twoToneEnabled: state.twoToneEnabled,
    selectedParts: { ...state.selectedParts }
  };
}

export function applyBuildSnapshot(snap) {
  if (!snap || !snap.selectedParts) return;
  state.weaponName = typeof snap.weaponName === 'string' ? snap.weaponName : state.weaponName;
  state.camoId = snap.camoId || 'obsidian';
  state.furnitureCamoId = snap.furnitureCamoId || 'fde';
  state.twoToneEnabled = Boolean(snap.twoToneEnabled);
  state.selectedParts = { ...snap.selectedParts };
  state.hoveredPartId = null;
}

export function pushHistorySnapshot() {
  const snap = createBuildSnapshot();
  const top = state.history.past[state.history.past.length - 1];
  if (top && JSON.stringify(top) === JSON.stringify(snap)) return;
  state.history.past.push(snap);
  if (state.history.past.length > state.history.limit) {
    state.history.past.shift();
  }
  state.history.future = [];
}

export function undoBuild() {
  if (state.history.past.length === 0) return false;
  state.history.future.push(createBuildSnapshot());
  const prev = state.history.past.pop();
  applyBuildSnapshot(prev);
  return true;
}

export function redoBuild() {
  if (state.history.future.length === 0) return false;
  state.history.past.push(createBuildSnapshot());
  const next = state.history.future.pop();
  applyBuildSnapshot(next);
  return true;
}

export function loadThemePreference() {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && VALID_THEMES.has(stored)) {
      state.theme = stored;
    }
  } catch (e) {}
}

export function persistThemePreference() {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, state.theme);
  } catch (e) {}
}

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

// Hydrate saved builds & theme preference immediately on module load
loadSavedBuilds();
loadThemePreference();