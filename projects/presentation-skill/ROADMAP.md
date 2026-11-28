# ROADMAP：deck-architect

> **最新接手點（2026-11-28｜`deck-architect` v5.1：前兩步 Round 0 → Gate 1b 零減輪上下文 100% 隔離升級 ✅）**：在使用者追問「前兩步若遇大量附件或多輪對話會不會撐爆上下文、能否在不減輪數下改善」後，針對主柱一真正吃掉 70%–85% Token 的三處熱點完成 **v5.1 升級（原則 #47）**：① **100% 原始附件絕對隔離**——無論檔案大小或格式（含中途補傳），主代理嚴禁直讀原始附件，一律派只讀「偵察官子代理（Pre-Flight Recon Subagent）」產出 `decks/<name>/pre-flight.md`（Round 0 僅回傳 ≤600 tokens 客觀事實，舊稿結構診斷延後防錨定）；② **`scripts/fragments.py` 零重讀原子 CLI**（`add`/`star`/`list`）——在磁碟端保留手動編輯並原子追加，消滅多輪 `O(R²)` 全文重讀副本；③ **Gate 1b 契約起草子代理（Contract Scribe Subagent）**——接手載入形狀規則與範本、撰寫 `brief.md`＋`storyboard.yaml`（`slide_plan`）並跑過 `lint.py` 除錯，僅回傳 `--outline` 清單與軟提醒給主代理簽核。對話輪數與顧問深度 0 刪減。**下一步：拿下一份真實需求驗證 v5.1「多輪深聊不退化 × Draft 1 一稿驚豔」體驗，或推進 Phase D／Phase E。**
>
> **前一段（2026-11-28｜`deck-architect` v5.0：真實高難度商務簡報端到端壓測 × `/grill-me` 第一性原理淨負複雜度重構 ✅）**：完成首輪真實高密度商務簡報端到端壓測獨立審計與 5 輪 `/grill-me` 全設計樹收斂（原則 #41–#46），升級為 **v5.0**：透明 5 道關卡、去重版 `brief.md`（~14 欄）＋`storyboard.yaml` 7 類 `slide_plan`、關鍵 1 頁 3 風格活體比稿＋1 輪防走鐘、解鎖 4 款風格雙密度 DNA、全風格統一從容慢板動效、100% Builder 子代理隔離、修復 4 大底盤真 Bug、純工程 `check.mjs`（含 `filmstrip-sXX.jpg`）＋單輪有界 Critic，核心常駐文件去重瘦身 −53%，乾淨收尾在 HTML 與 PDF。
>
> **前一段（2026-11-27｜`deck-architect` v4.10.2：第二組回放的 4 項修補 ✅）**：第二組獨立回放（`inputs/v410-replay-run2.md`，可重跑的測試組在 `inputs/replay-v1-cases/`）同樣 4/4 命中，另找到 4 項，使用者拍板後於 v4.10.2 修完（原則 #39–#40）：推薦不是使用者版本時附「你的版本＋補弱點」選項、Round 0 固定問架構硬限制且只給事實、`lint.py` 欄位比對放寬、`meta.toc` 可手動指定目錄頁。

> **這是專案唯一的主軸文件。** 每個階段開始前、結束後都回來對照、更新勾選。
> 細節紀錄在 `LOG.md`，目前進度在 `STATUS.md`，兩者都要對齊這份。

## 目標（北極星）

> **截長補短，做出一個從頭到尾支援全流程的簡報／HTML Skill：**
> **使用者的方法論當骨架，多元的生成式風格憲法與 HTML 動態互動當皮肉，做到「梳理完內容後，Gate 2 依內容主題配對的風格與真實內容樣張就令人『哇就是這些！』、成品比 `codex-ppt-skill` 更活且真文字可改、覆蓋日常高頻場景並打通交付修改閉環」。**

起點：使用者喜歡 codex-ppt-skill 的「圖文融合、說故事感」，但它不會動、文字畫死在圖裡；HTML 會動、可互動、可編輯，但市面成品畫面不夠活、也缺少使用者的簡報方法論。

## 三個支柱

### ① 方法論（骨架）：來自使用者
見 `inputs/presentation-principles.md`（原則 #1–#47）。已用 4 份真實簡報驗證（`inputs/v1-iteration-*.md`）、Phase C.1–C.2 盲測回放與 2026-11-28 真實高密度商務簡報端到端壓測＋`/grill-me` v5.0/v5.1 重構驗證升級。

