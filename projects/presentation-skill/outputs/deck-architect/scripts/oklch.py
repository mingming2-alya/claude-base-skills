#!/usr/bin/env python3
"""OKLCH, CIELAB Delta-E, and WCAG contrast checks for deck-architect v4.

Usage:
  python3 oklch.py '#F1EFEA' '#0B5E45'
  python3 oklch.py --contrast '#B5381F' '#F1EFEA'
  python3 oklch.py --palette --bg '#F1EFEA' --focus '#0D6B4F,#1F4FBF,#1F2328' [--alert '#B5381F'] [--min-contrast 3.0]

Project colour rules (styles/color-system.md):
  - No pure white (#FFFFFF) or pure black (#000000) backgrounds.
  - No purple-dominant accents/gradients: OKLCH H in [280, 335] when C >= 0.04.
  - WCAG contrast: >= 3.0:1 for text >= 24px (or >= 18.66px bold), >= 4.5:1 below.
  - Three recommended palettes must be visually distinct: pairwise CIELAB Delta-E >= 15.
  - Focus vs alert hue distance >= 60 deg (exempt when focus is achromatic, C <= 0.025).
"""
import argparse
import math
import sys

sys.dont_write_bytecode = True


def _lin(c):
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _rgb_int(h):
    h = h.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    if len(h) != 6:
        raise ValueError(f"無效色碼：{h!r}")
    return [int(h[i:i + 2], 16) for i in (0, 2, 4)]


def _rgb(h):
    return [_lin(c) for c in _rgb_int(h)]


def _cbrt(x):
    return math.copysign(abs(x) ** (1.0 / 3.0), x)


def oklch(h):
    """Return (L, C, H) in OKLCH; L in [0,1], C >= 0, H in [0,360)."""
    r, g, b = _rgb(h)
    l = _cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
    m = _cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
    s = _cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
    L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    return L, math.hypot(A, B), math.degrees(math.atan2(B, A)) % 360.0


def cielab(h):
    """Return (L*, a*, b*) in CIELAB (D65)."""
    r, g, b = _rgb(h)
    x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047
    y = (0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / 1.00000
    z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883

    def f(t):
        return t ** (1.0 / 3.0) if t > 0.008856 else 7.787 * t + 16.0 / 116.0

    fx, fy, fz = f(x), f(y), f(z)
    return 116.0 * fy - 16.0, 500.0 * (fx - fy), 200.0 * (fy - fz)


def delta_e(h1, h2):
    l1, a1, b1 = cielab(h1)
    l2, a2, b2 = cielab(h2)
    return math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2)


def luminance(h):
    r, g, b = _rgb(h)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    x, y = sorted([luminance(a), luminance(b)], reverse=True)
    return (x + 0.05) / (y + 0.05)


def hue_diff(h1, h2):
    d = abs(h1 - h2) % 360.0
    return min(d, 360.0 - d)


def is_purple(h):
    _, C, H = oklch(h)
    return C >= 0.04 and 280.0 <= H <= 335.0


def check_palette(bg, focuses, alert=None, min_contrast=3.0):
    issues = []
    bg_norm = bg.strip().upper()
    if bg_norm in ("#FFFFFF", "#FFF", "#000000", "#000"):
        issues.append(f"底色 {bg} 為純白或純黑，請改用接近的白或黑。")

    parsed = []
    for c in focuses:
        L, C, H = oklch(c)
        cr = contrast(c, bg)
        parsed.append((c, L, C, H, cr))
        print(f"  {c:9s}  L {L:.3f}  C {C:.3f}  H {H:5.1f}  對底色 {cr:.2f}:1")
        if cr < min_contrast:
            issues.append(f"焦點色 {c} 對底色 {bg} 對比僅 {cr:.2f}:1（需 >= {min_contrast:.1f}:1）。")
        if is_purple(c):
            issues.append(f"焦點色 {c} 落在禁止的紫色帶（H {H:.1f} ∈ 280–335，C {C:.3f}）。")
        if alert and C > 0.025:
            _, _, ah = oklch(alert)
            hd = hue_diff(H, ah)
            if hd < 60.0:
                issues.append(f"焦點色 {c}（H {H:.1f}）與警示色 {alert}（H {ah:.1f}）色相差僅 {hd:.1f}°（需 >= 60°）。")

    for i in range(len(parsed)):
        for j in range(i + 1, len(parsed)):
            de = delta_e(parsed[i][0], parsed[j][0])
            print(f"  ΔE({parsed[i][0]}, {parsed[j][0]}) = {de:.1f}")
            if de < 15.0:
                issues.append(f"兩組配色 {parsed[i][0]} 與 {parsed[j][0]} 太接近（ΔE {de:.1f} < 15）。")
    return issues


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(0)
    if args[0] == "--contrast" and len(args) == 3:
        print(f"{args[1]} on {args[2]}: {contrast(args[1], args[2]):.2f}:1")
        return
    if args[0] == "--de" and len(args) == 3:
        print(f"ΔE({args[1]}, {args[2]}): {delta_e(args[1], args[2]):.2f}")
        return
    if args[0] == "--palette":
        ap = argparse.ArgumentParser()
        ap.add_argument("--bg", required=True)
        ap.add_argument("--focus", required=True, help="comma-separated hex colours")
        ap.add_argument("--alert")
        ap.add_argument("--min-contrast", type=float, default=3.0)
        ns = ap.parse_args(args[1:])
        focuses = [x.strip() for x in ns.focus.split(",") if x.strip()]
        print(f"底色 {ns.bg}  OKLCH ({oklch(ns.bg)[0]:.3f}, {oklch(ns.bg)[1]:.3f}, {oklch(ns.bg)[2]:.1f})")
        issues = check_palette(ns.bg, focuses, ns.alert, ns.min_contrast)
        if issues:
            print("\n未通過：")
            for msg in issues:
                print(f"  - {msg}")
            sys.exit(1)
        print("\n三組配色檢查通過。")
        return
    for c in args:
        L, C, H = oklch(c)
        flag = " [PURPLE]" if is_purple(c) else ""
        print(f"{c}  L {L:.3f}  C {C:.3f}  H {H:5.1f}{flag}")


if __name__ == "__main__":
    main()
