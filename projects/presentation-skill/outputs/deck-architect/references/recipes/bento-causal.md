# 黃金工藝配方 1：現代因果 Bento 看板（`bento-causal`）

- **適用場合**：`briefing`（主力）、`pitch`（營運／專案／風險追蹤）
- **核心原則**：**左欄「唯一風險（雙軌甘特斜線延遲）↓ 垂直因果箭頭 ↓ A/B 拍板卡」＋ 右欄「健康總覽（整體完成度＋圓環／佇列由高到低）」**，左右底邊精準齊平，每卡嚴守原則 #26（≤2 層文字，口頭背景進 `notes`），配 `data-focus-plan` 三拍單向聚焦（不左右乒乓）。

```html
<section class="slide canvas" data-surface="light" data-focus-plan="1@0-1750, 2@1750-3500, 3@3500-5100">
  <style>
    .slide .bento { flex: 1; display: grid; grid-template-columns: 0.94fr 1.06fr; gap: 36px; align-items: stretch; }
    .slide .spine { display: flex; flex-direction: column; }
    .slide .card { padding: 26px 32px; border-radius: var(--card-radius, 22px); border: 1px solid var(--line); background: var(--bg-2); box-shadow: var(--card-shadow, 0 8px 24px rgba(16, 24, 40, 0.055)); }
    .slide .risk { border: 1.5px solid color-mix(in srgb, var(--alert, #C03C1E) 45%, transparent); flex: 1.08; display: flex; flex-direction: column; justify-content: space-between; --spot-border: rgba(192, 60, 30, 0.90); --spot-glow: rgba(192, 60, 30, 0.20); }
    .slide .act  { border: 1.5px solid color-mix(in srgb, var(--alert, #C03C1E) 36%, transparent); background: color-mix(in srgb, var(--alert, #C03C1E) 6%, var(--bg-2)); flex: 0.96; display: flex; flex-direction: column; justify-content: space-between; --spot-border: rgba(192, 60, 30, 0.86); --spot-glow: rgba(192, 60, 30, 0.18); }
    .slide .arrow-gap { height: 48px; display: flex; align-items: center; justify-content: center; }
    .slide .risk-em { font-style: normal; font-weight: 900; color: var(--alert-text, #A63016); }
    .slide .gantt { display: grid; grid-template-columns: 72px 1fr; gap: 14px 16px; align-items: center; margin-top: 14px; }
    .slide .track { height: 22px; border-radius: 999px; background: var(--line-2); overflow: hidden; display: flex; }
    .slide .done { background: var(--fg); height: 100%; }
    .slide .delay { background: repeating-linear-gradient(-45deg, color-mix(in srgb, var(--alert, #C03C1E) 36%, transparent) 0 7px, transparent 7px 14px); border: 2px dashed var(--alert, #C03C1E); border-radius: 0 999px 999px 0; height: 100%; }
    .slide .opts { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 14px; }
    .slide .opt { padding: 18px 20px; border-radius: var(--ctrl-radius, 16px); background: var(--bg-2); border: 1.5px solid var(--line); }
    .slide .opt.rec { border-color: var(--accent); }
    .slide .opt strong { display: block; font: 800 24px/1.2 var(--font-body); color: var(--fg); }
    .slide .opt span { display: block; margin-top: 6px; font: 600 19px/1.3 var(--font-body); color: var(--fg-2); }
    .slide .healthy { display: flex; flex-direction: column; justify-content: space-between; gap: 20px; --spot-border: color-mix(in srgb, var(--accent) 88%, transparent); --spot-glow: color-mix(in srgb, var(--accent) 20%, transparent); }
    .slide .ov-row { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding-bottom: 18px; border-bottom: 1px solid var(--line-2); }
    .slide .ov-kpi { font: 900 78px/0.94 var(--font-number); color: var(--fg); font-variant-numeric: tabular-nums; }
    .slide .ov-kpi small { font-size: 34px; color: var(--accent-text); margin-left: 3px; }
    .slide .rings { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .slide .ring-box { display: flex; align-items: center; gap: 16px; padding: 14px 18px; border-radius: var(--ctrl-radius, 16px); background: var(--bg); border: 1px solid var(--line-2); }
    .slide .ring { position: relative; width: 92px; height: 92px; flex: none; }
    .slide .ring b { position: absolute; inset: 0; display: grid; place-items: center; font: 900 24px/1 var(--font-number); color: var(--fg); font-variant-numeric: tabular-nums; }
    .slide .bar { height: 12px; border-radius: 999px; background: var(--line-2); overflow: hidden; margin-top: 10px; }
    .slide .bar > i { display: block; height: 100%; border-radius: 999px; background: var(--accent); }
    .slide .chead { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .slide .chead h3 { font: 800 28px/1.2 var(--font-body); color: var(--fg); }
    .slide .pill { padding: 6px 14px; border-radius: 999px; font: 800 18px/1 var(--font-label); }
    .slide .pill.risk { background: var(--alert, #C03C1E); color: #FFF8F5; border: none; flex: none; }
    .slide .pill.ok { background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent-text); }
  </style>
  <header class="hd">
    <h2 class="title" data-role="title">本季進度與風險</h2>
    <p class="sub" data-role="summary">3 項按進度，<em class="risk-em">北區冷鏈延遲 4 天</em>需今日拍板。</p>
  </header>
  <div class="bento">
    <div class="spine">
      <!-- Beat 1 (0-1750ms): 唯一風險卡 -->
      <div class="card risk" data-focus="1">
        <div class="chead"><h3>北區冷鏈履約</h3><span class="pill risk">延遲 4 天</span></div>
        <div class="gantt">
          <span style="font:700 19px/1 var(--font-label);color:var(--fg-3)">原訂</span>
          <div class="track"><div class="done" style="width:72%;background:var(--line)"></div></div>
          <span style="font:700 19px/1 var(--font-label);color:var(--fg-3)">實際</span>
          <div class="track"><div class="done" style="width:45%" data-grow="x" data-delay="180" data-dur="460"></div><div class="delay" style="width:36%" data-grow="x" data-delay="580" data-dur="540"></div></div>
        </div>
        <div style="font:700 20px/1.3 var(--font-body);color:var(--fg-2)">卡點：夜間分揀人力缺口</div>
      </div>
      <!-- 垂直因果箭頭：線 1420+320=1740ms 抵達，箭頭 1750ms 綻開接 Beat 2 -->
      <div class="arrow-gap" aria-hidden="true">
        <svg width="28" height="44" viewBox="0 0 28 44">
          <path d="M14 2 L14 34" stroke="var(--alert,#C03C1E)" stroke-width="3.5" stroke-linecap="round" fill="none" data-draw data-delay="1420" data-dur="320"/>
          <polygon points="14,42 6,28 22,28" fill="var(--alert,#C03C1E)" data-pop data-delay="1750"/>
        </svg>
      </div>
      <!-- Beat 2 (1750-3500ms): 拍板卡 -->
      <div class="card act" data-focus="2">
        <div class="chead"><h3>調撥解法二選一</h3><span class="pill ok">今日拍板</span></div>
        <div class="opts">
          <div class="opt rec"><strong>方案 A｜備援線</strong><span>72h 壓回 2%・建議</span></div>
          <div class="opt"><strong>方案 B｜外包班</strong><span>當日止血・成本 +18%</span></div>
        </div>
      </div>
    </div>
    <!-- Beat 3 (3500-5100ms): 健康總覽群組（全部子動畫 data-delay >= 3550ms，絕不在 Beat 1 壓暗時偷跑） -->
    <div class="card healthy" data-focus="3">
      <div class="chead"><h3>其餘 3 項均按進度</h3><span class="pill ok">由高至低</span></div>
      <div class="ov-row">
        <div>
          <div style="font:700 20px/1.2 var(--font-label);color:var(--fg-3)">整體平均完成度</div>
          <div class="ov-kpi" data-count data-delay="3550" data-dur="720">84<small>%</small></div>
        </div>
        <div style="text-align:right;font:700 20px/1.4 var(--font-body);color:var(--accent-text)">3/4 專案綠燈<br>無跨組阻斷</div>
      </div>
      <div class="rings">
        <div class="ring-box">
          <div class="ring">
            <svg width="92" height="92" viewBox="0 0 92 92" aria-hidden="true">
              <circle cx="46" cy="46" r="36" fill="none" stroke="var(--line-2)" stroke-width="10"/>
              <circle cx="46" cy="46" r="36" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round"
                      stroke-dasharray="226.2" stroke-dashoffset="13.6" transform="rotate(-90 46 46)"
                      data-draw="ring" data-delay="3620" data-dur="760"/>
            </svg>
            <b data-count data-delay="3620" data-dur="720">94%</b>
          </div>
          <div><strong style="display:block;font:800 22px/1.2 var(--font-body)">核心排程重構</strong><span style="font:600 18px/1.3 var(--font-body);color:var(--fg-3)">已進壓測</span></div>
        </div>
        <div class="ring-box">
          <div class="ring">
            <svg width="92" height="92" viewBox="0 0 92 92" aria-hidden="true">
              <circle cx="46" cy="46" r="36" fill="none" stroke="var(--line-2)" stroke-width="10"/>
              <circle cx="46" cy="46" r="36" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round"
                      stroke-dasharray="226.2" stroke-dashoffset="40.7" transform="rotate(-90 46 46)"
                      data-draw="ring" data-delay="3720" data-dur="760"/>
            </svg>
            <b data-count data-delay="3720" data-dur="720">82%</b>
          </div>
          <div><strong style="display:block;font:800 22px/1.2 var(--font-body)">門市自助看板</strong><span style="font:600 18px/1.3 var(--font-body);color:var(--fg-3)">本週驗收</span></div>
        </div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;font:800 22px/1.2 var(--font-body)"><span>自動補貨試點</span><span data-count data-delay="3820" data-dur="680">76%</span></div>
        <div class="bar"><i style="width:76%" data-grow="x" data-delay="3820" data-dur="680"></i></div>
      </div>
    </div>
  </div>
</section>
```

> **工藝檢查點**：主標題為路標（最大字）、結論在內文副標（卡點用風險色 `<em class="risk-em">`，不誤用綠燈強調色）；三張聚光卡各自定義語意 `--spot-border`/`--spot-glow`（綠燈總覽絕不發紅光）；Stage 3 子原語 `data-delay ≥ 3550ms` 嚴防壓暗時偷跑；垂直箭頭先到、箭頭後綻；每卡嚴守原則 #26（≤2 層文字，口頭背景進 `notes`）。對標最高工藝見 `assets/style-library.html` 01 號 `workday` 活體舞台與 `v4-alive-demo/slides/07-bento-status.html`。

## 風格動態融合升級（`motion-workday`）
- 可按需於進度里程碑格寄生 `[data-ruler-progress]`，或於多項目風險卡寄生 `[data-bento-expand]`（點擊展開細項、同排壓暗聚焦），詳見 `references/modules/style-motion-kits.md`；嚴守 3 拍語意順序與畫完即靜止。

