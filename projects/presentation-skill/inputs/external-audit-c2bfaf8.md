# 外部稽核報告原文（對象：commit `c2bfaf8`，deck-architect v4.8）

> 使用者 2026-11-26 提供，由另一個 Agent 對 `c2bfaf8` 做的唯讀稽核。以下原文照錄（含該 Agent 的指令紀錄）；逐條評估見 `external-audit-c2bfaf8-review.md`。

---

Ran command: Repo status and structure (`git status && git branch -a && git log -n 20 --oneline && find . -maxdepth 4 -not -path '*/.git/*' | sort`)
Ran command: Presentation-skill project inspection (`git status && git branch -a && git log -n 25 --oneline && find projects/presentation-skill -maxdepth 5 | sort`)
Ran command: Git log and deck-architect listing (`git status && echo "--- BRANCHES ---" && git branch -a && echo "--- LOG ---" && git log -n 20 --oneline && echo "--- DECK ARCHITECT ---" && find projects/presentation-skill/outputs/deck-architect -maxdepth 5 | sort && echo "--- OUTPUTS TOP ---" && ls -la projects/presentation-skill/outputs/`)
Ran command: Git history and assets listing (`git status && echo "--- BRANCHES ---" && git branch -a && echo "--- LOG ---" && git log -n 25 --oneline && echo "--- COMPONENTS ---" && ls -la projects/presentation-skill/outputs/deck-architect/assets/components/ && echo "--- EXAMPLES ---" && ls -la projects/presentation-skill/outputs/examples/`)
Viewed STATUS.md:1-116
Viewed ROADMAP.md:1-121
Viewed presentation-principles.md:1-113
Viewed SKILL.md:1-169
Viewed grill.md:1-155
Viewed contexts.md:1-90
Viewed structure.md:1-97
Viewed samples.md:1-73
Viewed presentation-rules.md:1-93
Viewed content-shapes.md:1-51
Viewed visual-guidance.md:1-129
Viewed motion-system.md:1-138
Viewed modules-catalog.md:1-59
Viewed progress-report.md:1-80
Viewed interactive-explainers.md:1-87
Viewed media-and-gallery.md:1-100
Viewed presenter-and-fx.md:1-51
Viewed style-motion-kits.md:1-127
Viewed brief.md:1-94
Viewed storyboard.yaml:1-140
Viewed deck.css:1-78
Viewed image-upgrade.md:1-26
Viewed bento-causal.md:1-78
Viewed editorial-drama.md:1-66
Viewed interactive-proof.md:1-73
Viewed linked-diagram.md:1-58
Viewed product-story.md:1-42
Viewed index.json:1-306
Viewed color-system.md:1-49
Viewed workday.md:1-84
Viewed counsel.md:1-83
Viewed apple.md:1-83
Viewed illustration.md:1-95
Viewed lint.py:1-781
Viewed assemble.py:1-800
Viewed deck_model.py:1-337
Viewed oklch.py:1-164
Viewed assemble.py:801-1329
Viewed check.mjs:1-800
Viewed check_reports.py:1-164
Viewed check.mjs:801-1600
Viewed check.mjs:1601-1688
Viewed runtime.js:1-800
Viewed shell.css:1-800
Viewed runtime.js:801-1482
Viewed shell.css:801-841
Viewed fit.js:1-78
Viewed LOG.md:1-120
Viewed LOG.md:1400-1621
Viewed CLAUDE.md:1-63
Viewed workday-kit.js:1-156
Viewed counsel-kit.js:1-217
Viewed apple-kit.js:1-255
Viewed story-kit.js:1-116
Viewed workday-kit.css:1-131
Viewed counsel-kit.css:1-121
Viewed apple-kit.css:1-151
Viewed story-kit.css:1-117
Viewed brief.md:1-104
Viewed README.md:1-19
Ran command: Package sync and reference audit (`python3 - <<'PY'
import zipfile, hashlib, pathlib, re, json

root = pathlib.Path("projects/presentation-skill")
src = root / "outputs/deck-architect"
pkg = root / "outputs/deck-architect.skill"

# 1. Verify .skill zip vs source dir
src_files = {}
for p in sorted(src.rglob("*")):
    if p.is_file():
        rel = "deck-architect/" + p.relative_to(src).as_posix()
        src_files[rel] = hashlib.sha256(p.read_bytes()).hexdigest()

pkg_files = {}
with zipfile.ZipFile(pkg) as zf:
    for info in zf.infolist():
        if not info.is_dir():
            pkg_files[info.filename] = hashlib.sha256(zf.read(info.filename)).hexdigest()

only_src = set(src_files) - set(pkg_files)
only_pkg = set(pkg_files) - set(src_files)
diff_hash = [k for k in sorted(set(src_files) & set(pkg_files)) if src_files[k] != pkg_files[k]]
print(f"=== PKG SYNC === src={len(src_files)} pkg={len(pkg_files)} only_src={sorted(only_src)} only_pkg={sorted(only_pkg)} diff={diff_hash}")

# 2. Check all file paths referenced in deck-architect/*.md
ref_re = re.compile(r'`((?:references|styles|templates|scripts|assets)/[A-Za-z0-9_./{}-]+)`')
missing = []
for md in sorted(src.rglob("*.md")):
    txt = md.read_text(encoding="utf-8")
    for m in ref_re.finditer(txt):
        ref = m.group(1)
        if "*" in ref or "<" in ref or "{" in ref or ref.endswith("/"):
            continue
        ref_clean = ref.split("#")[0]
        if not (src / ref_clean).exists():
            missing.append((md.relative_to(src).as_posix(), ref))
print(f"=== DEAD REFS inside deck-architect === {missing}")

# 3. Compare outputs/style-specs/ vs outputs/deck-architect/styles/
ss = root / "outputs/style-specs"
st = src / "styles"
print("=== STYLE-SPECS vs DECK-ARCHITECT/STYLES ===")
for p in sorted(ss.glob("*.md")):
    q = st / p.name
    if q.exists():
        same = p.read_bytes() == q.read_bytes()
        print(f"  {p.name}: exists in both, identical={same} (style-specs={p.stat().st_size}B, styles={q.stat().st_size}B)")
    else:
        print(f"  {p.name}: ONLY in outputs/style-specs ({p.stat().st_size}B)")
for q in sorted(st.glob("*")):
    if not (ss / q.name).exists():
        print(f"  {q.name}: ONLY in outputs/deck-architect/styles ({q.stat().st_size}B)")

# 4. Check style-specs/README.md and illustration.md references in presentation-principles.md
pp = (root / "inputs/presentation-principles.md").read_text(encoding="utf-8")
for m in re.finditer(r'`(outputs/[^`]+|inputs/[^`]+)`', pp):
    p = root / m.group(1)
    print(f"  principles ref {m.group(1)}: exists={p.exists()}")
PY`)
Ran command: Asset file sizes check (`wc -l projects/presentation-skill/outputs/deck-architect/assets/style-library.html projects/presentation-skill/outputs/deck-architect/assets/modules/*.js projects/presentation-skill/outputs/deck-architect/assets/presenter/*.js projects/presentation-skill/outputs/deck-architect/assets/modules/fx/*.js projects/presentation-skill/outputs/deck-architect/assets/components/*.css`)
Viewed linked-highlight.js:1-73
Viewed compare-slider.js:1-99
Viewed live-controls.js:1-155
Viewed code-stage.js:1-186
Viewed visual-flair.js:1-100
Viewed flow-carousel.js:1-179
Viewed coverflow.js:1-199
Viewed annotator.js:1-232
Viewed grid-overview.js:1-140
Viewed speaker-view.js:1-197
Viewed core.js:1-123
Ran command: Inspect style-library.html (`python3 - <<'PY'
import pathlib, re
p = pathlib.Path("projects/presentation-skill/outputs/deck-architect/assets/style-library.html")
txt = p.read_text(encoding="utf-8")
# Replace long base64 strings for readable inspection
clean = re.sub(r'data:image/[^"\']{80,}', 'data:image/...<BASE64>...', txt)
lines = clean.splitlines()
print(f"Total lines: {len(lines)}")
# Print lines 1-140 and script section
for i, line in enumerate(lines, 1):
    if i <= 140 or i >= 1000 or any(k in line for k in ('data-style', 'stage_fit', 'stage-bar', 'badge', '常用', '推薦', 'data-stage', 'id="', 'class="card-foot', 'infinite', 'v4.')):
        print(f"{i:4d}: {line[:180]}")
PY`)
Ran command: Inspect style-library.html sections (`python3 - <<'PY'
import pathlib, re
p = pathlib.Path("projects/presentation-skill/outputs/deck-architect/assets/style-library.html")
txt = p.read_text(encoding="utf-8")
clean = re.sub(r'data:image/[^"\']{80,}', 'data:image/...<BASE64>...', txt)
lines = clean.splitlines()
print("=== HEADER & CONTROLS (lines 1-60, 420-520) ===")
for i in list(range(1, 50)) + list(range(450, 560)):
    if i <= len(lines):
        print(f"{i:4d}: {lines[i-1][:180]}")
print("=== STAGE FILTER & CARDS FOOTERS (lines 900-1080) ===")
for i in range(900, min(1080, len(lines)+1)):
    print(f"{i:4d}: {lines[i-1][:180]}")
PY`)
Ran command: Inspect style-library.html cards (`python3 - <<'PY'
import pathlib, re
p = pathlib.Path("projects/presentation-skill/outputs/deck-architect/assets/style-library.html")
txt = p.read_text(encoding="utf-8")
clean = re.sub(r'data:image/[^"\']{80,}', 'data:image/...<BASE64>...', txt)
lines = clean.splitlines()
for i, l in enumerate(lines, 1):
    if 460 <= i <= 955 and any(k in l for k in ('<header', '<h1', '<h2', '<article', 'class="card-head', 'class="card-foot', 'data-style', 'data-stages', 'data-stage', 'stage-bar', 'badge', '常用', '推薦', 'dna-row', 'planned', 'applyFilter', 'btn-mode', 'topbar', 'sub')):
        print(f"{i:4d}: {l[:180]}")
PY`)
Viewed media.js:1-413
Viewed storyboard.yaml:1-105
Ran command: Run lint.py across repo (`python3 - <<'PY'
import subprocess, pathlib
root = pathlib.Path("projects/presentation-skill/outputs")
lint = root / "deck-architect/scripts/lint.py"
targets = [
    root / "deck-architect/templates/storyboard.yaml",
    root / "deck-architect/templates/brief.md",
    root / "examples/v4-alive-demo/brief.md",
    root / "examples/v48-regression/storyboard.yaml",
    root / "examples/v45-modular-demo/storyboard.yaml",
    root / "examples/v44-keynote-demo/storyboard.yaml",
    root / "examples/v4-alive-demo/storyboard.yaml",
    root / "examples/v4-demo/storyboard.yaml",
]
for t in targets:
    if not t.exists():
        print(f"MISSING: {t}")
        continue
    r = subprocess.run(["/usr/bin/python3", str(lint), str(t)], capture_output=True, text=True)
    tail = [l for l in r.stdout.splitlines() if l.strip()][-3:]
    print(f"=== {t.relative_to(root)} (rc={r.returncode}) ===")
    for l in r.stdout.splitlines():
        if l.startswith(("[ERROR]", "[WARN]", "結果")):
            print("  ", l)
PY`)
Viewed architecture-plan.md:1-81
Viewed README.md:1-50
Viewed cmp-fallback.css:1-109
Viewed storyboard.yaml:1-140
Ran command: Read style-library.html UI & filter (`python3 - <<'PY'
import pathlib, re
p = pathlib.Path("projects/presentation-skill/outputs/deck-architect/assets/style-library.html")
txt = p.read_text(encoding="utf-8")
clean = re.sub(r'data:image/[^"\']{80,}', 'data:image/...<BASE64>...', txt)
lines = clean.splitlines()
print("=== BODY TOP (460-530) ===")
for i in range(460, 535):
    print(f"{i:4d}: {lines[i-1][:200]}")
print("=== PLANNED + FILTER (850-920) ===")
for i in range(850, 925):
    print(f"{i:4d}: {lines[i-1][:200]}")
PY`)
Ran command: Check style-library topbar & fx palette (`python3 - <<'PY'
import pathlib, re
p = pathlib.Path("projects/presentation-skill/outputs/deck-architect/assets/style-library.html")
lines = p.read_text(encoding="utf-8").splitlines()
for i in range(420, 475):
    print(f"{i:4d}: {lines[i-1][:200]}")
print("=== CHECK fx/*.js palette usage ===")
fx_dir = pathlib.Path("projects/presentation-skill/outputs/deck-architect/assets/modules/fx")
for f in sorted(fx_dir.glob("*.js")):
    if f.name == "core.js": continue
    txt = f.read_text(encoding="utf-8")
    uses = [l.strip() for l in txt.splitlines() if "palette" in l or "rgb" in l]
    print(f"  {f.name}: {uses[:3]}")
PY`)
Ran command: Check style-library card metadata (`python3 - <<'PY'
import pathlib, re
p = pathlib.Path("projects/presentation-skill/outputs/deck-architect/assets/style-library.html")
lines = p.read_text(encoding="utf-8").splitlines()
for start, end in [(585, 603), (663, 681), (767, 785), (841, 860)]:
    print(f"--- lines {start}-{end} ---")
    for i in range(start, end+1):
        print(f"{i:4d}: {lines[i-1]}")
PY`)
Ran command: Check examples directory structures (`find projects/presentation-skill/outputs/examples -maxdepth 3 | sort`)
Viewed 01-counsel.html:1-60
Viewed manifest.json:1-28
Ran command: Cross-file & engine discrepancy scan (`python3 - <<'PY'
import pathlib, re

root = pathlib.Path("projects/presentation-skill/outputs/deck-architect")

# Check 1: Does load_free_slide isolate `body`, `*`, `html` rules if someone moves a standalone HTML sample into slides/?
asm = (root / "scripts/assemble.py").read_text(encoding="utf-8")
m = re.search(r"def load_free_slide.*?(?=\n# ---)", asm, re.S)
print("=== load_free_slide CSS scoping ===")
for l in m.group(0).splitlines():
    if "scoped_styles" in l or "css_clean" in l or "re.sub" in l:
        print(" ", l)

# Check 2: Check all files mentioning "v4." version numbers or outdated terms
print("\n=== VERSION / STALE REFERENCE SCAN inside deck-architect ===")
for p in sorted(root.rglob("*")):
    if p.is_file() and p.suffix in (".md", ".py", ".mjs", ".js", ".css", ".html", ".json", ".yaml"):
        txt = p.read_text(encoding="utf-8", errors="ignore")
        rel = p.relative_to(root).as_posix()
        hits = []
        # Check for outdated concepts
        for pat, desc in [
            (r"三種風格.*樣張|不同風格憲法", "old 3-style Gate2 wording"),
            (r"原則 #?\d+", None),
            (r"15 項|13 項|11 項|7 項", "check count"),
            (r"Stage Spec|步驟 1[ab]?", None),
            (r"上次偏好|品味記憶", "taste memory"),
            (r"body\s*\{", None),
        ]:
            if desc:
                for mm in re.finditer(pat, txt):
                    ln = txt[:mm.start()].count("\n") + 1
                    hits.append(f"L{ln}:{desc}: {mm.group(0)}")
        if hits:
            print(f"  {rel}: {hits[:6]}")

# Check 3: Compare styles/index.json signature_motions vs style-library.html dna-row vs motion kits
idx = __import__("json").loads((root / "styles/index.json").read_text(encoding="utf-8"))
sl_html = (root / "assets/style-library.html").read_text(encoding="utf-8")
print("\n=== STYLE-LIBRARY vs INDEX.JSON ===")
for st in idx["styles"]:
    if st["status"] != "ready": continue
    sid = st["id"]
    sigs = st["motion_dna"]["signature_motions"]
    # extract dna-row for this card
    m = re.search(rf'data-id="{sid}".*?<div class="dna-row">(.*?)</div>', sl_html, re.S)
    tags = re.findall(r'class="kit-code">([^<]+)<', m.group(1)) if m else []
    print(f"  {sid:12s} | index.json sig={sigs} | style-library tags={tags}")

# Check 4: Check all 4 motion kits for initial-slide boot
print("\n=== MOTION KITS INITIAL-SLIDE BOOT CHECK ===")
for f in sorted((root / "assets/modules/motion").glob("*.js")):
    txt = f.read_text(encoding="utf-8")
    has_initial = "deck.slides[deck.index]" in txt or "Promise.resolve().then" in txt
    print(f"  {f.name:16s}: boots on initial slide? {has_initial}")
for f in sorted((root / "assets/modules").glob("*.js")):
    txt = f.read_text(encoding="utf-8")
    has_initial = "deck.slides[deck.index]" in txt or "Promise.resolve().then" in txt
    print(f"  {f.name:20s}: boots on initial slide? {has_initial}")
PY`)
Ran command: Free-canvas vs lint coverage audit (`python3 - <<'PY'
import pathlib, re
root = pathlib.Path("projects/presentation-skill/outputs")
for demo in ["v4-demo", "v4-alive-demo", "v44-keynote-demo", "v45-modular-demo", "v48-regression"]:
    d = root / "examples" / demo
    sb = (d / "storyboard.yaml").read_text(encoding="utf-8")
    slides = sorted((d / "slides").glob("*.html")) if (d / "slides").is_dir() else []
    print(f"=== {demo}: {len(slides)} free-canvas slides ===")
    # Check if storyboard has body text vs slides/*.html
    import yaml
    data = yaml.safe_load(sb)
    c = data.get("constraints") or {}
    print(f"  stage_mode={data.get('meta',{}).get('stage_mode')} style={data.get('meta',{}).get('style')} nav_mode={data.get('meta',{}).get('nav_mode')} constraints={list(c.keys())}")
    # Check for simplified chars in built deck.html or slides/*.html
    sys.path.insert(0, str(root / "deck-architect/scripts")) if 'sys' in globals() else None
import sys
sys.path.insert(0, str(root / "deck-architect/scripts"))
from deck_model import SIMPLIFIED_CHARS, TRANSITION_PHRASES
for demo in ["v4-demo", "v4-alive-demo", "v44-keynote-demo", "v45-modular-demo", "v48-regression"]:
    d = root / "examples" / demo
    for f in sorted((d / "slides").glob("*.html")) if (d / "slides").is_dir() else []:
        raw = f.read_text(encoding="utf-8")
        # strip style & script & tags
        txt = re.sub(r"<(style|script)\b.*?</\1>", "", raw, flags=re.S|re.I)
        txt = re.sub(r"<[^>]+>", " ", txt)
        sc = sorted({ch for ch in txt if ch in SIMPLIFIED_CHARS})
        tp = [p for p in TRANSITION_PHRASES if p in txt.lower()]
        if sc or tp:
            print(f"  LEAK in {demo}/{f.name}: simplified={sc} transitions={tp}")
PY`)
Ran command: Free-canvas slide audit (`/usr/bin/python3 - <<'PY'
import pathlib, re, sys, yaml
root = pathlib.Path("projects/presentation-skill/outputs")
sys.path.insert(0, str(root / "deck-architect/scripts"))
from deck_model import SIMPLIFIED_CHARS, TRANSITION_PHRASES

for demo in ["v4-demo", "v4-alive-demo", "v44-keynote-demo", "v45-modular-demo", "v48-regression"]:
    d = root / "examples" / demo
    sb = (d / "storyboard.yaml").read_text(encoding="utf-8")
    data = yaml.safe_load(sb)
    slides_dir = d / "slides"
    slides = sorted(slides_dir.glob("*.html")) if slides_dir.is_dir() else []
    c = data.get("constraints") or {}
    print(f"=== {demo}: {len(slides)} free slides | stage={data.get('meta',{}).get('stage_mode')} style={data.get('meta',{}).get('style')} nav={data.get('meta',{}).get('nav_mode')} constraints={list(c.keys())} ===")
    # Check storyboard text vs slide html text
    for sl in data.get("slides") or []:
        if sl.get("file"):
            p = d / sl["file"]
            if p.exists():
                raw = p.read_text(encoding="utf-8")
                txt = re.sub(r"<(style|script)\b.*?</\1>", "", raw, flags=re.S|re.I)
                txt = re.sub(r"<[^>]+>", " ", txt)
                txt = re.sub(r"\s+", " ", txt).strip()
                sc = sorted({ch for ch in txt if ch in SIMPLIFIED_CHARS})
                tp = [ph for ph in TRANSITION_PHRASES if ph in txt.lower()]
                forb = [fb for fb in (c.get("forbidden") or []) if fb.lower() in txt.lower()]
                if sc or tp or forb:
                    print(f"  LEAK in {sl['file']}: simplified={sc} transitions={tp} forbidden={forb}")
                sb_keys = [k for k in sl.keys() if k not in ("type","chapter","title","layout","file","notes","source","director","signature","surface","nav","transition","link","appendix","id","unlisted")]
                print(f"  {sl['file']:28s} | sb_content_keys={sb_keys} | html_chars={len(txt)}")
PY`)
Ran command: Verify data-mode CSS & slide scripts (`python3 - <<'PY'
import pathlib, re

root = pathlib.Path("projects/presentation-skill/outputs")
shell = (root / "deck-architect/assets/shell.css").read_text(encoding="utf-8")
print("=== shell.css mentions of data-mode ===")
for i, l in enumerate(shell.splitlines(), 1):
    if "data-mode" in l:
        print(f"  L{i}: {l}")

tdeck = (root / "deck-architect/templates/deck.css").read_text(encoding="utf-8")
print("=== templates/deck.css mentions of --bg / --accent (without light/dark prefix) ===")
for i, l in enumerate(tdeck.splitlines(), 1):
    if re.search(r"--(?:bg|fg|accent)\s*:", l):
        print(f"  L{i}: {l}")

print("=== v48-regression deck.css & slides data-surface ===")
v48 = root / "examples/v48-regression"
print((v48 / "deck.css").read_text(encoding="utf-8")[:600])
for f in sorted((v48 / "slides").glob("*.html")):
    head = f.read_text(encoding="utf-8").splitlines()[:3]
    print(f"  {f.name}: {head[0]}")

print("=== Check all examples for window.__deck inside slides/*.html ===")
for f in sorted((root / "examples").rglob("slides/*.html")):
    txt = f.read_text(encoding="utf-8")
    if "__deck" in txt:
        print(f"  {f.relative_to(root)}: uses __deck")
PY`)
Ran command: Compare example deck.css files (`head -n 35 projects/presentation-skill/outputs/examples/v44-keynote-demo/deck.css projects/presentation-skill/outputs/examples/v45-modular-demo/deck.css projects/presentation-skill/outputs/examples/v4-alive-demo/deck.css`)
Ran command: Verify v48-regression deck.html (`python3 - <<'PY'
import pathlib, re
html = pathlib.Path("projects/presentation-skill/outputs/examples/v48-regression/deck.html").read_text(encoding="utf-8")
# Check slide 1 (cover) and slide 9 (closing) tags
for m in re.finditer(r'<section\b[^>]*id="s-(\d+)"[^>]*>', html):
    print(f"Slide {m.group(1)}: {m.group(0)[:180]}")
# Check html tag
print("HTML tag:", html.splitlines()[1])
# Check script order near end
for i, l in enumerate(html.splitlines()[-30:], 1):
    if "<script" in l or "</script>" in l:
        print(f"  tail: {l[:120]}")
PY`)

