---
name: deck-architect
description: 架構先行的簡報製作技能：先用 Grill 問清楚目的、對象、時長、場合，找出「聽眾的起點與終點」並設計一條單一方向的架構，再提供三種風格樣張讓使用者選，最後產出導航清楚、重點突出、可直接播放的 HTML 簡報（可列印成 PDF）。只要使用者想做、規劃、改寫任何簡報、PPT、投影片、deck、提案、報告、分享、演講、發表會、年度成果、會議簡報、客戶洽談、活動開場、教學課程，或說「幫我想簡報架構」「這份報告要怎麼講」，都應使用此技能，即使沒有明說「簡報」二字。Use for any presentation / slides / pitch deck / talk request.
---

# Deck Architect：架構決定一切

這個技能的信念是：**簡報的成敗在架構，不在裝飾**。好架構讓聽眾不需要任何過場文字，也知道自己在哪裡、接下來會聽到什麼。所以你要先當「簡報架構師」把路徑想清楚，最後才當設計師。

使用者只在三個時刻做決定，其餘由你自動完成：

1. **Grill 結束時**：確認 brief（說什麼、怎麼走）
2. **看完三種風格樣張時**：選一種（長什麼樣）
3. **看完成品時**：留言修改（哪裡要改）

在這三個時刻，**一定要停下來、結束回合、等使用者回覆**，不要替使用者決定後繼續往下做。這是因為使用者最在意的就是「內容由我掌舵」，跳過關卡等於把簡報變成你的作品。

## 工作目錄

每份簡報建立一個資料夾（預設 `./decks/<簡短英文名>/`），所有產出都放這裡：

```
decks/<name>/
├── brief.md          # Step 1 產出：Grill 結論
├── storyboard.yaml   # Step 2 產出：唯一的內容來源（之後改字都改這裡）
├── samples.html      # Step 3 產出：三種風格樣張
├── deck.html         # Step 4 產出：成品
└── check/            # Step 5 產出：截圖與檢查報告
```

`storyboard.yaml` 是唯一的內容來源。HTML 是從它產生的，所以修改永遠改 yaml 再重建，不要直接改 HTML。

## 流程

### Step 1｜Grill → `brief.md`　⛔ 關卡一

先讀 `references/grill.md`。有互動表單工具（例如 AskUserQuestion）時**一律用表單問**，每次 2–4 題，建議答案放第一個；沒有表單工具時一次問一題。必須問出：

- 目的、對象、時長、場合 → 推出**聽眾的起點**與**你要帶他去的終點**
- 有沒有需要顧慮的人或部門（決定能不能用「價值軸」，以及要不要把批評改成「我們」提問）
- 有沒有既有的框架、大綱或前一版報告：有的話先讀，它**一定要是架構候選之一**；若它的最上層是並列的，要提醒並提出路徑版本；若是計畫改成果，照 contexts.md「計畫轉成果」處理
- 每章的時間分配；頁數含不含封面與目錄
- 說服或推廣型：有沒有**證據**（數據、案例），以及有沒有**還做不到、不能承諾**的事
- 關鍵數字要先跟原始資料**查核**（見 grill.md「查核關鍵數字」）
- 每章的內容與重點
- 有沒有想讓聽眾震撼的一刻（沒有就不要硬做）

「既有框架」要**單獨先問**，拿到答案後再讀 `references/structure.md`，推導出 2–3 個架構候選（軸 + 方向 + 停靠點）讓使用者選。選定後用 `templates/brief.md` 寫出 brief，給使用者看，**停下來等確認**。

如果使用者只給了很少資訊又趕時間，讀 `references/contexts.md` 的「快速模式」，把 Grill 壓到 5 題以內，但起點、終點、架構這三件事不能省。

### Step 2｜架構展開 → `storyboard.yaml`

讀 `references/presentation-rules.md`（標題、重點、導航、震撼頁的規則），用 `templates/storyboard.yaml` 的格式把 brief 展開成逐頁內容。然後跑：

```bash
python3 <skill>/scripts/lint.py decks/<name>/storyboard.yaml
```

lint 會檢查架構與呈現規則。有 ERROR 必須修到通過；WARNING 要嘛修正、要嘛在給使用者的摘要裡說明為什麼保留。不要為了讓 lint 通過而扭曲內容，lint 抓的問題通常代表架構真的有洞。

完成後給使用者一頁**架構摘要**（章節、每頁標題、重點、震撼頁位置）。使用者沒意見可以直接進 Step 3，不用另外等。

