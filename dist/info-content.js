import { tr, localized, getLanguage } from './i18n.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const checkedUrl = value => { try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? escapeHtml(url.href) : '#'; } catch { return '#'; } };

function sourceLabel(source) {
  let host = '';
  try { host = new URL(source.url).hostname.replace(/^www\./, ''); } catch { return null; }
  const custom = source.titleI18n?.[getLanguage()];
  if (custom) return {title:custom,note:source.noteI18n?.[getLanguage()]||''};
  if (host === 'kaggle.com') return {
    title:'Juan Merino — Laptops Price Dataset',
    note:localized('2023 жылғы мұрағат деректері және жарияланған лицензия.','Архивные данные 2023 года и опубликованная лицензия.','The 2023 archived dataset and its published license.'),
  };
  if (host === 'github.com' || host === 'raw.githubusercontent.com') return {
    title:localized('Түпнұсқа датасет және жинау әдісі','Исходный датасет и метод сбора','Original dataset and collection method'),
    note:localized('Импорттың бастапқы деректері. Қайталанған конфигурациялар біріктірілді.','Исходные данные импорта. Повторяющиеся конфигурации объединены.','Import source. Duplicate configurations were merged.'),
  };
  if (host === 'apple.com' || host.endsWith('.apple.com')) return {
    title:'Apple — MacBook',
    note:localized('MacBook модельдерінің ресми техникалық сипаттамалары.','Официальные технические характеристики моделей MacBook.','Official technical specifications for MacBook models.'),
  };
  if (host === 'lenovo.com' || host.endsWith('.lenovo.com')) return {
    title:'Lenovo PSREF',
    note:localized('Модель серияларының ресми сипаттамалары; жинақтары аймаққа қарай өзгереді.','Официальные характеристики серий; комплектации зависят от региона.','Official series specifications; configurations vary by region.'),
  };
  if (host === 'asus.com' || host.endsWith('.asus.com')) return {
    title:'ASUS — Zenbook / Vivobook / TUF / ROG',
    note:localized('Өндіруші жариялаған модельдер мен конфигурациялардың сипаттамалары.','Опубликованные производителем характеристики моделей и конфигураций.','Manufacturer-published model and configuration specifications.'),
  };
  if (host === 'icecat.com' || host.endsWith('.icecat.com')) return {
    title:'Open Icecat',
    note:localized('Каталогты болашақта кеңейту көзі. Бұл сайтқа автоматты қосылмаған.','Возможный источник расширения каталога. Автоматическое подключение ещё не настроено.','A potential source for future catalog expansion. No automated connection is active.'),
  };
  if (host === 'iceclog.com' || host.endsWith('.iceclog.com')) return {
    title:'Icecat CSV API',
    note:localized('Өнім деректерін алу интерфейсінің құжаттамасы; қазір қосылмаған.','Документация интерфейса получения данных; сейчас не подключён.','Product data interface documentation; not currently connected.'),
  };
  return {title:host,note:localized('Қосымша дереккөз.','Дополнительный источник.','Additional source.')};
}

