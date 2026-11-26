# NOMAD каталогының дереккөздері

Тексеру күні: **2026-11-27**. Файл: `dist/data.json`.

Каталогта **24 таңдалған конфигурация**, **7 бренд**, **2026 жылғы 8 конфигурация** бар. Бұл барлық шығарылған ноутбуктерді қамтитын база емес. Ескі, қолжетімді үлгілер жаңа модельдермен қатар берілген.

## Нені білдіреді

- `price` — **шартты бюджет бағдары (KZT)**. Ешбір баға Қазақстан дүкенінен тексерілген ұсыныс емес; бағалар сүзгіні демонстрациялау үшін қолмен қойылған. Барлық жолда `priceKind: "estimate"`. Бұл мәндерді нақты баға деп көрсетуге немесе «ең арзан ұсыныс» деп атауға болмайды.
- `sourceUrl` — техникалық сипаттаманың ресми беті. Кейбір өндірушілер нақты SKU емес, сериядағы қолжетімді CPU, RAM, SSD және экран нұсқаларын бірге көрсетеді. Осы каталог сол ресми нұсқаларға негізделген іріктелген конфигурацияларды береді; олардың бір дүкендегі бір SKU ретінде қолжетімділігін растамайды.
- `year` — модель буынының жылы. Кейін жаңартылған техникалық PDF күні өнімнің бастапқы шығарылған күні емес. 2026 белгісі жаңа Apple M5/M6, Zenbook UX5406AA, Yoga 14IPH11 және HP OmniBook X Flip конфигурацияларына ғана берілген.
- `verifiedAt` — ресми дереккөзді тексеру күні; бағаны, Қазақстанда сатылуын немесе нақты дананы тексеру күні емес.
- `weight` — өндіруші жариялаған шамамен салмақ немесе серияның бастапқы салмағы. Зарядтағыш кірмейді; жинаққа қарай өзгереді. HP OmniBook X Flip үшін расталған сан табылмағандықтан `null` берілген.
- `storage` ГБ-мен беріледі: 1024 — 1 ТБ, 2048 — 2 ТБ. Surface Laptop 13 сақтау түрі UFS; интерфейс барлық сақтау орнын автоматты түрде SSD деп атамауы керек.
- `purposes`, қазақша `description`, `badge` — осы сайт үшін жасалған редакциялық жіктеу. Олар өндіруші сертификаты, өлшенген бенчмарк немесе қолданбаның толық үйлесімділігіне кепілдік емес.
- `imageKind` және `color` — сайттағы иллюстрацияға арналған көркемдік метадерек; нақты тауар фотосы немесе түстің ресми атауы емес.
- ARM негізіндегі Windows үлгілерінде арнайы бағдарламалар, драйверлер мен ойындар үйлесімділігі бөлек тексеріледі. Нақты ойын FPS-і немесе батарея ұзақтығы туралы өлшенбеген көрсеткіштер қосылмаған.

## Ресми модель деректері

