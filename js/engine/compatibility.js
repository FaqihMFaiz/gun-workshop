import { CATEGORIES, PARTS_DB } from '../data/catalog.js';
import { state } from '../state.js';
import { getPartById } from './utils.js';

export function checkPartCompatibility(category, part, selectionMap) {
  if (category === 'platform' || !part) return { compatible: true };

  const plat = getPartById('platform', selectionMap.platform);
  const barrel = getPartById('barrel', selectionMap.barrel);
  const receiver = getPartById('receiver', selectionMap.receiver);
  const shape = plat.shape; // 'carbine' | 'ak' | 'bullpup' | 'smg' | 'sniper' | 'shotgun' | 'lmg' | 'pistol'

  const isPistol = shape === 'pistol';
  const isSmg = shape === 'smg';
  const isLmg = shape === 'lmg';
  const isShotgun = shape === 'shotgun';
  const isEnergyReady = receiver.id.includes('capacitor') || barrel.id === 'bar_gauss_rail';

  if (category === 'barrel') {
    if (isPistol && !['bar_cqb_short', 'bar_mp5_225'].includes(part.id)) {
      return { compatible: false, reason: 'Handgun slide chassis cannot mount full-length rifle, LMG, or coilgun barrels.' };
    }
    if (isSmg && ['bar_fluted_20', 'bar_rpk_590', 'bar_m249_18', 'bar_pkp_658', 'bar_gauss_rail'].includes(part.id)) {
      return { compatible: false, reason: 'SMG receiver trunnion cannot support heavy 20"+ rifle, LMG quick-change, or rail barrels.' };
    }
    if (!isLmg && ['bar_m249_18', 'bar_pkp_658'].includes(part.id)) {
      return { compatible: false, reason: 'Quick-change forced-air LMG barrels require an LMG feed-tray platform (5.56mm or 7.62mm LMG).' };
    }
    if (isLmg && ['bar_mp5_225', 'bar_cqb_short'].includes(part.id)) {
      return { compatible: false, reason: 'Short 9mm SMG / CQB barrels cannot lock into an LMG gas-block & quick-change trunnion.' };
    }
    if (isShotgun && ['bar_mp5_225', 'bar_gauss_rail', 'bar_m249_18', 'bar_pkp_658'].includes(part.id)) {
      return { compatible: false, reason: '12-Gauge combat shotgun receiver is incompatible with 9mm SMG, LMG, or coilgun barrels.' };
    }
  }

  if (category === 'receiver') {
    if (isPistol && !['rec_hyperburst_9', 'rec_hk_roller_9', 'rec_capacitor_pulse'].includes(part.id)) {
      return { compatible: false, reason: 'Handgun chassis only accepts compact pistol-caliber blowback or compact pulse receivers.' };
    }
    if (isSmg && ['rec_solarian_68', 'rec_arcane_matrix', 'rec_m249_belt', 'rec_pkp_belt', 'rec_capacitor_overcharge', 'rec_shotgun_12ga'].includes(part.id)) {
      return { compatible: false, reason: 'Submachine gun platform only accepts pistol-caliber blowback or compact pulse actions.' };
    }
    if (isLmg && ['rec_hyperburst_9', 'rec_hk_roller_9', 'rec_arcane_matrix', 'rec_shotgun_12ga'].includes(part.id)) {
      return { compatible: false, reason: 'LMG belt-feed chassis is incompatible with 9mm SMG blowback, shotgun, or bolt-action sniper receivers.' };
    }
    if (!isLmg && ['rec_m249_belt', 'rec_pkp_belt'].includes(part.id)) {
      return { compatible: false, reason: 'Open-bolt belt-feed receivers require an LMG platform (5.56mm or 7.62mm LMG).' };
    }
    if (isShotgun && part.id !== 'rec_shotgun_12ga') {
      return { compatible: false, reason: '12-Gauge combat shotgun frame requires the dedicated 12-Gauge Dual-Piston Gas Receiver.' };
    }
    if (!isShotgun && part.id === 'rec_shotgun_12ga') {
      return { compatible: false, reason: '12-Gauge Dual-Piston Gas Receiver fits exclusively in a 12-Gauge combat shotgun chassis.' };
    }
  }

  if (category === 'gripStock') {
    if (isPistol && !['stk_no_stock', 'stk_skeleton_fold', 'stk_mp5_retract'].includes(part.id)) {
      return { compatible: false, reason: 'Full-size rifle and LMG buttstocks cannot mount on a handgun grip module.' };
    }
    if (isLmg && part.id === 'stk_no_stock') {
      return { compatible: false, reason: 'Heavy belt-fed LMGs require a shoulder stock or hydraulic buffer assembly for safe control.' };
    }
    if (!isLmg && part.id === 'stk_m249_para') {
      return { compatible: false, reason: 'Hydraulic-buffer tubular LMG stock mounts exclusively to LMG rear trunnions.' };
    }
  }

  if (category === 'magazine') {
    if (isShotgun && part.id !== 'mag_shotgun_tube8') {
      return { compatible: false, reason: '12-Gauge combat shotgun feeds exclusively from the 7+1 under-barrel tubular magazine.' };
    }
    if (!isShotgun && part.id === 'mag_shotgun_tube8') {
      return { compatible: false, reason: 'Under-barrel 12-Gauge tubular magazine mounts exclusively on the 12-Gauge combat shotgun.' };
    }
    if (['mag_saw_200', 'mag_pkp_100'].includes(part.id) && !isLmg) {
      return { compatible: false, reason: '100/200-round linked belt boxes require an LMG belt-feed platform (5.56mm or 7.62mm LMG).' };
    }
    if (isLmg && ['mag_smg_30', 'mag_fast_20'].includes(part.id)) {
      return { compatible: false, reason: 'SMG 9mm stick magazines and compact pistol mags do not fit LMG feed trays.' };
    }
    if (isPistol && !['mag_fast_20', 'mag_smg_30'].includes(part.id)) {
      return { compatible: false, reason: 'Handgun grip magwell only accepts compact box or 9mm stick magazines.' };
    }
    if (isSmg && ['mag_std_30', 'mag_bakelite_30', 'mag_saw_200', 'mag_pkp_100'].includes(part.id)) {
      return { compatible: false, reason: 'Full-size rifle and LMG magazines are too wide for a 9mm SMG magazine well.' };
    }
    if (!isSmg && !isPistol && part.id === 'mag_smg_30') {
      return { compatible: false, reason: 'Slim 9x19mm SMG stick magazines require an SMG or handgun magwell.' };
    }
  }

  if (category === 'ammo') {
    if (['ammo_12ga_buckshot', 'ammo_12ga_flechette'].includes(part.id) && !isShotgun) {
      return { compatible: false, reason: '12-Gauge buckshot, sabot slugs, and flechettes only chamber in a 12-Gauge combat shotgun.' };
    }
    if (part.id === 'ammo_ferro_armature' && !isEnergyReady) {
      return { compatible: false, reason: 'Ferromagnetic steel dowels require a Capacitor Bank Receiver or 10-Stage Coil Barrel.' };
    }
    if (isShotgun && !['ammo_12ga_buckshot', 'ammo_12ga_flechette'].includes(part.id)) {
      return { compatible: false, reason: 'Only 12-Gauge shells (00 Buckshot or Sabot/Flechette) can chamber in a 12-Gauge shotgun.' };
    }
    if (isPistol && !['ammo_federal_jhp', 'ammo_sp6_subsonic', 'ammo_ferro_armature'].includes(part.id)) {
      return { compatible: false, reason: 'Handgun chambering only accepts pistol/subsonic loads (or coilgun armatures when pulse-equipped).' };
    }
    if (isSmg && ['ammo_mk262_otm', 'ammo_12ga_flechette', 'ammo_12ga_buckshot'].includes(part.id)) {
      return { compatible: false, reason: 'Heavy rifle match OTM and 12-Gauge shells exceed SMG chamber dimensions.' };
    }
  }

  if (category === 'sight') {
    if (isPistol && ['sgt_sniper_lpvo', 'sgt_pso1_4x', 'sgt_thermal_hud', 'sgt_acog_4x'].includes(part.id)) {
      return { compatible: false, reason: 'Magnified rifle scopes and thermal optics are too heavy for a reciprocating handgun slide.' };
    }
  }

  if (category === 'muzzle') {
    if (barrel.id === 'bar_integral_sd' && ['muz_suppressor_ti', 'muz_pbs1_suppressor', 'muz_smg_3lug'].includes(part.id)) {
      return { compatible: false, reason: 'Cannot stack an external suppressor onto an already integrally suppressed SD barrel.' };
    }
    if (isShotgun && ['muz_suppressor_ti', 'muz_pbs1_suppressor', 'muz_smg_3lug', 'muz_lmg_slotted'].includes(part.id)) {
      return { compatible: false, reason: 'Rifle, SMG, and LMG muzzle suppressors cannot mount to a 12-Gauge shotgun bore.' };
    }
    if (isPistol && ['muz_suppressor_ti', 'muz_pbs1_suppressor', 'muz_lmg_slotted'].includes(part.id)) {
      return { compatible: false, reason: 'Heavy rifle and LMG muzzle devices are too large for a handgun barrel thread.' };
    }
    if (part.id === 'muz_smg_3lug' && !isSmg && !isPistol) {
      return { compatible: false, reason: '9mm 3-Lug SMG suppressor cannot handle high-pressure rifle or LMG bore pressures.' };
    }
    if (part.id === 'muz_lmg_slotted' && !isLmg) {
      return { compatible: false, reason: 'Heavy venturi LMG flash suppressor is threaded specifically for heavy LMG / GPMG barrels.' };
    }
  }

  if (category === 'underbarrel') {
    if (['ub_m203_40mm', 'ub_gp25_kostyor'].includes(part.id)) {
      if (isPistol || isSmg || isLmg || isShotgun) {
        return { compatible: false, reason: '40mm underbarrel grenade launchers (40mm UBGL) only mount on standard assault rifles & carbines.' };
      }
      if (['bar_cqb_short', 'bar_mp5_225'].includes(barrel.id)) {
        return { compatible: false, reason: 'Equipped barrel is too short to clear the 40mm grenade launcher tube and barrel lug.' };
      }
    }
    if (isPistol && ['ub_harris_sbrm', 'ub_atlas_bt10', 'ub_bench_rest', 'ub_okc3s_bayonet', 'ub_6kh5_bayonet'].includes(part.id)) {
      return { compatible: false, reason: 'Rifle bipods, bench bags, and full-length bayonets cannot attach to a handgun dust cover.' };
    }
    if ((isSmg || isLmg) && ['ub_okc3s_bayonet', 'ub_6kh5_bayonet'].includes(part.id)) {
      return { compatible: false, reason: 'SMG and LMG barrels lack a standard rifle bayonet mounting lug.' };
    }
  }

  return { compatible: true };
}

