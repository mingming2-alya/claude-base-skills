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
import sys
sys.dont_write_bytecode = True
import argparse
import html
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from deck_model import AXES, EMPH_RE, StoryboardError, load, main_slides, toc_mode  # noqa: E402
from lint import lint  # noqa: E402

THEMES_DIR = HERE.parent / "themes"
FONT_BASE = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
             '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>')
THEME_ALIASES = {"paper": "editorial", "signal": "swiss", "ink": "midnight"}


def fonts_link(*css_texts):
    """Google Fonts <link> built from the '@fonts family=...' line(s) in theme files."""
    fams = []
    for css in css_texts:
        for m in re.finditer(r"@fonts\s+([^\n*]+)", css):
            for part in m.group(1).strip().split("&"):
                if part.startswith("family=") and part not in fams:
                    fams.append(part)
    if not fams:
        return FONT_BASE
    return FONT_BASE + f'<link href="https://fonts.googleapis.com/css2?{"&".join(fams)}&display=swap" rel="stylesheet">'


# ----------------------------------------------------------------------------- text helpers
def esc(s):
    return html.escape(str(s if s is not None else ""))


def rich(s):
    """Escape, then turn ==x== into the accent mark and newlines into <br>."""
    out = esc(s)
    out = EMPH_RE.sub(lambda m: f'<mark class="em">{m.group(1)}</mark>', out)
    return out.replace("\n", "<br>")


PHRASE_SPLIT = re.compile(r'(<mark class="em">.*?</mark>|<br>)')
PHRASE_END = re.compile(r'(?<=[，、；：。！？,;!?])\s*')


def display(s):
    """rich() for large display text: lines may only break after punctuation.

    Each phrase becomes an inline-block, so the browser moves a whole phrase to the
    next line instead of splitting a word ("營 / 收成長"). A phrase that is wider
    than the line still wraps inside itself, so nothing can overflow.
    """
    phrases, cur = [], ""
    for piece in PHRASE_SPLIT.split(rich(s)):
        if not piece:
            continue
        if piece == "<br>":
            phrases.append(cur); phrases.append("<br>"); cur = ""
        elif piece.startswith("<mark"):
            cur += piece
        else:
            parts = PHRASE_END.split(piece)
            for i, part in enumerate(parts):
                cur += part
                if i < len(parts) - 1:
                    phrases.append(cur); cur = ""
    phrases.append(cur)
    phrases = [x for x in phrases if x]
    if len([x for x in phrases if x != "<br>"]) < 2:
        return "".join(phrases)
    return "".join(x if x == "<br>" else f'<span class="ph">{x}</span>' for x in phrases)


# ----------------------------------------------------------------------------- theme
def theme_css(theme, base_dir):
    if not theme:
        theme = "editorial"
    theme = THEME_ALIASES.get(theme, theme)
    p = Path(theme)
    candidates = [base_dir / p] if (theme.endswith(".css") or "/" in theme) else []
    candidates.append(THEMES_DIR / f"{theme}.css")
    for c in candidates:
        if c.exists():
            return c.read_text(encoding="utf-8"), c.stem
    sys.exit(f"找不到主題「{theme}」。內建主題：{', '.join(sorted(x.stem for x in THEMES_DIR.glob('*.css')))}")


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
    flow = main_slides(data)
    per_ch = {cid: [] for cid in ids}
    for s in flow:
        if s.get("type", "content") == "content" and s.get("chapter") in per_ch and s.get("layout") != "pillars":
            per_ch[s["chapter"]].append(s)

    out, started, agenda_done = [], set(), mode != "agenda"
    for s in flow:
        t = s.get("type", "content")
        if not agenda_done and t != "cover":
            out.append({"kind": "toc", "chi": -1, "src": None})  # one agenda page, all chapters lit
            agenda_done = True
        if t == "content" and s.get("layout") == "pillars":
            out.append({"kind": "overview", "chi": -1, "src": s})
        elif t == "content" and s.get("layout") == "status-table":
            out.append({"kind": "status", "chi": -1, "src": s})
        elif t == "content":
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
    # appendix pages: reached only through links, kept out of the linear flow
    for s in data["slides"]:
        if isinstance(s, dict) and s.get("appendix"):
            t = s.get("type", "content")
            if t == "content" and s.get("layout") == "pillars":
                out.append({"kind": "overview", "chi": -1, "src": s, "appendix": True})
            elif t == "content":
                cid = s.get("chapter")
                out.append({"kind": "content", "chi": ids.index(cid) if cid in ids else -1, "src": s,
                            "tab": 0, "tabs": 1, "appendix": True})
            else:
                out.append({"kind": t, "chi": -1, "src": s, "appendix": True})
    return out


