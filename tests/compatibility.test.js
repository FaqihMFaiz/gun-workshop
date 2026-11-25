import test from 'node:test';
import assert from 'node:assert/strict';

import { CATEGORIES, PARTS_DB } from '../js/data/catalog.js';
import { PRESETS } from '../js/data/presets.js';
import { getPartById } from '../js/engine/utils.js';
import {
  checkPartCompatibility,
  autoResolveIncompatibilities,
  getAvailableFireModes
} from '../js/engine/compatibility.js';

test('all 14 presets satisfy cross-slot compatibility checks', () => {
  for (const [presetId, preset] of Object.entries(PRESETS)) {
    for (const cat of CATEGORIES) {
      const part = getPartById(cat.id, preset.parts[cat.id]);
      const res = checkPartCompatibility(cat.id, part, preset.parts);
      assert.equal(res.compatible, true, `Preset ${presetId} failed ${cat.id} (${part.id}): ${res.reason}`);
    }
  }
});

test('shotgun platform enforces 12-gauge receiver, tubular magazine, and 12-gauge ammo', () => {
  const sgParts = { ...PRESETS.benelli_m1014.parts };
  assert.equal(sgParts.receiver, 'rec_shotgun_12ga');
  assert.equal(sgParts.magazine, 'mag_shotgun_tube8');

  assert.equal(checkPartCompatibility('receiver', getPartById('receiver', 'rec_milspec_556'), sgParts).compatible, false);
  assert.equal(checkPartCompatibility('magazine', getPartById('magazine', 'mag_fast_20'), sgParts).compatible, false);
  assert.equal(checkPartCompatibility('ammo', getPartById('ammo', 'ammo_m855a1_fmj'), sgParts).compatible, false);
  assert.equal(checkPartCompatibility('ammo', getPartById('ammo', 'ammo_federal_jhp'), sgParts).compatible, false);
  assert.equal(checkPartCompatibility('ammo', getPartById('ammo', 'ammo_12ga_buckshot'), sgParts).compatible, true);
  assert.equal(checkPartCompatibility('muzzle', getPartById('muzzle', 'muz_suppressor_ti'), sgParts).compatible, false);

  // Non-shotguns cannot equip shotgun-only receiver/mag/ammo
  const arParts = { ...PRESETS.colt_m4a1_sopmod.parts };
  assert.equal(checkPartCompatibility('receiver', getPartById('receiver', 'rec_shotgun_12ga'), arParts).compatible, false);
  assert.equal(checkPartCompatibility('magazine', getPartById('magazine', 'mag_shotgun_tube8'), arParts).compatible, false);
  assert.equal(checkPartCompatibility('ammo', getPartById('ammo', 'ammo_12ga_buckshot'), arParts).compatible, false);
});

test('pistol platform blocks rifle receivers, rifle cartridges, and rifle suppressors', () => {
  const pistolParts = {
    platform: 'plat_arc_pistol',
    barrel: 'bar_cqb_short',
    receiver: 'rec_hk_roller_9',
    gripStock: 'stk_no_stock',
    magazine: 'mag_fast_20',
    sight: 'sgt_reflex',
    muzzle: 'muz_comp_pro',
    ammo: 'ammo_federal_jhp',
    underbarrel: 'ub_tlr1_hl',
    sling: 'slg_none'
  };

  assert.equal(checkPartCompatibility('receiver', getPartById('receiver', 'rec_milspec_556'), pistolParts).compatible, false);
  assert.equal(checkPartCompatibility('ammo', getPartById('ammo', 'ammo_m855a1_fmj'), pistolParts).compatible, false);
  assert.equal(checkPartCompatibility('ammo', getPartById('ammo', 'ammo_m995_7n39_ap'), pistolParts).compatible, false);
  assert.equal(checkPartCompatibility('muzzle', getPartById('muzzle', 'muz_suppressor_ti'), pistolParts).compatible, false);

  assert.equal(checkPartCompatibility('receiver', getPartById('receiver', 'rec_hk_roller_9'), pistolParts).compatible, true);
  assert.equal(checkPartCompatibility('ammo', getPartById('ammo', 'ammo_federal_jhp'), pistolParts).compatible, true);
  assert.equal(checkPartCompatibility('muzzle', getPartById('muzzle', 'muz_smg_3lug'), pistolParts).compatible, true);
});

test('autoResolveIncompatibilities repairs illegal cross-platform configurations', () => {
  const broken = {
    ...PRESETS.colt_m4a1_sopmod.parts,
    platform: 'plat_shotgun'
  };
  const swaps = autoResolveIncompatibilities(broken);
  assert.ok(swaps.length > 0);
  for (const cat of CATEGORIES) {
    const part = getPartById(cat.id, broken[cat.id]);
    assert.equal(checkPartCompatibility(cat.id, part, broken).compatible, true, `Repaired slot ${cat.id} must be compatible`);
  }
});

test('getAvailableFireModes supports 2-STAGE PROGRESSIVE and all standard selector layouts', () => {
  assert.deepEqual(getAvailableFireModes(getPartById('platform', 'plat_bullpup')), ['SEMI', 'AUTO']);
  assert.deepEqual(getAvailableFireModes(getPartById('platform', 'plat_sniper_dmr')), ['BOLT-ACTION']);
  assert.deepEqual(getAvailableFireModes(getPartById('platform', 'plat_svd_dragunov')), ['SEMI']);
  assert.deepEqual(getAvailableFireModes(getPartById('platform', 'plat_ak_series')), ['AUTO', '2-RD BURST', 'SEMI']);
  assert.deepEqual(getAvailableFireModes(getPartById('platform', 'plat_qbz_95')), ['AUTO', '3-RD BURST', 'SEMI']);
});
