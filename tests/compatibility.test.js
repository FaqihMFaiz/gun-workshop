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

test('all 21 presets satisfy cross-slot compatibility checks', () => {
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
  assert.equal(checkPartCompatibility('receiver', getPartById('receiver', 'rec_capacitor_pulse'), pistolParts).compatible, false);
  assert.equal(checkPartCompatibility('underbarrel', getPartById('underbarrel', 'ub_magpul_afg2'), pistolParts).compatible, false);
  assert.equal(checkPartCompatibility('underbarrel', getPartById('underbarrel', 'ub_surefire_m640df'), pistolParts).compatible, false);
  assert.equal(checkPartCompatibility('sling', getPartById('sling', 'slg_vickers_2pt'), pistolParts).compatible, false);
});

test('Section 1: electromagnetic coilgun and chemical firearms are mutually isolated', () => {
  const coilParts = { ...PRESETS.arcflash_emg02.parts };
  assert.equal(checkPartCompatibility('barrel', getPartById('barrel', 'bar_standard_14'), coilParts).compatible, false);
  assert.equal(checkPartCompatibility('magazine', getPartById('magazine', 'mag_std_30'), coilParts).compatible, false);
  assert.equal(checkPartCompatibility('ammo', getPartById('ammo', 'ammo_m855a1_fmj'), coilParts).compatible, false);
  assert.equal(checkPartCompatibility('muzzle', getPartById('muzzle', 'muz_suppressor_ti'), coilParts).compatible, false);

  const carbineParts = { ...PRESETS.colt_m4a1_sopmod.parts };
  assert.equal(checkPartCompatibility('barrel', getPartById('barrel', 'bar_gauss_rail'), carbineParts).compatible, false);
  assert.equal(checkPartCompatibility('magazine', getPartById('magazine', 'mag_cryo_cell'), carbineParts).compatible, false);
  assert.equal(checkPartCompatibility('ammo', getPartById('ammo', 'ammo_ferro_armature'), carbineParts).compatible, false);
  assert.equal(checkPartCompatibility('muzzle', getPartById('muzzle', 'muz_arc_focus'), carbineParts).compatible, false);

  // Switching receiver into and out of coilgun mode auto-resolves cleanly
  const convertedToCoil = { ...carbineParts, receiver: 'rec_capacitor_pulse' };
  autoResolveIncompatibilities(convertedToCoil);
  assert.equal(convertedToCoil.barrel, 'bar_gauss_rail');
  assert.equal(convertedToCoil.magazine, 'mag_cryo_cell');
  assert.equal(convertedToCoil.ammo, 'ammo_ferro_armature');
  assert.equal(convertedToCoil.muzzle, 'muz_arc_focus');

  const convertedBack = { ...convertedToCoil, receiver: 'rec_milspec_556' };
  autoResolveIncompatibilities(convertedBack);
  for (const cat of CATEGORIES) {
    assert.equal(checkPartCompatibility(cat.id, getPartById(cat.id, convertedBack[cat.id]), convertedBack).compatible, true);
  }
});

