---
name: deck-architect
description: 兩大主柱驅動的簡報製作技能（v4.10）：【主柱 1｜架構與內容】以資深顧問站在主題標竿與全面視角分兩階段腦力激盪——Step 1a 先讓使用者說出心中講法與素材碎片，再拍板架構與不循規蹈矩的敘事脈絡（關卡 1a），Step 1b 深挖內容細節、反方質疑、說服載體與減法（關卡 1b）；【主柱 2｜排版與呈現】以視覺吸引與引導為核心，選完風格才決定呈現：Step 3a 依內容主題與說服載體選定靜態×動態風格並一起定明暗、導航與分鏡，3b 用真實內容精雕樣張活範本，並以像素 WCAG、動態實測與生動度稽核把關。只要使用者想做、規劃、改寫任何簡報、PPT、投影片、deck、提案、報告、分享、演講、發表會、年度成果、會議簡報、客戶洽談、活動開場、教學課程，或說「幫我想簡報架構」「這份報告要怎麼講」，都應使用此技能。Use for any presentation, slides, pitch deck or talk.
---

# Deck Architect v4.10：兩大主柱 × 顧問腦力激盪 × 靜態動態極致舞台

兩大核心主柱：
1. **主柱一｜架構與內容**：先定義架構（Step 1a），再補充內容細節（Step 1b）——作為顧問站在這類主題的標竿與全面視角，持續追問深挖、從使用者的故事種子出發，協助梳理**不一定要循規蹈矩、更有張力的敘事脈絡**，並視情況主動提供方案建議。
2. **主柱二｜排版與呈現**：以**視覺的吸引與引導**為核心，根據不同內容主題選擇最合適的**靜態 × 動態風格極致**（Step 3a/3b），靠分批乾淨分身精雕、三層按需引擎與雙門檻體檢守住上下限。

**主柱邊界（每個決定等它需要的資訊到齊才做）**：主柱一只決定內容與場合——架構、故事種子、說服載體（用什麼證明）、`stage_mode`；明暗、去框比例、導航、氛圍效果、版型配方與轉場都要看風格才能定，一律在 Step 3a 選定風格時才決定。說服載體反過來會限制可選的風格。

使用者在**三大階段的關鍵關卡**拍板，其餘自動完成：

1. **主柱一｜兩階段腦力激盪與逐頁清單（⛔ 關卡 1a ＋ ⛔ 關卡 1b ＋ ⛔ 關卡 1c）**：
   - **Step 1a（架構與敘事脈絡腦力激盪 → ⛔ 關卡 1a）**：Pre-Flight 查事實 → 先問使用者心中的講法、開始收素材碎片 → 主題類型與標竿盲點掃描 → 雙重目標、架構硬限制與 `stage_mode` → 重點碎片 → 不循規蹈矩的敘事脈絡腦力激盪＋3 選 1 破框架構（同一把尺比較、結構追問）拍板
   - **Step 1b（內容細節與說服載體腦力激盪 → ⛔ 關卡 1b）**：沿鎖定骨架深挖逐章內容細節、反方質疑回應、顧問方案建議、說服載體、減法清單、素材缺口與數字查核；`brief.md` 過 lint 後簽核
   - **Step 2（逐頁清單 → ⛔ 關卡 1c）**：把 brief 展開成每頁題目、內容形狀與視覺主角，使用者確認後才進入視覺階段
2. **主柱二｜選風格與看真實樣張（⛔ 關卡 2a ＋ ⛔ 關卡 2b）**：Step 3a 依**內容主題與說服載體**從 Style & Motion Library 融合圖鑑挑中 **1 款風格（含綁定動態 DNA）**並確認呈現規格 → Agent 依風格補齊分鏡 → Step 3b 集中火力精雕該風格 **2–3 張高工藝樣張＋3 組 OKLCH 配色**拍板
3. **看完成品時（⛔ 關卡 3）**：檢視成品、截圖與雙門檻品管報告並回饋修改

在這些關卡**務必停下、以互動表單（若有表單工具）確認、等使用者回覆**。

