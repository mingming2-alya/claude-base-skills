#!/usr/bin/env python3
"""Lint a deck-architect storyboard (or brief) against narrative, structure, constraint, and pacing rules.

Usage:
  python3 lint.py path/to/storyboard.yaml [--json]
  python3 lint.py path/to/brief.md [--json]      # Step 1b: checks the consultant work left traces

Exit code 0 = no errors (warnings allowed), 1 = errors found, 2 = could not read file.
Every message says what is wrong AND what to do about it, so the agent can fix it directly.

The brief check can only prove that each consultant step was DONE (story seeds, three
candidates, benchmark gaps, per-chapter objections, proof media). Whether it was done WELL
is judged by the user at gate 1b.
"""
import sys
sys.dont_write_bytecode = True
import json
import re
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from deck_model import (  # noqa: E402
    AXES, CELL_STATES, COMMON_FIELDS, CONTENT_MODULES, DELIVERY_MODES,
    DENSE_LAYOUTS, EMPH_RE, LAYOUT_FIELDS, LAYOUTS, NAV_MODES,
    PRESENTER_TOOLS, RISK_LEVELS, SIMPLIFIED_CHARS, SLIDE_TYPES, STAGE_MODES,
    SURFACES, TRANSITION_PHRASES, StoryboardError, all_slide_texts_with_notes,
    appendix_slides, capacity_problems, char_limit_for, emphasis_count,
    listed_chapters, load, main_slides, page_breakdown, slide_texts, toc_mode,
    visible_len,
)

CJK = re.compile(r"[\u3400-\u9fff]")
TOKEN_RE = re.compile(r"[\u4e00-\u9fff]{2,}|[A-Za-z0-9]{2,}")
STYLE_INDEX = Path(__file__).resolve().parent.parent / "styles" / "index.json"


def _load_style_status():
    """Map style id -> status ('ready' / 'planned') from styles/index.json; {} if unreadable."""
    try:
        idx = json.loads(STYLE_INDEX.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}
    return {
        str(s["id"]).lower(): str(s.get("status") or "")
        for s in idx.get("styles", []) if isinstance(s, dict) and s.get("id")
    }


def _find_simplified(texts):
    found = []
    seen = set()
    for t in texts:
        for ch in t:
            if ch in SIMPLIFIED_CHARS and ch not in seen:
                seen.add(ch)
                found.append(ch)
    return found


def _matches_any(needle, haystack):
    needle = str(needle or "").strip()
    if not needle:
        return True
    low_n, low_h = needle.lower(), haystack.lower()
    if low_n in low_h:
        return True
    cjk_runs = re.findall(r"[\u4e00-\u9fff]+", needle)
    latin_toks = re.findall(r"[A-Za-z0-9%]{2,}", low_n)
    grams = list(latin_toks)
    for run in cjk_runs:
        if len(run) <= 3:
            grams.append(run)
        else:
            grams.extend(run[i:i + 3] for i in range(0, len(run) - 2, 2))
    if not grams:
        return True
    hits = sum(1 for g in grams if g in low_h)
    return hits >= max(1, int(len(grams) * 0.35))


