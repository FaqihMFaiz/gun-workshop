import { CATEGORIES, CAMO_FINISHES, PARTS_DB } from './data/catalog.js';
import { PRESETS } from './data/presets.js';
import {
  state,
  persistSavedBuilds,
  persistThemePreference,
  pushHistorySnapshot,
  undoBuild,
  redoBuild
} from './state.js';
import { playMechanicalClick, playReloadSound } from './audio.js';
import { getPartById, clamp } from './engine/utils.js';
import { checkPartCompatibility, autoResolveIncompatibilities } from './engine/compatibility.js';
import { computeBuildMetrics } from './engine/ballistics.js';
import { renderWeaponSVG } from './ui/svgRenderer.js';
import {
  renderThemeAndControls,
  renderComponentSidebar,
  renderCamoSelector,
  renderPartsList,
  renderQuickLoadoutStrip,
  renderTelemetryAndDeltas,
  renderSavedBuildsList
} from './ui/uiRenderer.js';
import { renderRangeCanvas, triggerSingleShot, initRangeEvents } from './ui/firingRange.js';
import { initTooltipController } from './ui/tooltip.js';
import { downloadBlueprintSVG, downloadBlueprintPNG, printSpecSheet } from './ui/blueprintExport.js';
import { decodeBuildFromHash, buildShareableUrl } from './engine/shareUrl.js';
import { renderPresetRackModal, renderComparisonModal } from './ui/modals.js';

export function renderAll() {
  const currentMetrics = computeBuildMetrics(state.selectedParts);

  let previewMetrics = null;
  if (state.hoveredPartId && state.hoveredPartId !== state.selectedParts[state.activeCategory]) {
    const tempSelection = {
      ...state.selectedParts,
      [state.activeCategory]: state.hoveredPartId
    };
    previewMetrics = computeBuildMetrics(tempSelection);
  }

  renderThemeAndControls();
  renderComponentSidebar();
  renderCamoSelector();
  renderPartsList();
  renderWeaponSVG(previewMetrics || currentMetrics);
  renderQuickLoadoutStrip(currentMetrics);
  renderTelemetryAndDeltas(currentMetrics, previewMetrics);
  renderSavedBuildsList();
  renderRangeCanvas(currentMetrics);
}

function syncAfterBuildRestore(computed) {
  const nameInput = document.getElementById('custom-weapon-name');
  if (nameInput) nameInput.value = state.weaponName;
  state.range.ammo = computed.capacity;
  state.range.maxAmmo = computed.capacity;
  state.range.recoilStack = 0;
  state.range.shotsFired = 0;
  state.range.shotsHit = 0;
  state.range.totalDamage = 0;
  state.range.lastPenResult = null;
  state.range.impacts = [];
}

function openModalById(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('hidden');
  el.classList.add('flex');
}

function closeModalById(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (el.classList.contains('hidden')) return false;
  el.classList.add('hidden');
  el.classList.remove('flex');
  return true;
}

function loadPresetByKey(key) {
  if (!key || !PRESETS[key]) return false;
  pushHistorySnapshot();
  const p = PRESETS[key];
  state.weaponName = p.name;
  state.camoId = p.camo;
  state.twoToneEnabled = false;
  state.selectedParts = { ...p.parts };
  state.hoveredPartId = null;
  const updated = computeBuildMetrics(state.selectedParts);
  syncAfterBuildRestore(updated);
  playMechanicalClick(490);
  renderAll();
  return true;
}

function hydrateSharedUrlBuild(pushHistory = false) {
  if (typeof window === 'undefined') return false;
  const raw = window.location.hash || window.location.search || '';
  if (!raw.includes('build=')) return false;
  const decoded = decodeBuildFromHash(raw);
  if (!decoded) return false;
  if (pushHistory) pushHistorySnapshot();
  state.weaponName = decoded.weaponName;
  state.camoId = decoded.camoId;
  state.furnitureCamoId = decoded.furnitureCamoId;
  state.twoToneEnabled = decoded.twoToneEnabled;
  state.selectedParts = { ...decoded.parts };
  state.hoveredPartId = null;
  syncAfterBuildRestore(computeBuildMetrics(state.selectedParts));
  return true;
}

function cycleSidebarSlot(delta) {
  const idx = Math.max(0, CATEGORIES.findIndex(c => c.id === state.activeCategory));
  const nextIdx = (idx + delta + CATEGORIES.length) % CATEGORIES.length;
  state.activeCategory = CATEGORIES[nextIdx].id;
  state.sidebarOpen = true;
  state.hoveredPartId = null;
  state.sidebarFilter.query = '';
  const toast = document.getElementById('incompat-toast');
  if (toast) toast.classList.add('hidden');
  playMechanicalClick(delta > 0 ? 630 : 590);
  renderAll();
}

function performUndo() {
  if (!undoBuild()) return;
  const updated = computeBuildMetrics(state.selectedParts);
  syncAfterBuildRestore(updated);
  playMechanicalClick(420);
  renderAll();
}

