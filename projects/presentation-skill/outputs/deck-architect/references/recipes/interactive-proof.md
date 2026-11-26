# 黃金工藝配方 3：互動實證頁（前後拉桿 / 即時試算台 `interactive-proof`）

- **適用場合**：`pitch`、`keynote`（前後成效強烈反差、ROI 試算、參數推演）
- **觸發模組**：`compare-slider` 或 `live-controls`（二選一，嚴守單頁單主角）
- **核心原則**：讓聽眾**親眼拖曳或親手改參數看到數字跳動**，說服力遠勝靜態長條列；靜態與列印時停在最清楚的預設狀態。

### 型態 A｜Before / After 拉桿對比（`compare-slider`）
```html
<section class="slide canvas" data-surface="dark">
  <header class="hd"><h2 class="title" data-role="title">改版前後延遲對比</h2></header>
  <div style="flex:1;min-height:0">
    <div data-compare-slider data-initial="50" style="width:100%;height:600px">
      <div data-cs-before data-label="改版前 · P99 27.6 ms">
        <!-- 可放實拍圖 <img> 或雙色高反差 SVG 曲線 -->
      </div>
      <div data-cs-after data-label="改版後 · P99 8.4 ms">
        <!-- 與 before 相同座標系，拖曳中央線立即看出對比 -->
      </div>
    </div>
  </div>
</section>
```

### 型態 B｜左控制 → 箭頭 → 右即時試算結果（`live-controls`）
```html
<section class="slide canvas" data-surface="dark">
  <style>
    .slide .sim { flex: 1; display: grid; grid-template-columns: 1fr 72px 1fr; gap: 20px; align-items: stretch; }
    .slide .pane { padding: 34px; border-radius: 22px; border: 1px solid var(--line); background: var(--bg-2); display: flex; flex-direction: column; justify-content: space-between; gap: 22px; }
    .slide .big-num { font: 900 76px/1 var(--font-number); color: var(--accent-text); font-variant-numeric: tabular-nums; }
  </style>
  <header class="hd"><h2 class="title" data-role="title">年度節省試算台</h2></header>
  <div class="sim">
    <div class="pane live-ctrl" data-reset-scope>
      <div id="seg-plan" data-segmented>
        <button type="button" data-val="std" class="is-active">標準方案</button>
        <button type="button" data-val="pro">進階方案</button>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;font-size:22px;margin-bottom:10px"><span>導入門市數</span><strong id="v-n">12 店</strong></div>
        <input id="rng-n" type="range" min="4" max="30" value="12" data-nudge="x">
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <div data-presets>
          <button type="button" data-preset='{"#seg-plan":"std","#rng-n":12}'>現況 12 店</button>
          <button type="button" data-preset='{"#seg-plan":"pro","#rng-n":24}'>年底擴至 24 店</button>
        </div>
        <button type="button" data-reset>還原</button>
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:center;font-size:36px;color:var(--accent-text)">→</div>
    <div class="pane">
      <div><div style="font-size:20px;color:var(--fg-2)">預估年節省金額</div><div class="big-num" id="v-save">391 萬</div></div>
      <div style="font-size:20px;color:var(--fg-3)">依單店月省 2.7–3.4 萬估算（不含一次建置費）</div>
    </div>
  </div>
  <script>
    const seg = slide.querySelector('#seg-plan'), rng = slide.querySelector('#rng-n');
    const vn = slide.querySelector('#v-n'), vs = slide.querySelector('#v-save');
    const calc = () => {
      const n = +rng.value || 12, rate = seg.dataset.value === 'pro' ? 3.4 : 2.715;
      vn.textContent = n + ' 店';
      vs.textContent = Math.round(n * rate * 12) + ' 萬';
    };
    rng.addEventListener('input', calc); seg.addEventListener('change', calc); setTimeout(calc, 0);
  </script>
</section>
```

## v4.7 風格動態融合升級（`motion-counsel`）
- 嚴守「左輸入條件 → 箭頭 → 右試算結果」單向語意順序與雙欄底部基線齊平；使用者提早操作滑桿或切換鈕時，立即取消進場排程並解除壓暗。
- 前後方案反超對照可寄生 `[data-rank-race]`（FLIP 超車換位）搭配核心指標 `[data-odometer]` 機械滾輪煞停，詳見 `references/modules/style-motion-kits.md`。
