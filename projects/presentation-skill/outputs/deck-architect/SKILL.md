---
name: deck-architect
description: 架構先行的簡報製作技能（v4.7.5）：第一步拆為兩階段設計樹腦力激盪——Step 1a 先做「架構腦力激盪」（Pre-Flight 靜默偵察、雙重目標、場合光譜 briefing/pitch/keynote、承重母題與 3 選 1 破框架構，拍板骨架才往下走），Step 1b 再做「細節腦力激盪」（依場合調檔挖故事反差、白話招牌亮點頁提案、內容減法清單、素材缺口、數字查核與地雷收斂，寫成 brief.md）；Step 2 展開每頁 4 行視覺分鏡與第二核心視覺指引；Step 3 採「靜態上限 × 動態上限融合」Style & Motion Library（3a 親手體驗 1920×1080 活體舞台並挑中 1 款風格 → 3b 集中精雕該風格 2–3 張真實樣張＋3 組 OKLCH 配色，樣張直接沿用為活範本）；Step 4 超過 6 頁自動每 3–4 頁派乾淨分身並行精雕，按需細粒度注入三層引擎（Layer 0 輕底盤＋Layer 1 G/A/L/S 講者工具＋Layer 2 內容模組與 4 套風格動態原語套件，未用到 0 KB、自動跨界防呆）；Step 5 執行真實像素 WCAG＋15 項動態與行動實測（含閱讀期靜止檢核與 390px 手機檢核）＋生動度稽核（Liveliness Audit）。只要使用者想做、規劃、改寫任何簡報、PPT、投影片、deck、提案、報告、分享、演講、發表會、年度成果、會議簡報、客戶洽談、活動開場、教學課程，或說「幫我想簡報架構」「這份報告要怎麼講」，都應使用此技能。Use for any presentation / slides / pitch deck / talk request.
---

# Deck Architect v4.7.5：主題導向 × 風格動態一體 × 按需注入舞台

信念：**簡報的成敗在架構與說服載體，生動度必須依場合開合、並靠「先拍骨架再雕細節、先分鏡、看圖鑑、乾淨分身精雕、雙門檻體檢」守住上下限**。日常匯報絕不浮誇、守住三秒掃讀；提案與發表會則從第一步就種下故事反差與招牌亮點頁，讓真實簡報跟 Demo 一樣鮮活。

使用者在**三大階段的關鍵關卡**拍板，其餘自動完成：

1. **兩階段腦力激盪（⛔ 關卡 1a ＋ ⛔ 關卡 1b）**：
   - **Step 1a（架構腦力激盪 → ⛔ 關卡 1a）**：先鎖定雙重目標、`stage_mode`、頁數算術、承重母題與 3 選 1 架構骨架（絕不在錯骨架上浪費腦力）
   - **Step 1b（細節腦力激盪 → ⛔ 關卡 1b）**：沿鎖定骨架挖逐章記憶點、招牌亮點頁、內容減法、素材缺口、數字查核與地雷，簽核 `brief.md`
2. **選風格與看真實樣張時（⛔ 關卡 2a ＋ ⛔ 關卡 2b）**：Step 3a 先從 Style & Motion Library 融合圖鑑挑中 **1 款風格** → Step 3b 集中火力檢視該風格的 **2–3 張真實高工藝樣張＋3 組 OKLCH 配色**拍板
3. **看完成品時（⛔ 關卡 3）**：檢視成品、截圖與雙門檻品管報告並回饋修改

在這些關卡**務必停下、以互動表單（若有表單工具）確認、等使用者回覆**。

## 工作目錄

每份簡報建立獨立資料夾（預設 `./decks/<簡短英文名>/`）：

```text
decks/<name>/
├── brief.md                 # Step 1a+1b：架構＋細節兩階段腦力激盪交接契約（骨架、Stage Spec、亮點頁、減法清單、限制）
├── storyboard.yaml          # Step 2：唯一內容來源（敘事、章節、逐頁 4 行 director 分鏡、constraints）
├── deck.css                 # Step 4：這份簡報的風格與雙極 OKLCH 配色變數（--light-* / --dark-*）
├── samples/                 # Step 3b：選定風格的 2–3 張真實高工藝樣張（確認後直接沿用為活範本）
├── slides/                  # Step 4：逐頁自由編排 HTML 片段（>6 頁採每 3–4 頁分批精雕）
├── assets/                  # 可選：使用者提供或生成的靜態圖／底圖／海報（自動 Base64 內嵌）
├── media/                   # 可選：外連影片／實測音檔（保持相對路徑，不轉 Base64）
├── IMAGE_UPGRADE.md         # 可選：AI 升級生圖清單（零等待程式版同步附上）
├── deck.html                # Step 4：assemble.py 掛載三層輕底盤與按需模組產出的成品
└── check/                   # Step 5：check.mjs 逐頁截圖、像素 WCAG＋15 項動態與行動實測＋生動度體檢報告
```

