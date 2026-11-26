# 主柱二全歷史與第一性原理深度稽核報告（對象 `v4.8.2` / `30dc93b`）

> **稽核範圍**：回溯專案自建立至今之設計決策（`inputs/{presentation-principles,design-research,style-research,motion-research,phase-c-teardown-learnings,modular-capabilities-audit}.md`、`LOG.md`），並對 `outputs/deck-architect/` 全量程式碼、樣式、配方與圖鑑進行逐行審計、OKLCH 數值驗證與無頭 Chromium CDP 實跑（`v4-alive-demo`、`v45-modular-demo`、`v48-regression`）。已於 v4.8.1 修補之外部稽核項目與排定 Phase D/E 的功能不重複列入。
>
> **分級定義**：
> - **P0（破約／致命缺陷）**：直接違反第一性原理鐵律、造成畫面黑屏／隱形／不可讀／功能癱瘓，或作為全技能標竿卻自身違規。
> - **P1（結構盲點／實測缺陷）**：規格與程式脫節、靜默失效、縮放／列印／模組極性異常，或品管腳本橡皮圖章。
> - **P2（細節打磨）**：邊界體驗與視覺微瑕。

---

## 總覽：已站穩的護城河 vs 真正遺漏

**已經站穩的設計**：
- 單檔 HTML 100% 離線可播、零外部重依賴（分層混合方案 1）與授權潔癖（零 AGPL 抄碼）。
- 三段式舞台光譜（`briefing`/`pitch`/`keynote`）、主柱邊界延至 Step 3a、三層按需注入（未用到 0 KB）與軟性 `[WARN]` 治理框架。
- 真實像素 WCAG 取樣（含 OKLCH 瀏覽器換算與漸層字逐段檢查）與 `v4-alive-demo` 實測打磨出的視覺指引方法論。

**但全歷史對照後發現一個系統性盲區**：
1. **標竿示範（`v4-alive-demo`）與技能本體（`recipes/`、`style-library.html`、`runtime.js`）悄悄分岔**——Phase B.3.1/B.3.2 實戰磨出的好做法沒完整反寫回官方配方與圖鑑，導致新簡報直接複製舊病。
2. **底盤執行期與三層模組化在「真實現場情境」存在多處未測到的斷點**——WAAPI `fill: 'forwards'` 殘留鎖死、`isStatic()` 誤殺無障礙與講者工具、`#s-N` 作用域打爆 `G` 鍵縮圖與 Layer 2 權重、活頁按 `P` 列印壞掉、縮放舞台座標未除 `scale(s)`。
3. **`check.mjs` 的 16 項檢查有多處盲點或反向激勵**——`--pdf` 用 `?still=1` 掩蓋活頁列印 Bug、Check 15 因 `overflow: hidden` 永遠回報 0 溢出、Liveliness Audit 把去框編輯頁反罰為「平淡純文字頁」。

---

## 一、視覺引導（Visual Guidance）

### [P0] 1. `runtime.js` `BEAT_MS` 與《視覺指引規格書》靜止閱讀窗機械性衝突
- **位置**：`assets/runtime.js:610, 666` vs `references/visual-guidance.md:17, 78`、`references/motion-system.md:49`
- **事實**：規格要求每拍停留 **1.3–1.8 秒**、動作後留 **0.6–0.9 秒完全靜止閱讀窗**，但 `runtime.js:610` 寫死 `BEAT_MS = { '1': 120, '2': 760, '3': 1480, '4': 2200 }`（間隔僅 640–720ms），扣掉 600ms 進場動畫後**靜止窗只剩 40–120ms**。任何照手冊用 `data-beat="1|2|3|4"` 的頁面都會自動違反閱讀窗鐵律。
- **修補方向**：重校 `BEAT_MS`（如 `1:120, 2:1450, 3:2800, 4:4150` 或支援容器級 `data-beat-gap`），保留 `data-delay` 精細覆寫。