/** Complete, already-localized HTML for the About Data modal. No DOM mutation. */
export function buildInfoContent(data = {}, helpers = {}) {
  const esc = helpers.esc || escapeHtml;
  const safeUrl = helpers.safeUrl || checkedUrl;
  const rows = Array.isArray(data.laptops) ? data.laptops : [];
  const archive = data.archive || {};
  const archived = rows.filter(l => l.sourceKind === 'archive').length;
  const curated = rows.length - archived;
  const brands = new Set(rows.map(l => l.brand).filter(Boolean)).size;
  const photos = rows.filter(l => Boolean(l.image || l.imageUrl)).length;
  const unknownPrices = rows.filter(l => l.price == null).length;
  const estimates = rows.filter(l => l.price != null && l.priceKind === 'estimate').length;
  const number = value => new Intl.NumberFormat(getLanguage() === 'en' ? 'en-US' : 'ru-RU').format(value);
  const count = number(rows.length), archiveCount = number(archived), curatedCount = number(curated);
  const updated = esc(data.updatedAt || '—');
  const sourceDate = esc(archive.sourceDate || '2023');
  const sources = (data.sourceNotes || []).map(source => {
    const label = sourceLabel(source);
    if (!label || safeUrl(source.url) === '#') return '';
    return `<a href="${safeUrl(source.url)}" target="_blank" rel="noopener noreferrer">${esc(label.title)}${label.note ? `<span>${esc(label.note)}</span>` : ''}</a>`;
  }).filter(Boolean).join('');
  const author = esc(archive.author || 'Juan Merino');
  const license = esc(archive.license || 'Apache-2.0');
  const archiveSource = safeUrl(archive.sourceUrl);
  const licenseSource = safeUrl(archive.licenseUrl);
  const title = localized('Каталог туралы ашық айтамыз.','Открыто о нашем каталоге.','A clear view of our catalog.');
  const subtitle = localized(
    `${count} конфигурация · ${number(brands)} бренд · Жаңартылған күні: ${updated}`,
    `${count} конфигураций · ${number(brands)} брендов · Обновлено: ${updated}`,
    `${count} configurations · ${number(brands)} brands · Updated: ${updated}`,
  );
  const coverage = localized(
    `Каталогта өндіруші сипаттамаларымен іріктелген ${curatedCount} конфигурация және ашық датасеттен алынған ${archiveCount} мұрағат конфигурациясы бар. Бір серияның RAM, процессор немесе графикасы әртүрлі нұсқалары бөлек жазба болуы мүмкін.`,
    `Каталог включает ${curatedCount} конфигураций, отобранных по характеристикам производителей, и ${archiveCount} архивных конфигураций из открытого датасета. Варианты одной серии с разной памятью, процессором или графикой могут быть отдельными записями.`,
    `The catalog combines ${curatedCount} curated manufacturer-based configurations with ${archiveCount} archived configurations from an open dataset. Versions of the same series with different memory, processors or graphics may appear as separate records.`,
  );
  const incomplete = localized(
    'Бұл барлық ноутбуктің толық базасы емес. Каталогта жаңа буындар да, бұрынғы және қалпына келтірілген модельдер де бар. Жаңа модельдер, дүкен бағалары мен қоймадағы қор автоматты жаңартылмайды.',
    'Это не полная база всех ноутбуков. Здесь есть современные поколения, более ранние модели и восстановленные устройства. Новые модели, цены магазинов и остатки не обновляются автоматически.',
    'This is not an exhaustive database of every laptop. It includes modern generations, older models and refurbished listings. New models, store prices and stock are not updated automatically.',
  );
  const pricing = localized(
    `${number(estimates)} жазбадағы теңге бағасы — бюджет жоспарлауға арналған шартты бағдар, тексерілген дүкен ұсынысы емес. ${number(unknownPrices)} жазбада қазіргі баға белгісіз болып сақталған; белгісіз мән нөл теңге дегенді білдірмейді.`,
    `Цены в тенге в ${number(estimates)} записях — условные ориентиры для бюджета, а не проверенные предложения магазинов. В ${number(unknownPrices)} записях актуальная цена оставлена неизвестной; неизвестное значение не означает нулевую цену.`,
    `KZT prices in ${number(estimates)} records are illustrative budget estimates, not verified store offers. Current prices remain unknown in ${number(unknownPrices)} records; an unknown value does not mean a price of zero.`,
  );
  const archivePricing = localized(
    `Мұрағаттың бастапқы дерек күні: ${sourceDate}. JSON ішіндегі бастапқы EUR бағалары — сол уақыттағы тарихи мәндер. Олар бүгінгі теңге бағасына айналдырылмаған және қазіргі сатылым ұсынысы ретінде қолданылмайды. Нақты SKU, баға және қолжетімділікті сатып аларда сатушыдан тексер.`,
    `Дата исходного архива: ${sourceDate}. Первоначальные цены в EUR внутри JSON — исторические значения того периода. Они не пересчитаны в сегодняшние цены в тенге и не используются как актуальные предложения. Перед покупкой проверь точный SKU, цену и наличие у продавца.`,
    `Archive source date: ${sourceDate}. Original EUR prices in the JSON are historical values from that period. They have not been converted into present-day KZT prices and are not treated as current offers. Check the exact SKU, price and availability with the seller before buying.`,
  );
  const specifications = localized(
    'Көрсетілмеген салмақ, видеокарта, операциялық жүйе және басқа сипаттамалар ойдан толтырылмайды. Шектеуші сүзгілер қосылғанда белгісіз мәндері бар жазбалар нәтижеден жасырылуы мүмкін. Ресми сериядағы конфигурациялар аймаққа қарай өзгереді; мұрағат жазбасы модельдің бүгін сатылатынын растамайды.',
    'Отсутствующие вес, видеокарта, операционная система и другие характеристики не выдумываются. При строгих фильтрах записи с неизвестными значениями могут не попасть в результаты. Официальные комплектации серий зависят от региона; архивная запись не подтверждает, что модель продаётся сегодня.',
    'Missing weight, graphics, operating-system and other specifications are not invented. Restrictive filters may exclude records with unknown values. Official series configurations vary by region; an archived record does not establish current availability.',
  );
  const popularity = localized(
    '1–5 жұлдыз — модель сериясының танымалдығына берілген редакциялық баға. 5 жұлдыз осы редакциялық шкаладағы ең жоғары деңгейді білдіреді. Бұл тексерілген сатылым саны, іздеу статистикасы, сатып алушы пікірі немесе сапа рейтингі емес. «Танымалдары алдымен» реті осы бағалауға сүйенеді.',
    'От 1 до 5 звёзд — редакционная оценка известности серии. 5 звёзд означают высший уровень именно на этой редакционной шкале. Это не проверенные продажи, статистика поиска, отзывы покупателей или оценка качества. Порядок «Сначала популярные» опирается на эту оценку.',
    'The 1–5 stars are an editorial estimate of a model series’ familiarity. Five stars mean the highest level on this editorial scale. They are not verified sales, search statistics, customer reviews or a quality score. “Most popular first” uses this estimate.',
  );
  const photoText = localized(
    `Қазір ${number(photos)} конфигурацияға интернеттен алынған өнім фотосы байланыстырылған. Фото сәйкестігі модель немесе серия деңгейінде тексеріледі: корпус түсі мен нақты конфигурациясы өзгеше болуы мүмкін. Бір сериядағы нұсқалар бір фотосуретті бөлісуі мүмкін. Фото табылмаған жерде «Фото әзірге жоқ» көрсетіледі.`,
    `Сейчас фотографии товаров из интернета связаны с ${number(photos)} конфигурациями. Соответствие проверяется на уровне модели или серии: цвет корпуса и точная комплектация могут отличаться. Варианты одной серии могут использовать одно фото. Если снимок не найден, показывается «Фото пока нет».`,
    `Internet product photos are currently linked to ${number(photos)} configurations. Matching is at model or family level: case color and exact configuration may differ. Variants in one family can share a photo. Missing images are clearly marked “Photo not available”.`,
  );
  const photoRights = localized(
    'Суреттің дереккөзі модель мәліметтерінде көрсетіледі. Фотолардың құқықтары тиісті құқық иелерінде қалады; мұрағат деректерінің лицензиясы фотосуреттерге автоматты түрде қолданылмайды.',
    'Источник снимка указан в карточке модели. Права на фотографии сохраняются у соответствующих правообладателей; лицензия архивных данных не распространяется на изображения автоматически.',
    'Photo sources appear in model details. Images remain subject to their respective rights holders; the archived dataset’s license does not automatically cover photographs.',
  );
  const licenseText = localized(
    `${author} жасаған «Laptops Price Dataset» мұрағаты ${license} лицензиясымен жарияланған. Nout үшін CSV JSON-ға айналдырылып, қайталанған сипаттамалар біріктірілді, атаулар мен өлшем бірліктері біріздендірілді, аудармалар және редакциялық санаттар қосылды. Толық лицензия мәтіні мен өзгерту туралы белгі жүктелетін JSON ішінде сақталған.`,
    `Архив «Laptops Price Dataset» автора ${author} опубликован под лицензией ${license}. Для Nout CSV преобразован в JSON, повторяющиеся характеристики объединены, названия и единицы нормализованы, добавлены переводы и редакционные категории. Полный текст лицензии и уведомление об изменениях сохранены в загружаемом JSON.`,
    `The “Laptops Price Dataset” archive by ${author} is published under ${license}. For Nout, CSV was converted to JSON, duplicate specifications merged, names and units normalized, and translations and editorial categories added. The full license and modification notice are retained in the downloadable JSON.`,
  );
  const h = (kk,ru,en) => `<h3>${esc(localized(kk,ru,en))}</h3>`;
  const p = value => `<p>${value}</p>`;
  const html = `<div class="info-content">
    ${h('Каталог нені қамтиды?','Что входит в каталог?','What does the catalog cover?')}
    ${p(esc(coverage))}<div class="info-box">${esc(incomplete)}</div>
    ${h('Бағалар мен қолжетімділік','Цены и наличие','Prices and availability')}
    ${p(esc(pricing))}${p(archivePricing)}
    ${h('Сипаттамалардың дәлдігі','Точность характеристик','Specification accuracy')}${p(esc(specifications))}
    ${h('Жұлдыздар нені білдіреді?','Что означают звёзды?','What do the stars mean?')}${p(esc(popularity))}
    ${h('Ноутбуктердің фотолары','Фотографии ноутбуков','Laptop photographs')}${p(esc(photoText))}${p(esc(photoRights))}
    ${h('Мұрағат және лицензия','Архив и лицензия','Archive and license')}${p(licenseText)}
    <div class="source-list">${archiveSource !== '#' ? `<a href="${archiveSource}" target="_blank" rel="noopener noreferrer">${esc(localized('Түпнұсқа репозиторий','Исходный репозиторий','Original repository'))}</a>` : ''}${licenseSource !== '#' ? `<a href="${licenseSource}" target="_blank" rel="noopener noreferrer">${esc(localized('Датасеттің лицензия беті','Страница лицензии датасета','Dataset license page'))}</a>` : ''}</div>
    <a class="button secondary" href="data.json" download="nout-laptops.json">${esc(localized('Толық каталогты JSON түрінде жүктеу','Скачать весь каталог в JSON','Download the complete catalog as JSON'))}</a>
    ${h('Дереккөздер','Источники','Sources')}<div class="source-list">${sources}</div>
    ${h('Таңдаулылар қайда сақталады?','Где хранится избранное?','Where are saved laptops stored?')}
    ${p(esc(localized('Таңдаулылар, салыстыру тізімі және тіл таңдауы осы браузерде сақталады. Құрылғылар арасында автоматты синхрондау жоқ.','Избранное, список сравнения и выбранный язык хранятся в этом браузере. Автоматической синхронизации между устройствами нет.','Saved laptops, comparison selections and language preference are stored in this browser. They do not automatically synchronize across devices.')))}
    <p class="detail-note">${esc(tr('Каталог және дереккөздер'))} · ${updated}</p>
  </div>`;
  return {title,subtitle,html};
}
