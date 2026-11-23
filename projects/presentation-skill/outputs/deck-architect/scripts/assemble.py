#!/usr/bin/env python3
"""Assemble a deck-architect v4 playable HTML deck or Gate 2 comparison sheet.

Usage:
  python3 assemble.py path/to/storyboard.yaml [--out deck.html] [--force] [--write-upgrade-list]
  python3 assemble.py --sheet path/to/samples_dir [--out sheet.html] [--title "風格樣張"]

Hybrid Thin-Shell + High-Freedom Canvas model:
  - Any slide with a custom HTML fragment (explicit `file:` in storyboard or auto-matched
    in `slides/<id>.html` / `slides/<NN>-*.html`) is embedded as a free-canvas slide (.slide.canvas).
  - Slides without a custom fragment (e.g., deterministic business components `status-table`,
    `pillars`, automatic `toc` pages, or quick-mode slides) are rendered by built-in components.
  - Replaceable `.asset-slot[data-slot="..."]` elements automatically swap in upgraded AI images
    or photos placed under `assets/<slot>.{png,jpg,jpeg,webp,svg}` (with optional `-dark`/`-light` suffix).
  - `<defs>` SVG IDs are automatically prefixed per slide to prevent cross-slide clipPath/filter collisions.
"""
import sys
sys.dont_write_bytecode = True
import argparse
import base64
import html
import json
import mimetypes
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
SKILL_ROOT = HERE.parent
ASSETS_DIR = SKILL_ROOT / "assets"
sys.path.insert(0, str(HERE))

from deck_model import (  # noqa: E402
    AXES, EMPH_RE, StoryboardError, load, main_slides, toc_mode,
)
from lint import lint  # noqa: E402

FONT_PRECONNECT = (
    '<link rel="preconnect" href="https://fonts.googleapis.com">'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
)

DEFAULT_FONTS = [
    "family=Noto+Sans+TC:wght@400;500;700;900",
    "family=Archivo:wght@700;900",
]

ASSET_EXTS = (".png", ".jpg", ".jpeg", ".webp", ".svg")


# ----------------------------------------------------------------------------- text helpers
def esc(s):
    return html.escape(str(s if s is not None else ""))


def rich(s):
    out = esc(s)
    out = EMPH_RE.sub(lambda m: f'<mark class="em">{m.group(1)}</mark>', out)
    return out.replace("\n", "<br>")


PHRASE_SPLIT = re.compile(r'(<mark class="em">.*?</mark>|<br>)')
PHRASE_END = re.compile(r'(?<=[，、；：。！？,;!?])\s*')


def display(s):
    """rich() for large display text: break after punctuation rather than mid-word."""
    phrases, cur = [], ""
    for piece in PHRASE_SPLIT.split(rich(s)):
        if not piece:
            continue
        if piece == "<br>":
            phrases.append(cur)
            phrases.append("<br>")
            cur = ""
        elif piece.startswith("<mark"):
            cur += piece
        else:
            parts = PHRASE_END.split(piece)
            for i, part in enumerate(parts):
                cur += part
                if i < len(parts) - 1:
                    phrases.append(cur)
                    cur = ""
    phrases.append(cur)
    phrases = [x for x in phrases if x]
    if len([x for x in phrases if x != "<br>"]) < 2:
        return "".join(phrases)
    return "".join(x if x == "<br>" else f'<span class="ph">{x}</span>' for x in phrases)


CELL_NUM_RE = re.compile(r"^[-+−]?[\d][\d.,]*\s*[^\d\s]{0,3}$")
NUM_RE = re.compile(r"^(?P<pre>[^\d]*?)(?P<num>[\d][\d.,]*)(?P<post>.*)$")


def number_html(value):
    raw = str(value if value is not None else "")
    em = raw.startswith("==") and raw.endswith("==") and len(raw) > 4
    inner = raw[2:-2] if em else raw
    pair = re.match(
        r"^\s*([\d][\d.,]*)\s*([^\d\s→>-]*)\s*(?:→|->)\s*(?:==)?([\d][\d.,]*)(?:==)?\s*(.*)$",
        raw if not em else inner,
    )
    if pair:
        a, ua, b, ub = pair.groups()
        unit = lambda u: f'<span class="unit">{esc(u.strip())}</span>' if u.strip() else ""  # noqa: E731
        return (
            f'<span class="pair"><span class="num was">{esc(a)}</span>{unit(ua)}'
            f'<span class="arrow">→</span><mark class="em"><span class="num">{esc(b)}</span>{unit(ub)}</mark></span>'
        )
    m = NUM_RE.match(inner)
    if not m or EMPH_RE.search(inner):
        return rich(raw)
    post = m.group("post").strip()
    out = esc(m.group("pre")) + f'<span class="num">{esc(m.group("num"))}</span>' + (
        f'<span class="unit">{esc(post)}</span>' if post else ""
    )
    return f'<mark class="em">{out}</mark>' if em else out


def collect_fonts(*texts):
    fams = []
    for txt in texts:
        if not txt:
            continue
        for m in re.finditer(r"@fonts\s+([^\n*<>]+)", txt):
            for part in m.group(1).strip().split("&"):
                part = part.strip()
                if part.startswith("family=") and part not in fams:
                    fams.append(part)
        for m in re.finditer(r'fonts\.googleapis\.com/css2\?([^"\'>\s]+)', txt):
            for part in m.group(1).split("&"):
                part = part.strip()
                if part.startswith("family=") and part not in fams:
                    fams.append(part)
    if not fams:
        fams = list(DEFAULT_FONTS)
    return FONT_PRECONNECT + f'<link href="https://fonts.googleapis.com/css2?{"&".join(fams)}&display=swap" rel="stylesheet">'


