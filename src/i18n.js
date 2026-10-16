import { load, save } from "./core.js";
// Source-language keys keep UI copy readable. User labels/addresses are never translated.
const strings = {
  Language: ["Язык", "Til"],
  "Make every stop count.": [
    "Пусть каждая остановка будет полезной.",
    "Har bir bekat foydali bo‘lsin.",
  ],
  Profile: ["Профиль", "Profil"],
  "Where to?": ["Куда едем?", "Qayerga boramiz?"],
  Destination: ["Место назначения", "Manzil"],
  "Enter destination": ["Введите адрес", "Manzilni kiriting"],
  "Check route": ["Проверить маршрут", "Yo‘nalishni tekshirish"],
  "Checking…": ["Проверяем…", "Tekshirilmoqda…"],
  "Max detour per errand": [
    "Макс. объезд на задачу",
    "Har bir yumush uchun qo‘shimcha vaqt",
  ],
  "Maximum detour minutes": [
    "Максимальный объезд в минутах",
    "Eng ko‘p qo‘shimcha daqiqa",
  ],
  min: ["мин", "daq"],
  "km/h": ["км/ч", "km/soat"],
  "Transport mode": ["Вид транспорта", "Transport turi"],
  "Detect transport": ["Определять транспорт", "Transportni aniqlash"],
  "On foot": ["Пешком", "Piyoda"],
  Bike: ["Велосипед", "Velosiped"],
  Scooter: ["Скутер", "Skuter"],
  Car: ["Автомобиль", "Avtomobil"],
  Trip: ["Поездка", "Safar"],
  "Start trip": ["Начать поездку", "Safarni boshlash"],
  "End trip": ["Завершить поездку", "Safarni tugatish"],
  Errands: ["Задачи", "Yumushlar"],
  Task: ["Задача", "Vazifa"],
  Place: ["Место", "Joy"],
  "Errand place": ["Адрес задачи", "Yumush manzili"],
  Add: ["Добавить", "Qo‘shish"],
  "Past trips": ["Прошлые поездки", "Oldingi safarlar"],
  "Export trips": ["Экспорт данных", "Ma’lumotlarni eksport qilish"],
  Privacy: ["Конфиденциальность", "Maxfiylik"],
  "Restore backup": ["Восстановить копию", "Zaxiradan tiklash"],
  "Clear device data": [
    "Удалить данные устройства",
    "Qurilma ma’lumotlarini o‘chirish",
  ],
  Rename: ["Переименовать", "Nomini o‘zgartirish"],
  Delete: ["Удалить", "O‘chirish"],
  Recenter: ["Моё местоположение", "Joylashuvim"],
  "Expand or collapse panel": [
    "Развернуть или свернуть панель",
    "Panelni ochish yoki yig‘ish",
  ],
  "Your finished trips show up here.": [
    "Завершённые поездки появятся здесь.",
    "Tugallangan safarlar shu yerda ko‘rinadi.",
  ],
  "Add up to 10 errands to check driving detours.": [
    "Добавьте до 10 задач для расчёта объезда.",
    "Aylanma yo‘lni tekshirish uchun 10 tagacha yumush qo‘shing.",
  ],
  "{count} saved trips · {distance} km total · {time} recorded": [
    "Поездок: {count} · всего {distance} км · время {time}",
    "{count} ta safar · jami {distance} km · vaqt {time}",
  ],
  "GPS accuracy ±{accuracy} m · driving routes only · keep page open": [
    "Точность GPS ±{accuracy} м · маршруты для авто · не закрывайте приложение",
    "GPS aniqligi ±{accuracy} m · faqat avtomobil yo‘nalishi · ilovani ochiq tuting",
  ],
  "Free community maps · driving routes only · keep this page open while recording.":
    [
      "Бесплатные карты · маршруты для авто · не закрывайте страницу при записи.",
      "Bepul xaritalar · faqat avtomobil yo‘nalishi · yozuv vaqtida sahifani ochiq tuting.",
    ],
  "Loading map…": ["Загрузка карты…", "Xarita yuklanmoqda…"],
  "Retry map": ["Повторить загрузку", "Xaritani qayta yuklash"],
  "Map unavailable. Check your connection or WebGL support. Saved trips still work.":
    [
      "Карта недоступна. Проверьте подключение и поддержку WebGL. Сохранённые поездки доступны.",
      "Xarita mavjud emas. Internet va WebGL qo‘llab-quvvatlanishini tekshiring. Saqlangan safarlar ishlaydi.",
    ],
  "Location blocked. Enable permission in browser settings, then press Recenter.":
    [
      "Геолокация запрещена. Разрешите её в настройках браузера и нажмите «Моё местоположение».",
      "Joylashuvga ruxsat yo‘q. Brauzer sozlamalaridan ruxsat bering, so‘ng «Joylashuvim»ni bosing.",
    ],
  "GPS unavailable. Move outdoors and try Recenter.": [
    "GPS недоступен. Выйдите на открытое место и повторите.",
    "GPS mavjud emas. Ochiq joyga chiqing va qayta urinib ko‘ring.",
  ],
  "Browsing without location. Open Privacy to enable GPS.": [
    "Просмотр без геолокации. Включите GPS в разделе конфиденциальности.",
    "Joylashuvsiz ko‘rish. GPS uchun Maxfiylik bo‘limini oching.",
  ],
  "Choose location access in Privacy first.": [
    "Сначала разрешите геолокацию в разделе конфиденциальности.",
    "Avval Maxfiylik bo‘limida joylashuvga ruxsat bering.",
  ],
  "Geolocation is not supported by this browser.": [
    "Браузер не поддерживает геолокацию.",
    "Brauzer joylashuvni qo‘llab-quvvatlamaydi.",
  ],
  "A recent GPS fix is needed. Press Recenter.": [
    "Нужны свежие координаты GPS. Нажмите «Моё местоположение».",
    "Yangi GPS koordinatalari kerak. «Joylashuvim»ni bosing.",
  ],
  "Wait for a recent GPS fix before recording.": [
    "Дождитесь свежих координат GPS перед записью.",
    "Yozishni boshlashdan oldin yangi GPS koordinatalarini kuting.",
  ],
  "Free routing supports car driving only. Choose Car. Walking and cycling can still be recorded.":
    [
      "Маршруты доступны только для авто. Выберите «Автомобиль». Пешие и велопоездки можно записывать.",
      "Yo‘nalish faqat avtomobil uchun. «Avtomobil»ni tanlang. Piyoda va velosiped safarlarini yozish mumkin.",
    ],
  "Enter a destination.": [
    "Введите адрес назначения.",
    "Borish manzilini kiriting.",
  ],
  "Enter a destination first.": [
    "Сначала введите адрес.",
    "Avval manzilni kiriting.",
  ],
  "Add a task and a place": [
    "Введите задачу и место",
    "Vazifa va joyni kiriting",
  ],
  "Enter both a task and a place.": [
    "Введите задачу и адрес.",
    "Vazifa va manzilni kiriting.",
  ],
  "Maximum 10 errands. Remove one first.": [
    "Не более 10 задач. Сначала удалите одну.",
    "Ko‘pi bilan 10 ta yumush. Avval bittasini o‘chiring.",
  ],
  "Name this trip": ["Название поездки", "Safar nomi"],
  "My trip": ["Моя поездка", "Mening safarim"],
  "Untitled trip": ["Без названия", "Nomsiz safar"],
  "Trip name": ["Название поездки", "Safar nomi"],
  "Delete this trip permanently?": [
    "Удалить эту поездку навсегда?",
    "Bu safarni butunlay o‘chirasizmi?",
  ],
  "Trip saved in this browser.": [
    "Поездка сохранена в браузере.",
    "Safar shu brauzerda saqlandi.",
  ],
  "Trip ended. History is disabled; nothing saved.": [
    "Поездка завершена. История отключена; ничего не сохранено.",
    "Safar tugadi. Tarix o‘chirilgan; hech narsa saqlanmadi.",
  ],
  "Service timed out. Try again later.": [
    "Сервис не ответил. Попробуйте позже.",
    "Xizmat javob bermadi. Keyinroq urinib ko‘ring.",
  ],
  "Request failed.": ["Запрос не выполнен.", "So‘rov bajarilmadi."],
  "Driving route ready. Detours are estimates; selected stops use list order.":
    [
      "Маршрут готов. Объезд приблизительный; остановки идут по порядку списка.",
      "Yo‘nalish tayyor. Qo‘shimcha vaqt taxminiy; bekatlar ro‘yxat tartibida.",
    ],
  "Offline: maps and routes need internet. GPS recording may continue.": [
    "Нет сети: картам и маршрутам нужен интернет. GPS может продолжать запись.",
    "Internet yo‘q: xarita va yo‘nalishlar internet talab qiladi. GPS yozuvi davom etishi mumkin.",
  ],
  "Saved destinations": ["Сохранённые адреса", "Saqlangan manzillar"],
  "Save destination": ["Сохранить адрес", "Manzilni saqlash"],
  "Save the address above for next time. No search is sent until you check a route.":
    [
      "Сохраните адрес для следующего раза. Поиск выполняется только при проверке маршрута.",
      "Yuqoridagi manzilni keyingi safar uchun saqlang. Yo‘nalish tekshirilmaguncha qidiruv yuborilmaydi.",
    ],
  Use: ["Выбрать", "Tanlash"],
  "Delete destination": ["Удалить адрес", "Manzilni o‘chirish"],
  "No saved destinations yet.": [
    "Сохранённых адресов пока нет.",
    "Hali saqlangan manzillar yo‘q.",
  ],
  "Name this destination": ["Название адреса", "Manzil nomi"],
  "Enter a name.": ["Введите название.", "Nomini kiriting."],
  "Maximum 20 saved destinations.": [
    "Не более 20 адресов.",
    "Ko‘pi bilan 20 ta manzil.",
  ],
  "Delete this saved destination?": [
    "Удалить сохранённый адрес?",
    "Saqlangan manzilni o‘chirasizmi?",
  ],
  "Destination selected. Press Check route when ready.": [
    "Адрес выбран. Нажмите «Проверить маршрут».",
    "Manzil tanlandi. Tayyor bo‘lsangiz, «Yo‘nalishni tekshirish»ni bosing.",
  ],
  "Errand templates": ["Шаблоны задач", "Yumush shablonlari"],
  "Save errands as template": [
    "Сохранить задачи как шаблон",
    "Yumushlarni shablon sifatida saqlash",
  ],
  "Save your current errands as a reusable list. Applying a template adds tasks, not a route.":
    [
      "Сохраните задачи для повторного использования. Шаблон добавляет задачи, но не строит маршрут.",
      "Joriy yumushlarni qayta ishlatiladigan ro‘yxat sifatida saqlang. Shablon vazifa qo‘shadi, yo‘nalish emas.",
    ],
  Apply: ["Применить", "Qo‘llash"],
  "Delete template": ["Удалить шаблон", "Shablonni o‘chirish"],
  "No templates yet.": ["Шаблонов пока нет.", "Hali shablonlar yo‘q."],
  "Name this template": ["Название шаблона", "Shablon nomi"],
  "Weekly errands": ["Еженедельные задачи", "Haftalik yumushlar"],
  "Add errands before saving a template.": [
    "Сначала добавьте задачи.",
    "Shablonni saqlashdan oldin yumushlar qo‘shing.",
  ],
  "Maximum 20 templates.": [
    "Не более 20 шаблонов.",
    "Ko‘pi bilan 20 ta shablon.",
  ],
  "Delete this template?": [
    "Удалить этот шаблон?",
    "Bu shablonni o‘chirasizmi?",
  ],
  "This template would exceed the 10-errand limit. Remove some errands first.":
    [
      "Будет превышен лимит в 10 задач. Сначала удалите часть задач.",
      "Bu shablon 10 ta yumush chegarasidan oshadi. Avval ayrimlarini o‘chiring.",
    ],
  "Template applied. Duplicate tasks were skipped. Check the route again.": [
    "Шаблон применён. Дубликаты пропущены. Проверьте маршрут снова.",
    "Shablon qo‘llandi. Takroriy vazifalar o‘tkazib yuborildi. Yo‘nalishni qayta tekshiring.",
  ],
  tasks: ["задач", "ta vazifa"],
  "Wait for the current route check.": [
    "Дождитесь проверки маршрута.",
    "Joriy yo‘nalish tekshiruvini kuting.",
  ],
  "Saved lists could not be loaded. Restore a valid backup.": [
    "Не удалось загрузить списки. Восстановите корректную копию.",
    "Ro‘yxatlar yuklanmadi. To‘g‘ri zaxira nusxasini tiklang.",
  ],
  "Saved lists could not be stored. Export a backup before leaving.": [
    "Не удалось сохранить списки. Экспортируйте копию перед выходом.",
    "Ro‘yxatlar saqlanmadi. Chiqishdan oldin zaxirani eksport qiling.",
  ],
  "Install on Android": ["Установить на Android", "Androidga o‘rnatish"],
  "Update app": ["Обновить приложение", "Ilovani yangilash"],
  "Preview release ·": ["Предварительная версия ·", "Sinov versiyasi ·"],
  "Draft terms": ["Проект условий", "Shartlar loyihasi"],
  Terms: ["Условия", "Shartlar"],
  "Privacy policy": ["Политика конфиденциальности", "Maxfiylik siyosati"],
  Licenses: ["Лицензии", "Litsenziyalar"],
  "Legal documents are currently in English.": [
    "Юридические документы пока на английском.",
    "Huquqiy hujjatlar hozircha ingliz tilida.",
  ],
  Permissions: ["Разрешения", "Ruxsatlar"],
  Location: ["Геолокация", "Joylashuv"],
  "Needed to show you and find errands on your way.": [
    "Нужна для отображения местоположения и задач по пути.",
    "Joylashuv va yo‘ldagi yumushlarni ko‘rsatish uchun kerak.",
  ],
  Speed: ["Скорость", "Tezlik"],
  "Display speed from GPS.": [
    "Показывать скорость по GPS.",
    "GPS tezligini ko‘rsatish.",
  ],
  "Transport detection": ["Определение транспорта", "Transportni aniqlash"],
  "Walk, bike or car, guessed from your speed.": [
    "Пешком, велосипед или авто — оценка по скорости.",
    "Tezlikka ko‘ra piyoda, velosiped yoki avtomobil.",
  ],
  "Trip history": ["История поездок", "Safarlar tarixi"],
  "Start time, duration and distance.": [
    "Время начала, длительность и расстояние.",
    "Boshlanish vaqti, davomiylik va masofa.",
  ],
  "I accept the": ["Я принимаю", "Men"],
  "draft Terms of Use": [
    "проект Условий использования",
    "Foydalanish shartlari loyihasini qabul qilaman",
  ],
  "and acknowledge the": ["и ознакомлен(а) с", "va"],
  "Privacy Policy": [
    "Политикой конфиденциальности",
    "Maxfiylik siyosati bilan tanishdim",
  ],
  "Preview only. No guaranteed background GPS, emergency navigation, or unlimited community services.":
    [
      "Только предпросмотр. Фоновый GPS, экстренная навигация и безлимитные сервисы не гарантируются.",
      "Faqat sinov. Fon GPS yozuvi, favqulodda navigatsiya va cheksiz xizmatlar kafolatlanmaydi.",
    ],
  "Browse without location": [
    "Просмотр без геолокации",
    "Joylashuvsiz ko‘rish",
  ],
  "Allow and start": ["Разрешить и начать", "Ruxsat berish va boshlash"],
  "Accept the draft Terms before continuing.": [
    "Примите проект условий перед продолжением.",
    "Davom etishdan oldin shartlar loyihasini qabul qiling.",
  ],
  "End your trip before changing privacy settings.": [
    "Завершите поездку перед изменением настроек.",
    "Maxfiylik sozlamalarini o‘zgartirishdan oldin safarni tugating.",
  ],
  "Your DotHeading": ["Ваш DotHeading", "Sizning DotHeading"],
  "Close profile": ["Закрыть профиль", "Profilni yopish"],
  "Device-only profile": ["Профиль на устройстве", "Faqat qurilmadagi profil"],
  "No password or authentication. Anyone using this browser can see this data.":
    [
      "Без пароля и авторизации. Любой пользователь браузера может видеть эти данные.",
      "Parol yoki autentifikatsiya yo‘q. Bu brauzerdan foydalanuvchi ma’lumotlarni ko‘ra oladi.",
    ],
  "Display name": ["Отображаемое имя", "Ko‘rinadigan ism"],
  "Your name": ["Ваше имя", "Ismingiz"],
  "Save profile": ["Сохранить профиль", "Profilni saqlash"],
  "Device profile saved.": [
    "Профиль сохранён на устройстве.",
    "Qurilma profili saqlandi.",
  ],
  "Optional cloud account": [
    "Облачный аккаунт (необязательно)",
    "Ixtiyoriy bulut hisobi",
  ],
  "Cloud not configured. Device-only profiles and backups work now.": [
    "Облако не настроено. Локальный профиль и копии работают.",
    "Bulut sozlanmagan. Qurilmadagi profil va zaxiralar ishlaydi.",
  ],
  "Cloud available. Email codes sign you in without a password.": [
    "Облако доступно. Вход по коду из письма без пароля.",
    "Bulut mavjud. Parolsiz kirish uchun email kodidan foydalaning.",
  ],
  "Email address": ["Электронная почта", "Email manzili"],
  "draft Terms": ["проект Условий", "shartlar loyihasini qabul qilaman"],
  "Send email code": ["Отправить код на почту", "Email kodini yuborish"],
  "Email code": ["Код из письма", "Email kodi"],
  "Verify and sign in": ["Подтвердить и войти", "Tasdiqlash va kirish"],
  "Upload backup": ["Загрузить копию в облако", "Zaxirani bulutga yuklash"],
  "Download backup": ["Получить копию из облака", "Zaxirani bulutdan olish"],
  "Sign out": ["Выйти", "Chiqish"],
  "Delete cloud account": [
    "Удалить облачный аккаунт",
    "Bulut hisobini o‘chirish",
  ],
  "End your trip first.": [
    "Сначала завершите поездку.",
    "Avval safarni tugating.",
  ],
  "End your trip before restoring.": [
    "Завершите поездку перед восстановлением.",
    "Tiklashdan oldin safarni tugating.",
  ],
  "Trips and errands restored on this device.": [
    "Поездки и задачи восстановлены на устройстве.",
    "Safar va yumushlar qurilmada tiklandi.",
  ],
  "Backup is too large (maximum 200 KB).": [
    "Копия слишком большая (не более 200 КБ).",
    "Zaxira juda katta (eng ko‘pi 200 KB).",
  ],
  "Invalid trip backup (maximum 50 trips).": [
    "Некорректная копия поездок (не более 50).",
    "Safar zaxirasi noto‘g‘ri (eng ko‘pi 50 ta safar).",
  ],
  "Invalid errands in backup.": [
    "Некорректные задачи в копии.",
    "Zaxiradagi yumushlar noto‘g‘ri.",
  ],
  "Invalid saved destinations.": [
    "Некорректные сохранённые адреса.",
    "Saqlangan manzillar noto‘g‘ri.",
  ],
  "Invalid errand templates.": [
    "Некорректные шаблоны задач.",
    "Yumush shablonlari noto‘g‘ri.",
  ],
  "Replace local trips and errands? Export first to keep a copy.": [
    "Заменить локальные поездки, задачи и сохранённые списки? Сначала экспортируйте копию.",
    "Mahalliy safarlar, yumushlar va saqlangan ro‘yxatlar almashtirilsinmi? Avval zaxirani eksport qiling.",
  ],
  "Delete device trips, errands, profile and preferences? Cloud backups are separate and will remain.":
    [
      "Удалить данные, сохранённые списки, профиль и настройки устройства? Облачная копия останется.",
      "Qurilma ma’lumotlari, saqlangan ro‘yxatlar, profil va sozlamalar o‘chirilsinmi? Bulut zaxirasi qoladi.",
    ],
  "Android: open this site in Chrome, then Install app or ⋮ → Add to Home screen. No APK is needed. HTTPS is required.":
    [
      "Android: откройте сайт в Chrome и выберите «Установить» или ⋮ → «Добавить на главный экран». APK не нужен. Требуется HTTPS.",
      "Android: saytni Chrome orqali oching, so‘ng «O‘rnatish» yoki ⋮ → «Bosh ekranga qo‘shish»ni tanlang. APK kerak emas. HTTPS talab qilinadi.",
    ],
  "In Android Chrome, use ⋮ → Add to Home screen → Install.": [
    "В Chrome на Android: ⋮ → Добавить на главный экран → Установить.",
    "Android Chrome: ⋮ → Bosh ekranga qo‘shish → O‘rnatish.",
  ],
  "Installed on this device. Keep the app open while recording.": [
    "Установлено на устройстве. Не закрывайте приложение при записи.",
    "Qurilmaga o‘rnatilgan. Yozuv vaqtida ilovani ochiq tuting.",
  ],
  "DotHeading installed.": ["DotHeading установлен.", "DotHeading o‘rnatildi."],
  "End your trip before updating.": [
    "Завершите поездку перед обновлением.",
    "Yangilashdan oldin safarni tugating.",
  ],
  "App shell ready offline. Maps, search and cloud still need internet.": [
    "Оболочка доступна офлайн. Картам, поиску и облаку нужен интернет.",
    "Ilova qobig‘i oflayn tayyor. Xarita, qidiruv va bulut uchun internet kerak.",
  ],
};
// Longer disclosures stay explicit rather than being silently omitted in other languages.
strings[
  "Trip history stays in this browser unless you explicitly upload a cloud backup. Map tiles go to OpenFreeMap; searches go to Nominatim and driving routes to OSRM. Those services receive your IP and requested coordinates or search text."
] = [
  "История хранится в браузере, пока вы явно не загрузите копию в облако. Карты запрашиваются у OpenFreeMap, поиск — у Nominatim, маршруты — у OSRM. Эти сервисы получают ваш IP и запрошенные координаты или текст поиска.",
  "Tarix bulutga zaxira yuklamaguningizcha shu brauzerda qoladi. Xaritalar OpenFreeMap, qidiruv Nominatim, yo‘nalishlar OSRM orqali olinadi. Bu xizmatlar IP manzilingiz va so‘ralgan koordinata yoki qidiruv matnini oladi.",
];

