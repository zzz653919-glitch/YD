/* ===== YasinDoors — scene3d-world.js: zavod uskunalari, yuk mashinasi, tashqi muhit, odamlar va kamera yo‘li ===== */
(function () {
  'use strict';
  const Y = window.YDScene; if (!Y || !window.THREE) return;
  const T = window.THREE, L = Y._lib, { clamp, lerp, sm, seg } = L;

  Y._build = function (c) {
    const { world, actors, M, GL, box, rb, cyl, add, grp, person, walker, settle, crouch, reach, handPos, blob, tex, withTex, woodMat, K, V, bp, mobile } = c;
    const SH = c.SHADOWS, B = i => Y.BEATS[i];
    const FX0 = 34, FX1 = 92, LINE_Y = .95, LT = .045;
    const steel = M(0x8a929a, .32, .9), steelD = M(0x4b525a, .4, .8), dark = M(0x2a2e33, .55, .35), black = M(0x15171a, .5, .2), chrome = M(0xd5d9dd, .12, 1, { envMapIntensity: 1.4 });
    const blue = M(0x2f5f95, .38, .35, { envMapIntensity: .9 }), orange = M(0xe8742a, .45, .2), yellow = M(0xe8b520, .45, .15), white = M(0xeeede8, .45, .05), red = M(0xc9362b, .45, .2);
    const cf = withTex(tex.concrete(), 15, 7), conc = M(0xffffff, .5, 0, { map: cf.map, bumpMap: cf.bump, bumpScale: 0.12, envMapIntensity: .8 });
    const WALNUT = 0x5c3c28;
    const screenCv = (txt, col) => { const cv = document.createElement('canvas'); cv.width = 128; cv.height = 80; const g = cv.getContext('2d'); g.fillStyle = '#0c1118'; g.fillRect(0, 0, 128, 80); g.fillStyle = col; g.font = '700 14px sans-serif'; g.fillText(txt, 8, 22); g.fillStyle = col + '88'; for (let i = 0; i < 6; i++) g.fillRect(8, 34 + i * 7, 20 + ((i * 37) % 80), 3); const t = new T.CanvasTexture(cv); if (T.sRGBEncoding) t.encoding = T.sRGBEncoding; return t; };
    const screen = (parent, w, h, x, y, z, txt, col, rx = 0) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: screenCv(txt, col), toneMapped: false })); m.position.set(x, y, z); m.rotation.x = rx; parent.add(m); return m; };
    const console_ = (parent, x, z, ry, txt, col) => { const g = grp(parent, x, 0, z); g.rotation.y = ry; rb(g, .5, .9, .4, steelD, 0, .45, 0, .02); rb(g, .62, .06, .5, black, 0, .93, 0, .015); const sc = grp(g, 0, 1.05, -.1); sc.rotation.x = -.3; rb(sc, .46, .3, .04, black, 0, 0, 0, .012); screen(sc, .4, .24, 0, 0, .025, txt, col); box(g, .08, .05, .08, red, .2, .97, .1, false); cyl(g, .04, .04, .03, red, -.2, .96, .12, 10, false); return g; };
    const pipe = (parent, pts, r, mat) => add(parent, new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p => V(p[0], p[1], p[2])), false, 'catmullrom', .2), 24, r, 8, false), mat, 0, 0, 0, false);
    const hazardM = M(0xffffff, .6, 0, { map: tex.hazard() });

    /* ---------- Zavod binosi ---------- */
    const F = grp(world, 0, 0, 0);
    const fl = add(F, new T.PlaneGeometry(FX1 - FX0 + 6, 30), conc, (FX0 + FX1) / 2 + 1, 0, 6, false); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = SH;
    const pw = withTex(tex.plaster(), 18, 3), wallM = M(0xdadde0, .8, 0, { map: pw.map, bumpMap: pw.bump, bumpScale: 0.05 }), wallDk = M(0x8c959d, .7);
    box(F, FX1 - FX0, 10, .3, wallM, (FX0 + FX1) / 2, 5, -9.2);
    box(F, .3, 10, 10.5, wallM, FX0, 5, -3.75); box(F, .3, 10, 2, wallM, FX0, 5, 8); box(F, .3, 5, 5.5, wallM, FX0, 7.5, 4.25); // chap devor: yuk ko‘targich kiradigan darvoza (5.5 × 5 m)
    [1.5, 7].forEach(z => box(F, .5, 5.2, .5, yellow, FX0, 2.6, z, false)); box(F, .45, .6, 5.9, hazardM, FX0, 5.3, 4.25, false);
    { const sg = document.createElement('canvas'); sg.width = 1024; sg.height = 200; const g = sg.getContext('2d'); g.fillStyle = '#16181b'; g.fillRect(0, 0, 1024, 200); g.fillStyle = '#e9a45e'; g.beginPath(); g.arc(90, 100, 34, 0, 7); g.fill(); g.fillStyle = '#f4efe4'; g.font = '700 96px sans-serif'; g.textBaseline = 'middle'; g.fillText('YASINDOORS', 150, 104); g.font = '600 34px sans-serif'; g.fillStyle = '#b9b2a4'; g.fillText('MDF ESHIKLAR · ZAVOD', 560, 150); const st = new T.CanvasTexture(sg); if (T.sRGBEncoding) st.encoding = T.sRGBEncoding; const sp = new T.Mesh(new T.PlaneGeometry(9, 1.76), new T.MeshBasicMaterial({ map: st, toneMapped: false })); sp.rotation.y = -Math.PI / 2; sp.position.set(FX0 - .17, 7.6, -3.8); F.add(sp); }
    for (let i = 0; i < 3; i++) { box(F, .08, 1.4, 2.6, GL(0xbcdcf8, .45), FX0 - .17, 3.2, -7.3 + i * 3.4, false); box(F, .1, .08, 2.8, steelD, FX0 - .18, 3.95, -7.3 + i * 3.4, false); box(F, .1, .08, 2.8, steelD, FX0 - .18, 2.5, -7.3 + i * 3.4, false); }
    box(F, .3, 3, 18, wallM, FX1, 8.5, 0); box(F, .3, 10, 6.2, wallM, FX1, 5, 6.1); box(F, .3, 10, 6.2, wallM, FX1, 5, -6.1);
    box(F, FX1 - FX0, 1.1, .34, wallDk, (FX0 + FX1) / 2, .55, -9.0, false);
    for (let i = 0; i < 9; i++) { const x = FX0 + 6 + i * 6.2; box(F, 3.4, 1.3, .08, GL(0xbcdcf8, .45), x, 7.6, -9.0, false); box(F, 3.5, .08, .12, steelD, x, 8.3, -9.0, false); box(F, 3.5, .08, .12, steelD, x, 6.9, -9.0, false); box(F, .06, 1.3, .12, steelD, x, 7.6, -9.0, false); }
    for (let i = 0; i < 11; i++) { box(F, .3, .5, 18.4, steel, FX0 + 3 + i * 5.4, 9.2, 0, false); box(F, .08, 1.0, .08, steelD, FX0 + 3 + i * 5.4, 8.6, 0, false); } // tom to‘sinlari
    // tom: yorug‘lik tushadigan tirqishlar (soyali nur dog‘lari)
    for (let i = 0; i < 6; i++) { const z0 = -9 + i * 3; box(F, FX1 - FX0, .3, 1.9, M(0x9aa2a8, .6, .3), (FX0 + FX1) / 2, 9.9, z0 + .95, true); }
    for (let i = 0; i < 6; i++) { const zz = -7.2 + i * 2.9; const hx = FX0 + 8; for (let k = 0; k < 6; k++) { const x = hx + k * 9; box(F, 3.2, .1, .22, M(0x111111, .5, 0, { emissive: 0xfff3dc, emissiveIntensity: 2.2 }), x, 8.35, zz, false); box(F, 3.3, .06, .34, steelD, x, 8.43, zz, false); if (i % 2 === 0) { box(F, .02, .7, .02, steelD, x - 1.4, 8.8, zz, false); box(F, .02, .7, .02, steelD, x + 1.4, 8.8, zz, false); } } }
    for (let i = 0; i < 7; i++) { box(F, .5, 9, .5, M(0xc8ced2, .5, .5), FX0 + 2 + i * 9, 4.5, -8.7, false); box(F, .62, .2, .62, steelD, FX0 + 2 + i * 9, .1, -8.7, false); }
    [-4.5, 4.5].forEach(z => { box(F, FX1 - FX0 - 6, .02, .16, yellow, (FX0 + FX1) / 2, .012, z, false); }); // sariq belgilar
    // devordagi javonlar va MDF plitalar
    const mdfT = tex.mdf(), mdfM = M(0xffffff, .88, 0, { map: mdfT.map, bumpMap: mdfT.bump, bumpScale: 0.025 });
    for (let s = 0; s < 3; s++) { box(F, 14, .08, 1.4, steel, 44, .75 + s * 1.5, -8.3, false); [-6.9, 6.9].forEach(x => box(F, .08, 1.6 + s * 0, 1.4, orange, 44 + x, .8 + s * 0, -8.3, false)); for (let i = 0; i < 6; i++) rb(F, 2.0, .5, 1.1, mdfM, 38.5 + i * 2.3, 1.05 + s * 1.5, -8.3, .015); }
    box(F, 6, 1.2, .2, black, 64, 6.4, -9.0, false);
    const logo = new T.Mesh(new T.PlaneGeometry(5.4, 1.0), new T.MeshBasicMaterial({ map: (function () { const cv = document.createElement('canvas'); cv.width = 540; cv.height = 100; const g = cv.getContext('2d'); g.fillStyle = '#16181b'; g.fillRect(0, 0, 540, 100); g.fillStyle = '#e9a45e'; g.font = '700 52px sans-serif'; g.textBaseline = 'middle'; g.fillText('●', 24, 52); g.fillStyle = '#f4efe4'; g.font = '700 52px "Inter Tight",sans-serif'; g.fillText('YASINDOORS', 84, 52); const t = new T.CanvasTexture(cv); if (T.sRGBEncoding) t.encoding = T.sRGBEncoding; return t; })(), toneMapped: false }));
    logo.position.set(64, 6.4, -8.88); F.add(logo);
    // quvurlar, chang yig‘ish quvuri, o‘t o‘chirgich, belgilar
    pipe(F, [[FX0 + 2, 7.2, -8.4], [60, 7.2, -8.4], [60, 5, -6], [FX1 - 3, 5, -6]], .22, M(0x9fa8b0, .35, .8)); pipe(F, [[60, 8.4, -.2], [60, 5.8, -.2], [60.4, 4.4, -.2]], .2, M(0x9fa8b0, .35, .8)); pipe(F, [[66, 8.4, -2.4], [66, 6.5, -2.4]], .2, M(0x9fa8b0, .35, .8));
    [[40, -8.55], [76, -8.55], [FX1 - .3, 8.5]].forEach(([x, z]) => { const e = grp(F, x, 1.4, z); cyl(e, .08, .08, .38, red, 0, 0, 0, 10, false); cyl(e, .03, .03, .08, black, 0, .22, 0, 8, false); box(e, .3, .3, .02, red, 0, .4, -.1, false); });
    // sex ichida yurish yo‘laklari (xavfsizlik)
    [-3.2, 3.2].forEach(z => box(F, 40, .006, .3, hazardM, 62, .013, z, false));

    // konveyer: ramka, rolik, tayanch, yo‘naltiruvchi
    [-.62, .62].forEach(z => { rb(F, 49, .14, .1, steel, 59.6, LINE_Y - .07, z, .02); rb(F, 49, .06, .1, yellow, 59.6, LINE_Y + .05, z * 1.04, .015, false); });
    for (let x = 36; x <= 84; x += 4) { [-.55, .55].forEach(z => rb(F, .12, LINE_Y - .14, .08, steelD, x, (LINE_Y - .14) / 2, z, .01)); rb(F, .1, .06, 1.2, steelD, x, LINE_Y - .2, 0, .01, false); }
    const rollers = new T.InstancedMesh(new T.CylinderGeometry(.045, .045, 1.14, 10), chrome, 185); const dm = new T.Object3D(); for (let i = 0; i < 185; i++) { dm.position.set(36.3 + i * .26, LINE_Y - .005, 0); dm.rotation.set(Math.PI / 2, 0, 0); dm.updateMatrix(); rollers.setMatrixAt(i, dm.matrix); } F.add(rollers);

    /* ---------- Stanoklar ---------- */
    const SX = { pallet: 42, saw: 48, asm: 54, sand: 60, cnc: 66, paint: 72, dry: 78, qc: 82, pack: 86 };
    const stationBase = (g, w, d) => { rb(g, w, .06, d, M(0x202428, .6), 0, .03, 0, .01, false); box(g, w + .4, .01, .25, hazardM, 0, .008, d / 2 + .2, false); box(g, w + .4, .01, .25, hazardM, 0, .008, -d / 2 - .2, false); };
    // 1) pallet + MDF plitalar
    const pallet = grp(F, 42, 0, 4.2); const wd = woodMat('oak', 0xa88356, .8, 1, 1, { clearcoat: 0 });
    [-1.05, 0, 1.05].forEach(z => rb(pallet, 2.4, .1, .18, wd, 0, .06, z, .01)); for (let i = 0; i < 7; i++) rb(pallet, .14, .028, 2.4, wd, -1.05 + i * .35, .125, 0, .006); [-1.1, 0, 1.1].forEach(x => [-1.05, 0, 1.05].forEach(z => rb(pallet, .14, .08, .14, wd, x, .03, z, .008, false)));
    const stack = []; for (let i = 0; i < 5; i++) stack.push(rb(pallet, 2.8, .045, 2.07, mdfM, 0, .17 + i * .05, 0, .005)); [-.6, .6].forEach(x => box(pallet, .03, .3, 2.16, black, x, .26, 0, false));
    // yuk ko‘targich (+x ga qaragan): shassi, o‘rindiq, himoya to‘ri, g‘ildiraklar, machta, vilkalar
    const fk = grp(F, 34, 0, 4.2); const fkb = grp(fk);
    rb(fkb, 1.7, .5, 1.0, orange, -.15, .55, 0, .06); rb(fkb, .75, .55, 1.0, orange, -.78, 1.05, 0, .08); rb(fkb, 1.2, .05, .9, black, .1, .81, 0, .01, false);
    rb(fkb, .6, .1, .7, black, -.15, 1.2, 0, .04); rb(fkb, .1, .55, .7, black, -.47, 1.5, 0, .04); rb(fkb, .12, .4, .5, black, .5, .95, 0, .03);
    [[.45, .5], [.45, -.5], [-.5, .5], [-.5, -.5]].forEach(([x, z]) => box(fkb, .05, 1.7, .05, dark, x, 1.65, z, false)); rb(fkb, 1.1, .05, 1.1, dark, 0, 2.5, 0, .01, false); for (let i = 0; i < 6; i++) box(fkb, 1.1, .015, .02, dark, 0, 2.47, -.45 + i * .18, false);
    const wheelG = grp(fkb, .42, 1.55, 0); wheelG.rotation.z = -.9; cyl(wheelG, .13, .13, .03, black, 0, 0, 0, 16, false); cyl(wheelG, .02, .02, .5, black, 0, -.25, 0, 6, false);
    const mast = grp(fkb, .95, 0, 0); [-.4, .4].forEach(z => { rb(mast, .1, 2.4, .12, steelD, 0, 1.25, z, .015); rb(mast, .08, 2.3, .08, steel, .08, 1.3, z * .8, .01); }); rb(mast, .1, .1, .98, steelD, 0, 2.4, 0, .01, false); rb(mast, .12, .12, .98, steelD, 0, .35, 0, .015, false);
    const forks = grp(mast, .12, .15, 0); [-.32, .32].forEach(z => { rb(forks, .08, 1.2, .14, steelD, .05, .58, z, .01, false); rb(forks, 1.3, .06, .14, steelD, .65, 0, z, .01); }); rb(forks, .08, .9, .96, steel, .05, .45, 0, .01, false);
    [[-.55, .55], [-.55, -.55], [.55, .5], [.55, -.5]].forEach(([x, z]) => { const w = cyl(fkb, .26, .26, .2, M(0x1a1a1a, .95), x, .26, z * 1.02, 18); w.rotation.x = Math.PI / 2; cyl(w, .12, .12, .22, chrome, 0, 0, 0, 10, false); });
    box(fkb, .3, .06, .06, M(0x111, .5, 0, { emissive: 0xffa040, emissiveIntensity: 2.4 }), -.6, 2.55, 0, false);
    // 2) kesish stanogi (x=48): beam saw
    const saw = grp(F, SX.saw, 0, 0); stationBase(saw, 4.2, 3.8);
    rb(saw, 4.0, .2, 1.5, steelD, 0, LINE_Y - .15, 0, .02); rb(saw, 3.6, .04, 1.3, M(0x707880, .25, .9), 0, LINE_Y - .03, 0, .01, false);
    [-1.6, 1.6].forEach(z => { rb(saw, .4, 2.7, .4, blue, .3, 1.5, z, .04); rb(saw, .5, .12, .5, steelD, .3, .1, z, .01, false); }); rb(saw, .55, .5, 3.9, blue, .3, 3.0, 0, .05);
    const sawCar = grp(saw, .3, 2.5, 0); rb(sawCar, .7, .7, .65, steel, 0, 0, 0, .05); rb(sawCar, .5, .9, .45, blue, 0, .2, 0, .05); rb(sawCar, .75, .5, .08, GL(0xcfe6ff, .35), 0, -.55, .0, .01, false);
    const blade = cyl(sawCar, .46, .46, .025, M(0xc9cdd1, .2, 1, { envMapIntensity: 1.4 }), 0, -.6, 0, 40); blade.rotation.x = Math.PI / 2; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; const tooth = box(blade, .05, .03, .05, M(0x9aa0a6, .2, 1), Math.cos(a) * .46, 0, Math.sin(a) * .46, false); tooth.rotation.y = -a; }
    const bladeAx = blade; box(sawCar, .5, .28, .5, orange, 0, -.35, -.35);
    pipe(saw, [[.3, 3.0, -1.8], [.3, 4.8, -2.4], [.3, 6.8, -2.4]], .1, M(0x3a3f45, .8, .2)); rb(saw, .4, 1.2, .5, black, 1.9, .6, -1.3, .02); screen(saw, .3, .22, 1.9, 1.15, -1.04, 'SAW 2040', '#43d08f', 0);
    [[-2.1, 1.9], [2.1, 1.9]].forEach(([x, z]) => { cyl(saw, .035, .035, 1.4, yellow, x, .7, z, 8, false); box(saw, .1, .1, .1, M(0x111111, .5, 0, { emissive: 0xff3322, emissiveIntensity: 2 }), x, 1.45, z, false); });
    // 3) yig‘ish: gidravlik press (x=54)
    const asm = grp(F, SX.asm, 0, 0); stationBase(asm, 3.6, 3.4);
    [-1.25, 1.25].forEach(z => { rb(asm, .35, 2.6, .35, blue, -.9, 1.3, z, .04); rb(asm, .35, 2.6, .35, blue, .9, 1.3, z, .04); }); [-1.25, 1.25].forEach(z => rb(asm, 2.1, .4, .4, blue, 0, 2.7, z, .04));
    const press = grp(asm, 0, 2.4, 0); rb(press, 2.0, .28, 1.5, steel, 0, 0, 0, .03); rb(press, 1.9, .06, 1.4, black, 0, -.17, 0, .01, false); [-.7, 0, .7].forEach(x => { cyl(asm, .09, .09, .5, chrome, x, 2.9, 0, 12); cyl(asm, .13, .13, .3, steelD, x, 3.2, 0, 12); });
    [-.5, .5].forEach(z => rb(asm, 2.4, .08, .1, yellow, 0, LINE_Y + .08, z * 1.5, .01, false));
    const manom = cyl(asm, .09, .09, .04, white, -.92, 2.0, 1.45, 16, false); manom.rotation.x = Math.PI / 2;
    // 4) silliqlash: keng lentali silliqlash stanogi (x=60)
    const sand = grp(F, SX.sand, 0, 0); stationBase(sand, 3.2, 3.4);
    rb(sand, 2.6, 1.1, 2.5, M(0x4a5560, .45, .4), 0, 2.45, 0, .06); [-1.1, 1.1].forEach(z => rb(sand, .32, 1.8, .32, M(0x39434d, .45, .4), 0, .95, z, .03)); rb(sand, 2.4, .06, 2.3, steelD, 0, 1.95, 0, .01, false);
    const belt = cyl(sand, .3, .3, 1.4, M(0xc2b08a, .98, 0, { bumpMap: tex.fabric(), bumpScale: 0.25 }), 0, 1.66, 0, 24); belt.rotation.x = Math.PI / 2; box(sand, 2.5, .06, .1, yellow, 0, 3.02, 1.27, false); screen(sand, .6, .38, 0, 2.5, 1.27, 'SANDER  OK', '#77d27a', 0); rb(sand, .66, .44, .04, black, 0, 2.5, 1.255, .01, false);
    pipe(sand, [[0, 3.0, 0], [0, 5.5, .2], [.4, 6.8, .2]], .2, M(0x9fa8b0, .35, .8));
    // 5) CNC frezer: portal, vakuum stol, shpindel (x=66)
    const cnc = grp(F, SX.cnc, 0, 0); stationBase(cnc, 3.6, 3.8);
    [-1.5, 1.5].forEach(z => { rb(cnc, .5, 2.7, .5, blue, 0, 1.4, z, .05); rb(cnc, .5, .2, 3.4, blue, 0, .1, 0, .02, false); }); const gantry = grp(cnc, 0, 2.7, 0); rb(gantry, .6, .5, 3.6, blue, 0, 0, 0, .05); rb(gantry, .62, .1, 3.7, steel, 0, .3, 0, .02, false);
    const head = grp(gantry, 0, -.4, 0); rb(head, .5, .55, .5, M(0x3c4650, .35, .6), 0, 0, 0, .05); rb(head, .28, .4, .28, steel, 0, -.4, 0, .04); const bit = cyl(head, .02, .02, .35, M(0xd0d4d8, .15, 1), 0, -.78, 0, 8); cyl(head, .16, .12, .12, black, 0, -.68, 0, 14, false); box(head, .36, .06, .36, M(0x222222, .9), 0, -.76, 0, false);
    [[-.3, 0], [.3, 0]].forEach(([x]) => box(cnc, .04, 1.4, .04, steelD, x, 2.0, -1.78, false)); rb(cnc, .5, 1.1, .4, black, 2.1, .55, -.6, .02); screen(cnc, .4, .26, 2.1, 1.05, -.38, 'CNC  R-27', '#6fb7ff', 0);
    // 6) bo‘yash kabinasi + robot qo‘l (x=72)
    const booth = grp(F, SX.paint, 0, 0); stationBase(booth, 3.8, 3.8);
    rb(booth, 3.4, .12, 3.4, M(0xcfd5d9, .4, .3), 0, 3.15, 0, .02); box(booth, 3.0, .04, 3.0, M(0x111, .5, 0, { emissive: 0xffffff, emissiveIntensity: 1.8 }), 0, 3.05, 0, false);
    [[-1.7, -1.7], [1.7, -1.7], [-1.7, 1.7], [1.7, 1.7]].forEach(([x, z]) => rb(booth, .14, 3.1, .14, steel, x, 1.55, z, .02)); [-1, 1].forEach(s => { rb(booth, 3.4, .1, .1, steel, 0, 3.05, s * 1.7, .015, false); rb(booth, .1, .1, 3.4, steel, s * 1.7, 3.05, 0, .015, false); });
    box(booth, 3.4, 3.0, .05, GL(0xcfe6ff, .16), 0, 1.5, -1.7, false); box(booth, .05, 3.0, 3.4, GL(0xcfe6ff, .16), -1.7, 1.5, 0, false); box(booth, .05, 3.0, 3.4, GL(0xcfe6ff, .16), 1.7, 1.5, 0, false); box(booth, 3.4, .5, .08, white, 0, .35, -1.7, false);
    for (let i = 0; i < 4; i++) rb(booth, .7, .5, .06, M(0xe9e4d6, .95, 0, { bumpMap: tex.fabric(), bumpScale: 0.15 }), -1.2 + i * .8, 3.35, -1.2, .01, false);
    const arm0 = grp(booth, 0, 2.95, -1.3); rb(arm0, .45, .3, .45, M(0xe8e4dc, .4, .3), 0, .05, 0, .05); const arm1 = grp(arm0, 0, -.05, 0); rb(arm1, .18, .18, 1.2, M(0xf3f1ec, .35, .3), 0, 0, .6, .04); cyl(arm1, .12, .12, .22, orange, 0, 0, 0, 14, false); const arm2 = grp(arm1, 0, 0, 1.2); cyl(arm2, .1, .1, .22, orange, 0, 0, 0, 14, false).rotation.z = Math.PI / 2; rb(arm2, .13, 1.0, .13, M(0xf3f1ec, .35, .3), 0, -.5, 0, .04); const gun = grp(arm2, 0, -1.02, .02); rb(gun, .1, .22, .22, black, 0, 0, .06, .02); cyl(gun, .018, .018, .2, chrome, 0, -.08, .17, 8, false).rotation.x = Math.PI / 2;
    pipe(booth, [[0, 3.2, 0], [0, 5.2, .2], [.4, 7.0, .2]], .24, M(0x9fa8b0, .35, .8)); box(booth, .12, .12, .12, M(0x111, .5, 0, { emissive: 0x33dd77, emissiveIntensity: 2.2 }), 1.9, 3.3, 1.7, false);
    // 7) quritish: infraqizil tunnel (x=78)
    const dry = grp(F, SX.dry, 0, 0); stationBase(dry, 3.6, 3.0);
    [[-1.5, -.95], [1.5, -.95], [-1.5, .95], [1.5, .95]].forEach(([x, z]) => rb(dry, .14, 2.45, .14, steel, x, 1.25, z, .02)); rb(dry, 3.3, .2, 2.2, M(0xc4ccd2, .4, .5), 0, 2.45, 0, .03); [-1, 1].forEach(s => rb(dry, 3.3, .35, .08, M(0x5b646c, .4, .6), 0, 2.2, s * .98, .01, false));
    const lampsMat = []; for (let i = 0; i < 4; i++) { const m = new T.MeshBasicMaterial({ color: 0x4a2a1a, toneMapped: false }); lampsMat.push(m); box(dry, 2.9, .07, .12, m, 0, 2.28, -.66 + i * .44, false); box(dry, 3.0, .03, .26, steelD, 0, 2.33, -.66 + i * .44, false); }
    const dryGlow = new T.PointLight(0xff7a2a, 0, 6); dryGlow.position.set(SX.dry, 1.9, 0); F.add(dryGlow); pipe(dry, [[1.2, 2.6, 0], [1.4, 4.2, 0], [2.4, 6.4, 0]], .18, M(0x9fa8b0, .35, .8));
    // 8) QC stoli va nazorat chiroqlari (x=82) + qadoqlash (x=86)
    const qc = grp(F, SX.qc, 0, 0); stationBase(qc, 3.0, 3.0); rb(qc, 1.6, .06, .8, woodMat('oak', 0xc7a878, .5), 0, .98, 2.4, .01); [-.7, .7].forEach(x => rb(qc, .06, .96, .7, steelD, x, .48, 2.4, .01, false)); rb(qc, .5, .32, .03, black, .3, 1.28, 2.55, .012, false); screen(qc, .44, .26, .3, 1.28, 2.53, 'QC  PASS', '#43d08f', 0.05).rotation.y = Math.PI; rb(qc, .4, .02, .3, white, -.4, 1.02, 2.4, .005, false);
    [-1.2, 1.2].forEach(z => { box(qc, .05, 2.4, .05, steelD, 1.1, 1.2, z * .95, false); }); box(qc, .08, .07, 2.3, M(0x111, .5, 0, { emissive: 0xffffff, emissiveIntensity: 2.4 }), 1.1, 2.4, 0, false);
    const pk = grp(F, SX.pack, 0, 0); stationBase(pk, 3.6, 3.6); rb(pk, 3.0, .08, 1.8, M(0x7d868e, .3, .8), 0, .945, 0, .015); [[-1.4, -.8], [1.4, -.8], [-1.4, .8], [1.4, .8]].forEach(([x, z]) => rb(pk, .1, .9, .1, steelD, x, .45, z, .01, false));
    box(pk, .12, 1.8, .12, steel, 1.9, 2.6, -1.2); box(pk, .12, 1.8, .12, steel, 1.9, 2.6, 1.2); box(pk, .1, .1, 2.5, steel, 1.9, 3.5, 0);
    const rollFilm = cyl(pk, .17, .17, .8, GL(0xcfe0f0, .55), -1.9, 1.35, 1.8, 16); rollFilm.rotation.z = Math.PI / 2; cyl(pk, .05, .05, .9, steelD, -1.9, 1.35, 1.8, 8, false).rotation.z = Math.PI / 2; box(pk, .05, 1.4, .05, steelD, -1.9, .7, 1.8, false);
    // yuklash zonasi — darvoza ramkasi, to‘siqlar
    box(F, .5, 5.2, .5, yellow, FX1, 2.6, -3.1, false); box(F, .5, 5.2, .5, yellow, FX1, 2.6, 3.1, false); box(F, .45, .6, 6.7, hazardM, FX1, 5.3, 0, false);
    for (let i = 0; i < 3; i++) rb(F, 1.0, .5, 1.0, mdfM, 40 + i * 1.05, .25, -6.5, .015); rb(F, 1.4, 1.1, 1.0, M(0xb48a5b, .95), 38.8, .55, -5.3, .02);
    for (let i = 0; i < 4; i++) { cyl(F, .28, .28, .9, i % 2 ? blue : M(0x556b3a, .5, .3), 50 + i * 1.2, .45, -7.7, 14); }
    [[40, 7.5], [57, 7.8], [74, 7.5]].forEach(([x, z]) => { rb(F, 1.2, .8, 1.2, M(0xc9a574, .9), x, .4, z, .02); rb(F, 1.2, .4, 1.2, M(0xbf9c6a, .9), x, 1.0, z, .02); });

    /* ---------- Tashqi muhit va yuk mashinasi ---------- */
    const EX = grp(world, 0, 0, 0), rngv = c.rngMk(21);
    const gt = withTex(tex.concrete(), 90, 30), grass = M(0x7c9060, 1, 0, { bumpMap: gt.bump, bumpScale: 0.22 });
    const ground = add(EX, new T.PlaneGeometry(900, 300), grass, 130, -.03, 20, false); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = SH;
    const apron = add(EX, new T.PlaneGeometry(40, 24), M(0x9b9890, .8, 0, { map: withTex(tex.concrete(), 8, 5).map }), 108, -.012, 4, false); apron.rotation.x = -Math.PI / 2; apron.receiveShadow = SH;
    const asp = withTex(tex.concrete(), 60, 2), road = add(EX, new T.PlaneGeometry(160, 6), M(0x44464b, .8, 0, { bumpMap: asp.bump, bumpScale: 0.16, envMapIntensity: .6 }), 160, -.006, 13, false); road.rotation.x = -Math.PI / 2; road.receiveShadow = SH;
    for (let i = 0; i < 40; i++) { const m = add(EX, new T.PlaneGeometry(2, .16), M(0xefeadf, .7), 92 + i * 4, .002, 13, false); m.rotation.x = -Math.PI / 2; }
    const sw = add(EX, new T.PlaneGeometry(160, 3), M(0xb4b0a8, .85, 0, { map: withTex(tex.concrete(), 40, 1).map }), 160, -.004, 8.2, false); sw.rotation.x = -Math.PI / 2; sw.receiveShadow = SH;
    box(EX, 160, .12, .22, M(0xc9c5bc, .8), 160, .04, 9.8, false); box(EX, 160, .12, .22, M(0xc9c5bc, .8), 160, .04, 6.6, false);
    for (let i = 0; i < (mobile ? 16 : 32); i++) { const x = 100 + rngv() * 130, z = rngv() < .3 ? -9 + rngv() * 16 : 31 + rngv() * 18; if ((z > -9 && z < 9 && x < 130) || (x > 193 && z < 12)) continue; const t = grp(EX, x, 0, z); const s = .8 + rngv() * .8; cyl(t, .12 * s, .2 * s, 2.0 * s, M(0x5a4430, .95), 0, 1.0 * s, 0, 7, false); const gcol = [0x3d7347, 0x4a8450, 0x35693f, 0x56904f]; for (let k = 0; k < 7; k++) { const a = rngv() * 6.28, r = (.2 + rngv() * .6) * s, ball = add(t, new T.IcosahedronGeometry((.7 + rngv() * .5) * s, 1), M(gcol[(rngv() * 4) | 0], .85), Math.cos(a) * r, (2.3 + rngv() * 1.6) * s, Math.sin(a) * r, false); ball.rotation.set(rngv() * 3, rngv() * 3, 0); ball.scale.set(1, .85 + rngv() * .3, 1); } blob(t, 2.8 * s, 2.8 * s, .55); }
    for (let i = 0; i < (mobile ? 10 : 22); i++) { const x = 12 + rngv() * 20, z = -16 + rngv() * 24; if (Math.abs(z - 2) < 7 && x < 16) continue; const t = grp(EX, x, 0, z), s = .8 + rngv() * .8; cyl(t, .12 * s, .2 * s, 2.0 * s, M(0x5a4430, .95), 0, 1.0 * s, 0, 7, false); for (let k = 0; k < 5; k++) { const a = rngv() * 6.28, r = (.2 + rngv() * .5) * s; add(t, new T.IcosahedronGeometry((.7 + rngv() * .4) * s, 1), M([0x3d7347, 0x4a8450, 0x35693f][(rngv() * 3) | 0], .85), Math.cos(a) * r, (2.3 + rngv() * 1.4) * s, Math.sin(a) * r, false); } blob(t, 2.6 * s, 2.6 * s, .5); }
    for (let i = 0; i < 12; i++) { const x = 100 + i * 12, bh = 5 + rngv() * 8; const g = grp(EX, x, 0, -18 - (i % 3) * 6); rb(g, 7 + rngv() * 3, bh, 6, M(0xe0d9cb - (i % 4) * 0x0a0a0a, .85), 0, bh / 2, 0, .1, false); for (let k = 0; k < 3; k++) box(g, 1.3, 1.5, .1, GL(0x9fbfd8, .6), -2 + k * 2, bh * .6, 3.04, false); }
    for (let i = 0; i < 8; i++) { const x = 98 + i * 16, g = grp(EX, x, 0, 7); cyl(g, .05, .07, 4.6, dark, 0, 2.3, 0, 8, false); rb(g, .9, .08, .25, dark, .35, 4.6, 0, .02, false); box(g, .5, .04, .2, M(0x111, .5, 0, { emissive: 0xfff1c9, emissiveIntensity: 2.4 }), .65, 4.54, 0, false); }
    // zavod oldi: devor belgisi, to‘siq ustunlari
    for (let i = 0; i < 6; i++) cyl(EX, .09, .09, .9, M(0xe8b520, .5), 94.5, .45, -7 + i * 2.4 + (i > 2 ? 1.8 : 0), 10, false);
    /* ---------- Yuk mashinasi (korpusli furgon) ---------- */
    const truck = grp(world, 100, 0, 0), tb = grp(truck), cargoM = M(0xf1efe9, .38, .15, { envMapIntensity: .9 }), cabM = M(0x2b3f66, .3, .35, { envMapIntensity: 1 });
    rb(tb, 7.2, .16, 2.6, cargoM, -1.2, .92, 0, .02); rb(tb, 7.2, .1, 2.6, cargoM, -1.2, 3.85, 0, .04); [-1.26, 1.26].forEach(z => rb(tb, 7.2, 2.9, .08, cargoM, -1.2, 2.4, z, .03)); rb(tb, .1, 2.9, 2.6, cargoM, 2.35, 2.4, 0, .03);
    rb(tb, 7.0, .02, 2.4, woodMat('oak', 0x8a6a45, .7), -1.2, 1.005, 0, .005, false); box(tb, 5, .03, .3, M(0x111, .5, 0, { emissive: 0xffffff, emissiveIntensity: 2.2 }), -1.2, 3.78, 0, false); rb(tb, 7.25, .16, 2.64, orange, -1.2, 3.93, 0, .02, false); rb(tb, 7.25, .3, 2.64, M(0x2b3f66, .4, .2), -1.2, .75, 0, .03, false);
    for (let i = 0; i < 8; i++) box(tb, .05, 3.0, .04, M(0xdcd9d1, .4, .3), -4.4 + i * .95, 2.35, 1.32, false), box(tb, .05, 3.0, .04, M(0xdcd9d1, .4, .3), -4.4 + i * .95, 2.35, -1.32, false);
    const logoC = document.createElement('canvas'); logoC.width = 512; logoC.height = 128; const lg = logoC.getContext('2d'); lg.fillStyle = '#e9a45e'; lg.beginPath(); lg.arc(52, 64, 22, 0, 7); lg.fill(); lg.fillStyle = '#16181b'; lg.font = '700 58px sans-serif'; lg.textBaseline = 'middle'; lg.fillText('YASINDOORS', 96, 66); const lgT = new T.CanvasTexture(logoC); if (T.sRGBEncoding) lgT.encoding = T.sRGBEncoding;
    [1, -1].forEach(s => { const m = new T.Mesh(new T.PlaneGeometry(3.4, .85), new T.MeshBasicMaterial({ map: lgT, transparent: true, toneMapped: false })); m.position.set(-1.0, 2.5, s * 1.342); if (s < 0) m.rotation.y = Math.PI; tb.add(m); });
    const cab = grp(tb, 3.2, 0, 0); rb(cab, 2.0, 1.7, 2.5, cabM, 0, 1.7, 0, .12); rb(cab, 1.1, 1.0, 2.46, cabM, -.45, 2.95, 0, .14); rb(cab, .08, .95, 2.1, GL(0x9fc4e0, .55), .62, 2.95, 0, .02, false); rb(cab, .5, .8, .08, GL(0x9fc4e0, .55), .0, 2.95, 1.25, .02, false); rb(cab, .5, .8, .08, GL(0x9fc4e0, .55), .0, 2.95, -1.25, .02, false);
    rb(cab, .3, .6, 2.64, black, 1.0, .75, 0, .05); [-.9, .9].forEach(z => { box(cab, .06, .3, .4, M(0x111, .4, 0, { emissive: 0xfff3d0, emissiveIntensity: 2.6 }), 1.04, 1.1, z, false); rb(cab, .1, .5, .18, black, .55, 2.9, z * 1.45, .02, false); });
    rb(tb, 1.3, .3, 2.7, dark, -1.2, .55, 0, .05, false); rb(tb, 8.8, .25, 2.5, black, -.2, .85, 0, .03, false);
    const wheels = []; [[-3.5, -1.28], [-3.5, 1.28], [-2.0, -1.28], [-2.0, 1.28], [3.4, -1.28], [3.4, 1.28]].forEach(([x, z]) => { const w = cyl(tb, .56, .56, .42, M(0x161616, .95), x, .56, z, 22); w.rotation.x = Math.PI / 2; cyl(w, .3, .3, .44, chrome, 0, 0, 0, 16, false); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; cyl(w, .035, .035, .46, black, Math.cos(a) * .18, 0, Math.sin(a) * .18, 6, false); } wheels.push(w); blob(truck, 1.6, 1.0, .5).position.set(x, .006, z * 1.0); });
    const cargoDoor = grp(tb, -4.82, 0, 1.3), cargoDoor2 = grp(tb, -4.82, 0, -1.3); rb(cargoDoor, .06, 2.9, 1.3, cargoM, 0, 2.4, -.65, .02); rb(cargoDoor2, .06, 2.9, 1.3, cargoM, 0, 2.4, .65, .02); [cargoDoor, cargoDoor2].forEach(d => box(d, .04, .1, .1, steel, -.04, 2.4, d === cargoDoor ? -1.2 : 1.2, false));
    const route = new T.CatmullRomCurve3([V(101, 0, 0), V(106, 0, .1), V(111, 0, 4.5), V(118, 0, 11), V(127, 0, 12.5), V(150, 0, 12.6), V(190, 0, 12.6), V(204, 0, 12.4)], false, 'catmullrom', .4);
    truck.position.set(101, 0, 0); const trkP = V(0, 0, 0), trkT = V(0, 0, 1);

    /* ---------- Ishlov beriladigan eshik: 800×2000 mm panelli tabaqa ---------- */
    const LW = 2.0; // x — bo‘yi, z — eni, y — qalinlik (LT)
    const leaf = grp(world, 0, 0, 0), raw = M(0xffffff, .9, 0, { map: tex.mdf().map, bumpMap: tex.mdf().bump, bumpScale: 0.03 });
    const finT = tex.wood('walnut'), fin = new T.MeshPhysicalMaterial({ color: WALNUT, map: finT.map, bumpMap: finT.bump, bumpScale: 0.05, roughness: .45, clearcoat: .55, clearcoatRoughness: .2, envMapIntensity: .55, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const parts = []; const pl = (w, h, d, x, z, ex, ey, ez, r) => { const m = rb(leaf, w, h, d, raw, x, 0, z, r || .006); m.userData = { x, z, ex, ey, ez }; const cm = new T.Mesh(m.geometry, fin); cm.scale.setScalar(1.003); m.add(cm); m.userData.coat = cm; parts.push(m); return m; };
    pl(LW, LT, .115, 0, -.34, -.2, 1.3, -1.8); pl(LW, LT, .115, 0, .34, .2, 1.6, 1.8);                      // tik ustunlar
    pl(.2, LT, .57, -.9, 0, -2.2, 1.0, 0); pl(.13, LT, .57, .04, 0, 0, 1.9, -.6); pl(.15, LT, .57, .925, 0, 2.2, 1.0, .5); // pastki, o‘rta, yuqori to‘sinlar
    const panelU = pl(.765, .028, .57, .4775, 0, .6, 2.2, 1.2, .005), panelD = pl(.795, .028, .57, -.4125, 0, -.6, 2.2, -1.2, .005);
    [panelU, panelD].forEach(pn => { const fld = rb(pn, pn === panelU ? .6 : .63, .02, .38, raw, 0, .018, 0, .008); const f2 = new T.Mesh(fld.geometry, fin); f2.scale.setScalar(1.004); fld.add(f2); fld.userData.coat = f2; fld.scale.x = pn === panelU ? 1.0 : 1.0; });
    // panel ichidagi chuqurchalar (frezer izi): yo‘llar — [markaz x, markaz z, o‘lcham x, o‘lcham z]
    const gm = M(0x2a1b10, .8), grooves = [], gw = .014, gl = [[.4775, 0, .655, .46], [-.4125, 0, .685, .46]];
    gl.forEach(([cx, cz, sx, sz]) => { [[cx, cz - sz / 2, sx, gw, 'x'], [cx, cz + sz / 2, sx, gw, 'x'], [cx - sx / 2, cz, gw, sz, 'z'], [cx + sx / 2, cz, gw, sz, 'z']].forEach(a => { const m = box(leaf, a[2], .004, a[3], gm, a[0], .016, a[1], false); m.userData = { axis: a[4], px: a[0], pz: a[1], w: a[2], d: a[3] }; grooves.push(m); m.scale.set(.001, 1, .001); }); });
    const sheet = box(world, 2.8, LT, 2.07, mdfM, 42, 0, 4.2); const offc = box(world, 1.5, LT, .6, mdfM, 0, -9, 0);
    // furnitura: 3 ta petla, dastak va qulf (eshik yuziga +y)
    const hardware = grp(leaf, 0, 0, 0); hardware.visible = false;
    const brass = M(0xcfd2d6, .22, 1, { envMapIntensity: 1.5 }), hingeH = [.78, 0, -.78].map(x => { const h = grp(hardware, x, 0, -.4); rb(h, .1, .01, .045, brass, 0, LT / 2, .02, .004, false); cyl(h, .011, .011, .1, brass, 0, LT / 2 + .004, -.004, 10, false).rotation.z = Math.PI / 2; return h; });
    const handle = grp(hardware, -.04, LT / 2, .33); rb(handle, .06, .008, .2, brass, 0, 0, 0, .004, false); cyl(handle, .024, .024, .012, brass, 0, .008, 0, 18, false); cyl(handle, .009, .009, .04, brass, 0, .028, 0, 10, false); rb(handle, .016, .016, .14, brass, 0, .048, -.06, .006, false); cyl(handle, .004, .004, .016, black, 0, .003, .075, 8, false);
    leaf.userData.hardware = hardware;
    // qadoq: karton taglik, qopqoq, o‘rovchi plyonka
    const pack = grp(world, 0, 0, 0); pack.visible = false; const cardT = withTex(tex.mdf(), 1, 1), cardM = M(0xb9915f, .95, 0, { bumpMap: cardT.bump, bumpScale: 0.035 });
    rb(pack, 2.12, .03, .92, cardM, 0, -.04, 0, .006); [-.46, .46].forEach(z => rb(pack, 2.12, .1, .03, cardM, 0, -.02, z, .006)); [-1.06, 1.06].forEach(x => rb(pack, .03, .1, .92, cardM, x, -.02, 0, .006));
    for (let i = 0; i < 4; i++) rb(pack, .09, .03, .14, M(0xe9e2d3, .9), -.8 + i * .53, .0, 0, .008, false);
    const lid = grp(pack, 0, .5, 0); rb(lid, 2.16, .035, .96, cardM, 0, 0, 0, .008); const lbl = new T.Mesh(new T.PlaneGeometry(.9, .3), new T.MeshBasicMaterial({ map: (function () { const cv = document.createElement('canvas'); cv.width = 360; cv.height = 120; const g = cv.getContext('2d'); g.fillStyle = '#f4efe4'; g.fillRect(0, 0, 360, 120); g.fillStyle = '#16181b'; g.font = '700 40px sans-serif'; g.textBaseline = 'middle'; g.fillText('YASINDOORS', 26, 44); g.fillStyle = '#c4602a'; g.font = '600 22px sans-serif'; g.fillText('MDF ESHIK · MAHSULOT', 26, 90); const t = new T.CanvasTexture(cv); if (T.sRGBEncoding) t.encoding = T.sRGBEncoding; return t; })() })); lbl.rotation.x = -Math.PI / 2; lbl.position.set(.5, .019, 0); lid.add(lbl); box(lid, .1, .004, .96, M(0x6b4f2e, .9), -.4, .019, 0, false);
    const film = rb(pack, 2.2, .14, 1.0, GL(0xe6f0fa, .26), 0, .02, 0, .03, false); rb(film, 2.2, .14, 1.0, M(0xffffff, .05, 0, { transparent: true, opacity: .08, envMapIntensity: 2.2, depthWrite: false }), 0, 0, 0, .03, false);
    const checkM = new T.Mesh(new T.CircleGeometry(.3, 28), new T.MeshBasicMaterial({ color: 0x43d08f, transparent: true, opacity: 0, toneMapped: false })); checkM.position.set(SX.qc, 2.5, 1.0); F.add(checkM);

    /* ---------- Uy B (o‘rnatish) ---------- */
    const HB_X = 214, HB = Y._room(world, HB_X, true); c.houseB = HB;
    const cas = M(0xf5f1e8, .45), frameG = grp(world, HB_X, 0, -3.6);
    box(frameG, .08, 2.1, .3, cas, -.47, 1.05, 0, false); box(frameG, .08, 2.1, .3, cas, .47, 1.05, 0, false); box(frameG, 1.02, .08, .3, cas, 0, 2.11, 0, false);
    const casF = grp(frameG, 0, 0, .16); rb(casF, .1, 2.2, .03, cas, -.55, 1.1, 0, .008, false); rb(casF, .1, 2.2, .03, cas, .55, 1.1, 0, .008, false); rb(casF, 1.2, .1, .03, cas, 0, 2.22, 0, .008, false);
    const level = grp(world, 0, -9, 0); rb(level, .8, .06, .035, M(0xe8b520, .4, .3), 0, 0, 0, .01, false); box(level, .1, .032, .04, M(0x77d27a, .3, 0, { emissive: 0x77d27a, emissiveIntensity: 1.2, transparent: true, opacity: .9 }), 0, .0, 0, false); [-.3, .3].forEach(x => box(level, .02, .045, .04, black, x, 0, 0, false));
    const shims = []; for (let i = 0; i < 4; i++) { const s = box(world, .1, .02, .045, M(0xd8b878, .7), HB_X - .52, 1.9 - i * .52, -3.5, false); s.visible = false; shims.push(s); }
    const drill = grp(world, 0, -9, 0); rb(drill, .1, .2, .06, M(0x2f7ed6, .4, .1), 0, 0, 0, .02); rb(drill, .06, .12, .05, black, 0, -.14, 0, .015, false); rb(drill, .05, .06, .24, M(0x2f7ed6, .4, .1), 0, .08, .11, .015); cyl(drill, .008, .008, .12, chrome, 0, .08, .27, 6, false).rotation.x = Math.PI / 2;
    // sath chizig‘i uchun lazer chizg‘ich (rulon) — sahna 1 uchun qo‘l asbobi
    const meter = grp(world, 0, -9, 0); rb(meter, .06, .035, .14, M(0xe8b520, .4, .2), 0, 0, 0, .012, false); box(meter, .035, .012, .02, M(0x111, .5, 0, { emissive: 0xff2a2a, emissiveIntensity: 2 }), 0, .02, .06, false);

    /* ---------- Odamlar ---------- */
    const crowd = [], mk = (o) => { const P = person(o); P.g.visible = false; world.add(P.g); crowd.push(P); return P; };
    const WK = (o) => Object.assign({ shirt: 0x1f2e4a, pants: 0x1f232b, hat: 0xf3f1ea, strips: true, rolled: true, belt: 0x2a211b, hair: 0x2a1d14, glove: 0x2a2f38 }, o);
    const engA = mk(WK({ skin: 0xd9a982, s: 1.03, showHair: true, glove: null }));
    const mkMan = () => mk({ shirt: 0x5b4a43, inner: 0xcfd2d6, innerWide: true, pants: 0x34445c, belt: 0x4a3626, hair: 0x2b1e16, quiff: true, skin: 0xe3b78f, s: 1.0 }), mkWoman = () => mk({ shirt: 0xd4bc9c, inner: 0xf3efe8, pants: 0x3a465c, belt: 0x5a3f2a, hair: 0x5a3322, hairLong: true, skin: 0xf0cfb0, s: .94, lip: 0xc0706a });
    const cliA = mkMan(), cliA2 = mkWoman();
    const W = {
      saw: mk(WK({ shirt: 0x24354f, hat: 0xf3f1ea, ears: true, skin: 0xdfb08c, s: 1.0 })), a1: mk(WK({ shirt: 0x1f2e4a, hat: 0xf3f1ea, skin: 0xc99069, s: 1.03 })), a2: mk(WK({ shirt: 0x2a3a52, hat: 0xf3f1ea, skin: 0xe8c4a0, s: .98 })),
      sand: mk(WK({ shirt: 0x22314a, hat: 0xf3f1ea, mask: true, skin: 0xd9a982, s: 1.0 })), cnc: mk(WK({ shirt: 0x26395a, hat: 0xf3f1ea, skin: 0xc99069, s: 1.04, beard: true })), paint: mk(WK({ shirt: 0xe7e7e2, hat: 0xf3f1ea, mask: true, glove: 0x2d6fb7, skin: 0xe2b995, s: .99 })),
      qc: mk(WK({ shirt: 0x2a3a52, hat: 0xf3f1ea, skin: 0xc99069, s: 1.0 })), p1: mk(WK({ shirt: 0x1f2e4a, hat: 0xf3f1ea, skin: 0xdfb08c })), p2: mk(WK({ shirt: 0x2a3a52, hat: 0xf3f1ea, skin: 0xc99069, s: 1.03 })),
      c1: mk(WK({ shirt: 0x26395a, hat: 0xf3f1ea, skin: 0xd9a982, s: 1.02 })), c2: mk(WK({ shirt: 0x22314a, hat: 0xf3f1ea, skin: 0xe2b995, s: .98 })), sup: mk(WK({ shirt: 0xf2f1ed, hat: 0xf3f1ea, glove: null, skin: 0xd2a07a, s: 1.03 })), drv: mk(WK({ shirt: 0x26395a, hat: 0xf3f1ea, skin: 0xdfb08c }))
    };
    W.sup.realDir = true; W.drv.sit = true; fkb.add(W.drv.g);
    const inst1 = mk(WK({ shirt: 0x1f2e4a, hat: 0xf3f1ea, skin: 0xdfb08c, s: 1.02 })), inst2 = mk(WK({ shirt: 0x24354f, hat: 0xf3f1ea, skin: 0xc99069, s: 1.0, beard: true })), cliB = mkMan(), cliB2 = mkWoman();
    // kichik buyumlar: planshet, qog‘oz taxta
    const tcv = document.createElement('canvas'); tcv.width = 256; tcv.height = 170; const tg = tcv.getContext('2d'), ttx = new T.CanvasTexture(tcv); if (T.sRGBEncoding) ttx.encoding = T.sRGBEncoding;
    const tmesh = grp(world); rb(tmesh, .3, .02, .21, black, 0, 0, 0, .008, false); const tsc = new T.Mesh(new T.PlaneGeometry(.27, .18), new T.MeshBasicMaterial({ map: ttx, toneMapped: false })); tsc.rotation.x = -Math.PI / 2; tsc.position.y = .0105; tmesh.add(tsc); tmesh.visible = false;
    const tabShow = u => { tg.fillStyle = '#0f1420'; tg.fillRect(0, 0, 256, 170); tg.fillStyle = '#e9a45e'; tg.font = '700 15px sans-serif'; tg.fillText('YASINDOORS · BUYURTMA', 14, 24); tg.strokeStyle = '#f4efe4'; tg.lineWidth = 3; tg.strokeRect(70, 38, 60 * Math.min(1, u * 2), 112 * Math.min(1, Math.max(0, u * 2 - .2) / .8)); tg.fillStyle = '#f4efe4'; tg.font = '600 15px sans-serif'; if (u > .35) tg.fillText('Eni: 820 mm', 146, 76); if (u > .55) tg.fillText('Bo‘yi: 2040 mm', 146, 102); if (u > .8) { tg.fillStyle = '#43d08f'; tg.fillText('✓ Zavodga yuborildi', 14, 160); } ttx.needsUpdate = true; };
    const mkClip = () => { const g = grp(world); rb(g, .24, .012, .32, M(0x6b4f2e, .7), 0, 0, 0, .004, false); box(g, .2, .004, .28, M(0xf2f0ea, .9), 0, .008, 0, false); box(g, .08, .014, .03, steel, 0, .008, -.15, false); g.visible = false; return g; };
    const clipS = mkClip(), clipQ = mkClip();
    // lazer nuri va qizil nuqta
    const beam = new T.Mesh(new T.CylinderGeometry(.004, .004, 1, 6), new T.MeshBasicMaterial({ color: 0xff2a2a, toneMapped: false, transparent: true, opacity: .85 })); beam.visible = false; world.add(beam);
    const dot = new T.Mesh(new T.SphereGeometry(.022, 10, 8), new T.MeshBasicMaterial({ color: 0xff3b3b, toneMapped: false })); dot.visible = false; world.add(dot); dot.add(new T.PointLight(0xff2a2a, .5, 1.4));
    c.lazer = { beam, dot };

    /* ---------- Zarralar ---------- */
    const PN = mobile ? 40 : 90;
    const mkPart = (color, size, op) => { const pos = new Float32Array(PN * 3), vel = new Float32Array(PN * 3), life = new Float32Array(PN); const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); const m = new T.PointsMaterial({ color, size, transparent: true, opacity: op, depthWrite: false, sizeAttenuation: true }); const pts = new T.Points(g, m); pts.frustumCulled = false; world.add(pts); for (let i = 0; i < PN; i++) { life[i] = Math.random(); pos[i * 3 + 1] = -50; } return { pts, pos, vel, life, g }; };
    const dustS = mkPart(0xe0c391, .08, .75), dustSd = mkPart(0xd9c4a0, .06, .55), dustC = mkPart(0xd6b987, .05, .8), mist = mkPart(0x7a5238, .1, .4);
    const emit = (P, ex, ey, ez, on, dt, spread, up, grav, speedMul = 1) => { for (let i = 0; i < PN; i++) { P.life[i] -= dt * 1.4 * speedMul; if (P.life[i] <= 0) { if (on) { P.life[i] = .6 + Math.random() * .5; P.pos[i * 3] = ex + (Math.random() - .5) * .15; P.pos[i * 3 + 1] = ey; P.pos[i * 3 + 2] = ez + (Math.random() - .5) * .15; P.vel[i * 3] = (Math.random() - .5) * spread; P.vel[i * 3 + 1] = up * (.4 + Math.random()); P.vel[i * 3 + 2] = (Math.random() - .5) * spread; } else P.pos[i * 3 + 1] = -50; } else { P.vel[i * 3 + 1] -= grav * dt; P.pos[i * 3] += P.vel[i * 3] * dt; P.pos[i * 3 + 1] += P.vel[i * 3 + 1] * dt; P.pos[i * 3 + 2] += P.vel[i * 3 + 2] * dt; } } P.g.attributes.position.needsUpdate = true; };

    /* ---------- Yordamchi funksiyalar (odam–obyekt o‘zaro ta’siri) ---------- */
    const camP = V(0, 0, 0), t1 = V(0, 0, 0), t2 = V(0, 0, 0), t3 = V(0, 0, 0), t4 = V(0, 0, 0), UP = V(0, 1, 0);
    const near = P => P.g.position.distanceToSquared(camP) < 85 * 85;
    const stand = (P, x, z, face, lean = 0) => { P.g.position.set(x, 0, z); P.face = face; P.lean = lean; };
    const look = (P, tgt, k = .6) => { P.g.updateMatrixWorld(true); const l = P.g.worldToLocal(t4.copy(tgt)); const a = Math.atan2(l.x, l.z), hy = l.y - 1.62, pitch = Math.atan2(-hy, Math.hypot(l.x, l.z)); P.head.rotation.y = clamp(a - P.torso.rotation.y, -.9, .9) * k + P.head.rotation.y * (1 - k); P.head.rotation.x += clamp(pitch, -.5, .5) * .6; };
    const aim = (P, tgt, k = .6) => { P.g.updateMatrixWorld(true); const l = P.g.worldToLocal(t4.copy(tgt)); P.torso.rotation.y = clamp(Math.atan2(l.x, l.z), -.8, .8) * k; };
    const reachBoth = (P, a, b) => { P.g.updateMatrixWorld(true); const la = P.torso.worldToLocal(t3.copy(a)), lb = P.torso.worldToLocal(t4.copy(b)); if (la.x >= lb.x) { reach(P, 1, a); reach(P, -1, b); } else { reach(P, 1, b); reach(P, -1, a); } };
    const torsoPt = (P, x, y, z, out) => { P.torso.updateWorldMatrix(true, false); return P.torso.localToWorld(out.set(x, y, z)); };
    const surf = (parent, lx, ly, lz, out) => { parent.updateWorldMatrix(true, false); return parent.localToWorld(out.set(lx, ly, lz)); };
    const crouchTo = (P, y) => { crouch(P, clamp((1.2 - y) / .9, 0, .95)); P.g.updateMatrixWorld(true); };

    // sex yordamchilari: boshqaruv pultlari (ishchilar oldida)
    const cons = {};
    cons.saw = console_(F, SX.saw - 1.3, -1.55, Math.PI, 'SAW  READY', '#43d08f'); cons.sand = console_(F, SX.sand - 1.0, -1.7, Math.PI, 'SANDER 80', '#77d27a'); cons.cnc = console_(F, SX.cnc - 1.6, -1.7, Math.PI, 'CNC  R-27', '#6fb7ff'); cons.paint = console_(F, SX.paint + 2.7, -1.7, Math.PI, 'COAT  WALNUT', '#e9a45e');
    const CONS = { saw: [SX.saw - 1.3, -1.55], sand: [SX.sand - 1.0, -1.7], cnc: [SX.cnc - 1.6, -1.7], paint: [SX.paint + 2.7, -1.7] };

    /* ---------- Vaqt jadvali ---------- */
    const b = i => B(i), within = (p, i) => p >= b(i).a && p < b(i).b;
    const LEAF_X = [[0, 40], [bp(3, .6), 42], [bp(3, 1), 46], [bp(4, 1), 51.6], [bp(5, .12), 54], [bp(5, 1), 54], [bp(6, .1), 56], [bp(6, .7), 60], [bp(6, .98), 62], [bp(7, .12), 64.5], [bp(7, 1), 66], [bp(8, .15), 70], [bp(8, .5), 72], [bp(8, 1), 72], [bp(9, .2), 78], [bp(9, .55), 78], [bp(9, .8), 82], [bp(10, .1), 86], [bp(10, 1), 86]];
    const hingeW = V(HB_X - .4, 0, -3.58), BX = HB_X + 3.3, BZ = -.8, TE = route.getPointAt(1);
    const qUp = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(V(0, 1, 0), V(0, 0, 1), V(1, 0, 0))), qY = a => new T.Quaternion().setFromAxisAngle(UP, a);
    const leafP = V(0, 0, 0), leafQ = new T.Quaternion(), packP = V(0, 0, 0), packQ = new T.Quaternion(), qa = new T.Quaternion(), tmpQ = new T.Quaternion();
    const lidW = grp(world); lid.removeFromParent(); lidW.add(lid); lid.position.set(0, 0, 0);

    actors.push((p, t, dt) => {
      const e = (i, f0, f1) => seg(p, bp(i, f0), bp(i, f1)), PD = c.pdir();
      // ko‘rinmaydigan zonalarni o‘chirib qo‘yamiz (chizish soni kamayadi)
      F.visible = p > bp(2, .6) && p < bp(12, .5); c.houseA.R.visible = p < bp(3, .55); HB.R.visible = p > bp(11, .6); frameG.visible = HB.R.visible;
      /* ======== 1-akt: muhandis, mijoz, lazer, planshet (uy A) ======== */
      const eP = engA.g.position, cP = cliA.g.position, cP2 = cliA2.g.position;
      c.KV(p, [[0, [0, 0, 8.0]], [bp(0, .55), [0, 0, .9]], [bp(1, 0), [-.25, 0, -.55]], [bp(3, 0), [-.25, 0, -.55]]], eP);
      c.KV(p, [[0, [1.9, 0, 8.6]], [bp(0, .6), [1.9, 0, .5]], [1, [1.9, 0, .4]]], cP); c.KV(p, [[0, [2.9, 0, 9.0]], [bp(0, .6), [2.8, 0, .9]], [1, [2.8, 0, .8]]], cP2);
      const actA = p < bp(3, .4); engA.g.visible = cliA.g.visible = cliA2.g.visible = actA;
      if (actA) {
        engA.face = p > bp(0, .62) ? Math.PI : null; cliA.face = p > bp(0, .62) ? Math.atan2(-1.9, -4.0) + .3 : null; engA.lean = 0; cliA.lean = 0; cliA2.face = p > bp(0, .62) ? Math.atan2(-2.8, -4.4) + .35 : null; cliA2.lean = 0;
        walker(engA, dt, t, 0); walker(cliA, dt, t, 1.3); walker(cliA2, dt, t, .7);
        const laz = within(p, 1), tab = p >= bp(2, 0) && p < bp(3, .3), standing = p > bp(0, .6);
        // mijoz: qo‘llari ko‘kragida, muhandisga/eshikka qaraydi
        if (standing) { reach(cliA, 1, torsoPt(cliA, -.08, .3, .2, t1)); reach(cliA, -1, torsoPt(cliA, .1, .27, .21, t2)); look(cliA, t3.set(-.1, 1.4, -3.4), .5); reach(cliA2, 1, torsoPt(cliA2, -.05, .1, .26, t1)); reach(cliA2, -1, torsoPt(cliA2, .05, .1, .26, t2)); look(cliA2, t3.set(-.1, 1.4, -3.4), .5); } else { look(cliA, t3.set(0, 1.5, -3), .3); look(cliA2, t3.set(0, 1.5, -3), .3); }
        // muhandis: lazer o‘lchagich (o‘ng qo‘lda), keyin planshet
        const dotX = K(p, [[bp(1, 0), -.45], [bp(1, .45), .45], [bp(1, .5), .0], [bp(1, .9), .0]]), dotY = K(p, [[bp(1, 0), 1.1], [bp(1, .5), 1.1], [bp(1, .52), .02], [bp(1, .9), 2.05]]);
        const lz = c.lazer; meter.visible = false; tmesh.visible = false;
        if (p > bp(0, .62) && p < bp(1, 1)) {
          const target = V(dotX, dotY, -3.5); aim(engA, target, .75); look(engA, target, .6);
          reach(engA, 1, torsoPt(engA, .13, .3, .34, t1)); reach(engA, -1, torsoPt(engA, .0, .27, .3, t2));
          if (p > bp(0, .7)) { meter.visible = true; meter.position.copy(handPos(engA, 1, t3).add(V(0, .0, .0))); meter.lookAt(target); meter.position.addScaledVector(V(0, 0, 1).applyQuaternion(meter.quaternion), -.03); }
          if (laz) { lz.beam.visible = lz.dot.visible = true; const start = surf(meter, 0, .02, .075, t2).clone(), dir = target.clone().sub(start), len = dir.length(); lz.dot.position.copy(target); lz.beam.position.copy(start).addScaledVector(dir, .5); lz.beam.scale.set(1, len, 1); lz.beam.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize()); const u = e(1, .05, .45), v = e(1, .5, .9), w = Math.round(lerp(0, 820, sm(u))), h = Math.round(lerp(0, 2040, sm(v))); if (c.hud) c.hud(v > 0 ? `Bo‘yi ${h} mm` : `Eni ${w} mm`, v > 0 ? { w: 820, h } : { w, h: 0 }); } else { lz.beam.visible = lz.dot.visible = false; if (c.hud) c.hud(null); }
        } else { lz.beam.visible = lz.dot.visible = false; if (c.hud) c.hud(null); }
        if (tab || (p >= bp(1, .9) && p < bp(3, .3))) {
          const tu = e(2, .1, .65), tp = torsoPt(engA, -.03, .3, .34, t1).clone(); tmesh.visible = true; tmesh.position.copy(tp); engA.torso.updateWorldMatrix(true, false); engA.torso.getWorldQuaternion(tmpQ); tmesh.quaternion.copy(tmpQ).multiply(qa.setFromEuler(new T.Euler(-.35, 0, 0))); tabShow(tu);
          const lft = surf(tmesh, -.13, 0, .0, t2).clone(), tap = surf(tmesh, .05 + Math.sin(t * 5) * .04, .012, -.02 + Math.cos(t * 4) * .03, t3).clone();
          reach(engA, -1, lft); reach(engA, 1, tap); look(engA, tp, .8);
        }
      }
      /* ======== 2-akt: zavod ======== */
      const fkx = K(p, [[0, 33], [bp(3, 0), 33], [bp(3, .35), 40.2], [bp(3, .5), 40.2], [bp(3, .75), 35], [bp(3, 1), 28]]); fk.position.x = fkx; forks.position.y = K(p, [[bp(3, .15), .15], [bp(3, .35), .15], [bp(3, .5), 1.0], [bp(3, .6), 1.0], [bp(3, .75), .3], [1, .3]]); fk.visible = p < bp(4, .1);
      // plitalar: pallet → vilka → konveyer → kesish
      const palletOn = p < bp(3, .9); pallet.visible = palletOn;
      stack.forEach((s, i) => { s.visible = !(i === stack.length - 1 && p > bp(3, .5)); });
      // vilkada ko‘tarilgan plita (pallet tepasidan olinadi): vilka bilan birga
      let sxx, sy, sz;
      if (p < bp(3, .62)) { sxx = fk.position.x + 1.1 + .65; sy = forks.position.y + .1 + .045; sz = 4.2; if (p < bp(3, .5)) { sxx = pallet.position.x; sy = .17 + 4 * .05 + .05; sz = 4.2; } }
      else { sxx = K(p, [[bp(3, .62), fk.position.x + 1.75], [bp(3, .75), 43.5], [bp(3, .9), 46], [bp(4, .15), 46], [bp(4, .85), 50.3], [bp(4, 1), 52.2]]); sz = K(p, [[bp(3, .62), 4.2], [bp(3, .78), 2.4], [bp(3, .92), 0], [bp(4, 1), 0]]); sy = K(p, [[bp(3, .62), 1.15], [bp(3, .78), 1.4], [bp(3, .9), LINE_Y + .045 + .0225], [bp(4, 1), LINE_Y + .0675]]); }
      sheet.position.set(sxx, sy, sz); sheet.visible = p > bp(2, .5) && p < bp(4, .98);
      const cut = e(4, .2, .8); sheet.scale.z = 1 - .56 * sm(cut); sheet.position.z -= (1 - sheet.scale.z) * 1.035 * (p > bp(3, .9) ? 1 : 0);
      offc.visible = p > bp(4, .5) && p < bp(5, .0); offc.scale.z = 1; offc.position.set(K(p, [[bp(4, .5), 49.4], [bp(4, 1), 49.6]]), K(p, [[bp(4, .5), LINE_Y + .0675], [bp(4, .85), LINE_Y + .0675], [bp(4, 1), LINE_Y - .4]]), K(p, [[bp(4, .5), -.8], [bp(4, 1), -1.9]]));
      bladeAx.rotation.y = t * 30; const sawOn = p > bp(4, .15) && p < bp(4, .85); sawCar.position.z = sawOn ? K(p, [[bp(4, .15), -1.4], [bp(4, .85), 1.4]]) : -1.4; sawCar.position.y = sawOn ? 2.5 : 2.9;
      emit(dustS, SX.saw + .3, LINE_Y + .1, sawCar.position.z, sawOn, dt, 1.6, 1.6, 4);
      // yig‘ish: qismlar uchib kelib birikadi
      const asmU = e(5, .05, .85); parts.forEach(m => { const u = 1 - sm(asmU), s = m.userData; m.position.set(s.x + (s.ex || 0) * u * .8, (s.ey || 0) * u * .8, s.z + (s.ez || 0) * u * .8); m.rotation.set(0, 0, 0); });
      press.position.y = K(p, [[bp(5, .6), 2.4], [bp(5, .85), 1.25], [bp(5, 1), 2.4]]);
      // silliqlash
      belt.rotation.y = t * 14; const sandOn = p > bp(6, .12) && p < bp(6, .88); emit(dustSd, SX.sand + .1, LINE_Y + .15, 0, sandOn, dt, 1.0, 1.0, 3);
      // frezer: bosh harakati va chuqurchalar (marshrut bo‘yicha o‘yiladi)
      const cu = e(7, .08, .92), cncOn = cu > 0 && cu < 1, gk = grooves.length; let tipX = 0, tipZ = 0;
      grooves.forEach((g, i) => { const u = seg(cu, i / gk, (i + 1) / gk), s = clamp(u), sd = g.userData; if (sd.axis === 'x') { g.scale.set(Math.max(.001, s), 1, 1); g.position.x = sd.px - (sd.w / 2) * (1 - g.scale.x); } else { g.scale.set(1, 1, Math.max(.001, s)); g.position.z = sd.pz - (sd.d / 2) * (1 - g.scale.z); } if (u > 0 && u < 1) { tipX = sd.axis === 'x' ? sd.px - sd.w / 2 + sd.w * s : sd.px; tipZ = sd.axis === 'z' ? sd.pz - sd.d / 2 + sd.d * s : sd.pz; } });
      const lfx = K(p, LEAF_X); gantry.position.x = cncOn ? lfx - SX.cnc + tipX : 0; head.position.z = cncOn ? tipZ : 0; bit.rotation.y = t * 40;
      emit(dustC, lfx + (cncOn ? tipX : 0), LINE_Y + .15, cncOn ? tipZ : 0, cncOn, dt, .8, 1.0, 3);
      // bo‘yash: qoplama yuzani asta-sekin yopadi; robot qo‘li ishlaydi
      const pu = e(8, .2, .85), paintOn = pu > 0 && pu < 1; fin.opacity = sm(pu); const done = pu >= .999; fin.transparent = !done; fin.depthWrite = done;
      arm0.rotation.y = paintOn ? Math.sin(t * 1.8) * .7 : 0; arm1.rotation.x = paintOn ? .5 + Math.sin(t * 2.4) * .25 : .1; arm2.rotation.x = paintOn ? .3 : 0; booth.updateMatrixWorld(true); const gp = gun.getWorldPosition(t1); emit(mist, gp.x, gp.y - .1, gp.z, paintOn, dt, .6, -.9, -.5, .8);
      // quritish
      const du = e(9, .1, .55), dd = du * (1 - e(9, .6, .75)); lampsMat.forEach(m => m.color.setRGB(lerp(.3, 1.6, dd), lerp(.16, .5, dd), lerp(.1, .15, dd))); dryGlow.intensity = 7 * dd;
      checkM.material.opacity = e(9, .85, 1) * (1 - e(10, 0, .15)); checkM.visible = p > bp(9, .8) && p < bp(10, .2);
      // qadoqlash: plyonka o‘raladi, quti yopiladi
      const pa = e(10, .05, .5); pack.visible = p > bp(10, .03); film.visible = pa > 0 && p < bp(14, .0); film.scale.set(sm(pa), 1, 1); film.position.x = -1.1 + sm(pa) * 1.1 * 0; rollFilm.rotation.y = pa > 0 && pa < 1 ? t * 5 : 0;
      const trayOn = p > bp(10, .5); pack.children.forEach(ch => { if (ch !== film && ch !== lidW) ch.visible = trayOn; });

      // mashina harakati
      const drive = e(12, .22, 1), tt = sm(drive); route.getPointAt(clamp(tt), trkP); route.getTangentAt(clamp(tt), trkT);
      if (drive <= 0) { truck.position.set(101, 0, 0); truck.rotation.y = 0; } else { truck.position.copy(trkP); truck.rotation.y = Math.atan2(trkT.x, trkT.z) - Math.PI / 2; }
      wheels.forEach(w => { w.rotation.z -= (drive > 0 && drive < 1 ? 14 * dt * (1 - Math.abs(drive - .5) * .6) * Math.sign(PD) : 0); });
      truck.updateMatrixWorld(true);
      /* ======== tabaqa / quti dunyo holati ======== */
      const lx = K(p, LEAF_X); let lyaw = 0;
      leafP.set(lx, LINE_Y + .0625 + .0, 0); leafP.y = lx > 83 ? LINE_Y + .0625 + K(p, [[bp(10, .1), 0], [bp(10, .5), .028]]) : LINE_Y + .0625; leafQ.identity(); packP.copy(leafP); packQ.identity();
      const cp = V(0, 0, 0);
      if (p >= bp(11, .05) && p < bp(11, .86)) { // ishchilar ko‘tarib darvoza orqali olib chiqadi
        leafP.set(K(p, [[bp(11, .05), 86], [bp(11, .22), 87.6], [bp(11, .5), 92.5], [bp(11, .75), 94.6], [bp(11, .86), 94.6]]), K(p, [[bp(11, .05), LEAF_Y0()], [bp(11, .22), 1.02], [bp(11, .86), 1.12]]), 0); packP.copy(leafP);
      } else if (p >= bp(11, .86) && p < bp(13, 0)) { // kuzovga suriladi, mashina bilan birga ketadi
        const slide = K(p, [[bp(11, .86), 0], [bp(11, .98), 1]]); leafP.set(lerp(94.6, 97.4, slide), 1.12, 0);
        truck.updateMatrixWorld(true); if (p > bp(11, .98)) { const wl = truck.localToWorld(t1.set(-3.6, 1.075, 0)); leafP.copy(wl); leafQ.copy(truck.quaternion); } packP.copy(leafP); packQ.copy(leafQ);
        if (p <= bp(11, .98)) leafP.y = lerp(1.12, 1.075, slide), packP.copy(leafP);
      } else if (p >= bp(13, 0)) { // uyga olib kiriladi
        const kk = [[bp(13, 0), [TE.x - 3.6, 1.075, TE.z]], [bp(13, .08), [TE.x - 5.9, 1.05, TE.z]], [bp(13, .24), [TE.x - 3.0, 1.0, 9.6]], [bp(13, .4), [HB_X - 1.5, 1.0, 7.4]], [bp(13, .55), [HB_X + 1.8, 1.0, 3.2]], [bp(13, .66), [BX, 1.0, BZ + .5]], [bp(13, .74), [BX, .055, BZ]], [1, [BX, .055, BZ]]];
        c.KV(p, kk, cp); const yawK = K(p, [[bp(13, 0), 0], [bp(13, .3), 0], [bp(13, .5), Math.PI / 2], [1, Math.PI / 2]]); leafP.copy(cp); leafQ.copy(qY(yawK)); packP.copy(cp); packQ.copy(leafQ); lyaw = yawK;
      }
      // quti ochilishi: qopqoq ko‘tarilib chetga qo‘yiladi, plyonka olinadi (14-bosqich)
      lidW.visible = p > bp(10, .5); lidW.position.copy(packP); lidW.quaternion.copy(packQ); lid.position.set(0, K(p, [[bp(10, .55), .5], [bp(10, .95), .06]]), 0);
      const lidPos = V(0, 0, 0);
      if (p >= bp(14, 0)) { const base = V(BX, .1, BZ), up = V(BX - .3, .95, BZ), aside = V(BX - 2.6, .95, BZ - .6), floorP = V(BX - 2.6, .03, BZ - .6); lidPos.copy(c.KV(p, [[bp(14, 0), [base.x, base.y, base.z]], [bp(14, .08), [up.x, up.y, up.z]], [bp(14, .2), [aside.x, aside.y, aside.z]], [bp(14, .3), [floorP.x, floorP.y, floorP.z]]], t1)); lidW.position.copy(lidPos); lidW.quaternion.copy(qY(lyaw)); lid.position.set(0, 0, 0); }
      /* eshik tabaqasi: qutidan ko‘tarilib romga qo‘yiladi (14-bosqich), keyin petlada ochiladi */
      leaf.userData.openAng = 0;
      const hu = e(14, .3, .95); const upPos = V(HB_X, 1.02, -3.58);
      if (p >= bp(14, .3)) {
        const s1 = clamp(hu / .72), s2 = clamp((hu - .72) / .28), u1 = sm(s1);
        const ly = V(BX, .055, BZ), mid = V(HB_X + .0, 1.05, -2.35);
        leafP.set(lerp(ly.x, mid.x, u1), lerp(ly.y, mid.y, u1) + Math.sin(u1 * Math.PI) * .25, lerp(ly.z, mid.z, u1)); leafQ.copy(qY(Math.PI / 2)).slerp(qUp, u1);
        if (s2 > 0) leafP.set(HB_X, 1.02 + (1 - sm(s2)) * .03, lerp(-2.35, -3.58, sm(s2)));
        // petlada ochilish/yopilish
        const ang = K(p, [[bp(17, .08), 0], [bp(17, .3), -1.2], [bp(17, .5), -1.2], [bp(17, .72), 0], [bp(17, .9), -.45], [1, -.45]]);
        if (p >= bp(17, 0) || ang !== 0) { const rel = V(upPos.x - hingeW.x, 0, 0).applyAxisAngle(UP, ang); leafP.set(hingeW.x + rel.x, 1.02, hingeW.z + rel.z); leafQ.copy(qUp).premultiply(qa.setFromAxisAngle(UP, ang)); leaf.userData.openAng = ang; }
      }
      leaf.position.copy(leafP); leaf.quaternion.copy(leafQ); pack.position.copy(packP); pack.quaternion.copy(packQ); leaf.visible = p > bp(4, .9);
      // eshik ichida chiqib turgan hardware
      hardware.visible = p > bp(15, .3); handle.scale.setScalar(Math.max(.001, sm(e(16, .1, .55)))); handle.visible = p > bp(16, .05); hingeH.forEach(h => { h.visible = p > bp(15, .3); });
      const door1 = K(p, [[bp(11, .55), 0], [bp(11, .8), 1.75], [bp(12, .12), 1.75], [bp(12, .22), 0], [bp(12, .96), 0], [bp(13, .04), 1.75], [bp(13, .3), 1.75], [bp(13, .45), 1.75]]); cargoDoor.rotation.y = door1; cargoDoor2.rotation.y = -door1;
      truck.updateMatrixWorld(true);

      /* ======== ishchilar: yurish, qo‘l bilan ish, asboblar ======== */
      // yuk ko‘targich haydovchisi (o‘tirgan holat): rul, oyoqlar
      { const P = W.drv; P.g.visible = fk.visible && near({ g: fk }); if (P.g.visible) { P.g.position.set(-.1, 0, 0); P.g.rotation.y = Math.PI / 2; P.hips.position.y = 1.34; P.legL.rotation.x = P.legR.rotation.x = -1.45; P.knL.rotation.x = P.knR.rotation.x = 1.5; P.torso.rotation.set(.05, 0, 0); P.head.rotation.set(0, 0, 0); P.hips.rotation.set(0, 0, 0); fkb.updateMatrixWorld(true); P.torso.updateWorldMatrix(true, false); const wp = wheelG.getWorldPosition(t1); reachBoth(P, t2.copy(wp).add(V(0, 0, 0)).addScaledVector(V(0, 0, 1), .0), t3.copy(wp)); reach(P, 1, surf(wheelG, .1, 0, .09, t2)); reach(P, -1, surf(wheelG, -.1, 0, -.09, t3)); settle(P); } }
      // stansiya ishchilari
      const work = (P, key, active, ph, hold) => { const [cx, cz] = CONS[key]; stand(P, cx, cz - .62, 0, .28); P.g.visible = near(P); walker(P, dt, t, ph); if (!P.g.visible) return; const bob = active ? Math.sin(t * 6 + ph) * .012 : 0; P.g.updateMatrixWorld(true); reachBoth(P, t1.set(cx - .13, .985 + bob, cz - .06), t2.set(cx + .15, .985 - bob, cz - .1)); look(P, t3.set(cx, 1.25, cz), .7); if (P.g.visible) settle(P); };
      work(W.saw, 'saw', sawOn, 0); work(W.sand, 'sand', sandOn, 1.3); work(W.cnc, 'cnc', cncOn, 2.1); work(W.paint, 'paint', paintOn, 3.2);
      // yig‘uvchilar: tabaqani ikki yondan boshqaradi
      { const act5 = within(p, 5); [[W.a1, -.98, 0, -.34], [W.a2, .98, Math.PI, .34]].forEach(([P, z, face, hz], i) => { stand(P, 54 + (i ? .6 : -.4), z * .87, face, .3); P.g.visible = near(P); walker(P, dt, t, i * 1.7); if (!P.g.visible) return; P.g.updateMatrixWorld(true); const sway = Math.sin(t * 3 + i) * .03; if (act5) { reachBoth(P, t1.set(54 - .35, LINE_Y + .1 + sway, hz), t2.set(54 + .35, LINE_Y + .1 - sway, hz)); look(P, t3.set(54, LINE_Y, 0), .8); } else look(P, t3.set(54, LINE_Y, 0), .3); settle(P); }); }
      // QC: tekshiradi — qo‘li bilan yuzani silaydi, chap qo‘lda taxta
      { const P = W.qc; stand(P, 82.4, .95, Math.PI, .3); P.g.visible = near(P); walker(P, dt, t, .6); clipQ.visible = P.g.visible; if (P.g.visible) { P.g.updateMatrixWorld(true); const lx2 = K(p, LEAF_X), qcOn = p > bp(9, .5) && p < bp(10, .5); const sw = qcOn ? Math.sin(t * 1.3) * .55 : 0; clipQ.position.copy(torsoPt(P, -.14, .3, .3, t1)); P.torso.getWorldQuaternion(tmpQ); clipQ.quaternion.copy(tmpQ).multiply(qa.setFromEuler(new T.Euler(-1.2, 0, 0))); reach(P, -1, torsoPt(P, -.14, .3, .26, t2)); reach(P, 1, t3.set(lx2 + sw, LINE_Y + .17 + (qcOn ? 0 : .12), qcOn ? .12 : .5)); look(P, t4.set(lx2, LINE_Y, 0), .8); settle(P); } }
      // qadoqlovchilar: tabaqa chetlarini ushlab plyonka/quti bilan ishlaydi (10-bosqich)
      [[W.p1, -.98, 0, -.5], [W.p2, .98, Math.PI, .5]].forEach(([P, z, face, hz], i) => { const on = p >= bp(10, 0) && p < bp(11, .02); stand(P, 85.8 + (i ? .5 : -.5), z * .87, face, .3); P.g.visible = p < bp(11, .05) && near(P); walker(P, dt, t, i); if (!P.g.visible) return; P.g.updateMatrixWorld(true); const w2 = on ? Math.sin(t * 2.2 + i * 2) * .5 : 0; reachBoth(P, t1.set(86 - .6 + w2 * .3, 1.04, hz * .93), t2.set(86 + .5 + w2 * .3, 1.04, hz * .93)); look(P, t3.set(86, 1, 0), .8); settle(P); });
      // ko‘tarib yuruvchilar: quti ikki yonda, so‘ng orqada itaradi
      { const C = [W.c1, W.c2]; const active = p >= bp(10, .95) && p < bp(13, 0); C.forEach((P, i) => { P.g.visible = active && near(P); if (!P.g.visible) return; const side = i ? 1 : -1; let px, pz, face = Math.PI / 2, lean = .2; const bx = leafP.x;
          if (p < bp(11, .8)) { px = bx; pz = side * .78; } else if (p < bp(11, .88)) { const u = sm(seg(p, bp(11, .8), bp(11, .88))); px = lerp(bx, bx - 1.5, u); pz = lerp(side * .78, side * .3, u); } else { px = leafP.x - 1.6 + ((p > bp(11, .88)) ? 0 : 0); pz = side * .3; }
          if (p >= bp(12, 0)) { const u = e(12, 0, .35); px = lerp(px, 93.2, u); pz = lerp(pz, side * (2.2 + u * 1.2), u); face = lerp(Math.PI / 2, Math.PI / 2 - side * .4, u); }
          stand(P, px, pz, p < bp(11, .8) ? Math.PI / 2 : face, lean); P.face = Math.PI / 2; walker(P, dt, t, i); P.g.updateMatrixWorld(true);
          if (p < bp(12, 0)) { if (p < bp(11, .8)) reachBoth(P, surf(pack, -.5, -.05, side * .48, t1), surf(pack, .5, -.05, side * .48, t2)); else reachBoth(P, surf(pack, -1.0, 0, side * -.3 + side * .3 + (i ? .22 : -.22) * 0 + (i ? .24 : -.24), t1), surf(pack, -1.0, .05, (i ? .24 : -.24), t2)); }
          settle(P); }); }
      // nazoratchi: planshet bilan sex bo‘ylab yuradi
      { const P = W.sup; P.g.position.set(70 + Math.sin(t * .22) * 5, 0, 4.6); P.g.visible = p > bp(3, .2) && p < bp(11, .9) && near(P); clipS.visible = P.g.visible; if (P.g.visible) { P.g.position.set(70 + Math.sin(t * .22) * 5, 0, 4.6); P.lean = .05; P.face = null; walker(P, dt, t, 0); P.g.updateMatrixWorld(true); clipS.position.copy(torsoPt(P, .14, .3, .26, t1)); P.torso.getWorldQuaternion(tmpQ); clipS.quaternion.copy(tmpQ).multiply(qa.setFromEuler(new T.Euler(-1.25, 0, 0))); reach(P, 1, torsoPt(P, .14, .32, .24, t2)); reach(P, -1, torsoPt(P, -.1, .3, .22, t3)); settle(P); } else clipS.visible = false; }

      /* ======== 4-akt: uy B (o‘rnatuvchilar) ======== */
      const iv = p >= bp(12, .9);
      inst1.g.visible = inst2.g.visible = iv; cliB.g.visible = cliB2.g.visible = p >= bp(13, .45);
      meter.visible = meter.visible && actA; level.visible = false; drill.visible = false;
      if (iv) {
        // truckdan chiqib, orqaga boradi (12-bosqich oxiri – 13-bosqich boshi)
        const s0 = V(TE.x + 3.6, 0, TE.z - 2.0), s1 = V(TE.x - 5.4, 0, TE.z - 1.0), uA = sm(seg(p, bp(12, .9), bp(13, 0)));
        const carryU = p >= bp(13, .0) && p < bp(13, .74), yaw0 = lyaw, side = V(Math.sin(yaw0), 0, Math.cos(yaw0));
        if (p < bp(13, 0)) { [[inst1, -1], [inst2, 1]].forEach(([P, s]) => { P.g.position.set(lerp(s0.x, s1.x, uA), 0, lerp(s0.z + s * .45, s1.z + s * 1.2, uA)); P.face = null; P.lean = 0; walker(P, dt, t, s); }); }
        else if (carryU) { [[inst1, -1], [inst2, 1]].forEach(([P, s]) => { const cx = leafP.x + side.x * s * .8, cz = leafP.z + side.z * s * .8, wb = sm(seg(p, bp(13, 0), bp(13, .1))); P.g.position.set(lerp(s1.x, Math.min(cx, p < bp(13, .14) ? TE.x - 5.6 : cx), wb), 0, lerp(s1.z + s * 1.2, cz, wb)); P.face = yaw0 + Math.PI / 2; P.lean = .12; walker(P, dt, t, s); P.g.updateMatrixWorld(true); reachBoth(P, surf(pack, -.5, -.05, s * .48, t1), surf(pack, .5, -.05, s * .48, t2)); }); }
        else if (p < bp(14, .3)) { // quti qo‘yildi: tekshirish va qopqoqni olish
          const chk = p >= bp(13, .78);
          stand(inst1, K(p, [[bp(13, .74), BX - .8], [bp(13, .8), BX - .9], [bp(13, .9), HB_X + .75], [bp(14, .0), HB_X + .75], [bp(14, .08), BX - .9], [bp(14, .3), BX - 1.5]]), K(p, [[bp(13, .74), BZ], [bp(13, .9), -2.7], [bp(14, 0), -2.7], [bp(14, .08), BZ], [bp(14, .3), BZ - .3]]), K(p, [[bp(13, .74), Math.PI / 2], [bp(13, .9), Math.PI], [bp(14, 0), Math.PI], [bp(14, .1), Math.PI / 2]]), .25);
          stand(inst2, BX + .85, BZ, -Math.PI / 2, .2); inst1.crouch = 0; inst2.crouch = 0; walker(inst1, dt, t, 0); walker(inst2, dt, t, 1);
          inst1.g.updateMatrixWorld(true); inst2.g.updateMatrixWorld(true);
          if (chk && p < bp(14, .02)) { level.visible = true; level.position.set(HB_X + .5, K(p, [[bp(13, .8), 1.7], [bp(14, 0), 1.0]]), -3.36); level.rotation.set(0, 0, Math.PI / 2); reachBoth(inst1, surf(level, 0, 0, 0, t1).add(V(0, .12, 0)), surf(level, 0, 0, 0, t2).add(V(0, -.12, 0))); look(inst1, t3.set(HB_X + .5, 1.3, -3.4), .8); }
          if (p >= bp(14, .0) && p < bp(14, .3)) { reachBoth(inst1, surf(lidW, -.5, 0, -.48, t1), surf(lidW, .5, 0, -.48, t2)); inst1.lean = .3; }
          if (p >= bp(14, .0)) { reach(inst2, 1, V(BX + .5, .8, BZ - .3)); reach(inst2, -1, V(BX + .5, .8, BZ + .3)); }
        } else { // eshik tabaqasi: ko‘tariladi, romga joylanadi, sath, petlalar, dastak, sinov
          const hu2 = clamp((p - bp(14, .3)) / (bp(14, .95) - bp(14, .3))), lift = sm(clamp(hu2 / .72));
          const placed = p >= bp(14, .95), L1p = surf(leaf, .15, 0, -.4, t1).clone(), L2p = surf(leaf, -.2, 0, -.4, t2).clone(), R1p = surf(leaf, .15, 0, .4, t3).clone(), R2p = surf(leaf, -.2, 0, .4, t4).clone();
          const dirAway = (s) => V(lerp(s, 0, lift * .9), 0, lerp(0, 1, lift)).normalize();
          const setStance = (P, s, targetPt, dist, lean) => { const d = dirAway(s); P.g.position.set(targetPt.x + d.x * dist, 0, targetPt.z + d.z * dist); P.face = Math.atan2(-d.x, -d.z); P.lean = lean; };
          walker(inst1, dt, t, 0); walker(inst2, dt, t, 1);
          if (!placed) { setStance(inst1, -1, V((L1p.x + L2p.x) / 2, 0, (L1p.z + L2p.z) / 2), .5 + lift * .15, .3); setStance(inst2, 1, V((R1p.x + R2p.x) / 2, 0, (R1p.z + R2p.z) / 2), .5 + lift * .15, .3); inst1.g.updateMatrixWorld(true); inst2.g.updateMatrixWorld(true); reachBoth(inst1, L1p, L2p); reachBoth(inst2, R1p, R2p); }
          else {
            // 15: sath va qistirmalar; 16: dastak; 17: sinov
            if (p < bp(17, 0)) {
              const lvlOn = p < bp(15, .5), drOn = p >= bp(15, .45) && p < bp(16, .2), hOn = p >= bp(16, .1) && p < bp(17, 0);
              stand(inst2, HB_X + .72, -3.0, Math.PI, .14); stand(inst1, HB_X - .72, -3.0, Math.PI, .14); inst1.crouch = 0; inst2.crouch = 0;
              walker(inst1, dt, t, 0); walker(inst2, dt, t, 1);
              // sath: o‘ng qirra bo‘ylab
              if (lvlOn) { level.visible = true; const ly = K(p, [[bp(15, 0), 1.6], [bp(15, .25), 1.0], [bp(15, .5), 1.5]]); level.position.set(HB_X + .36, ly, -3.52); level.rotation.set(0, 0, Math.PI / 2); inst2.g.updateMatrixWorld(true); reachBoth(inst2, surf(level, 0, 0, 0, t1).add(V(0, .15, 0)), surf(level, 0, 0, 0, t2).add(V(0, -.15, 0))); look(inst2, level.position, .8); }
              else { inst2.g.updateMatrixWorld(true); reach(inst2, 1, V(HB_X + .38, 1.0, -3.5)); reach(inst2, -1, V(HB_X + .38, 1.4, -3.5)); }
              inst1.g.updateMatrixWorld(true);
              const si = clamp(Math.floor(e(15, .0, .55) * 4), 0, 3), shy = 1.85 - si * .52;
              if (!drOn && !hOn) { crouchTo(inst1, shy); inst1.g.updateMatrixWorld(true); reach(inst1, 1, V(HB_X - .4, shy, -3.45)); reach(inst1, -1, V(HB_X - .4, shy + .12, -3.45)); look(inst1, V(HB_X - .4, shy, -3.5), .8); }
              if (drOn) { const di = clamp(Math.floor(e(15, .5, 1.0) * 3 + e(16, 0, .2) * 0), 0, 2), hy = 1.02 + [.78, 0, -.78][di]; drill.visible = true; crouchTo(inst1, hy); inst1.g.updateMatrixWorld(true); drill.position.set(HB_X - .38, hy, -3.3 + Math.sin(t * 12) * .004); drill.rotation.set(0, Math.PI, 0); drill.position.z = -3.3 + .0; reach(inst1, 1, V(drill.position.x, hy, -3.1)); reach(inst1, -1, V(HB_X - .35, hy + .05, -3.15)); look(inst1, V(HB_X - .4, hy, -3.58), .8); }
              if (hOn) { crouchTo(inst2, 1.0); inst2.g.updateMatrixWorld(true); const hp = surf(handle, 0, .03, 0, t1).clone(); reach(inst2, 1, hp.add(V(0, 0, .05))); reach(inst2, -1, V(HB_X + .3, 1.0, -3.35)); look(inst2, hp, .8); }
            } else { // 17: sinov — petla atrofida ochish/yopish
              const hp = surf(handle, 0, .06, -.04, t1).clone(), d = V(.35, 0, .95).normalize();
              const wb17 = sm(seg(p, bp(17, 0), bp(17, .14))); inst1.g.position.set(lerp(HB_X - .72, hp.x + d.x * .55, wb17), 0, lerp(-3.0, hp.z + d.z * .55, wb17)); inst1.face = Math.atan2(-d.x, -d.z); inst1.lean = .22; inst1.crouch = 0; walker(inst1, dt, t, 0); inst1.g.updateMatrixWorld(true); reach(inst1, 1, hp); reach(inst1, -1, torsoPt(inst1, -.12, .3, .2, t2)); look(inst1, hp, .6);
              stand(inst2, lerp(HB_X + .72, HB_X + 1.4, sm(seg(p, bp(17, 0), bp(17, .14)))), lerp(-3.0, -1.7, sm(seg(p, bp(17, 0), bp(17, .14)))), Math.PI - .5 * sm(seg(p, bp(17, 0), bp(17, .14))), 0); inst2.crouch = 0; walker(inst2, dt, t, 1); look(inst2, V(HB_X, 1.2, -3.2), .6); inst2.g.updateMatrixWorld(true); reach(inst2, 1, torsoPt(inst2, .1, .3, .22, t2)); reach(inst2, -1, torsoPt(inst2, -.1, .27, .22, t3));
            }
          }
          settle(inst1); settle(inst2);
        }
        if (p < bp(13, 0) || carryU) { settle(inst1); settle(inst2); }
        // mijoz B
        if (cliB.g.visible) { c.KV(p, [[bp(12, .9), [HB_X - 3.5, 0, 12]], [bp(13, .1), [HB_X - 3.2, 0, 7]], [bp(13, .55), [HB_X - 2.0, 0, 3.4]], [1, [HB_X - 2.2, 0, 2.6]]], cliB.g.position); cliB.face = null; if (p > bp(13, .6)) cliB.face = Math.atan2(2.0, -6.0); cliB.lean = 0; walker(cliB, dt, t, 2); cliB.g.updateMatrixWorld(true); if (p > bp(13, .6)) { reach(cliB, 1, torsoPt(cliB, -.08, .3, .2, t1)); reach(cliB, -1, torsoPt(cliB, .1, .27, .21, t2)); look(cliB, V(HB_X, 1.3, -3.2), .6); } settle(cliB); } if (cliB2.g.visible) { c.KV(p, [[bp(12, .9), [HB_X - 4.1, 0, 12]], [bp(13, .1), [HB_X - 3.9, 0, 7.6]], [bp(13, .55), [HB_X - 3.0, 0, 3.8]], [1, [HB_X - 3.3, 0, 2.8]]], cliB2.g.position); cliB2.face = null; if (p > bp(13, .6)) cliB2.face = Math.atan2(2.0, -6.0); cliB2.lean = 0; walker(cliB2, dt, t, 3); cliB2.g.updateMatrixWorld(true); if (p > bp(13, .6)) { reach(cliB2, 1, torsoPt(cliB2, -.08, .3, .2, t1)); reach(cliB2, -1, torsoPt(cliB2, .1, .27, .21, t2)); look(cliB2, V(HB_X, 1.3, -3.2), .6); } settle(cliB2); }
      }
      // tabaqa 4-aktda ko‘rinadi, uy A odamlarining qo‘llari
      if (actA) { settle(engA); settle(cliA); settle(cliA2); }
      // yaqin bo‘lmagan odamlarni yashirish (tezlik uchun) — yuqorida bajarilgan
      /* ======== quti tugmalari (qadoq ichidagi plyonka 14-bosqichda olinadi) ======== */
      if (p >= bp(14, 0)) film.visible = false;
    });
    function LEAF_Y0() { return LINE_Y + .0625 + .028; }
    c.leaf = leaf; c.truck = truck; c.route = route; c.HB_X = HB_X;
    // atmosfera: zonaga qarab osmon/tuman/yorug‘lik
    const sky = [[0, [.81, .89, 1]], [bp(2, .9), [.81, .89, 1]], [bp(3, .2), [.72, .76, .82]], [bp(10, 1), [.72, .76, .82]], [bp(11, .5), [.78, .8, .84]], [bp(12, .5), [.95, .84, .66]], [bp(13, 0), [.86, .9, .96]], [1, [.88, .93, 1]]];
    const colv = V(0, 0, 0);
    c.mood = (p, cam) => { camP.copy(cam.position); c.KV(p, sky, colv); c.scene.background.setRGB(colv.x, colv.y, colv.z); c.scene.fog.color.setRGB(colv.x, colv.y, colv.z); c.scene.fog.far = p < bp(3, .2) ? 110 : (p < bp(11, .5) ? 160 : 300); c.scene.fog.near = 40; c.sun.intensity = K(p, [[0, 2.2], [bp(3, .3), 2.0], [bp(11, .6), 2.4], [bp(12, .5), 2.6], [1, 2.2]]); c.hemi.intensity = K(p, [[0, .34], [bp(3, .3), .5], [bp(11, .6), .4], [1, .34]]); c.fill.intensity = K(p, [[bp(2, .8), 0], [bp(3, .3), 3.2], [bp(10, .9), 3.2], [bp(11, .6), 0], [1, 0]]); c.fill.color.setHex(0xfff1dc); };
  };

  /* ---------- Kamera kalit kadrlari ---------- */
  Y._cam = function (c) {
    const bp = Y.bp, HB = c.HB_X, route = c.route, P = new T.Vector3();
    const at = f => { route.getPointAt(clamp(sm(seg(f, .22, 1))), P); return [P.x, P.y, P.z]; };
    const chase = (f, dx, dy, dz, lx = 0, ly = 1.5, lz = 0) => { const a = at(f); return [[bp(12, f), [a[0] + dx, a[1] + dy, a[2] + dz], [a[0] + lx, a[1] + ly, a[2] + lz]]]; };
    const k = []; const add = (p, pos, look) => k.push([p, pos, look]);
    // 1-akt: uy A
    add(0, [3.4, 1.9, 10.5], [0, 1.4, 0]); add(bp(0, .55), [2.6, 1.75, 6.2], [0, 1.2, -1.2]);
    add(bp(1, 0), [-3.4, 1.55, 2.2], [-.1, 1.2, -2.1]); add(bp(1, .45), [-3.2, 1.45, 1.6], [-.1, 1.2, -2.6]); add(bp(1, .8), [2.9, 1.5, 2.2], [0, 1.2, -2.4]);
    add(bp(2, .1), [-3.9, 1.5, .5], [-.25, 1.3, -.8]); add(bp(2, .6), [-3.7, 1.45, .2], [-.25, 1.3, -.8]);
    add(bp(2, .76), [-2.4, 2.4, 5.0], [6, 1.6, 0]); add(bp(2, .9), [7, 4.8, 13], [20, 2.2, 0]); add(bp(3, .1), [18, 6.2, 18.5], [38, 1.5, 3]);
    // 2-akt: zavod — kamera konveyer bo‘ylab, eshik tabaqasiga yaqin va past burchakdan
    add(bp(3, .42), [34, 3.4, 12.5], [41, 1.2, 3.8]); add(bp(3, .75), [40, 3.0, 9.5], [43.5, 1.1, 2]);
    add(bp(4, .1), [44.4, 2.2, 4.0], [47.4, 1.3, 0]); add(bp(4, .8), [51.2, 2.2, 3.8], [50, 1.2, 0]);
    add(bp(5, .1), [51.8, 2.2, 3.8], [54, 1.2, 0]); add(bp(5, .9), [56.0, 2.2, 3.6], [54, 1.2, 0]);
    add(bp(6, .15), [57.4, 3.0, 6.4], [59.8, 1.3, 0]); add(bp(6, .85), [62.4, 3.0, 6.0], [61.4, 1.2, 0]);
    add(bp(7, .1), [63.2, 3.0, 6.2], [65.6, 1.2, 0]); add(bp(7, .9), [68.4, 2.9, 5.8], [66, 1.2, 0]);
    add(bp(8, .1), [69.8, 2.3, 4.0], [71.4, 1.4, 0]); add(bp(8, .9), [74.6, 2.4, 4.0], [72, 1.4, 0]);
    add(bp(9, .1), [76, 2.3, 3.8], [78, 1.3, 0]); add(bp(9, .9), [83.2, 2.3, 3.8], [81, 1.2, 0.2]);
    add(bp(10, .1), [84.6, 2.3, 3.6], [86, 1.2, 0]); add(bp(10, .9), [88.0, 2.5, 3.8], [86.2, 1.1, 0]);
    // 3-akt: yuklash va yo‘l
    add(bp(11, .2), [85.5, 2.3, 5.2], [93, 1.3, 0]); add(bp(11, .75), [90.6, 2.2, 2.7], [96, 1.2, .2]);
    chase(.05, 6, 3.6, 11, -1, 1.5, 0).forEach(a => k.push(a)); chase(.3, 9, 4.0, 12.5, -1, 1.5, 0).forEach(a => k.push(a)); chase(.55, 10, 4.2, 13, -1, 1.5, 0).forEach(a => k.push(a)); chase(.8, 10, 4.0, 12.5, -1, 1.5, 0).forEach(a => k.push(a)); chase(1, 8, 3.2, 11, -2, 1.5, 0).forEach(a => k.push(a));
    // 4-akt: uy B
    add(bp(13, .15), [HB - 5, 2.8, 16.5], [HB - 1, 1.4, 6]); add(bp(13, .55), [HB - 2.2, 1.8, 8.6], [HB + 1.4, 1.1, 2.0]);
    add(bp(13, .95), [HB + 1.0, 1.7, 4.2], [HB + 1.4, 1.0, -1.4]);
    add(bp(14, .35), [HB + 2.2, 1.6, 2.4], [HB + 1.6, 1.0, -1.6]); add(bp(14, .9), [HB + 1.6, 1.5, 1.0], [HB, 1.1, -3.0]);
    add(bp(15, .5), [HB - 2.4, 1.5, 1.2], [HB - .3, 1.05, -3.4]);
    add(bp(16, .5), [HB + 2.1, 1.35, 1.1], [HB + .15, 1.05, -3.4]);
    add(bp(17, .2), [HB + .6, 1.4, 2.0], [HB, 1.1, -3.3]); add(bp(17, .6), [HB - .6, 1.5, 3.4], [HB, 1.2, -3.4]);
    add(1, [HB, 1.55, 5.6], [HB, 1.2, -3.6]);
    return k;
  };
})();