# ----------------------------------------------------------------------------- renderers
def render_pillars(s, motion):
    pillars = s.get("pillars") or []
    stagger = s.get("stagger") or ("down" if motion == "vertical" else "none")
    cols = []
    for i, p in enumerate(pillars):
        k = i if stagger == "down" else (len(pillars) - 1 - i if stagger == "up" else 0)
        items = "".join(f"<li>{rich(x)}</li>" for x in p.get("items", []))
        stats = "".join(f'<div class="stat"><div class="sv">{number_html(st.get("value"))}</div>'
                        f'<div class="sl">{rich(st.get("label"))}</div></div>' for st in p.get("stats", []))
        link = f' data-link="{esc(p["link"])}"' if p.get("link") else ""
        more = '<span class="more">看細節 →</span>' if p.get("link") else ""
        kicker = '<div class="pk">' + esc(p.get("kicker")) + "</div>" if p.get("kicker") else ""
        sub = '<p class="psub">' + rich(p.get("sub")) + "</p>" if p.get("sub") else ""
        ul = "<ul>" + items + "</ul>" if items else ""
        st = '<div class="stats">' + stats + "</div>" if stats else ""
        cols.append(f'<div class="pillar rv" style="--k:{k}"{link}>{kicker}<h3>{rich(p.get("heading"))}</h3>'
                    f'{sub}{ul}{st}{more}</div>')
    return f'<div class="pillars" style="--n:{len(pillars)}">{"".join(cols)}</div>'


STATE_LABEL = {"done": "已完成", "doing": "進行中", "target": "目標", "na": "—"}
RISK_LABEL = {"red": "需介入", "yellow": "注意", "green": "正常"}


def render_status_table(s):
    stages = s.get("stages") or []
    head = ("<tr><th class='c-name'>項目</th><th class='c-owner'>負責</th>"
            + "".join(f"<th>{esc(x)}</th>" for x in stages)
            + "<th class='c-prog'>進度</th><th class='c-risk'>風險</th><th class='c-sup'>需要的支援</th></tr>")
    body = []
    for g in s.get("groups") or []:
        note = f"<span class='g-note'>{esc(g['note'])}</span>" if g.get("note") else ""
        body.append(f"<tr class='grp'><td colspan='{len(stages) + 5}'>{esc(g.get('name'))}{note}</td></tr>")
        for r in g.get("rows") or []:
            cells = []
            for c in r.get("cells") or []:
                c = c if isinstance(c, dict) else {"state": c}
                stt = c.get("state", "na")
                date = f"<b>{esc(c['date'])}</b> " if c.get("date") else ""
                cells.append(f"<td class='st st-{esc(stt)}'><i></i>{date}{STATE_LABEL.get(stt, '')}</td>")
            pr = r.get("progress")
            prog = (f"<td class='c-prog'><span class='bar'><span style='width:{int(pr)}%'></span></span>{int(pr)}%</td>"
                    if isinstance(pr, (int, float)) else "<td class='c-prog'>—</td>")
            risk = r.get("risk", "green")
            sup = esc(r.get("support") or r.get("note") or "")
            body.append(f"<tr class='rk-{esc(risk)}'><td class='c-name'>{esc(r.get('name'))}</td>"
                        f"<td class='c-owner'>{esc(r.get('owner', ''))}</td>{''.join(cells)}{prog}"
                        f"<td class='c-risk'><span class='dot dot-{esc(risk)}'></span>{RISK_LABEL.get(risk, '')}</td>"
                        f"<td class='c-sup'>{sup}</td></tr>")
    summary = ""
    if s.get("summary"):
        summary = "<ul class='st-summary'>" + "".join(f"<li>{rich(x)}</li>" for x in s["summary"]) + "</ul>"
    return f"{summary}<table class='status-table'><thead>{head}</thead><tbody>{''.join(body)}</tbody></table>"


