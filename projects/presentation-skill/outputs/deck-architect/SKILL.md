---
name: deck-architect
description: 兩大主柱驅動的簡報架構與互動舞台技能（v5.0）：【主柱 1｜架構與內容】以資深顧問視角經透明 5 道關卡拍板破框架構、去重 brief 與逐頁 slide_plan 分鏡；【主柱 2｜排版與呈現】拿最關鍵 1 頁真實內容並行繪製 3 套風格活體比稿與混搭建議，定版 deck.css 活範本確認沒走鐘後，100% 派乾淨上下文 Builder 子代理與單輪 Critic 交付從容慢板互動 HTML 簡報與 PDF。凡規劃、製作或改寫任何簡報、投影片、PPT、deck、提案、報告、演講、發表會、年度成果、週報或教學課程皆適用。Use for any presentation, slides, pitch deck or talk.
---

# Deck Architect v5.0：兩大主柱 × 透明五關 × 乾淨子代理極致舞台

## 兩大核心主柱與職責邊界

1. **主柱一｜架構與內容（Gate 1a → Gate 1b）**：先站在該主題標竿與最挑剔受眾視角定義**單軸架構與破框敘事骨架**（1a），再將減法後的視覺錨點、認知任務與空間分鏡收斂進**去重版 `brief.md` 與 `storyboard.yaml` 逐頁 `slide_plan`**（1b）。
2. **主柱二｜排版與呈現（Gate 2a → Gate 2b → Gate 3）**：以**靜態三秒看懂因果 × 從容慢板動態引導視線**為核心——拿使用者最關鍵的 **1 頁真實內容**並行畫出 **3 套風格活體比稿**（2a），合成定版 `deck.css` 與活範本確認**沒走鐘**（2b），再 **100% 由乾淨上下文 Builder 子代理**精雕全場並經 `check.mjs` ＋ **單輪只讀 Critic** 交付極致 HTML 與 PDF（3）。

---

## 兩條最高互動鐵律（全程強制遵守）

1. **⛔ 明確同意才過關**：每完成一個階段，**必須停下來以互動表單（`ask_question`）獲得使用者明確同意**，嚴禁自行跨入下一階段或一次偷跑兩關。
2. **🗺️ 進場先講目的與驗收點**：
   - **Round 0 首輪必附「全程 5 關導覽路線圖」**，讓使用者一眼掌握全局與當前位置；
   - **每次進入新階段的第一句話**，必先清楚標明：**「目前在第 X 關、這一關的目的是什麼、您只需確認哪幾件事」**。
   - 每個推薦選項都必須寫明**扣回本案事實（受眾、場合、素材、限制）的具體理由**，並在關卡表單主動附上**推薦方案最弱的一點／最沒把握的假設**邀請挑戰（防被動同意）。

---

## 全流程五道透明關卡（5-Gate State Machine）

```text
Round 0（讀舊檔＋亮出全程 5 關路線圖＋收硬限制與心中講法）
  ──同意──▶ ⛔ Gate 1a（拍板架構骨架、Out of Scope 與 30 秒邏輯鏈）
  ──同意──▶ ⛔ Gate 1b（簽核去重 brief ＋ 逐頁 slide_plan ＋ 文字確認想看的 3 個風格方向）
  ──同意──▶ ⛔ Gate 2a（3 位乾淨 Builder 並行畫最關鍵 1 頁真實活體比稿 ＋ 混搭建議）
  ──同意──▶ ⛔ Gate 2b（合成 deck.css ＋ 定版活範本 1–2 頁，花 1 輪確認視覺動效沒走鐘）
  ──同意──▶ ⛔ Gate 3 （全頁 Builder 子代理精雕 ＋ 步進分鏡條 ＋ 單輪 Critic → HTML 與 PDF 收尾）
```

> **快速模式（例行週會／趕時間）**：Round 0 硬限制照問 → 合併為單輪精簡架構與逐頁清單確認（Gate 1b）→ **跳過 Gate 2a/2b 與 Critic**，直接派乾淨 Builder 子代理套用推薦風格產出 `deck.html` 送 Gate 3。

---

## 工作目錄結構（預設 `./decks/<name>/`）