### [P0] 2. 官方配方與 `style-library.html` 退化回 Phase B.3.1 / B.3.2 之前
- **位置**：`references/recipes/{bento-causal,linked-diagram,interactive-proof}.md`、`assets/style-library.html:733-780`
- **事實**：
  1. `recipes/bento-causal.md:7, 35, 39-68`：`data-focus="3"` 內的 `data-count`/`data-grow` 沒設 `data-delay`，於 **Beat 1（壓暗 0.30 時）搶先演完**（比 Beat 3 早 2.2 秒）；三張卡皆未設 `--spot-border`/`--spot-glow`，全部吃 `shell.css:374` 寫死的風險紅，造成**綠燈健康總覽卡聚光時發紅光**；垂直箭頭 `data-draw`（2330ms 完成）晚於箭頭端 `data-pop`（1800ms）；風險卡點詞誤用綠色 `<mark class="em">`；右欄簡化成 3 條平條，丟失 `v4-alive-demo/slides/07-bento-status.html` 的總覽大數與進度圓環。
  2. `recipes/linked-diagram.md:35-38`：兩條連線 `data-draw` 完成時間（1160ms／1140ms）晚於端點 `data-pop`（520ms／780ms），違反「線先到、點後綻」。
  3. `recipes/interactive-proof.md:26-67, 71`：第 71 行宣稱單向聚光與搶先操作解除壓暗，但 HTML **零 `data-focus-plan`、零動態箭頭、無 `.live-only`**，且右欄兩行字被 `justify-content: space-between` 拉出 ~500px 空白黑洞（重犯 `LOG.md:1364` 已修過的錯）。
  4. `assets/style-library.html:733-780`（Apple 活體舞台）：左放結果、右放動作且外標混雜，退回 `LOG.md:1387`（Phase B.3.2）修正前的錯亂視線順序。
- **修補方向**：將 `v4-alive-demo` B.3.1/B.3.2 實證定案的時序、語意 `--spot-border`、平衡排版與 Apple 左動作→右結果動線完整回寫進三支配方與 `style-library.html`。

### [P1] 3. `data-step` 雙軌步進與視覺指引／模組聯動斷層
- **位置**：`assets/runtime.js:478-487, 907-918, 1450-1459`、`assets/modules/motion/story-kit.js:9-29`、`assets/modules/flow-carousel.css:241-243, 297-330`
- **事實**：
  1. `[data-transform-at]` 放進 `data-step > 0` 容器被 `animateSlideContent` 跳過，但 `runPrimitives()` 沒實作 → **靜默失效**。
  2. `setStep()` 步進揭曉時未清進行中的 `data-focus-plan`；`handleEarlyTakeover` 只聽 `pointerdown`/`input`，鍵盤操作 `[data-bento-item]`/`[data-rf-item]`/`[data-compare-slider]` 不會解除聚光壓暗；`story-kit.js` `[data-popup-fold]` 漏加 `.live-ctrl`。
  3. `flow-carousel` `stepper` 模式的 `[data-node].is-step-dim`（`opacity: 0.34`）在 `?still=1`、低耗電與 `@media print` 完全沒有復原規則。
- **修補方向**：把 `[data-transform-at]` 移入 `runPrimitives()`；`setStep()` 清理進行中 focus；`TAKEOVER_SEL` 補鍵盤互動與 `[data-popup-fold]` `.live-ctrl`；補 `flow-carousel.css` `[data-node]` 靜態／列印歸零。

### [P1] 4. 視覺指引核心規則缺乏自動化把關
- **位置**：`scripts/check.mjs:801-888`
- **事實**：Check 6 只測 `.is-focusing` 開關復原，不驗單拍停留 ≥1.3s、離焦子原語偷跑、`data-pop` 早於 `data-draw` 抵達、或焦點重心左右乒乓。
- **修補方向**：在 `check.mjs --motion` 增補 `data-focus-plan` 單拍時長檢查、離焦子元素時序檢查與同 SVG `data-pop` vs `data-draw` 到達順序驗證。

---

## 二、靜態美感上限（Static Ceiling）

