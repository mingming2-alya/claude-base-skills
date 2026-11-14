"""Shared model for deck-architect: load a storyboard and describe its rules.

Used by lint.py and build.py so both agree on what a storyboard means.
"""
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML is required: pip install pyyaml")

# axis -> (kind, chapter-change motion)
AXES = {
    "time": ("neutral", "horizontal"),
    "process": ("neutral", "horizontal"),
    "causal": ("neutral", "horizontal"),
    "abstraction": ("neutral", "vertical"),
    "importance": ("value", "vertical"),
    "scale": ("neutral", "zoom"),
    "distance": ("neutral", "zoom"),
    "intensity": ("value", "horizontal"),
    "custom": ("neutral", "horizontal"),
}

LAYOUTS = {
    "point": ["key"],
    "bullets": ["items"],
    "number": ["value", "label"],
    "compare": ["left", "right"],
    "steps": ["items"],
    "quote": ["text"],
    "image": ["src"],
    "pillars": ["headline", "pillars"],
    "status-table": ["stages", "groups"],
    "stats": ["stats"],
    "timeline": ["events"],
    "table": ["columns", "rows"],
}

# Layout library: every arrangement of every layout. Style (themes/*.css) never decides layout;
# a slide picks one with `variant:` (a name, or a list of candidates whose first entry is used).
# The first name of each list is the default. See references/layouts.md for when to use which.
VARIANTS = {
    "point": ["plain", "offset", "split", "band", "bottom", "card"],
    "number": ["side", "center", "stack", "reverse", "bottom", "evidence"],
    "stats": ["row", "ledger", "hero", "cards", "split", "tower"],
    "steps": ["row", "ledger", "vertical", "pipeline", "cycle", "pyramid", "stack", "cards"],
    "timeline": ["axis", "alternate", "vertical", "ledger"],
    "compare": ["panel", "halves", "versus", "arrow", "rows"],
    "quote": ["mark", "center", "side", "band", "giant"],
    "bullets": ["list", "split", "numbered", "grid", "cards"],
    "image": ["split", "flip", "full", "top", "frame"],
    "table": ["ledger", "stripe", "strips", "lead"],
    "cover": ["bottom", "center", "top", "split", "bands"],
    "toc": ["axis", "cards", "strips", "numeral"],
    "closing": ["bottom", "center", "split", "card"],
}

# fields each layout understands (besides the common ones); anything else is silently ignored by build
COMMON_FIELDS = {"type", "chapter", "title", "tab", "layout", "notes", "source", "link", "appendix", "id", "role",
                 "variant", "series"}
LAYOUT_FIELDS = {
    "point": {"key", "support"}, "bullets": {"items", "note"}, "number": {"value", "label", "note", "points"},
    "compare": {"left", "right", "note"}, "steps": {"items", "note"}, "quote": {"text"}, "image": {"src", "alt", "caption"},
    "pillars": {"headline", "pillars", "stagger"}, "status-table": {"summary", "stages", "groups", "continued"},
    "stats": {"stats", "lead", "note"},
    "timeline": {"events", "note"}, "table": {"columns", "rows", "note"},
}

CELL_STATES = {"done", "doing", "target", "na"}
RISK_LEVELS = {"red": 3, "yellow": 2, "green": 1}

SLIDE_TYPES = {"cover", "content", "shock", "closing"}

EMPH_RE = re.compile(r"==(.+?)==")

TRANSITION_PHRASES = [
    "接下來", "讓我們", "我們來看", "接著來看", "進入下一", "下一個部分", "了解了", "看完了",
    "next, let", "let's move", "moving on", "now let's", "next up",
]


class StoryboardError(Exception):
    pass


def load(path):
    path = Path(path)
    if not path.exists():
        raise StoryboardError(f"找不到檔案：{path}")
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except yaml.YAMLError as e:
        raise StoryboardError(f"YAML 格式錯誤：{e}")
    if not isinstance(data, dict):
        raise StoryboardError("storyboard 頂層必須是 mapping（meta / structure / chapters / slides）")
    data.setdefault("meta", {})
    data.setdefault("structure", {})
    data.setdefault("chapters", [])
    data.setdefault("slides", [])
    for s in data["slides"]:
        if isinstance(s, dict):
            s.setdefault("type", "content")
    return data


