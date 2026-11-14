#!/usr/bin/env python3
"""Build a playable HTML deck (or style samples) from a deck-architect storyboard.

Usage:
  python3 build.py path/to/storyboard.yaml                     -> deck.html next to the storyboard
  python3 build.py path/to/storyboard.yaml --samples paper,signal,ink   -> samples.html
  python3 build.py path/to/storyboard.yaml --out other.html --force

Runs lint first and refuses to build when lint reports errors (use --force to override).
Navigation (chapter bar, TOC highlight pages, tabs), chapter-change motion (derived from
structure.axis) and shock-page treatment are generated automatically.
"""
import argparse
import html
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from deck_model import AXES, EMPH_RE, StoryboardError, load, toc_mode  # noqa: E402
from lint import lint  # noqa: E402

THEMES_DIR = HERE.parent / "themes"
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900'
         '&family=Noto+Sans+TC:wght@400;500;700;900&family=Noto+Serif+TC:wght@500;700;900'
         '&display=swap" rel="stylesheet">')


# ----------------------------------------------------------------------------- text helpers
def esc(s):
    return html.escape(str(s if s is not None else ""))


def rich(s):
    """Escape, then turn ==x== into the accent mark and newlines into <br>."""
    out = esc(s)
    out = EMPH_RE.sub(lambda m: f'<mark class="em">{m.group(1)}</mark>', out)
    return out.replace("\n", "<br>")


# ----------------------------------------------------------------------------- theme
def theme_css(theme, base_dir):
    if not theme:
        theme = "paper"
    p = Path(theme)
    candidates = [base_dir / p] if (theme.endswith(".css") or "/" in theme) else []
    candidates.append(THEMES_DIR / f"{theme}.css")
    for c in candidates:
        if c.exists():
            return c.read_text(encoding="utf-8"), c.stem
    sys.exit(f"找不到主題「{theme}」。內建主題：{', '.join(x.stem for x in THEMES_DIR.glob('*.css'))}")


# ----------------------------------------------------------------------------- motion
def motion_for(structure):
    axis = structure.get("axis", "time")
    override = structure.get("motion")
    if override in ("horizontal", "vertical", "zoom-in", "zoom-out"):
        return override
    m = AXES.get(axis, ("neutral", "horizontal"))[1]
    if m == "zoom":
        d = str(structure.get("direction", ""))
        first = re.split(r"→|->|到", d)[0] if d else ""
        # starting from the big / far end means we are moving in
        return "zoom-out" if re.search(r"小|近|局部|細|個人|我", first) else "zoom-in"
    return m


def toc_shape(motion):
    return {"horizontal": "row", "vertical": "column"}.get(motion, "rings")


# ----------------------------------------------------------------------------- slide expansion
def expand(data):
    """Return a flat list of slide records, inserting TOC pages according to toc_mode()."""
    chapters = data["chapters"]
    ids = [c["id"] for c in chapters]
    mode = toc_mode(data)
    use_toc = mode == "per-chapter"
    per_ch = {cid: [] for cid in ids}
    for s in data["slides"]:
        if s.get("type", "content") == "content" and s.get("chapter") in per_ch:
            per_ch[s["chapter"]].append(s)

    out, started, agenda_done = [], set(), mode != "agenda"
    for s in data["slides"]:
        t = s.get("type", "content")
        if not agenda_done and t != "cover":
            out.append({"kind": "toc", "chi": -1, "src": None})  # one agenda page, all chapters lit
            agenda_done = True
        if t == "content":
            cid = s["chapter"]
            chi = ids.index(cid)
            if use_toc and cid not in started:
                out.append({"kind": "toc", "chi": chi, "src": None})
            started.add(cid)
            siblings = per_ch[cid]
            out.append({"kind": "content", "chi": chi, "src": s,
                        "tab": siblings.index(s), "tabs": len(siblings)})
        else:
            out.append({"kind": t, "chi": -1, "src": s})
    return out


# ----------------------------------------------------------------------------- renderers
def source_line(s):
    return f'<p class="source">資料來源：{esc(s["source"])}</p>' if s.get("source") else ""