```text
decks/<name>/
├── fragments.md             # Round 0 起：素材碎片簿（寫前重讀磁碟、靜默追加使用者原話與想法）
├── brief.md                 # Gate 1b：去重瘦身版顧問契約（~14 欄，過 lint.py，不重複抄逐章長文）
├── storyboard.yaml          # Gate 1b 起：章節、逐頁 slide_plan、備註與 constraints 唯一真相來源
├── samples/                 # Gate 2a：關鍵 1 頁之 3 套風格活體 HTML 比稿；Gate 2b：色票與合成驗證
├── deck.css                 # Gate 2b 定版：字體聲音、雙極 OKLCH 配色與全風格從容慢板參數
├── slides/                  # Gate 2b 活範本 ＋ Gate 3 乾淨 Builder 子代理撰寫之逐頁 HTML 片段
├── deck.html                # Gate 3：assemble.py 三層按需組裝之 100% 離線單檔互動成品
├── deck.pdf                 # Gate 3：check.mjs --pdf 產出之 1920×1080 列印級靜態 PDF
└── check/                   # check.mjs 逐頁截圖、像素 WCAG、步進分鏡條 filmstrip-sXX.jpg 與品管報告
```

---

## 各階段執行規範

### Round 0 ＆ Gate 1a｜架構與敘事骨架腦力激盪　⛔ 關卡 1a
讀 `references/grill.md`、`references/contexts.md` 與 `references/structure.md`：
1. **Round 0 靜默偵察 ＋ 亮出 5 關路線圖**：先讀完所有既有檔案／數據（不給診斷避免錨定），亮出上方 5 關路線圖，用一張表單問齊 **① 既有檔案／起手狀態、② 使用者心中的講法（發散題不標推薦）、③ 架構硬限制複選題（誰上台／誰能改結構／頁數含不含封面目錄／指定模板／會後寄送）、④ 標準或快速模式**。同步將使用者原話靜默追加進 `fragments.md`。
2. **定調與破框候選（Design It Twice）**：釐清雙重目標（理性終點 × 體感預期）、主／次受眾與 Grounding、標竿盲點處置、`stage_mode`、重點碎片 ⭐ 與 `Out of Scope`；提出 **3 個本質不同敘事候選**（候選 A 必為使用者原構想補強版；候選 C 為破框版），附**同一把尺比較**、**30 秒口述邏輯鏈**、逐章頁數配額與**最弱假設**，停在 **⛔ Gate 1a** 等使用者拍板。

### Gate 1b｜去重 `brief.md` ＋ 逐頁 `slide_plan` ＋ 預確認 3 個風格方向　⛔ 關卡 1b
讀 `references/grill.md`（第三節）、`references/content-shapes.md` 與 `references/presentation-rules.md`：
1. **建立去重版 `brief.md` 與 `storyboard.yaml`**：
   - 若深挖細節發現某章證據懸空、反方質疑需前置或頁數失衡，**立即回退微調 Gate 1a 骨架**。
   - 把長段背景、補充口徑與 `limitations` 收進**內容減法清單**並寫入 `storyboard.yaml` 的 `notes` 或 `appendix`（`lint.py` 不逼進主頁畫布）。
   - 為每頁內容填寫結構化 **`slide_plan`**：
     - `job`：7 類認知任務擇一（`magnitude` 量體｜`delta` 對比｜`mechanism` 機制因果｜`triage` 狀態拍板｜`demo` 實證操演｜`resonance` 共鳴停頓｜`scaffold` 教學演練／正反範例／步驟清單）；
     - `reveal`：`0-step`（`briefing`/`read` 預設，進頁從容自動展開）或 `step(N)`（`talk`/`discuss` 單頁具 ≥3 個依序推導區塊、提前露出會破梗或分散聽覺時啟用，`N ≤ 5`）；
     - `zones`：`≤4` 個空間分區配比 ＋ 單向視線順序 `1→2→3`；
     - `visual_encoding`：用哪種幾何／圖解直接取代解釋文字；
     - `anchors`：畫布核心短錨點（每卡 ≤2 層字）。
2. **必跑機械檢核**：
   ```bash
   python3 <skill>/scripts/lint.py decks/<name>/brief.md
   python3 <skill>/scripts/lint.py decks/<name>/storyboard.yaml --outline
   ```
3. **⛔ Gate 1b 表單簽核（含最後一題文字預確認 3 個風格方向）**：
   - 表單前段簽核本輪新拍板的內容減法、逐頁 `slide_plan` 清單與最沒把握的一頁；
   - **表單最後一題**依 `contexts.md`〈主題類型總表〉推薦，向使用者文字確認：**「下一關準備拿最關鍵的第 X 頁（`signature: true`）真實內容，為您畫哪 3 套風格活體樣張？」**（附推薦理由，並提示可選看磁碟 `assets/style-library.html`），等使用者同意或換方向後才派代理作畫。

