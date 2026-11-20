# 狀態：presentation-skill（deck-architect）

> **最新接手點（2026-11-20｜靜態美感上限重練標竿完成 ✅，待使用者檢視確認後再進 Phase B 動態）**：
>
> 1. **使用者對 `v4-demo` 的關鍵修正**：檢視 `v4-demo` 後指出成品「整體視覺太空、太素、太像傳統簡報範本」、「第 6 頁進度表太像傳統黑白表格，缺乏現代 Bento 儀表板質感」、「仍為靜態缺乏 HTML 驚豔感」，並拍板**先專心拉高靜態美感上限（重做 Gate 2 三風格＋真實 AI 生圖融合樣張），確認好看後再加動態**。
> 2. **6 頁靜態美感重練標竿完成（`outputs/examples/v4-visual-benchmark/`）**：
>    - **重做 Gate 2 三風格樣張**：`01-everyday-bento.html`（現代 Bento 進度儀表板，甘特延遲條＋圓環進度＋迷你長條圖＋決策選項卡，最低對比 `4.92:1`）、`02-apple-keynote.html`（實景光影雙欄玻璃平板 UI＋8 週折線對比圖，最低對比 `5.07:1`）、`03-illustration-ai-clay.html`（真實 AI 無字 3D 手工紙黏土烘焙場景底圖 × 100% 可編輯 HTML 真文字＋螢幕即時讀數 `4.2%`，最低對比 `4.61:1`）。
>    - **突破 3 個最容易過素的關鍵頁型**：`04-editorial-cover.html`（真實 AI 晨光攝影雜誌封面＋襯線大標＋毛玻璃 KPI，最低對比 `7.52:1`）、`05-data-story.html`（紙紋深石板＋24 格烤盤單位視覺矩陣，最低對比 `4.98:1`）、`06-shock-cinematic.html`（點陣景深微光＋低透明巨數浮水印＋三柱財務支撐，最低對比 `4.95:1`）。
>    - 全 6 頁通過 `check.mjs --sheet` 真實渲染像素 WCAG 檢驗並完成逐張視覺微調（零孤字斷行、零元說明標籤）。
> 3. **動態技術路線研究已完成（`inputs/motion-research.md`）**：實查 14 個 GitHub Repo，明確推薦 **方案 1｜分層混合（日常 ~8 KB 零依賴原生核心＋旗艦按需外掛契約）**。
>
> **下一步**：等待使用者檢視 `v4-visual-benchmark` 畫廊，確認靜態視覺品質已達「會想點開、會被吸引」的標準後，將這套視覺工藝規則與生圖提示規範反寫回 `deck-architect`，並正式啟動 Phase B 動態實作。
>
> 主軸文件是 `ROADMAP.md`，執行紀錄在 `LOG.md`，專案規則在根目錄 `CLAUDE.md`。

_最後更新：2026-11-20_

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
| **Phase A** | **地基對齊與輕底盤 v4**：輕底盤＋自由畫布＋商務元件、統一像素 WCAG `check.mjs`、`oklch.py --palette`、清完 11-14 待辦、首批 3 款 Style DNA | ✅（底盤完成，美感上限於標竿重練） |
| **Phase A+ 補課** | **靜態美感上限重練標竿**：重做 Gate 2 三風格（現代 Bento 工作款／Apple 實景光影 UI／真實 AI 3D 紙黏土融合）＋ 3 個關鍵頁型突破（AI 攝影封面／24 盤數據視覺矩陣／電影級震撼頁），全數通過像素 WCAG（`4.61`–`7.52:1`） | ✅（待使用者檢視確認） |
| **Phase B 預研** | **動態技術路線研究**：實查 14 個 GitHub Repo 與授權，整理 6 大技術路線與 4 個 Phase B 方案（`inputs/motion-research.md`，推薦方案 1 分層混合） | ✅（待使用者定案） |
| **Phase B** | **注入 HTML 獨有的「活」**：待使用者確認靜態美感標竿過關後，將工藝反寫回 Skill 並啟動動態引擎實作 | ⏸ 待啟動 |
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
| `outputs/examples/v4-visual-benchmark/` | **靜態美感上限重練標竿（2026-11-20，6 頁全通過）**：重做 Gate 2 三風格（現代 Bento／Apple 實景 UI／真實 AI 3D 紙黏土融合）＋ 3 個關鍵頁突破（AI 攝影封面／24 盤數據矩陣／電影震撼頁），含 `assets/`、`sheet.jpg`、`check-report.md` |
| `outputs/deck-architect/` | **v4 現行 Skill 原始碼（26 檔，零舊版殘留）** |
| `outputs/deck-architect.skill` | v4 打包檔（103 KB，26 檔） |
| `outputs/examples/v4-demo/` | Phase A 初版虛構端到端範例（供對照重練前後落差） |
| `inputs/motion-research.md` | **Phase B 動態技術路線研究（2026-11-19）**：14 個 GitHub Repo 實查、6 大路線、8 條共識、4 個方案比較 |
| `outputs/style-specs/` | 原始首批三款詳規與實測表（v4 `deck-architect/styles/` 之母本） |
| `outputs/color-modes/` | Apple 與顧問淺深兩底 × 三組配色參考（`sheet.jpg`） |
| `outputs/illustration-integration/` | 插畫 15 種畫風融合版與淺深雙底參考（`sheet3.jpg`、`sheet4.jpg`、`sheet5.jpg`） |
| `outputs/style-moodboard-v5/` | 12 款風格意象圖視覺錨點（Phase D 撰寫其餘 9 款 Style DNA 的依據） |
| `inputs/presentation-principles.md` | 使用者的簡報原則，第 1–25 條 |