def render_layout(s, base_dir):
    lay = s.get("layout")
    if lay == "point":
        key = s.get("key", "")
        whole = "" if EMPH_RE.search(key) else " whole"
        sup = f'<p class="support rv">{rich(s["support"])}</p>' if s.get("support") else ""
        return f'<div class="point"><p class="key rv{whole}">{rich(key)}</p>{sup}</div>'
    if lay == "number":
        note = f'<p class="note rv">{rich(s["note"])}</p>' if s.get("note") else ""
        return (f'<div class="number"><div class="value rv">{rich(s.get("value"))}</div>'
                f'<div class="label rv">{rich(s.get("label"))}</div>{note}</div>')
    if lay == "bullets":
        lis = "".join(f'<li class="rv">{rich(x)}</li>' for x in s.get("items", []))
        return f'<ul class="bullets">{lis}</ul>'
    if lay == "steps":
        items = s.get("items", [])
        lis = "".join(f'<li class="rv"><span class="n">{i:02d}</span><span class="t">{rich(x)}</span></li>'
                      for i, x in enumerate(items, 1))
        return f'<ol class="steps" style="--n:{len(items)}">{lis}</ol>'
    if lay == "compare":
        def col(side):
            v = s.get(side) or {}
            lis = "".join(f"<li>{rich(x)}</li>" for x in v.get("items", []))
            return f'<div class="col rv"><h3>{rich(v.get("heading"))}</h3><ul>{lis}</ul></div>'
        return f'<div class="compare">{col("left")}<div class="divider"></div>{col("right")}</div>'
    if lay == "quote":
        src = f'<cite class="rv">— {rich(s["source"])}</cite>' if s.get("source") else ""
        return f'<blockquote class="quote"><p class="rv">{rich(s.get("text"))}</p>{src}</blockquote>'
    if lay == "image":
        cap = f'<p class="caption rv">{rich(s["caption"])}</p>' if s.get("caption") else ""
        return (f'<div class="image"><div class="img rv"><img src="{esc(s.get("src"))}" alt="{esc(s.get("alt", ""))}">'
                f'</div>{cap}</div>')
    return ""


def static_nav(chapters, chi, tab, tabs, sources):
    labels = "".join(f'<span class="{"on" if i == chi else ""}">{esc(c["label"])}</span>'
                     for i, c in enumerate(chapters))
    tabs_html = ""
    if tabs > 2:
        tabs_html = '<div class="stabs">' + "".join(
            f'<span class="{"on" if i == tab else ""}">{esc(src.get("tab") or src.get("title"))}</span>'
            for i, src in enumerate(sources)) + "</div>"
    return f'<div class="snav"><div class="slabels">{labels}</div>{tabs_html}</div>'


def render_slide(rec, data, idx, total, base_dir, ch_sources):
    s, kind = rec["src"] or {}, rec["kind"]
    meta, chapters = data["meta"], data["chapters"]
    notes = esc(s.get("notes", ""))
    attrs = f'data-kind="{kind}" data-chi="{rec["chi"]}" data-notes="{notes}"'
    pageno = f'<div class="pageno">{idx:02d}</div>'

    if kind == "cover":
        route = "".join(f'<span>{esc(c["label"])}</span>' for c in chapters)
        parts = [f'<div class="kicker rv">{esc(meta.get("date", ""))}</div>' if meta.get("date") else "",
                 f'<h1 class="cover-title rv">{rich(meta.get("title"))}</h1>',
                 f'<p class="cover-sub rv">{rich(meta.get("subtitle"))}</p>' if meta.get("subtitle") else "",
                 f'<p class="cover-meta rv">{esc(meta.get("presenter"))}</p>' if meta.get("presenter") else ""]
        return (f'<section class="slide cover" {attrs}><div class="cover-inner">{"".join(parts)}</div>'
                f'<div class="route rv">{route}</div></section>')

    if kind == "toc":
        lis = "".join(f'<li class="{"on" if rec["chi"] in (-1, i) else "off"}"><span class="i">{i + 1:02d}</span>'
                      f'<span class="l">{esc(c["label"])}</span></li>' for i, c in enumerate(chapters))
        return f'<section class="slide toc" {attrs}><ol class="toc-list">{lis}</ol>{pageno}</section>'

    if kind == "shock":
        sub = f'<p class="shock-sub">{rich(s["sub"])}</p>' if s.get("sub") else ""
        return (f'<section class="slide shock" {attrs}><div class="shock-inner">'
                f'<p class="shock-text">{rich(s.get("text"))}</p>{sub}</div>{source_line(s)}</section>')

    if kind == "closing":
        sub = f'<p class="closing-sub rv">{rich(s["sub"])}</p>' if s.get("sub") else ""
        return (f'<section class="slide closing" {attrs}><div class="closing-inner">'
                f'<p class="closing-text rv">{rich(s.get("text", ""))}</p>{sub}</div></section>')

    # content
    snav = static_nav(chapters, rec["chi"], rec["tab"], rec["tabs"], ch_sources[rec["chi"]])
    tabbed = " tabbed" if rec["tabs"] > 2 else ""
    attrs += f' data-tab="{rec["tab"]}" data-tabs="{rec["tabs"]}"'
    return (f'<section class="slide content layout-{esc(s.get("layout"))}{tabbed}" {attrs}>{snav}'
            f'<header class="slide-head"><h2 class="title">{esc(s.get("title"))}</h2></header>'
            f'<div class="body">{render_layout(s, base_dir)}</div>{source_line(s)}{pageno}</section>')


