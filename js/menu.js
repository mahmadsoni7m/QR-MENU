/**
 * js/menu.js
 * ---------------------------------------------------------
 * Рендери меню: tab-ҳои категория ва картҳои хӯрок.
 * Ҳамаи тасвирҳо SVG-и вектории дарунсохтанд (на файли расм) —
 * ин боиси он мешавад, ки "broken image" ҳеҷ гоҳ рух надиҳад.
 * ---------------------------------------------------------
 */
import { MENU, CATEGORIES } from '../data/menu.js';
import { Cart } from './cart.js';

/* ---------- Icon library (flat, brand-consistent SVG) ---------- */
export const ICONS = {
  burger:
    '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="47" rx="21" ry="6" fill="#C24C22"/>' +
    '<path d="M11 40h42v3a5 5 0 0 1-5 5H16a5 5 0 0 1-5-5v-3Z" fill="#E85D2D"/>' +
    '<rect x="11" y="32" width="42" height="6" rx="2" fill="#6FA97A"/>' +
    '<rect x="11" y="24" width="42" height="7" rx="2" fill="#A85A2E"/>' +
    '<path d="M13 24c0-8 8.5-13 19-13s19 5 19 13H13Z" fill="#F5A623"/>' +
    '<circle cx="24" cy="19" r="1.3" fill="#F6EEE3"/><circle cx="32" cy="16.5" r="1.3" fill="#F6EEE3"/><circle cx="40" cy="19" r="1.3" fill="#F6EEE3"/></svg>',
  pizza:
    '<svg viewBox="0 0 64 64"><path d="M32 8 55 48H9L32 8Z" fill="#F5A623"/>' +
    '<path d="M32 16 48 44H16L32 16Z" fill="#E85D2D"/>' +
    '<circle cx="32" cy="26" r="2.6" fill="#B8481F"/><circle cx="26" cy="34" r="2.2" fill="#B8481F"/><circle cx="38" cy="34" r="2.2" fill="#B8481F"/><circle cx="32" cy="40" r="2.2" fill="#6FA97A"/>' +
    '<path d="M9 48h46l-2 5H11l-2-5Z" fill="#D9C7A8"/></svg>',
  fries:
    '<svg viewBox="0 0 64 64"><path d="M18 26h28l-3 26a3 3 0 0 1-3 3H24a3 3 0 0 1-3-3l-3-26Z" fill="#E85D2D"/>' +
    '<path d="M20 28h24l1 4H19l1-4Z" fill="#C24C22"/>' +
    '<rect x="22" y="10" width="4" height="22" rx="1.5" fill="#F5A623"/>' +
    '<rect x="29" y="6" width="4" height="26" rx="1.5" fill="#F7C165"/>' +
    '<rect x="36" y="12" width="4" height="20" rx="1.5" fill="#F5A623"/></svg>',
  hotdog:
    '<svg viewBox="0 0 64 64"><path d="M8 30c0-6 5-10 10-7l30 15c5 2.5 5 10 0 12.5-5 2.5-10-1-10-1L9 35c-2-1-1-5-1-5Z" fill="#F5A623"/>' +
    '<path d="M12 27c4-3 8-2 11 1l26 15c3 2 3 6.5 0 8-3 1.5-6 0-6 0L12 34c-2-1-2-5 0-7Z" fill="#E85D2D"/>' +
    '<path d="M17 30c8-2 22 6 28 12" stroke="#F6EEE3" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
  cola:
    '<svg viewBox="0 0 64 64"><path d="M20 14h24l-3 38a4 4 0 0 1-4 4H27a4 4 0 0 1-4-4L20 14Z" fill="#2B2119"/>' +
    '<path d="M22 22h20l-2.3 28.5a2.4 2.4 0 0 1-2.4 2.2h-10.6a2.4 2.4 0 0 1-2.4-2.2L22 22Z" fill="#E85D2D"/>' +
    '<rect x="18" y="10" width="28" height="6" rx="2" fill="#F5A623"/><rect x="30" y="2" width="3" height="10" rx="1.4" fill="#B9A896"/></svg>',
  juice:
    '<svg viewBox="0 0 64 64"><path d="M22 12h20l-2 38a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4L22 12Z" fill="#F5A623"/>' +
    '<path d="M23.4 22h17.2l-1.6 26a2.2 2.2 0 0 1-2.2 2H27.2a2.2 2.2 0 0 1-2.2-2l-1.6-26Z" fill="#F7C165"/>' +
    '<rect x="27" y="4" width="10" height="4" rx="2" fill="#6FA97A"/><rect x="30.5" y="0" width="3" height="6" rx="1.3" fill="#6FA97A"/></svg>',
  plov:
    '<svg viewBox="0 0 64 64"><path d="M8 30a24 15 0 0 0 48 0v6a24 15 0 0 1-48 0v-6Z" fill="#2B2119"/>' +
    '<ellipse cx="32" cy="30" rx="24" ry="15" fill="#F0C97A"/>' +
    '<circle cx="24" cy="26" r="3.6" fill="#A85A2E"/><circle cx="36" cy="24" r="3" fill="#A85A2E"/><circle cx="30" cy="34" r="3.2" fill="#A85A2E"/>' +
    '<path d="M20 22c3-4 6-4 8 0M38 30c3-3 6-3 8 0" stroke="#E85D2D" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>',
  kebab:
    '<svg viewBox="0 0 64 64"><path d="M10 54 54 10" stroke="#C9B48A" stroke-width="3" stroke-linecap="round"/>' +
    '<g fill="#C24C22"><rect x="16" y="30" width="12" height="12" rx="2.5" transform="rotate(-45 22 36)"/>' +
    '<rect x="27" y="19" width="12" height="12" rx="2.5" transform="rotate(-45 33 25)"/>' +
    '<rect x="38" y="8" width="12" height="12" rx="2.5" transform="rotate(-45 44 14)"/></g>' +
    '<g fill="#6FA97A"><rect x="22.5" y="24.5" width="7" height="7" rx="1.8" transform="rotate(-45 26 28)"/>' +
    '<rect x="33.5" y="13.5" width="7" height="7" rx="1.8" transform="rotate(-45 37 17)"/></g></svg>',
  lagman:
    '<svg viewBox="0 0 64 64"><path d="M8 28a24 16 0 0 0 48 0v6a24 16 0 0 1-48 0v-6Z" fill="#2B2119"/>' +
    '<ellipse cx="32" cy="28" rx="24" ry="16" fill="#5B8A8A"/>' +
    '<path d="M14 26c4-5 6 5 10 0s6 5 10 0 6 5 10 0 6 5 8 1" stroke="#F7C165" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
    '<circle cx="22" cy="32" r="2.4" fill="#E85D2D"/><circle cx="38" cy="33" r="2.4" fill="#E85D2D"/><circle cx="30" cy="22" r="2" fill="#6FA97A"/></svg>',
  soup:
    '<svg viewBox="0 0 64 64"><path d="M8 30a24 15 0 0 0 48 0v6a24 15 0 0 1-48 0v-6Z" fill="#2B2119"/>' +
    '<ellipse cx="32" cy="30" rx="24" ry="15" fill="#5B8A8A"/>' +
    '<circle cx="24" cy="29" r="3" fill="#F5A623"/><circle cx="34" cy="32" r="3.4" fill="#E85D2D"/><circle cx="42" cy="27" r="2.4" fill="#F5A623"/>' +
    '<path d="M22 8c-2 3 2 4 0 7M32 6c-2 3 2 4 0 7M42 8c-2 3 2 4 0 7" stroke="#B9A896" stroke-width="2.2" stroke-linecap="round" fill="none"/></svg>',
  nuggets:
    '<svg viewBox="0 0 64 64"><path d="M12 30c-3-7 4-13 11-11 2-6 12-7 15-1 8-2 14 5 11 12 4 5 0 13-7 12-3 5-12 5-15-1-8 3-15-3-13-11Z" fill="#F5A623"/>' +
    '<circle cx="20" cy="28" r="1.4" fill="#A85A2E"/><circle cx="30" cy="22" r="1.4" fill="#A85A2E"/><circle cx="40" cy="30" r="1.4" fill="#A85A2E"/><circle cx="28" cy="36" r="1.4" fill="#A85A2E"/><circle cx="38" cy="38" r="1.4" fill="#A85A2E"/></svg>',
  saladCaesar:
    '<svg viewBox="0 0 64 64"><path d="M8 30a24 15 0 0 0 48 0v6a24 15 0 0 1-48 0v-6Z" fill="#2B2119"/>' +
    '<ellipse cx="32" cy="30" rx="24" ry="15" fill="#7BAE6F"/>' +
    '<path d="M14 27c6-6 10 4 16-1s10 5 16-1" stroke="#4E7A45" stroke-width="2.4" stroke-linecap="round" fill="none"/>' +
    '<rect x="26" y="24" width="6" height="6" rx="1.4" fill="#F0C97A"/><rect x="36" y="30" width="6" height="6" rx="1.4" fill="#F0C97A"/>' +
    '<circle cx="20" cy="33" r="1.6" fill="#F6EEE3"/><circle cx="44" cy="24" r="1.6" fill="#F6EEE3"/></svg>',
  saladVeg:
    '<svg viewBox="0 0 64 64"><path d="M8 30a24 15 0 0 0 48 0v6a24 15 0 0 1-48 0v-6Z" fill="#2B2119"/>' +
    '<ellipse cx="32" cy="30" rx="24" ry="15" fill="#7BAE6F"/>' +
    '<circle cx="22" cy="27" r="4.4" fill="#E85D2D"/><circle cx="34" cy="23" r="4" fill="#E85D2D"/>' +
    '<ellipse cx="42" cy="32" rx="5" ry="3" fill="#4E7A45"/><ellipse cx="26" cy="35" rx="5" ry="3" fill="#4E7A45"/>' +
    '<ellipse cx="36" cy="35" rx="3.6" ry="2.4" fill="#F6EEE3" fill-opacity="0.5"/></svg>',
  tea:
    '<svg viewBox="0 0 64 64"><path d="M14 28h30a3 3 0 0 1 3 3c0 8-8 15-18 15S11 39 11 31a3 3 0 0 1 3-3Z" fill="#A85A2E"/>' +
    '<path d="M43 32c6-2 10 2 8 8-2 5-8 5-10 2" stroke="#A85A2E" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M8 28c2-3 10-3 12 0" stroke="#C24C22" stroke-width="3" stroke-linecap="round" fill="none"/>' +
    '<rect x="24" y="46" width="16" height="4" rx="2" fill="#2B2119"/>' +
    '<path d="M20 10c-2 3 2 4 0 7M32 8c-2 3 2 4 0 7" stroke="#B9A896" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
  coffee:
    '<svg viewBox="0 0 64 64"><path d="M14 26h28l-2 18a6 6 0 0 1-6 5H22a6 6 0 0 1-6-5l-2-18Z" fill="#2B2119"/>' +
    '<path d="M42 30c6-2 10 2 8 8-2 5-8 5-10 2" stroke="#2B2119" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="28" cy="26" rx="14" ry="3" fill="#A85A2E"/>' +
    '<rect x="16" y="50" width="24" height="4" rx="2" fill="#1B1410"/>' +
    '<path d="M22 8c-2 3 2 4 0 7M32 6c-2 3 2 4 0 7" stroke="#B9A896" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
  cake:
    '<svg viewBox="0 0 64 64"><path d="M32 10 52 52H12L32 10Z" fill="#A85A2E"/>' +
    '<path d="M32 10 44 34H20L32 10Z" fill="#F7C165"/>' +
    '<rect x="12" y="46" width="40" height="6" rx="2" fill="#F6EEE3"/>' +
    '<circle cx="32" cy="18" r="3" fill="#E85D2D"/></svg>',
  icecream:
    '<svg viewBox="0 0 64 64"><path d="M22 28h20l-8 30a2 2 0 0 1-4 0l-8-30Z" fill="#D9A55C"/>' +
    '<path d="M23 28h5l-2 27M36 28h5l-2 27" stroke="#A85A2E" stroke-width="1.6" opacity="0.5"/>' +
    '<circle cx="32" cy="20" r="14" fill="#F7C165"/><circle cx="24" cy="16" r="3" fill="#F6EEE3"/><circle cx="40" cy="14" r="2.4" fill="#F6EEE3"/></svg>'
};

