# 動態系統指南（Option 1｜分層混合架構）

`deck-architect` 採用**分層混合架構（Option 1）**：

- **日常簡報核心（~11 KB 零外部依賴）**：內建於輕底盤 `assets/runtime.js`＋`assets/shell.css`，純原生瀏覽器 API（WAAPI + 解析彈簧 + FLIP + SVG + Canvas 2D），**雙擊 `deck.html` 即可 100% 離線流暢播放**，無需任何 CDN 或套件安裝。
- **旗艦專案外掛介面（按需、事前徵詢）**：僅當旗艦發表會明確需要異形 `MorphSVG`、60fps 影片輸出時間軸、複雜手勢物理或 WebGL／Three.js 3D 場景時，**先徵得使用者同意**後才掛載外部函式庫（見第 7 節外掛事件契約）。

---

## 1. 六條動態設計與 60fps 效能鐵律

1. **永遠可打斷（Zero Lockout）**：連按方向鍵或快速滑動時立刻取消前一段動畫並直達目標，絕不鎖死。
2. **純 GPU 合成器優先（鎖定 60fps、拒絕卡頓）**：
   - 切頁與進場只動畫 `transform`、`opacity`、`clip-path`（2 個關鍵影格即可，不用 28 格 JS 取樣）；`.slide` 啟用 `contain: layout style paint`。
   - **禁止跨頁巨幅重濾鏡**：不在大尺寸投影片放 `stdDeviation="48"` 的全頁 SVG `<feGaussianBlur>`、live `<feTurbulence>` 或動畫中疊 `backdrop-filter`——改用零耗能 CSS `radial-gradient` 光暈與高質感半透明底色。
   - **禁止把 `steps(5)` 用在整頁移動**：改用俐落平滑曲線配精準節奏。
   - Canvas 2D 背景層採 `480×270` 低解析度拉伸並**延遲至切頁完成後 520ms 才啟動**，絕不與切頁搶 GPU。
3. **同一頁必須「引導視線」，不可一鍋端同時淡入**：
   - 依 `references/visual-guidance.md` 的 3–4 個語意節拍（`data-beat="1|2|3|4"`）與聚光壓暗（`data-focus-plan`）單向帶走視線，每拍留足 **1.3–1.8 秒**與 **0.6–0.9 秒靜止閱讀窗**。
4. **頁與頁之間要有敘事變化與連貫性**：
   - 依兩頁關係選用 6 種 `data-transition`，前後頁有共同關鍵數字群時優先做編隊 Magic Move（但**內容語意順序永遠高於轉場花招**）。
5. **進慢出快、絕不露黑底**：切頁時舊頁維持 `opacity: 1` 墊底，消除閃爍感。
6. **所有動態必須有完美靜態定格**：`?still=1`、`B` 鍵省電凍結、`prefers-reduced-motion: reduce` 與 `@media print` 下精準停在最終狀態。

---

## 2. 六種敘事切頁語法（`data-transition`）

在 `<section class="slide canvas" data-transition="...">` 指定切入該頁的運鏡（往回翻時底盤自動鏡像倒放）：

| `data-transition` | 體感與視覺比喻 | 適用敘事轉折 |
|---|---|---|
| `push` | 電影鏡頭水平橫移（舊頁微視差退後） | 封面 → 正文、沿時間／流程軸前進 |
| `zoom-rise` | 舊頁微退深景、新頁由下升起聚焦（可疊加 `data-morph`） | 痛點總覽 → 放大進入核心產品／系統解法 |
| `iris` | 圓形光圈由焦點向外綻放（`data-iris-origin="48% 72%"`，可疊加 `data-morph`） | 深色演算法裝置 → 展開進入真實日光現場／情境故事 |
| `shock` | 俐落黑幕頓點 → 巨字破暗而出（`type: shock` 自動啟用） | 情緒轉折或核心損益衝擊時刻 |
| `morph` | 純 260ms 靜謐淡入＋**多元素編隊 Magic Move** 飛移變形 | 同組關鍵數字從結論頁直接變身現場互動試算頁 |
| `sheet-up` | 舊頁微縮退後、亮色決策看板由底升起（如抽出簽核表） | 推演／試算 → 進度追蹤與主管拍板頁 |
| `modal` | 景深縮放進入／退回（附件頁自動啟用） | 主線點入技術規格／原始數據附件 |

---

## 3. 頁內視線引導語法（Eye-Guidance Choreography — 詳見 `references/visual-guidance.md`）

撰寫自由畫布頁前，先依 **`references/visual-guidance.md`** 選定視覺動線原型，再以宣告式屬性導演視線（嚴守一拍一主角、禁止左右跨螢幕乒乓與連續奔跑移動球）：

