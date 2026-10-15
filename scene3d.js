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
  const mats = {};
  const M = (color, rough = .85, metal = 0, extra) => { const k = color + '|' + rough + '|' + metal + (extra ? JSON.stringify(extra) : ''); return mats[k] || (mats[k] = new T.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal }, extra || {}))); };
  const EM = (color, int = 1) => new T.MeshBasicMaterial({ color });
  let SHADOWS = true;
  const add = (parent, geo, mat, x = 0, y = 0, z = 0, shadow = true) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); if (shadow && SHADOWS) { m.castShadow = true; m.receiveShadow = true; } else m.receiveShadow = SHADOWS; parent.add(m); return m; };
  const box = (parent, w, h, d, mat, x, y, z, shadow) => add(parent, new T.BoxGeometry(w, h, d), mat, x, y, z, shadow);
  const cyl = (parent, rt, rb, h, mat, x, y, z, seg = 16, shadow) => add(parent, new T.CylinderGeometry(rt, rb, h, seg), mat, x, y, z, shadow);
  const grp = (parent, x = 0, y = 0, z = 0) => { const g = new T.Group(); g.position.set(x, y, z); parent && parent.add(g); return g; };

  /* canvas teksturalari: parket, beton, gips (bir martalik, tarmoqdan yuklanmaydi) */
  const rngMk = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const canvasTex = (w, h, draw, rep, rx = 1, ry = 1) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4; if (T.sRGBEncoding) t.encoding = T.sRGBEncoding; return t; };
  const TEX = {};
  const tex = {
    parquet: () => TEX.parquet || (TEX.parquet = canvasTex(512, 512, (g, w, h) => { const r = rngMk(5); const cols = ['#b9966a', '#a98558', '#c4a276', '#b08d60']; const pw = 64; for (let y = 0; y < h; y += 128) for (let x = 0; x < w; x += pw) { g.fillStyle = cols[Math.floor(r() * 4)]; g.fillRect(x, y, pw - 2, 126); for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(80,50,20,${r() * .08})`; g.fillRect(x + r() * pw, y + r() * 126, 1.2, 10 + r() * 40); } } g.fillStyle = 'rgba(0,0,0,.25)'; for (let x = 0; x < w; x += pw) g.fillRect(x - 1, 0, 2, h); }, 1, 4, 4)),
    concrete: () => TEX.concrete || (TEX.concrete = canvasTex(512, 512, (g, w, h) => { const r = rngMk(9); g.fillStyle = '#8d8b86'; g.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${r() < .5 ? 0 : 255},${r() < .5 ? 0 : 255},${r() < .5 ? 0 : 255},${r() * .07})`.replace(/\d+,\d+,\d+/, () => { const v = r() < .5 ? '0,0,0' : '255,255,255'; return v; }); g.fillRect(r() * w, r() * h, 2 + r() * 3, 2 + r() * 3); } g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h); }, 1, 10, 4)),
    plaster: () => TEX.plaster || (TEX.plaster = canvasTex(256, 256, (g, w, h) => { const r = rngMk(3); g.fillStyle = '#ece6da'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { g.fillStyle = r() < .5 ? `rgba(0,0,0,${r() * .035})` : `rgba(255,255,255,${r() * .06})`; g.fillRect(r() * w, r() * h, 2, 2); } }, 1, 3, 2))
  };

  /* ---------- 3. Odamlar (past poligonli, animatsiyalanadigan) ---------- */
  function person(o) {
    const g = new T.Group(), skin = M(o.skin || 0xdfb08c, .9), shirt = M(o.shirt || 0x2b3a55, .9), pants = M(o.pants || 0x23262e, .9);
    const hips = grp(g, 0, .92, 0), torso = grp(hips, 0, 0, 0);
    box(torso, .42, .62, .24, shirt, 0, .33, 0); if (o.vest) box(torso, .45, .5, .27, M(o.vest, .8), 0, .35, 0);
    const head = grp(torso, 0, .78, 0); add(head, new T.SphereGeometry(.125, 16, 12), skin, 0, .08, 0);
    if (o.hat) { const hh = add(head, new T.SphereGeometry(.145, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(o.hat, .5), 0, .1, 0); hh.scale.set(1, .9, 1.05); box(head, .22, .02, .12, M(o.hat, .5), 0, .105, .13, false); }
    else if (o.hair !== false) add(head, new T.SphereGeometry(.13, 14, 10, 0, Math.PI * 2, 0, Math.PI * .55), M(o.hair || 0x2a1d14, .9), 0, .105, -.005);
    const arm = side => { const a = grp(torso, side * .27, .58, 0); cyl(a, .05, .045, .56, shirt, 0, -.27, 0, 10); add(a, new T.SphereGeometry(.055, 8, 8), skin, 0, -.56, 0); return a; };
    const leg = side => { const l = grp(hips, side * .1, 0, 0); cyl(l, .075, .065, .86, pants, 0, -.43, 0, 10); box(l, .12, .07, .26, M(0x1b1b1b, .7), 0, -.9, .05, false); return l; };
    const P = { g, hips, torso, head, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) };
    g.userData = P; g.scale.setScalar(o.s || 1); return P;
  }
  const idle = (P, t, ph = 0) => { P.armL.rotation.x = Math.sin(t * 1.2 + ph) * .05; P.armR.rotation.x = -Math.sin(t * 1.2 + ph) * .05; P.legL.rotation.x = P.legR.rotation.x = 0; P.torso.rotation.z = Math.sin(t * 1 + ph) * .01; };
  const walk = (P, t, k = 1) => { const s = Math.sin(t * 6), c = Math.abs(Math.cos(t * 6)); P.legL.rotation.x = s * .55 * k; P.legR.rotation.x = -s * .55 * k; P.armL.rotation.x = -s * .5 * k; P.armR.rotation.x = s * .5 * k; P.hips.position.y = .92 + c * .025 * k; };
  const facing = (g, from, to) => { const dx = to.x - from.x, dz = to.z - from.z; if (dx * dx + dz * dz > 1e-6) g.rotation.y = Math.atan2(dx, dz); };

  /* ---------- 4. Xona (uy ichi) ---------- */
  function room(parent, x0, withShell) {
    const R = grp(parent, x0, 0, 0), wall = M(0xeee8dc, .95), wallB = M(0xe4ddcf, .95, 0, { map: tex.plaster() });
    const floor = add(R, new T.PlaneGeometry(9.6, 9), M(0xffffff, .55, 0, { map: tex.parquet() }), 0, 0, .8, false); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = SHADOWS;
    // orqa devor: eshik oralig‘i (0.9 × 2.05)
    box(R, 3.8, 3.1, .2, wallB, -2.45, 1.55, -3.6); box(R, 3.8, 3.1, .2, wallB, 2.45, 1.55, -3.6); box(R, .9, 1.05, .2, wallB, 0, 2.575, -3.6);
    box(R, .2, 3.1, 8.6, wall, -4.7, 1.55, .5); box(R, .2, 3.1, 8.6, wall, 4.7, 1.55, .5);
    box(R, 9.6, .12, .08, M(0xf6f2ea, .6), 0, .06, -3.48, false); // plintus
    // oyna (o‘ng devor) — yorug‘lik manbai
    box(R, .06, 1.6, 2.4, M(0xcfe6ff, .2, 0, { emissive: 0xaed4ff, emissiveIntensity: .9 }), 4.58, 1.7, .6, false);
    box(R, .1, .06, 2.5, M(0x2a2a2a, .6), 4.56, .9, .6, false); box(R, .1, .06, 2.5, M(0x2a2a2a, .6), 4.56, 2.5, .6, false); box(R, .1, 1.7, .06, M(0x2a2a2a, .6), 4.56, 1.7, .6, false);
    // mebel
    const sofa = grp(R, -3.0, 0, 1.4); sofa.rotation.y = Math.PI / 2; box(sofa, 2.2, .42, .95, M(0x59616b, .9), 0, .35, 0); box(sofa, 2.2, .5, .22, M(0x59616b, .9), 0, .75, -.37); box(sofa, .2, .6, .95, M(0x4e555e, .9), -1.1, .5, 0); box(sofa, .2, .6, .95, M(0x4e555e, .9), 1.1, .5, 0);
    const rug = box(R, 3.4, .02, 2.4, M(0xcfc6b4, 1), -.6, .012, 1.8, false); box(R, 1.0, .35, .7, M(0x3b2e22, .5), -1.5, .18, 1.9);
    const plant = grp(R, 3.6, 0, -2.6); cyl(plant, .22, .17, .38, M(0xd8d2c6, .7), 0, .19, 0); for (let i = 0; i < 7; i++) { const l = add(plant, new T.ConeGeometry(.1, .8, 6), M(0x3d7a47, .8), Math.cos(i * 2.4) * .12, .75, Math.sin(i * 2.4) * .12); l.rotation.z = Math.cos(i * 2.4) * .3; l.rotation.x = Math.sin(i * 2.4) * .3; }
    const lamp = grp(R, -3.9, 0, -2.7); cyl(lamp, .03, .03, 1.6, M(0x222222, .4, .6), 0, .8, 0, 8); add(lamp, new T.SphereGeometry(.2, 14, 10), M(0xfff1d6, .6, 0, { emissive: 0xffd9a0, emissiveIntensity: .8 }), 0, 1.7, 0, false);
    box(R, 1.2, .8, .04, M(0xd9c9a8, .8), -2.4, 1.9, -3.46); box(R, .7, .5, .04, M(0x8a9a8c, .8), -2.4, 1.9, -3.44); box(R, .9, .6, .04, M(0xc7a07a, .8), 2.7, 1.8, -3.46);
    box(R, 2.0, .05, .3, M(0x3b2e22, .6), 2.8, 1.2, -3.4); // javon
    // oralig‘ orqasi (yo‘lak): iliq yorug‘lik
    const hall = grp(R, 0, 0, -3.6);
    box(hall, 3.2, 3.0, .1, M(0xf3dcb4, .9, 0, { emissive: 0xffd9a3, emissiveIntensity: .75 }), 0, 1.5, -2.6, false);
    box(hall, .1, 3, 2.6, M(0xdcc9a6, .9), -1.6, 1.5, -1.3); box(hall, .1, 3, 2.6, M(0xdcc9a6, .9), 1.6, 1.5, -1.3);
    const hf = add(hall, new T.PlaneGeometry(3.2, 2.6), M(0xb59a73, .7), 0, .005, -1.3, false); hf.rotation.x = -Math.PI / 2;
    // eshik oralig‘i chuqurligi (jamb)
    const jm = M(0xdad3c4, .9); box(R, .06, 2.05, .24, jm, -.45, 1.025, -3.6, false); box(R, .06, 2.05, .24, jm, .45, 1.025, -3.6, false); box(R, .96, .06, .24, jm, 0, 2.08, -3.6, false);
    const out = { R, floor, opening: V(x0, 0, -3.6) };
    if (withShell) { // tashqaridan ko‘rinadigan uy: qanotlar, tom, kirish zinapoyasi
      const sh = M(0xd8d2c6, .9), dark = M(0x2e3238, .7);
      box(R, 9.6, .4, 9.6, M(0xc9c3b8, .9), 0, -.2, 1.2, false); // poydevor
      box(R, 12.5, .5, 11, dark, 0, 3.35, .6); box(R, 6, 3.4, 5, sh, -9.2, 1.7, -2.5); box(R, 6, 3.4, 5, sh, 9.2, 1.7, -2.5);
      box(R, 2.6, 1.4, .06, M(0x9fb8d0, .15, 0, { emissive: 0x6c8aa8, emissiveIntensity: .4 }), -9.2, 1.9, .03, false); box(R, 2.6, 1.4, .06, M(0x9fb8d0, .15, 0, { emissive: 0x6c8aa8, emissiveIntensity: .4 }), 9.2, 1.9, .03, false);
      for (let i = 0; i < 3; i++) box(R, 3, .18, 1.2 - i * .3, M(0xcfc8bb, .9), 0, .09 + i * .0, 5.6 + i * .9 + 0, false);
    }
    return out;
  }

  /* ---------- 5. Asosiy ishga tushirish ---------- */
  function init(opts) {
    opts = opts || {}; const canvas = opts.canvas, mobile = !!opts.mobile; SHADOWS = !mobile;
    let renderer; try { renderer = new T.WebGLRenderer({ canvas, antialias: !mobile, alpha: false, powerPreference: 'high-performance' }); } catch (e) { return null; }
    if (!renderer.getContext()) return null;
    if (T.sRGBEncoding) renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = .82;
    renderer.shadowMap.enabled = SHADOWS; renderer.shadowMap.type = T.PCFSoftShadowMap;
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(42, 1, .1, 500);
    scene.background = new T.Color(0xcfe3ff); scene.fog = new T.Fog(0xcfe3ff, 40, 200);
    const hemi = new T.HemisphereLight(0xeaf2ff, 0x6f6a60, .62), sun = new T.DirectionalLight(0xfff0dd, 1.9), amb = new T.AmbientLight(0xffffff, .08);
    scene.add(hemi, sun, amb, sun.target);
    if (SHADOWS) { sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 80; sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; }
    const world = grp(scene), actors = [];
    const hudCb = opts.onHud || null;
    const ctx = { hud: hudCb, T, scene, world, actors, M, EM, box, cyl, add, grp, person, idle, walk, facing, tex, K, KV, V, bp, seg, sm, lerp, clamp, BEATS, SHADOWS, mobile, hemi, sun, amb, rngMk };
    const A = room(world, 0, false); ctx.houseA = A;
    if (window.YDScene._build) window.YDScene._build(ctx);

    /* kamera kalit kadrlari: [progress, kamera, nishon] */
    const CAM = window.YDScene._cam ? window.YDScene._cam(ctx) : [[0, [0, 1.7, 6], [0, 1.3, -3]], [1, [0, 1.7, 5], [0, 1.3, -3]]];
    const cp = V(0, 0, 0), cl = V(0, 0, 0), tmp = V(0, 0, 0);
    const herm = (keys, idx, p, out) => { // kubik Ermit: kalitlar orasida uzluksiz tezlik (keskin sakrashsiz)
      const n = keys.length; let i = 0; while (i < n - 2 && p > keys[i + 1][0]) i++;
      const k0 = keys[i], k1 = keys[i + 1], km = keys[Math.max(0, i - 1)], kn = keys[Math.min(n - 1, i + 2)];
      const h = k1[0] - k0[0] || 1e-6, u = clamp((p - k0[0]) / h), u2 = u * u, u3 = u2 * u;
      const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
      for (let d = 0; d < 3; d++) {
        let m0 = (k1[idx][d] - km[idx][d]) / ((k1[0] - km[0]) || 1), m1 = (kn[idx][d] - k0[idx][d]) / ((kn[0] - k0[0]) || 1);
        const lim = 2.2 * Math.abs(k1[idx][d] - k0[idx][d]) / h; m0 = clamp(m0, -lim, lim); m1 = clamp(m1, -lim, lim); // tangentlarni cheklash: kalitlar orasida oshib ketmaydi
        const val = h00 * k0[idx][d] + h10 * h * m0 + h01 * k1[idx][d] + h11 * h * m1; if (d === 0) out.x = val; else if (d === 1) out.y = val; else out.z = val;
      }
      return out;
    };
    let out = cp;
    const state = { p: 0, target: 0, shown: 0, running: false, raf: 0, last: 0, time: 0, frames: 0, slow: 0, q: 1 };
    const place = () => {
      const p = state.shown; out = cp; herm(CAM, 1, p, cp); out = cl; herm(CAM, 2, p, cl);
      const sway = state.time; cam.position.set(cp.x + Math.sin(sway * .31) * .03, cp.y + Math.sin(sway * .43) * .02, cp.z); cam.lookAt(cl);
      if (ctx.mood) ctx.mood(p, cam);
      sun.position.set(cl.x + 14, 22, cl.z + 10); sun.target.position.set(cl.x, 0, cl.z);
    };
    const frame = now => {
      state.raf = requestAnimationFrame(frame); const dt = Math.min(.05, (now - state.last) / 1000 || .016); state.last = now; state.time += dt;
      const lag = opts.reduced ? 1 : 1 - Math.pow(.0015, dt); state.shown += (state.target - state.shown) * lag; if (Math.abs(state.target - state.shown) < 1e-5) state.shown = state.target;
      const p = state.shown; for (const a of actors) a(p, state.time, dt);
      place(); renderer.render(scene, cam);
      // FPS nazorati: sekin qurilmada piksel zichligini kamaytiramiz
      if (++state.frames > 20 && state.frames < 140) { if (dt > .034) state.slow++; if (state.frames === 139 && state.slow > 60 && state.q > .6) { state.q -= .25; api.resize(); state.frames = 20; state.slow = 0; } }
      if (opts.onFrame) opts.onFrame(p);
    };
    const api = {
      setProgress(p) { state.target = clamp(p); if (!state.running) { state.shown = state.target; } },
      resize() { const w = canvas.clientWidth || 800, h = canvas.clientHeight || 600; const pr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75) * state.q; renderer.setPixelRatio(pr); renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w / h < .8 ? 58 : 42; /* matn chapda/pastda turadi: sahna markazi o‘ngga/yuqoriga siljitiladi */ if (opts.offset !== false) { if (w / h >= 1) cam.setViewOffset(w, h, -w * .15, 0, w, h); else cam.setViewOffset(w, h, 0, h * .14, w, h); } cam.updateProjectionMatrix(); },
      start() { if (state.running) return; state.running = true; state.last = performance.now(); state.raf = requestAnimationFrame(frame); },
      stop() { state.running = false; cancelAnimationFrame(state.raf); },
      renderOnce() { const p = state.shown; for (const a of actors) a(p, state.time, .016); place(); renderer.render(scene, cam); },
      jump(p) { state.target = state.shown = clamp(p); },
      dispose() { api.stop(); renderer.dispose(); },
      get progress() { return state.shown; }, THREE: T
    };
    api.resize(); return api;
  }
  window.YDScene = { BEATS, ACTS, init, bp, _room: room, _lib: { clamp, lerp, sm, seg, V, K, KV } };
})();
