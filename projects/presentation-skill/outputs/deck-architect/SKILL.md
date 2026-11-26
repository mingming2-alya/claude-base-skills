---
name: deck-architect
description: 架構先行的簡報製作技能（v4.4）：先以設計樹前沿（Design Tree + Frontier）互動表單 Grill 釐清理性終點、體感預期、對象前置著陸（Grounding）、場合舞台光譜（briefing/pitch/keynote）、承重母題、說服載體與按需引擎模組，並以 Design It Twice 必給跳脫思維破框候選；再以單一視覺關卡提供三款對準 brief 契約的多元風格樣張與 OKLCH 配色；最後以「輕底盤、強自由＋7 項按需自動注入模組」混合架構產出圖文融合、真文字可編輯、通過真實像素 WCAG 與 11 項動態品管的 HTML 簡報。只要使用者想做、規劃、改寫任何簡報、PPT、投影片、deck、提案、報告、分享、演講、發表會、年度成果、會議簡報、客戶洽談、活動開場、教學課程，或說「幫我想簡報架構」「這份報告要怎麼講」，都應使用此技能。Use for any presentation / slides / pitch deck / talk request.
---

# Deck Architect v4.4：設計樹定調，按需組裝舞台

信念：**簡報的成敗在架構與說服載體，驚豔來自依場合開合的舞台光譜、風格憲法與自由畫布**。先當「架構師 × 創意總監」把路徑、體感預期、破框切法與呈現期待逼清楚（由此決定下游按需注入哪些模組），再端出真正兌現預期的三款風格樣張，最後以「輕底盤、強自由」產出高品質 HTML 簡報。

使用者只在**三個關卡**拍板，其餘自動完成：

1. **Grill 設計樹前沿清空時（⛔ 關卡一）**：確認 `brief.md`（雙重目標、Stage Spec 舞台光譜與按需模組、承重母題、架構與頁數算術、逐章說服載體與資產地圖、限制與地雷）
2. **看完風格與配色樣張時（⛔ 關卡二）**：從三款真正拉開差距的風格（含明暗策略與三組 OKLCH 配色）中定調
3. **看完成品時（⛔ 關卡三）**：檢視成品、截圖與品管報告並回饋修改

在這三個關卡**務必停下、以互動表單（若有表單工具）確認、等使用者回覆**。

## 工作目錄

每份簡報建立獨立資料夾（預設 `./decks/<簡短英文名>/`）：

```text
decks/<name>/
├── brief.md                 # Step 1：Grill 設計樹交接契約（Stage Spec、按需模組、母題、載體地圖、限制）
├── storyboard.yaml          # Step 2：唯一內容來源（敘事、章節、每頁形狀與 surface/nav、constraints）
├── deck.css                 # Step 4：這份簡報的風格與雙極 OKLCH 配色變數（--light-* / --dark-*）
├── samples/                 # Step 3：Gate 2 樣張（2–3 頁 × 3 方向）＋ sheet.html / sheet.jpg
├── slides/                  # Step 4：逐頁自由編排 HTML 片段（01-cover.html 等）
├── assets/                  # 可選：使用者提供或生成的靜態圖／底圖／海報（自動 Base64 內嵌）
├── media/                   # 可選：外連影片／實測音檔（保持相對路徑，不轉 Base64）
├── IMAGE_UPGRADE.md         # 可選：AI 升級生圖清單（零等待程式版同步附上）
├── deck.html                # Step 4：assemble.py 掛載輕底盤與按需模組產出的成品
└── check/                   # Step 5：check.mjs 逐頁截圖與真實像素 WCAG＋11 項動態品管報告
```

## 架構模式：輕底盤、強自由 ＋ 7 項按需自動注入模組

