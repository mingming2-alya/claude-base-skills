# 狀態：presentation-skill（deck-architect）

> **最新接手點（2026-11-27｜`deck-architect` v4.10.2：第二組回放的 4 項修補 ✅，下一步真實簡報 PK）**：
>
> - **使用者決定**（互動表單，四題都選推薦）：推薦不是使用者版本時補「你的版本＋補弱點」選項；Round 0 固定問架構硬限制、診斷延後到使用者說完講法；lint 與目錄頁兩個工具都修；修完直接拿真實簡報 PK。
> - **v4.10.2 改了什麼**（原則 #39–#40）：
>   1. 推薦的不是使用者的版本時，選架構那一題附「你的版本＋補掉最弱點」選項、寫出使用者版本好在哪；推薦依據的前提還沒驗證，就先問或寫成條件句（`references/grill.md` 節點群 B 第 8 項、`references/structure.md`、`SKILL.md` Step 1a 第 4 步）。
>   2. Round 0 用一題複選事實題問架構硬限制（誰上台、誰能要求改結構、頁數上限含不含封面與目錄、指定模板或章節、會後寄不寄），標準與快速模式都問；節點群 A 第 5a 項改為追問其餘（`grill.md`、`contexts.md`、`SKILL.md`）。
>   3. Round 0 只給事實，結構診斷與 Agent 的看法等使用者說完心中的講法再端出（`grill.md` 原則 4 與 Round 0、`SKILL.md`）。
>   4. `lint.py` 的 brief 欄位比對接受 `**欄位**（說明）：` 與 `**欄位：**` 兩種寫法；storyboard 新增 `meta.toc`（`auto`／`none`／`agenda`／`per-chapter`）覆寫自動目錄，`lint.py` 驗證值並在頁數算術與 `--outline` 跟著算（`scripts/{deck_model.py,lint.py}`、`templates/storyboard.yaml`、`references/presentation-rules.md`）。
> - **驗證**：
>   - 5 份範例 storyboard lint 與改版前一致；`v4-alive-demo/brief.md` 0 錯 0 警；四份回放 brief 的 lint 結果與改版前一致。
>   - 欄位寫法：示範 brief 改成兩種新寫法後，舊版 lint 報 2 個假錯誤，新版通過。
>   - `meta.toc`：`v48-regression` 副本預設仍 9 頁、無目錄頁；`agenda` 10 頁、1 頁目錄；`per-chapter` 11 頁、2 頁目錄，與 lint 頁數算術一致；非法值報錯。
>   - 重打包 `outputs/deck-architect.skill`（85 檔，379.5 KB，零 `__pycache__`，解壓後與原始碼逐檔一致）。
> - **下一步**：使用者提供一份近期真的要講的簡報需求，從 Step 1a 跑到成品（真實 PK）。真實資料不進公開 repo，只記去敏的過程與發現。
>
> **前一段（2026-11-27｜v4.10 第二組回放 v1 四案 ✅）**：
>
> - **和前一段的關係**：同一天兩個對話各自回放了 v1 四案。前一段是第一組（`inputs/v1-replay-v410.md`，已據此發布 v4.10.1）；這一段是第二組（`inputs/v410-replay-run2.md`），案例改寫與扮演設定不同，原始表單與 brief 都留在 `inputs/replay-v1-cases/`，可以重跑。
> - **做法**：每案派全新 agent，只拿到 v4.10 技能與使用者第一則訊息，跑 Round 0 到關卡 1a；Claude 照開跑前寫好的 `inputs/replay-v1-cases/persona.md` 扮演使用者。
> - **結果**：
>   - 和第一組一致：四案在關卡 1a 的骨架都和已知正確架構一致，沒有一案要在 1a 之後推翻。
>   - Round 0 都先問了心中的講法並列為候選 A；標準模式最晚第 2 輪問齊架構硬限制，兩案做了給主管的問卷。
>   - 到關卡 1a：標準模式 4–5 輪、16–19 題；快速模式 3 輪、9 題。
> - **v4.10.1 還沒處理的 4 項發現**：
>   1. 推薦偏向 Agent 的版本：標準模式三案都沒推薦使用者版本，其中兩案使用者版本才是已知正確；第一組的案一、案二也一樣。兩組合計 4 次，都要靠使用者反駁。
>   2. Round 0 先給結構診斷會錨定使用者；技能沒寫清楚診斷該在什麼時候給。
>   3. lint 欄位比對漏抓 `**欄位**（說明）：`。
>   4. 目錄頁由章數自動決定，不能手動指定。
> - **已由 v4.10.1 處理主因**：快速模式漏問總覽頁數，主因之一是當時的「≤5 題」上限；仍建議 Round 0 固定一題架構硬限制複選題。輪數建議維持。
> - **下一步**：使用者已用表單拍板，修補見最新接手點（v4.10.2）。
>
> **前一段（2026-11-27｜`deck-architect` v4.10.1：v1 四案盲測 4/4 命中 ＋ 修正快速模式題數上限矛盾與碎片簿 Matt 原文規則 ✅）**：
>
> - **已完成 v1 四案虛構化全新上下文盲測回放（`inputs/v1-replay-v410.md`）**：
>   - 四案完全去敏改寫為虛構情境（綠能科技新銳領導營、雲橋物流智慧排單助手、星辰電商數據平台組單章總覽、海風智造智慧工廠週進度與兩頁總覽），各派獨立全新上下文子代理（只讀 `outputs/deck-architect/` v4.10 與各自虛構檔，零歷史劇透）跑完 Round 0 → ⛔ 關卡 1a。
>   - **結果：4 / 4 案全數命中正確架構，v1 四次迭代全部歷史架構痛點零復發**：
>     - **Case 1（期許演講｜標準、`keynote` 15 分 ≤9 頁）**：前置 4 輪 12 題（含關卡 1a 共 5 輪 15 題）；自動產出 `fragments.md` (18 則)＋`questionnaire-執行副總.md` (3 題)；使用者因最弱點反駁暗場藏牌後，無縫延伸出 1:1 吻合原成品的四章 9 頁骨架（01 看見潛能 3 分 → 02 組織現況 1.5 分 86% 先肯定 → 03 打造強大團隊 7 分含轉折故事插槽／選育用留／導師陪帶 → 04 期待與傳承 2.5 分「我們……嗎？」反思）。
>     - **Case 2（工具推廣｜標準、`pitch` 10 分 嚴格 6 頁）**：前置 4 輪 12 題（含關卡 1a 共 5 輪 15 題）；Pre-Flight 自行核實 24→7 加總與未開通 ERP 邊界；Round 0 先問心中講法並列入候選 A；嚴守 `封面 1 + 總目錄 1 + 正文 4 = 6 頁`；自動產出 `questionnaire-研發.md` (3 題)；關卡 1a 進一步優化 Ch 4 三欄分工（凸顯規則檔準備）。
>     - **Case 3（年度成果單章｜標準、`briefing` 3–4 分 1 頁無附件）**：前置 4 輪 12 題（含關卡 1a 共 5 輪 15 題）；零劇透一眼診斷年初三欄並列與動作語言，主動問出「大簡報單章 1 頁無附件」硬限，整塊移除「客製需求」並獨立推導出與原採用版 100% 一致的 Top-Down 抽象層次軸（**戰略方向 → 商業價值 → 平台基座**），同時抓出 4,200 萬 vs 38 件口徑防禦與 7 組數字密度風險。
>     - **Case 4（定期進度回報｜快速、`briefing` 3 分 純 2 頁總覽＋填寫規範）**：前置 2 輪 7 題（含關卡 1a 共 3 輪 10 題）；Round 0 主動先要空白模板、確認早有 5 欄風險表故不動版面；全數抓出 12 案 3 案流水帳／2 案留白／8 案 `/` 含隱藏延誤與兩檔大類排序落差；產出純 2 頁總覽（頂端摘要、4 階段、風險燈號＋支援欄＋第 2 頁底部拍板區與跨頁防重複分工），超越原 v1-4 成品。
> - **已落地 v4.10.1 兩項修正並重打包**：
>   1. **消除快速模式舊上限與原則 #28 的矛盾**（`SKILL.md`、`references/grill.md`、`references/contexts.md`）：刪除寫死的「`1–2 輪（≤5 題）`」上限；快速模式改為靠「合併 1a＋1b、略過破框候選／候選比較／結構追問、合併低風險預設」縮短流程，**同樣遵循設計樹前沿、不設輪次與題數上限，前沿清空才停**（驗證了 Case 4 跑 3 輪 10 題先要齊模板再診斷其實才是正確做法）。
>   2. **依 `mattpocock/skills` `writing-fragments/SKILL.md` 原文補齊碎片簿三條規則**（`templates/fragments.md`、`references/grill.md`、`SKILL.md`）：① 只收「有機會活進最終簡報的原料」（不是聊天／表單回覆 log，不收純流程選項與 `1A/2A` 題號）；② 一個獨立想法各自成一則 `---` 條目，保留原話不改寫；③ 靜默追加，且**每次寫入前必先從磁碟重讀**，保留使用者在兩輪間的手動編輯。
>   - 驗證：零殘留舊上限、`SKILL.md` description 1020 bytes（≤1024）、`brief.md` 0 錯 0 警、`v48-regression` 與 `--outline` 0 錯、重打包 `outputs/deck-architect.skill`（85 檔，372.1 KB，SHA-256 逐位元一致）。
> - **下一步**：主柱一（v4.10.1＋v1 四案盲測 4/4 全中）與主柱二（v4.9.0 22 項全量檢修）均已完整就緒，待使用者提供一份**真實簡報需求**跑完整 Step 1a→Step 6 PK 驗證，跑完再決定是否進 Phase D。
>
> **前一段（2026-11-27｜`deck-architect` v4.10 主柱一深挖與架構把關 ✅，`9380c8f`）**：
> - 依 `inputs/pillar1-review-v490.md`（7 項缺口）＋ `inputs/mattpocock-elicitation-study.md`（10 項深挖機制）落地原則 #35–#38：Round 0 先問心中講法＋`fragments.md`、1a 硬限制＋`questionnaire.md`、同一把尺比較＋空殼雛形＋結構追問＋尚未確定清單＋最貴四決定、關卡附最弱點防被動同意、Step 2 後獨立 ⛔ 關卡 1c（`lint.py --outline`）、架構變更回路與主題總表補兩類；重打包 `outputs/deck-architect.skill`（85 檔，376.4 KB，SHA-256 逐位元一致）。
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
| **Phase C.2** | **v4.4→v4.10.1 全系統升級、兩大主柱終審、全量檢修與 v1 四案盲測回放**：主柱一（Round 0 心中講法與碎片簿、1a 硬限制與短問卷、同一把尺比較、結構追問、防被動同意、獨立關卡 1c、架構變更回路、移除快速模式題數舊上限、碎片簿對齊 Matt 原文三規則、v1 四案盲測 4/4 全中）＋主柱二 22 項檢修（WAAPI 防鎖死、`isStill`/`isReducedMotion` 正交、`[data-slide-scope]` 作用域與 `G` 縮圖保真、`speaker-view` 去重、活頁列印、平衡換圖、`BEAT_MS` 與三配方／圖鑑校正、4 套件與模組極性／縮放）＋17 項動態行動實測 | ✅ 盲測回放與 v4.10.1 過關 → 下一步：真實簡報 PK |
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
| **故事種子先於敘事候選**（v4.10 整合為素材碎片簿標 ⭐ 重點碎片；發散題不標「推薦」防錨定） | 11-26 / 11-27 | 原則 #33、#35、`references/{grill.md,structure.md}`、`templates/{brief.md,fragments.md}`、`CLAUDE.md` |
| **每個建議都要附理由**（使用者補充） | 11-26 | 原則 #34、`SKILL.md`、`references/{grill.md,samples.md,contexts.md,structure.md}` |
| **主柱一深挖與架構把關（參考 `mattpocock/skills`）**：先問心中講法＋碎片簿（只收活進成品的原料、一則一獨立想法、靜默追加且寫前重讀磁碟）、1a 硬限制＋問卷、同一把尺比候選＋空殼雛形＋結構追問、關卡 1a/1b/1c 附最弱點防被動同意、最貴四決定＋架構變更回路、標準／快速模式皆不設題數上限（前沿清空才停） | 11-27 | 原則 #28、#35–#38、`SKILL.md`、`references/{grill.md,structure.md,contexts.md}`、`templates/{fragments.md,questionnaire.md}`、`scripts/lint.py` |
| **主題類型總表是唯一來源**；`stage_fit` 只標常用場合、不壓暗；`style-library.html` 每卡標示適配主題與對齊原語 | 11-26 / 11-27 | `references/contexts.md` 第二節、`styles/index.json`、`assets/style-library.html` |
| **可檢查產出＋關卡拍板**（取代「不能檢查的規則不寫」）；真實簡報 PK 只用在開發階段 | 11-26 | `ROADMAP.md` 專案原則、`scripts/lint.py`（brief＋自由畫布 HTML 檢查＋`--outline`） |
| **生動度稽核分開計數＋風格契合** | 11-26 | `scripts/check.mjs` |
| **先回放 v1 四案再跑真實簡報 PK，之後才決定 Phase D** | 11-26 / 11-27 | 本檔、`ROADMAP.md`、`inputs/v1-replay-v410.md` |
| **預設零等待全自動產出＋可選 `IMAGE_UPGRADE.md`** | 11-23 | 原則 #25、`scripts/assemble.py` |
| **四大靜態視覺工藝標準＋原則 #26（含三項合法豁免）＋靜態×動態融合第一鐵律** | 11-23 / 11-26 | 原則 #26、`references/{presentation-rules.md,motion-system.md,visual-guidance.md}` |
| **視覺指引（主柱二核心）＋ Phase B.3 六大 Takeaway 固化** | 11-23 / 11-26 | `assets/runtime.js`、`assets/modules/motion/*.{css,js}`、`references/visual-guidance.md`、`scripts/check.mjs` |
| **三段式舞台光譜（`stage_mode`）**：1a 拍板場合，3a 依場合 × 風格校準明暗、去框與導航 | 11-25 / 11-26 | 原則 #27、`references/contexts.md` |
| **雙軌節拍＋雙軌多媒體＋三層按需引擎** | 11-25 / 11-26 | 原則 #29–30、`assets/shell.css`、`assets/runtime.js`、`assets/presenter/`、`assets/modules/` |

