# 狀態：presentation-skill（deck-architect）

> **最新接手點（2026-11-19｜第一性原理覆盤定案）**：
>
> 進入原 2c 前完成全專案第一性原理覆盤，確認「依主題提供多元驚豔風格」是初衷核心，但放棄原 2c「19 結構 × 3–5 排法 × 12 風格」的靜態模板窮舉，重構為 **Phase A → E** 五階段路線：
>
> - **底層架構**：輕底盤、強自由的混合架構（Thin Shell 鎖導航／動態／附件／講者與高頻商務表格元件；90%+ 頁面視覺由 Agent 依 Style DNA 自由編排 HTML/CSS/SVG）。
> - **多元風格庫**：全數保留 12 款風格＋15 種插畫畫風，收斂為精煉的「生成式風格憲法（Style DNA）」。
> - **插畫與攝影實戰分工**：預設全自動零等待產出完整可看程式版，同時預留每頁圖像層可替換插槽並附可選的 `IMAGE_UPGRADE.md`（AI 生圖或真實照片一鍵升級）。
> - **優先順序**：先接軌底盤與首批 3 款（Phase A）→ 提前注入 HTML 動態（Phase B）→ 第一份真實簡報端到端與 Codex 版 PK（Phase C）→ 補齊其餘 9 款 Style DNA 與主題智能配對（Phase D）→ 交付修改閉環與記憶（Phase E）。
>
> **下一步**：開始執行 **Phase A｜地基對齊與輕底盤 v4**。
>
> 主軸文件是 `ROADMAP.md`，執行紀錄在 `LOG.md`，專案規則在根目錄 `CLAUDE.md`。

_最後更新：2026-11-19_

## 新對話先做的事

1. 確認在 `presentation-skill-generation` 分支：`git branch --show-current`。不在的話先 `git fetch origin presentation-skill-generation && git checkout presentation-skill-generation`。
2. 讀這份檔案與 `ROADMAP.md`。需要背景時，再讀 `LOG.md` 的最後幾段。
3. 守住 `CLAUDE.md` 的三條規則：
   - 每個段落結束就同步：`STATUS.md`、`LOG.md`、commit、push。
   - Stop hook 會檢查有沒有沒推的變更。
   - **所有要問使用者的問題一律用互動表單（AskUserQuestion）**。每題能單獨看懂，題目互不依賴，一題最多 4 個選項，推薦的放第一個並標「（推薦）」。
4. 畫圖與檢查要用 Playwright 的 Chromium，見文末「製作與驗證的眉角」。

## 階段與進度

**已完成基礎**：

- 階段 0：研究、規劃、方法論梳理 ✅
- 階段 1：v0 骨架、v1 四次真實簡報迭代（支柱 ① 方法論）✅
- 原階段 2a–2b：風格研究、12 款方向定案、OKLCH 用色系統、首批 3 款規格（Apple 發表、顧問報告、插畫場景 15 種畫風融合版與淺深雙底）✅

**新版執行路線（Phase A → E，詳見 `ROADMAP.md`）**：

| 階段 | 內容 | 狀態 |
|---|---|---|
| **Phase A** | **地基對齊與輕底盤 v4**：解凍 `deck-architect`（原則 #12–#25、清掉 11-14 實測待辦）；建立輕底盤 `deck-shell`＋自由編排契約＋商務穩定元件；把 `render.cjs` 像素級 WCAG 對比合併進 `check.mjs`；將首批 3 款 Style DNA 與明暗／三組配色接進 Gate 2 | ⏭ 下一步 |
| **Phase B** | **注入 HTML 獨有的「活」**：可打斷 spring 動態（MIT `apple-design`）、依軸運鏡、Magic Move 跨頁延續、微動態背景與效能降級、動態圖表／滾動數字；圖像層零等待程式版＋可替換插槽與 `IMAGE_UPGRADE.md` 接圖管線 | 未開始 |
| **Phase C** | **第一份真實簡報端到端 PK 🎯**：全新 Agent 只靠 `SKILL.md` 跑完全程，產出會動的多頁成品與原本 Codex 版直接比較並回修 | 未開始 |
| **Phase D** | **多元風格庫全面成形**：補齊其餘 9 款 Style DNA（各含淺深規則與動效個性）、整理插畫 15 種畫風配方表、主題→風格智能配對（穩健／大膽／驚喜）與外觀帳本 | 未開始 |
| **Phase E** | **交付、修改閉環與記憶**：成品按 `E` 改字回寫、畫面上點選留言修改、雙螢幕講者模式、文字可編輯 PPTX 匯出、品味記憶與獨立評審、評估搬進 `skills/` 正式安裝 | 未開始 |