**每個建議都要附理由（所有步驟適用）**：只要提出建議——推薦選項、敘事候選的推薦、風格與呈現規格、配色、減法清單、精修與修改建議——就要向使用者說明為什麼這樣建議。理由要扣回這份簡報的事實（目標、聽眾、場合、素材、限制）或已定的原則，不用「比較專業」「效果更好」這類空泛套話；用表單時，把理由寫在推薦選項的說明欄。使用者看得到理由，才能判斷建議是否成立、在哪裡修正，這也是顧問與填表員的差別。

**關卡上主動邀請挑戰（防被動同意）**：關卡 1a、1b、1c 的表單都要附上推薦方案**最弱的一點與最沒把握的假設**，請使用者判斷，而不是只問「確認嗎」。一路點推薦，最後拿到的是 Agent 的計畫；使用者至少反駁過一次、能向不在場的人說明每個選擇，才代表真的想過。

## 工作目錄

每份簡報建立獨立資料夾（預設 `./decks/<簡短英文名>/`）：

```text
decks/<name>/
├── fragments.md             # Step 1 起：素材碎片簿，從使用者第一句話開始收原話（只追加、不改寫）
├── questionnaire-<對象>.md  # 可選：使用者答不出、要主管等人決定的題目，做成短問卷給那個人
├── brief.md                 # Step 1a+1b：內容與場合的交接契約（過 lint 才送關卡 1b）
├── storyboard.yaml          # Step 2 起：架構、導航、講者備註、director 分鏡與 constraints 的唯一真相來源；Step 3a 寫入呈現規格
├── deck.css                 # Step 3b 起：這份簡報的風格與雙極 OKLCH 配色變數（--light-* / --dark-*）
├── samples/                 # Step 3b：選定風格的 2–3 張真實高工藝片段樣張（含 manifest.json palettes；確認後直接沿用為活範本）
├── slides/                  # Step 4：逐頁自由編排 HTML 片段（文案同受 lint.py 把關；>6 頁採每 3–4 頁分批精雕）
├── assets/                  # 可選：使用者提供或生成的靜態圖／底圖／海報（自動 Base64 內嵌）
├── media/                   # 可選：外連影片／實測音檔（保持相對路徑，不轉 Base64）
├── IMAGE_UPGRADE.md         # 可選：AI 升級生圖清單（零等待程式版同步附上）
├── deck.html                # Step 4：assemble.py 掛載三層輕底盤與按需模組產出的成品
└── check/                   # Step 5：check.mjs 逐頁截圖、像素 WCAG＋17 項動態與行動實測＋生動度體檢報告
```

## 架構模式：三層按需架構（亂中有序治理，未用到 0 KB）

- **Layer 0 核心輕底盤（常駐，零外部依賴 100% 離線）**：1920×1080 舞台縮放（含 `?noscale=1`）、單頁極性 `data-surface="dark|light|split|photo"`、三種 `nav_mode`（`top-bar`／`minimal-side`／`divider-only`）＋不劇透驚喜章節 `unlisted: true`＋自動隱藏底控膠囊與 2px 進度條、60fps 六種切頁與 `data-morph` Magic Move、雙軌節拍（自動視覺指引＋講者點擊步進 `data-step`）、中央 Overlay 優先級註冊表（`Esc` 順序：`annotator > lightbox > grid > appendix`）、SVG `<defs>` ID 隔離、本機靜態圖與影片海報內嵌、備註（`N`）、靜態（`B`／`?still=1`）、全螢幕（`F`）、列印（`P`）。
- **Layer 1 講者臨場工具（`assets/presenter/`，依 `delivery` 自動掛載）**：`talk`/`discuss` 預設載入 `grid`（`G` 總覽）、`annotator`（`A` 畫筆＋`L` 雷射＋`C` 清除）、`speaker`（`S` 雙螢幕講者台）；`read`/`auto` 僅載 `grid`；可用 `meta.presenter_tools` 覆寫。
- **Layer 2 按需內容模組（細粒度掃描注入，決策表見 `references/modules-catalog.md`）**：細粒度 `components/*`（含 `device-frame`）、單特效 `ambient-fx/*`（6 種讀色票 Canvas）、`live-controls`、`fit`（含 `data-fit="box"`）、`media`（影片片段循環＋倍速＋全螢幕／音訊＋`data-sound-ab`）、`flow-carousel`（4 模式）、`coverflow`（含 `data-marquee`＋燈箱）、`linked-highlight`、`compare-slider`、`code-stage`、`visual-flair`（`data-zoomable`＋`data-tilt`≤5°＋`data-spotlight-hover`）、4 套風格專屬動態原語套件（`motion-{workday,counsel,apple,story}`）。
- **軟性防呆（`[WARN]` 不卡死）**：`assemble.py` 針對單頁多主角衝突、`stage_mode` 場合超額、風格跨界動效（`avoid_motions`）與 `meta.modules` 白名單漂移發出提醒；`lint.py` 也會檢查 `meta.style` 是否為已就緒風格。

