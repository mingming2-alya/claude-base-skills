# 動態系統指南（Option 1｜分層混合架構）

`deck-architect` 採用**分層混合架構（Option 1）**：

- **日常簡報核心（~10 KB 零外部依賴）**：內建於輕底盤 `assets/runtime.js`＋`assets/shell.css`，純原生瀏覽器 API（WAAPI + 解析彈簧 + FLIP + SVG + Canvas 2D），**雙擊 `deck.html` 即可 100% 離線流暢播放**，無需任何 CDN 或套件安裝。
- **旗艦專案外掛介面（按需、事前徵詢）**：僅當旗艦發表會明確需要異形 `MorphSVG`、60fps 影片輸出時間軸、複雜手勢物理或 WebGL／Three.js 3D 場景時，**先徵得使用者同意**後才掛載外部函式庫（見文末外掛事件契約）。

---

## 1. 五條動態設計鐵律（避免 AI 味廉價動畫）

1. **永遠可打斷（Zero Lockout）**：連按方向鍵時立刻取消前一段動畫並從當前目標繼續前進，絕不鎖死鍵盤。
2. **預設零回彈（`bounce: 0`）**：商務與發表簡報預設臨界阻尼（critically damped）；僅在插畫／活潑風格才微開彈跳或逐格手感。
3. **進慢出快、絕不露黑底**：切頁時舊頁維持 `opacity: 1` 墊底，新頁平滑覆蓋進場（僅震撼頁黑幕例外），消除閃爍感。
4. **不重複進場、不機械等距**：父層與子層絕不同時掛 `.rv`／`data-stagger`；不用 `scale(0)` 彈出（起點最多 `scale(0.95)`）；交錯延遲採前快後斂的遞減節奏。
5. **所有動態必須有完美靜態定格**：`?still=1`、`B` 鍵省電靜態模式、`prefers-reduced-motion: reduce` 與 `@media print` 下，所有數字、圖表、SVG 皆自動定格於最終正確狀態。

---

## 2. 風格動態個性（Style Personality Tokens）

在 `deck.css` 或單頁 `.slide` 設定 `--motion-mode`，輕底盤會自動匹配物理曲線：

| `--motion-mode` | 體感 | 適用風格 | 選用微調變數 |
|---|---|---|---|
| `spring`（預設） | 解析阻尼彈簧（Apple Keynote 手感） | `apple`、`cinema`、深色故事頁 | `--spring-response: 0.54`、`--spring-bounce: 0`（0–0.35） |
| `crisp` | Expo-out 俐落精準、零多餘尾韻 | `counsel`、`workday` | `--enter-easing: cubic-bezier(0.16, 1, 0.3, 1)` |
| `stepped` | 輕量逐格定格（`steps(5, end)`） | `illustration`（紙黏土／剪紙／像素） | `--step-frames: 5` |

---

## 3. 宣告式動態語法速查（零手寫 JS）

只需在自由畫布 HTML 加上 `data-*` 屬性，`runtime.js` 會自動驅動並負責打斷清理與靜態定格：

### ① 跨頁 Magic Move（`data-morph="id"`）
*靈感取自 MIT `open-slide`*

讓前後兩頁（正向與反向皆支援）同一個核心元素（如關鍵數字 `4.2%`、標題、狀態牌）平滑飛移、縮放與變色到新位置：

```html
<!-- Slide 1 -->
<b class="hl" data-morph="hero-rate">4.2<small>%</small></b>

<!-- Slide 3（同一個 id，位置與字級皆不同） -->
<b data-morph="hero-rate">4.2<small>%</small></b>
```

- **規則**：同一頁內每個 `data-morph` 值必須唯一；有配對到 `data-morph` 的切頁會自動改用純 `280ms` 淡入（不與位移搶戲），同時讓 clone 以 `~780ms` 彈簧飛抵目標位置。
- 若想保留色塊／圓角變形，直接加在卡片或膠囊容器上即可。

### ② 數字滾動就位（`data-count`）
*靈感取自 MIT `scrolline` / `beatdeck`*

切入該頁時從 `0` 平滑滾動到元素內的數值（自動保留正負號、小數位與子元素如 `<small>%</small>`）：

```html
<b data-count>−63<small>%</small></b>
<div class="overall-num" data-count data-delay="120">51<span>%</span></div>
```

- **建議**：若元素同時掛了 `data-morph`，避免再掛 `data-count`（讓 Magic Move 專心飛移，不互相干擾）。

### ③ SVG 路徑繪製與進度環（`data-draw`）
*靈感取自 MIT `visual-explainer`*

