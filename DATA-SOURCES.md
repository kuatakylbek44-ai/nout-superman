# Nout каталогының дереккөздері

Жаңартылған күні: **2026-11-27**. Каталог: `dist/data.json`.

## Қамтуы

Каталогта **1 993 нақты атауы бар конфигурация**, **27 бренд** бар. Оның **24 жазбасы** өндірушілердің ресми сипаттамаларымен іріктелген; **1 969 жазбасы** — Juan Merino жасаған ашық деректердің бірегей конфигурациялары. Архив бөлігінде бренд пен модель атауының **1 622 бірегей үйлесімі** бар. Бір модельдің CPU/RAM/GPU нұсқалары бөлек конфигурация болып саналады.

Бұл барлық елдегі барлық ноутбуктің толық және күн сайын жаңартылатын базасы емес. 2026 модельдері мен 2023 жылғы архив бір интерфейсте беріледі, бірақ олардың дерек күні мен сенімділік шегі бөлек белгіленеді.

## Ашық архивтің түпнұсқасы

- Автор: **Juan Merino**.
- [Laptops Price Dataset — Kaggle](https://www.kaggle.com/datasets/juanmerinobermejo/laptops-price-dataset).
- Лицензия: **Apache License 2.0**. Лицензия атауы Kaggle-дің ресми API жауабынан тексерілді: `https://www.kaggle.com/api/v1/datasets/list?search=juanmerinobermejo%2Flaptops-price-dataset`.
- [Автордың GitHub репозиторийі және жинау әдісі](https://github.com/juanmerino89/laptops-data-cleaning). Автор мәліметі бойынша деректер PcComponentes сайтынан **2023-06-25** күні Power Automate арқылы жиналған.
- [Өзгермейтін CSV нұсқасы](https://raw.githubusercontent.com/juanmerino89/laptops-data-cleaning/dcb60a556527e74dd88e2bb8b0696e77a7c3f7cf/laptops.csv), Git commit: `dcb60a556527e74dd88e2bb8b0696e77a7c3f7cf`.
- [DataTalksClub оқу курсы қолданатын сол дерек жиыны](https://github.com/DataTalksClub/machine-learning-zoomcamp/blob/main/cohorts/2024/02-regression/homework.md).

Түпнұсқада 2 160 сауда жазбасы болған: 1 498 жаңа және 662 қалпына келтірілген тауар ұсынысы. Бірдей бренд, модель, CPU, RAM, жинақтауыш, GPU, экран және сенсорлық белгісі бар жазбалар біріктірілді; GPU атауындағы бос орындар мен модель атауындағы тыныс белгілері жаңа конфигурация болып саналмайды. Нәтижесінде 1 969 конфигурация қалды. Бірдей конфигурация жаңа күйінде де ұсынылса, `sourceCondition` үшін `New` сақталады; бұл **2023 жылғы** ұсыныс күйі, қазіргі қойма күйі емес.

## Nout жасаған өзгерістер

CSV JSON-ға түрлендірілді; бренд атаулары қалыпқа келтірілді; модель атауы толық CPU сипаттамасынан бөлінді; нақты өнім атауында бар GPU Ti/SUPER жалғаулары қалпына келтірілді; 1/2/4 ТБ үшін сақтау сыйымдылығы ортақ 1024/2048/4096 ГБ бірлігіне көшірілді. `sourceName` түпнұсқа атауды сақтайды.

Өзгерістер туралы хабарлама `dist/data.json` → `archive.modificationNotice` өрісінде сақталған. Лицензияның толық мәтіні сол файлдағы `archive.licenseText` өрісінде және осы құжаттың соңында беріледі. Қайта импорт командасы:

```sh
node scripts/import-catalog.mjs
```

Немесе жергілікті бастапқы CSV арқылы:

```sh
node scripts/import-catalog.mjs /absolute/path/to/laptops.csv
```

Импорт бұрын қосылған өндіруші жазбаларын және ID-ға байланған фотосурет метадеректерін сақтайды. Бұл жоспарланған автоматты жаңарту емес; бекітілген 2023 жылғы файлды қайта түрлендіру құралы.

## Белгісіз деректер және бағалар

- `sourceKind: "manufacturer"`: өндіруші деректері бойынша іріктелген конфигурация. Нақты жергілікті SKU мен дүкен қоры расталмаған болуы мүмкін.
- `sourceKind: "archive"`: 2023-06-25 дерек жиынынан алынған жазба. `verifiedAt: null`: өндіруші сайтынан жеке қайта тексерілді деген мәлімдеме жасалмайды.
- Архивтің шығарылған жылы, салмағы, операциялық жүйесі және қазіргі теңгелік бағасы расталмағандықтан `null`. Көрсетілмеген GPU `null`, оның түрі `unknown`; бос GPU өрісі автоматты түрде кіріктірілген графика деп саналмайды.
- Архивте бір жинақтауыш көлемі және төрт экран өлшемі белгісіз. Жоқ сипаттамалар сүзгі шартына сәйкес келеді деп есептелмеуі керек.
- `originalPrice`, `originalCurrency: "EUR"`, `originalPriceDate: "2023-06-25"` — тарихи еуролық баға. Ол қазіргі бағаға айналдырылмайды және теңгелік бюджетке қолданылмайды.
- Алғашқы 24 конфигурацияның `priceKind: "estimate"` бағалары — **шартты бюджет бағдары**, дүкен ұсынысы немесе нарықтық баға емес. Архивте `price: null`, `priceKind: "unknown"`.
- `sourceCondition` қазіргі тауардың жағдайы/қоры туралы ақпарат емес.
- Қазіргі сатылым бағалары мен қойма деректеріне API қосылмаған.

## Мақсаттар мен жұлдыздар

`purposes` — сайттың редакциялық жіктеуі. Архив үшін RAM, экран өлшемі, белгілі графика түрі және CPU тобына негізделген қарапайым ережелер қолданылады. Бұл өлшенген өнімділік, FPS, бағдарламалар үйлесімділігі немесе белгілі мамандық үшін кепілдік емес. Архивтің ескі еуролық бағасы оны қазіргі «бюджеттік» санатына автоматты түрде қоспайды.

`popularityStars` 1–5 аралығында, `popularityBasis: "editorial"`. Бұл — **редакциялық танымалдық бағасы**, нақты сатылым, дауыс, пікір саны немесе қолданушылар рейтингі емес. MacBook, ThinkPad, Legion, ROG, TUF, XPS сияқты серияларға 5; IdeaPad, Yoga, Vivobook, Zenbook, Victus, Omen, Pavilion, Katana, Surface Laptop, Nitro, Galaxy Book, Gram серияларына 4; өзге кең таралған бренд серияларына 3, қалғандарына 2 қойылған. Бұл субъективті көрсету тәртібі; сайт оны тексерілген нарық статистикасы ретінде көрсетпеуі керек. Үш тілдегі түсіндірме `popularityNote` ішінде.

## Фотосуреттер

Дерек жиынының Apache 2.0 лицензиясы бөлек алынған өнім фотосуреттеріне автоматты түрде таралмайды. Фотосурет нақты модельге немесе сол корпусқа дәлелді сәйкестік болғанда ғана байланыстырылуы керек. `imageUrl`, `imageSourceUrl`, `imagePath` және фото манифесі дереккөзді сақтайды. Фотосы табылмаған модельге басқа ноутбуктің фотосын беруге болмайды. Жеке фото жинау нәтижесі жобадағы фото манифесінде жазылады.

## Өндіруші дерегімен іріктелген алғашқы конфигурациялар

Төмендегі конфигурациялар серияның ресми нұсқаларына сүйенеді. Олар Қазақстанда дәл осындай SKU-дың қоймада бар екеніне кепілдік бермейді. Салмақ шамамен беріледі, экран/жады аймаққа қарай өзгеруі мүмкін. ARM негізіндегі Windows модельдерінде арнайы драйверлер мен қолданбалар үйлесімділігін бөлек тексеру керек. Surface Laptop 13 сақтау түрі UFS болғандықтан, жалпы «жинақтауыш» атауы қолданылады.

| Конфигурация | Модель жылы | Ресми дереккөз |
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

## Жаңарту үшін келесі дереккөздер

[Open Icecat](https://icecat.com/content-subscription/) деректерді көбірек бренд пен қазіргі модельдерге кеңейтуге көмектесе алады. Open/Full қамтуы мен әр активтің шарттары бөлек тексеріледі; бұл жобаға тіркелгі немесе API кілті қосылмаған. Қазақстандағы нақты баға үшін дүкеннің рұқсат етілген API/прайс-фиді, сатушы сілтемесі, баға тексерілген күні және қор дерегі қажет.

## Apache License 2.0 толық мәтіні

Төмендегі лицензия Juan Merino-ның архив деректеріне және сол деректердің өңделген нұсқасына қатысты. Өндіруші фотосуреттері мен басқа жеке активтердің құқықтары бөлек.


                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
