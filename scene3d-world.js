/* ===== YasinDoors — scene3d-world.js: zavod, yuk mashinasi, tashqi muhit, aktyorlar va kamera yo‘li ===== */
(function () {
  'use strict';
  const Y = window.YDScene; if (!Y || !window.THREE) return;
  const T = window.THREE, L = Y._lib, { clamp, lerp, sm, seg } = L;

  Y._build = function (c) {
    const { world, actors, M, box, cyl, add, grp, person, idle, walk, facing, tex, K, V, bp, mobile } = c;
    const SH = c.SHADOWS, B = i => Y.BEATS[i];
    const FX0 = 34, FX1 = 92, LINE_Y = .95;
    const steel = M(0x6f7780, .45, .7), dark = M(0x2d3136, .6, .3), yellow = M(0xe8b520, .6), orange = M(0xe8742a, .6), white = M(0xf1efe9, .7), conc = M(0xffffff, .95, 0, { map: tex.concrete() });
    const MDF = 0xc9a574, WALNUT = 0x6b4a33;

    /* ---------- Zavod ---------- */
    const F = grp(world, 0, 0, 0);
    const fl = add(F, new T.PlaneGeometry(FX1 - FX0 + 6, 30), conc, (FX0 + FX1) / 2 + 1, 0, 6, false); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = SH;
    const wallM = M(0xd9dde0, .9), wallDk = M(0x9aa3ab, .8);
    box(F, FX1 - FX0, 10, .3, wallM, (FX0 + FX1) / 2, 5, -9.2); // orqa devor
    box(F, .3, 10, 18, wallM, FX0, 5, 0); // chap devor
    box(F, .3, 3, 18, wallM, FX1, 8.5, 0); box(F, .3, 10, 6.2, wallM, FX1, 5, 6.1); box(F, .3, 10, 6.2, wallM, FX1, 5, -6.1); // o‘ng devor: darvoza (6 × 5)
    box(F, FX1 - FX0, .5, .3, wallDk, (FX0 + FX1) / 2, .25, -9.0, false);
    for (let i = 0; i < 9; i++) box(F, 3.2, 1.2, .1, M(0xcfe6ff, .2, 0, { emissive: 0xaed4ff, emissiveIntensity: .7 }), FX0 + 6 + i * 6.2, 7.6, -9.0, false); // yuqori oynalar
    for (let i = 0; i < 11; i++) { box(F, .35, .5, 18.4, steel, FX0 + 3 + i * 5.4, 9.2, 0, false); } // tom to‘sinlari
    for (let i = 0; i < 6; i++) box(F, FX1 - FX0 - 4, .12, .6, M(0xffffff, .5, 0, { emissive: 0xfff6e6, emissiveIntensity: 1.1 }), (FX0 + FX1) / 2, 8.9, -6 + i * 2.6, false); // lampa qatorlari
    for (let i = 0; i < 7; i++) { const col = box(F, .5, 9, .5, steel, FX0 + 2 + i * 9, 4.5, -8.7, false); } // ustunlar
    [-4.5, 4.5].forEach(z => { box(F, FX1 - FX0 - 6, .04, .16, yellow, (FX0 + FX1) / 2, .01, z, false); }); // sariq belgilar
    // devordagi javonlar va MDF plitalar
    for (let s = 0; s < 3; s++) { box(F, 14, .12, 1.4, steel, 44, .8 + s * 1.5, -8.3, false); for (let i = 0; i < 6; i++) box(F, 2.0, .5, 1.1, M(i % 2 ? 0xc9a574 : 0xbf9c6a, .9), 38.5 + i * 2.3, 1.15 + s * 1.5, -8.3); }
    box(F, 6, 1.2, .2, M(0x1c1f23, .6), 64, 6.4, -9.0, false); // logotip paneli
    const logo = new T.Mesh(new T.PlaneGeometry(5.4, 1.0), new T.MeshBasicMaterial({ map: (function () { const cv = document.createElement('canvas'); cv.width = 540; cv.height = 100; const g = cv.getContext('2d'); g.fillStyle = '#1c1f23'; g.fillRect(0, 0, 540, 100); g.fillStyle = '#e9a45e'; g.font = '700 52px sans-serif'; g.textBaseline = 'middle'; g.fillText('●', 24, 52); g.fillStyle = '#f4efe4'; g.fillText('YASINDOORS', 84, 52); const t = new T.CanvasTexture(cv); if (T.sRGBEncoding) t.encoding = T.sRGBEncoding; return t; })() }));
    logo.position.set(64, 6.4, -8.88); F.add(logo);

    // konveyer (ishlab chiqarish liniyasi)
    box(F, 52, .12, 1.25, dark, 61, LINE_Y - .07, 0);
    for (let x = 36; x <= 88; x += 4) { box(F, .12, LINE_Y - .1, 1.1, steel, x, (LINE_Y - .1) / 2, 0, false); }
    const rollers = new T.InstancedMesh(new T.CylinderGeometry(.045, .045, 1.1, 8), steel, 200); const dm = new T.Object3D(); for (let i = 0; i < 200; i++) { dm.position.set(36.3 + i * .26, LINE_Y, 0); dm.rotation.set(Math.PI / 2, 0, 0); dm.updateMatrix(); rollers.setMatrixAt(i, dm.matrix); } F.add(rollers);

    /* ---------- Stanoklar ---------- */
    const SX = { pallet: 42, saw: 48, asm: 54, sand: 60, cnc: 66, paint: 72, dry: 78, qc: 82, pack: 86 };
    // 1) taxta pallet + MDF plitalar + yuk ko‘targich
    const pallet = grp(F, 42, 0, 4.2); box(pallet, 3.0, .14, 2.2, M(0x9a7a4e, .9), 0, .12, 0); for (let i = 0; i < 5; i++) box(pallet, 2.8, .045, 2.07, M(MDF, .9), 0, .22 + i * .05, 0);
    const fk = grp(F, 34, 0, 4.2); const fkb = grp(fk); box(fkb, 1.5, .8, 1.0, M(0xe8742a, .6), 0, .75, 0); box(fkb, .9, .1, .9, dark, -.1, 1.3, 0); [-.4, .4].forEach(z => box(fkb, .1, 1.5, .1, dark, .6, 1.15, z * 1.0)); box(fkb, .3, 1.8, .06, steel, .86, 1.05, -.38); box(fkb, .3, 1.8, .06, steel, .86, 1.05, .38);
    const forks = grp(fkb, .9, .15, 0); [-.3, .3].forEach(z => box(forks, 1.3, .06, .12, steel, .65, 0, z)); [[-.5, .3], [-.5, -.3], [.5, .3], [.5, -.3]].forEach(([x, z]) => { const w = cyl(fkb, .22, .22, .16, M(0x1a1a1a, .9), x, .22, z * 1.3, 14); w.rotation.x = Math.PI / 2; });
    const driver = person({ shirt: 0x2f5d8a, vest: 0xe8b520, hat: 0xe8b520, pants: 0x2a2f38 }); driver.g.position.set(-.2, .35, 0); fkb.add(driver.g); driver.armL.rotation.x = driver.armR.rotation.x = -.9;
    // 2) kesish stanogi (x=48)
    const saw = grp(F, SX.saw, 0, 0); box(saw, 3.4, .12, 1.0, dark, 0, LINE_Y - .06, 0, false);
    [-1.5, 1.5].forEach(z => { box(saw, .25, 2.6, .25, steel, .2, 1.8, z); }); box(saw, .4, .3, 3.6, steel, .2, 3.05, 0);
    const sawCar = grp(saw, .2, 2.4, 0); box(sawCar, .5, .6, .5, M(0x3b6ea5, .5, .3), 0, 0, 0); const blade = cyl(sawCar, .5, .5, .03, M(0xc9cdd1, .3, .9), 0, -.55, 0, 24); blade.rotation.x = Math.PI / 2; blade.rotation.z = 0; box(sawCar, .55, .5, .2, M(0xe8742a, .6), 0, -.6, .3);
    const bladeAx = blade; // aylanuvchi
    // 3) yig‘ish stoli (x=54): press + ish stoli
    const asm = grp(F, SX.asm, 0, 0); [-1, 1].forEach(z => box(asm, 1.2, .5, .5, steel, 0, 1.25, z * .85)); box(asm, .2, 2.4, 2.4, steel, -1.1, 1.2, 0); const press = box(asm, 2.2, .35, 1.3, M(0x3b6ea5, .5, .3), 0, 2.4, 0);
    // 4) silliqlash stanogi (x=60)
    const sand = grp(F, SX.sand, 0, 0); box(sand, 2.4, 1.1, 2.4, M(0x39434d, .6, .3), 0, 2.45, 0); [-1.1, 1.1].forEach(z => { box(sand, .3, 1.9, .3, M(0x39434d, .6, .3), 0, 1.0, z); });
    const belt = cyl(sand, .35, .35, 1.3, M(0xbcae8c, .95), 0, 1.65, 0, 20); belt.rotation.x = Math.PI / 2; box(sand, 2.3, .06, .1, yellow, 0, 3.0, 1.25, false); box(sand, .9, .45, .05, M(0x77d27a, .5, 0, { emissive: 0x77d27a, emissiveIntensity: .8 }), 0, 2.5, 1.22, false);
    // 5) CNC frezer (x=66): portal + bosh
    const cnc = grp(F, SX.cnc, 0, 0); [-1.4, 1.4].forEach(z => { box(cnc, .4, 2.8, .4, M(0x3b6ea5, .5, .3), 0, 1.4, z); }); const gantry = grp(cnc, 0, 2.55, 0); box(gantry, .5, .45, 3.4, M(0x3b6ea5, .5, .3), 0, 0, 0);
    const head = grp(gantry, 0, -.45, 0); box(head, .4, .5, .4, steel, 0, 0, 0); const bit = cyl(head, .03, .03, .5, M(0xd0d4d8, .2, .9), 0, -.45, 0, 8); box(cnc, 3.6, .12, .12, steel, 0, 3.0, -1.55, false);
    // 6) bo‘yash kabinasi (x=72)
    const booth = grp(F, SX.paint, 0, 0); box(booth, 3.2, .1, 3.2, dark, 0, 2.95, 0); [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]].forEach(([x, z]) => box(booth, .14, 3.0, .14, steel, x, 1.5, z)); box(booth, 3.2, 3.0, .08, M(0xcfe6ff, .1, 0, { transparent: true, opacity: .18 }), 0, 1.5, -1.6, false); box(booth, .08, 3.0, 3.2, M(0xcfe6ff, .1, 0, { transparent: true, opacity: .18 }), -1.6, 1.5, 0, false); box(booth, .08, 3.0, 3.2, M(0xcfe6ff, .1, 0, { transparent: true, opacity: .18 }), 1.6, 1.5, 0, false);
    const arm0 = grp(booth, 0, 2.7, -1.2); box(arm0, .3, .3, .3, steel, 0, 0, 0); const arm1 = grp(arm0, 0, 0, 0); box(arm1, .12, .12, 1.2, M(0xe8742a, .5), 0, 0, .6); const arm2 = grp(arm1, 0, 0, 1.2); box(arm2, .1, 1.0, .1, M(0xe8742a, .5), 0, -.5, 0); const gun = box(arm2, .12, .2, .3, dark, 0, -1.05, .08);
    // 7) quritish (x=78): infraqizil lampalar
    const dry = grp(F, SX.dry, 0, 0); [[-1.4, -.9], [1.4, -.9], [-1.4, .9], [1.4, .9]].forEach(([x, z]) => box(dry, .12, 2.3, .12, steel, x, 1.2, z)); box(dry, 3.0, .12, 2.1, steel, 0, 2.35, 0);
    const lampsMat = []; for (let i = 0; i < 4; i++) { const m = new T.MeshBasicMaterial({ color: 0x4a2a1a }); lampsMat.push(m); box(dry, 2.6, .07, .12, m, 0, 2.25, -.7 + i * .47, false); }
    const dryGlow = new T.PointLight(0xff7a2a, 0, 7); dryGlow.position.set(SX.dry, 2.0, 0); F.add(dryGlow);
    // 8) QC (x=82) va qadoqlash (x=86)
    const qc = grp(F, SX.qc, 0, 0); box(qc, 1.4, .08, .8, dark, 0, 1.0, 1.7); box(qc, .08, .5, .5, M(0x2b3a55, .5, 0, { emissive: 0x6fb7ff, emissiveIntensity: .6 }), 0, 1.4, 1.95, false);
    const pk = grp(F, SX.pack, 0, 0); box(pk, 3.0, .12, 1.8, M(0x9a7a4e, .9), 0, .1, 0); box(pk, .12, 1.6, .12, steel, 1.9, 2.4, -1.2); box(pk, .12, 1.6, .12, steel, 1.9, 2.4, 1.2); box(pk, .1, .1, 2.4, steel, 1.9, 3.2, 0);
    const rollFilm = cyl(pk, .18, .18, .8, M(0xcfe0f0, .2, 0, { transparent: true, opacity: .55 }), -1.5, 1.4, 1.7, 14); rollFilm.rotation.z = Math.PI / 2;
    // yuklash zonasi — pol belgisi va darvoza ramkasi
    box(F, .5, 5.2, .5, yellow, FX1, 2.6, -3.1, false); box(F, .5, 5.2, .5, yellow, FX1, 2.6, 3.1, false);
    // plitalar qatorlari va qutilar
    for (let i = 0; i < 3; i++) box(F, 1.0, .5, 1.0, M(0xbf9c6a, .95), 40 + i * 1.05, .25, -6.5); box(F, 1.4, 1.1, 1.0, M(0xa98558, .95), 38.8, .55, -5.3);
    for (let i = 0; i < 4; i++) { const t = box(F, .4, 1.2, .4, M(0x39434d, .6), 50 + i * 12, .6, -7.4); }

    /* ---------- Yuk mashinasi va tashqi muhit ---------- */
    const EX = grp(world, 0, 0, 0);
    const ground = add(EX, new T.PlaneGeometry(900, 300), M(0x7c8a62, 1), 130, -.02, 20, false); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = SH;
    const apron = add(EX, new T.PlaneGeometry(40, 24), M(0x8f8c86, .95), 108, -.01, 4, false); apron.rotation.x = -Math.PI / 2; apron.receiveShadow = SH;
    const road = add(EX, new T.PlaneGeometry(160, 6), M(0x3b3d42, .95), 160, -.005, 13, false); road.rotation.x = -Math.PI / 2; road.receiveShadow = SH;
    for (let i = 0; i < 40; i++) { const m = add(EX, new T.PlaneGeometry(2, .18), M(0xe8e4da, .8), 92 + i * 4, .002, 13, false); m.rotation.x = -Math.PI / 2; }
    const sw = add(EX, new T.PlaneGeometry(160, 3), M(0xaaa69e, .95), 160, -.004, 8.2, false); sw.rotation.x = -Math.PI / 2;
    const rngv = c.rngMk(21);
    for (let i = 0; i < (mobile ? 18 : 34); i++) { const x = 100 + rngv() * 130, z = 17 + rngv() * 18 + (rngv() < .3 ? -26 : 0); const t = grp(EX, x, 0, z); const s = .8 + rngv() * .7; cyl(t, .12 * s, .16 * s, 1.5 * s, M(0x5c4630, .9), 0, .75 * s, 0, 6, false); add(t, new T.ConeGeometry(.9 * s, 2.4 * s, 7), M(0x3f7a47 + Math.floor(rngv() * 3) * 0x050a05, .85), 0, 2.4 * s, 0, false); add(t, new T.ConeGeometry(.7 * s, 1.8 * s, 7), M(0x3f7a47, .85), 0, 3.4 * s, 0, false); }
    for (let i = 0; i < 12; i++) { const x = 100 + i * 12, bz = 26 + (i % 3) * 7; const bh = 5 + rngv() * 8; box(EX, 7 + rngv() * 3, bh, 6, M(0xd7d1c6 - (i % 4) * 0x0a0a0a, .9), x, bh / 2, -18 - (i % 3) * 6, false); }
    for (let i = 0; i < 8; i++) { const x = 98 + i * 16, g = grp(EX, x, 0, 7); cyl(g, .05, .05, 4.4, dark, 0, 2.2, 0, 6, false); box(g, .9, .08, .25, dark, .35, 4.4, 0, false); add(g, new T.SphereGeometry(.12, 8, 6), new T.MeshBasicMaterial({ color: 0xfff1c9 }), .7, 4.34, 0, false); }
    // yuk mashinasi
    const truck = grp(world, 100, 0, 0); const tb = grp(truck);
    box(tb, 7.2, 3.1, 2.6, white, -1.2, 2.3, 0); box(tb, 7.25, .15, 2.62, orange, -1.2, 3.8, 0, false); box(tb, .04, .8, 1.9, M(0x1c1f23, .5), -4.82, 2.3, 0, false);
    const cab = grp(tb, 3.2, 0, 0); box(cab, 2.0, 1.8, 2.5, M(0x2b3a55, .45), 0, 1.7, 0); box(cab, .9, .9, 2.3, M(0x2b3a55, .45), -.3, 2.95, 0); box(cab, .06, .9, 2.0, M(0x9fc4e0, .1, .6), .53, 2.9, 0, false); box(cab, 1.4, .06, 2.6, steel, .3, .55, 0, false);
    box(tb, 1.0, .3, 2.7, dark, -1.2, .55, 0, false); box(tb, 5.0, .25, 2.5, dark, -1.2, 1.0, 0, false);
    const wheels = []; [[-3.4, -1.3], [-3.4, 1.3], [-1.9, -1.3], [-1.9, 1.3], [3.4, -1.3], [3.4, 1.3]].forEach(([x, z]) => { const w = cyl(tb, .55, .55, .4, M(0x1a1a1a, .9), x, .55, z, 16); w.rotation.x = Math.PI / 2; wheels.push(w); cyl(w, .28, .28, .42, steel, 0, 0, 0, 10, false); });
    const cargoDoor = grp(tb, -4.82, 0, 1.3); box(cargoDoor, .06, 3.0, 1.3, M(0xe9e6df, .7), 0, 2.3, .65); cargoDoor.userData.open = 0;
    // mashina yo‘li (zavod darvozasidan → mijoz uyi)
    const route = new T.CatmullRomCurve3([V(99, 0, 0), V(106, 0, 2.5), V(112, 0, 9), V(120, 0, 12.4), V(150, 0, 12.6), V(190, 0, 12.6), V(204, 0, 12.4)], false, 'catmullrom', .4);
    truck.position.set(99, 0, 0); truck.rotation.y = 0; const trkP = V(0, 0, 0), trkT = V(0, 0, 1);

    /* ---------- Ishlov beriladigan eshik (parchalar → tabaqa) ---------- */
    const leaf = grp(world, 0, 0, 0); const carrier = grp(world, 0, 0, 0); carrier.add(leaf);
    const leafMat = M(MDF, .92, 0, {}).clone(); leafMat.color.setHex(MDF);
    const parts = []; const pl = (w, h, d, x, z, ex, ey, ez) => { const m = box(leaf, w, h, d, leafMat, x, 0, z); m.userData = { ex: ex, ey: ey, ez: ez, x, z }; parts.push(m); return m; };
    pl(2.05, .045, .12, 0, -.39, -.2, 1.3, -1.8); pl(2.05, .045, .12, 0, .39, .2, 1.6, 1.8);
    pl(.12, .045, .66, -.965, 0, -2.2, 1.0, 0); pl(.12, .045, .66, 0, 0, 0, 1.9, -.6); pl(.12, .045, .66, .965, 0, 2.2, 1.0, .5);
    pl(.77, .03, .66, -.48, 0, -.6, 2.2, 1.2); pl(.77, .03, .66, .48, 0, .6, 2.2, -1.2);
    const sheet = box(world, 2.8, .045, 2.07, M(MDF, .92), 42, 0, 4.2); // katta plita
    const offc = box(world, 1.5, .045, .6, M(0xbf9c6a, .92), 0, -9, 0);
    // naqsh (frezer) — chuqurchalar
    const gm = M(0x2a1b10, .8), grooves = []; const gw = .035;
    [[-.48], [.48]].forEach(([px]) => { const pw = .77 - .1, ph = .66 - .1; const g = [[px, -ph / 2, pw, gw], [px, ph / 2, pw, gw]]; const g2 = [[px - pw / 2, 0, gw, ph], [px + pw / 2, 0, gw, ph]]; g.forEach(a => { const m = box(leaf, a[2], .012, a[3], gm, a[0], .026, a[1], false); m.userData = { axis: 'x', px: a[0], pz: a[1] }; grooves.push(m); }); g2.forEach(a => { const m = box(leaf, a[2], .012, a[3], gm, a[0], .026, a[1], false); m.userData = { axis: 'z', px: a[0], pz: a[1] }; grooves.push(m); }); });
    grooves.forEach(g => g.scale.set(.001, 1, .001));
    // dastak va petlalar
    const hardware = grp(leaf, 0, 0, 0); hardware.visible = false;
    const hinge = M(0xcfcfcf, .3, .9); const hingeH = [-.62, 0, .62].map(x => box(hardware, .12, .06, .02, hinge, x, 0, -.455, false));
    const handle = grp(hardware, .8, .03, .0); cyl(handle, .03, .03, .02, M(0xc2c2c2, .25, .9), 0, .02, 0, 14, false); box(handle, .13, .02, .02, M(0xc2c2c2, .25, .9), -.06, .035, 0, false);
    // quti (qadoq): taglik + qopqoq + plyonka
    const pack = grp(carrier, 0, 0, 0); pack.visible = false;
    const cardM = M(0xb48a5b, .95); box(pack, 2.2, .07, 1.04, cardM, 0, -.07, 0); [-.5, .5].forEach(z => box(pack, 2.2, .14, .03, cardM, 0, -.01, z)); [-1.08, 1.08].forEach(x => box(pack, .03, .14, 1.04, cardM, x, -.01, 0));
    const lid = grp(pack, 0, .45, 0); box(lid, 2.24, .05, 1.08, cardM, 0, 0, 0); const lbl = new T.Mesh(new T.PlaneGeometry(.9, .3), new T.MeshBasicMaterial({ map: (function () { const cv = document.createElement('canvas'); cv.width = 360; cv.height = 120; const g = cv.getContext('2d'); g.fillStyle = '#f4efe4'; g.fillRect(0, 0, 360, 120); g.fillStyle = '#1c1f23'; g.font = '700 40px sans-serif'; g.textBaseline = 'middle'; g.fillText('YASINDOORS', 26, 44); g.fillStyle = '#c4602a'; g.font = '600 24px sans-serif'; g.fillText('MDF ESHIK · MAHSULOT', 26, 90); const t = new T.CanvasTexture(cv); if (T.sRGBEncoding) t.encoding = T.sRGBEncoding; return t; })() })); lbl.rotation.x = -Math.PI / 2; lbl.position.set(.3, .03, 0); lid.add(lbl);
    const film = box(pack, 2.24, .22, 1.08, M(0xdfeaf5, .1, 0, { transparent: true, opacity: .3 }), 0, .02, 0, false);
    // tayyor eshik uchun qo‘shimcha yordamchilar
    const checkM = new T.Mesh(new T.CircleGeometry(.35, 24), new T.MeshBasicMaterial({ color: 0x43d08f, transparent: true, opacity: 0 })); checkM.position.set(SX.qc, 2.6, 1.0); F.add(checkM);

    /* ---------- Uy B (o‘rnatish) ---------- */
    const HB_X = 214; const HB = Y._room(world, HB_X, true); c.houseB = HB;
    // eshik rom (casing) B uyda: oralig‘ — x=214, z=-3.6; chap petla tomoni
    const cas = M(0xf6f2ea, .6), frameG = grp(world, HB_X, 0, -3.6);
    box(frameG, .1, 2.14, .26, cas, -.5, 1.07, 0, false); box(frameG, .1, 2.14, .26, cas, .5, 1.07, 0, false); box(frameG, 1.1, .1, .26, cas, 0, 2.15, 0, false);
    const casF = grp(frameG, 0, 0, .14); box(casF, .08, 2.2, .04, cas, -.57, 1.1, 0, false); box(casF, .08, 2.2, .04, cas, .57, 1.1, 0, false); box(casF, 1.22, .08, .04, cas, 0, 2.2, 0, false);
    const level = grp(world, 0, -9, 0); box(level, .8, .06, .04, M(0xe8b520, .5), 0, 0, 0, false); box(level, .1, .035, .045, M(0x77d27a, .5, 0, { emissive: 0x77d27a, emissiveIntensity: .8 }), 0, 0, 0, false);
    const shims = []; for (let i = 0; i < 4; i++) { const s = box(world, .1, .04, .05, M(0xd8b878, .8), HB_X - .47, 2.0 - i * .6, -3.6, false); s.visible = false; shims.push(s); }
    const drill = grp(world, 0, -9, 0); box(drill, .25, .08, .08, M(0x2f7ed6, .5), 0, 0, 0, false); box(drill, .06, .12, .06, dark, 0, -.1, 0, false);

    /* ---------- Odamlar ---------- */
    const hat = 0xf1c40f, vest = 0xe8742a;
    const mk = (o, parent) => { const P = person(o); (parent || world).add(P.g); return P; };
    const engA = mk({ shirt: 0x34465e, pants: 0x23262e, hat: 0xe8742a, vest: null }), cliA = mk({ shirt: 0xb8473a, pants: 0x2c2f38, hair: 0x4a2a1a, skin: 0xd9a47e });
    const W = {}; ['saw', 'a1', 'a2', 'sand', 'cnc', 'paint', 'qc', 'p1', 'p2', 'c1', 'c2', 'sup'].forEach((k, i) => { W[k] = mk({ shirt: [0x2f5d8a, 0x3a7a58, 0x7a4a2a, 0x3c3f4a][i % 4], vest: vest, hat: i % 3 === 0 ? 0xffffff : hat, pants: 0x2a2f38, skin: [0xdfb08c, 0xc99069, 0xe8c4a0][i % 3] }); });
    const sup = W.sup;
    const inst1 = mk({ shirt: 0x2b3a55, pants: 0x23262e, hat: 0xe8742a, vest: 0xe8742a }), inst2 = mk({ shirt: 0x4a4a52, pants: 0x23262e, hat: 0xe8742a, vest: 0xe8742a, skin: 0xc99069 }), cliB = mk({ shirt: 0xb8473a, pants: 0x2c2f38, hair: 0x4a2a1a, skin: 0xd9a47e });
    const place = (P, x, z, ry = 0) => { P.g.position.set(x, 0, z); P.g.rotation.y = ry; };
    place(W.saw, SX.saw - .1, -1.5, 0); place(W.a1, SX.asm, -1.5, 0); place(W.a2, SX.asm, 1.6, Math.PI); place(W.sand, SX.sand, -2.0, 0); place(W.cnc, SX.cnc - 1.2, -2.0, 0); place(W.paint, SX.paint + 2.0, -2.0, 0); place(W.qc, SX.qc, 1.9, Math.PI); place(W.p1, SX.pack, -1.2, 0); place(W.p2, SX.pack, 1.3, Math.PI); place(W.sup, 70, 4, Math.PI * .9);
    place(W.c1, SX.pack, -1.2, 0); place(W.c2, SX.pack, 1.3, Math.PI);

    /* ---------- Zarralar (chang, bo‘yoq tumani) ---------- */
    const PN = mobile ? 40 : 90;
    const mkPart = (color, size, op) => { const pos = new Float32Array(PN * 3), vel = new Float32Array(PN * 3), life = new Float32Array(PN); const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); const m = new T.PointsMaterial({ color, size, transparent: true, opacity: op, depthWrite: false, sizeAttenuation: true }); const pts = new T.Points(g, m); pts.frustumCulled = false; world.add(pts); for (let i = 0; i < PN; i++) { life[i] = Math.random(); pos[i * 3 + 1] = -50; } return { pts, pos, vel, life, g }; };
    const dustS = mkPart(0xe0c391, .09, .8), dustSd = mkPart(0xd9c4a0, .07, .6), dustC = mkPart(0xd6b987, .06, .8), mist = mkPart(0x6b4a33, .12, .45);
    const emit = (P, ex, ey, ez, on, dt, spread, up, grav, speedMul = 1) => { for (let i = 0; i < PN; i++) { P.life[i] -= dt * 1.4 * speedMul; if (P.life[i] <= 0) { if (on) { P.life[i] = .6 + Math.random() * .5; P.pos[i * 3] = ex + (Math.random() - .5) * .15; P.pos[i * 3 + 1] = ey; P.pos[i * 3 + 2] = ez + (Math.random() - .5) * .15; P.vel[i * 3] = (Math.random() - .5) * spread; P.vel[i * 3 + 1] = up * (.4 + Math.random()); P.vel[i * 3 + 2] = (Math.random() - .5) * spread; } else P.pos[i * 3 + 1] = -50; } else { P.vel[i * 3 + 1] -= grav * dt; P.pos[i * 3] += P.vel[i * 3] * dt; P.pos[i * 3 + 1] += P.vel[i * 3 + 1] * dt; P.pos[i * 3 + 2] += P.vel[i * 3 + 2] * dt; } } P.g.attributes.position.needsUpdate = true; };

    /* ---------- Vaqt jadvali (progress → harakat) ---------- */
    const b = i => B(i), within = (p, i) => p >= b(i).a && p < b(i).b;
    const LEAF_X = [[0, 40], [bp(3, .6), 42], [bp(3, 1), 46], [bp(4, 1), 51.6], [bp(5, 0), 54], [bp(5, 1), 54], [bp(6, .1), 56], [bp(6, .7), 60], [bp(6, 1), 62], [bp(7, 0), 64.5], [bp(7, 1), 66], [bp(8, .15), 70], [bp(8, .5), 72], [bp(8, 1), 72], [bp(9, .2), 78], [bp(9, .55), 78], [bp(9, .8), 82], [bp(10, .1), 86], [bp(10, 1), 86]];
    const leafLying = V(0, 0, 0); let leafHome = 'carrier'; const qA = new T.Quaternion(), qB = new T.Quaternion(), eA = new T.Euler(), eB = new T.Euler();
    const hingeX = HB_X - .45, leafUpY = 1.05;
    const tl = V(0, 0, 0), tmp1 = V(0, 0, 0), tmp2 = V(0, 0, 0);
    const toWorld = (v, out) => out.copy(v); // yordamchi
    // yuk ko‘tarish yo‘li (quti): zavod darvozasidan mashinagacha va uy ichiga
    let boxMode = 'line';

    actors.push((p, t, dt) => {
      const e = (i, f0, f1) => seg(p, bp(i, f0), bp(i, f1));
      /* --- 1-akt: muhandis, mijoz, lazer, planshet (uy A) --- */
      const eP = engA.g.position, cP = cliA.g.position;
      const engKeys = [[0, [0, 0, 8.0]], [bp(0, .55), [0, 0, 0.9]], [bp(1, 0), [-.25, 0, -.55]], [bp(2, 1), [-.25, 0, -.55]], [bp(3, 0), [-.25, 0, -.55]]];
      c.KV(p, engKeys.map(k => [k[0], k[1]]), eP); const eMoving = p < bp(0, .6);
      c.KV(p, [[0, [1.9, 0, 8.6]], [bp(0, .6), [1.9, 0, .5]], [bp(0, 1), [1.9, 0, .4]], [1, [1.9, 0, .4]]], cP);
      engA.g.rotation.y = Math.PI * K(p, [[0, 1], [bp(1, 0), 1.03], [1, 1.03]]);
      cliA.g.rotation.y = K(p, [[0, Math.PI], [bp(0, .6), Math.PI], [bp(0, .8), Math.PI * 1.15], [1, Math.PI * 1.15]]);
      if (eMoving) walk(engA, t, 1); else idle(engA, t, 0);
      if (p < bp(0, .62)) walk(cliA, t, 1); else idle(cliA, t, 1.3);
      engA.g.visible = cliA.g.visible = p < bp(3, .35);
      // muhandis qo‘li: lazerni tutadi (1-bosqich), planshet (2-bosqich)
      const laz = within(p, 1), tab = within(p, 2);
      if (laz || (p > bp(0, .8) && p < bp(1, 0))) { engA.armR.rotation.x = -1.35; engA.armR.rotation.z = -.15; } else if (tab) { engA.armR.rotation.x = -1.0; engA.armL.rotation.x = -.95; }
      else { engA.armR.rotation.z = 0; }
      // lazer nuri va qizil nuqta
      const lz = c.lazer; if (lz) {
        const on = laz; lz.beam.visible = lz.dot.visible = on;
        if (on) {
          const u = e(1, .05, .45), v = e(1, .5, .9); const x = K(p, [[bp(1, 0), -.45], [bp(1, .45), .45], [bp(1, .5), .0], [bp(1, .9), .0]]), y = K(p, [[bp(1, 0), 1.1], [bp(1, .5), 1.1], [bp(1, .52), .02], [bp(1, .9), 2.05]]);
          const target = V(x, y, -3.46), start = V(eP.x + .1, 1.35, eP.z - .35);
          lz.dot.position.copy(target); const dir = tmp1.copy(target).sub(start), len = dir.length(); lz.beam.position.copy(start).addScaledVector(dir, .5); lz.beam.scale.set(1, len, 1); lz.beam.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize());
          const w = Math.round(lerp(0, 820, sm(u))), h = Math.round(lerp(0, 2040, sm(v)));
          if (c.hud) c.hud(v > 0 ? `Bo‘yi ${h} mm` : `Eni ${w} mm`, v > 0 ? { w: 820, h } : { w, h: 0 });
        } else if (c.hud) c.hud(null);
      }
      // planshet
      if (c.tablet) { c.tablet.mesh.visible = p > bp(1, .7) && p < bp(3, .3); if (c.tablet.mesh.visible) { c.tablet.mesh.position.set(eP.x + .05, 1.18, eP.z - .42); c.tablet.mesh.rotation.set(-.5, Math.PI, 0); c.tablet.show(e(2, .1, .6)); } }

      /* --- 2-akt: zavod --- */
      // yuk ko‘targich
      const fkx = K(p, [[0, 33], [bp(3, 0), 33], [bp(3, .35), 40.2], [bp(3, .5), 40.2], [bp(3, .75), 35], [bp(3, 1), 28]]); fk.position.x = fkx; forks.position.y = K(p, [[bp(3, .15), .9], [bp(3, .35), .9], [bp(3, .5), .15], [1, .15]]); fk.visible = p < bp(4, .1);
      driver.g.visible = true;
      pallet.position.set(K(p, [[0, 42], [bp(3, 0), 42]]), 0, 4.2); pallet.position.x = p < bp(3, .15) ? 41.2 : 42; pallet.position.y = 0; pallet.visible = p > bp(2, .8) || true;
      // plita: pallet → konveyer → kesish
      const sx = K(p, [[0, 42], [bp(3, .6), 42], [bp(3, .75), 43.5], [bp(3, 1), 46], [bp(4, .15), 46], [bp(4, .85), 50.3], [bp(4, 1), 52.2]]);
      const sz = K(p, [[bp(3, .55), 4.2], [bp(3, .75), 2.2], [bp(3, 1), 0], [bp(4, 1), 0]]); const sy = K(p, [[bp(3, .55), .5], [bp(3, .7), 1.5], [bp(3, 1), LINE_Y + .05], [bp(4, 1), LINE_Y + .05]]);
      sheet.position.set(sx, sy, sz); sheet.visible = p < bp(4, .98) && p > bp(2, .5);
      // kesilgan qoldiq
      const cut = e(4, .2, .8); offc.visible = p > bp(4, .5) && p < bp(5, 0); offc.position.set(K(p, [[bp(4, .5), 49], [bp(4, 1), 49.2]]), K(p, [[bp(4, .5), LINE_Y + .05], [bp(4, 1), LINE_Y - .3]]), K(p, [[bp(4, .5), 0], [bp(4, 1), 1.9]]));
      sheet.scale.z = 1 - .55 * sm(cut); sheet.position.z += (1 - sheet.scale.z) * 1.035 * -1;
      // arra g‘ildiragi, supurgi
      bladeAx.rotation.y = t * 30; const sawOn = p > bp(4, .15) && p < bp(4, .85); sawCar.position.z = sawOn ? K(p, [[bp(4, .15), -1.4], [bp(4, .85), 1.4]]) : -1.4; sawCar.position.y = sawOn ? 2.4 : 2.9;
      emit(dustS, SX.saw + .2, LINE_Y + .1, sawCar.position.z, sawOn, dt, 1.6, 1.6, 4);
      // yig‘ish (parchalar)
      const asmU = e(5, .05, .85), asmShow = p > bp(4, .95);
      leaf.visible = p > bp(4, .9) || p > bp(14, 0) - .0001; parts.forEach(m => { const u = 1 - sm(asmU); m.position.set(m.userData.x + m.userData.ex * u * .0 + (m.userData.ex || 0) * u * .8, (m.userData.ey || 0) * u * .8, m.userData.z + (m.userData.ez || 0) * u * .8); });
      press.position.y = K(p, [[bp(5, .6), 2.4], [bp(5, .85), 1.2], [bp(5, 1), 2.4]]);
      // tabaqa holati
      const lx = K(p, LEAF_X); const onLine = p < bp(10, 1);
      // silliqlash: ranglar silliqlanadi, g‘ildirak aylanadi
      belt.rotation.x = Math.PI / 2; belt.rotation.y = t * 14; const sandOn = p > bp(6, .12) && p < bp(6, .88);
      emit(dustSd, SX.sand + .1, LINE_Y + .15, 0, sandOn, dt, 1.0, 1.0, 3);
      leafMat.roughness = K(p, [[bp(6, .1), .98], [bp(6, .9), .62]]);
      // frezer: bosh harakati va chuqurchalar
      const cu = e(7, .08, .92); const cncOn = cu > 0 && cu < 1;
      const gk = grooves.length; let tipX = 0, tipZ = 0;
      grooves.forEach((g, i) => { const lo = i / gk, hi = (i + 1) / gk; const u = seg(cu, lo, hi); const s = clamp(u); if (g.userData.axis === 'x') g.scale.set(Math.max(.001, s), 1, 1); else g.scale.set(1, 1, Math.max(.001, s)); const gwid = g.geometry.parameters; if (u > 0 && u < 1) { tipX = g.userData.px - (gwid.width / 2) * (g.userData.axis === 'x' ? 1 - 2 * s : 0); tipZ = g.userData.pz - (g.userData.axis === 'z' ? (gwid.depth / 2) * (1 - 2 * s) : 0); } });
      grooves.forEach(g => { const gw2 = g.geometry.parameters; if (g.userData.axis === 'x') g.position.x = g.userData.px - (gw2.width / 2) * (1 - g.scale.x); else g.position.z = g.userData.pz - (gw2.depth / 2) * (1 - g.scale.z); });
      gantry.position.x = cncOn ? tipX + 0 : 0; head.position.z = cncOn ? tipZ : 0; bit.rotation.y = t * 40;
      emit(dustC, SX.cnc + (cncOn ? tipX : 0), LINE_Y + .12, cncOn ? tipZ : 0, cncOn, dt, .8, 1.0, 3);
      // bo‘yash: rang almashadi, robot qo‘li harakat qiladi
      const pu = e(8, .2, .85); const paintOn = pu > 0 && pu < 1; leafMat.color.setHex(MDF); const c0 = new T.Color(MDF), c1 = new T.Color(WALNUT); leafMat.color.copy(c0).lerp(c1, sm(pu)); leafMat.roughness = lerp(leafMat.roughness, .5, sm(pu));
      arm0.rotation.y = paintOn ? Math.sin(t * 1.8) * .7 : 0; arm1.rotation.x = paintOn ? .5 + Math.sin(t * 2.4) * .25 : .1; arm2.rotation.x = paintOn ? .3 : 0;
      const gp = V(0, 0, 0); gun.getWorldPosition(gp); emit(mist, gp.x, gp.y - .1, gp.z, paintOn, dt, .6, -.9, -.5, .8);
      // quritish
      const du = e(9, .1, .55); lampsMat.forEach(m => m.color.setRGB(lerp(.3, 1, du * (1 - e(9, .6, .75))), lerp(.16, .42, du * (1 - e(9, .6, .75))), lerp(.1, .15, du))); dryGlow.intensity = 6 * du * (1 - e(9, .6, .8));
      checkM.material.opacity = e(9, .85, 1) * (1 - e(10, 0, .15)); checkM.visible = p > bp(9, .8) && p < bp(10, .2); checkM.rotation.y = 0;
      // qadoqlash: plyonka va quti
      const pa = e(10, .05, .5), pb = e(10, .55, .95); film.visible = pa > 0; film.scale.set(1, sm(pa), 1); pack.visible = p > bp(10, .45); lid.position.y = lerp(.9, .09, sm(pb)); pack.userData.on = true;
      rollFilm.rotation.y = pa > 0 && pa < 1 ? t * 5 : 0;

      /* --- tabaqa / quti joylashuvi --- */
      const U = (i, f0, f1) => e(i, f0, f1);
      let mode = 'line';
      if (p >= bp(11, .05)) mode = 'carry';
      if (p >= bp(13, 0)) mode = 'house';
      if (mode === 'line') { carrier.position.set(lx, LINE_Y + .045 / 2 + .0, 0); carrier.rotation.set(0, 0, 0); leaf.position.set(0, 0, 0); leaf.rotation.set(0, 0, 0); carrier.visible = true; }
      // yuklash: ishchilar quti bilan darvoza orqali mashinaga
      const carryU = e(11, .05, .8);
      if (mode === 'carry') {
        const x = K(p, [[bp(11, .05), 86], [bp(11, .25), 88], [bp(11, .5), 95], [bp(11, .8), 98.6], [bp(11, .95), 98.6]]); const z = K(p, [[bp(11, .05), 0], [bp(11, .5), 0], [bp(11, .8), 0]]);
        const y = K(p, [[bp(11, .05), LINE_Y + .1], [bp(11, .2), 1.15], [bp(11, .8), 1.25], [bp(11, .95), 1.25]]); carrier.position.set(x, y, z); carrier.rotation.set(0, 0, 0);
      }
      // qutini mashina ichiga surish va yo‘l (kuzovda)
      const inTruck = p > bp(11, .82) && p < bp(13, .0); if (inTruck) { carrier.position.set(truck.position.x - 1.8 + K(p, [[bp(11, .8), 3.5], [bp(11, .98), 0]]), 1.45, truck.position.z); carrier.rotation.y = truck.rotation.y; }
      // yuk mashinasi harakati
      const drive = e(12, .22, 1); const tt = sm(drive); route.getPointAt(clamp(tt), trkP); route.getTangentAt(clamp(tt), trkT);
      truck.position.copy(drive > 0 ? trkP : V(100.4, 0, 0)); truck.rotation.y = drive > 0 ? Math.atan2(trkT.x, trkT.z) - Math.PI / 2 + Math.PI / 2 : 0;
      truck.rotation.y = Math.atan2(trkT.x, trkT.z) - Math.PI / 2; if (drive <= 0) { truck.rotation.y = 0; truck.position.set(100.4, 0, 0); }
      wheels.forEach(w => { w.rotation.z -= (drive > 0 && drive < 1 ? 14 * dt * (1 - Math.abs(drive - .5) * .6) : 0); });
      cargoDoor.rotation.y = -K(p, [[bp(11, .5), 0], [bp(11, .75), 1.7], [bp(12, .15), 1.7], [bp(12, .25), 0]]);
      // ishchilar: darvozagacha olib boradi
      const c1P = W.c1.g, c2P = W.c2.g; const cx = carrier.position.x;
      if (p >= bp(11, .05) && p < bp(11, .9)) { c1P.position.set(cx - 0.05, 0, -.62); c2P.position.set(cx - .05, 0, .62); c1P.rotation.y = c2P.rotation.y = Math.PI / 2; walk(W.c1, t, p > bp(11, .2) ? 1 : 0); walk(W.c2, t, p > bp(11, .2) ? 1 : 0); [W.c1, W.c2].forEach(w => { w.armL.rotation.x = w.armR.rotation.x = -.5; }); }
      else if (p >= bp(11, .9) && p < bp(13, 0)) { c1P.position.set(97.5, 0, -2.3 - e(12, 0, .3) * 3); c2P.position.set(97.5, 0, 2.3 + e(12, 0, .3) * 3); idle(W.c1, t); idle(W.c2, t, 2); c1P.rotation.y = c2P.rotation.y = Math.PI / 2; }

      /* --- 4-akt: uy B --- */
      const iA = inst1.g, iB = inst2.g, cB = cliB.g;
      const arrive = e(13, 0, .55);
      inst1.g.visible = inst2.g.visible = cliB.g.visible = p >= bp(12, .6);
      const ipath = (z0) => [[bp(12, .6), [HB_X - 9, 0, 14]], [bp(12, 1), [HB_X - .6, 0, 12.5]], [bp(13, .15), [HB_X - 1, 0, 6]], [bp(13, .45), [HB_X - .6, 0, -.8]], [bp(13, 1), [HB_X - .6, 0, -.9]]];
      // ikki o‘rnatuvchi quti bilan keladi
      const boxP = V(0, 0, 0); c.KV(p, [[bp(12, .8), [HB_X - 8, 0, 12.4]], [bp(13, .05), [HB_X - 1.5, 0, 9]], [bp(13, .35), [HB_X, 0, 1.4]], [bp(13, .5), [HB_X + .1, 0, -1.7]], [bp(13, 1), [HB_X + .1, 0, -1.7]]], boxP);
      c.KV(p, [[bp(12, .6), [HB_X - 8, 0, 13.5]], [bp(12, .8), [HB_X - 8.1, 0, 12.0]], [bp(13, .05), [HB_X - .7, 0, 8.2]], [bp(13, .35), [HB_X - .6, 0, 1.4]], [bp(13, .5), [HB_X - .55, 0, -1.2]], [bp(14, 0), [HB_X - .55, 0, -1.2]], [bp(14, .4), [HB_X - .1, 0, -1.9]], [bp(15, 0), [HB_X + .5, 0, -2.2]], [bp(16, .5), [HB_X + .6, 0, -2.2]], [1, [HB_X + .6, 0, -2.2]]], iA.position);
      c.KV(p, [[bp(12, .6), [HB_X - 8, 0, 14.6]], [bp(12, .8), [HB_X - 7.2, 0, 13]], [bp(13, .05), [HB_X + .5, 0, 8.2]], [bp(13, .35), [HB_X + .6, 0, 1.4]], [bp(13, .5), [HB_X + .6, 0, -1.2]], [bp(14, 0), [HB_X + .7, 0, -1.2]], [bp(14, .5), [HB_X + 1.1, 0, -1.7]], [bp(15, .5), [HB_X + 1.5, 0, -2.0]], [1, [HB_X + 1.5, 0, -2.0]]], iB.position);
      c.KV(p, [[bp(12, .9), [HB_X + 3.5, 0, 12]], [bp(13, .1), [HB_X + 3.2, 0, 3]], [bp(13, .5), [HB_X + 2.6, 0, 0]], [1, [HB_X + 2.6, 0, 0]]], cB.position);
      const mv = p >= bp(12, .6) && p < bp(13, .55);
      iA.rotation.y = K(p, [[bp(12, .6), 0], [bp(13, .45), 0], [bp(13, .6), Math.PI]]); iB.rotation.y = K(p, [[bp(12, .6), 0], [bp(13, .45), 0], [bp(13, .6), Math.PI]]); cB.rotation.y = K(p, [[bp(12, .9), Math.PI], [bp(13, .5), Math.PI * .95], [1, Math.PI * .9]]);
      if (mv) { walk(inst1, t, 1); walk(inst2, t, 1); walk(cliB, t, p > bp(12, .95) && p < bp(13, .4) ? 1 : 0); } else { idle(inst1, t); idle(inst2, t, 1); idle(cliB, t, 2); }
      if (p >= bp(12, .8) && p < bp(13, .5)) { [inst1, inst2].forEach(w => { w.armL.rotation.x = w.armR.rotation.x = -.55; }); }
      // quti uy ichida
      if (mode === 'house') {
        const pu2 = e(13, .55, 1); const lyingY = .62; carrier.position.set(p < bp(13, .5) ? boxP.x : HB_X + .1, K(p, [[bp(13, 0), 1.0], [bp(13, .5), 1.0], [bp(13, .6), .35], [bp(14, 1), .35]]), p < bp(13, .5) ? boxP.z : -1.7); carrier.rotation.set(0, Math.PI / 2, 0);
        carrier.visible = p < bp(14, .75);
        // qutini ochish: qopqoq ko‘tariladi
        lid.position.y = K(p, [[bp(13, .55), .09], [bp(13, .85), .9], [bp(14, .1), 1.8], [bp(14, .3), 3]]); film.visible = p < bp(13, .8);
        lid.visible = p < bp(14, .3);
      }
      // tabaqani romga joylash (tikka holatga o‘tish)
      const hu = e(14, .1, .9); const swapped = p >= bp(14, .05);
      if (swapped && leafHome !== 'world') { world.attach(leaf); leafHome = 'world'; } else if (!swapped && leafHome !== 'carrier') { carrier.attach(leaf); leaf.position.set(0, 0, 0); leaf.rotation.set(0, 0, 0); leafHome = 'carrier'; }
      if (leafHome === 'world') {
        // yotgan holat (qutidan) → tik holat (romda): kvaternion bilan silliq
        const lyingPos = V(HB_X + .1, .5, -1.7), upPos = V(hingeX + .45, 1.05 + .02, -3.58);
        eA.set(0, Math.PI / 2, 0); eB.set(Math.PI / 2, 0, 0); // yotgan → tik
        qA.setFromEuler(new T.Euler(0, 0, 0)); const rLay = new T.Euler(-Math.PI / 2, 0, 0); const rUp = new T.Euler(0, 0, 0);
        // leaf lokal: x=2.05 uzun, z=.9 keng. Tik uchun: uzun o‘q → Y. Z o‘qi atrofida 90° aylantiramiz, so‘ng Y bo‘yicha burib eshik yuzini +z ga qaratamiz
        const qLay = new T.Quaternion().setFromEuler(new T.Euler(0, Math.PI / 2, 0));
        const qUp = new T.Quaternion().setFromEuler(new T.Euler(0, Math.PI, Math.PI / 2, 'YZX'));
        const uu = sm(hu); leaf.quaternion.copy(qLay).slerp(qUp, uu);
        const lift = Math.sin(uu * Math.PI) * .35; leaf.position.set(lerp(lyingPos.x, upPos.x, uu), lerp(lyingPos.y, upPos.y, uu) + lift, lerp(lyingPos.z, upPos.z, uu));
        // petla atrofida ochilish/yopilish (oxirgi bosqich)
        const ou = e(17, .05, .95); const ang = K(p, [[bp(17, .05), 0], [bp(17, .35), -1.25], [bp(17, .55), -1.25], [bp(17, .8), 0], [bp(17, .92), -.55], [bp(17, 1), -.55]]);
        if (p >= bp(17, 0)) { // petla o‘qi atrofida burish
          const pivot = V(hingeX + .02, 0, -3.5); const base = V(upPos.x, upPos.y, upPos.z); const rel = base.clone().sub(pivot); rel.applyAxisAngle(V(0, 1, 0), ang); leaf.position.copy(pivot.add(rel)); const qa = new T.Quaternion().setFromAxisAngle(V(0, 1, 0), ang); leaf.quaternion.copy(qUp).premultiply(qa);
        }
      }
      hardware.visible = p > bp(15, .2) || false; hardware.visible = p > bp(15, .3);
      handle.scale.setScalar(sm(e(16, .1, .55))); handle.visible = p > bp(16, .05); hingeH.forEach(h => { h.visible = p > bp(15, .3); });
      // sath asbobi va burg‘i
      level.visible = p > bp(13, .6) && p < bp(14, .3); if (level.visible) { level.position.set(HB_X + .46 + .0, K(p, [[bp(13, .6), 1.6], [bp(13, .95), .5], [bp(14, .25), 2.0]]), -3.45); level.rotation.set(0, 0, Math.PI / 2); }
      shims.forEach((s, i) => { s.visible = p > bp(15, .1 + i * .1); });
      drill.visible = p > bp(15, .45) && p < bp(16, .2); if (drill.visible) { drill.position.set(HB_X - .47, K(p, [[bp(15, .45), 1.9], [bp(15, .8), .4], [bp(16, .1), 1.1]]), -3.3); drill.rotation.set(0, t * 20, 0); }
      // o‘rnatuvchilar qo‘llari: ish holati
      if (p >= bp(14, 0) && p < bp(15, 1)) { [inst1, inst2].forEach((w, k) => { w.armL.rotation.x = -.9 + Math.sin(t * 3 + k) * .1; w.armR.rotation.x = -.9; }); }
      else if (p >= bp(16, 0) && p < bp(17, .2)) { inst1.armR.rotation.x = -1.1 + Math.sin(t * 8) * .12; inst1.armL.rotation.x = -.5; }
      // uy B da ishchi yo‘lak
      for (const k of ['saw', 'a1', 'a2', 'sand', 'cnc', 'paint', 'qc', 'p1', 'p2', 'sup']) { const w = W[k]; const phase = (k.charCodeAt(0) + k.length) * .7; const on = k === 'saw' ? sawOn : k === 'sand' ? sandOn : k === 'cnc' ? cncOn : k === 'paint' ? paintOn : true; if (on) { w.armR.rotation.x = -.9 + Math.sin(t * 5 + phase) * .25; w.armL.rotation.x = -.8 + Math.cos(t * 4.4 + phase) * .22; w.torso.rotation.x = .12; } else idle(w, t, phase); }
      W.sup.g.position.x = 70 + Math.sin(t * .25) * 4; W.sup.g.rotation.y = Math.cos(t * .25) > 0 ? Math.PI / 2 : -Math.PI / 2; walk(W.sup, t, .6); W.sup.g.position.z = 4.5;
      // pastki ishchilar qadoqlashda
      if (p >= bp(10, 0) && p < bp(11, .02)) { [W.p1, W.p2].forEach((w, i) => { w.armR.rotation.x = -.8 + Math.sin(t * 4 + i) * .3; w.armL.rotation.x = -.7; }); }
      // qadoq ishchilari qatnashmaganda
      W.c1.g.visible = W.c2.g.visible = p >= bp(10, .95) && p < bp(13, 0);
      // yuk ko‘targich haydovchisi tomoni
      driver.g.rotation.y = 0;
    });
    c.leaf = leaf; c.truck = truck; c.route = route; c.HB_X = HB_X;
    // lazer, planshet va hud
    const beam = new T.Mesh(new T.CylinderGeometry(.006, .006, 1, 6), new T.MeshBasicMaterial({ color: 0xff2a2a })); beam.visible = false; world.add(beam);
    const dot = new T.Mesh(new T.SphereGeometry(.025, 10, 8), new T.MeshBasicMaterial({ color: 0xff3b3b })); dot.visible = false; world.add(dot);
    const dl = new T.PointLight(0xff2a2a, .6, 1.6); dot.add(dl);
    c.lazer = { beam, dot };
    const tcv = document.createElement('canvas'); tcv.width = 256; tcv.height = 170; const tg = tcv.getContext('2d'); const ttx = new T.CanvasTexture(tcv); if (T.sRGBEncoding) ttx.encoding = T.sRGBEncoding;
    const tmesh = new T.Mesh(new T.BoxGeometry(.3, .2, .012), [M(0x1c1f23, .4), M(0x1c1f23, .4), M(0x1c1f23, .4), M(0x1c1f23, .4), new T.MeshBasicMaterial({ map: ttx }), M(0x1c1f23, .4)]); tmesh.visible = false; world.add(tmesh);
    c.tablet = { mesh: tmesh, show(u) { tg.fillStyle = '#0f1420'; tg.fillRect(0, 0, 256, 170); tg.fillStyle = '#e9a45e'; tg.font = '700 15px sans-serif'; tg.fillText('YASINDOORS · BUYURTMA', 14, 24); tg.strokeStyle = '#f4efe4'; tg.lineWidth = 3; tg.strokeRect(86, 38, 60 * Math.min(1, u * 2), 112 * Math.min(1, Math.max(0, u * 2 - .2) / .8)); tg.fillStyle = '#f4efe4'; tg.font = '600 15px sans-serif'; if (u > .35) tg.fillText('Eni: 820 mm', 156, 76); if (u > .55) tg.fillText('Bo‘yi: 2040 mm', 156, 102); if (u > .8) { tg.fillStyle = '#43d08f'; tg.fillText('✓ Zavodga yuborildi', 14, 160); } ttx.needsUpdate = true; } };
    // atmosfera: zonaga qarab osmon/tuman/yorug‘lik
    const sky = [[0, [.81, .89, 1]], [bp(2, .9), [.81, .89, 1]], [bp(3, .2), [.72, .76, .82]], [bp(10, 1), [.72, .76, .82]], [bp(11, .5), [.78, .8, .84]], [bp(12, .5), [.95, .82, .62]], [bp(13, 0), [.86, .9, .96]], [1, [.88, .93, 1]]];
    const colv = V(0, 0, 0);
    c.mood = (p, cam) => { c.KV(p, sky, colv); c.scene.background.setRGB(colv.x, colv.y, colv.z); c.scene.fog.color.setRGB(colv.x, colv.y, colv.z); c.scene.fog.far = p < bp(3, .2) ? 90 : (p < bp(11, .5) ? 130 : 260); c.scene.fog.near = 30; c.sun.intensity = K(p, [[0, 1.9], [bp(3, .3), .7], [bp(11, .6), 1.4], [bp(12, .5), 2.0], [1, 1.9]]); c.hemi.intensity = K(p, [[0, .62], [bp(3, .3), .8], [bp(11, .6), .68], [1, .62]]); };
  };
  Y._cam = function (c) {
    const bp = Y.bp, HB = c.HB_X, route = c.route, P = new T.Vector3();
    const at = f => { route.getPointAt(clamp(sm(seg(f, .22, 1))), P); return [P.x, P.y, P.z]; };
    const chase = (f, dx, dy, dz, lx = 0, ly = 1.5, lz = 0) => { const a = at(f); return [[bp(12, f), [a[0] + dx, a[1] + dy, a[2] + dz], [a[0] + lx, a[1] + ly, a[2] + lz]]]; };
    const k = []; const add = (p, pos, look) => k.push([p, pos, look]);
    // 1-akt: uy A
    add(0, [3.4, 1.9, 10.5], [0, 1.4, 0]); add(bp(0, .55), [2.6, 1.75, 5.6], [0, 1.2, -1.2]);
    add(bp(1, 0), [-2.7, 1.55, 1.5], [-.1, 1.2, -2.1]); add(bp(1, .45), [-2.3, 1.45, .7], [-.1, 1.2, -2.6]); add(bp(1, .8), [2.3, 1.5, 1.3], [0, 1.2, -2.4]);
    add(bp(2, .1), [-3.6, 1.5, -.1], [-.25, 1.25, -.8]); add(bp(2, .6), [-3.3, 1.45, -.3], [-.25, 1.25, -.8]);
    add(bp(2, .85), [0, 4.5, 11], [8, 2.5, -2]); add(bp(3, 0), [24, 7, 22], [40, 1.5, 3]);
    // 2-akt: zavod (stansiyalar bo‘ylab)
    add(bp(3, .3), [34, 3.6, 13], [41, 1.2, 3.8]); add(bp(3, .75), [40, 3.4, 10], [43.5, 1.1, 2]);
    add(bp(4, .1), [46, 3.2, 7.2], [47.5, 1.2, 0]); add(bp(4, .8), [49.5, 2.6, 5.6], [49.5, 1.3, 0]);
    add(bp(5, .1), [53, 3.4, 6.2], [54, 1.1, 0]); add(bp(5, .9), [55, 3.0, 5.2], [54, 1.2, 0]);
    add(bp(6, .15), [58, 3.2, 6.0], [59.5, 1.4, 0]); add(bp(6, .85), [62, 3.0, 5.6], [61, 1.2, 0]);
    add(bp(7, .1), [64, 3.8, 6.2], [65.5, 1.1, 0]); add(bp(7, .9), [67.5, 3.2, 5.0], [66, 1.1, 0]);
    add(bp(8, .1), [71, 3.0, 8.5], [72, 1.7, 0]); add(bp(8, .9), [73.5, 3.6, 8.5], [72, 1.6, 0]);
    add(bp(9, .1), [77, 3.0, 6.5], [78, 1.4, 0]); add(bp(9, .9), [82, 2.8, 5.6], [82, 1.3, 0.8]);
    add(bp(10, .1), [85, 2.6, 5.2], [86, 1.1, 0]); add(bp(10, .9), [88, 3.0, 5.8], [86.5, 1.1, 0]);
    // 3-akt: yuklash va yo‘l
    add(bp(11, .2), [91, 3.2, 8.5], [91, 1.3, 0]); add(bp(11, .75), [94, 3.0, 9.5], [98, 1.5, 0]);
    chase(.05, -8, 4, 11).forEach(a => k.push(a)); chase(.3, -13, 4.4, 13, 3, 1.4, 0).forEach(a => k.push(a)); chase(.55, -14, 4.2, 14, 4, 1.4, 0).forEach(a => k.push(a)); chase(.8, -13, 3.8, 12, 4, 1.4, 0).forEach(a => k.push(a)); chase(1, -11, 3.6, 11, 3, 1.5, -1).forEach(a => k.push(a));
    // 4-akt: uy B
    add(bp(13, .15), [HB - 5, 2.6, 15.5], [HB - 1, 1.4, 6]); add(bp(13, .5), [HB - 1.8, 1.7, 5.6], [HB, 1.1, -1.5]);
    add(bp(13, .95), [HB + 1.7, 1.5, .4], [HB, 1.0, -2.6]);
    add(bp(14, .4), [HB + 1.6, 1.5, -.6], [HB, 1.1, -3.1]); add(bp(14, .95), [HB + .3, 1.5, 1.2], [HB, 1.1, -3.5]);
    add(bp(15, .5), [HB - 2.2, 1.5, .8], [HB - .3, 1.05, -3.5]);
    add(bp(16, .5), [HB + 1.9, 1.35, .9], [HB + .15, 1.05, -3.5]);
    add(bp(17, .2), [HB + .5, 1.4, 1.6], [HB, 1.1, -3.5]); add(bp(17, .6), [HB - .6, 1.5, 3.2], [HB, 1.2, -3.5]);
    add(1, [HB, 1.55, 5.4], [HB, 1.2, -3.6]);
    return k;
  };
})();
