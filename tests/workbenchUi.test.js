import test from 'node:test';
import assert from 'node:assert/strict';

import { PARTS_DB } from '../js/data/catalog.js';
import { PRESETS } from '../js/data/presets.js';
import {
  state,
  pushHistorySnapshot,
  undoBuild,
  redoBuild
} from '../js/state.js';
import { filterAndSortParts } from '../js/engine/utils.js';
import { checkPartCompatibility } from '../js/engine/compatibility.js';
import { computeBuildMetrics } from '../js/engine/ballistics.js';
import { buildSpecSheetSvg } from '../js/ui/blueprintExport.js';

test('undoBuild and redoBuild restore selections, finishes, and invalidate redo on new mutation', () => {
  state.history.past = [];
  state.history.future = [];
  state.weaponName = 'Test Rifle A';
  state.camoId = 'obsidian';
  state.furnitureCamoId = 'fde';
  state.twoToneEnabled = false;
  state.selectedParts = { ...PRESETS.colt_m4a1_sopmod.parts };

  pushHistorySnapshot();
  state.selectedParts.muzzle = 'muz_suppressor_ti';
  state.twoToneEnabled = true;
  state.furnitureCamoId = 'solarian';

  pushHistorySnapshot();
  state.weaponName = 'Test Rifle B';
  state.camoId = 'arctic';

  assert.equal(undoBuild(), true);
  assert.equal(state.weaponName, 'Test Rifle A');
  assert.equal(state.camoId, 'obsidian');
  assert.equal(state.twoToneEnabled, true);
  assert.equal(state.furnitureCamoId, 'solarian');
  assert.equal(state.selectedParts.muzzle, 'muz_suppressor_ti');

  assert.equal(undoBuild(), true);
  assert.equal(state.selectedParts.muzzle, PRESETS.colt_m4a1_sopmod.parts.muzzle);
  assert.equal(state.twoToneEnabled, false);
  assert.equal(undoBuild(), false);

  assert.equal(redoBuild(), true);
  assert.equal(state.selectedParts.muzzle, 'muz_suppressor_ti');

  // New mutation clears redo stack
  pushHistorySnapshot();
  state.camoId = 'cyber';
  assert.equal(state.history.future.length, 0);
  assert.equal(redoBuild(), false);
});

test('filterAndSortParts filters by query, compatibleOnly, and sorts across metrics', () => {
  const selection = { ...PRESETS.sw_629_44mag.parts };
  const allMuzzles = PARTS_DB.muzzle;

  const compatOnly = filterAndSortParts(
    'muzzle',
    allMuzzles,
    selection,
    { query: '', compatibleOnly: true, sortBy: 'default' },
    checkPartCompatibility
  );
  assert.ok(compatOnly.items.length < compatOnly.totalCount, 'Revolver compatibleOnly hides rifle/shotgun muzzles');
  assert.ok(compatOnly.items.every(item => !item.isBlocked), 'No blocked items returned when compatibleOnly is true');

  const searched = filterAndSortParts(
    'muzzle',
    allMuzzles,
    selection,
    { query: 'titanium', compatibleOnly: false, sortBy: 'default' },
    checkPartCompatibility
  );
  assert.ok(searched.items.length > 0 && searched.items.every(i => (i.part.name + i.part.tag + i.part.desc).toLowerCase().includes('titanium')));

  const sortedCostAsc = filterAndSortParts(
    'barrel',
    PARTS_DB.barrel,
    PRESETS.colt_m4a1_sopmod.parts,
    { query: '', compatibleOnly: true, sortBy: 'cost_asc' },
    checkPartCompatibility
  );
  for (let i = 1; i < sortedCostAsc.items.length; i++) {
    assert.ok(sortedCostAsc.items[i].part.stats.cost >= sortedCostAsc.items[i - 1].part.stats.cost);
  }

  const sortedDmgDesc = filterAndSortParts(
    'ammo',
    PARTS_DB.ammo,
    PRESETS.colt_m4a1_sopmod.parts,
    { query: '', compatibleOnly: true, sortBy: 'damage_desc' },
    checkPartCompatibility
  );
  for (let i = 1; i < sortedDmgDesc.items.length; i++) {
    assert.ok((sortedDmgDesc.items[i].part.stats.damage || 0) <= (sortedDmgDesc.items[i - 1].part.stats.damage || 0));
  }
});

test('buildSpecSheetSvg produces valid self-contained SVG across all 3 themes with escaped designation', () => {
  const computed = computeBuildMetrics(PRESETS.fn_scar_h_762.parts);
  for (const theme of ['paper', 'blueprint', 'dark']) {
    const svg = buildSpecSheetSvg(computed, '<rect x="10" y="10" width="50" height="10" />', {
      theme,
      weaponName: 'SCAR-H <Test> & Co',
      twoToneEnabled: true,
      camoId: 'fde',
      furnitureCamoId: 'obsidian'
    });
    assert.ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
    assert.ok(svg.includes('SCAR-H &lt;Test&gt; &amp; Co'));
    assert.ok(svg.includes('2-Tone'));
    assert.ok(svg.includes('PRODUCTION &amp; MATERIALS LEDGER (BOM)'));
    assert.ok(!svg.includes('undefined'), `Theme ${theme} SVG should not contain undefined`);
    assert.ok(!svg.includes('NaN'), `Theme ${theme} SVG should not contain NaN`);
  }
});
