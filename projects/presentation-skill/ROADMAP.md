# ROADMAP：deck-architect

> **最新接手點（2026-11-27｜第二組回放 v1 四案 ✅，待使用者決定 4 項修補）**：另一組獨立回放（`inputs/v410-replay-run2.md`，可重跑的測試組在 `inputs/replay-v1-cases/`）同樣 4/4 命中，另找到 v4.10.1 還沒處理的 4 項：推薦偏向 Agent 版本、Round 0 診斷時機會錨定、lint 欄位比對漏抓、目錄頁不能手動指定。下一步：使用者決定修補範圍後，拿真實簡報跑完整 Step 1a→Step 6 PK。
>
> **前一段（2026-11-27｜`deck-architect` v4.10.1：v1 四案盲測 4/4 全數命中 ＋ 修正快速模式舊上限矛盾與碎片簿 Matt 原文規則 ✅）**：針對 v4.10 主柱一升級（原則 #35–#38），將 v1 四案去敏改寫為虛構情境並派 4 個全新上下文盲測分身跑完 Round 0 → ⛔ 關卡 1a（`inputs/v1-replay-v410.md`）：**4/4 案全數命中正確架構**（標準三案各 4 輪 12 題達關卡 1a、含拍板 5 輪 15 題；快速案 2 輪 7 題、含拍板 3 輪 10 題），v1 歷史架構痛點零復發。並立即落地 **v4.10.1** 兩項對齊：① 刪除快速模式殘留的「`1–2 輪（≤5 題）`」上限，全面對齊原則 #28「不設題數上限、前沿清空才停」；② 依 `mattpocock/skills` `writing-fragments/SKILL.md` 原文補齊 `fragments.md` 篩選門檻（只收有機會活進成品的原料，不貼 `1A/2A` 表單 log）、一則一獨立想法、靜默追加＋寫前重讀磁碟。重打包 `outputs/deck-architect.skill`（85 檔，372.1 KB，SHA-256 逐位元一致）。**下一步：拿真實簡報跑完整 Step 1a→Step 6 PK（先於 Phase D）。**

> **這是專案唯一的主軸文件。** 每個階段開始前、結束後都回來對照、更新勾選。
> 細節紀錄在 `LOG.md`，目前進度在 `STATUS.md`，兩者都要對齊這份。

## 目標（北極星）

> **截長補短，做出一個從頭到尾支援全流程的簡報／HTML Skill：**
> **使用者的方法論當骨架，多元的生成式風格憲法與 HTML 動態互動當皮肉，做到「梳理完內容後，Gate 2 依內容主題配對的風格與真實內容樣張就令人『哇就是這些！』、成品比 `codex-ppt-skill` 更活且真文字可改、覆蓋日常高頻場景並打通交付修改閉環」。**

起點：使用者喜歡 codex-ppt-skill 的「圖文融合、說故事感」，但它不會動、文字畫死在圖裡；HTML 會動、可互動、可編輯，但市面成品畫面不夠活、也缺少使用者的簡報方法論。

## 三個支柱

### ① 方法論（骨架）：來自使用者
見 `inputs/presentation-principles.md`（原則 #1–#38）。已用 4 份真實簡報驗證（`inputs/v1-iteration-*.md`）並於 Phase C.1–C.2 依旗艦標竿實測、`mattpocock/skills` 始祖回溯、兩大主柱終審與 v4.10 四案全新盲測回放（`inputs/v1-replay-v410.md`）驗證升級。