- **核心輕底盤（`assemble.py` 常駐掛載，零外部依賴 100% 離線播放）**：1920×1080 舞台縮放、單頁極性 `data-surface="dark|light|split|photo"` 與外殼反差同步、三種導航模式 `nav_mode`（`top-bar`／`minimal-side`／`divider-only`）＋全模式自動隱藏底控膠囊與 2px 進度條、可打斷 60fps 六種敘事切頁與 `data-morph` Magic Move、雙軌節拍（視覺指引 `data-focus-plan`/`data-transform-at`/`data-draw`/`data-wipe`/`data-pop`/`data-ripple`/`data-count` ＋講者點擊步進 `data-step`/`data-step-only`/`data-step-hide`）、附件點入返回、SVG `<defs>` ID 隔離、本機靜態圖與影片 `poster` 內嵌、講者備註（`N`）、靜態凍結（`B`／`?still=1`）、全螢幕（`F`）、列印 PDF（`P`）。
- **七項按需自動注入模組（`assets/modules/`，掃描投影片按需載入，未用到 0 KB）**：`components`（商務元件 CSS）、`ambient-fx`（`data-fx` Canvas 2D 氛圍層）、`live-controls`（互動滑桿樣式）、`fit`（自動縮字）、`media`（`<video data-slide-video>`／`<audio data-sound-demo>` 外連影音控制）、`flow-carousel`（`[data-flow-carousel]` 活產品流程輪播卡）、`coverflow`（`[data-coverflow]` 3D 照片輪播）。
- **自由編排畫布（預設 90%+ 頁面）**：依 `brief.md` 的 **Stage Spec（`briefing`/`pitch`/`keynote`）**、選定 **Style DNA** 與 `references/visual-guidance.md`，在 `slides/XX-*.html` 撰寫最貼題的 HTML／CSS／SVG（CSS 選擇器加 `.slide` 前綴確保跨頁零汙染）。
- **旗艦外掛（按需、先問過）**：日常不載入外部動效庫；僅在旗艦專案需要異形 MorphSVG、影片級時間軸或 WebGL 時，徵詢同意後透過 `#stage` 生命週期事件掛載。

## 流程

### Step 1｜設計樹 Grill → `brief.md`　⛔ 關卡一

讀 `references/grill.md` 與 `references/contexts.md`。遵循**先查事實、只問決定**與**設計樹前沿（不設輪次上限，直到前沿清空、零靜默假設）**，有表單工具時一律用互動表單（每張 2–4 題互不依賴、推薦項放第一標「（推薦）」）：

1. **Pre-Flight 靜默偵察**：先讀完使用者提供的所有舊檔、簡報、模板與數據，主動查核關鍵數字並盤點既有圖片／照片／影音／原話。
2. **根節點定調**：釐清理性終點 × **體感預期（Audience Feeling）**、對象起點與 **Grounding 基線**、拍板三段式舞台光譜 **`stage_mode`**（`briefing`/`pitch`/`keynote`，依場合決定明暗雙極、去框比例、導航與點擊步進）、時長與頁數算術、人際顧慮，以及單獨先問先讀既有框架。
3. **Explore × Design It Twice**：挖掘**承重母題（Leading Motif）**，讀 `references/structure.md` 提出 3 個本質不同約束的架構候選——**標準模式全面必給至少 1 個跳脫思維破框候選**（既有框架必列其一），並給出有主見的比較推薦或混搭建議。
4. **內容 × 說服載體（Proof Medium）× 按需能力對齊**：逐章定出唯一記憶點、Grounding 順序與最適說服載體（實物剖面／原話暗房／外連影音／HTML5 活流程輪播／3D 照片輪播／去框編輯／結構化卡片），點破素材缺口並將具體呈現期待對應到 7 項按需模組清單；核實證據口徑、限制與不承諾、地雷與高光控場。
5. **完成門檻**：設計樹前沿全空後寫出 `brief.md`（`templates/brief.md`），**停下來等使用者確認**。

### Step 2｜架構展開 → `storyboard.yaml`

讀 `references/presentation-rules.md` 與 `references/content-shapes.md`，把 `brief.md` 展開成逐頁內容（格式見 `templates/storyboard.yaml`）：設定 `meta.stage_mode`／`meta.nav_mode`／`meta.delivery` 與單頁 `surface`/`nav`/`transition`、將限制與地雷寫入 `constraints`、標出招牌頁 `signature: true`、把口頭補充移進 `notes`。接著執行：