## 架構模式：三層按需架構（亂中有序治理，未用到 0 KB）

- **Layer 0 核心輕底盤（常駐，零外部依賴 100% 離線）**：1920×1080 舞台縮放（含 `?noscale=1`）、單頁極性 `data-surface="dark|light|split|photo"`、三種 `nav_mode`（`top-bar`／`minimal-side`／`divider-only`）＋自動隱藏底控膠囊與 2px 進度條、60fps 六種切頁與 `data-morph` Magic Move、雙軌節拍（自動視覺指引＋講者點擊步進 `data-step`）、中央 Overlay 優先級註冊表（`Esc` 順序：`annotator > lightbox > grid > appendix`）、SVG `<defs>` ID 隔離、本機靜態圖與影片海報內嵌、備註（`N`）、靜態（`B`／`?still=1`）、全螢幕（`F`）、列印（`P`）。
- **Layer 1 講者臨場工具（`assets/presenter/`，依 `delivery` 自動掛載）**：`talk`/`discuss` 預設載入 `grid`（`G` 總覽）、`annotator`（`A` 畫筆＋`L` 雷射＋`C` 清除）、`speaker`（`S` 雙螢幕講者台）；`read`/`auto` 僅載 `grid`；可用 `meta.presenter_tools` 覆寫。
- **Layer 2 按需內容模組（細粒度掃描注入，決策表見 `references/modules-catalog.md`）**：細粒度 `components/*`（含 `device-frame`）、單特效 `ambient-fx/*`（6 種讀色票 Canvas）、`live-controls`、`fit`（含 `data-fit="box"`）、`media`（影片片段循環＋倍速＋全螢幕／音訊＋`data-sound-ab`）、`flow-carousel`（4 模式）、`coverflow`（含 `data-marquee`＋燈箱）、`linked-highlight`、`compare-slider`、`code-stage`、`visual-flair`（`data-zoomable`＋`data-tilt`≤5°＋`data-spotlight-hover`）、4 套風格專屬動態原語套件（`motion-{workday,counsel,apple,story}`）。
- **軟性防呆（`[WARN]` 不卡死）**：`assemble.py` 針對單頁多主角衝突、`stage_mode` 場合超額、風格跨界動效（`avoid_motions`）與 `meta.modules` 白名單漂移發出提醒。

## 流程

### Step 1a｜架構腦力激盪（Architecture Brainstorm）　⛔ 關卡 1a

讀 `references/grill.md`（第一、二節）、`references/contexts.md` 與 `references/structure.md`。遵循**先查事實、只問決定**與**設計樹前沿**，有表單工具時一律用互動表單（每張 2–4 題互不依賴、推薦項放第一標「（推薦）」）：

1. **Pre-Flight 靜默偵察**：先讀完使用者提供的所有舊檔、簡報、模板與數據，主動查核關鍵數字並盤點既有圖片／照片／影音／原話。
2. **根節點定調（節點群 A）**：釐清理性終點 × 體感預期、對象起點與 Grounding 基線、拍板三段式 **`stage_mode`（`briefing`／`pitch`／`keynote`）**、時長與頁數算術、人際顧慮，以及先問先讀既有框架。
3. **Explore × Design It Twice（節點群 B）**：挖掘承重母題，讀 `references/structure.md` 提出 3 個本質不同架構候選（標準模式必給至少 1 個跳脫思維破框候選）並給出有主見推薦。
4. **⛔ 關卡 1a 骨架拍板**：呈交精簡架構骨架（雙重目標、`stage_mode`、頁數算術、承重母題、選定軸線與章節停靠點＋分鐘數），**停下來透過互動表單等使用者拍板骨架**，絕不在錯的架構上展開細節。（*快速模式自動將 1a＋1b 合併壓縮為 1–2 輪 ≤5 題快篩*）

