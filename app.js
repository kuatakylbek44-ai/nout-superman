import { defaultFilters, filterLaptops, rankLaptops, getRecommendationReasons } from './catalog.js';
import { tr, translateDOM, getLanguage, setLanguage, localized } from './i18n.js';
import { initChat } from './chat-ui.js';
import { socialPaths } from './social-icons.js';
import { buildInfoContent } from './info-content.js';
import initDashboard from './dashboard.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => value == null ? tr('Бағасы нақтыланады') : new Intl.NumberFormat('ru-RU').format(value) + ' ₸';
const size = value => value == null ? tr('Нақтыланады') : tr(value >= 1024 ? `${value / 1024} ТБ` : `${value} ГБ`);
const weight = value => value == null ? tr('Нақтыланады') : tr(`≈ ${String(value).replace('.', ',')} кг`);
const safeUrl = value => { try { const u = new URL(value); return u.protocol === 'https:' ? esc(u.href) : '#'; } catch { return '#'; } };
const paths = {
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  camera:'<path d="M8 5 9.5 3h5L16 5h4a2 2 0 0 1 2 2v12H2V7a2 2 0 0 1 2-2Z"/><circle cx="12" cy="12" r="4"/>',
  laptop:'<rect x="4" y="3" width="16" height="13" rx="2"/><path d="M2 20h20M9 20h6"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  compare:'<path d="M5 20V9M12 20V4M19 20V12M2 9h6M9 4h6M16 12h6"/>',
  sparkles:'<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3ZM20 2v4M18 4h4"/>',
  'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 10h6M9 12h6M17 16h6"/>',
  'badge-check':'<path d="m12 2 3 2 4 .5.5 4 2 3-2 3-.5 4-4 .5-3 2-3-2-4-.5-.5-4-2-3 2-3 .5-4 4-.5 3-2Z"/><path d="m8 12 3 3 5-6"/>',
  wallet:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 8V5a2 2 0 0 1 2-2h12M21 11h-5v4h5M17 13h.01"/>',
  search:'<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>',
  x:'<path d="m6 6 12 12M18 6 6 18"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  student:'<path d="m2 9 10-5 10 5-10 5L2 9ZM6 11v6c4 3 8 3 12 0v-6M22 9v7"/>',
  code:'<path d="m8 6-6 6 6 6M16 6l6 6-6 6M14 3l-4 18"/>',
  briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12c5 4 13 4 18 0M10 13h4v3h-4z"/>',
  creative:'<path d="m13 3 8 8-9 9-9 1 1-9 9-9ZM3 21l8-8M10 3l11 11"/><circle cx="12" cy="12" r="1.5"/>',
  game:'<path d="M7 7h10c4 0 5 4 5 10 0 3-3 4-6-1H8c-3 5-6 4-6 1 0-6 1-10 5-10ZM6 10v5M3.5 12.5h5M16 11h.01M19 14h.01"/>',
  ram:'<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M5 18v3M10 18v3M15 18v3M20 18v3M6 10v4M11 10v4M16 10v4"/>',
  drive:'<path d="M4 3h16v18H4zM4 15h16M16 18h.01M7 18h5"/>',
  screen:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  weight:'<path d="M4 9h16l2 12H2L4 9Z"/><circle cx="12" cy="6" r="3"/>',
  leaf:'<path d="M20 3C10 1 2 7 4 15s16 5 16-12ZM5 19l10-9"/>',
  external:'<path d="M14 3h7v7M21 3l-9 9M10 3H4v17h17v-6"/>',
  send:'<path d="m22 2-7 20-4-9-9-4L22 2ZM22 2 11 13"/>',
  reset:'<path d="M3 10a9 9 0 1 1 2 8M3 3v7h7"/>',
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.laptop}</svg>`;
const purposes = [
  {id:'all',name:'Барлығы',hint:'Барлық мүмкіндік',icon:'grid'},
  {id:'student',name:'Оқуға',hint:'Студенттерге',icon:'student'},
  {id:'developer',name:'Код жазуға',hint:'IT мамандарына',icon:'code'},
  {id:'office',name:'Жұмысқа',hint:'Күнделікті істерге',icon:'briefcase'},
  {id:'creative',name:'Күрделі жұмысқа',hint:'Дизайн · 3D · монтаж',icon:'creative'},
  {id:'gaming',name:'Ойынға',hint:'Қуатты графика',icon:'game'},
  {id:'budget',name:'Қолжетімді',hint:'Бюджетті үнемде',icon:'wallet'},
];
const readStorage = key => { try { const v = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(v) ? v.filter(x => typeof x === 'string') : []; } catch { return []; } };
let saved = new Set(readStorage('nout-saved'));
let compared = new Set(readStorage('nout-compared').slice(0,3));
let filters = {...defaultFilters, brands:[]};
let data = {laptops:[],sourceNotes:[]};
let visibleCount = 9;
let loaded = false;
let wizard = {step:0,purpose:'student',budget:650000,priority:'balanced'};
let toastTimer;
function notify(message) { $('#toast').textContent = tr(message); $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2800); }
function persist() { try { localStorage.setItem('nout-saved',JSON.stringify([...saved])); localStorage.setItem('nout-compared',JSON.stringify([...compared])); } catch { notify('Браузер сақтауға рұқсат бермеді. Таңдауың осы бет ашық тұрғанда сақталады.'); } }
function laptopImage(laptop) { return laptop.image && /^assets\/photos\/[a-zA-Z0-9._/-]+$/.test(laptop.image) ? laptop.image : 'assets/photo-unavailable.svg'; }
function purposeName(id) { return tr(purposes.find(p=>p.id===id)?.name || 'Барлығы'); }
function descriptionFor(l){return l.descriptionI18n?.[getLanguage()] || (getLanguage()==='kk'?l.description:localized(l.description,'Конфигурация из каталога. Проверь исходные данные перед покупкой.','A catalogue configuration. Check the original specifications before buying.'));}
function specsText(value){if(value==null)return tr('Нақтыланады');return String(value).replace(/ядро/g,localized('ядро','ядер','cores')).replace(/ГБ/g,localized('ГБ','ГБ','GB')).replace(/Гц/g,localized('Гц','Гц','Hz'));}
function stars(l){const value=Math.max(1,Math.min(5,l.popularityStars||3));return `<div class="popularity" title="${esc(localized('Редакциялық танымалдық бағасы. Сатылым статистикасы емес.','Редакционная оценка популярности, не статистика продаж.','Editorial popularity estimate, not sales data.'))}"><span class="stars" role="img" aria-label="${esc(tr('Танымалдық'))}: ${value}/5"><span>${'★'.repeat(value)}</span><span class="empty-stars">${'☆'.repeat(5-value)}</span></span><span>${value}/5</span><small>редакциялық баға</small></div>`;}
function openDialog(id, html) { const dialog = $(id); dialog.innerHTML = html; const heading=dialog.querySelector('h2'); if(heading){heading.id=`${dialog.id}-title`;dialog.setAttribute('aria-labelledby',heading.id);} translateDOM(dialog); if (!dialog.open) dialog.showModal(); }
function closeButton() { return `<button class="icon-button" data-action="close" aria-label="Терезені жабу">${icon('x')}</button>`; }
function dialogHead(title, subtitle='') { return `<div class="dialog-head"><div><h2>${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ''}</div>${closeButton()}</div>`; }

function renderPurposes() { $('#purpose-grid').innerHTML = purposes.map(p => `<button class="purpose-card ${filters.purpose === p.id ? 'selected' : ''}" data-purpose="${p.id}" aria-pressed="${filters.purpose === p.id}"><span>${icon(p.icon)}</span><strong>${p.name}</strong><small>${p.hint}</small></button>`).join(''); }
function renderBrands() { const brands = [...new Set(data.laptops.map(l=>l.brand))].sort(); $('#brand-options').innerHTML = brands.map(brand=>`<label class="brand-check"><input type="checkbox" value="${esc(brand)}" ${filters.brands.includes(brand)?'checked':''}>${esc(brand)}<span>${data.laptops.filter(l=>l.brand===brand).length}</span></label>`).join(''); const order=['Apple','ASUS','Lenovo','HP','Dell','Acer','MSI','Samsung','Microsoft','Razer','LG','Huawei'];brands.sort((a,b)=>(order.includes(a)?order.indexOf(a):99)-(order.includes(b)?order.indexOf(b):99)||a.localeCompare(b));$('#brand-strip').innerHTML=`<button class="brand-pill ${!filters.brands.length?'selected':''}" data-brand="" aria-pressed="${!filters.brands.length}">Барлық бренд</button>`+brands.map(b=>`<button class="brand-pill ${filters.brands.includes(b)?'selected':''}" data-brand="${esc(b)}" aria-pressed="${filters.brands.includes(b)}">${esc(b)}</button>`).join('');$('#brand-total').textContent=localized(`${brands.length} бренд · бір каталог`,`${brands.length} брендов · один каталог`,`${brands.length} brands · one catalogue`); }
function syncControls() {
  const values = {'#search':filters.query,'#sort':filters.sort,'#budget':filters.maxPrice,'#ram':filters.minRam,'#storage':filters.minStorage,'#gpu':filters.gpuType,'#cpu':filters.cpuFamily,'#weight':filters.maxWeight,'#gpu-model':filters.gpuQuery||'','#os':filters.os||'all','#screen-size':filters.maxScreen ? `${filters.minScreen}-${filters.maxScreen}` : 'all','#collection':filters.sourceKind||'all','#condition':filters.condition||'all'};
  for (const [selector,value] of Object.entries(values)) { const control=$(selector); if(control) control.value=value; }
  $('#budget-display').textContent = money(filters.maxPrice).replace(' ₸','');
  $$('[data-budget]').forEach(b=>b.classList.toggle('active',Number(b.dataset.budget)===filters.maxPrice));
  renderPurposes(); renderBrands();
  $('#photo-only').checked=!!filters.photoOnly;
}
function renderCard(laptop,index=0) { return `<article class="product-card ${compared.has(laptop.id)?'in-compare':''}" style="animation-delay:${Math.min(index,5)*35}ms">
  <div class="product-image ${laptop.image?'real-photo':'no-photo'}"><span class="product-badge">${esc(laptop.badgeI18n?.[getLanguage()]||laptop.badge)}</span><button class="heart-button" data-action="favorite" data-id="${esc(laptop.id)}" aria-label="${saved.has(laptop.id)?'Таңдаулылардан алып тастау':'Таңдаулыларға қосу'}: ${esc(laptop.name)}" aria-pressed="${saved.has(laptop.id)}">${icon('heart')}</button><img src="${laptopImage(laptop)}" width="640" height="380" loading="lazy" alt="${laptop.image?esc(laptop.name):tr('Фото әзірге жоқ')}">${!laptop.image?'<span class="no-photo-label">Фото әзірге жоқ</span>':''}</div>
  <div class="product-body"><div class="product-brand"><span>${esc(laptop.brand)}</span><span>${laptop.year||tr('мұрағат')}</span></div><h3 class="product-title"><button data-action="detail" data-id="${esc(laptop.id)}">${esc(laptop.name)}</button></h3>${stars(laptop)}<p class="product-cpu" title="${esc(specsText(laptop.cpu))}">${esc(specsText(laptop.cpu))}</p><div class="spec-grid"><span>${icon('ram')}${laptop.ram?`${size(laptop.ram)} RAM`:tr('Нақтыланады')}</span><span>${icon('drive')}${size(laptop.storage)}</span><span>${icon('screen')}${laptop.screen?`${laptop.screen}″ ${tr('Экран')}`:tr('Нақтыланады')}</span><span>${icon('weight')}${weight(laptop.weight)}</span></div><div class="product-footer"><div class="price ${laptop.price==null?'price-unknown':''}"><strong>${money(laptop.price)}</strong><span>${laptop.price==null?'қазіргі баға жоқ':'бағдарлық баға'}</span></div><button class="compare-toggle" data-action="toggle-compare" data-id="${esc(laptop.id)}" aria-label="${compared.has(laptop.id)?'Салыстырудан алып тастау':'Салыстыруға қосу'}: ${esc(laptop.name)}" aria-pressed="${compared.has(laptop.id)}">${icon(compared.has(laptop.id)?'check':'compare')}<span>Салыстыру</span></button></div><button class="product-details" data-action="detail" data-id="${esc(laptop.id)}">Толығырақ</button></div></article>`; }
function renderChips() {
  const chips=[];
  if(filters.purpose!=='all') chips.push(['purpose',purposeName(filters.purpose)]);
  if(filters.maxPrice<defaultFilters.maxPrice) chips.push(['maxPrice',`${money(filters.maxPrice)} дейін`]);
  if(filters.minRam) chips.push(['minRam',`${filters.minRam} ГБ+ RAM`]);
  if(filters.minStorage) chips.push(['minStorage',`${size(filters.minStorage)}+ сақтау орны`]);
  if(filters.gpuType!=='all') chips.push(['gpuType',filters.gpuType==='discrete'?'Дискретті графика':'Кіріктірілген графика']);
  if(filters.gpuQuery) chips.push(['gpuQuery',filters.gpuQuery]);
  if(filters.cpuFamily!=='all') chips.push(['cpuFamily',filters.cpuFamily.toUpperCase()]);
  if(filters.maxWeight) chips.push(['maxWeight',`${filters.maxWeight} кг дейін`]);
  if(filters.os&&filters.os!=='all') chips.push(['os',filters.os]);
  if(filters.maxScreen) chips.push(['screenRange',`${filters.minScreen}–${filters.maxScreen}″`]);
  if(filters.savedOnly) chips.push(['savedOnly','Таңдаулылар']);
  if(filters.sourceKind!=='all')chips.push(['sourceKind',filters.sourceKind==='archive'?'Мұрағаттағы модельдер':'Тексерілген жаңа модельдер']);
  if(filters.photoOnly)chips.push(['photoOnly','Тек фотосы бар']);
  if(filters.condition!=='all')chips.push(['condition',filters.condition==='New'?'Жаңа':'Қалпына келтірілген']);
  filters.brands.forEach(b=>chips.push([`brand:${b}`,b]));
  $('#active-filters').innerHTML=chips.map(([key,label])=>`<button class="filter-chip" data-remove-filter="${esc(key)}" aria-label="Сүзгіні алып тастау: ${esc(label)}">${esc(label)}${icon('x')}</button>`).join('');
}
function render() {
  if(!loaded)return;
  renderPurposes(); renderChips();
  let result=filterLaptops(data.laptops,{...filters,savedIds:[...saved]});
  if(filters.priority&&filters.sort==='recommended')result=rankLaptops(result,{purpose:filters.purpose,budget:filters.maxPrice,priority:filters.priority});
  $('#result-count').innerHTML=`<strong>${tr(`${result.length} ноутбук`)}</strong> <span>${tr('табылды')}</span> <span>${tr(`· ${data.laptops.length} модель ішінен`)}</span>`;
  if(result.length) $('#product-grid').innerHTML=result.slice(0,visibleCount).map(renderCard).join('');
  else $('#product-grid').innerHTML=`<div class="empty-state">${icon(filters.savedOnly?'heart':'search')}<h3>${filters.savedOnly&&saved.size===0?'Әзірге таңдаулылар жоқ':'Мұндай үйлесім табылмады'}</h3><p>${filters.savedOnly&&saved.size===0?'Ұнаған ноутбуктің жүрек белгісін бас. Оны кейін осы жерден табасың.':'Бір-екі сүзгіні алып тастап немесе бюджетті өзгертіп көр. Каталогтағы барлық конфигурация осы шарттарға сай келе бермейді.'}</p><button class="button primary" data-action="reset">Барлық ноутбукті көру</button></div>`;
  $('#load-more').hidden=result.length<=visibleCount;
  $('#load-more').textContent=`Тағы ${Math.min(9,result.length-visibleCount)} ноутбук көрсету`;
  $('#catalog-footnote').textContent=`${Math.min(visibleCount,result.length)} / ${result.length} көрсетілді · Бағалар — шартты бюджет бағдары. Мұрағат бөлек белгіленген.`;
  updateGlobalState();
  translateDOM();
  document.dispatchEvent(new CustomEvent('nout:catalog',{detail:{data,savedCount:saved.size,comparedCount:compared.size,filters}}));
}
function updateGlobalState() {
  $('#saved-count').textContent=saved.size; $('#saved-count').hidden=saved.size===0;
  $$('[data-action="saved"]').forEach(b=>b.setAttribute('aria-pressed',filters.savedOnly));
  $('#compare-count').textContent=compared.size; $('#compare-dock').hidden=!compared.size;
  $('#dock-count').textContent=`${compared.size} ноутбук`;
  $('#dock-models').innerHTML=[...compared].map(id=>data.laptops.find(l=>l.id===id)).filter(Boolean).map(l=>`<img src="${laptopImage(l)}" alt="${esc(l.name)}" title="${esc(l.name)}">`).join('');
  document.body.style.paddingBottom=compared.size?'80px':'';
  document.body.classList.toggle('has-comparison',compared.size>0);
}
function changed() { visibleCount=9; syncControls(); render(); }
function reset() { filters={...defaultFilters,brands:[]}; changed(); }
function favorite(id) { saved.has(id)?saved.delete(id):saved.add(id); persist(); render(); if($('#detail-dialog').open) showDetail(id); }
function toggleCompare(id) {
  if(compared.has(id)) compared.delete(id);
  else if(compared.size>=3) {notify('Бір уақытта 3 ноутбукке дейін салыстыра аласың. Алдымен біреуін алып таста.');return;}
  else {compared.add(id);notify('Ноутбук салыстыруға қосылды');}
  persist(); render();
  if($('#detail-dialog').open) showDetail(id);
  if($('#compare-dialog').open) showCompare();
}
function showDetail(id) {
  const l=data.laptops.find(l=>l.id===id); if(!l)return;
  const specs=[['Процессор',specsText(l.cpu)],['Видеокарта',specsText(l.gpu)],['Жедел жад',size(l.ram)],['Жинақтауыш',size(l.storage)],['Экран',l.screen?`${l.screen}″${l.display?' · '+specsText(l.display):''}`:tr('Нақтыланады')],['Салмағы',weight(l.weight)],['Операциялық жүйе',l.os||tr('Нақтыланады')],['Модель жылы',l.year||tr('Нақтыланады')],['Қолдану мақсаты',l.purposes.map(purposeName).join(', ')],['Күйі',tr(l.sourceCondition==='Refurbished'?'Қалпына келтірілген':'Жаңа')]];
  const photoNote=l.image?localized('Нақты модель сериясының фотосы. Түс пен конфигурация өзгеше болуы мүмкін.','Фото соответствующей серии. Цвет и конфигурация могут отличаться.','Photo of the matching model family. Colour and configuration may differ.'):tr('Фото әзірге жоқ');
  const checked=localized(`Дерек күні: ${l.sourceDate||l.verifiedAt}. Сатып аларда нақты SKU мен сипаттаманы тексер.`,`Дата данных: ${l.sourceDate||l.verifiedAt}. Перед покупкой проверь конкретный SKU и характеристики.`,`Data date: ${l.sourceDate||l.verifiedAt}. Verify the exact SKU and specifications before buying.`);
  openDialog('#detail-dialog',`${dialogHead(esc(l.name),`${esc(l.brand)} · ${l.year||tr('мұрағат')} · ${esc(l.badgeI18n?.[getLanguage()]||l.badge)}`)}<div class="detail-layout"><div class="detail-image"><img src="${laptopImage(l)}" alt="${l.image?esc(l.name):tr('Фото әзірге жоқ')}"><span class="image-note">${photoNote}</span>${l.imageSourceUrl?`<a class="source-link" href="${safeUrl(l.imageSourceUrl)}" target="_blank" rel="noopener noreferrer">Фото дереккөзі</a>`:''}</div><div>${stars(l)}<p class="detail-text">${esc(descriptionFor(l))}</p><div class="detail-price"><strong>${money(l.price)}</strong><p>${l.price==null?'Қазіргі баға мен қолжетімділік белгісіз. Бұл — мұрағаттағы конфигурация.':'Шартты бюджет бағдары. Нақты дүкен бағасы мен қолжетімділігі тексерілмеген.'}</p></div><div class="detail-actions"><button class="button primary" data-action="toggle-compare" data-id="${esc(l.id)}">${icon(compared.has(l.id)?'check':'compare')}${compared.has(l.id)?'Салыстыруда':'Салыстыру'}</button><button class="button secondary" data-action="favorite" data-id="${esc(l.id)}">${icon('heart')}${saved.has(l.id)?'Сақталған':'Сақтау'}</button></div></div></div><table class="spec-table"><tbody>${specs.map(([k,v])=>`<tr><td>${tr(k)}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table><a class="source-link" href="${safeUrl(l.sourceUrl)}" target="_blank" rel="noopener noreferrer">${l.sourceKind==='archive'?'Датасеттегі түпнұсқа жазба':'Өндірушінің ресми сипаттамалары'} ${icon('external')}</a><p class="detail-note">${checked}</p>`);
}
function showCompare() {
  const list=[...compared].map(id=>data.laptops.find(l=>l.id===id)).filter(Boolean);
  if(list.length<2) { openDialog('#compare-dialog',`${dialogHead('Бетпе-бет салыстыру')}<div class="compare-empty">${icon('compare')}<h3>Кемінде екі ноутбук таңда</h3><p>Карточкадағы салыстыру белгісін бас.<br>Бір кестеде үш модельге дейін қарай аласың.</p><button class="button primary" data-action="close">Каталогтан таңдау</button></div>`);return; }
  const rows=[['Бағдарлық баға',l=>money(l.price)],['Процессор',l=>specsText(l.cpu)],['Видеокарта',l=>specsText(l.gpu)],['Жедел жад',l=>size(l.ram)],['Жинақтауыш',l=>size(l.storage)],['Экран',l=>l.screen?`${l.screen}″${l.display?' · '+specsText(l.display):''}`:tr('Нақтыланады')],['Салмағы',l=>weight(l.weight)],['ОЖ',l=>l.os||tr('Нақтыланады')],['Модель жылы',l=>l.year||tr('Нақтыланады')],['Мақсаты',l=>l.purposes.map(purposeName).join(', ')]];
  openDialog('#compare-dialog',`${dialogHead('Айырмашылығы — көз алдыңда.',`${list.length} ноутбуктің сипаттамаларын салыстыр.`)}<div class="comparison-scroll"><table class="comparison-table"><thead><tr><th scope="col">Сипаттамасы</th>${list.map(l=>`<th scope="col"><img src="${laptopImage(l)}" alt="${l.image?esc(l.name):tr('Фото әзірге жоқ')}"><h3>${esc(l.name)}</h3><button data-action="toggle-compare" data-id="${esc(l.id)}">Алып тастау</button></th>`).join('')}</tr></thead><tbody>${rows.map(([label,fn])=>`<tr><th scope="row">${label}</th>${list.map(l=>`<td>${esc(fn(l))}</td>`).join('')}</tr>`).join('')}<tr><th scope="row">Дереккөз</th>${list.map(l=>`<td><a class="source-link" href="${safeUrl(l.sourceUrl)}" target="_blank" rel="noopener noreferrer">${l.sourceKind==='archive'?tr('Датасеттегі түпнұсқа жазба'):tr('Өндірушінің ресми сипаттамалары')}</a></td>`).join('')}</tr></tbody></table></div><p class="detail-note">Бағалар — шартты бюджет бағдары. Процессор мен видеокартаның өнімділігі жад көлемімен ғана анықталмайды. Бұл кесте бенчмарк нәтижесі емес.</p>`);
}
function showInfo(kind='about') {
  if(kind!=='how') {const info=buildInfoContent(data,{esc,safeUrl});openDialog('#info-dialog',`${dialogHead(info.title,info.subtitle)}${info.html}`);return;}
  if(kind==='how') {openDialog('#info-dialog',`${dialogHead('Таңдауың түсінікті болсын.','Ноутбук іздеудің үш қарапайым жолы.')}<div class="info-content"><ol><li><strong>Мақсатыңды таңда.</strong> Оқуға, код жазуға, кеңсеге, шығармашылық жұмысқа немесе ойынға арналған іріктеуді аш.</li><li><strong>Өзіңе сай сипаттамаларды белгіле.</strong> Бюджет, RAM, жинақтауыш, графика және салмақ сүзгілері бірге жұмыс істейді.</li><li><strong>Салыстыр.</strong> Үш модельге дейін бір кестеде қарап, ресми сипаттамаларын тексер.</li></ol><h3>Ұсыныстар қалай есептеледі?</h3><p>Көмекші мақсат пен бюджетті міндетті шарт ретінде қолданады. Содан кейін сен таңдаған басымдыққа қарай жад, жинақтауыш, дискретті графика, салмақ және бағдарлық бағаға сүйеніп реттейді.</p><div class="info-box">Бұл — түсіндірілетін ережелерге негізделген іріктеу. Нақты бағдарламалардағы өнімділік пен ойындардағы FPS есептелмейді.</div><button class="button primary" data-action="wizard">Үш сұраққа жауап беру</button></div>`);return;}
}
function startWizard() { if(!loaded){notify('Каталог жүктелгенше сәл күте тұр.');return;} $$('dialog[open]').forEach(d=>d.close()); wizard={step:0,purpose:filters.purpose==='all'?'student':filters.purpose,budget:filters.maxPrice<2000000?filters.maxPrice:650000,priority:'balanced'}; renderWizard(); }
function localizedReasons(l){const reasons=[`${purposeName(wizard.purpose)} · ${l.ram?size(l.ram)+' RAM':tr('Нақтыланады')}`];if(l.weight)reasons.push(localized(`Салмағы ${weight(l.weight)}`,`Вес ${weight(l.weight)}`,`Weight ${weight(l.weight)}`));if(l.gpuType==='discrete')reasons.push(specsText(l.gpu));else if(l.storage)reasons.push(`${tr('Жинақтауыш')}: ${size(l.storage)}`);return reasons.slice(0,3);}
function renderWizard() {
  let body='';
  const progress=`<div class="wizard-progress" aria-label="${Math.min(wizard.step+1,3)} / 3 қадам">${[0,1,2].map(i=>`<span class="${i<=wizard.step?'on':''}"></span>`).join('')}</div>`;
  if(wizard.step===0) body=`<h3 class="wizard-question">Ноутбук көбіне не үшін керек?</h3><p class="wizard-hint">Негізгі мақсатыңды таңда. Нәтижені кейін сүзгілермен нақтылай аласың.</p><div class="wizard-options">${purposes.filter(p=>p.id!=='all').map(p=>`<button class="wizard-option ${wizard.purpose===p.id?'selected':''}" data-wizard-purpose="${p.id}" aria-pressed="${wizard.purpose===p.id}">${icon(p.icon)}<span><strong>${p.name}</strong><small>${p.hint}</small></span></button>`).join('')}</div>`;
  if(wizard.step===1) body=`<h3 class="wizard-question">Қанша бюджет жоспарлап отырсың?</h3><p class="wizard-hint">Осы сомадан аспайтын бағдарлық бағасы бар модельдерді көрсетеміз. Дүкендегі нақты баға өзгеруі мүмкін.</p><div class="wizard-budget"><strong id="wizard-budget-label">${money(wizard.budget)}</strong><input type="range" id="wizard-budget" min="150000" max="2000000" step="50000" value="${wizard.budget}" aria-label="Жоспарланған бюджет"><div class="range-labels"><span>150 000 ₸</span><span>2 000 000 ₸</span></div></div>`;
  if(wizard.step===2) { const priorities=[['balanced','Теңгерімді таңдау','Барлық сипаттама маңызды','sliders'],['portable','Жеңіл әрі ықшам','Күнде өзіммен алып жүремін','leaf'],['performance','Күрделі тапсырмалар','Жад пен графика маңызды','cpu'],['value','Бюджетті үнемдеу','Қолжетімді баға маңызды','wallet']]; body=`<h3 class="wizard-question">Сен үшін ең маңыздысы не?</h3><p class="wizard-hint">Ұсыныстарды осы басымдыққа қарай реттейміз.</p><div class="wizard-options">${priorities.map(([id,title,hint,i])=>`<button class="wizard-option ${wizard.priority===id?'selected':''}" data-wizard-priority="${id}" aria-pressed="${wizard.priority===id}">${icon(i)}<span><strong>${title}</strong><small>${hint}</small></span></button>`).join('')}</div>`; }
  if(wizard.step===3) {
    const results=rankLaptops(data.laptops,wizard).slice(0,3);
    body=results.length?`<h3 class="wizard-question">Мына модельдерден баста.</h3><p class="wizard-hint">${purposeName(wizard.purpose)} · ${tr(`${money(wizard.budget)} дейін`)} · ${results.length}</p>${results.map(l=>`<article class="wizard-result"><img src="${laptopImage(l)}" alt="${esc(l.name)}"><div><h3>${esc(l.name)}</h3><ul>${localizedReasons(l).map(r=>`<li>${esc(r)}</li>`).join('')}</ul></div><div><strong>${money(l.price)}</strong><button data-action="wizard-detail" data-id="${esc(l.id)}">Сипаттамасын көру</button></div></article>`).join('')}<p class="wizard-result-note">Ұсыныстар каталогтағы сипаттамаларға негізделген. Бағалар шартты; сатып аларда дүкен бағасы мен қажетті бағдарламалардың үйлесімділігін тексер.</p>`:`<div class="empty-state">${icon('search')}<h3>Бұл бюджетте сәйкес модель жоқ</h3><p>Каталогтағы осы мақсатқа арналған модельдер бюджеттен жоғары. Бюджетті өзгертуге немесе басқа мақсат таңдауға болады.</p><button class="button secondary" data-action="wizard-budget-back">Бюджетті өзгерту</button></div>`;
  }
  const footer=wizard.step<3?`<div class="wizard-footer"><button class="button secondary" data-action="wizard-back" ${wizard.step===0?'disabled':''}>Артқа</button><button class="button primary" data-action="wizard-next">${wizard.step===2?'Ұсыныстарды көрсету':'Жалғастыру'}</button></div>`:`<div class="wizard-footer"><button class="button secondary" data-action="wizard-restart">Қайта таңдау</button><button class="button primary" data-action="wizard-apply">Каталогта көрсету</button></div>`;
  openDialog('#wizard-dialog',`${dialogHead('Саған сай ноутбукті табайық.',wizard.step<3?`${wizard.step+1} / 3 қадам · Шамамен бір минут`:'Сенің қажеттілігіңе сай іріктеу')}${progress}${body}${footer}`);
}

