import test from 'node:test';
import assert from 'node:assert/strict';

import { getPartById } from '../js/engine/utils.js';
import { getPartManufacturingProfile } from '../js/engine/manufacturing.js';

test('none parts require zero raw materials and zero labor', () => {
  const noneUb = getPartById('underbarrel', 'ub_none');
  const noneSling = getPartById('sling', 'slg_none');

  for (const [cat, part] of [['underbarrel', noneUb], ['sling', noneSling]]) {
    const profile = getPartManufacturingProfile(cat, part, 30);
    assert.equal(profile.totalGrams, 0);
    assert.equal(profile.materialCost, 0);
    assert.equal(profile.workerPay, 0);
    assert.equal(profile.mfgHours, 0);
  }
});

test('shotgun receiver, tube magazine, and 00 buckshot produce positive BOM figures', () => {
  const rec = getPartManufacturingProfile('receiver', getPartById('receiver', 'rec_shotgun_12ga'), 8);
  const mag = getPartManufacturingProfile('magazine', getPartById('magazine', 'mag_shotgun_tube8'), 8);
  const ammo8 = getPartManufacturingProfile('ammo', getPartById('ammo', 'ammo_12ga_buckshot'), 8);

  assert.ok(rec.totalGrams > 0 && rec.materialCost > 0 && rec.workerPay > 0);
  assert.ok(mag.totalGrams > 0 && mag.materials['Chromoly Steel'] > 0);
  assert.equal(ammo8.rounds, 8);
  assert.ok(ammo8.materials['Lead Core'] > 0);
});

test('ammo manufacturing profile scales proportionally with magazine capacity', () => {
  const fmj = getPartById('ammo', 'ammo_m855a1_fmj');
  const p20 = getPartManufacturingProfile('ammo', fmj, 20);
  const p200 = getPartManufacturingProfile('ammo', fmj, 200);

  assert.equal(p20.rounds, 20);
  assert.equal(p200.rounds, 200);
  assert.ok(Math.abs(p200.totalGrams - p20.totalGrams * 10) < 0.5);
  assert.ok(Math.abs(p200.mfgHours - p20.mfgHours * 10) < 0.05);
});

test('WeakMap cache reuses computed profile without mutating frozen part objects', () => {
  const original = getPartById('barrel', 'bar_carbon_wrapped');
  const frozenPart = Object.freeze({
    ...original,
    stats: Object.freeze({ ...original.stats })
  });

  const first = getPartManufacturingProfile('barrel', frozenPart, 30);
  const second = getPartManufacturingProfile('barrel', frozenPart, 30);

  assert.strictEqual(first, second);
  assert.equal('_mfgCacheMap' in frozenPart, false);
});