function performRedo() {
  if (!redoBuild()) return;
  const updated = computeBuildMetrics(state.selectedParts);
  syncAfterBuildRestore(updated);
  playMechanicalClick(560);
  renderAll();
}

function applyPlatformDefaults(partId) {
  if (partId === 'plat_arc_pistol') {
    state.selectedParts.gripStock = 'stk_no_stock';
    state.selectedParts.magazine = 'mag_pistol_15';
    state.selectedParts.barrel = 'bar_pistol_5';
    state.selectedParts.receiver = 'rec_pistol_striker';
    state.selectedParts.sight = 'sgt_rmr_micro';
    state.selectedParts.ammo = 'ammo_plus_p';
    state.selectedParts.muzzle = 'muz_pistol_micro_comp';
    state.selectedParts.underbarrel = 'ub_tlr1_hl';
    state.selectedParts.sling = 'slg_pistol_lanyard';
  } else if (partId === 'plat_shotgun' || partId === 'plat_pump_shotgun') {
    state.selectedParts.barrel = partId === 'plat_pump_shotgun' ? 'bar_shotgun_14' : 'bar_shotgun_18';
    state.selectedParts.receiver = partId === 'plat_pump_shotgun' ? 'rec_pump_shotgun' : 'rec_shotgun_12ga';
    state.selectedParts.magazine = partId === 'plat_pump_shotgun' ? 'mag_shotgun_tube5' : 'mag_shotgun_tube8';
    state.selectedParts.ammo = 'ammo_12ga_buckshot';
    state.selectedParts.muzzle = partId === 'plat_pump_shotgun' ? 'muz_breacher_choke' : 'muz_thread_cap';
  } else if (partId === 'plat_battle_rifle') {
    state.selectedParts.receiver = 'rec_battle_762';
    state.selectedParts.barrel = 'bar_standard_14';
    state.selectedParts.magazine = 'mag_fast_20';
    state.selectedParts.ammo = 'ammo_m855a1_fmj';
  } else if (partId === 'plat_amr_50') {
    state.selectedParts.receiver = 'rec_battle_762';
    state.selectedParts.barrel = 'bar_amr_29';
    state.selectedParts.magazine = 'mag_sniper_10';
    state.selectedParts.gripStock = 'stk_prs_precision';
    state.selectedParts.sight = 'sgt_sniper_5_25';
    state.selectedParts.ammo = 'ammo_slap_sabot';
    state.selectedParts.muzzle = 'muz_heavy_brake';
  } else if (partId === 'plat_pdw_57') {
    state.selectedParts.receiver = 'rec_hk_roller_9';
    state.selectedParts.barrel = 'bar_sbr_115';
    state.selectedParts.magazine = 'mag_pdw_50';
    state.selectedParts.gripStock = 'stk_pdw_twinrod';
    state.selectedParts.sight = 'sgt_rmr_micro';
    state.selectedParts.ammo = 'ammo_m995_7n39_ap';
  } else if (partId === 'plat_revolver') {
    state.selectedParts.receiver = 'rec_pistol_striker';
    state.selectedParts.barrel = 'bar_pistol_5';
    state.selectedParts.magazine = 'mag_revolver_6';
    state.selectedParts.gripStock = 'stk_wood_fixed';
    state.selectedParts.sight = 'sgt_irons';
    state.selectedParts.ammo = 'ammo_plus_p';
    state.selectedParts.muzzle = 'muz_pistol_micro_comp';
    state.selectedParts.underbarrel = 'ub_none';
    state.selectedParts.sling = 'slg_pistol_lanyard';
  } else if (partId === 'plat_lever_action') {
    state.selectedParts.receiver = 'rec_straight_pull';
    state.selectedParts.barrel = 'bar_pencil_16';
    state.selectedParts.magazine = 'mag_shotgun_tube5';
    state.selectedParts.gripStock = 'stk_monte_carlo';
    state.selectedParts.ammo = 'ammo_tracer_api';
    state.selectedParts.muzzle = 'muz_linear_comp';
  } else if (partId === 'plat_sniper_dmr') {
    state.selectedParts.receiver = 'rec_arcane_matrix';
    state.selectedParts.barrel = 'bar_sniper_26';
    state.selectedParts.magazine = 'mag_sniper_10';
    state.selectedParts.gripStock = 'stk_prs_precision';
    state.selectedParts.sight = 'sgt_sniper_5_25';
  } else if (partId === 'plat_smg_pdw') {
    state.selectedParts.receiver = 'rec_hyperburst_9';
    state.selectedParts.barrel = 'bar_mp5_225';
    state.selectedParts.magazine = 'mag_smg_30';
    state.selectedParts.ammo = 'ammo_federal_jhp';
    state.selectedParts.muzzle = 'muz_comp_pro';
  } else if (partId === 'plat_ak_series') {
    state.selectedParts.receiver = 'rec_kalashnikov_stamped';
    state.selectedParts.barrel = 'bar_ak_415';
    state.selectedParts.magazine = 'mag_bakelite_30';
    state.selectedParts.gripStock = 'stk_zenitco_pt1';
  } else if (partId === 'plat_pindad_ss2') {
    state.selectedParts.barrel = 'bar_ak_415';
    state.selectedParts.gripStock = 'stk_skeleton_fold';
  } else if (partId === 'plat_qbz_95') {
    state.selectedParts.receiver = 'rec_norinco_58';
    state.selectedParts.magazine = 'mag_bakelite_30';
    state.selectedParts.gripStock = 'stk_bullpup_chassis';
  } else if (partId === 'plat_svd_dragunov') {
    state.selectedParts.barrel = 'bar_rpk_590';
    state.selectedParts.sight = 'sgt_pso1_4x';
    state.selectedParts.gripStock = 'stk_hera_cqr';
  } else if (partId === 'plat_lmg') {
    state.selectedParts.barrel = 'bar_m249_18';
    state.selectedParts.receiver = 'rec_m249_belt';
    state.selectedParts.gripStock = 'stk_m249_para';
    state.selectedParts.magazine = 'mag_saw_200';
    state.selectedParts.muzzle = 'muz_lmg_slotted';
  } else if (partId === 'plat_pkp_lmg') {
    state.selectedParts.barrel = 'bar_pkp_658';
    state.selectedParts.receiver = 'rec_pkp_belt';
    state.selectedParts.gripStock = 'stk_m249_para';
    state.selectedParts.magazine = 'mag_pkp_100';
    state.selectedParts.muzzle = 'muz_lmg_slotted';
  } else if (partId === 'plat_mp5_smg' || partId === 'plat_vityaz_smg') {
    state.selectedParts.barrel = 'bar_mp5_225';
    state.selectedParts.receiver = 'rec_hk_roller_9';
    state.selectedParts.gripStock = partId === 'plat_mp5_smg' ? 'stk_mp5_retract' : 'stk_zenitco_pt1';
    state.selectedParts.magazine = 'mag_smg_30';
    state.selectedParts.muzzle = 'muz_smg_3lug';
    state.selectedParts.ammo = 'ammo_federal_jhp';
  }
}