## 流程

### Step 1a｜架構與敘事脈絡腦力激盪（Architecture Brainstorm）　⛔ 關卡 1a

讀 `references/grill.md`（第一、二節）、`references/contexts.md` 與 `references/structure.md`。遵循**先查事實、只問決定**、**重提案輕審問（Proposal-First）**與**設計樹前沿**，有表單工具時一律用互動表單（每張 2–4 題互不依賴；收斂型決策把推薦項放第一標「（推薦）」附理由，發散型腦力激盪如故事種子不標「（推薦）」避免錨定）：

1. **Round 0 靜默偵察＋先收既有輸入物、心中的講法與模式**：先讀完使用者已提供的所有舊檔、簡報、模板與數據；若尚未提供，**第一題先問有無現成草稿／舊稿／模板**，同一張表單問**使用者心裡現在想怎麼講**（發散題，選項只當引子），並確認**製作模式（標準／快速）**與**起手狀態**（一張白紙拋磚引玉／一團素材先出排除草案／舊稿模板先做結構診斷），絕不盲猜。從使用者第一句話開始，把原話逐則收進 **`fragments.md` 素材碎片簿**（`templates/fragments.md`，只追加、不改寫），整個 Step 1 持續收。
2. **根節點定調＋架構硬限制＋主題類型與標竿盲點掃描（節點群 A）**：釐清理性終點 × 體感預期、拆解**主受眾（決策／主角）vs 次受眾（同場利害關係人）**與 Grounding 基線；問清**架構硬限制與決策人**（誰上台、誰能否決結構、指定章節或不能動的模板、整塊不能談的主題、議程位置、會後是否寄出），使用者答不出、要主管決定的，用 `templates/questionnaire.md` 做一份短問卷給那個人；依 `contexts.md` 〈主題類型總表〉主動點出標竿缺漏維度並提處置建議；拍板 **`stage_mode`（`briefing`／`pitch`／`keynote`）**，記下播放方式與環境、人際顧慮與頁數算術。
3. **重點碎片 ＋ 架構級排除清單（節點群 B 開頭）**：提任何敘事候選之前，請使用者在素材碎片簿標出最想讓聽眾記住的 1–3 則（⭐，就是故事種子；發散題不標推薦，使用者自填優先）；同時先切清**架構級排除清單（Out of Scope：這場明確不講或只放附件的區塊）**，防範圍膨脹。
4. **不循規蹈矩的敘事脈絡腦力激盪 × Design It Twice（節點群 B）**：從重點碎片長出承重母題，讀 `references/structure.md` 提出 3 個本質不同、都圍繞重點碎片的敘事與架構候選（使用者心中的講法或既有框架必列為候選 A；標準模式必給至少 1 個跳脫八股的破框敘事版），每個候選必附 **30 秒口述邏輯鏈**與**逐章分鐘數＋預估頁數配額**；三個候選**用同一把尺比較**（主受眾第一個問題在第幾章被回答、證據就緒度、時間頁數、前提假設、用到的碎片），給出有主見的推薦與最弱的一點，邀請碰撞混搭；兩個候選分不出高下時，各做一份只有每頁題目的空殼清單給使用者看。使用者改寫時接著他的版本延伸。
5. **結構追問與尚未確定清單**：選定後逐章問「拿掉會斷什麼」「這章做了前一章沒做的什麼」、檢查開場承諾在哪一章兌現；列出**尚未確定與假設**（各寫怎麼定）與**改起來最貴的四個決定**（理性終點、主受眾、軸與敘事主幹、範圍）及理由。
6. **⛔ 關卡 1a 骨架拍板**：呈交精簡架構骨架確認單（雙重目標、主／次受眾與標竿盲點處置、架構硬限制與決策人、`stage_mode` 與播放環境、**Out of Scope 排除清單**與尚未確定清單、重點碎片、承重母題、三個候選與候選比較、選定敘事脈絡、**30 秒口述邏輯鏈（`起點共識→但是→所以→證據顯示→因此請你`）**、章節停靠點＋分鐘數＋**預估頁數配額**、結構追問結果、改起來最貴的四個決定），附上**推薦方案最弱的一點與最沒把握的假設**，**停下來透過互動表單等使用者逐項判斷**，不在錯的架構上展開細節。（*快速模式自動將 1a＋1b 合併壓縮為 1–2 輪 ≤5 題快篩*）

