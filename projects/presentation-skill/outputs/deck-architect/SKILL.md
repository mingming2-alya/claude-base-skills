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

## 架構模式：輕底盤、強自由（Thin Shell + Free Canvas + 分層混合動態）

- **輕底盤（`assemble.py` 自動掛載，零外部依賴 100% 離線單檔）**：1920×1080 舞台縮放、單一資料來源章節導航／頁籤（支援 `data-auto-nav` 風格客製外觀）、**可打斷解析彈簧與依軸運鏡**、**跨頁 Magic Move（`data-morph`）**、**動態數據圖表原語（`data-count`、`data-draw`、`data-grow`、`data-stagger`）**、**現場互動控件隔離（`.live-ctrl`）**、**安全 30fps Canvas 2D 氛圍層（`data-fx`）**、震撼頁黑幕停頓、附件點入與返回、SVG `<defs>` ID 隔離、本機圖檔自動內嵌與 `.asset-slot` 升級、講者備註（`N`）、**低耗電靜態凍結（`B`／`?still=1`）**、全螢幕（`F`）、列印 PDF（`P`）。
- **自由編排畫布（預設 90%+ 頁面）**：依選定的 **Style DNA**（`styles/*.md`）與 `references/motion-system.md` 在 `slides/XX-*.html` 直接撰寫最貼題的 HTML／CSS／SVG（CSS 選擇器加 `.slide` 前綴確保跨頁零汙染），不受僵化模板束縛。
- **高紀律商務元件（按需自動生成）**：`status-table`（週進度長表）、`pillars`（年度一頁總覽）、自動 `toc` 目錄頁，以及快速模式未寫客製片段的頁面，由 `assemble.py` 從 `storyboard.yaml` 直接穩定生成。
- **旗艦外掛（按需、先問過）**：日常簡報不載入任何外部動效庫；僅在旗艦專案需要異形 MorphSVG、影片級時間軸或 3D WebGL 時，徵詢使用者後再透過 `#stage` 生命週期事件（`deck:slideenter`/`deck:slideleave`）掛載。

## 流程

### Step 1｜Grill → `brief.md`　⛔ 關卡一

讀 `references/grill.md`。有互動表單工具時**一律用表單問**（每張 2–4 題、題目互不依賴、建議答案放第一標「（推薦）」）：

1. 先問情境：目的（終點）、對象（起點）、場合與播放方式（`delivery`：上台講／討論／自己讀／自動播放）、時長與**頁數算術**（含不含封面與目錄）、人際顧慮。
2. **單獨先問既有框架／前一版／空白模板**，讀完後再依 `references/structure.md` 提 2–3 個架構候選（原框架必列候選之一；若最上層並列則提醒並提路徑版；計畫改成果照 `contexts.md`）。
3. 補齊各章重點與分鐘數、序幕／轉折／尾聲、證據（**關鍵數字必查核出處**）、限制與不承諾、地雷與偏好、震撼的一刻。
4. 寫出 `brief.md`（`templates/brief.md`），**停下來等使用者確認**。

### Step 2｜架構展開 → `storyboard.yaml`

讀 `references/presentation-rules.md` 與 `references/content-shapes.md`，把 brief 展開成逐頁內容（格式見 `templates/storyboard.yaml`）。務必把 brief 的限制與地雷寫進 `constraints`、標出最重要的一頁 `signature: true`、設定 `meta.delivery`，並將所有口頭補充寫入 `notes`（嚴守原則 #26 不把講者稿寫成畫面小字）。然後跑：

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

4. **自己先看過 `samples/sheet.jpg`**（確認「真的不同」而不只是換字體顏色、主標題最大、無多餘解釋小字、對比通過），再交給使用者選風格、明暗與配色，**停下來等回覆**。

### Step 4｜製作 → `deck.html`（＋可選 `IMAGE_UPGRADE.md`）

1. 將選定的 `style`、`mode` 與配色寫入 `storyboard.yaml` 與 `deck.css`。
2. 讀 `references/visual-guidance.md` 與 `references/motion-system.md`，依選定的 Style DNA 與動態個性（`spring`／`crisp`），逐頁在 `slides/` 撰寫自由編排 HTML 片段（商務 `status-table`／`pillars` 可直接交給底盤元件渲染）：
   - **真實無字 AI 底圖優先**：插畫或攝影頁若當下有生圖工具，優先依反左右割裂規則生出 16:9 無字底圖放進 `assets/` 並與 HTML 真文字層融合（拒絕簡陋幾何色塊假裝手繪）；若無生圖工具則先給程式版並將場景包進 `.asset-slot[data-slot]`。
   - **先定靜態動線、再編排動態視覺指引**：每頁依 `references/visual-guidance.md` 選定視覺動線原型（因果對照／中心放射集群／時間軌跡／控制聯動），搭配 `data-focus-plan` 聚光壓暗、`data-transform-at` 因果演變、SVG `<path data-draw>` 真描線＋HTML `data-wipe` 虛線揭露、`data-pop`／`data-ripple` 端點波紋、`data-morph` 跨頁 Magic Move 與 `.live-ctrl` 互動試算控件，**嚴禁 1 秒一鍋端與左右乒乓**。
