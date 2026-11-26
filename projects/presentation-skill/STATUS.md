# 狀態：presentation-skill（deck-architect）

> **最新接手點（2026-11-25｜Phase C.1 規格與文件層升級完成 ✅：`deck-architect` v4.4-spec｜三段式舞台光譜 ＋ Matt Pocock 始祖設計樹 Grill v2 ＋ 原則 #27–#30 反寫，底盤引擎留待下一輪）**：
>
> 1. **Phase C 旗艦標竿對照與 `mattpocock/skills` 始祖回溯完成**（去敏研究筆記存於 `inputs/phase-c-teardown-learnings.md`）：
>    - 完整拆解一份 43 頁、含 6 支 MP4 與 1 支實測音檔的旗艦級 PPTX 標竿，與 Phase C 21 頁暗色 HTML 初版實測（WCAG 最低 `5.80:1`）並排比對，診斷出 7 項核心架構缺口（單一極性暗卡片疲勞、缺乏去框化編輯與實物具象化、影音與活 Demo 原語空白、全自動演繹缺講者點擊懸念、常駐頂列過重、缺乏 Keynote 戲劇層與原則 #26 原話證言豁免）。
>    - 同步查閱 `github.com/mattpocock/skills`（`grilling`、`DESIGN-IT-TWICE`、`writing-fragments`、`writing-beats`、`writing-shape`、`writing-for-agents`），補齊 Step 1 Grill 的結構斷層。
> 2. **使用者拍板四大核心設計定案（反寫入 `inputs/presentation-principles.md` 原則 #27–#30 與 `outputs/deck-architect/` v4.4-spec 共 9 份核心規格檔，重新打包 `outputs/deck-architect.skill` 29 檔、143.0 KB）**：
>    - **三段式舞台光譜（`stage_mode`：`briefing`／`pitch`／`keynote`）**：依場合動態決定是否啟用光暗雙極節奏、去框化比例（`keynote` ≥40–50% 無圓角框＋五大高階無框／融合原型）、導航殼層（`top-bar`／`minimal-side`／`divider-only`）與戲劇層，絕不一刀切。
>    - **Step 1 Grill v2（設計樹前沿，不設輪次上限）**：融合 Matt 始祖機制——Pre-Flight 先查事實只問決定、設計樹動態推進直到前沿全空（零靜默假設）、Explore 挖掘體感預期與承重母題（Leading Motif）、**標準模式全面必給至少 1 個跳脫思維破框候選**（`DESIGN-IT-TWICE`＋主見推薦）、Grounding 概念著陸順序、逐章說服載體辯論（Proof Medium）與素材缺口點破（Gap-Naming），輸出直通 Step 2 與 Gate 2 的 `templates/brief.md` v2 交接契約。
>    - **雙軌節拍控制**：90%+ 一般頁維持一鍵翻頁自動視覺指引，`pitch`／`keynote` 關鍵 1–3 頁開放講者可控點擊步進（`data-step`）。
>    - **雙軌多媒體與活 Demo**：真實影片／實測音檔採外連媒體控制原語（不灌爆 Base64、翻頁自動停播）；產品流程示範與照片輪播採輕量 HTML5/CSS/SVG 原生動畫實現。
> 3. **驗證通過**：`outputs/deck-architect.skill` 重新打包（29 檔，143.0 KB，零 `__pycache__`）；既有虛構範例 `v4-alive-demo` 與 `v4-demo` 執行 `lint.py` 皆 0 錯 0 警通過；全數變更零內部敏感資訊。
>
> **下一步（Phase C.2｜v4.4 底盤引擎升級）**：將本輪規格定案的引擎能力實作進 `assets/runtime.js`、`assets/shell.css`、`scripts/assemble.py` 與 `scripts/check.mjs`（單頁極性 `data-surface`、自動隱藏底控與 `divider-only` 導航、講者點擊步進 `data-step`、外連 `<video>`/`<audio>` 媒體控制器、HTML5 原生活產品流程輪播與 3D 照片輪播），完成後再做 Phase C 實戰重構 PK 驗收。
>
> 主軸文件是 `ROADMAP.md`，執行紀錄在 `LOG.md`，專案規則在根目錄 `CLAUDE.md`。