function initApp() {
  hydrateSharedUrlBuild(false);

  const initialComputed = computeBuildMetrics(state.selectedParts);
  state.range.ammo = initialComputed.capacity;
  state.range.maxAmmo = initialComputed.capacity;

  const nameInput = document.getElementById('custom-weapon-name');
  if (nameInput) nameInput.value = state.weaponName;

  renderAll();
  initTooltipController();
  initRangeEvents();

  window.addEventListener('hashchange', () => {
    if (hydrateSharedUrlBuild(true)) {
      playMechanicalClick(520);
      renderAll();
    }
  });

  let suppressNextSlotClick = false;

  // Delegated click handlers
  document.body.addEventListener('click', (e) => {
    if (e.target.closest('#btn-close-sidebar') || e.target.id === 'sidebar-mobile-backdrop') {
      state.sidebarOpen = false;
      state.hoveredPartId = null;
      playMechanicalClick(480);
      renderAll();
      return;
    }

    const collapseBtn = e.target.closest('[data-collapse-toggle]');
    if (collapseBtn) {
      const key = collapseBtn.getAttribute('data-collapse-toggle');
      if (key && state.collapsedSections && key in state.collapsedSections) {
        state.collapsedSections[key] = !state.collapsedSections[key];
        playMechanicalClick(510);
        renderThemeAndControls();
      }
      return;
    }

    const rackCatBtn = e.target.closest('[data-rack-cat]');
    if (rackCatBtn) {
      state.presetRackCategory = rackCatBtn.getAttribute('data-rack-cat') || 'All';
      playMechanicalClick(540);
      renderPresetRackModal();
      return;
    }

    const rackPresetBtn = e.target.closest('[data-rack-preset]');
    if (rackPresetBtn) {
      const key = rackPresetBtn.getAttribute('data-rack-preset');
      if (loadPresetByKey(key)) {
        closeModalById('preset-rack-modal');
      }
      return;
    }

    if (e.target.closest('#btn-prev-slot')) {
      cycleSidebarSlot(-1);
      return;
    }

    if (e.target.closest('#btn-next-slot')) {
      cycleSidebarSlot(1);
      return;
    }

    if (e.target.closest('#btn-reset-sidebar-filters')) {
      state.sidebarFilter = { query: '', compatibleOnly: false, sortBy: 'default' };
      playMechanicalClick(510);
      renderComponentSidebar();
      renderPartsList();
      return;
    }

    if (e.target.closest('#btn-undo')) {
      performUndo();
      return;
    }

    if (e.target.closest('#btn-redo')) {
      performRedo();
      return;
    }

    if (e.target.closest('#btn-toggle-twotone')) {
      pushHistorySnapshot();
      state.twoToneEnabled = !state.twoToneEnabled;
      playMechanicalClick(540);
      renderAll();
      return;
    }

    const furnCamoBtn = e.target.closest('[data-furniture-camo-id]');
    if (furnCamoBtn) {
      const nextId = furnCamoBtn.getAttribute('data-furniture-camo-id');
      if (nextId && (nextId !== state.furnitureCamoId || !state.twoToneEnabled)) {
        pushHistorySnapshot();
        state.furnitureCamoId = nextId;
        state.twoToneEnabled = true;
        playMechanicalClick(540);
        renderAll();
      }
      return;
    }

    const zoomBtn = e.target.closest('[data-zoom-level]');
    if (zoomBtn) {
      const nextZoom = Number(zoomBtn.getAttribute('data-zoom-level')) || 1;
      state.zoomLevel = nextZoom;
      if (nextZoom === 1) state.zoomPan = { x: 0, y: 0 };
      playMechanicalClick(580);
      renderThemeAndControls();
      renderWeaponSVG(computeBuildMetrics(state.selectedParts));
      return;
    }

    if (e.target.closest('#btn-toggle-cog')) {
      state.showBalancePoint = !state.showBalancePoint;
      playMechanicalClick(550);
      renderThemeAndControls();
      renderWeaponSVG(computeBuildMetrics(state.selectedParts));
      return;
    }

    const catBtn = e.target.closest('[data-category-btn]');
    if (catBtn) {
      const nextCat = catBtn.getAttribute('data-category-btn');
      if (nextCat !== state.activeCategory) state.sidebarFilter.query = '';
      state.activeCategory = nextCat;
      state.sidebarOpen = true;
      state.hoveredPartId = null;
      const toast = document.getElementById('incompat-toast');
      if (toast) toast.classList.add('hidden');
      playMechanicalClick(610);
      renderAll();
      return;
    }

    const svgSlot = e.target.closest('[data-slot]');
    if (svgSlot) {
      if (suppressNextSlotClick) {
        suppressNextSlotClick = false;
        return;
      }
      const nextCat = svgSlot.getAttribute('data-slot');
      if (nextCat !== state.activeCategory) state.sidebarFilter.query = '';
      state.activeCategory = nextCat;
      state.sidebarOpen = true;
      state.hoveredPartId = null;
      const toast = document.getElementById('incompat-toast');
      if (toast) toast.classList.add('hidden');
      playMechanicalClick(640);
      renderAll();
      return;
    }

    const partCard = e.target.closest('[data-part-card]');
    if (partCard) {
      const partId = partCard.getAttribute('data-part-card');
      const candPart = getPartById(state.activeCategory, partId);
      const compat = checkPartCompatibility(state.activeCategory, candPart, state.selectedParts);
      const toast = document.getElementById('incompat-toast');

      if (!compat.compatible) {
        playMechanicalClick(155);
        if (toast) {
          toast.textContent = `Cannot install ${candPart.name}: ${compat.reason}`;
          toast.classList.remove('hidden');
        }
        return;
      }
      if (toast) toast.classList.add('hidden');

      pushHistorySnapshot();
      state.selectedParts[state.activeCategory] = partId;
      if (state.activeCategory === 'platform') {
        applyPlatformDefaults(partId);
      }

      const autoSwaps = autoResolveIncompatibilities(state.selectedParts);
      if (autoSwaps.length > 0 && toast) {
        toast.textContent = `Auto-adjusted incompatible slots: ${autoSwaps.join(' | ')}`;
        toast.classList.remove('hidden');
      }
      state.hoveredPartId = null;
      const updated = computeBuildMetrics(state.selectedParts);
      state.range.ammo = updated.capacity;
      state.range.maxAmmo = updated.capacity;
      state.range.recoilStack = 0;
      playMechanicalClick(460);
      renderAll();
      return;
    }

    const camoBtn = e.target.closest('[data-camo-id]');
    if (camoBtn) {
      const nextCamo = camoBtn.getAttribute('data-camo-id');
      if (nextCamo && nextCamo !== state.camoId) {
        pushHistorySnapshot();
        state.camoId = nextCamo;
        playMechanicalClick(540);
        renderAll();
      }
      return;
    }

    const loadIdxBtn = e.target.closest('[data-load-saved]');
    if (loadIdxBtn) {
      const idx = Number(loadIdxBtn.getAttribute('data-load-saved'));
      const saved = state.savedBuilds[idx];
      if (saved) {
        pushHistorySnapshot();
        state.weaponName = saved.name;
        state.camoId = saved.camo || 'obsidian';
        state.furnitureCamoId = saved.furnitureCamo || 'fde';
        state.twoToneEnabled = Boolean(saved.twoTone);
        state.selectedParts = { ...saved.parts };
        const updated = computeBuildMetrics(state.selectedParts);
        syncAfterBuildRestore(updated);
        playMechanicalClick(500);
        renderAll();
      }
      return;
    }

    const delIdxBtn = e.target.closest('[data-delete-saved]');
    if (delIdxBtn) {
      const idx = Number(delIdxBtn.getAttribute('data-delete-saved'));
      state.savedBuilds.splice(idx, 1);
      persistSavedBuilds();
      renderSavedBuildsList();
    }
  });

  // Sidebar search, compatible-only & sort listeners
  const searchInput = document.getElementById('sidebar-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.sidebarFilter.query = e.target.value || '';
      state.hoveredPartId = null;
      renderPartsList();
    });
  }

  const compatToggle = document.getElementById('sidebar-compat-toggle');
  if (compatToggle) {
    compatToggle.addEventListener('change', (e) => {
      state.sidebarFilter.compatibleOnly = Boolean(e.target.checked);
      state.hoveredPartId = null;
      playMechanicalClick(520);
      renderPartsList();
    });
  }

  const sortSelect = document.getElementById('sidebar-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sidebarFilter.sortBy = e.target.value || 'default';
      playMechanicalClick(520);
      renderPartsList();
    });
  }

  // Catalog row hover live stat & SVG preview
  const partsContainer = document.getElementById('parts-list-container');
  partsContainer.addEventListener('mouseover', (e) => {
    const card = e.target.closest('[data-part-card]');
    const isIncompat = card && card.getAttribute('data-incompatible') === 'true';
    const rawId = card ? card.getAttribute('data-part-card') : null;
    const equippedId = state.selectedParts[state.activeCategory];
    const id = (card && !isIncompat && rawId !== equippedId) ? rawId : null;
    if (id !== state.hoveredPartId) {
      state.hoveredPartId = id;
      const currentMetrics = computeBuildMetrics(state.selectedParts);
      const previewMetrics = id
        ? computeBuildMetrics({ ...state.selectedParts, [state.activeCategory]: id })
        : null;
      renderTelemetryAndDeltas(currentMetrics, previewMetrics);
      renderWeaponSVG(previewMetrics || currentMetrics);
    }
  });

  partsContainer.addEventListener('mouseleave', () => {
    if (state.hoveredPartId) {
      state.hoveredPartId = null;
      const currentMetrics = computeBuildMetrics(state.selectedParts);
      renderTelemetryAndDeltas(currentMetrics, null);
      renderWeaponSVG(currentMetrics);
    }
  });

  // Zoom pan drag & double-click reset on drafting stage wrapper
  const svgWrapper = document.getElementById('gun-svg-wrapper');
  if (svgWrapper) {
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let origPanX = 0;
    let origPanY = 0;

    svgWrapper.addEventListener('mousedown', (e) => {
      if ((state.zoomLevel || 1) <= 1 || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      origPanX = state.zoomPan.x;
      origPanY = state.zoomPan.y;
      svgWrapper.classList.add('is-panning');
    });

    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.hypot(dx, dy) > 4) moved = true;
      if (!moved) return;
      const zoom = Number(state.zoomLevel) || 1;
      const scaleX = (920 / zoom) / Math.max(200, svgWrapper.clientWidth);
      const scaleY = (380 / zoom) / Math.max(150, svgWrapper.clientHeight);
      const maxPanX = (920 - 920 / zoom) / 2;
      const maxPanY = (380 - 380 / zoom) / 2;
      state.zoomPan = {
        x: clamp(origPanX + dx * scaleX, -maxPanX, maxPanX),
        y: clamp(origPanY + dy * scaleY, -maxPanY, maxPanY)
      };
      renderWeaponSVG(computeBuildMetrics(state.selectedParts));
    });

    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      svgWrapper.classList.remove('is-panning');
      if (moved) {
        suppressNextSlotClick = true;
        setTimeout(() => { suppressNextSlotClick = false; }, 50);
      }
    });

    svgWrapper.addEventListener('dblclick', () => {
      if ((state.zoomLevel || 1) > 1) {
        state.zoomLevel = 1;
        state.zoomPan = { x: 0, y: 0 };
        playMechanicalClick(500);
        renderThemeAndControls();
        renderWeaponSVG(computeBuildMetrics(state.selectedParts));
      }
    });
  }

  // Weapon designation input
  document.getElementById('custom-weapon-name').addEventListener('input', (e) => {
    state.weaponName = e.target.value || 'Custom Real-World Build';
  });

  // Theme switcher
  const themeSelect = document.getElementById('theme-selector');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      state.theme = e.target.value || 'paper';
      persistThemePreference();
      playMechanicalClick(540);
      renderAll();
    });
  }

  // Preset loader
  document.getElementById('preset-selector').addEventListener('change', (e) => {
    const key = e.target.value;
    if (loadPresetByKey(key)) {
      e.target.value = '';
    }
  });

  // Visual Armory Preset Rack modal
  document.getElementById('btn-open-preset-rack')?.addEventListener('click', () => {
    playMechanicalClick(560);
    renderPresetRackModal();
    openModalById('preset-rack-modal');
  });
  document.getElementById('btn-close-preset-rack')?.addEventListener('click', () => {
    closeModalById('preset-rack-modal');
  });
  document.getElementById('preset-rack-search')?.addEventListener('input', (e) => {
    state.presetRackQuery = e.target.value || '';
    renderPresetRackModal();
  });

  // Randomize build
  document.getElementById('btn-randomize').addEventListener('click', () => {
    pushHistorySnapshot();
    const plats = PARTS_DB.platform;
    state.selectedParts.platform = plats[Math.floor(Math.random() * plats.length)].id;
    CATEGORIES.forEach(cat => {
      if (cat.id === 'platform') return;
      const valid = (PARTS_DB[cat.id] || []).filter(p => checkPartCompatibility(cat.id, p, state.selectedParts).compatible);
      const pool = valid.length ? valid : PARTS_DB[cat.id];
      state.selectedParts[cat.id] = pool[Math.floor(Math.random() * pool.length)].id;
    });
    autoResolveIncompatibilities(state.selectedParts);
    const randomCamo = CAMO_FINISHES[Math.floor(Math.random() * CAMO_FINISHES.length)];
    const randomFurn = CAMO_FINISHES[Math.floor(Math.random() * CAMO_FINISHES.length)];
    state.camoId = randomCamo.id;
    state.furnitureCamoId = randomFurn.id;
    state.twoToneEnabled = Math.random() < 0.35;
    const platName = getPartById('platform', state.selectedParts.platform).name.split(' ')[0];
    state.weaponName = `${platName} Custom Mod-${Math.floor(10 + Math.random() * 89)}`;
    const updated = computeBuildMetrics(state.selectedParts);
    syncAfterBuildRestore(updated);
    playMechanicalClick(680);
    renderAll();
  });

  // Pin baseline comparison & Side-by-Side Comparison modal
  document.getElementById('btn-pin-compare').addEventListener('click', () => {
    const banner = document.getElementById('pinned-banner');
    const label = document.getElementById('pin-compare-label');
    if (state.pinnedBuild) {
      state.pinnedBuild = null;
      banner.classList.add('hidden');
      label.textContent = 'Pin Baseline';
    } else {
      const current = computeBuildMetrics(state.selectedParts);
      state.pinnedBuild = {
        name: state.weaponName,
        camoId: state.camoId,
        furnitureCamoId: state.furnitureCamoId,
        twoToneEnabled: state.twoToneEnabled,
        parts: { ...state.selectedParts },
        lengthMm: current.lengthMm,
        powerScore: current.powerScore,
        velocityMs: current.velocityMs,
        adsMs: current.adsMs,
        reloadSec: current.reloadSec,
        acousticDb: current.acousticDb,
        stats: { ...current.stats }
      };
      document.getElementById('pinned-name-label').textContent = state.weaponName;
      banner.classList.remove('hidden');
      label.textContent = 'Clear Baseline';
    }
    playMechanicalClick(520);
    renderAll();
  });

  const openComparison = () => {
    if (!state.pinnedBuild) return;
    playMechanicalClick(580);
    renderComparisonModal(computeBuildMetrics(state.selectedParts));
    openModalById('compare-modal');
  };
  document.getElementById('btn-open-compare-modal')?.addEventListener('click', openComparison);
  document.getElementById('btn-header-compare')?.addEventListener('click', openComparison);
  document.getElementById('btn-close-compare-modal')?.addEventListener('click', () => {
    closeModalById('compare-modal');
  });

  // Keyboard shortcuts modal
  document.getElementById('btn-shortcuts-help')?.addEventListener('click', () => {
    playMechanicalClick(560);
    openModalById('shortcuts-modal');
  });
  document.getElementById('btn-close-shortcuts-modal')?.addEventListener('click', () => {
    closeModalById('shortcuts-modal');
  });

  ['export-modal', 'preset-rack-modal', 'compare-modal', 'shortcuts-modal'].forEach(modalId => {
    document.getElementById(modalId)?.addEventListener('click', (e) => {
      if (e.target && e.target.id === modalId) {
        closeModalById(modalId);
      }
    });
  });

  // Exploded view & callout labels
  document.getElementById('btn-toggle-exploded').addEventListener('click', () => {
    state.explodedView = !state.explodedView;
    document.getElementById('exploded-state-text').textContent = state.explodedView ? 'ON' : 'OFF';
    playMechanicalClick(560);
    renderAll();
  });

  document.getElementById('btn-toggle-callouts').addEventListener('click', () => {
    state.showCallouts = !state.showCallouts;
    document.getElementById('callouts-state-text').textContent = state.showCallouts ? 'ON' : 'OFF';
    playMechanicalClick(560);
    renderAll();
  });

  // Quick fire button & keyboard shortcuts
  document.getElementById('btn-quick-fire').addEventListener('click', () => {
    triggerSingleShot(160, 172);
  });

  // Blueprint PNG / SVG / Print export handlers
  document.getElementById('btn-export-png')?.addEventListener('click', () => {
    playMechanicalClick(620);
    downloadBlueprintPNG(computeBuildMetrics(state.selectedParts));
  });
  document.getElementById('btn-modal-export-png')?.addEventListener('click', () => {
    playMechanicalClick(620);
    downloadBlueprintPNG(computeBuildMetrics(state.selectedParts));
  });
  document.getElementById('btn-modal-export-svg')?.addEventListener('click', () => {
    playMechanicalClick(620);
    downloadBlueprintSVG(computeBuildMetrics(state.selectedParts));
  });
  document.getElementById('btn-modal-print')?.addEventListener('click', () => {
    closeModalById('export-modal');
    printSpecSheet();
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      if (
        closeModalById('shortcuts-modal') ||
        closeModalById('preset-rack-modal') ||
        closeModalById('compare-modal') ||
        closeModalById('export-modal')
      ) {
        return;
      }
      if (state.sidebarOpen) {
        state.sidebarOpen = false;
        state.hoveredPartId = null;
        playMechanicalClick(480);
        renderAll();
      }
      return;
    }

    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;

    if (e.key === '?' || (e.shiftKey && e.code === 'Slash')) {
      e.preventDefault();
      if (!closeModalById('shortcuts-modal')) {
        playMechanicalClick(560);
        openModalById('shortcuts-modal');
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) performRedo();
      else performUndo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      performRedo();
      return;
    }

    if (state.sidebarOpen && e.key === '[') {
      e.preventDefault();
      cycleSidebarSlot(-1);
      return;
    }
    if (state.sidebarOpen && e.key === ']') {
      e.preventDefault();
      cycleSidebarSlot(1);
      return;
    }

    if (e.code === 'KeyE' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      state.explodedView = !state.explodedView;
      const expEl = document.getElementById('exploded-state-text');
      if (expEl) expEl.textContent = state.explodedView ? 'ON' : 'OFF';
      playMechanicalClick(560);
      renderAll();
      return;
    }

    if (/^[0-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const slotIdx = e.key === '0' ? 9 : (Number(e.key) - 1);
      const targetCat = CATEGORIES[slotIdx];
      if (targetCat) {
        e.preventDefault();
        if (targetCat.id !== state.activeCategory) state.sidebarFilter.query = '';
        state.activeCategory = targetCat.id;
        state.sidebarOpen = true;
        state.hoveredPartId = null;
        playMechanicalClick(610);
        renderAll();
      }
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      triggerSingleShot(160, 172);
    } else if (e.code === 'KeyR') {
      const computed = computeBuildMetrics(state.selectedParts);
      state.range.ammo = computed.capacity;
      state.range.maxAmmo = computed.capacity;
      state.range.heat = 24;
      state.range.recoilStack = 0;
      playReloadSound();
      renderRangeCanvas(computed);
    }
  });

  // Workbench vs. Firing Range view toggle
  const tabWorkbench = document.getElementById('view-tab-workbench');
  const tabRange = document.getElementById('view-tab-range');
  const stageWorkbench = document.getElementById('workbench-stage');
  const stageRange = document.getElementById('range-stage');

  tabWorkbench.addEventListener('click', () => {
    state.activeView = 'workbench';
    stageWorkbench.classList.remove('hidden');
    stageRange.classList.add('hidden');
    stageRange.classList.remove('flex');
    tabWorkbench.className = 'px-3 py-1 text-xs font-mono font-semibold uppercase transition bg-paper-100 text-ink-900';
    tabRange.className = 'px-3 py-1 text-xs font-mono font-semibold uppercase transition text-paper-300 hover:text-white';
    document.getElementById('viewport-mode-title').textContent = 'Figure 1. Assembly Drawing — Click Any Part to Modify';
    renderAll();
  });

  tabRange.addEventListener('click', () => {
    state.activeView = 'range';
    state.sidebarOpen = false;
    state.hoveredPartId = null;
    stageWorkbench.classList.add('hidden');
    stageRange.classList.remove('hidden');
    stageRange.classList.add('flex');
    tabRange.className = 'px-3 py-1 text-xs font-mono font-semibold uppercase transition bg-paper-100 text-ink-900';
    tabWorkbench.className = 'px-3 py-1 text-xs font-mono font-semibold uppercase transition text-paper-300 hover:text-white';
    document.getElementById('viewport-mode-title').textContent = 'Figure 2. Indoor Test Bay & Reactive Range';
    renderAll();
  });

  // Save current build slot
  document.getElementById('btn-save-slot').addEventListener('click', () => {
    const newSlot = {
      name: state.weaponName || `Custom Loadout #${state.savedBuilds.length + 1}`,
      camo: state.camoId,
      furnitureCamo: state.furnitureCamoId,
      twoTone: state.twoToneEnabled,
      parts: { ...state.selectedParts }
    };
    state.savedBuilds.unshift(newSlot);
    persistSavedBuilds();
    playMechanicalClick(580);
    renderSavedBuildsList();
  });

  // Audio toggle
  document.getElementById('btn-audio-toggle').addEventListener('click', () => {
    state.audioEnabled = !state.audioEnabled;
    document.getElementById('icon-audio-on').classList.toggle('hidden', !state.audioEnabled);
    document.getElementById('icon-audio-off').classList.toggle('hidden', state.audioEnabled);
  });

  // Share / JSON Export & Import modal
  const modal = document.getElementById('export-modal');
  const manifestBox = document.getElementById('json-manifest-box');
  const shareUrlInput = document.getElementById('share-url-input');
  const statusMsg = document.getElementById('modal-status-msg');

  document.getElementById('btn-export-modal').addEventListener('click', () => {
    const computed = computeBuildMetrics(state.selectedParts);
    const payload = {
      designation: state.weaponName,
      finish: state.camoId,
      twoTone: state.twoToneEnabled,
      furnitureFinish: state.furnitureCamoId,
      caliber: computed.caliber,
      propulsion: computed.propulsion,
      tacticalIndex: computed.powerScore,
      components: state.selectedParts,
      telemetry: computed.stats
    };
    manifestBox.value = JSON.stringify(payload, null, 2);
    if (shareUrlInput) {
      shareUrlInput.value = buildShareableUrl(state, window.location.href);
    }
    statusMsg.classList.add('hidden');
    openModalById('export-modal');
  });

  document.getElementById('btn-copy-share-url')?.addEventListener('click', () => {
    if (!shareUrlInput) return;
    shareUrlInput.select();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrlInput.value);
      } else {
        document.execCommand('copy');
      }
    } catch (err) {
      document.execCommand('copy');
    }
    statusMsg.textContent = 'Shareable build link copied to clipboard!';
    statusMsg.classList.remove('hidden');
  });

  document.getElementById('btn-close-modal').addEventListener('click', () => {
    closeModalById('export-modal');
  });

  document.getElementById('btn-copy-json').addEventListener('click', () => {
    manifestBox.select();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(manifestBox.value);
      } else {
        document.execCommand('copy');
      }
    } catch (err) {
      document.execCommand('copy');
    }
    statusMsg.textContent = 'Blueprint JSON copied to clipboard!';
    statusMsg.classList.remove('hidden');
  });

  document.getElementById('btn-import-json').addEventListener('click', () => {
    try {
      const parsed = JSON.parse(manifestBox.value);
      if (!parsed || typeof parsed !== 'object' || !parsed.components || typeof parsed.components !== 'object' || Array.isArray(parsed.components)) {
        statusMsg.textContent = 'Invalid blueprint — expected an object with a "components" map.';
        statusMsg.classList.remove('hidden');
        return;
      }

      const nextParts = { ...state.selectedParts };
      const ignoredSlots = [];
      let appliedCount = 0;

      CATEGORIES.forEach(cat => {
        const rawId = parsed.components[cat.id];
        if (rawId === undefined || rawId === null || rawId === '') return;
        const catalogList = PARTS_DB[cat.id] || [];
        const isValid = typeof rawId === 'string' && catalogList.some(p => p.id === rawId);
        if (isValid) {
          nextParts[cat.id] = rawId;
          appliedCount++;
        } else {
          ignoredSlots.push(`${cat.short}:${String(rawId).slice(0, 24)}`);
        }
      });

      if (appliedCount === 0 && ignoredSlots.length > 0) {
        statusMsg.textContent = `No valid component IDs found (ignored: ${ignoredSlots.join(', ')}).`;
        statusMsg.classList.remove('hidden');
        return;
      }

      pushHistorySnapshot();
      const autoSwaps = autoResolveIncompatibilities(nextParts);
      state.selectedParts = nextParts;

      if (typeof parsed.designation === 'string' && parsed.designation.trim()) {
        const cleanName = parsed.designation.trim().slice(0, 80);
        state.weaponName = cleanName;
      }
      if (typeof parsed.finish === 'string' && CAMO_FINISHES.some(c => c.id === parsed.finish)) {
        state.camoId = parsed.finish;
      }
      if (typeof parsed.twoTone === 'boolean') {
        state.twoToneEnabled = parsed.twoTone;
      }
      if (typeof parsed.furnitureFinish === 'string' && CAMO_FINISHES.some(c => c.id === parsed.furnitureFinish)) {
        state.furnitureCamoId = parsed.furnitureFinish;
      }

      state.hoveredPartId = null;
      const updated = computeBuildMetrics(state.selectedParts);
      syncAfterBuildRestore(updated);
      state.range.heat = 24;

      renderAll();
      const notes = [];
      if (autoSwaps.length > 0) notes.push(`auto-adjusted ${autoSwaps.length} slot(s)`);
      if (ignoredSlots.length > 0) notes.push(`ignored unknown: ${ignoredSlots.join(', ')}`);
      statusMsg.textContent = notes.length > 0
        ? `Blueprint loaded (${notes.join('; ')}).`
        : 'Blueprint successfully loaded into Workbench!';
      statusMsg.classList.remove('hidden');
    } catch (err) {
      statusMsg.textContent = 'Invalid JSON format — please check the blueprint syntax.';
      statusMsg.classList.remove('hidden');
    }
  });
}

window.addEventListener('DOMContentLoaded', initApp);