- [x] Grill v5.1（透明五關 × 前兩步零減輪上下文 100% 隔離）：Round 0 派偵察子代理 100% 隔離讀取附件寫 `pre-flight.md`＋亮出 5 關路線圖＋硬限制複選題 → **⛔ Gate 1a 多輪顧問深挖（`fragments.py` 零重讀收碎片）與破框敘事骨架** → **⛔ Gate 1b 細節減法對焦＋Contract Scribe 子代理產出去重 `brief.md`（~14 欄）與逐頁 `slide_plan`（7 類 `job` 含 `scaffold`）＋文字預確認 3 個風格方向**；強制「進關先講目的與驗收點、明確同意才過關」（原則 #41–#42、#47）
- [x] 架構：一條軸、單一方向；最上層不可並列；Design It Twice 破框提案（含「你的版本＋補弱點」）；序幕、轉折點、可選 `unlisted: true` One More Thing 驚喜幕、3-2-1 收斂與尾聲
- [x] 呈現與控字：標題是路標（總結永遠不當主標題）、原則 #26 去小字（含四項合法豁免：原話暗房、產品短句、活流程微標、教學演練 `scaffold`）、補充口徑放 `notes`/`appendix` 即合規、三階字重呼吸與 75–20–5 色彩面積平衡
- [x] 內容可信度：證據、限制、數字查核與出處（`lint.py` 軟性提醒搭單輪只讀 Critic 語意複核）
- [x] 類型：一頁總覽、可點入附件、現代 Bento 進度儀表板／狀態表、多人填寫檢查、高密策略畫廊、教學演練工作坊、旗艦發表會（Keynote）

### ② 設計美感與「活」（皮肉）：生成式風格憲法 ＋ HTML 主場優勢
研究見 `inputs/research-html-slide-skills.md`、`inputs/design-research.md`、`inputs/style-research.md`、`inputs/reference-styles.md`、`inputs/motion-research.md`、`inputs/phase-c-teardown-learnings.md`、`inputs/modular-capabilities-audit.md`。**借用前先確認授權**：MIT 等寬鬆授權可以借程式碼並標註來源；限制商用或未標授權的（如 guizang AGPL-3.0）只學做法與數值、自己實作。

- [x] **風格方向與首批四款 v5.0 深度升級**：完整保留 12 款風格架構（4 款 `ready` ＋ 8 款 `planned`）與 `assets/style-library.html`；解鎖 `counsel` 等 4 款就緒風格表面死禁令，支援雙語意主色分工、溫潤紙面微層次與 `airy`／`structured` 雙密度語法（原則 #44）
- [x] **內容結構與 7 類認知任務**：14 種結構＋5 種圖表結構＋7 類 `slide_plan.job`（`references/content-shapes.md`）
- [x] **三層細粒度按需架構＋4 大底盤真 Bug 清零（v5.0）**：Layer 0 輕底盤（`#stage > .slide` 強制絕對定位、`DOMContentLoaded` 首頁進場事件保證、`data-step` `revealDelay` 與巢狀隔離、`assemble.py` 單頁 CSS 註解安全作用域）＋Layer 1 講者工具（`G`/`A`/`L`/`S`）＋Layer 2 細粒度內容模組與 4 套風格動態套件
- [~] **多元風格憲法庫 Style DNA**：已就緒 4 款並上架 `style-library.html`；其餘 8 款＋主題智能配對與外觀帳本於 Phase D 補齊
- [x] **圖像層真實無字 AI 融合＋自動單檔內嵌**：支援真實無字 AI 底圖 × HTML 真文字融合（含反左右割裂生圖規範）、`.asset-slot[data-slot]` 平衡換圖解析、`assemble.py` 本機靜態圖與影片海報自動 Base64 內嵌與 `IMAGE_UPGRADE.md` 清單
- [x] **全風格統一「從容慢板」動態 × 正交步進**：敘事動效統一為人類呼吸慢板（`800–1,200ms` 描線生長、`220–320ms` 交錯、`0.6s` 舊態停頓），操控互動維持 `~200ms` 即時跟手，並與防破梗 `data-step` 正交脫鉤（原則 #45）
- [x] **純工程 `check.mjs` ＋ 單輪有界只讀 Critic**：`check.mjs` 專責物理與工程真壞掉（像素 WCAG、溢出、`<18px`、JS 錯誤、`.slide` 定位、禁 `<g data-draw>`、測遍全場 `data-step` 並輸出 `filmstrip-sXX.jpg` 分鏡條，刪除湊原語配額）；美感與去贅字交單輪只讀 Critic（原則 #46）