### [P0] 5. 視覺最高標竿 `assets/style-library.html` 自身多處 WCAG、字級與風格本質破功
- **位置**：`assets/style-library.html:156-340, 526-530, 738-770, 820-915`（已用 `scripts/oklch.py` 實算）
- **事實**：
  1. **Apple 淺色版**：第 311 行把 `--a-dev` 翻成 `#FFFFFF → #F1F5F9`（同時違背 `styles/apple.md:13`「淺深舞台裝置皆維持深色玻璃」與禁純白鐵律），內字 `#7CEEF9` 對比僅 **`1.24:1`**、`#4BE2A5` 僅 **`1.51:1`**。
  2. **Counsel 深／淺色版**：深色版白字配 `#10B981` 焦點塊僅 **`2.54:1`**（違背 `styles/counsel.md:44` 深墨字規定）；淺色版 `--c-muted: #767B85` 在 `#F6F3EC` 僅 **`3.83:1`**，柱 3 白字 `opacity: 0.85` 僅 **`2.87:1`**。
  3. **Workday 深／淺色版**：深色版風險膠囊白字配 `#FB7185` 僅 **`2.69:1`**，且兩版皆有 **`17px`** 標籤（違反 `styles/workday.md:28` ≥18px 硬下限）。
  4. **Illustration 卡**：預覽的是 Apple 的 `colorize-wipe`，未展示 `illustration` 專屬 `motion-story`（`popup-fold`／`chat-replay`）。
- **修補方向**：逐項修補 `style-library.html` 四卡淺深雙底色票、字級與動線，並將四卡納入無頭瀏覽器對比檢查。

### [P0] 6. 活頁直接列印（`P`／`Ctrl+P`）大面積失效（被 `check.mjs --pdf` 掩蓋）
- **位置**：`assets/runtime.js:1406`、`assets/shell.css:816-857`、`assets/modules/motion/{apple,workday}-kit.css`、`templates/deck.css:54-55`、`scripts/check.mjs:1500-1537`
- **事實**：`runtime.js` **零 `beforeprint`/`afterprint` 處理**，按 `P` 直接呼 `print()`：
  1. 當前頁在 `step = 0` 時，`[data-step="1..N"]` 帶 `data-step-hidden="1"` 被 `shell.css:834` 整塊刪除；尚未翻到的後續頁從未跑 `applySlideStep()`，導致 `[data-step-only="0"/"1"]` 圖層全數重疊印出。
  2. `@media print` 漏掉 `[data-focus]` 與 `.pre-transform` 歸零（`shell.css:761-766` 只寫給 `html.still`/`body.low-power`），也漏掉 `apple-kit.css` `.is-primed`（主標印成隱形）／`[data-deck-card]` 疊卡與 `workday-kit.css` `.has-open` 壓暗復原。
  3. 自由畫布無 `.snav`（僅 `.slide.cmp` 有），列印隱藏 `#nav` 後 `templates/deck.css:54-55` 仍留 `124/156px` 頂部空帶。
  4. `check.mjs --pdf` 因開 `?still=1` 且先逐頁翻過，完全沒測到真實使用者按 `P` 的路徑。
- **修補方向**：`runtime.js` 補 `beforeprint`/`afterprint`（列印前全頁 snap 至終態並清 focus/transform/kit，印後還原）；補齊全套 `@media print` 復原規則與自由畫布列印上邊距；`check.mjs` 加活頁 `beforeprint` 驗證。

### [P0] 7. `SKILL.md` Step 4 並行分身必吃清單漏掉 `styles/<selected>.md`
- **位置**：`SKILL.md:116`
- **事實**：>6 頁派乾淨分身精雕的 6 樣輸入漏了選定風格憲法（`styles/<selected>.md`），分身看不到固定本質、字體字級、OKLCH 範圍與禁忌清單。
- **修補方向**：補入輸入 ②（`styles/<selected>.md` 與 `deck.css`＋`meta`）。

