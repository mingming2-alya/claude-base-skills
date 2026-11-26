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
      <h2 data-role="title">異常定位活流程</h2>
      <p data-role="summary">無須手寫查詢，<mark class="em">三秒自動定位</mark>異常節點並給出切換建議。</p>
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

## v4.7 風格動態融合升級（`motion-apple` / `motion-story`）
- **先立靜態上限，禁降級成 Emoji 卡片**：產品頁以雙層微光裝置＋真描線曲線＋極細引線為骨，故事頁以真實無字插畫／黏土全景底圖融真文字為骨。
- 依選定風格按需寄生：`apple` 選 `[data-depth-deck]`（3D 景深疊卡）或 `[data-colorize-wipe]`（黑白柔焦→彩色光掃）；`illustration` 選 `[data-popup-fold]`（立體書 3D 翻折）或 `[data-chat-replay]`（對話小劇場），詳見 `references/modules/style-motion-kits.md`。