def render_slides(data, base_dir, records):
    ids = [c["id"] for c in data["chapters"]]
    ch_sources = [[s for s in data["slides"] if s.get("type", "content") == "content" and s.get("chapter") == cid]
                  for cid in ids]
    return [render_slide(r, data, i, len(records), base_dir, ch_sources) for i, r in enumerate(records, 1)]


# ----------------------------------------------------------------------------- page assembly
def deck_html(data, base_dir):
    css_theme, _ = theme_css(data["meta"].get("theme"), base_dir)
    records = expand(data)
    slides = render_slides(data, base_dir, records)
    motion = motion_for(data["structure"])
    deck_json = {
        "chapters": [c["label"] for c in data["chapters"]],
        "tabs": [[(s.get("tab") or s.get("title")) for s in data["slides"]
                  if s.get("type", "content") == "content" and s.get("chapter") == c["id"]]
                 for c in data["chapters"]],
        "motion": motion,
    }
    return PAGE.format(
        lang=esc(data["meta"].get("lang", "zh-Hant")),
        title=esc(re.sub(r"==", "", str(data["meta"].get("title", "Deck")))),
        fonts=FONTS, theme=css_theme, base=BASE_CSS,
        motion=motion, shape=toc_shape(motion),
        slides="\n".join(slides), deck=json.dumps(deck_json, ensure_ascii=False), runtime=RUNTIME_JS)


def samples_html(data, base_dir, themes):
    records = expand(data)
    slides = render_slides(data, base_dir, records)
    pick = [0] if records and records[0]["kind"] == "cover" else []
    contents = [i for i, r in enumerate(records) if r["kind"] == "content"]
    with_em = [i for i in contents if EMPH_RE.search(json.dumps(r_src(records[i]), ensure_ascii=False))
               or r_src(records[i]).get("layout") == "point"]
    pick.append((with_em or contents or [0])[0])
    shocks = [i for i, r in enumerate(records) if r["kind"] == "shock"]
    if shocks:
        pick.append(shocks[0])
    elif len(contents) > 1:
        pick.append(contents[1] if contents[1] != pick[-1] else contents[-1])

    motion = motion_for(data["structure"])
    blocks, css_all = [], []
    roles = ["A", "B", "C", "D", "E"]
    for n, th in enumerate(themes):
        css, stem = theme_css(th, base_dir)
        cls = f"t-{re.sub(r'[^a-z0-9]+', '-', stem.lower())}"
        css_all.append(css.replace(":root", f".{cls}"))
        frames = "".join(f'<div class="frame"><div class="frame-inner {cls}">{slides[i]}</div></div>' for i in pick)
        blocks.append(f'<section class="sample"><h2><b>{roles[n]}</b> {esc(stem)}</h2><div class="row">{frames}</div></section>')
    return SAMPLES_PAGE.format(
        lang=esc(data["meta"].get("lang", "zh-Hant")), fonts=FONTS, base=BASE_CSS,
        themes="\n".join(css_all), motion=motion, shape=toc_shape(motion),
        title=esc(re.sub(r"==", "", str(data["meta"].get("title", "")))), blocks="\n".join(blocks))


def r_src(rec):
    return rec["src"] or {}