### [P0] 8. 官方模組 `code-stage.css` 夾帶全風格禁用紫色
- **位置**：`assets/modules/code-stage.css:83, 88`
- **事實**：`.tok-kw` 在暗底用 `#D8B4FE`（`oklch.py`：`L 0.827, C 0.108, H 306.4° [PURPLE]`）、亮底用 `#5B21B6`（`L 0.432, C 0.211, H 292.8° [PURPLE]`），直接觸犯 `styles/color-system.md:13` 禁紫鐵律（`H 280–335, C ≥ 0.04`）。
- **修補方向**：改為非紫高對比語法關鍵字色（如青綠／暖金／鈷藍，避開 `H 280–335`）。

### [P0] 9. AI 無字底圖自動換圖被未記錄的 `<!-- /slot -->` 魔術註解靜默破壞
- **位置**：`scripts/assemble.py:234-237, 307-332, 1605`
- **事實**：`SLOT_RE` 強制結尾必須有 `</div><!-- /slot -->` 才替換，但**全技能所有文件與 `v4-alive-demo` 皆未提及此註解**；更糟的是第 326–331 行對一般 `<div data-slot="...">` 沒替換卻仍標 `upgraded`，讓 CLI 假報「已換上升級圖」。
- **修補方向**：改用平衡標籤解析（`HTMLParser`）直接替換 `.asset-slot[data-slot="..."]` 內文，不再要求魔術註解，且僅於真正替換後才計為 `upgraded`。

### [P1] 10. 字體排版、去框化與自動化稽核的多處漂移
- **自由畫布 `data-fit="phrase"` 靜默失效**：`assets/fit.js:9-12` 沒有 `.ph` 就直接跳過，但只有 `assemble.py` 內建元件會包 `.ph`，自由畫布無效且無人記錄。
- **`Noto Serif TC` 漏載＋單一字體與中文負字距回潮**：`shell.css:46` 與 `editorial-drama.md:41` 使用 `Noto Serif TC`，但 `templates/deck.css` 與 4 份 `styles/*.md` 的 `@fonts` 全沒載入；`templates/deck.css:14-17, 63-70` 退回四角色全 `Noto Sans TC`、主副標僅 2.15×，且 `shell.css:53-54`、`templates/deck.css:64`、`apple.md:23`、`workday.md:23` 對中文套 `-0.015em`～`-0.025em` 負字距（違背 `inputs/design-research.md:52` 與 `style-research.md:633`）。
- **`counsel` 零圓角零陰影遭破壞**：`recipes/{linked-diagram,interactive-proof}.md`（文末皆推 `motion-counsel`）與 `live-controls`/`compare-slider`/`code-stage`/`device-frame`/`flow-carousel`/`linked-highlight` 硬寫 `border-radius: 16–22px` 與 `box-shadow`，未走 `var(--radius, ...)`。
- **Liveliness Audit 懲罰去框編輯頁＋相鄰版面／字數／OKLCH 稽核缺口**：
  - `check.mjs:1569-1575` 把 `editorial-drama.md`（無 SVG/IMG/TABLE 的 35/65 分割與原話暗房）罰為「平淡純文字頁」；Phase C.1 五大去框原型尚有 3 種缺配方範例（白棚剖面、羽化融圖 Bento、物象軌跡），且 `illustration` A/B/C 缺配方藍圖。
  - `lint.py:621` 跳過 `layout: free`，讓相鄰版面多樣性檢查在 v4 幾乎失效（應改比 `director.archetype`）；`lint.py:492` 字數檢查與原則 #26 未掃自由畫布 HTML；`lint.py:597-615` 未在 3a 定風格後檢核 `archetype`/`surface` 與 `keynote` 連同極性 ≤5 頁。
  - `oklch.py:97-125` 只擋字面 `#FFFFFF`/`#000000`、漏檢 `bg`/`alert` 紫色與 `contrast(alert, bg)`，亦缺 `--style` OKLCH 範圍檢核。
  - **390px 手機靜態可讀性盲點**：Check 15（`check.mjs:1332-1348`）因 `html, body { overflow: hidden }` 永遠回報 0 溢出，沒測打開的 `#ctrl-bar`（實測寬 479px 雙邊裁切）與 18–24px 縮成 3.7–4.9px 難讀問題。

---

## 三、動態系統（Motion System）

