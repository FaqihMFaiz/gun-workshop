import { CATEGORIES, PARTS_DB } from '../data/catalog.js';
import { state } from '../state.js';
import { getPartById } from './utils.js';

export function checkPartCompatibility(category, part, selectionMap) {
  if (category === 'platform' || !part) return { compatible: true };

  const plat = getPartById('platform', selectionMap.platform);
  const barrel = getPartById('barrel', selectionMap.barrel);
  const receiver = getPartById('receiver', selectionMap.receiver);
  const muzzle = getPartById('muzzle', selectionMap.muzzle);
  const underbarrel = getPartById('underbarrel', selectionMap.underbarrel);
  const shape = plat.shape; // 'carbine' | 'ak' | 'bullpup' | 'smg' | 'sniper' | 'shotgun' | 'lmg' | 'pistol' | 'amr' | 'pdw' | 'revolver' | 'lever'

  const isPistol = shape === 'pistol';
  const isRevolver = shape === 'revolver';
  const isHandgun = isPistol || isRevolver;
  const isSmg = shape === 'smg';
  const isPdw = shape === 'pdw';
  const isLmg = shape === 'lmg';
  const isShotgun = shape === 'shotgun';
  const isGasShotgun = plat.id === 'plat_shotgun';
  const isPumpShotgun = plat.id === 'plat_pump_shotgun';
  const isBullpup = shape === 'bullpup';
  const isBattleRifle = plat.id === 'plat_battle_rifle';
  const isSniper = shape === 'sniper';
  const isAmr = shape === 'amr';
  const isLever = shape === 'lever';
  const isBoltSniper = plat.id === 'plat_sniper_dmr';
  const isSawLmg = plat.id === 'plat_lmg';
  const isPkpLmg = plat.id === 'plat_pkp_lmg';

  const isCoilReceiver = receiver.id === 'rec_capacitor_pulse' || receiver.id === 'rec_capacitor_overcharge';
  const isExternalSuppressor = ['muz_suppressor_ti', 'muz_pbs1_suppressor', 'muz_smg_3lug', 'muz_flow_ti', 'muz_shotgun_salvo'].includes(muzzle.id);
  const isBayonetEquipped = ['ub_okc3s_bayonet', 'ub_6kh5_bayonet'].includes(underbarrel.id);

  if (category === 'receiver') {
    if (['rec_capacitor_pulse', 'rec_capacitor_overcharge'].includes(part.id) &&
        (isShotgun || isHandgun || isSmg || isPdw || isBoltSniper || isLmg || isAmr || isLever)) {
      return { compatible: false, reason: 'Electromagnetic coilgun capacitor banks only fit standard carbine, AK, bullpup, or semi-auto DMR frames.' };
    }
    if (isRevolver && part.id !== 'rec_pistol_striker') {
      return { compatible: false, reason: 'Double-action revolver frame requires a compact handgun lockwork assembly.' };
    }
    if (isPistol && !['rec_pistol_striker', 'rec_hyperburst_9', 'rec_hk_roller_9'].includes(part.id)) {
      return { compatible: false, reason: 'Handgun chassis only accepts compact striker-fired or 9mm blowback actions.' };
    }
    if (isSmg && !['rec_hyperburst_9', 'rec_hk_roller_9'].includes(part.id)) {
      return { compatible: false, reason: 'Submachine gun platform only accepts 9x19mm pistol-caliber blowback or roller-delayed receivers.' };
    }
    if (isPdw && !['rec_hk_roller_9', 'rec_hyperburst_9', 'rec_pistol_striker'].includes(part.id)) {
      return { compatible: false, reason: 'Compact 5.7mm PDW chassis only accepts compact blowback or roller-delayed receivers.' };
    }
    if (!isSmg && !isPistol && !isPdw && ['rec_hyperburst_9', 'rec_hk_roller_9'].includes(part.id)) {
      return { compatible: false, reason: 'Compact 9mm blowback receivers only fit SMG, PDW, and handgun platforms.' };
    }
    if (!isHandgun && !isPdw && part.id === 'rec_pistol_striker') {
      return { compatible: false, reason: 'Striker-fired handgun slide & FCU only fits handgun, revolver, or compact PDW frames.' };
    }
    if (isSawLmg && part.id !== 'rec_m249_belt') {
      return { compatible: false, reason: '5.56mm Squad Automatic LMG requires the 5.56mm Open-Bolt Belt & Box Feed Tray Receiver.' };
    }
    if (isPkpLmg && part.id !== 'rec_pkp_belt') {
      return { compatible: false, reason: '7.62mm Forced-Air GPMG requires the 7.62x54mmR Two-Stage Rimmed Belt-Feed Action.' };
    }
    if (!isSawLmg && part.id === 'rec_m249_belt') {
      return { compatible: false, reason: '5.56mm open-bolt belt-feed receiver requires the 5.56mm Squad Automatic LMG platform.' };
    }
    if (!isPkpLmg && part.id === 'rec_pkp_belt') {
      return { compatible: false, reason: '7.62x54mmR belt-feed receiver requires the 7.62mm Forced-Air Cooled GPMG platform.' };
    }
    if (isBoltSniper && !['rec_arcane_matrix', 'rec_straight_pull'].includes(part.id)) {
      return { compatible: false, reason: 'Bolt-Action Sniper chassis requires a precision 6-lug or straight-pull bolt action.' };
    }
    if (isAmr && !['rec_battle_762', 'rec_arcane_matrix', 'rec_straight_pull', 'rec_solarian_68'].includes(part.id)) {
      return { compatible: false, reason: '12.7mm Anti-Materiel Rifle requires a heavy high-pressure piston or magnum bolt receiver.' };
    }
    if (isLever && !['rec_straight_pull', 'rec_battle_762', 'rec_pump_shotgun'].includes(part.id)) {
      return { compatible: false, reason: 'Lever-action carbine requires a heavy manual or high-pressure lever/bolt receiver.' };
    }
    if (!isBoltSniper && !isAmr && part.id === 'rec_arcane_matrix') {
      return { compatible: false, reason: '8.6x70mm Magnum 6-lug bolt action only fits Bolt-Action Sniper and Anti-Materiel chassis.' };
    }
    if (isGasShotgun && part.id !== 'rec_shotgun_12ga') {
      return { compatible: false, reason: 'Semi-auto 12-Gauge shotgun frame requires the 12-Gauge Dual-Piston Gas Receiver.' };
    }
    if (isPumpShotgun && part.id !== 'rec_pump_shotgun') {
      return { compatible: false, reason: 'Pump-action 12-Gauge shotgun frame requires the 12-Gauge Forged Steel Pump Receiver.' };
    }
    if (!isGasShotgun && part.id === 'rec_shotgun_12ga') {
      return { compatible: false, reason: '12-Gauge Dual-Piston Gas Receiver fits exclusively in the semi-auto combat shotgun chassis.' };
    }
    if (!isPumpShotgun && !isLever && part.id === 'rec_pump_shotgun') {
      return { compatible: false, reason: 'Manual twin-action-bar receiver only fits Pump Shotgun or Lever-Action chassis.' };
    }
  }

  if (category === 'barrel') {
    if (isCoilReceiver && part.id !== 'bar_gauss_rail') {
      return { compatible: false, reason: 'Capacitor Bank receiver requires the 10-Stage Optical Induction Coil Barrel.' };
    }
    if (!isCoilReceiver && part.id === 'bar_gauss_rail') {
      return { compatible: false, reason: '10-Stage Optical Induction Coil Barrel requires a Capacitor Bank Receiver.' };
    }
    if (isRevolver && !['bar_pistol_5', 'bar_mp5_225'].includes(part.id)) {
      return { compatible: false, reason: 'Revolver frame only accepts 5.0"–8.9" compact handgun/revolver barrels.' };
    }
    if (isPistol && !['bar_pistol_5', 'bar_cqb_short', 'bar_mp5_225'].includes(part.id)) {
      return { compatible: false, reason: 'Handgun slide chassis cannot mount full-length rifle, LMG, or coilgun barrels.' };
    }
    if (!isHandgun && part.id === 'bar_pistol_5') {
      return { compatible: false, reason: '5.0" Threaded Match Pistol Barrel fits exclusively on handguns and revolvers.' };
    }
    if (isSmg && !['bar_mp5_225', 'bar_cqb_short', 'bar_sbr_115', 'bar_integral_sd'].includes(part.id)) {
      return { compatible: false, reason: 'SMG trunnion only accepts compact 8.9"–11.5" SMG/SBR or integral SD barrels.' };
    }
    if (isPdw && !['bar_mp5_225', 'bar_cqb_short', 'bar_sbr_115', 'bar_integral_sd'].includes(part.id)) {
      return { compatible: false, reason: 'Compact 5.7mm PDW chassis only clears 8.9"–11.5" or integral SD barrels.' };
    }
    if (!isSmg && !isPdw && !isHandgun && part.id === 'bar_mp5_225') {
      return { compatible: false, reason: '8.9" 3-Lug 9mm SMG barrel only fits SMG, PDW, and handgun platforms.' };
    }
    if (isSawLmg && (part.id === 'bar_pkp_658' || ['bar_mp5_225', 'bar_cqb_short', 'bar_pistol_5'].includes(part.id))) {
      return { compatible: false, reason: '5.56mm SAW LMG cannot mount 7.62mm GPMG or short pistol/SMG barrels.' };
    }
    if (isPkpLmg && ['bar_m249_18', 'bar_cqb_short', 'bar_sbr_115', 'bar_mp5_225', 'bar_pistol_5', 'bar_standard_14', 'bar_pencil_16', 'bar_carbon_wrapped', 'bar_integral_sd'].includes(part.id)) {
      return { compatible: false, reason: '7.62mm GPMG trunnion requires full-length heavy support or forced-air barrels.' };
    }
    if (!isLmg && ['bar_m249_18', 'bar_pkp_658'].includes(part.id)) {
      return { compatible: false, reason: 'Quick-change forced-air LMG barrels require an LMG feed-tray platform (5.56mm or 7.62mm LMG).' };
    }
    if (isBoltSniper && !['bar_sniper_26', 'bar_fluted_20', 'bar_rpk_590', 'bar_standard_14', 'bar_carbon_wrapped', 'bar_integral_sd'].includes(part.id)) {
      return { compatible: false, reason: '8.6mm Magnum bolt-action chassis requires a rifle/precision sniper barrel profile.' };
    }
    if (isAmr && !['bar_amr_29', 'bar_sniper_26', 'bar_fluted_20'].includes(part.id)) {
      return { compatible: false, reason: '12.7mm Anti-Materiel Rifle requires a 20"–29" heavy match or anti-materiel barrel.' };
    }
    if (!isAmr && part.id === 'bar_amr_29') {
      return { compatible: false, reason: '29.0" Fluted .50 BMG Anti-Materiel Barrel fits exclusively on the 12.7mm AMR chassis.' };
    }
    if (isLever && !['bar_standard_14', 'bar_pencil_16', 'bar_fluted_20', 'bar_integral_sd'].includes(part.id)) {
      return { compatible: false, reason: 'Lever-action tubular chassis accepts 14.5"–20" carbine, pencil, or SD barrels.' };
    }
    if (isShotgun && !['bar_shotgun_18', 'bar_shotgun_14', 'bar_integral_sd'].includes(part.id)) {
      return { compatible: false, reason: '12-Gauge combat shotgun requires an 18.5" smoothbore, 14.0" breacher, or SD shotgun barrel.' };
    }
    if (!isShotgun && ['bar_shotgun_18', 'bar_shotgun_14'].includes(part.id)) {
      return { compatible: false, reason: 'Smoothbore 12-Gauge shotgun barrels only fit 12-Gauge shotgun receivers.' };
    }
  }

  if (category === 'gripStock') {
    if (isRevolver && !['stk_no_stock', 'stk_wood_fixed'].includes(part.id)) {
      return { compatible: false, reason: 'Revolver frame only accepts a stockless grip or walnut target grip.' };
    }
    if (isPistol && !['stk_no_stock', 'stk_skeleton_fold', 'stk_mp5_retract'].includes(part.id)) {
      return { compatible: false, reason: 'Full-size rifle and LMG buttstocks cannot mount on a handgun grip module.' };
    }
    if ((isSniper || isAmr) && ['stk_no_stock', 'stk_mp5_retract', 'stk_pdw_twinrod', 'stk_underfolder', 'stk_top_fold_cage', 'stk_bullpup_chassis'].includes(part.id)) {
      return { compatible: false, reason: 'Long-range sniper and anti-materiel chassis require a full rigid rifle shoulder stock.' };
    }
    if (isLmg && ['stk_no_stock', 'stk_bullpup_chassis', 'stk_pdw_twinrod'].includes(part.id)) {
      return { compatible: false, reason: 'Heavy belt-fed LMGs require a sturdy shoulder stock or hydraulic buffer assembly.' };
    }
    if (!isLmg && part.id === 'stk_m249_para') {
      return { compatible: false, reason: 'Hydraulic-buffer tubular LMG stock mounts exclusively to LMG rear trunnions.' };
    }
    if (!isBullpup && !isPdw && part.id === 'stk_bullpup_chassis') {
      return { compatible: false, reason: 'Integrated bullpup buttpad chassis fits exclusively on bullpup and compact PDW frames.' };
    }
    if ((isBullpup || isHandgun) && ['stk_monte_carlo', 'stk_top_fold_cage', 'stk_underfolder'].includes(part.id)) {
      return { compatible: false, reason: 'Field, top-folding cage, and underfolding stocks cannot mount on bullpup or handgun frames.' };
    }
  }

  if (category === 'magazine') {
    if (isCoilReceiver && part.id !== 'mag_cryo_cell') {
      return { compatible: false, reason: 'Coilgun capacitor action requires the 18-Round Steel Armature + 63V Li-Ion Battery Pack.' };
    }
    if (!isCoilReceiver && part.id === 'mag_cryo_cell') {
      return { compatible: false, reason: '63V Li-Ion Armature Battery Pack is only compatible with a Capacitor Bank Coilgun Receiver.' };
    }
    if (isRevolver && part.id !== 'mag_revolver_6') {
      return { compatible: false, reason: 'Double-action revolver feeds exclusively from its 6-Round Swing-Out Cylinder.' };
    }
    if (!isRevolver && part.id === 'mag_revolver_6') {
      return { compatible: false, reason: '6-Round Speedloader Cylinder is exclusive to the .44 Magnum Revolver.' };
    }
    if (isShotgun && !['mag_shotgun_tube5', 'mag_shotgun_tube8', 'mag_shotgun_tube10'].includes(part.id)) {
      return { compatible: false, reason: '12-Gauge combat shotgun feeds exclusively from under-barrel tubular magazines (5+1 / 7+1 / 10+1).' };
    }
    if (!isShotgun && !isLever && ['mag_shotgun_tube5', 'mag_shotgun_tube8', 'mag_shotgun_tube10'].includes(part.id)) {
      return { compatible: false, reason: 'Under-barrel tubular magazines only mount on 12-Gauge shotguns or lever-action carbines.' };
    }
    if (isLever && !['mag_shotgun_tube5', 'mag_shotgun_tube8', 'mag_sniper_10'].includes(part.id)) {
      return { compatible: false, reason: 'Lever-action carbine only accepts tubular under-barrel magazines or compact 10-round box mags.' };
    }
    if (isPkpLmg && part.id !== 'mag_pkp_100') {
      return { compatible: false, reason: '7.62x54mmR GPMG feeds exclusively from the 100-Round Stamped Steel Belt Box.' };
    }
    if (!isPkpLmg && part.id === 'mag_pkp_100') {
      return { compatible: false, reason: '100-Round 7.62x54mmR steel belt box fits exclusively on the 7.62mm Forced-Air Cooled GPMG.' };
    }
    if (!isSawLmg && ['mag_saw_200', 'mag_saw_pouch_100'].includes(part.id)) {
      return { compatible: false, reason: '5.56mm SAW belt boxes and 100-rd assault pouches require the 5.56mm Squad Automatic LMG.' };
    }
    if (isSawLmg && !['mag_saw_200', 'mag_saw_pouch_100', 'mag_std_30', 'mag_ext_45', 'mag_drum_75', 'mag_coupled_30'].includes(part.id)) {
      return { compatible: false, reason: '5.56mm SAW accepts 100/200-rd belts or standard STANAG rifle magazines only.' };
    }
    if ((isBoltSniper || isAmr) && !['mag_sniper_10', 'mag_fast_20', 'mag_std_30'].includes(part.id)) {
      return { compatible: false, reason: 'Precision sniper and anti-materiel chassis require 10–20rd box magazines.' };
    }
    if (isPistol && !['mag_pistol_15', 'mag_pistol_33', 'mag_fast_20', 'mag_smg_30'].includes(part.id)) {
      return { compatible: false, reason: 'Handgun grip magwell only accepts 15/33-rd handgun mags or compact stick magazines.' };
    }
    if (!isPistol && ['mag_pistol_15', 'mag_pistol_33'].includes(part.id)) {
      return { compatible: false, reason: 'Flush-fit and extended handgun grip magazines fit exclusively in a handgun magwell.' };
    }
    if (isPdw && !['mag_pdw_50', 'mag_smg_30', 'mag_fast_20'].includes(part.id)) {
      return { compatible: false, reason: 'Compact PDW only accepts 50-rd top-feed PDW mags or slim SMG/compact magazines.' };
    }
    if (!isPdw && !isSmg && part.id === 'mag_pdw_50') {
      return { compatible: false, reason: '50-Round Top-Mounted Horizontal PDW Magazine fits exclusively on PDW or SMG platforms.' };
    }
    if (isSmg && !['mag_smg_30', 'mag_pdw_50', 'mag_fast_20', 'mag_drum_75'].includes(part.id)) {
      return { compatible: false, reason: 'Full-size rifle and belt magazines cannot seat in a 9mm SMG magazine well.' };
    }
    if (!isSmg && !isPistol && !isPdw && part.id === 'mag_smg_30') {
      return { compatible: false, reason: 'Slim 9x19mm SMG stick magazines require an SMG, PDW, or handgun magwell.' };
    }
  }

  if (category === 'ammo') {
    if (isCoilReceiver && part.id !== 'ammo_ferro_armature') {
      return { compatible: false, reason: 'Electromagnetic coilgun cannot fire chemical propellant cartridges — load Ferromagnetic Steel Armatures.' };
    }
    if (!isCoilReceiver && part.id === 'ammo_ferro_armature') {
      return { compatible: false, reason: 'Ferromagnetic steel dowels require a Capacitor Bank Coilgun Receiver.' };
    }
    const is12GaAmmo = ['ammo_12ga_buckshot', 'ammo_12ga_slug', 'ammo_12ga_flechette', 'ammo_12ga_dragons_breath'].includes(part.id);
    if (is12GaAmmo && !isShotgun) {
      return { compatible: false, reason: '12-Gauge shells only chamber in a 12-Gauge combat shotgun.' };
    }
    if (isShotgun && !is12GaAmmo) {
      return { compatible: false, reason: 'Only 12-Gauge shells (Buckshot, Solid Slug, Flechette, or Dragon\'s Breath) chamber in a 12-Gauge shotgun.' };
    }
    if (isHandgun && !['ammo_federal_jhp', 'ammo_plus_p', 'ammo_sp6_subsonic', 'ammo_frangible_cqb'].includes(part.id)) {
      return { compatible: false, reason: 'Handgun & revolver chambers only accept pistol JHP, +P+, subsonic, or frangible CQB loads.' };
    }
    if (isSmg && !['ammo_federal_jhp', 'ammo_plus_p', 'ammo_sp6_subsonic', 'ammo_frangible_cqb', 'ammo_tracer_api'].includes(part.id)) {
      return { compatible: false, reason: 'High-pressure rifle spitzer/sabot rounds and 12-Gauge shells exceed 9mm SMG chamber dimensions.' };
    }
    if (isPdw && !['ammo_m995_7n39_ap', 'ammo_federal_jhp', 'ammo_plus_p', 'ammo_sp6_subsonic', 'ammo_frangible_cqb', 'ammo_tracer_api'].includes(part.id)) {
      return { compatible: false, reason: '5.7mm PDW chamber cannot accept heavy match OTM, .50 SLAP, or 12-Gauge shells.' };
    }
    if (isAmr && !['ammo_m855a1_fmj', 'ammo_m995_7n39_ap', 'ammo_mk262_otm', 'ammo_tracer_api', 'ammo_slap_sabot'].includes(part.id)) {
      return { compatible: false, reason: '12.7mm Anti-Materiel Rifle requires full-power FMJ, AP, Match, Tracer/API, or SLAP sabot ammunition.' };
    }
    if (part.id === 'ammo_slap_sabot' && !isAmr && !isBoltSniper && !isBattleRifle) {
      return { compatible: false, reason: 'Sub-Caliber Sabot (SLAP) penetrators require a 7.62 NATO, 8.6 Magnum, or .50 BMG rifle chamber.' };
    }
  }

  if (category === 'sight') {
    if (isHandgun && ['sgt_sniper_lpvo', 'sgt_sniper_5_25', 'sgt_pso1_4x', 'sgt_thermal_hud', 'sgt_acog_4x', 'sgt_nvg_gen3', 'sgt_holo_3x', 'sgt_canted_combo'].includes(part.id)) {
      return { compatible: false, reason: 'Magnified rifle scopes, magnifiers, and night-vision optics are too heavy for a handgun slide or revolver frame.' };
    }
  }

  if (category === 'muzzle') {
    if (isCoilReceiver && part.id !== 'muz_arc_focus') {
      return { compatible: false, reason: 'Coilgun barrel produces no propellant gas — mount the Optical Chrono-Gate & Booster Coil Stage.' };
    }
    if (!isCoilReceiver && part.id === 'muz_arc_focus') {
      return { compatible: false, reason: 'Optical Chrono-Gate & Booster Coil Stage only mounts on an Electromagnetic Coilgun.' };
    }
    if (barrel.id === 'bar_integral_sd' && part.id !== 'muz_thread_cap') {
      return { compatible: false, reason: 'Integrally suppressed SD barrel cannot mount external suppressors, brakes, or compensators.' };
    }
    if (['muz_suppressor_ti', 'muz_pbs1_suppressor', 'muz_smg_3lug', 'muz_flow_ti', 'muz_shotgun_salvo'].includes(part.id) && isBayonetEquipped) {
      return { compatible: false, reason: 'Cannot mount a sound suppressor while a bayonet is locked onto the muzzle collar.' };
    }
    if (isRevolver && !['muz_thread_cap', 'muz_pistol_micro_comp', 'muz_comp_pro'].includes(part.id)) {
      return { compatible: false, reason: 'Revolver cylinder gap vents pressurized gas laterally — suppressors and rifle/shotgun muzzles cannot seal.' };
    }
    if (isShotgun && !['muz_thread_cap', 'muz_breacher_choke', 'muz_shotgun_salvo', 'muz_linear_comp'].includes(part.id)) {
      return { compatible: false, reason: '12-Gauge shotgun bore only accepts standard caps, breacher chokes, Salvo shotgun suppressors, or linear blast cans.' };
    }
    if (!isShotgun && ['muz_breacher_choke', 'muz_shotgun_salvo'].includes(part.id)) {
      return { compatible: false, reason: '12-Gauge breaching chokes and Salvo shotgun suppressors only thread onto 12-Gauge shotgun barrels.' };
    }
    if (isPistol && !['muz_thread_cap', 'muz_pistol_micro_comp', 'muz_comp_pro', 'muz_linear_comp', 'muz_smg_3lug'].includes(part.id)) {
      return { compatible: false, reason: 'Heavy rifle, shotgun, and LMG muzzle devices are too large for a handgun barrel thread.' };
    }
    if (!isHandgun && part.id === 'muz_pistol_micro_comp') {
      return { compatible: false, reason: 'Slide-flush micro pistol compensator fits exclusively on handgun and revolver barrels.' };
    }
    if ((isSmg || isPdw) && ['muz_suppressor_ti', 'muz_pbs1_suppressor', 'muz_lmg_slotted'].includes(part.id)) {
      return { compatible: false, reason: 'Compact SMG and PDW barrel threads cannot mount heavy full-length rifle or LMG muzzle devices.' };
    }
    if (part.id === 'muz_smg_3lug' && !isSmg && !isPdw && !isPistol) {
      return { compatible: false, reason: '9mm 3-Lug SMG suppressor cannot handle high-pressure rifle, shotgun, or LMG bore pressures.' };
    }
    if (part.id === 'muz_lmg_slotted' && !isLmg && !isAmr) {
      return { compatible: false, reason: 'Heavy venturi flash suppressor is threaded specifically for heavy LMG, GPMG, and AMR barrels.' };
    }
  }

  if (category === 'underbarrel') {
    if (isHandgun && !['ub_none', 'ub_tlr1_hl', 'ub_perst4'].includes(part.id)) {
      return { compatible: false, reason: 'Handgun dust-cover rail only supports compact weapon lights or compact aiming lasers.' };
    }
    if (['ub_m203_40mm', 'ub_gp25_kostyor', 'ub_masterkey_12ga'].includes(part.id)) {
      if (isHandgun || isSmg || isPdw || isLmg || isShotgun || isSniper || isAmr || isLever || isBullpup) {
        return { compatible: false, reason: 'Underbarrel 40mm launchers and Masterkey breaching shotguns only mount on standard assault/battle rifles.' };
      }
      if (['bar_cqb_short', 'bar_sbr_115', 'bar_mp5_225', 'bar_pistol_5', 'bar_integral_sd', 'bar_gauss_rail', 'bar_rpk_590'].includes(barrel.id)) {
        return { compatible: false, reason: 'Equipped barrel cannot physically clear an underbarrel launcher or breaching shotgun.' };
      }
    }
    if (['ub_okc3s_bayonet', 'ub_6kh5_bayonet'].includes(part.id)) {
      if (isHandgun || isSmg || isPdw || isLmg || isSniper || isAmr || isLever || isShotgun) {
        return { compatible: false, reason: 'Platform lacks a standard infantry rifle bayonet lug.' };
      }
      if (['bar_cqb_short', 'bar_sbr_115', 'bar_mp5_225', 'bar_pistol_5', 'bar_integral_sd', 'bar_gauss_rail'].includes(barrel.id)) {
        return { compatible: false, reason: 'Equipped barrel profile cannot lock a bayonet muzzle ring.' };
      }
      if (isExternalSuppressor) {
        return { compatible: false, reason: 'Bayonet muzzle ring cannot clear an external sound suppressor.' };
      }
    }
    if (['ub_harris_sbrm', 'ub_atlas_bt10', 'ub_grip_pod'].includes(part.id)) {
      if (barrel.id === 'bar_rpk_590' && part.id !== 'ub_grip_pod') {
        return { compatible: false, reason: '23.2" Heavy Support Barrel already includes an integrated folding front bipod.' };
      }
      if (isShotgun && part.id !== 'ub_grip_pod') {
        return { compatible: false, reason: '12-Gauge combat shotgun forend is not designed for precision rifle bipods.' };
      }
    }
  }

  if (category === 'sling') {
    if (isHandgun && ['slg_vickers_2pt', 'slg_6sh5_canvas', 'slg_3pt_patrol', 'slg_lmg_harness'].includes(part.id)) {
      return { compatible: false, reason: 'Rifle slings and LMG harnesses cannot anchor to a handgun frame — use a coiled lanyard or single-point.' };
    }
    if (!isHandgun && part.id === 'slg_pistol_lanyard') {
      return { compatible: false, reason: 'Coiled Kevlar retention lanyard is designed exclusively for handguns and revolvers.' };
    }
    if ((isSmg || isPdw) && part.id === 'slg_lmg_harness') {
      return { compatible: false, reason: 'Heavy machine-gunner support harness is oversized for compact SMGs and PDWs.' };
    }
  }

  return { compatible: true };
}

