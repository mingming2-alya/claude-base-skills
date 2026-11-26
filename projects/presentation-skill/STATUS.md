# 狀態：presentation-skill（deck-architect）

> **最新接手點（2026-11-26｜`deck-architect` v4.7.2 六大血淚 Takeaway 全項回補＋靜態上限 × 動態上限深度融合＋14 項動態品管完成 ✅）**：
>
> 1. **逐條對照 Phase B.3 六大 Takeaway 完成根治修補（零退步、零永動干擾）**：
>    - **Takeaway #1 語意順序優先**：4 款圖鑑重播全面改為嚴格單向 3 拍語意順序（`workday` 風險→拍板→健康；`counsel` 目標基準線→達標柱→超標紅差距；`apple` 主張→條件走勢→產出成效；`illustration` 左→中→右三站時間接力）。
>    - **Takeaway #2 閱讀期完全靜止（反永動劫持）**：`assets/modules/motion/apple-kit.js` `[data-spotlight-sweep]` 移除無限鐘擺循環，改為單次光掃後**完全靜止**；`assets/style-library.html` 移除 3 個無限循環波紋，改為抵達端點單次綻放；**`scripts/check.mjs --motion` 新增第 14 項「閱讀期靜止檢核」**，自動攔截正文區干擾型 `infinite` 永動動畫。
>    - **Takeaway #3 從容節奏＋零鎖死隨時接管**：4 款皆為每拍 ~1.4s（含閱讀靜止窗），中途點擊任何互動元件立即取消剩餘排程並解除壓暗。
>    - **Takeaway #4 空間先分群** & **#5 雙欄底部基線齊平**：`workday` 升級回 Phase B.3 進化版「左欄行動主軸（風險 ↓ 因果紅箭頭 ↓ 拍板）＋右欄健康總覽由高到低」；`counsel` 與 `workday` 雙欄底部基線精準對齊。
>    - **Takeaway #6 中場影格實拍＋390px 手機實測**：實際以 Chromium CDP 抓完稿、Beat 1 中場實拍與 390px 手機畫面，發現手機上控制鈕壓到圖面右上角並立即將控制列移出 16:9 畫布外（桌面與 390px 手機均 0% 遮擋、0px 橫向溢出）。
> 2. **驗證與重打包**：
>    - `check.mjs --jpg --motion` 於 `v45-modular-demo`（4.84:1、100% 視覺）與 `v4-alive-demo`（4.70:1、80% 視覺、8 種原語）全數通過含新第 14 項「閱讀期靜止檢核」✅；`style-library.html` 實測 0 個永動 CSS 動畫、Beat 1 中場聚光與中途點擊接管全通過。
>    - 重新打包 `outputs/deck-architect.skill`（**82 檔，335.4 KB**，零 `__pycache__`）。
>
> **下一步（Phase C.2 收官驗收 → Phase D）**：由使用者親手試玩新版 `style-library.html`（點 `↻ 3拍重播` 與畫布互動），滿意後可擇期以真實簡報跑一次端到端實戰 PK 複驗，或推進 **Phase D｜補齊其餘 8 款「靜態上限 × 動態上限一體」Style DNA**。
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
4. 驗證腳本 `scripts/check.mjs` 已支援 Playwright 與系統 Chromium CDP 自動退路，加 `--motion` 可一併執行最多 13 項動態實測＋Liveliness Audit 生動度稽核；執行 `lint.py` 若遇 pyenv 缺 PyYAML，改用 `/usr/bin/python3`。

## 階段與進度

