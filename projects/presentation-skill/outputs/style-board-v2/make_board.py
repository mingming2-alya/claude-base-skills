#!/usr/bin/env python3
"""Build the self-contained ten-style review board. Run from any directory."""
from base64 import b64encode
from html import escape
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent
CANVAS_WIDTH = 960

# The order and IDs are the review numbers in inputs/style-list-v2.md.
STYLES = [
    ("editorial", "編輯刊物", "不對稱欄格與帳冊列", "年度成果、策略與科普", ("#F4E8D8", "#913526", "#D4A16B")),
    ("swiss", "瑞士網格", "窄欄索引與鈷藍橫帶", "會議、提案與進度回報", ("#244FC9", "#F3F6FB", "#172D51")),
    ("geo", "幾何構成", "以咬合色格分置數字與主張", "主題演講、發表與方法論", ("#087E71", "#E6AF40", "#243F69")),
    ("broadsheet", "號外", "貼底巨字與橘色數據欄", "內部推廣與提案", ("#292321", "#ED774D", "#FAE7CA")),
    ("midnight", "深夜舞台", "暗場聚光與金色直排章名", "發表會、開場與高階簡報", ("#132E43", "#DDB76D", "#347473")),
    ("clay", "紙黏土", "暖色場景與同光源的立體物件", "知識分享、科普與內部溝通", ("#F6CBB7", "#83ADA1", "#A34B32")),
    ("scroll", "書卷刻本", "直排書名、版框與朱印", "文化、教育與制度說明", ("#EBD3AA", "#973E2B", "#466055")),
    ("counsel", "顧問報告", "左欄呈現證據，右欄列出做法", "策略提案與決策會議", ("#193851", "#147879", "#D6E8E7")),
    ("bento", "便當格", "大小卡片拼成一幅總覽", "產品與數據總覽", ("#DCE9FA", "#4D429A", "#9ED4C7")),
    ("riso", "孔版小誌", "雙色套印與錯位紙框", "分享、展覽與觀點發表", ("#EFA5B9", "#334D9D", "#F4EAD3")),
]
ACTIONS = ("記下偏好", "叫出名字", "主動推薦")
KEY = '客人回來，<br>是因為<em>被記得</em>'
TITLE = '常客為什麼重要'
PERCENT_LABEL = '的常客每週回訪三次以上'
COUNT_LABEL = '位常客每週至少回訪一次'


def actions(cls="", numbers=("01", "02", "03")):
    items = "".join(f'<li><i>{num}</i><span>{action}</span></li>' for num, action in zip(numbers, ACTIONS))
    return f'<ol class="actions {cls}">{items}</ol>'


def stat(number, label):
    return f'<div class="stat"><b>{number}</b><span>{label}</span></div>'


def vertical(label):
    # Individual rows also work in PDF readers without vertical-writing support.
    return '<span class="vertical" aria-label="' + escape(label) + '">' + ''.join(
        f'<span aria-hidden="true">{escape(char)}</span>' for char in label) + '</span>'


def optional_png(filename, css_class, alt):
    path = HERE / "img" / filename
    if not path.is_file():
        return ""
    data = b64encode(path.read_bytes()).decode("ascii")
    return f'<img class="{css_class}" alt="{escape(alt)}" src="data:image/png;base64,{data}">'


def clay_scene():
    main = optional_png("clay_scene.png", "scene-photo", "為熟客準備的店面場景")
    if not main:
        main = """<div class="still-life" role="img" aria-label="櫃檯上為熟客留好的一杯茶與集點卡">
          <div class="counter"></div>
          <div class="loyalty"><div class="ticket-stripe"></div><div class="ticket-dots"><i></i><i></i><i></i></div></div>
          <div class="saucer"></div><div class="handle"></div><div class="cup"><i></i></div>
        </div>"""
    lower = optional_png("clay_obj_box.png", "edge-image lower", "")
    upper = optional_png("clay_obj_ball.png", "edge-image upper", "")
    return f'<div class="scene">{main}{lower}{upper}</div>'


