/**
 * worker/index.js
 * ---------------------------------------------------------
 * Cloudflare Worker — ягона ҷое, ки TELEGRAM_BOT_TOKEN истифода мешавад.
 * Фронтенд ҳеҷ гоҳ токенро намебинад.
 *
 * Маршрутҳо:
 *   POST /api/order   — фармоиши нав аз мизоҷ
 *   POST /webhook      — callback-и Telegram (тугмаҳои ҚАБУЛ/ОМОДА/БЕКОР)
 *   *                  — 404
 *
 * ENVIRONMENT VARIABLES / SECRETS (насб бо `wrangler secret put`):
 *   TELEGRAM_BOT_TOKEN     — токени бот (маҷбурӣ)
 *   TELEGRAM_CHAT_ID       — chat/group id-и ошпазхона (маҷбурӣ)
 *   TELEGRAM_WEBHOOK_SECRET — сатри дилхоҳ барои тасдиқи webhook (тавсия мешавад)
 *
 * Нигаред ба README.md барои роҳнамои пурраи deploy.
 * ---------------------------------------------------------
 */
import { MENU } from '../data/menu.js';
import { CONFIG } from '../js/config.js';

const MAX_BODY_BYTES = 8 * 1024; // 8KB — фармоиши воқеӣ ҳеҷ гоҳ ба ин андоза намерасад
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 8; // ҳадди аксар 8 фармоиш дар як дақиқа аз як IP

// Best-effort in-memory rate limiter.
// ЭЗОҲ: Cloudflare Worker isolate метавонад дар вақти дилхоҳ аз нав сар шавад,
// пас ин маҳдудият 100% мутлақ нест — барои муҳофизати ҷиддитар Cloudflare
// Rate Limiting Rules ё Turnstile-ро дар пеши Worker илова кунед (нигаред README).
const rateBuckets = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.start > RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(ip, { start: now, count: 1 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders() }
  });
}

function fail(error, status = 400) {
  return json({ success: false, error }, status);
}

/* =====================================================
   Order validation (browser is never trusted for price)
   ===================================================== */
function validateOrder(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: "Маълумоти фармоиш нодуруст аст." };

  const table = Number(body.table);
  if (!Number.isInteger(table) || table < 1 || table > CONFIG.tableCount) {
    return { ok: false, error: 'Рақами миз нодуруст аст.' };
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { ok: false, error: 'Сабади фармоиш холӣ аст.' };
  }
  if (body.items.length > 40) {
    return { ok: false, error: 'Шумораи маҳсулот аз ҳад зиёд аст.' };
  }

  const resolvedItems = [];
  for (const raw of body.items) {
    const id = typeof raw.id === 'string' ? raw.id.trim() : '';
    const quantity = Number(raw.quantity);
    const product = MENU.find((p) => p.id === id);

    if (!product) return { ok: false, error: 'Маҳсулоти номаълум дар сабад мавҷуд аст.' };
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return { ok: false, error: 'Миқдори маҳсулот нодуруст аст.' };
    }

    resolvedItems.push({
      id: product.id,
      name: product.name, // номи воқеӣ аз меню, на аз браузер
      price: product.price, // НАРХИ ВОҚЕӢ АЗ МЕНЮ — нархи фиристодаи браузер НОДИДА гирифта мешавад
      quantity,
      subtotal: product.price * quantity
    });
  }

  const total = resolvedItems.reduce((sum, it) => sum + it.subtotal, 0);

  const customerName = sanitizeText(body.customerName, 60);
  const phone = sanitizeText(body.phone, 30);
  const note = sanitizeText(body.note, 300);

  return { ok: true, order: { table, items: resolvedItems, total, customerName, phone, note } };
}

function sanitizeText(value, maxLen) {
  if (typeof value !== 'string') return '';
  // control characters-ро тоза мекунем, аз ҳад зиёд бурида мешавад
  return value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLen);
}

function generateOrderId() {
  // Бе баъзи манбаи маркази (DB), ID аз timestamp сохта мешавад.
  // Барои омори баландтарин, дар оянда KV/Database-ро барои counter-и пайдарпай васл кунед.
  return String(Date.now()).slice(-6);
}

/* =====================================================
   Telegram helpers
   ===================================================== */
function telegramApi(env, method) {
  return `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`;
}

