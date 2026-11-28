# 動態系統與三層引擎指南（Motion System — v5.0）

> **v5.0 動態第一性原理**：
> 1. **敘事觀看動效全風格唯一標配「從容慢板（Calm Human-Breath Tempo）」**：不再設快慢三檔旋鈕——無論 `counsel`、`workday`、`apple` 或 `illustration`，凡承載資訊推進的描線、長條生長、數字滾動與群組交錯，一律對齊人類肉眼舒適追視與呼吸節奏，拒絕「35ms 一閃而過」的廉價快切。
> 2. **操控互動維持即時跟手（`~180–280ms`）**：點擊展開卡片、拖曳比較拉桿、調整試算滑桿與連按方向鍵快速跳頁，保持零延遲即時回饋與隨時可打斷（Zero Lockout）。

---

## 一、全風格統一「從容慢板」時間基準表（`runtime.js` 內建預設）

| 動效類別 | 標準時長／拍距 | 減速曲線 | 設計目的 |
|---|---|---|---|
| **SVG 路徑／圓環描繪** (`[data-draw]`) | **`980 ms`**（範圍 `800–1,200ms`） | `cubic-bezier(0.22, 1, 0.36, 1)` | 讓眼睛清楚跟隨收斂漏斗、因果箭頭與趨勢線走向 |
| **比例長條方向生長** (`[data-grow]`) | **`920 ms`**（多條自動交錯 `+120ms`） | `cubic-bezier(0.22, 1, 0.36, 1)` | 清楚感受前後幅度與佔比量體 |
| **遮罩方向揭露** (`[data-wipe]`) | **`860 ms`** | `cubic-bezier(0.22, 1, 0.36, 1)` | 虛線引導針、橋接軌線平順展開不拉扯 |
| **數字計數／機械滾輪** (`[data-count]` / `[data-odometer]`) | **`960 ms`**（位數交錯 `110ms`） | 柔緩減速煞停 | 關鍵指標沉穩落定，不瘋狂亂跳 |
| **群組依序交錯** (`[data-stagger]`) | **`220–320 ms` / 項**（預設 `240ms`，單項 `680ms`） | `cubic-bezier(0.22, 1, 0.36, 1)` | 依 `1 → 2 → 3` 視線動線從容就位 |
| **因果壓縮演變** (`[data-transform-at]`) | 預設 **`1,400 ms`** 觸發（含 **`≥ 600ms` 舊態靜止停頓**＋`900ms` 過渡） | `cubic-bezier(0.22, 1, 0.36, 1)` | 先看清舊態基線，再親眼見證收斂改變 |
| **講者點擊步進** (`[data-step]`) | 容器浮現 **`580 ms`**；子原語延遲 **`revealDelay = 340 ms`** 才開跑 | `cubic-bezier(0.22, 1, 0.36, 1)` | 徹底消除容器還在半透明滑入時內部滾輪／描線已搶跑播完 |
| **直接操控互動**（滑桿／切換／展開） | **`180–280 ms`** | `cubic-bezier(0.2, 0.9, 0.25, 1)` | 現場點擊與拖拉零遲滯跟手 |

---

## 二、60fps 純 GPU 合成與底盤防呆鐵律

1. **只動畫合成器屬性**：切頁與進場僅使用 `transform`、`opacity`、`clip-path`（搭配 SVG `stroke-dashoffset`）；嚴禁大面積動態 `backdrop-filter`、巨幅 `<feGaussianBlur>` 或把 `steps(5)` 用於整頁位移。
2. **嚴守 `#stage > .slide { position: absolute; inset: 0; }`**：`shell.css` 已鎖定絕對疊放定位，**切勿在 `deck.css` 或單頁 `<style>` 將 `.slide` 改成 `position: relative/static`**（`check.mjs` 會直接硬擋 FAIL）。
3. **SVG 描線必掛在幾何元素上**：`[data-draw]` 只能掛在具備 `getTotalLength()` 的 `<path>`、`<line>`、`<polyline>`、`<polygon>`、`<circle>`、`<rect>` 上（或圓環進度 `data-draw="ring"`），**嚴禁掛在 `<g data-draw>` 容器上**（`check.mjs` 硬擋 FAIL）；SVG 直線切勿誤用 `data-grow`（0 寬高 BBox 縮放會失效）。
4. **單頁 CSS 註解安全**：`assemble.py` 支援單頁 `<style>` 自動加上 `[data-slide-scope="sNN"]` 屬性作用域（已處理註解內含逗號之情境），但仍建議保持選擇器簡潔清晰。
5. **首頁與步進事件保證**：底盤於 `DOMContentLoaded` 統一派發首頁 `deck:slideenter`，並在每次 `data-step` 推進時派發 `deck:stepchange`（含 `detail.step` 與 `detail.revealDelay`），4 套 `motion-*` 風格套件皆自動對齊延遲，無需手寫 hack。
6. **100% 確定性靜態終態**：HTML 原始 DOM 永遠寫最終正確狀態；`?still=1`、`B` 鍵省電模式、`prefers-reduced-motion: reduce` 與 `beforeprint` 列印事件皆自動展開至最終步進與完整數據。