# ----------------------------------------------------------------------------- motion & expansion
def motion_for(structure):
    axis = structure.get("axis", "time")
    override = structure.get("motion")
    if override in ("horizontal", "vertical", "zoom-in", "zoom-out"):
        return override
    m = AXES.get(axis, ("neutral", "horizontal"))[1]
    if m == "zoom":
        d = str(structure.get("direction", ""))
        first = re.split(r"→|->|到", d)[0] if d else ""
        return "zoom-out" if re.search(r"小|近|局部|細|個人|我", first) else "zoom-in"
    return m


def toc_shape(motion):
    return {"horizontal": "row", "vertical": "column"}.get(motion, "rings")


def expand(data):
    chapters = data["chapters"]
    ids = [c["id"] for c in chapters]
    mode = toc_mode(data)
    use_toc = mode == "per-chapter"
    flow = main_slides(data)
    per_ch = {cid: [] for cid in ids}
    for s in flow:
        if s.get("type", "content") == "content" and s.get("chapter") in per_ch and s.get("layout") not in ("pillars", "status-table"):
            per_ch[s["chapter"]].append(s)

    out, started, agenda_done = [], set(), mode != "agenda"
    for s in flow:
        t = s.get("type", "content")
        if not agenda_done and t != "cover":
            out.append({"kind": "toc", "chi": -1, "src": None})
            agenda_done = True
        if t == "content" and s.get("layout") == "pillars":
            out.append({"kind": "overview", "chi": -1, "src": s})
        elif t == "content" and s.get("layout") == "status-table":
            out.append({"kind": "status", "chi": -1, "src": s})
        elif t == "content":
            cid = s["chapter"]
            chi = ids.index(cid) if cid in ids else -1
            if use_toc and cid in ids and cid not in started:
                out.append({"kind": "toc", "chi": chi, "src": None})
            started.add(cid)
            siblings = per_ch.get(cid, [])
            tab_idx = siblings.index(s) if s in siblings else 0
            out.append({"kind": "content", "chi": chi, "src": s, "tab": tab_idx, "tabs": len(siblings)})
        else:
            out.append({"kind": t, "chi": -1, "src": s})

    for s in data["slides"]:
        if isinstance(s, dict) and s.get("appendix"):
            t = s.get("type", "content")
            if t == "content" and s.get("layout") == "pillars":
                out.append({"kind": "overview", "chi": -1, "src": s, "appendix": True})
            elif t == "content":
                cid = s.get("chapter")
                out.append({
                    "kind": "content",
                    "chi": ids.index(cid) if cid in ids else -1,
                    "src": s,
                    "tab": 0,
                    "tabs": 1,
                    "appendix": True,
                })
            else:
                out.append({"kind": t, "chi": -1, "src": s, "appendix": True})
    return out


# ----------------------------------------------------------------------------- free-canvas fragment loader
DEFS_TAG_RE = re.compile(r"<defs\b[^>]*>(.*?)</defs>", re.S | re.I)
ID_ATTR_RE = re.compile(r'\bid="([^"]+)"')
STYLE_BLOCK_RE = re.compile(r"<style\b[^>]*>(.*?)</style>", re.S | re.I)
SCRIPT_BLOCK_RE = re.compile(r"<script\b[^>]*>(.*?)</script>", re.S | re.I)
BODY_RE = re.compile(r"<body\b[^>]*>(.*?)</body>", re.S | re.I)
SLIDE_OPEN_RE = re.compile(r"<(section|div)\b([^>]*\bclass=\"[^\"]*\bslide\b[^\"]*\"[^>]*)>", re.I)
AUTO_NAV_RE = re.compile(r"(<nav\b[^>]*\bdata-auto-nav\b[^>]*>)(.*?)(</nav>)", re.S | re.I)
SLOT_RE = re.compile(
    r'(<div\b[^>]*\bdata-slot="([^"]+)"[^>]*>)(.*?)(</div><!--\s*/slot\s*-->)',
    re.S | re.I,
)


def find_fragment(rec, idx, base_dir):
    s = rec["src"] or {}
    if s.get("file"):
        p = (base_dir / s["file"]).resolve()
        if not p.exists():
            raise StoryboardError(f"第 {idx} 頁找不到自由編排檔案：{s['file']}")
        return p
    if rec["kind"] == "toc":
        return None
    slides_dir = base_dir / "slides"
    if not slides_dir.is_dir():
        return None
    sid = s.get("id")
    if sid:
        p = slides_dir / f"{sid}.html"
        if p.exists():
            return p
    if not rec.get("appendix"):
        for pat in (f"{idx:02d}.html", f"{idx:02d}-*.html"):
            matches = sorted(slides_dir.glob(pat))
            if matches:
                return matches[0]
    return None


