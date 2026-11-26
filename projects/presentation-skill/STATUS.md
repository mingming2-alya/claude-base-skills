# 狀態：presentation-skill（deck-architect）

> **最新接手點（2026-11-26｜`deck-architect` v4.7.5 Step 1 拆為兩階段腦力激盪：1a 架構腦力激盪 → 1b 細節腦力激盪 ✅）**：
>
> 1. **依使用者指示將 Step 1 明確拆為兩階段並各自設關卡**（與 Step 3 的 3a 圖鑑 → 3b 單風格樣張前後對稱）：
>    - **Step 1a｜架構腦力激盪（⛔ 關卡 1a）**：先完成 Pre-Flight 靜默偵察 → 收斂節點群 A（理性終點 × 體感預期、對象基線、`stage_mode`、頁數算術、人際顧慮、既有框架）＋節點群 B（承重母題＋3 選 1 破框架構候選）→ **拍板骨架才往下走，絕不在錯架構上浪費腦力挖細節**。
>    - **Step 1b｜細節腦力激盪（⛔ 關卡 1b → `brief.md`）**：沿鎖定骨架展開節點群 C（依 `stage_mode` 三段自動調檔：逐章唯一記憶點、Grounding、白話招牌亮點頁提案、內容減法清單、說服載體與素材缺口、幕後映射按需模組與 `motion_dna`）＋節點群 D（數字查核、`constraints` 地雷、`shock`/`data-step` 控場、一句話核心訊息）→ 產出完整 `brief.md` 簽核後才進 Step 2。
>    - **快速模式捷徑**：趕時間或例行週會時，自動將 1a＋1b 合併壓縮為 1–2 輪快篩（≤5 題）。
> 2. **全鏈路同步與重打包**：
>    - 同步更新 `SKILL.md`、`references/grill.md`、`templates/brief.md`（標明第 1–4 節屬 1a、第 5–8 節屬 1b，並補上 4 套 `motion-*` 核選框）、`references/contexts.md` 與 `references/samples.md`，清零舊「單輪 Step 1／關卡一」殘留。
>    - 重新打包 `outputs/deck-architect.skill`（**82 檔，341.9 KB**，零 `__pycache__`）。
>
> **下一步（Phase C.2 收官驗收 → Phase D）**：`deck-architect` v4.7.5 已達無斷層就緒狀態，隨時可以真實簡報進行端到端實戰 PK 複驗，或推進 **Phase D｜補齊其餘 8 款「靜態上限 × 動態上限一體」Style DNA**。
>
> 主軸文件是 `ROADMAP.md`，執行紀錄在 `LOG.md`，專案規則在根目錄 `CLAUDE.md`。

_最後更新：2026-11-26_

## 新對話先做的事

1. 確認在 `presentation-skill-generation` 分支：`git branch --show-current`。不在的話先 `git fetch origin presentation-skill-generation && git checkout presentation-skill-generation`。
2. 讀這份檔案與 `ROADMAP.md`。需要背景時，再讀 `LOG.md` 的最後幾段。
3. 守住 `CLAUDE.md` 的三條規則：
   - 每個段落結束就同步：`STATUS.md`、`LOG.md`、commit、push。
   - Stop hook 會檢查有沒有沒推的變更。
   - **所有要問使用者的問題一律用互動表單（AskUserQuestion）**。每題能單獨看懂，題目互不依賴，一題最多 4 個選項，推薦的放第一個並標「（推薦）」。
4. 驗證腳本 `scripts/check.mjs` 已支援 Playwright 與系統 Chromium CDP 自動退路，加 `--motion` 可一併執行最多 **15 項**動態與行動實測（含閱讀期靜止反永動＋390px 手機實測）＋Liveliness Audit 生動度稽核；執行 `lint.py`/`assemble.py` 若遇 pyenv 缺 PyYAML，改用 `/usr/bin/python3`。

## 階段與進度