### Gate 2a｜同題真實內容 3 風格並行活體比稿　⛔ 關卡 2a
讀 `references/samples.md`、`styles/index.json`、`styles/color-system.md` 與對應 `styles/<id>.md`：
1. **並行派 3 位乾淨上下文 Builder 子代理**（若使用者在 Gate 1b 已明確鎖定單一風格則派 1 位）：各自只讀負責的那 1 款風格憲法（如 `counsel`、`workday`、`apple` 或 `illustration` 支援 `airy`／`structured` 雙密度語法）、`visual-guidance.md` 與該關鍵頁的 `slide_plan`＋`fragments.md`，各產出一份**可直接按 `→` 試播從容慢板動效的單頁活體 HTML 樣張**（`samples/<style>/deck.html`）並跑過 `check.mjs --jpg --motion`。
2. 派 **1 位只讀 Critic 子代理**快速掃描 3 張截圖與分鏡條，抓出贅字或動線瑕疵（最多自修 1 輪）。
3. **⛔ Gate 2a 表單拍板**：向使用者展示 3 套真實內容活體樣張，每套附上 **「這套風格如何呈現您的真實結構」與「跨風格混搭建議（例：A 的畫廊紙面骨架 × B 的雙語意進度膠囊）」**，並讓使用者選擇單一風格或混搭組合、明暗極性與 3 組經驗證的 OKLCH 配色（`oklch.py --palette`）。

### Gate 2b｜合成 `deck.css` 與定版活範本「沒走鐘」確認　⛔ 關卡 2b
1. **無論使用者單選或混搭**，依拍板結果建立最終 `deck.css`（由 `templates/deck.css` 起始）與 `storyboard.yaml` 呈現設定（`style`、`mode`、`nav_mode`、逐頁 `surface`），並由乾淨 Builder 子代理合成 **定版活範本（`1–2` 張真實頁：`signature` 核心頁 ＋ `keynote` 反極性封面或異構圖頁；若全場主頁 ≤2 頁則直接涵蓋主頁）**，跑過 `check.mjs --jpg --motion` ＋ 單輪 Critic。
2. **⛔ Gate 2b 表單確認（必花 1 輪，防混搭或換色走鐘）**：請使用者確認這份定版活範本的視覺層次、配色面積與從容慢板動效完全沒走鐘；確認通過後，活範本直接留駐 `slides/` 作為全場標竿。

### Gate 3｜100% 子代理精雕 ＋ 單輪有界 Critic → 極致 HTML 與 PDF 收尾　⛔ 關卡 3
1. **100% Builder 職能隔離（廢除主代理手寫 HTML）**：
   - 主代理**永遠只負責顧問對話、契約檔與關卡調度**；哪怕剩餘僅 1 頁，也一律派**乾淨上下文 Builder 子代理**撰寫 `slides/*.html`（剩餘 >4 頁時拆成每 3–4 頁一批並行）。
   - **每位 Builder 子代理必讀 6 項精準輸入**：① `brief.md` 目標／受眾／限制 ＋ `fragments.md` 原話、② `styles/<selected>.md` ＋ `deck.css`、③ Gate 2b 已確認的 `slides/` 活範本 HTML、④ `references/visual-guidance.md` ＋ `references/motion-system.md`、⑤ 負責頁之 `storyboard.yaml`（含 `slide_plan`）、⑥ 對應 `references/recipes/*.md` 或 `references/modules/*.md`。
2. **組裝與純工程機械體檢**：
   ```bash
   python3 <skill>/scripts/lint.py decks/<name>/storyboard.yaml
   python3 <skill>/scripts/assemble.py decks/<name>/storyboard.yaml --write-upgrade-list
   node <skill>/scripts/check.mjs decks/<name>/deck.html --jpg --motion --pdf
   ```
   - `check.mjs` 嚴守**物理與工程真壞掉**邊界：像素 WCAG 對比、文字溢出、字級 `<18px`（註腳 `<16px`）、JS 錯誤、`#stage > .slide` 非 `absolute`、`<g data-draw>` 無效路徑、以及**全場每一頁 `data-step` 實測並自動輸出 `check/filmstrip-sXX.jpg`（`Step-0 / Mid / End` 分鏡條）**。必須 0 錯誤通過。
3. **單輪有界只讀 Critic（Bounded Single-Pass Critic）**：
   - 送審前派 **1 位乾淨只讀 Critic 子代理**檢視：`check/slide-*.jpg` ＋ `check/filmstrip-sXX.jpg` ＋ `storyboard.yaml` 的 `slide_plan` ＋ `lint.py` 軟性提醒，專審三件事：① 是否混入可改畫成圖或移入 `notes` 的解釋贅字、② 靜態三秒動線與底部基線是否平衡、③ 步進分鏡是否破梗或閃現。
   - **硬護欄**：工程指標（`check.mjs` 0 錯誤）永遠優先於主觀藝評；每關最多派 Builder 自修 **1 輪**即停，嚴禁無限重繪迴圈。
