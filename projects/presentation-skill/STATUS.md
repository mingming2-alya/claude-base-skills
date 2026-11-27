# 狀態：presentation-skill（deck-architect）

> **最新接手點（2026-11-27｜主柱一（Step 1 架構）第一性原理複查，待使用者決定修補範圍）**：
>
> - 使用者擔心「第一步的架構做錯了，後面都要從頭來過」，要求取得最新版本（`38ed5df`）後讀完全部狀態紀錄再檢查一次。v4.8.2 已補的六項不重複，另找到 **7 項還沒補到的缺口**（全文：`inputs/pillar1-review-v490.md`）：
>   1. 【高】使用者腦中的講法沒有被問：Round 0 只問手邊的檔案；v1 第二次迭代失敗正是框架在使用者心裡。
>   2. 【高】會決定骨架的硬限制太晚才問：誰上台、誰能否決結構、指定章節或模板、議程位置、會後是否寄出，都要在 1a 問；現在必放與禁用在 1b。
>   3. 【高】三個候選缺一把共同的尺，證據夠不夠要到 1b 才知道：關卡 1a 前加比較表（主受眾第一個問題在哪章被回答、證據就緒度、時間頁數、前提假設、用到的種子）。
>   4. 【高】逐頁清單（題目＋內容形狀＋視覺主角）沒有讓使用者確認：v3.0 實測的教訓是內容形狀要在 storyboard 確認。
>   5. 【中】做到一半才發現架構要改，沒有便宜的改法：補「架構變更回路」，並在 1a 標出改了最貴的四個決定。
>   6. 【中】現行 Step 1 還沒在真實內容上跑過：Grill 在 v1 之後重寫六輪；建議先把 v1 四案改寫成虛構情境回放，再做真實 PK。
>   7. 【低】主題類型總表少了使用者常做的「成長」與「期許／動員演講」。
> - **下一步**：用表單請使用者決定修補範圍、逐頁清單的確認方式、驗證方式與「成長」類的意思；修完再驗證，然後真實簡報 PK。
> - 備註：本機另有一份 11-26 未推送的 v4.9 修補（已被遠端 v4.8.1／v4.9.0 涵蓋），收在 git stash，不推。
>
> **前一段（2026-11-26｜`deck-architect` v4.9.0 主柱二全量檢修 22 項全數收官 ✅）**：
>
> - **已完成主柱二全部 22 項稽核修補（批次 A＋B＋C，見 `inputs/pillar2-audit-v482.md`）**：
>   - **批次 A（P0 急診）**：`runtime.js` WAAPI `fill:'forwards'` 播完與打斷全清零（消除 `shock` 黑屏、`iris`/`sheet-up` 回翻隱形）＋`isStill()` vs `isReducedMotion()` 正交拆層（`B`/減少動態不再癱瘓 `G`/`A`/`L`/`S` 與互動控件）＋`BEAT_MS` 重校 `{1:120, 2:1480, 3:2840, 4:4200}`（保留 0.76s 靜止閱讀窗＋支援 `data-beat-gap`）＋活頁 `beforeprint`/`afterprint` 全步展開與復原；`assemble.py` 以 `[data-slide-scope="s-N"]`（根節點 `.slide[data-slide-scope="s-N"]`）取代 `#s-N` 並補齊裸選擇器／`@keyframes` 作用域＋`grid-overview` 移除 `display: flex !important` 讓總覽縮圖樣式 100% 保真；`assemble.py` `_replace_slots` 改平衡 `<div>` 掃描（不再依賴未記錄 `<!-- /slot -->`）；`speaker-view.js` 採 BroadcastChannel 優先＋`seenCmdIds` 去重消除雙發跳兩頁；`code-stage.css` `.tok-kw` 去除禁用紫（改 `#F87171`/`#B42318`）；`SKILL.md` Step 4 分身補回 `styles/<selected>.md`；`style-library.html` 四卡淺深雙底對比／≥18px／Apple 深色玻璃與左動作→右結果動線／Illustration `motion-story` 立體書翻折全數修復；`recipes/{bento-causal,linked-diagram,interactive-proof}.md` 完整回寫 Phase B.3.1/B.3.2 時序、語意聚光與平衡版面。
>   - **批次 B（P1 引擎與模組閉環）**：`runtime.js` 接通 `--enter-easing` 與 `DECK.motion` 軸線運鏡、`[data-transform-at]` 移入 `runPrimitives()`、`setStep()` 清理 focus、鍵盤搶先接管與 `metaKey||ctrlKey||altKey` 過濾、Magic Move 防誤量與漸層字保護；4 套風格動態套件修補（`story-kit` `.is-folded` 瞬時歸位與 `.cr-typing.is-on`、`counsel-kit` 滾輪延遲＋FLIP 除舞台縮放＋`rr-anchor`＋GPU `scaleX`＋離頁清 `rack-focus`、`apple-kit` 疊卡除縮放防競態＋DOM 保留式 `spotlight-sweep`/`colorize-wipe`、`workday-kit` 雙層 rAF 追蹤＋GPU `scaleX`＋離頁收合 `bento-expand`）；`device-frame.css` 補齊 `.device-phone`/`.device-tablet`；4 支模組 CSS（`code-stage`/`live-controls`/`media`/`coverflow`）接通 `html[data-mode]`；Layer 1 `hasNavLock()` 互斥、`annotator` 雷射不鎖死、390px `#ctrl-bar` 與 `#deck-annotator-bar` 零裁切、`visual-flair` 燈箱作用域與去重 `id`＋光暈除縮放；`fit.js` `data-fit-base-px` 與自由畫布 `phrase` 自動分句；`assemble.py` 去註解／單雙引號／非根 `data-fx` 警告／確定性排序／未用 `meta.modules` 警告／`--sheet` `style_css`＋真 `tabs`＋媒體路徑重寫。
>   - **批次 C（P1/P2 品管與上限升級）**：`check.mjs` 升至 **17 項**（新增 WAAPI 防鎖死、Check 6 拍長／偷跑／SVG 線點時序、Check 12 `G` 縮圖保真、Check 15 390px `#ctrl-bar` 實測、Check 17 活頁 `beforeprint`/`afterprint`、Liveliness 去框編輯頁免罰與擴充控件偵測、OKLCH 近似純黑白警告）；`lint.py` 補自由畫布 HTML 字數、`director.archetype` 相鄰多樣性、`keynote` 同極性連頁警告；`oklch.py` 補 `L < 0.12`/`L > 0.992` 近似純黑白、`bg`/`bg2`/`alert` 禁紫與 `--style` 風格帶檢核；`templates/deck.css` 載入三語音字體（含 `Noto Serif TC`）＋中文零負字距＋列印上邊距歸零；`counsel` 0px `--card-radius`/`--ctrl-radius` 貫徹至模組與配方；P2 修補跑馬燈無縫銜接、`sound-ab` `loadedmetadata` 續播、彩帶吃主題色票。
> - **驗證結果**：Python 專項單測 `27/27` 全過；無頭 Chromium CDP 瀏覽器實測 `34/34` 全過（含 `style-library.html` 淺深雙底 8/8 零 `<18px` 零 WCAG 違規＋26/26 引擎／講者／模組／套件實測，零 JS 錯誤）；全 5 份 v4 範例重跑 `lint.py`＋`assemble.py`＋`check.mjs --jpg --motion` 全 0 ❌（`v48-regression` `5.12:1`、`v45-modular-demo` `4.84:1`、`v44-keynote-demo` `4.53:1`、`v4-alive-demo` `4.70:1`、`v4-demo` `4.81:1`）＋`v4-demo/samples --sheet` 3 張全過＋`v4-alive-demo/brief.md` 0 錯 0 警；重打包 `outputs/deck-architect.skill`（83 檔，361.0 KB，SHA-256 逐位元一致）。
> - **下一步**：主柱一（v4.8.2）與主柱二（v4.9.0）檢修皆已全數收官，待使用者提供一份**真實簡報需求**跑完整 Step 1a→Step 6 PK 驗證，跑完再決定是否進 Phase D。
>
> - **前一段（v4.8.2 主柱一六項修補，`30dc93b` ✅）**：補齊 Round 0 起手三分流＋Proposal-First、主／次受眾分層、30 秒口述邏輯鏈（Story Spine）＋逐章頁數配額、架構級排除清單（Out of Scope）、Step 1b→1a 合法回退三觸發、Step 4 分身補回 `brief.md` 第 1／8 節上下文。
> - **前一段（v4.8.1 外部稽核修補定案 ✅）**：
>
> - 依外部稽核評估（`inputs/external-audit-c2bfaf8-review.md`）與使用者拍板（「好的請修改！」），**完成 13 項有效修補**（保留 `grid-overview.js` 刪 `id` 實測無礙，維持標準模式三候選含破框）：
>   1. **P0 底色極性與模板修復**：`shell.css` 改 `:where(:root)` 並補 `:where(html[data-mode="light"|"dark"])` 零權重串接 `--light-*`/`--dark-*`（不破壞舊版 `deck.css` 直接覆寫 `:root`）；`templates/deck.css` 換為 `oklch.py` 驗證過的高對比 `#hex`（≥ 5.90:1），且 `top-bar` 頂列留白（124/156px）嚴格限定正文無內嵌導航頁，不再誤推封面／震撼／結尾；`check.mjs` 新增 `meta.mode` 根變數極性防呆＋可見 `#nav`/`#tabs` 像素對比與邊界檢查。
>   2. **P0 自由畫布約束把關**：`lint.py` 新增 `base_dir` 掃描自由畫布 `slides/*.html`（地雷詞 `forbidden` 報 `[ERROR]` 並阻斷 `assemble.py`、`must_include`/`limitations` 納入 HTML 可見文字、繁中／過場語／「你們」／多處 `<mark class="em">` 檢查）。
>   3. **P1 腳本啟動順序與首頁進場**：`assemble.py` 改為 `DECK → runtime_js → module_js → slide_js → window.__deck.boot()`，頁內腳本可安全存取 `window.__deck.stage` 並收到首頁 `deck:slideenter`；`runtime.js` 拆離轉場與首頁進場，live 打開即播首頁進場，`?still=1`/低耗電/降動效維持瞬切終態。
>   4. **P1 Step 3b 片段樣張與三組配色閉環**：`assemble.py --sheet` 自動把片段樣張套殼成 `.preview/<file>`（沿用 `shell.css` + `deck.css` + 按需模組 + `storyboard.yaml` 導航）並渲染 `manifest.json` 的 `palettes` 三欄 OKLCH 色票卡；`check.mjs --sheet` 自動載入 `.preview/<file>?still=1` 實測（完整相容舊版獨立 HTML 樣張）；`assemble.py` 加入 `_scope_slide_css()` 防止樣張昇格進 `slides/` 時外洩 `html/body/*` 全域重設。
>   5. **P1/P2 引擎與細節補強**：`fx/core.js` 透過 1×1 `<canvas>` 像素讀取支援 `oklch()`/`color-mix()`/`hsl()`；`runtime.js` 修正 `Home`/`End` 留在主線頁不跳入附件；`speaker-view.js` 改以主線頁數為分母、附件顯示「附件」；`counsel-kit.css` `rack-focus` 改零陰影 crisp 外框符合 `styles/counsel.md`；移除廢棄永動 `.flow-token`；`assemble.py` 補上 `keynote` `ambient-fx > 2` 警告。
>   6. **P2 規格與圖鑑口徑收斂**：`style-library.html` 4 張卡全補「適配主題」列並與 `styles/index.json` `signature_motions` 100% 對齊；`lint.py` 5 章以上降為 `[WARN]`、`pillars` 排除 `unlisted` 章節、`lint_brief()` 用英文字邊界防誤判且 `briefing` 種子寫「無」不再重複警告；`grill.md`/`SKILL.md`/`CLAUDE.md` 區分收斂型（標推薦附理由）與發散型腦力激盪（不標推薦防錨定）；`apple.md`/`index.json`/`apple-kit.css` 移除舊「擺動」口徑；`modules-catalog.md` 釐清 `flow-carousel="chat"` 與 `data-chat-replay` 分工；`outputs/style-specs/README.md`、`presentation-principles.md`、`ROADMAP.md` 標明歷史封存並指向 `outputs/deck-architect/styles/`。
> - **驗證結果**：5 份 v4 範例全部重組並通過 `lint.py`（0 錯）與 `check.mjs --jpg --motion`（零 ❌）：`v48-regression` 9 頁全過（最低對比 `5.12:1`，16 種原語，風格契合 3/3）、`v45-modular-demo`（`4.84:1`）、`v44-keynote-demo`（`4.53:1`）、`v4-alive-demo`（`4.70:1`）、`v4-demo`（`4.81:1`）＋ `v4-demo/samples --sheet` 3 張全過；另跑 26 項 v4.8.1 專項測試 26/26 全過；`v4-alive-demo/brief.md` 0 錯 0 警。
> - **下一步**：完成主柱二（視覺引導／靜態／動態／模組化注入）全歷史深度體檢，接著拿一份**真實簡報**從 Step 1a 跑到成品（PK 驗證主柱一顧問品質與成品生動度），跑完再決定是否進 Phase D。
>
> **前一段（2026-11-26｜`deck-architect` v4.8 最終檢查定案 ✅）**：
>
> 1. **依兩大主柱逐檔檢查後定案（全部經互動表單拍板）**：
>    - **主柱邊界（原則 #32）**：每個決定等它需要的資訊到齊才做。主柱一只決定內容與場合（架構、故事種子、說服載體、`stage_mode`，播放方式與環境當事實記下）；明暗、去框比例、導航、氛圍效果、版型配方與轉場一律在 **Step 3a 選定風格時**才決定，Step 2 的 `director` 只寫視覺主角 `hero`，選完風格再由 Agent 補 `archetype`／`choreo`／`surface`。說服載體反過來限制可選風格。
>    - **故事種子（原則 #33）**：Step 1a 提敘事候選前，先問使用者最想講的 1–3 個時刻、案例、畫面或原話，三個候選都圍繞它們。
>    - **每個建議都要附理由（原則 #34，使用者補充）**：任何步驟的建議都要說明為什麼，理由扣回這份簡報的事實。
>    - **主題類型統一成一張表**：`references/contexts.md` 第二節〈主題類型總表〉是標竿盲點掃描與風格推薦的唯一來源；`stage_fit` 只標常用場合、不再壓暗其他風格。
>    - **可檢查產出＋關卡拍板**：ROADMAP 專案原則改寫；`lint.py brief.md` 檢查顧問流程有沒有留下產出，品質由關卡 1b 的使用者判斷。
>    - **生動度稽核**：11 個風格動態原語分開計數，並新增「風格契合」。
> 2. **引擎問題修復**：分頁聚光 token（修換頁卡第 1 拍）、`check.mjs` 瀏覽器像素顏色換算（修 OKLCH 誤判）、離線字體改列提示、新增 `templates/deck.css` 與 `examples/v48-regression/`。
>
> 主軸文件是 `ROADMAP.md`，執行紀錄在 `LOG.md`，專案規則在根目錄 `CLAUDE.md`。