```bash
python3 <skill>/scripts/lint.py decks/<name>/storyboard.yaml
```

修完所有 ERROR（WARNING 須修正或於架構摘要說明），呈交一頁**架構摘要**（章節、每頁題目、內容形狀、極性與說服載體、頁數算術與震撼頁位置）。

### Step 3｜單一視覺關卡（對準 `brief.md` 契約）→ `samples/sheet.jpg`　⛔ 關卡二

讀 `references/samples.md`、`styles/index.json` 與 `styles/color-system.md`：

1. 直接吃進 `brief.md` 的 **Stage Spec、Leading Motif 與 Proof Medium 地圖**，挑出 **3 個外觀與舞台質感截然不同的方向**（穩健／大膽／驚喜）。
2. 讀入對應 Style DNA（`styles/<id>.md`），以真實內容自由編排每方向 **2–3 頁**（封面＋招牌頁＋異形狀／異極性頁，絕不超過 3 頁），並依 `stage_mode` 兌現對應的明暗策略與去框化程度；同步跑 `scripts/oklch.py --palette` 驗證三組主題配色（禁純白純黑、禁紫漸層 H 280–335、三組 ΔE ≥ 15）。
3. 產生並排總覽並自動像素品管：

```bash
python3 <skill>/scripts/assemble.py --sheet decks/<name>/samples
node <skill>/scripts/check.mjs --sheet decks/<name>/samples
```

4. **親自看過 `samples/sheet.jpg`**（灰階仍真的不同、兌現 `stage_mode`、主標題最大、對比通過），再用互動表單請使用者選風格、明暗策略與配色，**停下來等回覆**。

### Step 4｜製作 → `deck.html`（＋可選 `IMAGE_UPGRADE.md`）

1. 將選定的 `style`、`mode`／雙極配色變數（`--light-*`／`--dark-*`）寫入 `storyboard.yaml` 與 `deck.css`。
2. 讀 `references/visual-guidance.md` 與 `references/motion-system.md`，依 `stage_mode` 與 Style DNA 逐頁在 `slides/` 撰寫自由畫布：
   - **實物與無字底圖優先**：有真實素材或生圖工具時，優先融合實物照／16:9 無字底圖與 HTML 真文字層（反左右割裂構圖）；無圖時先以程式版呈現並包入 `.asset-slot[data-slot]`。
   - **依場合開合極性與去框**：`briefing` 穩健單底色＋高紀律卡片；`pitch`/`keynote` 依規格運用 `data-surface` 光暗反差與五大去框／融合原型（白棚裸數爆炸圖、羽化融圖 Bento、35/65 分割、物象軌跡、原話暗房／光學信號燈）。
   - **雙軌節拍與按需模組**：先定靜態動線，再編 `data-focus-plan`／`data-transform-at`／`data-draw`／`data-wipe`／`data-morph`，關鍵 1–3 懸念頁用 `data-step`，依 Step 1 對齊結果掛載 `<video data-slide-video>`、`<audio data-sound-demo>`、`[data-flow-carousel]`、`[data-coverflow]` 或 `.live-ctrl`。
3. 組裝單檔簡報（`assemble.py` 自動按需注入模組、內嵌靜態圖與影片海報、保留外連影音相對路徑）：

```bash
python3 <skill>/scripts/assemble.py decks/<name>/storyboard.yaml --write-upgrade-list
```

若有待升級 `.asset-slot`，補齊 `IMAGE_UPGRADE.md`（`templates/image-upgrade.md`）。

### Step 5｜品管 → `check/`

```bash
node <skill>/scripts/check.mjs decks/<name>/deck.html --motion
```

`check.mjs` 先以 `?still=1` 檢驗真實背景像素 WCAG 對比（含漸層字）、主標題≥總結、溢出與邊界、最小字級、SVG 重複 ID 與圖片／腳本錯誤；加 `--motion` 則自動實測最多 **11 項**動態與 v4.4 引擎指標（連按打斷、Magic Move、互動滑桿、低耗電凍結、附件返回、視覺指引復原、SVG 描繪原語、`data-surface` 極性同步、`nav_mode`＋底控自動隱藏、`data-step` 雙軌步進與回翻、外連影音離頁歸零與原生輪播切換）。接著**親自看截圖**（含場合節奏與去框化、靜態動線、去小字程度、斷行美感），有問題修對應 `slides/` 或 `storyboard.yaml` 後重建，**最多修 2 輪**；未解項如實回報。

