/**
 * js/cart.js
 * ---------------------------------------------------------
 * Идораи сабади харид. Ҳолат дар localStorage нигоҳ дошта мешавад,
 * то баъд аз навсозии саҳифа (refresh) сабад нест нашавад.
 * ---------------------------------------------------------
 */
import { MENU } from '../data/menu.js';

const STORAGE_KEY = 'qrmenu_cart_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    // фақат id-ҳои воқеан мавҷударо нигоҳ медорем (агар меню тағйир ёфта бошад)
    const clean = {};
    Object.keys(parsed).forEach((id) => {
      const qty = Number(parsed[id]);
      if (findProduct(id) && Number.isInteger(qty) && qty > 0) clean[id] = qty;
    });
    return clean;
  } catch (e) {
    return {};
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // localStorage набудан набояд барномаро вайрон кунад
  }
}

function findProduct(id) {
  return MENU.find((p) => p.id === id) || null;
}

let state = loadState();
const listeners = [];

function notify() {
  listeners.forEach((fn) => fn(state));
}

export const Cart = {
  onChange(fn) {
    listeners.push(fn);
  },

  getQty(id) {
    return state[id] || 0;
  },

  add(id, qty = 1) {
    if (!findProduct(id)) return;
    const next = (state[id] || 0) + qty;
    state[id] = Math.max(0, Math.min(next, 99)); // ҳадди боло 99 барои ҳимоя аз миқдори абсурд
    if (state[id] === 0) delete state[id];
    saveState(state);
    notify();
  },

  setQty(id, qty) {
    if (!findProduct(id)) return;
    const n = Math.max(0, Math.min(Math.floor(qty) || 0, 99));
    if (n === 0) delete state[id];
    else state[id] = n;
    saveState(state);
    notify();
  },

  remove(id) {
    delete state[id];
    saveState(state);
    notify();
  },

  clear() {
    state = {};
    saveState(state);
    notify();
  },

  isEmpty() {
    return Object.keys(state).length === 0;
  },

  getCount() {
    return Object.values(state).reduce((sum, q) => sum + q, 0);
  },

  getItems() {
    return Object.keys(state)
      .map((id) => {
        const product = findProduct(id);
        if (!product) return null;
        const qty = state[id];
        return {
          id,
          name: product.name,
          price: product.price,
          icon: product.icon,
          qty,
          subtotal: product.price * qty
        };
      })
      .filter(Boolean);
  },

  getTotal() {
    return this.getItems().reduce((sum, item) => sum + item.subtotal, 0);
  }
};
