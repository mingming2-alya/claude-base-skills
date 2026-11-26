# 黃金工藝配方 5：去框編輯與懸念揭曉（`editorial-drama`）

- **適用場合**：`pitch`（關鍵轉折頁）、`keynote`（主力！破除整場圓角卡片化）
- **核心原則**：**零圓角卡片框**，靠「35/65 深色錨點分割」、「白棚裸巨數＋細線」或「全黑暗房原話見證＋講者點擊步進 `data-step`」撐出電影級舞台呼吸感。

### 型態 A｜35/65 深色錨點分割＋極淨細線清單（`data-surface="split"`）
```html
<section class="slide canvas" data-surface="split">
  <style>
    .slide { padding: 0 !important; display: grid !important; grid-template-columns: 35% 65%; }
    .slide .anchor { background: var(--dark-bg, #141821); color: var(--dark-fg, #F4F2EC); padding: 92px 64px; display: flex; flex-direction: column; justify-content: space-between; }
    .slide .anchor h2 { font: 900 58px/1.15 var(--font-display); }
    .slide .rows { background: var(--light-bg, #F6F5F0); color: var(--light-fg, #171A20); padding: 92px 84px; display: flex; flex-direction: column; justify-content: center; }
    .slide .row { display: grid; grid-template-columns: 180px 1fr; gap: 32px; align-items: baseline; padding: 34px 0; border-bottom: 1px solid rgba(23,26,32,0.14); }
    .slide .row:last-child { border-bottom: none; }
    .slide .num { font: 900 56px/1 var(--font-number); color: var(--light-accent, #0F766E); }
    .slide .txt strong { display: block; font: 800 28px/1.25 var(--font-body); }
    .slide .txt span { display: block; margin-top: 6px; font: 500 21px/1.45 var(--font-body); color: #475569; }
  </style>
  <div class="anchor">
    <div style="font:700 18px/1 var(--font-label);opacity:.7">KEY TAKEAWAYS</div>
    <h2 data-role="title">三個里程碑</h2>
    <div style="font-size:20px;opacity:.75">2026 年度實測收斂</div>
  </div>
  <div class="rows">
    <div class="row"><div class="num" data-count>8.4ms</div><div class="txt"><strong>推論延遲壓進毫秒級</strong><span>從 27.6 ms 下降 70%，無須雲端回傳。</span></div></div>
    <div class="row" data-step="1"><div class="num" data-count>-62%</div><div class="txt"><strong>峰值記憶體大幅釋放</strong><span>15W 無風扇邊緣裝置即可全速常駐。</span></div></div>
    <div class="row" data-step="2"><div class="num" data-count>99.4%</div><div class="txt"><strong>三條產線連續零超時</strong><span>品質閘門自動保底，確保產線不停機。</span></div></div>
  </div>
</section>
```

### 型態 B｜全黑暗房原話見證（Verbatim Theater）
- 左 60% 暗底放完整客戶／使用者逐字原話（`font-size: 36–42px`，不縮寫、零卡片框），右 40% 高反差亮色條列提煉 2–3 條啟發（可用 `data-step="1"` 在講者讀完原話後再亮出右側啟發）。

## v4.7 風格動態融合升級（`motion-counsel` / `motion-apple`）
- 巨幅宣言主標題可掛 `[data-split-mask]`（文字遮罩斬切拉起）或暗底單次 `[data-spotlight-sweep]`（掃完即完全靜止，絕不永動搖晃）；核心關鍵數字可掛 `[data-odometer]` 機械滾輪精準煞停。
- 若為顧問型數據對照，保持「左三指標＋右巨型全高色塊柱＋虛線目標線＋斜線差距塊」靜態上限與底部基線齊平，詳見 `references/modules/style-motion-kits.md`。
