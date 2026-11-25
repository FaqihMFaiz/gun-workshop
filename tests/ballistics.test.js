import test from 'node:test';
import assert from 'node:assert/strict';

import { PRESETS } from '../js/data/presets.js';
import { computeBuildMetrics, computeDamageAtDistance, clearMetricsCache } from '../js/engine/ballistics.js';
import { escapeHtml } from '../js/engine/utils.js';

test('computeBuildMetrics produces valid metrics for all 14 presets', () => {
  clearMetricsCache();
  const presetEntries = Object.entries(PRESETS);
  assert.equal(presetEntries.length, 14);

  for (const [key, preset] of presetEntries) {
    const metrics = computeBuildMetrics(preset.parts);
    assert.ok(metrics, `Preset ${key} returned metrics`);
    assert.ok(metrics.stats.damage >= 10 && metrics.stats.damage <= 100, `${key} damage in bounds`);
    assert.ok(metrics.stats.fireRate >= 120 && metrics.stats.fireRate <= 1300, `${key} fireRate in bounds`);
    assert.ok(metrics.velocityMs >= 75 && metrics.velocityMs <= 1180, `${key} velocity in bounds`);
    assert.ok(metrics.capacity > 0, `${key} capacity > 0`);
    assert.ok(metrics.production.totalGrams > 0, `${key} BOM grams > 0`);
    assert.ok(metrics.production.materialCost > 0, `${key} BOM materialCost > 0`);
  }
});

test('computeDamageAtDistance retains full damage before dropStart and clamps at floor', () => {
  const baseDamage = 40;
  const rangeStat = 60; // dropStart = 15 + 39 = 54m
  assert.equal(computeDamageAtDistance(baseDamage, rangeStat, 25), 40);
  assert.equal(computeDamageAtDistance(baseDamage, rangeStat, 54), 40);

  const at100 = computeDamageAtDistance(baseDamage, rangeStat, 100);
  assert.ok(at100 < baseDamage, '100m damage should fall off after 54m dropStart');
  assert.ok(at100 >= Math.max(12, Math.round(baseDamage * 0.54)));

  const far = computeDamageAtDistance(baseDamage, rangeStat, 300);
  assert.equal(far, Math.max(12, Math.round(baseDamage * 0.54)));
});

test('computeBuildMetrics memoizes identical selections and invalidates on slot change', () => {
  clearMetricsCache();
  const base = { ...PRESETS.colt_m4a1_sopmod.parts };
  const first = computeBuildMetrics(base);
  const second = computeBuildMetrics({ ...base });
  assert.strictEqual(first, second);

  const modified = { ...base, muzzle: 'muz_heavy_brake' };
  const third = computeBuildMetrics(modified);
  assert.notStrictEqual(first, third);
  assert.notEqual(first.acousticDb, third.acousticDb);

  clearMetricsCache();
  const fourth = computeBuildMetrics(base);
  assert.notStrictEqual(first, fourth);
});

test('synergies activate for coilgun, AK package, and subsonic suppressor builds', () => {
  clearMetricsCache();
  const coil = computeBuildMetrics(PRESETS.arcflash_emg02.parts);
  assert.equal(coil.isEnergy, true);
  assert.ok(coil.synergies.some(s => s.title.includes('10-Stage IGBT Coil')));

  const ak = computeBuildMetrics(PRESETS.kalashnikov_ak12_zenit.parts);
  assert.ok(ak.synergies.some(s => s.title.includes('Stamped-Steel Piston')));

  const whisper = computeBuildMetrics({
    ...PRESETS.colt_m4a1_sopmod.parts,
    ammo: 'ammo_sp6_subsonic'
  });
  assert.ok(whisper.synergies.some(s => s.title.includes('Whisper Lock')));
  assert.ok(whisper.velocityMs <= 295);
});

test('escapeHtml neutralizes HTML tags and attribute injection payloads', () => {
  const payload = `<img src=x onerror="alert('xss')">&`;
  const escaped = escapeHtml(payload);
  assert.equal(escaped, '&lt;img src=x onerror=&quot;alert(&#39;xss&#39;)&quot;&gt;&amp;');
  assert.ok(!escaped.includes('<'));
  assert.ok(!escaped.includes('>'));
});