## 待使用者決定（適時用表單確認）

- **（本輪）`v4-visual-benchmark` 靜態美感檢視**：這 6 頁的水準是否已達到吸引力門檻、哪些風格最打中你。
- **（本輪）進入 Phase B 的方式與技術路線**：是否將本輪驗證的視覺工藝（現代 Bento、真實 AI 無字底圖融合、視覺化數據主圖、景深光影）反寫進 `deck-architect` 並採方案 1（分層混合）啟動 Phase B 動態。
- Phase C 真實簡報端到端 PK 要沿用「內部工具推廣與部署說明」（可與當時 Codex 6 頁成品直接 PK），還是改用一份新的真實簡報。
- 埃及壁畫、瑪雅抄本是否要生圖做升級插槽實測。
- 日式留白之後要不要在 Phase D 當獨立一款。
- `deck-architect` 什麼時間點搬進 `skills/` 由 `install.sh` 全域安裝（建議 Phase C 或 E 後）。
- git 歷史殘留的一組無上下文步驟數字是否要再改寫歷史。

## 製作與驗證的眉角

- **生圖提示避坑（2026-11-20 實測）**：AI 生圖提示詞不可寫 `"left 60% ... right 40% ..."`，容易被誤解成分割雙圖（diptych）產生垂直硬接縫！改用單一連續場景空間描述（如 `"positioned in the lower-right corner"`、`"expansive upper and left areas remain calm dark shadow"`）即可生成無接縫攝影。
- **「零等待」不等於「廉價幾何 SVG 假裝插畫」**：插畫／黏土／攝影類風格要用真實無字 AI 底圖（或明確提示生圖）；純程式頁則靠 Bento 儀表板、實景 UI、數據單位矩陣、微光景深拉滿質感。
- **CSS 簡寫避坑**：`font:` 簡寫裡不可寫 `inherit` 當字體名（會整條失效退回 16px）；改用明確的 `font-weight`／`font-size`／`line-height` 或 `var(--font-body)`。
- **漸層字像素對比檢查**：`check.mjs` 會對漸層字加上暫時隱藏類 `.__check_hide_grad`（`opacity: 0`）再截底圖，才能量到真正的背景舞台，避免把漸層字本身當成背景誤判。
- **輕底盤零權重規則**：`shell.css` 對自由畫布子元素的預設 `z-index` 使用 `:where(...)` 零權重，絕不覆寫 `.back` 或投影片自訂定位。
- **SVG `<defs>` ID 隔離**：`assemble.py` 自動替每頁 `<defs>` 內的 `id` 加上 `s{idx}_` 前綴並同步改寫 `url(#...)`／`href="#..."`，防止多頁組裝後 `clipPath`／濾鏡撞名。
- **授權與引入外部動畫庫規則**：`op7418/guizang-ppt-skill` 與 `chuspeeism/dashi-ppt-skill` 為 **AGPL-3.0**（僅學架構概念，不抄碼）；`borjaperfra/beatdeck` 已實查 `LICENSE` 確認為 **MIT**；引入 GSAP 前必依 `rules/CLAUDE.base.md` 先說明為何原生 CSS／WAAPI 做不到並經使用者同意。