_最後更新：2026-11-27_

## 新對話先做的事

1. 確認在 `presentation-skill-generation` 分支：`git branch --show-current`。不在的話先 `git fetch origin presentation-skill-generation && git checkout presentation-skill-generation`。
2. 讀這份檔案與 `ROADMAP.md`。需要背景時，再讀 `LOG.md` 的最後幾段。
3. 守住 `CLAUDE.md` 的三條規則：
   - 每個段落結束就同步：`STATUS.md`、`LOG.md`、commit、push。
   - Stop hook 會檢查有沒有沒推的變更。
   - **所有要問使用者的問題一律用互動表單（AskUserQuestion）**。每題能單獨看懂，題目互不依賴，一題最多 4 個選項；收斂型決策題把推薦選項放第一個標「（推薦）」並寫理由，發散型腦力激盪題（如故事種子）不標「（推薦）」避免錨定。
4. 驗證腳本：`scripts/lint.py` 可檢查 `storyboard.yaml`（含自由畫布 `slides/*.html` 約束、字數、`director.archetype` 與語言）與 `brief.md`；`scripts/check.mjs` 支援 Playwright 與系統 Chromium CDP 自動退路，加 `--motion` 可執行最多 **17 項**動態與行動實測＋生動度稽核（含 WAAPI 防鎖死、聚光與線點時序、`G` 縮圖保真、390px `#ctrl-bar`、活頁 `beforeprint`/`afterprint`、去框編輯頁免罰與風格契合）。改動底盤或腳本後，先跑 `outputs/examples/v48-regression/`（見該資料夾 README）。執行 `lint.py`/`assemble.py` 若遇 pyenv 缺 PyYAML，改用 `/usr/bin/python3`。

