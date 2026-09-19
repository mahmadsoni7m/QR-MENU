/**
 * config.js
 * ---------------------------------------------------------
 * Ҳамаи танзимоти ошкоро (public) дар ин ҷо ҷойгиранд.
 * ЯГОН SECRET (масалан TELEGRAM_BOT_TOKEN ё TELEGRAM_CHAT_ID) дар ин файл
 * набояд бошад — онҳо танҳо дар Cloudflare Worker ҳамчун environment
 * variable / secret нигоҳ дошта мешаванд (нигаред ба README.md).
 * ---------------------------------------------------------
 */
export const CONFIG = {
  // Номи тарабхона / чойхона
  restaurantName: 'VAQT',

  // Маълумоти тамос — дар бахши "Дар бораи мо" нишон дода мешавад
  address: 'Ваҳдат, Тоҷикистон',
  workingHours: '08:00 — 23:00',
  phone: '+992 XX XXX XX XX',
  telegramUsername: '@restaurant',
  instagramUsername: '@restaurant',

  // Асъор (дар назди ҳар нарх нишон дода мешавад)
  currency: 'сомонӣ',

  // Шумораи мизҳо — барои саҳифаи QR ва санҷиши мизи фаъол истифода мешавад
  tableCount: 10,

  // Домени ниҳоии сайти шумо (барои сохтани линки QR).
  // Агар холӣ монад (''), qr.html худи origin-и ҷории браузерро мегирад —
  // яъне барои санҷиш дар GitHub Pages чизе тағйир додан лозим нест.
  baseUrl: '',

  // Линки Cloudflare Worker-и шумо (баъд аз deploy кардани worker пур кунед).
  // Мисол: https://qr-menu-worker.YOUR-SUBDOMAIN.workers.dev/api/order
  telegramEndpoint: 'https://YOUR-WORKER-SUBDOMAIN.workers.dev/api/order'
};
