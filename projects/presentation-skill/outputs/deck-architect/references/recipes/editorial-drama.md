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
    .slide .txt strong { display: block; font: 800 30px/1.25 var(--font-body); }
  </style>
  <div class="anchor">
    <h2 data-role="title">三個里程碑</h2>
    <div style="font-size:22px;opacity:.75">2026 年度實測</div>
  </div>
  <div class="rows">
    <div class="row"><div class="num" data-count>8.4ms</div><div class="txt"><strong>推論延遲壓進毫秒級</strong></div></div>
    <div class="row" data-step="1"><div class="num" data-count>-62%</div><div class="txt"><strong>峰值記憶體大幅釋放</strong></div></div>
    <div class="row" data-step="2"><div class="num" data-count>99.4%</div><div class="txt"><strong>三條產線連續零超時</strong></div></div>
  </div>
</section>
```

> **導航**：這頁是滿版分割、自己處理邊距（`padding: 0`）。整份簡報用 `top-bar` 頂部導航時，替這頁加 `nav: none`（storyboard）或 `data-nav="none"`，像震撼頁一樣淨空導航，否則頂列會壓在深色錨點上。
>
> **原則 #26**：每列只放「巨數＋短標」兩層。原本的第三層說明（「從 27.6 ms 下降 70%，無須雲端回傳」「15W 無風扇裝置即可全速常駐」「品質閘門自動保底」）是講者會口頭補充的內容，寫進這頁的 `notes`；左欄只留題目與一行時間範圍，不放英文小標。

### 型態 B｜全黑暗房原話見證（Verbatim Theater，原則 #26 合法豁免）
```html
<section class="slide canvas" data-surface="dark">
  <style>
    .slide .theater { flex: 1; display: grid; grid-template-columns: 1.35fr 0.9fr; gap: 64px; align-items: center; }
    .slide .verbatim { position: relative; padding-left: 36px; border-left: 4px solid var(--accent); }
    .slide .verbatim blockquote { font: 600 38px/1.45 var(--font-quote); color: var(--fg); }
    .slide .verbatim cite { display: block; margin-top: 26px; font: 700 22px/1.3 var(--font-body); color: var(--fg-2); font-style: normal; }
    .slide .takeaways { padding: 40px 44px; background: var(--bg-2); border-top: 4px solid var(--accent); display: flex; flex-direction: column; gap: 28px; }
    .slide .tk-item strong { display: block; font: 800 26px/1.25 var(--font-body); color: var(--fg); }
    .slide .tk-item span { display: block; margin-top: 6px; font: 500 20px/1.4 var(--font-body); color: var(--fg-2); }
  </style>
  <header class="hd"><h2 class="title" data-role="title">客戶現場原話</h2></header>
  <div class="theater">
    <div class="verbatim">
      <blockquote>“這是我們第一次在一個月內讓三條產線同時零停機切換，連夜班師傅都不必重背介面。”</blockquote>
      <cite>— 某精密製造廠 營運副總（上線第 30 天實訪）</cite>
    </div>
    <div class="takeaways" data-step="1" data-step-from="right">
      <div class="tk-item"><strong>零訓練門檻</strong><span>保留原有操作心智，第一週即上手</span></div>
      <div class="tk-item"><strong>風險可預期</strong><span>異常自動降級保底，夜班零停機</span></div>
    </div>
  </div>
</section>
```
> **白棚實物／自然軌跡補充**：若為硬體或工藝拆解頁，請優先採用真實產品照或無字 AI 爆炸圖置於純淨亮棚（`data-surface="light"`），旁配裸排巨數與極細引線——**絕不用簡陋平面幾何 SVG 假裝實物剖面**。

## 風格動態融合升級（`motion-counsel` / `motion-apple`）
- 巨幅宣言主標題可掛 `[data-split-mask]`（文字遮罩斬切拉起）或暗底單次 `[data-spotlight-sweep]`（掃完即完全靜止，絕不永動搖晃）；核心關鍵數字可掛 `[data-odometer]` 機械滾輪精準煞停。
- 若為顧問型數據對照，保持「左三指標＋右巨型全高色塊柱＋虛線目標線＋斜線差距塊」靜態上限與底部基線齊平，詳見 `references/modules/style-motion-kits.md`。