### Step 6｜交付　⛔ 關卡三

告知使用者：檔案位置與快捷鍵（`← →`／空白鍵翻頁、`F` 全螢幕、`N` 備註、`B` 靜態省電、`P` 列印 PDF）、一句話架構總結、品管最低對比與動態實測結果、未解項與可選 `IMAGE_UPGRADE.md`。透過互動表單收集回饋修改。

## 九條核心鐵律

1. **先有架構與著陸順序，再寫內容**：主體章節沿單一軸單一方向前進，每頁只倚賴聽眾已自帶或前文已著陸（Grounded）的概念。
2. **章節名稱只在一處定義**（`storyboard.yaml` 的 `chapters`），導航輕重依 `stage_mode`（`top-bar`/`minimal-side`/`divider-only`）由底盤同步。
3. **總結永遠不當主標題**：主標題只寫路標（≤12 字）且為頁面最大最先見之字；總結放在內文。
4. **畫布留視覺錨點，講者稿歸 `notes`（原則 #26）**：一般群組 ≤2 層文字；僅「原話暗房證言」「產品發表級情感短句」「活流程步進微標」合法豁免。
5. **依場合決定光暗與去框**：`briefing` 守單底色＋高紀律卡片；`pitch`/`keynote` 啟用光暗反差與去框化編輯排版，拒絕全場單調卡片化。
6. **重點只用顏色標示**（不畫底線、不用斜體），每頁最多一處 `==重點==`；不寫過場廢話。
7. **震撼頁稀少、有鋪陳且具反差**：全場 0–2 次、間隔 ≥3 頁、打破常規導航（唯開場提問 `role: opener` 例外）。
8. **裝飾可與文字交錯，可讀性由真實像素 WCAG 把關**：禁純白純黑、禁紫漸層、變暗不等於夜晚。
9. **關掉圖與動態仍完整可讀**：所有動態 60fps 可打斷且支援 `?still=1`／`B` 鍵／列印完美定格；真文字隨時可編輯。

## 參考檔索引（按需載入，單一真相來源）

| 檔案 | 什麼時候讀 |
|---|---|
| `references/grill.md` | Step 1 開始時（設計樹前沿、先查事實只問決定、母題、載體辯論與缺口點破） |
| `references/contexts.md` | Step 1 判斷 `stage_mode` 三段舞台光譜、播放密度、計畫轉成果、快速模式時 |
| `references/structure.md` | Step 1 推導單軸架構、Grounding 檢查、Design It Twice 破框提案與 Keynote 戲劇層時 |
| `references/presentation-rules.md` | Step 2 展開內容、原則 #26 與豁免、導航分級、繁體在地化、Step 5 品管時 |
| `references/content-shapes.md` | Step 2–4 判斷內容形狀（14 結構＋5 圖表）與容量上限時 |
| `references/samples.md` | Step 3 吃進 `brief.md` 契約挑三款風格與做 Gate 2 樣張時 |
| `references/visual-guidance.md` | Step 4–5 規劃場合光暗節奏、去框五大原型、靜態動線、聚光壓暗與雙軌節拍／媒體時 |
| `references/motion-system.md` | Step 4 撰寫自由畫布 60fps 切頁／Magic Move／數據動畫／互動控件時 |
| `references/progress-report.md` | 定期進度回報、多單位 PPTX 檢核（`check_reports.py`）時 |
| `styles/index.json`、`styles/color-system.md`、`styles/<id>.md` | Step 3–4 撰寫樣張、推薦三組 OKLCH 配色與編排每一頁時 |
| `templates/brief.md`、`templates/storyboard.yaml`、`templates/image-upgrade.md` | 建立對應產出物與撰寫反左右割裂生圖提示詞時 |
