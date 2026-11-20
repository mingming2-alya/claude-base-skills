# 狀態：presentation-skill（deck-architect）

> **最新接手點（2026-11-19｜Phase A 完成 ✅ ＋ Phase B 動態技術路線研究完成 ✅，暫停實作等待使用者檢視）**：
>
> 1. **Phase A 已交付**：`deck-architect` 已升級為 **v4 輕底盤、強自由混合架構**（26 檔、`outputs/deck-architect.skill`）並完成虛構端到端範例 `outputs/examples/v4-demo/`（Gate 2 三風格樣張 `samples/sheet.jpg`＋8 頁混合簡報 `deck.html`＋`IMAGE_UPGRADE.md`＋全頁截圖報告）。**使用者正在自行檢視 `v4-demo` 成品與截圖，尚未開始寫 Phase B 程式碼。**
> 2. **Phase B 動態技術路線研究完成**：依使用者要求，實地透過 `gh api` 盤點本 repo 紀錄的全部 **14 個相關 GitHub 簡報／動態 Skill 原始碼與授權**（加本地 `skills/gsap-*` 與 ASCII 庫），拆解出 **6 大技術路線**與 **8 條必裝工程共識**，並提出 4 條 Phase B 候選路線比較，完整報告寫入 `inputs/motion-research.md`。
>
> **下一步**：等待使用者完成兩件事後再啟動 Phase B 實作：
> 1. 檢視 `outputs/examples/v4-demo/`（若有要回修 Phase A 的視覺或底盤細節先修）。
> 2. 選定 Phase B 的動態技術路線（建議：**方案 1｜分層混合：零依賴原生核心 ~8 KB ＋ 旗艦按需外掛契約**）。
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
4. 驗證腳本 `scripts/check.mjs` 已支援 Playwright 與系統 Chromium CDP 自動退路（會自動帶入 `HTTPS_PROXY`）。

## 階段與進度

| 階段 | 內容 | 狀態 |
|---|---|---|
| 0–1, 2a–2b | 市場研究、v1 四次真實迭代方法論、12 款風格清單、OKLCH 用色系統、首批 3 款規格與插畫 15 種畫風淺深雙底 | ✅ |
| **Phase A** | **地基對齊與輕底盤 v4**：輕底盤＋自由畫布＋商務元件、統一像素 WCAG `check.mjs`、`oklch.py --palette`、清完 11-14 待辦、首批 3 款 Style DNA、`v4-demo` 端到端驗收 | ✅（待使用者檢視成品） |
| **Phase B 預研** | **動態技術路線研究**：實查 14 個 GitHub Repo（`emilkowalski/skills`、`open-slide`、`scrolline`、`bang-motion`、`paper-collage-ppt`、`guizang`、`html-ppt-skill`、`beatdeck`、`frontend-slides`、`huashu-design`、`visual-explainer`、`bolt-slides`、`dashi-ppt`、`beautiful-html-templates`）與授權，整理 6 大技術路線與 4 個 Phase B 方案（`inputs/motion-research.md`） | ✅（待使用者定案） |
| **Phase B** | **注入 HTML 獨有的「活」**：待使用者檢視 `v4-demo` 並定案動態技術路線後啟動 | ⏸ 待啟動 |
| **Phase C** | **第一份真實簡報端到端 PK 🎯**：全新 Agent 只靠 `SKILL.md` 跑完全程，產出會動的多頁成品與原本 Codex 版直接比較並回修 | 未開始 |
| **Phase D** | **多元風格庫全面成形**：補齊其餘 9 款 Style DNA（各含淺深規則與動效個性）、整理插畫 15 種畫風配方表、主題→風格智能配對（穩健／大膽／驚喜）與外觀帳本 | 未開始 |
| **Phase E** | **交付、修改閉環與記憶**：成品按 `E` 改字回寫、畫面上點選留言修改、雙螢幕講者模式、文字可編輯 PPTX 匯出、品味記憶與獨立評審、評估搬進 `skills/` 正式安裝 | 未開始 |

## 已經定案的事

| 決定 | 日期 | 寫在哪裡 |
|---|---|---|
| 風格清單十二款（插畫場景、積木構成、水彩水墨、Apple 發表、書卷刻本、顧問報告、孔版小誌、摩登金、日常工作款、攝影雜誌、年輕潮流、在地懷舊） | 11-18 | `inputs/style-list-v5.md`、`styles/index.json` |
| 首批三款完整 Style DNA：顧問報告、Apple 發表、插畫場景（含 15 種畫風） | 11-19 | `outputs/deck-architect/styles/` |
| **用色鎖規則、不鎖色碼、不放品牌色、全部風格淺深雙底** | 11-19 | 原則 #17–19、`styles/color-system.md` |
| **風格本質固定，元素、用色、介面依內容調整；變暗不等於夜晚** | 11-19 | 原則 #21–22、`styles/illustration.md` |
| **多元風格採生成式 Style DNA**，放棄原 2c 19×4 靜態排法矩陣 | 11-19 | 原則 #23、`ROADMAP.md` |
| **輕底盤、強自由混合架構**：Thin Shell 鎖基礎設施＋商務表格元件；90%+ 視覺頁由 Agent 自由編排 | 11-19 | 原則 #24、`outputs/deck-architect/` |
| **預設零等待全自動產出＋可選 `IMAGE_UPGRADE.md`**：每頁預留 `.asset-slot[data-slot]` 可無縫換入 AI 底圖或照片 | 11-19 | 原則 #25、`scripts/assemble.py` |