## 階段與進度

| 階段 | 內容 | 狀態 |
|---|---|---|
| 0–1, 2a–2b | 市場研究、v1 四次真實迭代方法論、12 款風格清單、OKLCH 用色系統、首批 3 款規格與插畫 15 種畫風淺深雙底 | ✅ |
| **Phase A** | **地基對齊與輕底盤 v4**：輕底盤＋自由畫布＋商務元件、統一像素 WCAG `check.mjs`、`oklch.py --palette`、清完 11-14 待辦、首批 Style DNA | ✅ |
| **Phase A+ 補課** | **靜態美感上限重練＋協調感精修＋去小字手術**：6 頁全通過 `4.70`–`7.52:1`，定案四大視覺工藝與原則 #26 | ✅ |
| **Phase B 預研** | **動態技術路線研究與定案**：實查 14 個 GitHub Repo（`inputs/motion-research.md`），定案 **方案 1｜分層混合** | ✅ 定案 |
| **Phase B / B.2 / B.3** | **反寫靜態工藝與原則 #26 ＋ 60fps 動態引擎 ＋ 視覺指引規格與原語（v4.3）**：`v4-alive-demo` 8 頁靜態＋7 項動態實測全過 | ✅ |
| **Phase C.1** | **真實旗艦標竿對照 ＋ v4.4-spec 規格與 Grill v2 全面升級**：三段式舞台光譜、設計樹 Grill v2（融合 `mattpocock/skills`）、原則 #27–#30、9 份核心規格反寫並重打包 | ✅ |
| **Phase C.2** | **v4.4→v4.9.0 全系統升級、兩大主柱終審與全量檢修**：主柱一（Round 0 起手三分流、主／次受眾、30 秒邏輯鏈、Out of Scope、1b→1a 回退、brief＋HTML lint）＋主柱二 22 項檢修（WAAPI 防鎖死、`isStill`/`isReducedMotion` 正交、`[data-slide-scope]` 作用域與 `G` 縮圖保真、`speaker-view` 去重、活頁列印、平衡換圖、`BEAT_MS` 與三配方／圖鑑校正、4 套件與模組極性／縮放）＋17 項動態行動實測 | ✅ 定案 → 下一步：真實簡報 PK |
| **Phase D** | **多元風格庫全面成形**：補齊其餘 8 款「靜態×動態一體」Style DNA（各含淺深規則與風格動態套件並上架 `style-library.html`）、整理插畫 15 種畫風配方表、外觀帳本 | 未開始（等真實簡報 PK 後決定） |
| **Phase E** | **交付、修改閉環與記憶**：成品按 `E` 改字回寫、畫面上點選留言修改、文字可編輯 PPTX 匯出、品味記憶與獨立評審、評估搬進 `skills/` 正式安裝（註：雙螢幕講者模式 `S` 鍵已提前於 v4.5 完成） | 未開始 |