def _scope_defs_ids(markup, script_code, prefix):
    """Prefix SVG <defs> IDs per slide so filters/clipPaths/gradients never collide across slides."""
    defs_ids = []
    seen = set()
    dups = set()
    for m in DEFS_TAG_RE.finditer(markup):
        for im in ID_ATTR_RE.finditer(m.group(1)):
            gid = im.group(1)
            if gid in seen:
                dups.add(gid)
            else:
                seen.add(gid)
                defs_ids.append(gid)
    if dups:
        print(f"[WARN]  {prefix}: SVG <defs> 內部有重複 id：{', '.join(sorted(dups))}（可能造成 clipPath/漸層互相覆蓋）")
    for gid in defs_ids:
        new_id = f"{prefix}_{gid}"
        esc_id = re.escape(gid)
        markup = re.sub(rf'\bid="{esc_id}"', f'id="{new_id}"', markup)
        markup = re.sub(rf'url\(#{esc_id}\)', f'url(#{new_id})', markup)
        markup = re.sub(rf'(xlink:)?href="#{esc_id}"', rf'\1href="#{new_id}"', markup)
        if script_code:
            script_code = re.sub(rf'url\(#{esc_id}\)', f'url(#{new_id})', script_code)
            script_code = re.sub(rf'(xlink:)?href="#{esc_id}"', rf'\1href="#{new_id}"', script_code)
    return markup, script_code


def _find_slot_asset(slot_name, mode, assets_dir):
    if not assets_dir.is_dir():
        return None
    candidates = []
    if mode:
        candidates.append(f"{slot_name}-{mode}")
    candidates.append(slot_name)
    for stem in candidates:
        for ext in ASSET_EXTS:
            p = assets_dir / f"{stem}{ext}"
            if p.exists():
                return p
    return None


def _replace_slots(markup, assets_dir, mode, found_slots):
    """Swap .asset-slot[data-slot] fallback SVG when an upgraded image exists under assets/."""
    def repl(m):
        open_tag, slot_name, inner, close_tag = m.groups()
        slot_mode_m = re.search(r'\bdata-mode="([^"]+)"', open_tag)
        smode = slot_mode_m.group(1) if slot_mode_m else mode
        asset = _find_slot_asset(slot_name, smode, assets_dir)
        found_slots.append({"slot": slot_name, "mode": smode, "upgraded": str(asset.name) if asset else None})
        if not asset:
            return m.group(0)
        mime, _ = mimetypes.guess_type(str(asset))
        mime = mime or "image/png"
        b64 = base64.b64encode(asset.read_bytes()).decode("ascii")
        img = f'<img class="slot-img" src="data:{mime};base64,{b64}" alt="">'
        return f"{open_tag}{img}{close_tag}"

    # Also record plain data-slot tags without explicit <!-- /slot --> marker for reporting
    out = SLOT_RE.sub(repl, markup)
    recorded = {x["slot"] for x in found_slots}
    for m in re.finditer(r'<div\b[^>]*\bdata-slot="([^"]+)"[^>]*>', out):
        sn = m.group(1)
        if sn not in recorded:
            asset = _find_slot_asset(sn, mode, assets_dir)
            found_slots.append({"slot": sn, "mode": mode, "upgraded": str(asset.name) if asset else None})
            recorded.add(sn)
    return out


def _populate_auto_nav(markup, chapters, chi):
    if not chapters:
        return markup

    def repl(m):
        open_tag, _, close_tag = m.groups()
        items = []
        for i, c in enumerate(chapters):
            lab = esc(c["label"])
            items.append(f'<b class="on">{lab}</b>' if i == chi else f"<span>{lab}</span>")
        return open_tag + "".join(items) + close_tag

    return AUTO_NAV_RE.sub(repl, markup)


IMG_SRC_RE = re.compile(r'(<img\b[^>]*?\bsrc=")([^"]+)(")', re.I)


def _inline_local_imgs(markup, base_dir):
    """Inline relative local image files (e.g. assets/*.jpg) as base64 data URIs so deck.html is 100% standalone."""
    def repl(m):
        pre, src, post = m.groups()
        if src.startswith(("data:", "http://", "https://", "//", "#")):
            return m.group(0)
        p = (base_dir / src).resolve()
        if not p.is_file():
            return m.group(0)
        mime, _ = mimetypes.guess_type(str(p))
        mime = mime or "image/png"
        b64 = base64.b64encode(p.read_bytes()).decode("ascii")
        return f"{pre}data:{mime};base64,{b64}{post}"

    return IMG_SRC_RE.sub(repl, markup)