_最後更新：2026-11-25_

## 新對話先做的事

1. 確認在 `presentation-skill-generation` 分支：`git branch --show-current`。不在的話先 `git fetch origin presentation-skill-generation && git checkout presentation-skill-generation`。
2. 讀這份檔案與 `ROADMAP.md`。需要背景時，再讀 `LOG.md` 的最後幾段。
3. 守住 `CLAUDE.md` 的三條規則：
   - 每個段落結束就同步：`STATUS.md`、`LOG.md`、commit、push。
   - Stop hook 會檢查有沒有沒推的變更。
   - **所有要問使用者的問題一律用互動表單（AskUserQuestion）**。每題能單獨看懂，題目互不依賴，一題最多 4 個選項，推薦的放第一個並標「（推薦）」。
4. 驗證腳本 `scripts/check.mjs` 已支援 Playwright 與系統 Chromium CDP 自動退路，加 `--motion` 可一併執行 7 項動態與視覺指引實測；執行 `lint.py` 若遇 pyenv 缺 PyYAML，改用 `/usr/bin/python3`。

## 階段與進度

| 階段 | 內容 | 狀態 |
|---|---|---|
| 0–1, 2a–2b | 市場研究、v1 四次真實迭代方法論、12 款風格清單、OKLCH 用色系統、首批 3 款規格與插畫 15 種畫風淺深雙底 | ✅ |
| **Phase A** | **地基對齊與輕底盤 v4**：輕底盤＋自由畫布＋商務元件、統一像素 WCAG `check.mjs`、`oklch.py --palette`、清完 11-14 待辦、首批 Style DNA | ✅ |
| **Phase A+ 補課** | **靜態美感上限重練＋協調感精修＋去小字手術**：6 頁全通過 `4.70`–`7.52:1`，定案四大視覺工藝與原則 #26 | ✅ |
| **Phase B 預研** | **動態技術路線研究與定案**：實查 14 個 GitHub Repo（`inputs/motion-research.md`），定案 **方案 1｜分層混合** | ✅ 定案 |
| **Phase B / B.2 / B.3** | **反寫靜態工藝與原則 #26 ＋ 60fps 動態引擎 ＋ 視覺指引規格與原語（v4.3）**：`v4-alive-demo` 8 頁靜態＋7 項動態實測全過 | ✅ |
| **Phase C.1** | **真實旗艦標竿對照 ＋ v4.4-spec 規格與 Grill v2 全面升級**：三段式舞台光譜、設計樹 Grill v2（融合 `mattpocock/skills`）、原則 #27–#30、9 份核心規格反寫並重打包 | ✅ |
| **Phase C.2** | **v4.4 底盤引擎實作 ＋ 真實簡報 PK 複驗 🎯**：實作單頁極性 `data-surface`、自動隱藏底控、`data-step` 點擊步進、外連 `<video>`/`<audio>` 媒體控制器、HTML5 原生活產品流程輪播／3D 照片輪播，並以真實簡報複驗 | ⏭ 下一步 |
| **Phase D** | **多元風格庫全面成形**：補齊其餘 8 款 Style DNA（各含淺深規則與動效個性）、整理插畫 15 種畫風配方表、主題→風格智能配對（穩健／大膽／驚喜）與外觀帳本 | 未開始 |
| **Phase E** | **交付、修改閉環與記憶**：成品按 `E` 改字回寫、畫面上點選留言修改、雙螢幕講者模式、文字可編輯 PPTX 匯出、品味記憶與獨立評審、評估搬進 `skills/` 正式安裝 | 未開始 |

## 已經定案的事