4. **⛔ Gate 3 交付與乾淨收尾在 HTML**：
   - 交付 `deck.html`、`deck.pdf`、操作快捷鍵（`← →` 翻頁／步進、`G` 總覽、`A` 畫筆、`L` 雷射、`S` 講者台、`N` 備註、`B` 靜態、`P` 列印）與品管摘要，以互動表單收集微調回饋。
   - **PPT 轉換邊界（絕不截死圖充數）**：本技能專注交付極致互動 HTML 與高清 PDF。若使用者詢問匯出可編輯 PPTX，明確告知：**請開啟一個新對話，直接將這份定案的 `deck.html` 交給 Agent 獨立轉換為文字與圖塊皆可編輯的原生 PPTX**。

---

## 九條核心鐵律

1. **透明導覽、同意才推進**：Round 0 亮全圖、進關先講目的與驗收點、未獲表單同意絕不跨關。
2. **單一真相來源與去重契約**：章節、導航、`slide_plan` 與 `notes` 只寫在 `storyboard.yaml` 一處；`brief.md` 只留 ~14 個承重決策欄位，不重複抄寫長文。
3. **總結永遠不當主標題**：主標題只寫路標（≤12 字）且為全頁最大字；核心結論放副標或錨點。
4. **畫布留視覺錨點，口白與補充口徑歸 `notes`／`appendix`**：一般卡片嚴守 ≤2 層文字；`limitations` 與口徑註腳放 `notes` 或 `appendix` 即合規。
5. **全風格敘事動效唯一標配「從容慢板」**：描線／生長 `800–1,200ms`、群組交錯 `220–320ms`、因果演變舊態停頓 `0.6s`；直接操控互動維持 `~200ms` 即時跟手、翻頁零鎖死可打斷。
6. **`0-step` 與 `data-step` 正交判準**：`briefing`/`read` 預設 `0-step`；`talk`/`discuss` 凡單頁具 ≥3 個依序推導區塊（防破梗或防聽讀分心）即啟用 `data-step`（≤5 拍）。
7. **三階字重呼吸與 75–20–5 色彩平衡**：拒絕全頁 `900` 粗黑與亮底大塊死黑壓迫；禁純白純黑底、禁紫主調（OKLCH H 280–335）。
8. **100% 子代理職能隔離 × 單輪有界 Critic**：主代理絕不手寫投影片 HTML；`check.mjs` 只擋物理與工程壞掉，美感與去贅字交單輪只讀 Critic。
9. **100% 確定性靜態終態**：`?still=1`、`B` 鍵與列印 PDF 下所有圖表、數字與多步 `data-step` 皆完整展開且像素 WCAG 達標。

---

## 參考檔按需索引（Progressive Disclosure）

| 檔案 | 何時載入 |
|---|---|
| `references/grill.md` | Round 0、Gate 1a、Gate 1b：顧問追問、重點碎片、`DESIGN-IT-TWICE`、回退觸發與 `slide_plan` 收斂 |
| `references/contexts.md` | Gate 1a／1b：判斷 `stage_mode` 與查閱〈主題類型總表〉推薦 3 套比稿風格 |
| `references/structure.md` | Gate 1a：單軸方向、Grounding、破框敘事候選與中途改架構成本判斷 |
| `references/content-shapes.md` | Gate 1b：14 核心結構＋5 圖表結構＋7 類 `slide_plan.job` 轉譯指南 |
| `references/samples.md` | Gate 2a／2b：關鍵 1 頁 3 風格並行活體比稿、混搭建議與定版活範本驗收 |
| `references/visual-guidance.md` | Gate 2／3（Builder ＆ Critic 必讀）：靜態動線、空間分群、光暗極性、`data-step` 判準與品管清單 |
| `references/motion-system.md` | Gate 2／3（Builder 必讀）：從容慢板基準、60fps GPU 鐵律、底盤原語速查與三層按需引擎 |
| `references/presentation-rules.md` | Gate 1b／3：主標題鐵律、原則 #26 豁免、導航分級、繁體台灣用語在地化 |
| `references/modules-catalog.md` ＆ `references/modules/*.md` | 按需：僅在頁面需要特定互動／影音模組或風格綁定動態原語時讀取對應子手冊 |
| `references/recipes/*.md` | Gate 2／3 按需：5 支高工藝 HTML/SVG/Motion 參考配方（風格憲法優先） |
| `references/progress-report.md` | 定期多人進度回報與 PPTX 檢核（`check_reports.py`）時 |
| `styles/index.json`、`styles/color-system.md`、`styles/<id>.md` | Gate 2／3：12 款風格庫（4 款就緒＋8 款規劃中）、雙語意與面積配比規則、各風格 DNA |
| `templates/{fragments.md,questionnaire.md,brief.md,storyboard.yaml,deck.css,image-upgrade.md}` | 各關建立對應標準產出物時 |
