# 黃金工藝配方 2：文圖雙向聯動架構頁（`linked-diagram`）

- **適用場合**：`briefing`、`pitch`、`keynote`（任何系統架構、流程拆解、組織分工頁）
- **觸發模組**：`linked-highlight`（`[data-ref]`）＋ `visual-flair`（`[data-zoomable]` 點擊燈箱放大）
- **核心原則**：左 34% 精簡說明卡 ↔ 右 66% 乾淨向量架構圖；兩側共掛同一組 `data-ref="id"`，講者移上或點擊任一端即可雙向發光並壓暗配角；點擊架構圖直接滿版放大。

```html
<section class="slide canvas" data-surface="light">
  <style>
    .slide .grid { flex: 1; display: grid; grid-template-columns: 500px minmax(0, 1fr); gap: 40px; align-items: center; }
    .slide .list { display: flex; flex-direction: column; gap: 18px; }
    .slide .ref-card { padding: 22px 26px; border-radius: 18px; border: 1px solid var(--line); background: var(--bg-2); }
    .slide .ref-card strong { display: block; font: 800 24px/1.25 var(--font-body); color: var(--fg); }
    .slide .ref-card p { margin-top: 6px; font: 500 20px/1.45 var(--font-body); color: var(--fg-2); }
    .slide .diag { padding: 28px; border-radius: 22px; border: 1px solid var(--line); background: var(--bg-2); height: 100%; display: flex; align-items: center; }
    .slide .diag svg { width: 100%; height: auto; }
  </style>
  <header class="hd">
    <h2 class="title" data-role="title">三段式邊緣架構</h2>
  </header>
  <div class="grid">
    <div class="list">
      <div class="ref-card" data-ref="ingest"><strong>01 零拷貝擷取</strong><p>DMA 直寫環形緩衝，省 4.1 ms 複製耗時。</p></div>
      <div class="ref-card" data-ref="router"><strong>02 動態算力路由</strong><p>依複雜度切換精度分支，穩守 8.4 ms。</p></div>
      <div class="ref-card" data-ref="guard"><strong>03 確定性品質閘門</strong><p>異常輸入即走安全保底，不阻塞主迴圈。</p></div>
    </div>
    <div class="diag" data-zoomable data-zoom-caption="完整三段式邊緣架構（按 Esc 退出放大）">
      <svg viewBox="0 0 960 400" role="img" aria-label="三段式架構圖">
        <path d="M295 200 L355 200" stroke="var(--accent)" stroke-width="4" fill="none" data-draw/>
        <path d="M605 200 L665 200" stroke="var(--accent)" stroke-width="4" fill="none" data-draw data-delay="260"/>
        <g data-ref="ingest"><rect x="35" y="100" width="260" height="200" rx="20" fill="var(--bg)" stroke="var(--accent)" stroke-width="3"/><text x="165" y="195" text-anchor="middle" font-size="26" font-weight="800" fill="var(--fg)">DMA 零拷貝</text><text x="165" y="240" text-anchor="middle" font-size="20" fill="var(--fg-2)">1.2 ms</text></g>
        <g data-ref="router"><rect x="355" y="85" width="250" height="230" rx="20" fill="var(--bg)" stroke="var(--accent)" stroke-width="3"/><text x="480" y="195" text-anchor="middle" font-size="26" font-weight="800" fill="var(--fg)">動態算力路由</text><text x="480" y="240" text-anchor="middle" font-size="20" fill="var(--fg-2)">5.8 ms</text></g>
        <g data-ref="guard"><rect x="665" y="100" width="260" height="200" rx="20" fill="var(--bg)" stroke="var(--accent)" stroke-width="3"/><text x="795" y="195" text-anchor="middle" font-size="26" font-weight="800" fill="var(--fg)">品質校驗閘門</text><text x="795" y="240" text-anchor="middle" font-size="20" fill="var(--fg-2)">1.4 ms</text></g>
      </svg>
    </div>
  </div>
</section>
```

> **工藝檢查點**：SVG 內文字字級 ≥ 20px、底色與文字對比 ≥ 4.5:1；每張說明卡只寫一句關鍵因果，把長背景移進 `notes`。
