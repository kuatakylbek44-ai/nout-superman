/**
 * Reproducible import of Juan Merino's Apache-2.0 laptop dataset.
 * Source snapshot: PcComponentes listings collected on 2023-06-25.
 * This imports archival specifications, never current prices or stock.
 * Run: node scripts/import-catalog.mjs [optional-local-csv-path]
 */
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const DATASET_URL='https://raw.githubusercontent.com/juanmerino89/laptops-data-cleaning/dcb60a556527e74dd88e2bb8b0696e77a7c3f7cf/laptops.csv';
const SOURCE_URL='https://github.com/juanmerino89/laptops-data-cleaning';
const LICENSE_URL='https://www.kaggle.com/datasets/juanmerinobermejo/laptops-price-dataset';
const target=fileURLToPath(new URL('../dist/data.json',import.meta.url));
const data=JSON.parse(await readFile(target,'utf8'));
const previousById=new Map(data.laptops.map(l=>[l.id,l]));
const csv=process.argv[2]?await readFile(process.argv[2],'utf8'):await fetch(DATASET_URL).then(r=>{if(!r.ok)throw new Error(`Dataset HTTP ${r.status}`);return r.text();});
function parseCSV(text){
  const rows=[];let row=[],value='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(value);value='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(value);if(row.some(Boolean))rows.push(row);row=[];value='';}else value+=c;}
  if(quoted)throw new Error('Unclosed quoted CSV value');
  if(value||row.length){row.push(value);rows.push(row);}
  const header=rows.shift().map(x=>x.replace(/^\uFEFF/,''));
  return rows.map(values=>Object.fromEntries(header.map((key,i)=>[key,values[i]??''])));
}
const rows=parseCSV(csv);
if(rows.length!==2160)throw new Error(`Expected pinned dataset of2160 records, got${rows.length}`);
const clean=s=>String(s??'').normalize('NFKC').replace(/\s+/g,' ').trim();
const num=s=>Number.isFinite(Number(s))&&Number(s)>0?Number(s):null;
const aliases={Asus:'ASUS',Gigabyte:'GIGABYTE','Dynabook Toshiba':'Dynabook',Realme:'realme'};
const retained=data.laptops.filter(l=>l.sourceKind!=='archive').map(l=>({...l,sourceKind:l.sourceKind||'manufacturer',family:l.family||`${l.brand} ${l.name.split('·')[0].trim()}`,modelPart:l.modelPart||l.name,imageUrl:l.imageUrl||null,popularityBasis:'editorial'}));
function editorialStars(l){
  const s=`${l.brand} ${l.name}`;
  if(/MacBook (Air|Pro)|ThinkPad|Legion|ROG|TUF|\bXPS\b/i.test(s))return 5;
  if(/IdeaPad|Yoga|VivoBook|ZenBook|Victus|Omen|Pavilion|Katana|Surface Laptop|Nitro|Galaxy Book|\bGram\b/i.test(s))return 4;
  return ['ASUS','HP','Lenovo','MSI','Apple','Dell','Acer','Microsoft','GIGABYTE','Razer','Samsung','LG'].includes(l.brand)?3:2;
}
const seen=new Map();
for(const raw of rows){
  const sourceName=clean(raw.Laptop),brand=aliases[raw.Brand]||clean(raw.Brand);
  const hw=sourceName.match(/\b(Intel\b[^/]*|AMD\b[^/]*|Apple M\d[^/]*|Qualcomm\b[^/]*|Mediatek\b[^/]*|Microsoft SQ\d[^/]*)/i);
  const cpu=clean(hw?.[0]||raw.CPU);
  const rawModel=hw?sourceName.slice(0,hw.index).trim():sourceName.split('/')[0];
  const modelPart=clean(rawModel.replace(/^Port[aá]til\s+/i,'').replace(new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\s+`,'i'),'').replace(/^Asus\s+/i,'').replace(/^Gigabyte\s+/i,'').replace(/^Dynabook Toshiba\s+/i,''));
  const ram=num(raw.RAM),rawStorage=num(raw.Storage),screen=num(raw.Screen);
  const storage=rawStorage===1000?1024:rawStorage===2000?2048:rawStorage===4000?4096:rawStorage;
  // Restore Ti/SUPER suffixes present in the original product title but shortened in the CSV's GPU column.
  const preciseGpu=sourceName.match(/\b((?:RTX|GTX)\s*\d{4}(?:\s*(?:Ti|SUPER))?|(?:Radeon\s+)?RX\s*\d{4}[MS]?|Radeon Pro\s*(?:RX\s*)?\d{3,4}[MX]?|(?:NVIDIA\s+)?Quadro\s+[A-Z]?\s*\d+)/i)?.[0];
  const gpu=clean(preciseGpu||raw.GPU)||null;
  const gpuType=gpu&&/RTX|GTX|\bMX\b|Quadro|\bRX\b|Radeon Pro|^[PT]\s*\d/i.test(gpu)?'discrete':'unknown';
  const cpuFamily=/^Intel/i.test(cpu)?'intel':/^AMD/i.test(cpu)?'amd':/^Apple/i.test(cpu)?'apple':/^Qualcomm/i.test(cpu)?'qualcomm':'unknown';
  const family=`${brand} ${clean(raw.Model)}`;
  let name=modelPart;
  // Apple listings often differ only in processor/display size, so keep those in the visible model identity.
  if(brand==='Apple')name=`${modelPart.replace(/\s+20\d{2}\b/,'')} ${screen||''} · ${cpu.replace(/^Apple /,'').replace(/\s+\d+ Núcleos/i,'')}`;
  if(!name)throw new Error(`Incomplete model identity: ${sourceName}`);
  const identity=[brand,name,cpu,ram,storage,gpu,screen,raw.Touch].map(v=>clean(v).toLowerCase()).join('|');
  // Keep the first listing's stable ID, but compare semantic specifications:
  // RTX3060 / RTX 3060 and V15 G2-ITL / V15 G2 ITL are the same configuration.
  const duplicateKey=JSON.stringify([brand,name,cpu,ram,storage,gpu,screen,raw.Touch].map(v=>typeof v==='string'?clean(v).toLowerCase().replace(/[^\p{L}\p{N}]/gu,''):v));
  const existing=seen.get(duplicateKey);
  if(existing){existing.sourceListingCount++;if(raw.Status==='New')existing.sourceCondition='New';continue;}
  const purposes=[];
  const integratedWork=!/Celeron|Pentium|Athlon|3020|N4020|N4500|N3350|N4000/i.test(cpu);
  if(ram>=8){purposes.push('office');if((screen||16)<=15.6)purposes.push('student');}
  if(ram>=16&&integratedWork)purposes.push('developer');
  if(gpuType==='discrete'&&/RTX|GTX 16|GTX 10|RX [567]/i.test(gpu)){purposes.push('gaming');if(ram>=16)purposes.push('creative');}
  if(brand==='Apple'&&ram>=16)purposes.push('creative');
  const archivePrice=num(raw['Final Price']);
  // Historical EUR prices do not establish affordability in today's KZT market.
  if(!purposes.length)purposes.push('office');
  const descriptionI18n={
    kk:`2023 жылғы ашық каталогтағы ${brand} конфигурациясы. Қазіргі баға, қолжетімділік және көрсетілмеген сипаттамалар қайта тексерілуі керек.`,
    ru:`Конфигурация ${brand} из открытого каталога 2023 года. Актуальную цену, наличие и отсутствующие характеристики необходимо перепроверить.`,
    en:`${brand} configuration from an open 2023 catalog. Current price, availability and missing specifications need to be checked again.`
  };
  const entry={
    id:`archive-${createHash('sha256').update(identity).digest('hex').slice(0,14)}`,brand,name,year:null,
    cpu,cpuFamily,gpu,gpuType,ram,storage,storageType:clean(raw['Storage type'])||null,screen,
    display:raw.Touch==='Yes'?'Touchscreen':null,weight:null,os:null,price:null,priceKind:'unknown',purposes:[...new Set(purposes)],
    badge:'Архив · 2023',badgeI18n:{kk:'Архив · 2023',ru:'Архив · 2023',en:'Archive · 2023'},description:descriptionI18n.kk,descriptionI18n,
    sourceUrl:SOURCE_URL,verifiedAt:null,importedAt:'2026-11-27',sourceKind:'archive',sourceName,sourceDate:'2023-06-25',sourceCondition:raw.Status,sourceListingCount:1,
    originalPrice:archivePrice,originalCurrency:'EUR',originalPriceDate:'2023-06-25',datasetLicense:'Apache-2.0',
    imageKind:brand==='Apple'?'apple':gpuType==='discrete'?'gaming':'silver',imageUrl:null,imageSourceUrl:null,color:brand==='Apple'?'#d5e1ec':'#e5e9e9',family,modelPart,
    popularityBasis:'editorial',popularityStars:editorialStars({brand,name}),
  };
  const previous=previousById.get(entry.id);
  if(previous)for(const key of ['image','imageUrl','imageSourceUrl','imagePath','imageAlt','imageLicense','photoStatus','photoMatch'])if(previous[key])entry[key]=previous[key];
  seen.set(duplicateKey,entry);
}
for(const l of retained){l.popularityStars=editorialStars(l);l.badgeI18n||={kk:l.badge,ru:l.year>=2025?`Модель ${l.year}`:'Проверенные характеристики',en:l.year>=2025?`${l.year} model`:'Verified specifications'};}
const archive=[...seen.values()];
data.laptops=[...retained,...archive];
data.updatedAt='2026-11-27';
data.disclaimer=`Каталогта ${data.laptops.length} конфигурация бар: өндіруші деректерімен іріктелген ${retained.length} модель және 2023-06-25 күнгі ашық деректерден ${archive.length} архив конфигурациясы. Бұл әлемдегі барлық ноутбуктің толық базасы емес. Архивтің қазіргі бағасы, салмағы, ОЖ және шығарылған жылы расталмаған болса, белгісіз деп көрсетіледі. Теңгедегі бар бағалар — шартты бюджет бағдары.`;
data.disclaimerI18n={
  kk:data.disclaimer,
  ru:`В каталоге ${data.laptops.length} конфигураций: ${retained.length} моделей по данным производителей и ${archive.length} архивных конфигураций из открытого набора от 25.06.2023. Это не полная база всех ноутбуков. Неподтверждённые актуальные цены и характеристики не заполняются догадками. Указанные цены в тенге — условный ориентир бюджета.`,
  en:`The catalog contains ${data.laptops.length} configurations: ${retained.length} manufacturer-sourced entries and ${archive.length} archival configurations from a dataset collected on 25 June 2023. It is not an exhaustive global catalog. Unverified current prices and specifications remain unknown. Existing KZT prices are illustrative budget estimates.`
};
data.popularityNote={
  kk:'Жұлдыздар — редакциялық танымалдық бағасы (1–5), нақты сатылым, пікір саны немесе пайдаланушылар рейтингі емес. Баға өнім сериясының танымалдығына қатысты сайттың субъективті іріктеуін көрсетеді.',
  ru:'Звёзды — редакционная оценка популярности (1–5), а не продажи, число отзывов или пользовательский рейтинг. Это субъективная оценка серий для порядка показа.',
  en:'Stars are an editorial popularity estimate (1–5), not sales, review counts or user ratings. They represent a subjective model-series ordering.'
};
data.archive={author:'Juan Merino',title:'Laptops Price Dataset',license:'Apache-2.0',licenseUrl:LICENSE_URL,sourceUrl:SOURCE_URL,csvUrl:DATASET_URL,sourceDate:'2023-06-25',publishedAt:'2023-07-12',originalRows:rows.length,uniqueConfigurations:archive.length,currency:'EUR',currentPricesAvailable:false};
data.archive.modificationNotice='Modified for Nout on 2026-11-27: CSV converted to JSON; duplicate specifications merged; names and units normalized; unknown fields preserved as null; editorial purposes, multilingual descriptions and editorial popularity added. Original EUR prices are historical, not current offers.';
data.archive.licenseText=await fetch('https://www.apache.org/licenses/LICENSE-2.0.txt').then(r=>{if(!r.ok)throw new Error(`License HTTP ${r.status}`);return r.text();});
data.sourceNotes=data.sourceNotes.filter(s=>!s.url?.includes('juanmerino'));
data.sourceNotes.unshift({title:'Juan Merino — Laptops Price Dataset (Apache 2.0)',url:LICENSE_URL,note:'27 брендті қамтитын 2023-06-25 күнгі PcComponentes архиві. Қазіргі сатылым ұсынысы емес.'},{title:'Түпнұсқа деректер және жинау әдісі',url:SOURCE_URL,note:'CSV қайта өңделді: қайталанған конфигурациялар біріктірілді, белгісіз деректер ойдан толтырылмады. Жарияланған файл — Apache 2.0 бойынша туынды каталог.'});
await writeFile(target,JSON.stringify(data,null,2)+'\n','utf8');
console.log(JSON.stringify({total:data.laptops.length,manufacturer:retained.length,archive:archive.length,brands:[...new Set(data.laptops.map(l=>l.brand))],originalRows:rows.length},null,2));
