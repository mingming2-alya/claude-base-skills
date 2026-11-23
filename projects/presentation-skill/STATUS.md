# 狀態：presentation-skill（deck-architect）

> **最新接手點（2026-11-23｜Phase B 完成 ✅：靜態工藝反寫 ＋ 方案 1 動態引擎實作 ＋ 8 頁全動態單檔示範驗收）**：
>
> 1. **靜態視覺工藝與原則 #26 已全數反寫進 `outputs/deck-architect/`（v4.1，28 檔）**：
>    - 新增 `styles/workday.md`（現代 Bento 工作款 Style DNA，淺深雙底＋雙語意色＋`crisp` 動效參數）並在 `styles/index.json` 標記為 `ready`（累計 4 款完整 Style DNA）。
>    - 新增 `references/motion-system.md`（方案 1 分層混合動態手冊與旗艦外掛契約）。
>    - 更新 `SKILL.md`、`references/presentation-rules.md`、`references/samples.md`、`templates/image-upgrade.md` 與 `styles/{apple,counsel,illustration}.md`，寫入**原則 #26（最多 2 層視覺鉤子、口白進講者稿）**、**四大靜態工藝標準**、**反左右割裂 AI 生圖原則**與各風格動態個性參數。
> 2. **方案 1 分層混合零依賴動態引擎實作完成（~10 KB gzip，100% 離線單檔）**：
>    - `assets/runtime.js`＋`assets/shell.css`：取消 `busy` 鎖死實現**即時可打斷解析彈簧**（預設 `bounce: 0`）；離頁保持 `opacity: 1` 防閃底色；**跨頁 Magic Move（`data-morph`，正反向皆支援＋字色與子標同步過渡）**；**滾動數字（`data-count`）**、**SVG 路徑／圓環描繪（`data-draw`）**、**長條生長（`data-grow`）**、**非等距交錯（`data-stagger`，防父子重複進場）**、**CSS `offset-path` 光點流動**；**離頁即停 30fps Canvas 2D 背景氛圍層（`data-fx`）**；**互動控件隔離（`.live-ctrl`／`.live-only`）**；**雙重靜態保險（`B` 鍵低耗電凍結、`?still=1`、`prefers-reduced-motion`、列印自動隱控件）**；以及 `#stage` 旗艦外掛事件契約。
>    - `scripts/assemble.py` 新增本機圖檔自動 Base64 內嵌（單檔 `deck.html` 隨手拷貝可離線播放）；`scripts/check.mjs` 全面改以 `?still=1` 確定性靜態定格做實測像素 WCAG，並新增 `--motion` 五項動態互動自動檢核。
> 3. **8 頁完整可播放動態示範 `outputs/examples/v4-alive-demo/deck.html`（1.7 MB 單檔）全部通過驗證**：
>    - `lint.py` 全 5 份 storyboard **0 錯誤、0 警告**；`check.mjs --motion` 8 頁靜態像素對比全過（最低 **`4.70:1`**），5 項動態測試（連按 4 次打斷零鎖死、Magic Move `hero-rate` 跨 4 頁接力、第 6 頁互動 ROI 滑桿點擊隔離與即時重算、`B` 鍵凍結、第 3 頁進附件 `model` 與返回）**全部 ✅**。
>    - 已重新打包 `outputs/deck-architect.skill`（126 KB，28 檔，零 `__pycache__`）。
>
> **下一步**：待使用者實際在預覽卡把玩 `v4-alive-demo` 的動態與互動體驗並驗收後，進入 **Phase C｜第一份真實簡報端到端 PK 🎯**。
>
> 主軸文件是 `ROADMAP.md`，執行紀錄在 `LOG.md`，專案規則在根目錄 `CLAUDE.md`。

_最後更新：2026-11-23_

## 新對話先做的事

1. 確認在 `presentation-skill-generation` 分支：`git branch --show-current`。不在的話先 `git fetch origin presentation-skill-generation && git checkout presentation-skill-generation`。
2. 讀這份檔案與 `ROADMAP.md`。需要背景時，再讀 `LOG.md` 的最後幾段。
3. 守住 `CLAUDE.md` 的三條規則：
   - 每個段落結束就同步：`STATUS.md`、`LOG.md`、commit、push。
   - Stop hook 會檢查有沒有沒推的變更。
   - **所有要問使用者的問題一律用互動表單（AskUserQuestion）**。每題能單獨看懂，題目互不依賴，一題最多 4 個選項，推薦的放第一個並標「（推薦）」。
4. 驗證腳本 `scripts/check.mjs` 已支援 Playwright 與系統 Chromium CDP 自動退路（會自動帶入 `HTTPS_PROXY`），加 `--motion` 可一併執行五項動態互動實測。

## 階段與進度

