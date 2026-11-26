# 模組手冊（三）：講者工具、氛圍特效與視覺質感（Presenter & FX）

> 僅在設定現場演講控制台、背景氛圍 Canvas 或點擊放大燈箱／微傾角效果時載入本手冊。

## 1. Layer 1 講者臨場工具（`assets/presenter/`）

### 自動掛載規則與覆寫
- `meta.delivery: talk` 或 `discuss` → 預設載入 **`[grid, annotator, speaker]`**。
- `meta.delivery: read` 或 `auto` → 預設僅載入 **`[grid]`**。
- 如需客製（例如某份發表會不想顯示畫筆，或想完全關閉），在 `storyboard.yaml` 指定：
  ```yaml
  meta:
    presenter_tools: [grid, speaker]   # 或 [] 完全不注入 Layer 1
  ```

### 三項工具與熱鍵（皆自動註冊至底部 `#ctrl-bar` 與 Overlay 層級）
1. **`grid`（`G` 鍵｜Overlay 優先級 70）**：開啟 16:9 即時縮圖矩陣，標示目前所在頁與附件頁，點擊任一頁直接跳轉；開啟時鎖定翻頁鍵，按 `Esc` 或 `G` 關閉。
2. **`annotator`（`A` / `L` / `C` 鍵｜Overlay 優先級 90）**：
   - `A` 鍵：進入 1920×1080 舞台鎖定座標的 SVG 畫筆／螢光筆模式（視窗怎麼縮放筆跡都不跑位，支援 3 色、復原與清除），開啟期間點擊畫布改為畫線而不翻頁；`Esc` 退出畫筆並保留畫面筆跡。
   - `L` 鍵：開啟／關閉紅光雷射筆（**不鎖定翻頁**，講者可一邊指著圖表一邊翻頁）。
   - `C` 鍵：清除本頁筆跡。
3. **`speaker`（`S` 鍵）**：開啟零依賴雙螢幕講者視窗，透過 `BroadcastChannel`（附 `localStorage` 備援）與主畫面即時雙向同步：顯示當前頁碼／步進、下頁預覽、可調字級的講者備註、經過時間計時器，並可從講者視窗直接遙控主畫面翻頁。

> 所有 Layer 1 工具在 `?still=1` 與 `@media print` 皆自動完全隱藏。

## 2. 氛圍特效插件（`ambient-fx` · 6 種單特效按需注入）

在 `<section class="slide" data-fx="特效名稱">` 宣告。`assemble.py` 只會載入 `fx/base.css` + `fx/core.js` + **實際有用到的單一特效檔**，480×270 GPU 拉伸（低耗電）、延遲啟動、翻頁／`?still=1`／`B` 鍵／列印自動歸零停播，並自動讀取該頁 CSS 變數 `--fx-color`（預設取 `--accent` / `--accent2`）：

| `data-fx` 值 | 視覺氣質 | 最適合的場景 |
|---|---|---|
| `ambient-dust` | 細微浮光塵粒 | 攝影暗房封面、品牌故事扉頁 |
| `soft-aurora` | 柔緩色暈極光球 | 產品發表會封面、願景收尾頁 |
| `constellation` | 輕量動態星群連線網 | AI / 系統架構 / 網路生態系封面 |
| `data-stream` | 淡雅數據訊號流線 | 遙測監控、即時管線、金融科技封面 |
| `orbit-ring` | 緩慢幾何軌道弧線 | 平台戰略、生態系總覽頁 |
| `confetti-burst` | 進頁一次性慶祝彩片（落地自動停止零耗電） | 里程碑達成、頒獎、年度突破震撼頁 |

> **場合紀律**：`briefing` 禁用；`pitch` 最多 1 頁；`keynote` 最多 2 頁。

## 3. 視覺質感與高密圖表放大（`visual-flair`）

1. **`[data-zoomable]`（強烈推薦用於高密架構圖／流程圖／照片）**：
   - 加在 `<img>`、`<svg>` 或外層容器上（可加 `data-zoom-caption="圖說"`）。
   - 現場點擊即彈出 `#deck-lightbox` 滿版清晰放大（Overlay 優先級 80，`Esc` 或點擊背景關閉），解決大會議室後排看不清複雜架構圖的痛點。
   - **允許用於 `briefing`、`pitch`、`keynote` 所有場合**。
2. **`[data-tilt]`（僅建議用於 `pitch`/`keynote` 焦點卡片）**：
   - 游標驅動的細微 3D 透視傾角，硬上限鎖死在 `≤ 5°`（可用 `data-tilt="3"` 指定角度），移出平滑歸零，靜態與列印自動關閉。
3. **`[data-spotlight-hover]`**：
   - 卡片游標跟隨的柔亮 `--accent` 光暈掃過效果，純 GPU 漸層，靜態與列印自動關閉。