### [P0] 11. WAAPI `fill: 'forwards'` 播完未 `cancel()` 造成永久黑屏／隱形／掉出舞台
- **位置**：`assets/runtime.js:97-103, 1051-1073, 1167, 1208-1211, 1244-1247, 1305-1311`
- **事實**：`trackAnim()` 在動畫播完即從 `activeAnims` 刪除但不 `cancel()`，而 WAAPI `fill: 'forwards'` 權重高於 inline style：
  1. **打斷 `shock` 永久全黑屏**：`cIn` 在 160ms 播完移出 `activeAnims`，在接下來的 220ms 停頓期按方向鍵或 `B`，`cleanupFlight()` 取消不到 `cIn` 且清掉 `cOut` 計時器，`#curtain` 永久 `opacity: 1` 蓋死全場。
  2. **回翻 `iris` 永久裁剪歸零**：`aOut` 把 `prev` 鎖在 `circle(0%)`（Chrome 實測 `anims: 1`），後續若用 `lowPower`/`?still=1`/`instant`/Grid 回到該頁，整頁永久隱形。
  3. **回翻 `sheet-up` 永久掉出畫布**：`aOut` 把 `prev` 鎖在 `translate3d(0, 1080px, 0)`，同上返頁時整頁空白。
  4. 附帶：`data-ripple`（`810`）與 `data-travel`（`834`）採 `fill: 'both'` 播完永不 `cancel()` 造成記憶體殘留。
- **修補方向**：所有過渡性 WAAPI 動畫在 `Promise.all` 收尾與 `cleanupFlight()` 中一律針對受影響節點呼叫 `el.getAnimations().forEach(a => a.cancel())`（或將已完 `forwards` 動畫另存 `persistedAnims` 集合於清理時一併 `cancel()`）。

### [P0] 12. `isStatic()` 把三種正交模式混為一體，系統「減少動態」或 `B` 鍵直接癱瘓互動與講者工具
- **位置**：`assets/runtime.js:45-53` 及全部講者工具／互動模組呼叫端
- **事實**：`isStatic = () => Boolean(stillMode || lowPower || reduce)` 把「截圖凍結 `?still=1`」、「講者省電 `B`」與「作業系統無障礙 `prefers-reduced-motion: reduce`」混成同一個布林值。結果只要講者電腦開了減少動態或按 `B` 降風扇，**`S` 講者台、`G` 總覽、`A`/`L` 畫筆雷射、`<video>`/`<audio>`/`[data-sound-ab]`、`[data-compare-slider]`、`[data-ref]`、`[data-zoomable]`、`[data-depth-deck]`、`data-step` 全部停擺**；且 `reduceMQ.change`（`runtime.js:47`）未派發事件通知模組。
- **修補方向**：拆成正交 API——**`isStill()`（僅 `?still=1`：無頭截圖隱藏 Chrome、鎖互動）** vs **`isReducedMotion()`（`stillMode || lowPower || reduce`：只停裝飾動效與自動輪播、改瞬切終態，但完整保留 `G`/`A`/`L`/`S`、影音播停、對比拉桿、文圖聯動、燈箱與 `data-step`）**，並補 `deck:reducedmotion` 事件。

### [P1] 13. 風格動態曲線變數與 `structure.axis` 運鏡方向是空殼
- **位置**：`assets/runtime.js:55, 122, 371-378, 1089-1100`、`styles/*.md` §5/§6
- **事實**：
  1. 4 份 Style DNA 與 `shell.css:72` 寫好的 `--enter-easing`、`--spring-response`、`--spring-bounce`，`runtime.js:371-378` **一行都沒讀**，導致 `apple` vs `illustration`、`workday` vs `counsel` 基礎進場手感全一樣。
  2. `DECK.motion`（`horizontal`/`vertical`/`zoom-in`/`zoom-out`）只被目錄圓環讀過一次，`resolveTransition()` 跨章永遠寫死橫向 `push`。
