import { PARTS_DB } from '../data/catalog.js';

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function getPartById(category, partId) {
  const list = PARTS_DB[category] || [];
  return list.find(p => p.id === partId) || list[0];
}

export function formatGrams(g) {
  if (g === 0) return '0 g';
  if (g < 10) return `${Number(g.toFixed(2))} g`;
  if (g < 100) return `${Number(g.toFixed(1))} g`;
  return `${Math.round(g).toLocaleString()} g`;
}

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, ch => HTML_ESCAPE_MAP[ch]);
}

export function filterAndSortParts(categoryId, parts, selectionMap, filterOpts, checkCompatFn) {
  const list = Array.isArray(parts) ? parts : [];
  const equippedId = selectionMap ? selectionMap[categoryId] : null;
  const opts = filterOpts || {};
  const query = String(opts.query || '').trim().toLowerCase();
  const compatibleOnly = Boolean(opts.compatibleOnly);
  const sortBy = opts.sortBy || 'default';

  let compatibleCount = 0;
  const enriched = list.map((part, idx) => {
    const isEquipped = part.id === equippedId;
    const compat = checkCompatFn ? checkCompatFn(categoryId, part, selectionMap) : { compatible: true };
    const isBlocked = !compat.compatible && !isEquipped;
    if (compat.compatible) compatibleCount++;
    return { part, idx, isEquipped, compat, isBlocked };
  });

  const filtered = enriched.filter(({ part, isEquipped, isBlocked }) => {
    if (compatibleOnly && isBlocked && !isEquipped) return false;
    if (!query) return true;
    const haystack = [
      part.name,
      part.tag,
      part.desc,
      part.caliber,
      part.fireMode,
      part.propulsion
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(query);
  });

  if (sortBy !== 'default') {
    filtered.sort((a, b) => {
      const pa = a.part.stats || {};
      const pb = b.part.stats || {};
      switch (sortBy) {
        case 'cost_asc':
          return (pa.cost || 0) - (pb.cost || 0) || a.idx - b.idx;
        case 'cost_desc':
          return (pb.cost || 0) - (pa.cost || 0) || a.idx - b.idx;
        case 'weight_asc':
          return (pa.weight || 0) - (pb.weight || 0) || a.idx - b.idx;
        case 'damage_desc':
          return (pb.damage || 0) - (pa.damage || 0) || a.idx - b.idx;
        case 'accuracy_desc':
          return (pb.accuracy || 0) - (pa.accuracy || 0) || a.idx - b.idx;
        case 'control_desc':
          return (pb.control || 0) - (pa.control || 0) || a.idx - b.idx;
        default:
          return a.idx - b.idx;
      }
    });
  }

  return {
    items: filtered.map(({ part, isEquipped, compat, isBlocked }) => ({ part, isEquipped, compat, isBlocked })),
    totalCount: list.length,
    compatibleCount
  };
}