def load_free_slide(path, rec, data, idx, base_dir, found_slots):
    """Parse a per-slide HTML fragment (either full HTML or <section class="slide"> fragment)."""
    raw = path.read_text(encoding="utf-8")
    styles = STYLE_BLOCK_RE.findall(raw)
    scripts = SCRIPT_BLOCK_RE.findall(raw)
    body_m = BODY_RE.search(raw)
    content = body_m.group(1) if body_m else raw
    content = STYLE_BLOCK_RE.sub("", content)
    content = SCRIPT_BLOCK_RE.sub("", content).strip()

    slide_id = f"s-{idx}"
    s = rec["src"] or {}
    notes = esc(s.get("notes", ""))
    mode = str((data.get("meta") or {}).get("mode") or "")

    script_joined = "\n".join(sc.strip() for sc in scripts if sc.strip())
    content, script_joined = _scope_defs_ids(content, script_joined, f"s{idx}")
    content = _populate_auto_nav(content, data.get("chapters") or [], rec["chi"])
    content = _replace_slots(content, base_dir / "assets", mode, found_slots)
    content = _inline_local_imgs(content, base_dir)

    # Ensure outer <section class="slide canvas" ...> wrapper carries thin-shell data attributes
    extra_attrs = (
        f' id="{slide_id}" data-kind="{esc(rec["kind"])}" data-chi="{rec["chi"]}" '
        f'data-tab="{rec.get("tab", 0)}" data-tabs="{rec.get("tabs", 1)}" data-notes="{notes}"'
    )
    if rec.get("appendix"):
        extra_attrs += f' data-appendix="1" data-id="{esc(s.get("id", ""))}"'

    m = SLIDE_OPEN_RE.search(content)
    if m:
        tag, attrs = m.group(1), m.group(2)
        if "canvas" not in attrs:
            attrs = re.sub(r'class="([^"]*)"', r'class="\1 canvas"', attrs, count=1)
        # Strip any pre-existing id on outer slide element to keep id="s-{idx}" deterministic
        attrs = re.sub(r'\bid="[^"]*"', "", attrs)
        replaced = f"<{tag} {attrs.strip()}{extra_attrs}>"
        content = content[:m.start()] + replaced + content[m.end():]
        if rec.get("appendix") and 'class="back"' not in content:
            content = content.replace(replaced, replaced + '<button class="back" type="button">← 返回</button>', 1)
    else:
        back = '<button class="back" type="button">← 返回</button>' if rec.get("appendix") else ""
        content = f'<section class="slide canvas"{extra_attrs}>{back}{content}</section>'

    # Scope per-slide styles cleanly: rewrite `.slide` selector to `#s-{idx}` so slide styles stay isolated
    scoped_styles = []
    for css in styles:
        css_clean = css.strip()
        if not css_clean:
            continue
        css_clean = re.sub(r'(?<![\w-])\.slide(?![\w-])', f'#{slide_id}', css_clean)
        css_clean = re.sub(r':root\b', f'#{slide_id}', css_clean)
        scoped_styles.append(f"/* {path.name} */\n{css_clean}")

    wrapped_script = ""
    if script_joined:
        wrapped_script = (
            f"(function(slide){{\n{script_joined}\n}})(document.getElementById('{slide_id}'));"
        )
    return content, "\n".join(scoped_styles), wrapped_script, raw


# ----------------------------------------------------------------------------- deterministic business components
STATE_LABEL = {"done": "已完成", "doing": "進行中", "target": "目標", "na": "—"}
RISK_LABEL = {"red": "需介入", "yellow": "注意", "green": "正常"}


def source_line(s):
    return f'<p class="source">資料來源：{esc(s["source"])}</p>' if s.get("source") else ""


def render_pillars(s, motion):
    pillars = s.get("pillars") or []
    stagger = s.get("stagger") or ("down" if motion == "vertical" else "none")
    cols = []
    for i, p in enumerate(pillars):
        k = i if stagger == "down" else (len(pillars) - 1 - i if stagger == "up" else 0)
        items = "".join(f"<li>{rich(x)}</li>" for x in p.get("items", []))
        stats = "".join(
            f'<div class="stat"><div class="sv" data-fit="figure">{number_html(st.get("value"))}</div>'
            f'<div class="sl">{rich(st.get("label"))}</div></div>'
            for st in p.get("stats", [])
        )
        link = f' data-link="{esc(p["link"])}"' if p.get("link") else ""
        more = '<span class="more">看細節 →</span>' if p.get("link") else ""
        kicker = f'<div class="pk">{esc(p.get("kicker"))}</div>' if p.get("kicker") else ""
        sub = f'<p class="psub">{rich(p.get("sub"))}</p>' if p.get("sub") else ""
        ul = f"<ul>{items}</ul>" if items else ""
        st_html = f'<div class="stats">{stats}</div>' if stats else ""
        cols.append(
            f'<div class="pillar rv" style="--k:{k}"{link}>{kicker}<h3>{rich(p.get("heading"))}</h3>'
            f'{sub}{ul}{st_html}{more}</div>'
        )
    return f'<div class="pillars" style="--n:{len(pillars)}">{"".join(cols)}</div>'


def render_status_table(s):
    stages = s.get("stages") or []
    head = (
        "<tr><th class='c-name'>項目</th><th class='c-owner'>負責</th>"
        + "".join(f"<th>{esc(x)}</th>" for x in stages)
        + "<th class='c-prog'>進度</th><th class='c-risk'>風險</th><th class='c-sup'>需要的支援</th></tr>"
    )
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
            prog = (
                f"<td class='c-prog'><span class='bar'><span style='width:{int(pr)}%'></span></span>{int(pr)}%</td>"
                if isinstance(pr, (int, float)) else "<td class='c-prog'>—</td>"
            )
            risk = r.get("risk", "green")
            sup = esc(r.get("support") or r.get("note") or "")
            body.append(
                f"<tr class='rk-{esc(risk)}'><td class='c-name'>{esc(r.get('name'))}</td>"
                f"<td class='c-owner'>{esc(r.get('owner', ''))}</td>{''.join(cells)}{prog}"
                f"<td class='c-risk'><span class='dot dot-{esc(risk)}'></span>{RISK_LABEL.get(risk, '')}</td>"
                f"<td class='c-sup'>{sup}</td></tr>"
            )
    summary = ""
    if s.get("summary"):
        summary = "<ul class='st-summary'>" + "".join(f"<li>{rich(x)}</li>" for x in s["summary"]) + "</ul>"
    return f"{summary}<table class='status-table'><thead>{head}</thead><tbody>{''.join(body)}</tbody></table>"


