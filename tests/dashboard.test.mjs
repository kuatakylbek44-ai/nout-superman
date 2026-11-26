import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { summarizeCatalog } from '../dist/dashboard.js';

test('dashboard reports the actual bundled catalogue and photo coverage', () => {
  const data = JSON.parse(fs.readFileSync(new URL('../dist/data.json', import.meta.url), 'utf8'));
  const summary = summarizeCatalog(data);
  assert.equal(summary.total, 1993);
  assert.equal(summary.brands, 27);
  assert.equal(summary.photos, 387);
  assert.equal(Math.round(summary.coverage * 10) / 10, 19.4);
  assert.equal(summary.topBrands.length, 8);
  assert.deepEqual(summary.topBrands[0], { brand: 'ASUS', count: 418 });
  assert.ok(summary.topBrands.every((item, index, list) => index === 0 || list[index - 1].count >= item.count));
});

test('unknown brands and absent photos do not inflate summary metrics', () => {
  const records = [
    { brand: 'ASUS', image: 'assets/photos/verified.png' },
    { brand: ' ASUS ', image: null },
    { brand: 'Lenovo', image: '' },
    { brand: null, image: ' ' },
    { brand: '', image: false },
  ];
  const original = structuredClone(records);
  const summary = summarizeCatalog(records);
  assert.equal(summary.total, 5);
  assert.equal(summary.brands, 2);
  assert.equal(summary.photos, 1);
  assert.equal(summary.coverage, 20);
  assert.deepEqual(summary.topBrands, [{ brand: 'ASUS', count: 2 }, { brand: 'Lenovo', count: 1 }]);
  assert.deepEqual(records, original);
});

test('an unavailable or empty catalogue has zero coverage, never NaN', () => {
  for (const value of [null, undefined, {}, { laptops: [] }, []]) {
    const summary = summarizeCatalog(value);
    assert.equal(summary.total, 0);
    assert.equal(summary.brands, 0);
    assert.equal(summary.photos, 0);
    assert.equal(summary.coverage, 0);
    assert.deepEqual(summary.topBrands, []);
  }
});