test('Section 2: physical hardware collision conflicts are enforced', () => {
  const suppressedRifle = { ...PRESETS.colt_m4a1_sopmod.parts, underbarrel: 'ub_none' };
  assert.equal(checkPartCompatibility('underbarrel', getPartById('underbarrel', 'ub_okc3s_bayonet'), suppressedRifle).compatible, false);

  const bayonetedRifle = { ...PRESETS.pindad_ss2_v1.parts };
  assert.equal(checkPartCompatibility('muzzle', getPartById('muzzle', 'muz_suppressor_ti'), bayonetedRifle).compatible, false);

  const integralSdBuild = { ...PRESETS.colt_m4a1_sopmod.parts, barrel: 'bar_integral_sd', muzzle: 'muz_thread_cap', underbarrel: 'ub_none' };
  assert.equal(checkPartCompatibility('muzzle', getPartById('muzzle', 'muz_heavy_brake'), integralSdBuild).compatible, false);
  assert.equal(checkPartCompatibility('underbarrel', getPartById('underbarrel', 'ub_m203_40mm'), integralSdBuild).compatible, false);
  assert.equal(checkPartCompatibility('underbarrel', getPartById('underbarrel', 'ub_okc3s_bayonet'), integralSdBuild).compatible, false);

  const rpkBarreled = { ...PRESETS.dragunov_svd.parts };
  assert.equal(checkPartCompatibility('underbarrel', getPartById('underbarrel', 'ub_harris_sbrm'), rpkBarreled).compatible, false);
  assert.equal(checkPartCompatibility('underbarrel', getPartById('underbarrel', 'ub_atlas_bt10'), rpkBarreled).compatible, false);

  assert.equal(checkPartCompatibility('underbarrel', getPartById('underbarrel', 'ub_m203_40mm'), PRESETS.ai_axmc_338.parts).compatible, false);
  assert.equal(checkPartCompatibility('underbarrel', getPartById('underbarrel', 'ub_m203_40mm'), PRESETS.norinco_qbz95.parts).compatible, false);
});

test('Section 3: SMG, Sniper, LMG SAW/PKP, and Shotgun cross-caliber leaks are blocked', () => {
  const smg = { ...PRESETS.hk_mp5a3_smg.parts };
  assert.equal(checkPartCompatibility('receiver', getPartById('receiver', 'rec_milspec_556'), smg).compatible, false);
  assert.equal(checkPartCompatibility('barrel', getPartById('barrel', 'bar_standard_14'), smg).compatible, false);
  assert.equal(checkPartCompatibility('ammo', getPartById('ammo', 'ammo_m855a1_fmj'), smg).compatible, false);
  assert.equal(checkPartCompatibility('muzzle', getPartById('muzzle', 'muz_suppressor_ti'), smg).compatible, false);

  const carbine = { ...PRESETS.colt_m4a1_sopmod.parts };
  assert.equal(checkPartCompatibility('barrel', getPartById('barrel', 'bar_mp5_225'), carbine).compatible, false);
  assert.equal(checkPartCompatibility('receiver', getPartById('receiver', 'rec_hk_roller_9'), carbine).compatible, false);

  const boltSniper = { ...PRESETS.ai_axmc_338.parts };
  assert.equal(checkPartCompatibility('receiver', getPartById('receiver', 'rec_milspec_556'), boltSniper).compatible, false);
  assert.equal(checkPartCompatibility('magazine', getPartById('magazine', 'mag_drum_75'), boltSniper).compatible, false);
  assert.equal(checkPartCompatibility('gripStock', getPartById('gripStock', 'stk_no_stock'), boltSniper).compatible, false);

  const saw = { ...PRESETS.fn_m249_saw.parts };
  const pkp = { ...PRESETS.pkp_pecheneg_lmg.parts };
  assert.equal(checkPartCompatibility('magazine', getPartById('magazine', 'mag_pkp_100'), saw).compatible, false);
  assert.equal(checkPartCompatibility('barrel', getPartById('barrel', 'bar_pkp_658'), saw).compatible, false);
  assert.equal(checkPartCompatibility('magazine', getPartById('magazine', 'mag_saw_200'), pkp).compatible, false);
  assert.equal(checkPartCompatibility('barrel', getPartById('barrel', 'bar_m249_18'), pkp).compatible, false);

  const shotgun = { ...PRESETS.benelli_m1014.parts };
  assert.equal(checkPartCompatibility('barrel', getPartById('barrel', 'bar_fluted_20'), shotgun).compatible, false);
  assert.equal(checkPartCompatibility('underbarrel', getPartById('underbarrel', 'ub_harris_sbrm'), shotgun).compatible, false);
});