Object.assign(strings, {
  "If location is blocked in the embedded preview, open the app in its own tab and allow location in browser settings.":
    [
      "Если геолокация заблокирована во встроенном предпросмотре, откройте приложение в отдельной вкладке и разрешите геолокацию в настройках браузера.",
      "Ichki ko‘rish oynasida joylashuv bloklansa, ilovani alohida varaqda oching va brauzer sozlamalarida ruxsat bering.",
    ],
  "Open full app": ["Открыть приложение отдельно", "Ilovani alohida ochish"],
  "No automatic merging. Upload replaces the cloud backup; download replaces this device’s trips and errands. Export first.":
    [
      "Автослияния нет. Загрузка заменяет облачную копию; восстановление заменяет поездки, задачи и сохранённые списки устройства. Сначала экспортируйте данные.",
      "Avtomatik birlashtirish yo‘q. Yuklash bulut zaxirasini, tiklash esa qurilma safarlari, yumushlari va saqlangan ro‘yxatlarini almashtiradi. Avval eksport qiling.",
    ],
  "Signed in: {email}. Cloud backups are manual; trips stay local until uploaded.":
    [
      "Вход: {email}. Облачные копии создаются вручную; до загрузки данные остаются на устройстве.",
      "Hisob: {email}. Bulut zaxiralari qo‘lda yuklanadi; ungacha ma’lumotlar qurilmada qoladi.",
    ],
  "Profile could not be saved. Browser storage is unavailable.": [
    "Профиль не сохранён. Хранилище браузера недоступно.",
    "Profil saqlanmadi. Brauzer xotirasi mavjud emas.",
  ],
  "Browser storage is unavailable or full. Changes are only in memory; export trips before leaving.":
    [
      "Хранилище браузера недоступно или заполнено. Изменения только в памяти; экспортируйте данные перед выходом.",
      "Brauzer xotirasi mavjud emas yoki to‘lgan. O‘zgarishlar faqat tezkor xotirada; chiqishdan oldin eksport qiling.",
    ],
  "Cloud configuration is invalid. Local mode is available.": [
    "Неверная настройка облака. Локальный режим доступен.",
    "Bulut sozlamasi noto‘g‘ri. Mahalliy rejim mavjud.",
  ],
  "Account request failed.": [
    "Ошибка запроса аккаунта.",
    "Hisob so‘rovi bajarilmadi.",
  ],
  "Enter a valid email.": [
    "Введите корректный email.",
    "To‘g‘ri email kiriting.",
  ],
  "Accept the draft Terms and Privacy Policy first.": [
    "Сначала примите проект условий и ознакомьтесь с политикой конфиденциальности.",
    "Avval shartlar loyihasini qabul qiling va maxfiylik siyosati bilan tanishing.",
  ],
  "Check your email for the code. Sending limits may apply.": [
    "Проверьте код в почте. Возможны ограничения отправки.",
    "Emaildagi kodni tekshiring. Yuborish chegaralari bo‘lishi mumkin.",
  ],
  "Signed in. Upload a backup only if you want cloud storage.": [
    "Вход выполнен. Загрузите копию только если хотите хранить данные в облаке.",
    "Hisobga kirildi. Bulutda saqlashni istasangizgina zaxira yuklang.",
  ],
  "Signed out. Device data was kept. Clear it on a shared phone.": [
    "Вы вышли. Данные устройства сохранены. Удалите их на общем телефоне.",
    "Hisobdan chiqildi. Qurilma ma’lumotlari qoldi. Umumiy telefonda ularni o‘chiring.",
  ],
  "Replace the cloud backup with this device’s trips and errands? This sends them to Supabase.":
    [
      "Заменить облачную копию поездками, задачами и сохранёнными списками устройства? Они будут отправлены в Supabase.",
      "Bulut zaxirasi qurilma safarlari, yumushlari va saqlangan ro‘yxatlari bilan almashtirilsinmi? Ular Supabase xizmatiga yuboriladi.",
    ],
  "Replace this device’s trips and errands with the cloud backup? Export first to keep a copy.":
    [
      "Заменить поездки, задачи и сохранённые списки устройства облачной копией? Сначала экспортируйте данные.",
      "Qurilma safarlari, yumushlari va saqlangan ro‘yxatlari bulut zaxirasi bilan almashtirilsinmi? Avval eksport qiling.",
    ],
  "Encrypted-in-transit cloud backup saved. Not end-to-end encrypted.": [
    "Облачная копия сохранена с шифрованием передачи, без сквозного шифрования.",
    "Bulut zaxirasi saqlandi. Uzatish shifrlangan, lekin uchdan-uchgacha shifrlash yo‘q.",
  ],
  "No cloud backup yet.": [
    "Облачной копии пока нет.",
    "Hali bulut zaxirasi yo‘q.",
  ],
  "Permanently delete your cloud account and backup? Device data is separate and will remain.":
    [
      "Удалить облачный аккаунт и копию навсегда? Отдельные данные устройства останутся.",
      "Bulut hisobi va zaxirasi butunlay o‘chirilsinmi? Qurilma ma’lumotlari alohida va qoladi.",
    ],
  "Cloud account deleted. Use Clear device data to remove local copies.": [
    "Облачный аккаунт удалён. Удалите локальные копии кнопкой очистки устройства.",
    "Bulut hisobi o‘chirildi. Mahalliy nusxalar uchun qurilma ma’lumotlarini o‘chiring.",
  ],
  "Cloud session unavailable. Local mode still works.": [
    "Облачный сеанс недоступен. Локальный режим работает.",
    "Bulut seansi mavjud emas. Mahalliy rejim ishlaydi.",
  ],
  "Unable to store restored trips.": [
    "Не удалось сохранить восстановленные поездки.",
    "Tiklangan safarlarni saqlab bo‘lmadi.",
  ],
  "Invalid JSON backup.": [
    "Некорректная JSON-копия.",
    "JSON zaxirasi noto‘g‘ri.",
  ],
  "Could not clear browser storage.": [
    "Не удалось очистить хранилище браузера.",
    "Brauzer xotirasini tozalab bo‘lmadi.",
  ],
  "Offline setup unavailable; the website still works online.": [
    "Настройка офлайн недоступна; сайт работает при подключении к сети.",
    "Oflayn sozlash mavjud emas; sayt internet bilan ishlaydi.",
  ],
  "Community service unavailable ({status}). Try again later.": [
    "Сервис недоступен ({status}). Попробуйте позже.",
    "Xizmat mavjud emas ({status}). Keyinroq urinib ko‘ring.",
  ],
  "No place found for “{query}”. Try a full address.": [
    "Место «{query}» не найдено. Укажите полный адрес.",
    "«{query}» topilmadi. To‘liq manzilni kiriting.",
  ],
  "No driving route found.": [
    "Автомаршрут не найден.",
    "Avtomobil yo‘nalishi topilmadi.",
  ],
  Include: ["Включить", "Qo‘shish"],
  "Delete trip": ["Удалить поездку", "Safarni o‘chirish"],
});
let current = load("language", "en");
if (!["en", "ru", "uz"].includes(current)) current = "en";
export const language = () => current;
export function t(source, values = {}) {
  const key = String(source).replace(/\s+/g, " ").trim();
  const value =
    current === "en"
      ? source
      : (strings[key]?.[current === "ru" ? 0 : 1] ?? source);
  return String(value).replace(
    /\{(\w+)\}/g,
    (match, key) => values[key] ?? match,
  );
}
export function setupLanguage() {
  const records = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (
      !node.textContent.trim() ||
      node.parentElement.closest(
        "script,style,#map,#map-message,#toast,#service-status,#list,#hist,#trip-stats,#cloud-status,#install-help,#language,#consent-language",
      )
    )
      continue;
    records.push({ node, source: node.textContent });
  }
  const attrs = [];
  for (const el of document.querySelectorAll("[placeholder],[aria-label]"))
    for (const attr of ["placeholder", "aria-label"])
      if (el.hasAttribute(attr))
        attrs.push({ el, attr, source: el.getAttribute(attr) });
  const select = document.querySelector("#language");
  function apply() {
    document.documentElement.lang = current;
    select.value = current;
    document.querySelector("#consent-language").value = current;
    for (const { node, source } of records) {
      if (!node.isConnected) continue;
      node.textContent = source.replace(/\S[\s\S]*\S|\S/, (match) => t(match));
    }
    for (const { el, attr, source } of attrs) el.setAttribute(attr, t(source));
    window.dispatchEvent(new Event("dotheading:language"));
  }
  const change = (event) => {
    current = event.target.value;
    save("language", current);
    apply();
  };
  select.onchange = change;
  document.querySelector("#consent-language").onchange = change;
  apply();
}