## 已經定案的事

| 決定 | 日期 | 寫在哪裡 |
|---|---|---|
| 風格清單十二款（插畫場景、積木構成、水彩水墨、Apple 發表、書卷刻本、顧問報告、孔版小誌、摩登金、日常工作款、攝影雜誌、年輕潮流、在地懷舊） | 11-18 | `inputs/style-list-v5.md`、`styles/index.json` |
| 首批四款完整「靜態×動態一體」Style DNA：顧問報告、Apple 發表、插畫場景（含 15 種畫風）、日常工作款（現代 Bento） | 11-23 / 11-26 | `outputs/deck-architect/styles/`、`assets/style-library.html`、`assets/modules/motion/` |
| **用色鎖規則、不鎖色碼、不放品牌色、全部風格淺深雙底** | 11-19 | 原則 #17–19、`styles/color-system.md` |
| **風格本質固定，元素、用色、介面依內容調整；變暗不等於夜晚** | 11-19 | 原則 #21–22、`styles/illustration.md` |
| **多元風格採生成式 Style DNA**，放棄原 2c 19×4 靜態排法矩陣 | 11-19 | 原則 #23、`ROADMAP.md` |
| **三層按需架構＋亂中有序治理**：Layer 0 輕底盤（Overlay 優先級棧＋自動搶先接管＋`unlisted: true`＋`boot()` 生命週期）、Layer 1 講者工具（`G`/`A`/`L`/`S`）、Layer 2 11 項內容模組＋4 套風格動態套件、軟性 `[WARN]` | 11-19 / 11-26 | 原則 #24、`scripts/{deck_model.py,lint.py,assemble.py}`、`references/modules-catalog.md` |
| **兩大主柱總收斂**：主柱 1「架構與內容」（顧問標竿盲點掃描＋不循規蹈矩敘事腦力激盪＋Step 1a/1b 追問深挖與方案建議）；主柱 2「排版與呈現」（視覺吸引與引導＋依內容主題配對靜態×動態極致風格，再以場合校準） | 11-26 | 原則 #31、`SKILL.md` |
| **主柱邊界：每個決定等它需要的資訊到齊才做**（呈現層決定延到 Step 3a；Step 2 只寫 `hero`；說服載體回頭限制風格） | 11-26 | 原則 #32、`SKILL.md`、`references/{grill.md,samples.md,contexts.md,modules-catalog.md}`、`templates/{brief.md,storyboard.yaml}` |
| **故事種子先於敘事候選**（發散型腦力激盪不標「推薦」防錨定） | 11-26 | 原則 #33、`references/{grill.md,structure.md}`、`templates/brief.md`、`CLAUDE.md` |
| **每個建議都要附理由**（使用者補充） | 11-26 | 原則 #34、`SKILL.md`、`references/{grill.md,samples.md,contexts.md,structure.md}` |
| **主題類型總表是唯一來源**；`stage_fit` 只標常用場合、不壓暗；`style-library.html` 每卡標示適配主題與對齊原語 | 11-26 | `references/contexts.md` 第二節、`styles/index.json`、`assets/style-library.html` |
| **可檢查產出＋關卡拍板**（取代「不能檢查的規則不寫」）；真實簡報 PK 只用在開發階段 | 11-26 | `ROADMAP.md` 專案原則、`scripts/lint.py`（brief＋自由畫布 HTML 檢查） |
| **生動度稽核分開計數＋風格契合** | 11-26 | `scripts/check.mjs` |
| **下一步先跑真實簡報 PK，再決定 Phase D** | 11-26 | 本檔、`ROADMAP.md` |
| **預設零等待全自動產出＋可選 `IMAGE_UPGRADE.md`** | 11-23 | 原則 #25、`scripts/assemble.py` |
| **四大靜態視覺工藝標準＋原則 #26（含三項合法豁免）＋靜態×動態融合第一鐵律** | 11-23 / 11-26 | 原則 #26、`references/{presentation-rules.md,motion-system.md,visual-guidance.md}` |
| **視覺指引（主柱二核心）＋ Phase B.3 六大 Takeaway 固化** | 11-23 / 11-26 | `assets/runtime.js`、`assets/modules/motion/*.{css,js}`、`references/visual-guidance.md`、`scripts/check.mjs` |
| **三段式舞台光譜（`stage_mode`）**：1a 拍板場合，3a 依場合 × 風格校準明暗、去框與導航 | 11-25 / 11-26 | 原則 #27、`references/contexts.md` |
| **雙軌節拍＋雙軌多媒體＋三層按需引擎** | 11-25 / 11-26 | 原則 #29–30、`assets/shell.css`、`assets/runtime.js`、`assets/presenter/`、`assets/modules/` |