function formatOrderMessage(order, orderId, statusLabel) {
  const time = new Date().toLocaleTimeString('tg-TJ', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Dushanbe' });

  const lines = [];
  lines.push('🔔 ФАРМОИШИ НАВ');
  lines.push('');
  lines.push(`🪑 Миз: №${order.table}`);
  lines.push('');
  if (order.customerName) lines.push(`👤 Ном: ${order.customerName}`);
  if (order.phone) lines.push(`📞 Телефон: ${order.phone}`);
  if (order.customerName || order.phone) lines.push('');

  order.items.forEach((it) => {
    lines.push(`🍽 ${it.name} × ${it.quantity} — ${it.subtotal} ${CONFIG.currency}`);
  });
  lines.push('');
  lines.push(`💰 ҲАМАГӢ: ${order.total} ${CONFIG.currency}`);

  if (order.note) {
    lines.push('');
    lines.push('📝 Шарҳ:');
    lines.push(order.note);
  }

  lines.push('');
  lines.push(`🕐 Вақт: ${time}`);
  lines.push(`# ${orderId}`);
  lines.push('');
  lines.push(`📌 Ҳолат: ${statusLabel || 'Интизори қабул'}`);

  return lines.join('\n');
}

function orderKeyboard(orderId) {
  return {
    inline_keyboard: [
      [
        { text: '✅ ҚАБУЛ КАРДАН', callback_data: `accept:${orderId}` },
        { text: '🍳 ОМОДА ШУД', callback_data: `ready:${orderId}` }
      ],
      [{ text: '❌ БЕКОР КАРДАН', callback_data: `cancel:${orderId}` }]
    ]
  };
}

async function sendTelegramMessage(env, order, orderId) {
  const res = await fetch(telegramApi(env, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: formatOrderMessage(order, orderId, 'Интизори қабул'),
      reply_markup: orderKeyboard(orderId)
      // ЯГОН parse_mode истифода намешавад — ин пеши имкони вайроншавии
      // форматгузорӣ тавассути матни воридкардаи мизоҷро мегирад.
    })
  });
  return res;
}

/* =====================================================
   Route: POST /api/order
   ===================================================== */
async function handleOrder(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (isRateLimited(ip)) {
    return fail('Дархостҳои зиёд. Лутфан якчанд лаҳза интизор шавед.', 429);
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength && contentLength > MAX_BODY_BYTES) {
    return fail('Ҳаҷми дархост аз ҳад зиёд аст.', 413);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return fail('JSON нодуруст аст.', 400);
  }

  const validation = validateOrder(body);
  if (!validation.ok) return fail(validation.error, 400);

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return fail('Хидмат муваққатан дастрас нест. (Worker танзим нашудааст)', 500);
  }

  const orderId = generateOrderId();

  let tgRes;
  try {
    tgRes = await sendTelegramMessage(env, validation.order, orderId);
  } catch (e) {
    return fail('Хатои пайвастшавӣ ба Telegram.', 502);
  }

  if (!tgRes.ok) {
    return fail('Telegram фармоишро қабул накард.', 502);
  }

  return json({ success: true, orderId });
}

/* =====================================================
   Route: POST /webhook  (Telegram callback_query)
   ===================================================== */
const STATUS_LABELS = {
  accept: '🟢 ФАРМОИШ ҚАБУЛ ШУД',
  ready: '🍳 ФАРМОИШ ОМОДА ШУД',
  cancel: '🔴 ФАРМОИШ БЕКОР ШУД'
};
const STATUS_ANSWERS = {
  accept: 'Фармоиш қабул шуд ✅',
  ready: 'Фармоиш омода шуд 🍳',
  cancel: 'Фармоиш бекор шуд ❌'
};

async function handleWebhook(request, env) {
  if (env.TELEGRAM_WEBHOOK_SECRET) {
    const secret = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (secret !== env.TELEGRAM_WEBHOOK_SECRET) {
      return new Response('Forbidden', { status: 403 });
    }
  }

  let update;
  try {
    update = await request.json();
  } catch (e) {
    return new Response('OK'); // ба Telegram ҳамеша 200 бармегардонем, вагарна такрор мефиристад
  }

  const cq = update.callback_query;
  if (!cq) return new Response('OK');

  const [action, orderId] = (cq.data || '').split(':');
  const statusLabel = STATUS_LABELS[action];

  if (statusLabel && cq.message) {
    const originalText = cq.message.text || '';
    const newText = /📌 Ҳолат:.*/.test(originalText)
      ? originalText.replace(/📌 Ҳолат:.*/, `📌 Ҳолат: ${statusLabel}`)
      : originalText + `\n\n📌 Ҳолат: ${statusLabel}`;

    await fetch(telegramApi(env, 'editMessageText'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cq.message.chat.id,
        message_id: cq.message.message_id,
        text: newText,
        // Баъд аз ниҳоӣ шудани ҳолат (ready/cancel), тугмаҳоро мебардорем.
        // Баъд аз "accept", тугмаҳои ready/cancel боқӣ мемонанд.
        reply_markup: action === 'accept' ? orderKeyboard(orderId) : { inline_keyboard: [] }
      })
    }).catch(() => {});
  }

  await fetch(telegramApi(env, 'answerCallbackQuery'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: cq.id,
      text: STATUS_ANSWERS[action] || 'Қабул шуд'
    })
  }).catch(() => {});

  return new Response('OK');
}

/* =====================================================
   Entry point
   ===================================================== */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (url.pathname === '/api/order' && request.method === 'POST') {
      return handleOrder(request, env);
    }

    if (url.pathname === '/webhook' && request.method === 'POST') {
      return handleWebhook(request, env);
    }

    return fail('Роҳ ёфт нашуд.', 404);
  }
};