## 交付物地圖

| 路徑 | 內容 |
|---|---|
| `outputs/deck-architect/` | **v4 現行 Skill 原始碼（26 檔，零舊版殘留）** |
| `outputs/deck-architect.skill` | v4 打包檔（103 KB，26 檔） |
| `outputs/examples/v4-demo/` | **Phase A 虛構端到端範例（星塵烘焙智慧補貨）**：Gate 2 三風格樣張（`samples/sheet.jpg`）、8 頁混合簡報（`deck.html`、7 頁自由畫布＋1 頁 `status-table` 元件＋可點入附件）、`IMAGE_UPGRADE.md` 與 `check/` 全頁截圖報告 |
| `inputs/motion-research.md` | **Phase B 動態技術路線研究（2026-11-19）**：14 個 GitHub Repo 原始碼與授權實查、6 大技術路線拆解、8 條必裝工程共識、4 條 Phase B 候選方案比較 |
| `outputs/style-specs/` | 原始首批三款詳規與實測表（v4 `deck-architect/styles/` 之母本） |
| `outputs/color-modes/` | Apple 與顧問淺深兩底 × 三組配色參考（`sheet.jpg`） |
| `outputs/illustration-integration/` | 插畫 15 種畫風融合版與淺深雙底參考（`sheet3.jpg`、`sheet4.jpg`、`sheet5.jpg`） |
| `outputs/style-moodboard-v5/` | 12 款風格意象圖視覺錨點（Phase D 撰寫其餘 9 款 Style DNA 的依據） |
| `inputs/presentation-principles.md` | 使用者的簡報原則，第 1–25 條 |

## 待使用者決定（適時用表單確認）

- **（本輪）`v4-demo` 檢視結果**：Phase A 成品與截圖是否滿意，或有要先回修的地方。
- **（本輪）Phase B 動態技術路線**：採方案 1（分層混合：零依賴原生核心＋旗艦按需外掛契約，推薦）、方案 2（純原生零依賴到底）、方案 3（內嵌 MIT Motion）、或方案 4（統一採用 GSAP 3.15）。
- Phase C 真實簡報端到端 PK 要沿用「內部工具推廣與部署說明」（可與當時 Codex 6 頁成品直接 PK），還是改用一份新的真實簡報。
- 埃及壁畫、瑪雅抄本是否要生圖做升級插槽實測。
- 日式留白之後要不要在 Phase D 當獨立一款。
- `deck-architect` 什麼時間點搬進 `skills/` 由 `install.sh` 全域安裝（建議 Phase C 或 E 後）。
- git 歷史殘留的一組無上下文步驟數字是否要再改寫歷史。

## 製作與驗證的眉角

- **CSS 簡寫避坑**：`font:` 簡寫裡不可寫 `inherit` 當字體名（會整條失效退回 16px）；改用明確的 `font-weight`／`font-size`／`line-height` 或 `var(--font-body)`。
- **漸層字像素對比檢查**：`check.mjs` 會對漸層字加上暫時隱藏類 `.__check_hide_grad`（`opacity: 0`）再截底圖，才能量到真正的背景舞台，避免把漸層字本身當成背景誤判。
- **輕底盤零權重規則**：`shell.css` 對自由畫布子元素的預設 `z-index` 使用 `:where(...)` 零權重，絕不覆寫 `.back` 或投影片自訂定位。
- **SVG `<defs>` ID 隔離**：`assemble.py` 自動替每頁 `<defs>` 內的 `id` 加上 `s{idx}_` 前綴並同步改寫 `url(#...)`／`href="#..."`，防止多頁組裝後 `clipPath`／濾鏡撞名。
- **授權與引入外部動畫庫規則**：`op7418/guizang-ppt-skill` 與 `chuspeeism/dashi-ppt-skill` 為 **AGPL-3.0**（僅學架構概念，不抄碼）；`borjaperfra/beatdeck` 已實查 `LICENSE` 確認為 **MIT**；引入 GSAP 前必依 `rules/CLAUDE.base.md` 先說明為何原生 CSS／WAAPI 做不到並經使用者同意。
