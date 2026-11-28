---
name: deck-architect
description: 兩大主柱驅動的簡報架構與互動舞台技能（v5.1）：【主柱 1｜架構與內容】100% 派偵察子代理隔離原始附件、以零重讀腳本收原話碎片，不減對話輪數完成破框架構與契約子代理 slide_plan 分鏡；【主柱 2｜排版與呈現】拿最關鍵 1 頁真實內容並行繪製 3 套風格活體比稿與混搭建議，定版 deck.css 活範本確認沒走鐘後，100% 派乾淨 Builder 子代理與單輪 Critic 交付從容慢板互動 HTML 簡報與 PDF。凡規劃、製作或改寫任何簡報、投影片、PPT、deck、提案、報告、演講、發表會、年度成果、週報或教學課程皆適用。Use for any presentation, slides, pitch deck or talk.
---

# Deck Architect v5.1：兩大主柱 × 透明五關 × 全程零膨脹子代理舞台

## 兩大核心主柱與職責邊界

1. **主柱一｜架構與內容（Gate 1a → Gate 1b）**：先以偵察子代理 100% 隔離原始附件雜訊，主代理輕裝專注多輪顧問對焦（**零刪減對話輪數**），拍板**單軸架構與破框敘事骨架**（1a），再由契約起草子代理將減法錨點與空間分鏡寫入**去重版 `brief.md` 與 `storyboard.yaml` 逐頁 `slide_plan`**（1b）。
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
Round 0（偵察子代理 100% 隔離讀附件 → 亮出全程 5 關路線圖＋收硬限制與心中講法）
  ──同意──▶ ⛔ Gate 1a（多輪顧問深挖、零重讀收碎片 → 拍板架構骨架、Out of Scope 與 30 秒邏輯鏈）
  ──同意──▶ ⛔ Gate 1b（對焦細節減法 → Scribe 子代理寫去重 brief＋slide_plan → 文字預確認 3 個風格方向）
  ──同意──▶ ⛔ Gate 2a（3 位乾淨 Builder 並行畫最關鍵 1 頁真實活體比稿 ＋ 混搭建議）
  ──同意──▶ ⛔ Gate 2b（合成 deck.css ＋ 定版活範本 1–2 頁，花 1 輪確認視覺動效沒走鐘）
  ──同意──▶ ⛔ Gate 3 （全頁 Builder 子代理精雕 ＋ 步進分鏡條 ＋ 單輪 Critic → HTML 與 PDF 收尾）
