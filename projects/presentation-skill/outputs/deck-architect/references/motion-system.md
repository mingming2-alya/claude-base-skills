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

## 5. v4.4 雙軌擴充規格（下一輪底盤引擎實作目標）

> 以下三項已於 2026-11-25 規格定案，排定於下一輪 `runtime.js`／`shell.css`／`assemble.py` 引擎升級實作。**在底盤尚未實作前，撰寫成品請勿直接假設這些屬性已生效，僅於 `brief.md`／`storyboard.yaml` 標記設計意圖。**

1. **講者可控點擊步進（`data-step="1|2|3"`）**：與預設 `0-step` 自動演繹雙軌並行。限 `pitch`／`keynote` 中需要講者停頓掌控包袱的 1–3 頁（單頁多層換幕、公式滑入補完、壓軸金句）；`→` 推進步進、尾步後翻下頁、`←` 退回、`?still=1` 與列印自動展開最終態。
2. **雙軌影音媒體原語（外連媒體控制＋HTML5 原生活 Demo）**：
   - **真實影片／實證音檔**：透過外部相對路徑媒體目錄掛載 `<video data-slide-video>`（自動播放／靜音循環／離頁即停歸零）與 `<audio data-sound-demo>`（含視覺波形與一鍵播停），不將大型影音塞入 Base64；`?still=1` 與列印定格海報幀。
   - **HTML5 原生活產品流程輪播卡與 3D 照片輪播**：以 ~15 KB 原生 CSS/SVG 動畫與 `.live-ctrl` 互動切換重現產品流程展示與照片 CoverFlow，免去預錄肥大 MP4 且支援無限解析度。
3. **單頁極性切換與自動隱藏控制列**：支援單頁 `data-surface="dark|light|split|photo"` 變數切換，以及 `nav_mode: divider-only` 下底部工具列自動隱藏（滑鼠移近底邊浮現）。

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