def lint(data):
    errors, warnings, infos = [], [], []
    E = lambda where, msg: errors.append(f"[ERROR] {where}: {msg}")  # noqa: E731
    W = lambda where, msg: warnings.append(f"[WARN]  {where}: {msg}")  # noqa: E731
    I = lambda where, msg: infos.append(f"[INFO]  {where}: {msg}")  # noqa: E731

    meta = data["meta"]
    st = data["structure"]
    constraints = data.get("constraints") or {}
    chapters = data["chapters"]
    slides = data["slides"]

    # ---- meta
    if not meta.get("title"):
        E("meta.title", "缺少簡報標題。")
    delivery = str(meta.get("delivery") or "talk").lower()
    if delivery not in DELIVERY_MODES:
        E("meta.delivery", f"必須是 {', '.join(DELIVERY_MODES)} 之一（目前：{delivery!r}）。")
        delivery = "talk"
    lang = str(meta.get("lang") or "zh-Hant")
    check_trad = lang.lower().startswith("zh-hant") or lang.lower() == "zh-tw"
    stage_mode = str(meta.get("stage_mode") or "").lower()
    if stage_mode and stage_mode not in STAGE_MODES:
        E("meta.stage_mode", f"必須是 {', '.join(sorted(STAGE_MODES))} 之一（目前：{stage_mode!r}）。")
    nav_mode = str(meta.get("nav_mode") or "").lower()
    if nav_mode and nav_mode not in NAV_MODES:
        E("meta.nav_mode", f"必須是 {', '.join(sorted(NAV_MODES))} 之一（目前：{nav_mode!r}）。")
    style = str(meta.get("style") or "").strip()
    if style:
        style_status = _load_style_status()
        ready = ", ".join(sorted(k for k, v in style_status.items() if v == "ready"))
        if style_status and style.lower() not in style_status:
            W("meta.style", f"「{style}」不在 styles/index.json 的風格清單裡（已就緒：{ready}）。"
                            "Step 3a 選定的風格要用清單裡的 id，assemble.py 才找得到它的動態 DNA 與禁用清單。")
        elif style_status and style_status[style.lower()] != "ready":
            W("meta.style", f"「{style}」還在規劃中（{style_status[style.lower()]}），沒有完整的 Style DNA 與動態套件；"
                            f"先改用已就緒的風格：{ready}。")
    ptools = meta.get("presenter_tools")
    if ptools is not None:
        if not isinstance(ptools, list):
            E("meta.presenter_tools", "必須是 list（例如 [grid, annotator, speaker] 或 []）。")
        else:
            bad_pt = [str(x) for x in ptools if str(x).lower() not in PRESENTER_TOOLS]
            if bad_pt:
                E("meta.presenter_tools", f"不認得的講者工具：{', '.join(bad_pt)}（可用：{', '.join(sorted(PRESENTER_TOOLS))}）。")
    declared_mods = meta.get("modules")
    if declared_mods is not None:
        if not isinstance(declared_mods, list):
            E("meta.modules", "必須是 list（模組白名單，例如 [media, code-stage]）。")
        else:
            bad_m = [str(x) for x in declared_mods if str(x).lower() not in CONTENT_MODULES]
            if bad_m:
                W("meta.modules", f"包含未登錄模組名稱：{', '.join(bad_m)}（可用：{', '.join(sorted(CONTENT_MODULES))}）。")
            if stage_mode == "briefing":
                over = [str(x) for x in declared_mods if str(x).lower() in ("ambient-fx", "coverflow", "motion-apple")]
                if over:
                    W("meta.modules", f"stage_mode 為 briefing（決策簡報），不建議啟用氛圍／高舞台裝飾模組：{', '.join(over)}。")

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

    # ---- chapters (listed chapters appear in TOC & nav; optional unlisted: true chapter is a surprise act)
    listed = listed_chapters(data)
    unlisted_ch = [c for c in chapters if isinstance(c, dict) and c.get("unlisted")]
    ids = [c.get("id") for c in chapters if isinstance(c, dict)]
    listed_labels = [str(c.get("label") or "") for c in listed]
    if len(listed) < 2:
        E("chapters", f"只有 {len(listed)} 個公開章節。架構至少要 2 個停靠點；只有一章代表還沒有架構。")
    if len(listed) > 4:
        E("chapters", f"有 {len(listed)} 個公開章節，超過 4 章。軸切得太細，合併相鄰的章節。")
    elif len(listed) == 4:
        how = "每章開始前會自動插入目錄點亮頁" if toc_mode(data) == "per-chapter" else "章節短，只會在封面後插入一頁目錄"
        I("chapters", f"4 章：{how}。理想是 3 章以內，確認真的需要 4 章。")
    if len(unlisted_ch) > 1:
        W("chapters", f"有 {len(unlisted_ch)} 個 unlisted 驚喜章節，建議最多 1 個（如 One More Thing）以免稀釋反轉張力。")
    elif unlisted_ch:
        I("chapters", f"含不劇透驚喜章節（unlisted: true）：{', '.join(str(c.get('label') or c.get('id')) for c in unlisted_ch)}，將自動從總目錄與常駐導航隱藏。")
    if len(set(ids)) != len(ids) or any(not i for i in ids):
        E("chapters", "每章都要有唯一的 id。")
    for i, c in enumerate(chapters):
        if not isinstance(c, dict):
            continue
        lab = str(c.get("label") or "")
        if not lab:
            E(f"chapters[{i}]", "缺少 label。")
        elif not c.get("unlisted") and visible_len(lab) > 10:
            W(f"chapters[{i}]", f"「{lab}」太長（{visible_len(lab)} 字）。章節名稱會放在導航列上，盡量 8 字以內。")
    if listed_labels and all(listed_labels):
        lens = [visible_len(x) for x in listed_labels]
        if max(lens) > 2 * min(lens) and max(lens) - min(lens) > 3:
            W("chapters", f"章節名稱長度差很多（{', '.join(listed_labels)}）。停靠點命名要平行：結構、長度、詞性一致。")
        scripts = {"cjk" if CJK.search(x) else "latin" for x in listed_labels}
        if len(scripts) > 1:
            W("chapters", f"章節名稱混用中英文（{', '.join(listed_labels)}）。命名要平行。")

    # ---- slides
    if not slides:
        E("slides", "沒有任何頁面。")
    chapter_index = {cid: n for n, cid in enumerate(ids)}
    last_ch = -1
    content_per_ch = {cid: 0 for cid in ids}
    shock_positions = []
    seen_content = False
    appendix_ids, links = set(), []
    for s in slides:
        if isinstance(s, dict):
            if s.get("appendix") and s.get("id"):
                appendix_ids.add(s["id"])
            if s.get("link"):
                links.append(s["link"])
            for p in s.get("pillars") or []:
                if isinstance(p, dict) and p.get("link"):
                    links.append(p["link"])

    forbidden = [str(x).strip() for x in (constraints.get("forbidden") or []) if str(x).strip()]
    char_limit = char_limit_for(data)
    delivery_label, _, delivery_note = DELIVERY_MODES[delivery]

    all_visible_joined = []
    all_with_notes_joined = []
    signatures = 0

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
        all_visible_joined.extend(texts)
        all_with_notes_joined.extend(all_slide_texts_with_notes(s))
        is_appendix = bool(s.get("appendix"))
        is_free_file = bool(s.get("file"))
        if s.get("signature"):
            signatures += 1
        if is_appendix and not s.get("id"):
            E(where, "附件頁（appendix: true）需要 id，才能被 link 指到。")
        surf = str(s.get("surface") or "").lower()
        if surf and surf not in SURFACES:
            E(where, f"surface 必須是 {', '.join(sorted(SURFACES))} 之一（目前：{surf!r}）。")

        # ---- constraints: forbidden phrases (ERROR)
        for bad in forbidden:
            if any(bad.lower() in x.lower() for x in texts):
                E(where, f"出現地雷／禁用說法「{bad}」（定義於 constraints.forbidden）。請移除或改寫。")

        # ---- sensitivity & transition phrases
        if st.get("sensitivity") and any("你們" in x for x in texts):
            W(where, "有人際顧慮（sensitivity: true）卻出現「你們」。把批評改成以「我們」開頭的反思提問，聽眾才不會覺得被指責。")
        for txt in texts:
            low = txt.lower()
            for p in TRANSITION_PHRASES:
                if p in low:
                    W(where, f"出現過場語「{p}」。位置感交給導航，不要寫過場文字；覺得需要就代表架構要調整。")
                    break

        # ---- Traditional Chinese check
        if check_trad:
            sc = _find_simplified(texts)
            if sc:
                W(where, f"偵測到簡體字（{''.join(sc[:10])}）。meta.lang 為 {lang}，請轉成繁體中文並確認台灣習慣用語。")

        # ---- unknown fields (only warn for non-free built-in layouts)
        if t == "content" and not is_free_file and s.get("layout") in LAYOUT_FIELDS:
            unknown = set(s) - COMMON_FIELDS - LAYOUT_FIELDS[s["layout"]]
            if unknown:
                W(where, f"layout「{s['layout']}」不認得欄位 {', '.join(sorted(unknown))}。"
                         f"可用欄位：{', '.join(sorted(LAYOUT_FIELDS[s['layout']]))}。")

        # ---- capacity rules
        for msg in capacity_problems(s):
            W(where, msg + "。")

        # ---- numeric source check
        has_digit = any(re.search(r"\d", x) for x in texts)
        if has_digit and not s.get("source") and (
            t == "shock" or (t == "content" and s.get("layout") in ("number", "stats", "chart-bar", "chart-donut", "chart-trend"))
        ):
            W(where, "關鍵數字或圖表沒有 source（出處）。先跟原始資料核對，再寫上出處與適用範圍。")

        # ---- status-table (deterministic business component)
        if t == "content" and s.get("layout") == "status-table":
            seen_content = True
            stages = s.get("stages") or []
            if not isinstance(stages, list) or not 2 <= len(stages) <= 6:
                E(where, "status-table 的 stages 需要 2–6 個共用階段（例如 啟動、需求、建置、適配）。")
                stages = stages if isinstance(stages, list) else []
            n_rows = 0
            label_to_id = {str(c.get("label")): c.get("id") for c in chapters if isinstance(c, dict)}
            matched = False
            for g in s.get("groups") or []:
                if isinstance(g, dict):
                    cid = g.get("chapter") or label_to_id.get(str(g.get("name")))
                    if cid in content_per_ch:
                        content_per_ch[cid] += 1
                        matched = True
            if not matched:
                for cid in content_per_ch:
                    content_per_ch[cid] += 1
            for g_i, g in enumerate(s.get("groups") or []):
                gw = f"{where}.groups[{g_i}]"
                if not isinstance(g, dict) or not g.get("name"):
                    E(gw, "每個 group 需要 name（專案大類）。")
                    continue
                prev_rank = None
                for r_i, r in enumerate(g.get("rows") or []):
                    n_rows += 1
                    rw = f"{gw}.rows[{r_i}]「{r.get('name', '?') if isinstance(r, dict) else '?'}」"
                    if not isinstance(r, dict) or not r.get("name"):
                        E(rw, "每列需要 name。")
                        continue
                    cells = r.get("cells") or []
                    if len(cells) != len(stages):
                        E(rw, f"cells 有 {len(cells)} 格，但 stages 有 {len(stages)} 個。每個階段一格。")
                    for c in cells:
                        st_ = c.get("state") if isinstance(c, dict) else c
                        if st_ not in CELL_STATES:
                            E(rw, f"cell 狀態必須是 {', '.join(sorted(CELL_STATES))} 之一（目前：{st_!r}）。")
                            break
                    risk = r.get("risk")
                    if risk not in RISK_LEVELS:
                        E(rw, "每列都要有 risk（red／yellow／green）。總覽要讓主管三秒看出哪裡有問題，只有進度百分比看不出來。")
                    elif risk in ("red", "yellow") and not (r.get("support") or r.get("note")):
                        W(rw, f"風險是 {risk}，卻沒寫 support（需要誰做什麼）或 note（原因）。")
                    pr = r.get("progress")
                    if pr is not None and not (isinstance(pr, (int, float)) and 0 <= pr <= 100):
                        E(rw, "progress 必須是 0–100 的數字。")
                    if g.get("order", "risk") == "risk" and risk in RISK_LEVELS:
                        rank = (-RISK_LEVELS[risk], -(pr or 0))
                        if prev_rank is not None and rank < prev_rank:
                            W(rw, "同一類之內要先排風險高的，同風險再依進度。這列的順序比上一列前面。")
                        prev_rank = rank
            if n_rows > 13:
                E(where, f"一頁 {n_rows} 列，超過 13 列放不下。拆成兩頁（第二頁加上 continued: true）。")
            for k, line in enumerate(s.get("summary") or []):
                if not re.search(r"\d", str(line)) and not re.search(r"無更新|完成|上線|結案|暫停|延後", str(line)):
                    W(f"{where}.summary[{k}]", f"「{str(line)[:20]}…」沒有數字也沒有明確狀態。摘要每行要有可檢查的結果。")
            if not s.get("summary") and not s.get("continued"):
                W(where, "總覽的第一頁建議加上 summary：依大類各一行本期重點，每行帶數字或明確狀態。")
            continue

        # ---- pillars (deterministic overview component)
        if t == "content" and s.get("layout") == "pillars":
            seen_content = True
            pillars = s.get("pillars") or []
            if not isinstance(pillars, list) or not 2 <= len(pillars) <= 4:
                E(where, "pillars 需要 2–4 欄。")
                pillars = pillars if isinstance(pillars, list) else []
            order = []
            for k, p in enumerate(pillars):
                if not isinstance(p, dict) or p.get("chapter") not in chapter_index or not p.get("heading"):
                    E(f"{where}.pillars[{k}]", "每欄需要 chapter（chapters 的 id）與 heading。")
                    continue
                content_per_ch[p["chapter"]] += 1
                order.append(chapter_index[p["chapter"]])
                em = sum(len(EMPH_RE.findall(x)) for x in slide_texts(p))
                if em > 1:
                    E(f"{where}.pillars[{k}]", f"這一欄有 {em} 處重點，每欄最多一處。")
            if order != sorted(order):
                E(where, "pillars 的欄位順序要跟 chapters 一致（架構的方向）。")
            if len(order) != len(ids):
                W(where, "pillars 沒有涵蓋所有章節。一頁總覽通常每章一欄。")
            if len(EMPH_RE.findall(str(s.get("headline", "")))) > 1:
                E(where, "headline 最多一處重點。")
            continue

        # ---- general content slide (free canvas OR built-in)
        if t == "content":
            seen_content = True
            title = str(s.get("title") or "")
            ch = s.get("chapter")
            if ch not in chapter_index:
                E(where, f"chapter「{ch}」不在 chapters 的 id 裡。")
            elif not is_appendix:
                content_per_ch[ch] += 1
                if chapter_index[ch] < last_ch:
                    E(where, f"章節順序倒退（回到「{ch}」）。架構必須單一方向前進，不要來回跳。把這頁移到該章，或重新思考軸。")
                last_ch = max(last_ch, chapter_index[ch])
            if not title:
                E(where, "缺少 title（這頁在講什麼）。")
            else:
                L = visible_len(title)
                if EMPH_RE.search(title):
                    E(where, "title 裡不要放 ==重點==。標題是路標，重點與總結放在內文裡。")
                if L > 20:
                    E(where, f"title「{title}」太長（{L} 字）。主標題只寫這頁在講什麼，總結永遠不當主標題。")
                elif L > 12:
                    W(where, f"title「{title}」偏長（{L} 字），建議 12 字以內。")
                if re.search(r"[，。！？,!?]", title):
                    W(where, f"title「{title}」像一句話或總結。總結永遠不當主標題，請改為主題詞並把總結移到內文。")

            layout = s.get("layout") or ("free" if is_free_file else None)
            if layout not in LAYOUTS:
                E(where, f"layout 必須是 {', '.join(LAYOUTS)} 之一（目前：{layout!r}）。")
            elif not is_free_file:
                for f in LAYOUTS[layout]:
                    if not s.get(f):
                        E(where, f"layout「{layout}」需要欄位 {f}（或改用 file: 指定自由編排頁）。")
                if layout == "compare":
                    for side in ("left", "right"):
                        v = s.get(side)
                        if v is not None and (not isinstance(v, dict) or "items" not in v):
                            E(where, f"compare 的 {side} 需要 heading 與 items。")

            em = emphasis_count(s)
            if em > 1:
                E(where, f"有 {em} 處重點。每頁最多一處，到處強調等於沒強調。保留最重要的一個，或拆頁。")

            chars = sum(visible_len(x) for x in texts) - visible_len(title)
            if chars > char_limit and not is_appendix and layout not in DENSE_LAYOUTS:
                W(where, f"內容約 {chars} 字，超過「{delivery_label}」建議上限 {char_limit} 字（{delivery_note}）。")

        elif t == "shock":
            text = str(s.get("text") or "")
            if not text and not is_free_file:
                E(where, "震撼頁需要 text。")
            elif text and visible_len(text) > 20:
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

    # ---- links & appendix guardrails
    for target in links:
        if target not in appendix_ids:
            E("link", f"link 指向「{target}」，但沒有 id 為「{target}」的附件頁（appendix: true）。")
    for aid in appendix_ids - set(links):
        W(f"appendix[{aid}]", "這個附件頁沒有任何 link 指向它，現場點不到。")
    n_main = len(main_slides(data))
    n_app = len(appendix_slides(data))
    if n_app > max(3, n_main // 2) and n_main > 0:
        W("appendix", f"附件頁有 {n_app} 頁，相對主線 {n_main} 頁過多。附件只放「現場被追問才點入的補充」，不可用來規避主線頁數上限。")

    # ---- chapters coverage
    for cid, count in content_per_ch.items():
        if count == 0:
            E(f"chapters[{cid}]", "這章沒有任何內容頁。")
        elif count > 2:
            I(f"chapters[{cid}]", f"這章有 {count} 頁，會自動顯示頁籤標示位置。")

    # ---- shocks spacing
    if len(shock_positions) > 2:
        E("slides", f"有 {len(shock_positions)} 個震撼頁，超過 2 個。用多了就不震撼了，只留最關鍵的時刻。")
    for a, b in zip(shock_positions, shock_positions[1:]):
        if b - a < 4:
            E(f"slides[{b}]", f"與上一個震撼頁（第 {a} 頁）距離太近。兩個震撼頁之間至少隔 3 頁。")

    # ---- constraints: limitations & must_include
    joined_notes = "\n".join(all_with_notes_joined)
    joined_vis = "\n".join(all_visible_joined)
    for lim in constraints.get("limitations") or []:
        if not _matches_any(lim, joined_notes):
            W("constraints.limitations", f"限制／不承諾「{lim}」尚未出現在任何頁的內容或講者備註（notes）裡，小心過度宣稱。")
    for req in constraints.get("must_include") or []:
        if not _matches_any(req, joined_vis):
            W("constraints.must_include", f"必放項目「{req}」尚未出現在任何投影片的可見內容裡。")

    # ---- page arithmetic breakdown
    bd = page_breakdown(data)
    formula = f"封面 {bd['cover']} + 目錄 {bd['toc']} + 內容 {bd['content']} + 震撼 {bd['shock']} + 結尾 {bd['closing']} = {bd['total']} 頁"
    if bd["appendix"]:
        formula += f"（另含附件 {bd['appendix']} 頁）"
    budget = meta.get("pages")
    if isinstance(budget, int) and budget > 0:
        if bd["total"] > budget:
            E("meta.pages", f"頁數算術超過上限：{formula} > 上限 {budget} 頁。請精簡內容或調整章節／頁數預算。")
        else:
            I("meta.pages", f"頁數算術：{formula}（上限 {budget} 頁）。")
        min_needed = bd["cover"] + bd["toc"] + len(chapters)
        if min_needed > budget:
            W("meta.pages", f"頁數上限 {budget} 頁連「封面 + 目錄 + 每章 1 頁」（至少 {min_needed} 頁）都放不下，請在 brief 階段重新對齊頁數定義。")
    else:
        I("meta.pages", f"頁數算術：{formula}。")

    # ---- time budget
    minutes = meta.get("minutes")
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

    if isinstance(minutes, (int, float)) and minutes > 0 and delivery in ("talk", "discuss"):
        n_content = sum(
            1 for s in slides if isinstance(s, dict) and not s.get("appendix")
            and s.get("type", "content") in ("content", "shock")
        )
        lo, hi = max(1, int(minutes * 0.3)), round(minutes * 1.2) + 1
        if not lo <= n_content <= hi:
            W("meta.minutes", f"{minutes:g} 分鐘配 {n_content} 頁內容，比例不尋常（上台講約每分鐘 0.4–1 頁；圖解密集的頁面可以更少）。")

    # ---- signature page hint for Gate 2 samples
    if n_main >= 4 and signatures == 0:
        I("slides", "尚未標註招牌頁（signature: true）。在最重要的一頁加上 signature: true，Step 3b 樣張才會優先挑中它。")

    # ---- v4.6 per-slide director spec soft check (pitch/keynote only; briefing stays frictionless)
    content_main = [
        (n, s) for n, s in enumerate(slides, 1)
        if isinstance(s, dict) and not s.get("appendix") and s.get("type", "content") == "content"
    ]
    dir_count = 0
    for n, s in content_main:
        d = s.get("director")
        if d is None:
            continue
        if not isinstance(d, dict):
            W(f"slides[{n}].director", "director 應為 mapping（Step 2 寫 hero／module；Step 3a 選定風格後補 archetype／choreo）。")
        else:
            dir_count += 1
            if not d.get("hero"):
                W(f"slides[{n}].director", "缺少 hero（這頁最吸睛的視覺主角是什麼，對應 brief 的說服載體）。")
    if stage_mode in ("pitch", "keynote") and len(content_main) >= 4 and dir_count == 0:
        I("slides.director", f"stage_mode={stage_mode} 目前尚未填寫逐頁 director.hero（這頁的視覺主角）；建議至少替關鍵頁補齊，避免 Step 4 退回純文字卡片。archetype／choreo 等 Step 3a 選定風格後再補。")

    # ---- visual rhythm: adjacent slides should vary unless in same series
    flow = [(n, s) for n, s in enumerate(slides, 1) if isinstance(s, dict) and not s.get("appendix")]
    shape_of = lambda s: (s.get("layout") or "free", s.get("visual") or s.get("variant") or "")  # noqa: E731
    prev = None
    for n, s in flow:
        if s.get("type", "content") != "content" or s.get("layout") in ("pillars", "status-table", "free", "scene"):
            prev = None
            continue
        if prev and shape_of(prev) == shape_of(s) and not (s.get("series") and s.get("series") == prev.get("series")):
            W(f"slides[{n}]", f"和上一頁同為 {shape_of(s)[0]}（{shape_of(s)[1] or '預設'}）。相鄰兩頁應變化視覺呈現；"
                              "若這幾頁本來就是同類內容，請寫上同一個 series。")
        prev = s

    series_map = {}
    for n, s in flow:
        if s.get("series") and s.get("type", "content") == "content":
            series_map.setdefault(str(s["series"]), []).append((n, s))
    for name, pages in series_map.items():
        if len(pages) == 1:
            I(f"slides[{pages[0][0]}]", f"series「{name}」只有這一頁。series 是給「同一類、要長得一樣」的多頁用的。")
        else:
            kinds = {shape_of(s) for _, s in pages}
            if len(kinds) > 1:
                W(f"series「{name}」", "同一個系列的頁面用了不同結構，同一系列建議維持一致視覺語言。")

    return errors, warnings, infos


# ----------------------------------------------------------------------------- brief.md (Step 1b gate)
BRIEF_PLACEHOLDER = re.compile(r"<[^<>\n]{0,200}>")
BRIEF_FIELD = re.compile(r"^\s*[-*]\s*\*\*(.+?)\*\*\s*[：:]\s*(.*)$")
# Presentation decisions belong to Step 3a (after the style is chosen), never to the brief.
BRIEF_PRESENTATION_TERMS = (
    "明暗極性策略", "去框化比例", "導航殼層", "nav_mode", "ambient-fx",
    "motion-workday", "motion-counsel", "motion-apple", "motion-story",
)


def _unfilled(value):
    v = (value or "").strip()
    return (not v) or v in ("…", "...", "-", "—") or bool(BRIEF_PLACEHOLDER.search(v))


def _says_none(value):
    """True for an explicit 'none' answer (無／略過), but not for words like 無人機 or 無塵室."""
    v = (value or "").strip()
    return bool(re.match(r"^(無|略過)(?:$|[\s。．.,，、；;：:（(／/])", v))


def lint_brief(text):
    """Check that brief.md carries every trace the consultant process must leave behind."""
    errors, warnings, infos = [], [], []
    E = lambda where, msg: errors.append(f"[ERROR] {where}: {msg}")  # noqa: E731
    W = lambda where, msg: warnings.append(f"[WARN]  {where}: {msg}")  # noqa: E731
    I = lambda where, msg: infos.append(f"[INFO]  {where}: {msg}")  # noqa: E731

    lines = text.splitlines()
    section = ""      # current "## " heading
    sub = ""          # current "### " heading
    fields = []       # (section, sub, label, value, line_no)
    chapters = []     # (title, line_no) of ### blocks inside section 5
    bullets_by_section = {}
    for no, line in enumerate(lines, 1):
        if line.startswith("## "):
            section, sub = line[3:].strip(), ""
            continue
        if line.startswith("### "):
            sub = line[4:].strip()
            if section.startswith("5.") and not sub.startswith(("招牌亮點頁", "內容減法清單")):
                chapters.append((sub, no))
            continue
        m = BRIEF_FIELD.match(line)
        if m:
            fields.append((section, sub, m.group(1).strip(), m.group(2).strip(), no))
        elif re.match(r"^\s*[-*]\s+\S", line):
            bullets_by_section.setdefault((section, sub), []).append((line.strip()[1:].strip(), no))

    def find(prefix, sec=None, sb=None):
        for s, b, label, value, no in fields:
            if label.startswith(prefix) and (sec is None or s.startswith(sec)) and (sb is None or b == sb):
                return value, no
        return None, None

    reported = set()

    def need(prefix, where, strict, hint, sec=None):
        value, no = find(prefix, sec)
        if no is None:
            (E if strict else W)(where, f"找不到「{prefix}」欄位。{hint}")
            return None
        if _unfilled(value):
            reported.add(no)
            (E if strict else W)(f"{where}（第 {no} 行）", f"還沒填。{hint}")
            return None
        return value

    # ---- mode
    mode_val, mode_no = find("製作模式")
    fast = False
    if mode_no is None or _unfilled(mode_val) or (("標準" in mode_val) == ("快速" in mode_val)):
        if mode_no:
            reported.add(mode_no)
        E("1. 製作模式", "請寫明「標準」或「快速」。快速模式會放寬故事種子、候選數與反方質疑的檢查。")
    else:
        fast = "快速" in mode_val
    strict = not fast

    # ---- section 1–2: situation, benchmark, occasion
    need("理性終點", "1. 理性終點", True, "聽完之後對方要相信什麼、做出什麼決定。")
    need("體感預期", "1. 體感預期", strict, "演完燈亮那一刻，希望台下心裡冒出的那句話。")
    need("對象起點", "1. 對象起點", True, "誰會聽、在意什麼、有什麼疑慮。")
    need("主題類型與氣質", "1. 主題類型與氣質", True, "對照 contexts.md〈主題類型總表〉；Step 3a 靠它推薦風格。")
    need("標竿必答維度與處置", "1. 標竿盲點", strict, "列出這類標竿必答的維度，逐項寫「已補齊」或「刻意略過（理由）」。")
    need("時長與頁數算術", "1. 時長與頁數", True, "寫明分鐘數與頁數上限（含／不含封面與目錄）。")
    sm = need("舞台光譜", "2. stage_mode", True, "briefing／pitch／keynote 三選一。")
    stage = ""
    if sm is not None:
        hits = [k for k in ("briefing", "pitch", "keynote") if k in sm.lower()]
        if len(hits) != 1:
            E("2. stage_mode", f"要三選一（目前：{sm}）。")
        else:
            stage = hits[0]
    dv = need("播放方式", "2. delivery", True, "talk／discuss／read／auto 四選一。")
    if dv is not None:
        hits = [k for k in ("talk", "discuss", "read", "auto") if k in dv.lower()]
        if len(hits) != 1:
            E("2. delivery", f"要四選一（目前：{dv}）。")
    need("播放環境", "2. 播放環境", strict, "亮室會議室／暗場大螢幕／線上分享／列印或寄送；Step 3a 依它校準明暗。")

    # ---- section 3: story seeds
    seed = need("種子 1", "3. 故事種子", strict,
                "先問使用者最想讓聽眾記住的 1–3 個時刻、案例、畫面或原話，敘事候選要圍繞它們長出來。")
    if seed is not None and _says_none(seed) and strict:
        W("3. 故事種子", "寫的是「無」。標準模式建議再試一次：用 Pre-Flight 讀到的素材提幾個候選種子給使用者挑或改寫。")
    need("一句話核心訊息", "3. 一句話核心訊息", True, "若聽眾只記得一句話，是哪一句。")

    # ---- section 4: candidates (Design It Twice) and the choice
    need("候選 A", "4. 候選 A", strict, "穩健守正版：軸與方向、章節停靠點、用到的種子。")
    b = need("候選 B", "4. 候選 B", strict, "聽眾痛點／反方逆推版。")
    c = need("候選 C", "4. 候選 C（破框）", strict, "破框敘事版：打破了哪個慣例。")
    if strict and c is not None and _says_none(c):
        E("4. 候選 C（破框）", "標準模式一定要給至少 1 個破框敘事候選（DESIGN-IT-TWICE），不能略過。")
    if strict and b is not None and _says_none(b):
        E("4. 候選 B", "標準模式要給三個本質不同的候選，不能略過。")
    need("選定與理由", "4. 選定與理由", True, "選了哪個或怎麼混搭，以及為什麼它能把聽眾帶到終點。")
    in4, stops = False, []
    for no, line in enumerate(lines, 1):
        if line.startswith("## "):
            in4 = line[3:].strip().startswith("4.")
            continue
        m = re.match(r"^\s*\d+\.\s+(.*)$", line)
        if in4 and m:
            stops.append((m.group(1), no))
    if len([t for t, _ in stops if not _unfilled(t)]) < 2:
        for t, n in stops:
            if _unfilled(t):
                reported.add(n)
        E("4. 章節", "第 4 節的章節停靠點至少要 2 個（每個寫章名、分鐘數與這章唯一要記住的一件事）。")

    # ---- section 5: per-chapter depth
    if len(chapters) < 2:
        E("5. 逐章內容", f"只找到 {len(chapters)} 章。每一章一個「### 章名」小節，架構至少要 2 個停靠點。")
    for title, no in chapters:
        where = f"5. {title}"
        if _unfilled(title):
            reported.add(no)
            E(f"{where}（第 {no} 行）", "章名還沒填。")
        for prefix, strict_field, hint in (
            ("唯一記憶點", True, "這章講完，聽眾只帶走的那一件事。"),
            ("反方質疑與回應", strict, "最挑剔的聽眾會怎麼挑戰，以及我們怎麼回應或交代邊界。"),
            ("說服載體", strict, "用什麼證明這章的論點（白話描述）；Step 3a 會拿它回頭篩風格。"),
        ):
            value, vno = find(prefix, "5.", title)
            if vno is None:
                (E if strict_field else W)(where, f"缺少「{prefix}」。{hint}")
            elif _unfilled(value):
                reported.add(vno)
                (E if strict_field else W)(f"{where}（第 {vno} 行）", f"「{prefix}」還沒填。{hint}")

    hl, hl_no = find("亮點頁 1", "5.")
    if stage in ("pitch", "keynote") and (hl_no is None or _unfilled(hl) or _says_none(hl)):
        if hl_no:
            reported.add(hl_no)
        W("5. 招牌亮點頁", f"stage_mode={stage} 建議至少拍板 1 個招牌亮點頁（pitch 1–2、keynote 2–3），用白話描述畫面與互動。")

    reduction = [(t, n) for (s, sb), items in bullets_by_section.items()
                 if s.startswith("5.") and sb.startswith("內容減法清單") for t, n in items]
    if not reduction or all(_unfilled(t) for t, _ in reduction):
        for _, n in reduction:
            reported.add(n)
        W("5. 內容減法清單", "還沒填。列出要移進 notes 的長段落；真的沒有就寫「無」。")

    # ---- section 6: number check
    facts = [(t, n) for (s, sb), items in bullets_by_section.items() if s.startswith("6.") for t, n in items]
    facts += [(v, n) for s, sb, label, v, n in fields if s.startswith("6.")]
    if not facts or all(_unfilled(t) for t, _ in facts):
        for _, n in facts:
            reported.add(n)
        E("6. 數字查核", "還沒填。逐項寫出處、口徑與查核結果；沒有數據就寫「無：目前沒有可確認的數據」。")

    # ---- section 8: constraints
    need("限制與不承諾", "8. limitations", strict, "做不到、有限制、不能承諾的邊界；沒有就寫「無」。")

    # ---- pillar boundary: presentation decisions do not belong in the brief
    leaked = sorted({t for t in BRIEF_PRESENTATION_TERMS if t in text})
    if leaked:
        W("主柱邊界", f"brief 出現呈現層決定（{', '.join(leaked)}）。明暗、去框比例、導航、氛圍與風格動態要等 "
                     "Step 3a 選定風格後才決定，寫進 storyboard.yaml；brief 只記內容、場合與說服載體。")

    # ---- anything else still holding a template placeholder
    leftovers = [no for no, line in enumerate(lines, 1)
                 if no not in reported and BRIEF_PLACEHOLDER.search(line) and "選填" not in line
                 and not line.lstrip().startswith((">", "#", "<!--"))]
    if leftovers:
        shown = "、".join(str(n) for n in leftovers[:12]) + ("…" if len(leftovers) > 12 else "")
        W("未填欄位", f"還有 {len(leftovers)} 行留著 <…> 範本文字（第 {shown} 行）。換成實際內容，不適用就寫「無」。")

    I("brief", f"製作模式：{'快速' if fast else '標準'}；找到 {len(chapters)} 章。"
               "lint 只檢查顧問流程有沒有留下產出；內容好不好，由使用者在關卡 1b 判斷。")
    return errors, warnings, infos


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 1:
        print(__doc__)
        sys.exit(2)
    if args[0].lower().endswith(".md"):
        try:
            text = Path(args[0]).read_text(encoding="utf-8")
        except OSError as e:
            print(f"[ERROR] 讀不到 {args[0]}：{e}")
            sys.exit(2)
        errors, warnings, infos = lint_brief(text)
    else:
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
