import { CATEGORIES, CAMO_FINISHES, PARTS_DB } from './data/catalog.js';
import { PRESETS } from './data/presets.js';
import { state, persistSavedBuilds } from './state.js';
import { playMechanicalClick, playReloadSound } from './audio.js';
import { getPartById } from './engine/utils.js';
import { checkPartCompatibility, autoResolveIncompatibilities } from './engine/compatibility.js';
import { computeBuildMetrics } from './engine/ballistics.js';
import { renderWeaponSVG } from './ui/svgRenderer.js';
import {
  renderComponentSidebar,
  renderCamoSelector,
  renderPartsList,
  renderQuickLoadoutStrip,
  renderTelemetryAndDeltas,
  renderSavedBuildsList
} from './ui/uiRenderer.js';
import { renderRangeCanvas, triggerSingleShot, initRangeEvents } from './ui/firingRange.js';
import { initTooltipController } from './ui/tooltip.js';

export function renderAll() {
  const currentMetrics = computeBuildMetrics(state.selectedParts);

  let previewMetrics = null;
  if (state.hoveredPartId) {
    const tempSelection = {
      ...state.selectedParts,
      [state.activeCategory]: state.hoveredPartId
    };
    previewMetrics = computeBuildMetrics(tempSelection);
  }

  renderComponentSidebar();
  renderCamoSelector();
  renderPartsList();
  renderWeaponSVG(previewMetrics || currentMetrics);
  renderQuickLoadoutStrip(currentMetrics);
  renderTelemetryAndDeltas(currentMetrics, previewMetrics);
  renderSavedBuildsList();
  renderRangeCanvas(currentMetrics);
}

