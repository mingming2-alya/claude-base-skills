#!/usr/bin/env python3
"""Zero-context-bloat atomic CLI for decks/<name>/fragments.md (deck-architect v5.1).

Prevents O(R^2) main-context token growth across multi-round Grill sessions:
the main consultant agent appends verbatim user thoughts without reading/rewriting
the entire file in its own context window, while still preserving any manual edits
made by the user on disk between rounds.

Usage:
  python3 fragments.py add  path/to/fragments.md [--title "暫定標題"] "原話想法一" ["原話想法二" ...]
  python3 fragments.py star path/to/fragments.md 1 4
  python3 fragments.py list path/to/fragments.md
"""
import re
import sys

sys.dont_write_bytecode = True
from pathlib import Path  # noqa: E402

ENTRY_RE = re.compile(r"(?m)^#(\d+)\b(.*)$")
PLACEHOLDER_ENTRY_RE = re.compile(r"(?ms)^#\d+\s*<[^>\n]+>\s*(?:\n+---\s*)?")

DEFAULT_HEADER = """# 素材碎片簿：{title}

> 只收有機會活進最終簡報的使用者原話、案例、場景、數字、痛點與比喻（不收流程選項與題號代碼）。
> 由 `scripts/fragments.py` 每次從磁碟重讀後原子追加，完整保留使用者手動編輯。
"""


def _read_or_init(path: Path, title: str | None = None) -> str:
    effective_title = title or "未命名簡報"
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        return DEFAULT_HEADER.format(title=effective_title).rstrip() + "\n"
    raw = path.read_text(encoding="utf-8")
    if title:
        raw = raw.replace("<簡報暫定標題>", title)
    # Strip unfilled template placeholder items if file was copied from templates/fragments.md
    cleaned = PLACEHOLDER_ENTRY_RE.sub("", raw)
    return cleaned.rstrip() + "\n"


def _parse_entries(text: str):
    """Return list of (num: int, full_body: str) in file order."""
    matches = list(ENTRY_RE.finditer(text))
    entries = []
    for idx, m in enumerate(matches):
        start = m.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
        chunk = text[start:end]
        chunk = re.sub(r"\n+---\s*$", "", chunk.strip()).strip()
        first_line = (m.group(2) or "").strip()
        full = (first_line + ("\n" + chunk if chunk else "")).strip()
        entries.append((int(m.group(1)), full))
    return entries


def cmd_add(args):
    if not args:
        sys.exit("用法：python3 fragments.py add path/to/fragments.md [--title '標題'] '原話1' ['原話2' ...]")
    path = Path(args[0])
    rest = args[1:]
    title = None
    items = []
    i = 0
    while i < len(rest):
        if rest[i] == "--title" and i + 1 < len(rest):
            title = rest[i + 1].strip() or None
            i += 2
        else:
            val = rest[i].strip()
            if val:
                items.append(val)
            i += 1
    if not items:
        sys.exit("[WARN] 沒有提供要追加的碎片內容。")

    content = _read_or_init(path, title=title)
    existing = _parse_entries(content)
    next_id = max((n for n, _ in existing), default=0) + 1

    has_entries = len(existing) > 0
    blocks = []
    added_ids = []
    for item in items:
        # Strip accidental leading "#N" if caller passed one
        item_clean = re.sub(r"^#\d+\s*", "", item).strip()
        if not item_clean:
            continue
        blocks.append(f"#{next_id} {item_clean}")
        added_ids.append(f"#{next_id}")
        next_id += 1

    if not blocks:
        sys.exit("[WARN] 過濾空白後無有效碎片。")

    sep = "\n\n---\n\n" if has_entries else "\n"
    updated = content.rstrip() + sep + "\n\n---\n\n".join(blocks) + "\n"
    path.write_text(updated, encoding="utf-8")
    total = len(existing) + len(added_ids)
    print(f"[OK] {path.name}：已追加 {', '.join(added_ids)}（目前共 {total} 則）")


def cmd_star(args):
    if len(args) < 2:
        sys.exit("用法：python3 fragments.py star path/to/fragments.md <編號1> [<編號2> ...]")
    path = Path(args[0])
    if not path.is_file():
        sys.exit(f"[ERROR] 找不到 {path}")
    target_ids = set()
    for tok in args[1:]:
        for m in re.findall(r"\d+", tok):
            target_ids.add(int(m))
    if not target_ids:
        sys.exit("[ERROR] 請提供至少一個碎片編號（例如：1 3）。")

    raw = path.read_text(encoding="utf-8")

    def _repl(m):
        num = int(m.group(1))
        rest = m.group(2) or ""
        if num in target_ids and "⭐" not in rest:
            return f"#{num} ⭐{rest if rest.startswith(' ') else ' ' + rest}"
        return m.group(0)

    updated = ENTRY_RE.sub(_repl, raw)
    path.write_text(updated, encoding="utf-8")
    parsed = _parse_entries(updated)
    existing_ids = {n for n, _ in parsed}
    missing = sorted(target_ids - existing_ids)
    starred = [f"#{n} {txt.splitlines()[0][:60]}" for n, txt in parsed if n in target_ids]
    msg = f"[OK] 已標記重點碎片 ⭐（{len(starred)} 則）：" + " ｜ ".join(starred)
    if missing:
        msg += f"（[WARN] 找不到編號：{', '.join(f'#{m}' for m in missing)}）"
    print(msg)


def cmd_list(args):
    if len(args) != 1:
        sys.exit("用法：python3 fragments.py list path/to/fragments.md")
    path = Path(args[0])
    if not path.is_file():
        print(f"[INFO] {path} 尚未建立（共 0 則）。")
        return
    entries = _parse_entries(path.read_text(encoding="utf-8"))
    print(f"# {path.name}（共 {len(entries)} 則）")
    for num, body in entries:
        one_line = re.sub(r"\s+", " ", body).strip()
        if len(one_line) > 110:
            one_line = one_line[:107] + "…"
        print(f"- #{num} {one_line}")


def main():
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print(__doc__.strip())
        sys.exit(0)
    sub = sys.argv[1].lower()
    rest = sys.argv[2:]
    if sub == "add":
        cmd_add(rest)
    elif sub == "star":
        cmd_star(rest)
    elif sub == "list":
        cmd_list(rest)
    else:
        sys.exit(f"[ERROR] 不認得的子指令：{sub!r}（可用：add / star / list）")


if __name__ == "__main__":
    main()
