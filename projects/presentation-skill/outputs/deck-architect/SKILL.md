---
name: deck-architect
description: 架構先行的簡報製作技能（v4）：先用互動表單 Grill 問清楚目的、對象、時長、場合與既有框架，找出「聽眾的起點與終點」並設計單軸單向架構，再以單一視覺關卡提供三款多元風格憲法（Style DNA）與 OKLCH 主題配色樣張，最後以「輕底盤、強自由」混合架構產出圖文融合、真文字可編輯、通過真實像素 WCAG 品管的 HTML 簡報（可列印 PDF）。只要使用者想做、規劃、改寫任何簡報、PPT、投影片、deck、提案、報告、分享、演講、發表會、年度成果、會議簡報、客戶洽談、活動開場、教學課程，或說「幫我想簡報架構」「這份報告要怎麼講」，都應使用此技能。Use for any presentation / slides / pitch deck / talk request.
---

# Deck Architect v4：架構決定一切，畫布自由表達

信念：**簡報的成敗在架構，驚豔來自風格憲法與自由畫布**。先當「簡報架構師」把路徑與證據想清楚，再依主題端出令人「哇就是這些！」的多元風格樣張，最後用「輕底盤、強自由」架構產出高品質 HTML 簡報。

使用者只在**三個時刻**做決定，其餘自動完成：

1. **Grill 結束時（⛔ 關卡一）**：確認 `brief.md`（說什麼、怎麼走、頁數算術、限制與地雷）
2. **看完風格與配色樣張時（⛔ 關卡二）**：從三款多元風格（＋明暗與三組 OKLCH 主題配色）中定調方向
3. **看完成品時（⛔ 關卡三）**：檢視成品與截圖並留言修改

在這三個時刻，**一定要停下來、用互動表單（若有表單工具）確認、等使用者回覆**，不可替使用者決定後逕行往下做。

## 工作目錄

每份簡報建立獨立資料夾（預設 `./decks/<簡短英文名>/`）：

```
decks/<name>/
├── brief.md                 # Step 1：Grill 結論（含頁數算術、限制與地雷）
├── storyboard.yaml          # Step 2：唯一內容來源（敘事、章節、每頁形狀、constraints）
├── deck.css                 # Step 4：這份簡報的風格與 OKLCH 配色變數／共性樣式
├── samples/                 # Step 3：Gate 2 樣張（2–3 頁 × 3 方向）＋ sheet.html / sheet.jpg
├── slides/                  # Step 4：逐頁自由編排 HTML 片段（01-cover.html 等）
├── assets/                  # 可選：使用者提供或生成的升級底圖／真實照片
├── IMAGE_UPGRADE.md         # 可選：AI 升級生圖清單（零等待程式版同步附上）
├── deck.html                # Step 4：assemble.py 掛載輕底盤產出的單檔成品
└── check/                   # Step 5：check.mjs 逐頁截圖與真實像素 WCAG 品管報告
```

## 架構模式：輕底盤、強自由（Thin Shell + Free Canvas）

- **輕底盤（`assemble.py` 自動掛載）**：1920×1080 舞台縮放、單一資料來源章節導航／頁籤（支援 `data-auto-nav` 風格客製外觀）、依軸運鏡、震撼頁黑幕停頓、附件點入與返回、SVG `<defs>` ID 自動隔離、可替換圖像插槽 `.asset-slot[data-slot]`、講者備註（`N`）、全螢幕（`F`）、列印 PDF（`P`）。
- **自由編排畫布（預設 90%+ 頁面）**：你依選定的 **Style DNA**（`styles/*.md`）與該頁內容形狀，在 `slides/XX-*.html` 直接編寫最貼題的 HTML／CSS／SVG，不受僵化模板束縛。
- **高紀律商務元件（按需自動生成）**：`status-table`（週進度總覽）、`pillars`（年度一頁總覽）、自動 `toc` 目錄頁，以及快速模式未寫客製片段的頁面，由 `assemble.py` 從 `storyboard.yaml` 直接穩定生成。

## 流程

### Step 1｜Grill → `brief.md`　⛔ 關卡一

讀 `references/grill.md`。有互動表單工具時**一律用表單問**（每張 2–4 題、題目互不依賴、建議答案放第一標「（推薦）」）：

1. 先問情境：目的（終點）、對象（起點）、場合與播放方式（`delivery`：上台講／討論／自己讀／自動播放）、時長與**頁數算術**（含不含封面與目錄）、人際顧慮。
2. **單獨先問既有框架／前一版／空白模板**，讀完後再依 `references/structure.md` 提 2–3 個架構候選（原框架必列候選之一；若最上層並列則提醒並提路徑版；計畫改成果照 `contexts.md`）。
3. 補齊各章重點與分鐘數、序幕／轉折／尾聲、證據（**關鍵數字必查核出處**）、限制與不承諾、地雷與偏好、震撼的一刻。
4. 寫出 `brief.md`（`templates/brief.md`），**停下來等使用者確認**。

### Step 2｜架構展開 → `storyboard.yaml`

讀 `references/presentation-rules.md` 與 `references/content-shapes.md`，把 brief 展開成逐頁內容（格式見 `templates/storyboard.yaml`）。務必把 brief 的限制與地雷寫進 `constraints`、標出最重要的一頁 `signature: true`、設定 `meta.delivery`。然後跑：

```bash
python3 <skill>/scripts/lint.py decks/<name>/storyboard.yaml
```

有 ERROR 必須修到通過；WARNING 要修正或在架構摘要說明原因。完成後給使用者一頁**架構摘要**（章節、每頁題目、內容形狀、頁數算術與震撼頁位置）。