function initApp() {
  const initialComputed = computeBuildMetrics(state.selectedParts);
  state.range.ammo = initialComputed.capacity;
  state.range.maxAmmo = initialComputed.capacity;

  const nameInput = document.getElementById('custom-weapon-name');
  if (nameInput) nameInput.value = state.weaponName;

  renderAll();
  initTooltipController();
  initRangeEvents();

  // Delegated click handlers for stations, SVG parts, catalog items, finishes, and saved builds
  document.body.addEventListener('click', (e) => {
    const closeSidebarBtn = e.target.closest('#btn-close-sidebar');
    if (closeSidebarBtn) {
      state.sidebarOpen = false;
      state.hoveredPartId = null;
      playMechanicalClick(480);
      renderAll();
      return;
    }

    const catBtn = e.target.closest('[data-category-btn]');
    if (catBtn) {
      state.activeCategory = catBtn.getAttribute('data-category-btn');
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
      state.activeCategory = svgSlot.getAttribute('data-slot');
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

      state.selectedParts[state.activeCategory] = partId;
      if (state.activeCategory === 'platform') {
        if (partId === 'plat_arc_pistol') {
          state.selectedParts.gripStock = 'stk_no_stock';
          state.selectedParts.magazine = 'mag_fast_20';
          state.selectedParts.barrel = 'bar_cqb_short';
          state.selectedParts.receiver = 'rec_hk_roller_9';
          state.selectedParts.ammo = 'ammo_federal_jhp';
          state.selectedParts.muzzle = 'muz_comp_pro';
        } else if (partId === 'plat_shotgun') {
          state.selectedParts.barrel = 'bar_standard_14';
          state.selectedParts.receiver = 'rec_shotgun_12ga';
          state.selectedParts.magazine = 'mag_shotgun_tube8';
          state.selectedParts.ammo = 'ammo_12ga_buckshot';
          state.selectedParts.muzzle = 'muz_thread_cap';
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

      // Guarantee remaining slots stay mechanically compatible & notify user of any auto-swaps
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
      state.camoId = camoBtn.getAttribute('data-camo-id');
      playMechanicalClick(540);
      renderAll();
      return;
    }

    const loadIdxBtn = e.target.closest('[data-load-saved]');
    if (loadIdxBtn) {
      const idx = Number(loadIdxBtn.getAttribute('data-load-saved'));
      const saved = state.savedBuilds[idx];
      if (saved) {
        state.weaponName = saved.name;
        state.camoId = saved.camo || 'obsidian';
        state.selectedParts = { ...saved.parts };
        document.getElementById('custom-weapon-name').value = saved.name;
        const updated = computeBuildMetrics(state.selectedParts);
        state.range.ammo = updated.capacity;
        state.range.maxAmmo = updated.capacity;
        state.range.recoilStack = 0;
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
      return;
    }
  });

  // Catalog row hover live stat & SVG preview
  const partsContainer = document.getElementById('parts-list-container');
  partsContainer.addEventListener('mouseover', (e) => {
    const card = e.target.closest('[data-part-card]');
    const isIncompat = card && card.getAttribute('data-incompatible') === 'true';
    const id = (card && !isIncompat) ? card.getAttribute('data-part-card') : null;
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

  // Weapon designation input
  document.getElementById('custom-weapon-name').addEventListener('input', (e) => {
    state.weaponName = e.target.value || 'Custom Real-World Build';
  });

  // Preset loader
  document.getElementById('preset-selector').addEventListener('change', (e) => {
    const key = e.target.value;
    if (key && PRESETS[key]) {
      const p = PRESETS[key];
      state.weaponName = p.name;
      state.camoId = p.camo;
      state.selectedParts = { ...p.parts };
      document.getElementById('custom-weapon-name').value = p.name;
      const updated = computeBuildMetrics(state.selectedParts);
      state.range.ammo = updated.capacity;
      state.range.maxAmmo = updated.capacity;
      state.range.recoilStack = 0;
      state.range.impacts = [];
      playMechanicalClick(490);
      renderAll();
      e.target.value = '';
    }
  });

  // Randomize build
  document.getElementById('btn-randomize').addEventListener('click', () => {
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
    state.camoId = randomCamo.id;
    const platName = getPartById('platform', state.selectedParts.platform).name.split(' ')[0];
    state.weaponName = `${platName} Custom Mod-${Math.floor(10 + Math.random() * 89)}`;
    document.getElementById('custom-weapon-name').value = state.weaponName;
    const updated = computeBuildMetrics(state.selectedParts);
    state.range.ammo = updated.capacity;
    state.range.maxAmmo = updated.capacity;
    state.range.recoilStack = 0;
    playMechanicalClick(680);
    renderAll();
  });

  // Pin baseline comparison
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
        stats: { ...current.stats }
      };
      document.getElementById('pinned-name-label').textContent = state.weaponName;
      banner.classList.remove('hidden');
      label.textContent = 'Clear Baseline';
    }
    playMechanicalClick(520);
    renderAll();
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

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      const exportModal = document.getElementById('export-modal');
      if (exportModal && !exportModal.classList.contains('hidden')) {
        exportModal.classList.add('hidden');
        exportModal.classList.remove('flex');
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
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
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
    document.getElementById('viewport-mode-title').textContent = 'Figure 2. Indoor Test Bay & Grouping Target';
    renderAll();
  });

  // Save current build slot
  document.getElementById('btn-save-slot').addEventListener('click', () => {
    const newSlot = {
      name: state.weaponName || `Custom Loadout #${state.savedBuilds.length + 1}`,
      camo: state.camoId,
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
  const statusMsg = document.getElementById('modal-status-msg');

  document.getElementById('btn-export-modal').addEventListener('click', () => {
    const computed = computeBuildMetrics(state.selectedParts);
    const payload = {
      designation: state.weaponName,
      finish: state.camoId,
      caliber: computed.caliber,
      propulsion: computed.propulsion,
      tacticalIndex: computed.powerScore,
      components: state.selectedParts,
      telemetry: computed.stats
    };
    manifestBox.value = JSON.stringify(payload, null, 2);
    statusMsg.classList.add('hidden');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  });

  document.getElementById('btn-close-modal').addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
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

      const autoSwaps = autoResolveIncompatibilities(nextParts);
      state.selectedParts = nextParts;

      if (typeof parsed.designation === 'string' && parsed.designation.trim()) {
        const cleanName = parsed.designation.trim().slice(0, 80);
        state.weaponName = cleanName;
        document.getElementById('custom-weapon-name').value = cleanName;
      }
      if (typeof parsed.finish === 'string' && CAMO_FINISHES.some(c => c.id === parsed.finish)) {
        state.camoId = parsed.finish;
      }

      state.hoveredPartId = null;
      const updated = computeBuildMetrics(state.selectedParts);
      state.range.ammo = updated.capacity;
      state.range.maxAmmo = updated.capacity;
      state.range.impacts = [];
      state.range.heat = 24;
      state.range.recoilStack = 0;

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