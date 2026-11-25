# ROADMAP：deck-architect

> **最新接手點（2026-11-24｜Phase B / B.2 / B.3＋B.3.1 完成 ✅）**：已完成四大靜態視覺工藝與原則 #26 反寫入 `deck-architect`（v4.3，29 檔），落地 **Phase B 方案 1 動態引擎**、**Phase B.2 60fps GPU 順滑重構與 6 種敘事切頁**、以及 **Phase B.3＋B.3.1 視覺指引規格書與從容閱讀節奏校準**（新增 `references/visual-guidance.md`、更新 `styles/workday.md` 二區行動主軸→健康總覽 Bento 語法，實作三層聚光壓暗、因果現場演變、真描線／方向揭露／波紋／光珠、16:9 底部基線滿版對齊與互動因果回饋，保持單次操作翻頁不變），於 8 頁完整可播放範例 `outputs/examples/v4-alive-demo/deck.html`（100% 離線單檔）通過靜態像素 WCAG（最低 `4.70:1`）與 7 項 `--motion` 動態＋視覺指引實測。下一步進入 **Phase C｜第一份真實簡報端到端 PK 🎯**。

> **這是專案唯一的主軸文件。** 每個階段開始前、結束後都回來對照、更新勾選。
> 細節紀錄在 `LOG.md`，目前進度在 `STATUS.md`，兩者都要對齊這份。

## 目標（北極星）

> **截長補短，做出一個從頭到尾支援全流程的簡報／HTML Skill：**
> **使用者的方法論當骨架，多元的生成式風格憲法與 HTML 動態互動當皮肉，做到「梳理完內容後，Gate 2 端出的多元風格樣張就令人『哇就是這些！』、成品比 `codex-ppt-skill` 更活且真文字可改、覆蓋日常高頻場景並打通交付修改閉環」。**

起點：使用者喜歡 codex-ppt-skill 的「圖文融合、說故事感」，但它不會動、文字畫死在圖裡；HTML 會動、可互動、可編輯，但市面成品畫面不夠活、也缺少使用者的簡報方法論。

## 三個支柱

### ① 方法論（骨架）：來自使用者
見 `inputs/presentation-principles.md`。已用 4 份真實簡報驗證（`inputs/v1-iteration-*.md`）。

- [x] Grill：目的、對象、時長、場合 → 起點與終點；互動表單；既有框架與模板先讀
- [x] 架構：一條軸、單一方向；最上層不可並列；序幕、轉折點、尾聲
- [x] 呈現：標題是路標（總結永遠不當主標題）、原則 #26 去小字（最多 2 層文字、口白進講者稿）、重點放大加突出色（不畫底線）、不寫過場、目錄與頁籤導航、震撼頁
- [x] 內容可信度：證據、限制、數字查核與出處（v4 已將 `constraints` 納入 `lint.py` 自動檢查）
- [x] 類型：一頁總覽、可點入附件、現代 Bento 進度儀表板／狀態表、多人填寫檢查

### ② 設計美感與「活」（皮肉）：生成式風格憲法 ＋ HTML 主場優勢
研究見 `inputs/research-html-slide-skills.md`、`inputs/design-research.md`、`inputs/style-research.md`、`inputs/reference-styles.md`、`inputs/motion-research.md`。**借用前先確認授權**：MIT 等寬鬆授權可以借程式碼並標註來源；限制商用或未標授權的（如 guizang AGPL-3.0）只學做法與數值、自己實作。

