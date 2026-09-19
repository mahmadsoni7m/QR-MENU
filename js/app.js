/**
 * js/app.js
 * ---------------------------------------------------------
 * Нуқтаи марказии барнома барои index.html:
 *  - муайян кардани рақами миз аз URL (?table=N)
 *  - рендери меню ва идораи сабад
 *  - боз/пӯшидани модалҳо
 *  - фиристодани фармоиш ба Cloudflare Worker
 * ---------------------------------------------------------
 */
import { CONFIG } from './config.js';
import { Cart } from './cart.js';
import { renderTabs, renderMenuGrid, refreshCardControls, ICONS, getVisibleItems } from './menu.js';

const $ = (sel, ctx) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx) => Array.prototype.slice.call((ctx || document).querySelectorAll(sel));

/* =====================================================
   1. Table detection
   ===================================================== */
function detectTable() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('table');
  if (!raw) return null;
  const n = parseInt(raw, 10);
  if (!Number.isInteger(n) || n < 1 || n > CONFIG.tableCount) return null;
  return n;
}

const table = detectTable();
const state = { activeCategory: 'all', submitting: false, deliveryNote: '' };

/* =====================================================
   2. Restaurant info (populated from CONFIG)
   ===================================================== */
function fillRestaurantInfo() {
  $('#restaurantName').textContent = CONFIG.restaurantName;
  $('#aboutAddress').textContent = CONFIG.address;
  $('#aboutHours').textContent = CONFIG.workingHours;
  $('#aboutPhoneText').textContent = CONFIG.phone;
  $('#aboutTelegram').textContent = CONFIG.telegramUsername;
  $('#aboutInstagram').textContent = CONFIG.instagramUsername;
  $('#aboutPhone').href = 'tel:' + CONFIG.phone.replace(/[^0-9+]/g, '');
  $('#footerYear').textContent = new Date().getFullYear();
  $('#footerRestaurant').textContent = CONFIG.restaurantName;
}

/* =====================================================
   3. Table gate — ordering is blocked without a valid table
   ===================================================== */
function initTableGate() {
  if (table) {
    $('#tableBadgeText').textContent = 'Мизи №' + table;
    $('#tableGate').hidden = true;
    $('#appShell').hidden = false;
  } else {
    $('#tableGate').hidden = false;
    $('#appShell').hidden = true;
  }
}

/* =====================================================
   4. Menu rendering
   ===================================================== */
function renderMenu() {
  $('#tabs').innerHTML = renderTabs(state.activeCategory);
  const grid = $('#menuGrid');
  grid.innerHTML = renderMenuGrid(state.activeCategory);
  $('#emptyCategory').hidden = getVisibleItems(state.activeCategory).length > 0;
}

$('#tabs')?.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-cat]');
  if (!btn) return;
  state.activeCategory = btn.dataset.cat;
  renderMenu();
});

$('#menuGrid')?.addEventListener('click', (e) => {
  const addBtn = e.target.closest('[data-add]');
  const incBtn = e.target.closest('[data-inc]');
  const decBtn = e.target.closest('[data-dec]');
  if (addBtn) {
    Cart.add(addBtn.dataset.add, 1);
    showToast('Илова шуд ба сабад');
  } else if (incBtn) {
    Cart.add(incBtn.dataset.inc, 1);
  } else if (decBtn) {
    Cart.add(decBtn.dataset.dec, -1);
  }
});

/* =====================================================
   5. Cart UI (badge, floating bar, modal)
   ===================================================== */
const cartBadge = $('#cartBadge');
const cartBar = $('#cartBar');
const cartBarText = $('#cartBarText');
const bottomNavCartDot = $('#bottomNavCartDot');

function updateCartUI() {
  const count = Cart.getCount();
  const total = Cart.getTotal();

  cartBadge?.classList.toggle('is-visible', count > 0);
  if (cartBadge) cartBadge.textContent = count > 9 ? '9+' : String(count);

  bottomNavCartDot?.classList.toggle('is-visible', count > 0);

  if (count > 0) {
    cartBarText.textContent = '🛒 ' + count + ' маҳсулот — ' + total + ' сомонӣ';
    cartBar.classList.add('is-visible');
  } else {
    cartBar.classList.remove('is-visible');
  }

  if ($('#cartModal').classList.contains('is-open')) renderCartModal();
}

