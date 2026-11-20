# 狀態：presentation-skill（deck-architect）

> **最新接手點（2026-11-19｜Phase A 完成 ✅）**：
>
> `deck-architect` 已解凍並升級為 **v4 輕底盤、強自由混合架構**（26 檔，已重新打包 `outputs/deck-architect.skill`）：
>
> - **輕底盤與組裝器**：`assets/shell.css`、`components.css`、`runtime.js`、`fit.js` ＋ `scripts/assemble.py`（自由畫布 `slides/*.html`、SVG `<defs>` ID 自動隔離、`data-auto-nav` 單一來源章節同步、`.asset-slot[data-slot]` 零等待＋可選 AI 底圖無縫替換、高頻商務元件 `status-table`/`pillars`/`toc`、Gate 2 `--sheet` 總覽組裝）。
> - **統一品管與色彩工具**：`scripts/check.mjs`（支援 Playwright 與零依賴系統 Chromium CDP 自動退路、真實渲染像素 WCAG 對比、漸層字逐段對比、主標題≥總結階層檢查、SVG 重複 ID、溢出與最小字級）＋ `scripts/oklch.py`（含 `--palette` 自動檢查禁紫、禁純白純黑、ΔE ≥ 15、與警示色差 ≥ 60°）。
> - **首批 3 款 Style DNA 與清完 11/14 待辦**：`styles/`（`index.json`、`color-system.md`、`apple.md`、`counsel.md`、`illustration.md`）與全新 `SKILL.md`／`references/`／`templates/` 全數對齊原則 #1–#25；移除所有舊 v3 衝突檔案。
> - **端到端虛構範例驗收通過**：`outputs/examples/v4-demo/`（星塵烘焙智慧補貨，100% 虛構）跑通 Gate 2 三風格樣張（`samples/sheet.jpg` 最低對比 4.37–5.13）、8 頁混合簡報（7 頁自由畫布＋1 頁底盤 `status-table` 元件＋可點入附件，最低對比 4.81）、以及圖像插槽替換實測，截圖逐張視覺確認通過。既有商業範例 `annual-section` 與 `progress-overview` 亦全數通過新版 `lint.py`＋`assemble.py`＋`check.mjs`。
>
> **下一步**：進入 **Phase B｜注入 HTML 獨有的「活」**（可打斷 spring 動態、Magic Move 跨頁延續、微動態背景與效能降級、動態圖表／滾動數字、升級插槽動態進場）。
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
| **Phase A** | **地基對齊與輕底盤 v4**：輕底盤＋自由畫布＋商務元件、統一像素 WCAG `check.mjs`、`oklch.py --palette`、清完 11-14 待辦、首批 3 款 Style DNA、`v4-demo` 端到端驗收 | ✅ |
| **Phase B** | **注入 HTML 獨有的「活」**：可打斷 spring 動態（MIT `apple-design`）、依軸運鏡、Magic Move 跨頁延續、微動態背景與效能降級、動態圖表／滾動數字、圖像插槽進場動效 | ⏭ 下一步 |
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
| `outputs/style-specs/` | 原始首批三款詳規與實測表（v4 `deck-architect/styles/` 之母本） |
| `outputs/color-modes/` | Apple 與顧問淺深兩底 × 三組配色參考（`sheet.jpg`） |
| `outputs/illustration-integration/` | 插畫 15 種畫風融合版與淺深雙底參考（`sheet3.jpg`、`sheet4.jpg`、`sheet5.jpg`） |
| `outputs/style-moodboard-v5/` | 12 款風格意象圖視覺錨點（Phase D 撰寫其餘 9 款 Style DNA 的依據） |
| `inputs/presentation-principles.md` | 使用者的簡報原則，第 1–25 條 |

## 下一步：Phase B 細部任務清單（注入 HTML 獨有的「活」）

1. **可打斷的 Spring 物理動態（`runtime.js`）**：借鏡 `emilkowalski/skills` `apple-design`（MIT，註明來源），以彈簧物理與可半途打斷轉場取代固定時間鎖死（`busy` 鎖改為可中斷並接續當前狀態），配合各 Style DNA 的動效個性（Apple 絲滑春彈、顧問俐落短進、插畫定格／微浮動）。
2. **元素跨頁延續（Magic Move／交棒）**：在 `runtime.js` 加入 `[data-morph="id"]` 配對機制（借鏡 `open-slide` MIT 做法），切頁時自動量測前後頁同 ID 元素並平滑位移縮放變形，舊頁元素自然交棒給新頁。
3. **微動態背景層與效能降級**：提供輕量可選的微動態背景原語（光暈慢呼吸、微粒／紙紋、視差）＋自動偵測 `prefers-reduced-motion` 與非當前頁暫停（`visibility: hidden` 零耗能）。
4. **動態圖表與滾動數字**：進頁時長條從底升起、折線繪製、數字由 0 滾動就位（借鏡 `scrolline` MIT 做法）；列印與靜態截圖模式自動呈現最終狀態不卡動畫。
5. **驗證**：將 Phase B 動效套用到 `v4-demo` 並驗證：快速連按翻頁可流暢打斷不卡死、Magic Move 與動態數字運作正常、列印與 `check.mjs` 截圖全部停在最終穩態且通過像素 WCAG 檢查。（註：依 `rules/CLAUDE.base.md`，先用純 CSS／WAAPI／輕量 Spring 實作；若遇到確實做不到的特效才另行徵詢是否引入 GSAP。）

## 待使用者決定（適時用表單確認）

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
- **引入 GSAP 規則**（`rules/CLAUDE.base.md`）：引入前必須先問使用者並說明為何 CSS／WAAPI 做不到。