| 階段 | 內容 | 狀態 |
|---|---|---|
| 0–1, 2a–2b | 市場研究、v1 四次真實迭代方法論、12 款風格清單、OKLCH 用色系統、首批 3 款規格與插畫 15 種畫風淺深雙底 | ✅ |
| **Phase A** | **地基對齊與輕底盤 v4**：輕底盤＋自由畫布＋商務元件、統一像素 WCAG `check.mjs`、`oklch.py --palette`、清完 11-14 待辦、首批 Style DNA | ✅ |
| **Phase A+ 補課** | **靜態美感上限重練＋協調感精修＋去小字手術**：6 頁全通過 `4.70`–`7.52:1`，定案四大視覺工藝與原則 #26 | ✅ |
| **Phase B 預研** | **動態技術路線研究與定案**：實查 14 個 GitHub Repo（`inputs/motion-research.md`），定案 **方案 1｜分層混合** | ✅ 定案 |
| **Phase B / B.2 / B.3** | **反寫靜態工藝與原則 #26 ＋ 60fps 動態引擎 ＋ 視覺指引規格與原語（v4.3）**：`v4-alive-demo` 8 頁靜態＋7 項動態實測全過 | ✅ |
| **Phase C.1** | **真實旗艦標竿對照 ＋ v4.4-spec 規格與 Grill v2 全面升級**：三段式舞台光譜、設計樹 Grill v2（融合 `mattpocock/skills`）、原則 #27–#30、9 份核心規格反寫並重打包 | ✅ |
| **Phase C.2** | **v4.4→v4.6 三層按需引擎＋導演驅動閉環全面實作**：Layer 1 `G/A/L/S`、Layer 2 11 項細粒度模組、場合三段調檔 Grill、4 行 `director:` 分鏡、Style & Motion Library 圖鑑＋單風格活範本、>6 頁分批乾淨分身、5 支黃金配方、13 項動態＋Liveliness Audit 全完成 ✅；待真實簡報 PK 複驗收官 | 🟡 引擎與流程完成／待實戰 PK |
| **Phase D** | **多元風格庫全面成形**：補齊其餘 8 款 Style DNA（各含淺深規則與動效個性並上架 `style-library.html`）、整理插畫 15 種畫風配方表、主題→風格智能配對與外觀帳本 | 未開始 |
| **Phase E** | **交付、修改閉環與記憶**：成品按 `E` 改字回寫、畫面上點選留言修改、文字可編輯 PPTX 匯出、品味記憶與獨立評審、評估搬進 `skills/` 正式安裝（註：雙螢幕講者模式 `S` 鍵已提前於 v4.5 完成） | 未開始 |

## 已經定案的事

| 決定 | 日期 | 寫在哪裡 |
|---|---|---|
| 風格清單十二款（插畫場景、積木構成、水彩水墨、Apple 發表、書卷刻本、顧問報告、孔版小誌、摩登金、日常工作款、攝影雜誌、年輕潮流、在地懷舊） | 11-18 | `inputs/style-list-v5.md`、`styles/index.json` |
| 首批四款完整 Style DNA：顧問報告、Apple 發表、插畫場景（含 15 種畫風）、日常工作款（現代 Bento） | 11-23 | `outputs/deck-architect/styles/`、`assets/style-library.html` |
| **用色鎖規則、不鎖色碼、不放品牌色、全部風格淺深雙底** | 11-19 | 原則 #17–19、`styles/color-system.md` |
| **風格本質固定，元素、用色、介面依內容調整；變暗不等於夜晚** | 11-19 | 原則 #21–22、`styles/illustration.md` |
| **多元風格採生成式 Style DNA**，放棄原 2c 19×4 靜態排法矩陣 | 11-19 | 原則 #23、`ROADMAP.md` |
| **三層按需架構＋亂中有序治理（v4.5）**：Layer 0 輕底盤（Overlay 優先級棧）、Layer 1 講者工具（`G`/`A`/`L`/`S`）、Layer 2 11 項細粒度按需模組（未用到 0 KB）、漸進揭露手冊與軟性 `[WARN]` 防呆 | 11-19 / 11-25 | 原則 #24、`scripts/assemble.py`、`references/modules-catalog.md` |
| **導演驅動閉環＋兩階段視覺關卡（v4.6）**：Step 1 依 `stage_mode` 三段自動調檔（減法／反差／白話亮點頁）→ Step 2 4 行 `director:` 分鏡 → Step 3a 風格與動效圖鑑（4 款就緒）快選 → Step 3b 單風格 2–3 張高工藝樣張直接沿用為活範本 → Step 4 >6 頁每 3–4 頁乾淨分身精雕 → Step 5 Liveliness Audit 生動度稽核 | 11-25 | `SKILL.md`、`assets/style-library.html`、`references/{grill.md,samples.md,recipes/*}`、`scripts/check.mjs` |
| **預設零等待全自動產出＋可選 `IMAGE_UPGRADE.md`**：每頁預留 `.asset-slot[data-slot]` 可無縫換入 AI 底圖或照片，本機圖檔自動內嵌單檔 | 11-23 | 原則 #25、`scripts/assemble.py` |
| **四大靜態視覺工藝標準＋原則 #26（含三項合法豁免）**：真實 AI 無字底圖融合、現代 Bento、數據故事化、精緻暗場；`delivery: talk` 每一般群組 ≤2 層文字（豁免：原話暗房證言、產品情感短句、活流程步進微標） | 11-23 / 11-25 | 原則 #26、`references/presentation-rules.md` |
| **Phase B 動態技術路線＝方案 1｜分層混合 ＋ Phase B.3 視覺指引規範**：60fps GPU 核心、6 種敘事切頁、三層聚光壓暗、因果現場演變、真描線／方向揭露／分段靜讀與語意順序優先 | 11-23 / 11-24 | `references/motion-system.md`、`references/visual-guidance.md` |
| **三段式舞台光譜（`stage_mode`：`briefing`/`pitch`/`keynote`）**：依場合動態決定光暗雙極、去框化比例、導航模式與生動度門檻，絕不一刀切 | 11-25 | 原則 #27、`references/contexts.md`、`references/visual-guidance.md` |
| **Step 1 Grill v2（融合 `mattpocock/skills` 始祖機制）**：設計樹前沿直到零靜默假設、先查事實只問決定、體感預期＋承重母題、標準模式必給跳脫思維破框候選、Grounding 與白話招牌頁提案＋減法清單 | 11-25 | 原則 #28、`references/grill.md`、`references/structure.md`、`templates/brief.md` |
| **雙軌節拍＋雙軌多媒體＋三層按需引擎**：全部實作並由 `check.mjs --motion` 13 項實測＋Liveliness Audit 把關 | 11-25 | 原則 #29–30、`assets/shell.css`、`assets/runtime.js`、`assets/presenter/`、`assets/modules/` |

