"""Colour checks used when writing the style specs.

    python3 oklch.py '#F1EFEA' '#0B5E45'           # OKLCH of each colour
    python3 oklch.py --contrast '#B5381F' '#F1EFEA' # WCAG contrast ratio of a pair

OKLCH: L is lightness 0-1 (not linear: near-black #0B0B0D is about 0.15), C is chroma, H is hue in degrees.
The specs give colour roles as OKLCH ranges; contrast follows the project rule:
3:1 for text 24 px and larger, 4.5:1 below.
"""
import math
import sys


def _lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _rgb(h):
    h = h.lstrip('#')
    return [_lin(int(h[i:i + 2], 16)) for i in (0, 2, 4)]


def oklch(h):
    r, g, b = _rgb(h)
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l, m, s = (x ** (1 / 3) for x in (l, m, s))
    L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    return L, math.hypot(A, B), math.degrees(math.atan2(B, A)) % 360


def luminance(h):
    r, g, b = _rgb(h)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    x, y = sorted([luminance(a), luminance(b)], reverse=True)
    return (x + 0.05) / (y + 0.05)


if __name__ == '__main__':
    args = sys.argv[1:]
    if args[:1] == ['--contrast'] and len(args) == 3:
        print(f'{args[1]} on {args[2]}: {contrast(args[1], args[2]):.2f}:1')
    else:
        for c in args:
            L, C, H = oklch(c)
            print(f'{c}  L {L:.3f}  C {C:.3f}  H {H:5.1f}')
