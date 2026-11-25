import { CATEGORIES, CAMO_FINISHES, PARTS_DB } from '../data/catalog.js';
import { autoResolveIncompatibilities } from './compatibility.js';

function toBase64Url(str) {
  let b64;
  if (typeof TextEncoder !== 'undefined' && typeof btoa !== 'undefined') {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) {
      bin += String.fromCharCode(bytes[i]);
    }
    b64 = btoa(bin);
  } else if (typeof Buffer !== 'undefined') {
    b64 = Buffer.from(str, 'utf8').toString('base64');
  } else {
    b64 = '';
  }
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(token) {
  if (typeof token !== 'string' || !token) return null;
  const padded = token.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((token.length + 3) % 4);
  if (typeof TextDecoder !== 'undefined' && typeof atob !== 'undefined') {
    const bin = atob(padded);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf8');
  }
  return null;
}

export function encodeBuildToHash(buildState) {
  const safe = buildState || {};
  const partsMap = safe.selectedParts || safe.parts || {};
  const payload = {
    n: String(safe.weaponName || 'Custom Build').trim().slice(0, 80),
    c: safe.camoId || 'obsidian',
    f: safe.furnitureCamoId || 'fde',
    t: safe.twoToneEnabled ? 1 : 0,
    p: CATEGORIES.map(cat => partsMap[cat.id] || (PARTS_DB[cat.id] && PARTS_DB[cat.id][0] ? PARTS_DB[cat.id][0].id : ''))
  };
  return `#build=${toBase64Url(JSON.stringify(payload))}`;
}

export function decodeBuildFromHash(hashOrUrl) {
  if (typeof hashOrUrl !== 'string' || !hashOrUrl) return null;

  let encoded = null;
  const hashIdx = hashOrUrl.indexOf('#build=');
  if (hashIdx !== -1) {
    encoded = hashOrUrl.slice(hashIdx + 7).split('&')[0];
  } else {
    const queryIdx = hashOrUrl.indexOf('build=');
    if (queryIdx !== -1) {
      encoded = hashOrUrl.slice(queryIdx + 6).split('&')[0].split('#')[0];
    }
  }
  if (!encoded) return null;

  try {
    const jsonStr = fromBase64Url(decodeURIComponent(encoded));
    if (!jsonStr) return null;
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.p)) return null;

    const parts = {};
    let validCount = 0;
    CATEGORIES.forEach((cat, idx) => {
      const candidateId = parsed.p[idx];
      const list = PARTS_DB[cat.id] || [];
      if (typeof candidateId === 'string' && list.some(p => p.id === candidateId)) {
        parts[cat.id] = candidateId;
        validCount++;
      } else if (list[0]) {
        parts[cat.id] = list[0].id;
      }
    });

    if (validCount === 0) return null;

    const autoSwaps = autoResolveIncompatibilities(parts);
    const weaponName = (typeof parsed.n === 'string' && parsed.n.trim())
      ? parsed.n.trim().slice(0, 80)
      : 'Shared Custom Build';
    const camoId = (typeof parsed.c === 'string' && CAMO_FINISHES.some(c => c.id === parsed.c))
      ? parsed.c
      : 'obsidian';
    const furnitureCamoId = (typeof parsed.f === 'string' && CAMO_FINISHES.some(c => c.id === parsed.f))
      ? parsed.f
      : 'fde';
    const twoToneEnabled = Boolean(parsed.t);

    return {
      weaponName,
      camoId,
      furnitureCamoId,
      twoToneEnabled,
      parts,
      autoSwaps
    };
  } catch (err) {
    return null;
  }
}

export function buildShareableUrl(buildState, baseHref) {
  const cleanBase = String(baseHref || '')
    .split('#')[0]
    .replace(/([?&])build=[^&]*(&|$)/, (m, p1, p2) => (p1 === '?' && p2 === '&' ? '?' : ''))
    .replace(/[?&]$/, '');
  return `${cleanBase}${encodeBuildToHash(buildState)}`;
}
