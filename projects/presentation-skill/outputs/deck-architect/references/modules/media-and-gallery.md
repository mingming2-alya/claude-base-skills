# 模組手冊（一）：影音、流程輪播、畫廊與裝置框（Media & Gallery）

> 僅在簡報需要影片、音訊、活流程輪播、3D 照片牆、客戶 Logo 跑馬燈或裝置邊框時載入本手冊。所有模組皆由 `assemble.py` 偵測 HTML 屬性自動按需注入。

## 1. 外連影音與同步 A/B 音訊（`media`）

### 1.1 `<video data-slide-video>`（含片段循環、倍速、全螢幕）
- **屬性**：
  - `poster="assets/demo-poster.jpg"`（強烈建議！`assemble.py` 會自動內嵌海報，確保 `?still=1` 與列印不黑框）
  - `data-autoplay`（進頁自動靜音播放）、`data-loop`（循環）、`data-muted`（預設靜音）
  - `data-start="12"`、`data-end="24"`（只精準循環 12s–24s 片段，進頁自動跳到 `data-start`）
  - `data-rate="1.25"`（預設播放倍速；控制列內建 `1x / 1.25x / 1.5x / 2x / 0.75x` 切換與 `⛶` 全螢幕）
  - `data-controls="none"`（背景情境影片隱藏控制條）

```html
<div class="device-browser">
  <div class="db-bar"><i></i><i></i><i></i><span>demo.example.com</span></div>
  <div class="db-body">
    <video data-slide-video data-autoplay data-loop data-start="4" data-end="14" data-rate="1.25"
           poster="assets/demo-poster.jpg" src="media/product-demo.mp4"></video>
  </div>
</div>
```

### 1.2 單軌音檔與 `[data-sound-ab]` 同步 A/B 音軌切換
- **單軌**：`<audio data-sound-demo data-label="原音實測" data-duration="12" src="media/raw.wav"></audio>`（模組會自動在後方生成波形播放膠囊）。
- **同步 A/B 對比**（降噪前後、音質調校、語音合成對比）：同一個時間軸一鍵切換兩軌，保留播放進度。

```html
<div data-sound-ab data-label="抗風噪實測對比（60 km/h）" data-duration="15">
  <audio data-sound-demo data-label="A 原始收音" src="media/wind-raw.wav"></audio>
  <audio data-sound-demo data-label="B 降噪演算法" src="media/wind-clean.wav"></audio>
</div>
```

## 2. 活產品流程輪播（`flow-carousel` · 4 模式）

透過 `data-flow-carousel="vertical|horizontal|stepper|chat"` 切換四種語意模式（空值預設 `vertical`），支援 `data-interval="3400"`、`data-autoplay="true|false"`、`data-still-index="0"`：

1. **`vertical`（預設）**：左側頁籤 `[data-fc-idx]` + 右側垂直卡片堆疊 `.fc-viewport > .fc-card[data-fc-card]`。
2. **`horizontal`**：上方橫向膠囊頁籤 + 水平滑動卡片。
3. **`stepper`（架構／事件步驟回放）**：自動掛載底部時間軸 `.fc-scrubber`（可用 `data-scrubber="false"` 關閉）。每張卡片若寫 `data-step-target="nodeA,nodeB"`，切到該步會自動讓同頁對應 `[data-node="nodeA"]` 高亮（`.is-step-active`）、其餘 `[data-node]` 壓暗（`.is-step-dim`）。
4. **`chat`（AI / Agent 對話流）**：依序浮現 `[data-fc-msg]` 氣泡（`data-role="user|assistant|tool"`）；在 `?still=1`、低耗電與列印時一次顯示完整對話。

```html
<!-- Stepper 模式搭配架構圖節點聯動 -->
<div class="arch-diagram">
  <div data-node="ingest">1. 訊號擷取</div>
  <div data-node="route">2. 語意路由</div>
  <div data-node="verify">3. 品質閘門</div>
</div>
<div class="flow-carousel" data-flow-carousel="stepper" data-interval="2800">
  <div class="fc-viewport">
    <div class="fc-card" data-fc-card data-step-target="ingest"><strong>Step 1</strong> 串流事件落地</div>
    <div class="fc-card" data-fc-card data-step-target="route"><strong>Step 2</strong> 動態分流至低延遲節點</div>
    <div class="fc-card" data-fc-card data-step-target="verify"><strong>Step 3</strong> 自動比對輸出契約</div>
  </div>
</div>
```

## 3. 3D 照片輪播、無縫跑馬燈與燈箱（`coverflow`）

### 3.1 `[data-coverflow]`（可加 `data-cf-lightbox` 讓點擊正中卡片彈出大圖預覽）
```html
<div class="coverflow" data-coverflow data-cf-lightbox data-initial="1" data-interval="3600">
  <div class="cf-stage">
    <figure class="cf-item"><img src="assets/s1.jpg" alt=""><figcaption>現場實測<small>高對比戶外光</small></figcaption></figure>
    <figure class="cf-item"><img src="assets/s2.jpg" alt=""><figcaption>結構剖面<small>CNC 鋁合金底座</small></figcaption></figure>
    <figure class="cf-item"><img src="assets/s3.jpg" alt=""><figcaption>量產組裝<small>良品率 99.4%</small></figcaption></figure>
  </div>
  <div class="cf-controls">
    <button class="cf-prev" type="button">‹</button>
    <div class="cf-dots"></div>
    <button class="cf-next" type="button">›</button>
  </div>
</div>
```

### 3.2 `[data-marquee]`（無縫客戶／夥伴 Logo 牆）
- 自動複製 `.mq-track` 子節點達成無縫無限捲動；游標移上暫停；支援 `data-speed="24"`（秒）與 `data-dir="reverse"`。
- 在 `?still=1`、低耗電與列印時自動隱藏複本並折成乾淨靜態網格。

```html
<div data-marquee data-speed="22">
  <div class="mq-track">
    <span class="mq-item">Nordic Grid</span>
    <span class="mq-item">Aether Robotics</span>
    <span class="mq-item">Kuroda Optics</span>
    <span class="mq-item">Solstice Bio</span>
  </div>
</div>
```

## 4. 裝置外框（`components/device-frame.css`）

不載入整包商務元件 CSS，只要 HTML 出現 `.device-browser`、`.device-phone` 或 `.device-tablet` 就會單獨注入（僅 1.6 KB）：
- `.device-browser`：頂部 `.db-bar`（三顆圓點 `<i></i><i></i><i></i>` + `<span>網址</span>`）+ `.db-body`
- `.device-phone`：圓角行動裝置框 + `.dp-notch` + `.dp-screen`
- `.device-tablet`：橫向平板框 + `.dt-screen`