def slide_texts(s):
    """All human-visible text strings on a slide (for counting / phrase checks)."""
    out = []

    def walk(v):
        if isinstance(v, str):
            out.append(v)
        elif isinstance(v, list):
            for x in v:
                walk(x)
        elif isinstance(v, dict):
            for k, x in v.items():
                if k in ("notes", "src", "chapter", "layout", "type", "tab", "source", "id", "link", "appendix", "role",
                         "variant", "series", "bar"):
                    continue
                walk(x)

    walk({k: v for k, v in s.items() if k not in ("notes",)})
    return out


def emphasis_count(s):
    n = sum(len(EMPH_RE.findall(t)) for t in slide_texts(s))
    if s.get("type", "content") == "content" and s.get("layout") == "point":
        key = s.get("key") or ""
        if key and not EMPH_RE.search(key):
            n += 1  # whole key counts as the emphasis
    return n


def toc_mode(data):
    """How chapter navigation pages are inserted.

    per-chapter: > 3 chapters and on average >= 2 content pages each -> a TOC highlight page before every chapter
    agenda:      > 3 chapters but short chapters -> a single agenda page after the cover
    none:        <= 3 chapters -> the persistent chapter bar is enough
    """
    chapters = data.get("chapters") or []
    if len(chapters) <= 3 or (data.get("meta") or {}).get("format") == "section":
        return "none"
    n_content = sum(1 for s in main_slides(data)
                    if s.get("type", "content") == "content" and s.get("layout") not in ("pillars", "status-table"))
    return "per-chapter" if n_content / len(chapters) >= 2 else "agenda"


def page_count(data):
    """Pages the built deck will have, including automatic TOC pages."""
    n = len(main_slides(data))
    mode = toc_mode(data)
    if mode == "per-chapter":
        n += len(data.get("chapters") or [])
    elif mode == "agenda":
        n += 1
    return n


def main_slides(data):
    """Slides in the linear flow (appendix pages excluded)."""
    return [s for s in data.get("slides") or [] if isinstance(s, dict) and not s.get("appendix")]


def visible_len(text):
    return len(EMPH_RE.sub(r"\1", text))


# ----------------------------------------------------------------------------- layout variants
def layout_key(s):
    """Which entry of VARIANTS a slide uses: its layout for content pages, else its type."""
    t = s.get("type", "content")
    return s.get("layout") if t == "content" else t


def variant_options(s):
    """The variant names written on a slide, as a list (empty when none was written)."""
    v = s.get("variant")
    if v is None:
        return []
    return [str(x) for x in v] if isinstance(v, list) else [str(v)]


def variant_of(s):
    """The variant a slide is built with: the first one written, else the layout's default."""
    opts = variant_options(s)
    names = VARIANTS.get(layout_key(s)) or []
    if opts and opts[0] in names:
        return opts[0]
    return names[0] if names else ""