def render_fallback_layout(s):
    lay = s.get("layout")
    foot_note = f'<p class="lnote rv">{rich(s["note"])}</p>' if s.get("note") else ""
    if lay == "point":
        key = s.get("key", "")
        whole = "" if EMPH_RE.search(key) else " whole"
        sup = f'<p class="support rv">{rich(s["support"])}</p>' if s.get("support") else ""
        return f'<div class="point"><p class="key rv{whole}" data-fit="phrase" data-role="summary">{display(key)}</p>{sup}</div>'
    if lay == "number":
        note = f'<p class="note rv">{rich(s["note"])}</p>' if s.get("note") else ""
        return (
            f'<div class="number" data-fit-group="figure">'
            f'<div class="value rv" data-fit="figure">{number_html(s.get("value"))}</div>'
            f'<div class="label rv">{rich(s.get("label"))}</div>{note}</div>'
        )
    if lay == "stats":
        cells = "".join(
            '<div class="stat rv">'
            + (f'<div class="sh">{rich(st["heading"])}</div>' if st.get("heading") else "")
            + f'<div class="sv" data-fit="figure">{number_html(st.get("value"))}</div>'
            + f'<div class="sl">{rich(st.get("label"))}</div>'
            + (f'<div class="sn">{rich(st["note"])}</div>' if st.get("note") else "")
            + "</div>"
            for st in s.get("stats", [])
        )
        lead = f'<p class="stats-lead rv" data-role="summary">{rich(s["lead"])}</p>' if s.get("lead") else ""
        return f'<div class="stats-page" data-fit-group="figure">{lead}<div class="stats-row" style="--n:{len(s.get("stats", []))}">{cells}</div>{foot_note}</div>'
    if lay == "bullets":
        lis = "".join(f'<li class="rv">{rich(x)}</li>' for x in s.get("items", []))
        return f'<div><ul class="bullets">{lis}</ul>{foot_note}</div>'
    if lay == "steps":
        items = s.get("items", [])

        def step(i, x):
            if isinstance(x, dict):
                d = f'<span class="d">{rich(x["detail"])}</span>' if x.get("detail") else ""
                return f'<li class="rv"><span class="n">{i:02d}</span><span class="t">{rich(x.get("label"))}</span>{d}</li>'
            return f'<li class="rv"><span class="n">{i:02d}</span><span class="t">{rich(x)}</span></li>'

        return f'<div><ol class="steps" style="--n:{len(items)}">{"".join(step(i, x) for i, x in enumerate(items, 1))}</ol>{foot_note}</div>'
    if lay == "compare":
        def col(side):
            v = s.get(side) or {}
            lis = "".join(f"<li>{rich(x)}</li>" for x in v.get("items", []))
            return f'<div class="col rv"><h3>{rich(v.get("heading"))}</h3><ul>{lis}</ul></div>'

        return f'<div><div class="compare">{col("left")}{col("right")}</div>{foot_note}</div>'
    if lay == "lanes":
        stages = [x for x in s.get("stages", []) if isinstance(x, dict)]
        names = list(s.get("lanes") or []) + ["原本", "現在"]

        def lane(i, x):
            old = "".join(f"<li>{rich(o)}</li>" for o in x.get("before", []))
            d = f'<span class="d">{rich(x["detail"])}</span>' if x.get("detail") else ""
            ch = f'<div class="lc">{rich(x["change"])}</div>' if x.get("change") else '<div class="lc"></div>'
            return f'<div class="lane rv"><ul class="lo">{old}</ul>{ch}<div class="ln"><span class="n">{i + 1:02d}</span><span class="t">{rich(x.get("after"))}</span>{d}</div></div>'

        return (
            f'<div><div class="lanes" style="--n:{len(stages)}">'
            f'<div class="ll">{rich(names[0])} / {rich(names[1])}</div>'
            f'{"".join(lane(i, x) for i, x in enumerate(stages))}</div>{foot_note}</div>'
        )
    if lay == "timeline":
        events = s.get("events", [])

        def ev(x):
            x = x if isinstance(x, dict) else {"label": x}
            d = f'<span class="d">{rich(x["detail"])}</span>' if x.get("detail") else ""
            return f'<li class="rv"><span class="w">{rich(x.get("when", ""))}</span><span class="t">{rich(x.get("label"))}</span>{d}</li>'

        return f'<div><ol class="tl" style="--n:{len(events)}">{"".join(ev(x) for x in events)}</ol>{foot_note}</div>'
    if lay == "table":
        cols, rows = s.get("columns", []), s.get("rows", [])
        is_num = lambda c: bool(CELL_NUM_RE.match(EMPH_RE.sub(r"\1", str(c)).strip()))  # noqa: E731
        numeric = [bool(rows) and all(i < len(r) and is_num(r[i]) for r in rows) for i in range(len(cols))]
        cls = lambda i: ' class="num"' if i < len(numeric) and numeric[i] else ""  # noqa: E731
        head = "".join(f"<th{cls(i)}>{rich(c)}</th>" for i, c in enumerate(cols))
        body = "".join("<tr class='rv'>" + "".join(f"<td{cls(i)}>{rich(c)}</td>" for i, c in enumerate(r)) + "</tr>" for r in rows)
        return f'<div><table class="tbl"><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>{foot_note}</div>'
    if lay == "quote":
        src = f'<cite class="rv">{rich(s["source"])}</cite>' if s.get("source") else ""
        return f'<blockquote class="quote"><p class="rv">{rich(s.get("text"))}</p>{src}</blockquote>'
    if lay == "image":
        cap = f'<p class="caption rv">{rich(s["caption"])}</p>' if s.get("caption") else ""
        return f'<div class="image"><div class="img rv"><img src="{esc(s.get("src"))}" alt="{esc(s.get("alt", ""))}"></div>{cap}</div>'
    if s.get("summary"):
        return f'<div class="point"><p class="key rv" data-role="summary">{rich(s["summary"])}</p>{foot_note}</div>'
    return ""