/* ---------- SVG icons for UI controls (shared style) ---------- */
export const UI_ICONS = {
  plus: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};

/* ---------- Category tabs ---------- */
export function renderTabs(activeCategory) {
  const all = '<button class="tab-btn' + (activeCategory === 'all' ? ' is-active' : '') + '" data-cat="all">Ҳама</button>';
  const rest = CATEGORIES.map((c) => {
    const active = c.id === activeCategory ? ' is-active' : '';
    return '<button class="tab-btn' + active + '" data-cat="' + c.id + '">' + c.emoji + ' ' + c.label + '</button>';
  }).join('');
  return all + rest;
}

/* ---------- Menu grid ---------- */
export function getVisibleItems(activeCategory) {
  return activeCategory === 'all' ? MENU : MENU.filter((p) => p.category === activeCategory);
}

export function renderMenuGrid(activeCategory) {
  return getVisibleItems(activeCategory).map(cardTemplate).join('');
}

function cardTemplate(product) {
  const qty = Cart.getQty(product.id);
  return (
    '<article class="food-card" data-id="' + product.id + '">' +
      '<div class="food-media" aria-hidden="true">' + (ICONS[product.icon] || ICONS.burger) + '</div>' +
      '<div class="food-info">' +
        '<h3 class="food-name">' + escapeHtml(product.name) + '</h3>' +
        '<p class="food-desc">' + escapeHtml(product.description) + '</p>' +
        '<div class="food-foot">' +
          '<span class="food-price">' + product.price + ' сомонӣ</span>' +
          controlTemplate(product.id, qty) +
        '</div>' +
      '</div>' +
    '</article>'
  );
}

export function controlTemplate(id, qty) {
  if (qty > 0) {
    return (
      '<div class="qty-control">' +
        '<button data-dec="' + id + '" aria-label="Кам кардан">' + UI_ICONS.minus + '</button>' +
        '<span>' + qty + '</span>' +
        '<button data-inc="' + id + '" aria-label="Зиёд кардан">' + UI_ICONS.plus + '</button>' +
      '</div>'
    );
  }
  return '<button class="add-btn" data-add="' + id + '" aria-label="Ба сабад илова кардан">' + UI_ICONS.plus + '</button>';
}

export function refreshCardControls(id) {
  const card = document.querySelector('.food-card[data-id="' + id + '"]');
  if (!card) return;
  const foot = card.querySelector('.food-foot');
  const old = foot.querySelector('.qty-control, .add-btn');
  if (old) old.remove();
  foot.insertAdjacentHTML('beforeend', controlTemplate(id, Cart.getQty(id)));
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