## 交付物地圖

| 路徑 | 內容 |
|---|---|
| `outputs/deck-architect/` | **v4.9.0 完整版 Skill 原始碼（83 檔）**：主柱一顧問流程（Round 0 起手三分流、主／次受眾、30 秒邏輯鏈、Out of Scope、1b→1a 回退）＋主柱二三層按需引擎（WAAPI 防鎖死、`isStill`/`isReducedMotion` 正交、`[data-slide-scope]` 作用域、活頁 `beforeprint` 列印、`boot()` 與 `meta.mode` 零權重串接）＋4 套風格動態套件＋`templates/deck.css` 三語音＋`style-library.html` 雙底達標＋Step 3b 片段樣張＋brief／storyboard／HTML 自由畫布 lint＋17 項動態行動實測＋雙門檻 Liveliness 稽核 |
| `outputs/deck-architect.skill` | v4.9.0 打包檔（361.0 KB，83 檔，零 `__pycache__`，SHA-256 逐位元一致） |
| `outputs/examples/v48-regression/` | v4.8–v4.9 引擎回歸測試簡報（4 套套件 11 原語、`unlisted`、聚光復原、`templates/deck.css`；9 頁全過，最低 `5.12:1`）。改底盤或腳本後先跑這份 |
| `outputs/examples/v4-alive-demo/brief.md` | 示範用 brief（依既有虛構範例事後補寫，示範格式與 brief lint，不是主柱一實測紀錄） |
| `outputs/examples/v45-modular-demo/` | v4.5/v4.6 三層引擎與全部新／升級模組虛構技術示範（6 頁，最低對比 `4.84:1`） |
| `outputs/examples/v44-keynote-demo/` | Phase C.2 v4.4 旗艦五大新能力虛構示範（7 頁，最低對比 `4.53:1`） |
| `outputs/examples/v4-alive-demo/` | Phase B.3.2 視覺指引＋60fps 全動態互動單檔示範（8 頁，最低 `4.70:1`；聚光復原 5 頁全過） |
| `outputs/examples/v4-visual-benchmark/` | 靜態美感上限重練標竿・去小字極致留白版（6 頁全通過） |
| `outputs/examples/v4-demo/` | Phase A 初版虛構端到端範例（8 頁，最低 `4.81:1`；`samples/` 舊版獨立樣張 `--sheet` 相容通過） |
| `outputs/examples/{example,annual-section,layout-catalogue,progress-overview,test4}/` | v3 時代舊範例（如 `theme: editorial` 等舊欄位），只保留參考，不代表現行流程 |
| `inputs/presentation-principles.md` | 使用者的簡報原則，第 1–34 條（被取代的舊條目已加註） |
| `inputs/pillar2-audit-v482.md` | v4.8.2 主柱二（視覺引導／靜態／動態／模組化注入）全歷史與程式碼＋Chrome CDP 深度稽核報告（22 項已於 v4.9.0 全數修補收官） |
| `inputs/external-audit-c2bfaf8.md`、`inputs/external-audit-c2bfaf8-review.md` | v4.8 外部唯讀稽核報告與逐條評估（13 項有效項目已於 v4.8.1 全數修補） |
| `inputs/modular-capabilities-audit.md` | 10 個 GitHub 簡報 Skill 二次盤點：按需模組深化與漏網 Nice-to-Have 報告 |
| `inputs/phase-c-teardown-learnings.md` | Phase C 旗艦標竿對照與 `mattpocock/skills` 始祖回溯研究筆記（去敏版） |
| `inputs/motion-research.md` | Phase B 動態技術路線研究（14 個 GitHub Repo 實查，已定案方案 1） |
| `outputs/style-specs/`（歷史封存）、`outputs/color-modes/`、`outputs/illustration-integration/`、`outputs/style-moodboard-v5/` | 首批風格歷史初版、淺深雙底配色、插畫 15 畫風融合與 12 款風格視覺錨點（現行正式版在 `outputs/deck-architect/styles/`） |