Cart.onChange((state_) => {
  updateCartUI();
  // навсозии тугмаҳои + / − дар картҳои визуалӣ
  $$('.food-card').forEach((card) => refreshCardControls(card.dataset.id));
});

function renderCartModal() {
  const items = Cart.getItems();
  const empty = $('#cartEmpty');
  const list = $('#cartItems');
  const summary = $('#cartSummary');
  const checkoutBtn = $('#cartCheckoutBtn');

  if (!items.length) {
    empty.hidden = false;
    list.hidden = true;
    summary.hidden = true;
    checkoutBtn.disabled = true;
    return;
  }

  empty.hidden = true;
  list.hidden = false;
  summary.hidden = false;
  checkoutBtn.disabled = false;

  list.innerHTML = items
    .map(
      (item) =>
        '<div class="cart-item" data-id="' + item.id + '">' +
          '<div class="food-media">' + (ICONS[item.icon] || ICONS.burger) + '</div>' +
          '<div class="cart-item-info">' +
            '<b>' + item.name + '</b>' +
            '<span class="unit-price">' + item.price + ' сомонӣ × ' + item.qty + ' = ' + item.subtotal + ' сомонӣ</span>' +
          '</div>' +
          '<div class="qty-control">' +
            '<button data-cart-dec="' + item.id + '" aria-label="Кам кардан">−</button>' +
            '<span>' + item.qty + '</span>' +
            '<button data-cart-inc="' + item.id + '" aria-label="Зиёд кардан">+</button>' +
          '</div>' +
          '<button class="cart-item-remove" data-cart-remove="' + item.id + '" aria-label="Хориҷ кардан">✕</button>' +
        '</div>'
    )
    .join('');

  summary.innerHTML =
    '<div class="summary-row"><span>Маҳсулот</span><span>' + Cart.getCount() + ' дона</span></div>' +
    '<div class="summary-row total"><span>Ҳамагӣ</span><span>' + Cart.getTotal() + ' сомонӣ</span></div>';
}

$('#cartItems')?.addEventListener('click', (e) => {
  const inc = e.target.closest('[data-cart-inc]');
  const dec = e.target.closest('[data-cart-dec]');
  const rem = e.target.closest('[data-cart-remove]');
  if (inc) Cart.add(inc.dataset.cartInc, 1);
  else if (dec) Cart.add(dec.dataset.cartDec, -1);
  else if (rem) Cart.remove(rem.dataset.cartRemove);
});

/* =====================================================
   6. Modal open/close helpers
   ===================================================== */
function openModal(modal) {
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}
function closeModal(modal) {
  modal.classList.remove('is-open');
  if (!$$('.modal.is-open').length) document.body.style.overflow = '';
}
$$('.modal').forEach((modal) => {
  $$('[data-close]', modal).forEach((el) => el.addEventListener('click', () => closeModal(modal)));
});

$$('[data-open-cart]').forEach((btn) =>
  btn.addEventListener('click', () => {
    renderCartModal();
    openModal($('#cartModal'));
  })
);

$('#cartCheckoutBtn')?.addEventListener('click', () => {
  if (!table) return;
  closeModal($('#cartModal'));
  renderOrderSummary();
  openModal($('#orderModal'));
});

/* =====================================================
   7. Bottom navigation (Меню / Сабад / Дар бораи мо)
   ===================================================== */
$$('.bottom-nav [data-nav]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.nav;
    $$('.bottom-nav [data-nav]').forEach((b) => b.classList.remove('is-active'));
    if (target === 'cart') {
      renderCartModal();
      openModal($('#cartModal'));
      return;
    }
    btn.classList.add('is-active');
    const el = document.getElementById(target === 'menu' ? 'menuTop' : 'about');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
});

