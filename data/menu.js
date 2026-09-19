/**
 * data/menu.js
 * ---------------------------------------------------------
 * ЯГОНА манбаи маълумоти меню.
 *
 * ИН ФАЙЛ АЗ ДУ ҶО ИСТИФОДА МЕШАВАД:
 *   1) Frontend (js/menu.js) — барои нишон додани менюи мизоҷ.
 *   2) Cloudflare Worker (worker/index.js) — барои САНҶИШИ нарху маҳсулот.
 *      Нархе, ки браузер мефиристад, ҳеҷ гоҳ бовар карда намешавад —
 *      Worker ҳамеша нархро аз ҳамин файл дубора ҳисоб мекунад.
 *
 * Барои иловаи маҳсулоти нав: як объекти нав ба массиви MENU илова кунед.
 * id бояд ЯГОНА (уникалӣ) бошад — маҳз ҳамин id дар cart истифода мешавад.
 *
 * icon — калиди тасвир аст (на файли расм), то ҳеҷ гоҳ "broken image"
 * рух надиҳад. Рӯйхати icon-ҳои мавҷуда дар js/menu.js (ICONS) аст.
 * ---------------------------------------------------------
 */

export const CATEGORIES = [
  { id: 'burgers', label: 'Бургерҳо', emoji: '🍔' },
  { id: 'pizza', label: 'Пицца', emoji: '🍕' },
  { id: 'meals', label: 'Хӯрокҳо', emoji: '🍗' },
  { id: 'fastfood', label: 'Фастфуд', emoji: '🍟' },
  { id: 'salads', label: 'Салатҳо', emoji: '🥗' },
  { id: 'drinks', label: 'Нӯшокиҳо', emoji: '🥤' },
  { id: 'desserts', label: 'Шириниҳо', emoji: '🍰' }
];

export const MENU = [
  // 🍔 Бургерҳо
  { id: 'chicken-burger', category: 'burgers', icon: 'burger', name: 'Чикен Бургер', description: 'Бургери мурғ бо панир ва сабзавоти тару тоза', price: 29 },
  { id: 'beef-burger', category: 'burgers', icon: 'burger', name: 'Beef Бургер', description: 'Гӯшти гов, панир, салат ва соуси махсус', price: 35 },
  { id: 'cheese-burger', category: 'burgers', icon: 'burger', name: 'Чиз Бургер', description: 'Ду ламинаи панир, гӯшт ва соуси хардал', price: 32 },

  // 🍕 Пицца
  { id: 'pizza-margherita', category: 'pizza', icon: 'pizza', name: 'Pizza Margherita', description: 'Панир моцарелла, соуси помидор ва райҳон', price: 40 },
  { id: 'pizza-pepperoni', category: 'pizza', icon: 'pizza', name: 'Pizza Pepperoni', description: 'Колбасаи пепперони, панир ва соуси махсус', price: 48 },
  { id: 'pizza-mix', category: 'pizza', icon: 'pizza', name: 'Pizza Mix', description: 'Панир, ҳасиб ва сабзавоти омехта', price: 45 },

  // 🍗 Хӯрокҳо
  { id: 'plov', category: 'meals', icon: 'plov', name: 'Оши палав', description: 'Палави суннатии тоҷикӣ бо гӯшти гов', price: 35 },
  { id: 'chicken-kebab', category: 'meals', icon: 'kebab', name: 'Шашлики мурғ', description: 'Шашлики мурғи гриллшуда бо нон ва пиёз', price: 40 },
  { id: 'lagman', category: 'meals', icon: 'lagman', name: 'Лағмон', description: 'Лағмони дастӣ бо гӯшт ва сабзавот', price: 30 },
  { id: 'shurbo', category: 'meals', icon: 'soup', name: 'Шӯрбо', description: 'Шӯрбои гарми хонагӣ бо гӯшт ва картошка', price: 22 },

  // 🍟 Фастфуд
  { id: 'fries', category: 'fastfood', icon: 'fries', name: 'Картошкаи Fry', description: 'Картошкаи crispy бо намаки махсус', price: 15 },
  { id: 'nuggets', category: 'fastfood', icon: 'nuggets', name: 'Наггетс', description: 'Наггетси мурғ бо соуси интихобӣ', price: 22 },
  { id: 'hotdog', category: 'fastfood', icon: 'hotdog', name: 'Hot Dog', description: 'Ҳасиб, сабзавот ва соуси махсус', price: 20 },

  // 🥗 Салатҳо
  { id: 'caesar-salad', category: 'salads', icon: 'saladCaesar', name: 'Салати Сезар', description: 'Мурғ, крутон, панири пармезан ва соуси Сезар', price: 25 },
  { id: 'fresh-salad', category: 'salads', icon: 'saladVeg', name: 'Салати сабзавот', description: 'Помидор, бодиринг, пиёз ва равғани зайтун', price: 18 },

  // 🥤 Нӯшокиҳо
  { id: 'cola', category: 'drinks', icon: 'cola', name: 'Кола', description: 'Нӯшокии хунуки газнок', price: 10 },
  { id: 'juice', category: 'drinks', icon: 'juice', name: 'Афшураи тару тоза', description: 'Афшураи мева, бе шакари иловагӣ', price: 18 },
  { id: 'black-tea', category: 'drinks', icon: 'tea', name: 'Чойи сиёҳ', description: 'Чойники чойи сиёҳи анъанавӣ', price: 8 },
  { id: 'coffee', category: 'drinks', icon: 'coffee', name: 'Қаҳва', description: 'Қаҳваи тару тоза дамкардашуда', price: 15 },

  // 🍰 Шириниҳо
  { id: 'cake', category: 'desserts', icon: 'cake', name: 'Торт', description: 'Порчаи торти шоколадии хонагӣ', price: 20 },
  { id: 'icecream', category: 'desserts', icon: 'icecream', name: 'Яхмос', description: 'Яхмоси ванилӣ бо шарбати меваги', price: 15 }
];
