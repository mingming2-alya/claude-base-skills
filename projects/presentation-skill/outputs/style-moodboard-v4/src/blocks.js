// Isometric block renderer shared by 02a (matte wood) and 02b (glossy plastic).
// Set window.MATERIAL = 'wood' | 'plastic' before loading this file.
(function () {
  const MAT = window.MATERIAL || 'wood';
  const U = 46, A = U * Math.cos(Math.PI / 6), B = U * 0.5, V = U * 0.82;
  const L = norm([-0.45, 0.6, 1.0]);                       // light from the upper left
  function norm(v) { const m = Math.hypot(...v); return v.map(x => x / m); }
  const proj = ([x, y, z]) => [(x - y) * A, (x + y) * B - z * V];

  const PAL = {
    wood:  { base: '#D9BE8A', grain: '#B8955A' },
    red:   { base: '#D23E26' }, amber: { base: '#F0A920' }, teal: { base: '#0E8C7A' },
    cream: { base: '#F1EDE2' }, navy:  { base: '#2B3F8F' },
  };
  function shade(hex, n) {
    const k = 0.55 + 0.45 * Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    return '#' + c.map(v => Math.round(Math.min(255, v * k + (MAT === 'plastic' ? 10 : 0))).toString(16).padStart(2, '0')).join('');
  }
  const visible = n => n[0] + n[1] + n[2] > 1e-6;          // facing the viewer at (1,1,1)
  const pts = poly => poly.map(p => proj(p).map(v => v.toFixed(1)).join(',')).join(' ');

  // Each solid returns a list of faces: {poly:[[x,y,z]...], n:[nx,ny,nz]}
  function box(x, y, z, w, d, h) {
    const X = x + w, Y = y + d, Z = z + h;
    return [
      { poly: [[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]], n: [0, 0, 1], top: true },
      { poly: [[x, Y, Z], [X, Y, Z], [X, Y, z], [x, Y, z]], n: [0, 1, 0] },
      { poly: [[X, y, Z], [X, Y, Z], [X, Y, z], [X, y, z]], n: [1, 0, 0] },
    ];
  }
  function cylinder(cx, cy, z, r, h, seg = 40) {
    const faces = [];
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * 2 * Math.PI, a1 = ((i + 1) / seg) * 2 * Math.PI, am = (a0 + a1) / 2;
      const n = [Math.cos(am), Math.sin(am), 0];
      if (!visible(n)) continue;
      const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)], p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
      faces.push({ poly: [[...p0, z + h], [...p1, z + h], [...p1, z], [...p0, z]], n, side: true });
    }
    const top = [];
    for (let i = 0; i < seg; i++) { const a = (i / seg) * 2 * Math.PI; top.push([cx + r * Math.cos(a), cy + r * Math.sin(a), z + h]); }
    faces.push({ poly: top, n: [0, 0, 1], top: true, round: { cx, cy, r, z: z + h } });
    return faces;
  }
  function prism(x, y, z, w, d, h) {          // roof ridge runs along x
    const X = x + w, Y = y + d, M = y + d / 2, Z = z + h;
    const s = norm([0, h, d / 2]);
    return [
      { poly: [[x, M, Z], [X, M, Z], [X, y, z], [x, y, z]], n: [0, -s[1], s[2]] },
      { poly: [[x, Y, z], [X, Y, z], [X, M, Z], [x, M, Z]], n: [0, s[1], s[2]] },
      { poly: [[X, y, z], [X, M, Z], [X, Y, z]], n: [1, 0, 0] },
    ].filter(f => visible(f.n));
  }

  function draw(solid, color, opts = {}) {
    const base = PAL[color].base;
    let s = '';
    const sorted = solid.slice().sort((a, b) => (a.top ? 1 : 0) - (b.top ? 1 : 0));
    for (const f of sorted) {
      const fill = shade(base, f.n);
      s += `<polygon points="${pts(f.poly)}" fill="${fill}" stroke="${fill}" stroke-width=".8" stroke-linejoin="round"/>`;
      if (MAT === 'wood' && color === 'wood' && f.top) {
        // grain on natural wood tops, running along x
        const [p0, p1, , p3] = f.poly;
        for (let k = 1; k < 7; k++) {
          const t = k / 7, wob = (k % 2 ? .03 : -.02);
          const a = [p0[0], p0[1] + (p3[1] - p0[1]) * (t + wob), p0[2]], b = [p1[0], p1[1] + (p3[1] - p0[1]) * t, p1[2]];
          s += `<line x1="${proj(a)[0]}" y1="${proj(a)[1]}" x2="${proj(b)[0]}" y2="${proj(b)[1]}" stroke="${PAL.wood.grain}" stroke-opacity=".45" stroke-width="1.4"/>`;
        }
      }
      if (MAT === 'plastic' && !f.side) {
        // glossy rim along the lit edges
        const p = f.poly.map(proj);
        s += `<polyline points="${p.slice(0, 2).map(q => q.join(',')).join(' ')}" fill="none" stroke="#fff" stroke-opacity="${f.top ? .6 : .25}" stroke-width="2.5" stroke-linecap="round"/>`;
      }
    }
    if (MAT === 'plastic') {
      const sideFaces = solid.filter(f => f.side);
      if (sideFaces.length) {                 // specular stripe on cylinders
        const f = sideFaces[Math.floor(sideFaces.length * 0.28)];
        s += `<polygon points="${pts(f.poly)}" fill="#fff" opacity=".35"/>`;
      }
      if (opts.studs) {
        for (const [sx, sy, sz] of opts.studs) {
          const rx = Math.SQRT2 * 0.3 * A, ry = Math.SQRT2 * 0.3 * B, sh = 9, [cx, cy] = proj([sx, sy, sz]);
          s += `<path d="M${cx - rx},${cy} v${-sh} a${rx},${ry} 0 0 0 ${2 * rx},0 v${sh} a${rx},${ry} 0 0 1 ${-2 * rx},0 z" fill="${shade(base, [0, 1, 0])}"/>`;
          s += `<ellipse cx="${cx}" cy="${cy - sh}" rx="${rx}" ry="${ry}" fill="${shade(base, [0, 0, 1])}"/>`;
          s += `<path d="M${cx - rx * .7},${cy - sh - ry * .25} a${rx * .75},${ry * .6} 0 0 1 ${rx * .75},${-ry * .55}" stroke="#fff" stroke-opacity=".75" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
        }
      }
    }
    return s;
  }
  const studsOn = (x, y, z, w, d) => { const o = []; for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) o.push([x + i + .5, y + j + .5, z]); return o.sort((p, q) => (p[0] + p[1]) - (q[0] + q[1])); };

  // ---- the structure: base planks, three red service cubes, business pieces on top
  const PLANK = 0.5, CUBE = 2;
  const items = [];
  const plastic = MAT === 'plastic';
  for (const y of [0, 2, 4]) items.push({ z: 0, k: 0 + y, solid: box(0, y, 0, 8, 2, PLANK), color: plastic ? 'teal' : 'wood', studs: plastic ? studsOn(0, y, PLANK, 8, 2) : null });
  const Z1 = PLANK, Z2 = PLANK + CUBE;
  const cubes = [[0.5, 2.5], [3, 2.5], [5.5, 2.5]];
  for (const [x, y] of cubes) items.push({ z: Z1, k: x + y, solid: box(x, y, Z1, 2, 2, CUBE), color: 'red', studs: plastic ? studsOn(x, y, Z2, 2, 2) : null });
  // business pieces: each grows differently
  items.push({ z: Z2, k: 2.5, solid: cylinder(1.5, 3.5, Z2, .9, 1.4), color: 'amber', studs: plastic ? [[1.5, 3.5, Z2 + 1.4]] : null });
  items.push({ z: Z2 + 1.4, k: 2.6, solid: cylinder(1.5, 3.5, Z2 + 1.4, .9, 1.4), color: 'cream', studs: plastic ? [[1.5, 3.5, Z2 + 2.8]] : null });
  items.push({ z: Z2, k: 5, solid: prism(3, 2.5, Z2, 2, 2, 1.3), color: 'teal' });
  items.push({ z: Z2, k: 7.5, solid: box(5.5, 2.5, Z2, 2, 2, 1), color: 'amber', studs: plastic ? studsOn(5.5, 2.5, Z2 + 1, 2, 2) : null });
  // a piece being placed, floating above the third stack
  items.push({ z: 99, k: 99, solid: box(5.5, 2.5, Z2 + 3.1, 2, 2, 1), color: 'cream', studs: plastic ? studsOn(5.5, 2.5, Z2 + 4.1, 2, 2) : null, floating: true });
  items.sort((p, q) => (p.z - q.z) || (p.k - q.k));

  let svg = '';
  for (const it of items) svg += draw(it.solid, it.color, { studs: it.studs });
  // drop guides for the floating piece
  svg += `<g stroke="#F1EDE2" stroke-opacity=".8" stroke-width="3" stroke-dasharray="2 11" stroke-linecap="round">` +
    [[5.5, 4.5], [7.5, 4.5], [7.5, 2.5]].map(([x, y]) => { const a = proj([x, y, Z2 + 3.1]), b = proj([x, y, Z2 + 1.15]); return `<line x1="${a[0]}" y1="${a[1] + 6}" x2="${b[0]}" y2="${b[1]}"/>`; }).join('') + `</g>`;

  // fit the structure inside the performance cell
  const g = document.getElementById('blocks');
  g.innerHTML = svg;
  const bb = g.getBBox(), cell = window.CELL;
  const scale = Math.min((cell.w * 0.78) / bb.width, (cell.h * 0.8) / bb.height);
  const tx = cell.x + cell.w / 2 - (bb.x + bb.width / 2) * scale, ty = cell.y + cell.h * 0.53 - (bb.y + bb.height / 2) * scale;
  g.setAttribute('transform', `translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${scale.toFixed(3)})`);
})();
