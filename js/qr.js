/**
 * js/qr.js
 * ---------------------------------------------------------
 * Сохтани QR-кодҳо барои ҳар як миз (1..CONFIG.tableCount).
 * QR-код тамоман дар браузер (client-side) сохта мешавад —
 * ба ин васила ҳатто offline (баъд аз бор шудани саҳифа) кор мекунад.
 *
 * Китобхонаи истифодашуда: qrcodejs (davidshimjs), тавассути CDN.
 * ---------------------------------------------------------
 */
import { CONFIG } from './config.js';

const $ = (sel, ctx) => (ctx || document).querySelector(sel);

function defaultBaseUrl() {
  if (CONFIG.baseUrl) return CONFIG.baseUrl.replace(/\/+$/, '');
  // origin + папкаи ҷорӣ (бе qr.html)
  const path = window.location.pathname.replace(/qr\.html$/, '');
  return (window.location.origin + path).replace(/\/+$/, '');
}

const grid = $('#qrGrid');
const baseUrlInput = $('#baseUrlInput');
const regenerateBtn = $('#regenerateBtn');
const printBtn = $('#printAllBtn');

baseUrlInput.value = defaultBaseUrl();

function buildTableUrl(base, table) {
  return base + '/?table=' + table;
}

function cardTemplate(table) {
  return (
    '<div class="qr-card" data-table="' + table + '">' +
      '<div class="qr-card-brand">' + CONFIG.restaurantName + '</div>' +
      '<div class="qr-card-table">🪑 Мизи №' + table + '</div>' +
      '<div class="qr-canvas" id="qrcode-' + table + '"></div>' +
      '<p class="qr-card-hint">Камераро кушоед ва QR-ро скан кунед</p>' +
      '<div class="qr-card-brand qr-card-brand--small">QR MENU</div>' +
      '<button class="btn btn-ghost btn-block qr-download-btn" data-download="' + table + '">⬇️ Download PNG</button>' +
    '</div>'
  );
}

function renderCards() {
  const tables = Array.from({ length: CONFIG.tableCount }, (_, i) => i + 1);
  grid.innerHTML = tables.map(cardTemplate).join('');

  const base = baseUrlInput.value.trim().replace(/\/+$/, '') || defaultBaseUrl();

  tables.forEach((table) => {
    const el = document.getElementById('qrcode-' + table);
    el.innerHTML = '';
    // eslint-disable-next-line no-undef
    new QRCode(el, {
      text: buildTableUrl(base, table),
      width: 176,
      height: 176,
      colorDark: '#15100C',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  });
}

grid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-download]');
  if (!btn) return;
  const table = btn.dataset.download;
  const container = document.getElementById('qrcode-' + table);
  const canvas = container.querySelector('canvas');
  const img = container.querySelector('img');
  let dataUrl = null;

  if (canvas) {
    dataUrl = canvas.toDataURL('image/png');
  } else if (img) {
    dataUrl = img.src;
  }
  if (!dataUrl) return;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = CONFIG.restaurantName + '-table-' + table + '.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

regenerateBtn.addEventListener('click', renderCards);
printBtn.addEventListener('click', () => window.print());

renderCards();
