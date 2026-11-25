import test from 'node:test';
import assert from 'node:assert/strict';

import { PRESETS, PRESET_CATEGORIES } from '../js/data/presets.js';
import { computeBuildMetrics } from '../js/engine/ballistics.js';
import { checkPartCompatibility } from '../js/engine/compatibility.js';
import { encodeBuildToHash, decodeBuildFromHash, buildShareableUrl } from '../js/engine/shareUrl.js';
import {
  ARMOR_TARGETS,
  getOpticZoomFactor,
  computeDistanceSpreadMultiplier,
  evaluateArmorPenetration,
  isPointOnTarget,
  computeLiveGroupMetrics
} from '../js/engine/rangeBallistics.js';
import { renderMiniWeaponSVG } from '../js/ui/svgRenderer.js';
import { buildComparisonRadarSVG } from '../js/ui/modals.js';

test('encodeBuildToHash and decodeBuildFromHash round-trip custom builds and auto-resolve incompatibilities', () => {
  const sampleState = {
    weaponName: 'SCAR-H Custom Spec / Night Ops',
    camoId: 'fde',
    furnitureCamoId: 'solarian',
    twoToneEnabled: true,
    selectedParts: { ...PRESETS.fn_scar_h_762.parts }
  };

  const hash = encodeBuildToHash(sampleState);
  assert.ok(hash.startsWith('#build='));
  const url = buildShareableUrl(sampleState, 'https://faqihmfaiz.github.io/gun-workshop/?foo=1#old');
  assert.ok(url.startsWith('https://faqihmfaiz.github.io/gun-workshop/?foo=1#build='));

  const decoded = decodeBuildFromHash(url);
  assert.ok(decoded);
  assert.equal(decoded.weaponName, sampleState.weaponName);
  assert.equal(decoded.camoId, 'fde');
  assert.equal(decoded.furnitureCamoId, 'solarian');
  assert.equal(decoded.twoToneEnabled, true);
  assert.deepEqual(decoded.parts, sampleState.selectedParts);
  assert.equal(decoded.autoSwaps.length, 0);

  // Tampered incompatible build (pistol platform + shotgun barrel) gets repaired cleanly
  const broken = {
    weaponName: 'Broken Import',
    camoId: 'invalid_camo',
    selectedParts: { ...PRESETS.sig_p320_xten.parts, barrel: 'bar_shotgun_18', ammo: 'ammo_slap_sabot' }
  };
  const repaired = decodeBuildFromHash(encodeBuildToHash(broken));
  assert.ok(repaired);
  assert.equal(repaired.camoId, 'obsidian');
  assert.ok(repaired.autoSwaps.length > 0);
  assert.equal(checkPartCompatibility('barrel', { id: repaired.parts.barrel }, repaired.parts).compatible, true);

  assert.equal(decodeBuildFromHash('#build=not_valid_base64!!!'), null);
  assert.equal(decodeBuildFromHash(''), null);
});

test('evaluateArmorPenetration enforces NIJ IIIA / III / IV thresholds and range drop-off', () => {
  const jhpPistol = computeBuildMetrics(PRESETS.sig_p320_xten.parts);
  const apRifle = computeBuildMetrics(PRESETS.sig_xm7_spear.parts);
  const amrSlap = computeBuildMetrics(PRESETS.barrett_m107_50.parts);

  // Check NIJ IIIA, III, IV tiers exist
  assert.equal(Object.keys(ARMOR_TARGETS).length, 3);

  const pistolVs4 = evaluateArmorPenetration(jhpPistol, 'armor_4', 50);
  assert.equal(pistolVs4.isArmor, true);
  assert.equal(pistolVs4.penetrated, false);

  const apVs3a = evaluateArmorPenetration(apRifle, 'armor_3a', 100);
  assert.equal(apVs3a.penetrated, true);

  const amrVs4Near = evaluateArmorPenetration(amrSlap, 'armor_4', 100);
  const amrVs4Far = evaluateArmorPenetration(amrSlap, 'armor_4', 1000);
  assert.equal(amrVs4Near.penetrated, true);
  assert.ok(amrVs4Far.effectivePen < amrVs4Near.effectivePen, 'Long-range 1000m penetration should decay below 100m');
});

test('rangeBallistics computes optic zoom spread relief, target bounds, and MOA grouping metrics', () => {
  assert.equal(getOpticZoomFactor({ zoom: '5-25x' }), 25);
  assert.equal(getOpticZoomFactor({ zoom: '1.0x' }), 1);

  const ironsSpread1000 = computeDistanceSpreadMultiplier(1000, { zoom: '1.0x' });
  const sniperSpread1000 = computeDistanceSpreadMultiplier(1000, { zoom: '5-25x' });
  assert.ok(sniperSpread1000 < ironsSpread1000, 'High-power optics should tighten long-range aiming dispersion');

  assert.equal(isPointOnTarget(160, 172, 'armor_4').onTarget, true);
  assert.equal(isPointOnTarget(40, 40, 'armor_4').onTarget, false);
  assert.equal(isPointOnTarget(160, 90, 'paper').isCrit, true);

  const group = computeLiveGroupMetrics(
    [{ x: 155, y: 170 }, { x: 165, y: 170 }, { x: 160, y: 176 }],
    100,
    4,
    3
  );
  assert.equal(group.hasGroup, true);
  assert.equal(group.groupCm, 4.0);
  assert.equal(group.accuracyPct, 75);
  assert.ok(group.groupMoa > 1.3 && group.groupMoa < 1.5);
});

test('all 21 presets belong to valid PRESET_CATEGORIES and render clean mini/radar SVGs', () => {
  const entries = Object.entries(PRESETS);
  assert.equal(entries.length, 21);

  for (const [key, preset] of entries) {
    assert.ok(PRESET_CATEGORIES.includes(preset.category), `Preset ${key} category "${preset.category}" is listed`);
    assert.notEqual(preset.category, 'All');
  }

  const mini = renderMiniWeaponSVG(computeBuildMetrics(PRESETS.arcflash_emg02.parts), { camoId: 'cyber' });
  assert.ok(mini.startsWith('<svg '));
  assert.ok(!mini.includes('id="svg-muzzle-flash"'), 'Mini SVG must not emit duplicate muzzle flash ID');
  assert.ok(!mini.includes('data-slot='), 'Mini SVG must not emit interactive workbench slot attributes');
  assert.ok(!mini.includes('undefined') && !mini.includes('NaN'));

  for (const theme of ['paper', 'blueprint', 'dark']) {
    const radar = buildComparisonRadarSVG(
      computeBuildMetrics(PRESETS.colt_m4a1_sopmod.parts).stats,
      computeBuildMetrics(PRESETS.barrett_m107_50.parts).stats,
      theme
    );
    assert.ok(radar.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
    assert.ok(!radar.includes('undefined') && !radar.includes('NaN'));
  }
});
