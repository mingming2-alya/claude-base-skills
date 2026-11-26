# 黃金工藝配方 2：文圖雙向聯動架構頁（`linked-diagram`）

- **適用場合**：`briefing`、`pitch`、`keynote`（任何系統架構、流程拆解、組織分工頁）
- **觸發模組**：`linked-highlight`（`[data-ref]`）＋ `visual-flair`（`[data-zoomable]` 點擊燈箱放大）
- **核心原則**：拒絕「三張白框配三個平面矩形」的廉價圖解！左 34% 採**極淨細線論點列**（零厚重框中框，嚴守 ≤2 層文字），右 66% 採**分層資料流架構圖＋底部延遲佔比標尺**；兩側共掛 `data-ref="id"` 雙向發光並壓暗配角，點擊架構圖直接滿版燈箱放大。

```html
<section class="slide canvas" data-surface="light">
  <style>
    .slide .grid { flex: 1; display: grid; grid-template-columns: 490px minmax(0, 1fr); gap: 52px; align-items: stretch; }
    .slide .list { display: flex; flex-direction: column; justify-content: space-between; }
    .slide .ref-row { padding: 24px 0 24px 22px; border-left: 4px solid var(--line); border-bottom: 1px solid var(--line-2); transition: border-color .25s ease; }
    .slide .ref-row:last-child { border-bottom: none; }
    .slide .ref-row.is-ref-hit { border-left-color: var(--accent); }
    .slide .ref-row strong { display: block; font: 800 26px/1.2 var(--font-body); color: var(--fg); }
    .slide .ref-row span { display: block; margin-top: 8px; font: 600 20px/1.4 var(--font-body); color: var(--fg-2); }
    .slide .diag { padding: 30px 34px; border-radius: 22px; border: 1px solid var(--line); background: var(--bg-2); display: flex; flex-direction: column; justify-content: space-between; gap: 20px; }
    .slide .diag svg { width: 100%; height: auto; }
    .slide .budget { display: grid; grid-template-columns: 14.3fr 69fr 16.7fr; gap: 8px; }
    .slide .budget b { display: block; padding: 10px 14px; border-radius: 10px; font: 800 18px/1 var(--font-number); color: var(--fg); background: var(--bg); border: 1px solid var(--line); }
    .slide .budget b.core { background: var(--accent); color: var(--accent-ink); border-color: transparent; }
  </style>
  <header class="hd">
    <h2 class="title" data-role="title">三段式邊緣架構</h2>
    <p class="sub" data-role="summary">總延遲壓進 <mark class="em">8.4 ms</mark>，移上或點擊任一節點同步檢視。</p>
  </header>
  <div class="grid">
    <div class="list">
      <div class="ref-row" data-ref="ingest"><strong>01｜DMA 零拷貝擷取</strong><span>省去 4.1 ms 記憶體搬移</span></div>
      <div class="ref-row" data-ref="router"><strong>02｜動態算力路由</strong><span>FP16／INT8 自適應切換</span></div>
      <div class="ref-row" data-ref="guard"><strong>03｜確定性品質閘門</strong><span>異常即走安全降級不卡機</span></div>
    </div>
    <div class="diag" data-zoomable data-zoom-caption="完整三段式邊緣架構（按 Esc 退出放大）">
      <svg viewBox="0 0 960 360" role="img" aria-label="三段式架構圖">
        <path d="M292 180 L356 180" stroke="var(--accent)" stroke-width="4" fill="none" data-draw/>
        <path d="M604 180 L668 180" stroke="var(--accent)" stroke-width="4" fill="none" data-draw data-delay="260"/>
        <circle cx="356" cy="180" r="6" fill="var(--accent)" data-pop data-delay="520"/>
        <circle cx="668" cy="180" r="6" fill="var(--accent)" data-pop data-delay="780"/>
        <g data-ref="ingest"><rect x="32" y="92" width="260" height="176" rx="16" fill="var(--bg)" stroke="var(--line)" stroke-width="2.5"/><text x="162" y="168" text-anchor="middle" font-size="25" font-weight="800" fill="var(--fg)">DMA 零拷貝</text><text x="162" y="214" text-anchor="middle" font-size="20" fill="var(--fg-2)">1.2 ms · Ring Buffer</text></g>
        <g data-ref="router"><rect x="356" y="64" width="248" height="232" rx="18" fill="var(--bg)" stroke="var(--accent)" stroke-width="3.5"/><text x="480" y="158" text-anchor="middle" font-size="26" font-weight="900" fill="var(--fg)">動態算力路由</text><text x="480" y="206" text-anchor="middle" font-size="22" font-weight="800" fill="var(--accent-text)">5.8 ms 核心推論</text></g>
        <g data-ref="guard"><rect x="668" y="92" width="260" height="176" rx="16" fill="var(--bg)" stroke="var(--line)" stroke-width="2.5"/><text x="798" y="168" text-anchor="middle" font-size="25" font-weight="800" fill="var(--fg)">品質校驗閘門</text><text x="798" y="214" text-anchor="middle" font-size="20" fill="var(--fg-2)">1.4 ms · SLA 保底</text></g>
      </svg>
      <div class="budget" aria-label="延遲佔比預算">
        <b data-ref="ingest">1.2 ms</b>
        <b class="core" data-ref="router">5.8 ms 核心推論（69%）</b>
        <b data-ref="guard">1.4 ms</b>
      </div>
    </div>
  </div>
</section>
```

> **工藝檢查點**：主次節點視覺比重明顯拉開（核心路由拉高加粗焦點邊框＋底部比例佔比條），左右底邊齊平；SVG 內文字 ≥ 20px、對比 ≥ 4.5:1；每條左側說明嚴守 2 層文字，詳細演算法進 `notes`。

## 風格動態融合升級（`motion-counsel`）
- 多卡片論證或系統分層架構除 `[data-ref]` 文圖雙向聯動外，可對主論點卡組掛載 `[data-rack-focus]`（點擊聚焦該節點、其餘柔和景深退焦），全程維持畫完即靜止（零永動干擾），詳見 `references/modules/style-motion-kits.md`。

