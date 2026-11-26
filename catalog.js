/** Pure, deterministic laptop discovery. Scores are rules, never benchmarks. */
export const defaultFilters = Object.freeze({
  query: '',
  purpose: 'all',
  maxPrice: 2000000,
  minRam: 0,
  minStorage: 0,
  gpuType: 'all',
  gpuQuery: '',
  cpuFamily: 'all',
  os: 'all',
  minScreen: 0,
  maxScreen: 0,
  maxWeight: 0,
  brands: Object.freeze([]),
  sort: 'recommended',
  savedOnly: false,
  savedIds: Object.freeze([]),
});

const text = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase();
const positive = value => value !== null && value !== '' && Number.isFinite(Number(value)) && Number(value) > 0;
const number = value => positive(value) ? Number(value) : 0;
const hasPurpose = (laptop, purpose) => Array.isArray(laptop.purposes) && laptop.purposes.includes(purpose);
const unrestrictedPurpose = purpose => !purpose || purpose === 'all';
const resolvePriority = priority => ({ power: 'performance', portability: 'portable', budget: 'value' })[priority] || priority || 'balanced';

function searchText(laptop) {
  return text([
    laptop.brand, laptop.name, laptop.cpu, laptop.cpuFamily, laptop.gpu,
    laptop.os, laptop.display, laptop.year, laptop.description,
    `${laptop.ram ?? ''}GB ${laptop.ram ?? ''} ГБ`,
    `${laptop.storage ?? ''}GB ${laptop.storage ?? ''} ГБ`,
    ...(laptop.purposes || []),
  ].join(' '));
}

function score(laptop, { purpose = 'all', priority = 'balanced' } = {}) {
  const ram = Math.min(number(laptop.ram), 64) / 16;
  const storage = Math.min(number(laptop.storage), 2048) / 512;
  const portable = positive(laptop.weight) ? Math.max(0, 3 - Number(laptop.weight)) : 0;
  const value = positive(laptop.price) ? Math.max(0, 1 - Number(laptop.price) / 2000000) : 0;
  const graphics = laptop.gpuType === 'discrete' ? 1 : 0;
  let result = hasPurpose(laptop, purpose) ? 40 : 0;
  const resolved = resolvePriority(priority);
  if (resolved === 'performance') result += ram * 5 + storage * 2 + graphics * 8;
  else if (resolved === 'portable') result += portable * 16 + ram + value * 2;
  else if (resolved === 'value') result += value * 35 + Math.min(ram, 2) * 2 + Math.min(storage, 2);
  else result += ram * 2 + storage + portable * 3 + value * 5;
  if (purpose === 'gaming' || purpose === 'creative') result += graphics * 10 + ram * 2;
  if (purpose === 'developer') result += ram * 3 + storage;
  if (purpose === 'student') result += portable * 3 + value * 4;
  if (purpose === 'budget') result += value * 20;
  return result;
}

function ascendingKnown(a, b, key) {
  const knownA = positive(a[key]);
  const knownB = positive(b[key]);
  if (knownA !== knownB) return knownA ? -1 : 1;
  return knownA ? Number(a[key]) - Number(b[key]) : 0;
}