### Step 3｜三種風格樣張 → `samples.html`　⛔ 關卡二

讀 `references/samples.md`。挑三個方向（穩健 / 大膽 / 驚喜），用使用者**真實的標題與內容**產生樣張：

```bash
python3 <skill>/scripts/build.py decks/<name>/storyboard.yaml --samples editorial,swiss,broadsheet
```

樣張會包含封面、一頁一般內容、震撼頁（若有）各一張，三種風格並排。打開給使用者看，**停下來等使用者選**。使用者可以混搭（例如「A 的配色 + B 的字體」），這時照 `references/samples.md` 的方式寫一個自訂主題。

### Step 4｜製作 → `deck.html`

把選定的主題寫進 storyboard 的 `meta.theme`，然後：

```bash
python3 <skill>/scripts/build.py decks/<name>/storyboard.yaml
```

只要一頁、或是大簡報裡的一章時，用 `meta.format: section` 與 `layout: pillars`（一頁總覽）；需要現場點進細節時，用附件頁（`appendix: true`＋`link`）。見 presentation-rules.md「一頁總覽與附件」。

定期進度回報要先拿到模板，總覽用 `layout: status-table`；多個單位交上來的 PPTX 用 `scripts/check_reports.py` 檢查內容。見 progress-report.md。

build 會根據架構自動產生導航（章節列、目錄點亮、頁籤）、依「軸」決定換章的運鏡方向、處理震撼頁。你不需要手寫 HTML。

### Step 5｜品管 → `check/`

```bash
node <skill>/scripts/check.mjs decks/<name>/deck.html
```

它會逐頁截圖並檢查文字溢出、字太小、主控台錯誤。有問題就回到 storyboard 修正後重建，**最多修 2 輪**；兩輪後仍有問題，如實告訴使用者還剩什麼問題，不要假裝通過。

接著**自己看截圖**，用 `references/presentation-rules.md` 最後的「品管清單」逐條檢查。這一步你是評審，不是作者：用挑剔的眼光看。

### Step 6｜交付　⛔ 關卡三

告訴使用者：

- 檔案位置，以及怎麼播放（方向鍵 / 空白鍵翻頁，`F` 全螢幕，`N` 講者備註，`P` 列印成 PDF）
- 架構一句話總結（從哪裡帶到哪裡、沿著什麼軸）
- 品管結果，包含沒解決的問題

然後等使用者留言修改。修改一律改 `storyboard.yaml` → 重建 → 重新 check。

## 八條鐵律

這些規則來自使用者多年做簡報的心法，每條都有理由：

1. **先有架構，再寫內容。** 最上層章節必須沿著同一條軸、單一方向排列。聽眾能預測下一步，就不需要過場。
2. **章節名稱只在一處定義**（storyboard 的 `chapters`）。目錄、章節列、頁籤都由它自動產生，才不會前後不一致。
3. **標題只說「這頁在講什麼」**：簡短、中性，像路標。結論不要寫在標題裡。
4. **重點放在內容裡，放大並用突出色**（`==重點==` 語法），一頁最多一處。到處都強調就等於沒有強調。
5. **不寫過場文字。** 位置感交給導航：超過 3 章時自動出現目錄點亮頁，單章超過 2 頁時自動出現頁籤。
6. **震撼頁只留給情緒轉折或刻意的衝擊**（像 One more thing）。必須有鋪陳、全場 0–2 次、不可連續。唯一例外是開場提問（`role: opener`），它的鋪陳是聽眾自己的經驗。
7. **震撼頁打破所有規則**：導航隱藏、畫面淨空、停頓後才進場。前面的秩序越穩，這一刻越有力。
8. **把圖拿掉，文字依然讀得懂。** 圖片是氣氛，文字才是內容。

## 參考檔索引（用到才讀）

| 檔案 | 什麼時候讀 |
|---|---|
| `references/grill.md` | Step 1 開始時 |
| `references/structure.md` | Step 1 推導架構時 |
| `references/contexts.md` | 判斷情境、選擇快速 / 標準模式時 |
| `references/presentation-rules.md` | Step 2 寫 storyboard 前、Step 5 品管時 |
| `references/samples.md` | Step 3 做樣張、或使用者要自訂風格時 |
| `references/progress-report.md` | 定期進度回報、專案群總覽、多人填寫的回報時 |
| `templates/brief.md` | 寫 brief 時 |
| `templates/storyboard.yaml` | 寫 storyboard 時（含所有欄位與版型說明） |