3. 組裝單檔簡報（`assemble.py` 會自動把本機 `assets/` 圖片內嵌進單檔 `deck.html`）：

```bash
python3 <skill>/scripts/assemble.py decks/<name>/storyboard.yaml --write-upgrade-list
```

若產出了尚待升級的 `.asset-slot`，補齊 `IMAGE_UPGRADE.md`（參考 `templates/image-upgrade.md`）作為可選升級清單。

### Step 5｜品管 → `check/`

```bash
node <skill>/scripts/check.mjs decks/<name>/deck.html --motion
```

`check.mjs` 會先以 `?still=1` 靜態最終狀態逐頁截圖並自動檢查：**真實背景像素 WCAG 對比**（含漸層字每段色標）、主標題≥總結字級、文字溢出與邊界、最小字級、SVG 重複 ID、圖片載入、腳本錯誤；加上 `--motion` 則自動實測**連按方向鍵零鎖死打斷、Magic Move 掛載與清理、聚光壓暗與因果狀態復原零殘留、SVG 引導線實測有效尺寸、互動滑桿點擊隔離、`B` 鍵靜態凍結與附件進出**。接著**親自檢視截圖**（含靜態視覺動線、去小字程度、標題與內容和諧度、斷行美感），有問題就修對應 `slides/` 或 `storyboard.yaml` 後重建，**最多修 2 輪**；未解項目如實回報。

### Step 6｜交付　⛔ 關卡三

告知使用者：檔案位置與播放快捷鍵（`← →`／空白鍵翻頁、`F` 全螢幕、`N` 備註、`B` 靜態省電、`P` 列印 PDF）、一句話架構總結、品管最低對比與動態實測結果、未解項，以及可選的 `IMAGE_UPGRADE.md`（若有）。等使用者回饋修改。

## 九條鐵律（加上設計共識）

1. **先有架構，再寫內容**：最上層章節沿單一軸、單一方向前進，不可並列。
2. **章節名稱只在一處定義**（`storyboard.yaml` 的 `chapters`），由輕底盤或 `data-auto-nav` 自動同步。
3. **總結永遠不當主標題**：主標題只寫題目（路標、≤12 字），且是頁面上最大、最先被看到的字；總結放在內文。
4. **畫面上只留視覺錨點，講者稿歸講者稿（原則 #26）**：`delivery: talk` 下每群組最多 2 層文字，不寫第三層解釋小字，所有口頭補充進 `notes`。
5. **重點只用顏色標示**（不畫底線、不用斜體），每頁最多一處 `==重點==`。
6. **不寫過場文字**：位置感交給導航（>3 章自動目錄、單章 >2 頁顯示頁籤）。
7. **震撼頁稀少且有鋪陳**：全場 0–2 次、間隔 ≥3 頁、打破導航與規則（唯開場提問 `role: opener` 例外）。
8. **裝飾可與文字交錯，可讀性由像素 WCAG 把關**：底色禁純白純黑、禁紫漸層、變暗不等於夜晚。
9. **把圖與動態拿掉，文字依然完整可讀**：所有視覺指引與動態必須 60fps 可打斷、不改變翻頁直覺且支援 `?still=1`／`B` 鍵／列印完美定格；真文字隨時可編輯。

## 參考檔索引（用到才讀）

| 檔案 | 什麼時候讀 |
|---|---|
| `references/grill.md` | Step 1 開始時（互動表單、頁數算術、數字查核） |
| `references/structure.md` | Step 1 推導架構與處理既有框架時 |
| `references/contexts.md` | 判斷情境、播放密度、計畫轉成果、快速模式時 |
| `references/presentation-rules.md` | Step 2 展開內容、原則 #26 去小字、繁體在地化、Step 5 品管時 |
| `references/content-shapes.md` | Step 2–4 判斷內容形狀（14 結構＋5 圖表）與容量上限時 |
| `references/samples.md` | Step 3 挑選三款多元風格與製作 Gate 2 樣張時 |
| `references/visual-guidance.md` | Step 4–5 規劃靜態視覺動線、聚光壓暗、因果演變與引導線時序時 |
| `references/motion-system.md` | Step 4 撰寫自由畫布、加入 60fps 切頁／Magic Move／數據動畫／互動控件時 |
| `references/progress-report.md` | 定期進度回報、多單位 PPTX 檢核（`check_reports.py`）時 |
| `styles/index.json`、`styles/color-system.md`、`styles/<id>.md` | Step 3–4 撰寫樣張、推薦三組 OKLCH 配色與編排每一頁（含 `workday`、`counsel`、`apple`、`illustration`）時 |
| `templates/brief.md`、`templates/storyboard.yaml`、`templates/image-upgrade.md` | 建立對應產出物與撰寫反左右割裂生圖提示詞時 |