def static_nav(chapters, chi, tab, tabs, sources):
    labels = "".join(f'<span class="{"on" if i == chi else ""}">{esc(c["label"])}</span>' for i, c in enumerate(chapters))
    tabs_html = ""
    if tabs > 2 and sources:
        tabs_html = '<div class="stabs">' + "".join(
            f'<span class="{"on" if i == tab else ""}">{esc(src.get("tab") or src.get("title"))}</span>'
            for i, src in enumerate(sources)
        ) + "</div>"
    return f'<div class="snav"><div class="slabels">{labels}</div>{tabs_html}</div>'


def render_component_slide(rec, data, idx, total, ch_sources):
    s, kind = rec["src"] or {}, rec["kind"]
    meta, chapters = data["meta"], data["chapters"]
    notes = esc(s.get("notes", ""))
    attrs = f'id="s-{idx}" data-kind="{kind}" data-chi="{rec["chi"]}" data-notes="{notes}"'
    back = ""
    if rec.get("appendix"):
        attrs += f' data-appendix="1" data-id="{esc(s.get("id"))}"'
        back = '<button class="back" type="button">← 返回</button>'
    pageno = f'<div class="pageno">{"附件" if rec.get("appendix") else f"{idx:02d}"}</div>'
    foot = f'<footer class="foot"><span class="pg">{"附件" if rec.get("appendix") else f"{idx:02d} / {total:02d}"}</span></footer>'
    more = f'<button class="more-btn" type="button" data-link="{esc(s["link"])}">看細節 →</button>' if s.get("link") else ""

    if kind == "status":
        cont = "（續）" if s.get("continued") else ""
        return (
            f'<section class="slide status" {attrs}>{back}<header class="st-head">'
            f'<h2 class="title" data-role="title">{esc(s.get("title"))}{cont}</h2>'
            f'<div class="legend"><span><i class="st-done"></i>已完成</span><span><i class="st-doing"></i>進行中</span>'
            f'<span><i class="st-target"></i>目標</span><span class="dot dot-red"></span>需介入'
            f'<span class="dot dot-yellow"></span>注意<span class="dot dot-green"></span>正常</div></header>'
            f'<div class="st-body">{render_status_table(s)}</div>{source_line(s)}{pageno}</section>'
        )

    if kind == "overview":
        motion = motion_for(data["structure"])
        kicker = f'<div class="ov-kicker rv">{esc(s.get("title"))}</div>' if s.get("title") else ""
        return (
            f'<section class="slide overview" {attrs}>{back}<header class="ov-head">{kicker}'
            f'<h2 class="ov-headline rv">{rich(s.get("headline"))}</h2></header>'
            f'{render_pillars(s, motion)}{source_line(s)}{more}</section>'
        )

    if kind == "cover":
        who = esc(meta.get("presenter") or "")
        has_who = bool(who or meta.get("date"))
        route = (
            (f'<div class="who"><i>{esc(meta.get("date", ""))}</i>{who}</div>' if has_who else "")
            + "".join(f'<div><i>{i + 1:02d}</i>{esc(c["label"])}</div>' for i, c in enumerate(chapters))
        )
        parts = [
            f'<h1 class="cover-title rv" data-fit="phrase">{display(meta.get("title"))}</h1>',
            f'<p class="cover-sub rv">{rich(meta.get("subtitle"))}</p>' if meta.get("subtitle") else "",
        ]
        kicker = f'<div class="kicker rv">{esc(meta.get("kicker"))}</div>' if meta.get("kicker") else ""
        return (
            f'<section class="slide cmp cover" {attrs}>{kicker}<div class="cover-inner">{"".join(parts)}</div>'
            f'<div class="route rv{"" if has_who else " no-who"}" style="--n:{len(chapters)}">{route}</div></section>'
        )

    if kind == "toc":
        lis = "".join(
            f'<li class="{"on" if rec["chi"] in (-1, i) else "off"}"><span class="i">{i + 1:02d}</span>'
            f'<span class="l">{esc(c["label"])}</span></li>'
            for i, c in enumerate(chapters)
        )
        return f'<section class="slide toc" {attrs}><ol class="toc-list">{lis}</ol></section>'

    if kind == "shock":
        sub = f'<p class="shock-sub">{rich(s["sub"])}</p>' if s.get("sub") else ""
        return (
            f'<section class="slide cmp shock" {attrs}><div class="shock-inner">'
            f'<p class="shock-text" data-fit="phrase" data-role="shock">{display(s.get("text"))}</p>{sub}</div>{source_line(s)}</section>'
        )

    if kind == "closing":
        sub = f'<p class="closing-sub rv">{rich(s["sub"])}</p>' if s.get("sub") else ""
        return (
            f'<section class="slide cmp closing" {attrs}><div class="closing-inner">'
            f'<p class="closing-text rv" data-fit="phrase">{display(s.get("text", ""))}</p>{sub}</div></section>'
        )

    # content fallback component
    snav = static_nav(chapters, rec["chi"], rec.get("tab", 0), rec.get("tabs", 1), ch_sources[rec["chi"]] if 0 <= rec["chi"] < len(ch_sources) else [])
    tabbed = " tabbed" if rec.get("tabs", 1) > 2 else ""
    attrs += f' data-tab="{rec.get("tab", 0)}" data-tabs="{rec.get("tabs", 1)}"'
    return (
        f'<section class="slide cmp content layout-{esc(s.get("layout", "free"))}{tabbed}" {attrs}>{back}{snav}'
        f'<header class="slide-head"><h2 class="title" data-role="title">{esc(s.get("title"))}</h2></header>'
        f'<div class="body">{render_fallback_layout(s)}</div>'
        f'{"" if s.get("layout") == "quote" else source_line(s)}{more}{foot}</section>'
    )