| 階段 | 內容 | 狀態 |
|---|---|---|
| 0–1, 2a–2b | 市場研究、v1 四次真實迭代方法論、12 款風格清單、OKLCH 用色系統、首批 3 款規格與插畫 15 種畫風淺深雙底 | ✅ |
| **Phase A** | **地基對齊與輕底盤 v4**：輕底盤＋自由畫布＋商務元件、統一像素 WCAG `check.mjs`、`oklch.py --palette`、清完 11-14 待辦、首批 Style DNA | ✅ |
| **Phase A+ 補課** | **靜態美感上限重練＋協調感精修＋去小字手術**：6 頁全通過 `4.70`–`7.52:1`，定案四大視覺工藝與原則 #26（口白進講者稿、最多 2 層視覺鉤子） | ✅ |
| **Phase B 預研** | **動態技術路線研究與定案**：實查 14 個 GitHub Repo（`inputs/motion-research.md`），使用者正式定案 **方案 1｜分層混合** | ✅ 定案 |
| **Phase B** | **反寫四大靜態工藝與原則 #26 ＋ 注入方案 1 HTML 動態（「活」）**：新增 `styles/workday.md` 與 `references/motion-system.md`，實作可打斷解析彈簧、Magic Move、SVG 描線／圓環、滾動數字、互動試算滑桿、離頁即停 Canvas 2D、`B` 鍵／`?still=1` 靜態凍結與 `check.mjs --motion`，並於 `outputs/examples/v4-alive-demo/` 8 頁全過 | ✅ |
| **Phase C** | **第一份真實簡報端到端 PK 🎯**：全新 Agent 只靠 `SKILL.md` 跑完全程，產出會動的多頁成品與原本 Codex 版直接比較並回修 | ⏭ 下一步 |
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
| **四大靜態視覺工藝標準**：真實 AI 無字底圖 × HTML 真文字融合、現代 Bento 進度儀表板（取代黑白表格）、數據視覺主角化（單位矩陣／圖表）、Apple 實景 UI 與電影感震撼頁；並嚴格把關標題與內容協調感 | 11-20 | `outputs/examples/v4-visual-benchmark/`、`references/presentation-rules.md` |
| **Phase B 動態技術路線＝方案 1｜分層混合**：日常 ~10 KB 零依賴原生核心（可打斷解析彈簧＋WAAPI FLIP Magic Move＋SVG 描線流動＋互動滑桿＋離頁即停輕量 Canvas 2D），底盤預留外掛契約，旗艦簡報才按需徵詢掛載 GSAP／Motion／GLSL／Three.js | 11-23 | `inputs/motion-research.md`、`references/motion-system.md` |
| **原則 #26｜口白進講者稿，畫面只留視覺鉤子（去小字原則）**：`delivery: talk` 下每個視覺群組最多 2 層文字，禁止為了填白硬補第 3 層說明小字，口語脈絡全進講者備註 `notes` | 11-23 | `inputs/presentation-principles.md`、`SKILL.md` |

## 交付物地圖

| 路徑 | 內容 |
|---|---|
| `outputs/examples/v4-alive-demo/` | **Phase B 全動態互動單檔示範（2026-11-23，8 頁全過）**：100% 離線單檔 `deck.html`（1.7 MB，內嵌 AI 底圖），整合 4 頁連續 Magic Move、可打斷彈簧、動態數據圖表、第 6 頁即時 ROI 互動滑桿、Canvas 2D 微光與附件進出；含 `check/report.md` 與 8 張截圖 |
| `outputs/deck-architect/` | **v4.1 現行 Skill 原始碼（28 檔，含 `styles/workday.md`、`references/motion-system.md`、Phase B 動態底盤與 `check.mjs --motion`）** |
| `outputs/deck-architect.skill` | v4.1 打包檔（126 KB，28 檔，零 `__pycache__`） |
| `outputs/examples/v4-visual-benchmark/` | 靜態美感上限重練標竿・去小字極致留白版（6 頁全通過） |
| `outputs/examples/v4-demo/` | Phase A 初版虛構端到端範例（供對照演進） |
| `inputs/motion-research.md` | Phase B 動態技術路線研究（14 個 GitHub Repo 實查，已定案方案 1） |
| `outputs/style-specs/` | 原始首批三款詳規與實測表 |
| `outputs/color-modes/` | Apple 與顧問淺深兩底 × 三組配色參考（`sheet.jpg`） |
| `outputs/illustration-integration/` | 插畫 15 種畫風融合版與淺深雙底參考（`sheet3.jpg`、`sheet4.jpg`、`sheet5.jpg`） |
| `outputs/style-moodboard-v5/` | 12 款風格意象圖視覺錨點（Phase D 撰寫其餘 8 款 Style DNA 的依據） |
| `inputs/presentation-principles.md` | 使用者的簡報原則，第 1–26 條 |

## 待使用者決定（適時用表單確認）

- **（本輪）Phase B 實測驗收與 Phase C 啟動確認**：確認 `v4-alive-demo` 動態與互動體驗到位後，決定 Phase C 真實簡報端到端 PK 要沿用「內部工具推廣與部署說明」（可與當時 Codex 6 頁成品直接 PK），還是改用一份新的真實簡報。
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
