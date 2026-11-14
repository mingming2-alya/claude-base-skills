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
}

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
                if k in ("notes", "src", "chapter", "layout", "type", "tab"):
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
                    if s.get("type", "content") == "content" and s.get("layout") != "pillars")
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