document.addEventListener('click',event=>{
  const brandButton=event.target.closest('[data-brand]');if(brandButton){filters.brands=brandButton.dataset.brand?[brandButton.dataset.brand]:[];changed();$('#catalog').scrollIntoView({behavior:'smooth'});return;}
  const purposeButton=event.target.closest('[data-purpose]'); if(purposeButton){filters.purpose=purposeButton.dataset.purpose;changed();return;}
  const budgetButton=event.target.closest('[data-budget]');if(budgetButton){filters.maxPrice=Number(budgetButton.dataset.budget);changed();return;}
  const removeButton=event.target.closest('[data-remove-filter]');if(removeButton){const key=removeButton.dataset.removeFilter;if(key.startsWith('brand:'))filters.brands=filters.brands.filter(b=>b!==key.slice(6));else if(key==='screenRange'){filters.minScreen=0;filters.maxScreen=0;}else filters[key]=defaultFilters[key];changed();return;}
  const wp=event.target.closest('[data-wizard-purpose]');if(wp){wizard.purpose=wp.dataset.wizardPurpose;renderWizard();return;}
  const priority=event.target.closest('[data-wizard-priority]');if(priority){wizard.priority=priority.dataset.wizardPriority;renderWizard();return;}
  const button=event.target.closest('[data-action]');if(!button)return;const id=button.dataset.id;
  switch(button.dataset.action){
    case 'photos':filters={...defaultFilters,brands:[],photoOnly:true};changed();$('#catalog').scrollIntoView({behavior:'smooth'});break;
    case 'reset':reset();break;
    case 'filters':$('#filters').classList.toggle('mobile-open');button.setAttribute('aria-expanded',$('#filters').classList.contains('mobile-open'));break;
    case 'saved':filters.savedOnly=!filters.savedOnly;changed();$('#catalog').scrollIntoView({behavior:'smooth'});break;
    case 'favorite':favorite(id);break;
    case 'toggle-compare':toggleCompare(id);break;
    case 'clear-compare':compared.clear();persist();render();break;
    case 'compare':showCompare();break;
    case 'detail':showDetail(id);break;
    case 'close':button.closest('dialog')?.close();break;
    case 'about':showInfo();break;
    case 'how':showInfo('how');break;
    case 'wizard':startWizard();break;
    case 'wizard-next':wizard.step=Math.min(3,wizard.step+1);renderWizard();break;
    case 'wizard-back':wizard.step=Math.max(0,wizard.step-1);renderWizard();break;
    case 'wizard-restart':wizard.step=0;renderWizard();break;
    case 'wizard-budget-back':wizard.step=1;renderWizard();break;
    case 'wizard-detail':$('#wizard-dialog').close();showDetail(id);break;
    case 'wizard-apply':filters={...defaultFilters,brands:[],purpose:wizard.purpose,maxPrice:wizard.budget,priority:wizard.priority,sort:'recommended'};changed();$('#wizard-dialog').close();$('#catalog').scrollIntoView({behavior:'smooth'});break;
  }
});
$('#search').addEventListener('input',e=>{filters.query=e.target.value;visibleCount=9;render();});
$('#search').addEventListener('keydown',e=>{if(e.key==='Enter')$('#catalog').scrollIntoView({behavior:'smooth'});});
$('#budget').addEventListener('input',e=>{filters.maxPrice=Number(e.target.value);$('#budget-display').textContent=money(filters.maxPrice).replace(' ₸','');visibleCount=9;render();$$('[data-budget]').forEach(b=>b.classList.toggle('active',Number(b.dataset.budget)===filters.maxPrice));});
const controls={'sort':'sort','ram':'minRam','storage':'minStorage','gpu':'gpuType','cpu':'cpuFamily','weight':'maxWeight','gpu-model':'gpuQuery','os':'os','collection':'sourceKind','condition':'condition'};
for(const [id,key] of Object.entries(controls)){$('#'+id)?.addEventListener('change',e=>{filters[key]=['minRam','minStorage','maxWeight'].includes(key)?Number(e.target.value):e.target.value;changed();});}
$('#screen-size')?.addEventListener('change',e=>{const values=e.target.value==='all'?[0,0]:e.target.value.split('-').map(Number);[filters.minScreen,filters.maxScreen]=values;changed();});
$('#brand-options').addEventListener('change',()=>{filters.brands=$$('#brand-options input:checked').map(i=>i.value);visibleCount=9;renderBrands();render();});
$('#photo-only').addEventListener('change',e=>{filters.photoOnly=e.target.checked;changed();});
$('#language-select').value=getLanguage();
$('#language-select').addEventListener('change',e=>{setLanguage(e.target.value);syncControls();render();translateDOM();document.dispatchEvent(new CustomEvent('nout:language'));});
$('#load-more').addEventListener('click',()=>{visibleCount+=9;render();});
document.addEventListener('input',e=>{if(e.target.id==='wizard-budget'){wizard.budget=Number(e.target.value);$('#wizard-budget-label').textContent=money(wizard.budget);}});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!$('dialog[open]')){e.preventDefault();$('#search').focus();$('#catalog').scrollIntoView({behavior:'smooth'});}});
$$('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}}));
$$('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
renderPurposes();updateGlobalState();
initDashboard();
translateDOM();
initChat({getCatalog:()=>data,getFilters:()=>filters,onLaptop:id=>{$('#chat-dialog').close();showDetail(id);}});
async function init(){
  try{
    const response=await fetch('data.json');if(!response.ok)throw new Error('Data load failed');data=await response.json();if(!Array.isArray(data.laptops))throw new Error('Invalid catalog');
    const valid=new Set(data.laptops.map(l=>l.id));saved=new Set([...saved].filter(id=>valid.has(id)));compared=new Set([...compared].filter(id=>valid.has(id)));loaded=true;syncControls();render();
  }catch(error){$('#result-count').textContent='Каталог жүктелмеді';$('#product-grid').innerHTML=`<div class="empty-state">${icon('info')}<h3>Деректерді жүктеу мүмкін болмады</h3><p>Интернет байланысын тексеріп, бетті қайта ашып көр.</p><button class="button primary" id="retry-load">Қайта жүктеу</button></div>`;$('#retry-load').addEventListener('click',init);console.error(error);}
}
async function renderContacts(){try{const profile=await(await fetch('profile.json')).json();const links=[['instagram','Instagram','ayazbala__',profile.instagram],['tiktok','TikTok','ayazbala_',profile.tiktok],['github','GitHub','kuatakylbek44-ai',profile.github],['telegram','Telegram','@ayazba1a',profile.telegram],['whatsapp','WhatsApp',profile.phone,profile.whatsapp],['email','Email',profile.email,`mailto:${profile.email}`]];$('#social-links').innerHTML=links.map(([name,label,handle,url])=>{const mark=name==='instagram'?'<g fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></g>':name==='email'?'<g fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 6 9 7 9-7"/></g>':`<path d="${socialPaths[name]}"/>`;return `<a class="social-card social-${name}" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><span class="social-logo"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${mark}</svg></span><span><strong>${label}</strong><small>${esc(handle)}</small></span>${icon('external')}</a>`;}).join('');}catch{notify(localized('Байланыстар жүктелмеді.','Не удалось загрузить контакты.','Contacts could not be loaded.'));}}
renderContacts();init();
document.addEventListener('error',e=>{if(e.target.tagName==='IMG'&&!e.target.src.endsWith('/photo-unavailable.svg')){e.target.src='assets/photo-unavailable.svg';e.target.alt=tr('Фото әзірге жоқ');} },true);