### ③ 全流程（從頭到尾）

- [x] Round 0（偵察子代理 100% 隔離讀附件寫 `pre-flight.md`＋亮 5 關路線圖＋硬限制）→ ⛔ Gate 1a 多輪架構骨架（`fragments.py` 零重讀收碎片）→ ⛔ Gate 1b 減法對焦＋Contract Scribe 子代理產出去重 `brief.md`與 `slide_plan`＋文字預確認 3 個風格方向
- [x] ⛔ Gate 2a（3 位乾淨 Builder 並行繪製最關鍵 1 頁真實活體比稿＋混搭建議）→ ⛔ Gate 2b（合成 `deck.css`＋定版活範本 1–2 頁，花 1 輪確認沒走鐘）
- [x] ⛔ Gate 3（100% 乾淨上下文 Builder 子代理精雕全場 → `check.mjs` 工程把關＋步進分鏡條 → 單輪有界 Critic → 乾淨收尾在 `deck.html` 與 `deck.pdf`）
- [~] 交付延伸（Phase E）：雙螢幕講者模式（`S`）＋總覽（`G`）＋畫筆雷射（`A`/`L`）已完成；**原生可編輯 PPTX 獨立轉換技能留待新對話／Phase E**（不在 `deck-architect` 內截死圖充數）
- [ ] 修改（Phase E）：在成品上按 `E` 直接改字回寫、畫面上點選留言讓 Agent 一次改完
- [ ] 記憶（Phase D–E）：外觀帳本、品味記憶、常用風格與模板

## 階段總覽（2026-11-19 重構版）

### 已完成的基礎階段（歷史保留）

| 階段 | 內容 | 狀態 |
|---|---|---|
| 0 | 市場研究（Top 11＋3 個「活」Skill）、架構規劃、方法論梳理 | ✅ |
| 1 | `deck-architect` v0 骨架、v1 四次真實簡報迭代（支柱 ①） | ✅ |
| 2a–2b | 風格系統研究、12 款方向定案、OKLCH 用色系統、首批 3 款規格（含明暗兩版、插畫 15 種畫風融合版與淺深雙底） | ✅ |

### 現行執行路線（Phase A → E）