### Step 1b｜細節腦力激盪（Detail & Craft Brainstorm）→ `brief.md`　⛔ 關卡 1b

架構骨架於 1a 鎖定後，讀 `references/grill.md`（第三節）與 `references/modules-catalog.md`，沿既定章節挖深內容與說服力：

1. **依 `stage_mode` 三段自動調檔之逐章挖礦、白話亮點頁提案與減法（節點群 C）**：
   - **`briefing`**：不硬挖煽情故事；聚焦唯一風險與拍板點，重點做**內容減法提案**（長文移進 `notes`、守住三秒掃讀），視需要最多提 1 個務實亮點（如架構聯動／點擊放大）。
   - **`pitch`**：抓 1 個核心痛點反差 ＋ 用白話提案 **1–2 個實用互動頁**（不丟模組術語！）＋ 減法提案。
   - **`keynote`**：完整挖出痛點瞬間、前後反差與原話 ＋ 用白話提案 **2–3 個招牌亮點頁** ＋ 減法提案。
   - 逐章敲定唯一記憶點、Grounding 順序、說服載體（Proof Medium）與素材缺口補法（Gap-Naming）；Agent 幕後自動映射到 `references/modules-catalog.md` 與 `styles/index.json` 風格 `motion_dna`。
2. **可信度、控場與地雷收斂（節點群 D）**：核對關鍵數字出處與口徑、定出限制／禁用說法／必放項（`constraints`）、拍板高光震撼頁與講者點擊步進（`data-step`／藏牌）、收斂一句話核心訊息。
3. **⛔ 關卡 1b 簽核 `brief.md`**：彙整 1a＋1b 寫進 `brief.md`（`templates/brief.md`），**停下來透過互動表單等使用者確認**後才進 Step 2。

### Step 2｜架構展開 ＋ 逐頁 4 行視覺分鏡 → `storyboard.yaml`

讀 `references/presentation-rules.md`、`references/content-shapes.md` 與 **第二核心 `references/visual-guidance.md`**（四大靜態動線、空間分群與單向語意順序），把 `brief.md`（含減法清單與招牌亮點頁）展開成 `storyboard.yaml`（`templates/storyboard.yaml`）：
- 將長段背景與口白歸入 `notes`，畫布只留視覺錨點。
- 為頁面補上輕量 4 行 **`director:` 分鏡**（`hero` 視覺主角、`archetype` 對應 `references/recipes/`、`module` 觸發模組、`choreo` 視覺指引動線與單向語意節拍）：`briefing` 僅標關鍵 2–3 頁即可；`pitch`/`keynote` 建議逐頁填寫，防止 Step 4 退回純文字卡片。
- 執行並修完所有 ERROR：

```bash
python3 <skill>/scripts/lint.py decks/<name>/storyboard.yaml
```

呈交一頁**架構與分鏡摘要**（章節、每頁題目、視覺主角、極性與頁數算術）。

### Step 3｜兩階段視覺關卡（融合圖鑑快選 → 單風格高工藝樣張）　⛔ 關卡 2a ＋ 2b

讀 `references/samples.md`、`references/visual-guidance.md`（**第二核心：靜態動線、空間分群、底部基線、3 拍語意順序與靜止閱讀窗**）、`styles/index.json` 與 `styles/color-system.md`：

1. **Step 3a｜風格 × 動態 DNA 融合圖鑑快選（⛔ 關卡 2a）**：
   - 展示 `assets/style-library.html`（收錄 4 款 1920×1080 靜態×動態融合就緒風格：`workday`、`counsel`、`apple`、`illustration`，支援淺／深切換、3 拍語意重播、直接互動、全螢幕放大與 `?stage=` 場合高亮），並以互動表單推薦最適合本場 `stage_mode` 的款式，請使用者**先挑中 1 款風格**（以及偏好明暗策略）。
2. **Step 3b｜用選定風格集中精雕 2–3 張真實樣張 ＋ 3 組 OKLCH 配色（⛔ 關卡 2b）**：
   - 讀入 `styles/<selected>.md`、`styles/index.json` 該風格的 `motion_dna` 與對應 `references/recipes/*.md` 黃金工藝配方，只針對使用者挑中的這 1 款風格，用真實內容畫出 **2–3 張高工藝樣張**（封面＋核心招牌亮點頁＋異構圖／異極性頁，同步立住**靜態美感上限＋視覺指引動線＋專屬動態原語**）並跑 `scripts/oklch.py --palette` 驗證 3 組 OKLCH 配色。
   - 執行像素品管並**親自看過 `samples/sheet.jpg`**：

