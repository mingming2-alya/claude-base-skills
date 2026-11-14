#!/usr/bin/env python3
"""Lint a deck-architect storyboard against the structure and presentation rules.

Usage: python3 lint.py path/to/storyboard.yaml [--json]

Exit code 0 = no errors (warnings allowed), 1 = errors found, 2 = could not read file.
Every message says what is wrong AND what to do about it, so the agent can fix it directly.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from deck_model import (AXES, EMPH_RE, LAYOUTS, SLIDE_TYPES, TRANSITION_PHRASES,  # noqa: E402
                        StoryboardError, emphasis_count, load, slide_texts, visible_len)

CJK = re.compile(r"[㐀-鿿]")
LATIN = re.compile(r"[A-Za-z]")


def lint(data):
    errors, warnings, infos = [], [], []
    E = lambda where, msg: errors.append(f"[ERROR] {where}: {msg}")  # noqa: E731
    W = lambda where, msg: warnings.append(f"[WARN]  {where}: {msg}")  # noqa: E731
    I = lambda where, msg: infos.append(f"[INFO]  {where}: {msg}")  # noqa: E731

    meta, st, chapters, slides = data["meta"], data["structure"], data["chapters"], data["slides"]

    # ---- meta
    if not meta.get("title"):
        E("meta.title", "缺少簡報標題。")

    # ---- structure: the core of this skill
    for k, hint in (("start", "聽眾現在知道什麼、在意什麼"), ("destination", "聽完要相信或做什麼")):
        if not st.get(k):
            E(f"structure.{k}", f"缺少（{hint}）。沒有起點與終點就無法判斷架構對不對，回到 Grill 問清楚。")
    axis = st.get("axis")
    if axis not in AXES:
        E("structure.axis", f"必須是 {', '.join(AXES)} 之一（目前：{axis!r}）。見 references/structure.md。")
    else:
        if axis == "custom" and not st.get("axis_note"):
            E("structure.axis_note", "axis 為 custom 時，要說明軸的兩端是什麼。")
        if st.get("sensitivity") and AXES[axis][0] == "value":
            E("structure.axis", f"「{axis}」是價值軸（隱含排名或評價），但 sensitivity 為 true。改用中性軸，例如 process 或 time。")
    if not st.get("direction"):
        W("structure.direction", "沒寫方向（例：過去 → 未來）。方向應從聽眾的起點出發。")

    # ---- chapters
    ids = [c.get("id") for c in chapters if isinstance(c, dict)]
    labels = [str(c.get("label") or "") for c in chapters if isinstance(c, dict)]
    if len(chapters) < 2:
        E("chapters", f"只有 {len(chapters)} 章。架構至少要 2 個停靠點；只有一章代表還沒有架構。")
    if len(chapters) > 4:
        E("chapters", f"有 {len(chapters)} 章，超過 4 章。軸切得太細，合併相鄰的章節。")
    elif len(chapters) == 4:
        I("chapters", "4 章：每章開始前會自動插入目錄點亮頁。理想是 3 章以內，確認真的需要 4 章。")
    if len(set(ids)) != len(ids) or any(not i for i in ids):
        E("chapters", "每章都要有唯一的 id。")
    for i, lab in enumerate(labels):
        if not lab:
            E(f"chapters[{i}]", "缺少 label。")
        elif visible_len(lab) > 10:
            W(f"chapters[{i}]", f"「{lab}」太長（{visible_len(lab)} 字）。章節名稱會放在導航列上，盡量 8 字以內。")
    if labels and all(labels):
        lens = [visible_len(x) for x in labels]
        if max(lens) > 2 * min(lens) and max(lens) - min(lens) > 3:
            W("chapters", f"章節名稱長度差很多（{', '.join(labels)}）。停靠點命名要平行：結構、長度、詞性一致。")
        scripts = {("cjk" if CJK.search(x) else "") + ("latin" if LATIN.search(x) else "") for x in labels}
        if len(scripts) > 1:
            W("chapters", f"章節名稱混用中英文（{', '.join(labels)}）。命名要平行。")

    # ---- slides
    if not slides:
        E("slides", "沒有任何頁面。")
    chapter_index = {cid: n for n, cid in enumerate(ids)}
    last_ch = -1
    content_per_ch = {cid: 0 for cid in ids}
    shock_positions = []
    seen_content = False

    for n, s in enumerate(slides, 1):
        where = f"slides[{n}]"
        if not isinstance(s, dict):
            E(where, "每頁必須是 mapping。")
            continue
        t = s.get("type", "content")
        if t not in SLIDE_TYPES:
            E(where, f"type 必須是 {', '.join(sorted(SLIDE_TYPES))} 之一（目前：{t!r}）。")
            continue
        texts = slide_texts(s)

        if st.get("sensitivity") and any("你們" in x for x in texts):
            W(where, "有人際顧慮（sensitivity: true）卻出現「你們」。把批評改成以「我們」開頭的反思提問，聽眾才不會覺得被指責。")
        for txt in texts:
            low = txt.lower()
            for p in TRANSITION_PHRASES:
                if p in low:
                    W(where, f"出現過場語「{p}」。位置感交給導航，不要寫過場文字；覺得需要就代表架構要調整。")
                    break

        if t == "content":
            seen_content = True
            title = str(s.get("title") or "")
            ch = s.get("chapter")
            if ch not in chapter_index:
                E(where, f"chapter「{ch}」不在 chapters 的 id 裡。")
            else:
                content_per_ch[ch] += 1
                if chapter_index[ch] < last_ch:
                    E(where, f"章節順序倒退（回到「{ch}」）。架構必須單一方向前進，不要來回跳。把這頁移到該章，或重新思考軸。")
                last_ch = max(last_ch, chapter_index[ch])
            if not title:
                E(where, "缺少 title（這頁在講什麼）。")
            else:
                L = visible_len(title)
                if EMPH_RE.search(title):
                    E(where, "title 裡不要放 ==重點==。標題是路標，重點放在內容裡。")
                if L > 20:
                    E(where, f"title「{title}」太長（{L} 字）。標題只說這頁在講什麼，不寫結論。")
                elif L > 12:
                    W(where, f"title「{title}」偏長（{L} 字），建議 12 字以內。")
                if re.search(r"[，。！？,!?]", title):
                    W(where, f"title「{title}」像一句話或結論。改成主題詞，結論放到內容的重點裡。")
            layout = s.get("layout")
            if layout not in LAYOUTS:
                E(where, f"layout 必須是 {', '.join(LAYOUTS)} 之一（目前：{layout!r}）。")
            else:
                for f in LAYOUTS[layout]:
                    if not s.get(f):
                        E(where, f"layout「{layout}」需要欄位 {f}。")
                if layout in ("bullets", "steps") and isinstance(s.get("items"), list) and len(s["items"]) > 5:
                    E(where, f"{layout} 有 {len(s['items'])} 條，超過 5 條。拆成兩頁或合併。")
                if layout == "compare":
                    for side in ("left", "right"):
                        v = s.get(side)
                        if v is not None and (not isinstance(v, dict) or "items" not in v):
                            E(where, f"compare 的 {side} 需要 heading 與 items。")
            em = emphasis_count(s)
            if em > 1:
                E(where, f"有 {em} 處重點。每頁最多一處，到處強調等於沒強調。保留最重要的一個，或拆頁。")
            chars = sum(visible_len(x) for x in texts) - visible_len(title)
            if chars > 110:
                W(where, f"內容約 {chars} 字，偏多。上台講的頁面，講者 30 秒內要講得完。")

        elif t == "shock":
            text = str(s.get("text") or "")
            if not text:
                E(where, "震撼頁需要 text。")
            elif visible_len(text) > 20:
                W(where, f"震撼頁文字 {visible_len(text)} 字，偏長。震撼頁只放一句話，盡量 20 字以內。")
            is_opener = s.get("role") == "opener"
            first_after_cover = all(isinstance(x, dict) and x.get("type") == "cover" for x in slides[:n - 1])
            if is_opener and not first_after_cover:
                E(where, "role: opener 只能放在封面之後的第一頁（開場提問）。")
            elif not seen_content and not is_opener:
                E(where, "震撼頁前面沒有任何內容頁。震撼來自對比，前面必須有鋪陳。"
                         "如果這是開場提問（用問題讓全場先停下來想），加上 role: opener。")
            if not is_opener:
                shock_positions.append(n)

        elif t == "cover" and n != 1:
            W(where, "封面通常是第一頁。")

    for cid, count in content_per_ch.items():
        if count == 0:
            E(f"chapters[{cid}]", "這章沒有任何內容頁。")
        elif count > 2:
            I(f"chapters[{cid}]", f"這章有 {count} 頁，會自動顯示頁籤標示位置。")

    if len(shock_positions) > 2:
        E("slides", f"有 {len(shock_positions)} 個震撼頁，超過 2 個。用多了就不震撼了，只留最關鍵的時刻。")
    for a, b in zip(shock_positions, shock_positions[1:]):
        if b - a < 4:
            E(f"slides[{b}]", f"與上一個震撼頁（第 {a} 頁）距離太近。兩個震撼頁之間至少隔 3 頁。")

    minutes = data["meta"].get("minutes")
    ch_minutes = [c.get("minutes") for c in chapters if isinstance(c, dict)]
    if chapters and all(isinstance(m, (int, float)) for m in ch_minutes):
        total = sum(ch_minutes)
        if isinstance(minutes, (int, float)) and minutes > 0:
            if total > minutes:
                E("chapters.minutes", f"各章時間合計 {total:g} 分，超過總時長 {minutes:g} 分。")
            elif minutes - total > max(2, minutes * 0.2):
                W("chapters.minutes", f"各章時間合計 {total:g} 分，比總時長 {minutes:g} 分少很多。緩衝通常 1–2 分鐘就夠。")
        for c, m in zip(chapters, ch_minutes):
            pages = content_per_ch.get(c.get("id"), 0)
            if m and pages / m > 1.5:
                W(f"chapters[{c.get('id')}]", f"{m:g} 分鐘配 {pages} 頁，每分鐘超過 1.5 頁，講者會趕。")
    elif isinstance(minutes, (int, float)) and minutes > 0:
        I("chapters.minutes", "沒有寫每章分鐘數。加上 chapters[].minutes 可以檢查時間分配。")
    if isinstance(minutes, (int, float)) and minutes > 0:
        n_content = sum(1 for s in slides if isinstance(s, dict) and s.get("type", "content") in ("content", "shock"))
        lo, hi = round(minutes * 0.5), round(minutes * 1.2) + 1
        if not lo <= n_content <= hi:
            W("meta.minutes", f"{minutes} 分鐘配 {n_content} 頁內容，比例不尋常（上台講約每分鐘 0.6–1 頁）。")

    return errors, warnings, infos


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 1:
        print(__doc__)
        sys.exit(2)
    try:
        data = load(args[0])
    except StoryboardError as e:
        print(f"[ERROR] {e}")
        sys.exit(2)
    errors, warnings, infos = lint(data)
    if "--json" in sys.argv:
        print(json.dumps({"errors": errors, "warnings": warnings, "infos": infos}, ensure_ascii=False, indent=2))
    else:
        for line in errors + warnings + infos:
            print(line)
        print(f"\n結果：{len(errors)} 個錯誤、{len(warnings)} 個警告、{len(infos)} 個提示。"
              + ("通過。" if not errors else "請修正錯誤後重新執行。"))
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
