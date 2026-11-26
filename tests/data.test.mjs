import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const data = JSON.parse(await readFile(new URL('../dist/data.json', import.meta.url), 'utf8'));
const laptops = data.laptops;
const archived = laptops.filter(laptop => laptop.sourceKind === 'archive');
const manufacturer = laptops.filter(laptop => laptop.sourceKind === 'manufacturer');
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const positive = value => typeof value === 'number' && Number.isFinite(value) && value > 0;
const normalized = value => typeof value === 'string'
  ? value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
  : value;

test('catalog has a broad archive, manufacturer entries, and unique usable IDs', () => {
  assert.ok(laptops.length >= 1000);
  assert.ok(manufacturer.length >= 24);
  assert.ok(new Set(laptops.map(laptop => laptop.brand)).size >= 20);
  assert.equal(new Set(laptops.map(laptop => laptop.id)).size, laptops.length);
  for (const laptop of laptops) {
    assert.match(laptop.id, /^[a-z0-9-]+$/, laptop.id);
    for (const field of ['brand', 'name', 'cpu', 'family', 'modelPart', 'sourceUrl']) {
      assert.ok(typeof laptop[field] === 'string' && laptop[field].trim(), `${laptop.id}: ${field}`);
    }
    assert.equal(new URL(laptop.sourceUrl).protocol, 'https:');
  }
});

test('archive provenance preserves the original source, date, license, and row counts', () => {
  const source = data.archive;
  assert.equal(source.author, 'Juan Merino');
  assert.equal(source.license, 'Apache-2.0');
  assert.equal(source.sourceDate, '2023-06-25');
  assert.equal(source.publishedAt, '2023-07-12');
  assert.equal(source.originalRows, 2160);
  assert.equal(source.uniqueConfigurations, archived.length);
  assert.equal(archived.reduce((sum, laptop) => sum + laptop.sourceListingCount, 0), source.originalRows);
  assert.match(source.csvUrl, /juanmerino89\/laptops-data-cleaning\/[a-f0-9]{40}\/laptops\.csv$/);
  assert.match(source.licenseUrl, /kaggle\.com\/datasets\/juanmerinobermejo\/laptops-price-dataset/);
  assert.match(source.licenseText, /Apache License\s+Version 2\.0/);
  assert.match(source.licenseText, /END OF TERMS AND CONDITIONS/);
  assert.match(source.modificationNotice, /Modified for Nout/);
  assert.match(source.modificationNotice, /historical, not current offers/);
  for (const laptop of archived) {
    assert.equal(laptop.sourceUrl, source.sourceUrl, laptop.id);
    assert.equal(laptop.sourceDate, source.sourceDate, laptop.id);
    assert.equal(laptop.datasetLicense, source.license, laptop.id);
    assert.ok(typeof laptop.sourceName === 'string' && laptop.sourceName.length > 10, laptop.id);
    assert.ok(Number.isInteger(laptop.sourceListingCount) && laptop.sourceListingCount >= 1, laptop.id);
    assert.ok(['New', 'Refurbished'].includes(laptop.sourceCondition), laptop.id);
  }
});

test('archival unknowns remain unknown rather than becoming current facts', () => {
  for (const laptop of archived) {
    for (const field of ['year', 'weight', 'os', 'price', 'verifiedAt']) {
      assert.equal(laptop[field], null, `${laptop.id}: unknown ${field}`);
    }
    assert.equal(laptop.priceKind, 'unknown', laptop.id);
    assert.ok(laptop.gpuType === 'unknown' || laptop.gpuType === 'discrete', laptop.id);
    if (laptop.gpu === null) assert.equal(laptop.gpuType, 'unknown', laptop.id);
    assert.match(laptop.importedAt, isoDate, laptop.id);
    assert.ok(laptop.importedAt >= laptop.sourceDate, laptop.id);
    // Import time and listing condition are not a new manufacturer verification.
    assert.notEqual(laptop.verifiedAt, laptop.importedAt, laptop.id);
  }
  assert.ok(archived.some(laptop => laptop.gpu === null));
  assert.ok(archived.some(laptop => laptop.storage === null));
  assert.ok(archived.some(laptop => laptop.screen === null));
});