# ----------------------------------------------------------------------------- templates
BASE_CSS = r"""
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#000;overflow:hidden}
#viewport{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#000}
#stage{position:relative;width:1920px;height:1080px;flex:none;transform-origin:center center;overflow:hidden;background:var(--bg)}
.slide{position:absolute;inset:0;background:var(--bg);background-image:var(--texture);color:var(--fg);
  font-family:var(--font-body);visibility:hidden;overflow:hidden}
.slide.active{visibility:visible}
mark.em{background:none;color:var(--accent);font-weight:var(--key-weight)}
.source{position:absolute;left:140px;bottom:56px;font:400 22px/1.3 var(--font-body);color:var(--muted);max-width:1400px}
.shock .source{color:inherit;opacity:.55}
.pageno{position:absolute;right:120px;bottom:56px;font:500 22px/1 var(--font-body);color:var(--muted);letter-spacing:.08em}

/* persistent navigation (screen) */
#nav{position:absolute;left:140px;right:140px;top:64px;z-index:5;display:flex;gap:56px;align-items:flex-end;
  font:500 26px/1 var(--font-body);color:var(--muted);transition:opacity .3s}
#nav span{position:relative;padding-bottom:16px;transition:color .4s}
#nav span.on{color:var(--fg);font-weight:700}
#nav .ind{position:absolute;bottom:0;height:3px;background:var(--fg);transition:left .55s cubic-bezier(.65,0,.35,1),width .55s cubic-bezier(.65,0,.35,1)}
#nav::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--line);opacity:.6}
#tabs{position:absolute;left:140px;top:128px;z-index:5;display:flex;gap:10px;font:500 20px/1 var(--font-body);color:var(--muted);transition:opacity .3s}
#tabs span{padding:10px 18px;border:1px solid var(--line);border-radius:999px;transition:all .4s}
#tabs span.on{color:var(--bg);background:var(--fg);border-color:var(--fg)}
#stage.hide-nav #nav,#stage.hide-nav #tabs{opacity:0}
#stage.no-trans *,#stage.no-trans{transition:none!important}
.snav{display:none}

/* content slides */
.slide-head{position:absolute;left:140px;right:140px;top:170px}
.content.tabbed .slide-head{top:210px}
.title{font:var(--head-weight) 56px/1.2 var(--font-head);letter-spacing:.01em}
.body{position:absolute;left:140px;right:140px;top:290px;bottom:130px;display:flex;flex-direction:column;justify-content:center}
.content.tabbed .body{top:330px}

.point .key{font:var(--key-weight) 104px/1.25 var(--font-head);letter-spacing:-.01em;max-width:1500px;text-wrap:balance}
.point .key.whole{color:var(--accent)}
.point .support{margin-top:48px;font:400 38px/1.5 var(--font-body);color:var(--muted);max-width:1400px}

.number{display:grid;grid-template-columns:auto 1fr;column-gap:72px;align-items:end}
.number .value{grid-row:1/3;font:var(--key-weight) 280px/0.9 var(--font-head);letter-spacing:-.04em}
.number .label{font:700 52px/1.3 var(--font-head);align-self:end}
.number .note{font:400 34px/1.5 var(--font-body);color:var(--muted);margin-top:16px;align-self:start;max-width:820px}

.bullets{list-style:none;display:flex;flex-direction:column;gap:40px}
.bullets li{font:500 50px/1.4 var(--font-body);padding-left:56px;position:relative}
.bullets li::before{content:"";position:absolute;left:0;top:.62em;width:22px;height:3px;background:var(--fg)}

.steps{list-style:none;display:grid;grid-template-columns:repeat(var(--n),1fr);gap:48px;position:relative}
.steps::before{content:"";position:absolute;left:0;right:0;top:44px;height:2px;background:var(--line)}
.steps li{position:relative;padding-top:120px}
.steps .n{position:absolute;top:0;left:0;width:88px;height:88px;border-radius:50%;background:var(--bg);border:2px solid var(--fg);
  display:flex;align-items:center;justify-content:center;font:700 32px/1 var(--font-body)}
.steps .t{font:500 44px/1.4 var(--font-body);display:block}

.compare{display:grid;grid-template-columns:1fr 2px 1fr;gap:96px;align-items:stretch}
.compare .divider{background:var(--line)}
.compare h3{font:700 44px/1.2 var(--font-head);color:var(--muted);margin-bottom:44px}
.compare .col:last-child h3{color:var(--fg)}
.compare ul{list-style:none;display:flex;flex-direction:column;gap:32px}
.compare li{font:500 46px/1.4 var(--font-body)}

.quote{max-width:1500px}
.quote p{font:var(--head-weight) 76px/1.4 var(--font-head);text-wrap:balance}
.quote::before{content:"“";display:block;font:700 200px/1 var(--font-head);height:110px;color:var(--muted);opacity:.45}
.quote cite{display:block;margin-top:56px;font:400 34px/1.4 var(--font-body);color:var(--muted);font-style:normal}

.image{display:grid;grid-template-columns:3fr 2fr;gap:80px;align-items:center;height:100%}
.image .img{height:100%;border-radius:var(--radius);overflow:hidden;background:var(--line)}
.image img{width:100%;height:100%;object-fit:cover;display:block}
.image .caption{font:500 44px/1.45 var(--font-body)}

/* cover / closing */
.cover-inner{position:absolute;left:140px;right:140px;top:0;bottom:200px;display:flex;flex-direction:column;justify-content:center}
.kicker{font:600 28px/1 var(--font-body);color:var(--muted);letter-spacing:.2em;margin-bottom:48px}
.cover-title{font:var(--key-weight) 132px/1.12 var(--font-head);letter-spacing:-.01em;max-width:1600px;text-wrap:balance}
.cover-sub{margin-top:44px;font:400 48px/1.4 var(--font-body);color:var(--muted)}
.cover-meta{margin-top:72px;font:500 30px/1.4 var(--font-body)}
.route{position:absolute;left:140px;right:140px;bottom:96px;display:flex;gap:0;font:500 26px/1 var(--font-body);color:var(--muted);
  border-top:1px solid var(--line);padding-top:32px}
.route span{flex:1}
.route span+span{padding-left:32px}
.closing-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.closing-text{font:var(--key-weight) 140px/1.1 var(--font-head)}
.closing-sub{margin-top:40px;font:400 40px/1.4 var(--font-body);color:var(--muted)}

/* TOC highlight pages: shape follows the axis */
.toc .toc-list{list-style:none;position:absolute;inset:0;display:flex;padding:0 140px}
.toc li{transition:opacity .6s}
.toc li.off{opacity:.28}
.toc .i{font:600 30px/1 var(--font-body);color:var(--muted);display:block;margin-bottom:24px;letter-spacing:.1em}
.toc .l{font:var(--head-weight) 72px/1.15 var(--font-head)}
.toc li.on .l{font-weight:var(--key-weight)}
[data-shape=row] .toc .toc-list{align-items:center;gap:0}
[data-shape=row] .toc li{flex:1;border-top:3px solid var(--line);padding-top:40px;margin-right:48px}
[data-shape=row] .toc li.on{border-top-color:var(--fg)}
[data-shape=column] .toc .toc-list{flex-direction:column;justify-content:center;gap:44px}
[data-shape=column] .toc li{display:flex;align-items:baseline;gap:40px;border-left:4px solid transparent;padding-left:40px}
[data-shape=column] .toc li.on{border-left-color:var(--fg)}
[data-shape=column] .toc .i{margin:0}
[data-shape=rings] .toc .toc-list{align-items:center;justify-content:center}
[data-shape=rings] .toc li{position:absolute;left:50%;top:50%;border:2px solid var(--line);border-radius:50%;transform:translate(-50%,-50%);
  width:calc(var(--r) * 1px);height:calc(var(--r) * 1px);display:flex;align-items:flex-start;justify-content:center;padding-top:36px}
[data-shape=rings] .toc li.on{border-color:var(--fg);border-width:3px}
[data-shape=rings] .toc .i{display:none}
[data-shape=rings] .toc .l{font-size:44px}
[data-shape=rings] .toc li.off{opacity:.35}

/* shock pages: break every rule */
.shock{background:var(--shock-bg);background-image:none;color:var(--shock-fg)}
.shock-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 160px}
.shock-text{font:var(--key-weight) 132px/1.18 var(--font-head);letter-spacing:-.01em;text-wrap:balance}
.shock-text mark.em{color:inherit;text-decoration:underline;text-decoration-thickness:.06em;text-underline-offset:.16em}
.shock-sub{margin-top:48px;font:400 40px/1.4 var(--font-body);opacity:.7}
#curtain{position:absolute;inset:0;background:#000;z-index:20;opacity:0;pointer-events:none}

#notes{position:fixed;left:0;right:0;bottom:0;z-index:30;background:rgba(0,0,0,.86);color:#eee;font:400 20px/1.6 system-ui,sans-serif;
  padding:18px 28px;display:none;max-height:30vh;overflow:auto;white-space:pre-wrap}
#notes.show{display:block}
#hint{position:fixed;right:16px;bottom:12px;z-index:31;color:#888;font:12px/1.4 system-ui,sans-serif;opacity:.0;transition:opacity .4s}
body:hover #hint{opacity:.7}

/* static mode: samples and print */
.static .slide{position:relative;visibility:visible;width:1920px;height:1080px}
.static .snav{display:block;position:absolute;left:140px;right:140px;top:64px}
.static .slabels{display:flex;gap:56px;font:500 26px/1 var(--font-body);color:var(--muted);border-bottom:1px solid var(--line);padding-bottom:16px}
.static .slabels span.on{color:var(--fg);font-weight:700;box-shadow:0 19px 0 -16px var(--fg)}
.static .stabs{display:flex;gap:10px;margin-top:32px;font:500 20px/1 var(--font-body);color:var(--muted)}
.static .stabs span{padding:10px 18px;border:1px solid var(--line);border-radius:999px}
.static .stabs span.on{color:var(--bg);background:var(--fg);border-color:var(--fg)}

@media print{
  @page{size:1920px 1080px;margin:0}
  html,body{height:auto;overflow:visible;background:none}
  #viewport{position:static;display:block}
  #stage{transform:none!important;width:1920px;height:auto;overflow:visible}
  #nav,#tabs,#curtain,#notes,#hint{display:none!important}
  .slide{position:relative;visibility:visible!important;width:1920px;height:1080px;break-after:page;opacity:1!important;transform:none!important}
  .slide *{opacity:1!important;transform:none!important}
  .snav{display:block;position:absolute;left:140px;right:140px;top:64px}
  .slabels{display:flex;gap:56px;font:500 26px/1 var(--font-body);color:var(--muted);border-bottom:1px solid var(--line);padding-bottom:16px}
  .slabels span.on{color:var(--fg);font-weight:700}
  .stabs{display:flex;gap:10px;margin-top:32px;font:500 20px/1 var(--font-body);color:var(--muted)}
  .stabs span{padding:10px 18px;border:1px solid var(--line);border-radius:999px}
  .stabs span.on{color:var(--bg);background:var(--fg)}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
"""

