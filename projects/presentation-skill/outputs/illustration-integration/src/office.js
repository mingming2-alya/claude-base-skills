// The room in which the three people of "第一週會遇到的人" stand: wall, window, floor and three stations.
// Geometry only. Each rendering passes a style that decides how a shape is drawn:
//   S.fill(shapeSvgFragment, colourName)  -> a closed shape with a fill colour
//   S.line(d, colourName, width)          -> an open stroke
//   S.dot(cx, cy, r, colourName)          -> a small round mark
// Colour names: wall, floor, frame, glass, wood, cream, screen, peach, sage, butter, terra, skin, hair, dark, cal, accent, white.
const FLOOR = 905, X1 = 140, X2 = 700, X3 = 1260;
const rr = (x, y, w, h, r = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
const ci = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
const pa = (d) => `<path d="${d}"/>`;
function officeScene(S) {
  let s = '';
  // window high on the right wall
  s += S.fill(rr(1250, 92, 560, 296, 26), 'frame') + S.fill(rr(1276, 118, 508, 244, 14), 'glass') + S.line('M1530 118 V362', 'frame', 10);
  s += S.fill(pa('M1330 240 c-30 0 -34 -40 -4 -44 c4 -30 50 -34 60 -8 c24 -16 56 4 46 30 c28 4 26 40 -4 40 z'), 'white');
  s += S.fill(pa('M1600 300 c-24 0 -26 -30 -2 -34 c4 -24 40 -26 48 -6 c20 -12 44 4 36 24 c22 4 20 30 -4 30 z'), 'white');
  // floor and skirting
  s += S.floor ? S.floor(FLOOR) : S.fill(rr(-10, FLOOR, 1940, 190), 'floor');
  s += S.line(`M0 ${FLOOR - 4} H1920`, 'frame', 8);
  // station 1: the desk with your laptop
  s += S.fill(rr(X1 + 20, 716, 290, 24, 10), 'wood') + S.line(`M${X1 + 51} 740 V${FLOOR} M${X1 + 279} 740 V${FLOOR}`, 'wood', 18);
  s += S.fill(rr(X1 + 86, 594, 168, 114, 12), 'cream') + S.fill(rr(X1 + 98, 606, 144, 90, 8), 'screen') + S.fill(rr(X1 + 70, 704, 200, 14, 7), 'cream');
  // station 2: the board on its easel, Friday circled
  s += S.line(`M${X2 + 80} 772 L${X2 + 56} ${FLOOR} M${X2 + 250} 772 L${X2 + 274} ${FLOOR}`, 'wood', 14);
  s += S.fill(rr(X2 + 30, 586, 270, 190, 16), 'cream');
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) s += S.fill(rr(X2 + 54 + c * 46, 616 + r * 46, 36, 34, 6), r === 1 && c === 4 ? 'peach' : 'cal');
  s += S.line(`M${X2 + 283} 679 a27 27 0 1 1 -54 0 a27 27 0 1 1 54 0`, 'accent', 5);
  // station 3: the counter with the coffee machine and the printer
  s += S.fill(rr(X3 + 10, 740, 300, FLOOR - 740, 14), 'cream') + S.fill(rr(X3, 728, 320, 22, 10), 'butter') + S.line(`M${X3 + 160} 760 V${FLOOR - 20}`, 'frame', 4);
  s += S.fill(rr(X3 + 40, 590, 120, 140, 16), 'terra') + S.fill(rr(X3 + 60, 610, 80, 34, 8), 'dark') + S.fill(rr(X3 + 76, 694, 48, 36, 8), 'cream');
  s += S.fill(rr(X3 + 186, 640, 120, 90, 14), 'cream') + S.fill(rr(X3 + 200, 626, 92, 22, 6), 'white');
  // the three people
  s += person(S, X1 + 400, 'peach', 'wave') + person(S, X2 + 470, 'sage', 'point') + person(S, X3 + 420, 'butter', 'mug');
  return s;
}
function person(S, cx, shirt, pose) {
  let s = '';
  s += S.line(`M${cx - 17} 812 V${FLOOR - 10} M${cx + 17} 812 V${FLOOR - 10}`, 'dark', 28);
  s += S.fill(`<ellipse cx="${cx - 22}" cy="${FLOOR - 4}" rx="26" ry="12"/>`, 'dark') + S.fill(`<ellipse cx="${cx + 22}" cy="${FLOOR - 4}" rx="26" ry="12"/>`, 'dark');
  const back = { wave: `M${cx - 54} 690 L${cx - 78} 790`, point: `M${cx + 54} 690 L${cx + 78} 790`, mug: `M${cx - 54} 690 L${cx - 78} 790` }[pose];
  const front = { wave: `M${cx + 54} 690 L${cx + 96} 640 L${cx + 106} 582`, point: `M${cx - 54} 690 L${cx - 120} 668 L${cx - 168} 650`, mug: `M${cx + 54} 690 L${cx + 84} 760 L${cx + 52} 772` }[pose];
  const backHand = { wave: [cx - 80, 798], point: [cx + 80, 798], mug: [cx - 80, 798] }[pose];
  const frontHand = { wave: [cx + 108, 572], point: [cx - 176, 646], mug: [cx + 46, 772] }[pose];
  s += S.line(back, shirt, 30) + S.fill(ci(backHand[0], backHand[1], 17), 'skin');
  s += S.fill(rr(cx - 64, 664, 128, 170, 54), shirt);
  s += S.fill(ci(cx, 606, 52), 'skin') + S.fill(pa(`M${cx - 52} 600 C${cx - 52} 548 ${cx + 52} 540 ${cx + 52} 592 C${cx + 30} 574 ${cx - 20} 572 ${cx - 52} 600 Z`), 'hair');
  s += S.line(front, shirt, 30);
  if (pose === 'mug') s += S.fill(rr(cx + 24, 742, 46, 54, 10), 'terra');
  s += S.fill(ci(frontHand[0], frontHand[1], 17), 'skin');
  s += S.dot(cx - 17, 612, 5.5, 'dark') + S.dot(cx + 17, 612, 5.5, 'dark') + S.line(`M${cx - 14} 632 q14 12 28 0`, 'accent', 4.5);
  return s;
}
