# 狀態：presentation-skill（deck-architect）

> **最新接手點（2026-11-26｜`deck-architect` v4.8 最終檢查定案 ✅）**：
>
> 1. **依兩大主柱逐檔檢查後定案（全部經互動表單拍板）**：
>    - **主柱邊界（原則 #32）**：每個決定等它需要的資訊到齊才做。主柱一只決定內容與場合（架構、故事種子、說服載體、`stage_mode`，播放方式與環境當事實記下）；明暗、去框比例、導航、氛圍效果、版型配方與轉場一律在 **Step 3a 選定風格時**才決定，Step 2 的 `director` 只寫視覺主角 `hero`，選完風格再由 Agent 補 `archetype`／`choreo`／`surface`。說服載體反過來限制可選風格。
>    - **故事種子（原則 #33）**：Step 1a 提敘事候選前，先問使用者最想講的 1–3 個時刻、案例、畫面或原話，三個候選都圍繞它們。
>    - **每個建議都要附理由（原則 #34，使用者補充）**：任何步驟的建議都要說明為什麼，理由扣回這份簡報的事實。
>    - **主題類型統一成一張表**：`references/contexts.md` 第二節〈主題類型總表〉是標竿盲點掃描與風格推薦的唯一來源；`stage_fit` 只標常用場合、不再壓暗其他風格。
>    - **可檢查產出＋關卡拍板**：ROADMAP 專案原則改寫；`lint.py brief.md` 檢查顧問流程有沒有留下產出（故事種子、三個候選、標竿缺口、每章反方質疑與說服載體），品質由關卡 1b 的使用者判斷。
>    - **生動度稽核**：11 個風格動態原語分開計數，並新增「風格契合」（有沒有用到選定風格的招牌動態）。
> 2. **驗證過程抓到並修好的引擎問題**：
>    - `runtime.js`：換頁時 `clearGuidanceState(prev)` 會把全域 `focusToken` 加一，讓剛開始演的下一頁聚光排程失效，畫面**卡在第 1 拍、其餘卡片一直壓暗**。改成每頁各自的 token。修好後 `v4-alive-demo` 5 頁、`v44-keynote-demo`、配方 `bento-causal` 的聚光復原實測全過。
>    - `check.mjs`：顏色原本用字串取前三個數字，遇到 OKLCH（本技能的配色系統）會把 `oklch(0.96 …)` 當成近黑色，對比與明暗極性全部誤判；改成在瀏覽器畫一個像素換算，漸層字另補 OKLCH 換算。離線載不到 Google Fonts 改列「提示」，不再記 ❌；`cover-inner`／`closing-inner` 改由畫布邊界檢查，避免字體度量誤報。
>    - 新增 `templates/deck.css`：5 支配方依賴的畫布基礎排版（`.slide.canvas`、`.hd`、`.title`、`.sub`）原本只存在範例裡，套進新簡報會跑版；並處理頂部導航的上邊距（124／156px）。
>    - 其他：`lint.py` 檢查 `meta.style` 是否為已就緒風格；`editorial-drama` 配方改兩層字、補「top-bar 時這頁加 `nav: none`」；`product-story` 拿掉英文小標；`storyboard.yaml` 範本的數字頁因果說明移進 `notes`；`content-shapes.md` 註明 talk 模式第三層字歸 `notes`；快速模式不再指向尚未實作的「上次偏好」。
> 3. **驗證結果**：`lint.py` 全部範例 0 錯；4 個既有範例最低對比與紀錄一致（`v4-alive-demo` 4.70、`v45-modular-demo` 4.84、`v44-keynote-demo` 4.53、`v4-demo` 4.81）且靜態全過、動態無 ❌；新回歸測試 `examples/v48-regression/`（4 套套件 11 原語＋`unlisted`＋聚光復原＋`templates/deck.css`）靜態與 `--motion` 全過，最低對比 5.02:1。重打包 `outputs/deck-architect.skill`（83 檔，369.4 KB，零 `__pycache__`，與原始碼逐位元一致）。
>
> **下一步（使用者已拍板）**：拿一份**真實簡報**從 Step 1a 跑到成品，重點觀察主柱一的顧問追問、故事種子與敘事腦力激盪的品質，以及成品是否和 Demo 一樣生動。跑完再決定是否進 Phase D。需要使用者提供一份真實需求。
>
> 主軸文件是 `ROADMAP.md`，執行紀錄在 `LOG.md`，專案規則在根目錄 `CLAUDE.md`。

_最後更新：2026-11-26_

## 新對話先做的事

1. 確認在 `presentation-skill-generation` 分支：`git branch --show-current`。不在的話先 `git fetch origin presentation-skill-generation && git checkout presentation-skill-generation`。
2. 讀這份檔案與 `ROADMAP.md`。需要背景時，再讀 `LOG.md` 的最後幾段。
3. 守住 `CLAUDE.md` 的三條規則：
   - 每個段落結束就同步：`STATUS.md`、`LOG.md`、commit、push。
   - Stop hook 會檢查有沒有沒推的變更。
   - **所有要問使用者的問題一律用互動表單（AskUserQuestion）**。每題能單獨看懂，題目互不依賴，一題最多 4 個選項，推薦的放第一個並標「（推薦）」，說明欄寫出推薦理由。