## 交付物地圖

| 路徑 | 內容 |
|---|---|
| `outputs/deck-architect/` | **v4.10.2 完整版 Skill 原始碼（85 檔）**：v4.10.2 補「你的版本＋補弱點」選項、Round 0 硬限制題與只給事實、`meta.toc`；主柱一深挖顧問流程（Round 0 心中講法與 `fragments.md`、1a 硬限制與 `questionnaire.md`、同一把尺比較、結構追問、關卡最弱點、獨立關卡 1c `--outline`、架構變更回路、標準／快速模式皆不設題數上限）＋主柱二三層按需引擎（WAAPI 防鎖死、`isStill`/`isReducedMotion` 正交、`[data-slide-scope]` 作用域、活頁 `beforeprint` 列印、`boot()` 與 `meta.mode` 零權重串接）＋4 套風格動態套件＋`templates/deck.css` 三語音＋`style-library.html` 雙底達標＋17 項動態行動實測＋雙門檻 Liveliness 稽核 |
| `outputs/deck-architect.skill` | v4.10.2 打包檔（379.5 KB，85 檔，零 `__pycache__`，解壓後與原始碼逐檔一致） |
| `outputs/examples/v48-regression/` | v4.8–v4.9 引擎回歸測試簡報（4 套套件 11 原語、`unlisted`、聚光復原、`templates/deck.css`；9 頁全過，最低 `5.12:1`）。改底盤或腳本後先跑這份 |
| `outputs/examples/v4-alive-demo/{brief.md,fragments.md}` | 示範用 brief 與素材碎片簿（依既有虛構範例事後補寫，示範格式與 v4.10 brief lint，不是主柱一實測紀錄） |
| `outputs/examples/v45-modular-demo/` | v4.5/v4.6 三層引擎與全部新／升級模組虛構技術示範（6 頁，最低對比 `4.84:1`） |
| `outputs/examples/v44-keynote-demo/` | Phase C.2 v4.4 旗艦五大新能力虛構示範（7 頁，最低對比 `4.53:1`） |
| `outputs/examples/v4-alive-demo/` | Phase B.3.2 視覺指引＋60fps 全動態互動單檔示範（8 頁，最低 `4.70:1`；聚光復原 5 頁全過） |
| `outputs/examples/v4-visual-benchmark/` | 靜態美感上限重練標竿・去小字極致留白版（6 頁全通過） |
| `outputs/examples/v4-demo/` | Phase A 初版虛構端到端範例（8 頁，最低 `4.81:1`；`samples/` 舊版獨立樣張 `--sheet` 相容通過） |
| `outputs/examples/{example,annual-section,layout-catalogue,progress-overview,test4}/` | v3 時代舊範例（如 `theme: editorial` 等舊欄位），只保留參考，不代表現行流程 |
| `inputs/presentation-principles.md` | 使用者的簡報原則，第 1–40 條（被取代的舊條目已加註） |
| `inputs/v1-replay-v410.md` | v4.10 主柱一 v1 四案虛構化全新上下文盲測回放報告（4/4 命中正確架構、輪／題數統計與 v4.10.1 兩項修正紀錄） |
| `inputs/v410-replay-run2.md`、`inputs/replay-v1-cases/` | 第二組回放報告（4/4 命中，另找到 4 項待修），以及可重跑的虛構回歸測試組：情境、扮演設定、每輪表單與 brief，重跑方法見該資料夾 `README.md` |
| `inputs/pillar1-review-v490.md`、`inputs/mattpocock-elicitation-study.md` | v4.9.0 主柱一第一性原理複查（7 項缺口）與 `mattpocock/skills` 引導深挖十機制研究（已於 v4.10 落地） |
| `inputs/pillar2-audit-v482.md` | v4.8.2 主柱二（視覺引導／靜態／動態／模組化注入）全歷史與程式碼＋Chrome CDP 深度稽核報告（22 項已於 v4.9.0 全數修補收官） |
| `inputs/external-audit-c2bfaf8.md`、`inputs/external-audit-c2bfaf8-review.md` | v4.8 外部唯讀稽核報告與逐條評估（13 項有效項目已於 v4.8.1 全數修補） |
| `inputs/modular-capabilities-audit.md` | 10 個 GitHub 簡報 Skill 二次盤點：按需模組深化與漏網 Nice-to-Have 報告 |
| `inputs/phase-c-teardown-learnings.md` | Phase C 旗艦標竿對照與 `mattpocock/skills` 始祖回溯研究筆記（去敏版） |
| `inputs/motion-research.md` | Phase B 動態技術路線研究（14 個 GitHub Repo 實查，已定案方案 1） |
| `outputs/style-specs/`（歷史封存）、`outputs/color-modes/`、`outputs/illustration-integration/`、`outputs/style-moodboard-v5/` | 首批風格歷史初版、淺深雙底配色、插畫 15 畫風融合與 12 款風格視覺錨點（現行正式版在 `outputs/deck-architect/styles/`） |

## 待使用者決定（適時用表單確認）

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