def variant_problems(s, v=None):
    """Why this slide's content does not fit a variant (empty list = it fits).

    These are capacity rules: an arrangement only works for a certain amount and shape of content.
    """
    key, v = layout_key(s), v or variant_of(s)
    out = []
    n_items = len(s.get("items") or [])
    if key == "point" and v in ("split", "band") and not s.get("support"):
        out.append(f"point 的 {v} 排法需要 support（另一半或橫帶要有內容）")
    if key == "number" and v == "evidence" and not 2 <= len(s.get("points") or []) <= 3:
        out.append("number 的 evidence 排法需要 points：2–3 條佐證")
    if key == "stats":
        stats = s.get("stats") or []
        if v == "tower" and not all(isinstance(x, dict) and isinstance(x.get("bar"), (int, float)) and 0 <= x["bar"] <= 100
                                    for x in stats):
            out.append("stats 的 tower 排法需要每個數字都有 bar（0–100，決定柱子高度）")
        if v == "split" and not s.get("lead"):
            out.append("stats 的 split 排法需要 lead（左邊的大字陳述）")
        if v == "hero" and len(stats) < 2:
            out.append("stats 的 hero 排法至少要 2 個數字")
    if key == "steps":
        limits = {"cycle": (4, 4), "pyramid": (3, 5), "pipeline": (2, 5), "cards": (2, 4), "stack": (2, 5),
                  "ledger": (2, 6), "vertical": (2, 6), "row": (2, 5)}
        lo, hi = limits.get(v, (1, 99))
        if not lo <= n_items <= hi:
            out.append(f"steps 的 {v} 排法適合 {lo}–{hi} 步" if lo != hi else f"steps 的 {v} 排法只能剛好 {lo} 步")
    if key == "timeline":
        n = len(s.get("events") or [])
        hi = {"axis": 5, "alternate": 6, "vertical": 6, "ledger": 6}.get(v, 6)
        if not 3 <= n <= hi:
            out.append(f"timeline 的 {v} 排法適合 3–{hi} 個節點")
    if key == "compare" and v == "rows":
        a = len((s.get("left") or {}).get("items") or [])
        b = len((s.get("right") or {}).get("items") or [])
        if a != b:
            out.append("compare 的 rows 排法是逐列對照，左右兩邊的條數要一樣")
    if key == "bullets":
        if v == "grid" and n_items not in (2, 4, 6):
            out.append("bullets 的 grid 排法適合 2、4 或 6 條（其他數量會留下空格）")
        if v == "cards" and not 2 <= n_items <= 4:
            out.append("bullets 的 cards 排法適合 2–4 條")
    if key == "table":
        rows = s.get("rows") or []
        if len(s.get("columns") or []) > 6 or len(rows) > 7:
            out.append("table 最多 6 欄、7 列；更多請拆頁或放附件")
        if v == "strips" and len(rows) > 5:
            out.append("table 的 strips 排法最多 5 列")
        if v == "lead" and len(s.get("columns") or []) > 4:
            out.append("table 的 lead 排法把左邊讓給說明，表格最多 4 欄")
    if key == "closing" and v == "split" and not 1 <= len(s.get("points") or []) <= 3:
        out.append("closing 的 split 排法需要 points：1–3 條帶走的重點")
    return out


# short Chinese names, shown on the layout-options page and in references/layouts.md
VARIANT_ZH = {
    "point": {"plain": "靠左大字", "offset": "左側留白", "split": "左右分半", "band": "底部橫帶", "bottom": "貼底大字", "card": "置中紙卡"},
    "number": {"side": "數字在左", "center": "全部置中", "stack": "上下堆疊", "reverse": "數字在右", "bottom": "巨數貼底", "evidence": "數字＋佐證"},
    "stats": {"row": "橫排", "ledger": "直向帳單", "hero": "一大多小", "cards": "數字卡", "split": "陳述＋四格", "tower": "數據柱"},
    "steps": {"row": "橫排", "ledger": "帳簿列", "vertical": "直向軸線", "pipeline": "箭頭管線", "cycle": "四角循環", "pyramid": "金字塔",
              "stack": "左標題右堆疊", "cards": "步驟卡"},
    "timeline": {"axis": "橫軸", "alternate": "上下交替", "vertical": "直軸", "ledger": "日程帳冊"},
    "compare": {"panel": "淡對強色塊", "halves": "滿版對半", "versus": "VS 對決", "arrow": "前 → 後", "rows": "逐列對照"},
    "quote": {"mark": "引號在上", "center": "置中", "side": "右側色條", "band": "橫帶反白", "giant": "巨大引號"},
    "bullets": {"list": "清單", "split": "左標題右清單", "numbered": "編號長條", "grid": "格線方格", "cards": "卡片"},
    "image": {"split": "圖左文右", "flip": "文左圖右", "full": "滿版圖", "top": "上圖下文", "frame": "置中相框"},
    "table": {"ledger": "帳冊", "stripe": "條紋", "strips": "逐列紙條", "lead": "左說明右表"},
    "cover": {"bottom": "標題貼底", "center": "置中", "top": "標題在上", "split": "左文右路線", "bands": "章節橫帶"},
    "toc": {"axis": "依軸向", "cards": "編號卡", "strips": "編號長條", "numeral": "巨大章號"},
    "closing": {"bottom": "貼底", "center": "置中", "split": "左結語右重點", "card": "行動卡"},
}
