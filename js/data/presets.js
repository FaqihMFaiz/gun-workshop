export const PRESETS = {
  colt_m4a1_sopmod: {
    name: '5.56mm Tactical Carbine (Standard Issue)',
    camo: 'fde',
    parts: {
      platform: 'plat_ar_carbine', barrel: 'bar_standard_14', receiver: 'rec_milspec_556',
      gripStock: 'stk_telescopic', magazine: 'mag_std_30', sight: 'sgt_holo_mag',
      muzzle: 'muz_suppressor_ti', ammo: 'ammo_m855a1_fmj', underbarrel: 'ub_m203_40mm', sling: 'slg_vickers_2pt'
    }
  },
  sig_xm7_spear: {
    name: '6.8mm High-Pressure Combat Rifle',
    camo: 'fde',
    parts: {
      platform: 'plat_ar_carbine', barrel: 'bar_carbon_wrapped', receiver: 'rec_solarian_68',
      gripStock: 'stk_skeleton_fold', magazine: 'mag_fast_20', sight: 'sgt_sniper_lpvo',
      muzzle: 'muz_suppressor_ti', ammo: 'ammo_m995_7n39_ap', underbarrel: 'ub_harris_sbrm', sling: 'slg_vickers_2pt'
    }
  },
  kalashnikov_ak12_zenit: {
    name: '5.45mm Modernized Piston Assault Rifle',
    camo: 'obsidian',
    parts: {
      platform: 'plat_ak_series', barrel: 'bar_ak_415', receiver: 'rec_kalashnikov_stamped',
      gripStock: 'stk_zenitco_pt1', magazine: 'mag_bakelite_30', sight: 'sgt_reflex',
      muzzle: 'muz_heavy_brake', ammo: 'ammo_m995_7n39_ap', underbarrel: 'ub_gp25_kostyor', sling: 'slg_6sh5_canvas'
    }
  },
  pindad_ss2_v1: {
    name: '5.56mm Tropical Piston Service Rifle',
    camo: 'solarian',
    parts: {
      platform: 'plat_pindad_ss2', barrel: 'bar_ak_415', receiver: 'rec_milspec_556',
      gripStock: 'stk_skeleton_fold', magazine: 'mag_std_30', sight: 'sgt_acog_4x',
      muzzle: 'muz_thread_cap', ammo: 'ammo_m855a1_fmj', underbarrel: 'ub_okc3s_bayonet', sling: 'slg_vickers_2pt'
    }
  },
  norinco_qbz95: {
    name: '5.8mm Polymer Bullpup Rifle',
    camo: 'obsidian',
    parts: {
      platform: 'plat_qbz_95', barrel: 'bar_ak_415', receiver: 'rec_norinco_58',
      gripStock: 'stk_telescopic', magazine: 'mag_bakelite_30', sight: 'sgt_acog_4x',
      muzzle: 'muz_thread_cap', ammo: 'ammo_m855a1_fmj', underbarrel: 'ub_6kh5_bayonet', sling: 'slg_6sh5_canvas'
    }
  },
  dragunov_svd: {
    name: '7.62mm Semi-Auto Marksman Rifle',
    camo: 'obsidian',
    parts: {
      platform: 'plat_svd_dragunov', barrel: 'bar_rpk_590', receiver: 'rec_kalashnikov_stamped',
      gripStock: 'stk_hera_cqr', magazine: 'mag_fast_20', sight: 'sgt_pso1_4x',
      muzzle: 'muz_thread_cap', ammo: 'ammo_mk262_otm', underbarrel: 'ub_harris_sbrm', sling: 'slg_6sh5_canvas'
    }
  },
  kriss_vector_sbr: {
    name: '9mm Off-Axis Delayed-Blowback SMG',
    camo: 'obsidian',
    parts: {
      platform: 'plat_smg_pdw', barrel: 'bar_mp5_225', receiver: 'rec_hyperburst_9',
      gripStock: 'stk_skeleton_fold', magazine: 'mag_smg_30', sight: 'sgt_reflex',
      muzzle: 'muz_comp_pro', ammo: 'ammo_federal_jhp', underbarrel: 'ub_tlr1_hl', sling: 'slg_magpul_ms3'
    }
  },
  arcflash_emg02: {
    name: '10-Stage Electromagnetic Coilgun',
    camo: 'cyber',
    parts: {
      platform: 'plat_bullpup', barrel: 'bar_gauss_rail', receiver: 'rec_capacitor_pulse',
      gripStock: 'stk_hera_cqr', magazine: 'mag_cryo_cell', sight: 'sgt_reflex',
      muzzle: 'muz_arc_focus', ammo: 'ammo_ferro_armature', underbarrel: 'ub_atlas_bt10', sling: 'slg_magpul_ms3'
    }
  },
  ai_axmc_338: {
    name: '8.6mm Long-Range Bolt-Action Sniper',
    camo: 'arctic',
    parts: {
      platform: 'plat_sniper_dmr', barrel: 'bar_fluted_20', receiver: 'rec_arcane_matrix',
      gripStock: 'stk_prs_precision', magazine: 'mag_fast_20', sight: 'sgt_sniper_lpvo',
      muzzle: 'muz_heavy_brake', ammo: 'ammo_mk262_otm', underbarrel: 'ub_atlas_bt10', sling: 'slg_vickers_2pt'
    }
  },
  benelli_m1014: {
    name: '12-Gauge Gas-Operated Combat Shotgun',
    camo: 'obsidian',
    parts: {
      platform: 'plat_shotgun', barrel: 'bar_standard_14', receiver: 'rec_shotgun_12ga',
      gripStock: 'stk_telescopic', magazine: 'mag_shotgun_tube8', sight: 'sgt_reflex',
      muzzle: 'muz_thread_cap', ammo: 'ammo_12ga_flechette', underbarrel: 'ub_surefire_m640df', sling: 'slg_vickers_2pt'
    }
  },
  fn_m249_saw: {
    name: '5.56mm Squad Automatic LMG',
    camo: 'solarian',
    parts: {
      platform: 'plat_lmg', barrel: 'bar_m249_18', receiver: 'rec_m249_belt',
      gripStock: 'stk_m249_para', magazine: 'mag_saw_200', sight: 'sgt_acog_4x',
      muzzle: 'muz_lmg_slotted', ammo: 'ammo_m855a1_fmj', underbarrel: 'ub_harris_sbrm', sling: 'slg_vickers_2pt'
    }
  },
  pkp_pecheneg_lmg: {
    name: '7.62mm Forced-Air Cooled GPMG',
    camo: 'obsidian',
    parts: {
      platform: 'plat_pkp_lmg', barrel: 'bar_pkp_658', receiver: 'rec_pkp_belt',
      gripStock: 'stk_m249_para', magazine: 'mag_pkp_100', sight: 'sgt_pso1_4x',
      muzzle: 'muz_lmg_slotted', ammo: 'ammo_m995_7n39_ap', underbarrel: 'ub_harris_sbrm', sling: 'slg_6sh5_canvas'
    }
  },
  hk_mp5a3_smg: {
    name: '9mm Roller-Delayed Submachine Gun',
    camo: 'obsidian',
    parts: {
      platform: 'plat_mp5_smg', barrel: 'bar_mp5_225', receiver: 'rec_hk_roller_9',
      gripStock: 'stk_mp5_retract', magazine: 'mag_smg_30', sight: 'sgt_reflex',
      muzzle: 'muz_smg_3lug', ammo: 'ammo_federal_jhp', underbarrel: 'ub_surefire_m640df', sling: 'slg_magpul_ms3'
    }
  },
  pp19_vityaz_smg: {
    name: '9mm Straight-Blowback Submachine Gun',
    camo: 'obsidian',
    parts: {
      platform: 'plat_vityaz_smg', barrel: 'bar_mp5_225', receiver: 'rec_hk_roller_9',
      gripStock: 'stk_zenitco_pt1', magazine: 'mag_smg_30', sight: 'sgt_reflex',
      muzzle: 'muz_heavy_brake', ammo: 'ammo_federal_jhp', underbarrel: 'ub_perst4', sling: 'slg_6sh5_canvas'
    }
  }
};