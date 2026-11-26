# 模組手冊（二）：互動解說、對比與程式碼舞台（Interactive Explainers）

> 僅在簡報需要即時試算控件、文圖雙向聯動、前後拉桿對比、程式碼步進聚焦或區塊縮放適配時載入本手冊。

## 1. 即時互動控件組（`live-controls`）

除了 `.live-ctrl input[type="range"]` 滑桿外，v4.5 內建四種宣告式控件（全自動防誤翻頁、適配 `data-surface` 明暗極性）：

1. **分段膠囊 `[data-segmented]`**：點選切換 `data-value`，派發 `change` 與 `lc:change`（`detail.value`）。
2. **開關 `[data-toggle]`**：點選切換 `.is-on` 與 `data-checked="1|0"`，派發 `change` 與 `lc:change`（`detail.checked`）。
3. **情境預設列 `[data-presets]`**：按鈕寫 `data-preset='{"#slider-a": 80, "#seg-mode": "pro"}'`，一鍵套用多組數值並自動觸發對應 `input`/`change` 事件。
4. **一鍵還原 `[data-reset]`**：還原該頁（或最近 `[data-reset-scope]`）內所有輸入、分段膠囊與開關至初始值。

```html
<div class="live-ctrl" style="display:flex;gap:14px;align-items:center">
  <div id="seg-tier" data-segmented>
    <button type="button" data-val="std" class="is-active">標準方案</button>
    <button type="button" data-val="pro">企業方案</button>
  </div>
  <button id="tog-cache" type="button" data-toggle class="is-on">邊緣快取</button>
  <div data-presets>
    <button type="button" data-preset='{"#seg-tier":"pro","#tog-cache":true,"#qps":500}'>高流量情境</button>
  </div>
  <button type="button" data-reset>重設</button>
</div>
```

## 2. 文圖雙向聯動高亮（`linked-highlight`）

在右側架構圖節點（HTML 或 SVG `<g>`）與左側說明條目寫上相同的 `data-ref="id"`（支援多組如 `data-ref="auth cache"`）：
- **Hover**：滑鼠移上任一端，同 ID 的文與圖同步高亮（`.is-ref-hit`），其餘 `[data-ref]` 柔暗至 30%（`.is-ref-dim`）。
- **Click**：鎖定聚焦（講者可放開滑鼠解說），再點一次或翻頁自動解除。

```html
<div class="explain-list">
  <div class="card" data-ref="gateway"><strong>API Gateway</strong> 統一限流與權杖驗證</div>
  <div class="card" data-ref="worker"><strong>Async Worker</strong> 非同步批次寫入倉儲</div>
</div>
<svg viewBox="0 0 600 320">
  <g data-ref="gateway"><rect x="20" y="60" width="220" height="120" rx="16"/></g>
  <g data-ref="worker"><rect x="340" y="60" width="220" height="120" rx="16"/></g>
</svg>
```

## 3. 前後拉桿對比（`compare-slider`）

適用新舊設計稿、演算法降噪前後、效能重構前後：
- 外層 `[data-compare-slider data-initial="50"]`（須設定明確寬高，如 `height: 540px`）。
- 內含 `[data-cs-before data-label="改版前"]` 與 `[data-cs-after data-label="改版後"]`（可放圖片、SVG 或 HTML 畫面）。
- 支援滑鼠／觸控拖曳與鍵盤 `←`/`→` 微調；在 `?still=1`、低耗電與列印時自動鎖定在 `data-initial`（預設 50%）。

```html
<div data-compare-slider data-initial="50" style="width:100%;height:520px">
  <div data-cs-before data-label="改版前 · 4.2s">
    <img src="assets/before.jpg" alt="改版前">
  </div>
  <div data-cs-after data-label="改版後 · 0.6s">
    <img src="assets/after.jpg" alt="改版後">
  </div>
</div>
```

## 4. 程式碼聚焦舞台（`code-stage`）

零外部依賴語法上色＋步進行聚光：
- 外層 `[data-code-stage data-title="router.ts" data-lang="ts"]`
- **靜態聚焦**：`data-highlight-lines="3-6,9"`
- **連動講者點擊步進**：`data-step-lines="0:1-3; 1:4-7; 2:8-11"`（搭配同頁 `[data-step="1"]` 等說解文字，每按一次空白鍵自動把聚光燈移到對應程式碼區段）
- **終端打字機**：任一元素加 `[data-typewriter data-tw-speed="28"]` 即可在進頁時打出指令（`?still=1`／列印自動完整呈現）。

```html
<div data-code-stage data-title="pipeline.py" data-step-lines="0:1-2; 1:3-5">
  <pre><code>def route_request(ctx):
    if ctx.cached: return ctx.cache_hit()
    plan = planner.select(ctx.intent)
    result = executor.run(plan, timeout=1.5)
    return verifier.check(result)</code></pre>
</div>
```

## 5. 自適應縮字與 1:1 匯出（`fit`）

- `data-fit="phrase"`：大標題／震撼金句自動縮字以貼合行數上限。
- `data-fit="figure"`：超大統計數字防橫向溢位。
- `data-fit="box"`（v4.5 新增）：當文字區塊的 `scrollHeight > clientHeight` 或 `scrollWidth > clientWidth` 時，自動微調 `font-size`（守住 ≥ 18px 下限），避免長文破框。
- **`?noscale=1`**：以原生 `1920×1080`（`transform: none`）渲染舞台，供無損截圖、錄影或外部轉檔腳本使用。