## 已經定案的事

| 決定 | 日期 | 寫在哪裡 |
|---|---|---|
| 風格清單十二款（見下方註一） | 11-18 | `inputs/style-list-v5.md` |
| 首批深做三款：插畫場景、Apple 發表、顧問報告 | 11-19 | `LOG.md` |
| **用色鎖規則、不鎖色碼**：做簡報時依主題推薦三組配色讓使用者選；不放公司品牌色 | 11-19 | 原則第 17、18 條；`color-system.md` |
| **全部風格都要淺、深兩種底**；做簡報時依場合先選明暗，再推薦三組配色 | 11-19 | 原則第 19 條；`color-system.md` |
| **風格本質固定，元素、用色、介面依內容調整** | 11-19 | 原則第 21 條；`outputs/style-specs/README.md` |
| 插畫場景共十五種畫風（見下方註二）；版面以 A 全景環繞為主，B、C 依內容穿插（見下方註三） | 11-19 | 原則第 20 條；`illustration.md` |
| 融合規則採全頁同源底材、物件與文字結構互動、高紋理畫風用內生題箋 | 11-19 | `illustration.md` 規則 2、6、8、9 |
| 顧問報告走色塊策略混搭巨大數字；Apple 裝置在淺深舞台都維持深色玻璃 | 11-18/19 | `counsel.md`、`apple.md` |
| **變暗不等於夜晚**：只換光線或材質本身的深色款；時間記號跟內容走；B 版面載體跟著變深；梵谷兩版都畫白天 | 11-19 | 原則第 22 條；`illustration.md` |
| **多元風格採「生成式風格憲法（Style DNA）」**：保留 12 款＋15 種插畫畫風，放棄預做 19×4 靜態排法矩陣 | 11-19 | 原則第 23 條；`ROADMAP.md` |
| **輕底盤、強自由混合架構**：底盤只鎖舞台、可客製導航契約、動態、附件返回、講者與高頻商務表格元件；90%+ 視覺頁由 Agent 自由編排 | 11-19 | 原則第 24 條；`ROADMAP.md` |
| **預設全自動零等待＋可選 `IMAGE_UPGRADE.md`**：先由程式一次產出完整可看版，每頁圖像層預留可替換插槽供使用者視需要換進 AI 底圖或真實照片 | 11-19 | 原則第 25 條；`ROADMAP.md` |
| **新版五階段 Roadmap（Phase A → E）** | 11-19 | `ROADMAP.md` |

**註一：十二款風格**
插畫場景、積木構成、水彩水墨、Apple 發表、書卷刻本、顧問報告、孔版小誌、摩登金、日常工作款、攝影雜誌、年輕潮流、在地懷舊。

**註二：插畫場景十五種畫風**
紙黏土、手繪、霓虹、復古卡通、兒童手繪、素描、山洞岩畫、埃及壁畫、漢畫像石拓片、瑪雅抄本、皮影戲、浮世繪、梵谷筆觸、吶喊（孟克）、8bit 像素。

**註三：插畫的三種版面**
C 內容住進場景（人物、步驟、地點、時間軸、標註）；B 文字在物件上（標題頁、重點清單、高紋理畫風）；A 全景環繞（其餘內容頁）。

## 交付物地圖