def bodies():
    pct = stat("72%", PERCENT_LABEL)
    count = stat("1,840", COUNT_LABEL)
    steps = actions()
    return {
        "editorial": f"""
          <div class="ed-top"><span>{TITLE}</span><span>常客經營</span></div>
          <div class="ed-lead"><h3>{KEY}</h3></div>
          <div class="ed-data">{pct}{count}</div>
          <div class="ed-ledger">{steps}</div>""",
        "swiss": f"""
          <div class="sw-side"><p>{TITLE}</p><strong>03</strong><span>服務步驟</span></div>
          <div class="sw-key"><h3>{KEY}</h3></div>
          <div class="sw-steps">{steps}</div><div class="sw-numbers">{pct}{count}</div>""",
        "geo": f"""
          <div class="ge-title"><p>{TITLE}</p></div><div class="ge-shape" aria-hidden="true"><i></i></div>
          <div class="ge-pct">{pct}</div><div class="ge-disc" aria-hidden="true"><i></i></div>
          <div class="ge-triangle" aria-hidden="true"><i></i></div><div class="ge-count">{count}</div>
          <div class="ge-key"><h3>{KEY}</h3></div><div class="ge-steps">{steps}</div>""",
        "broadsheet": f"""
          <div class="br-title"><p>{TITLE}</p></div>
          <div class="br-lead"><h3>客人回來，<br>是因為<br><em>被記得</em></h3></div>
          <div class="br-column">{pct}{count}<div class="br-actions">{steps}</div></div>""",
        "midnight": f"""
          <div class="mi-frame" aria-hidden="true"></div>
          <div class="mi-art" aria-hidden="true"><i></i><b></b></div>
          <div class="mi-chapter">{vertical('常客')}</div>
          <div class="mi-lead"><p>{TITLE}</p><h3>{KEY}</h3></div>
          <div class="mi-data">{pct}{count}</div><div class="mi-steps">{steps}</div>""",
        "clay": f"""
          {clay_scene()}
          <div class="cl-lead"><p>{TITLE}</p><h3>{KEY}</h3></div>
          <div class="cl-data">{pct}{count}</div><div class="cl-actions">{steps}</div>""",
        "scroll": f"""
          <div class="sc-border" aria-hidden="true"></div>
          <div class="sc-spine">{vertical('常客經營')}</div>
          <div class="sc-title">{vertical(TITLE)}</div>
          <div class="sc-seal" aria-hidden="true">常客</div>
          <div class="sc-lead"><h3>{KEY}</h3></div>
          <div class="sc-data">{pct}{count}</div><div class="sc-actions">{actions(numbers=('一','二','三'))}</div>""",
        "counsel": f"""
          <div class="co-title"><p>常客回訪與服務做法</p></div>
          <div class="co-lead"><h3>客人回來，是因為<em>被記得</em></h3></div>
          <div class="co-exhibit">
            <h4>每週回訪三次以上的常客占比</h4>
            <div class="co-readout"><strong>72%</strong><span>每週三次以上</span></div>
            <div class="co-bar" role="img" aria-label="每週三次以上 72%，其餘 28%"><i></i></div>
            <div class="co-key"><span><i></i>三次以上 72%</span><span><i></i>其餘 28%</span></div>
            <p class="co-sample">每週至少回訪一次的常客共 <b>1,840</b> 位</p></div>
          <div class="co-side"><h4>門市的三個做法</h4>{steps}</div>
          <div class="co-source">資料為虛構門市範例</div>""",
        "bento": f"""
          <div class="be-title"><p>{TITLE}</p></div>
          <div class="be-mosaic">
            <div class="be-hero"><h3>{KEY}</h3></div>
            <div class="be-pct">{pct}<div class="be-meter" aria-hidden="true"><i></i></div></div>
            <div class="be-count">{count}</div>
            <div class="be-steps">{steps}</div>
          </div>""",
        "riso": f"""
          <div class="ri-paper" aria-hidden="true"></div>
          <div class="ri-lead"><p>{TITLE}</p><h3>{KEY}</h3></div>
          <div class="ri-stamp" aria-hidden="true"><span>常<br>客</span></div>
          <div class="ri-data">{pct}{count}</div>
          <div class="ri-ledger">{steps}</div>""",
    }