### Step 1b｜內容細節與說服載體腦力激盪（Detail Brainstorm）→ `brief.md`　⛔ 關卡 1b

架構骨架於 1a 拍板後，讀 `references/grill.md`（第三節）與 `references/modules-catalog.md`（只看第二節的「內容說服載體」），以顧問視角**先草擬提案讓人挑戰與補充**，沿既定章節挖深內容與說服力；**若深挖過程觸發回退條件（某章證據懸空／反方質疑必須前置／單章頁數嚴重失衡），立刻暫停 1b 回頭微調 1a 骨架並確認，不硬塞**：

1. **逐章內容細節深挖、反方質疑拆彈與方案建議（節點群 C 前半）**：
   - 逐章敲定唯一記憶點、核心論據與具體案例細節（優先用重點碎片與碎片簿裡使用者的原話補實）；站在最挑剔主受眾的立場指出每章最尖銳的質疑（Devil's Advocate）並確認回應或邊界；遇到使用者想法模糊時，**主動給出 2–3 個具體內容方向／切角建議**激發靈感；打磨章間敘事拉力與 Grounding 著陸順序。
2. **依 `stage_mode` 調檔之說服載體、白話亮點頁與減法（節點群 C 後半）**：
   - **`briefing`**：不硬挖煽情故事；聚焦唯一風險、選項代價與拍板點，重點做**內容減法提案**（長文移進 `notes`），最多提 1 個務實亮點。
   - **`pitch`**：抓 1 個核心痛點反差 ＋ 白話提案 **1–2 個實用互動／視覺頁** ＋ 減法提案。
   - **`keynote`**：完整挖出痛點瞬間、前後反差與原話 ＋ 白話提案 **2–3 個招牌亮點頁** ＋ 減法提案。
   - 盤點既有資產並點破素材缺口（Gap-Naming）；把每章的**說服載體**用白話寫進 `brief.md`。說服載體是內容需求，會在 Step 3a 回頭限制選風格；氛圍效果、風格動態套件與明暗等呈現決定不在這裡做。
3. **可信度、控場與地雷收斂（節點群 D）**：核對關鍵數字出處與口徑、定出限制／禁用說法／必放項（`constraints`）、拍板高光震撼頁與講者點擊步進（`data-step`／`unlisted: true` 藏牌）、收斂一句話核心訊息。
4. **⛔ 關卡 1b 簽核 `brief.md`**：彙整 1a＋1b 寫進 `brief.md`（`templates/brief.md`），先跑 `python3 <skill>/scripts/lint.py decks/<name>/brief.md` 修完所有 ERROR（lint 檢查心中的講法、架構硬限制、重點碎片、三個候選與比較、30 秒口述邏輯鏈、結構追問、標竿缺口、每章反方質疑與說服載體等「有沒有做到」），再**停下來透過互動表單等使用者確認**：表單呈現這一輪新定的決定、仍有風險的假設與缺口、推薦處理最弱的一點，不是整份 brief（做得好不好由使用者判斷）後才進 Step 2。

