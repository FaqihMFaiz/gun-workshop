import { clamp } from './utils.js';

export const ARMOR_TARGETS = {
  armor_3a: { id: 'armor_3a', label: 'NIJ IIIA Soft Armor', short: 'NIJ IIIA', reqPen: 32 },
  armor_3: { id: 'armor_3', label: 'NIJ III AR500 Steel', short: 'NIJ III', reqPen: 62 },
  armor_4: { id: 'armor_4', label: 'NIJ IV Ceramic Plate', short: 'NIJ IV', reqPen: 84 }
};

export function getOpticZoomFactor(sightPart) {
  if (!sightPart || !sightPart.zoom) return 1;
  const matches = String(sightPart.zoom).match(/(\d+(?:\.\d+)?)/g);
  if (!matches || matches.length === 0) return 1;
  return Math.max(1, Number(matches[matches.length - 1]) || 1);
}

export function computeDistanceSpreadMultiplier(distanceMeters, sightPart) {
  const dist = Math.max(10, Number(distanceMeters) || 50);
  const baseFactor = Math.pow(dist / 50, 0.58);
  const zoom = getOpticZoomFactor(sightPart);
  if (dist >= 100 && zoom >= 3) {
    const opticRelief = clamp(1 - Math.log2(zoom) * 0.11, 0.55, 0.92);
    return Number((baseFactor * opticRelief).toFixed(3));
  }
  return Number(baseFactor.toFixed(3));
}

export function evaluateArmorPenetration(computed, targetType, distanceMeters) {
  const spec = ARMOR_TARGETS[targetType];
  if (!spec) {
    return { isArmor: false, penetrated: true };
  }
  const dist = Math.max(10, Number(distanceMeters) || 50);
  const rangeStat = computed && computed.stats ? (computed.stats.range || 50) : 50;
  const penStat = computed && computed.stats ? (computed.stats.penetration || 20) : 20;

  let retention = 1.0;
  if (dist > 100) {
    const floorRetention = clamp(0.72 + (rangeStat / 100) * 0.22, 0.72, 0.96);
    const t = clamp((dist - 100) / 900, 0, 1);
    retention = 1 - (1 - floorRetention) * t;
  }

  const effectivePen = Math.round(penStat * retention);
  return {
    isArmor: true,
    penetrated: effectivePen >= spec.reqPen,
    effectivePen,
    requiredPen: spec.reqPen,
    armorLabel: spec.label,
    armorShort: spec.short
  };
}

export function isPointOnTarget(x, y, targetType) {
  if (ARMOR_TARGETS[targetType]) {
    const onPlate = x >= 106 && x <= 214 && y >= 112 && y <= 254;
    const isCrit = onPlate && y <= 158 && x >= 126 && x <= 194;
    return { onTarget: onPlate, isCrit };
  }
  const distHead = Math.hypot(x - 160, y - 90);
  if (distHead <= 27) {
    return { onTarget: true, isCrit: true };
  }
  const onTorso = x >= 102 && x <= 218 && y >= 120 && y <= 265;
  return { onTarget: onTorso, isCrit: false };
}

export function computeLiveGroupMetrics(impacts, distanceMeters, shotsFired, shotsHit) {
  const sample = Array.isArray(impacts) ? impacts.slice(-30) : [];
  let maxPx = 0;
  for (let i = 0; i < sample.length; i++) {
    for (let j = i + 1; j < sample.length; j++) {
      const d = Math.hypot(sample[i].x - sample[j].x, sample[i].y - sample[j].y);
      if (d > maxPx) maxPx = d;
    }
  }
  const groupCm = Number((maxPx * 0.40).toFixed(1));
  const cmPerMoa = 0.02908 * Math.max(10, Number(distanceMeters) || 50);
  const groupMoa = Number((groupCm / cmPerMoa).toFixed(2));
  const fired = Number(shotsFired) || 0;
  const hit = Number(shotsHit) || 0;
  const accuracyPct = fired > 0 ? clamp(Math.round((hit / fired) * 100), 0, 100) : 0;

  return {
    hasGroup: sample.length >= 2,
    groupCm,
    groupMoa,
    accuracyPct
  };
}