- [x] Grill v2（v4.8 兩階段顧問腦力激盪）：**Step 1a 架構與敘事脈絡腦力激盪（⛔ 關卡 1a：Pre-Flight、主題類型與標竿盲點掃描、雙重目標、`stage_mode` 與播放環境、故事種子、承重母題與不循規蹈矩破框 3 選 1）→ Step 1b 內容細節與說服載體腦力激盪（⛔ 關卡 1b：逐章論點細節與反方質疑拆彈、顧問主動給方案建議、白話說服載體、內容減法清單、素材缺口與數字查核；`brief.md` 過 lint 才送關卡）**；所有步驟的建議都要附理由（原則 #34）；v4.10 參考 `mattpocock/skills` 補上先問心中的講法與素材碎片簿、架構硬限制與給主管的問卷、候選比較與結構追問、尚未確定清單、防被動同意、改起來最貴的四個決定與架構變更回路（原則 #35–#38），並通過 v1 四案全新上下文盲測 4/4 全數命中
- [x] 架構：一條軸、單一方向（理性不迷路底氣，但敘事脈絡可腦力激盪破框）；最上層不可並列；Design It Twice 破框提案；序幕、轉折點、可選 `unlisted: true` One More Thing 驚喜幕、3-2-1 收斂與尾聲
- [x] 呈現：標題是路標（總結永遠不當主標題）、原則 #26 去小字（含三項合法豁免）、依 `stage_mode` 動態決定光暗雙極與去框化比例、重點放大加突出色（不畫底線）、導航三級分層、震撼頁
- [x] 內容可信度：證據、限制、數字查核與出處（v4 已將 `constraints` 納入 `lint.py` 自動檢查）
- [x] 類型：一頁總覽、可點入附件、現代 Bento 進度儀表板／狀態表、多人填寫檢查、旗艦發表會（Keynote）

### ② 設計美感與「活」（皮肉）：生成式風格憲法 ＋ HTML 主場優勢
研究見 `inputs/research-html-slide-skills.md`、`inputs/design-research.md`、`inputs/style-research.md`、`inputs/reference-styles.md`、`inputs/motion-research.md`、`inputs/phase-c-teardown-learnings.md`、`inputs/modular-capabilities-audit.md`。**借用前先確認授權**：MIT 等寬鬆授權可以借程式碼並標註來源；限制商用或未標授權的（如 guizang AGPL-3.0）只學做法與數值、自己實作。

- [x] **風格方向與首批定調（原 2a–2b）**：12 款風格清單定案（`inputs/style-list-v5.md`）；OKLCH「鎖規則、不鎖色碼、全淺深雙底」用色系統（`outputs/deck-architect/styles/color-system.md`）；首批四款（`counsel`、`apple`、`illustration` 15 種畫風、`workday` 現代 Bento）完整 Style DNA ＋ 互動圖鑑 `assets/style-library.html` 已就緒
- [x] **內容結構與容量基礎（原 v3.0 資產沿用）**：14 種結構＋5 種圖表結構、容量規則、`series`、`lint.py`；已轉為 `references/content-shapes.md` 內容形狀指南
- [x] **三層細粒度按需架構＋亂中有序治理（Phase A / C.2 / v4.5–v4.9.0）**：Layer 0 輕底盤（含 `unlisted: true`、`[data-slide-scope]` 作用域、`isStill()`/`isReducedMotion()` 正交分層）＋Layer 1 3 項講者工具（`G`/`A`/`L`/`S`）＋Layer 2 11 項細粒度內容模組與 4 套風格動態套件（未用到 0 KB）＋軟性 `[WARN]` 場合與風格跨界防呆
- [~] **多元風格憲法庫 Style DNA**：已就緒 4 款並上架 `style-library.html`；其餘 8 款＋主題智能配對與外觀帳本於 Phase D 補齊
- [x] **圖像層真實無字 AI 融合＋自動單檔內嵌**：支援真實無字 AI 底圖 × HTML 真文字融合（含反左右割裂生圖規範）、`.asset-slot[data-slot]` 平衡換圖解析、`assemble.py` 本機靜態圖與影片海報自動 Base64 內嵌與 `IMAGE_UPGRADE.md` 清單
- [x] **HTML 核心動態、視覺指引（主柱二核心）與導演閉環**：60fps 原生核心＋單頁極性＋`nav_mode`＋`data-step`＋三層按需模組＋4 套風格動態套件（淺深雙底與靜態契約實測過關）＋5 支黃金工藝配方＋底盤自動搶先接管＋`check.mjs --motion` 17 項實測＋Liveliness Audit 全部落地驗證
- [x] **排版細節與雙門檻品管**：下限（像素 WCAG 對比、漸層字、主標題≥總結、SVG 重複 ID、OKLCH 近似純黑白／禁紫檢核、17 項動態與行動實測含活頁列印）＋ 上限（依 `stage_mode` 調檔之 Liveliness Audit 生動度與反單調稽核，免罰去框高工藝頁）

