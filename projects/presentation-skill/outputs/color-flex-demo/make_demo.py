#!/usr/bin/env python3
"""Colour-flex demo: the same three first-batch slides in three palettes each.

The rules stay fixed; only the colours inside each style's allowed roles change.
Reads ../style-moodboard-v5/src, writes src/*.html, then `node render.cjs`.
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE.parent / 'style-moodboard-v5' / 'src'

def variant(name, base, reps, extra_css=''):
    s = (SRC / base).read_text()
    for a, b in reps:
        assert a in s, (name, a[:60])
        s = s.replace(a, b)
    if extra_css:
        s = s.replace('</style>', extra_css + '\n</style>', 1)
    (HERE / 'src' / f'{name}.html').write_text(s)

# 顧問報告: one focus colour (block, key words, evidence numbers); neutrals and the warning red stay.
counsel = {
    'a-green': ('#0D6B4F', '#0B5E45', '#CFE5DB'),
    'b-blue':  ('#1F4FBF', '#1C46A8', '#DCE5FF'),
    'c-ink':   ('#1F2328', '#1F2328', '#C9CDD2'),
}
for key, (block, text, tint) in counsel.items():
    variant(f'counsel-{key}', '06-counsel.html', [
        ('--green:#0D6B4F;--greenText:#0B5E45;', f'--green:{block};--greenText:{text};'),
        ('<em style="color:#CFE5DB">', f'<em style="color:{tint}">'),
        ('<small style="color:#CFE5DB">', f'<small style="color:{tint}">'),
    ])

# Apple 發表: the black stage stays; the keyword gradient, device rim and floor light share one family.
apple = {
    'a-warm': (['#FFB340', '#FF7A3D', '#FF4D6A'], ['#3FE0D0', '#9BE15D', '#FFC233', '#FF5A5F']),
    'b-ice':  (['#8BE6FF', '#2E9BFF', '#2F6BFF'], ['#A5F3FF', '#5AC8FA', '#2E9BFF', '#33D1B0']),
    'c-leaf': (['#C6F27A', '#3DDC97', '#12B8A6'], ['#E8F79A', '#9BE15D', '#3DDC97', '#12B8A6']),
}
for key, (g, edge) in apple.items():
    variant(f'apple-{key}', '04-apple.html', [
        ('--warm:linear-gradient(90deg,#FFB340 0%,#FF7A3D 45%,#FF4D6A 100%)', f'--warm:linear-gradient(90deg,{g[0]} 0%,{g[1]} 45%,{g[2]} 100%)'),
        ('background:linear-gradient(135deg,#FFB340,#FF4D6A)', f'background:linear-gradient(135deg,{g[0]},{g[2]})'),
        ('.row.now i{border-color:#FF7A3D;', f'.row.now i{{border-color:{g[1]};'),
        ('<stop offset="0" stop-color="#3FE0D0"/><stop offset=".35" stop-color="#9BE15D"/><stop offset=".6" stop-color="#FFC233"/><stop offset="1" stop-color="#FF5A5F"/>',
         f'<stop offset="0" stop-color="{edge[0]}"/><stop offset=".35" stop-color="{edge[1]}"/><stop offset=".6" stop-color="{edge[2]}"/><stop offset="1" stop-color="{edge[3]}"/>'),
        ('<ellipse cx="960" cy="1080" rx="560" ry="180" fill="#FF7A3D"', f'<ellipse cx="960" cy="1080" rx="560" ry="180" fill="{g[1]}"'),
    ])

# 插畫場景: background and every object belong to one hue family, so the whole family turns together.
for key, deg in {'a-peach': 0, 'b-sage': 72, 'c-sky': 170}.items():
    variant(f'illustration-{key}', '01a-illustration-clay.html', [],
            extra_css=f'  .slide{{filter:hue-rotate({deg}deg)}}' if deg else '')
print('variants written')