RUNTIME_JS = r"""
(function(){
const stage=document.getElementById('stage'), slides=[...document.querySelectorAll('.slide')];
const nav=document.getElementById('nav'), tabsEl=document.getElementById('tabs'), curtain=document.getElementById('curtain');
const notesEl=document.getElementById('notes');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const M=DECK.motion; let cur=-1, busy=false;

// rings TOC radii
document.querySelectorAll('[data-shape=rings] .toc-list').forEach(ol=>{
  const lis=[...ol.children], n=lis.length;
  const big=M==='zoom-in';
  lis.forEach((li,i)=>{const k=big? i : n-1-i; li.style.setProperty('--r', 940-k*(700/Math.max(1,n-1)));});
});

function fit(){const s=Math.min(innerWidth/1920,innerHeight/1080);stage.style.transform='scale('+s+')';}
addEventListener('resize',fit);fit();

// persistent navigation: one object that lives across the whole deck
nav.innerHTML=DECK.chapters.map(l=>'<span>'+l.replace(/</g,'&lt;')+'</span>').join('')+'<i class="ind"></i>';
const labels=[...nav.querySelectorAll('span')], ind=nav.querySelector('.ind');
function setNav(sl){
  const kind=sl.dataset.kind, chi=+sl.dataset.chi;
  const hide=!(kind==='content');
  stage.classList.toggle('hide-nav',hide);
  if(hide){tabsEl.style.opacity=0;return;}
  labels.forEach((l,i)=>l.classList.toggle('on',i===chi));
  const on=labels[chi]; ind.style.left=on.offsetLeft+'px'; ind.style.width=on.offsetWidth+'px';
  const tabs=+sl.dataset.tabs, tab=+sl.dataset.tab;
  if(tabs>2){
    if(tabsEl.dataset.chi!=chi){tabsEl.innerHTML=DECK.tabs[chi].map(t=>'<span>'+String(t).replace(/</g,'&lt;')+'</span>').join('');tabsEl.dataset.chi=chi;}
    [...tabsEl.children].forEach((t,i)=>t.classList.toggle('on',i===tab));
    tabsEl.style.opacity=1;
  } else {tabsEl.style.opacity=0;}
}

function vec(dir){ // enter transform for the incoming slide on a chapter change
  const s=dir;
  if(M==='vertical') return ['translateY('+(8*s)+'%)','translateY('+(-8*s)+'%)'];
  if(M==='zoom-in') return s>0?['scale(.88)','scale(1.14)']:['scale(1.14)','scale(.88)'];
  if(M==='zoom-out') return s>0?['scale(1.14)','scale(.88)']:['scale(.88)','scale(1.14)'];
  return ['translateX('+(8*s)+'%)','translateX('+(-8*s)+'%)'];
}
function reveal(sl,delay){
  if(reduce) return;
  sl.querySelectorAll('.rv').forEach((el,i)=>el.animate(
    [{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],
    {duration:520,delay:delay+i*70,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'}));
}
function showNotes(sl){notesEl.textContent=sl.dataset.notes||'（這頁沒有講者備註）';}

async function go(n,instant){
  n=Math.max(0,Math.min(slides.length-1,n));
  if(n===cur||busy) return;
  const prev=slides[cur], next=slides[n], dir=n>cur?1:-1;
  busy=true;
  const instantly=instant||reduce||!prev;
  const chapterChange=prev && (next.dataset.kind==='toc' || prev.dataset.kind==='toc' ||
     (next.dataset.chi!==prev.dataset.chi && +next.dataset.chi>=0 && +prev.dataset.chi>=0));
  if(instantly){
    stage.classList.add('no-trans');
    if(prev) prev.classList.remove('active');
    next.classList.add('active'); setNav(next);
    stage.offsetWidth; requestAnimationFrame(()=>requestAnimationFrame(()=>stage.classList.remove('no-trans')));
  } else if(next.dataset.kind==='shock' && dir>0){
    // cut to black, hold (the speaker's pause), then let the line surface
    stage.classList.add('hide-nav');
    await curtain.animate([{opacity:0},{opacity:1}],{duration:260,fill:'forwards'}).finished;
    prev.classList.remove('active'); next.classList.add('active');
    await new Promise(r=>setTimeout(r,520));
    curtain.animate([{opacity:1},{opacity:0}],{duration:380,fill:'forwards'});
    next.querySelector('.shock-text').animate([{opacity:0,transform:'translateY(24px)',filter:'blur(6px)'},{opacity:1,transform:'none',filter:'none'}],
      {duration:1100,delay:200,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});
    const sub=next.querySelector('.shock-sub');
    if(sub) sub.animate([{opacity:0},{opacity:.7}],{duration:700,delay:1300,fill:'backwards'});
    setNav(next);
  } else if(chapterChange){
    const [inT,outT]=vec(dir);
    await prev.animate([{opacity:1,transform:'none'},{opacity:0,transform:outT}],{duration:380,easing:'cubic-bezier(.55,0,.75,.2)'}).finished;
    prev.classList.remove('active'); next.classList.add('active'); setNav(next);
    next.animate([{opacity:0,transform:inT},{opacity:1,transform:'none'}],{duration:620,easing:'cubic-bezier(.2,.7,.2,1)'});
    reveal(next,200);
  } else {
    // nothing crossfades on top of anything: the old page leaves first, fast
    await prev.animate([{opacity:1},{opacity:0}],{duration:160}).finished;
    prev.classList.remove('active'); next.classList.add('active'); setNav(next);
    next.animate([{opacity:0},{opacity:1}],{duration:280});
    reveal(next,60);
  }
  cur=n; showNotes(next);
  history.replaceState(null,'','#'+(n+1));
  busy=false;
}

addEventListener('keydown',e=>{
  const k=e.key;
  if(['ArrowRight','ArrowDown','PageDown',' ','Enter'].includes(k)){e.preventDefault();go(cur+1);}
  else if(['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(k)){e.preventDefault();go(cur-1);}
  else if(k==='Home') go(0); else if(k==='End') go(slides.length-1);
  else if(k==='f'||k==='F'){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();}
  else if(k==='n'||k==='N') notesEl.classList.toggle('show');
  else if(k==='p'||k==='P') print();
});
addEventListener('click',e=>{ if(e.target.closest('#notes')) return; go(cur+(e.clientX>innerWidth/3?1:-1)); });
const start=parseInt((location.hash||'#1').slice(1),10)||1;
go(start-1,true);
window.__deck={go:(n)=>go(n,true),count:slides.length,get index(){return cur;}};
})();
"""