NUM_RE = re.compile(r"^(?P<pre>[^\d]*?)(?P<num>[\d][\d.,]*)(?P<post>.*)$")


def number_html(value):
    """Big figure with a small unit: '38%' -> <span class=num>38</span><span class=unit>%</span>.
    A value fully wrapped in ==...== keeps the accent."""
    raw = str(value if value is not None else "")
    em = raw.startswith("==") and raw.endswith("==") and len(raw) > 4
    inner = raw[2:-2] if em else raw
    pair = re.match(r"^\s*([\d][\d.,]*)\s*([^\d\s→>-]*)\s*(?:→|->)\s*(?:==)?([\d][\d.,]*)(?:==)?\s*(.*)$", raw if not em else inner)
    if pair:  # before → after: the outcome carries the accent
        a, ua, b, ub = pair.groups()
        unit = lambda u: f'<span class="unit">{esc(u.strip())}</span>' if u.strip() else ""
        return (f'<span class="pair"><span class="num was">{esc(a)}</span>{unit(ua)}<span class="arrow">→</span>'
                f'<mark class="em"><span class="num">{esc(b)}</span>{unit(ub)}</mark></span>')
    m = NUM_RE.match(inner)
    if not m or EMPH_RE.search(inner):
        return rich(raw)
    out = (esc(m.group("pre")) + f'<span class="num">{esc(m.group("num"))}</span>'
           + (f'<span class="unit">{esc(m.group("post").strip())}</span>' if m.group("post").strip() else ""))
    return f'<mark class="em">{out}</mark>' if em else out


def source_line(s):
    return f'<p class="source">資料來源：{esc(s["source"])}</p>' if s.get("source") else ""