| 階段 | 名稱 | 核心交付 | 完成條件 | 狀態 |
|---|---|---|---|---|
| **A** | **地基對齊與輕底盤 v4** | 解凍 `deck-architect`：套用原則 #12–#25、清掉 11-14 實測待辦；建立「輕底盤、強自由」的 `deck-shell`；把 `render.cjs` 真實像素 WCAG 檢查併入 `check.mjs`；把首批 Style DNA 與三組 OKLCH 配色接進單一視覺關卡 Gate 2 | 新架構可在虛構範例上由輕底盤＋自由編排跑通 Gate 2 到成品，並通過統一 `check.mjs`（`outputs/examples/v4-demo/`＋`v4-visual-benchmark/` 靜態上限重練與原則 #26 減字全數通過） | ✅ |
| **B / B.2 / B.3** | **注入 HTML 獨有的「活」與視覺指引** | 反寫四大靜態視覺工藝與原則 #26（`styles/workday.md`、`references/motion-system.md`、`references/visual-guidance.md`）；以方案 1 分層混合架構完成 60fps 純 GPU 動態核心、6 種敘事切頁、三數齊飛 Magic Move、**Phase B.3 三層聚光壓暗／因果現場演變／真描線與目標波紋／互動因果回饋**、`B` 鍵／`?still=1` 靜態凍結與 `check.mjs --motion` 7 項自動實測 | 8 頁完整單檔範例 `outputs/examples/v4-alive-demo/deck.html` 靜態對比全數通過（最低 `4.70:1`）、7 項 `--motion` 動態與視覺指引實測全部 ✅、390px 手機實測順滑清晰，同時保持 100% 離線雙擊可播 | ✅ |
| **C.1** | **Phase C 標竿對照與 v4.4-spec 規格升級** | 以真實 43 頁旗艦 PPTX 對照 Phase C 21 頁 HTML 初版，回溯 `mattpocock/skills` 始祖機制，反寫三段式舞台光譜（`briefing`/`pitch`/`keynote`）、設計樹 Grill v2、標準模式必給破框候選、Grounding 與說服載體地圖、原則 #27–#30，重打包 `deck-architect.skill` | 9 份核心規格檔＋去敏研究筆記同步入庫，既有範例 `lint.py` 0 錯 0 警通過 | ✅ |
| **C.2 / v5.1** | **v4.4→v5.1 真實高密度商務壓測與第一性原理淨負複雜度重構 🎯** | 完成三層細粒度按需引擎、v1 四案盲測回放 4/4 命中，並經首輪真實高難度商務簡報端到端壓測與 `/grill-me` 收斂升級至 **v5.0/v5.1**（透明 5 關、前兩步零減輪上下文 100% 隔離：`pre-flight.md`＋`fragments.py`＋Contract Scribe 子代理、去重 `brief`＋`slide_plan`、關鍵 1 頁 3 風格活體比稿＋1 輪防走鐘、解鎖 4 款風格雙密度 DNA、全風格從容慢板、100% Builder 子代理隔離、純工程 `check.mjs`＋步進分鏡條＋單輪有界 Critic、核心常駐文件瘦身 −53%） | v5.0/v5.1 單元測試與 5 份 v4 範例＋`--sheet`＋`style-library.html` 零回歸並重打包 `deck-architect.skill`（87 檔）✅；下一步以真實需求驗證 v5.1 首稿體驗 | ✅ v5.1 重構收官／待下輪真實簡報實測 |
| **D** | **多元風格庫全面成形** | 依驗證過的 Style DNA 格式補齊其餘 8 款風格（積木構成、水彩水墨、書卷刻本、孔版小誌、摩登金、攝影雜誌、年輕潮流、在地懷舊，各含淺深規則與動效個性並上架 `style-library.html`）；整理插畫 15 種畫風配方與生圖公式；建立「主題→風格智能配對」與外觀帳本 | 面對不同主題（商務／發表／活動／文化／科普）的簡報，風格圖鑑與樣張都能端出截然不同、貼題驚豔的方向且不撞款 | |
| **E** | **交付、修改閉環與越用越省事** | 成品上按 `E` 直接改字並回寫、畫面上點選留言修改；獨立的「`deck.html` → 原生文字與圖塊可編輯 PPTX」轉換技能；品味記憶；評估搬進 `skills/` 由 `install.sh` 全域安裝（雙螢幕講者模式已於 v4.5 完成，單輪有界 Critic 已於 v5.0 完成） | 完整覆蓋日常製作→修改→上台→交付閉環，重複使用明顯更省事 | |

每個階段的共同完成條件：用**真實簡報**做出成品，使用者覺得「比原本的做法好」。

---

## 為什麼在 2026-11-19 重構 Roadmap（架構演進紀錄）

前幾輪的試錯與最終收斂：

| 時期／版本 | 做法 | 發現的問題 |
|---|---|---|
| v2.0 | 5 個風格共用一套版面 | 三種樣張只差字體和顏色 |
| v2.2 | 每個風格黏死一套版面 | 排版不該跟風格綁死、不夠多元、沒有來源 |
| v3.0（11-14 凍結） | 風格只放變數，70 種通用排法另成一庫，兩步選 | 版型仍偏傳統；先排版再風格，畫面元素與背景會不搭 |
| 原 2b–2c（11-15～11-19） | 風格與排版一起設計；手刻 15 種插畫淺深雙底（32 張單頁），下一步原定 2c 做「19 結構 × 3–5 排法 × 12 風格」 | 技能本體凍結在 `build.py` 模板引擎，與手寫客製樣張斷裂；預做上千種靜態排法重蹈「窮舉清單陷阱」；HTML 獨有的動態與真實簡報驗證進度為 0% |
| **v4 新路線（11-19 定案）** | **輕底盤、強自由混合架構 ＋ 生成式 Style DNA ＋ 零等待程式產出與可選 AI 升級插槽 ＋ 動態提前實戰 PK** | 保留多元風格的驚豔體驗，消除靜態模板組合爆炸，讓技能本體真正接軌並開出 HTML 主場優勢 |

