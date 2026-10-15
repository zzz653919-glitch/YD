/* ===== YasinDoors — script.js (barcha sahifalar uchun yagona frontend JS) ===== */
(async () => {
  'use strict';

  /* ---------- 1. Mahsulotlar (yagona manba) ---------- */
  // color: oq | qora | jigarrang | yogoch ; style: modern | classic ; badge: new | best | premium | sale | limited
  // Haqiqiy foto qo‘shish uchun mahsulotga `image: 'img/nom.jpg'` maydonini yozing — SVG o‘rniga shu ishlatiladi.
  const BADGES = { new: 'Yangi', best: 'Mashhur', premium: 'Premium', sale: 'Chegirma', limited: 'Limited' };
  const PRODUCTS = [
    { id: 1, name: 'Classic White', price: 2790000, color: 'oq', style: 'classic', hex: '#e8e4da', edge: '#cfc9bb', badge: 'best', tags: 'white oq classic pearl',
      desc: 'Nafis panelli och rangli klassik eshik.', long: 'Yumshoq oq tus va ko‘tarma panellar uyga tinch, yorug‘ muhit beradi.', material: 'MDF + emal qoplama', colorName: 'Oq', styleName: 'Classic', stock: true },
    { id: 2, name: 'Modern Oak', price: 2990000, color: 'yogoch', style: 'modern', hex: '#c49a6a', edge: '#9a7347', badge: '', tags: 'oak yogoch wood modern',
      desc: 'Zamonaviy chiziqli naqshli yog‘och eshik.', long: 'Tabiiy eman tusi va zamonaviy chiziqlar uyg‘unligi.', material: 'MDF + yog‘och tekstura', colorName: 'Yog‘och', styleName: 'Modern', stock: true },
    { id: 3, name: 'Black Minimal', price: 2890000, color: 'qora', style: 'modern', hex: '#232323', edge: '#0f0f0f', badge: 'new', tags: 'black qora modern minimal',
      desc: 'Vertikal chiziqli qora MDF eshik.', long: 'Kontrastli, premium ko‘rinishdagi qora eshik. Vertikal naqsh dizaynga chuqurlik beradi.', material: 'MDF + mat PVX qoplama', colorName: 'Qora', styleName: 'Modern', stock: true },
    { id: 4, name: 'Luxury Walnut', price: 3390000, color: 'jigarrang', style: 'classic', hex: '#6b4a33', edge: '#4a3022', badge: 'premium', tags: 'walnut brown jigarrang classic yongoq',
      desc: 'Boy jigarrang yong‘oq rangli eshik.', long: 'Chuqur jigarrang ton va nafis panellar bilan premium klassik model.', material: 'MDF + yong‘oq tekstura', colorName: 'Jigarrang', styleName: 'Classic', stock: true },
    { id: 5, name: 'White Line', price: 2450000, color: 'oq', style: 'modern', hex: '#f1f0ec', edge: '#d8d6cf', badge: '', tags: 'white oq modern minimal',
      desc: 'Toza oq rangdagi minimalist MDF eshik.', long: 'Yorug‘ interyerlar uchun silliq, mat qoplamali zamonaviy eshik.', material: 'MDF + mat PVX qoplama', colorName: 'Oq', styleName: 'Modern', stock: true },
    { id: 6, name: 'Dark Wood', price: 3150000, color: 'yogoch', style: 'classic', hex: '#5a3d28', edge: '#3d2819', badge: '', tags: 'dark wood yogoch classic',
      desc: 'To‘q yog‘och rangidagi klassik eshik.', long: 'Issiq to‘q yog‘och tekstura va klassik panellar an’anaviy interyerga mos keladi.', material: 'MDF + shpon ko‘rinishidagi qoplama', colorName: 'Yog‘och', styleName: 'Classic', stock: true },
    { id: 7, name: 'Minimal Gray', price: 3250000, color: 'kulrang', style: 'modern', hex: '#9a9c9d', edge: '#74777a', badge: 'new', tags: 'gray grey kulrang modern minimal',
      desc: 'Sokin kulrang tusdagi minimalist eshik.', long: 'Neytral kulrang rang deyarli har qanday zamonaviy interyer bilan uyg‘unlashadi.', material: 'MDF + mat PVX qoplama', colorName: 'Kulrang', styleName: 'Modern', stock: true },
    { id: 8, name: 'Premium Brown', price: 3490000, color: 'jigarrang', style: 'modern', hex: '#4a3328', edge: '#33231b', badge: 'premium', tags: 'brown espresso jigarrang modern',
      desc: 'To‘q jigarrang zamonaviy MDF eshik.', long: 'Chuqur jigarrang ranglar elegant va hashamatli ko‘rinish yaratadi.', material: 'MDF + mat PVX qoplama', colorName: 'Jigarrang', styleName: 'Modern', stock: false },
  ];
  const FILTERS = [['all', 'Barchasi'], ['new', 'Yangi'], ['sale', 'Chegirmali'], ['classic', 'Classic'], ['modern', 'Modern'], ['minimal', 'Minimal'], ['yogoch', 'Wood'], ['oq', 'White'], ['qora', 'Black']];
  const matches = (p, f) => f === 'all' || (f === 'new' ? p.badge === 'new' : f === 'sale' ? !!(p.discountPercent || p.old) : [p.color, p.style, ...p.tags.split(' ')].includes(f));
  const NAV = [['index.html', 'Bosh sahifa', 'home'], ['index.html#process', 'Jarayon', 'process'], ['doors.html', 'MDF Eshiklar', 'doors'], ['index.html#config', 'Konstruktor', 'config'], ['about.html', 'Biz haqimizda', 'about'], ['contact.html', 'Aloqa', 'contact']];
  const DELIVERY = { fee: 100000, freeFrom: 5000000 }; // 5 mln dan yuqori buyurtmada yetkazib berish bepul
  // Katalog, yetkazib berish va sayt matnlari serverdan (admin paneldan) olinadi; server ishlamasa, yuqoridagi standart ma'lumot qoladi.
  const CONTENT = { hero: {}, promo: { enabled: false }, contacts: {}, faq: [] };
  const HANDLES = { steel: ['Po‘lat', '#f6f6f6', '#9c9c9c', '#e4e4e4'], black: ['Mat qora', '#4a4a4a', '#121212', '#3a3a3a'], gold: ['Oltin', '#f3e2b0', '#b08a3c', '#e6cf93'] }; // dastak variantlari (konstruktor)
  const sizeOf = p => ({ ...SIZE, ...((p && p.sizes) || {}) }); // modelning o‘lcham chegarasi (admin kiritmasa — umumiy)
  const SIZE = { wMin: 600, wMax: 1200, hMin: 1800, hMax: 2400 }; // konstruktor uchun o‘lcham chegaralari (mm)
  async function getJSON(url) {
    try { const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 3000); const r = await fetch(url, { cache: 'no-store', signal: ctl.signal }); clearTimeout(t); return await r.json(); } catch { return null; }
  }
  async function loadCatalog() {
    const d = await getJSON('/api/catalog');
    if (d && d.ok && Array.isArray(d.products) && d.products.length) {
      PRODUCTS.splice(0, PRODUCTS.length, ...d.products);
      Object.assign(DELIVERY, { fee: d.settings.deliveryFee, freeFrom: d.settings.freeFrom });
      return true;
    }
    return false;
  }
  const [, contentRes] = await Promise.all([loadCatalog(), getJSON('/api/content')]);
  if (contentRes && contentRes.ok && contentRes.content) Object.assign(CONTENT, contentRes.content);
  /* ---------- Til: o‘zbek (standart) va rus. Kalit — o‘zbekcha matnning o‘zi; til almashtirilganda sahifa qayta yuklanadi ---------- */
  const LANG = (() => { try { return localStorage.getItem('lang') === 'ru' ? 'ru' : 'uz'; } catch { return 'uz'; } })();
  document.documentElement.lang = LANG;
  const RU = {
    'Asosiy kontentga o‘tish': 'Перейти к содержимому', 'Bosh sahifa': 'Главная', 'MDF Eshiklar': 'MDF двери', 'Biz haqimizda': 'О нас', 'Aloqa': 'Контакты',
    'Sevimlilar': 'Избранное', 'Savat': 'Корзина', 'Asosiy': 'Главная', 'Katalog': 'Каталог', 'Sevimli': 'Избранное', 'Asosiy menyu': 'Главное меню', 'Tezkor menyu': 'Быстрое меню',
    'Zamonaviy MDF eshiklar': 'Современные MDF двери', 'Uyingiz uchun sifat, dizayn va ishonch.': 'Качество, дизайн и надёжность для вашего дома.',
    'Eshiklarni ko‘rish': 'Смотреть двери', 'Pastga': 'Вниз', 'Pastga aylantirish': 'Прокрутить вниз', '5+ yil tajriba': '5+ лет опыта', 'Individual dizayn': 'Индивидуальный дизайн', '100% MDF': '100% MDF',
    'Eshik — bu shunchaki kirish emas.': 'Дверь — это не просто вход.', 'Bu uyingizning birinchi taassuroti.': 'Это первое впечатление о вашем доме.',
    'Biz faqat MDF eshiklar bilan shug‘ullanamiz: sifatli material, aniq detallar va uyingiz uslubiga mos dizayn.': 'Мы занимаемся только MDF дверями: качественный материал, точные детали и дизайн под стиль вашего дома.',
    'Kolleksiya': 'Коллекция', 'MDF Eshiklar kolleksiyasi': 'Коллекция MDF дверей', 'Kolleksiya bo‘limlari': 'Разделы коллекции', 'Barcha eshiklarni ko‘rish': 'Смотреть все двери',
    'Yangi': 'Новинки', 'Mashhur': 'Популярные', 'Chegirmali': 'Со скидкой', 'Barchasi': 'Все', 'Ranglar': 'Цвета', 'Rang bo‘yicha tanlang': 'Выберите по цвету',
    'Qaysi rang interyeringizga mos? Tanlang va mos modellarni ko‘ring.': 'Какой цвет подходит вашему интерьеру? Выберите и посмотрите модели.',
    'Konstruktor': 'Конструктор', 'O‘z eshigingizni tanlang': 'Подберите свою дверь', 'Uslub, rang va model, so‘ng o‘lchamni kiriting. Tanlov buyurtma izohiga yoziladi.': 'Стиль, цвет и модель, затем введите размер. Выбор попадёт в комментарий к заказу.',
    'Uslub': 'Стиль', 'Rang': 'Цвет', 'Model': 'Модель', 'O‘lcham (mm)': 'Размер (мм)', 'Kenglik (mm)': 'Ширина (мм)', 'Balandlik (mm)': 'Высота (мм)', 'Tanlovingiz': 'Ваш выбор', 'Model narxi': 'Цена модели',
    'Buyurtmaga qo‘shish': 'Добавить в заказ', 'Kenglik 600–1200 mm, balandlik 1800–2400 mm oralig‘ida bo‘lsin.': 'Ширина 600–1200 мм, высота 1800–2400 мм.', 'Bu bo‘limda mos modellar yo‘q.': 'Подходящих моделей нет.',
    'Narx modelga bog‘liq. O‘lchamga qarab yakuniy narxni operator tasdiqlaydi.': 'Цена зависит от модели. Итоговую цену по размеру подтверждает оператор.',
    'Afzalliklar': 'Преимущества', 'Nega YasinDoors?': 'Почему YasinDoors?', 'Faqat MDF': 'Только MDF', 'Premium sifat': 'Премиум качество', 'Ishonch': 'Надёжность',
    'Butun e’tiborimiz bitta mahsulotda — MDF eshiklarda.': 'Всё наше внимание — на одном продукте: MDF дверях.', 'Sifatli material va nafis, aniq detallar.': 'Качественный материал и аккуратные точные детали.',
    'Turli rang, uslub va modellardan tanlash.': 'Выбор среди разных цветов, стилей и моделей.', 'Ochiq munosabat va qulay buyurtma jarayoni.': 'Открытое отношение и удобный процесс заказа.',
    'Jarayon': 'Процесс', 'O‘lchovdan o‘rnatishgacha': 'От замера до установки', 'O‘lchov': 'Замер', 'Dizayn': 'Дизайн', 'Ishlab chiqarish': 'Производство', 'Sifat nazorati': 'Контроль качества', 'O‘rnatish': 'Установка',
    'Eshik o‘lchamlari aniqlanadi.': 'Определяются размеры двери.', 'Model va rang tanlanadi.': 'Выбираются модель и цвет.', 'MDF eshik tayyorlanadi.': 'Изготавливается MDF дверь.', 'Har bir eshik tekshiriladi.': 'Каждая дверь проверяется.', 'Eshik joyiga o‘rnatiladi.': 'Дверь устанавливается на место.',
    'Ko‘p so‘raladigan savollar': 'Частые вопросы', 'FAQ': 'FAQ',
    'Uyingiz uchun ideal MDF eshikni tanlang': 'Выберите идеальную MDF дверь для вашего дома', 'YasinDoors bilan makoningizga zamonaviy ko‘rinish bering.': 'Придайте вашему дому современный вид вместе с YasinDoors.', 'Biz bilan bog‘lanish': 'Связаться с нами',
    'Zamonaviy MDF eshiklar ': 'Современные MDF двери', 'Footer menyusi': 'Меню футера',
    'Zamonaviy va klassik MDF eshiklar kolleksiyasi.': 'Коллекция современных и классических MDF дверей.', 'MDF eshik qidirish': 'Поиск MDF двери', 'MDF eshik qidirish...': 'Поиск MDF двери...',
    'Tavsiya etilgan': 'Рекомендуемые', 'Narx: pastdan yuqoriga': 'Цена: по возрастанию', 'Narx: yuqoridan pastga': 'Цена: по убыванию', 'A-Z': 'А-Я', 'Z-A': 'Я-А', 'Saralash': 'Сортировка', 'Filterlar': 'Фильтры',
    'Chegirmali ': 'Со скидкой', 'Classic': 'Classic', 'Modern': 'Modern', 'Minimal': 'Minimal', 'Wood': 'Дерево', 'White': 'Белые', 'Black': 'Чёрные',
    'Barcha ranglar': 'Все цвета', 'Barcha uslublar': 'Все стили', 'Narx dan (so‘m)': 'Цена от (сум)', 'Narx gacha (so‘m)': 'Цена до (сум)', 'Filtrni tozalash': 'Сбросить фильтры',
    'Mahsulot topilmadi': 'Ничего не найдено', 'Boshqa so‘z yoki filtrni sinab ko‘ring.': 'Попробуйте другое слово или фильтр.', 'Katalogga o‘tish': 'Перейти в каталог', 'Katalogga qaytish': 'Вернуться в каталог',
    'Savatga': 'В корзину', 'Savatga qo‘shish': 'Добавить в корзину', 'Batafsil': 'Подробнее', 'Tezkor ko‘rish': 'Быстрый просмотр', 'To‘liq sahifa': 'Полная страница', 'Aksiya': 'Акция', 'Yopish': 'Закрыть',
    'Solishtirish': 'Сравнить', 'Tozalash': 'Очистить', 'Mahsulotlarni solishtirish': 'Сравнение товаров', 'Rasm': 'Фото', 'Narx': 'Цена', 'Material': 'Материал', 'Mavjudligi': 'Наличие', 'Mavjud': 'В наличии', 'Buyurtma asosida': 'Под заказ',
    'Sizning savatingiz': 'Ваша корзина', 'Tanlangan MDF eshiklar shu yerda saqlanadi.': 'Выбранные MDF двери сохраняются здесь.', 'Savatingiz bo‘sh': 'Ваша корзина пуста', 'Katalogdan o‘zingizga mos MDF eshikni tanlang.': 'Выберите подходящую MDF дверь в каталоге.',
    'Buyurtma xulosasi': 'Итог заказа', 'Yetkazib berish:': 'Доставка:', 'Bepul': 'Бесплатно', 'Jami:': 'Итого:', 'Zakaz berish': 'Оформить заказ',
    'Sevimli mahsulotlar hozircha yo‘q': 'Избранных товаров пока нет', 'O‘zingizga yoqqan eshiklarni saqlab qo‘ying.': 'Сохраняйте понравившиеся двери.',
    'Ism': 'Имя', 'Telefon raqam': 'Номер телефона', 'Telefon': 'Телефон', 'Manzil': 'Адрес', 'Qo‘shimcha izoh': 'Комментарий', 'Zakazni yuborish': 'Отправить заказ', 'Yuborilmoqda…': 'Отправка…', 'Qayta urinish': 'Повторить',
    'Zakaz qabul qilindi': 'Заказ принят', 'Tez orada siz bilan bog‘lanamiz.': 'Мы скоро свяжемся с вами.', 'Zakaz raqami': 'Номер заказа',
    'Zakaz yuborilmadi. Iltimos, qaytadan urinib ko‘ring.': 'Заказ не отправлен. Попробуйте ещё раз.', 'Ismingizni kiriting.': 'Введите имя.', 'Manzilni kiriting.': 'Введите адрес.',
    'Telefon raqamni to‘g‘ri kiriting. Masalan: +998 90 123 45 67': 'Введите номер правильно. Например: +998 90 123 45 67', 'Xabar kamida 10 ta belgidan iborat bo‘lsin.': 'Сообщение — не менее 10 символов.',
    'Narxlar yangilangan. Sahifani yangilab, savatni qayta tekshiring.': 'Цены обновились. Проверьте корзину ещё раз.',
    'Siz bilan bog‘lanishni istaymiz': 'Мы хотим связаться с вами', 'Savollaringiz bo‘lsa yoki eshik tanlashda yordam kerak bo‘lsa, bizga yozing.': 'Если есть вопросы или нужна помощь с выбором двери — напишите нам.',
    'Bog‘laning': 'Свяжитесь с нами', 'Xabar yuborish': 'Отправить сообщение', 'Xabar': 'Сообщение', 'Ish vaqti': 'Часы работы', 'Telegram orqali yozing': 'Написать в Telegram', 'Qo‘ng‘iroq qilish': 'Позвонить',
    'Xabaringiz qabul qilindi!': 'Сообщение получено!', 'Xabar yuborilmadi. Qaytadan urinib ko‘ring.': 'Сообщение не отправлено. Попробуйте ещё раз.',
    'Aloqa ma’lumotlari tez orada qo‘shiladi. Hozircha xabar qoldirishingiz mumkin.': 'Контактные данные скоро появятся. Пока вы можете оставить сообщение.',
    'Mahsulot savatga qo‘shildi': 'Товар добавлен в корзину', 'Mahsulot savatdan olib tashlandi': 'Товар удалён из корзины', 'Sevimlilarga qo‘shildi': 'Добавлено в избранное', 'Mahsulot sevimlilardan olib tashlandi': 'Удалено из избранного',
    'Eng ko‘pi bilan 3 ta mahsulotni solishtirish mumkin': 'Можно сравнить не более 3 товаров', 'Sevimlilarga qo‘shish': 'В избранное', 'Sevimlilarda': 'В избранном',
    'Sahifa topilmadi': 'Страница не найдена', 'Siz izlagan sahifa mavjud emas yoki ko‘chirilgan.': 'Такой страницы нет или она перемещена.', 'Bosh sahifaga qaytish': 'Вернуться на главную',
    'Mahsulot topilmadi.': 'Товар не найден.', 'Maxsus takliflar va chegirmalar': 'Специальные предложения и скидки', 'O‘xshash eshiklar': 'Похожие двери', 'Rasmni kattalashtirish': 'Увеличить фото', 'Dark rejimga o‘tish': 'Тёмная тема', 'Light rejimga o‘tish': 'Светлая тема',
    'Yuqoriga qaytish': 'Наверх', 'Telegram orqali bog‘lanish': 'Связаться через Telegram', 'Sahifa yuklanmadi. Internetni tekshirib, qayta urinib ko‘ring.': 'Страница не загрузилась. Проверьте интернет.',
    'Biz haqimizda ': 'О нас', 'YasinDoors — faqat MDF eshiklarga ixtisoslashgan kompaniya.': 'YasinDoors — компания, специализирующаяся только на MDF дверях.', 'Faqat MDF eshiklar': 'Только MDF двери',
    'Katalogni ko‘rish': 'Смотреть каталог', 'MDF sifati va dizayn': 'Качество MDF и дизайн', 'Ishlab chiqarish jarayoni': 'Процесс производства', 'Material va dizayn': 'Материал и дизайн',
    'Buyurtmani qanday beraman?': 'Как оформить заказ?'
  };
  Object.assign(RU, {
    'Kenglik': 'Ширина', 'Balandlik': 'Высота',
    'O‘lchov': 'Замер', 'Material': 'Материал', 'Dizayn': 'Дизайн', 'Furnitura': 'Фурнитура', 'Sifat nazorati': 'Контроль качества', 'O‘rnatish': 'Установка',
    'Hammasi aniq o‘lchovdan boshlanadi.': 'Всё начинается с точного замера.', 'Mutaxassis eshik oralig‘ini o‘lchaydi: kenglik, balandlik va devor qalinligi. Eshik joyiga aynan mos tayyorlanadi.': 'Специалист замеряет проём: ширину, высоту и толщину стены. Дверь изготавливается строго под ваш проём.',
    'Kenglik × balandlik': 'Ширина × высота', 'Devor qalinligi': 'Толщина стены', 'Eshik oralig‘i': 'Дверной проём',
    'Sifatli MDF plita tanlanadi.': 'Выбирается качественная MDF плита.', 'Zich va bir tekis MDF plita: namlik va harorat o‘zgarishiga barqaror, yuzasi silliq.': 'Плотная и ровная MDF плита: устойчива к влаге и перепадам температуры, поверхность гладкая.',
    'MDF plita': 'MDF плита', 'Bir tekis zichlik': 'Ровная плотность', 'Silliq yuza': 'Гладкая поверхность',
    'Model aniq kesib chiqiladi.': 'Модель точно вырезается.', 'Tanlangan modelga qarab panel va chiziqlar frezer stanokda aniq o‘yiladi.': 'Панели и линии выбранной модели точно фрезеруются на станке.',
    'Rang va qoplama beriladi.': 'Наносятся цвет и покрытие.', 'Emal, mat PVX yoki yog‘och tekstura — interyeringizga mos rangni tanlaysiz.': 'Эмаль, матовый ПВХ или текстура дерева — вы выбираете цвет под интерьер.',
    'Oq': 'Белый', 'Qora': 'Чёрный', 'Yog‘och': 'Дерево', 'Jigarrang': 'Коричневый',
    'Dastak va petlalar o‘rnatiladi.': 'Устанавливаются ручка и петли.', 'Po‘lat, mat qora yoki oltin dastak; petlalar eshik og‘irligiga mos tanlanadi.': 'Ручка из стали, матовая чёрная или золотая; петли подбираются по весу двери.',
    'Har bir eshik tekshiriladi.': 'Каждая дверь проверяется.', 'O‘lcham, yuza va furnitura yetkazib berishdan oldin nazoratdan o‘tadi.': 'Размер, поверхность и фурнитура проходят контроль перед доставкой.', 'O‘lcham': 'Размер', 'Yuza': 'Поверхность',
    'Eshik joyiga o‘rnatiladi.': 'Дверь устанавливается на место.', 'Eshik oraliqqa qo‘yilib, tekislanadi va sozlanadi — yopiladi ham, ochiladi ham silliq.': 'Дверь ставится в проём, выравнивается и настраивается — закрывается и открывается плавно.',
    'Tekislash': 'Выравнивание', 'Sozlash': 'Регулировка', 'Yakuniy tekshiruv': 'Финальная проверка',
    'Ba’zi eshiklar shunchaki o‘rnatiladi va unutiladi. Bu eshik esa uyingizning birinchi taassuroti bo‘ladi — har kuni, har kirishda.': 'Некоторые двери просто устанавливают и забывают. А эта дверь становится первым впечатлением о вашем доме — каждый день, при каждом входе.',
    'Rang va uslubni tanlang — har bir eshik alohida sahifa, tezkor ko‘rish va konstruktor bilan.': 'Выберите цвет и стиль — у каждой двери своя страница, быстрый просмотр и конструктор.',
    'Eshik tanlash': 'Выбрать дверь', 'Jarayon': 'Процесс', 'Konstruktor': 'Конструктор', 'MDF Eshiklar': 'MDF двери',
    'Sizga yoqishi mumkin': 'Вам может понравиться', 'Zakazni tasdiqlash': 'Подтвердить заказ', 'Yetkazib berish': 'Доставка', 'Zakaz holatini tekshirish': 'Проверить статус заказа', 'Kenglik (mm)': 'Ширина (мм)', 'Balandlik (mm)': 'Высота (мм)', 'Eshiklar shu o‘lchamlarda tayyorlanadi': 'Двери изготавливаются в размерах',
    'Nom, rang yoki uslub bo‘yicha qidiring…': 'Поиск по названию, цвету или стилю…',
    'Filtrlarni tozalash': 'Сбросить фильтры', 'Katalogdagi narxlar': 'Цены в каталоге', '(narxlar almashtirildi)': '(значения поменяны местами)', 'Narx dan (so‘m)': 'Цена от (сум)', 'Narx gacha (so‘m)': 'Цена до (сум)',
    'Eshik tanlashda': 'С выбором двери', 'yordam beramiz': 'поможем', 'Savol bering, o‘lcham yoki rang bo‘yicha maslahat oling — tez orada javob beramiz.': 'Задайте вопрос, получите совет по размеру или цвету — скоро ответим.',
    'Qo‘ng‘iroq qilish': 'Позвонить', 'Telegramda yozish': 'Написать в Telegram', 'Xabar qoldirish': 'Оставить сообщение', 'Email (ixtiyoriy)': 'Email (необязательно)', 'Xabaringiz': 'Ваше сообщение', 'Telefon raqam': 'Номер телефона',
    'Uyingizga': 'Придайте дому', 'yangi uslub': 'новый стиль', 'bering': '\u200b', 'Pastga': 'Вниз', 'Vitrina': 'Витрина', 'Premium kolleksiya': 'Премиум коллекция',
    'Galereya': 'Галерея', 'Ranglar va dizaynlar': 'Цвета и дизайн', 'O‘z eshigingizni yarating': 'Создайте свою дверь', 'Qoplama': 'Покрытие', 'Dastak': 'Ручка',
    'Po‘lat': 'Сталь', 'Mat qora': 'Матовый чёрный', 'Oltin': 'Золото', 'Taxminiy narx': 'Примерная цена', 'Fikrlar': 'Отзывы', 'Mijozlarimiz nima deydi': 'Что говорят клиенты', 'Tarix': 'История',
    'Siz ko‘rgan eshiklar': 'Вы смотрели', 'Mashhur': 'Популярное', 'Chegirma': 'Скидка', 'Buyurtma holatini tekshirish': 'Проверить статус заказа', 'Zakaz raqami': 'Номер заказа', 'Tekshirish': 'Проверить',
    'Sahifalar': 'Страницы', 'Zakaz': 'Заказ', 'Jami': 'Итого', 'Tezkor ko‘rish': 'Быстрый просмотр', 'Rang': 'Цвет', 'Uslub': 'Стиль', 'Natija:': 'Результат:', 'Tozalash': 'Сбросить'
  });
  const t = k => (LANG === 'ru' && RU[k]) || k;
  function translateDom(rootEl) { // ruscha rejimda statik va dinamik matnlarni almashtiradi
    if (LANG !== 'ru') return;
    const w = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const v = n.nodeValue.trim(); if (v && RU[v]) n.nodeValue = n.nodeValue.replace(v, RU[v]); }
    rootEl.querySelectorAll('[aria-label],[placeholder],[alt],[title]').forEach(el => ['aria-label', 'placeholder', 'alt', 'title'].forEach(a => { const v = el.getAttribute(a); if (v && RU[v]) el.setAttribute(a, RU[v]); }));
  }

  /* ---------- 2. SVG ikonlar (bir xil stroke va o‘lcham) ---------- */
  const I = d => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const ICON = {
    heart: I('<path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.8 3.6 4.5 7 4.5c2 0 3.7 1.1 5 3 1.3-1.9 3-3 5-3 3.4 0 5.4 3.3 4.2 6.6-1.7 4.8-9.2 9.4-9.2 9.4z"/>'),
    bag: I('<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6.5a3 3 0 016 0V8"/>'),
    search: I('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>'),
    x: I('<path d="M6 6l12 12M18 6L6 18"/>'), arrow: I('<path d="M5 12h14M13 6l6 6-6 6"/>'), down: I('<path d="M12 5v14M6 13l6 6 6-6"/>'), up: I('<path d="M12 19V5M6 11l6-6 6 6"/>'), zoom: I('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2M11 8v6M8 11h6"/>'),
    pin: I('<path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    phone: I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z"/>'),
    clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'), mail: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
    check: I('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.5"/>'),
    sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>'),
    moon: I('<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>'),
    layers: I('<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>'), award: I('<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 21l5-3 5 3-1.5-7"/>'),
    cal: I('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'), pen: I('<path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/>'),
    ruler: I('<path d="M3 17L17 3l4 4L7 21l-4-4z"/><path d="M8 12l2 2M11 9l2 2M14 6l2 2"/>'), factory: I('<path d="M3 20V9l6 3V9l6 3V5h6v15H3z"/>'),
    shield: I('<path d="M12 3l8 3v6c0 5-3.4 8.3-8 9-4.6-.7-8-4-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'),
    door: I('<rect x="6" y="3" width="12" height="18" rx="1.5"/><circle cx="15" cy="12" r=".8"/><path d="M3 21h18"/>'),
    eye: I('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'), minus: I('<path d="M5 12h14"/>'),
    trash: I('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    insta: I('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6"/>'),
    tg: I('<path d="M21 4L3 11l6 2 2 6 3-4 5 4z"/><path d="M9 13l12-9"/>'), grid: I('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'),
    home: I('<path d="M4 11l8-7 8 7v9H4v-9z"/><path d="M10 20v-6h4v6"/>'),
    compare: I('<path d="M8 4v16M16 4v16M4 8l4-4 4 4M12 16l4 4 4-4"/>'),
    tag: I('<path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="8.5" r="1"/>'),
    help: I('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1.1-1.5 2.2M12 17h.01"/>'),
    list: I('<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>')
  };

  /* ---------- 3. Yordamchilar va saqlash ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const find = id => PRODUCTS.find(p => p.id === +id);
  const money = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' so‘m';
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage mavjud emas */ } }
  };
  const root = document.documentElement, page = document.body.dataset.page;
  const savedCart = store.get('cart', {}), savedFavs = store.get('favorites', []), savedCmp = store.get('compare', []);
  let cart = Object.fromEntries(Object.entries(savedCart && typeof savedCart === 'object' ? savedCart : {}).filter(([id, q]) => find(id) && Number.isInteger(q) && q > 0));
  let favs = Array.isArray(savedFavs) ? savedFavs.filter(find) : [];
  let cmp = Array.isArray(savedCmp) ? savedCmp.filter(find).slice(0, 3) : [];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- 4. Realistik eshik sahnasi (SVG: devor, pol, yorug‘lik, yog‘och teksturasi) ---------- */
  const scenes = {};
  function doorImg(p, v = '', hd = 'steel') { // v='detail' — yaqin plan (kartaning ikkinchi rasmi); hd — dastak turi
    if (p.image && v !== 'detail') return p.image;
    const key = `${p.id}|${v}|${hd}`; if (scenes[key]) return scenes[key];
    const H = HANDLES[hd] || HANDLES.steel;
    const wood = p.color === 'yogoch' || p.color === 'jigarrang', hl = 'rgba(255,255,255,.3)', sh = 'rgba(0,0,0,.3)';
    const bevel = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${p.edge}" opacity=".3"/><path d="M${x} ${y + h}V${y}H${x + w}" fill="none" stroke="${hl}" stroke-width="2"/><path d="M${x + w} ${y}V${y + h}H${x}" fill="none" stroke="${sh}" stroke-width="2"/>`;
    const groove = x => `<path d="M${x} 70V366" stroke="${sh}" stroke-width="2"/><path d="M${x + 2} 70V366" stroke="${hl}" stroke-width="1.5"/>`;
    const detail = p.style === 'classic' ? bevel(134, 76, 60, 124) + bevel(206, 76, 60, 124) + bevel(134, 218, 60, 130) + bevel(206, 218, 60, 130)
      : (p.tags.includes('minimal') ? groove(200) : [150, 175, 200, 225, 250].map(groove).join(''));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v === 'detail' ? '150 140 140 175' : '0 0 400 500'}" preserveAspectRatio="xMidYMid slice"><defs>
<linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece6dc"/><stop offset="1" stop-color="#cfc6b6"/></linearGradient>
<linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b5851"/><stop offset="1" stop-color="#2a2927"/></linearGradient>
<linearGradient id="s" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
<linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${H[1]}"/><stop offset=".5" stop-color="${H[2]}"/><stop offset="1" stop-color="${H[3]}"/></linearGradient>
<linearGradient id="l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${wood ? '.012 .3' : '.6'}" numOctaves="3" seed="${p.id}"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.1 -.42"/></filter>
<filter id="b" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6"/></filter></defs>
<rect width="400" height="500" fill="url(#w)"/><rect y="380" width="400" height="120" fill="url(#f)"/>
<rect y="364" width="400" height="16" fill="#faf8f4"/><rect y="378" width="400" height="2" fill="#000" opacity=".16"/>
<polygon points="116,380 284,380 372,500 28,500" fill="url(#l)" opacity=".32"/>
<rect x="298" y="46" width="44" height="336" fill="#000" opacity=".18" filter="url(#b)"/>
<rect x="100" y="40" width="200" height="340" fill="#f3efe9"/><rect x="100" y="40" width="200" height="340" fill="none" stroke="#000" stroke-opacity=".12"/>
<rect x="116" y="56" width="168" height="324" fill="${p.hex}"/><rect x="116" y="56" width="168" height="324" filter="url(#g)" opacity="${wood ? .4 : .1}"/>
${detail}<rect x="116" y="56" width="168" height="324" fill="url(#s)"/>
<path d="M116 56H196L150 380H116z" fill="url(#l)" opacity=".16"/>
<rect x="236" y="213" width="40" height="7" rx="3.5" fill="url(#m)" stroke="#777" stroke-width=".6"/><circle cx="270" cy="216" r="11" fill="url(#m)" stroke="#777" stroke-width=".6"/>
<ellipse cx="200" cy="384" rx="112" ry="6" fill="#000" opacity=".32" filter="url(#b)"/></svg>`;
    return (scenes[key] = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg));
  }
  const altImg = p => (p.gallery && p.gallery[0]) || doorImg(p, 'detail'); // ikkinchi rasm: galereya yoki yaqin plan
  const lz = u => (/^data:/.test(u) ? '' : ' loading="lazy"'); // data: sahnalar ichki, lazy kerak emas
  const img = (p, lazy = true) => `<img src="${doorImg(p)}" alt="${p.name} — ${p.colorName.toLowerCase()} ${p.styleName} MDF eshik" width="400" height="500"${lazy ? lz(doorImg(p)) : ''} decoding="async">`;

  /* ---------- 5. Umumiy qismlar: header, tabbar, footer, CTA, toast, modal ---------- */
  const counter = (k, cls = 'badge') => `<span class="${cls}" data-count="${k}">0</span>`;
  const telHref = p => 'tel:' + String(p).replace(/[^+\d]/g, '');
  const socials = () => { // faqat admin panelda kiritilgan haqiqiy havolalar ko‘rsatiladi
    const c = CONTENT.contacts || {}, a = [];
    if (c.instagram) a.push(`<a href="${esc(c.instagram)}" target="_blank" rel="noopener" aria-label="Instagram">${ICON.insta}</a>`);
    if (c.telegram) a.push(`<a href="${esc(c.telegram)}" target="_blank" rel="noopener" aria-label="Telegram">${ICON.tg}</a>`);
    if (c.phone) a.push(`<a href="${esc(telHref(c.phone))}" aria-label="Qo‘ng‘iroq qilish: ${esc(c.phone)}">${ICON.phone}</a>`);
    return a.length ? `<div class="social">${a.join('')}</div>` : '';
  };
  function renderPromo() { // admin paneldan boshqariladigan banner
    const p = CONTENT.promo, el = $('#promoBar'); if (!el) return;
    if (!p || !p.enabled || !p.text) { el.hidden = true; return; }
    el.hidden = false; el.innerHTML = `<div class="container promo__in"><span>${ICON.tag}${esc(p.text)}</span>${p.link ? `<a href="${esc(p.link)}">${esc(p.linkText || 'Batafsil')} ${ICON.arrow}</a>` : ''}</div>`;
  }
  function applyContent() { // [data-content="hero.title"] kabi joylarga matn qo‘yadi
    $$('[data-content]').forEach(el => { const [g, k] = el.dataset.content.split('.'), v = CONTENT[g] && CONTENT[g][k]; if (v) el.textContent = v; });
  }
  function renderLayout() {
    const links = NAV.map(([h, t, k]) => `<li><a href="${h}" data-k="${k}"${page === k ? ' class="active" aria-current="page"' : ''}>${t}</a></li>`).join('');
    $('#site-header').innerHTML = `<div class="container header__in">
      <a href="index.html" class="logo" aria-label="YasinDoors — bosh sahifa">${ICON.door}<span class="logo__t"><b>YASIN</b><i>DOORS</i></span></a>
      <nav class="nav" id="nav" aria-label="Asosiy menyu"><ul>${links}
        <li class="only-m"><a href="favorites.html">${ICON.heart}Sevimlilar ${counter('fav', 'count')}</a></li>
        <li class="only-m"><a href="cart.html">${ICON.bag}Savat ${counter('cart', 'count')}</a></li></ul></nav>
      <div class="actions">
        <a href="doors.html" class="btn btn--p btn--sm hdr-cta">Eshik tanlash</a>
        <a href="doors.html?focus=search" class="ibtn" data-act="search" aria-label="MDF eshik qidirish">${ICON.search}</a>
        <a href="favorites.html" class="ibtn hm" aria-label="Sevimlilar">${ICON.heart}${counter('fav')}</a>
        <a href="cart.html" class="ibtn hm" aria-label="Savat">${ICON.bag}${counter('cart')}</a>
        <button class="ibtn lang" data-act="lang" aria-label="${LANG === 'ru' ? 'Til: русский. O‘zbekchaga o‘tish' : 'Til: o‘zbekcha. Русский'}">${LANG === 'ru' ? 'RU' : 'UZ'}</button>
        <button class="ibtn" data-act="theme" id="themeBtn" aria-label="Dark / Light rejimni almashtirish"><span class="t-sun">${ICON.sun}</span><span class="t-moon">${ICON.moon}</span></button>
        <button class="ibtn burger" id="burger" aria-label="Menyuni ochish" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
      </div></div>`;
    const foot = [['index.html', 'Bosh sahifa'], ...NAV.slice(1).map(([h, t]) => [h, t]), ['cart.html', 'Savat'], ['favorites.html', 'Sevimlilar']].map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('');
    const fc = CONTENT.contacts || {}, crow = [fc.phone && `<li><a href="${esc(telHref(fc.phone))}">${esc(fc.phone)}</a></li>`, fc.email && `<li><a href="mailto:${esc(fc.email)}">${esc(fc.email)}</a></li>`, fc.address && `<li><span>${esc(fc.address)}</span></li>`, fc.hours && `<li><span>${esc(fc.hours)}</span></li>`, fc.telegram && `<li><a href="${esc(fc.telegram)}" target="_blank" rel="noopener">Telegram</a></li>`].filter(Boolean).join('');
    $('#site-footer').innerHTML = `<div class="container"><div class="footer__in">
      <div><a href="index.html" class="logo" aria-label="YasinDoors — bosh sahifa">${ICON.door}<span class="logo__t"><b>YASIN</b><i>DOORS</i></span></a><p>Zamonaviy MDF eshiklar</p>
        ${socials()}</div>
      <nav aria-label="Footer menyusi"><h4>Sahifalar</h4><ul>${foot}</ul></nav>
      <div class="footer__c"><h4>Aloqa</h4><ul>${crow}<li><a href="contact.html#statusSec">Buyurtma holatini tekshirish</a></li></ul></div></div>
      <div class="footer__word" aria-hidden="true">YASINDOORS</div><small>© 2026 YasinDoors</small></div>`;
    const cta = $('#site-cta');
    if (cta) { // aloqa tugmalari: telefon va Telegram faqat admin kiritgan bo‘lsa chiqadi; xabar qoldirish doim bor
      const cc = CONTENT.contacts || {};
      cta.innerHTML = `<div class="container reveal"><h2>Uyingiz uchun ideal MDF eshikni tanlang</h2><p>YasinDoors bilan makoningizga zamonaviy ko‘rinish bering.</p>
        <div class="cta__acts">${cc.phone ? `<a href="${esc(telHref(cc.phone))}" class="btn btn--p">${ICON.phone}Qo‘ng‘iroq qilish</a>` : ''}${cc.telegram ? `<a href="${esc(cc.telegram)}" class="btn btn--o" target="_blank" rel="noopener">${ICON.tg}Telegramda yozish</a>` : ''}<a href="contact.html#contactForm" class="btn ${cc.phone || cc.telegram ? 'btn--o' : 'btn--p'}">Xabar qoldirish ${ICON.arrow}</a></div></div>`;
    }
    const tab = (h, ic, t, k, c) => `<a href="${h}"${page === k ? ' class="active" aria-current="page"' : ''}>${ICON[ic]}<span>${t}</span>${c ? counter(c) : ''}</a>`;
    document.body.insertAdjacentHTML('beforeend', `<nav class="tabbar" aria-label="Tezkor menyu">${tab('index.html', 'home', 'Asosiy', 'home')}${tab('doors.html', 'grid', 'Katalog', 'doors')}${tab('favorites.html', 'heart', 'Sevimli', 'favorites', 'fav')}${tab('cart.html', 'bag', 'Savat', 'cart', 'cart')}</nav>
      <div class="cmpbar" id="cmpBar" hidden></div>
      <div class="progress" id="progress"></div><div class="toasts" id="toasts" role="status" aria-live="polite"></div>
      <div class="modal" id="modal" role="dialog" aria-modal="true" aria-label="Mahsulot tafsilotlari"><div class="modal__box" id="modalBox"></div></div>`);
    $$('[data-icon]').forEach(el => { el.innerHTML = ICON[el.dataset.icon] || ''; });
    if (!$('#promoBar')) $('#site-header').insertAdjacentHTML('beforebegin', '<div class="promo" id="promoBar" hidden></div>');
    const c = CONTENT.contacts || {};
    document.body.insertAdjacentHTML('beforeend', `<div class="fabs">${c.telegram ? `<a class="fab tg" href="${esc(c.telegram)}" target="_blank" rel="noopener" aria-label="Telegram orqali bog‘lanish">${ICON.tg}</a>` : ''}
      <button class="fab totop" id="toTop" data-act="top" aria-label="Yuqoriga qaytish">${ICON.up}</button></div>`);
    renderPromo(); applyContent();
  }

  /* ---------- 6. Dark / Light, toast ---------- */
  function applyTheme(t, save) {
    root.dataset.theme = t;
    if (save) { try { localStorage.setItem('theme', t); } catch { /* ignore */ } }
    $('#themeBtn').setAttribute('aria-label', t === 'dark' ? 'Light rejimga o‘tish' : 'Dark rejimga o‘tish');
  }
  const toggleTheme = () => {
    const next = () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true), b = $('#themeBtn');
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion:reduce)').matches && b) { // doira bo‘lib ochiladigan o‘tish
      const r = b.getBoundingClientRect(); root.style.setProperty('--thx', r.left + r.width / 2 + 'px'); root.style.setProperty('--thy', r.top + r.height / 2 + 'px'); root.classList.add('theming'); document.startViewTransition(next).finished.finally(() => root.classList.remove('theming'));
    } else next();
  };
  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast'; el.innerHTML = ICON.check + '<span></span>'; $('span', el).textContent = msg;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 2300);
  }

  /* ---------- 7. Savat va sevimlilar ---------- */
  const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
  function totals() {
    const sub = Object.keys(cart).reduce((s, id) => s + find(id).price * cart[id], 0);
    const fee = sub && sub < DELIVERY.freeFrom ? DELIVERY.fee : 0;
    return { sub, fee, total: sub + fee };
  }
  function updateCounts() {
    $$('[data-count="cart"]').forEach(e => { e.textContent = cartCount(); });
    $$('[data-count="fav"]').forEach(e => { e.textContent = favs.length; });
  }
  function commit() { store.set('cart', cart); store.set('favorites', favs); store.set('compare', cmp); updateCounts(); renderPage(); syncModal(); renderCmpBar(); }
  function toggleCmp(id) {
    if (cmp.includes(id)) cmp = cmp.filter(x => x !== id);
    else if (cmp.length >= 3) return toast('Eng ko‘pi bilan 3 ta mahsulotni solishtirish mumkin');
    else cmp = [...cmp, id];
    commit();
  }
  function renderCmpBar() {
    const bar = $('#cmpBar'); if (!bar) return;
    bar.hidden = !cmp.length; if (!cmp.length) return;
    bar.innerHTML = `<div class="container cmpbar__in"><span>${ICON.compare}<b>${cmp.length}</b> ta tanlandi</span>
      <span class="cmpbar__a"><button class="btn btn--p btn--sm" data-act="cmpopen"${cmp.length < 2 ? ' disabled' : ''}>${t('Solishtirish')}</button><button class="btn btn--o btn--sm" data-act="cmpclear" aria-label="Tanlovni tozalash">Tozalash</button></span></div>`;
  }
  function openCompare() {
    const list = cmp.map(find).filter(Boolean); if (list.length < 2) return;
    lastFocus = document.activeElement; modalId = null; boxClass('cmp');
    const row = (label, f) => `<tr><th scope="row">${label}</th>${list.map(p => `<td>${f(p)}</td>`).join('')}</tr>`;
    $('#modalBox').innerHTML = `<button class="modal__x" data-act="close" aria-label="Yopish">${ICON.x}</button><div class="cmpwrap"><h2>Mahsulotlarni solishtirish</h2><div class="tscroll"><table class="cmpt"><thead><tr><td></td>${list.map(p => `<th scope="col"><a href="product.html?id=${p.id}">${esc(p.name)}</a><button class="rm" data-act="cmprm" data-id="${p.id}" aria-label="Olib tashlash: ${esc(p.name)}">${ICON.x}</button></th>`).join('')}</tr></thead><tbody>
      ${row('Rasm', p => `<div class="cmpimg">${img(p, false)}</div>`)}${row('Narx', p => `<b>${money(p.price)}</b>${p.old ? `<br><s>${money(p.old)}</s>` : ''}`)}${row('Uslub', p => esc(p.styleName))}${row('Rang', p => esc(p.colorName))}${row('Material', p => esc(p.material))}${row('Mavjudligi', p => p.stock ? 'Mavjud' : 'Buyurtma asosida')}
      ${row('', p => `<button class="btn btn--p btn--sm" data-act="cart" data-id="${p.id}">${ICON.bag}Savatga</button>`)}</tbody></table></div></div>`;
    openBox();
  }
  let flyFrom = null; // savatga qo‘shilganda: rasm shu joydan savat ikonkasiga uchadi
  function fly() {
    const f = flyFrom; flyFrom = null; if (!f || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    const to = [...$$('.ibtn[href="cart.html"], .tabbar a[href="cart.html"]')].find(e => e.offsetParent), r = f.rect; if (!to || !r.width) return;
    const t2 = to.getBoundingClientRect(), g = document.createElement('img'); g.src = f.src; g.alt = ''; g.className = 'flyimg';
    g.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`; document.body.appendChild(g);
    const dx = t2.left + t2.width / 2 - (r.left + r.width / 2), dy = t2.top + t2.height / 2 - (r.top + r.height / 2);
    g.animate([{ transform: 'none', opacity: .95 }, { transform: `translate(${dx}px,${dy}px) scale(.08)`, opacity: .2 }], { duration: 650, easing: 'cubic-bezier(.5,0,.2,1)' }).onfinish = () => { g.remove(); $$('[data-count="cart"]').forEach(b => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }); };
  }
  function addCart(id, n = 1) { cart[id] = (cart[id] || 0) + n; commit(); toast('Mahsulot savatga qo‘shildi'); fly(); }
  function setQty(id, d) { cart[id] = (cart[id] || 0) + d; if (cart[id] <= 0) delete cart[id]; commit(); }
  function removeCart(id) { delete cart[id]; commit(); toast('Mahsulot savatdan olib tashlandi'); }
  function toggleFav(id) {
    const on = favs.includes(id);
    favs = on ? favs.filter(x => x !== id) : [...favs, id];
    commit(); toast(on ? 'Mahsulot sevimlilardan olib tashlandi' : 'Sevimlilarga qo‘shildi');
    if (!on) $$(`.fav[data-act="fav"][data-id="${id}"]`).forEach(b => {
      b.classList.add('pop');
      for (let k = 0; k < 6; k++) { const s = document.createElement('i'); s.className = 'spark'; s.style.setProperty('--a', k * 60 + 'deg'); b.appendChild(s); setTimeout(() => s.remove(), 600); }
    });
  }

  /* ---------- 8. Sahifalarni chizish ---------- */
  const priceHtml = p => `${money(p.price)}${p.old ? `<s>${money(p.old)}</s>` : ''}${p.discountPercent ? `<span class="disc">−${p.discountPercent}%</span>` : ''}`;
  const card = p => {
    const fav = favs.includes(p.id), inCmp = cmp.includes(p.id), bd = p.badge || (p.discountPercent ? 'sale' : '');
    return `<article class="card reveal in"><div class="card__img">${img(p)}<img class="card__alt" src="${altImg(p)}" alt="" width="400" height="500"${lz(altImg(p))} decoding="async" aria-hidden="true">${bd ? `<span class="pbadge pbadge--${bd}">${BADGES[bd]}</span>` : ''}
      <button class="fav" data-act="fav" data-id="${p.id}" aria-pressed="${fav}" aria-label="${fav ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo‘shish'}: ${p.name}">${ICON.heart}</button>
      <button class="fav cmpb" data-act="cmp" data-id="${p.id}" aria-pressed="${inCmp}" aria-label="${inCmp ? 'Solishtirishdan olib tashlash' : 'Solishtirishga qo‘shish'}: ${p.name}">${ICON.compare}</button>
      <div class="card__ov"><button class="btn btn--glass btn--sm" data-act="details" data-id="${p.id}" aria-label="Tezkor ko‘rish: ${p.name}">${ICON.eye}Tezkor ko‘rish</button></div></div>
      <div class="card__body"><span class="tag"><i class="dot" style="background:${esc(p.hex)}"></i>${p.styleName} · ${p.colorName}</span><h3><a href="product.html?id=${p.id}">${p.name}</a></h3><p>${p.desc}</p>
        <div class="price">${priceHtml(p)}</div>
        <div class="card__act"><button class="btn btn--p btn--sm" data-act="cart" data-id="${p.id}" aria-label="Savatga qo‘shish: ${p.name}">${ICON.bag}Savatga</button>
        <button class="btn btn--o btn--sm touch" data-act="details" data-id="${p.id}" aria-label="Batafsil: ${p.name}">Batafsil</button></div></div></article>`;
  };
  /* --- aqlli qidiruv: rang, uslub, nom, material, narx; o‘zbekcha/ruscha/inglizcha so‘zlar, apostrof va 1 harfli xatolarga chidamli --- */
  const norm = v => String(v ?? '').toLowerCase().replace(/ё/g, 'е').replace(/[ʻʼ'`‘’´‛]/g, '').replace(/[^a-z0-9а-я\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const SYN = {}; // sinonimlar: biridan boshqasi topiladi (masalan: qora = black = чёрный)
  [['qora', 'black', 'черный'], ['oq', 'white', 'белый', 'ok'], ['jigarrang', 'brown', 'коричневый'], ['yongoq', 'walnut', 'орех'], ['yogoch', 'wood', 'дерево', 'oak', 'eman', 'дуб', 'daraxt'],
   ['kulrang', 'gray', 'grey', 'серый'], ['klassik', 'classic', 'классика', 'классический'], ['zamonaviy', 'modern', 'современный'], ['minimal', 'minimalist', 'минимализм']]
    .forEach(g => { const n = g.map(norm); n.forEach(w => { SYN[w] = n; }); });
  const wordCache = new Map();
  const wordsOf = p => { const k = p.id; if (!wordCache.has(k)) wordCache.set(k, norm(`${p.name} ${p.desc} ${p.long || ''} ${p.tags} ${p.colorName} ${p.styleName} ${p.material} ${p.price}`).split(' ')); return wordCache.get(k); };
  const lev1 = (a, b) => { // tahrir masofasi ≤ 1 (almashtirish, tushib qolgan yoki ortiqcha harf)
    if (a === b) return true; const d = a.length - b.length; if (d > 1 || d < -1) return false;
    let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
    if (d === 0) return a.slice(i + 1) === b.slice(i + 1); return d > 0 ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
  };
  const near = (a, w) => a.length >= 5 && w.length >= 4 && [a.length - 1, a.length, a.length + 1].some(n => lev1(a, w.slice(0, n))); // 5+ harfli so‘zlarda 1 ta xatoga chidamli
  const searchHit = (p, q) => { // barcha so‘zlar (VA) mos kelishi kerak: "qora modern" → qora VA modern
    const toks = norm(q).split(' ').filter(Boolean); if (!toks.length) return true; const ws = wordsOf(p);
    return toks.every(tk => (SYN[tk] || [tk]).some(a => ws.some(w => w.startsWith(a) || near(a, w) || (/^\d{3,}$/.test(a) && w.includes(a)))));
  };
  /* --- ko‘rilgan mahsulotlar tarixi (faqat shu qurilmada) --- */
  const pushViewed = id => { const l = [id, ...store.get('viewed', []).filter(x => x !== id)].slice(0, 8); store.set('viewed', l); };
  function renderViewed(skip) {
    const sec = $('#viewedSec'), box = $('#viewedGrid'); if (!sec || !box) return;
    const l = store.get('viewed', []).map(find).filter(p => p && p.id !== skip).slice(0, 4);
    sec.hidden = !l.length; fit(box, l.length); box.innerHTML = l.map(card).join(''); translateDom(sec);
  }
  function renderRec() { // savat sahifasida: savatdagi eshiklarga o‘xshash va mashhur modellar
    const sec = $('#recSec'), box = $('#recGrid'); if (!sec || !box) return;
    const inCart = Object.keys(cart).map(find).filter(Boolean), pop = p => (p.badge === 'best' ? 2 : p.badge === 'premium' ? 1 : 0);
    const score = p => pop(p) + inCart.reduce((a, c) => a + (c.style === p.style ? 1 : 0) + (c.color === p.color ? 1 : 0), 0) / Math.max(inCart.length, 1);
    const l = PRODUCTS.filter(p => !cart[p.id]).sort((a, b) => score(b) - score(a)).slice(0, 3);
    sec.hidden = !l.length; fit(box, l.length); box.innerHTML = l.map(card).join(''); translateDom(sec);
  }
  const fit = (el, n) => el.style.setProperty('--n', Math.min(Math.max(n, 3), 4)); // 3–4 teng ustun: kam kartada bo‘sh joy qolmasin
  const emptyBox = (ic, title, text) => `<div class="empty">${ICON[ic]}<h3>${title}</h3><p>${text}</p><a class="btn btn--p" href="doors.html">Katalogga o‘tish</a></div>`;
  const view = { f: 'all', q: '', sort: 'rec', min: null, max: null, color: '', style: '', w: null, h: null };
  const sorts = { asc: (a, b) => a.price - b.price, desc: (a, b) => b.price - a.price, az: (a, b) => a.name.localeCompare(b.name), za: (a, b) => b.name.localeCompare(a.name) };
  /* narx oralig‘i: mijoz "dan" va "gacha" summani o‘zi kiritadi; dan > gacha bo‘lsa, qiymatlar almashtiriladi */
  const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const range = () => (view.min !== null && view.max !== null && view.min > view.max) ? [view.max, view.min, true] : [view.min, view.max, false];
  const fitsSize = p => { const z = sizeOf(p); return (view.w === null || (view.w >= z.wMin && view.w <= z.wMax)) && (view.h === null || (view.h >= z.hMin && view.h <= z.hMax)); };
  const inRange = p => { const [lo, hi] = range(); return (lo === null || p.price >= lo) && (hi === null || p.price <= hi); };
  function priceHint(n) {
    const [lo, hi, swapped] = range(), el = $('#priceHint'); if (!el) return;
    const sz = view.w !== null || view.h !== null ? `${view.w !== null ? view.w : '…'} × ${view.h !== null ? view.h : '…'} mm` : '';
    const txt = sz && lo === null && hi === null ? `${sz} o‘lchamga mos: ${n} ta eshik` : lo === null && hi === null ? '' : lo !== null && hi !== null ? `${fmt(lo)} – ${fmt(hi)} so‘m oralig‘ida: ${n} ta eshik` : lo !== null ? `${fmt(lo)} so‘mdan yuqori: ${n} ta eshik` : `${fmt(hi)} so‘mgacha: ${n} ta eshik`;
    el.textContent = t(txt) + (swapped && txt ? ' ' + t('(narxlar almashtirildi)') : '') + (sz && (lo !== null || hi !== null) ? ` · ${sz}` : '');
  }
  function renderDoors() {
    const q = view.q.trim();
    let list = PRODUCTS.filter(p => matches(p, view.f) && (!view.color || p.color === view.color) && (!view.style || p.style === view.style) && inRange(p) && fitsSize(p) &&
      (!q || searchHit(p, q)));
    if (sorts[view.sort]) list = [...list].sort(sorts[view.sort]);
    const prices = PRODUCTS.map(p => p.price), pr = prices.length ? `${fmt(Math.min(...prices))} – ${fmt(Math.max(...prices))} so‘m` : '';
    $('#doorsGrid').innerHTML = list.length ? list.map(card).join('') : `<div class="empty">${ICON.search}<h3>Mahsulot topilmadi</h3><p>${(view.w !== null || view.h !== null) ? `${t('Eshiklar shu o‘lchamlarda tayyorlanadi')}: ${SIZE.wMin}–${SIZE.wMax} × ${SIZE.hMin}–${SIZE.hMax} mm` : range().some(v => v !== null) && pr ? `${t('Katalogdagi narxlar')}: ${pr}` : 'Boshqa so‘z yoki filtrni sinab ko‘ring.'}</p><button class="btn btn--o" type="button" data-act="freset">Filtrlarni tozalash</button></div>`;
    priceHint(list.length);
    $('#resCount').textContent = `${list.length} / ${PRODUCTS.length}`;
  }
  function renderCart() {
    const items = Object.keys(cart).map(id => ({ p: find(id), q: cart[id] })), t = totals();
    $('#cartRoot').innerHTML = items.length ? `<div class="cart"><div>${items.map(({ p, q }) => `<div class="row">${img(p)}
      <div><h3>${p.name}</h3><p>${money(p.price)}${p.discountPercent ? ` · aksiya −${p.discountPercent}%` : ''}</p></div>
      <div class="qty"><button data-act="minus" data-id="${p.id}" aria-label="Kamaytirish: ${p.name}">${ICON.minus}</button><span aria-live="polite">${q}</span><button data-act="plus" data-id="${p.id}" aria-label="Ko‘paytirish: ${p.name}">${ICON.plus}</button></div>
      <div class="sub">${money(p.price * q)}</div>
      <button class="rm" data-act="remove" data-id="${p.id}" aria-label="O‘chirish: ${p.name}">${ICON.trash}</button></div>`).join('')}</div>
      <aside class="sum"><h3>Buyurtma xulosasi</h3><dl><dt>Mahsulotlar (${cartCount()} ta):</dt><dd>${money(t.sub)}</dd></dl>
      <dl><dt>Yetkazib berish:</dt><dd>${t.fee ? money(t.fee) : 'Bepul'}</dd></dl><dl class="total"><dt>Jami:</dt><dd>${money(t.total)}</dd></dl>
      <button class="btn btn--p" data-act="checkout">Zakaz berish ${ICON.arrow}</button></aside></div>` :
      emptyBox('bag', 'Savatingiz bo‘sh', 'Katalogdan o‘zingizga mos MDF eshikni tanlang.');
  }
  /* --- bosh sahifa: bo‘limlar, ranglar, konstruktor, FAQ --- */
  const HOME_TABS = [['popular', 'Mashhur', p => p.badge === 'best' || p.badge === 'premium'], ['new', 'Yangi', p => p.badge === 'new'], ['sale', 'Chegirmali', p => !!(p.discountPercent || p.old)], ['all', 'Barchasi', () => true]];
  let homeTab = null;
  function renderHome() {
    const tabs = HOME_TABS.filter(([k, , f]) => k === 'all' || PRODUCTS.some(f));
    if (!homeTab || !tabs.some(x => x[0] === homeTab)) homeTab = tabs[0][0];
    $('#homeTabs').innerHTML = tabs.map(([k, n]) => `<button class="chip" data-act="htab" data-k="${k}" aria-pressed="${k === homeTab}">${n}</button>`).join('');
    const ct = $('#colTitle'); if (ct && PRODUCTS.length) { const nc = new Set(PRODUCTS.map(p => p.color)).size; ct.innerHTML = LANG === 'ru' ? `${PRODUCTS.length} дверей. <em>${nc} цветов.</em>` : `${PRODUCTS.length} ta eshik. <em>${nc} ta rang.</em>`; }
    const f = HOME_TABS.find(x => x[0] === homeTab)[2], list = PRODUCTS.filter(f).slice(0, 5);
    fit($('#featured'), list.length);
    $('#featured').classList.toggle('grid--show', list.length >= 5); // asimmetrik vitrina faqat 5 ta mahsulot bo‘lganda
    $('#featured').innerHTML = list.length ? list.map(card).join('') : `<div class="empty">${ICON.search}<h3>Mahsulot topilmadi</h3></div>`;
    const sale = PRODUCTS.filter(p => p.discountPercent || p.old).slice(0, 3); // maxsus takliflar: faqat haqiqiy chegirmalar
    let off = $('#offers');
    if (sale.length && !off) { $('#collection').insertAdjacentHTML('afterend', '<section class="section" id="offers"><div class="container"><div class="head reveal in"><p class="eyebrow">Aksiya</p><h2>Maxsus takliflar va chegirmalar</h2></div><div class="grid" id="offersGrid"></div></div></section>'); off = $('#offers'); }
    if (off) { off.hidden = !sale.length; fit($('#offersGrid'), sale.length); $('#offersGrid').innerHTML = sale.map(card).join(''); }
    const cols = [...new Map(PRODUCTS.map(p => [p.color, p])).values()];
    $('#colorsSec').hidden = !cols.length;
    $('#swatches').innerHTML = cols.map(p => `<a class="sw" href="doors.html?f=${encodeURIComponent(p.color)}"><img src="${doorImg(p)}" alt="${esc(p.colorName)} rangdagi MDF eshik" width="400" height="500"${lz(doorImg(p))} decoding="async"><span><i style="background:${esc(p.hex)}"></i>${esc(p.colorName)}</span></a>`).join('');
    const rev = (CONTENT.reviews || []).filter(x => x.name && x.text); // faqat admin kiritgan haqiqiy fikrlar
    $('#reviewsSec').hidden = !rev.length;
    $('#reviewsList').innerHTML = rev.map(x => `<figure class="rev reveal in"><blockquote>${esc(x.text)}</blockquote><figcaption>${esc(x.name)}</figcaption></figure>`).join('');
    const faq = (CONTENT.faq || []).filter(x => x.q && x.a);
    $('#faqSec').hidden = !faq.length;
    $('#faqList').innerHTML = faq.map(x => `<details><summary>${esc(x.q)}</summary><p>${esc(x.a)}</p></details>`).join('');
  }
  /* --- konstruktor: uslub -> rang -> model + o‘lcham; tanlov buyurtma izohiga yoziladi --- */
  const cfg = { style: '', color: '', coat: '', handle: 'steel', id: 0, w: '', h: '' };
  function cfgPool() { return PRODUCTS.filter(p => (!cfg.style || p.style === cfg.style) && (!cfg.color || p.color === cfg.color) && (!cfg.coat || p.material === cfg.coat)); }
  function renderConfig() {
    const box = $('#cfgRoot'); if (!box) return;
    $('#config').hidden = !PRODUCTS.length;
    const styles = [...new Map(PRODUCTS.map(p => [p.style, p.styleName])).entries()], colors = [...new Map(PRODUCTS.map(p => [p.color, p])).values()];
    const coats = [...new Set(PRODUCTS.map(p => p.material).filter(Boolean))];
    const pool = cfgPool(); if (!pool.some(p => p.id === cfg.id)) cfg.id = pool[0] ? pool[0].id : 0;
    const sel = find(cfg.id), SZ = sizeOf(sel), wOk = +cfg.w >= SZ.wMin && +cfg.w <= SZ.wMax, hOk = +cfg.h >= SZ.hMin && +cfg.h <= SZ.hMax, sizeOk = wOk && hOk;
    const opt = (act, key, val, label, extra = '') => `<button class="opt" type="button" data-act="${act}" data-k="${esc(val)}" aria-pressed="${cfg[key] === val}">${extra}${esc(label)}</button>`;
    const area = +cfg.w * +cfg.h, est = sel && sizeOk ? Math.round(sel.price * Math.min(1.8, Math.max(.6, area / (800 * 2000))) / 10000) * 10000 : 0;
    box.innerHTML = `<div class="cfg__vis">${sel ? `<img src="${doorImg(sel, '', cfg.handle)}" alt="${esc(sel.name)} — ${esc(HANDLES[cfg.handle][0])} dastak bilan" width="400" height="500">` : ''}</div><div class="cfg__f">
      <div><h3>Uslub</h3><div class="opts">${opt('cfs', 'style', '', 'Barchasi')}${styles.map(([k, n]) => opt('cfs', 'style', k, n)).join('')}</div></div>
      <div><h3>Rang</h3><div class="opts">${opt('cfc', 'color', '', 'Barchasi')}${colors.map(p => opt('cfc', 'color', p.color, p.colorName, `<i style="background:${esc(p.hex)}"></i>`)).join('')}</div></div>
      <div><h3>Qoplama</h3><div class="opts">${opt('cfk', 'coat', '', 'Barchasi')}${coats.map(m => opt('cfk', 'coat', m, m)).join('')}</div></div>
      <div><h3>Dastak</h3><div class="opts">${Object.entries(HANDLES).map(([k, h]) => `<button class="opt" type="button" data-act="cfh" data-k="${k}" aria-pressed="${cfg.handle === k}"><i style="background:linear-gradient(135deg,${h[1]},${h[2]})"></i>${h[0]}</button>`).join('')}</div></div>
      <div><h3>Model</h3><div class="opts">${pool.length ? pool.map(p => `<button class="opt" type="button" data-act="cfm" data-id="${p.id}" aria-pressed="${p.id === cfg.id}">${esc(p.name)}</button>`).join('') : '<p>Bu bo‘limda mos modellar yo‘q.</p>'}</div></div>
      <div><h3>O‘lcham (mm)</h3><div class="dims"><label>Kenglik (mm)<input class="field" id="cfW" type="number" inputmode="numeric" min="${SZ.wMin}" max="${SZ.wMax}" value="${esc(cfg.w)}" placeholder="${SZ.wMin}–${SZ.wMax}"></label>
        <label>Balandlik (mm)<input class="field" id="cfH" type="number" inputmode="numeric" min="${SZ.hMin}" max="${SZ.hMax}" value="${esc(cfg.h)}" placeholder="${SZ.hMin}–${SZ.hMax}"></label></div>
        <div class="err" id="cfErr">${(cfg.w || cfg.h) && !sizeOk ? t(`Kenglik ${SZ.wMin}–${SZ.wMax} mm, balandlik ${SZ.hMin}–${SZ.hMax} mm oralig‘ida bo‘lsin.`) : ''}</div></div>
      ${sel ? `<div class="cfg__sum"><h3>Tanlovingiz</h3><dl><dt>Model</dt><dd>${esc(sel.name)}</dd></dl><dl><dt>Uslub</dt><dd>${esc(sel.styleName)}</dd></dl><dl><dt>Rang</dt><dd>${esc(sel.colorName)}</dd></dl><dl><dt>Qoplama</dt><dd>${esc(sel.material)}</dd></dl><dl><dt>Dastak</dt><dd>${HANDLES[cfg.handle][0]}</dd></dl>
        <dl><dt>O‘lcham (mm)</dt><dd>${sizeOk ? `${+cfg.w} × ${+cfg.h}` : '—'}</dd></dl><dl><dt>Model narxi</dt><dd>${money(sel.price)}</dd></dl>${est ? `<dl class="est"><dt>Taxminiy narx</dt><dd>≈ ${money(est)}</dd></dl>` : ''}
        <p class="note">Taxminiy narx standart 800 × 2000 mm o‘lchamga nisbatan hisoblanadi. Yakuniy narxni operator tasdiqlaydi.</p>
        <button class="btn btn--p" type="button" data-act="cfadd"${sizeOk ? '' : ' disabled'}>${ICON.bag}Buyurtmaga qo‘shish</button></div>` : ''}</div>`;
    translateDom(box);
  }
  function cfgKeep() { const a = document.activeElement, id = a && a.id, pos = a && a.selectionStart; renderConfig(); if (id) { const n = $('#' + id); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch { /* number input */ } } } }
  /* --- mahsulot sahifasi --- */
  let pdpImg = 0;
  const images = p => [doorImg(p), ...(p.gallery || [])];
  function renderPdp() {
    const rootEl = $('#pdpRoot'), p = find(new URLSearchParams(location.search).get('id'));
    if (!p) { rootEl.innerHTML = emptyBox('search', 'Mahsulot topilmadi.', 'Katalogdan boshqa MDF eshikni tanlang.'); document.title = 'Mahsulot topilmadi — YasinDoors'; return; }
    pushViewed(p.id);
    const ims = images(p); if (pdpImg >= ims.length) pdpImg = 0;
    const fav = favs.includes(p.id), inCmp = cmp.includes(p.id), sim = PRODUCTS.filter(x => x.id !== p.id && (x.style === p.style || x.color === p.color)).slice(0, 3);
    document.title = `${p.name} — MDF eshik — YasinDoors`;
    const md = document.querySelector('meta[name="description"]'); if (md) md.content = `${p.name}: ${p.desc} ${p.material}. Narxi: ${money(p.price)}.`;
    const ld = document.getElementById('ld') || Object.assign(document.createElement('script'), { id: 'ld', type: 'application/ld+json' });
    ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.long, material: p.material, color: p.colorName, offers: { '@type': 'Offer', priceCurrency: 'UZS', price: p.price, availability: p.stock ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder' } }).replace(/</g, '\\u003c');
    document.head.appendChild(ld);
    rootEl.innerHTML = `<nav class="crumbs" aria-label="Yo‘l"><a href="index.html">Bosh sahifa</a><span>/</span><a href="doors.html">MDF Eshiklar</a><span>/</span><span>${esc(p.name)}</span></nav>
      <div class="pdp"><div class="gal"><button class="gal__main" data-act="lb" aria-label="Rasmni kattalashtirish"><img src="${esc(ims[pdpImg])}" alt="${esc(p.name)} — ${esc(p.colorName.toLowerCase())} ${esc(p.styleName)} MDF eshik" width="400" height="500"><span class="gal__zoom">${ICON.zoom}</span></button>
        ${ims.length > 1 ? `<div class="thumbs">${ims.map((u, i) => `<button type="button" data-act="thumb" data-id="${i}" aria-pressed="${i === pdpImg}" aria-label="Rasm ${i + 1}"><img src="${esc(u)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}</div>
        <div class="pinfo"><p class="eyebrow">${esc(p.styleName)} · ${esc(p.colorName)}</p><h1>${esc(p.name)}</h1><div class="price">${priceHtml(p)}</div><p>${esc(p.long)}</p>
          <ul class="spec"><li><span>Material</span>${esc(p.material)}</li><li><span>Rang</span>${esc(p.colorName)}</li><li><span>Uslub</span>${esc(p.styleName)}</li><li><span>O‘lcham (mm)</span>${sizeOf(p).wMin}–${sizeOf(p).wMax} × ${sizeOf(p).hMin}–${sizeOf(p).hMax}</li><li><span>Mavjudligi</span>${p.stock ? 'Mavjud' : 'Buyurtma asosida'}</li></ul>
          <div class="pbuy"><button class="btn btn--p" data-act="cart" data-id="${p.id}">${ICON.bag}Savatga qo‘shish</button><button class="btn btn--o" data-act="fav" data-id="${p.id}" aria-pressed="${fav}">${ICON.heart}${fav ? 'Sevimlilarda' : 'Sevimlilarga qo‘shish'}</button>
          <button class="btn btn--o" data-act="cmp" data-id="${p.id}" aria-pressed="${inCmp}">${ICON.compare}${inCmp ? 'Solishtirishda' : 'Solishtirish'}</button></div></div></div>
      ${sim.length ? `<div class="related"><div class="head"><h2>O‘xshash eshiklar</h2></div><div class="grid">${sim.map(card).join('')}</div></div>` : ''}`;
  }
  function openLightbox() {
    const p = find(new URLSearchParams(location.search).get('id')); if (!p) return;
    lastFocus = document.activeElement; modalId = null; boxClass('lb');
    $('#modalBox').innerHTML = `<button class="modal__x" data-act="close" aria-label="Yopish">${ICON.x}</button><div class="lb__in" id="lbIn"><img src="${esc(images(p)[pdpImg])}" alt="${esc(p.name)}" data-act="lbz"></div>`;
    openBox(); $('.modal__x').focus();
  }
  function renderPage() {
    try { renderPageInner(); } catch (e) { console.error(e); }
    $$('[aria-busy]').forEach(el => el.removeAttribute('aria-busy'));
    translateDom(document.querySelector('main'));
  }
  function renderPageInner() {
    if (page === 'home' && $('#homeTabs')) { renderHome(); renderConfig(); }
    if (page === 'home' || page === 'doors' || page === 'product') renderViewed(page === 'product' ? +new URLSearchParams(location.search).get('id') : 0);
    if (page === 'doors') renderDoors();
    if (page === 'product') renderPdp();
    if (page === 'favorites') { const l = PRODUCTS.filter(p => favs.includes(p.id)); $('#favGrid').innerHTML = l.length ? l.map(card).join('') : emptyBox('heart', 'Sevimli mahsulotlar hozircha yo‘q', 'O‘zingizga yoqqan eshiklarni saqlab qo‘ying.'); }
    if (page === 'cart') { renderCart(); renderRec(); }
  }

  /* ---------- 9. Modal: tezkor ko‘rish ---------- */
  let modalId = null, modalQty = 1, lastFocus = null;
  const boxClass = c => { $('#modalBox').className = 'modal__box' + (c ? ' ' + c : ''); };
  function syncModal() {
    if (!modalId) return;
    const p = find(modalId), on = favs.includes(p.id); boxClass();
    $('#modalBox').innerHTML = `<button class="modal__x" data-act="close" aria-label="Yopish">${ICON.x}</button>
      <div class="modal__img">${img(p, false)}</div>
      <div class="modal__txt"><p class="eyebrow">${p.styleName} · ${p.colorName}</p><h2>${p.name}</h2>
      <div class="price">${priceHtml(p)}</div><p>${p.long}</p>
      <ul class="spec"><li><span>Material</span>${p.material}</li><li><span>Rang</span>${p.colorName}</li><li><span>Uslub</span>${p.styleName}</li><li><span>Mavjudligi</span>${p.stock ? 'Mavjud' : 'Buyurtma asosida'}</li></ul>
      <div class="card__act"><div class="qty"><button data-act="mq-" aria-label="Kamaytirish">${ICON.minus}</button><span aria-live="polite">${modalQty}</span><button data-act="mq+" aria-label="Ko‘paytirish">${ICON.plus}</button></div>
      <button class="btn btn--p" data-act="cartq" data-id="${p.id}" aria-label="Savatga qo‘shish">${ICON.bag}Savatga</button></div>
      <button class="btn btn--o" data-act="fav" data-id="${p.id}" aria-pressed="${on}">${ICON.heart}${on ? 'Sevimlilarda' : 'Sevimlilarga qo‘shish'}</button>
      <a class="btn btn--o" href="product.html?id=${p.id}">To‘liq sahifa ${ICON.arrow}</a></div>`;
  }
  const openBox = () => { translateDom($('#modalBox')); $('#modal').classList.add('open'); document.body.classList.add('lock'); };
  function openModal(id) { lastFocus = document.activeElement; modalId = +id; pushViewed(+id); modalQty = 1; syncModal(); translateDom($('#modalBox')); openBox(); $('.modal__x').focus(); }
  function closeModal() {
    if (!$('#modal').classList.contains('open')) return;
    modalId = null; $('#modal').classList.remove('open'); document.body.classList.remove('lock'); if (lastFocus) lastFocus.focus();
  }

  /* ---------- 10. Formalar: real-time validatsiya ---------- */
  function bindValidation(f, rules, pre) {
    const check = (k, force) => {
      const i = f.elements[k]; if (!force && !i.dataset.t) return true;
      const r = rules[k](i.value); i.classList.toggle('bad', r !== true); $('#' + pre + k).textContent = r === true ? '' : r; return r === true;
    };
    Object.keys(rules).forEach(k => { const i = f.elements[k]; i.addEventListener('blur', () => { i.dataset.t = 1; check(k); }); i.addEventListener('input', () => check(k)); });
    return () => Object.keys(rules).map(k => check(k, true)).every(Boolean);
  }
  const phoneOk = v => { const d = v.replace(/\D/g, ''); return (/^\+?[\d\s()-]+$/.test(v.trim()) && d.length >= 9 && d.length <= 13) || 'Telefon raqamni to‘g‘ri kiriting. Masalan: +998 90 123 45 67'; };
  function initContact() {
    const c = CONTENT.contacts || {}, rows = [];
    if (c.phone) rows.push(`<li>${ICON.phone}<a href="${esc(telHref(c.phone))}">${esc(c.phone)}</a></li>`);
    if (c.email) rows.push(`<li>${ICON.mail}<a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>`);
    if (c.address) rows.push(`<li>${ICON.pin}<span>${esc(c.address)}</span></li>`);
    if (c.hours) rows.push(`<li>${ICON.clock}<span>${esc(c.hours)}</span></li>`);
    if (c.telegram) rows.push(`<li>${ICON.tg}<a href="${esc(c.telegram)}" target="_blank" rel="noopener">Telegram orqali yozing</a></li>`);
    $('#contactInfo').innerHTML = rows.join('');
    $('#contactNote').textContent = rows.length ? '' : t('Aloqa ma’lumotlari tez orada qo‘shiladi. Hozircha xabar qoldirishingiz mumkin.');
    const f = $('#contactForm');
    const valid = bindValidation(f, {
      name: v => v.trim().length >= 2 || 'Ismingizni kiriting.', phone: phoneOk,
      message: v => v.trim().length >= 10 || 'Xabar kamida 10 ta belgidan iborat bo‘lsin.',
      email: v => !v.trim() || /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(v.trim()) || 'Email noto‘g‘ri. Masalan: ism@example.com'
    }, 'e-');
    f.addEventListener('submit', async e => {
      e.preventDefault(); if (!valid()) return;
      const btn = $('#cBtn'), el = f.elements; btn.disabled = true; $('#cErr').innerHTML = '';
      try {
        const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: el.name.value, phone: el.phone.value, email: el.email.value, message: el.message.value, website: el.website.value }) });
        const d = await r.json().catch(() => ({})); if (!r.ok || !d.ok) throw new Error(d.error || 'fail');
        f.reset(); $$('.field', f).forEach(i => delete i.dataset.t); toast('Xabaringiz qabul qilindi!');
      } catch (err) { const m = err && err.message; $('#cErr').innerHTML = ICON.x + `<span>${m && m !== 'fail' && !/fetch|network|load failed|abort/i.test(m) ? esc(m) : t('Xabar yuborilmadi. Qaytadan urinib ko‘ring.')}</span>`; }
      finally { btn.disabled = false; }
    });
  }

  function initStatus() { // buyurtma holatini zakaz raqami + telefon bilan tekshirish
    const f = $('#statusForm'); if (!f) return;
    const last = store.get('lastOrder', null); if (last && last.id) { f.elements.id.value = last.id; f.elements.phone.value = last.phone || ''; }
    f.addEventListener('submit', async e => {
      e.preventDefault(); const btn = $('#stBtn'), out = $('#stRes'), err = $('#stErr'); out.innerHTML = ''; err.innerHTML = '';
      const id = f.elements.id.value.trim(), ph = f.elements.phone.value.trim();
      if (!id || ph.replace(/\D/g, '').length < 9) { err.innerHTML = ICON.x + `<span>${t('Zakaz raqami va telefonni to‘g‘ri kiriting.')}</span>`; return; }
      btn.disabled = true;
      try {
        const r = await fetch(`/api/order-status?id=${encodeURIComponent(id)}&phone=${encodeURIComponent(ph)}`, { cache: 'no-store' }), d = await r.json().catch(() => ({}));
        if (!r.ok || !d.ok) throw new Error(d.error || 'fail');
        const fmt = ts => { const x = new Date(ts); return isNaN(x) ? '' : x.toLocaleString(LANG === 'ru' ? 'ru-RU' : 'uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }); };
        out.innerHTML = `<div class="stat-card"><p class="eyebrow">${esc(d.id)}</p><h3>${esc(d.label)}</h3><p>${t('Jami')}: <b>${money(d.total)}</b></p><ol class="steps">${(d.history || []).map(h => `<li><b>${esc(h.label)}</b><span>${fmt(h.ts)}</span></li>`).join('')}</ol></div>`;
      } catch (x) { err.innerHTML = ICON.x + `<span>${t(x && x.message && x.message !== 'fail' && !/fetch|network|load failed/i.test(x.message) ? x.message : 'Zakaz topilmadi. Raqam va telefonni tekshiring.')}</span>`; }
      finally { btn.disabled = false; }
    });
  }

  /* ---------- 11. Zakaz: POST /api/order -> server.js -> Telegram ---------- */
  const fl = (id, name, label, ph, extra = '') => `<div class="fl"><input class="field" id="${id}" name="${name}" placeholder=" " ${extra}><label for="${id}">${label}</label><div class="err" id="e-o-${name}"></div></div>`;
  function openOrder() {
    if (!cartCount()) return;
    lastFocus = document.activeElement; modalId = null; boxClass('order');
    $('#modalBox').innerHTML = `<button class="modal__x" data-act="close" aria-label="Yopish">${ICON.x}</button>
      <form class="order-form" id="orderForm" novalidate><h2>Zakaz berish</h2>
      <ul class="ord-items">${Object.keys(cart).map(id => { const p = find(id); return `<li><span>${esc(p.name)} × ${cart[id]}</span><b>${money(p.price * cart[id])}</b></li>`; }).join('')}<li><span>Yetkazib berish</span><b>${totals().fee ? money(totals().fee) : 'Bepul'}</b></li></ul>
      <p class="ord-total">Jami: <b>${money(totals().total)}</b></p>
      ${fl('o-name', 'name', 'Ism', '', 'autocomplete="name" maxlength="100"')}${fl('o-phone', 'phone', 'Telefon raqam', '', 'type="tel" autocomplete="tel" maxlength="30"')}
      ${fl('o-address', 'address', 'Manzil', '', 'autocomplete="street-address" maxlength="300"')}
      <div class="fl"><textarea class="field" id="o-note" name="note" placeholder=" " rows="3" maxlength="500">${esc(store.get('cfgNote', ''))}</textarea><label for="o-note">Qo‘shimcha izoh</label></div>
      <div class="notice" id="o-err" role="alert"></div><button class="btn btn--p" type="submit" id="orderBtn">Zakazni tasdiqlash</button></form>`;
    openBox(); $('#o-name').focus();
    const f = $('#orderForm');
    const valid = bindValidation(f, { name: v => v.trim().length >= 2 || 'Ismingizni kiriting.', phone: phoneOk, address: v => v.trim().length >= 5 || 'Manzilni kiriting.' }, 'e-o-');
    f.addEventListener('submit', e => { e.preventDefault(); if (valid()) sendOrder(f); });
  }
  async function sendOrder(f) {
    const btn = $('#orderBtn'), tot = totals(), el = f.elements;
    const items = Object.keys(cart).map(id => ({ id: +id, qty: cart[id] }));   // narx serverda katalogdan olinadi
    btn.disabled = true; btn.textContent = 'Yuborilmoqda…'; $('#o-err').innerHTML = '';
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 15000);
    try {
      const r = await fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal,
        body: JSON.stringify({ name: el.name.value, phone: el.phone.value, address: el.address.value, note: el.note.value, items, delivery: tot.fee }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) throw new Error(d.error || (r.status === 404 || r.status === 405 ? 'noserver' : 'order failed'));
      store.set('lastOrder', { id: d.id, phone: el.phone.value }); // zakaz holatini tekshirish formasi shu ma’lumot bilan to‘ldiriladi
      cart = {}; store.set('cfgNote', ''); commit();   // faqat muvaffaqiyatdan keyin savat tozalanadi
      $('#modalBox').innerHTML = `<button class="modal__x" data-act="close" aria-label="Yopish">${ICON.x}</button><div class="state">
        <svg class="bigcheck" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l8 8 14-16"/></svg>
        <h2>Zakaz qabul qilindi</h2>${d.id ? `<p>Zakaz raqami: <b>${esc(d.id)}</b></p>` : ''}<p>Tez orada siz bilan bog‘lanamiz.</p><a class="btn btn--p" href="doors.html">Katalogga qaytish</a><a class="btn btn--o" href="contact.html#statusSec">Zakaz holatini tekshirish</a></div>`;
    } catch (err) {
      const m = err && err.message, net = !m || m === 'noserver' || m === 'order failed' || /fetch|abort|network|load failed/i.test(m);
      if (net) console.warn('Zakaz serveri javob bermadi (/api/order). Sayt node server.js orqali ochilganini tekshiring.');
      // zakaz ma'lumoti yo‘qolmaydi: mijoz uni nusxalab yuborishi yoki bog‘lanishi mumkin
      const c = CONTENT.contacts || {}, lines = Object.keys(cart).map(id => `${find(id).name} × ${cart[id]}`).join(', ');
      const txt = `YasinDoors zakazi\nIsm: ${el.name.value}\nTelefon: ${el.phone.value}\nManzil: ${el.address.value}\nMahsulotlar: ${lines}\nJami: ${money(tot.total)}${el.note.value ? '\nIzoh: ' + el.note.value : ''}`;
      const links = [c.phone ? `<a class="btn btn--o btn--sm" href="${esc(telHref(c.phone))}">${ICON.phone}${esc(c.phone)}</a>` : '', c.telegram ? `<a class="btn btn--o btn--sm" href="${esc(c.telegram)}" target="_blank" rel="noopener">${ICON.tg}Telegram</a>` : ''].join('');
      $('#o-err').innerHTML = ICON.x + `<span>${net ? t('Hozir zakazni yuborib bo‘lmadi. Internetni tekshirib, birozdan so‘ng qayta urinib ko‘ring.') : esc(m)}</span>` +
        (net ? `<span class="o-fb"><button type="button" class="btn btn--o btn--sm" id="copyOrder">Zakaz ma’lumotini nusxalash</button>${links}</span>` : '');
      const cb = $('#copyOrder'); if (cb) cb.addEventListener('click', async () => { try { await navigator.clipboard.writeText(txt); toast('Nusxalandi'); } catch { const ta = $('#o-note'); ta.value = txt; ta.select(); toast('Matnni belgilab nusxalang'); } });
      btn.disabled = false; btn.textContent = 'Qayta urinish';
    } finally { clearTimeout(timer); }
  }

  /* telefon raqam: maydondan chiqilganda +998 XX XXX XX XX ko‘rinishiga keltiriladi */
  document.addEventListener('focusout', e => {
    const i = e.target; if (!(i instanceof HTMLInputElement) || i.type !== 'tel') return;
    let d = i.value.replace(/\D/g, ''); if (d.length === 9) d = '998' + d; if (!/^998\d{9}$/.test(d)) return;
    i.value = `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`; i.dispatchEvent(new Event('input', { bubbles: true }));
  });

  /* ---------- 12. Hodisalar (event delegation) ---------- */
  document.addEventListener('click', e => {
    if (e.target === $('#modal')) return closeModal();
    const b = e.target.closest('[data-act]'); if (!b) return;
    const id = +b.dataset.id, a = b.dataset.act;
    if (a === 'cart' || a === 'cartq' || a === 'cfadd') { const el = b.closest('.card, .modal__box, .pdp, .cfg'); const im = el && $('.card__img img, .modal__img img, .gal__main img, .cfg__vis img', el); flyFrom = im ? { src: im.currentSrc || im.src, rect: im.getBoundingClientRect() } : null; } // rasm joyi savat yangilanishidan oldin olinadi
    if (a === 'search' && page === 'doors') { e.preventDefault(); $('#search').focus(); return; }
    ({
      fav: () => toggleFav(id), cart: () => addCart(id), cartq: () => { addCart(id, modalQty); closeModal(); }, details: () => openModal(id), close: closeModal,
      plus: () => setQty(id, 1), minus: () => setQty(id, -1), remove: () => removeCart(id), theme: toggleTheme, checkout: openOrder,
      htab: () => { homeTab = b.dataset.k; renderHome(); translateDom($('#homeTabs')); translateDom($('#featured')); },
      cmp: () => toggleCmp(id), cmpopen: openCompare, cmpclear: () => { cmp = []; commit(); closeModal(); },
      cmprm: () => { cmp = cmp.filter(x => x !== id); commit(); cmp.length > 1 ? openCompare() : closeModal(); },
      freset: () => $('#fReset').click(), lang: () => { try { localStorage.setItem('lang', LANG === 'ru' ? 'uz' : 'ru'); } catch { /* ignore */ } location.reload(); },
      top: () => scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' }),
      cfs: () => { cfg.style = b.dataset.k; renderConfig(); }, cfk: () => { cfg.coat = b.dataset.k; renderConfig(); }, cfh: () => { cfg.handle = b.dataset.k; renderConfig(); }, cfc: () => { cfg.color = b.dataset.k; renderConfig(); }, cfm: () => { cfg.id = id; renderConfig(); },
      cfadd: addConfigured, lb: openLightbox, thumb: () => { pdpImg = id; renderPdp(); translateDom($('#pdpRoot')); },
      lbz: () => $('#lbIn').classList.toggle('z'),
      'mq+': () => { modalQty = Math.min(modalQty + 1, 20); syncModal(); }, 'mq-': () => { modalQty = Math.max(modalQty - 1, 1); syncModal(); }
    })[a]?.();
  });
  document.addEventListener('input', e => { if (e.target.id === 'cfW') { cfg.w = e.target.value; cfgKeep(); } if (e.target.id === 'cfH') { cfg.h = e.target.value; cfgKeep(); } });
  function addConfigured() { // tanlangan model savatga qo‘shiladi, parametrlar zakaz izohiga tushishi uchun saqlanadi
    const p = find(cfg.id); const SZ = sizeOf(p); if (!p || !(+cfg.w >= SZ.wMin && +cfg.w <= SZ.wMax && +cfg.h >= SZ.hMin && +cfg.h <= SZ.hMax)) return;
    store.set('cfgNote', `Konstruktor: ${p.name}, ${p.colorName}, ${p.styleName}, qoplama: ${p.material}, dastak: ${HANDLES[cfg.handle][0]}, ${+cfg.w}×${+cfg.h} mm`); addCart(p.id);
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeNav(); } });

  function closeNav() {
    const nav = $('#nav'), burger = $('#burger');
    if (!nav.classList.contains('open')) return;
    nav.classList.remove('open'); document.body.classList.remove('lock');
    burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Menyuni ochish');
  }
  function initNav() {
    const nav = $('#nav'), burger = $('#burger'), header = $('#site-header'), bar = $('#progress');
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open'); document.body.classList.toggle('lock', open);
      burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Menyuni yopish' : 'Menyuni ochish');
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) closeNav(); });
    document.addEventListener('click', e => { if (!e.target.closest('#nav, #burger')) closeNav(); });
    addEventListener('resize', () => innerWidth > 900 && closeNav());
    const still = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const onScroll = () => {
      header.classList.toggle('scrolled', scrollY > 24); const tt = $('#toTop'); if (tt) tt.classList.toggle('show', scrollY > 600);
      const max = document.documentElement.scrollHeight - innerHeight; bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
      const vis = $('.hero__vis'); if (vis && !still && scrollY < 900) vis.style.setProperty('--py', scrollY * .05 + 'px');
      const hero = $('.hero'); if (hero && !still && scrollY < innerHeight * 1.2) hero.style.setProperty('--hp', Math.min(scrollY / innerHeight, 1).toFixed(3));
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  function initDoors() {
    const chips = $('#chips'), qp = new URLSearchParams(location.search);
    chips.innerHTML = FILTERS.map(([k, n]) => `<button class="chip" data-f="${k}" aria-pressed="${k === 'all'}">${n}</button>`).join('');
    const colors = [...new Map(PRODUCTS.map(p => [p.color, p.colorName])).entries()], styles = [...new Map(PRODUCTS.map(p => [p.style, p.styleName])).entries()];
    $('#fColor').innerHTML = `<option value="">Barcha ranglar</option>` + colors.map(([k, n]) => `<option value="${esc(k)}">${esc(n)}</option>`).join('');
    $('#fStyle').innerHTML = `<option value="">Barcha uslublar</option>` + styles.map(([k, n]) => `<option value="${esc(k)}">${esc(n)}</option>`).join('');
    const setChip = k => { view.f = k; $$('.chip', chips).forEach(x => x.setAttribute('aria-pressed', x.dataset.f === k)); };
    chips.addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) { setChip(c.dataset.f); renderDoors(); } });
    const num = v => { const d = String(v).replace(/\D/g, ''); return d ? +d : null; };
    const money2 = e => { const d = e.target.value.replace(/\D/g, '').slice(0, 10); e.target.value = d ? fmt(d) : ''; };
    const mm = e => { const d = e.target.value.replace(/\D/g, '').slice(0, 4); e.target.value = d; return d ? +d : null; };
    $('#fW').addEventListener('input', e => { view.w = mm(e); renderDoors(); });
    $('#fH').addEventListener('input', e => { view.h = mm(e); renderDoors(); });
    const prices = PRODUCTS.map(p => p.price); if (prices.length) { $('#fMin').placeholder = fmt(Math.min(...prices)); $('#fMax').placeholder = fmt(Math.max(...prices)); }
    $('#fColor').addEventListener('change', e => { view.color = e.target.value; renderDoors(); });
    $('#fStyle').addEventListener('change', e => { view.style = e.target.value; renderDoors(); });
    $('#fMin').addEventListener('input', e => { money2(e); view.min = num(e.target.value); renderDoors(); });
    $('#fMax').addEventListener('input', e => { money2(e); view.max = num(e.target.value); renderDoors(); });
    $('#fReset').addEventListener('click', () => {
      Object.assign(view, { f: 'all', q: '', sort: 'rec', min: null, max: null, color: '', style: '', w: null, h: null }); setChip('all');
      ['#fColor', '#fStyle', '#fMin', '#fMax', '#fW', '#fH', '#search'].forEach(i => { $(i).value = ''; }); $('#sort').value = 'rec'; renderDoors();
    });
    const col = qp.get('f'); if (col && colors.some(([k]) => k === col)) { view.color = col; $('#fColor').value = col; }
    /* qidiruv: mos mahsulotlarni avtomatik tavsiya qilish */
    const inp = $('#search'), box = $('#suggest'); let on = -1;
    const hide = () => { box.hidden = true; inp.setAttribute('aria-expanded', 'false'); on = -1; };
    const sug = () => {
      const q = inp.value.trim().toLowerCase(); if (q.length < 2) return hide();
      const l = PRODUCTS.filter(p => searchHit(p, q)).slice(0, 5); if (!l.length) return hide();
      box.innerHTML = l.map(p => `<li role="option"><a href="product.html?id=${p.id}"><img src="${doorImg(p)}" alt="" width="34" height="42"><span>${esc(p.name)}<small>${esc(p.styleName)} · ${esc(p.colorName)} · ${money(p.price)}</small></span></a></li>`).join('');
      box.hidden = false; inp.setAttribute('aria-expanded', 'true');
    };
    inp.addEventListener('input', e => { view.q = e.target.value; renderDoors(); sug(); });
    inp.addEventListener('keydown', e => {
      const a = $$('a', box); if (box.hidden || !a.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); on = (on + (e.key === 'ArrowDown' ? 1 : -1) + a.length) % a.length; a.forEach((x, i) => x.classList.toggle('on', i === on)); }
      else if (e.key === 'Enter' && on >= 0) { e.preventDefault(); location.href = a[on].href; } else if (e.key === 'Escape') hide();
    });
    document.addEventListener('click', e => { if (!e.target.closest('.search')) hide(); });
    $('#sort').addEventListener('change', e => { view.sort = e.target.value; renderDoors(); });
    if (qp.get('focus') === 'search') inp.focus();
    renderDoors(); translateDom($('main'));
  }
  function initReveal() {
    const items = $$('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) return items.forEach(el => el.classList.add('in'));
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .12 });
    items.forEach(el => io.observe(el));
  }

  /* ---------- 13a. Scroll sahnasi: eshik tayyorlanishi (7 bosqich), so‘z-so‘z matn, navbar kuzatuvi ---------- */
  const STAGES = [
    ['O‘lchov', 'Hammasi aniq o‘lchovdan boshlanadi.', 'Mutaxassis eshik oralig‘ini o‘lchaydi: kenglik, balandlik va devor qalinligi. Eshik joyiga aynan mos tayyorlanadi.', ['Kenglik × balandlik', 'Devor qalinligi', 'Eshik oralig‘i']],
    ['Material', 'Sifatli MDF plita tanlanadi.', 'Zich va bir tekis MDF plita: namlik va harorat o‘zgarishiga barqaror, yuzasi silliq.', ['MDF plita', 'Bir tekis zichlik', 'Silliq yuza']],
    ['Dizayn', 'Model aniq kesib chiqiladi.', 'Tanlangan modelga qarab panel va chiziqlar frezer stanokda aniq o‘yiladi.', ['Classic', 'Modern', 'Minimal']],
    ['Qoplama', 'Rang va qoplama beriladi.', 'Emal, mat PVX yoki yog‘och tekstura — interyeringizga mos rangni tanlaysiz.', ['Oq', 'Qora', 'Yog‘och', 'Jigarrang']],
    ['Furnitura', 'Dastak va petlalar o‘rnatiladi.', 'Po‘lat, mat qora yoki oltin dastak; petlalar eshik og‘irligiga mos tanlanadi.', ['Po‘lat', 'Mat qora', 'Oltin']],
    ['Sifat nazorati', 'Har bir eshik tekshiriladi.', 'O‘lcham, yuza va furnitura yetkazib berishdan oldin nazoratdan o‘tadi.', ['O‘lcham', 'Yuza', 'Furnitura']],
    ['O‘rnatish', 'Eshik joyiga o‘rnatiladi.', 'Eshik oraliqqa qo‘yilib, tekislanadi va sozlanadi — yopiladi ham, ochiladi ham silliq.', ['Tekislash', 'Sozlash', 'Yakuniy tekshiruv']]
  ];
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const SCENE = `<svg class="proc__svg" viewBox="-322 0 1245 700" role="img" aria-label="MDF eshikning tayyorlanish bosqichlari" preserveAspectRatio="xMidYMid meet"><defs>
    <linearGradient id="scW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:#e3dacb"/><stop offset="1" style="stop-color:#c9bfae"/></linearGradient>
    <linearGradient id="scWL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#fff6e0" stop-opacity=".28"/></linearGradient>
    <radialGradient id="scVg" cx=".5" cy=".42" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
    <linearGradient id="scF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#77726a"/><stop offset=".35" stop-color="#5a564f"/><stop offset="1" stop-color="#2f2d29"/></linearGradient>
    <linearGradient id="scFL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient>
    <linearGradient id="scCs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf8f1"/><stop offset=".5" stop-color="#ece5d6"/><stop offset="1" stop-color="#cfc6b3"/></linearGradient>
    <linearGradient id="scHl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2b0"/><stop offset=".55" stop-color="#d9a566"/><stop offset="1" stop-color="#8d6338"/></linearGradient>
    <linearGradient id="scHw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a2a1c"/><stop offset=".6" stop-color="#7b5a38"/><stop offset="1" stop-color="#b78b57"/></linearGradient>
    <linearGradient id="scJ" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <linearGradient id="scJt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <linearGradient id="scSh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".26"/><stop offset=".42" stop-color="#fff" stop-opacity=".04"/><stop offset=".43" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
    <linearGradient id="scEg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e6cfa4"/><stop offset="1" stop-color="#9c7a49"/></linearGradient>
    <linearGradient id="scMt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfbfb"/><stop offset=".5" stop-color="#9a9a9a"/><stop offset="1" stop-color="#dcdcdc"/></linearGradient>
    <linearGradient id="scRf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <mask id="scRm" maskUnits="userSpaceOnUse" x="300" y="520" width="400" height="190"><rect x="300" y="520" width="400" height="190" fill="url(#scRf)"/></mask>
    <filter id="scBl" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="scBs" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>
    <pattern id="scFiber" width="128" height="256" patternUnits="userSpaceOnUse"><image width="128" height="256"/></pattern>
    <pattern id="scGrain" width="160" height="256" patternUnits="userSpaceOnUse"><image width="160" height="256"/></pattern>
    <clipPath id="scOp"><rect x="380" y="120" width="240" height="400"/></clipPath></defs>
    <rect x="-2000" y="-900" width="5000" height="1420" fill="url(#scW)"/><rect x="-2000" y="-900" width="5000" height="1420" fill="url(#scWL)"/>
    <rect x="-2000" y="520" width="5000" height="1400" fill="url(#scF)"/><rect x="-2000" y="520" width="5000" height="1400" fill="url(#scFL)"/>
    <rect x="-2000" y="505" width="5000" height="16" fill="#f1ebdd"/><rect x="-2000" y="505" width="5000" height="3" fill="#fff" opacity=".7"/><rect x="-2000" y="520" width="5000" height="6" fill="#000" opacity=".28"/>
    <polygon points="650,522 960,522 1060,700 540,700" fill="#fff" opacity=".1"/>
    <rect x="352" y="96" width="296" height="440" rx="6" fill="#000" opacity=".28" filter="url(#scBl)"/>
    <g class="sc-case"><rect x="364" y="106" width="272" height="416" fill="url(#scCs)"/><rect x="364" y="106" width="272" height="416" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="1.5"/>
      <rect x="372" y="114" width="256" height="408" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="1.5"/><rect x="374" y="116" width="252" height="404" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1"/></g>
    <g clip-path="url(#scOp)"><rect x="380" y="120" width="240" height="400" fill="#2a2420"/>
      <rect class="sc-hall" x="380" y="120" width="240" height="400" fill="url(#scHl)"/><rect x="380" y="448" width="240" height="72" fill="url(#scHw)"/><rect x="380" y="444" width="240" height="5" fill="#f3e3c5" opacity=".8"/>
      <rect x="470" y="150" width="90" height="170" fill="#fff4dc" opacity=".35"/>
      <rect class="sc-dim" x="380" y="120" width="240" height="400" fill="#0a0908"/>
      <rect x="380" y="120" width="22" height="400" fill="url(#scJ)"/><rect x="380" y="120" width="240" height="22" fill="url(#scJt)"/></g>
    <g class="sc-dims"><path pathLength="1" d="M380 88H620M380 76v24M620 76v24"/><path pathLength="1" d="M338 120V520M326 120h24M326 520h24"/><text x="500" y="70" text-anchor="middle">Kenglik</text><text x="318" y="330" text-anchor="middle" transform="rotate(-90 318 330)">Balandlik</text></g>
    <ellipse class="sc-shadow" cx="500" cy="526" rx="150" ry="11" filter="url(#scBl)"/>
    <g id="scDoor" class="sc-door">
      <g class="sc-slab"><polygon points="615,125 631,119 631,511 615,517" fill="#8e6b3c"/><polygon points="385,125 615,125 631,119 401,119" fill="#e1c595"/>
        <rect x="385" y="125" width="230" height="392" fill="#c8a574"/><rect x="385" y="125" width="230" height="392" fill="url(#scFiber)"/><rect x="385" y="125" width="230" height="392" fill="url(#scSh)" opacity=".7"/>
        <rect x="385.75" y="125.75" width="228.5" height="390.5" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/></g>
      <g class="sc-paint"><polygon class="sc-th" points="615,125 631,119 631,511 615,517" fill="var(--door)"/><polygon class="sc-th" points="615,125 631,119 631,511 615,517" fill="#000" opacity=".38"/><polygon class="sc-th" points="385,125 615,125 631,119 401,119" fill="var(--door)"/><polygon class="sc-th" points="385,125 615,125 631,119 401,119" fill="#fff" opacity=".28"/><rect x="385" y="125" width="230" height="392" fill="var(--door)"/><rect x="385" y="125" width="230" height="392" fill="url(#scGrain)" opacity=".22"/><rect x="385" y="125" width="230" height="392" fill="url(#scFiber)" opacity=".14"/></g>
      <g class="sc-grooves"><path class="sc-gd" pathLength="1" d="M409 149H591V298H409ZM409 322H591V493H409Z"/><path class="sc-gl" d="M410.6 150.6H592.6V299.6H410.6ZM410.6 323.6H592.6V494.6H410.6Z"/><path class="sc-gm" pathLength="1" d="M500 149V298M500 322V493"/></g>
      <g class="sc-gloss"><rect x="385" y="125" width="230" height="392" fill="url(#scSh)"/><rect x="385" y="125" width="5" height="392" fill="#000" opacity=".16"/></g>
      <g class="sc-hw"><g class="sc-hinge"><rect x="382" y="162" width="9" height="36" rx="2" fill="url(#scMt)"/><rect x="382" y="322" width="9" height="36" rx="2" fill="url(#scMt)"/><rect x="382" y="448" width="9" height="36" rx="2" fill="url(#scMt)"/></g>
        <ellipse cx="584" cy="335" rx="13" ry="13" fill="#000" opacity=".3" filter="url(#scBs)"/><rect x="545" y="332" width="42" height="11" rx="5.5" fill="#000" opacity=".28" filter="url(#scBs)"/>
        <circle cx="584" cy="326" r="14" fill="url(#scMt)" stroke="#6e6e6e" stroke-width="1"/><circle cx="584" cy="326" r="7" fill="#8a8a8a" opacity=".5"/><rect x="540" y="320" width="46" height="11" rx="5.5" fill="url(#scMt)" stroke="#6e6e6e" stroke-width="1"/><rect x="544" y="322" width="38" height="2.5" rx="1.2" fill="#fff" opacity=".75"/></g>
      <g class="sc-scan"><rect x="385" y="125" width="3" height="392"/></g>
      <rect class="sc-shade" x="385" y="125" width="230" height="392" fill="#000"/>
      <polygon class="sc-edge" points="615,125 626,121 626,513 615,517" fill="url(#scEg)"/></g>
    <g class="sc-refl" mask="url(#scRm)"><use href="#scDoor" transform="translate(0,1043) scale(1,-1)"/></g>
    <g class="sc-ok"><circle cx="640" cy="150" r="26"/><path d="M628 150l9 9 16-18"/></g>
    <rect x="-2000" y="-900" width="5000" height="1800" fill="url(#scVg)" pointer-events="none"/>
    <g class="sc-sw"></g></svg>`;
  const grainTex = kind => { // canvas bilan bir martalik tekstura: yog‘och tolalari va MDF tolasi (tarmoqdan rasm yuklanmaydi)
    try {
      const w = kind === 'wood' ? 160 : 128, h = 256, c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data; let sd = kind === 'wood' ? 11 : 29; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4; let a, dark = 1;
        if (kind === 'wood') { const s = Math.sin(x * 2 * Math.PI * 23 / w + Math.sin(y * 2 * Math.PI * 2 / h) * 2.4 + Math.sin(x * 2 * Math.PI * 5 / w) * 3), st = s * .5 + .5; a = st * st * .3 + rnd() * .08; }
        else { a = rnd() * rnd() * .5; dark = rnd() < .62 ? 1 : 0; }
        d[i] = d[i + 1] = d[i + 2] = dark ? 0 : 255; d[i + 3] = Math.round(a * 255);
      }
      g.putImageData(im, 0, 0); return c.toDataURL('image/png');
    } catch { return ''; }
  };
  function initProcess() {
    const sec = $('#process'); if (!sec) return;
    const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const lum = h => { const n = parseInt(String(h).replace('#', ''), 16) || 0; return ((n >> 16) & 255) * .3 + ((n >> 8) & 255) * .59 + (n & 255) * .11; };
    const cols = [...new Map(PRODUCTS.map(p => [p.color, p.hex])).values()].sort((x, y) => lum(y) - lum(x)); if (!cols.length) cols.push('#e8e4da', '#6b4a33', '#232323'); // och → to‘q: oxirgi rang to‘q bo‘ladi
    $('#procScene').innerHTML = SCENE; translateDom($('#procScene')); const svg = $('.proc__svg', sec), sw = $('.sc-sw', svg);
    [['scFiber', 'fiber'], ['scGrain', 'wood']].forEach(([id, k]) => { const u = grainTex(k), im = svg.querySelector(`#${id} image`); if (im && u) im.setAttribute('href', u); });
    const setVB = () => svg.setAttribute('viewBox', innerWidth <= 900 ? '262 24 476 600' : '-322 0 1245 700'); // eshik kompyuterda o‘ngda, telefonda markazda
    setVB(); addEventListener('resize', setVB);
    sw.innerHTML = cols.slice(0, 5).map((c, i) => `<circle cx="${500 + (i - (Math.min(cols.length, 5) - 1) / 2) * 44}" cy="600" r="14" fill="${esc(c)}"/>`).join('');
    $('#procList').innerHTML = STAGES.map(([lb, h, p, ch], i) => `<li><span>${String(i + 1).padStart(2, '0')} / 07 · ${t(lb)}</span><h3>${t(h)}</h3><p>${t(p)}</p></li>`).join('');
    const txt = $('#procTxt'); let cur = -1, color = -1;
    const setText = i => {
      const [lb, h, p, ch] = STAGES[i];
      txt.innerHTML = `<p class="proc__no">${String(i + 1).padStart(2, '0')} / 07</p><p class="proc__lb">${t(lb)} — ${String(i + 1).padStart(2, '0')} / 07</p><h2>${t(h)}</h2><p class="proc__p">${t(p)}</p><ul class="proc__chips">${ch.map(c => `<li>${t(c)}</li>`).join('')}</ul>`;
      txt.classList.remove('in'); void txt.offsetWidth; txt.classList.add('in');
      $('#procCount').textContent = `${ROMAN[i]} / VII`; sec.dataset.stage = i + 1;
      $$('.proc__dots i', sec).forEach((d, k) => d.classList.toggle('on', k <= i));
    };
    $('#procDots').innerHTML = STAGES.map(() => '<i></i>').join('');
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const tick = () => {
      const r = sec.getBoundingClientRect(), total = sec.offsetHeight - innerHeight;
      const p = calm ? 1 : clamp(-r.top / Math.max(total, 1)), x = p * 7, i = Math.min(6, Math.floor(x));
      for (let k = 1; k <= 7; k++) svg.style.setProperty('--a' + k, calm ? 1 : clamp(x - (k - 1)).toFixed(3));
      const ci = Math.min(cols.length - 1, Math.floor(clamp(x - 3) * 0.999 * cols.length)); // 4-bosqichda ranglar almashadi
      if (ci !== color) { color = ci; svg.style.setProperty('--door', cols[ci]); $$('.sc-sw circle', svg).forEach((c, k) => c.classList.toggle('on', k === ci)); }
      if (i !== cur) { cur = i; setText(i); }
    };
    addEventListener('scroll', tick, { passive: true }); addEventListener('resize', tick); tick();
  }
  function initStatement() { // so‘zlar scroll bilan birin-ketin yorishadi
    const sec = $('#statement'), box = $('#stmText'); if (!sec || !box) return;
    const words = t(box.textContent.trim()).split(/\s+/); box.innerHTML = words.map(w => `<span class="w">${esc(w)}</span>`).join(' ');
    const ws = $$('.w', box), calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const tick = () => {
      const r = sec.getBoundingClientRect(), p = calm ? 1 : Math.min(1, Math.max(0, -r.top / Math.max(sec.offsetHeight - innerHeight, 1) * 1.15 + .05));
      const n = Math.round(p * ws.length); ws.forEach((w, i) => w.classList.toggle('on', i < n));
    };
    addEventListener('scroll', tick, { passive: true }); tick();
  }
  function initSpy() { // bosh sahifada navbar bo‘limga qarab yoritiladi
    if (page !== 'home') return;
    const items = $$('#nav a[data-k]'), map = { top: 'home', process: 'process', collection: 'doors', config: 'config' };
    const set = k => items.forEach(a => { const on = a.dataset.k === k; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    const tick = () => {
      let k = 'home'; const line = innerHeight * .4;
      Object.keys(map).forEach(id => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top <= line && !el.hidden) k = map[id]; });
      const st = document.getElementById('statement'); if (st && st.getBoundingClientRect().top <= line && k === 'process') k = 'home';
      set(k);
    };
    addEventListener('scroll', tick, { passive: true }); tick();
  }

  /* ---------- 13. Ishga tushirish ---------- */
  renderLayout();
  applyTheme(root.dataset.theme || 'light');
  initNav(); updateCounts(); renderPage(); translateDom(document.body); renderCmpBar();
  $$('[data-door]').forEach(el => { const p = find(el.dataset.door) || PRODUCTS[0]; if (p) el.src = doorImg(p); });
  const safe = f => { try { f(); } catch (e) { console.error(e); } };
  if (page === 'doors') safe(initDoors);
  if (page === 'home') { safe(initProcess); safe(initStatement); safe(initSpy); }
  if (page === 'contact') { safe(initContact); safe(initStatus); }

  /* ---------- 14. Yengil effektlar: sarlavha, hero ---------- */
  // Dog‘lar, marquee, 3D burilish olib tashlandi — dizayn sokin va tez ishlashi uchun.

  /* ---------- 15. Yana effektlar: kirish animatsiyasi, hero rang tanlash, raqamlar, kursor nuri, magnit tugmalar ---------- */
  function initFx2() {
    const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
    // 0) Desktop kursor halqasi: faqat sichqoncha bor qurilmada, odatiy kursorni yashirmaydi
    if (!calm && matchMedia('(hover:hover) and (pointer:fine)').matches) {
      document.body.insertAdjacentHTML('beforeend', '<div class="cring" aria-hidden="true"></div>');
      const ring = $('.cring'); let rx = 0, ry = 0, tx = 0, ty = 0, run = 0;
      const loop = () => { rx += (tx - rx) * .2; ry += (ty - ry) * .2; ring.style.transform = `translate(${rx}px,${ry}px)`; run = Math.abs(tx - rx) + Math.abs(ty - ry) > .5 ? requestAnimationFrame(loop) : 0; };
      addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; ring.classList.add('on'); ring.classList.toggle('big', !!e.target.closest('a,button,.card,.sw,.opt,.chip,[data-act]')); if (!run) run = requestAnimationFrame(loop); }, { passive: true });
      document.addEventListener('pointerleave', () => ring.classList.remove('on'));
    }
    // 1) Kirish: eshik ochilishi (sessiyada bir marta, faqat bosh sahifa)
    let seen = false; try { seen = sessionStorage.getItem('intro') === '1'; sessionStorage.setItem('intro', '1'); } catch { /* ignore */ }
    if (page === 'home' && !seen && !calm) {
      document.body.insertAdjacentHTML('beforeend', '<div class="gate" aria-hidden="true"><i></i><i></i><b>YASIN<small>DOORS</small></b></div>');
      const el = $('.gate'); setTimeout(() => el.classList.add('open'), 80); setTimeout(() => el.remove(), 2300);
    }
    // 2) Hero: eshik rangini almashtirish (haqiqiy mahsulotlardan)
    const vis = $('.hero__vis'), im = vis && $('.hero__frame img');
    if (vis && im && !$('.hero__dots')) {
      const list = [...new Map(PRODUCTS.map(p => [p.color, p])).values()].slice(0, 6);
      if (list.length > 1) {
        vis.insertAdjacentHTML('beforeend', `<div class="hero__dots" role="group" aria-label="Eshik rangi">${list.map((p, i) => `<button type="button" data-id="${p.id}" style="background:${esc(p.hex)}" aria-label="${esc(p.colorName)}" aria-pressed="${i === 0}"></button>`).join('')}</div>`);
        const first = list.find(p => im.src === doorImg(p)); if (first) $$('.hero__dots button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.id === first.id));
        $('.hero__dots').addEventListener('click', e => {
          const b = e.target.closest('button'); if (!b) return; const p = find(b.dataset.id); if (!p) return;
          im.style.opacity = 0; setTimeout(() => { im.src = doorImg(p); im.alt = `${p.name} — ${p.colorName.toLowerCase()} ${p.styleName} MDF eshik`; im.style.opacity = 1; }, 160);
          $$('.hero__dots button').forEach(x => x.setAttribute('aria-pressed', x === b));
        });
        im.style.transition = 'opacity .25s';
      }
    }
    // 3) Raqamlar (haqiqiy katalogdan)
    const mq = $('.marq');
    if (page === 'home' && mq && !$('.stats') && PRODUCTS.length) {
      const nums = [[PRODUCTS.length, 'Model'], [new Set(PRODUCTS.map(p => p.color)).size, 'Rang'], [new Set(PRODUCTS.map(p => p.style)).size, 'Uslub']];
      mq.insertAdjacentHTML('afterend', `<section class="container stats">${nums.map(([n, l]) => `<div class="stat reveal"><b data-n="${n}">0</b><span>${t(l)}</span></div>`).join('')}</section>`);
      const run = el => { const n = +el.dataset.n; if (calm) return (el.textContent = n); const t0 = performance.now(); const f = now => { const k = Math.min((now - t0) / 1100, 1); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); };
      const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { run(x.target); io.unobserve(x.target); } }), { threshold: .5 });
      $$('.stat b').forEach(b => io.observe(b));
    }
  }
  try { initFx2(); } catch (e) { console.error(e); }
  initReveal();
})();