| 決定 | 日期 | 寫在哪裡 |
|---|---|---|
| 風格清單十二款（插畫場景、積木構成、水彩水墨、Apple 發表、書卷刻本、顧問報告、孔版小誌、摩登金、日常工作款、攝影雜誌、年輕潮流、在地懷舊） | 11-18 | `inputs/style-list-v5.md`、`styles/index.json` |
| 首批四款完整 Style DNA：顧問報告、Apple 發表、插畫場景（含 15 種畫風）、日常工作款（現代 Bento） | 11-23 | `outputs/deck-architect/styles/` |
| **用色鎖規則、不鎖色碼、不放品牌色、全部風格淺深雙底** | 11-19 | 原則 #17–19、`styles/color-system.md` |
| **風格本質固定，元素、用色、介面依內容調整；變暗不等於夜晚** | 11-19 | 原則 #21–22、`styles/illustration.md` |
| **多元風格採生成式 Style DNA**，放棄原 2c 19×4 靜態排法矩陣 | 11-19 | 原則 #23、`ROADMAP.md` |
| **輕底盤、強自由混合架構**：Thin Shell 鎖基礎設施＋商務表格元件；90%+ 視覺頁由 Agent 自由編排 | 11-19 | 原則 #24、`outputs/deck-architect/` |
| **預設零等待全自動產出＋可選 `IMAGE_UPGRADE.md`**：每頁預留 `.asset-slot[data-slot]` 可無縫換入 AI 底圖或照片，本機圖檔自動內嵌單檔 | 11-23 | 原則 #25、`scripts/assemble.py` |
| **四大靜態視覺工藝標準＋原則 #26（含三項合法豁免）**：真實 AI 無字底圖融合、現代 Bento、數據故事化、精緻暗場；`delivery: talk` 每一般群組 ≤2 層文字（豁免：原話暗房證言、產品情感短句、活流程步進微標） | 11-23 / 11-25 | 原則 #26、`references/presentation-rules.md` |
| **Phase B 動態技術路線＝方案 1｜分層混合 ＋ Phase B.3 視覺指引規範**：60fps GPU 核心、6 種敘事切頁、三層聚光壓暗、因果現場演變、真描線／方向揭露／分段靜讀與語意順序優先 | 11-23 / 11-24 | `references/motion-system.md`、`references/visual-guidance.md` |
| **三段式舞台光譜（`stage_mode`：`briefing`/`pitch`/`keynote`）**：依場合動態決定光暗雙極、去框化比例、導航模式與戲劇層，絕不一刀切 | 11-25 | 原則 #27、`references/contexts.md`、`references/visual-guidance.md` |
| **Step 1 Grill v2（融合 `mattpocock/skills` 始祖機制）**：設計樹前沿不設輪次上限直到零靜默假設、先查事實只問決定、體感預期＋承重母題、**標準模式全面必給 1 個跳脫思維破框候選**、Grounding 著陸與說服載體辯論 | 11-25 | 原則 #28、`references/grill.md`、`references/structure.md`、`templates/brief.md` |
| **雙軌節拍（自動指引＋講者 `data-step`）＋雙軌多媒體（外連影音＋HTML5 原生活 Demo）**：真實影音外連不膨脹單檔，產品流程與照片輪播採輕量 HTML5 原生動畫 | 11-25 | 原則 #29–30、`references/visual-guidance.md`、`references/motion-system.md` |

## 交付物地圖