---

## 三、六種敘事切頁語法（`data-transition`）

| `data-transition` | 運鏡體感 | 適用敘事關係 |
|---|---|---|
| `push` | 鏡頭水平橫移（舊頁微視差退後） | 沿時間軸、流程軸順向推進 |
| `zoom-rise` | 舊頁退深景、新頁由下升起聚焦（可配 `data-morph`） | 總覽切入核心系統／機制細節 |
| `iris` | 圓形光圈由焦點綻放（`data-iris-origin="50% 65%"`） | 暗場核心裝置展開進入真實情境現場 |
| `shock` | 黑幕頓點 → 主張破暗浮現（`type: shock` 預設） | 全場 0–2 次關鍵轉折或震撼金句 |
| `morph` | 靜謐淡入 ＋ 跨頁同 `data-morph="id"` FLIP 飛行變形 | 核心數字／圖塊跨頁延續放大或進入試算 |
| `sheet-up` | 亮色決策頁由底抽出升起 | 機制推演切入最終拍板／行動清單頁 |

---

## 四、底盤宣告式原語速查表（唯一來源 SSOT）

| 原語屬性 | 作用 | 常用選填參數 | 靜態／列印表現 |
|---|---|---|---|
| `data-step="1\|2\|3"` | 講者按 `→` 累積揭曉（支援巢狀步驟嚴格隔離） | `data-step-hide="2"`、`data-step-only="0"`、`data-step-from="up\|left\|none"` | 自動展開至最大步數 |
| `data-focus-plan="1@0-1600,2@1600-3200"` | 自動三層聚光壓暗排程，演畢或互動搶先時 100% 歸零 | 搭配子元素 `data-focus="1"`、`data-focus-style="clean"` | 全頁 `opacity: 1` |
| `data-transform-at="1400"` | 進頁先套 `.pre-transform` 舊態，到點切換最終態 | 毫秒數（建議 `≥1200` 留足舊態閱讀窗） | 直接顯示最終態 |
| `data-stagger="240"` | 直接子元素依序從容滑入（子元素勿重複加 `.rv`） | 毫秒間距（建議 `220–320`） | 全部正常顯示 |
| `data-beat="1\|2\|3\|4"` | 語意分拍進場（預設拍距 `1360ms`） | `data-from="up\|left\|right"`、`data-beat-gap` | 全部正常顯示 |
| `data-draw` / `data-draw="ring"` | SVG 幾何路徑描繪／圓環掃描 | `data-delay`、`data-dur`（預設 `980`） | 完整繪出 |
| `data-grow="x\|x-left\|y\|y-down"` | HTML 條圖／甘特條純 GPU 方向生長 | `data-delay`、`data-dur`（預設 `920`） | 完整展開 |
| `data-wipe="right\|left\|down\|up"` | HTML 虛線／軌線 `clip-path` 方向揭露 | `data-delay`、`data-dur`（預設 `860`） | 完整展開 |
| `data-count` | 數字從 0（或 `data-from`）滾動至文字終值 | `data-delay`、`data-dur`（預設 `960`） | 顯示最終數值 |
| `data-pop` / `data-ripple` | 線條終點圓點綻放／目標點單次雙圈波紋 | `data-delay`（對齊 `data-draw` 抵達時刻） | `pop` 顯示／`ripple` 隱藏 |
| `data-morph="key"` | 前後頁同 `key` 元素跨頁 FLIP 平滑變形 | `--morph-ms`（預設 `780`） | 各自正常顯示 |
| `.live-ctrl` ＋ `.live-only` | 現場互動控件防誤翻隔離＋列印自動隱藏控制列 | 頁內 `<script>` 監聽 `input` 即時重算 | 隱藏 `.live-only` 外殼 |

---

## 五、三層按需引擎與外掛生命週期契約

- **Layer 0 常駐輕底盤（`shell.css` + `runtime.js`）**：1920×1080 等比舞台、單頁 `data-surface="light|dark|split|photo"`、三種 `nav_mode`、雙軌節拍、Overlay `Esc` 優先級佇列。
- **Layer 1 講者工具（`assets/presenter/`，依 `delivery` 自動載入）**：`grid`（`G`）、`annotator`（`A`/`L`/`C`）、`speaker`（`S` 雙螢幕講者台）。
- **Layer 2 細粒度按需模組（掃描 HTML 自動注入，未用到 0 KB）**：`components/*`、`ambient-fx/*`、`live-controls`、`fit`、`media`、`flow-carousel`、`coverflow`、`linked-highlight`、`compare-slider`、`code-stage`、`visual-flair`，以及 **4 套風格綁定動態套件 `motion-{workday,counsel,apple,story}`**（詳細語法見 `references/modules-catalog.md` 與 `references/modules/style-motion-kits.md`）。
- **外部動效庫事件契約（僅旗艦專案徵得同意後啟用）**：監聽 `window.__deck.stage` 之 `deck:slideenter`（檢查 `detail.staticMode`）、`deck:stepchange`（讀取 `detail.step` 與 `detail.revealDelay`）、`deck:slideleave`（清理計時器與 rAF）與 `deck:lowpower`。
