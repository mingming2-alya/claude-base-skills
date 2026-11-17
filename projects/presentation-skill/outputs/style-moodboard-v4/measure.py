#!/usr/bin/env python3
"""Objective distinctness check for the ten mood images.

For each image: 6-colour palette (PIL median cut) with area weights, mean
lightness L*. Pairwise palette distance = symmetric weighted chamfer ΔE76
(each colour's distance to the nearest colour in the other palette).
Run from this folder: python3 measure.py
"""
from pathlib import Path
from PIL import Image
import itertools, math

def lab(rgb):
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (lin(v) for v in rgb)
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    fx, fy, fz = f(x), f(y), f(z)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))

def palette(path, k=6):
    im = Image.open(path).convert('RGB').resize((480, 270))
    q = im.quantize(colors=k, method=Image.MEDIANCUT)
    pal = q.getpalette()[: 3 * k]
    counts = sorted(q.getcolors(), reverse=True)
    total = sum(c for c, _ in counts)
    return [(lab(tuple(pal[3 * i: 3 * i + 3])), c / total) for c, i in counts]

def chamfer(p, q):
    d = lambda a, b: math.dist(a, b)
    one = sum(w * min(d(c, c2) for c2, _ in q) for c, w in p)
    two = sum(w * min(d(c, c2) for c2, _ in p) for c, w in q)
    return (one + two) / 2

imgs = sorted(Path('img').glob('*.jpg'))
pals = {p.stem: palette(p) for p in imgs}
print('image             mean L*  dominant colour (L*, a*, b*)')
for name, pal in pals.items():
    meanL = sum(c[0] * w for c, w in pal)
    (L, a, b), w = pal[0]
    print(f'{name:17s} {meanL:6.1f}   ({L:5.1f}, {a:6.1f}, {b:6.1f})  {w:4.0%}')
# variants of one style (01a/01b, 02a/02b) are meant to match, so skip those pairs
same = lambda a, b: a[:2] == b[:2]
pairs = sorted((chamfer(pals[a], pals[b]), a, b) for a, b in itertools.combinations(pals, 2) if not same(a, b))
print('\nclosest palette pairs (weighted chamfer ΔE):')
for d, a, b in pairs[:5]:
    print(f'  {d:5.1f}  {a} ↔ {b}')
print(f'farthest: {pairs[-1][0]:.1f}; median: {pairs[len(pairs)//2][0]:.1f}')