| 路徑 | 內容 |
|---|---|
| `outputs/deck-architect/` | **Skill 原始碼（目前凍結於 v3.0，將在 Phase A 全面升級為 v4 輕底盤＋自由畫布架構）** |
| `outputs/style-specs/` | 首批三款規格（`apple.md`、`counsel.md`、`illustration.md`）與共用用色系統 `color-system.md`；Phase A 將提煉成 Agent 可直接執行的 Style DNA 放進 Skill |
| `outputs/color-modes/` | Apple 與顧問的淺、深兩種底各三組配色（12 張，`sheet.jpg`）；`make.py` 含漸層字對比檢查 |
| `outputs/illustration-integration/` | 插畫 15 種畫風融合版與淺深雙底參考樣張（`sheet3.jpg`、`sheet4.jpg`、`sheet5.jpg`），含 `render.cjs` 真實背景像素 WCAG 檢查腳本（Phase A 將合併進 `check.mjs`） |
| `outputs/style-moodboard-v5/` | 12 款風格意象圖與審閱頁（Phase D 撰寫其餘 9 款 Style DNA 的視覺錨點） |
| `outputs/tools/oklch.py` | OKLCH 與 WCAG 對比量測工具（Phase A 併入 Skill 腳本工具鏈） |
| `inputs/presentation-principles.md` | 使用者的簡報原則，第 1–25 條 |
| `inputs/reference-styles.md` | 參考簡報《AI 的第三次搬家》技術解剖（整頁背景圖＋獨立真文字層） |

## 下一步：Phase A 細部任務清單

1. **設計並實作 v4 輕底盤契約（`deck-shell`）**：
   - 定義單一 `deck.html` 結構契約：外殼提供 1920×1080 舞台、鍵盤／點擊翻頁、單一資料來源導航／目錄／頁籤掛鉤（允許各風格 CSS 自由定義位置與造型）、震撼頁黑幕停頓、附件點入與返回、系統字體離線退路。
   - 保留高頻商務穩定元件（週報 `status-table`、`check_reports.py`、`pillars` 一頁總覽骨架）與 `storyboard.yaml`＋`lint.py` 敘事守門員。
   - 讓每一頁內容區成為 Agent 可依 Style DNA 自由編排 HTML/CSS/SVG 的畫布（並預留圖像層可替換插槽規範）。
2. **升級品管與規則檢查（`lint.py` + `check.mjs`）**：
   - 把 `render.cjs` 的「隱藏文字截圖→取真實背景像素第 10/90 百分位算 WCAG 對比」與 `make.py` 的漸層字對比檢查合併進統一的 `check.mjs`，並移入 `oklch.py`。
   - 一次清掉 2026-11-14 實測遺留的 `lint.py`／`grill.md` 待辦：頁數算術檢查、依播放方式與每頁分鐘數調字數上限、附件頁指引、brief 限制與地雷寫進 storyboard、簡體來源轉換指引、步驟 `detail` 斷行、大數字與內文斷行優化、樣張頁數與招牌頁挑選。
3. **整理首批 3 款 Style DNA 並接通新 Gate 2 流程**：
   - 將 `apple.md`、`counsel.md`、`illustration.md`＋`color-system.md` 收斂成 Agent 好讀、高密度的 Style DNA 參考檔寫進 `outputs/deck-architect/styles/`。
   - 更新 `SKILL.md` 與 `references/`：移除已被否決的「3a 灰階選排版 → 3b 選風格」兩步流程，改為「storyboard 確認內容形狀 → 單一視覺關卡 Gate 2（依主題端出 3 款風格樣張＋明暗選擇與三組 OKLCH 主題配色）→ 自由編排整份簡報＋自動 `check.mjs` 驗收」。
4. **虛構範例端到端自測**：用新 v4 架構跑通範例並通過統一 `check.mjs`，驗證零報錯後進入 **Phase B（動態與 AI 底圖插槽）**。

## 待使用者決定（不擋 Phase A，適時用表單確認）

