import { Recipe } from '../types';

export const INITIAL_RECIPES: Recipe[] = [
  // 1. Mercimek Çorbası
  {
    id: 'rec-1',
    name: 'Geleneksel Kırmızı Mercimek Çorbası',
    description: 'Taze tereyağı ve nane sosuyla harmanlanmış, pürüzsüz ve sıcacık geleneksel süzme mercimek çorbası.',
    category: 'Çorbalar',
    defaultServings: 4,
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    dietary: ['ekonomik', 'hizli', 'sebzeli'],
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Kırmızı Mercimek', amountPerServing: 60, unit: 'gr', matchedProductId: 'prod-33' },
      { name: 'Kuru Soğan', amountPerServing: 0.25, unit: 'adet', matchedProductId: 'prod-27' },
      { name: 'Patates', amountPerServing: 0.25, unit: 'adet', matchedProductId: 'prod-37' },
      { name: 'Buğday Unu', amountPerServing: 0.5, unit: 'yemek kaşığı', matchedProductId: 'prod-43' },
      { name: 'Tereyağı', amountPerServing: 10, unit: 'gr', matchedProductId: 'prod-25' },
      { name: 'Zeytinyağı', amountPerServing: 5, unit: 'ml', matchedProductId: 'prod-11' },
      { name: 'Tuz & Kuru Nane', amountPerServing: 1, unit: 'çay kaşığı', isPantryStaple: true },
    ],
    steps: [
      'Kuru soğanı ve patatesi iri küpler halinde doğrayın.',
      'Tencerede zeytinyağını ısıtıp unu ve doğranmış soğanları 2 dakika hafifçe kavurun.',
      'Yıkanmış kırmızı mercimeği ve patatesi tencereye ekleyip 5 su bardağı sıcak su ilave edin.',
      'Mercimekler yumuşayana kadar yaklaşık 20 dakika orta ateşte kaynatın.',
      'Pürüzsüz bir kıvam alana kadar el blenderından geçirin.',
      'Küçük bir tavada tereyağını eritip kuru nane ve pul biberle sos hazırlayın, çorbanın üzerine gezdirip sıcak servis yapın.'
    ]
  },

  // 2. Ezogelin Çorbası
  {
    id: 'rec-2',
    name: 'Karakteristik Antep & Hatay Ezogelin Çorbası',
    description: 'Mercimek, pilavlık bulgur, pirinç ve mis kokulu domates salçasının enfes baharatlarla buluştuğu zengin çorba.',
    category: 'Çorbalar',
    defaultServings: 4,
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    dietary: ['ekonomik', 'hizli', 'sebzeli'],
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Kırmızı Mercimek', amountPerServing: 50, unit: 'gr', matchedProductId: 'prod-33' },
      { name: 'Pilavlık Bulgur', amountPerServing: 15, unit: 'gr', matchedProductId: 'prod-34' },
      { name: 'Pirinç', amountPerServing: 10, unit: 'gr', matchedProductId: 'prod-23' },
      { name: 'Domates Salçası', amountPerServing: 0.5, unit: 'yemek kaşığı', matchedProductId: 'prod-29' },
      { name: 'Kuru Soğan', amountPerServing: 0.25, unit: 'adet', matchedProductId: 'prod-27' },
      { name: 'Tereyağı', amountPerServing: 10, unit: 'gr', matchedProductId: 'prod-25' },
      { name: 'Kuru Nane & Pul Biber', amountPerServing: 1, unit: 'çay kaşığı', isPantryStaple: true },
    ],
    steps: [
      'Soğanları ince ince yemeklik doğrayın.',
      'Tencerede tereyağında soğanları pembeleşene kadar soteleyin, salçayı ekleyip kokusu çıkana kadar kavurun.',
      'Yıkanmış mercimek, bulgur ve pirinci tencereye ekleyin.',
      'Sıcak suyu ekleyip bakliyatlar iyice yumuşayana kadar kısık ateşte 25 dakika pişirin.',
      'Kıvam alınca tereyağında yakılmış nane ve pul biberle tatlandırıp sıcak servis yapın.'
    ]
  },

  // 3. Yayla Çorbası
  {
    id: 'rec-3',
    name: 'Ferahlatıcı Yayla Çorbası',
    description: 'Süzme yoğurt, yumurta sarısı ve pirinç terbiyesiyle ipeksi kıvamda nane aromalı yayla çorbası.',
    category: 'Çorbalar',
    defaultServings: 4,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    dietary: ['ekonomik', 'hizli', 'sebzeli'],
    image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Süzme Yoğurt', amountPerServing: 75, unit: 'gr', matchedProductId: 'prod-9' },
      { name: 'Pirinç', amountPerServing: 15, unit: 'gr', matchedProductId: 'prod-23' },
      { name: 'Yumurta Sarısı', amountPerServing: 0.25, unit: 'adet', matchedProductId: 'prod-10' },
      { name: 'Buğday Unu', amountPerServing: 0.5, unit: 'yemek kaşığı', matchedProductId: 'prod-43' },
      { name: 'Tereyağı', amountPerServing: 10, unit: 'gr', matchedProductId: 'prod-25' },
      { name: 'Kuru Nane', amountPerServing: 0.5, unit: 'tatlı kaşığı', isPantryStaple: true },
    ],
    steps: [
      'Pirinçleri 3 su bardağı suda yumuşayana kadar haşlayın.',
      'Ayrı bir kasede süzme yoğurt, un ve yumurta sarısını pürüzsüzleşene kadar çırpın.',
      'Kaynayan pirinç suyundan 1-2 kepçe alıp yoğurtlu karışıma azar azar ekleyerek ılıtın (kesilmemesi için).',
      'Ilıyan yoğurtlu terbiyeyi tencereye sürekli karıştırarak dökün ve kaynayana kadar karıştırmaya devam edin.',
      'Tavada eritilen tereyağında naneyi hafifçe kızdırıp çorbanın üzerine dökün.'
    ]
  },

  // 4. Tavuk Sote
  {
    id: 'rec-4',
    name: 'Renkli Biberli Tavuk Sote',
    description: 'Yüksek ateşte mühürlenmiş lokum gibi tavuk parçaları, tatlı köy biberi, taze domates ve sarımsak dengesi.',
    category: 'Ana Yemekler',
    defaultServings: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    dietary: ['hizli', 'tavuklu'],
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Tavuk Göğsü / Kuşbaşı', amountPerServing: 180, unit: 'gr', matchedProductId: 'prod-20' },
      { name: 'Kuru Soğan', amountPerServing: 0.25, unit: 'adet', matchedProductId: 'prod-27' },
      { name: 'Köy Çarliston Biberi', amountPerServing: 40, unit: 'gr', matchedProductId: 'prod-28' },
      { name: 'Salkım Domates', amountPerServing: 75, unit: 'gr', matchedProductId: 'prod-1' },
      { name: 'Domates Salçası', amountPerServing: 0.5, unit: 'tatlı kaşığı', matchedProductId: 'prod-29' },
      { name: 'Tereyağı / Sıvı Yağ', amountPerServing: 10, unit: 'gr', matchedProductId: 'prod-25' },
      { name: 'Kekik & Karabiber & Tuz', amountPerServing: 1, unit: 'çay kaşığı', isPantryStaple: true },
    ],
    steps: [
      'Geniş bir tavayı iyice ısıtıp tavukları yüksek ateşte suyunu salıp çekene kadar mühürleyin.',
      'Doğranmış soğanları ve biberleri ekleyip 3-4 dakika soteleyin.',
      'Salçayı ve küp doğranmış domatesleri ilave edin.',
      'Tuz, karabiber ve kekiği ekleyip kapağını kapatın; kısık ateşte 10 dakika domatesler suyunu çekene kadar pişirin.'
    ]
  },

  // 5. Kuru Fasulye
  {
    id: 'rec-5',
    name: 'Geleneksel Tereyağlı Kuru Fasulye',
    description: 'Lokum gibi pişen İspir fasulyesi, salçalı ve tereyağlı kıvamlı sosuyla sofraların baş tacı.',
    category: 'Ana Yemekler',
    defaultServings: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 45,
    dietary: ['ekonomik', 'sebzeli'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Kuru Fasulye', amountPerServing: 80, unit: 'gr', matchedProductId: 'prod-35' },
      { name: 'Kuru Soğan', amountPerServing: 0.5, unit: 'adet', matchedProductId: 'prod-27' },
      { name: 'Domates Salçası', amountPerServing: 1, unit: 'yemek kaşığı', matchedProductId: 'prod-29' },
      { name: 'Tatlı Köy Biberi', amountPerServing: 30, unit: 'gr', matchedProductId: 'prod-28' },
      { name: 'Tereyağı', amountPerServing: 15, unit: 'gr', matchedProductId: 'prod-25' },
      { name: 'Sızma Zeytinyağı', amountPerServing: 10, unit: 'ml', matchedProductId: 'prod-11' },
      { name: 'Tuz & Kırmızı Toz Biber', amountPerServing: 1, unit: 'çay kaşığı', isPantryStaple: true },
    ],
    steps: [
      'Fasulyeleri akşamdan ılık suda bekletip ertesi gün hafif diri kalacak şekilde haşlayın.',
      'Tencerede tereyağı ve zeytinyağında yemeklik soğan ve biberleri pembeleşene kadar soteleyin.',
      'Salçayı ekleyip 2 dakika kavurun.',
      'Haşlanmış fasulyeleri ve üzerini 2 parmak geçecek kadar sıcak suyu ekleyin.',
      'Kısık ateşte fasulyeler helmelenip yumuşayana kadar yaklaşık 35-40 dakika pişirin.'
    ]
  },

  // 6. Fırında Köfte Patates
  {
    id: 'rec-6',
    name: 'Fırında Anne Köftesi & Elma Dilim Patates',
    description: 'Özel baharatlarla yoğrulmuş leziz dana köfteler, altın sarısı patates dilimleri ve domates sosu.',
    category: 'Ana Yemekler',
    defaultServings: 4,
    prepTimeMinutes: 20,
    cookTimeMinutes: 30,
    dietary: ['etli'],
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Dana Kıyma', amountPerServing: 125, unit: 'gr', matchedProductId: 'prod-36' },
      { name: 'Patates', amountPerServing: 150, unit: 'gr', matchedProductId: 'prod-37' },
      { name: 'Kuru Soğan', amountPerServing: 0.25, unit: 'adet', matchedProductId: 'prod-27' },
      { name: 'Yumurta', amountPerServing: 0.25, unit: 'adet', matchedProductId: 'prod-10' },
      { name: 'Köy Ekmeği İçi', amountPerServing: 20, unit: 'gr', matchedProductId: 'prod-5' },
      { name: 'Salkım Domates', amountPerServing: 50, unit: 'gr', matchedProductId: 'prod-1' },
      { name: 'Köy Biberi', amountPerServing: 30, unit: 'gr', matchedProductId: 'prod-28' },
      { name: 'Zeytinyağı & Baharat', amountPerServing: 10, unit: 'ml', matchedProductId: 'prod-11' },
    ],
    steps: [
      'Kıymayı rendelenmiş soğan, ekmek içi, yumurta, tuz, karabiber ve kimyon ile 10 dakika yoğurun ve şekil verin.',
      'Patatesleri elma dilim doğrayıp zeytinyağı, tuz ve kekikle harmanlayın.',
      'Fırın tepsisine köfteleri ve patatesleri dizin; aralara dilimlenmiş domates ve biberleri yerleştirin.',
      '1 tatlı kaşığı salçayı sıcak suda açıp tepsinin üzerine gezdirin.',
      '200 derece önceden ısıtılmış fırında patatesler kızarana kadar 30 dakika pişirin.'
    ]
  },

  // 7. Zeytinyağlı Taze Fasulye
  {
    id: 'rec-7',
    name: 'Ege Usulü Zeytinyağlı Taze Fasulye',
    description: 'Kılçıksız taze fasulye, bol sulu domates, sızma zeytinyağı ve bir tutam şekerle soğuk meze keyfi.',
    category: 'Sebze Yemekleri',
    defaultServings: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    dietary: ['ekonomik', 'sebzeli'],
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Taze Yeşil Fasulye', amountPerServing: 125, unit: 'gr', matchedProductId: 'prod-39' },
      { name: 'Salkım Domates', amountPerServing: 75, unit: 'gr', matchedProductId: 'prod-1' },
      { name: 'Kuru Soğan', amountPerServing: 0.5, unit: 'adet', matchedProductId: 'prod-27' },
      { name: 'Komili Sızma Zeytinyağı', amountPerServing: 15, unit: 'ml', matchedProductId: 'prod-11' },
      { name: 'Toz Şeker', amountPerServing: 0.5, unit: 'çay kaşığı', matchedProductId: 'prod-42' },
      { name: 'Tuz', amountPerServing: 0.5, unit: 'çay kaşığı', isPantryStaple: true },
    ],
    steps: [
      'Fasulyelerin kılçıklarını ayıklayıp boylamasına ikiye bölün.',
      'Geniş yayvan tencerenin tabanına piyazlık doğranmış soğanları ve fasulyeleri yerleştirin.',
      'Üzerine küp küp doğranmış domatesleri yayın.',
      'Zeytinyağı, tuz, şeker ve yarım çay bardağı sıcak suyu ekleyin.',
      'Tencerenin kapağını kapatıp kısık ateşte fasulyeler yumuşayana kadar 30-35 dakika pişirin. Ilık veya soğuk servis edin.'
    ]
  },

  // 8. Ispanak Yemeği
  {
    id: 'rec-8',
    name: 'Pirinçli Taze Ispanak Yemeği',
    description: 'Demir deposu taze yaprak ıspanak, pirinç ve salça ile hazırlanan, yoğurtla servis edilen hafif ev yemeği.',
    category: 'Sebze Yemekleri',
    defaultServings: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    dietary: ['ekonomik', 'hizli', 'sebzeli'],
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Taze Ispanak', amountPerServing: 125, unit: 'gr', matchedProductId: 'prod-38' },
      { name: 'Pirinç', amountPerServing: 15, unit: 'gr', matchedProductId: 'prod-23' },
      { name: 'Kuru Soğan', amountPerServing: 0.25, unit: 'adet', matchedProductId: 'prod-27' },
      { name: 'Domates Salçası', amountPerServing: 0.5, unit: 'tatlı kaşığı', matchedProductId: 'prod-29' },
      { name: 'Zeytinyağı', amountPerServing: 10, unit: 'ml', matchedProductId: 'prod-11' },
      { name: 'Süzme Yoğurt (Servis için)', amountPerServing: 40, unit: 'gr', matchedProductId: 'prod-9' },
    ],
    steps: [
      'Ispanakları sirkeli bol suda birkaç kez yıkayıp iri parçalar halinde doğrayın.',
      'Tencerede zeytinyağında doğranmış soğanları soteleyip salçayı ekleyin.',
      'Ispanakları tencereye azar azar ekleyin (söndükçe kalanını ekleyin).',
      'Yıkanmış pirinçleri, tuzu ve yarım çay bardağı sıcak suyu ilave edin.',
      'Kapağını kapatıp pirinçler yumuşayana kadar yaklaşık 15-20 dakika pişirin. Üzerine süzme yoğurt koyarak servis yapın.'
    ]
  },

  // 9. Pirinç Pilavı
  {
    id: 'rec-9',
    name: 'Tane Tane Tereyağlı Baldo Pirinç Pilavı',
    description: 'Gönen baldo pirinci ve mis kokulu yayık tereyağıyla pişirilen, tane tane dökülen klasik pilav.',
    category: 'Pilav & Makarnalar',
    defaultServings: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 18,
    dietary: ['ekonomik', 'hizli', 'sebzeli'],
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Baldo Pirinç', amountPerServing: 75, unit: 'gr', matchedProductId: 'prod-22' },
      { name: 'Tereyağı', amountPerServing: 15, unit: 'gr', matchedProductId: 'prod-25' },
      { name: 'Zeytinyağı / Sıvı Yağ', amountPerServing: 5, unit: 'ml', matchedProductId: 'prod-11' },
      { name: 'Tuz', amountPerServing: 0.5, unit: 'çay kaşığı', isPantryStaple: true },
    ],
    steps: [
      'Pirinçleri ılık tuzlu suda 20 dakika bekletip nişastası gidene kadar süzün.',
      'Tencerede tereyağı ve zeytinyağını eritin.',
      'Süzülen pirinçleri ekleyip şeffaflaşana kadar 3-4 dakika tahta kaşıkla kavurun.',
      '1.5 ölçü kaynar su ve tuz ilave edip tencerenin kapağını kapatın.',
      'Önce orta ateşte suyunu çekene kadar, sonra en kısık ateşte göz göz olana kadar pişirin. Üzerine kağıt havlu koyup 10 dakika demlendirin.'
    ]
  },

  // 10. Bulgur Pilavı
  {
    id: 'rec-10',
    name: 'Meyhane Usulü Domatesli Bulgur Pilavı',
    description: 'Köz tadında tatlı biber, taze domates salçası ve tereyağlı iri pilavlık bulgur ziyafeti.',
    category: 'Pilav & Makarnalar',
    defaultServings: 4,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    dietary: ['ekonomik', 'hizli', 'sebzeli'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Pilavlık Bulgur', amountPerServing: 70, unit: 'gr', matchedProductId: 'prod-34' },
      { name: 'Kuru Soğan', amountPerServing: 0.25, unit: 'adet', matchedProductId: 'prod-27' },
      { name: 'Tatlı Köy Biberi', amountPerServing: 30, unit: 'gr', matchedProductId: 'prod-28' },
      { name: 'Domates Salçası', amountPerServing: 0.5, unit: 'yemek kaşığı', matchedProductId: 'prod-29' },
      { name: 'Salkım Domates', amountPerServing: 50, unit: 'gr', matchedProductId: 'prod-1' },
      { name: 'Tereyağı', amountPerServing: 15, unit: 'gr', matchedProductId: 'prod-25' },
    ],
    steps: [
      'Tencerede tereyağında soğan ve biberleri hafifçe kavurun.',
      'Salçayı ve rendelenmiş domatesi ekleyip 2 dakika pişirin.',
      'Yıkanmış bulguru tencereye ekleyip 1 dakika karıştırın.',
      '2 ölçü sıcak su ve tuzu ilave edip kapağını kapatın.',
      'Suyunu çekene kadar kısık ateşte 15 dakika pişirin ve 10 dakika dinlendirip servis yapın.'
    ]
  },

  // 11. Salçalı Makarna
  {
    id: 'rec-11',
    name: 'Tereyağlı & Nane Soslu Salçalı Spagetti',
    description: 'Al dente haşlanmış Barilla spagetti, tereyağında kavrulmuş domates salçası ve nane sosuyla nostaljik lezzet.',
    category: 'Pilav & Makarnalar',
    defaultServings: 4,
    prepTimeMinutes: 5,
    cookTimeMinutes: 12,
    dietary: ['ekonomik', 'hizli', 'sebzeli'],
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281292?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Barilla Spaghetti No:5', amountPerServing: 100, unit: 'gr', matchedProductId: 'prod-12' },
      { name: 'Domates Salçası', amountPerServing: 1, unit: 'yemek kaşığı', matchedProductId: 'prod-29' },
      { name: 'Tereyağı', amountPerServing: 15, unit: 'gr', matchedProductId: 'prod-25' },
      { name: 'Sızma Zeytinyağı', amountPerServing: 5, unit: 'ml', matchedProductId: 'prod-11' },
      { name: 'Kuru Nane & Karabiber', amountPerServing: 1, unit: 'çay kaşığı', isPantryStaple: true },
    ],
    steps: [
      'Büyük bir tencerede bol tuzlu suyu kaynatıp spagettileri 9-10 dakika al dente kıvamında haşlayın.',
      'Makarnayı süzmeden önce 1 çay bardağı makarna haşlama suyundan kenara ayırın.',
      'Aynı tencerede tereyağı ve zeytinyağında salçayı ve naneyi 2 dakika kavurun.',
      'Ayırdığınız makarna suyunu tencereye ekleyip sosu pürüzsüzleştirin.',
      'Süzülen makarnayı sosun içine döküp 1 dakika yüksek ateşte harmanlayın ve sıcak servis yapın.'
    ]
  },

  // 12. Menemen
  {
    id: 'rec-12',
    name: 'Geleneksel Tereyağlı Köy Menemeni',
    description: 'Sulu salkım domates, ince doğranmış tatlı biberler ve gezen tavuk yumurtasıyla hazırlanan kahvaltı efsanesi.',
    category: 'Ana Yemekler',
    defaultServings: 2,
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    dietary: ['ekonomik', 'hizli', 'sebzeli'],
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Salkım Domates', amountPerServing: 150, unit: 'gr', matchedProductId: 'prod-1' },
      { name: 'Tatlı Köy Biberi', amountPerServing: 40, unit: 'gr', matchedProductId: 'prod-28' },
      { name: 'Gezen Tavuk Yumurtası', amountPerServing: 2, unit: 'adet', matchedProductId: 'prod-10' },
      { name: 'Tereyağı', amountPerServing: 15, unit: 'gr', matchedProductId: 'prod-25' },
      { name: 'Köy Ekmeği', amountPerServing: 100, unit: 'gr', matchedProductId: 'prod-5' },
      { name: 'Tuz & Pul Biber', amountPerServing: 1, unit: 'çay kaşığı', isPantryStaple: true },
    ],
    steps: [
      'Biberleri ince ince doğrayıp tavada eritilen tereyağında kokusu çıkana kadar 2 dakika soteleyin.',
      'Kabukları soyulup küçük küpler halinde doğranmış domatesleri ekleyin.',
      'Kapağını kapatıp domatesler suyunu salıp çekene kadar kısık ateşte pişirin.',
      'Yumurtaları doğrudan tavanın içine kırın, beyazlarını karıştırıp sarılarını hafif patlatarak sulu kıvamda ocaktan alın.',
      'Çıtır fırın ekmeğiyle sıcak servis yapın.'
    ]
  },

  // 13. Çoban Salata
  {
    id: 'rec-13',
    name: 'Taze Akdeniz Çoban Salatası',
    description: 'Bahçe domatesi, çıtır salatalık, sivri biber, taze soğan ve hakiki Antakya nar ekşisiyle ferahlatıcı salata.',
    category: 'Salata & Meze',
    defaultServings: 4,
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    dietary: ['ekonomik', 'hizli', 'sebzeli'],
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Salkım Domates', amountPerServing: 100, unit: 'gr', matchedProductId: 'prod-1' },
      { name: 'Çengelköy Salatalık', amountPerServing: 80, unit: 'gr', matchedProductId: 'prod-40' },
      { name: 'Tatlı Köy Biberi', amountPerServing: 30, unit: 'gr', matchedProductId: 'prod-28' },
      { name: 'Kuru Soğan', amountPerServing: 0.25, unit: 'adet', matchedProductId: 'prod-27' },
      { name: 'Komili Sızma Zeytinyağı', amountPerServing: 15, unit: 'ml', matchedProductId: 'prod-11' },
      { name: 'Antakya Hakiki Nar Ekşisi', amountPerServing: 10, unit: 'ml', matchedProductId: 'prod-31' },
      { name: 'Tuz', amountPerServing: 0.5, unit: 'çay kaşığı', isPantryStaple: true },
    ],
    steps: [
      'Domates ve salatalıkları eşit büyüklükte küçük küpler halinde doğrayın.',
      'Biberleri ince halkalar, soğanı yarım ay piyazlık doğrayın.',
      'Geniş bir kasede tüm sebzeleri harmanlayın.',
      'Sızma zeytinyağı, hakiki nar ekşisi ve tuzu çırpıp salatanın üzerine gezdirin.'
    ]
  },

  // 14. Patatesli Börek
  {
    id: 'rec-14',
    name: 'Tepside Çıtır Patatesli Kol Böreği',
    description: 'Haşlanmış baharatlı patates harcı, taze el açması yufka ve tereyağlı süt sosuyla fırından yeni çıkmış börek.',
    category: 'Hamur İşi & Börek',
    defaultServings: 6,
    prepTimeMinutes: 20,
    cookTimeMinutes: 35,
    dietary: ['ekonomik', 'sebzeli'],
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Günlük Taze Yufka', amountPerServing: 80, unit: 'gr', matchedProductId: 'prod-41' },
      { name: 'Patates', amountPerServing: 120, unit: 'gr', matchedProductId: 'prod-37' },
      { name: 'Kuru Soğan', amountPerServing: 0.25, unit: 'adet', matchedProductId: 'prod-27' },
      { name: 'Tereyağı / Sıvı Yağ', amountPerServing: 15, unit: 'gr', matchedProductId: 'prod-25' },
      { name: 'Tam Yağlı Çiftlik Sütü', amountPerServing: 40, unit: 'ml', matchedProductId: 'prod-7' },
      { name: 'Yumurta Sarısı', amountPerServing: 0.25, unit: 'adet', matchedProductId: 'prod-10' },
      { name: 'Toz Biber & Tuz & Karabiber', amountPerServing: 1, unit: 'çay kaşığı', isPantryStaple: true },
    ],
    steps: [
      'Patatesleri haşlayıp çatalla ezin; yağda kavrulmuş soğan, tuz ve pul biberle karıştırarak harcı hazırlayın.',
      'Süt, eritilmiş tereyağı ve yumurtayı çırparak sos yapın.',
      'Yufkaları serip sostan sürün, patates harcını yayıp rulo sarın ve tepsiye dizin.',
      'Kalan sosu ve yumurta sarısını böreğin üzerine sürüp çörek otu serpin.',
      '190 derece fırında üzeri nar gibi kızarana kadar 35 dakika pişirin.'
    ]
  },

  // 15. Sütlaç
  {
    id: 'rec-15',
    name: 'Geleneksel Fırın Sütlaç',
    description: 'Doğal günlük tam yağlı süt, pirinç ve vanilya ile pişen, fırında üzeri hafif karamelize geleneksel tatlı.',
    category: 'Tatlılar',
    defaultServings: 4,
    prepTimeMinutes: 10,
    cookTimeMinutes: 30,
    dietary: ['ekonomik', 'tatli'],
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
    ingredients: [
      { name: 'Tam Yağlı Günlük Süt', amountPerServing: 250, unit: 'ml', matchedProductId: 'prod-7' },
      { name: 'Pirinç', amountPerServing: 25, unit: 'gr', matchedProductId: 'prod-23' },
      { name: 'Toz Şeker', amountPerServing: 40, unit: 'gr', matchedProductId: 'prod-42' },
      { name: 'Buğday Nişastası / Un', amountPerServing: 10, unit: 'gr', matchedProductId: 'prod-43' },
      { name: 'Yumurta Sarısı', amountPerServing: 0.25, unit: 'adet', matchedProductId: 'prod-10' },
      { name: 'Tarçın (Süsleme için)', amountPerServing: 0.5, unit: 'çay kaşığı', isPantryStaple: true },
    ],
    steps: [
      'Pirinçleri yumuşayana kadar 1 su bardağı suda haşlayın.',
      'Sütü ve şekeri tencereye ekleyip kaynamaya bırakın.',
      'Nişastayı ve yumurta sarısını az miktarda soğuk sütle ezin ve kaynayan süte yavaşça ekleyin.',
      'Kıvam alana kadar sürekli karıştırarak 5 dakika kaynatın.',
      'Güveç kaselerine paylaştırıp fırın tepsisine biraz su dökün.',
      'Fırının sadece üst ızgarasını açıp 220 derecede üzeri yanıklaşana kadar fırınlayın. Soğuduktan sonra tarçınla servis yapın.'
    ]
  }
];