### Step 2｜架構展開 ＋ 逐頁視覺主角 → `storyboard.yaml`

讀 `references/presentation-rules.md` 與 `references/content-shapes.md`，把 `brief.md`（含減法清單與招牌亮點頁）展開成 `storyboard.yaml`（`templates/storyboard.yaml`）：
- 依內容決定每頁的**內容形狀**（`layout`）；將長段背景與口白歸入 `notes`，畫布只留視覺錨點。
- 每頁寫上 `director.hero`（這頁的視覺主角，對應 brief 的說服載體）；說服載體需要內容模組時一併寫 `director.module`。`briefing` 僅標關鍵 2–3 頁即可；`pitch`/`keynote` 建議逐頁填寫，防止 Step 4 退回純文字卡片。**版型配方（`archetype`）、轉場與動線（`choreo`）、逐頁極性（`surface`）先不寫**：它們要看風格，Step 3a 之後由 Agent 依選定風格補齊。
- 執行並修完所有 ERROR：

```bash
python3 <skill>/scripts/lint.py decks/<name>/storyboard.yaml
```

**⛔ 關卡 1c｜逐頁清單確認**：跑 `python3 <skill>/scripts/lint.py decks/<name>/storyboard.yaml --outline` 印出逐頁清單（每頁所屬章節、題目、內容形狀、視覺主角與頁數算術），用互動表單請使用者確認，附上最沒把握的一頁與原因（例如這頁的東西是並列還是因果、該不該拆成兩頁），**停下來等回覆**再進 Step 3a。章節對了、某一頁的內容形狀錯了，到成品才看得到就太晚；這是畫樣張與製作之前，最後一個便宜的修改點。

### Step 3｜兩階段視覺關卡（選風格與呈現規格 → 補齊分鏡 → 單風格極致樣張）　⛔ 關卡 2a ＋ 2b

讀 `references/samples.md`、`references/contexts.md` 第二節〈主題類型總表〉、`references/visual-guidance.md`（**主柱二核心：靜態動線、空間分群、底部基線、3 拍語意順序與靜止閱讀窗**）、`styles/index.json` 與 `styles/color-system.md`：

1. **Step 3a｜依內容主題選定靜態 × 動態 DNA 融合風格，並確認呈現規格（⛔ 關卡 2a）**：
   - 依 `brief.md` 的**主題類型與氣質**照〈主題類型總表〉推薦風格；用第 5 節的**說服載體**對照各風格的 `avoid_motions` 回頭篩選（衝突就換備選或改用風格原生做法）；`stage_fit` 只當參考、不淘汰風格。展示 `assets/style-library.html`（4 款 1920×1080 融合活體舞台：`workday`、`counsel`、`apple`、`illustration`）。
   - 用一張互動表單請使用者**選定 1 款風格**，同時確認依「`stage_mode` × 風格 × 播放環境」給出的**呈現規格**（明暗策略、去框比例、導航模式；可整組接受或改單一開關）。拍板同時鎖定該風格之 `motion_dna`、專屬 `motion-*` 套件與氛圍效果，把 `style`、`mode`、`nav_mode` 寫進 `storyboard.yaml`。