> **提醒**：至 2026-11-19 為止，**仍沒有任何一份真實簡報用 `deck-architect` 從頭做到多頁成品**。Phase C 就是為了盡快打破這個空白。

---

## 待辦清單（來自 2026-11-14 新 agent 實測，已於 Phase A 清完）

第一輪：

- [x] 品管抓不到「斷行很醜」：升級 `fit.js` 支援 `[data-fit="phrase"]` 與 `[data-fit="figure"]`，搭配 `shell.css` 的 `text-wrap: balance/pretty` 與 `line-break: strict`（Phase A）
- [x] 選風格之前看不到完整頁面：改為單一視覺關卡 Gate 2 直接呈現完整風格樣張（Phase A）
- [x] 每頁字數上限是固定的：`meta.delivery`（`talk`/`discuss`/`read`/`auto`）＋每頁分鐘數動態調整字數上限（Phase A）
- [x] 頁數算術沒有在 brief 階段檢查：`brief.md`/`grill.md` 加預算拆解，`lint.py` 輸出「封面+目錄+內容+震撼+結尾=合計/上限」（Phase A）
- [x] 附件頁不計入頁數上限成了漏洞：`presentation-rules.md` 明定附件防濫用指引，`lint.py` 對附件過多發出警告（Phase A）
- [x] brief 的「限制」與「地雷」無法寫進 storyboard 與檢查：新增 `constraints`（`forbidden` ERROR、`limitations`/`must_include` WARN）（Phase A）
- [x] 來源是簡體中文時缺轉換與用詞指引：`presentation-rules.md` 補台灣習慣用語指引，`lint.py` 自動偵測純簡體字（Phase A）
- [x] 離線環境載不到 Google Fonts：`shell.css` 與 Style DNA 內建五種語音的系統字體退路，`check.mjs` 離線不崩潰（Phase A）
- [~] 內容頁文字集中在中段、上方三分之一空：隨自由編排畫布與風格版面語法解決，待 Phase C 真實簡報確認

第二輪：

- [x] 有好幾個數字頁時樣張預設招牌頁挑不準：支援 `signature: true` 明確標記招牌頁（Phase A）
- [x] 樣張放 4 頁時每格太小：`references/samples.md` 與 `assemble.py --sheet` 強制 2–3 頁並排（Phase A）
- [x] 步驟 `detail` 裡的 `==重點==` 字太小（v3.0 已修）
- [x] 步驟 `detail` 無法指定斷行：`storyboard.yaml` 明確支援並示範 `\n` 換行，由 `rich()` 轉 `<br>`（Phase A）
- [x] `presentation-rules.md` 補 `stats`、`note`、`{label, detail}`（v3.0 已修）
- [x] `stats` 的 `value` 支援 `==…==`（v3.0 已修）
- [x] 關卡二前看不到沒被選進樣張的頁面（已轉由新 Gate 2 流程處理）

## 專案原則

- **範例一律從零虛構**，不從使用者的真實資料改寫；公開 repo 不放任何內部資訊。
- 每個段落結束都同步到 repo（見根目錄 `CLAUDE.md`）。
- 規則能寫成腳本檢查就寫成腳本；只能由人判斷品質的（例如顧問追問與敘事腦力激盪），要留下可檢查的產出（`brief.md` 的欄位，由 `lint.py` 檢查有沒有做到），品質交給關卡上的使用者拍板（2026-11-26 修訂；原文「不能檢查的規則不寫」會讓主柱一整套無法成立）。真實簡報 PK 只在開發階段用來驗證設計，正式使用時沒有 PK。
- **可讀性由驗證把關**（2026-11-17）：允許裝飾與文字交錯，但對比要過真實像素 WCAG 檢查、不得溢出版面。
- **驗收要看「真的不同」，不是「沒壞」**（2026-11-14、11-17）：樣張要在灰階與幾何兩個層面確認差異，不能只確認沒溢出、對比足夠。
- **多元靠「風格憲法＋自由畫布」，不靠「窮舉靜態模板」**（2026-11-19）：把重複且不能錯的基礎設施放進輕底盤，把視覺表現的自由度還給 Agent 與 Style DNA。