def render_layout(s, base_dir):
    lay = s.get("layout")
    if lay == "point":
        key = s.get("key", "")
        whole = "" if EMPH_RE.search(key) else " whole"
        sup = f'<p class="support rv">{rich(s["support"])}</p>' if s.get("support") else ""
        return f'<div class="point"><p class="key rv{whole}">{display(key)}</p>{sup}</div>'
    if lay == "number":
        note = f'<p class="note rv">{rich(s["note"])}</p>' if s.get("note") else ""
        return (f'<div class="number"><div class="value rv">{number_html(s.get("value"))}</div>'
                f'<div class="label rv">{rich(s.get("label"))}</div>{note}</div>')
    foot_note = f'<p class="lnote rv">{rich(s["note"])}</p>' if s.get("note") else ""
    if lay == "stats":
        cells = "".join(f'<div class="stat rv"><div class="sv">{number_html(st.get("value"))}</div>'
                        f'<div class="sl">{rich(st.get("label"))}</div>'
                        + (f'<div class="sn">{rich(st["note"])}</div>' if st.get("note") else "") + "</div>"
                        for st in s.get("stats", []))
        lead = f'<p class="stats-lead rv">{rich(s["lead"])}</p>' if s.get("lead") else ""
        return f'<div class="stats-page">{lead}<div class="stats-row" style="--n:{len(s.get("stats", []))}">{cells}</div>{foot_note}</div>'
    if lay == "bullets":
        lis = "".join(f'<li class="rv">{rich(x)}</li>' for x in s.get("items", []))
        return f'<div><ul class="bullets">{lis}</ul>{foot_note}</div>'
    if lay == "steps":
        items = s.get("items", [])
        def step(i, x):
            if isinstance(x, dict):  # {label, detail}
                d = f'<span class="d">{rich(x["detail"])}</span>' if x.get("detail") else ""
                return f'<li class="rv"><span class="n">{i:02d}</span><span class="t">{rich(x.get("label"))}</span>{d}</li>'
            return f'<li class="rv"><span class="n">{i:02d}</span><span class="t">{rich(x)}</span></li>'
        lis = "".join(step(i, x) for i, x in enumerate(items, 1))
        return f'<div><ol class="steps" style="--n:{len(items)}">{lis}</ol>{foot_note}</div>'
    if lay == "compare":
        def col(side):
            v = s.get(side) or {}
            lis = "".join(f"<li>{rich(x)}</li>" for x in v.get("items", []))
            return f'<div class="col rv"><h3>{rich(v.get("heading"))}</h3><ul>{lis}</ul></div>'
        return f'<div class="compare">{col("left")}<div class="divider"></div>{col("right")}</div>'
    if lay == "quote":
        src = f'<cite class="rv">{rich(s["source"])}</cite>' if s.get("source") else ""
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
    back = ""
    if rec.get("appendix"):
        attrs += f' data-appendix="1" data-id="{esc(s.get("id"))}"'
        back = '<button class="back" type="button">← 返回</button>'
    pageno = f'<div class="pageno">{"附件" if rec.get("appendix") else f"{idx:02d}"}</div>'
    frame = '<i class="frame-line"></i>'
    deck_name = esc(re.sub(r"==", "", str(meta.get("short") or meta.get("title") or "")))
    foot = (f'<footer class="foot"><span>{deck_name}</span>'
            f'<span class="pg">{"附件" if rec.get("appendix") else f"{idx:02d} / {total:02d}"}</span></footer>')
    more = (f'<button class="more-btn" type="button" data-link="{esc(s["link"])}">看細節 →</button>'
            if s.get("link") else "")

    if kind == "status":
        cont = "（續）" if s.get("continued") else ""
        return (f'<section class="slide status" {attrs}>{frame}{back}<header class="st-head">'
                f'<h2 class="title">{esc(s.get("title"))}{cont}</h2>'
                f'<div class="legend"><span><i class="st-done"></i>已完成</span><span><i class="st-doing"></i>進行中</span>'
                f'<span><i class="st-target"></i>目標</span><span class="dot dot-red"></span>需介入'
                f'<span class="dot dot-yellow"></span>注意<span class="dot dot-green"></span>正常</div></header>'
                f'<div class="st-body">{render_status_table(s)}</div>{source_line(s)}{pageno}</section>')

    if kind == "overview":
        motion = motion_for(data["structure"])
        kicker = f'<div class="ov-kicker rv">{esc(s.get("title"))}</div>' if s.get("title") else ""
        return (f'<section class="slide overview" {attrs}>{frame}{back}<header class="ov-head">{kicker}'
                f'<h2 class="ov-headline rv">{rich(s.get("headline"))}</h2></header>'
                f'{render_pillars(s, motion)}{source_line(s)}{more}</section>')

    if kind == "cover":
        who = esc(meta.get("presenter") or "")
        has_who = bool(who or meta.get("date"))
        route = ((f'<div class="who"><i>{esc(meta.get("date", ""))}</i>{who}</div>' if has_who else "")
                 + "".join(f'<div><i>{i + 1:02d}</i>{esc(c["label"])}</div>' for i, c in enumerate(chapters)))
        parts = [f'<h1 class="cover-title rv">{display(meta.get("title"))}</h1>',
                 f'<p class="cover-sub rv">{rich(meta.get("subtitle"))}</p>' if meta.get("subtitle") else ""]
        kicker = f'<div class="kicker rv">{esc(meta.get("kicker"))}</div>' if meta.get("kicker") else ""
        return (f'<section class="slide cover" {attrs}>{frame}{kicker}<div class="cover-inner">{"".join(parts)}</div>'
                f'<div class="route rv{"" if has_who else " no-who"}" style="--n:{len(chapters)}">{route}</div></section>')

    if kind == "toc":
        lis = "".join(f'<li class="{"on" if rec["chi"] in (-1, i) else "off"}"><span class="i">{i + 1:02d}</span>'
                      f'<span class="l">{esc(c["label"])}</span></li>' for i, c in enumerate(chapters))
        return f'<section class="slide toc" {attrs}>{frame}<ol class="toc-list">{lis}</ol></section>'

    if kind == "shock":
        sub = f'<p class="shock-sub">{rich(s["sub"])}</p>' if s.get("sub") else ""
        return (f'<section class="slide shock" {attrs}>{frame}<div class="shock-inner">'
                f'<p class="shock-text">{display(s.get("text"))}</p>{sub}</div>{source_line(s)}</section>')

    if kind == "closing":
        sub = f'<p class="closing-sub rv">{rich(s["sub"])}</p>' if s.get("sub") else ""
        return (f'<section class="slide closing" {attrs}>{frame}<div class="closing-inner">'
                f'<p class="closing-text rv">{display(s.get("text", ""))}</p>{sub}</div></section>')

    # content
    snav = static_nav(chapters, rec["chi"], rec["tab"], rec["tabs"], ch_sources[rec["chi"]])
    tabbed = " tabbed" if rec["tabs"] > 2 else ""
    attrs += f' data-tab="{rec["tab"]}" data-tabs="{rec["tabs"]}"'
    ghost = ""
    if rec["tab"] == 0 and not rec.get("appendix") and 0 <= rec["chi"] < len(chapters):
        ghost = f'<div class="ghost" aria-hidden="true">{esc(chapters[rec["chi"]]["label"])}</div>'
    hooks = ""
    if 0 <= rec["chi"] < len(chapters):
        hooks = (f'<div class="chno" aria-hidden="true">{rec["chi"] + 1:02d}</div>'
                 f'<div class="chname" aria-hidden="true">{esc(chapters[rec["chi"]]["label"])}</div>')
    return (f'<section class="slide content layout-{esc(s.get("layout"))}{tabbed}" {attrs}>{frame}{ghost}{hooks}{back}{snav}'
            f'<header class="slide-head"><h2 class="title">{esc(s.get("title"))}</h2></header>'
            f'<div class="body">{render_layout(s, base_dir)}</div>'
            f'{"" if s.get("layout") == "quote" else source_line(s)}{more}{foot}</section>')