# ----------------------------------------------------------------------------- deck assembly
SHELL_CSS = (ASSETS_DIR / "shell.css").read_text(encoding="utf-8")
COMPONENTS_CSS = (ASSETS_DIR / "components.css").read_text(encoding="utf-8")
RUNTIME_JS = (ASSETS_DIR / "runtime.js").read_text(encoding="utf-8")
FIT_JS = (ASSETS_DIR / "fit.js").read_text(encoding="utf-8")

PAGE_TPL = """<!doctype html>
<html lang="{lang}" data-shape="{shape}" data-motion="{motion}" data-format="{fmt}" data-style="{style}" data-mode="{mode}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
{fonts}
<style>
{shell_css}
{components_css}
{deck_css}
{slide_css}
</style>
</head>
<body>
<div id="viewport"><div id="stage">
<div id="nav"></div><div id="tabs"></div>
{slides}
<div id="morph-layer" aria-hidden="true"></div>
<div id="curtain"></div>
</div></div>
<div id="notes"></div>
<div id="toast" role="status" aria-live="polite"></div>
<div id="hint">← → 翻頁 · F 全螢幕 · N 備註 · B 靜態 · P 列印</div>
<script>window.DECK={deck_json};</script>
<script>{slide_js}</script>
<script>{runtime_js}</script>
<script>{fit_js}</script>
</body>
</html>
"""


def assemble_deck(data, base_dir):
    meta = data["meta"]
    records = expand(data)
    ids = [c["id"] for c in data["chapters"]]
    ch_sources = [
        [
            s for s in main_slides(data)
            if s.get("type", "content") == "content"
            and s.get("chapter") == cid
            and s.get("layout") not in ("pillars", "status-table")
        ]
        for cid in ids
    ]
    total = sum(1 for r in records if not r.get("appendix"))

    deck_css = ""
    css_path = base_dir / (meta.get("style_css") or "deck.css")
    if css_path.exists():
        deck_css = css_path.read_text(encoding="utf-8")

    slides_html, slide_css_parts, slide_js_parts, font_sources = [], [], [], [deck_css]
    found_slots = []
    free_count = 0

    for idx, rec in enumerate(records, 1):
        frag = find_fragment(rec, idx, base_dir)
        if frag is not None:
            free_count += 1
            s_html, s_css, s_js, raw = load_free_slide(frag, rec, data, idx, base_dir, found_slots)
            slides_html.append(s_html)
            if s_css:
                slide_css_parts.append(s_css)
            if s_js:
                slide_js_parts.append(s_js)
            font_sources.append(raw)
        else:
            slides_html.append(render_component_slide(rec, data, idx, total, ch_sources))

    motion = motion_for(data["structure"])
    deck_json = {
        "title": re.sub(r"==", "", str(meta.get("title", "Deck"))),
        "style": str(meta.get("style") or meta.get("theme") or ""),
        "mode": str(meta.get("mode") or ""),
        "chapters": [c["label"] for c in data["chapters"]],
        "tabs": [
            [(s.get("tab") or s.get("title")) for s in ch_sources[i]]
            for i in range(len(data["chapters"]))
        ],
        "motion": motion,
    }

    html_out = PAGE_TPL.format(
        lang=esc(meta.get("lang", "zh-Hant")),
        shape=toc_shape(motion),
        motion=motion,
        fmt=esc(meta.get("format", "deck")),
        style=esc(meta.get("style") or meta.get("theme") or ""),
        mode=esc(meta.get("mode") or ""),
        title=esc(deck_json["title"]),
        fonts=collect_fonts(*font_sources),
        shell_css=SHELL_CSS,
        components_css=COMPONENTS_CSS,
        deck_css=deck_css,
        slide_css="\n".join(slide_css_parts),
        slides="\n".join(slides_html),
        deck_json=json.dumps(deck_json, ensure_ascii=False),
        slide_js="\n".join(slide_js_parts),
        runtime_js=RUNTIME_JS,
        fit_js=FIT_JS,
    )
    return html_out, {"total": len(records), "free": free_count, "component": len(records) - free_count, "slots": found_slots}


