# QR MENU

Системаи фармоиши онлайн барои тарабхона/чойхонаи хурд (10 миз). Мизоҷ QR-коди мизи худро скан мекунад, менюро мебинад, фармоиш медиҳад — ва фармоиш дарҳол ба Telegram-и соҳиби тарабхона мерасад.

**Frontend:** HTML + CSS + Vanilla JavaScript (ES modules), бе build step, GitHub Pages / Cloudflare Pages-ready.
**Backend:** як Cloudflare Worker — ягона ҷое, ки токени Telegram нигоҳ дошта мешавад.
**Database:** лозим нест барои MVP. Фармоишҳо мустақиман ба Telegram мераванд.

---

## 1. Системаи чӣ гуна кор мекунад

```
Мизоҷ → скан QR (?table=N) → менюро мебинад → сабад → фармоиш
                                                          │
                                                          ▼
                                        Frontend (fetch) → POST /api/order
                                                          │
                                                          ▼
                                   Cloudflare Worker (санҷиш + нарх аз менюи худи Worker)
                                                          │
                                                          ▼
                                          Telegram Bot API → чати ошпазхона
                                                          │
                                          Тугмаҳо: ✅ Қабул / 🍳 Омода / ❌ Бекор
```

- Токени бот **ҳеҷ гоҳ** дар браузер нест — танҳо дар Worker (`env.TELEGRAM_BOT_TOKEN`).
- Нархро браузер намефиристад... дурусттараш мефиристад, вале Worker **ба он бовар намекунад** — Worker худаш аз `data/menu.js` нархро дубора ҳисоб мекунад.
- Сабад дар `localStorage` нигоҳ дошта мешавад — баъд аз refresh нест намешавад.

---

## 2. Сохтори лоиҳа

```
qr-menu/
├── index.html          — саҳифаи асосии фармоиш
├── qr.html              — идоракунии QR-кодҳо (барои соҳиб)
├── success.html          — саҳифаи тасдиқи фармоиш
├── manifest.json / service-worker.js  — PWA
├── css/style.css
├── js/
│   ├── config.js        — танзимоти ошкоро (ном, адрес, телефон...)
│   ├── cart.js           — идораи сабад (localStorage)
│   ├── menu.js            — рендери меню ва иконкаҳо
│   ├── app.js              — саҳифаи асосӣ (index.html)
│   └── qr.js                — саҳифаи QR (qr.html)
├── data/menu.js               — МАНБАИ ЯГОНАИ меню (frontend ҳам, Worker ҳам аз ин мехонанд)
├── worker/index.js              — Cloudflare Worker
├── wrangler.toml                 — танзимоти deploy-и Worker
├── assets/                        — favicon, иконкаҳои PWA
└── .gitignore
```

---

## 3. Тағйир додани меню

Файли `data/menu.js`-ро кушоед. Ҳар маҳсулот чунин аст:

```js
{ id: 'chicken-burger', category: 'burgers', icon: 'burger', name: 'Чикен Бургер',
  description: 'Бургери мурғ бо панир', price: 29 }
```

- `id` бояд **ягона** бошад (аз он дар сабад ва дар Worker истифода мешавад).
- `category` бояд бо яке аз `CATEGORIES` дар ҳамон файл мувофиқ бошад.
- `icon` — калиди тасвир (на файли расм). Рӯйхати иконкаҳои мавҷуда дар `js/menu.js` (объекти `ICONS`) аст. Барои маҳсулоти нав метавонед иконкаи мавҷударо истифода баред ё дар `ICONS` иконкаи нав илова кунед.
- Баъд аз тағйир додани `data/menu.js`, **ҳам frontend ва ҳам Worker-ро дубора deploy кунед** (Worker бояд аз нав deploy шавад, то нархи навро бишиносад).

---

## 4. Тағйир додани маълумоти тарабхона

Файли `js/config.js`:

