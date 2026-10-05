/* ===== YasinDoors — script.js ===== */
(() => {
  'use strict';

  /* ---------- 1. Products (single source of truth) ---------- */
  // color: oq | qora | jigarrang | yogoch ; style: modern | classic
  const PRODUCTS = [
    { id: 1, name: 'Nordic White', price: 2450000, color: 'oq', style: 'modern', hex: '#f1f0ec', edge: '#d8d6cf', tags: 'white oq modern minimal',
      desc: 'Toza oq rangdagi minimalist MDF eshik.', long: 'Yorug‘ interyerlar uchun silliq, mat qoplamali zamonaviy eshik.', material: 'MDF + mat PVX qoplama', colorName: 'Oq', styleName: 'Modern', stock: true },
    { id: 2, name: 'Noir Line', price: 2890000, color: 'qora', style: 'modern', hex: '#232323', edge: '#0f0f0f', tags: 'black qora modern',
      desc: 'Vertikal chiziqli qora MDF eshik.', long: 'Kontrastli, premium ko‘rinishdagi qora eshik. Vertikal naqsh dizaynga chuqurlik beradi.', material: 'MDF + mat PVX qoplama', colorName: 'Qora', styleName: 'Modern', stock: true },
    { id: 3, name: 'Classic Oak', price: 3150000, color: 'yogoch', style: 'classic', hex: '#b98a55', edge: '#8f6636', tags: 'oak yogoch wood classic eman',
      desc: 'Klassik panelli eman rangidagi eshik.', long: 'Issiq yog‘och tekstura va klassik panellar an’anaviy interyerga mos keladi.', material: 'MDF + shpon ko‘rinishidagi qoplama', colorName: 'Eman', styleName: 'Classic', stock: true },
    { id: 4, name: 'Walnut Prime', price: 3390000, color: 'jigarrang', style: 'classic', hex: '#6b4a33', edge: '#4a3022', tags: 'walnut brown jigarrang classic yongoq',
      desc: 'Boy jigarrang yong‘oq rangli eshik.', long: 'Chuqur jigarrang ton va nafis panellar bilan premium klassik model.', material: 'MDF + yong‘oq tekstura', colorName: 'Jigarrang', styleName: 'Classic', stock: true },
    { id: 5, name: 'Pearl Classic', price: 2790000, color: 'oq', style: 'classic', hex: '#e8e4da', edge: '#cfc9bb', tags: 'white oq classic pearl',
      desc: 'Nafis panelli och rangli klassik eshik.', long: 'Yumshoq marvarid tusi va ko‘tarma panellar uyga tinch muhit beradi.', material: 'MDF + emal qoplama', colorName: 'Oq', styleName: 'Classic', stock: true },
    { id: 6, name: 'Urban Oak', price: 2990000, color: 'yogoch', style: 'modern', hex: '#c49a6a', edge: '#9a7347', tags: 'oak yogoch wood modern',
      desc: 'Zamonaviy gorizontal naqshli yog‘och eshik.', long: 'Tabiiy yog‘och tusi va zamonaviy chiziqlar uyg‘unligi.', material: 'MDF + yog‘och tekstura', colorName: 'Yog‘och', styleName: 'Modern', stock: true },
    { id: 7, name: 'Espresso Modern', price: 3250000, color: 'jigarrang', style: 'modern', hex: '#4a3328', edge: '#33231b', tags: 'brown espresso jigarrang modern',
      desc: 'To‘q jigarrang zamonaviy MDF eshik.', long: 'Espresso ranglari chuqur va elegant ko‘rinish yaratadi.', material: 'MDF + mat PVX qoplama', colorName: 'Jigarrang', styleName: 'Modern', stock: true },
    { id: 8, name: 'Onyx Classic', price: 3490000, color: 'qora', style: 'classic', hex: '#2b2b2d', edge: '#151516', tags: 'black qora classic onyx',
      desc: 'Qora rangli nafis klassik eshik.', long: 'Boy panel naqshlari va chuqur qora rang — hashamatli yechim.', material: 'MDF + emal qoplama', colorName: 'Qora', styleName: 'Classic', stock: false },
  ];
  const FILTERS = [['all', 'Barchasi'], ['oq', 'Oq'], ['qora', 'Qora'], ['jigarrang', 'Jigarrang'], ['yogoch', 'Yog‘och'], ['modern', 'Modern'], ['classic', 'Classic']];

  /* ---------- 2. Helpers & storage ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const find = id => PRODUCTS.find(p => p.id === +id);
  const money = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' so‘m';
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } }
  };
  let cart = store.get('cart', {});        // { id: qty }
  let favs = store.get('favorites', []);   // [id]
  const page = document.body.dataset.page;

  /* Door illustration as inline SVG (no external images needed) */
  function doorImg(p) {
    const panels = p.style === 'classic'
      ? [[112, 62], [112, 150], [112, 238]].map(([x, y]) => `<rect x="${x}" y="${y}" width="76" height="68" rx="3" fill="none" stroke="${p.edge}" stroke-width="3"/>`).join('')
      : [120, 140, 160, 180].map(x => `<line x1="${x + 0}" y1="60" x2="${x}" y2="330" stroke="${p.edge}" stroke-width="3"/>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".12"/><stop offset=".5" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient></defs>
<rect x="92" y="28" width="116" height="342" rx="5" fill="${p.edge}"/><rect x="98" y="34" width="104" height="330" rx="3" fill="${p.hex}"/><rect x="98" y="34" width="104" height="330" rx="3" fill="url(#g)"/>${panels}<circle cx="188" cy="205" r="5" fill="#c9c9c9" stroke="#8a8a8a"/><rect x="60" y="370" width="180" height="4" rx="2" fill="#888" opacity=".35"/></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
  const img = (p, cls = '') => `<img class="${cls}" src="${doorImg(p)}" alt="${p.name} — ${p.colorName.toLowerCase()} ${p.styleName} MDF eshik" loading="lazy">`;

  /* ---------- 3. Shared layout (header, footer, toast, modal) ---------- */
  const NAV = [['index.html', 'Home', 'home'], ['doors.html', 'MDF Eshiklar', 'doors'], ['about.html', 'Biz haqimizda', 'about'], ['contact.html', 'Aloqa', 'contact']];
  const ICON = {
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.2C1 8 3.3 4.5 6.8 4.5c2 0 3.6 1 5.2 3 1.6-2 3.2-3 5.2-3 3.5 0 5.8 3.5 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>',
    cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2.5l2 11h10l2-8H7"/><circle cx="9" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/></svg>',
    logo: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="1.5"/><circle cx="15" cy="12" r=".9"/><path d="M3 21.5h18"/></svg>'
  };
  function renderLayout() {
    const links = NAV.map(([h, t, k]) => `<li><a href="${h}" ${page === k ? 'class="active" aria-current="page"' : ''}>${t}</a></li>`).join('');
    $('#site-header').innerHTML = `<header class="header" id="header"><div class="container header__in">
      <a href="index.html" class="logo" aria-label="YasinDoors — bosh sahifa">${ICON.logo}<span>Yasin<b>Doors</b></span></a>
      <nav class="nav" id="nav" aria-label="Asosiy menyu"><ul>${links}
        <li class="only-m"><a href="favorites.html">♡ Sevimlilar</a></li>
        <li class="only-m"><a href="cart.html">🛒 Savat</a></li>
        <li class="only-m"><button class="link" data-act="theme" aria-label="Rejimni almashtirish">◐ Dark / Light mode</button></li></ul></nav>
      <div class="actions">
        <a href="favorites.html" class="ibtn only-d" aria-label="Sevimlilar">${ICON.heart}<span class="badge" data-count="fav"></span></a>
        <a href="cart.html" class="ibtn" aria-label="Savat">${ICON.cart}<span class="badge" data-count="cart"></span></a>
        <button class="ibtn only-d" data-act="theme" aria-label="Dark / Light rejimni almashtirish" id="themeBtn"></button>
        <button class="ibtn burger" id="burger" aria-label="Menyuni ochish" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
      </div></div></header>`;
    const fl = [...NAV.map(([h, t]) => [h, t]), ['favorites.html', 'Sevimlilar'], ['cart.html', 'Savat']].map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('');
    $('#site-footer').innerHTML = `<footer class="footer"><div class="container"><div class="footer__in">
      <div><a href="index.html" class="logo" aria-label="YasinDoors — bosh sahifa"><span>Yasin<b>Doors</b></span></a><p style="margin-top:10px">Zamonaviy MDF eshiklar</p></div>
      <nav aria-label="Footer menyusi"><ul>${fl}</ul></nav></div>
      <small>© 2026 YasinDoors. All rights reserved.</small></div></footer>
      <div class="toasts" id="toasts" role="status" aria-live="polite"></div>
      <div class="modal" id="modal" role="dialog" aria-modal="true" aria-label="Mahsulot tafsilotlari"><div class="modal__box" id="modalBox"></div></div>`;
  }

  /* ---------- 4. Theme ---------- */
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch { /* ignore */ }
    const b = $('#themeBtn'); if (b) b.textContent = t === 'dark' ? '☀️' : '🌙';
  }
  const toggleTheme = () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');

  /* ---------- 5. Toast ---------- */
  function toast(msg) {
    const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 2300);
  }

  /* ---------- 6. Cart & favorites actions ---------- */
  const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
  function updateCounts() {
    $$('[data-count="cart"]').forEach(e => { e.textContent = cartCount() || ''; });
    $$('[data-count="fav"]').forEach(e => { e.textContent = favs.length || ''; });
  }
  function commit() { store.set('cart', cart); store.set('favorites', favs); updateCounts(); renderPage(); syncModal(); }
  function addCart(id) { cart[id] = (cart[id] || 0) + 1; commit(); toast('✓ Mahsulot savatga qo‘shildi'); }
  function setQty(id, d) { cart[id] = (cart[id] || 0) + d; if (cart[id] <= 0) delete cart[id]; commit(); }
  function removeCart(id) { delete cart[id]; commit(); toast('Mahsulot savatdan olib tashlandi'); }
  function toggleFav(id) {
    const on = favs.includes(id);
    favs = on ? favs.filter(x => x !== id) : [...favs, id];
    commit();
    toast(on ? 'Mahsulot sevimlilardan olib tashlandi' : '♡ Sevimlilarga qo‘shildi');
    if (!on) $$(`.fav[data-id="${id}"]`).forEach(b => { b.classList.add('pop'); });
  }

  /* ---------- 7. Rendering ---------- */
  const card = p => `<article class="card reveal in">
    <div class="card__img">${img(p)}
      <button class="fav" data-act="fav" data-id="${p.id}" aria-pressed="${favs.includes(p.id)}" aria-label="Sevimlilarga qo‘shish: ${p.name}">${favs.includes(p.id) ? '♥' : '♡'}</button></div>
    <div class="card__body"><h3>${p.name}</h3><p>${p.desc}</p><div class="price">${money(p.price)}</div>
      <div class="card__act"><button class="btn btn--p btn--sm" data-act="cart" data-id="${p.id}" aria-label="Savatga qo‘shish: ${p.name}">Savatga</button>
      <button class="btn btn--o btn--sm" data-act="details" data-id="${p.id}" aria-label="Batafsil: ${p.name}">Batafsil</button></div></div></article>`;

  const view = { f: 'all', q: '', sort: 'rec' };
  function renderDoors() {
    const q = view.q.trim().toLowerCase();
    let list = PRODUCTS.filter(p => (view.f === 'all' || p.color === view.f || p.style === view.f) &&
      (!q || `${p.name} ${p.desc} ${p.tags} ${p.colorName} ${p.styleName}`.toLowerCase().includes(q)));
    const sorts = { asc: (a, b) => a.price - b.price, desc: (a, b) => b.price - a.price, az: (a, b) => a.name.localeCompare(b.name), za: (a, b) => b.name.localeCompare(a.name) };
    if (sorts[view.sort]) list = [...list].sort(sorts[view.sort]);
    $('#doorsGrid').innerHTML = list.length ? list.map(card).join('') :
      '<div class="empty"><h3>Hech narsa topilmadi</h3><p>Boshqa so‘z yoki filtrni sinab ko‘ring.</p></div>';
  }
  function renderFavs() {
    const list = PRODUCTS.filter(p => favs.includes(p.id));
    $('#favGrid').innerHTML = list.length ? list.map(card).join('') :
      '<div class="empty"><h3>Hali sevimli eshiklar yo‘q</h3><p>♡ tugmasini bosib eshiklarni shu yerga saqlang.</p><a class="btn btn--p" href="doors.html">Katalogga o‘tish</a></div>';
  }
  function renderCart() {
    const items = Object.keys(cart).map(id => ({ p: find(id), q: cart[id] })).filter(i => i.p);
    const total = items.reduce((s, i) => s + i.p.price * i.q, 0);
    $('#cartRoot').innerHTML = items.length ? `<div class="cart"><div>${items.map(({ p, q }) => `<div class="row">${img(p)}
      <div><h3>${p.name}</h3><p>${money(p.price)}</p></div>
      <div class="qty"><button data-act="minus" data-id="${p.id}" aria-label="Kamaytirish: ${p.name}">−</button><span aria-live="polite">${q}</span><button data-act="plus" data-id="${p.id}" aria-label="Ko‘paytirish: ${p.name}">+</button></div>
      <button class="rm" data-act="remove" data-id="${p.id}" aria-label="O‘chirish: ${p.name}">O‘chirish</button></div>`).join('')}</div>
      <aside class="sum"><h3>Buyurtma xulosasi</h3><dl><dt>Mahsulotlar:</dt><dd>${cartCount()}</dd></dl><dl><dt>Jami:</dt><dd>${money(total)}</dd></dl>
      <button class="btn btn--p" data-act="checkout">Buyurtmani rasmiylashtirish</button></aside></div>` :
      '<div class="empty"><h3>Savatingiz bo‘sh</h3><p>Katalogdan o‘zingizga mos MDF eshikni tanlang.</p><a class="btn btn--p" href="doors.html">Katalogga o‘tish</a></div>';
  }
  function renderPage() {
    if (page === 'home') $('#featured').innerHTML = PRODUCTS.slice(0, 6).map(card).join('');
    if (page === 'doors') renderDoors();
    if (page === 'favorites') renderFavs();
    if (page === 'cart') renderCart();
  }

  /* ---------- 8. Modal ---------- */
  let modalId = null, lastFocus = null;
  function syncModal() {
    if (!modalId) return;
    const p = find(modalId), on = favs.includes(p.id);
    $('#modalBox').innerHTML = `<button class="modal__x" data-act="close" aria-label="Yopish">✕</button>
      <div class="modal__img">${img(p)}</div>
      <div class="modal__txt"><p class="eyebrow" style="margin:0">${p.styleName} · ${p.colorName}</p><h2 style="font-size:34px">${p.name}</h2>
      <div class="price" style="font-size:26px">${money(p.price)}</div><p>${p.long}</p>
      <ul class="spec"><li><span>Material</span>${p.material}</li><li><span>Rang</span>${p.colorName}</li><li><span>Uslub</span>${p.styleName}</li>
      <li><span>Mavjudligi</span>${p.stock ? 'Mavjud' : 'Buyurtma asosida'}</li></ul>
      <div class="card__act"><button class="btn btn--o" data-act="fav" data-id="${p.id}" aria-pressed="${on}" aria-label="Sevimlilarga qo‘shish">${on ? '♥ Sevimli' : '♡ Sevimlilarga'}</button>
      <button class="btn btn--p" data-act="cart" data-id="${p.id}" aria-label="Savatga qo‘shish">Savatga</button></div></div>`;
  }
  function openModal(id) { lastFocus = document.activeElement; modalId = +id; syncModal(); $('#modal').classList.add('open'); document.body.style.overflow = 'hidden'; $('.modal__x').focus(); }
  function closeModal() { modalId = null; $('#modal').classList.remove('open'); document.body.style.overflow = ''; lastFocus && lastFocus.focus(); }

  /* ---------- 9. Events (delegation) ---------- */
  document.addEventListener('click', e => {
    const m = $('#modal'); if (e.target === m) return closeModal();
    const b = e.target.closest('[data-act]'); if (!b) return;
    const id = +b.dataset.id;
    ({
      fav: () => toggleFav(id), cart: () => addCart(id), details: () => openModal(id), close: closeModal,
      plus: () => setQty(id, 1), minus: () => setQty(id, -1), remove: () => removeCart(id), theme: toggleTheme,
      checkout: () => toast('Buyurtma funksiyasi tez orada ishga tushadi.')
    })[b.dataset.act]?.();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeNav(); } });

  /* Mobile menu */
  function closeNav() { const n = $('#nav'), b = $('#burger'); if (n) { n.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-label', 'Menyuni ochish'); } }
  function initNav() {
    $('#burger').addEventListener('click', () => {
      const open = $('#nav').classList.toggle('open');
      $('#burger').setAttribute('aria-expanded', open); $('#burger').setAttribute('aria-label', open ? 'Menyuni yopish' : 'Menyuni ochish');
    });
    const onScroll = () => $('#header').classList.toggle('scrolled', scrollY > 24);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* Catalog controls */
  function initDoors() {
    $('#chips').innerHTML = FILTERS.map(([k, t]) => `<button class="chip" data-f="${k}" aria-pressed="${k === 'all'}">${t}</button>`).join('');
    $('#chips').addEventListener('click', e => {
      const c = e.target.closest('.chip'); if (!c) return;
      view.f = c.dataset.f; $$('.chip').forEach(x => x.setAttribute('aria-pressed', x === c)); renderDoors();
    });
    $('#search').addEventListener('input', e => { view.q = e.target.value; renderDoors(); });
    $('#sort').addEventListener('change', e => { view.sort = e.target.value; renderDoors(); });
  }

  /* Contact form (frontend validation only) */
  function initContact() {
    const f = $('#contactForm');
    const rules = {
      name: v => v.trim().length >= 2 || 'Ismingizni kiriting (kamida 2 ta belgi).',
      phone: v => /^\+?[\d\s()-]{7,}$/.test(v.trim()) || 'To‘g‘ri telefon raqamini kiriting.',
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'To‘g‘ri email manzilini kiriting.',
      message: v => v.trim().length >= 10 || 'Xabar kamida 10 ta belgidan iborat bo‘lsin.'
    };
    const check = k => { const i = f.elements[k], r = rules[k](i.value); i.classList.toggle('bad', r !== true); $('#e-' + k).textContent = r === true ? '' : r; return r === true; };
    Object.keys(rules).forEach(k => f.elements[k].addEventListener('blur', () => check(k)));
    f.addEventListener('submit', e => {
      e.preventDefault();
      if (!Object.keys(rules).map(check).every(Boolean)) return toast('Iltimos, maydonlarni to‘g‘ri to‘ldiring');
      f.reset(); toast('✓ Xabaringiz yuborildi. Tez orada bog‘lanamiz!');
    });
  }

  /* Scroll reveal */
  function initReveal() {
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .12 });
    $$('.reveal:not(.in)').forEach(el => io.observe(el));
  }

  /* ---------- 10. Init ---------- */
  renderLayout();
  applyTheme(document.documentElement.dataset.theme || 'light');
  initNav(); updateCounts(); renderPage();
  if (page === 'home') $('#heroDoor').src = doorImg(PRODUCTS[2]);
  if (page === 'doors') initDoors();
  if (page === 'contact') initContact();
  initReveal();
})();