### Step 3｜單一視覺關卡（風格 × 明暗 × 主題配色）→ `samples/sheet.jpg`　⛔ 關卡二

**不再分灰階排版與風格兩步選。** 讀 `references/samples.md`、`styles/index.json` 與 `styles/color-system.md`：

1. 依 brief 主題與場合，決定建議明暗（`light`／`dark`）並挑出 **3 個外觀截然不同的風格方向**（穩健／大膽／驚喜）。
2. 讀入對應的 Style DNA（`styles/<id>.md`），替這份簡報用真實內容自由編排樣張（每方向 **2–3 頁**：封面＋`signature: true` 招牌頁＋另一種版型或震撼頁，絕不超過 3 頁免得太小）；同時依主題產生三組 OKLCH 配色並跑 `scripts/oklch.py --palette` 驗證（禁純白純黑、禁紫色帶 H 280–335、三組 ΔE ≥ 15）。
3. 產生並排總覽並自動像素品管：

```bash
python3 <skill>/scripts/assemble.py --sheet decks/<name>/samples
node <skill>/scripts/check.mjs --sheet decks/<name>/samples
```

4. **自己先看過 `samples/sheet.jpg`**（確認「真的不同」而不只是換字體顏色、主標題最大、對比通過），再交給使用者選風格、明暗與配色，**停下來等回覆**。

### Step 4｜製作 → `deck.html`（＋可選 `IMAGE_UPGRADE.md`）

1. 將選定的 `style`、`mode` 與配色寫入 `storyboard.yaml` 與 `deck.css`。
2. 依選定的 Style DNA，逐頁在 `slides/` 撰寫自由編排 HTML 片段（商務 `status-table`／`pillars` 可直接交給底盤元件渲染）。
   - 插畫／攝影類頁面預設先由程式一次畫出完整可看版本（**零等待**），同時把場景層包進 `<div class="asset-slot" data-slot="..." data-mode="...">...</div><!-- /slot -->`。
3. 組裝單檔簡報：

```bash
python3 <skill>/scripts/assemble.py decks/<name>/storyboard.yaml --write-upgrade-list
```

若產出了可替換插槽，補齊 `IMAGE_UPGRADE.md`（參考 `templates/image-upgrade.md`）作為可選升級清單；當使用者後續把圖放到 `assets/` 後，重跑 `assemble.py` 即可無縫替換底圖、保留真文字層與動態。

### Step 5｜品管 → `check/`

```bash
node <skill>/scripts/check.mjs decks/<name>/deck.html
```

`check.mjs` 會逐頁截圖並自動檢查：**真實背景像素 WCAG 對比**（含漸層字每段色標）、主標題≥總結字級、文字溢出與邊界、最小字級、SVG 重複 ID、圖片載入、腳本錯誤。接著**親自檢視截圖**（含斷行美感與風格一致性），有問題就修對應 `slides/` 或 `storyboard.yaml` 後重建，**最多修 2 輪**；未解項目如實回報。

### Step 6｜交付　⛔ 關卡三

告知使用者：檔案位置與播放快捷鍵（`← →`／空白鍵翻頁、`F` 全螢幕、`N` 備註、`P` 列印 PDF）、一句話架構總結、品管最低對比與未解項，以及可選的 `IMAGE_UPGRADE.md`（若有）。等使用者回饋修改。

## 八條鐵律（加上設計共識）

1. **先有架構，再寫內容**：最上層章節沿單一軸、單一方向前進，不可並列。
2. **章節名稱只在一處定義**（`storyboard.yaml` 的 `chapters`），由輕底盤或 `data-auto-nav` 自動同步。
3. **總結永遠不當主標題**：主標題只寫題目（路標、≤12 字），且是頁面上最大、最先被看到的字；總結放在內文。
4. **重點只用顏色標示**（不畫底線、不用斜體），每頁最多一處 `==重點==`。
5. **不寫過場文字**：位置感交給導航（>3 章自動目錄、單章 >2 頁顯示頁籤）。
6. **震撼頁稀少且有鋪陳**：全場 0–2 次、間隔 ≥3 頁、打破導航與規則（唯開場提問 `role: opener` 例外）。
7. **裝飾可與文字交錯，可讀性由像素 WCAG 把關**：底色禁純白純黑、禁紫漸層、變暗不等於夜晚。
8. **把圖拿掉，文字依然讀得懂**：背景與圖像強化故事，真文字承載核心資訊且隨時可編輯。

## 參考檔索引（用到才讀）

| 檔案 | 什麼時候讀 |
|---|---|
| `references/grill.md` | Step 1 開始時（互動表單、頁數算術、數字查核） |
| `references/structure.md` | Step 1 推導架構與處理既有框架時 |
| `references/contexts.md` | 判斷情境、播放密度、計畫轉成果、快速模式時 |
| `references/presentation-rules.md` | Step 2 展開內容、繁體在地化、Step 5 品管時 |
| `references/content-shapes.md` | Step 2–4 判斷內容形狀（14 結構＋5 圖表）與容量上限時 |
| `references/samples.md` | Step 3 挑選三款多元風格與製作 Gate 2 樣張時 |
| `references/progress-report.md` | 定期進度回報、多單位 PPTX 檢核（`check_reports.py`）時 |
| `styles/index.json`、`styles/color-system.md`、`styles/<id>.md` | Step 3–4 撰寫樣張、推薦三組 OKLCH 配色與編排每一頁時 |
| `templates/brief.md`、`templates/storyboard.yaml`、`templates/image-upgrade.md` | 建立對應產出物時 |