| 路徑 | 內容 |
|---|---|
| `outputs/deck-architect/` | **v4.4-spec 現行 Skill 原始碼（29 檔：已升級 `SKILL.md`、`grill.md` v2、`contexts.md`、`structure.md`、`samples.md`、`visual-guidance.md`、`presentation-rules.md`、`motion-system.md`、`templates/brief.md`；引擎仍為 v4.3 60fps 核心）** |
| `outputs/deck-architect.skill` | v4.4-spec 打包檔（143.0 KB，29 檔，零 `__pycache__`） |
| `inputs/phase-c-teardown-learnings.md` | Phase C 旗艦標竿對照與 `mattpocock/skills` 始祖回溯研究筆記（去敏版） |
| `inputs/presentation-principles.md` | 使用者的簡報原則，第 1–30 條 |
| `outputs/examples/v4-alive-demo/` | Phase B.3.2 視覺指引＋60fps 全動態互動單檔示範（8 頁全過，最低 `4.70:1`） |
| `outputs/examples/v4-visual-benchmark/` | 靜態美感上限重練標竿・去小字極致留白版（6 頁全通過） |
| `outputs/examples/v4-demo/` | Phase A 初版虛構端到端範例（供對照演進） |
| `inputs/motion-research.md` | Phase B 動態技術路線研究（14 個 GitHub Repo 實查，已定案方案 1） |
| `outputs/style-specs/`、`outputs/color-modes/`、`outputs/illustration-integration/`、`outputs/style-moodboard-v5/` | 首批風格詳規、淺深雙底配色、插畫 15 畫風融合與 12 款風格視覺錨點 |

## 待使用者決定（適時用表單確認）

- **（下一輪）Phase C.2 引擎實作啟動節奏**：是否直接開工實作 v4.4 輕底盤引擎（`data-surface` 單頁極性、自動隱藏底控與 `divider-only` 導航、`data-step` 講者點擊步進、外連 `<video>`/`<audio>` 控制器、HTML5 原生活產品流程輪播與 3D 照片輪播），並在完成後以虛構範例＋Phase C 實戰頁 PK 驗證。
- 埃及壁畫、瑪雅抄本是否要生圖做升級插槽實測。
- 日式留白之後要不要在 Phase D 當獨立一款。
- `deck-architect` 什麼時間點搬進 `skills/` 由 `install.sh` 全域安裝（建議 Phase C 或 E 後）。
- git 歷史殘留的一組無上下文步驟數字是否要再改寫歷史。

## 製作與驗證的眉角

- **生圖提示避坑（2026-11-20 實測）**：AI 生圖提示詞不可寫 `"left 60% ... right 40% ..."`，容易被誤解成分割雙圖（diptych）產生垂直硬接縫！改用單一連續場景空間描述即可生成無接縫攝影。
- **「零等待」不等於「廉價幾何 SVG 假裝插畫」**：插畫／黏土／攝影類風格要用真實無字 AI 底圖（或明確提示生圖）；純程式頁則靠 Bento 儀表板、實景 UI、數據單位矩陣、微光景深拉滿質感。
- **CSS 簡寫避坑**：`font:` 簡寫裡不可寫 `inherit` 當字體名（會整條失效退回 16px）；改用明確的 `font-weight`／`font-size`／`line-height` 或 `var(--font-body)`。
- **漸層字像素對比檢查**：`check.mjs` 會對漸層字加上暫時隱藏類 `.__check_hide_grad`（`opacity: 0`）再截底圖，才能量到真正的背景舞台。
- **輕底盤零權重規則**：`shell.css` 對自由畫布子元素的預設 `z-index` 使用 `:where(...)` 零權重，絕不覆寫 `.back` 或投影片自訂定位。
- **SVG `<defs>` ID 隔離**：`assemble.py` 自動替每頁 `<defs>` 內的 `id` 加上 `s{idx}_` 前綴並同步改寫 `url(#...)`／`href="#..."`，防止多頁組裝後 `clipPath`／濾鏡撞名。
- **公開 repo 去敏規則**：所有範例從零虛構；真實標竿拆解只將抽象方法論寫進 `inputs/` 與 `LOG.md`，絕不提交內部公司名、專案代號、真實數據、個人資訊或大型二進位影音檔。
- **授權與引入外部動畫庫規則**：`op7418/guizang-ppt-skill` 與 `chuspeeism/dashi-ppt-skill` 為 **AGPL-3.0**（僅學架構概念，不抄碼）；`borjaperfra/beatdeck` 已實查 `LICENSE` 確認為 **MIT**；引入 GSAP 前必依 `rules/CLAUDE.base.md` 先說明為何原生 CSS／WAAPI 做不到並經使用者同意。