PAGE = """<!doctype html>
<html lang="{lang}" data-shape="{shape}" data-motion="{motion}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
{fonts}
<style>
{theme}
{base}
</style>
</head>
<body>
<div id="viewport"><div id="stage">
<div id="nav"></div><div id="tabs"></div>
{slides}
<div id="curtain"></div>
</div></div>
<div id="notes"></div>
<div id="hint">← → 翻頁 · F 全螢幕 · N 備註 · P 列印</div>
<script>const DECK={deck};</script>
<script>{runtime}</script>
</body>
</html>
"""

SAMPLES_PAGE = """<!doctype html>
<html lang="{lang}" data-shape="{shape}" data-motion="{motion}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>風格樣張 · {title}</title>
{fonts}
<style>
{themes}
{base}
html,body{{height:auto;overflow:auto;background:#e9e7e3}}
body{{font-family:system-ui,"Noto Sans TC","PingFang TC",sans-serif;color:#222;padding:40px 32px 80px}}
header.top h1{{font-size:26px;font-weight:700}}
header.top p{{color:#666;margin-top:6px;font-size:15px}}
.sample{{margin-top:40px}}
.sample h2{{font-size:20px;font-weight:600;margin-bottom:14px;color:#333}}
.sample h2 b{{display:inline-block;background:#222;color:#fff;border-radius:4px;padding:2px 10px;margin-right:8px}}
.row{{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}}
.frame{{position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:6px;box-shadow:0 6px 24px rgba(0,0,0,.14);container-type:inline-size}}
.frame-inner{{position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0;transform:scale(calc(100cqw / 1920px))}}
@supports not (transform:scale(calc(100cqw / 1920px))){{.frame-inner{{transform:scale(.25)}}}}
</style>
</head>
<body>
<header class="top"><h1>{title}：風格樣張</h1><p>同一套架構與內容，三種風格。選一個，或告訴我要怎麼混搭。</p></header>
<div class="static">
{blocks}
</div>
<script>
// container-query scale fallback for browsers without unit division
document.querySelectorAll('.frame').forEach(f=>{{const fit=()=>f.firstElementChild.style.transform='scale('+(f.clientWidth/1920)+')';fit();addEventListener('resize',fit);}});
document.querySelectorAll('[data-shape=rings] .toc-list').forEach(ol=>{{const lis=[...ol.children],n=lis.length;lis.forEach((li,i)=>li.style.setProperty('--r',940-i*(700/Math.max(1,n-1))));}});
</script>
</body>
</html>
"""


# ----------------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("storyboard")
    ap.add_argument("--samples", help="comma-separated themes, e.g. paper,signal,ink")
    ap.add_argument("--out")
    ap.add_argument("--force", action="store_true", help="build even if lint reports errors")
    a = ap.parse_args()

    try:
        data = load(a.storyboard)
    except StoryboardError as e:
        sys.exit(f"[ERROR] {e}")
    errors, warnings, _ = lint(data)
    for line in errors + warnings:
        print(line)
    if errors and not a.force:
        sys.exit("\nlint 有錯誤，未建置。修正 storyboard 後重試（或加 --force 強制建置）。")

    base = Path(a.storyboard).resolve().parent
    if a.samples:
        themes = [t.strip() for t in a.samples.split(",") if t.strip()]
        out = Path(a.out) if a.out else base / "samples.html"
        out.write_text(samples_html(data, base, themes), encoding="utf-8")
    else:
        out = Path(a.out) if a.out else base / "deck.html"
        out.write_text(deck_html(data, base), encoding="utf-8")
    print(f"\n已輸出：{out}")


if __name__ == "__main__":
    main()
