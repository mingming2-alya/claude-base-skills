# 黃金工藝配方 1：現代因果 Bento 看板（`bento-causal`）

- **適用場合**：`briefing`（主力）、`pitch`（營運／專案／風險追蹤）
- **核心原則**：**左欄「唯一風險 ↓ 垂直因果箭頭 ↓ 建議拍板」＋ 右欄「健康項目由高到低」**，左右底邊對齊同一基線，配 `data-focus-plan` 三拍單向聚焦（不左右乒乓）。

```html
<section class="slide canvas" data-surface="light" data-focus-plan="1@0-1700, 2@1700-3400, 3@3400-5000">
  <style>
    .slide .bento { flex: 1; display: grid; grid-template-columns: 0.92fr 1.08fr; gap: 36px; align-items: stretch; }
    .slide .spine { display: flex; flex-direction: column; gap: 0; }
    .slide .card { padding: 28px 32px; border-radius: 20px; border: 1px solid var(--line); background: var(--bg-2); }
    .slide .risk { border-left: 6px solid var(--alert, #DC2626); flex: 1; }
    .slide .act  { border-left: 6px solid var(--accent); flex: 1; }
    .slide .arrow-gap { height: 52px; display: flex; align-items: center; justify-content: center; }
    .slide .healthy { display: flex; flex-direction: column; justify-content: space-between; gap: 18px; }
    .slide .bar { height: 10px; border-radius: 999px; background: var(--line-2); overflow: hidden; margin-top: 10px; }
    .slide .bar > i { display: block; height: 100%; border-radius: 999px; background: var(--accent); }
    .slide .k { font: 700 18px/1 var(--font-label); color: var(--fg-3); margin-bottom: 10px; }
    .slide h3 { font: 800 28px/1.25 var(--font-body); color: var(--fg); }
    .slide p  { font: 500 21px/1.45 var(--font-body); color: var(--fg-2); margin-top: 8px; }
  </style>
  <header class="hd">
    <h2 class="title" data-role="title">本季進度與唯一決策點</h2>
  </header>
  <div class="bento">
    <div class="spine">
      <div class="card risk" data-focus="1">
        <div class="k" style="color:var(--alert,#DC2626)">唯一紅燈風險</div>
        <h3>北區冷鏈履約延遲 4 天</h3>
        <p>夜間分揀人力缺口導致 2 家門市缺貨率升至 8.2%。</p>
      </div>
      <div class="arrow-gap" aria-hidden="true">
        <svg width="28" height="44" viewBox="0 0 28 44">
          <path d="M14 2 L14 34" stroke="var(--accent)" stroke-width="3.5" fill="none" data-draw data-delay="1450"/>
          <path d="M6 26 L14 38 L22 26" stroke="var(--accent)" stroke-width="3.5" fill="none" data-pop data-delay="1800"/>
        </svg>
      </div>
      <div class="card act" data-focus="2">
        <div class="k" style="color:var(--accent-text)">需會中拍板</div>
        <h3>啟用 2 條備援調撥線</h3>
        <p>本週四上線，預計 72 小時內將缺貨率壓回 2% 以內。</p>
      </div>
    </div>
    <div class="card healthy" data-focus="3">
      <div class="k">其餘 3 項均為綠燈（由高至低）</div>
      <div><div style="display:flex;justify-content:space-between;font-size:22px;font-weight:700"><span>核心排程重構</span><span data-count>94%</span></div><div class="bar"><i style="width:94%" data-grow="x"></i></div></div>
      <div><div style="display:flex;justify-content:space-between;font-size:22px;font-weight:700"><span>門市自助看板</span><span data-count>82%</span></div><div class="bar"><i style="width:82%" data-grow="x"></i></div></div>
      <div><div style="display:flex;justify-content:space-between;font-size:22px;font-weight:700"><span>自動補貨試點</span><span data-count>76%</span></div><div class="bar"><i style="width:76%" data-grow="x"></i></div></div>
    </div>
  </div>
</section>
```

> **工藝檢查點**：左欄風險卡與拍板卡等寬、中間以垂直實線箭頭串接；每卡最多 2 層文字（標題＋一句證據），其餘進度細項放 `notes`。

## v4.7 風格動態融合升級（`motion-workday`）
- 空間先分群（左欄「風險 ↓ 因果紅箭頭 ↓ A/B 拍板」＋右欄健康總覽由高到低），左右雙欄底部基線齊平。
- 可按需於進度里程碑格寄生 `[data-ruler-progress]`，或於多項目風險卡寄生 `[data-bento-expand]`（點擊展開細項、同排壓暗聚焦），詳見 `references/modules/style-motion-kits.md`；嚴守 3 拍語意順序與畫完即靜止。