- **折線／曲線／標註線**：在 `<path>` 或 `<line>` 加 `data-draw`（可搭配 `data-delay="220"`、`data-dur="850"`），底盤自動設 `pathLength="1"` 並由起點滑順描出。
- **SVG 圓環進度**：在進度 `<circle>` 加 `data-draw="ring"`，並於靜態屬性寫好 `stroke-dasharray="<圓周>"` 與 `stroke-dashoffset="<最終偏移>"`（讓無 JS／列印時直接呈現正確進度），進入該頁時自動由空環掃至目標值：

```html
<circle cx="88" cy="88" r="72" fill="none" stroke="#2E7D63" stroke-width="15"
        stroke-linecap="round" stroke-dasharray="452.4" stroke-dashoffset="113.1"
        transform="rotate(-90 88 88)" data-draw="ring" data-delay="180"/>
```

### ④ 長條／柱狀圖生長（`data-grow="x|y"`）
```html
<div class="b-fill" style="width:86%" data-grow="x" data-delay="240"></div>
<div class="mb-fill" style="height:75%" data-grow="y" data-delay="180"></div>
```

### ⑤ 非等距重點交錯進場（`data-stagger`）
在清單、矩陣（如 24 盤陣列）或 Bento 群組外層加 `data-stagger`（選填基礎間隔 ms，預設 `45`）：

```html
<div class="tray-grid" data-stagger="24">
  <div class="tray kept">...</div>
  ...
</div>
```

- 採用前快後斂的遞減延遲曲線，且自動避免子節點 `.rv` 重複觸發。

### ⑥ CSS 路徑流動光點（`data-token`）
在 SVG 曲線旁疊加純 CSS 流動節點（`.flow-token` 配合 `offset-path: path(...)`），靜態模式（`html.still`、`body.low-power`、`prefers-reduced-motion`）下自動暫停。

### ⑦ 安全 Canvas 2D 背景氛圍層（`data-fx`）
*生命週期模式取自 MIT `lewislulu/html-ppt-skill`*

在 `<section class="slide canvas" data-fx="ambient-dust">` 或 `data-fx="soft-aurora"` 掛上微氛圍背景：

- `ambient-dust`：極柔和的暖光微塵漂浮（適合攝影封面、手工烘焙／質感故事頁）。
- `soft-aurora`：極慢速呼吸的暗場氛圍光暈（適合 Apple 發表或電影感震撼頁）。
- **嚴格資源紀律**：鎖定 ≤30fps，僅在「該頁為目前作用頁」時執行 `requestAnimationFrame`，切頁、`B` 鍵靜態、`?still=1` 或系統降低動態時立即 `cancelAnimationFrame` 並清空畫布，背景零耗電。

---

## 4. 現場互動試算控件（Live Figures）
*模式取自 MIT `visual-explainer`*

簡報內可嵌入即時滑桿、開關或情境切換鈕（例如 ROI／門市販售模擬器）：

1. 外層容器加上 `.live-ctrl`（或 `data-interactive`）：底盤自動攔截點擊與焦點按鍵，**拖拉滑桿或按方向鍵微調數值絕不會誤觸翻頁**（按 `Esc` 可離開控件焦點）。
2. 純控制條外層可額外加 `.live-only`：列印 PDF（`@media print`）或 `?hide-ctrl=1` 時自動隱藏滑桿外殼，頁面直接呈現預設真實數據與圖表。
3. 頁內 `<script>` 接收 `slide` 區域變數，撰寫純函式 `render()` 在初始化與 `input` 事件更新數據與 SVG。

---

## 5. 雙重靜態保險與快捷鍵

| 機制 | 觸發方式 | 行為 |
|---|---|---|
| **靜態檢核模式** | 網址加上 `?still=1`（`check.mjs` 自動啟用） | 立刻跳過所有動畫與 Canvas FX，數字／圖表／SVG 精準定格於最終狀態 |
| **低耗電凍結開關** | 播放中按 `B` 鍵 | 切換 `body.low-power`，立即凍結動態與微塵效果（適合老筆電、視訊螢幕分享或定格講解） |
| **系統減少動態** | `prefers-reduced-motion: reduce` | 改用極簡純淡入淡出，停用彈簧、Canvas FX 與滾動計數 |
| **列印／輸出 PDF** | 按 `P` 鍵或 `check.mjs --pdf` | 全頁展開為精準 `1920×1080`、隱藏 `.live-only` 控件、保留完整靜態數據與圖表 |

---

## 6. 旗艦專案外掛事件契約（按需啟用）

若使用者明確同意為旗艦發表會導入外掛（如 GSAP 3.15、Motion MIT、Three.js），請監聽 `#stage` 的生命週期事件並尊重靜態旗標：

```js
const stage = window.__deck.stage;
stage.addEventListener('deck:slideenter', ({ detail }) => {
  // detail: { index, slide, prev, instant, staticMode }
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