```js
export const CONFIG = {
  restaurantName: 'VAQT',
  address: 'Ваҳдат, Тоҷикистон',
  workingHours: '08:00 — 23:00',
  phone: '+992 XX XXX XX XX',
  telegramUsername: '@restaurant',
  instagramUsername: '@restaurant',
  currency: 'сомонӣ',
  tableCount: 10,
  baseUrl: '',
  telegramEndpoint: 'https://YOUR-WORKER-SUBDOMAIN.workers.dev/api/order'
};
```

⚠️ **Дар ин файл ҳеҷ гоҳ TELEGRAM_BOT_TOKEN нанависед.**

---

## 5. Deploy кардани Frontend (GitHub Pages)

1. Репозиторийи нав дар GitHub созед ва тамоми папкаи `qr-menu/`-ро push кунед:
   ```bash
   git init
   git add .
   git commit -m "QR MENU"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```
2. Дар GitHub: **Settings → Pages → Source → Deploy from a branch → main / (root) → Save**.
3. Сайт дар ин ҷо дастрас мешавад: `https://USERNAME.github.io/REPO/`

(Cloudflare Pages низ кор мекунад: танҳо репозиторийро пайваст кунед, build command холӣ монад, output directory — `/`.)

---

## 6. Сохтани Telegram Bot

1. Дар Telegram ба **@BotFather** нависед.
2. Фармони `/newbot`-ро фиристед ва номи ботро таъин кунед.
3. BotFather ба шумо **TELEGRAM_BOT_TOKEN**-ро медиҳад (масалан `123456:ABC-DEF...`). Онро нигоҳ доред — лозим мешавад.
4. Ботро ба гурӯҳи кории ошпазхона (ё чат бо худатон) илова кунед, ё бевосита бо бот сӯҳбат кушоед.

---

## 7. Гирифтани Telegram Chat ID

Роҳи содда:
1. Ба бот (ё гурӯҳе, ки бот дар он аст) як пайом фиристед.
2. Дар браузер кушоед:
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
3. Дар ҷавоб `"chat":{"id": -1001234567890, ...}` ё `"id": 123456789`-ро меёбед — ҳамин **TELEGRAM_CHAT_ID** аст (барои гурӯҳ бо `-` сар мешавад).

---

## 8. Deploy кардани Cloudflare Worker

1. Wrangler-ро насб кунед (ниёз ба Node.js дорад — танҳо барои deploy, на барои frontend):
   ```bash
   npm install -g wrangler
   wrangler login
   ```
2. Аз решаи лоиҳа (ҳамон ҷое, ки `wrangler.toml` аст):
   ```bash
   wrangler deploy
   ```
3. Wrangler URL-и Worker-ро нишон медиҳад, масалан:
   ```
   https://qr-menu-worker.YOUR-SUBDOMAIN.workers.dev
   ```

---

## 9. Иловаи Environment Variables / Secrets

**ҲАРГИЗ** токенро дар код нанависед. Онро ҳамчун secret илова кунед:

```bash
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHAT_ID
wrangler secret put TELEGRAM_WEBHOOK_SECRET
```

(Ҳар фармон password-ро дар терминал мепурсад — онро паст кунед ва Enter пахш кунед.)

`TELEGRAM_WEBHOOK_SECRET` — сатри дилхоҳи тасодуфӣ (масалан аз `openssl rand -hex 16`), барои тасдиқи он, ки дархости `/webhook` воқеан аз Telegram аст. Ихтиёрист, вале сахт тавсия мешавад.

Баъд аз иловаи secrets, дубора deploy кунед: `wrangler deploy`.

---

## 10. Пайваст кардани Frontend ба Worker

Дар `js/config.js`, `telegramEndpoint`-ро ба URL-и воқеии Worker-и худ иваз кунед:

```js
telegramEndpoint: 'https://qr-menu-worker.YOUR-SUBDOMAIN.workers.dev/api/order'
```

Баъд frontend-ро дубора push/deploy кунед.

### (Ихтиёрӣ) Фаъол кардани тугмаҳои Telegram

Барои он ки тугмаҳои ✅/🍳/❌ кор кунанд, ба Telegram бигӯед, ки update-ҳоро ба Worker-и шумо фиристад:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://qr-menu-worker.YOUR-SUBDOMAIN.workers.dev/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Санҷед: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`

