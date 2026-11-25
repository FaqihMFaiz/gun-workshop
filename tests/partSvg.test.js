import test from 'node:test';
import assert from 'node:assert/strict';

import { CATEGORIES, CAMO_FINISHES, PARTS_DB } from '../js/data/catalog.js';
import { renderPartThumbnailSVG } from '../js/ui/partSvg.js';

test('renderPartThumbnailSVG generates valid SVG without undefined or NaN for every catalog part', () => {
  const defaultCamo = CAMO_FINISHES[0];

  for (const cat of CATEGORIES) {
    const list = PARTS_DB[cat.id] || [];
    assert.ok(list.length > 0, `Category ${cat.id} should contain parts`);

    for (const part of list) {
      const svg = renderPartThumbnailSVG(cat.id, part, defaultCamo);
      assert.ok(svg.startsWith('<svg viewBox="0 0 180 68"'), `Missing <svg> wrapper for ${cat.id}/${part.id}`);
      assert.ok(svg.endsWith('</svg>'), `Missing </svg> closer for ${cat.id}/${part.id}`);
      assert.equal(svg.includes('undefined'), false, `Found "undefined" in SVG for ${cat.id}/${part.id}`);
      assert.equal(svg.includes('NaN'), false, `Found "NaN" in SVG for ${cat.id}/${part.id}`);
    }
  }
});

test('renderPartThumbnailSVG applies camo finishes cleanly', () => {
  const samplePart = PARTS_DB.platform[0];
  for (const camo of CAMO_FINISHES) {
    const svg = renderPartThumbnailSVG('platform', samplePart, camo);
    assert.ok(svg.includes(camo.primary), `Expected finish color ${camo.primary} in thumbnail`);
  }
});