GALLERY = """
*{box-sizing:border-box}
html{color-scheme:light}
body{margin:0;background:#F5F3EC;color:#222C2B;font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei","Noto Sans CJK TC",sans-serif}
main{max-width:1664px;margin:auto;padding:clamp(18px,3vw,50px)}
header{border-bottom:1px solid #B8BDB3;padding:0 0 18px;margin-bottom:24px}
h1{font-family:Georgia,"Noto Serif TC","Noto Serif CJK TC",serif;font-size:clamp(27px,3vw,44px);line-height:1.2;margin:0 0 9px}
header p{margin:0;color:#465450;font-size:15px;line-height:1.65}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:30px 24px}
.tile{min-width:0;align-self:start;margin:0;scroll-margin:16px}
.tile:target{grid-column:1/-1}
.viewport{position:relative;width:100%;aspect-ratio:16/9;container-type:inline-size;overflow:hidden;background:#F5F3EC}
.stage{position:absolute;top:0;left:0;width:960px;height:540px;transform-origin:0 0;overflow:hidden;color-scheme:light}
figcaption{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 1px 0}
.caption-title{display:flex;align-items:baseline;gap:8px}
.caption-title b{font:600 13px/1.2 ui-monospace,monospace;color:#58655C}
figcaption strong{font-size:18px;line-height:1.4}
figcaption code{font-size:12px;color:#58655C}
.caption-text{margin:3px 0 0;font-size:13px;color:#465450;line-height:1.5}
.controls,.swatches{display:flex;align-items:center;gap:4px}
.swatches i{width:12px;height:12px;border-radius:50%;border:1px solid #28322C30}
.controls a{margin-left:8px;color:#304C46;font-size:13px;text-underline-offset:3px;white-space:nowrap}
.controls a:focus-visible{outline:2px solid currentColor;outline-offset:3px}
.collapse,.tile:target .expand{display:none}.tile:target .collapse{display:inline}
@media(max-width:900px){.grid{grid-template-columns:1fr}.controls{gap:2px}.tile{scroll-margin:8px}}
@media(max-width:520px){main{padding:16px 8px}.grid{gap:22px}figcaption strong{font-size:16px}.swatches i{width:9px;height:9px}.caption-text{font-size:12px}}
"""
PRINT = """
@page{size:960px 540px;margin:0}
@media print{
  html,body,main,.grid{width:960px;display:block;margin:0;padding:0;max-width:none;background:transparent}
  header,figcaption{display:none}
  .tile,.viewport,.stage{width:960px;height:540px;margin:0;padding:0;border:0;break-inside:avoid;transform:none!important}
  .tile{break-after:page}.tile:last-child{break-after:auto}
  .viewport{container-type:normal}.stage{position:relative}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
"""
# Only older engines need JavaScript to scale the fixed reference canvas.
LEGACY_FIT = """<script>
if(!window.CSS || !CSS.supports('width','1cqw')){
  function fit(){document.querySelectorAll('.viewport').forEach(function(view){
    view.firstElementChild.style.transform='scale('+view.clientWidth/960+')';
  });}
  fit();window.addEventListener('resize',fit);window.addEventListener('hashchange',fit);
}
</script>"""


def screen_units(css):
    # At 960px wide, 1 reference pixel is 100/960 of a container-width unit.
    def scale(match):
        number = float(match.group(1)) * 100 / CANVAS_WIDTH
        return f'{number:.7f}'.rstrip('0').rstrip('.') + 'cqw'
    return re.sub(r'(-?(?:\d*\.)?\d+)px\b', scale, css)


def build():
    artwork = (HERE / "plates.css").read_text(encoding="utf-8")
    tiles = []
    content = bodies()
    for number, (sid, name, grammar, use, palette) in enumerate(STYLES, 1):
        swatches = ''.join(f'<i style="background:{color}"></i>' for color in palette)
        tiles.append(f"""<figure class="tile" id="{sid}" aria-labelledby="caption-{sid}">
          <div class="viewport"><div class="stage t-{sid}">{content[sid]}</div></div>
          <figcaption id="caption-{sid}"><div><div class="caption-title"><b>{number:02d}</b><strong>{name}</strong><code>{sid}</code></div>
            <p class="caption-text">{grammar} · {use}</p></div><div class="controls"><span class="swatches" aria-hidden="true">{swatches}</span>
            <a class="expand" href="#{sid}" aria-label="展開{name}">展開</a><a class="collapse" href="#board">回總覽</a></div></figcaption>
        </figure>""")
    screen = '@media screen{@supports(width:1cqw){.stage{width:100cqw;height:56.25cqw}' + screen_units(artwork) + '}}'
    page = f"""<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>風格樣張板 v2</title>
<style>{GALLERY}{artwork}{screen}{PRINT}</style></head><body><main id="board">
<header><h1>風格樣張板 v2</h1><p>用同一組虛構的門市回訪資料，比較十種風格的配色、構圖與圖文關係。點「展開」可查看單張。</p></header>
<div class="grid">{''.join(tiles)}</div></main>{LEGACY_FIT}</body></html>
"""
    (HERE / "board.html").write_text(page, encoding="utf-8")


if __name__ == "__main__":
    build()