2. **Step 3a 之後｜依選定風格補齊分鏡（Agent 內部，不設關卡）**：依 `styles/<id>.md` 的版面語法與 `motion_dna`，替每頁補上 `director.archetype`、`director.choreo` 與 `surface`，再跑一次 `lint.py`（做法見 `references/samples.md`）。
3. **Step 3b｜用選定風格集中精雕 2–3 張極致樣張 ＋ 3 組 OKLCH 配色（⛔ 關卡 2b）**：
   - 先從 `templates/deck.css` 建立 `deck.css`（換上選定風格的字體與配色；它含配方依賴的畫布基礎排版）。讀入 `styles/<selected>.md`、`styles/index.json` 該風格的 `motion_dna` 與對應 `references/recipes/*.md` 黃金工藝配方，只針對這 1 款風格，用真實內容直接寫成 **2–3 張 `slides/` 規格的 HTML 片段樣張**（封面＋核心招牌亮點頁＋異構圖／異極性頁，同步立住**靜態美感上限＋視覺指引動線＋專屬動態原語**，不退回平庸白框或簡陋幾何 SVG），並跑 `scripts/oklch.py --palette` 驗證 3 組 OKLCH 配色寫進 `samples/manifest.json` 的 `palettes` 欄位。
   - 執行像素品管（`assemble.py --sheet` 會自動套用 `shell.css` + `deck.css` + 按需模組產生 `.preview/` 並渲染三組色票對照）並**親自看過 `samples/sheet.jpg`**：

```bash
python3 <skill>/scripts/assemble.py --sheet decks/<name>/samples
node <skill>/scripts/check.mjs --sheet decks/<name>/samples
```

4. 以互動表單請使用者確認這組風格與配色，**停下來等回覆**。拍板後的這 2–3 張真實樣張**直接移入 `slides/` 作為正式頁面**（零改寫、零浪費），並成為 Step 4 的「活範本（Live Style Anchor）」。

> **快速模式**跳過 3a 圖鑑與 3b 樣張：使用者在對話中說過偏好的風格就沿用；沒有就依〈主題類型總表〉選推薦風格，呈現規格採 `stage_mode` 基線，交付時告知可切換。（記住偏好的品味記憶屬 Phase E，尚未實作。）

### Step 4｜分批精雕（乾淨上下文分身）→ `deck.html`（＋可選 `IMAGE_UPGRADE.md`）

1. 確認 `storyboard.yaml` 的 `style`、`mode`、`nav_mode` 與逐頁 `director`／`surface` 都已在 Step 3a 後補齊，把 Step 3b 選定的 OKLCH 雙極變數寫入 `deck.css`（由 `templates/deck.css` 起始），把 Step 3b 已確認的 2–3 張樣張移入 `slides/`。
2. 依總頁數採最穩定的精雕節奏（防止長對話上下文疲勞導致後面幾頁退化為純文字方塊）：
   - **≤ 6 頁**：主代理依 `director:`、`references/visual-guidance.md`、`references/recipes/` 與按需模組子手冊逐頁撰寫其餘 `slides/*.html`。
   - **> 6 頁（強烈建議，快速模式可省略）**：將剩餘頁面拆成 **每 3–4 頁一小批**，並行派給乾淨上下文子代理精雕。每個子代理必吃 6 樣精準輸入：① `brief.md` 的**主／次受眾起點、Grounding 前置概念、人際顧慮與 `constraints`（第 1、8 節）**，加上**母題、重點碎片與該批章節細節（第 3、5 節）**，以及 `fragments.md` 裡使用者的原話（第一手來源，避免改寫走味）、② **選定風格憲法 `styles/<selected>.md`**（固定本質、字體字級、OKLCH 範圍、動效參數與禁忌清單）＋ `deck.css` ＋ `storyboard.yaml` 的 `meta`、③ Step 3b 已通過的 2–3 張真實樣張（**活範本**）、④ **主柱二核心 `references/visual-guidance.md`**（七種假指引反模式、靜態動線、空間分群、底部基線與靜止閱讀窗）、⑤ 僅該批 3–4 頁的 `storyboard.yaml`（含 `director:`）、⑥ 該批用到的 1–2 支 `references/recipes/*.md` 與對應 `references/modules/*.md`。主代理最後統一確認跨頁 `data-morph` 與節奏連貫。
3. 組裝單檔簡報（三層細粒度注入＋軟性 `[WARN]` 場合與風格跨界防呆＋本機靜態圖與影片海報內嵌）：

```bash
python3 <skill>/scripts/assemble.py decks/<name>/storyboard.yaml --write-upgrade-list
```

若有待升級 `.asset-slot`，補齊 `IMAGE_UPGRADE.md`（`templates/image-upgrade.md`）。