- **修補方向**：讓 `slideMotion(sl)` 讀取 `--enter-easing` 作為主要曲線；`resolveTransition()` 依 `DECK.motion` 對應跨章預設轉場（`vertical`→縱移、`zoom-in/out`→`zoom-rise`）。

### [P1] 14. 4 套風格動態套件實測工程 Bug 與生命週期錯位
- **位置**：`assets/modules/motion/{story,counsel,apple,workday}-kit.{css,js}`、`assets/runtime.js:1328`
- **事實（均經程式碼核對與 Chrome CDP 實測）**：
  1. **`story-kit` `[data-popup-fold]` 多層翻折失效**：`.is-folded [data-pop-layer]` 漏 `transition: none !important; transition-delay: 0s !important;`，90ms 後移除 `.is-folded`，第 2 層起（`delay ≥ 120ms`）根本沒折就結束、**完全靜止**；`.cr-typing i` 隱藏態仍在背景跑 `infinite` 動畫（應限縮 `.cr-typing.is-on i`）。
  2. **`counsel-kit` 滾輪早砍＋FLIP 縮放錯位**：`[data-odometer]` 最後一位需 `820 + 2*maxDelay`，`settleTimer`（`68` 行）在 `880 + maxDelay` 就提前拆 DOM；`[data-rank-race]`（`111-120`）用螢幕像素算 `dy` 沒除舞台 `scale(s)`（手機縮 5 倍）且 `appendChild` 移亂非排名子節點；`deck:slideleave` 漏清 `[data-rack-focus]`。
  3. **`apple-kit` 疊卡縮放錯位＋連點競態＋`innerHTML` 洗掉綁定**：`[data-depth-deck]` 拖曳 `dx` 未除舞台 `scale(s)` 且 230ms `setTimeout` 無防連點／無清理；`initSpotlight`/`initColorize` 用 `innerHTML` 重建子樹會銷毀內部既有事件監聽；`deck:slideleave` 漏清 `split-mask` 與 `depth-deck`。
  4. **`workday-kit` 雙層 rAF 漏追蹤＋layout 重排**：`play()` 巢狀 `rAF` 沒存 `rafId`（快翻離頁無法停）；`[data-bento-expand]` 未接 `slideleave`/`still`/`lowpower`；`.rp-fill` 與 `counsel-kit` `.rr-bar` 皆動畫 `width`（layout reflow，應改 `scaleX`）。
  5. **事件時機與回翻重播**：`deck:slideenter` 在轉場 0ms 就派發（4 套套件在轉場中／`shock` 黑幕後就偷跑）；回翻到多步頁終態（`step = maxS`）或頁內步退（`dir = -1`）時，4 套套件全步驟一起誤重播；`media` 自動播放與 `code-stage` 打字機放進 `data-step` 亦會提前偷跑。

### [P1] 15. Magic Move（`[data-morph]`）邊界與鍵盤修飾鍵缺失
- **位置**：`assets/runtime.js:939, 956-970, 997-1003, 1124-1126, 1384-1407`
- **事實**：`go()` 先 `collectMorphPairs` 再 `cleanupFlight`（打斷折返量到錯位落點）；漏查祖先 `[data-step-hidden="1"]`；終點為漸層字時飛行中變透明；強制 `whiteSpace = 'nowrap'` 拉爆多行標題。鍵盤監聽未過濾 `e.metaKey || e.ctrlKey || e.altKey`（`Cmd+F` 誤開全螢幕、`Cmd+B` 誤開省電）。

---

## 四、三層模組化按需注入（Modular Injection）

