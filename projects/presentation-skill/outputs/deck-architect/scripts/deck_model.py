"""Shared model for deck-architect v4: load a storyboard and describe its rules.

Used by lint.py and assemble.py so both agree on what a storyboard means.
Supports both v4 free-canvas slides (slides/*.html authored by the agent from Style DNA)
and deterministic business components (status-table, pillars, toc, quick-mode fallback).
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

# Delivery mode -> (Chinese label, base content char limit, density note)
DELIVERY_MODES = {
    "talk": ("上台講", 110, "講者 30 秒內要講完"),
    "discuss": ("會議討論", 150, "邊講邊討論，資訊密度可略高"),
    "read": ("對方自己讀", 240, "沒有講者補充，可保留完整說明"),
    "auto": ("自動播放", 60, "遠距或大螢幕快速掃讀"),
}

# Content shapes (14 core + 5 chart shapes + free canvas).
# Required fields apply when a slide uses the built-in renderer; free-canvas slides (with `file:`)
# may supply structured data OR `summary`/`items`/`points` so lint can still audit text & constraints.
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
    "lanes": ["stages"],
    # v4 chart & visual content shapes (free-canvas authored by Style DNA)
    "chart-bar": ["data"],
    "chart-donut": ["data"],
    "chart-trend": ["data"],
    "chart-people": ["data"],
    "chart-map": ["data"],
    "scene": [],
    "free": [],
}

DENSE_LAYOUTS = {"status-table", "pillars", "lanes", "table"}

COMMON_FIELDS = {
    "type", "chapter", "title", "tab", "layout", "notes", "source", "link",
    "appendix", "id", "role", "variant", "series", "signature", "file",
    "component", "summary", "key", "slot", "visual", "data", "items",
    "points", "text", "sub", "surface", "nav", "transition", "director",
    "unlisted",
}

STAGE_MODES = {"briefing", "pitch", "keynote"}
NAV_MODES = {"top-bar", "minimal-side", "divider-only"}
SURFACES = {"dark", "light", "split", "photo"}
PRESENTER_TOOLS = {"grid", "annotator", "speaker"}
CONTENT_MODULES = {
    "components", "ambient-fx", "live-controls", "fit", "media",
    "flow-carousel", "coverflow", "linked-highlight", "compare-slider",
    "code-stage", "visual-flair",
    "motion-workday", "motion-counsel", "motion-apple", "motion-story",
}
FX_EFFECTS = {
    "ambient-dust", "soft-aurora", "constellation",
    "data-stream", "orbit-ring", "confetti-burst",
}


def default_presenter_tools(meta):
    """Resolve active Layer 1 presenter tools from explicit meta.presenter_tools or delivery mode."""
    meta = meta or {}
    explicit = meta.get("presenter_tools")
    if isinstance(explicit, list):
        return [str(x).strip().lower() for x in explicit if str(x).strip().lower() in PRESENTER_TOOLS]
    delivery = str(meta.get("delivery") or "talk").lower()
    if delivery in ("talk", "discuss"):
        return ["grid", "annotator", "speaker"]
    return ["grid"]

LAYOUT_FIELDS = {
    "point": {"key", "support"},
    "bullets": {"items", "note"},
    "number": {"value", "label", "note", "points"},
    "compare": {"left", "right", "note"},
    "steps": {"items", "note"},
    "quote": {"text"},
    "image": {"src", "alt", "caption"},
    "pillars": {"headline", "pillars", "stagger"},
    "status-table": {"summary", "stages", "groups", "continued"},
    "stats": {"stats", "lead", "note"},
    "timeline": {"events", "note"},
    "table": {"columns", "rows", "note"},
    "lanes": {"lanes", "stages", "note"},
    "chart-bar": {"data", "lead", "note", "threshold", "unit"},
    "chart-donut": {"data", "lead", "note", "unit"},
    "chart-trend": {"data", "lead", "note", "unit"},
    "chart-people": {"data", "lead", "note", "unit"},
    "chart-map": {"data", "lead", "note"},
    "scene": {"lead", "note", "scene_layout", "art_style"},
    "free": {"lead", "note", "support"},
}

CELL_STATES = {"done", "doing", "target", "na"}
RISK_LEVELS = {"red": 3, "yellow": 2, "green": 1}
SLIDE_TYPES = {"cover", "content", "shock", "closing"}

EMPH_RE = re.compile(r"==(.+?)==")

TRANSITION_PHRASES = [
    "接下來", "讓我們", "我們來看", "接著來看", "進入下一", "下一個部分", "了解了", "看完了",
    "next, let", "let's move", "moving on", "now let's", "next up",
]

# Strictly Simplified-only Chinese characters (none of these are standard Traditional Chinese)
SIMPLIFIED_CHARS = set(
    "这为发说们体会国学时实对个从来进过还应当与专业项质软网数据视频优关键结构页标题图颜风简报"
    "讲认组逻辑设计动画觉场检确讨论选择调围规则单状态险阶总导录签备证诺顾虑长预缓衔转声击节号"
    "间齐阴渐变圆线条钮链编辑点产经现问无机统电脑资讯营销卖买钱银价费账财绩测试验错误处决执"
    "运维护开闭启连传输载储权审领团队员织门层级类种样张档历记忆习练训课师听众读写话语词"
    "译释义艺术创华东乐欢谢请让给帮爱亲热轻难复杂细详够仅独双两万亿岁旧远边区广达环势趋极顶"
    "侧头际联码库盘栏块叠隐显换删扩缩宽竖弯断续补遗弃稳灵弹顺畅迟昼阳红绿蓝铁铜钢纸笔绘鲜"
    "艳浓浅闪辉镜灯烛烧雾龙凤鸟鱼马车飞桥径墙楼馆厂仓铺摊园乡镇县岛湾陆亚欧汉苏沪粤闽"
)


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
    data.setdefault("constraints", {})
    data.setdefault("chapters", [])
    data.setdefault("slides", [])
    for s in data["slides"]:
        if isinstance(s, dict):
            s.setdefault("type", "content")
    return data


_NON_TEXT_KEYS = {
    "notes", "src", "chapter", "layout", "type", "tab", "source", "id", "link",
    "appendix", "role", "variant", "series", "bar", "signature", "file",
    "component", "slot", "visual", "scene_layout", "art_style", "state",
    "risk", "progress", "order", "stagger", "continued", "surface", "nav",
    "transition", "director", "unlisted",
}


def slide_texts(s):
    """All human-visible text strings on a slide (for counting / phrase / constraint checks)."""
    out = []

    def walk(v):
        if isinstance(v, str):
            out.append(v)
        elif isinstance(v, list):
            for x in v:
                walk(x)
        elif isinstance(v, dict):
            for k, x in v.items():
                if k in _NON_TEXT_KEYS:
                    continue
                walk(x)

    walk({k: v for k, v in s.items() if k not in ("notes",)})
    return out


def all_slide_texts_with_notes(s):
    """Visible texts plus speaker notes (used to check whether limitations were addressed)."""
    out = slide_texts(s)
    if isinstance(s, dict) and s.get("notes"):
        out.append(str(s["notes"]))
    return out


def emphasis_count(s):
    n = sum(len(EMPH_RE.findall(t)) for t in slide_texts(s))
    if s.get("type", "content") == "content" and s.get("layout") == "point":
        key = s.get("key") or ""
        if key and not EMPH_RE.search(key):
            n += 1  # whole key counts as the emphasis
    return n


def main_slides(data):
    """Slides in the linear flow (appendix pages excluded)."""
    return [s for s in data.get("slides") or [] if isinstance(s, dict) and not s.get("appendix")]


def appendix_slides(data):
    return [s for s in data.get("slides") or [] if isinstance(s, dict) and s.get("appendix")]


def listed_chapters(data):
    """Chapters shown in cover route, automatic TOC, and persistent navigation (excludes unlisted: true surprise acts)."""
    return [c for c in (data.get("chapters") or []) if isinstance(c, dict) and not c.get("unlisted")]


def toc_mode(data):
    """How chapter navigation pages are inserted.

    per-chapter: > 3 listed chapters and on average >= 2 content pages each -> a TOC highlight page before every listed chapter
    agenda:      > 3 listed chapters but short chapters -> a single agenda page after the cover
    none:        <= 3 listed chapters -> the persistent chapter bar is enough
    """
    chapters = listed_chapters(data)
    if len(chapters) <= 3 or (data.get("meta") or {}).get("format") == "section":
        return "none"
    listed_ids = {c.get("id") for c in chapters}
    n_content = sum(
        1 for s in main_slides(data)
        if s.get("type", "content") == "content"
        and not s.get("unlisted")
        and s.get("chapter") in listed_ids
        and s.get("layout") not in ("pillars", "status-table")
    )
    return "per-chapter" if n_content / len(chapters) >= 2 else "agenda"


def page_breakdown(data):
    """Return a dict breaking down the built linear page count."""
    flow = main_slides(data)
    covers = sum(1 for s in flow if s.get("type") == "cover")
    shocks = sum(1 for s in flow if s.get("type") == "shock")
    closings = sum(1 for s in flow if s.get("type") == "closing")
    contents = sum(1 for s in flow if s.get("type", "content") == "content")
    mode = toc_mode(data)
    tocs = len(listed_chapters(data)) if mode == "per-chapter" else (1 if mode == "agenda" else 0)
    total = covers + tocs + contents + shocks + closings
    return {
        "cover": covers,
        "toc": tocs,
        "content": contents,
        "shock": shocks,
        "closing": closings,
        "total": total,
        "appendix": len(appendix_slides(data)),
    }


def page_count(data):
    """Pages the built deck will have, including automatic TOC pages (excluding appendix)."""
    return page_breakdown(data)["total"]


def visible_len(text):
    return len(EMPH_RE.sub(r"\1", text))


def char_limit_for(data):
    """Compute recommended content-slide character limit from delivery mode & pacing."""
    meta = data.get("meta") or {}
    delivery = str(meta.get("delivery") or "talk").lower()
    _, base, _ = DELIVERY_MODES.get(delivery, DELIVERY_MODES["talk"])
    minutes = meta.get("minutes")
    n_content = sum(
        1 for s in main_slides(data)
        if s.get("type", "content") in ("content", "shock")
    )
    if delivery == "talk" and isinstance(minutes, (int, float)) and minutes > 0 and n_content > 0:
        min_per_slide = minutes / n_content
        if min_per_slide >= 2.0:
            return int(base * 1.35)  # ~148 chars when speaker spends >=2 min/slide
        if min_per_slide <= 1.0:
            return int(base * 0.85)  # ~93 chars when fast-paced
    return base


def layout_key(s):
    t = s.get("type", "content")
    return s.get("layout") if t == "content" else t


def capacity_problems(s):
    """Content-shape capacity rules (style-agnostic)."""
    key = layout_key(s)
    out = []
    n_items = len(s.get("items") or [])
    if key == "stats":
        stats = s.get("stats") or []
        if not 2 <= len(stats) <= 4:
            out.append("stats 需要 2–4 個數字，每個有 value 與 label")
    if key in ("bullets", "steps") and n_items > 5 and not s.get("file"):
        out.append(f"{key} 有 {n_items} 條，超過 5 條，建議拆頁或合併")
    if key == "timeline":
        n = len(s.get("events") or [])
        if n and not 2 <= n <= 6:
            out.append(f"timeline 有 {n} 個節點，建議 3–6 個")
    if key == "table":
        rows = s.get("rows") or []
        if len(s.get("columns") or []) > 6 or len(rows) > 7:
            out.append("table 最多 6 欄、7 列；更多請拆頁或放附件")
    if key == "lanes":
        stages = s.get("stages") or []
        if stages and not 2 <= len(stages) <= 6:
            out.append(f"lanes 適合 2–6 段（目前 {len(stages)} 段）")
        if any(len((x or {}).get("before") or []) > 5 for x in stages if isinstance(x, dict)):
            out.append("lanes 每一段的 before 最多 5 條")
    if key == "chart-donut":
        d = s.get("data") or []
        if isinstance(d, list) and len(d) > 5:
            out.append("圓環／圓餅圖不建議超過 5 片，將小項合併為「其他」")
    return out