| 階段 | 內容 | 狀態 |
|---|---|---|
| 0–1, 2a–2b | 市場研究、v1 四次真實迭代方法論、12 款風格清單、OKLCH 用色系統、首批 3 款規格與插畫 15 種畫風淺深雙底 | ✅ |
| **Phase A** | **地基對齊與輕底盤 v4**：輕底盤＋自由畫布＋商務元件、統一像素 WCAG `check.mjs`、`oklch.py --palette`、清完 11-14 待辦、首批 Style DNA | ✅ |
| **Phase A+ 補課** | **靜態美感上限重練＋協調感精修＋去小字手術**：6 頁全通過 `4.70`–`7.52:1`，定案四大視覺工藝與原則 #26 | ✅ |
| **Phase B 預研** | **動態技術路線研究與定案**：實查 14 個 GitHub Repo（`inputs/motion-research.md`），定案 **方案 1｜分層混合** | ✅ 定案 |
| **Phase B / B.2 / B.3** | **反寫靜態工藝與原則 #26 ＋ 60fps 動態引擎 ＋ 視覺指引規格與原語（v4.3）**：`v4-alive-demo` 8 頁靜態＋7 項動態實測全過 | ✅ |
| **Phase C.1** | **真實旗艦標竿對照 ＋ v4.4-spec 規格與 Grill v2 全面升級**：三段式舞台光譜、設計樹 Grill v2（融合 `mattpocock/skills`）、原則 #27–#30、9 份核心規格反寫並重打包 | ✅ |
| **Phase C.2** | **v4.4→v4.7.5 全系統升級完成**：Step 1a/1b 兩階段腦力激盪、三層按需引擎＋4 套風格動態原語套件、靜態×動態融合 1920×1080 圖鑑、視覺指引第二核心（自動搶先接管＋`data-step` 聯動）、>6 頁分批乾淨分身、5 支黃金配方、風格跨界防呆、15 項動態行動實測＋Liveliness Audit 全完成 ✅；待真實簡報實戰 PK 複驗收官 | 🟡 引擎與流程完成／待實戰 PK |
| **Phase D** | **多元風格庫全面成形**：補齊其餘 8 款「靜態×動態一體」Style DNA（各含淺深規則與風格動態套件並上架 `style-library.html`）、整理插畫 15 種畫風配方表、主題→風格智能配對與外觀帳本 | 未開始 |
| **Phase E** | **交付、修改閉環與記憶**：成品按 `E` 改字回寫、畫面上點選留言修改、文字可編輯 PPTX 匯出、品味記憶與獨立評審、評估搬進 `skills/` 正式安裝（註：雙螢幕講者模式 `S` 鍵已提前於 v4.5 完成） | 未開始 |

## 已經定案的事

| 決定 | 日期 | 寫在哪裡 |
|---|---|---|
| 風格清單十二款（插畫場景、積木構成、水彩水墨、Apple 發表、書卷刻本、顧問報告、孔版小誌、摩登金、日常工作款、攝影雜誌、年輕潮流、在地懷舊） | 11-18 | `inputs/style-list-v5.md`、`styles/index.json` |
| 首批四款完整「靜態×動態一體」Style DNA：顧問報告、Apple 發表、插畫場景（含 15 種畫風）、日常工作款（現代 Bento） | 11-23 / 11-26 | `outputs/deck-architect/styles/`、`assets/style-library.html`、`assets/modules/motion/` |
| **用色鎖規則、不鎖色碼、不放品牌色、全部風格淺深雙底** | 11-19 | 原則 #17–19、`styles/color-system.md` |
| **風格本質固定，元素、用色、介面依內容調整；變暗不等於夜晚** | 11-19 | 原則 #21–22、`styles/illustration.md` |
| **多元風格採生成式 Style DNA**，放棄原 2c 19×4 靜態排法矩陣 | 11-19 | 原則 #23、`ROADMAP.md` |
| **三層按需架構＋亂中有序治理（v4.5→v4.7.3）**：Layer 0 輕底盤（Overlay 優先級棧＋自動搶先接管）、Layer 1 講者工具（`G`/`A`/`L`/`S`）、Layer 2 11 項內容模組＋4 套風格動態套件（未用到 0 KB）、漸進揭露手冊與軟性 `[WARN]`（含 `avoid_motions` 風格跨界防呆） | 11-19 / 11-26 | 原則 #24、`scripts/assemble.py`、`references/modules-catalog.md` |
| **兩階段腦力激盪＋導演驅動閉環＋融合視覺關卡（v4.6→v4.7.5）**：Step 1a 架構腦力激盪（⛔ 關卡 1a）→ Step 1b 細節腦力激盪（⛔ 關卡 1b）→ Step 2 4 行 `director:` 分鏡 → Step 3a 1920×1080 融合圖鑑選 1 風格（⛔ 關卡 2a）→ Step 3b 單風格 2–3 張高工藝樣張直接沿用為活範本（⛔ 關卡 2b）→ Step 4 >6 頁每 3–4 頁乾淨分身精雕 → Step 5 15 項實測＋Liveliness Audit | 11-25 / 11-26 | `SKILL.md`、`assets/style-library.html`、`references/{grill.md,samples.md,recipes/*}`、`scripts/check.mjs` |
| **預設零等待全自動產出＋可選 `IMAGE_UPGRADE.md`**：每頁預留 `.asset-slot[data-slot]` 可無縫換入 AI 底圖或照片，本機圖檔自動內嵌單檔 | 11-23 | 原則 #25、`scripts/assemble.py` |
| **四大靜態視覺工藝標準＋原則 #26（含三項合法豁免）＋靜態×動態融合第一鐵律**：真實 AI 無字底圖融合、現代 Bento、數據故事化、精緻暗場；動態必須寄生原生結構、守住空間分群與 16:9 底部基線、`?still=1` 單看即達靜態上限 | 11-23 / 11-26 | 原則 #26、`references/{presentation-rules.md,motion-system.md,visual-guidance.md}` |
| **視覺指引（第二核心）＋ Phase B.3 六大 Takeaway 固化**：語意順序高於轉場、閱讀期完全靜止（反永動檢核 #14）、從容節奏＋底盤零鎖死自動接管（`clearFocus`）、空間先分群、16:9 底部基線齊平、中場＋390px 手機實測（檢核 #15）、4 套風格套件支援 `data-step` 雙軌聯動 | 11-23 / 11-26 | `assets/runtime.js`、`assets/modules/motion/*.js`、`references/visual-guidance.md`、`scripts/check.mjs` |
| **三段式舞台光譜（`stage_mode`：`briefing`/`pitch`/`keynote`）**：依場合動態決定光暗雙極、去框化比例、導航模式與生動度門檻，絕不一刀切 | 11-25 | 原則 #27、`references/contexts.md`、`references/visual-guidance.md` |
| **Step 1a/1b 兩階段設計樹腦力激盪（融合 `mattpocock/skills`）**：先 1a 拍板骨架（Pre-Flight、雙重目標、`stage_mode`、承重母題、破框 3 選 1），再 1b 挖細節（依場合調檔、白話亮點頁、減法清單、素材缺口、數字查核與地雷）；快速模式自動合併 | 11-25 / 11-26 | 原則 #28、`references/grill.md`、`references/structure.md`、`templates/brief.md` |
| **雙軌節拍＋雙軌多媒體＋三層按需引擎**：全部實作並由 `check.mjs --motion` 15 項實測＋Liveliness Audit 把關 | 11-25 / 11-26 | 原則 #29–30、`assets/shell.css`、`assets/runtime.js`、`assets/presenter/`、`assets/modules/` |