### Step 5｜雙門檻品管（下限安全 ＋ 視覺指引 ＋ 上限生動度）＋ 視覺精修輪 → `check/`

```bash
node <skill>/scripts/check.mjs decks/<name>/deck.html --jpg --motion
```

- **下限品管與視覺指引（必過）**：`?still=1` 真實背景像素 WCAG 對比（含漸層字與 OKLCH 底色／禁紫檢核）、主標題≥總結、溢出與邊界、最小字級、SVG 重複 ID、圖片／腳本錯誤，加上 `--motion` 最多 **17 項**動態與行動實測（含 WAAPI 過渡 `fill:forwards` 清零、聚光壓暗歸零與單拍時序檢核、SVG 真描線與線點順序、Layer 1 `G` 縮圖保真／`A`/`L`/`S`、Layer 2 說服模組、**4 套風格動態套件實測**、**閱讀期靜止檢核反永動**、**390px 手機 `#ctrl-bar` 與橫向溢出實測**、**活頁 `beforeprint`/`afterprint` 列印展開與復原**）。離線載不到 Google Fonts 只列為提示（設計內建系統字體退路）。
- **上限生動度稽核（Liveliness Audit，依 `stage_mode` 自動調檔）**：自動量測視覺頁佔比（公平採計去框編輯頁與全套互動元件）、動態原語多樣性（風格套件的原語分開計算）、連續純文字單調頁，以及**風格契合**（有沒有用到選定風格的招牌動態），點名全場最平淡的 1–3 頁。
- **視覺精修輪（Polish Pass）**：親自看過 `check/slide-*.jpg` 並對照 `visual-guidance.md` 第六節 6 條人工檢核（三秒靜態動線、空間分群、底部基線、去小字不回潮、視覺張力對標 `style-library.html`），若下限有錯、或 `pitch`/`keynote` 生動度與質感未達標，針對點名頁面升級圖解／互動並重建，**最多修 2 輪**；升級時優先用選定風格的招牌動態，不為了湊種類疊加不屬於這款風格的效果；未解項如實回報。

### Step 6｜交付　⛔ 關卡 3

告知使用者：檔案位置與快捷鍵（`← →`／空白鍵翻頁、`G` 總覽、`A` 畫筆、`L` 雷射筆、`S` 雙螢幕講者台、`F` 全螢幕、`N` 備註、`B` 靜態、`P` 列印 PDF）、一句話架構總結、品管最低對比＋動態與生動度實測結果、未解項與可選 `IMAGE_UPGRADE.md`。透過互動表單收集回饋修改。

## 做到一半要改架構時

架構定錯不一定要從頭來過：章節、目錄、頁籤與導航都從 `storyboard.yaml` 一處自動產生，改章名、章內順序、合併相鄰章都很便宜；把一塊移到附件或排除清單是中等成本，重跑關卡 1c 即可；只有改「最貴的四個決定」（理性終點、主受眾、軸與敘事主幹、範圍）要回到關卡 1a，而且只重做受影響的章與頁。判斷與步驟見 `references/structure.md` 第五節。

## 九條核心鐵律

1. **先有架構、標竿視角與著陸順序，再寫內容**：主體章節沿單一軸單一方向前進（敘事脈絡可腦力激盪破框，但聽眾永不迷路），每頁只倚賴聽眾已自帶或前文已著陸（Grounded）的概念。
2. **章節名稱只在一處定義**（`storyboard.yaml` 的 `chapters`，驚喜章節可設 `unlisted: true` 不劇透），導航輕重依 3a 定案的 `nav_mode` 由底盤同步。
3. **總結永遠不當主標題**：主標題只寫路標（≤12 字）且為頁面最大最先見之字；總結放在內文。
4. **畫布留視覺錨點，講者稿歸 `notes`（原則 #26）**：一般群組 ≤2 層文字；僅「原話暗房證言」「產品發表級情感短句」「活流程步進微標」合法豁免。
5. **內容先定、選完風格才定呈現**：依主題選風格極致，依場合校準光暗與生動度；`briefing` 守乾淨單底色與三秒掃讀，`pitch`/`keynote` 啟用光暗反差、去框編輯與招牌互動頁。
6. **重點只用顏色標示**（不畫底線、不用斜體），每頁最多一處 `==重點==`；不寫過場廢話。
7. **震撼頁稀少、有鋪陳且具反差**：全場 0–2 次、間隔 ≥3 頁、打破常規導航（唯開場提問 `role: opener` 例外）。
8. **裝飾可與文字交錯，可讀性由真實像素 WCAG 把關**：禁純白純黑、禁紫漸層、變暗不等於夜晚。
9. **關掉圖與動態仍完整可讀**：所有動態 60fps 可打斷且支援 `?still=1`／`B` 鍵／列印完美定格；真文字隨時可編輯。