- **聚光＋非焦點壓暗排程（`data-focus-plan` ＋ `data-focus="1|2|3"`）**：當拍主角 `.focus-active`（粗亮框＋≥20px 外光暈，群組／浮空字加 `data-focus-style="clean"`）、已演完 `.focus-visited`（`0.78–0.84`）、未出場 `.focus-dim`（`0.26–0.32`）；演畢／打斷／搶先互動瞬間歸零復原。
- **因果現場演變（`data-transform-at="780"`）**：HTML 原 DOM 為最終態；進頁瞬間先套 `.pre-transform` 展現舊態，到點移除翻轉新態。
- **語意節拍（`data-beat="1|2|3|4"` ＋ `data-from`）**：`BEAT_MS = {1:120, 2:760, 3:1480, 4:2200}`，可配 `data-delay` 精細微調。
- **真描線與方向揭露**：實線用 SVG `<path data-draw>`（`pathLength="1"`）；圓環用 `data-draw="ring"`；虛線引導針／時間軌／斜刪線用 HTML `data-wipe="down|right|left|up"`；長條生長用 `data-grow="x|x-left|y|y-down"`。
- **端點綻放與目標波紋**：`data-pop` 與線條抵達時刻精準對齊；`data-ripple` 釘住插畫物件或折線端點；`data-nudge="x"` 進場微動暗示滑桿可拖曳；`data-travel` 限單段短距過場、禁跨多站滑行。
- **高反差單次聚光框（`data-spotlight`）**、**跨頁 Magic Move（`data-morph="id"`，MIT `open-slide`）**、**節流滾動數字（`data-count`，MIT `scrolline`）**、**延遲 Canvas 2D 氛圍層（`data-fx="ambient-dust"|"soft-aurora"`，MIT `lewislulu`）**。

---

## 4. 現場互動試算控件（Live Figures）
*模式取自 MIT `visual-explainer`*

簡報內可嵌入即時滑桿、開關或情境切換鈕：
1. 外層容器加 `.live-ctrl`（或 `data-interactive`）：底盤自動攔截點擊與焦點按鍵，操作控件絕不誤觸翻頁（按 `Esc` 離開焦點）。
2. 純控制條外層加 `.live-only`：列印 PDF 或 `?hide-ctrl=1` 自動隱藏滑桿外殼，保留預設數據與圖表。
3. 頁內 `<script>` 接收 `slide` 區域變數，寫純函式 `render(fromUser)` 在初始化與 `input` 事件更新數據並於搶先操作時解除聚光壓暗。

---

## 5. v4.5 三層按需引擎架構（Layer 0 輕底盤 ＋ Layer 1 講者工具 ＋ Layer 2 按需內容模組）

v4.5 輕底盤引擎將**核心基礎設施**、**講者臨場工具**與**內容說服模組**徹底解耦：`assemble.py` 會依 `delivery`／`meta.presenter_tools` 掛載 Layer 1，並細粒度掃描投影片 HTML，**僅將實際用到的 Layer 2 模組（甚至單一特效與單一元件 CSS）注入 `deck.html`，未用到即 0 KB 零負擔**，並寫入 `window.DECK.modules` 與 `window.DECK.presenterTools`。

### 5.1 核心雙軌擴充（常駐於 `shell.css` ＋ `runtime.js`）
1. **單頁明暗極性（`data-surface="dark|light|split|photo"`）**：
   - 可寫在 `<section class="slide canvas" data-surface="light">` 或 `storyboard.yaml` 單頁 `surface:` 欄位。
   - 底盤依 `--light-*`／`--dark-*`（`deck.css` 可覆寫，未定則自動退回高對比安全預設）切換底色與文字變數，並同步更新 `#stage[data-active-surface]` 讓導航與外殼自動反差。
2. **導航模式（`meta.nav_mode`：`top-bar` / `minimal-side` / `divider-only`）與自動隱藏底控膠囊**：
   - `meta.stage_mode: keynote` 預設 `divider-only`；單頁可用 `data-nav="minimal-side|top-bar|divider-only|inline|none"` 覆寫。
   - 所有模式統一內建 **2px 極細進度條**與**自動隱藏懸浮底控膠囊 `#ctrl-bar`**（滑鼠移近視窗底邊 96px 浮現，顯示頁碼、步進狀態與 `N/B/F` 快捷鈕，2.2 秒無操作自動淡出；`?still=1`、列印與 `?hide-ctrl=1` 完全隱藏）。
3. **講者可控點擊步進（`data-step` / `data-step-hide` / `data-step-only`）**：
   - 與預設 `0-step` 自動視覺指引雙軌並行。`data-step="1|2|3"` 累積揭曉，`data-step-hide="2"` 指定步數退場，`data-step-only="0|1"` 單步獨顯（支援單頁多層換幕）；可配 `data-step-from="up|down|left|right|scale|none"`。
   - 步進區塊內部的 `data-draw`、`data-wipe`、`data-count`、`data-pop` 會延遲至該步點擊才觸發。
   - 尾步後按 `→` 翻下頁；往回翻進前頁時自動落於該頁終態（step N），步進中按 `←` 逐層回退；`?still=1`、`B` 鍵與列印自動展開最終態並隱藏已退場圖層。