### 最新狀態與總結論

- **現況確認**：專案在 `presentation-skill-generation` 分支、最新 commit `c2bfaf8`（`deck-architect` v4.8），工作樹乾淨；`outputs/deck-architect.skill` 與 `outputs/deck-architect/` 共 83 檔 SHA-256 完全一致，無死連結；`lint.py` 實跑所有現行範例與示範 `brief.md` 皆 0 錯。
- **總體判斷**：**大方向沒有走偏**——兩大主柱的分工、主柱邊界（呈現決定延到 Step 3a）、故事種子、主題類型總表與三層按需引擎骨架都已對齊你的第一性原理。**但是**，全流程逐檔交叉檢核＋實碼追蹤後，仍發現 **4 個全流程／第一性原理級的結構矛盾**、**5 個進入真實簡報 PK 一定會踩到的引擎 Bug**，以及 **5 處口徑不一致**。

---

### 一、全流程與第一性原理的 4 個結構矛盾

#### 1. 【嚴重｜主柱二閉環斷裂】Step 3b「樣張驗收」與「樣張零浪費直接變正式頁」格式互斥，且 `--sheet` 停在舊流程
- **規格說法**：[SKILL.md](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/SKILL.md#L98-L107) 與 [samples.md](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/references/samples.md#L45-L72) 要求 Step 3b 從 `templates/deck.css` 建 `deck.css`、套配方與風格動態原語畫 2–3 張真實樣張，用 `assemble.py --sheet`＋`check.mjs --sheet` 驗證（並在 `sheet.html` 附上三組 OKLCH 配色對照與理由），拍板後**直接把樣張移入 `slides/` 成為正式頁與活範本**。
- **實際工具鏈矛盾**：
  1. [check.mjs](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/scripts/check.mjs#L586-L590) 的 `--sheet` 是直接用瀏覽器打開 `samples/*.html` 裸檔，**不經過 `assemble.py`**，完全沒注入 `shell.css`、`deck.css`、`runtime.js` 或 `motion-*-kit`。若寫成 `slides/` 可沿用的 `<section class="slide canvas">` 片段，裸開直接無樣式且動態原語（如 `data-ruler-progress`、`data-odometer`）空白失效；若像舊範例 [01-counsel.html](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/examples/v4-demo/samples/01-counsel.html#L10-L18) 硬寫成獨立 HTML，移進 `slides/` 時，[assemble.py](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/scripts/assemble.py#L467-L474) 只改寫 `.slide` 與 `:root`，不會刪掉 `body { ... }`，會直接污染整份 `deck.html` 的全域排版，也吃不到切換配色後的 `deck.css`。
  2. [assemble.py](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/scripts/assemble.py#L1197-L1248) 的 `build_sheet()` 預設副標仍是 v4.0 三風格比較舊文案（「依不同風格憲法…」），且**沒有任何渲染「三組 OKLCH 配色色票＋主題理由」的機制**。
- **建議**：讓 `assemble.py --sheet` 用同一套輕底盤＋`deck.css`＋按需模組替 `samples/*.html` 片段產生暫時預覽供 `check.mjs --sheet` 截圖，並支援 `manifest.json` 的 `palettes` 欄位渲染三組色票與理由。**理由**：讓「樣張即正式頁片段、零重寫搬進 `slides/`」在實戰裡真的跑得通。

#### 2. 【嚴重｜防線破洞】「`storyboard.yaml` 是唯一內容來源」與「90%+ 自由畫布 (`slides/*.html`)」脫鉤，安全網形同虛設
- **矛盾處**：[SKILL.md](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/SKILL.md#L33) 與 [templates/storyboard.yaml](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/templates/storyboard.yaml#L1-L2) 仍宣稱「`storyboard.yaml` 是唯一內容來源，改字一律改這裡再重跑 `lint.py` 與 `assemble.py`」。但實查 5 個 v4 範例，自由畫布頁的真正內文全在 `slides/*.html`（每頁 200–700 字），`storyboard.yaml` 往往只有 `title`＋`director`，且 [assemble.py](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/scripts/assemble.py#L402-L481) 不會拿 `storyboard.yaml` 覆寫自由畫布文字。
- **違背原則**：[lint.py](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/scripts/lint.py#L238-L257) 把關的 `constraints.forbidden`（地雷詞 ERROR）、`must_include`、`sensitivity`（「你們」）、過場廢話、簡體字、每頁最多 1 處重點與字數上限，**全部沒掃 `slides/*.html`**，`check.mjs` 也沒查。一旦 Step 4（尤其是 >6 頁分批子代理）寫出地雷詞或殘留簡體字，三道品管會全部 0 錯放行——直接違背 [ROADMAP.md](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/ROADMAP.md#L117)「規則能寫成腳本檢查就寫成腳本」。
- **建議**：① 誠實釐清分工（`storyboard.yaml` 是架構、導航、備註與約束的 SSOT；自由畫布文字在 `slides/*.html`）；② 讓 `assemble.py`（或 `lint.py`）對實際渲染的自由畫布可見文字重跑地雷詞、必放項、「你們」、過場語、簡體字與 `<mark class="em">` 數量檢查。**理由**：避免 Step 1b 談好的地雷與語氣防線在 Step 4 自由畫布階段默默失靈。

#### 3. 【中～高｜主柱一張力】「引導用戶提出想法、不循規蹈矩」vs「全題強制『（推薦）』表單＋`briefing` 也套硬 ERROR」
- **錨定偏誤矛盾**：[CLAUDE.md](file:///home/antigravity/mingming2-alya/claude-base-skills/CLAUDE.md#L50-L57) 與 [grill.md](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/references/grill.md#L26) 要求每一張表單都把推薦答案放第一標「（推薦）」。這在**收斂決策題**（選場合、選架構、選風格）很有效；但在**發散挖掘題**（如無舊檔時的 Step 1a 故事種子、Step 1b 細節補充），把 Agent 憑空猜的選項標成「（推薦）」會讓使用者反射點選，反而滑向 [grill.md](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/references/grill.md#L29) 自己警惕的「Agent 出選項、使用者挑」。
- **場合儀式感矛盾**：[lint.py](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/scripts/lint.py#L633-L671) 的 `lint_brief()` 只分「標準／快速」，沒按 `stage_mode` 調檔。哪怕標準模式做 `briefing`（日常決策會議，[grill.md](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/references/grill.md#L107) 明言不硬挖煽情故事），`lint_brief()` 仍把「故事種子（寫『無』還警告要再追問）」「體感預期」「候選 A/B/C（破框）」全部列為硬 ERROR；此外 [lint.py](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/scripts/lint.py#L161-L162) 把 5 章以上鎖成硬 ERROR，比 [presentation-principles.md](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/inputs/presentation-principles.md#L32) 的「盡量不超過 3 個，超過用目錄」嚴苛，可能卡住真正需要 5 幕的破框敘事。
- **建議**：① `grill.md` 區分「發散引導題」（無素材線索時不標「（推薦）」，只給思考引子鼓勵自填）與「收斂建議題」（必標「（推薦）」並依原則 #34 附理由）；② `lint_brief()` 依 `stage_mode` 調檔（`briefing` 不把故事種子與破框候選當硬 ERROR）；5 章改為強 `[WARN]`。**理由**：守住「顧問腦力激盪而非官僚填表」的第一性原理。

#### 4. 【中｜主柱二錯位】「依內容主題選風格極致」與 `style-library.html` 介面及招牌動態對不上
- **介面錯位**：[contexts.md](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/references/contexts.md#L29) 確立「主題優先，場合只校準」，但 Step 3a 展示的 [style-library.html](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/assets/style-library.html#L434-L439) 頂部只有 `briefing / pitch / keynote` 場合篩選，完全沒標每款風格對應〈主題類型總表〉的哪些主題。
- **招牌動態脫鉤**：圖鑑底部 `.dna-row` 標籤與 [styles/index.json](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/styles/index.json#L79-L153) 的 `signature_motions`（也是 `check.mjs`「風格契合」的計分依據）對不上：
  - `workday`（[L593-598](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/assets/style-library.html#L593-L598)）漏列 `data-ruler-progress`；`apple`（[L775-781](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/assets/style-library.html#L775-L781)）漏列 `data-colorize-wipe`。
  - `illustration` 卡（[L848-854](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/assets/style-library.html#L848-L854)）活體預覽演的是「素模→暖彩光掃」（實為 `apple` 的 `colorize-wipe` 語意），並未演示自家招牌 `popup-fold` 或 `chat-replay`。
- **建議**：每張圖鑑卡補上〈主題類型總表〉的主題標籤，並將 `.dna-row` 與 `styles/index.json` 的 `signature_motions` 完全對齊。**理由**：確保使用者在 Step 3a 看到的視覺×動態預期，與 Step 5「風格契合」稽核的是同一套東西。

---

### 二、實戰必踩的 5 個引擎與底盤 Bug

1. **【P0】`templates/deck.css`＋`shell.css` 讓 `meta.mode` 與 OKLCH 配色在未標 `data-surface` 的頁面上全部失效**
   - [templates/deck.css](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/templates/deck.css#L21-L43) 只設 `--light-*`／`--dark-*`，而 [shell.css](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/assets/shell.css#L24-L40) 全檔沒有 `html[data-mode="light|dark"]` 映射，[assemble.py](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/scripts/assemble.py#L442-L443) 與 [L661-662](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/scripts/assemble.py#L661-L662) 也不會替未寫 `surface:` 的頁面補上 `data-surface`。
   - **後果**：即便是 `meta.mode: dark`（如 `apple`）或客製藍色 OKLCH，所有內建頁（封面、目錄、結尾、`status-table`、`pillars`、快速模式頁，連 `v48-regression` 的封面與結尾皆如此）及未逐頁寫 `surface:` 的自由畫布頁，全部退回 `shell.css` 硬寫死的淺米白 `#F1EFEA`＋深綠 `#0D6B4F`。
   - **修法**：在 `shell.css` 補上 `html[data-mode="light"]` 與 `html[data-mode="dark"]` 映射（或讓 `assemble.py` 預設填入 `data-surface="{mode}"`）。

2. **【P0】腳本順序倒置＋首頁（封面）動態全面啞火**
   - [assemble.py](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/scripts/assemble.py#L1081-L1084) 輸出順序為 `slide_js` → `runtime_js` → `module_js`。
   - **後果**：① 頁內 `<script>` 若照 [motion-system.md](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/references/motion-system.md#L126) 呼叫 `window.__deck.stage` 直接噴 `TypeError`（連配方 [interactive-proof.md](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/references/recipes/interactive-proof.md#L65) 都得寫 `setTimeout(calc, 0)` 繞道）；② [runtime.js](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/assets/runtime.js#L1437) 在 `module_js` 載入前就同步執行 `go(start - 1, true)`，且 4 套風格動態套件（[workday-kit.js](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/assets/modules/motion/workday-kit.js#L125-L133)、[counsel-kit.js](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/assets/modules/motion/counsel-kit.js#L191-L198)、[apple-kit.js](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/assets/modules/motion/apple-kit.js#L227-L235)、[story-kit.js](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/assets/modules/motion/story-kit.js#L90-L97)）皆未補觸發首頁，`go(..., true)` 也跳過 `animateSlideContent()`——導致開門第 1 頁封面掛 `data-split-mask`、`data-spotlight-sweep`、`data-popup-fold` 或 `data-beat`/`data-draw` **一打開完全靜止**。
   - **修法**：改為 `runtime_js` → `module_js` → `slide_js`，並讓非 `?still=1` 首頁進場時正常觸發首頁動態與 4 套套件。

3. **【P1】`ambient-fx` 漏修 OKLCH 讀色，遇 `templates/deck.css` 全退回預設藍**
   - [fx/core.js](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/assets/modules/fx/core.js#L15-L37) 的 `parseRgb()` 只認 `#hex` 與 `rgb(...)`。搭配 `templates/deck.css` 的 `oklch(...)` 變數時，6 種 Canvas 氛圍特效一律靜默退回寫死藍色（`99,179,237`／`37,99,235`），違背原則 #17。
   - **修法**：比照 `check.mjs` 用 1×1 canvas 像素換算，通吃 OKLCH 與 `color-mix()`。

4. **【P1】`templates/deck.css` 的 `top-bar` 上邊距誤傷封面／震撼／結尾與內嵌導航頁；`check.mjs` 未查導航外殼**
   - [templates/deck.css](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/templates/deck.css#L54-L55) 的 `html[data-nav-mode="top-bar"] .slide.canvas:not([data-nav])` 會把 `padding-top: 124px` 套到沒有頂列的 `cover`、`shock`、`closing` 以及未明寫 `data-nav="inline"` 的 `<nav data-auto-nav>` 頁。應收窄為 `[data-kind="content"]:not([data-nav]):not(:has([data-auto-nav]))`。
   - [check.mjs](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/scripts/check.mjs#L421) 只掃 `.slide` 內部，不檢查同層的 `#nav`／`#tabs`／`#nav-side` 對比與邊界。

5. **【P2】四個邊角實戰細節**
   - [runtime.js](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/assets/runtime.js#L1397)：按 `End` 跳到 `slides.length - 1`，若有附件頁會直接跳進附件（應跳最後一頁主線 `mainIndices[mainIndices.length - 1]`）。
   - [grid-overview.js](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/assets/presenter/grid-overview.js#L62)：刪光縮圖複本內所有 `[id]`，會破壞 SVG `<defs>` 的 `url(#...)` 漸層與遮罩；[speaker-view.js](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/assets/presenter/speaker-view.js#L42) 的 `total` 誤含附件頁數。
   - [assemble.py](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/scripts/assemble.py#L993-L996)：漏檢 [modules-catalog.md](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/references/modules-catalog.md#L50) 訂的 `keynote` `ambient-fx` 上限（≤2 頁）。
   - [lint.py](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/scripts/lint.py#L652) 檢 `delivery` 用無單詞邊界子字串匹配（寫到 `autoplay`/`ready` 會誤報 ERROR）；[L356](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/scripts/lint.py#L356) 檢 `pillars` 用含 `unlisted` 的全部章節清單，會逼總覽頁劇透藏牌。

---

### 三、5 處規格口徑不一致與殘留債

1. **雙份分叉的風格規格目錄**：`outputs/style-specs/`（舊 11-19 版）與 `outputs/deck-architect/styles/`（v4.8 現行版）同名檔案已全面分叉，但 [presentation-principles.md](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/inputs/presentation-principles.md#L83-L85) 與 [ROADMAP.md](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/ROADMAP.md#L29) 仍指回舊目錄，易誤導後續 Agent。
2. **「擺動聚光燈」與 `.flow-token` 殘留**：v4.7.2 已廢止無限擺動，但 [styles/index.json](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/styles/index.json#L34)、[styles/apple.md](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/styles/apple.md#L78) 與 [apple-kit.css](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/assets/modules/motion/apple-kit.css#L22) 仍寫「擺動／Swinging」；[shell.css](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/assets/shell.css#L304-L307) 殘留 `.flow-token`（`infinite` 動畫），一用就會被 `check.mjs` 第 14 項打槍。
3. **`counsel` 禁陰影與自家套件小衝突**：[styles/counsel.md](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/styles/counsel.md#L14) 寫「零圓角、零陰影、零漸層」，但專屬套件 [counsel-kit.css](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/assets/modules/motion/counsel-kit.css#L99) 的 `[data-rack-focus]` 加了 `0 18px 38px` 彩色外陰影。
4. **`oklch.py` 與 `templates/deck.css` 色碼格式斷層**：[oklch.py](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/scripts/oklch.py#L28-L34) 只收 `#hex`，而 `templates/deck.css` 寫 `oklch(...)`；補上雙向支援與直接輸出 CSS 變數可省去手動換算。
5. **Step 3a 衝突回寫遺漏**：[samples.md](file:///home/antigravity/mingming2-alya/claude-base-skills/projects/presentation-skill/outputs/deck-architect/references/samples.md#L33) 在「3a 後補分鏡」未提醒：若因 `avoid_motions` 改用風格原生做法，須同步清掉 Step 2 的 `director.module`；此外 `flow-carousel="chat"`（Step 1b）與 `data-chat-replay`（Step 3a）功能重疊，宜明訂適用邊界。

---

### 四、建議收口順序（附理由）

1. **優先修 P0/P1（真實簡報 PK 前必做）**：修好「Step 3b `--sheet` 樣張與 `slides/` 同源＋三組色票」「`shell.css` 支援 `data-mode` 接通 `templates/deck.css`」「腳本順序＋首頁動態」「`fx/core.js` OKLCH 讀色」「自由畫布文字回接 `constraints`/簡體字檢查」「`templates/deck.css` `top-bar` 選擇器」。**理由**：這幾處全是拿真實簡報從 Step 1a 跑到成品時會立刻撞到的硬斷層，先清零才不會讓 PK 浪費在除錯底盤上。
2. **同步微調主柱一／二兩處體驗摩擦**：`grill.md` 區分發散題不加「（推薦）」與 `lint_brief()` 依 `stage_mode` 調檔；`style-library.html` 補主題標籤與對齊 `signature_motions`；順手清完 5 處口徑債並重打包 `deck-architect.skill`。**理由**：改動範圍小且與真實簡報 PK 最想驗證的兩件事（主柱一引導提想法＋主柱二依主題選極致風格）直接相關。
3. **完成後立即進真實簡報 PK**，用實戰結果反推 Phase D（補齊其餘 8 款風格與主題覆蓋度）。

*(本次僅做唯讀稽核，未修改任何檔案；確認要啟動上述第 1＋2 項收口修補後即可直接落實、重測並同步回 repo。)*