/** Every active filter is combined with AND. Unknown specs cannot satisfy constraints. */
export function filterLaptops(laptops = [], filters = {}) {
  const options = { ...defaultFilters, ...filters };
  const terms = text(options.query).trim().split(/\s+/u).filter(Boolean);
  const brands = new Set((options.brands || []).map(text));
  const savedIds = new Set(options.savedIds || []);
  const maxPrice = number(options.maxPrice);
  const minRam = number(options.minRam);
  const minStorage = number(options.minStorage);
  const maxWeight = number(options.maxWeight);
  const minScreen = number(options.minScreen);
  const maxScreen = number(options.maxScreen);
  const gpuQuery = text(options.gpuQuery).trim();
  const result = laptops.filter(laptop => {
    if (!laptop || typeof laptop !== 'object') return false;
    if (terms.length && !terms.every(term => searchText(laptop).includes(term))) return false;
    if (!unrestrictedPurpose(options.purpose) && !hasPurpose(laptop, options.purpose)) return false;
    if (maxPrice && positive(laptop.price) && Number(laptop.price) > maxPrice) return false;
    if (maxPrice && maxPrice < defaultFilters.maxPrice && !positive(laptop.price)) return false;
    if (minRam && number(laptop.ram) < minRam) return false;
    if (minStorage && number(laptop.storage) < minStorage) return false;
    if (maxWeight && (!positive(laptop.weight) || Number(laptop.weight) > maxWeight)) return false;
    if (options.gpuType && options.gpuType !== 'all' && laptop.gpuType !== options.gpuType) return false;
    if (gpuQuery && !text(laptop.gpu).includes(gpuQuery)) return false;
    if (options.cpuFamily && options.cpuFamily !== 'all' && laptop.cpuFamily !== options.cpuFamily) return false;
    if (options.os && options.os !== 'all' && laptop.os !== options.os) return false;
    if (minScreen && number(laptop.screen) < minScreen) return false;
    if (maxScreen && (!positive(laptop.screen) || Number(laptop.screen) > maxScreen)) return false;
    if (brands.size && !brands.has(text(laptop.brand))) return false;
    if (options.savedOnly && !savedIds.has(laptop.id)) return false;
    return true;
  });
  switch (options.sort) {
    case 'price-asc': return result.sort((a, b) => ascendingKnown(a, b, 'price'));
    case 'price-desc': return result.sort((a, b) => {
      if (!positive(a.price) || !positive(b.price)) return ascendingKnown(a, b, 'price');
      return Number(b.price) - Number(a.price);
    });
    case 'weight': return result.sort((a, b) => ascendingKnown(a, b, 'weight'));
    case 'newest': return result.sort((a, b) => number(b.year) - number(a.year));
    default: return result.sort((a, b) => score(b, { purpose: options.purpose }) - score(a, { purpose: options.purpose }));
  }
}

/** Budget and purpose are hard requirements; priority only changes the order. */
export function rankLaptops(laptops = [], { purpose = 'all', budget, priority = 'balanced' } = {}) {
  const maximum = number(budget);
  return laptops
    .filter(laptop => laptop && (unrestrictedPurpose(purpose) || hasPurpose(laptop, purpose)))
    .filter(laptop => !maximum || (positive(laptop.price) && Number(laptop.price) <= maximum))
    .sort((a, b) => score(b, { purpose, priority }) - score(a, { purpose, priority }));
}

/** Short factual explanations in Kazakh; no invented performance percentages. */
export function getRecommendationReasons(laptop, { purpose = 'all', priority = 'balanced' } = {}) {
  if (!laptop) return [];
  const reasons = [];
  const purposeLabels = {
    student: 'Оқу мен күнделікті тапсырмаларға арналған іріктеуде',
    developer: 'Бағдарламалау үшін іріктелген модель',
    office: 'Кеңсе жұмысына арналған іріктеуде',
    creative: 'Дизайн және шығармашылық жұмысқа арналған іріктеуде',
    gaming: 'Ойынға арналған іріктеуде',
    budget: 'Қолжетімді модельдер іріктеуінде',
  };
  if (hasPurpose(laptop, purpose) && purposeLabels[purpose]) reasons.push(purposeLabels[purpose]);
  const resolved = resolvePriority(priority);
  if ((resolved === 'portable' || purpose === 'student') && positive(laptop.weight)) {
    reasons.push(`${Number(laptop.weight).toLocaleString('kk-KZ')} кг — тасымалдауға арналған салмақ көрсеткіші`);
  }
  if ((resolved === 'performance' || purpose === 'gaming' || purpose === 'creative') && laptop.gpuType === 'discrete') {
    reasons.push(`${laptop.gpu || 'Дискретті видеокарта'} — бөлек графикалық процессор`);
  }
  if (positive(laptop.ram)) reasons.push(`${laptop.ram} ГБ жедел жад${Number(laptop.ram) >= 16 ? ' — бірнеше қолданбамен жұмыс істеуге' : ''}`);
  if (positive(laptop.storage)) reasons.push(`${laptop.storage} ГБ жинақтауыш — файлдар мен жобаларға`);
  if (resolved === 'value' && positive(laptop.price)) reasons.unshift('Болжамды бағасы бойынша іріктелді; дүкендегі бағаны тексеріңіз');
  return reasons.slice(0, 3);
}
