import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultFilters, filterLaptops, rankLaptops, getRecommendationReasons } from '../dist/catalog.js';

const models = [
  { id: 'work', brand: 'Lenovo', name: 'ThinkPad Work', cpu: 'Intel Core Ultra 7', cpuFamily: 'intel', gpu: 'Intel Arc', gpuType: 'integrated', ram: 32, storage: 1024, weight: 1.35, price: 600000, year: 2026, purposes: ['developer', 'office', 'student'] },
  { id: 'game', brand: 'ASUS', name: 'ROG Game', cpu: 'AMD Ryzen 9', cpuFamily: 'amd', gpu: 'NVIDIA RTX 5070', gpuType: 'discrete', ram: 32, storage: 1024, weight: 2.2, price: 950000, year: 2025, purposes: ['gaming', 'creative', 'developer'] },
  { id: 'light', brand: 'Apple', name: 'MacBook Air', cpu: 'Apple M4', cpuFamily: 'apple', gpu: 'Apple GPU', gpuType: 'integrated', ram: 16, storage: 256, weight: 1.24, price: 550000, year: 2025, purposes: ['student', 'office', 'developer'] },
  { id: 'cheap', brand: 'Acer', name: 'Aspire', cpu: 'AMD Ryzen 5', cpuFamily: 'amd', gpuType: 'integrated', ram: 16, storage: 512, weight: 1.8, price: 250000, year: 2024, purposes: ['student', 'office', 'budget'] },
  { id: 'unknown', brand: 'Lenovo', name: 'Unknown Edition', ram: null, storage: null, weight: null, price: null, year: 2026, purposes: ['office'] },
  { id: 'expensive', brand: 'ASUS', name: 'Studio', ram: 64, storage: 2048, weight: 2.5, price: 2400000, year: 2026, gpuType: 'discrete', purposes: ['creative'] },
];
const ids = list => list.map(model => model.id);

test('combines purpose, hardware, budget, brand, and search with AND', () => {
  const filters = { query: 'ULTRA ThinkPad', purpose: 'developer', maxPrice: 700000, minRam: 32, minStorage: 512, maxWeight: 1.5, gpuType: 'integrated', cpuFamily: 'intel', brands: ['lenovo'] };
  assert.deepEqual(ids(filterLaptops(models, filters)), ['work']);
  assert.deepEqual(filterLaptops(models, { ...filters, gpuType: 'discrete' }), []);
});

test('search matches literal punctuation safely and all tokens across fields', () => {
  assert.deepEqual(ids(filterLaptops(models, { query: 'Ryzen ASUS', maxPrice: 0 })), ['game']);
  assert.deepEqual(filterLaptops(models, { query: '.* [a-z] <script>' }), []);
});

test('GPU substring, exact OS, and inclusive screen bounds combine correctly', () => {
  const choices = [
    { ...models[1], id: 'rtx-windows', os: 'Windows', screen: 16 },
    { ...models[1], id: 'rtx-linux', os: 'Linux', screen: 16 },
    { ...models[1], id: 'other-gpu', gpu: 'NVIDIA RTX 5060', os: 'Windows', screen: 16 },
    { ...models[1], id: 'small', os: 'Windows', screen: 14 },
    { ...models[1], id: 'large', os: 'Windows', screen: 18 },
    { ...models[1], id: 'missing', os: 'Windows', screen: null },
  ];
  const filters = { gpuQuery: 'rTx 5070', os: 'Windows', minScreen: 15, maxScreen: 16 };
  assert.deepEqual(ids(filterLaptops(choices, filters)), ['rtx-windows']);
  assert.deepEqual(filterLaptops(choices, { ...filters, os: 'windows' }), []);
  assert.ok(!ids(filterLaptops(choices, { maxScreen: 16 })).includes('missing'));
  assert.ok(!ids(filterLaptops(choices, { minScreen: 13 })).includes('missing'));
});

test('unknown price stays discoverable by default but cannot satisfy a restrictive budget', () => {
  assert.ok(ids(filterLaptops(models)).includes('unknown'));
  assert.ok(!ids(filterLaptops(models, { maxPrice: 500000 })).includes('unknown'));
  assert.ok(!ids(filterLaptops(models)).includes('expensive'));
  assert.equal(filterLaptops(models, { maxPrice: 0 }).length, models.length);
});

test('unknown specs fail active requirements and null weight never appears lightest', () => {
  for (const filter of [{ minRam: 8 }, { minStorage: 128 }, { maxWeight: 3 }]) {
    assert.ok(!ids(filterLaptops(models, filter)).includes('unknown'));
  }
  assert.deepEqual(ids(filterLaptops(models, { sort: 'weight' })), ['light', 'work', 'cheap', 'game', 'unknown']);
});

test('sorts numeric prices with unknown last in either direction', () => {
  assert.deepEqual(ids(filterLaptops(models, { sort: 'price-asc' })), ['cheap', 'light', 'work', 'game', 'unknown']);
  assert.deepEqual(ids(filterLaptops(models, { sort: 'price-desc' })), ['game', 'work', 'light', 'cheap', 'unknown']);
  const byYear = filterLaptops(models, { sort: 'newest' });
  assert.equal(byYear[0].year, 2026);
  assert.equal(byYear.at(-1).year, 2024);
});

test('favorites combine with other filters and empty favorites has no matches', () => {
  assert.deepEqual(ids(filterLaptops(models, { savedOnly: true, savedIds: ['work', 'game'], gpuType: 'integrated' })), ['work']);
  assert.deepEqual(filterLaptops(models, { savedOnly: true }), []);
});

test('recommendation priorities vary results while honoring purpose and budget', () => {
  assert.deepEqual(ids(rankLaptops(models, { purpose: 'student', budget: 700000, priority: 'portable' })), ['light', 'work', 'cheap']);
  assert.equal(rankLaptops(models, { purpose: 'student', budget: 700000, priority: 'value' })[0].id, 'cheap');
  assert.equal(rankLaptops(models, { purpose: 'developer', budget: 1000000, priority: 'performance' })[0].id, 'game');
  assert.deepEqual(rankLaptops(models, { purpose: 'gaming', budget: 300000 }), []);
  assert.ok(!ids(rankLaptops(models, { purpose: 'office', budget: 2000000 })).includes('unknown'));
});

test('functions do not mutate input, return original objects, and explanations use known facts', () => {
  const before = JSON.stringify(models);
  filterLaptops(models, { sort: 'price-desc' });
  rankLaptops(models, { purpose: 'student' });
  assert.equal(JSON.stringify(models), before);
  assert.strictEqual(filterLaptops(models, { query: 'MacBook' })[0], models[2]);
  assert.ok(Object.isFrozen(defaultFilters));
  const reasons = getRecommendationReasons(models[1], { purpose: 'gaming', priority: 'performance' });
  assert.ok(reasons.some(reason => reason.includes('NVIDIA RTX 5070')));
  assert.ok(reasons.every(reason => !reason.includes('%')));
  assert.deepEqual(getRecommendationReasons(null), []);
  assert.deepEqual(filterLaptops(), []);
  assert.deepEqual(rankLaptops(), []);
});
