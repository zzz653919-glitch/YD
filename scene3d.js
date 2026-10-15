/* ===== YasinDoors — scene3d.js =====
 * Scroll bilan jonlanuvchi 3D sahna: o‘lchov → zavodda ishlab chiqarish → yetkazish → o‘rnatish.
 * Three.js (vendor/three.min.js) kerak; sahna to‘liq protsedurali — tashqi model yoki rasm yuklanmaydi.
 * API: YDScene.init({ canvas, mobile, onFrame }) → { setProgress(p), resize(), start(), stop(), dispose() } yoki null (WebGL yo‘q bo‘lsa). */
(function () {
  'use strict';
  const T = window.THREE; if (!T) return;

  /* ---------- 1. Bosqichlar (matn va davomiylik) ---------- */
  const ACTS = ['O‘lchov', 'Ishlab chiqarish', 'Yetkazish', 'O‘rnatish'];
  const BEATS = [
    { act: 0, w: 1.0, t: 'Muhandis uyga keladi', d: 'Muhandis mijoz bilan birga uyga kiradi va eshik joyini ko‘zdan kechiradi.', c: ['Joyni ko‘rish', 'Mijoz bilan kelishish'] },
    { act: 0, w: 1.3, t: 'Lazer bilan o‘lchash', d: 'Lazerli o‘lchagich eshik oralig‘ining eni va bo‘yini aniq o‘lchaydi.', c: ['Eni', 'Bo‘yi', 'Lazerli o‘lchagich'] },
    { act: 0, w: 1.2, t: 'Planshetga kiritiladi', d: 'O‘lchamlar planshetga yoziladi va buyurtma bilan zavodga yuboriladi.', c: ['Raqamli buyurtma', 'Zavodga uzatish'] },
    { act: 1, w: 1.2, t: 'Materiallar keltiriladi', d: 'MDF plitalar ishlab chiqarish hududiga yuk ko‘targich bilan olib kelinadi.', c: ['MDF plita', 'Yuk ko‘targich'] },
    { act: 1, w: 1.1, t: 'O‘lchamda kesiladi', d: 'Plita maxsus stanokda buyurtma o‘lchamiga aniq kesiladi.', c: ['Kesish stanogi', 'Aniq o‘lcham'] },
    { act: 1, w: 1.1, t: 'Qismlar shakllanadi', d: 'Eshik qismlari yig‘ilib, bitta eshik tabaqasi shakllanadi.', c: ['Karkas', 'Panellar'] },
    { act: 1, w: 1.0, t: 'Yuza silliqlanadi', d: 'Silliqlash stanogi yuzani tekislab, bo‘yoqqa tayyorlaydi.', c: ['Silliqlash', 'Tekis yuza'] },
    { act: 1, w: 1.2, t: 'Frezer va naqsh', d: 'CNC frezer tanlangan modelning panel va naqshlarini o‘yib chiqadi.', c: ['CNC frezer', 'Naqsh'] },
    { act: 1, w: 1.1, t: 'Bo‘yoq yoki qoplama', d: 'Bo‘yash kabinasida eshik yuziga tanlangan rang va qoplama beriladi.', c: ['Bo‘yash kabinasi', 'Rang'] },
    { act: 1, w: 1.2, t: 'Quritish va nazorat', d: 'Eshik quritiladi, so‘ng sifat nazoratchisi har bir detalini tekshiradi.', c: ['Quritish', 'Sifat nazorati'] },
    { act: 1, w: 1.1, t: 'Qadoqlanadi', d: 'Tayyor eshik himoya plyonkasi va qutiga o‘raladi.', c: ['Plyonka', 'Quti'] },
    { act: 2, w: 1.2, t: 'Mashinaga yuklanadi', d: 'Qadoqlangan eshik ishchilar tomonidan yuk mashinasiga ehtiyotkorlik bilan yuklanadi.', c: ['Ehtiyotkor yuklash'] },
    { act: 2, w: 1.5, t: 'Mijoz uyiga yo‘l', d: 'Mashina zavoddan chiqib, mijozning uyi tomon yo‘l oladi.', c: ['Yetkazib berish'] },
    { act: 3, w: 1.1, t: 'Rom tekshiriladi', d: 'Muhandislar uyga kelib, eshik romini sath va o‘lcham bo‘yicha tekshiradi.', c: ['Sath', 'O‘lcham'] },
    { act: 3, w: 1.1, t: 'Joyiga qo‘yiladi', d: 'Eshik qadoqdan chiqarilib, romga ehtiyotkorlik bilan joylanadi.', c: ['Joylash'] },
    { act: 3, w: 1.1, t: 'Tekislash va mahkamlash', d: 'Eshik sath bo‘yicha tekislanadi va petlalardan mahkamlanadi.', c: ['Tekislash', 'Petlalar'] },
    { act: 3, w: 1.0, t: 'Dastak o‘rnatiladi', d: 'Dastak va qulf o‘rnatiladi.', c: ['Dastak', 'Qulf'] },
    { act: 3, w: 1.6, t: 'Ochilish va yopilish', d: 'Eshikning ochilib-yopilishi tekshiriladi — natija tayyor.', c: ['Silliq yurish', 'Tayyor natija'] }
  ];
  const WSUM = BEATS.reduce((a, b) => a + b.w, 0); let acc = 0;
  BEATS.forEach(b => { b.a = acc / WSUM; acc += b.w; b.b = acc / WSUM; });
  const bp = (i, f) => BEATS[i].a + (BEATS[i].b - BEATS[i].a) * f; // i-bosqichning f-ulushi → umumiy progress

  /* ---------- 2. Yordamchilar ---------- */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sm = t => t * t * (3 - 2 * t);
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const V = (x, y, z) => new T.Vector3(x, y, z);
  const K = (p, keys) => { // skalyar kalit kadrlar: [[p, qiymat], …], silliq o‘tish
    if (p <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) if (p < keys[i + 1][0]) return lerp(keys[i][1], keys[i + 1][1], sm(seg(p, keys[i][0], keys[i + 1][0])));
    return keys[keys.length - 1][1];
  };
  const KV = (p, keys, out) => { // vektor kalit kadrlar: [[p, [x,y,z]], …]
    const x = K(p, keys.map(k => [k[0], k[1][0]])), y = K(p, keys.map(k => [k[0], k[1][1]])), z = K(p, keys.map(k => [k[0], k[1][2]]));
    return out.set(x, y, z);
  };
  let SHADOWS = true, LOW = false;
  const mats = {};
  // PBR material (keshlanadi): rangi, g‘adir-budirligi, metallik, qo‘shimcha parametrlar
  const M = (color, rough = .85, metal = 0, extra) => {
    const k = color + '|' + rough + '|' + metal + (extra ? JSON.stringify(extra, (kk, v) => (v && v.isTexture) ? v.uuid : v) : '');
    return mats[k] || (mats[k] = new T.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal, envMapIntensity: metal > .4 ? .8 : .3 }, extra || {})));
  };
  const GL = (color, op = .2) => M(color, .05, 0, { transparent: true, opacity: op, depthWrite: false, envMapIntensity: 1.4 }); // shisha
  const EMI = (color, int = 1) => M(0x111111, .6, 0, { emissive: color, emissiveIntensity: int });
  const mark = (m, shadow) => { if (SHADOWS && shadow !== false) { const g = m.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); m.castShadow = g.boundingSphere.radius > .14; m.receiveShadow = true; } else m.receiveShadow = SHADOWS; return m; };
  const add = (parent, geo, mat, x = 0, y = 0, z = 0, shadow = true) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); mark(m, shadow); parent.add(m); return m; };
  const box = (parent, w, h, d, mat, x, y, z, shadow) => add(parent, new T.BoxGeometry(w, h, d), mat, x, y, z, shadow);
  const cyl = (parent, rt, rb, h, mat, x, y, z, seg = 16, shadow) => add(parent, new T.CylinderGeometry(rt, rb, h, LOW ? Math.min(seg, 10) : seg), mat, x, y, z, shadow);
  const grp = (parent, x = 0, y = 0, z = 0) => { const g = new T.Group(); g.position.set(x, y, z); parent && parent.add(g); return g; };
  // yumaloqlangan qirrali quti (fazali bevel): w×h×d, r — qirra radiusi; UV — haqiqiy o‘lchamda (tekstura masshtabi to‘g‘ri)
  const GEO = {};
  const rgeo = (w, h, d, r) => {
    const key = [w, h, d, r].map(v => v.toFixed(4)).join('|'); if (GEO[key]) return GEO[key];
    r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4); const ir = Math.max(r * .6, 1e-4);
    const s = new T.Shape(), x = w / 2 - ir, z = d / 2 - ir; s.moveTo(-x, -d / 2); s.lineTo(x, -d / 2); s.quadraticCurveTo(w / 2, -d / 2, w / 2, -z); s.lineTo(w / 2, z); s.quadraticCurveTo(w / 2, d / 2, x, d / 2); s.lineTo(-x, d / 2); s.quadraticCurveTo(-w / 2, d / 2, -w / 2, z); s.lineTo(-w / 2, -z); s.quadraticCurveTo(-w / 2, -d / 2, -x, -d / 2);
    const g = new T.ExtrudeGeometry(s, { depth: Math.max(h - 2 * r, 1e-4), bevelEnabled: true, bevelThickness: r, bevelSize: r * .4, bevelSegments: LOW ? 1 : 3, curveSegments: LOW ? 2 : 4 });
    g.rotateX(-Math.PI / 2); g.computeBoundingBox(); const b = g.boundingBox; g.translate(-(b.max.x + b.min.x) / 2, -(b.max.y + b.min.y) / 2, -(b.max.z + b.min.z) / 2);
    g.scale(w / (b.max.x - b.min.x), h / (b.max.y - b.min.y), d / (b.max.z - b.min.z)); return GEO[key] = g;
  };
  const rb = (parent, w, h, d, mat, x, y, z, r = .012, shadow) => add(parent, rgeo(w, h, d, r), mat, x, y, z, shadow);
  const capGeo = (r, l, seg) => { const k = 'cap' + r + '|' + l + '|' + seg; return GEO[k] || (GEO[k] = new T.CapsuleGeometry(r, l, LOW ? 3 : 5, seg)); };

  /* ---------- 3. Protsedural teksturalar (yog‘och tolasi, beton, gips, parket) ---------- */
  const rngMk = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const mkCv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const hash = (x, y, s) => { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
  const vnoise = (x, y, px, py, s) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), m = (a, n) => ((a % n) + n) % n; const a = hash(m(xi, px), m(yi, py), s), b = hash(m(xi + 1, px), m(yi, py), s), c = hash(m(xi, px), m(yi + 1, py), s), d = hash(m(xi + 1, px), m(yi + 1, py), s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
  const fbm = (x, y, px, py, s, o = 3) => { let a = .5, f = 1, r = 0, n = 0; for (let i = 0; i < o; i++) { r += a * vnoise(x * f, y * f, px * f, py * f, s + i * 7); n += a; a *= .5; f *= 2; } return r / n; };
  const mkTex = (cv, rx = 1, ry = 1, srgb = true) => { const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = LOW ? 2 : 8; if (srgb && T.sRGBEncoding) t.encoding = T.sRGBEncoding; return t; };
  const woodData = (n, seed, base, rings) => { // tola x o‘qi bo‘ylab; halqalar, mayda tolalar, g‘ovaklar
    const cv = mkCv(n, n), bc = mkCv(n, n), id = cv.getContext('2d').createImageData(n, n), bi = bc.getContext('2d').createImageData(n, n);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const u = x / n, v = y / n, warp = fbm(u * 2, v * 3, 2, 3, seed, 3), ring = Math.sin((v * rings + warp * 2.6 + fbm(u, v * 8, 1, 8, seed + 5, 2) * .6) * 6.2832);
      const fine = fbm(u * 24, v * 8, 24, 8, seed + 3, 2), streak = fbm(u * 2, v * 150, 2, 150, seed + 9, 2), pore = 1;
      let t = (.86 + .07 * ring + (fine - .5) * .05 + (streak - .5) * .05) * pore; t = clamp(t, .45, 1.08); const i = (y * n + x) * 4;
      id.data[i] = Math.min(255, base[0] * t); id.data[i + 1] = Math.min(255, base[1] * t); id.data[i + 2] = Math.min(255, base[2] * t); id.data[i + 3] = 255;
      const h = Math.round(255 * clamp(.5 + ring * .1 + (streak - .5) * .15, 0, 1)); bi.data[i] = bi.data[i + 1] = bi.data[i + 2] = h; bi.data[i + 3] = 255;
    }
    cv.getContext('2d').putImageData(id, 0, 0); bc.getContext('2d').putImageData(bi, 0, 0); return { cv, bc };
  };
  const TEX = {};
  const tex = {
    wood: (key = 'oak') => TEX['w' + key] || (TEX['w' + key] = (() => { const n = 512, d = woodData(n, key === 'walnut' ? 41 : 17, key === 'walnut' ? [236, 220, 205] : [236, 216, 184], key === 'walnut' ? 6 : 5); return { map: mkTex(d.cv), bump: mkTex(d.bc, 1, 1, false) }; })()),
    mdf: () => TEX.mdf || (TEX.mdf = (() => { const n = 256, cv = mkCv(n, n), g = cv.getContext('2d'), id = g.createImageData(n, n); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const t = .9 + (fbm(x / 8, y / 8, 32, 32, 3, 2) - .5) * .16 + (hash(x, y, 5) - .5) * .09, i = (y * n + x) * 4; id.data[i] = 214 * t; id.data[i + 1] = 178 * t; id.data[i + 2] = 128 * t; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); return { map: mkTex(cv, 1, 1), bump: mkTex(cv, 1, 1, false) }; })()),
    parquet: () => TEX.parquet || (TEX.parquet = (() => {
      const w = tex.wood('oak'), src = w.map.image, sb = w.bump.image, N = 1024, cv = mkCv(N, N), bc = mkCv(N, N), g = cv.getContext('2d'), bg = bc.getContext('2d'), r = rngMk(5); bg.fillStyle = '#808080'; bg.fillRect(0, 0, N, N); g.fillStyle = '#3a2a1a'; g.fillRect(0, 0, N, N);
      const pw = 128, pl = 512; const tints = ['rgba(120,70,30,.25)', 'rgba(150,100,50,.2)', 'rgba(90,50,20,.3)', 'rgba(180,130,70,.15)'];
      for (let x = 0; x < N; x += pw) for (let k = 0; k < 2; k++) { const y0 = ((x / pw) % 2 ? 256 : 0) + k * pl, sy = (r() * 384) | 0, flip = r() > .5 ? -1 : 1, tint = tints[(r() * 4) | 0];
        for (const yy of [y0, y0 - N]) { const draw = (ctx, im, fill) => { ctx.save(); ctx.beginPath(); ctx.rect(x + 1.5, yy + 1.5, pw - 3, pl - 3); ctx.clip(); ctx.translate(x + pw / 2, yy + pl / 2); ctx.rotate(Math.PI / 2); ctx.scale(flip, 1); ctx.drawImage(im, 0, sy, 512, 128, -pl / 2, -pw / 2, pl, pw); ctx.restore(); if (fill) { ctx.fillStyle = tint; ctx.fillRect(x + 1.5, yy + 1.5, pw - 3, pl - 3); } }; draw(g, src, true); draw(bg, sb, false); } }
      return { map: mkTex(cv, 1, 1), bump: mkTex(bc, 1, 1, false) };
    })()),
    concrete: () => TEX.concrete || (TEX.concrete = (() => { const n = 512, cv = mkCv(n, n), bc = mkCv(n, n), id = cv.getContext('2d').createImageData(n, n), bi = bc.getContext('2d').createImageData(n, n); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const a = fbm(x / 64, y / 64, 8, 8, 2, 4), b = hash(x, y, 9), t = .7 + (a - .5) * .5 + (b - .5) * .06, i = (y * n + x) * 4; id.data[i] = 150 * t; id.data[i + 1] = 148 * t; id.data[i + 2] = 144 * t; id.data[i + 3] = 255; const h = 128 + (a - .5) * 150 + (b - .5) * 50; bi.data[i] = bi.data[i + 1] = bi.data[i + 2] = h; bi.data[i + 3] = 255; } const g = cv.getContext('2d'); g.putImageData(id, 0, 0); cv.getContext('2d').strokeStyle = 'rgba(30,30,30,.55)'; cv.getContext('2d').lineWidth = 2; cv.getContext('2d').strokeRect(0, 0, n, n); bc.getContext('2d').putImageData(bi, 0, 0); bc.getContext('2d').strokeStyle = '#000'; bc.getContext('2d').lineWidth = 3; bc.getContext('2d').strokeRect(0, 0, n, n); return { map: mkTex(cv, 1, 1), bump: mkTex(bc, 1, 1, false) }; })()),
    plaster: () => TEX.plaster || (TEX.plaster = (() => { const n = 256, cv = mkCv(n, n), bc = mkCv(n, n), id = cv.getContext('2d').createImageData(n, n), bi = bc.getContext('2d').createImageData(n, n); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const a = fbm(x / 20, y / 20, 13, 13, 6, 3), b = hash(x, y, 4), t = .94 + (a - .5) * .1 + (b - .5) * .03, i = (y * n + x) * 4; id.data[i] = 238 * t; id.data[i + 1] = 231 * t; id.data[i + 2] = 218 * t; id.data[i + 3] = 255; const h = 128 + (a - .5) * 90 + (b - .5) * 60; bi.data[i] = bi.data[i + 1] = bi.data[i + 2] = h; bi.data[i + 3] = 255; } cv.getContext('2d').putImageData(id, 0, 0); bc.getContext('2d').putImageData(bi, 0, 0); return { map: mkTex(cv, 1, 1), bump: mkTex(bc, 1, 1, false) }; })()),
    fabric: () => TEX.fabric || (TEX.fabric = (() => { const n = 128, bc = mkCv(n, n), bi = bc.getContext('2d').createImageData(n, n); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const w = ((x % 4 < 2) ^ (y % 4 < 2)) ? 150 : 100, i = (y * n + x) * 4; bi.data[i] = bi.data[i + 1] = bi.data[i + 2] = w + hash(x, y, 2) * 40; bi.data[i + 3] = 255; } bc.getContext('2d').putImageData(bi, 0, 0); return mkTex(bc, 6, 6, false); })()),
    hazard: () => TEX.hazard || (TEX.hazard = (() => { const cv = mkCv(128, 128), g = cv.getContext('2d'); g.fillStyle = '#e8b520'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#1b1d20'; for (let i = -2; i < 6; i++) { g.beginPath(); g.moveTo(i * 32, 128); g.lineTo(i * 32 + 16, 128); g.lineTo(i * 32 + 144, 0); g.lineTo(i * 32 + 128, 0); g.fill(); } return mkTex(cv, 4, 1); })()),
    blob: () => TEX.blob || (TEX.blob = (() => { const cv = mkCv(64, 64), g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(.6, 'rgba(0,0,0,.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return mkTex(cv, 1, 1, false); })())
  };
  const withTex = (t, rx, ry) => { const m = t.map.clone(), b = t.bump.clone(); m.needsUpdate = b.needsUpdate = true; m.repeat.set(rx, ry); b.repeat.set(rx, ry); return { map: m, bump: b }; };
  // yog‘och materiali (tola x bo‘ylab): rangi, g‘adir-budirlik, lak
  const woodMat = (kind, color, rough, rx = 1, ry = 1, extra) => { const t = tex.wood(kind); const m = new T.MeshPhysicalMaterial(Object.assign({ color, roughness: rough, map: t.map, bumpMap: t.bump, bumpScale: 0.14, envMapIntensity: .8 }, extra || {})); return m; };
  const blob = (parent, w, d, op = 1) => { const m = new T.Mesh(GEO.blobG || (GEO.blobG = new T.PlaneGeometry(1, 1)), M(0x000000, 1, 0, { map: tex.blob(), transparent: true, depthWrite: false, opacity: op, polygonOffset: true, polygonOffsetFactor: -2 })); m.rotation.x = -Math.PI / 2; m.scale.set(w, d, 1); m.position.y = .006; m.renderOrder = 1; parent.add(m); return m; };

  /* ---------- 4. Odamlar: skelet (bel, yelka, tirsak, tizza), kiyim, himoya vositalari, IK ---------- */
  const DOWN = V(0, -1, 0), L1 = .29, L2 = .31;
  function person(o) {
    const g = new T.Group(), sg = LOW ? 8 : 14;
    const skin = M(o.skin || 0xd9a982, .55, 0, { envMapIntensity: .35 }), shirt = M(o.shirt || 0x2b3a55, .9, 0, { bumpMap: tex.fabric(), bumpScale: 0.012 }), pants = M(o.pants || 0x23262e, .9, 0, { bumpMap: tex.fabric(), bumpScale: 0.012 }), boot = M(0x2a211b, .55, 0, { envMapIntensity: .7 }), glove = M(o.glove || o.skin || 0xd9a982, o.glove ? .85 : .55);
    const hips = grp(g, 0, .92, 0), torso = grp(hips, 0, 0, 0);
    // tana
    const lathe = (pts, n) => { const k = 'lathe' + pts.join(); return GEO[k] || (GEO[k] = new T.LatheGeometry(pts.map(p => new T.Vector2(p[0], p[1])), n)); };
    add(hips, lathe([[.001, -.17], [.08, -.16], [.135, -.1], [.15, -.03], [.145, .06], [.001, .075]], sg + 4), pants, 0, 0, 0).scale.set(1.12, 1, .8);
    add(torso, lathe([[.001, -.03], [.125, -.02], [.138, .08], [.132, .2], [.15, .36], [.172, .5], [.165, .58], [.1, .65], [.05, .685], [.001, .69]], sg + 4), shirt, 0, 0, 0).scale.set(1.18, 1, .76);
    if (o.inner) { const im = M(o.inner, .7), tri = (pts, mat, z) => { const sh = new T.Shape(); pts.forEach((q, i) => i ? sh.lineTo(q[0], q[1]) : sh.moveTo(q[0], q[1])); const m = new T.Mesh(new T.ShapeGeometry(sh), mat); m.position.z = z; torso.add(m); return m; }; im.side = T.DoubleSide; if (o.innerWide) tri([[-.075, .66], [.075, .66], [.07, .12], [-.07, .12]], im, .127); else tri([[-.06, .655], [.06, .655], [0, .43]], im, .128); [-1, 1].forEach(sd => { const cl = box(torso, .05, .03, .02, im, sd * .035, .665, .1, false); cl.rotation.z = -sd * .5; }); if (o.tie) tri([[-.014, .6], [.014, .6], [.024, .4], [0, .36], [-.024, .4]], M(o.tie, .5), .131); }
    add(torso, new T.CylinderGeometry(.052, .06, .1, 10), skin, 0, .66, 0, false);
    if (o.vest) { // yorqin jilet + yorug‘lik qaytaruvchi chiziqlar
      const vm = M(o.vest, .75, 0, { bumpMap: tex.fabric(), bumpScale: 0.05, side: T.DoubleSide }), rf = M(0xe4e8ea, .35, .2, { emissive: 0x555a5c, emissiveIntensity: .35 }), cg = (r, h, a, l) => new T.CylinderGeometry(r, r, h, 20, 1, true, a, l);
      const v1 = add(torso, cg(1, .5, 0, Math.PI * 2), vm, 0, .34, 0, false); v1.scale.set(.205, 1, .138);
      [.2, .42].forEach(y => { const b = add(torso, cg(1, .045, 0, Math.PI * 2), rf, 0, y, 0, false); b.scale.set(.209, 1, .142); });
      [-.55, .55, Math.PI - .55, Math.PI + .55].forEach(an => { const s2 = add(torso, cg(1, .5, an - .08, .16), rf, 0, .34, 0, false); s2.scale.set(.209, 1, .142); });
    }
    if (o.strips) { // yorug‘lik qaytaruvchi chiziq va cho‘ntak qopqoqlari (ish kiyimi)
      const rf2 = M(0xb9bec4, .35, .25, { emissive: 0x3c4046, emissiveIntensity: .3 }), band = add(torso, new T.CylinderGeometry(1, 1, .04, 20, 1, true, -1.15, 2.3), rf2, 0, .43, 0, false); band.scale.set(.1925, 1, .1255); band.material = rf2;
      [-1, 1].forEach(sd => { rb(torso, .095, .075, .014, shirt, sd * .075, .36, .113, .005, false); box(torso, .095, .012, .016, M(0x0f1624, .7), sd * .075, .393, .116, false); box(torso, .012, .012, .016, M(0xc9c2b4, .35, .7), sd * .075, .335, .118, false); });
    }
    if (o.belt) { const bt = add(torso, new T.CylinderGeometry(1, 1, .04, 20, 1, true), M(o.belt, .55), 0, .04, 0, false); bt.scale.set(.145 * 1.18 + .004, 1, .145 * .76 + .004); bt.material = M(o.belt, .55, 0, { side: T.DoubleSide }); box(torso, .035, .03, .01, M(0xc8c2b8, .3, .9), 0, .04, .112, false); }
    // bosh
    const head = grp(torso, 0, .72, 0), hd = add(head, new T.SphereGeometry(.1, sg + 4, sg), skin, 0, .1, 0); hd.scale.set(.88, 1.12, .98);
    const jaw = add(head, new T.SphereGeometry(.08, sg, 10), skin, 0, .035, .018, false); jaw.scale.set(1.0, .75, .92);
    add(head, new T.ConeGeometry(.02, .045, 6), skin, 0, .085, .105, false).rotation.x = Math.PI / 2 - .25;
    const eyeW = M(0xf4f1ea, .3), eyeD = M(o.iris || 0x3a2a1e, .2), hairM = M(o.hair || 0x2a1d14, .85), lipM = M(o.lip || 0xb3615a, .45), pupM = M(0x0c0a08, .2);
    [-1, 1].forEach(s => {
      add(head, new T.SphereGeometry(.014, 8, 6), eyeW, s * .036, .115, .088, false).scale.set(1.3, .95, .6); add(head, new T.SphereGeometry(.007, 6, 6), eyeD, s * .036, .115, .0975, false).scale.setScalar(1.25); add(head, new T.SphereGeometry(.0035, 5, 5), pupM, s * .036, .115, .1015, false).scale.setScalar(1.3); add(head, new T.SphereGeometry(.0018, 4, 4), M(0xffffff, .1, 0, { emissive: 0xffffff, emissiveIntensity: .8 }), s * .036 + .004, .12, .1035, false);
      const lid = add(head, new T.SphereGeometry(.0165, 8, 6, 0, Math.PI * 2, 0, Math.PI * .42), skin, s * .036, .1155, .0885, false); lid.scale.set(1, .8, .7); lid.rotation.x = .25;
      const br = box(head, .042, .0085, .012, hairM, s * .037, .139, .092, false); br.rotation.z = -s * .12; br.rotation.y = -s * .25;
      const ear = add(head, new T.SphereGeometry(.02, 8, 6), skin, s * .088, .095, -.005, false); ear.scale.set(.5, 1, .8); add(head, new T.SphereGeometry(.011, 6, 6), skin, s * .062, .06, .075, false);
    });
    const nb = add(head, capGeo(.007, .03, 5), skin, 0, .104, .1, false); nb.rotation.x = -.1; add(head, new T.SphereGeometry(.013, 8, 6), skin, 0, .082, .109, false).scale.set(1.2, .8, 1);
    const ul = add(head, new T.SphereGeometry(.016, 8, 6), lipM, 0, .054, .1, false); ul.scale.set(1.6, .38, .6); const ll = add(head, new T.SphereGeometry(.0165, 8, 6), lipM, 0, .044, .099, false); ll.scale.set(1.45, .42, .6);
    if (!o.hat || o.showHair) { const hm = M(o.hair || 0x2a1d14, .8), h2 = add(head, new T.SphereGeometry(.106, sg + 2, 10, 0, Math.PI * 2, 0, Math.PI * .52), hm, 0, .105, -.006, false); h2.scale.set(.9, 1.08, 1.0); }
    if (o.hairLong) { const hm2 = M(o.hair || 0x2a1d14, .55, 0, { envMapIntensity: .8 }), bk = add(head, new T.SphereGeometry(.112, 12, 10), hm2, 0, -.02, -.04, false); bk.scale.set(.98, 2.0, .88); [-1, 1].forEach(sd => { for (let k = 0; k < 4; k++) { const lk = add(head, new T.SphereGeometry(.04, 8, 8), hm2, sd * (.088 + (k % 2) * .008), .04 - k * .09, .005 - k * .004, false); lk.scale.set(.7, 1.9, .8); } const fr = add(head, new T.SphereGeometry(.06, 8, 8), hm2, sd * .03, .17, .06, false); fr.scale.set(1.1, .6, .6); fr.rotation.z = sd * .5; }); }
    if (o.quiff) { const hm3 = M(o.hair || 0x2a1d14, .6), q = add(head, new T.SphereGeometry(.07, 10, 8), hm3, 0, .205, .045, false); q.scale.set(1.4, .75, 1.1); q.rotation.x = -.3; const q2 = add(head, new T.SphereGeometry(.05, 8, 8), hm3, .045, .17, .075, false); q2.scale.set(1.3, .6, .6); }
    if (o.beard) { const bd = add(head, new T.SphereGeometry(.088, 12, 8, 0, Math.PI * 2, Math.PI * .45, Math.PI * .45), M(o.hair || 0x2a1d14, .9), 0, .055, .018, false); bd.scale.set(1.02, .92, .98); }
    if (o.hat) { // himoya kaskasi
      const hm = M(o.hat, .28, 0, { envMapIntensity: 1.2 }), dome = add(head, new T.SphereGeometry(.118, sg + 4, 10, 0, Math.PI * 2, 0, Math.PI * .5), hm, 0, .13, -.004); dome.scale.set(.95, .95, 1.1);
      cyl(head, .124, .13, .016, hm, 0, .128, 0, 20, false).scale.set(.95, 1, 1.12); box(head, .17, .012, .075, hm, 0, .126, .125, false).rotation.x = .1; box(head, .026, .02, .21, hm, 0, .248, -.003, false);
      [-1, 1].forEach(s => box(head, .006, .022, .12, M(0xffffff, .4), s * .035, .242, -.003, false));
    }
    if (o.glasses) { const gm = GL(0xcfe3f0, .35), fr = M(0x20262c, .4); box(head, .15, .034, .006, gm, 0, .115, .104, false); box(head, .154, .004, .008, fr, 0, .133, .104, false); [-1, 1].forEach(s => box(head, .004, .008, .1, fr, s * .078, .118, .055, false)); }
    if (o.ears) { const em = M(0xd23b2b, .5); [-1, 1].forEach(s => { const e = add(head, new T.SphereGeometry(.04, 10, 8), em, s * .1, .1, 0, false); e.scale.set(.6, 1, 1); }); add(head, new T.TorusGeometry(.105, .008, 6, 16, Math.PI), M(0x20262c, .5), 0, .115, 0, false); }
    if (o.mask) { const mk2 = add(head, new T.SphereGeometry(.066, 12, 8, 0, Math.PI * 2, Math.PI * .45, Math.PI * .35), M(0xf2f2f0, .8), 0, .06, .03, false); mk2.scale.set(1.1, 1, 1.15); }
    // qo‘llar: yelka → tirsak → bilak → kaft
    const mkArm = side => {
      const a = grp(torso, side * .235, .57, 0), sleeve = (o.short || o.rolled) ? skin : shirt;
      add(a, new T.SphereGeometry(.058, 10, 8), shirt, 0, 0, 0, false); add(a, new T.CylinderGeometry(.053, .044, L1 - .02, sg), shirt, 0, -L1 / 2, 0);
      const el = grp(a, 0, -L1, 0); add(el, new T.SphereGeometry(.046, 8, 6), sleeve, 0, 0, 0, false); add(el, new T.CylinderGeometry(.043, .033, L2 - .09, sg), sleeve, 0, -(L2 - .09) / 2 - .01, 0); if (o.rolled) add(el, new T.CylinderGeometry(.05, .048, .075, sg), M(o.cuff || 0x9aa0a8, .7), 0, -.055, 0, false); else add(el, new T.CylinderGeometry(.036, .036, .03, sg), shirt, 0, -L2 + .1, 0, false);
      const hd2 = grp(el, 0, -L2 + .03, 0); rb(hd2, .078, .09, .03, glove, 0, -.045, 0, .012);
      for (let f = 0; f < 4; f++) { const fg = add(hd2, capGeo(.0105, .048 - Math.abs(f - 1.5) * .004, 5), glove, -.027 + f * .018, -.115, .008, false); fg.rotation.x = -.28; }
      const th = add(hd2, capGeo(.013, .04, 6), glove, -side * .046, -.06, .016, false); th.rotation.z = side * .55; th.rotation.x = -.3;
      return { a, el, hd2 };
    };
    const aL = mkArm(-1), aR = mkArm(1);
    // oyoqlar: son → tizza → boldir → poyabzal
    const mkLeg = side => {
      const l = grp(hips, side * .095, 0, 0); add(l, new T.CylinderGeometry(.086, .064, .43, sg), pants, 0, -.215, 0); const kn = grp(l, 0, -.43, 0); add(kn, new T.SphereGeometry(.064, 8, 6), pants, 0, 0, 0, false); add(kn, new T.CylinderGeometry(.06, .044, .43, sg), pants, 0, -.225, 0);
      const ank = grp(kn, 0, -.45, 0); rb(ank, .1, .085, .27, boot, 0, .0, .055, .03); rb(ank, .108, .026, .285, M(0x16120f, .85), 0, -.034, .055, .01); box(ank, .09, .04, .06, M(0x9aa2a8, .35, .8), 0, .0, .15, false); return { l, kn, ank };
    };
    const lL = mkLeg(-1), lR = mkLeg(1);
    blob(g, .75, .55, .85);
    const P = { g, hips, torso, head, armL: aL.a, armR: aR.a, elL: aL.el, elR: aR.el, hdL: aL.hd2, hdR: aR.hd2, legL: lL.l, legR: lR.l, knL: lL.kn, knR: lR.kn, ankL: lL.ank, ankR: lR.ank, ik: [false, false], k: 0, ph: 0, lp: null, yaw: 0, face: null, sit: false, lean: 0, kind: o.kind || '' };
    g.userData = P; g.scale.setScalar(o.s || 1); return P;
  }
  const _a = V(0, 0, 0), _b = V(0, 0, 0), _q = new T.Quaternion();
  // 2 bo‘g‘inli qo‘l IK: world nuqtaga qo‘l kaftini yetkazadi; tirsak pastga-tashqariga qaraydi
  const reach = (P, side, target, bias) => {
    const arm = side < 0 ? P.armL : P.armR, el = side < 0 ? P.elL : P.elR; P.ik[side < 0 ? 0 : 1] = true;
    const sh = arm.position, tl = P.torso.worldToLocal(_a.copy(target)), d = _b.copy(tl).sub(sh); let dist = d.length(); const u = d.clone().divideScalar(dist || 1); dist = clamp(dist, .1, L1 + L2 - .004);
    const a = (L1 * L1 - L2 * L2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    const pole = (bias || V(side * .7, -.6, -.5)).clone().normalize(); const perp = pole.sub(u.clone().multiplyScalar(pole.dot(u))).normalize();
    const elb = sh.clone().addScaledVector(u, a).addScaledVector(perp, h), tip = sh.clone().addScaledVector(u, dist);
    arm.quaternion.setFromUnitVectors(DOWN, elb.clone().sub(sh).divideScalar(L1));
    const f = tip.sub(elb).divideScalar(L2).applyQuaternion(_q.copy(arm.quaternion).invert()); el.quaternion.setFromUnitVectors(DOWN, f.normalize());
  };
  const handPos = (P, side, out) => (side < 0 ? P.hdL : P.hdR).localToWorld(out.set(0, -.07, 0));
  const idle = (P, t, ph = 0) => { const b = Math.sin(t * 1.3 + ph); P.armL.rotation.set(b * .03, 0, -.07); P.armR.rotation.set(-b * .03, 0, .07); P.legL.rotation.set(0, 0, 0); P.legR.rotation.set(0, 0, 0); P.knL.rotation.x = P.knR.rotation.x = 0; P.torso.rotation.set(P.lean || 0, b * .02, 0); P.head.rotation.set(b * .015 - (P.lean || 0) * .6, 0, 0); P.hips.rotation.z = 0; };
  // yurish: bosib o‘tilgan masofadan faza (oyoq sirpanmaydi), k — yurish kuchi
  const gait = (P, k) => {
    const s = Math.sin(P.ph), s2 = Math.sin(P.ph + Math.PI), c = Math.cos(P.ph), c2 = Math.cos(P.ph + Math.PI);
    P.legL.rotation.x = s * .5 * k; P.legR.rotation.x = s2 * .5 * k; P.knL.rotation.x = (.06 + .62 * Math.max(0, c)) * k; P.knR.rotation.x = (.06 + .62 * Math.max(0, c2)) * k;
    P.armL.rotation.set(s2 * .45 * k, 0, -.07); P.armR.rotation.set(s * .45 * k, 0, .07); P.torso.rotation.set(P.lean + .04 * k, -s * .1 * k, 0); P.hips.rotation.y = s * .1 * k; P.head.rotation.set(-.02, s * .05 * k, 0); P.hips.rotation.z = Math.sin(P.ph) * .025 * k;
  };
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  let PDIR = 1;
  const walker = (P, dt, t, ph0) => { // harakat bo‘yicha faza + yo‘nalish (faqat dunyo koordinatasi o‘zgarsa yuradi)
    const cur = P.g.position; if (!P.lp) { P.lp = cur.clone(); P.yaw = P.g.rotation.y; }
    const dx = cur.x - P.lp.x, dz = cur.z - P.lp.z, d = Math.hypot(dx, dz); P.lp.copy(cur);
    if (d > 1e-5 && d < 3) { P.ph += d / 1.5 * Math.PI * 2; P.k += (1 - P.k) * Math.min(1, dt * 9); if (P.face == null) P.yaw += wrap(Math.atan2(dx * (P.realDir ? 1 : PDIR), dz * (P.realDir ? 1 : PDIR)) - P.yaw) * Math.min(1, dt * 7); } else P.k += (0 - P.k) * Math.min(1, dt * 7);
    if (P.face != null) P.yaw += wrap(P.face - P.yaw) * Math.min(1, dt * 7);
    P.g.rotation.y = P.yaw; idle(P, t, ph0 || 0); if (P.k > .01) gait(P, P.k); ground(P);
  };
  // oyoq-polga mosligi: eng pastki oyoq poldan o‘tmaydi va havoda turmaydi
  const ground = P => { // oyoq kafti yerga yotadi (to‘piq tekislanadi); eng pastki nuqta (barmoq yoki tovon) poldan o‘tmaydi va havoda turmaydi
    if (P.sit) return;
    const lowest = (leg, kn, ank) => { const a = leg.rotation.x, k = kn.rotation.x; ank.rotation.x = -(a + k) * .9; const f = a + k + ank.rotation.x; return .43 * Math.cos(a) + .45 * Math.cos(a + k) + .047 * Math.cos(f) + Math.max(.19 * Math.sin(f), -.085 * Math.sin(f)); };
    P.hips.position.y = Math.max(lowest(P.legL, P.knL, P.ankL), lowest(P.legR, P.knR, P.ankR));
  };
  const crouch = (P, c) => { P.legL.rotation.x = P.legR.rotation.x = -.85 * c; P.knL.rotation.x = P.knR.rotation.x = 1.7 * c; P.torso.rotation.x += .35 * c; ground(P); };
  // tirsaklar yumshoq buklanadi (IK bo‘lmagan qo‘llar)
  const settle = P => {
    [[P.armL, P.elL, 0], [P.armR, P.elR, 1]].forEach(([a, e, i]) => { if (!P.ik[i]) e.quaternion.setFromEuler(_e.set(-(.16 + clamp(-a.rotation.x, 0, 1.7) * .55), 0, 0)); });
    P.ik[0] = P.ik[1] = false;
  };
  const _e = new T.Euler();

  /* ---------- 5. Xona (uy ichi) ---------- */
  function room(parent, x0, withShell) {
    const R = grp(parent, x0, 0, 0), pl = withTex(tex.plaster(), 3, 2), wall = M(0xefe9de, .92, 0, { map: pl.map, bumpMap: pl.bump, bumpScale: 0.025 }), wallB = M(0xe6dfd0, .92, 0, { map: pl.map, bumpMap: pl.bump, bumpScale: 0.025 });
    const pq = withTex(tex.parquet(), 8, 7.5), floorM = M(0xffffff, .42, 0, { map: pq.map, bumpMap: pq.bump, bumpScale: 0.11, envMapIntensity: .9 });
    const floor = add(R, new T.PlaneGeometry(9.6, 9, 1, 1), floorM, 0, 0, .8, false); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = SHADOWS;
    const trim = M(0xf5f1e8, .5), brass = M(0xc8a86a, .3, .9), dk = M(0x23262b, .5, .2);
    // orqa devor: eshik oralig‘i (0.9 × 2.05) + devor, plintus, korniz
    box(R, 3.8, 3.1, .2, wallB, -2.45, 1.55, -3.6); box(R, 3.8, 3.1, .2, wallB, 2.45, 1.55, -3.6); box(R, .9, 1.05, .2, wallB, 0, 2.575, -3.6);
    box(R, .2, 3.1, 8.6, wall, -4.7, 1.55, .5); box(R, .2, 3.1, 8.6, wall, 4.7, 1.55, .5);
    box(R, 3.8, .14, .05, trim, -2.45, .07, -3.47, false); box(R, 3.8, .14, .05, trim, 2.45, .07, -3.47, false); box(R, .05, .14, 8.6, trim, -4.58, .07, .5, false); box(R, .05, .14, 8.6, trim, 4.58, .07, .5, false);
    box(R, 9.4, .1, .09, trim, 0, 3.02, -3.46, false); box(R, .09, .1, 8.4, trim, -4.6, 3.02, .5, false); box(R, .09, .1, 8.4, trim, 4.6, 3.02, .5, false);
    // katta oyna (o‘ng devor): romlar, shtorka
    const win = grp(R, 4.58, 1.7, .6); box(win, .05, 1.9, 2.5, GL(0xbcdcf8, .35), 0, 0, 0, false); box(win, .05, 1.9, 2.5, M(0x111111, .6, 0, { emissive: 0xcfe6ff, emissiveIntensity: .55, transparent: true, opacity: .55 }), .02, 0, 0, false);
    [[0, .97, 2.6, .1], [0, -.97, 2.6, .1]].forEach(a => box(win, .12, a[3], a[2], dk, 0, a[1], 0, false)); [-1.28, 0, 1.28].forEach(z => box(win, .12, 2.0, .07, dk, 0, 0, z, false)); box(win, .1, .05, 2.5, dk, -.02, .1, 0, false);
    const curt = M(0xd6cdbd, .95, 0, { bumpMap: tex.fabric(), bumpScale: 0.08, side: T.DoubleSide }); [-1.55, 1.55].forEach(z => { for (let k = 0; k < 5; k++) box(win, .06, 2.2, .14, curt, -.15, .02, z + (z > 0 ? .06 : -.06) * k + (z > 0 ? -.2 : .2), false); });
    cyl(win, .015, .015, 3.6, brass, -.18, 1.1, 0, 8, false).rotation.x = Math.PI / 2;
    // mebel: divan (yostiqlar), kofe stoli, gilam, kitob javoni, o‘simlik, torsher, rasmlar
    const sofaM = M(0x6b7380, .95, 0, { bumpMap: tex.fabric(), bumpScale: 0.1 }), sofaD = M(0x5b626e, .95, 0, { bumpMap: tex.fabric(), bumpScale: 0.1 });
    const sofa = grp(R, -3.0, 0, 1.4); sofa.rotation.y = Math.PI / 2; rb(sofa, 2.3, .22, 1.0, dk, 0, .13, 0, .02); [-.55, .55].forEach(x => rb(sofa, 1.08, .24, .84, sofaM, x, .36, .05, .08)); rb(sofa, 2.3, .52, .24, sofaD, 0, .72, -.4, .09); [-.55, .55].forEach(x => { const b = rb(sofa, 1.04, .46, .2, sofaM, x, .75, -.28, .08); b.rotation.x = -.14; }); [-1.12, 1.12].forEach(x => rb(sofa, .2, .52, 1.0, sofaD, x, .46, 0, .08)); [-.8, .75].forEach((x, i) => { const p = rb(sofa, .42, .4, .12, i ? M(0xc9a574, .9, 0, { bumpMap: tex.fabric() }) : M(0xa8564a, .9, 0, { bumpMap: tex.fabric() }), x, .62, -.12, .05); p.rotation.set(-.2, i ? .3 : -.2, .1); });
    box(R, 3.6, .02, 2.6, M(0xd5ccb9, 1, 0, { bumpMap: tex.fabric(), bumpScale: 0.15 }), -.6, .012, 1.8, false); box(R, 3.3, .021, .06, M(0x8d7a5a, 1), -.6, .013, 3.05, false); box(R, 3.3, .021, .06, M(0x8d7a5a, 1), -.6, .013, .55, false);
    const tbl = grp(R, -1.5, 0, 1.9); rb(tbl, 1.1, .04, .7, woodMat('walnut', 0x6b4a33, .35, 1, 1, { clearcoat: .6, clearcoatRoughness: .2 }), 0, .4, 0, .01); [[-.5, -.3], [.5, -.3], [-.5, .3], [.5, .3]].forEach(([x, z]) => cyl(tbl, .022, .016, .38, brass, x, .19, z, 8, false)); cyl(tbl, .09, .06, .2, M(0xdcd6c9, .35, 0, { envMapIntensity: 1 }), .2, .52, .05, 14); cyl(tbl, .02, .02, .3, M(0x3d7a47, .8), .2, .78, .05, 6, false); box(tbl, .3, .03, .22, M(0xb8473a, .7), -.25, .44, -.05); box(tbl, .26, .025, .2, M(0x2b3a55, .7), -.24, .47, -.05);
    const shelf = grp(R, 3.3, 0, -3.35), shW = M(0xb48f5e, .55, 0, { envMapIntensity: .5 }); box(shelf, 2.2, 2.2, .03, shW, 0, 1.1, -.135); [-1.09, 1.09].forEach(x => box(shelf, .04, 2.2, .3, shW, x, 1.1, 0)); for (let s = 0; s < 6; s++) box(shelf, 2.14, .035, .3, shW, 0, .02 + s * .436, 0, false); const rr = rngMk(7); for (let s = 0; s < 5; s++) { let bx = -1.0; while (bx < .95) { const w = .03 + rr() * .05, h = .22 + rr() * .14; if (rr() > .18) box(shelf, w, h, .2, M([0x8a3b2e, 0x2f4f6f, 0xc9b27a, 0x3d6a55, 0xe3ddd0, 0x5a4a3a][(rr() * 6) | 0], .8), bx + w / 2, .04 + s * .436 + h / 2 + .02, -.02, false); bx += w + .004; } }
    const plant = grp(R, 3.9, 0, -2.6); cyl(plant, .24, .17, .4, M(0xe1dbcf, .45, 0, { envMapIntensity: .8 }), 0, .2, 0, 18); cyl(plant, .23, .23, .03, M(0x3a2c20, 1), 0, .39, 0, 14, false); for (let i = 0; i < 12; i++) { const a = i * 2.4, l = add(plant, new T.SphereGeometry(.12, 8, 6), M(i % 3 ? 0x3f7d4c : 0x4f9158, .55, 0, { side: T.DoubleSide, envMapIntensity: .6 }), Math.cos(a) * .18, .75 + (i % 4) * .18, Math.sin(a) * .18); l.scale.set(.35, 1.2, .08 + (i % 3) * .02); l.rotation.set(Math.sin(a) * .5, a, Math.cos(a) * .5); cyl(plant, .006, .006, .5 + (i % 4) * .16, M(0x35603c, .8), Math.cos(a) * .09, .62 + (i % 4) * .08, Math.sin(a) * .09, 5, false).rotation.set(Math.sin(a) * .35, 0, -Math.cos(a) * .35); }
    const lamp = grp(R, -3.9, 0, -2.7); cyl(lamp, .16, .16, .03, dk, 0, .015, 0, 16, false); cyl(lamp, .012, .012, 1.55, brass, 0, .8, 0, 8, false); add(lamp, new T.CylinderGeometry(.17, .23, .3, 20, 1, true), M(0xf3e6c8, .9, 0, { emissive: 0xffd9a0, emissiveIntensity: .6, side: T.DoubleSide }), 0, 1.7, 0, false); add(lamp, new T.SphereGeometry(.07, 10, 8), M(0xfff6e0, .3, 0, { emissive: 0xffe2b0, emissiveIntensity: 1.5 }), 0, 1.68, 0, false);
    const fr = (w, h, x, y, art) => { box(R, w + .08, h + .08, .035, M(0x1c1f23, .4, .2), x, y, -3.46, false); box(R, w, h, .02, art, x, y, -3.44, false); };
    fr(1.0, .7, -2.4, 1.85, M(0xd9c9a8, .85)); fr(.6, .42, -2.4, 1.85, M(0x7b9486, .8)); fr(.7, .9, 2.0, 1.75, M(0xc7a07a, .85)); fr(.3, .5, 2.0, 1.75, M(0x2f3e4e, .8));
    // pendant chiroq (shift yo‘q — havoda osilgan, pastdan ko‘rinadi)
    // oralig‘ orqasi (yo‘lak): iliq yorug‘lik
    const hall = grp(R, 0, 0, -3.6); box(hall, 3.2, 3.0, .1, M(0xf6e0b8, .9, 0, { emissive: 0xffd9a3, emissiveIntensity: .8 }), 0, 1.5, -2.6, false);
    box(hall, .1, 3, 2.6, M(0xdcc9a6, .9), -1.6, 1.5, -1.3); box(hall, .1, 3, 2.6, M(0xdcc9a6, .9), 1.6, 1.5, -1.3);
    const hf = add(hall, new T.PlaneGeometry(3.2, 2.6), floorM, 0, .005, -1.3, false); hf.rotation.x = -Math.PI / 2;
    const hl = new T.PointLight(0xffd9a0, .7, 7); hl.position.set(0, 2.2, -1.2); hall.add(hl);
    const jm = M(0xf3efe6, .45);
    box(R, .07, 2.06, .26, jm, -.465, 1.03, -3.6, false); box(R, .07, 2.06, .26, jm, .465, 1.03, -3.6, false); box(R, 1.0, .07, .26, jm, 0, 2.085, -3.6, false); box(R, .96, .012, .26, M(0xb8b3a8, .4, .9), 0, .006, -3.6, false); // ostona
    const out = { R, floor, opening: V(x0, 0, -3.6) };
    if (withShell) { // tashqaridan ko‘rinadigan uy: qanotlar, tom, kirish zinapoyasi, ayvon
      const sh2 = M(0xdcd5c8, .9, 0, { map: pl.map, bumpMap: pl.bump, bumpScale: 0.03 }), stone = M(0xcfc9bd, .9, 0, { map: withTex(tex.concrete(), 2, 1).map });
      box(R, 9.6, .4, 9.6, stone, 0, -.26, 1.2, false);
      rb(R, 13, .38, 11.6, M(0xe4dfd4, .8), 0, 3.3, .6, .05); rb(R, 13.2, .08, 11.8, M(0xe3ddd0, .7), 0, 3.52, .6, .02); box(R, 13, .5, .1, trim, 0, 3.0, 6.3, false);
      box(R, 6, 3.4, 5, sh2, -9.2, 1.7, -2.5); box(R, 6, 3.4, 5, sh2, 9.2, 1.7, -2.5);
      [-9.2, 9.2].forEach(x => { box(R, 2.9, 1.7, .1, dk, x, 1.9, .06, false); box(R, 2.7, 1.5, .06, GL(0x9fc0dc, .55), x, 1.9, .1, false); box(R, .06, 1.5, .08, dk, x, 1.9, .12, false); box(R, 2.7, .06, .08, dk, x, 1.9, .12, false); box(R, 3.1, .1, .3, trim, x, 1.0, .15, false); box(R, 2.2, .35, .35, M(0x4a6b45, .9), x, .38, .6, false); for (let i = 0; i < 6; i++) add(R, new T.SphereGeometry(.22, 8, 6), M(0x4f8f56, .8), x - 1 + i * .4, .65, .6, false); });
      for (let i = 0; i < 3; i++) box(R, 3.4, .16, 1.0, stone, 0, .08 + i * .0, 5.5 + i * .9, false); for (let i = 0; i < 2; i++) box(R, 3.4, .06, .02, M(0x8a8a86, .9), 0, .17, 5.5 + i * .9 + .5, false);
    }
    return out;
  }

  /* ---------- 6. Atrof-muhit xaritasi (qaytarilish va yumshoq yoritish uchun) ---------- */
  function makeEnv(renderer) {
    const es = new T.Scene(), g = new T.SphereGeometry(60, 28, 18), pos = g.attributes.position, col = new Float32Array(pos.count * 3), c1 = new T.Color(), top = new T.Color(.46, .66, 1.0), hor = new T.Color(1.0, .93, .82), bot = new T.Color(.3, .28, .26);
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 60; (y > 0 ? c1.copy(hor).lerp(top, Math.pow(y, .6)) : c1.copy(hor).lerp(bot, Math.min(1, -y * 2.5))).toArray(col, i * 3); }
    g.setAttribute('color', new T.BufferAttribute(col, 3)); es.add(new T.Mesh(g, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));
    const sb = (x, y, z, w, h, i, c) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(c[0] * i, c[1] * i, c[2] * i), side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m); };
    sb(22, 34, 14, 34, 22, 3.4, [1, .96, .88]); sb(-30, 14, -12, 14, 34, 1.5, [.85, .92, 1]); sb(0, 8, -38, 50, 10, 1.1, [1, 1, 1]); sb(-8, 30, 28, 26, 10, 1.3, [1, .95, .9]);
    const pm = new T.PMREMGenerator(renderer), rt = pm.fromScene(es, .035); pm.dispose(); g.dispose(); return rt.texture;
  }

  /* ---------- 7. Asosiy ishga tushirish ---------- */
  function init(opts) {
    opts = opts || {}; const canvas = opts.canvas, mobile = !!opts.mobile; SHADOWS = !mobile; LOW = mobile;
    let renderer; try { renderer = new T.WebGLRenderer({ canvas, antialias: !mobile, alpha: false, powerPreference: 'high-performance' }); } catch (e) { return null; }
    if (!renderer.getContext()) return null;
    if (T.sRGBEncoding) renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = .85;
    renderer.shadowMap.enabled = SHADOWS; renderer.shadowMap.type = T.PCFSoftShadowMap;
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(40, 1, .1, 500);
    scene.background = new T.Color(0xcfe3ff); scene.fog = new T.Fog(0xcfe3ff, 40, 200);
    try { scene.environment = makeEnv(renderer); } catch (e) { /* env xaritasi bo‘lmasa ham sahna ishlaydi */ }
    const hemi = new T.HemisphereLight(0xeaf2ff, 0x7a7266, .34), sun = new T.DirectionalLight(0xfff0dd, 2.4), amb = new T.AmbientLight(0xffffff, .04), fill = new T.PointLight(0xfff1dc, 0, 22, 1.6);
    scene.add(hemi, sun, amb, sun.target, fill);
    if (SHADOWS) { sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -17; sc.right = 17; sc.top = 17; sc.bottom = -17; sc.near = 1; sc.far = 90; sun.shadow.bias = -.0003; sun.shadow.normalBias = .025; sun.shadow.radius = 4; }
    const world = grp(scene), actors = [];
    const ctx = { hud: opts.onHud || null, T, scene, world, actors, M, GL, EMI, box, rb, cyl, add, grp, person, idle, walker, settle, crouch, reach, handPos, blob, tex, withTex, woodMat, mkTex, capGeo, K, KV, V, bp, seg, sm, lerp, clamp, BEATS, SHADOWS, mobile, hemi, sun, amb, fill, rngMk, pdir: () => PDIR, renderer };
    const A = room(world, 0, false); ctx.houseA = A;
    if (window.YDScene._build) window.YDScene._build(ctx);

    /* kamera kalit kadrlari: [progress, kamera, nishon] */
    const CAM = window.YDScene._cam ? window.YDScene._cam(ctx) : [[0, [0, 1.7, 6], [0, 1.3, -3]], [1, [0, 1.7, 5], [0, 1.3, -3]]];
    const cp = V(0, 0, 0), cl = V(0, 0, 0);
    const herm = (keys, idx, p, out) => { // kubik Ermit: kalitlar orasida uzluksiz tezlik (keskin sakrashsiz)
      const n = keys.length; let i = 0; while (i < n - 2 && p > keys[i + 1][0]) i++;
      const k0 = keys[i], k1 = keys[i + 1], km = keys[Math.max(0, i - 1)], kn = keys[Math.min(n - 1, i + 2)];
      const h = k1[0] - k0[0] || 1e-6, u = clamp((p - k0[0]) / h), u2 = u * u, u3 = u2 * u;
      const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
      for (let d = 0; d < 3; d++) {
        let m0 = (k1[idx][d] - km[idx][d]) / ((k1[0] - km[0]) || 1), m1 = (kn[idx][d] - k0[idx][d]) / ((kn[0] - k0[0]) || 1);
        const lim = 2.2 * Math.abs(k1[idx][d] - k0[idx][d]) / h; m0 = clamp(m0, -lim, lim); m1 = clamp(m1, -lim, lim);
        const val = h00 * k0[idx][d] + h10 * h * m0 + h01 * k1[idx][d] + h11 * h * m1; if (d === 0) out.x = val; else if (d === 1) out.y = val; else out.z = val;
      }
      return out;
    };
    const state = { override: null, p: 0, target: 0, shown: 0, prev: 0, running: false, raf: 0, last: 0, time: 0, frames: 0, slow: 0, q: 1 };
    const place = () => {
      const p = state.shown; herm(CAM, 1, p, cp); herm(CAM, 2, p, cl);
      const sway = state.time; cam.position.set(cp.x + Math.sin(sway * .31) * .025, cp.y + Math.sin(sway * .43) * .015, cp.z); cam.lookAt(cl); if (state.override) state.override(cam);
      if (ctx.mood) ctx.mood(p, cam);
      sun.position.set(cl.x + 14, 24, cl.z + 10); sun.target.position.set(cl.x, 0, cl.z); fill.position.set(cl.x - 2, 5.5, cl.z + 4);
    };
    const step = (dt) => { const d = state.shown - state.prev; if (Math.abs(d) > 1e-7) PDIR = d > 0 ? 1 : -1; state.prev = state.shown; const p = state.shown; for (const a of actors) a(p, state.time, dt); place(); };
    const frame = now => {
      state.raf = requestAnimationFrame(frame); const dt = Math.min(.05, (now - state.last) / 1000 || .016); state.last = now; state.time += dt;
      const lag = opts.reduced ? 1 : 1 - Math.pow(.0015, dt); state.shown += (state.target - state.shown) * lag; if (Math.abs(state.target - state.shown) < 1e-5) state.shown = state.target;
      step(dt); renderer.render(scene, cam);
      // FPS nazorati: har 90 kadrda tekshiriladi; sekin bo‘lsa avval piksel zichligi, so‘ng soyalar kamaytiriladi
      if (++state.frames >= 20) { if (dt > .034) state.slow++; if (state.frames >= 110) { if (state.slow > 45) { if (state.q > .6) { state.q -= .2; api.resize(); } else if (renderer.shadowMap.enabled) { renderer.shadowMap.enabled = false; sun.castShadow = false; scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { m.needsUpdate = true; }); }); } } state.frames = 20; state.slow = 0; } }
      if (opts.onFrame) opts.onFrame(state.shown);
    };
    const api = {
      setProgress(p) { state.target = clamp(p); if (!state.running) { state.shown = state.target; } },
      resize() { const w = canvas.clientWidth || 800, h = canvas.clientHeight || 600; const pr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75) * state.q; if (state.sz === w + 'x' + h + '@' + pr) return; state.sz = w + 'x' + h + '@' + pr; /* o‘lcham o‘zgarmasa (mobil brauzer paneli) canvas qayta tozalanmaydi */ renderer.setPixelRatio(pr); renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w / h < .8 ? 56 : 40; /* matn chapda/pastda turadi: sahna markazi o‘ngga/yuqoriga siljitiladi */ if (opts.offset !== false) { if (w / h >= 1) cam.setViewOffset(w, h, -w * .15, 0, w, h); else cam.setViewOffset(w, h, 0, h * .14, w, h); } cam.updateProjectionMatrix(); },
      start() { if (state.running) return; state.running = true; state.last = performance.now(); state.raf = requestAnimationFrame(frame); },
      stop() { state.running = false; cancelAnimationFrame(state.raf); },
      renderOnce() { step(.016); renderer.render(scene, cam); },
      jump(p) { state.target = state.shown = clamp(p); },
      dispose() { api.stop(); renderer.dispose(); },
      get progress() { return state.shown; }, _target() { return state.target; }, THREE: T, _renderer: renderer, _scene: scene, _override(f) { state.override = f; }
    };
    api.resize(); return api;
  }
  window.YDScene = { BEATS, ACTS, init, bp, _room: room, _lib: { clamp, lerp, sm, seg, V, K, KV }, _kit: { person, idle, settle, reach, handPos, makeEnv, M, rb, grp, box, add, tex, withTex, setLow(v) { LOW = !!v; SHADOWS = !v; }, shadows(v) { SHADOWS = !!v; } } };
})();