## 待使用者決定（適時用表單確認）

- **主柱一複查的修補範圍**（`inputs/pillar1-review-v490.md` 七項）：全部修，或只修四項【高】。
- **逐頁清單在哪裡確認**：併進關卡 2a 表單當獨立一題，或獨立成一個關卡。
- **Step 1 改完怎麼驗證**：v1 四案虛構回放（全新 agent 跑到關卡 1a）再真實 PK，或只做其中一種。
- **「成長」類簡報指哪一種**：補主題類型總表時需要。
- **真實簡報 PK 的題目**：由使用者提供一份真實需求（建議挑近期真的要講的簡報，例如年度成果、專案提案或分享），從 Step 1a 跑到成品驗證主柱一與主柱二。
- **Phase D 的動態設計**：`styles/index.json` 裡其餘 8 款規劃中的風格，`kit` 欄寫沿用現有套件，但招牌動態橫跨多套（例如 `pop-youth` 寫 `motion-story`，招牌卻是 `depth-deck`、`rank-race`）。進 Phase D 時要決定：每款做自己的招牌原語，或明訂可跨套件組合。
- 埃及壁畫、瑪雅抄本是否要生圖做升級插槽實測。
- 日式留白之後要不要在 Phase D 當獨立一款。
- `deck-architect` 什麼時間點搬進 `skills/` 由 `install.sh` 全域安裝（建議真實簡報 PK 或 Phase E 後）。
- git 歷史殘留的一組無上下文步驟數字是否要再改寫歷史。