### [P0] 16. `#s-N` ID 作用域 × `grid-overview` 刪 `id`：總覽縮圖樣式全毀＋權重通殺 Layer 2 模組＋裸選擇器外洩
- **位置**：`scripts/assemble.py:402-496, 569, 1164-1169`、`assets/presenter/grid-overview.{js:60-61, css:94-95}`
- **事實（Chrome CDP 實測證實）**：
  1. `assemble.py:427` 將自由畫布 `.slide` 改寫成 `#s-1`、`#s-2`…，但 `grid-overview.js:61` 把縮圖 `<section>` 的 `id` 刪掉 → **所有自由畫布縮圖崩潰成無樣式原生 HTML**（實測 `v4-alive-demo` Slide 1 主標 `122px → 26.7px`、Slide 7 卡片背景變透明且脫離定位）；加上 `grid-overview.css:95` `display: flex !important` 砸壞 `grid`/`block` 頁。
  2. `#s-N`（ID 權重 `1,0,0`）置於 `module_css` 之後，碾壓所有 Layer 2 模組狀態類（`linked-highlight`、`bento-expand`、`rack-focus`、`flow-carousel`）。
  3. `_scope_selector_list` 只改 `.slide`/`:root`/`*`/`html`/`body`，**裸 `.card`/`h2` 與 `@keyframes` 完全無作用域**，Step 4 多分身並行寫作會互相污染。
- **修補方向**：改用資料屬性作用域 `[data-slide-scope="s-N"]`（權重 `0,1,0`、不搶 Layer 2、縮圖複製不重複 DOM ID），並補裸選擇器與 `@keyframes` 頁級前綴；移除 `grid-overview.css:95` 的 `display: flex !important`。

### [P0] 17. `speaker-view` 在 HTTP/HTTPS 下遙控翻頁雙重觸發（按一次跳 2 頁／2 步）
- **位置**：`assets/presenter/speaker-view.js:77-91, 132`
- **事實**：`send(msg)` 無條件同時發 `BroadcastChannel` 與 `localStorage`，主視窗同時監聽兩邊且 `handleIncoming` 無去重 → 任何同源 HTTP/HTTPS 環境每按一次下一步都跳兩步。
- **修補方向**：有 `bc` 時僅走 `bc`（僅 `bc` 不可用才退回 `localStorage`），並在主視窗加 `ts`/`seq` 去重。

### [P1] 18. `device-frame` 手冊／偵測器與 CSS 完全脫節（Dead Classes）
- **位置**：`scripts/assemble.py:861`、`references/modules-catalog.md:20`、`references/modules/media-and-gallery.md:96-99`、`assets/components/device-frame.css:1-76`
- **事實**：手冊與偵測器教作者寫 `.device-phone`（`.dp-notch`/`.dp-screen`）與 `.device-tablet`（`.dt-screen`），但 `device-frame.css` 只實作了 `.device-frame[data-device="phone"|"tablet"]`，手冊寫的 5 個 class 全部無樣式。
- **修補方向**：在 `device-frame.css` 完整支援兩套語法（`.device-phone`/`.dp-notch`/`.dp-screen`、`.device-tablet`/`.dt-screen` 與 `data-device` 屬性版）。

### [P1] 19. 4 支 Layer 2 CSS 漏接 `html[data-mode]` 極性
- **位置**：`assets/modules/{code-stage,live-controls,media,coverflow}.css`
- **事實**：這 4 支樣式只寫 `[data-surface="light"|"dark"]`，延續 v4.8.1 允許只寫 `meta.mode` 不逐頁重寫 `data-surface` 的設計時會錯色（例如 `mode: light` 下滑桿軌道白透隱形、`code-stage` 維持黑底、`coverflow` 按鈕維持黑底）。
- **修補方向**：同步改為同時匹配 `:where(html[data-mode="light"]) .slide:not([data-surface="dark"]):not([data-surface="photo"])` 與 `[data-surface="light"]`（暗底同理）。

### [P1] 20. Layer 1 Overlay 協作、`visual-flair` 燈箱與 `fit.js` 副作用
- **位置**：`assets/presenter/{annotator,grid-overview}.js`、`assets/modules/visual-flair.{js,css}`、`assets/fit.js`
- **事實**：
  1. `annotator` 雷射筆 `L` 開啟後按 `B` 省電被 `isStatic()` 鎖死關不掉；`G`/`A`/`L`/`C` 沒查 `hasNavLock()` 造成多層 Overlay 疊架錯亂；`grid-overview` 首次開啟永久快取若逢動畫中場即壞圖；390px 手機 `#ctrl-bar`（479px）與 `#deck-annotator-bar` 雙邊裁切。
  2. `visual-flair` `#deck-lightbox` 掛在 `body`：亮底配白字圖說隱形、亮頁 SVG 在暗底簡報燈箱變黑底且脫離作用域 CSS、漏刪子孫 `id`、漏接 `lowpower`；`[data-spotlight-hover]` 游標座標未除舞台 `scale(s)`。
  3. `fit.js` 每次執行先清空作者 inline `font-size`、在 `runtime.js:1316` 與 `[data-count]` 歸零賽跑、且在每次切頁首幀對全檔跑同步強制重排。