export function autoResolveIncompatibilities(selectionMap) {
  const resolveOrder = ['receiver', 'barrel', 'gripStock', 'magazine', 'ammo', 'sight', 'muzzle', 'underbarrel', 'sling'];
  const swaps = [];

  for (let pass = 0; pass < 2; pass++) {
    let passSwaps = 0;
    resolveOrder.forEach(catId => {
      const catObj = CATEGORIES.find(c => c.id === catId);
      const currentPart = getPartById(catId, selectionMap[catId]);
      if (!checkPartCompatibility(catId, currentPart, selectionMap).compatible) {
        const validPart = (PARTS_DB[catId] || []).find(p => checkPartCompatibility(catId, p, selectionMap).compatible);
        if (validPart) {
          selectionMap[catId] = validPart.id;
          swaps.push(`${catObj ? catObj.short : catId}: ${currentPart.name} -> ${validPart.name}`);
          passSwaps++;
        }
      }
    });
    if (passSwaps === 0) break;
  }

  return swaps;
}

export function getAvailableFireModes(platform) {
  const fm = (platform && platform.fireMode ? platform.fireMode : 'AUTO').toUpperCase();
  if (fm.includes('BOLT')) return ['BOLT-ACTION'];
  if (fm.includes('PUMP')) return ['PUMP-ACTION'];
  if (fm.includes('LEVER')) return ['LEVER-ACTION'];
  if (fm.includes('REVOLVER')) return ['REVOLVER'];
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