- Phase C 真實簡報端到端 PK 要沿用「內部工具推廣與部署說明」（可與當時的 Codex 6 頁成品對照），還是改用一份新的真實簡報（同時確認成本行顯眼度與附件頁）。
- 埃及壁畫、瑪雅抄本是否要生圖做升級驗證（Phase B 接圖管線完成後正好可實測）。
- 日式留白之後要不要在 Phase D 當獨立一款。
- `deck-architect` 什麼時間點搬進 `skills/` 讓 `install.sh` 安裝（建議 Phase C 或 E 驗收後）。
- git 歷史殘留的一組無上下文步驟數字是否要再改寫歷史。

## 使用者偏好與規則

- **所有問題一律用互動表單問**（`CLAUDE.md` 規則三）。
- **總結永遠不當主標題**：主標題只寫題目，是頁面上最大的字；總結只出現在內文，關鍵字用強調色。
- **重點只用顏色標示**，不畫底線。無彩色焦點時內文改灰、關鍵字用墨色。
- **版面上下的限制**：頁面上下除了章節導航不放其他冗餘文字。
- **引言**用英文引號 “ ”。
- **裝飾可以和文字交錯**，可讀性由像素級 WCAG 對比與溢出檢查把關。
- **底色與漸層**：不用純白或純黑；不用紫色主調漸層（OKLCH H 280–335）。
- **用色**：鎖規則、不鎖色碼、不放品牌色；全部風格都要淺、深兩種底；變暗不等於夜晚。
- **插畫場景**：背景與元素融合（A／B／C、同源底材、結構互動、內生題箋），不左文右圖、不把場景框成一幅畫。
- **零等待＋可選生圖**：預設程式一次產出完整可看版，同時提供可選 `IMAGE_UPGRADE.md` 與可替換插槽。
- **檔案保密**：含公司內部資訊的簡報檔不上傳，只記抽象結論；範例一律從零虛構。
- **排版**：相鄰兩頁不雷同，同類內容（`series`）保持一致；內容形狀由敘事決定。

## 製作與驗證的眉角

- **Playwright Chromium**：要走 session 的 proxy 才載得到 Google Fonts：`chromium.launch({ proxy: { server: process.env.HTTPS_PROXY } })`。
- **像素級對比檢查**：隱藏文字截圖取字形範圍第 10／90 百分位亮度算 WCAG 對比；漸層字另逐段對底色檢查。
- **踩過的 SVG／HTML 坑**：
  - 全域變數不要叫 `top`（會與 `window.top` 衝突）。
  - SVG 的 `id`（`clipPath`、漸層、群組）不可重複。
  - 畫面邊緣暗角易讓邊角文字對比不足。
  - 深色底上不可用 `mix-blend-mode: multiply` 疊顏料（會整片消失）。
  - SVG 弧線半徑小於弦長一半會被瀏覽器自動放大變形。
- **引入 GSAP 規則**（`rules/CLAUDE.base.md`）：先用 CSS／WAAPI／Spring；若需引入 GSAP 必須先問使用者並說明為何 CSS 做不到。
- **工作節奏**：每個有產出或決策的段落結束即同步 `STATUS.md`、`LOG.md`、commit、push。

## 歷史摘要

詳見 `LOG.md`。
- **v1（11-09～11-14）**：方法論與四次真實簡報迭代完成。
- **v2～v3.0（11-14）**：設計系統與 70 種通用排法完成；實測發現先排版再風格會不搭、排法偏傳統，凍結技能本體。
- **原 2a–2b（11-15～11-19）**：風格清單收斂為 12 款；完成 OKLCH 用色系統與首批 3 款規格（含 Apple／顧問淺深版、插畫 15 種畫風融合版與淺深雙底）。
- **第一性原理覆盤（11-19）**：診斷技能本體與靜態樣張脫鉤、原 2c 組合爆炸與 HTML 動態缺席，定案輕底盤強自由混合架構＋Style DNA＋零等待可選升級插槽，重構為 Phase A–E。