### ③ 全流程（從頭到尾）

- [x] Step 1a 架構與敘事脈絡腦力激盪（⛔ 關卡 1a，含 Round 0 起手三分流、先問心中的講法與素材碎片簿、主／次受眾、架構硬限制與問卷、重點碎片、候選比較、30 秒邏輯鏈、結構追問、尚未確定清單與 Out of Scope）→ Step 1b 內容細節與說服載體腦力激盪（⛔ 關卡 1b，含 1b→1a 合法回退）→ `brief.md`（只記內容與場合；`lint.py brief.md` 檢查有沒有做到；快速模式自動合併）
- [x] 架構展開＋逐頁視覺主角 `director.hero` → storyboard → lint → ⛔ 關卡 1c 逐頁清單確認（`lint.py --outline`；版型配方與轉場等選完風格才補）
- [x] 兩階段視覺關卡 Gate 2（v4.8）：Step 3a 依 `contexts.md`〈主題類型總表〉與說服載體選風格，同時確認明暗、去框比例、導航（場合只校準、不淘汰）→ Agent 依風格版面語法補齊分鏡 → Step 3b 單風格 2–3 張極致樣張＋3 組 OKLCH 配色（確認後直接沿用為 Step 4 活範本）
- [x] 製作 → `deck.html`（>6 頁每 3–4 頁乾淨分身精雕＋三層細粒度按需注入＋軟性防呆）
- [~] 品管：下限像素 WCAG＋17 項動態行動實測＋上限 Liveliness Audit 已完成；獨立評審留待 Phase E
- [~] 交付（Phase E）：**雙螢幕講者模式（`S`）＋總覽（`G`）＋畫筆雷射（`A`/`L`）＋`?noscale=1` 已提前完成**；文字可編輯 PPTX 匯出留待 Phase E
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
| **C.2** | **v4.4→v4.10 兩大主柱終審、全量檢修與 v1 四案盲測回放 🎯** | 實作三層細粒度按需引擎（`G/A/L/S`＋11 項內容模組＋4 套風格動態套件＋`unlisted` 支援）、主柱一（Round 0 心中講法與碎片簿／1a 硬限制與問卷／同一把尺比較／結構追問／防被動同意／獨立關卡 1c／架構變更回路）＋主柱二（22 項全量檢修＋17 項動態行動實測＋Liveliness Audit）＋v1 四案全新上下文盲測回放 4/4 全數命中 | 引擎、主柱二 22 項檢修（Python 27/27、Browser CDP 34/34）、5 份 v4 範例＋`--sheet` 零回歸、主柱一 v4.10 四案盲測 4/4 命中並重打包 ✅；下一步跑真實簡報 PK | 🟡 引擎與盲測回放就緒／下一步真實簡報 PK |
| **D** | **多元風格庫全面成形** | 依驗證過的 Style DNA 格式補齊其餘 8 款風格（積木構成、水彩水墨、書卷刻本、孔版小誌、摩登金、攝影雜誌、年輕潮流、在地懷舊，各含淺深規則與動效個性並上架 `style-library.html`）；整理插畫 15 種畫風配方與生圖公式；建立「主題→風格智能配對」與外觀帳本 | 面對不同主題（商務／發表／活動／文化／科普）的簡報，風格圖鑑與樣張都能端出截然不同、貼題驚豔的方向且不撞款 | |
| **E** | **交付、修改閉環與越用越省事** | 成品上按 `E` 直接改字並回寫、畫面上點選留言修改；文字可編輯 PPTX 匯出；品味記憶與獨立評審；評估搬進 `skills/` 由 `install.sh` 全域安裝（雙螢幕講者模式已於 v4.5 完成） | 完整覆蓋日常製作→修改→上台→交付閉環，重複使用明顯更省事 | |

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