def render_slides(data, base_dir, records):
    ids = [c["id"] for c in data["chapters"]]
    ch_sources = [[s for s in main_slides(data) if s.get("type", "content") == "content"
                   and s.get("chapter") == cid and s.get("layout") != "pillars"] for cid in ids]
    total = sum(1 for r in records if not r.get("appendix"))
    return [render_slide(r, data, i, total, base_dir, ch_sources) for i, r in enumerate(records, 1)]


# ----------------------------------------------------------------------------- page assembly
def deck_html(data, base_dir):
    css_theme, _ = theme_css(data["meta"].get("theme"), base_dir)
    fonts = fonts_link(css_theme)
    records = expand(data)
    slides = render_slides(data, base_dir, records)
    motion = motion_for(data["structure"])
    deck_json = {
        "chapters": [c["label"] for c in data["chapters"]],
        "tabs": [[(s.get("tab") or s.get("title")) for s in main_slides(data)
                  if s.get("type", "content") == "content" and s.get("chapter") == c["id"]
                  and s.get("layout") != "pillars"]
                 for c in data["chapters"]],
        "motion": motion,
    }
    return PAGE.format(
        fmt=esc(data["meta"].get("format", "deck")),
        lang=esc(data["meta"].get("lang", "zh-Hant")),
        title=esc(re.sub(r"==", "", str(data["meta"].get("title", "Deck")))),
        fonts=fonts, theme=css_theme, base=BASE_CSS,
        motion=motion, shape=toc_shape(motion),
        slides="\n".join(slides), deck=json.dumps(deck_json, ensure_ascii=False), runtime=RUNTIME_JS, fit=FIT_JS)


