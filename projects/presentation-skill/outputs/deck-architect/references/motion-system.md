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

## 3. 頁內視線引導語法（Eye-Guidance Choreography）

透過宣告式屬性編排觀眾視線路徑，**避免全頁同時淡入**：

- **語意節拍（`data-beat="1|2|3|4"` + `data-from="left|right|up|down|none"`）**：
  - `data-beat="1"`（60ms）：主視覺／首要焦點先錨定。
  - `data-beat="2"`（320ms）：方向性引導線／關鍵變化動作（帶走視線）。
  - `data-beat="3"`（580ms）：被指向的結論卡／拍板行動區亮起。
  - `data-beat="4"`（820ms）：次要背景支撐資料安靜就位。
- **方向性延伸指針與長條（`data-grow="x|x-left|y|y-down"`）**：
  - `x`（由左向右長）、`x-left`（由右向左長，適合從中央裝置向右側與左側同時發射引導細線！）、`y`（由底向上長）、`y-down`（由頂向下垂降引導針！）。
- **單次聚焦光環（`data-spotlight`）**：在多卡片工作看板（如現代 Bento）中，替「唯一需要主管處理的風險卡或拍板卡」加上 `data-spotlight`（搭配 `--spot-color`），進入該拍時柔和呼吸一次把全場目光鎖過去，絕不無限閃爍干擾閱讀。
- **多元素跨頁 Magic Move（`data-morph="id"`，MIT `open-slide`）**：
  - 前後兩頁對齊 1–4 個核心錨點（如 `hero-save`、`hero-payback`、`hero-margin`），切頁時會同步編隊起飛、等比縮放並平順轉換字色（亦支援漸層字銜接純色字）。
- **節流滾動數字（`data-count`，MIT `scrolline`）**：30Hz 節流更新、預設延至切頁啟動後才滾動，避免與轉場搶排版資源；自動保留正負號、小數與 `<small>` 單位。
- **SVG 路徑與圓環描繪（`data-draw` / `data-draw="ring"`，MIT `visual-explainer`）**：曲線由左向右描出將視線引至終點節點；圓環由 0 順時針掃至目標進度。
- **低耗能延遲 Canvas 2D 氛圍層（`data-fx="ambient-dust"|"soft-aurora"`，MIT `lewislulu`）**：`480×270` 緩衝區拉伸、切頁後延遲啟動、離頁即停零殘留。

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
