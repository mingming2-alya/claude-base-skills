# 黃金工藝配方 4：產品活展示頁（裝置框＋活流程輪播 `product-story`）

- **適用場合**：`pitch`、`keynote`（SaaS 介面、AI Agent 演示、工作流程自動化、硬體實測）
- **觸發模組**：`components(device-frame)` ＋ `flow-carousel`（支援 `vertical` / `horizontal` / `stepper` / `chat` 四種形態）
- **核心原則**：不靠 50 MB 糊掉的錄影，改用輕量原生 HTML 裝置框＋可點擊互動的活流程／對話流，字體永遠銳利、可現場停下來點擊解說。

```html
<section class="slide canvas" data-surface="dark">
  <style>
    .slide .split { flex: 1; display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 48px; align-items: center; }
    .slide .copy h2 { font: 900 54px/1.15 var(--font-display); color: var(--fg); }
    .slide .copy p  { margin-top: 20px; font: 500 23px/1.5 var(--font-body); color: var(--fg-2); }
    .slide .device-browser .db-body { padding: 22px; }
    .slide .chat-host { border: none; background: transparent; padding: 0; }
  </style>
  <div class="split">
    <div class="copy">
      <div class="eyebrow">LIVE WORKFLOW DEMO</div>
      <h2 data-role="title">三秒自動定位異常節點</h2>
      <p>不需要手寫查詢語句，邊緣代理直接回傳延遲指標與安全切換建議。</p>
    </div>
    <div class="device-browser">
      <div class="db-bar"><i></i><i></i><i></i><span>console.kestrel.local</span></div>
      <div class="db-body">
        <div class="chat-host" data-flow-carousel="chat" data-interval="1200">
          <div class="fc-chat-list">
            <div data-fc-msg data-role="user">檢查產線 #03 過去 1 小時推論延遲</div>
            <div data-fc-msg data-role="tool">metrics.query("line-03") → P99 8.4 ms · 記憶體 0.70 GB · 0 超時</div>
            <div data-fc-msg data-role="assistant">全數 4 路串流均在 15W 預算內穩定運行，已可執行正式切換。</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

> **變體切換**：若要展示 3–4 步軟體操作畫面，將右側改為 `data-flow-carousel="vertical"`（左頁籤＋右畫面卡）；若要搭配流程圖節點同步發光，改用 `data-flow-carousel="stepper"` 並在卡片標 `data-step-target="nodeId"`。