4. 驗證腳本：`scripts/lint.py` 可檢查 `storyboard.yaml` 與 `brief.md`；`scripts/check.mjs` 支援 Playwright 與系統 Chromium CDP 自動退路，加 `--motion` 可執行最多 **16 項**動態與行動實測＋生動度稽核（含風格契合）。改動底盤或腳本後，先跑 `outputs/examples/v48-regression/`（見該資料夾 README）。執行 `lint.py`/`assemble.py` 若遇 pyenv 缺 PyYAML，改用 `/usr/bin/python3`。

## 階段與進度

| 階段 | 內容 | 狀態 |
|---|---|---|
| 0–1, 2a–2b | 市場研究、v1 四次真實迭代方法論、12 款風格清單、OKLCH 用色系統、首批 3 款規格與插畫 15 種畫風淺深雙底 | ✅ |
| **Phase A** | **地基對齊與輕底盤 v4**：輕底盤＋自由畫布＋商務元件、統一像素 WCAG `check.mjs`、`oklch.py --palette`、清完 11-14 待辦、首批 Style DNA | ✅ |
| **Phase A+ 補課** | **靜態美感上限重練＋協調感精修＋去小字手術**：6 頁全通過 `4.70`–`7.52:1`，定案四大視覺工藝與原則 #26 | ✅ |
| **Phase B 預研** | **動態技術路線研究與定案**：實查 14 個 GitHub Repo（`inputs/motion-research.md`），定案 **方案 1｜分層混合** | ✅ 定案 |
| **Phase B / B.2 / B.3** | **反寫靜態工藝與原則 #26 ＋ 60fps 動態引擎 ＋ 視覺指引規格與原語（v4.3）**：`v4-alive-demo` 8 頁靜態＋7 項動態實測全過 | ✅ |
| **Phase C.1** | **真實旗艦標竿對照 ＋ v4.4-spec 規格與 Grill v2 全面升級**：三段式舞台光譜、設計樹 Grill v2（融合 `mattpocock/skills`）、原則 #27–#30、9 份核心規格反寫並重打包 | ✅ |
| **Phase C.2** | **v4.4→v4.8 全系統升級、兩大主柱終審與最終檢查**：Step 1a/1b 顧問標竿＋故事種子＋破框敘事、主柱邊界（呈現決定延到 3a）、建議附理由、主題類型總表、brief 可檢查產出、三層按需引擎＋4 套風格動態套件、聚光復原與 OKLCH 對比修正、16 項動態行動實測＋生動度與風格契合稽核 | 🟡 引擎與流程就緒／下一步真實簡報 PK |
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
| **三層按需架構＋亂中有序治理**：Layer 0 輕底盤（Overlay 優先級棧＋自動搶先接管＋`unlisted: true`）、Layer 1 講者工具（`G`/`A`/`L`/`S`）、Layer 2 11 項內容模組＋4 套風格動態套件、軟性 `[WARN]` | 11-19 / 11-26 | 原則 #24、`scripts/{deck_model.py,lint.py,assemble.py}`、`references/modules-catalog.md` |
| **兩大主柱總收斂**：主柱 1「架構與內容」（顧問標竿盲點掃描＋不循規蹈矩敘事腦力激盪＋Step 1a/1b 追問深挖與方案建議）；主柱 2「排版與呈現」（視覺吸引與引導＋依內容主題配對靜態×動態極致風格，再以場合校準） | 11-26 | 原則 #31、`SKILL.md` |
| **主柱邊界：每個決定等它需要的資訊到齊才做**（呈現層決定延到 Step 3a；Step 2 只寫 `hero`；說服載體回頭限制風格） | 11-26 | 原則 #32、`SKILL.md`、`references/{grill.md,samples.md,contexts.md,modules-catalog.md}`、`templates/{brief.md,storyboard.yaml}` |
| **故事種子先於敘事候選** | 11-26 | 原則 #33、`references/{grill.md,structure.md}`、`templates/brief.md` |
| **每個建議都要附理由**（使用者補充） | 11-26 | 原則 #34、`SKILL.md`、`references/{grill.md,samples.md,contexts.md,structure.md}` |
| **主題類型總表是唯一來源**；`stage_fit` 只標常用場合、不壓暗 | 11-26 | `references/contexts.md` 第二節、`styles/index.json` note、`assets/style-library.html` |
| **可檢查產出＋關卡拍板**（取代「不能檢查的規則不寫」）；真實簡報 PK 只用在開發階段 | 11-26 | `ROADMAP.md` 專案原則、`scripts/lint.py`（brief 檢查） |
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
| `outputs/deck-architect/` | **v4.8 完整版 Skill 原始碼（83 檔）**：兩大主柱流程（故事種子、主柱邊界、建議附理由、主題類型總表）＋三層按需引擎＋4 套風格動態套件＋`templates/deck.css`＋brief／storyboard lint＋16 項動態行動實測＋生動度與風格契合稽核 |
| `outputs/deck-architect.skill` | v4.8 打包檔（369.4 KB，83 檔，零 `__pycache__`） |
| `outputs/examples/v48-regression/` | v4.8 引擎回歸測試簡報（4 套套件 11 原語、`unlisted`、聚光復原、`templates/deck.css`；9 頁全過，最低 `5.02:1`）。改底盤或腳本後先跑這份 |
| `outputs/examples/v4-alive-demo/brief.md` | 示範用 brief（依既有虛構範例事後補寫，示範格式與 brief lint，不是主柱一實測紀錄） |
| `outputs/examples/v45-modular-demo/` | v4.5/v4.6 三層引擎與全部新／升級模組虛構技術示範（6 頁，最低對比 `4.84:1`） |
| `outputs/examples/v44-keynote-demo/` | Phase C.2 v4.4 旗艦五大新能力虛構示範（7 頁，最低對比 `4.53:1`） |
| `outputs/examples/v4-alive-demo/` | Phase B.3.2 視覺指引＋60fps 全動態互動單檔示範（8 頁，最低 `4.70:1`；v4.8 修正後聚光復原 5 頁全過） |
| `outputs/examples/v4-visual-benchmark/` | 靜態美感上限重練標竿・去小字極致留白版（6 頁全通過） |
| `outputs/examples/v4-demo/` | Phase A 初版虛構端到端範例（8 頁，最低 `4.81:1`） |
| `outputs/examples/{example,annual-section,layout-catalogue,progress-overview,test4}/` | v3 時代舊範例（如 `theme: editorial` 等舊欄位），只保留參考，不代表現行流程 |
| `inputs/presentation-principles.md` | 使用者的簡報原則，第 1–34 條（被取代的舊條目已加註） |
| `inputs/modular-capabilities-audit.md` | 10 個 GitHub 簡報 Skill 二次盤點：按需模組深化與漏網 Nice-to-Have 報告 |
| `inputs/phase-c-teardown-learnings.md` | Phase C 旗艦標竿對照與 `mattpocock/skills` 始祖回溯研究筆記（去敏版） |
| `inputs/motion-research.md` | Phase B 動態技術路線研究（14 個 GitHub Repo 實查，已定案方案 1） |
| `outputs/style-specs/`、`outputs/color-modes/`、`outputs/illustration-integration/`、`outputs/style-moodboard-v5/` | 首批風格詳規、淺深雙底配色、插畫 15 畫風融合與 12 款風格視覺錨點 |