- [x] **風格方向與首批定調（原 2a–2b）**：12 款風格清單定案（`inputs/style-list-v5.md`）；OKLCH「鎖規則、不鎖色碼、全淺深雙底」用色系統（`outputs/style-specs/color-system.md`）；首批四款（`counsel`、`apple`、`illustration` 15 種畫風、`workday` 現代 Bento）完整 Style DNA 已就緒
- [x] **內容結構與容量基礎（原 v3.0 資產沿用）**：14 種結構＋5 種圖表結構（長條、圓環比例、折線趨勢、人形圖示、地圖）、容量規則、`series`、`lint.py`；已轉為 `references/content-shapes.md` 內容形狀指南
- [x] **輕底盤、強自由混合架構（Phase A）**：Thin Shell 共用底盤（`shell.css`、`runtime.js`、`fit.js`、`assemble.py`）＋ 90%+ 頁面由 Agent 依 Style DNA 自由編排 HTML/CSS/SVG ＋ 高紀律商務頁（週報 `status-table`、`pillars`、`toc`）保留穩定元件（`components.css`）
- [~] **多元風格憲法庫 Style DNA**：已就緒 4 款（`styles/workday.md`、`counsel.md`、`apple.md`、`illustration.md`＋`color-system.md`、`index.json`）；其餘 8 款＋主題智能配對與外觀帳本於 Phase D 補齊
- [x] **圖像層真實無字 AI 融合＋自動單檔內嵌**：支援真實無字 AI 底圖 × HTML 真文字融合（含反左右割裂生圖規範）、`.asset-slot[data-slot]` 自動換圖、`assemble.py` 本機圖檔自動 Base64 內嵌與 `IMAGE_UPGRADE.md` 清單
- [x] **HTML 核心動態與視覺指引（Phase B / B.2 / B.3｜方案 1 分層混合）**：~11 KB 零依賴 60fps 純 GPU 原生核心——零鎖死可打斷轉場與 6 種敘事切頁（`push`/`zoom-rise`/`iris`/`shock`/`morph`/`sheet-up`/`modal`）、離頁保持 `opacity:1` 防閃底色、多元素編隊跨頁 Magic Move（`data-morph`，MIT `open-slide`）、**Phase B.3 視覺指引系統**（`references/visual-guidance.md`、三層聚光壓暗 `data-focus-plan`、因果現場演變 `data-transform-at`、真 SVG 描線 `data-draw`＋純 GPU `data-wipe` 揭露、端點綻放 `data-pop`、目標波紋 `data-ripple`、軌道光珠 `data-travel` 與互動因果回饋）、互動滑桿（`.live-ctrl`）、滾動數字（`data-count`）、延遲啟動 `480×270` 離頁即停 Canvas 2D（`data-fx`）、雙重靜態保險（`B` 鍵、`?still=1`、`prefers-reduced-motion`、列印自動隱控件）＋旗艦按需外掛事件契約
- [x] **排版細節與像素＋動態雙重品管**：中文不用斜體、字距 0、標點擠壓、balance 斷行、等寬數字、離線字體退路；統一 `check.mjs`（支援 Playwright＋零依賴 Chromium CDP、`?still=1` 確定性真實背景像素 WCAG 對比、漸層字逐段對比、主標題≥總結、SVG 重複 ID、以及 `--motion` 7 項動態與視覺指引自動實測）

### ③ 全流程（從頭到尾）

- [x] Grill → brief（含頁數算術、播放密度 `delivery`、簡體在地化指引）
- [x] 架構展開 → storyboard → lint（含 `constraints` 地雷／限制檢查、動態字數、頁數拆解、簡體偵測、附件防濫用）
- [x] 一次視覺關卡 Gate 2（Phase A）：`assemble.py --sheet`＋`check.mjs --sheet` 產出 3 款多元風格樣張並排＋`oklch.py --palette` 驗證三組 OKLCH 主題配色
- [x] 製作 → `deck.html`（Phase A 靜態底盤＋Phase B/B.2/B.3 60fps 動態互動與視覺指引引擎＋本機圖檔自動單檔內嵌全數完成）
- [~] 品管：統一強化版 `check.mjs`（靜態像素 WCAG＋`--motion` 7 項動態與視覺指引實測）已完成；獨立評審留待 Phase E
- [ ] 交付（Phase E）：文字可編輯 PPTX、雙螢幕講者模式（備註、計時、下一頁預覽）、乾淨列印 PDF
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
| **C** | **第一份真實簡報端到端 PK 🎯** | 讓**全新 Agent 只靠 `SKILL.md`**，以真實簡報（如「內部工具推廣與部署說明」）從頭走到尾產出會動的多頁成品，直接跟原本的 `codex-ppt-skill` 版本 PK，並將摩擦點回修到 Skill | 使用者實測後確認「Gate 2 候選令人驚豔」且「成品比原本的做法更好」 | ⏭ 下一步 |
| **D** | **多元風格庫全面成形** | 依驗證過的 Style DNA 格式補齊其餘 8 款風格（積木構成、水彩水墨、書卷刻本、孔版小誌、摩登金、攝影雜誌、年輕潮流、在地懷舊，各含淺深規則與動效個性）；整理插畫 15 種畫風配方與生圖公式；建立「主題→風格智能配對（穩健／大膽／驚喜）」與外觀帳本 | 面對不同主題（商務／發表／活動／文化／科普）的簡報，Gate 2 都能端出截然不同、貼題驚豔的三個候選且不撞款 | |
| **E** | **交付、修改閉環與越用越省事** | 成品上按 `E` 直接改字並回寫、畫面上點選留言修改；雙螢幕講者模式（備註、計時、下一頁預覽）；文字可編輯 PPTX 匯出；品味記憶與獨立評審；評估搬進 `skills/` 由 `install.sh` 全域安裝 | 完整覆蓋日常製作→修改→上台→交付閉環，重複使用明顯更省事 | |

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
- 規則能寫成腳本檢查就寫成腳本；不能檢查的規則不寫。
- **可讀性由驗證把關**（2026-11-17）：允許裝飾與文字交錯，但對比要過真實像素 WCAG 檢查、不得溢出版面。
- **驗收要看「真的不同」，不是「沒壞」**（2026-11-14、11-17）：樣張要在灰階與幾何兩個層面確認差異，不能只確認沒溢出、對比足夠。
- **多元靠「風格憲法＋自由畫布」，不靠「窮舉靜態模板」**（2026-11-19）：把重複且不能錯的基礎設施放進輕底盤，把視覺表現的自由度還給 Agent 與 Style DNA。
