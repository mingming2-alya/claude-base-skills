"""Write every colour combination of the first-batch styles: style x base (dark / light) x palette.

Each variant is the style's template with one :root block appended. Text colours are then checked by
render.cjs against what is actually painted behind them; gradient-filled text (Apple's keyword and
product name) is skipped there, so its stops are checked here against the stage.

    python3 make.py && node render.cjs
"""
import pathlib

HERE = pathlib.Path(__file__).parent

APPLE_MODE = {
    'dark': dict(stage='#0B0B0D', stageTop='#0B0B0D', stageBot='#0B0B0D', fg='#F5F5F7', tagc='#D9D9DE',
                 sub='#9A9AA0', nav='#8E8E93', hair='rgba(255,255,255,.22)',
                 auraOp='.55', rimOp='.9', floorOp='.22', shadowOp='0'),
    'light': dict(stage='#F2F2F5', stageTop='#F7F7F9', stageBot='#E6E6EB', fg='#1D1D1F', tagc='#3A3A3C',
                  sub='#5E5E63', nav='#5E5E63', hair='rgba(29,29,31,.2)',
                  auraOp='.42', rimOp='.7', floorOp='.07', shadowOp='.18'),
}
# main gradient (g1..g3) and edge light (e1..e4)
APPLE_PAL = {
    'dark': {
        'warm': ('暖橘', ['#FFB340', '#FF7A3D', '#FF4D6A'], ['#3FE0D0', '#9BE15D', '#FFC233', '#FF5A5F']),
        'ice': ('冰藍', ['#8BE6FF', '#2E9BFF', '#2F6BFF'], ['#A5F3FF', '#5AC8FA', '#2E9BFF', '#33D1B0']),
        'leaf': ('翠綠', ['#C6F27A', '#3DDC97', '#12B8A6'], ['#E8F79A', '#9BE15D', '#3DDC97', '#12B8A6']),
    },
    # on a light stage the keyword gradient has to be deeper to keep 3:1
    'light': {
        'warm': ('暖橘', ['#E8590C', '#E03131', '#C2255C'], ['#12B886', '#82C91E', '#FAB005', '#FA5252']),
        'ice': ('冰藍', ['#0C8599', '#1C7ED6', '#1864AB'], ['#3BC9DB', '#4DABF7', '#339AF0', '#20C997']),
        'leaf': ('翠綠', ['#5C940D', '#2B8A3E', '#0B7285'], ['#C0EB75', '#94D82D', '#51CF66', '#22B8CF']),
    },
}

COUNSEL_MODE = {
    'light': dict(bg='#F1EFEA', ink='#141619', nav='#585D66', desc='#3F444B', src='#5D6168', rule='#D3CFC6',
                  gray='#CFCAC1', gray2='#BDB7AC', onGray='#141619', onGraySub='#3F444B',
                  late='#B5381F', lateTint='#E8C2B6', lateLine='#B5381F', lateLineOp='.55', peak='#141619'),
    'dark': dict(bg='#15181D', ink='#ECEAE4', nav='#9AA0A9', desc='#B3B8C0', src='#8D939C', rule='#2C3139',
                 gray='#363C45', gray2='#2B3038', onGray='#ECEAE4', onGraySub='#AEB4BD',
                 late='#FF7A5C', lateTint='#3D2622', lateLine='#FF7A5C', lateLineOp='.5', peak='#ECEAE4'),
}
# lead text, keyword, focus block, focus-coloured text, text on the focus block, small text on it
COUNSEL_PAL = {
    'light': {
        'green': ('綠', dict(lead='#141619', em='#0B5E45', focus='#0D6B4F', focusText='#0B5E45', onFocus='#F4F2EC', onFocusSub='#CFE5DB')),
        'blue': ('藍', dict(lead='#141619', em='#1C46A8', focus='#1F4FBF', focusText='#1C46A8', onFocus='#F4F2EC', onFocusSub='#DCE5FF')),
        'ink': ('墨黑', dict(lead='#585D66', em='#141619', focus='#1F2328', focusText='#1F2328', onFocus='#F4F2EC', onFocusSub='#C9CDD2')),
    },
    'dark': {
        'green': ('綠', dict(lead='#ECEAE4', em='#5CCB94', focus='#2E9E6E', focusText='#5CCB94', onFocus='#0E1712', onFocusSub='#0F2A1C')),
        'blue': ('藍', dict(lead='#ECEAE4', em='#8AB4FF', focus='#4C8DF6', focusText='#8AB4FF', onFocus='#0B1530', onFocusSub='#0E2350')),
        'paper': ('紙白', dict(lead='#A9AEB6', em='#F4F1EA', focus='#E6E2D8', focusText='#F4F1EA', onFocus='#15181D', onFocusSub='#4A4D52')),
    },
}