/* =====================================================
   8. Order form
   ===================================================== */
function renderOrderSummary() {
  $('#orderTableBadge').textContent = 'Мизи №' + table;
  const items = Cart.getItems();
  $('#orderItemsSummary').innerHTML = items
    .map((it) => '<div class="summary-row"><span>' + it.name + ' × ' + it.qty + '</span><span>' + it.subtotal + ' сомонӣ</span></div>')
    .join('');
  $('#orderTotalRow').innerHTML = '<div class="summary-row total"><span>Ҳамагӣ</span><span>' + Cart.getTotal() + ' сомонӣ</span></div>';
}

const orderForm = $('#orderForm');
const submitBtn = $('#orderSubmitBtn');
const submitBtnLabel = submitBtn ? submitBtn.querySelector('span') : null;

orderForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (state.submitting) return;

  const validation = validateOrder();
  if (!validation.ok) {
    showFormError(validation.message);
    return;
  }

  if (!navigator.onLine) {
    showFormError('Интернет пайваст нест. Лутфан пайвастшавиро санҷед.');
    return;
  }

  state.submitting = true;
  submitBtn.disabled = true;
  if (submitBtnLabel) submitBtnLabel.textContent = '⏳ Фиристода истодааст...';
  hideFormError();

  const payload = {
    table,
    customerName: $('#inputName').value.trim(),
    phone: $('#inputPhone').value.trim(),
    note: $('#inputNote').value.trim(),
    items: Cart.getItems().map((it) => ({ id: it.id, name: it.name, quantity: it.qty, price: it.price })),
    total: Cart.getTotal()
  };

  try {
    const res = await fetch(CONFIG.telegramEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    let data = null;
    try { data = await res.json(); } catch (_) { /* non-JSON response */ }

    if (res.ok && data && data.success) {
      Cart.clear();
      const orderId = data.orderId || '';
      window.location.href = 'success.html?table=' + table + '&order=' + encodeURIComponent(orderId);
      return;
    }

    showFormError((data && data.error) || 'Фармоиш фиристода нашуд. Лутфан дубора кӯшиш кунед.');
  } catch (err) {
    showFormError('Хатои шабака рух дод. Лутфан дубора кӯшиш кунед.');
  } finally {
    state.submitting = false;
    submitBtn.disabled = false;
    if (submitBtnLabel) submitBtnLabel.textContent = '✅ Фармоиш додан';
  }
});

function validateOrder() {
  if (!table) return { ok: false, message: 'Рақами миз нодуруст аст. Лутфан QR-кодро аз нав скан кунед.' };
  const items = Cart.getItems();
  if (!items.length) return { ok: false, message: 'Сабади шумо холӣ аст.' };
  for (const it of items) {
    if (!Number.isInteger(it.qty) || it.qty < 1 || it.qty > 99) {
      return { ok: false, message: 'Миқдори маҳсулот нодуруст аст.' };
    }
  }
  return { ok: true };
}

function showFormError(message) {
  const el = $('#orderFormError');
  el.textContent = message;
  el.hidden = false;
}
function hideFormError() {
  const el = $('#orderFormError');
  el.hidden = true;
  el.textContent = '';
}

/* =====================================================
   9. Offline banner
   ===================================================== */
function updateOfflineBanner() {
  $('#offlineBanner').hidden = navigator.onLine;
}
window.addEventListener('online', updateOfflineBanner);
window.addEventListener('offline', updateOfflineBanner);

/* =====================================================
   10. Toast
   ===================================================== */
let toastTimer = null;
function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

/* =====================================================
   11. Header scroll shadow
   ===================================================== */
window.addEventListener(
  'scroll',
  () => {
    $('#siteHeader')?.classList.toggle('is-scrolled', window.scrollY > 6);
  },
  { passive: true }
);

/* =====================================================
   12. Init
   ===================================================== */
fillRestaurantInfo();
initTableGate();
updateOfflineBanner();
if (table) {
  renderMenu();
  updateCartUI();
}