```

> **快速模式（例行週會／趕時間）**：Round 0 硬限制照問（有附件同樣派偵察子代理隔離）→ 合併為單輪精簡架構與逐頁清單確認（Gate 1b）→ **跳過 Gate 2a/2b 與 Critic**，直接派乾淨 Builder 子代理套用推薦風格產出 `deck.html` 送 Gate 3。

---

## 工作目錄結構（預設 `./decks/<name>/`）

```text
decks/<name>/
├── pre-flight.md            # Round 0：偵察官子代理產出之結構化附件摘要（100% 隔離原始附件不進主對話）
├── fragments.md             # Round 0 起：素材碎片簿（一律用 scripts/fragments.py 原子追加／列舉／標星，零重讀膨脹）
├── brief.md                 # Gate 1b：Scribe 子代理產出之去重顧問契約（~14 欄，過 lint.py）
├── storyboard.yaml          # Gate 1b 起：章節、逐頁 slide_plan、備註與 constraints 唯一真相來源
├── samples/                 # Gate 2a：關鍵 1 頁之 3 套風格活體 HTML 比稿；Gate 2b：色票與合成驗證
├── deck.css                 # Gate 2b 定版：字體聲音、雙極 OKLCH 配色與全風格從容慢板參數
├── slides/                  # Gate 2b 活範本 ＋ Gate 3 乾淨 Builder 子代理撰寫之逐頁 HTML 片段
├── deck.html                # Gate 3：assemble.py 三層按需組裝之 100% 離線單檔互動成品
├── deck.pdf                 # Gate 3：check.mjs --pdf 產出之 1920×1080 列印級靜態 PDF
└── check/                   # check.mjs 逐頁截圖、像素 WCAG、步進分鏡條 filmstrip-sXX.jpg 與品管報告
```

---

## 各階段執行規範（主代理全程輕裝：不讀原始附件、不重讀碎片簿、不手寫 YAML/HTML）

### Round 0 ＆ Gate 1a｜架構與敘事骨架腦力激盪（對話輪數零刪減）　⛔ 關卡 1a
主代理僅載入 `references/grill.md`、`references/contexts.md` 與 `references/structure.md`（嚴禁預載主柱二視覺／模組檔）：
1. **Round 0「100% 原始附件絕對隔離」＋ 亮出 5 關路線圖**：
   - **鐵律**：只要使用者提供任何既有檔案或附件（**無論檔案大小或格式**，含中途補傳檔案），**主代理嚴禁直接讀取任何原始附件**！一律派 **1 位乾淨只讀「偵察官子代理（Pre-Flight Recon Subagent）」**讀完全部附件，依 `templates/pre-flight.md` 寫出 `decks/<name>/pre-flight.md` 並用 `fragments.py add` 寫入初始原話種子，**僅回傳第 1–3 節客觀事實摘要（≤ 600 tokens）給主代理**（舊稿結構診斷留待使用者說完心中講法後才動用，防錨定）。中途若需追查某附件細節，同樣派輕量查詢子代理翻閱回報。
   - 亮出上方 5 關路線圖，用一張表單問齊 **① 既有檔案／起手狀態、② 使用者心中的講法（發散題不標推薦）、③ 架構硬限制複選題（誰上台／誰能改結構／頁數含不含封面目錄／指定模板／會後寄送）、④ 標準或快速模式**。
2. **零重讀收碎片 ＋ 破框候選深挖（Design It Twice）**：
   - 每輪收到使用者原話，主代理只呼叫原子追加指令（終端僅回 1 行確認，消滅多輪 `O(R²)` 全文重讀副本）：
     ```bash
     python3 <skill>/scripts/fragments.py add decks/<name>/fragments.md "原話想法 1" "原話想法 2"
     ```
   - 挑重點碎片 ⭐ 那一輪才執行一次 `python3 <skill>/scripts/fragments.py list decks/<name>/fragments.md`，使用者拍板後執行 `fragments.py star`。
   - 完整保留多輪深度顧問問答：釐清雙重目標、主／次受眾與 Grounding、標竿盲點處置、`stage_mode`、重點碎片 ⭐ 與 `Out of Scope`；提出 **3 個本質不同敘事候選**（候選 A 必為使用者原構想補強版；候選 C 為破框版），附**同一把尺比較**、**30 秒口述邏輯鏈**、逐章頁數配額與**最弱假設**，停在 **⛔ Gate 1a** 等使用者拍板。

### Gate 1b｜多輪細節減法對焦 ＋ 契約起草子代理產出 `slide_plan` ＋ 預確認 3 個風格方向　⛔ 關卡 1b
1. **主代理專注內容硬化與減法對焦（不減對話輪數）**：
   - 若深挖細節發現某章證據懸空、反方質疑需前置或頁數失衡，**立即回退微調 Gate 1a 骨架**。
   - 與使用者拍板每章反方拆彈、關鍵數字口徑、資產缺口補法，並把長段背景、補充口徑與 `limitations` 收進**內容減法清單**（歸入 `notes` 或 `appendix`）。
2. **派「契約起草子代理（Contract Scribe Subagent）」分流寫檔與 Lint**：
   - 主代理**不親自載入範本與寫長篇 YAML**；將已拍板決策摘要交給 **1 位乾淨上下文 Contract Scribe 子代理**，由子代理讀取 `pre-flight.md`、`fragments.md`、`references/content-shapes.md`、`references/presentation-rules.md` 與 `templates/{brief.md,storyboard.yaml}`，撰寫去重版 `brief.md`（~14 欄）與 `storyboard.yaml` 逐頁 `slide_plan`（`job` 7 類：`magnitude | delta | mechanism | triage | demo | resonance | scaffold`、`reveal: 0-step | step(N)`、`zones ≤ 4`、`visual_encoding`、`anchors`），並執行：
     ```bash
     python3 <skill>/scripts/lint.py decks/<name>/brief.md
     python3 <skill>/scripts/lint.py decks/<name>/storyboard.yaml --outline
     ```
   - 子代理修完所有 ERROR 後，**僅將 `--outline` 逐頁清單表與軟提醒摘要（~500 tokens）回傳主代理**。
3. **⛔ Gate 1b 表單簽核（含最後一題文字預確認 3 個風格方向）**：
   - 表單前段簽核內容減法、逐頁 `slide_plan` 清單與最沒把握的一頁；
   - **表單最後一題**依 `contexts.md`〈主題類型總表〉推薦，向使用者文字確認：**「下一關準備拿最關鍵的第 X 頁（`signature: true`）真實內容，為您畫哪 3 套風格活體樣張？」**（附推薦理由，並提示可選看磁碟 `assets/style-library.html`），確認後才派代理作畫。

### Gate 2a｜同題真實內容 3 風格並行活體比稿　⛔ 關卡 2a
主代理讀 `references/samples.md`（各風格 `styles/<id>.md` 由子代理各自讀取）：
1. **並行派 3 位乾淨上下文 Builder 子代理**（若使用者在 Gate 1b 已明確鎖定單一風格則派 1 位）：各自只讀負責的那 1 款風格憲法（支援 `airy`／`structured` 雙密度語法）、`styles/color-system.md`、`visual-guidance.md`、`motion-system.md` 與該關鍵頁的 `slide_plan`＋`fragments.md`，各產出一份**可按 `→` 試播從容慢板動效的單頁活體 HTML 樣張**（`samples/opt-{a,b,c}/deck.html`）並跑過 `check.mjs --jpg --motion`。
2. 派 **1 位只讀 Critic 子代理**掃描 3 張截圖與分鏡條，抓出贅字或動線瑕疵（最多自修 1 輪）。
3. **⛔ Gate 2a 表單拍板**：展示 3 套真實內容活體樣張，每套附上 **「內容結合亮點」與「跨風格混搭建議」**，讓使用者選擇單一風格或混搭組合、明暗極性與 3 組經驗證的 OKLCH 配色（`oklch.py --palette`）。

### Gate 2b｜合成 `deck.css` 與定版活範本「沒走鐘」確認　⛔ 關卡 2b
1. **無論使用者單選或混搭**，派乾淨 Builder 子代理依拍板結果建立最終 `deck.css`（由 `templates/deck.css` 起始）、更新 `storyboard.yaml` 呈現設定，並合成 **定版活範本（`1–2` 張真實頁：`signature` 核心頁 ＋ `keynote` 反極性封面或異構圖頁；若全場主頁 ≤2 頁則直接涵蓋主頁）**，跑過 `check.mjs --jpg --motion` ＋ 單輪 Critic。
2. **⛔ Gate 2b 表單確認（必花 1 輪，防混搭或換色走鐘）**：請使用者確認這份定版活範本的視覺層次、配色面積與從容慢板動效完全沒走鐘；確認通過後，活範本直接留駐 `slides/` 作為全場標竿。

### Gate 3｜100% 子代理精雕 ＋ 單輪有界 Critic → 極致 HTML 與 PDF 收尾　⛔ 關卡 3
1. **100% Builder 職能隔離（廢除主代理手寫 HTML）**：
   - 哪怕剩餘僅 1 頁，也一律派**乾淨上下文 Builder 子代理**撰寫 `slides/*.html`（剩餘 >4 頁時每 3–4 頁一批並行）。
   - **每位 Builder 子代理必讀 6 項精準輸入**：① `brief.md` ＋ `fragments.md` 原話、② `styles/<selected>.md` ＋ `deck.css`、③ Gate 2b 已確認的 `slides/` 活範本 HTML、④ `references/visual-guidance.md` ＋ `references/motion-system.md`、⑤ 負責頁之 `storyboard.yaml`（含 `slide_plan`）、⑥ 對應 `references/recipes/*.md` 或 `references/modules/*.md`。
2. **組裝與純工程機械體檢**：
   ```bash
   python3 <skill>/scripts/lint.py decks/<name>/storyboard.yaml
   python3 <skill>/scripts/assemble.py decks/<name>/storyboard.yaml --write-upgrade-list
   node <skill>/scripts/check.mjs decks/<name>/deck.html --jpg --motion --pdf
   ```
   - `check.mjs` 嚴守**物理與工程真壞掉**邊界：像素 WCAG 對比、文字溢出、`<18px`（註腳 `<16px`）、JS 錯誤、`#stage > .slide` 非 `absolute`、`<g data-draw>` 無效路徑、以及**全場每一頁 `data-step` 實測並輸出 `check/filmstrip-sXX.jpg` 分鏡條**。必須 0 錯誤通過。
3. **單輪有界只讀 Critic**：派 **1 位乾淨只讀 Critic 子代理**檢視 `check/slide-*.jpg` ＋ `check/filmstrip-sXX.jpg` ＋ `slide_plan` ＋ `lint.py` 軟提醒（工程指標永遠優先；每關最多派 Builder 自修 1 輪即停）。
4. **⛔ Gate 3 交付與乾淨收尾在 HTML**：
   - 交付 `deck.html`、`deck.pdf`、操作快捷鍵（`← →`、`G`、`A`、`L`、`S`、`N`、`B`、`P`）與品管摘要。
   - **PPT 轉換邊界（絕不截死圖充數）**：若使用者詢問匯出可編輯 PPTX，明確引導**開啟新對話將定案的 `deck.html` 交給 Agent 獨立轉換為文字與圖塊皆可編輯的原生 PPTX**。

---

## 九條核心鐵律

1. **透明導覽、同意才推進**：Round 0 亮全圖、進關先講目的與驗收點、未獲表單同意絕不跨關。
2. **單一真相來源與去重契約**：章節、導航、`slide_plan` 與 `notes` 只寫在 `storyboard.yaml` 一處；`brief.md` 只留 ~14 個承重決策欄位，不重複抄寫長文。
3. **總結永遠不當主標題**：主標題只寫路標（≤12 字）且為全頁最大字；核心結論放副標或錨點。
4. **畫布留視覺錨點，口白與補充口徑歸 `notes`／`appendix`**：一般卡片嚴守 ≤2 層文字；`limitations` 與口徑註腳放 `notes` 或 `appendix` 即合規。
5. **全風格敘事動效唯一標配「從容慢板」**：描線／生長 `800–1,200ms`、群組交錯 `220–320ms`、因果演變舊態停頓 `0.6s`；直接操控互動維持 `~200ms` 即時跟手、翻頁零鎖死可打斷。
6. **`0-step` 與 `data-step` 正交判準**：`briefing`/`read` 預設 `0-step`；`talk`/`discuss` 凡單頁具 ≥3 個依序推導區塊（防破梗或防聽讀分心）即啟用 `data-step`（≤5 拍）。
7. **三階字重呼吸與 75–20–5 色彩平衡**：拒絕全頁 `900` 粗黑與亮底大塊死黑壓迫；禁純白純黑底、禁紫主調（OKLCH H 280–335）。
8. **全程 100% 職能與上下文隔離**：主代理不直接讀原始附件（交 Recon 子代理）、不每輪重讀碎片簿（交 `fragments.py`）、不手寫 YAML（交 Scribe 子代理）、不手寫 HTML（交 Builder 子代理），美感與去贅字交單輪只讀 Critic，確保多輪顧問對話永不因上下文膨脹退化。
9. **100% 確定性靜態終態**：`?still=1`、`B` 鍵與列印 PDF 下所有圖表、數字與多步 `data-step` 皆完整展開且像素 WCAG 達標。

---

## 參考檔按需索引（依角色嚴格分流載入）

| 檔案 | 誰在何時載入 |
|---|---|
| `references/grill.md` | **主代理**（Round 0、Gate 1a、Gate 1b）：顧問追問、子代理分流協議、`DESIGN-IT-TWICE` 與回退觸發 |
| `references/contexts.md` | **主代理**（Gate 1a／1b）：判斷 `stage_mode` 與查閱〈主題類型總表〉推薦 3 套比稿風格 |
| `references/structure.md` | **主代理**（Gate 1a）：單軸方向、Grounding、破框敘事候選與中途改架構成本判斷 |
| `references/samples.md` | **主代理**（Gate 2a／2b）：關鍵 1 頁 3 風格並行活體比稿調度、混搭建議與定版活範本驗收 |
| `templates/pre-flight.md`、`scripts/fragments.py` | **Recon 子代理 ＆ 主代理 CLI**：100% 隔離讀取附件寫 `pre-flight.md`；零重讀原子管理 `fragments.md` |
| `references/content-shapes.md`、`references/presentation-rules.md` | **Scribe ＆ Builder 子代理**（Gate 1b／3）：7 類 `slide_plan.job`、19 內容形狀、原則 #26 豁免與在地化 |
| `references/visual-guidance.md`、`references/motion-system.md` | **Builder ＆ Critic 子代理**（Gate 2／3）：靜態動線、從容慢板基準、60fps GPU 鐵律與品管清單 |
| `styles/index.json`、`styles/color-system.md`、`styles/<id>.md` | **Builder 子代理**（Gate 2／3）：12 款風格庫、雙語意與面積配比規則、各風格雙密度 DNA |
| `references/modules-catalog.md`、`references/modules/*.md`、`references/recipes/*.md` | **Builder 子代理按需**：僅在該頁需要特定互動／影音模組、風格原語或高工藝參考配方時讀取 |
| `references/progress-report.md` | 定期多人進度回報與 PPTX 檢核（`check_reports.py`）時 |
| `templates/{fragments.md,questionnaire.md,brief.md,storyboard.yaml,deck.css,image-upgrade.md}` | **Scribe ／ Builder 子代理**建立對應標準產出物時 |