test('autoResolveIncompatibilities converges to 100% valid build across all 20 platforms', () => {
  assert.equal(PARTS_DB.platform.length, 20);
  for (const plat of PARTS_DB.platform) {
    const candidate = { ...PRESETS.arcflash_emg02.parts, platform: plat.id };
    autoResolveIncompatibilities(candidate);
    for (const cat of CATEGORIES) {
      const part = getPartById(cat.id, candidate[cat.id]);
      const res = checkPartCompatibility(cat.id, part, candidate);
      assert.equal(res.compatible, true, `Transition to ${plat.id} left ${cat.id} (${part.id}) incompatible: ${res.reason}`);
    }
  }
});

test('new platform mechanics, gap-filler parts, and fire modes enforce compatibility rules', () => {
  // Revolver requires 6-round speedloader cylinder and rejects conventional suppressors
  const revBase = { ...PRESETS.sw_629_44mag.parts };
  assert.equal(checkPartCompatibility('magazine', getPartById('magazine', 'mag_pistol_15'), revBase).compatible, false);
  assert.equal(checkPartCompatibility('muzzle', getPartById('muzzle', 'muz_suppressor_ti'), revBase).compatible, false);
  assert.equal(checkPartCompatibility('muzzle', getPartById('muzzle', 'muz_thread_cap'), revBase).compatible, true);

  // Pump shotgun vs semi shotgun receiver rules
  const pumpBase = { ...PRESETS.remington_m870_pump.parts };
  assert.equal(checkPartCompatibility('receiver', getPartById('receiver', 'rec_pump_shotgun'), pumpBase).compatible, true);
  assert.equal(checkPartCompatibility('receiver', getPartById('receiver', 'rec_milspec_ar'), pumpBase).compatible, false);
  assert.equal(checkPartCompatibility('ammo', getPartById('ammo', 'ammo_12ga_slug'), pumpBase).compatible, true);

  // .50 BMG AMR supports SLAP sabot & 29-inch AMR barrel, rejects small-caliber parts
  const amrBase = { ...PRESETS.barrett_m107_50.parts };
  assert.equal(checkPartCompatibility('ammo', getPartById('ammo', 'ammo_slap_sabot'), amrBase).compatible, true);
  assert.equal(checkPartCompatibility('barrel', getPartById('barrel', 'bar_amr_29'), amrBase).compatible, true);
  assert.equal(checkPartCompatibility('ammo', getPartById('ammo', 'ammo_federal_jhp'), amrBase).compatible, false);

  // SLAP sabot requires 7.62 NATO battle rifle, 8.6 sniper, or .50 AMR (rejected on 5.56 carbine)
  const rifleBase = { ...PRESETS.colt_m4a1_sopmod.parts };
  assert.equal(checkPartCompatibility('ammo', getPartById('ammo', 'ammo_slap_sabot'), rifleBase).compatible, false);
  assert.equal(checkPartCompatibility('ammo', getPartById('ammo', 'ammo_slap_sabot'), { ...PRESETS.fn_scar_h_762.parts }).compatible, true);

  // Underbarrel Masterkey is rejected on pistols and bullpups, allowed on rifles
  assert.equal(checkPartCompatibility('underbarrel', getPartById('underbarrel', 'ub_masterkey_12ga'), rifleBase).compatible, true);
  assert.equal(checkPartCompatibility('underbarrel', getPartById('underbarrel', 'ub_masterkey_12ga'), { ...PRESETS.fn_p90_pdw.parts }).compatible, false);

  // Pistol lanyard is only for handguns/revolvers
  assert.equal(checkPartCompatibility('sling', getPartById('sling', 'slg_pistol_lanyard'), { ...PRESETS.sig_p320_xten.parts }).compatible, true);
  assert.equal(checkPartCompatibility('sling', getPartById('sling', 'slg_pistol_lanyard'), rifleBase).compatible, false);

  // Fire mode extraction for manual/revolver platforms
  assert.deepEqual(getAvailableFireModes(getPartById('platform', pumpBase.platform)), ['PUMP-ACTION']);
  assert.deepEqual(getAvailableFireModes(getPartById('platform', PRESETS.marlin_1895_4570.parts.platform)), ['LEVER-ACTION']);
  assert.deepEqual(getAvailableFireModes(getPartById('platform', revBase.platform)), ['REVOLVER']);
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