### [P1] 21. `assemble.py` 注入器與 Step 3b `build_sheet` 邊界漏洞
- **位置**：`scripts/assemble.py:857-1143, 1301-1496`、`scripts/check.mjs:1559, 1574`
- **事實**：
  1. 掃描前未剝除 HTML 註解；`DATA_FX_RE` 掃內層元素但 `fx/core.js` 只讀 `<section>` 根元素；遍歷無序 `FX_EFFECTS` set 導致輸出非確定性；單引號屬性漏檢；`avoid_detectors` 漏 `data-typewriter`/`data-marquee` 且 `status-table` 子字串誤報；`meta.modules` 不報「宣告了卻沒用」。
  2. `build_sheet()` 靜默丟棄 `layers["warnings"]`、寫死 `tabs: []` 使 >2 頁章節樣張少 32px 上邊距、忽略 `meta.style_css`、未修正 `.preview/` 相對影音路徑。
  3. `check.mjs` Liveliness Audit 漏計 `[data-toggle]`、`[data-presets]`、`[data-zoomable]`、`[data-typewriter]`、`[data-sound-ab]`、`.device-phone`/`.device-tablet`。

### [P2] 22. 細節打磨
- `assets/modules/coverflow.css:133, 157-160`：`[data-marquee]` `.mq-track` 缺 `padding-right: var(--mq-gap, 28px)` 導致每輪 14px 接縫跳格。
- `assets/modules/media.js:273`：`[data-sound-ab]` 首次切軌未等 `loadedmetadata` 會丟失進度。
- `assets/modules/fx/confetti-burst.js:5`：硬編碼洋紅 `'244,114,182'` 忽略主題色票。

---

## 建議修補批次（若決定修完再進真實簡報 PK）

| 批次 | 涵蓋項目 | 解決的核心風險 |
|---|---|---|
| **批次 A（P0 急診，10 項）** | WAAPI `cancel()`、`isStatic()` 拆兩層、`[data-slide-scope]` 作用域＋縮圖、`speaker-view` 去重、活頁 `beforeprint` 列印、`_replace_slots` 平衡解析、`style-library.html` 對比與動線、`BEAT_MS`＋三配方回寫、`SKILL.md:116` 補風格憲法、`code-stage.css` 去紫 | 清除所有「現場播放會黑屏／隱形／跳兩頁／印壞／標竿破功」的致命地雷 |
| **批次 B（P1 引擎與模組閉環，9 項）** | 4 套動態套件（`story` 翻折、`counsel` 滾輪與 FLIP 縮放、`apple` 拖曳縮放與競態、`workday` rAF 與 `scaleX`）、`data-step` 聯動、Magic Move＋修飾鍵、`device-frame.css`、4 支模組 CSS 接 `html[data-mode]`、Layer 1 鎖定／390px `#ctrl-bar`／`visual-flair` 燈箱、`fit.js`、`assemble.py` 掃描與 `--sheet` | 讓動態手感、三層模組化與 390px／縮放螢幕表現 100% 兌現規格 |
| **批次 C（P1/P2 品管與上限升級）** | `check.mjs`（去框頁免罰、視覺指引時序檢核、活頁列印與 390px 實測）、`lint.py`（`director.archetype` 相鄰檢查、HTML 字數）、`oklch.py`（風格帶＋全色檢核）、`templates/deck.css` 字體聲音與中文零負字距、`counsel` `var(--radius)` 與 P2 細節 | 讓雙門檻品管真正抓得住上下限，且不反向懲罰高工藝去框頁 |