## 製作與驗證的眉角

- **生圖提示避坑（2026-11-20 實測）**：AI 生圖提示詞不可寫 `"left 60% ... right 40% ..."`，容易被誤解成分割雙圖（diptych）產生垂直硬接縫！改用單一連續場景空間描述即可生成無接縫攝影。
- **「零等待」不等於「廉價幾何 SVG 假裝插畫」**：插畫／黏土／攝影類風格要用真實無字 AI 底圖（或明確提示生圖）；純程式頁則靠 Bento 儀表板、實景 UI、數據單位矩陣、微光景深拉滿質感。
- **CSS 簡寫避坑**：`font:` 簡寫裡不可寫 `inherit` 當字體名（會整條失效退回 16px）；改用明確的 `font-weight`／`font-size`／`line-height` 或 `var(--font-body)`。
- **漸層字像素對比檢查**：`check.mjs` 會對漸層字加上暫時隱藏類 `.__check_hide_grad`（`opacity: 0`）再截底圖，才能量到真正的背景舞台。
- **顏色一律交給瀏覽器換算（2026-11-26）**：`check.mjs` 與 `assets/modules/fx/core.js` 量文字／特效顏色時皆透過 1×1 `<canvas>` 取 sRGB，不再只靠字串正規解析；OKLCH、`color(srgb …)`、`color-mix()` 才量得準。漸層字的 OKLCH 色標另由 Node 換算。
- **零權重 `meta.mode` 串接（2026-11-26 v4.8.1）**：`shell.css` 以 `:where(:root)` 與 `:where(html[data-mode="light"|"dark"])` 把 `--bg`/`--fg`/`--accent` 接到 `deck.css` 的 `--light-*`/`--dark-*`，讓無 `data-surface` 的封面／結尾／內建頁自動吃整份簡報的極性與色票，同時維持舊版直接覆寫 `:root` 的向後相容。
- **腳本載入與 `boot()` 契約（2026-11-26 v4.8.1）**：`assemble.py` 固定按 `DECK → runtime_js → module_js → slide_js → window.__deck.boot()` 順序輸出，確保所有模組與頁內腳本在首頁 `deck:slideenter` 觸發前已就緒。
- **`[data-slide-scope="s-N"]` 作用域契約（2026-11-26 v4.9.0）**：`assemble.py` 捨棄會碾壓 Layer 2 的 `#s-N` ID 選擇器，改為根節點 `.slide[data-slide-scope="s-N"]`（與 `deck.css` `.slide.canvas` 同權重靠後勝出）與子孫 `[data-slide-scope="s-N"] .x`，同時自動處理 `html[...]`/`body.low-power` 祖先條件、裸選擇器與 `@keyframes` `sN_` 前綴；`grid-overview` 刪 `id` 仍保留 `data-slide-scope`，縮圖樣式 100% 保真。
- **`isStill()` vs `isReducedMotion()` 正交分層（2026-11-26 v4.9.0）**：`isStill()` 僅對 `?still=1` 無頭截圖為真（鎖互動、藏 Chrome）；`isReducedMotion()` 對 `?still=1`、`B` 省電與 `prefers-reduced-motion: reduce` 為真（只停裝飾動效、改瞬切終態，完整保留 `G`/`A`/`L`/`S` 與互動控件）。
- **WAAPI `fill: 'forwards'` 必須主動 `cancel()`（2026-11-26 v4.9.0）**：WAAPI `forwards` 權重高於 inline style；`runtime.js` 透過 `persistedAnims` 與 `cancelElementAnims()` 在收尾與打斷時徹底清零，避免 `shock` 黑幕卡死或 `iris`/`sheet-up` 回翻隱形。
- **自由畫布 HTML 同受 `lint.py` 把關（2026-11-26 v4.8.1 / v4.9.0）**：`lint.py` 會掃描對應的 `slides/*.html` 可見文字（含去標籤／空白之字數統計與地雷詞 `[ERROR]`）並檢核 `director.archetype` 相鄰多樣性。
- **聚光排程的 token 要分頁（2026-11-26）**：`runtime.js` 的聚光排程用每頁各自的 token（`WeakMap`），清前一頁不能動到下一頁；否則換頁後會卡在第 1 拍、其餘卡片一直壓暗。
- **配方要搭 `templates/deck.css`（2026-11-26）**：配方依賴 `.slide.canvas`、`.hd`、`.title`、`.sub`；`top-bar` 導航留白（124／156px）僅套用在無內嵌導航的 `[data-kind="content"]` 頁，不誤推封面／震撼／結尾；列印時頂部留白歸零。滿版分割頁（如 `editorial-drama` 型態 A）加 `nav: none`。
- **離線字體**：載不到 Google Fonts 時由系統字體頂替，`check.mjs` 只列提示；字體度量差異不再讓 `cover-inner`／`closing-inner` 誤報溢出（改由畫布邊界檢查）。
- **輕底盤零權重規則**：`shell.css` 對自由畫布子元素的預設 `z-index` 使用 `:where(...)` 零權重，絕不覆寫 `.back` 或投影片自訂定位。
- **SVG `<defs>` ID 隔離**：`assemble.py` 自動替每頁 `<defs>` 內的 `id` 加上 `s{idx}_` 前綴並同步改寫 `url(#...)`／`href="#..."`，防止多頁組裝後 `clipPath`／濾鏡撞名。
- **公開 repo 去敏規則**：所有範例從零虛構；真實標竿拆解只將抽象方法論寫進 `inputs/` 與 `LOG.md`，絕不提交內部公司名、專案代號、真實數據、個人資訊或大型二進位影音檔。
- **授權與引入外部動畫庫規則**：`op7418/guizang-ppt-skill` 與 `chuspeeism/dashi-ppt-skill` 為 **AGPL-3.0**（僅學架構概念，不抄碼）；`borjaperfra/beatdeck` 已實查 `LICENSE` 確認為 **MIT**；引入 GSAP 前必依 `rules/CLAUDE.base.md` 先說明為何原生 CSS／WAAPI 做不到並經使用者同意。