test('2023 EUR prices cannot be mistaken for current KZT offers', () => {
  assert.equal(data.archive.currency, 'EUR');
  assert.equal(data.archive.currentPricesAvailable, false);
  for (const laptop of archived) {
    assert.equal(laptop.originalCurrency, 'EUR', laptop.id);
    assert.equal(laptop.originalPriceDate, data.archive.sourceDate, laptop.id);
    assert.ok(laptop.originalPrice === null || positive(laptop.originalPrice), laptop.id);
    assert.equal(laptop.price, null, `${laptop.id}: no invented currency conversion`);
    assert.equal(laptop.priceKind, 'unknown', laptop.id);
  }
  for (const laptop of manufacturer) {
    if (positive(laptop.price)) assert.equal(laptop.priceKind, 'estimate', laptop.id);
  }
});

test('duplicate archival configurations are merged despite punctuation and GPU spacing', () => {
  const seen = new Map();
  const duplicates = [];
  for (const laptop of archived) {
    const identity = JSON.stringify([
      laptop.brand, laptop.name, laptop.cpu, laptop.ram, laptop.storage,
      laptop.gpu, laptop.screen, laptop.display,
    ].map(normalized));
    if (seen.has(identity)) duplicates.push(`${seen.get(identity)} / ${laptop.id}`);
    seen.set(identity, laptop.id);
  }
  assert.deepEqual(duplicates, [], `Duplicate configurations: ${duplicates.join(', ')}`);
});

test('specification domains preserve nulls and reject impossible filter values', () => {
  const cpuFamilies = new Set(['apple', 'intel', 'amd', 'qualcomm', 'unknown']);
  const gpuTypes = new Set(['integrated', 'discrete', 'unknown']);
  const purposes = new Set(['student', 'developer', 'office', 'creative', 'gaming', 'budget']);
  const latestYear = Number(data.updatedAt.slice(0, 4));
  assert.match(data.updatedAt, isoDate);
  for (const laptop of laptops) {
    assert.ok(['manufacturer', 'archive'].includes(laptop.sourceKind), laptop.id);
    assert.ok(cpuFamilies.has(laptop.cpuFamily), laptop.id);
    assert.ok(gpuTypes.has(laptop.gpuType), laptop.id);
    assert.ok(laptop.gpu === null || typeof laptop.gpu === 'string', laptop.id);
    assert.ok(Array.isArray(laptop.purposes) && laptop.purposes.length > 0, laptop.id);
    assert.equal(new Set(laptop.purposes).size, laptop.purposes.length, laptop.id);
    assert.ok(laptop.purposes.every(purpose => purposes.has(purpose)), laptop.id);
    for (const field of ['ram', 'storage', 'screen', 'weight', 'price']) {
      assert.ok(laptop[field] === null || positive(laptop[field]), `${laptop.id}: ${field}`);
    }
    if (laptop.ram !== null) assert.ok(Number.isInteger(laptop.ram) && laptop.ram <= 256, laptop.id);
    if (laptop.screen !== null) assert.ok(laptop.screen >= 8 && laptop.screen <= 20, laptop.id);
    if (laptop.weight !== null) assert.ok(laptop.weight <= 8, laptop.id);
    if (laptop.year !== null) assert.ok(Number.isInteger(laptop.year) && laptop.year >= 2000 && laptop.year <= latestYear, laptop.id);
    if (laptop.sourceKind === 'manufacturer') {
      assert.match(laptop.verifiedAt, isoDate, laptop.id);
      assert.ok(laptop.verifiedAt <= data.updatedAt, laptop.id);
    }
  }
});

test('popularity is explicitly editorial and archival explanations cover all three languages', () => {
  for (const language of ['kk', 'ru', 'en']) {
    assert.ok(data.popularityNote[language]?.length > 40, language);
    assert.ok(data.disclaimerI18n[language]?.length > 40, language);
  }
  assert.match(data.popularityNote.en, /editorial/);
  assert.match(data.popularityNote.en, /not sales/);
  for (const laptop of laptops) {
    assert.equal(laptop.popularityBasis, 'editorial', laptop.id);
    assert.ok(Number.isInteger(laptop.popularityStars) && laptop.popularityStars >= 1 && laptop.popularityStars <= 5, laptop.id);
  }
  for (const laptop of archived) {
    for (const language of ['kk', 'ru', 'en']) {
      assert.ok(laptop.descriptionI18n?.[language]?.includes('2023'), `${laptop.id}: ${language}`);
      assert.ok(laptop.badgeI18n?.[language]?.includes('2023'), `${laptop.id}: ${language}`);
    }
    assert.match(laptop.descriptionI18n.en, /Current price, availability and missing specifications need to be checked/);
  }
});