```bash
python3 <skill>/scripts/assemble.py --sheet decks/<name>/samples
node <skill>/scripts/check.mjs --sheet decks/<name>/samples
```

3. 以互動表單請使用者確認這組風格與配色，**停下來等回覆**。拍板後的這 2–3 張真實樣張**直接保留為正式 `slides/` 頁面**（零浪費），並成為 Step 4 的「活範本（Live Style Anchor）」。

### Step 4｜分批精雕（乾淨上下文分身）→ `deck.html`（＋可選 `IMAGE_UPGRADE.md`）

1. 將選定的 `style`、`mode` 與 OKLCH 雙極變數寫入 `storyboard.yaml` 與 `deck.css`，把 Step 3b 已確認的 2–3 張樣張移入 `slides/`。
2. 依總頁數採最穩定的精雕節奏（防止長對話上下文疲勞導致後面幾頁退化為純文字方塊）：
   - **≤ 6 頁**：主代理依 `director:`、`references/visual-guidance.md`、`references/recipes/` 與按需模組子手冊逐頁撰寫其餘 `slides/*.html`。
   - **> 6 頁（強烈建議，快速模式可省略）**：將剩餘頁面拆成 **每 3–4 頁一小批**，並行派給乾淨上下文子代理精雕。每個子代理必吃 6 樣精準輸入：① `brief.md` Stage Spec 與母題摘要、② `deck.css`、③ Step 3b 已通過的 2–3 張真實樣張（**活範本**）、④ **第二核心 `references/visual-guidance.md`**（七種假指引反模式、靜態動線、空間分群、底部基線與靜止閱讀窗）、⑤ 僅該批 3–4 頁的 `storyboard.yaml`（含 `director:`）、⑥ 該批用到的 1–2 支 `references/recipes/*.md` 與對應 `references/modules/*.md`。主代理最後統一確認跨頁 `data-morph` 與節奏連貫。
3. 組裝單檔簡報（三層細粒度注入＋軟性 `[WARN]` 場合與風格跨界防呆＋本機靜態圖與影片海報內嵌）：

```bash
python3 <skill>/scripts/assemble.py decks/<name>/storyboard.yaml --write-upgrade-list
```

若有待升級 `.asset-slot`，補齊 `IMAGE_UPGRADE.md`（`templates/image-upgrade.md`）。

### Step 5｜雙門檻品管（下限安全 ＋ 視覺指引 ＋ 上限生動度）＋ 視覺精修輪 → `check/`

```bash
node <skill>/scripts/check.mjs decks/<name>/deck.html --jpg --motion
```

- **下限品管與視覺指引（必過）**：`?still=1` 真實背景像素 WCAG 對比（含漸層字）、主標題≥總結、溢出與邊界、最小字級、SVG 重複 ID、圖片／腳本錯誤，加上 `--motion` 最多 **15 項**動態與行動實測（含聚光壓暗歸零、SVG 真描線、Layer 1 `G`/`A`/`L`/`S`、Layer 2 說服模組、**閱讀期靜止檢核反永動**、**390px 手機橫向溢出實測**）。
- **上限生動度稽核（Liveliness Audit，依 `stage_mode` 自動調檔）**：自動量測視覺頁佔比、去框化比例、動態原語多樣性與連續純文字單調頁，點名全場最平淡的 1–3 頁。
- **視覺精修輪（Polish Pass）**：親自看過 `check/slide-*.jpg` 並對照 `visual-guidance.md` 第六節 6 條人工檢核（三秒靜態動線、空間分群、底部基線、去小字不回潮），若下限有錯、或 `pitch`/`keynote` 生動度未達標，針對點名頁面升級圖解／互動並重建，**最多修 2 輪**；未解項如實回報。

### Step 6｜交付　⛔ 關卡 3

告知使用者：檔案位置與快捷鍵（`← →`／空白鍵翻頁、`G` 總覽、`A` 畫筆、`L` 雷射筆、`S` 雙螢幕講者台、`F` 全螢幕、`N` 備註、`B` 靜態、`P` 列印 PDF）、一句話架構總結、品管最低對比＋動態與生動度實測結果、未解項與可選 `IMAGE_UPGRADE.md`。透過互動表單收集回饋修改。