def samples_html(data, base_dir, themes, pages=None):
    records = expand(data)
    slides = render_slides(data, base_dir, records)
    pick = [0] if records and records[0]["kind"] == "cover" else []
    contents = [i for i, r in enumerate(records) if r["kind"] == "content"]
    contents = [i for i in contents if not records[i].get("appendix")]
    if pages:  # explicit choice: 1-based page numbers of the built deck
        pick = [p - 1 for p in pages if 0 < p <= len(records)]
    else:
        # the signature page first (one big idea or figure), then a page with a different layout
        sig = [i for i in contents if r_src(records[i]).get("layout") in ("point", "number", "stats")]
        with_em = [i for i in contents if EMPH_RE.search(json.dumps(r_src(records[i]), ensure_ascii=False))]
        first = (sig or with_em or contents or [0])[0]
        pick.append(first)
        shocks = [i for i, r in enumerate(records) if r["kind"] == "shock"]
        other = [i for i in contents if r_src(records[i]).get("layout") != r_src(records[first]).get("layout")]
        if shocks:
            pick.append(shocks[0])
        elif other:
            pick.append(other[0])

    motion = motion_for(data["structure"])
    blocks, css_all = [], []
    roles = ["A", "B", "C", "D", "E"]
    try:
        names = json.loads((THEMES_DIR / "index.json").read_text(encoding="utf-8"))
    except Exception:
        names = {}
    for n, th in enumerate(themes):
        th, _, role = th.partition(":")
        css, stem = theme_css(th, base_dir)
        zh = (names.get(stem) or {}).get("name", "")
        label = " · ".join(x for x in (role, zh, stem) if x)
        cls = f"t-{re.sub(r'[^a-z0-9]+', '-', stem.lower())}"
        css_all.append(scope_theme(css, cls))
        frames = "".join(f'<div class="frame"><div class="frame-inner {cls}">{slides[i]}</div></div>' for i in pick)
        blocks.append(f'<section class="sample"><h2><b>{roles[n]}</b> {esc(label)}</h2><div class="row">{frames}</div></section>')
    return SAMPLES_PAGE.format(
        lang=esc(data["meta"].get("lang", "zh-Hant")), fonts=fonts_link(*css_all), base=BASE_CSS,
        themes="\n".join(css_all), motion=motion, shape=toc_shape(motion),
        title=esc(re.sub(r"==", "", str(data["meta"].get("title", "")))), blocks="\n".join(blocks), fit=FIT_JS)


def scope_theme(css, cls):
    """Scope a theme file to one sample column: ':root' becomes '.cls', other rules get a '.cls ' prefix.
    The '@fonts' line is kept (as a comment) so the samples page can still load the theme's fonts."""
    fonts = "\n".join(f"/* @fonts {m} */" for m in re.findall(r"@fonts\s+([^\n*]+)", css))
    body_css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    out = []
    for sel, body in re.findall(r"([^{}]+)\{([^{}]*)\}", body_css):
        sel = sel.strip()
        if not sel:
            continue
        if sel == ":root":
            out.append(f".{cls}{{{body}}}")
        else:
            out.append(",".join(f".{cls} {x.strip()}" for x in sel.split(",")) + f"{{{body}}}")
    return fonts + "\n" + "\n".join(out)


def r_src(rec):
    return rec["src"] or {}


# ----------------------------------------------------------------------------- templates
BASE_CSS = (HERE.parent / "assets" / "base.css").read_text(encoding="utf-8")

RUNTIME_JS = (HERE.parent / "assets" / "runtime.js").read_text(encoding="utf-8")
FIT_JS = (HERE.parent / "assets" / "fit.js").read_text(encoding="utf-8")

PAGE = """<!doctype html>
<html lang="{lang}" data-shape="{shape}" data-motion="{motion}" data-format="{fmt}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
{fonts}
<style>
{base}
{theme}
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
<script>{fit}</script>
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
{base}
{themes}
html,body{{height:auto;overflow:auto;background:#e9e7e3}}
body{{font-family:system-ui,"Noto Sans TC","PingFang TC",sans-serif;color:#222;padding:40px 32px 80px}}
header.top h1{{font-size:26px;font-weight:700}}
header.top p{{color:#666;margin-top:6px;font-size:15px}}
.sample{{margin-top:40px}}
.sample>h2{{font-size:20px;font-weight:600;margin-bottom:14px;color:#333}}
.sample>h2 b{{display:inline-block;background:#222;color:#fff;border-radius:4px;padding:2px 10px;margin-right:8px}}
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
<script>{fit}</script>
</body>
</html>
"""


# ----------------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("storyboard")
    ap.add_argument("--samples", help="comma-separated themes, optionally with a role: swiss:穩健,broadsheet:大膽,washi:驚喜")
    ap.add_argument("--sample-pages", help="comma-separated page numbers to show in the samples (default: cover, signature page, one more)")
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
        pages = [int(x) for x in a.sample_pages.split(",")] if a.sample_pages else None
        out.write_text(samples_html(data, base, themes, pages), encoding="utf-8")
    else:
        out = Path(a.out) if a.out else base / "deck.html"
        out.write_text(deck_html(data, base), encoding="utf-8")
    print(f"\n已輸出：{out}")


if __name__ == "__main__":
    main()