export function autoResolveIncompatibilities(selectionMap) {
  const swaps = [];
  CATEGORIES.forEach(cat => {
    if (cat.id === 'platform') return;
    const currentPart = getPartById(cat.id, selectionMap[cat.id]);
    if (!checkPartCompatibility(cat.id, currentPart, selectionMap).compatible) {
      const validPart = (PARTS_DB[cat.id] || []).find(p => checkPartCompatibility(cat.id, p, selectionMap).compatible);
      if (validPart) {
        selectionMap[cat.id] = validPart.id;
        swaps.push(`${cat.short}: ${currentPart.name} -> ${validPart.name}`);
      }
    }
  });
  return swaps;
}

export function getAvailableFireModes(platform) {
  const fm = (platform && platform.fireMode ? platform.fireMode : 'AUTO').toUpperCase();
  if (fm.includes('BOLT')) return ['BOLT-ACTION'];
  if (fm.includes('2-STAGE') || fm.includes('PROGRESSIVE')) return ['SEMI', 'AUTO'];
  if (fm.includes('SEMI-AUTO') && !fm.includes('AUTO /') && !fm.includes('/ AUTO')) return ['SEMI'];
  const modes = [];
  if (fm.includes('AUTO')) modes.push('AUTO');
  if (fm.includes('3-RD')) modes.push('3-RD BURST');
  if (fm.includes('2-RD')) modes.push('2-RD BURST');
  if (fm.includes('SEMI') || modes.length === 0) modes.push('SEMI');
  return modes;
}

export function syncFireModeForPlatform(platform) {
  const modes = getAvailableFireModes(platform);
  if (!modes.includes(state.range.selectedFireMode)) {
    state.range.selectedFireMode = modes[0];
  }
}