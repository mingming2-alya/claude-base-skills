# 動態系統指南（Option 1｜分層混合架構）

`deck-architect` 採用**分層混合架構（Option 1）**：

- **日常簡報核心（~10 KB 零外部依賴）**：內建於輕底盤 `assets/runtime.js`＋`assets/shell.css`，純原生瀏覽器 API（WAAPI + 解析彈簧 + FLIP + SVG + Canvas 2D），**雙擊 `deck.html` 即可 100% 離線流暢播放**，無需任何 CDN 或套件安裝。
- **旗艦專案外掛介面（按需、事前徵詢）**：僅當旗艦發表會明確需要異形 `MorphSVG`、60fps 影片輸出時間軸、複雜手勢物理或 WebGL／Three.js 3D 場景時，**先徵得使用者同意**後才掛載外部函式庫（見文末外掛事件契約）。

---

## 1. 六條動態設計與 60fps 效能鐵律

1. **永遠可打斷（Zero Lockout）**：連按方向鍵或快速滑動時立刻取消前一段動畫並直達目標，絕不鎖死。
2. **純 GPU 合成器優先（鎖定 60fps、拒絕卡頓）**：
   - 切頁與進場只動畫 `transform`、`opacity`、`clip-path`（2 個關鍵影格即可，不用 28 格 JS 取樣）；`.slide` 啟用 `contain: layout style paint`。
   - **禁止跨頁巨幅重濾鏡**：不在大尺寸投影片放 `stdDeviation="48"` 的全頁 SVG `<feGaussianBlur>`、live `<feTurbulence>` 或動畫中疊 `backdrop-filter`——改用零耗能 CSS `radial-gradient` 光暈與高質感半透明底色。
   - **禁止把 `steps(5)` 用在整頁移動**：整頁跳格會讓手機觀眾誤判為掉幀卡頓；改用俐落平滑曲線配精準節奏。
   - Canvas 2D 背景層採 `480×270` 低解析度拉伸並**延遲至切頁完成後 520ms 才啟動**，絕不與切頁搶 GPU。
3. **同一頁必須「引導視線」，不可一鍋端同時淡入**：
   - 每頁依 **3–4 個語意節拍（`data-beat="1|2|3|4"`）** 依序帶走觀眾視線：先立主角 → 再用**方向性指針／掃描／高亮**把視線牽引到核心洞見（例如平板發射引導線點亮左右標註、甘特紅條衝過期限線再引導視線往下看拍板卡、三站由左→中→右依時序落針）→ 最後才是次要佐證。
4. **頁與頁之間要有敘事變化與連貫性，不千篇一律淡入淡出**：
   - 依兩頁之間的「關係」選用對應的 `data-transition` 語法（下表 6 種），前後頁有共同關鍵數字群時優先做**多元素編隊 Magic Move**（例如震撼頁 3 個財務數字齊飛入互動試算頁）。
5. **進慢出快、絕不露黑底**：切頁時舊頁維持 `opacity: 1` 墊底，消除閃爍感。
6. **所有動態必須有完美靜態定格**：`?still=1`、`B` 鍵省電凍結、`prefers-reduced-motion: reduce` 與 `@media print` 下精準停在最終狀態。

---

## 2. 六種敘事切頁語法（`data-transition`）

在 `<section class="slide canvas" data-transition="...">` 指定切入該頁的運鏡（往回翻時底盤會自動鏡像倒放）：

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

撰寫自由畫布頁前，先依 **`references/visual-guidance.md`** 選定四大靜態視覺動線原型之一，再以以下宣告式屬性導演視線（**嚴守一拍一主角、禁止左右跨螢幕乒乓、保持原有翻頁互動契約不變**）：

- **聚光＋非焦點壓暗排程（`data-focus-plan="1@0-1000, 2@1000-1800"` ＋ `data-focus="1|2|3"`）**：
  - 在多卡片／分區頁面（如 Bento、數據故事、三站插畫），當拍主角高反差亮出（`.focus-active`，粗亮框＋22px 外光暈＋微抬升，390px 手機亦清晰），已演完的因果脈絡維持 `.focus-visited`（`0.82`），未出場配角退為 `.focus-dim`（`0.32`）；整段演完或被打斷瞬間自動歸零回復 100% 平衡。
- **因果現場演變（`data-transform-at="780"`）**：
  - HTML 原始 DOM 預設為最終正確態；動態進頁時底盤先掛上 `.pre-transform` 展現舊態（如 24 盤全紅報廢），於指定毫秒移除並短暫掛 `.transforming` 演繹轉變為新態（9 綠＋15 省下虛線），`?still=1` 與打斷時瞬間停在最終態。
- **語意節拍（`data-beat="1|2|3|4"` + `data-from="left|right|up|down|none"`）**：
  - `data-beat="1"`（60ms）：首要焦點錨定；`2`（420ms）：變化／引導線；`3`（840ms）：被指向的結論／拍板區；`4`（1260ms）：次要背景支撐（可搭配 `data-delay` 精細微調，總長建議 1.5–2.3 秒）。
- **真描線與方向揭露（零變形、禁對 0 寬高 SVG `<line>` 用 `scaleX/Y`）**：
  - **實線引導線／因果箭頭**：用 SVG `<path d="M 起點 L 終點" data-draw>`（`pathLength="1"`），順視線方向繪出；圓環進度用 `data-draw="ring"`。
  - **虛線引導針／時間軌／斜刪線**：用 HTML 元素加 `data-wipe="down|right|left|up"`（純 GPU `clip-path: inset(...)` 揭露，虛線節距零拉扯）。
  - **長條／柱狀圖生長**：`data-grow="x|x-left|y|y-down"`。
- **端點綻放、目標波紋與軌道行進光珠**：
  - `data-pop`：引導線起點錨點、終點圓點或箭頭尖端於線條抵達瞬間綻放（**絕不讓孤點提前漂浮**）。
  - `data-ripple`：純 HTML 雙圈目標擴散波紋（`--ripple-color`），釘住 3D 插畫物件或折線端點（靜態／列印自動隱藏）。
  - `data-travel="x|y"`（配 `data-travel-dist`）：沿水平／垂直軌道滑行的行進光珠，帶動眼睛橫掃時間軸。
  - `data-nudge="x"`：互動控制項進場後單次微動暗示可拖曳。
- **高反差單次聚光框（`data-spotlight`）**：升級雙層亮邊＋外光暈（`--spot-border`、`--spot-glow`），縮放至 390px 手機依然一眼辨識。
- **多元素跨頁 Magic Move（`data-morph="id"`，MIT `open-slide`）**：前後頁 1–4 個核心錨點同步編隊飛移、等比縮放並平順轉換字色。
- **節流滾動數字（`data-count`，MIT `scrolline`）**：30Hz 節流更新，保留正負號、小數與 `<small>` 單位。
- **低耗能延遲 Canvas 2D 氛圍層（`data-fx="ambient-dust"|"soft-aurora"`，MIT `lewislulu`）**：`480×270` 緩衝區拉伸、切頁後延遲 520ms 啟動、離頁即停零殘留。

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