| Конфигурация | Буын жылы | Дереккөз |
|---|---:|---|
| MacBook Air 13 · M5 | 2026 | [Өндіруші дерегі](https://www.apple.com/macbook-air/specs/) |
| Zenbook S14 · 2026 | 2026 | [Өндіруші дерегі](https://www.asus.com/laptops/for-home/zenbook/asus-zenbook-s-14-ux5406/techspec/) |
| Legion Pro 5 · Gen 10 | 2025 | [Өндіруші дерегі](https://psref.lenovo.com/syspool/Sys/PDF/Legion/Legion_Pro_5_16IAX10/Legion_Pro_5_16IAX10_Spec.pdf) |
| IdeaPad Slim 3i · 15 | 2025 | [Өндіруші дерегі](https://psref.lenovo.com/Detail/IdeaPad_Slim_3_15IRH10?M=83K100J9RA) |
| MacBook Air 15 · M5 | 2026 | [Өндіруші дерегі](https://www.apple.com/macbook-air/specs/) |
| MacBook Pro 14 · M6 | 2026 | [Өндіруші дерегі](https://www.apple.com/macbook-pro/liquid-retina-xdr-display/specs/) |
| MacBook Pro 14 · M5 Pro | 2026 | [Өндіруші дерегі](https://www.apple.com/macbook-pro/liquid-retina-xdr-display/specs/) |
| MacBook Pro 16 · M5 Pro | 2026 | [Өндіруші дерегі](https://www.apple.com/macbook-pro/liquid-retina-xdr-display/specs/) |
| MacBook Air 13 · M4 | 2025 | [Өндіруші дерегі](https://support.apple.com/en-la/122209) |
| V15 Gen 4 · 8 ГБ | 2023 | [Өндіруші дерегі](https://psref.lenovo.com/syspool/Sys/PDF/Lenovo/Lenovo_V15_G4_AMN/Lenovo_V15_G4_AMN_Spec.pdf) |
| V15 Gen 4 · 16 ГБ | 2023 | [Өндіруші дерегі](https://psref.lenovo.com/syspool/Sys/PDF/Lenovo/Lenovo_V15_G4_AMN/Lenovo_V15_G4_AMN_Spec.pdf) |
| Yoga Slim 7i Aura · 14 | 2026 | [Өндіруші дерегі](https://psref.lenovo.com/syspool/Sys/PDF/Yoga/Yoga_Slim_7_14IPH11/Yoga_Slim_7_14IPH11_Spec.pdf) |
| ThinkPad E14 · Gen 7 | 2025 | [Өндіруші дерегі](https://psref.lenovo.com/syspool/Sys/PDF/ThinkPad/ThinkPad_E14_Gen_7_Intel/ThinkPad_E14_Gen_7_Intel_Spec.pdf) |
| LOQ 15 · RTX 5060 | 2025 | [Өндіруші дерегі](https://psref.lenovo.com/syspool/Sys/PDF/LOQ/LOQ_15IRX10/LOQ_15IRX10_Spec.pdf) |
| Vivobook 15 · Core i3 | 2023 | [Өндіруші дерегі](https://www.asus.com/laptops/for-home/vivobook/asus-vivobook-15-x1504/techspec/) |
| Vivobook 15 · Core i5 | 2023 | [Өндіруші дерегі](https://www.asus.com/laptops/for-home/vivobook/asus-vivobook-15-x1504/techspec/) |
| Zenbook S14 · Ultra 7 | 2024 | [Өндіруші дерегі](https://www.asus.com/laptops/for-home/zenbook/asus-zenbook-s-14-ux5406/techspec/) |
| TUF Gaming A16 | 2025 | [Өндіруші дерегі](https://www.asus.com/us/news/7afc8pdjrowxu3er/) |
| ROG Zephyrus G14 | 2025 | [Өндіруші дерегі](https://rog.asus.com/laptops/rog-zephyrus/rog-zephyrus-g14-2025/spec/) |
| OmniBook 5 · 14 | 2025 | [Өндіруші дерегі](https://www8.hp.com/h20195/V2/GetPDF.aspx/4aa8-5074enca) |
| Nitro V 15 · RTX 5060 | 2025 | [Өндіруші дерегі](https://store.acer.com/en-gb/acer-nitro-v-15-gaming-laptop-anv15-52-black-nh-qzaek-00j) |
| Dell 15 · DC15250 | 2025 | [Өндіруші дерегі](https://www.dell.com/it-it/shop/notebook-dell/spd/dell15laptopdc15250) |
| Surface Laptop 13 | 2025 | [Өндіруші дерегі](https://msftstories.thesourcemediaassets.com/sites/726/2025/05/Surface-Laptop-13-inch-Fact-Sheet.pdf) |
| OmniBook X Flip · 14 | 2026 | [Өндіруші дерегі](https://www.hp.com/gb-en/shop/listings/laptops?formfactor=convertible&processortype=intel-core-ultra-5&segment=home) |

Қосымша тексеру беттері:

- [Apple MacBook Air M5 — 2026 техникалық парағы](https://support.apple.com/en-us/126320): модель жылы мен негізгі конфигурация.
- [ASUS Zenbook S14 (2026) хабарламасы](https://press.asus.com/news/press-releases/zenbook-s14-2026/): 2026 буыны және 1,2 кг корпус.
- [ASUS TUF Gaming A16 техникалық парағы](https://www.asus.com/us/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a16-2025/techspec/): 2,2 кг шамамен салмақ.
- [Microsoft Surface салыстыру беті](https://www.microsoft.com/en-us/surface/do-more-with-surface/which-surface-laptop-is-best-for-you): 13 дюймдік 1-буын үлгінің 1,22 кг салмағы.

## Толық каталогқа көшу

**Open Icecat** — өнім сипаттамаларын тұрақты түрде кеңейтуге жарамды бастапқы нұсқа. [Ресми жазылым беті](https://icecat.com/content-subscription/) Open Icecat пен кеңірек Full Icecat қамтуын бөледі және XML, JSON, CSV форматтарын көрсетеді. Тегін бөлім барлық брендті не барлық жаңа ноутбукті қамтиды деген кепілдік бермейді; кейбір суреттер мен видеолардың қолданылуы шектелуі мүмкін.

[Icecat CSV API құжаттамасы](https://iceclog.com/manuals-csv-interface/amp/) өнімді бренд + өндіруші коды, GTIN немесе Icecat ID арқылы іздеуді және аутентификацияны сипаттайды. Осы жобада Icecat тіркелгісі ашылмаған, API қосылмаған және автоматты жаңарту орындалмайды.

Ұсынылатын келесі қадамдар:

1. Icecat тіркелгісін қосып, қолданылатын өнім контентінің лицензиясын сақтау.
2. Өнімдерді `brand + manufacturerPartNumber` бойынша бірегейлендіру. Бір атаудағы түрлі RAM/GPU нұсқаларын біріктірмеу.
3. Жергілікті дүкеннің рұқсат етілген API немесе серіктестік фидін қосу: `offerPrice`, `currency`, `seller`, `stock`, `offerUrl`, `priceCheckedAt` өрістері.
4. Нақты бағаны осы демонстрациялық `price` өрісінен бөлек сақтау; ұсыныс ескірген кезде бағасын «расталмаған» деп белгілеу.
5. Сервердегі жоспарланған синхрондау кезінде жаңа өнімдерді қабылдап, бұрынғы расталған мәндерді себепсіз өшірмеу; өзгеріс журналын жүргізу.
6. API құпияларын браузердегі JavaScript, JSON немесе Git репозиторийіне салмау.

Kaggle сияқты статикалық зерттеу CSV-лерін қосымша оқу материалы ретінде пайдалануға болады, бірақ нақты жиынның лицензиясы, шыққан күні, елдік бағасы және модель қамтуы бөлек тексерілмей, оны «барлық қазіргі ноутбуктер» каталогы деп қолдану дұрыс емес.