---

## 11. Сохтани QR-кодҳо

1. Сайтро кушоед: `https://USERNAME.github.io/REPO/qr.html`
2. "Домени сайт (Base URL)" худкор пур мешавад (аз домени ҷории браузер). Агар домени ниҳоии дигар доред, онро дар он ҷо нависед ва **«Навсозии QR-кодҳо»**-ро пахш кунед.
3. Барои ҳар миз QR-код сохта мешавад, ки ба `BASE_URL/?table=N` мебарад.

---

## 12. Чоп кардани QR-кодҳо

Дар `qr.html` тугмаи **«🖨 Чоп кардани ҳамаи QR-кодҳо»**-ро пахш кунед — браузер диалоги чопро мекушояд. Тарҳи чоп махсус барои коғаз танзим шудааст (3 карт дар як сатр, бе элементҳои ортиқа).

Барои як миз алоҳида: тугмаи **«⬇️ Download PNG»**-и зери он картро пахш кунед.

---

## 13. Иловаи мизҳои бештар

Дар `js/config.js`, `tableCount`-ро зиёд кунед:

```js
tableCount: 15
```

`qr.html` худкор QR-и мизҳои навро месозад. Ҳеҷ тағйироти дигар лозим нест — санҷиши рақами миз дар frontend ва Worker ҳарду аз ҳамин `CONFIG.tableCount` истифода мебаранд.

---

## 14. Санҷидани фармоиш (тестӣ)

1. Кушоед: `.../index.html?table=1` — бояд «Мизи №1» нишон диҳад.
2. Якчанд маҳсулот илова кунед → сабадро кушоед → миқдорро тағйир диҳед → summa-ро санҷед.
3. «Фармоиш додан»-ро пахш кунед, формаро пур кунед, фиристед.
4. Дар Telegram бояд пайом ояд.
5. Тугмаи ✅ ҚАБУЛ КАРДАН-ро пахш кунед — матни пайом бояд «🟢 ФАРМОИШ ҚАБУЛ ШУД» нишон диҳад.
6. Санҷед: `?table=2`, `?table=10`, `?table=999` (бояд гейти QR нишон диҳад), бе `?table=` (ҳамон тавр), сабади холӣ (тугмаи фармоиш ғайрифаъол), офлайн (Wi-Fi-ро хомӯш кунед — бояд паём диҳад).

---

## 15. Огоҳиҳои амниятӣ

- **ҲАРГИЗ** `TELEGRAM_BOT_TOKEN`-ро дар frontend, GitHub, ё HTML нагузоред — фақат `wrangler secret put`.
- Worker ҳеҷ гоҳ ба нархи фиристодаи браузер бовар намекунад — ҳамеша аз `data/menu.js` дубора ҳисоб мекунад.
- Worker `table`, `id`-и маҳсулот ва миқдорро санҷиш мекунад; маҳсулоти номаълум ё миқдори нодуруст рад карда мешавад.
- Маҳдудияти "rate limit" дар Worker сатҳи ибтидоӣ аст (in-memory, best-effort). Барои production, Cloudflare Rate Limiting Rules ё Turnstile-ро дар пеши `/api/order` илова кунед.
- Пайоми Telegram бе `parse_mode` фиристода мешавад — ин матни воридкардаи мизоҷро аз шикастани форматгузорӣ ҳифз мекунад.
- Агар `TELEGRAM_WEBHOOK_SECRET` насб карда бошед, Worker ҳар дархости `/webhook`-ро тафтиш мекунад, то фақат Telegram воқеӣ битавонад ҳолати фармоишро тағйир диҳад.

---

## 16. Оянда: database

Барои версияи оянда (таърихи фармоишҳо, статистика, панели admin), ба ҷои Telegram-and-forget метавонед Worker-ро бо **Cloudflare D1**, **KV**, **Supabase** ё **Firebase** пайваст кунед — сохтори ҷории `data/menu.js` ва `validateOrder()` тағйир додан лозим намеояд, танҳо як қадами навишти сабт баъд аз тасдиқи Telegram илова мешавад.