## 待使用者決定（適時用表單確認）

- **真實簡報 PK 的題目**：由使用者提供一份真實需求（建議挑近期真的要講的簡報，例如年度成果）。
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
- **顏色一律交給瀏覽器換算（2026-11-26）**：`check.mjs` 量文字顏色與明暗極性時，在瀏覽器畫一個像素取 sRGB，不再用字串取數字；OKLCH、`color(srgb …)`、`color-mix()` 才量得準。漸層字的 OKLCH 色標另由 Node 換算。
- **聚光排程的 token 要分頁（2026-11-26）**：`runtime.js` 的聚光排程用每頁各自的 token（`WeakMap`），清前一頁不能動到下一頁；否則換頁後會卡在第 1 拍、其餘卡片一直壓暗。
- **配方要搭 `templates/deck.css`（2026-11-26）**：配方依賴 `.slide.canvas`、`.hd`、`.title`、`.sub`；`top-bar` 導航時自由畫布從 124px 起排，章內超過 2 頁出現頁籤時從 156px 起排。滿版分割頁（如 `editorial-drama` 型態 A）加 `nav: none`。
- **離線字體**：載不到 Google Fonts 時由系統字體頂替，`check.mjs` 只列提示；字體度量差異不再讓 `cover-inner`／`closing-inner` 誤報溢出（改由畫布邊界檢查）。
- **輕底盤零權重規則**：`shell.css` 對自由畫布子元素的預設 `z-index` 使用 `:where(...)` 零權重，絕不覆寫 `.back` 或投影片自訂定位。
- **SVG `<defs>` ID 隔離**：`assemble.py` 自動替每頁 `<defs>` 內的 `id` 加上 `s{idx}_` 前綴並同步改寫 `url(#...)`／`href="#..."`，防止多頁組裝後 `clipPath`／濾鏡撞名。
- **公開 repo 去敏規則**：所有範例從零虛構；真實標竿拆解只將抽象方法論寫進 `inputs/` 與 `LOG.md`，絕不提交內部公司名、專案代號、真實數據、個人資訊或大型二進位影音檔。
- **授權與引入外部動畫庫規則**：`op7418/guizang-ppt-skill` 與 `chuspeeism/dashi-ppt-skill` 為 **AGPL-3.0**（僅學架構概念，不抄碼）；`borjaperfra/beatdeck` 已實查 `LICENSE` 確認為 **MIT**；引入 GSAP 前必依 `rules/CLAUDE.base.md` 先說明為何原生 CSS／WAAPI 做不到並經使用者同意。