## 九條核心鐵律

1. **先有架構與著陸順序，再寫內容**：主體章節沿單一軸單一方向前進，每頁只倚賴聽眾已自帶或前文已著陸（Grounded）的概念。
2. **章節名稱只在一處定義**（`storyboard.yaml` 的 `chapters`），導航輕重依 `stage_mode`（`top-bar`/`minimal-side`/`divider-only`）由底盤同步。
3. **總結永遠不當主標題**：主標題只寫路標（≤12 字）且為頁面最大最先見之字；總結放在內文。
4. **畫布留視覺錨點，講者稿歸 `notes`（原則 #26）**：一般群組 ≤2 層文字；僅「原話暗房證言」「產品發表級情感短句」「活流程步進微標」合法豁免。
5. **依場合決定光暗、去框與生動度**：`briefing` 守乾淨單底色與三秒掃讀；`pitch`/`keynote` 啟用光暗反差、去框編輯與招牌互動頁。
6. **重點只用顏色標示**（不畫底線、不用斜體），每頁最多一處 `==重點==`；不寫過場廢話。
7. **震撼頁稀少、有鋪陳且具反差**：全場 0–2 次、間隔 ≥3 頁、打破常規導航（唯開場提問 `role: opener` 例外）。
8. **裝飾可與文字交錯，可讀性由真實像素 WCAG 把關**：禁純白純黑、禁紫漸層、變暗不等於夜晚。
9. **關掉圖與動態仍完整可讀**：所有動態 60fps 可打斷且支援 `?still=1`／`B` 鍵／列印完美定格；真文字隨時可編輯。

## 參考檔索引（漸進揭露按需載入，單一真相來源）

| 檔案 | 什麼時候讀 |
|---|---|
| `references/grill.md` | **Step 1a（架構腦力激盪）＆ Step 1b（細節腦力激盪）**：兩階段設計樹前沿、挖故事反差、白話亮點頁提案與減法清單 |
| `references/contexts.md` | Step 1a 判斷 `stage_mode` 三段舞台光譜、播放密度、計畫轉成果、快速模式時 |
| `references/structure.md` | Step 1a 推導單軸架構、Grounding 檢查、Design It Twice 破框提案與 Keynote 戲劇層時 |
| `references/modules-catalog.md` | **Step 1b ＆ Step 4 一頁決策表**（Layer 0/1/2 模組總覽、場合預算上限與禁止規則） |
| `references/modules/{media-and-gallery,interactive-explainers,presenter-and-fx,style-motion-kits}.md` | 按需：僅打開實際會用到的模組與風格綁定動態原語子手冊 |
| `references/recipes/{bento-causal,linked-diagram,interactive-proof,product-story,editorial-drama}.md` | **Step 3b ＆ Step 4 按需載入**：5 支精選高工藝 HTML/SVG/Motion 黃金配方 |
| `assets/style-library.html`、`references/samples.md` | Step 3a 風格×動態一體圖鑑快選 → Step 3b 單風格高工藝樣張與活範本交接 |
| `references/presentation-rules.md` | Step 2 展開內容、原則 #26 與豁免、導航分級、繁體在地化、Step 5 品管時 |
| `references/content-shapes.md` | Step 2–4 判斷內容形狀（14 結構＋5 圖表）與容量上限時 |
| `references/visual-guidance.md` | **第二核心（Step 2–5 全程必讀）**：四大靜態動線、空間分群、底部基線、聚光壓暗、3 拍語意節拍與靜止閱讀窗 |
| `references/motion-system.md` | Step 4 撰寫自由畫布 60fps 切頁／Magic Move／風格動態原語／迪士尼物理守則時 |
| `references/progress-report.md` | 定期進度回報、多單位 PPTX 檢核（`check_reports.py`）時 |
| `styles/index.json`、`styles/color-system.md`、`styles/<id>.md` | **單一「主題→風格→動態 DNA」資料庫**：Step 1b/3–4 匹配風格與動態原語、推薦三組 OKLCH 配色時 |
| `templates/brief.md`、`templates/storyboard.yaml`、`templates/image-upgrade.md` | 建立對應產出物與撰寫反左右割裂生圖提示詞時 |


