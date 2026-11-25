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