### 5.2 三層細粒度按需自動注入架構（v4.5 升級，完整對照見 `references/modules-catalog.md`）

- **Layer 1 講者臨場工具（`assets/presenter/`）**：`grid`（`G` 16:9 總覽）、`annotator`（`A` 畫筆／`L` 雷射／`C` 清除）、`speaker`（`S` 雙螢幕講者同步）；依 `delivery` 自動載入或由 `meta.presenter_tools` 覆寫。
- **Layer 2 內容說服模組（掃描 HTML 細粒度注入，未用到 0 KB）**：
  - `components/*`（單檔注入 `status-table`／`pillars`／`toc`／`cmp-fallback`／`device-frame`）
  - `ambient-fx/*`（單特效注入 6 種讀色票 Canvas：`ambient-dust`／`soft-aurora`／`constellation`／`data-stream`／`orbit-ring`／`confetti-burst`）
  - `live-controls`（滑桿／`[data-segmented]`／`[data-toggle]`／`[data-presets]`／`[data-reset]`）、`fit`（含 `data-fit="box"` 與 `?noscale=1`）
  - `media`（影片 `data-start`/`data-end`/`data-rate`/全螢幕 ＋ 音檔/`[data-sound-ab]` 同步 A/B 切換）
  - `flow-carousel`（`vertical|horizontal|stepper|chat` 4 模式）、`coverflow`（3D 輪播＋燈箱＋`[data-marquee]`）
  - `linked-highlight`（`[data-ref]` 文圖雙向聯動）、`compare-slider`（`[data-compare-slider]` 前後拉桿）、`code-stage`（`[data-code-stage]` 步進程式碼聚焦＋`[data-typewriter]`）、`visual-flair`（`[data-zoomable]` 燈箱＋`[data-tilt]`≤5°＋`[data-spotlight-hover]`）。
  - **風格綁定動態原語（`assets/modules/motion/*`，v4.7 與 `styles/index.json` 一體掛勾）**：
    - `motion-workday`：`[data-ruler-progress]`、`[data-bento-expand]`
    - `motion-counsel`：`[data-rank-race]`、`[data-odometer]`、`[data-rack-focus]`
    - `motion-apple`：`[data-split-mask]`、`[data-spotlight-sweep]`、`[data-depth-deck]`、`[data-colorize-wipe]`
    - `motion-story`：`[data-popup-fold]`、`[data-chat-replay]`

### 5.3 迪士尼動效物理 4 條簡報實戰守則（消除塑膠感、嚴禁每頁全開）

1. **主從延遲（Follow-Through）**：主標題／主視覺先到，細節標籤、目標線與陰影慢 120–220ms 跟上，絕不齊步同時淡入。
2. **節奏不對稱（Timing Asymmetry）**：進場快切慢煞（強調抵達感）、退場乾脆迅速；不同通道（位移 vs 透明 vs 縮放）錯開曲線。
3. **依風格決定過衝（Overshoot & Settle）**：`workday` 零過衝俐落煞停；`counsel` 僅數字滾輪帶極微煞停感；`apple` 與 `illustration` 適度加入物理彈性回正。
4. **風格綁定、絕不混搭失控**：永遠從 `styles/index.json` 查詢該風格的 `motion_dna`（推薦原語與禁忌清單），讓動態服務主題與風格而非炫技。

> 撰寫各模組詳細 HTML 語法與場合預算上限時，請按需查閱 `references/modules-catalog.md` 與 `references/modules/` 子手冊（含 `style-motion-kits.md`）。

---

## 6. 雙重靜態保險與快捷鍵

| 機制 | 觸發方式 | 行為 |
|---|---|---|
| **靜態檢核模式** | 網址加 `?still=1`（`check.mjs` 自動啟用） | 跳過動畫與 Canvas FX，數字／圖表／SVG 精準定格最終態 |
| **低耗電凍結開關** | 播放中按 `B` 鍵 | 切換 `body.low-power`，凍結動態與微塵 |
| **系統減少動態** | `prefers-reduced-motion: reduce` | 改用極簡純淡入淡出 |
| **列印／輸出 PDF** | 按 `P` 鍵或 `check.mjs --pdf` | 全頁展開 `1920×1080`、隱藏 `.live-only`、保留完整靜態數據與圖表 |

---

## 7. 旗艦專案外掛事件契約（按需啟用）

若使用者明確同意導入外部動效庫（如 GSAP、Motion、Three.js），監聽 `#stage` 生命週期事件並尊重靜態旗標：

```js
const stage = window.__deck.stage;
stage.addEventListener('deck:slideenter', ({ detail }) => {
  if (detail.staticMode) return;
  // 僅啟動目前頁面動畫
});
stage.addEventListener('deck:slideleave', ({ detail }) => {
  // 立即清理上一頁時間軸／WebGL rAF
});
stage.addEventListener('deck:lowpower', ({ detail }) => {
  // detail.lowPower === true 時暫停或定格
});
```