## 交付物地圖

| 路徑 | 內容 |
|---|---|
| `outputs/deck-architect/` | **v4.7.5 完整版 Skill 原始碼（82 檔：Step 1a/1b 兩階段腦力激盪＋三層按需引擎＋4 套風格動態套件＋1920×1080 融合圖鑑＋5 支黃金配方＋視覺指引第二核心＋15 項動態行動實測＋Liveliness Audit）** |
| `outputs/deck-architect.skill` | v4.7.5 打包檔（341.9 KB，82 檔，零 `__pycache__`） |
| `outputs/examples/v45-modular-demo/` | v4.5/v4.6 三層引擎與全部新／升級模組虛構技術示範（6 頁，最低對比 `4.84:1`，15 項實測＋Liveliness Audit 100% ✅） |
| `outputs/examples/v44-keynote-demo/` | Phase C.2 v4.4 旗艦五大新能力虛構示範（7 頁，最低對比 `4.53:1`，Liveliness Audit 視覺 100% ✅） |
| `inputs/modular-capabilities-audit.md` | 10 個 GitHub 簡報 Skill 二次盤點：按需模組深化與漏網 Nice-to-Have 報告 |
| `inputs/phase-c-teardown-learnings.md` | Phase C 旗艦標竿對照與 `mattpocock/skills` 始祖回溯研究筆記（去敏版） |
| `inputs/presentation-principles.md` | 使用者的簡報原則，第 1–30 條 |
| `outputs/examples/v4-alive-demo/` | Phase B.3.2 視覺指引＋60fps 全動態互動單檔示範（重建省 105.1 KB，8 頁全過，最低 `4.70:1`，15 項實測全過 ✅） |
| `outputs/examples/v4-visual-benchmark/` | 靜態美感上限重練標竿・去小字極致留白版（6 頁全通過） |
| `outputs/examples/v4-demo/` | Phase A 初版虛構端到端範例（重建省 115.9 KB，8 頁全過，最低 `4.81:1`） |
| `inputs/motion-research.md` | Phase B 動態技術路線研究（14 個 GitHub Repo 實查，已定案方案 1） |
| `outputs/style-specs/`、`outputs/color-modes/`、`outputs/illustration-integration/`、`outputs/style-moodboard-v5/` | 首批風格詳規、淺深雙底配色、插畫 15 畫風融合與 12 款風格視覺錨點 |

## 待使用者決定（適時用表單確認）

- **Phase C.2 實戰 PK 複驗 vs 直接進 Phase D**：是否以升級後 `deck-architect` v4.7.5 立即用真實需求跑一次完整端到端實戰驗證（從 Step 1a→1b→2→3a→3b→4→5），或直接推進 Phase D 補齊其餘 8 款「靜態×動態一體」Style DNA 並上架 `style-library.html`。
- 埃及壁畫、瑪雅抄本是否要生圖做升級插槽實測。
- 日式留白之後要不要在 Phase D 當獨立一款。
- `deck-architect` 什麼時間點搬進 `skills/` 由 `install.sh` 全域安裝（建議 Phase C 實戰驗收或 Phase E 後）。
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
