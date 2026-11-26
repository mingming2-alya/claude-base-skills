# 風格綁定動態原語手冊（Style Motion Kits · v4.7 按需注入）

> **核心原則（靜態上限 × 動態上限融合）**：
> 1. **先立 1920×1080 靜態美感上限，再賦予動態呼吸**：每一頁凍結於 `?still=1` 也必須保有該風格的最高靜態視覺工藝（現代 6 格 Bento、麥肯錫色塊即圖表、微光實景裝置、真實無字 AI 黏土／攝影底圖融真字），**嚴禁為了套用動效而把畫面降級成簡陋 UI 卡片或 Emoji 方塊**。
> 2. **動態跟隨主題與風格 DNA 一起注入**：`assemble.py` 掃描投影片 HTML 屬性後，只注入實際用到的風格套件 CSS/JS（未用到 0 KB）。每支原語皆自動讀語意色票變數、支援 `?still=1`/列印/低耗電定格，且絕不誤觸翻頁。

---

## 1. `motion-workday`（日常工作款 · Crisp Snap）

### 1.1 `[data-ruler-progress]` 刻度尺推進目標線
```html
<div data-ruler-progress
     data-label="北區產線移轉完成度"
     data-value="86" data-max="100" data-target="80"
     data-unit="%" data-target-label="目標 80%"></div>
```
- 進頁時自 0 推進至 `data-value`，超過 `data-target` 時目標線與數值自動轉亮主題色。

### 1.2 `[data-bento-expand]` 看板卡片聚焦展開
```html
<div data-bento-expand>
  <article class="card" data-bento-item>
    <h4>唯一紅燈：北區倉儲延遲 4 天</h4>
    <div data-bento-detail><div>
      <p>已調撥 2 條備援物流線，本週五前追平。</p>
    </div></div>
  </article>
</div>
```
- 點擊（或鍵盤 Enter）任一 `[data-bento-item]` 滑順展開 `[data-bento-detail]`，同容器其餘卡片自動壓暗退讓。

---

## 2. `motion-counsel`（顧問報告 · Editorial Weight）

### 2.1 `[data-rank-race]` FLIP 排名攀升超車
```html
<div data-rank-race data-max="100" data-unit="分">
  <div data-rank-item data-before="52" data-after="91">
    <span class="rr-pos"></span><span class="rr-name">方案 A（新架構）</span>
    <div class="rr-bar-wrap"><div class="rr-bar"></div></div><span class="rr-score"></span>
  </div>
  <div data-rank-item data-before="78" data-after="74">
    <span class="rr-pos"></span><span class="rr-name">既有流程</span>
    <div class="rr-bar-wrap"><div class="rr-bar"></div></div><span class="rr-score"></span>
  </div>
</div>
```
- 進頁時從 `data-before` 真實 FLIP 超車換位到 `data-after`；也可用頁內按鈕呼叫 `el._rrInit.show('before' | 'after')` 現場切換。

### 2.2 `[data-odometer]` 機械滾輪數字
```html
<div class="big-num" data-odometer data-value="12天">12天</div>
```
- 逐位滾輪轉至目標數字並帶微過衝精準煞停；靜態／列印自動顯示最終數字。

### 2.3 `[data-rack-focus]` 推鏡景深聚焦
```html
<div class="grid-3" data-rack-focus>
  <article class="card" data-rf-item>論證一</article>
  <article class="card" data-rf-item>論證二</article>
  <article class="card" data-rf-item>論證三</article>
</div>
```
- 點擊任一 `[data-rf-item]` 放大聚焦、其餘柔和退焦；再點一次恢復全覽。

---

## 3. `motion-apple`（Apple 發表 · Cinema Spring）

### 3.1 `[data-split-mask]` 文字遮罩斬切拉起
```html
<h2 data-split-mask>毫秒級邊緣推論<br>從雲端走進掌心</h2>
```
- 以 `<br>` 分行，每行自裁切線下依序衝出並微幅彈簧煞停。

### 3.2 `[data-spotlight-sweep]` 單次聚光掃字顯影（掃完即靜止）
```html
<div data-spotlight-sweep style="--sp-r:170px">
  <h2>光線所至，即是焦點</h2>
</div>
```
- 進頁時自左向焦點中心單次掃過（~1.05s）後**完全靜止**進入閱讀窗（反無限搖晃干擾）；滑鼠移入時才隨游標探照、移出歸位；離頁自動清 rAF，靜態與列印全亮顯示。

### 3.3 `[data-depth-deck]` 3D 景深疊卡甩牌
```html
<div data-depth-deck style="height:360px">
  <article data-deck-card>卡片 1（最前）</article>
  <article data-deck-card>卡片 2</article>
  <article data-deck-card>卡片 3</article>
</div>
```
- 支援點擊或左右拖曳將前卡甩至卡堆後方，後卡自動以 3D 層次、景深清晰度與微彈簧浮升上位。

### 3.4 `[data-colorize-wipe]` 黑白柔焦→彩色光掃
```html
<div data-colorize-wipe>
  <!-- 內部可放產品截圖、插畫或色塊視覺 -->
</div>
```
- 進頁時一道主題光束自左向右掃過，將黑白柔焦畫面瞬間上色綻放。

---

## 4. `motion-story`（插畫場景 · Tactile Bounce）

### 4.1 `[data-popup-fold]` 立體書 3D 翻折立起
```html
<div data-popup-fold>
  <div data-pop-layer>
    <h4>第一幕：真實現場</h4>
    <span data-pop-tag>主角先落定、標籤慢半拍彈起</span>
  </div>
</div>
```
- 進頁由紙面 3D 翻折立起並帶手感過衝回正，`[data-pop-tag]` 依主從延遲接力跟上。

### 4.2 `[data-chat-replay]` 對話氣泡實況劇院
```html
<div data-chat-replay>
  <div data-chat-msg="other">每次結案都要翻三個表單才對得到數字…</div>
  <div data-chat-msg="me">現在一頁看板直接紅綠分明，3 秒拍板！</div>
</div>
```
- 進頁時依序顯示「輸入中…」三點脈動與對話氣泡微彈進場；離頁自動清除計時器，靜態與列印展開全對話。