# ----------------------------------------------------------------------------- Gate 2 comparison sheet builder
def build_sheet(samples_dir, out_path, title_override=None):
    samples_dir = Path(samples_dir).resolve()
    manifest_path = samples_dir / "manifest.json"
    title = title_override or "風格樣張對照（Gate 2）"
    subtitle = "同一份真實簡報內容，依不同風格憲法與主題配色編排。每組 2–3 頁並排比較，點選最對味的方向（或指定調整明暗／配色）。"
    groups = []

    if manifest_path.exists():
        man = json.loads(manifest_path.read_text(encoding="utf-8"))
        title = title_override or man.get("title", title)
        subtitle = man.get("subtitle", subtitle)
        groups = man.get("groups", [])
    else:
        htmls = sorted(p for p in samples_dir.glob("*.html") if p.name != "sheet.html")
        if not htmls:
            raise StoryboardError(f"{samples_dir} 裡沒有找到任何樣張 HTML 檔。")
        groups = [{"heading": "樣張總覽", "note": "", "items": [{"file": p.name, "caption": p.stem} for p in htmls]}]

    parts = [
        '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">',
        f"<title>{esc(title)}</title>",
        FONT_PRECONNECT + '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&display=swap" rel="stylesheet">',
        "<style>"
        "*{box-sizing:border-box;margin:0;padding:0}"
        'body{width:2000px;background:#ECEAE4;color:#1C1D20;font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;padding:44px 44px 56px}'
        "h1{font-weight:900;font-size:40px;line-height:1.2}p.sub{margin-top:10px;font-weight:400;font-size:21px;line-height:1.5;color:#52555C}"
        "section.grp{margin-top:36px}section.grp h2{font-weight:900;font-size:26px;line-height:1.25;display:flex;align-items:baseline;gap:14px}"
        "section.grp h2 span.note{font-weight:400;font-size:19px;line-height:1.3;color:#5A5D64}"
        ".row{margin-top:14px;display:grid;grid-template-columns:repeat(var(--cols,3),minmax(0,1fr));gap:20px}"
        "figure{background:#fff;border:1px solid #CFCAC0;padding:10px;border-radius:4px}"
        "figure img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:#1A1B1E}"
        "figcaption{margin-top:10px;font-weight:700;font-size:19px;line-height:1.35;color:#2A2C30}"
        "figcaption small{display:block;margin-top:4px;font-weight:400;font-size:16px;line-height:1.4;color:#5E6168}"
        "</style></head><body>",
        f"<h1>{esc(title)}</h1><p class='sub'>{esc(subtitle)}</p>",
    ]
    for g in groups:
        items = g.get("items") or []
        cols = min(3, max(1, len(items)))
        note = f'<span class="note">{esc(g.get("note", ""))}</span>' if g.get("note") else ""
        parts.append(f'<section class="grp"><h2>{esc(g.get("heading", ""))}{note}</h2><div class="row" style="--cols:{cols}">')
        for it in items:
            fname = it["file"]
            stem = Path(fname).stem
            cap = esc(it.get("caption", stem))
            desc = f"<small>{esc(it['detail'])}</small>" if it.get("detail") else ""
            parts.append(f'<figure><img src="img/{esc(stem)}.jpg" alt="{cap}"><figcaption>{cap}{desc}</figcaption></figure>')
        parts.append("</div></section>")
    parts.append("</body></html>")

    out_path.write_text("\n".join(parts), encoding="utf-8")
    return out_path


# ----------------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("target", nargs="?", help="path/to/storyboard.yaml")
    ap.add_argument("--sheet", help="build Gate 2 comparison sheet.html for a samples directory")
    ap.add_argument("--title", help="optional title override for --sheet")
    ap.add_argument("--out", help="output HTML path")
    ap.add_argument("--force", action="store_true", help="assemble even if lint reports errors")
    ap.add_argument("--write-upgrade-list", action="store_true", help="write/refresh IMAGE_UPGRADE.md scaffold for data-slot elements")
    a = ap.parse_args()

    if a.sheet:
        sdir = Path(a.sheet).resolve()
        out = Path(a.out) if a.out else sdir / "sheet.html"
        try:
            build_sheet(sdir, out, a.title)
        except StoryboardError as e:
            sys.exit(f"[ERROR] {e}")
        print(f"已輸出樣張對照頁：{out}")
        return

    if not a.target:
        ap.print_help()
        sys.exit(2)

    try:
        data = load(a.target)
    except StoryboardError as e:
        sys.exit(f"[ERROR] {e}")

    errors, warnings, infos = lint(data)
    for line in errors + warnings + infos:
        print(line)
    if errors and not a.force:
        sys.exit("\nlint 有錯誤，未組裝。修正 storyboard 後重試（或加 --force 強制組裝）。")

    base = Path(a.target).resolve().parent
    out = Path(a.out) if a.out else base / "deck.html"
    try:
        html_out, stats = assemble_deck(data, base)
    except StoryboardError as e:
        sys.exit(f"[ERROR] {e}")

    out.write_text(html_out, encoding="utf-8")
    print(f"\n已組裝：{out}（共 {stats['total']} 頁：自由畫布 {stats['free']} 頁、商務／自動元件 {stats['component']} 頁）")
    if stats["slots"]:
        upgraded = [x for x in stats["slots"] if x["upgraded"]]
        pending = [x for x in stats["slots"] if not x["upgraded"]]
        print(f"圖像插槽：共 {len(stats['slots'])} 個（已換上升級圖 {len(upgraded)} 個，使用零等待程式版 {len(pending)} 個）")
        if a.write_upgrade_list:
            up_path = base / "IMAGE_UPGRADE.md"
            lines = [
                "# 可選 AI 升級生圖清單（IMAGE_UPGRADE）",
                "",
                "目前簡報已可完整播放（零等待程式版）。若想把以下插槽升級成更精緻的 AI 生圖或真實照片，請將 **16:9、1920×1080 以上、無文字** 的圖檔放進 `assets/`，再重跑 `assemble.py` 與 `check.mjs` 即可無縫替換，文字層與動態皆自動保留。",
                "",
                "| 插槽檔名（放 `assets/`） | 明暗 | 目前狀態 | 建議提示詞與留白區 |",
                "|---|---|---|---|",
            ]
            for x in stats["slots"]:
                status = f"已升級（`{x['upgraded']}`）" if x["upgraded"] else "程式版運作中（可選升級）"
                suffix = f"-{x['mode']}" if x["mode"] else ""
                lines.append(f"| `{x['slot']}{suffix}.png`（或 `{x['slot']}.png`） | {x['mode'] or '—'} | {status} | （請依該頁內容與風格憲法補齊構圖留白、色碼與無字提示詞） |")
            up_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
            print(f"已產出升級清單草稿：{up_path}")


if __name__ == "__main__":
    main()
