/* ===== YasinDoors — server.js =====
 * Frontend fayllarni beradi va POST /api/order orqali zakazni Telegramga yuboradi.
 * Token faqat .env dan o‘qiladi — frontend uni hech qachon ko‘rmaydi. */
'use strict';
require('dotenv').config();
const path = require('path');
const express = require('express');

const PORT = process.env.PORT || 3000;
const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
const DELIVERY_FEE = 0; // script.js dagi qiymat bilan bir xil (yetkazib berish narxi kelishiladi)

// Narxlar serverda tekshiriladi (mijoz yuborgan narxga ishonilmaydi).
// DIQQAT: script.js dagi PRODUCTS bilan id, nom va narx bir xil bo‘lsin.
const CATALOG = {
  1: { name: 'Classic White', price: 2790000 },
  2: { name: 'Modern Oak', price: 2990000 },
  3: { name: 'Black Minimal', price: 2890000 },
  4: { name: 'Luxury Walnut', price: 3390000 },
  5: { name: 'White Line', price: 2450000 },
  6: { name: 'Dark Wood', price: 3150000 },
  7: { name: 'Minimal Gray', price: 3250000 },
  8: { name: 'Premium Brown', price: 3490000 }
};

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));

/* --- Statik fayllar: faqat ruxsat etilgan ro‘yxat (.env va server.js ochilmaydi) --- */
const PAGES = ['index.html', 'doors.html', 'about.html', 'contact.html', 'cart.html', 'favorites.html', 'style.css', 'script.js'];
const send = f => (req, res) => res.sendFile(path.join(__dirname, f));
app.get('/', send('index.html'));
PAGES.forEach(f => app.get('/' + f, send(f)));

/* --- Yordamchilar --- */
const money = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' so‘m';
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').trim().slice(0, max);
const fail = (res, code, error) => res.status(code).json({ ok: false, error });

const hits = new Map(); // oddiy rate limit: IP boshiga 10 daqiqada 8 ta zakaz
setInterval(() => hits.clear(), 60 * 60 * 1000).unref();
function limited(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter(t => now - t < 600000);
  list.push(now); hits.set(ip, list);
  return list.length > 8;
}

/* --- POST /api/order --- */
app.post('/api/order', async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return fail(res, 500, 'Server sozlanmagan (.env faylini tekshiring).');
  if (limited(req.ip)) return fail(res, 429, 'Juda ko‘p so‘rov. Birozdan so‘ng urinib ko‘ring.');

  const b = req.body || {};
  const name = clean(b.name, 80), address = clean(b.address, 200), note = clean(b.note, 500);
  const digits = clean(b.phone, 30).replace(/\D/g, '');
  if (name.length < 2) return fail(res, 400, 'Ismni kiriting.');
  if (!/^(998)?\d{9}$/.test(digits)) return fail(res, 400, 'Telefon raqami noto‘g‘ri.');
  if (address.length < 5) return fail(res, 400, 'Manzilni kiriting.');
  if (!Array.isArray(b.items) || !b.items.length || b.items.length > 50) return fail(res, 400, 'Savat bo‘sh.');

  // Bir xil mahsulotlarni birlashtirib, narxni katalogdan olamiz
  const qtyById = {};
  for (const it of b.items) {
    const id = Number(it && it.id), qty = Number(it && it.qty);
    if (!CATALOG[id] || !Number.isInteger(qty) || qty < 1 || qty > 99) return fail(res, 400, 'Mahsulot ma’lumoti noto‘g‘ri.');
    qtyById[id] = (qtyById[id] || 0) + qty;
  }
  let total = DELIVERY_FEE;
  const lines = Object.entries(qtyById).map(([id, qty], i) => {
    const p = CATALOG[id]; total += p.price * qty;
    return `${i + 1}. ${p.name}\n${qty} x ${money(p.price)}`;
  });

  const d = digits.length === 9 ? '998' + digits : digits;
  const phone = `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
  const time = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });
  const text = `🛍 YANGI ZAKAZ\n\n👤 Mijoz:\n${name}\n\n📞 Telefon:\n${phone}\n\n📍 Manzil:\n${address}\n\n📦 Mahsulotlar:\n${lines.join('\n\n')}\n\n💰 Jami:\n${money(total)}\n\n📝 Izoh:\n${note || '—'}\n\n🕐 Vaqt:\n${time}`;

  try {
    const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, disable_web_page_preview: true })
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) { console.error('Telegram xatosi:', j.description || r.status); return fail(res, 502, 'Telegramga yuborib bo‘lmadi.'); }
    res.json({ ok: true });
  } catch (e) {
    console.error('Telegram bilan aloqa xatosi:', e.cause?.code || e.name); // token chiqib ketmasligi uchun URL log qilinmaydi
    fail(res, 502, 'Telegram bilan aloqa o‘rnatilmadi.');
  }
});

app.use((req, res) => res.status(404).send('Topilmadi'));
app.use((err, req, res, next) => fail(res, 400, 'So‘rov noto‘g‘ri.')); // noto‘g‘ri JSON va h.k.

app.listen(PORT, () => {
  console.log(`YasinDoors: http://localhost:${PORT}`);
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) console.warn('OGOHLANTIRISH: .env da TELEGRAM_BOT_TOKEN va TELEGRAM_CHAT_ID to‘ldirilmagan.');
});