## 交付物地圖

| 路徑 | 內容 |
|---|---|
| `outputs/deck-architect/` | **v4.6 完整版 Skill 原始碼（73 檔：三層按需引擎＋`style-library.html` 4 款風格圖鑑＋5 支 `references/recipes/` 黃金配方＋Liveliness Audit）** |
| `outputs/deck-architect.skill` | v4.6 打包檔（237.4 KB，73 檔，零 `__pycache__`） |
| `outputs/examples/v45-modular-demo/` | v4.5/v4.6 三層引擎與全部新／升級模組虛構技術示範（6 頁，最低對比 `4.84:1`，Liveliness Audit 視覺 100% ✅） |
| `outputs/examples/v44-keynote-demo/` | Phase C.2 v4.4 旗艦五大新能力虛構示範（7 頁，最低對比 `4.53:1`，Liveliness Audit 視覺 100% ✅） |
| `inputs/modular-capabilities-audit.md` | 10 個 GitHub 簡報 Skill 二次盤點：按需模組深化與漏網 Nice-to-Have 報告 |
| `inputs/phase-c-teardown-learnings.md` | Phase C 旗艦標竿對照與 `mattpocock/skills` 始祖回溯研究筆記（去敏版） |
| `inputs/presentation-principles.md` | 使用者的簡報原則，第 1–30 條 |
| `outputs/examples/v4-alive-demo/` | Phase B.3.2 視覺指引＋60fps 全動態互動單檔示範（重建省 105.1 KB，8 頁全過，最低 `4.70:1`） |
| `outputs/examples/v4-visual-benchmark/` | 靜態美感上限重練標竿・去小字極致留白版（6 頁全通過） |
| `outputs/examples/v4-demo/` | Phase A 初版虛構端到端範例（重建省 115.9 KB，8 頁全過，最低 `4.81:1`） |
| `inputs/motion-research.md` | Phase B 動態技術路線研究（14 個 GitHub Repo 實查，已定案方案 1） |
| `outputs/style-specs/`、`outputs/color-modes/`、`outputs/illustration-integration/`、`outputs/style-moodboard-v5/` | 首批風格詳規、淺深雙底配色、插畫 15 畫風融合與 12 款風格視覺錨點 |

## 待使用者決定（適時用表單確認）

- **Phase C.2 實戰 PK 複驗 vs 直接進 Phase D**：是否以升級後 `deck-architect` v4.6 立即進行真實簡報 PK 複驗，或直接推進 Phase D 補齊其餘 8 款 Style DNA 並上架風格圖鑑。
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