def lum(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def ratio(a, b):
    x, y = sorted([lum(a), lum(b)], reverse=True)
    return (x + 0.05) / (y + 0.05)


def write(tpl, name, roles):
    block = ':root{' + ';'.join(f'--{k}:{v}' for k, v in roles.items()) + '}'
    html = (HERE / 'tpl' / tpl).read_text(encoding='utf-8').replace('</head>', f'<style>{block}</style>\n</head>', 1)
    (HERE / 'src' / name).write_text(html, encoding='utf-8')


rows = []
problems = []
for mode in ('dark', 'light'):
    tiles = []
    for key, (label, g, e) in APPLE_PAL[mode].items():
        roles = dict(APPLE_MODE[mode], g1=g[0], g2=g[1], g3=g[2], e1=e[0], e2=e[1], e3=e[2], e4=e[3])
        name = f'apple-{mode}-{key}.html'
        write('apple.html', name, roles)
        worst = min(ratio(c, s) for c in g for s in (roles['stage'], roles['stageTop']))
        if worst < 3:
            problems.append(f'{name}: gradient stop {worst:.2f}:1')
        tiles.append((name, f'{label}　漸層最低 {worst:.1f}:1'))
    rows.append(('Apple 發表｜' + ('深色舞台' if mode == 'dark' else '淺色舞台（新）'), tiles))
for mode in ('light', 'dark'):
    tiles = []
    for key, (label, p) in COUNSEL_PAL[mode].items():
        name = f'counsel-{mode}-{key}.html'
        write('counsel.html', name, dict(COUNSEL_MODE[mode], **p))
        tiles.append((name, label))
    rows.append(('顧問報告｜' + ('淺色紙' if mode == 'light' else '深色石板（新）'), tiles))

sheet = ['<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>明暗兩版配色</title>',
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&display=block">',
         '<style>*{box-sizing:border-box;margin:0;padding:0}body{width:2000px;background:#ECEAE4;color:#22201C;font-family:"Noto Sans TC",sans-serif;padding:40px 40px 44px}',
         'h1{font:900 38px/1.2 "Noto Sans TC"}p.sub{margin-top:8px;font:400 21px/1.5 "Noto Sans TC";color:#57534D}',
         'h2{margin:30px 0 12px;font:900 26px/1.2 "Noto Sans TC"}.row{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}',
         'figure img{display:block;width:100%;aspect-ratio:16/9;border:1px solid #CFC9BC}figcaption{margin-top:8px;font:700 19px/1.3 "Noto Sans TC";color:#3A3732}</style></head><body>',
         '<h1>首批兩款的明暗兩版</h1><p class="sub">同一份內容；每款有深色與淺色兩種底，每種底再依主題推薦三組配色。用色角色與範圍見 style-specs。</p>']
for title, tiles in rows:
    sheet.append(f'<h2>{title}</h2><div class="row">')
    for name, cap in tiles:
        sheet.append(f'<figure><img src="img/{name[:-5]}.jpg" alt=""><figcaption>{cap}</figcaption></figure>')
    sheet.append('</div>')
sheet.append('</body></html>')
(HERE / 'sheet.html').write_text('\n'.join(sheet), encoding='utf-8')

print('variants written:', len(list((HERE / 'src').glob('*.html'))))
print('gradient check:', 'ok' if not problems else '; '.join(problems))