## 參考檔索引（漸進揭露按需載入，單一真相來源）

| 檔案 | 什麼時候讀 |
|---|---|
| `references/grill.md` | **Step 1a（架構與敘事脈絡腦力激盪）＆ Step 1b（內容細節與說服載體腦力激盪）**：心中的講法與素材碎片、架構硬限制與問卷、標竿盲點掃描、重點碎片、設計樹前沿、不循規蹈矩破框、候選比較與結構追問、防被動同意、反方拆彈與減法清單 |
| `references/contexts.md` | Step 1a 判斷主題類型與 `stage_mode`、Step 3a 依〈主題類型總表〉推薦風格並校準呈現、計畫轉成果、快速模式時 |
| `references/structure.md` | Step 1a 推導單軸架構、Grounding 檢查、從重點碎片長出破框敘事候選、Design It Twice、候選比較與結構追問、Keynote 戲劇層；做到一半要改架構時（第五節） |
| `references/modules-catalog.md` | Step 1b（只看第二節內容說服載體）＆ Step 3a／Step 4 一頁決策表（Layer 0/1/2 模組總覽、場合預算上限與禁止規則） |
| `references/modules/{media-and-gallery,interactive-explainers,presenter-and-fx,style-motion-kits}.md` | 按需：僅打開實際會用到的模組與風格綁定動態原語子手冊 |
| `references/recipes/{bento-causal,linked-diagram,interactive-proof,product-story,editorial-drama}.md` | **Step 3a 後補分鏡 ＆ Step 3b／Step 4 按需載入**：5 支精選高工藝 HTML/SVG/Motion 黃金配方（風格的版面語法優先） |
| `assets/style-library.html`、`references/samples.md` | Step 3a 依內容主題選靜態×動態融合風格與呈現規格 → 補齊分鏡 → Step 3b 單風格極致樣張與活範本交接 |
| `references/presentation-rules.md` | Step 2 展開內容、原則 #26 與豁免、導航分級、繁體在地化、Step 5 品管時 |
| `references/content-shapes.md` | Step 2–4 判斷內容形狀（14 結構＋5 圖表）與容量上限時 |
| `references/visual-guidance.md` | **主柱二核心（Step 3–5 全程必讀）**：四大靜態動線、空間分群、底部基線、聚光壓暗、3 拍語意節拍與靜止閱讀窗 |
| `references/motion-system.md` | Step 4 撰寫自由畫布 60fps 切頁／Magic Move／風格動態原語／迪士尼物理守則時 |
| `references/progress-report.md` | 定期進度回報、多單位 PPTX 檢核（`check_reports.py`）時 |
| `styles/index.json`、`styles/color-system.md`、`styles/<id>.md` | **風格與動態 DNA 資料庫**（主題→風格的推薦以 `contexts.md` 〈主題類型總表〉為準）：Step 3–4 依選定風格的版面語法、動態原語與禁忌、推薦三組 OKLCH 配色時 |
| `templates/fragments.md`、`templates/questionnaire.md`、`templates/brief.md`、`templates/storyboard.yaml`、`templates/deck.css`、`templates/image-upgrade.md` | 建立對應產出物（素材碎片簿、給他人的問卷、`deck.css` 含配方依賴的畫布基礎排版）與撰寫反左右割裂生圖提示詞時 |
