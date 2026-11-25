# 狀態：presentation-skill（deck-architect）

> **最新接手點（2026-11-24｜Phase B.3 完成 ✅：視覺指引規格書 ＋ 高反差聚光壓暗／因果現場演變／真描線與波紋底盤 v4.3 ＋ `v4-alive-demo` 全 8 頁重構）**：
>
> 1. **先訂正式《視覺指引規格書》並反寫進 `outputs/deck-architect/`（v4.3，29 檔，保持原有單次點擊／方向鍵翻頁互動不變）**：
>    - 新增 **`references/visual-guidance.md`**，完整定義靜態四大視覺動線原型（因果對照流、中心放射集群、時間軌跡流、控制→結果聯動流）、五條動態節奏與高反差鐵律（一拍一主角、390px 手機可辨識聚光＋非焦點壓暗、禁止跨螢幕乒乓、線先到→點後綻→字再亮、確定性靜態終態），並串連至 `SKILL.md`、`references/motion-system.md`、`references/presentation-rules.md`。
>    - 升級輕底盤 `assets/shell.css`＋`assets/runtime.js`（v4.3，~11 KB 零依賴，100% 60fps 純 GPU）：新增 **`data-focus-plan`＋`data-focus`** 三層聚光壓暗排程器（`.focus-active` 4px 亮框＋22px 外光暈在 390px 手機清晰可見，`.focus-visited` 留因果脈絡 0.82，`.focus-dim` 配角退至 0.30，結束／打斷 100% 自動歸零）、**`data-transform-at`** 因果現場演變（`.pre-transform` 零反向過場保護）、**`data-wipe`** 純 GPU `clip-path` 方向揭露（零虛線變形）、**`data-pop`** 端點綻放、**`data-ripple`** 雙圈目標波紋、**`data-travel`** 軌道行進光珠、**`data-nudge`** 滑桿微動暗示。
>    - 強化 `scripts/check.mjs --motion` 升級為 **7 項動態與視覺指引實測**：新增聚光壓暗／因果演變演繹中與復原後零殘留檢查、以及 SVG 引導線防退化（禁止對 SVG `<line>` 誤用 `data-grow`）檢查。
> 2. **全面重構 `outputs/examples/v4-alive-demo/` 全 8 頁並完成實測驗證**：
>    - **第 1 頁（封面）**：標題 → 金線向右揭露 → 副標 → 左下 KPI 錨點聚光。
>    - **第 2 頁（數據故事・因果演變明星頁）**：進頁先以 **24 格全赤紅報廢烤盤**（`24 盤／日`）鎖定視線（左側三痛點壓暗 0.30）→ 以 4 排零重繪風暴波浪（從 218 降至 4 個運行中動畫！）現場削去 15 盤轉為 9 綠＋15 紅虛線並對 `24` 劃出深緋刪線跳出 `→ 9 盤` → 聚光 `4.2%` → 視線轉向左側三痛點卡收尾。
>    - **第 3 頁（Apple 平板）**：徹底消滅左右乒乓——先鎖定中央平板與 8 週折線描繪＋青藍端點波紋 → 再由平板左緣用真實 SVG `<path data-draw>` 向左成組展開左集群（`−63%`＋`氣象 × 連假`）→ 再向右成組展開右集群（`12 分鐘`＋`34 萬`），所有圓點均與線條起止精準同步。
>    - **第 4 頁（AI 3D 紙黏土三站）**：頂部時間軌搭配暖橘**行進光珠（`data-travel`）**由 `04:00 → 12:00 → 15:30` 依序切換焦點，純 GPU 虛線引導針由上往下掃落，觸及 3D 烤爐／黏土平板／麵包籃瞬間綻放雙圈目標波紋。
>    - **第 5 頁（震撼頁）**：黑幕頓點 → 領標線揭露 → 巨字破暗 → 分隔線拉開三組財務證據。
>    - **第 6 頁（現場互動試算）**：三財務數 Magic Move 著陸後，左右間隙繪出翠綠因果連接箭頭＋控制卡聚光＋`⇄ 拖曳試算` 單次微動暗示；拖曳滑桿或切換情境時箭頭亮起、三張 KPI 卡顯示相對 Q4 提案即時增減差額（如 `▲ +221 萬`）與底部對照條即時 `年省 XXX 萬` 徽章（靜態／基準態維持極簡）。
>    - **第 7 頁（現代 Bento 進度看板・聚光壓暗＋實體箭頭明星頁）**：進頁時四張綠卡退至 0.30、唯一紅卡「板橋車站店」獨亮高反差紅框＋甘特紅條衝破 `12/01` 垂直虛線紅線 → **赤橘色實體 SVG 因果箭頭**直指下方「`11/22 前拍板`」卡並點亮 `建議方案 A` 翠綠聚光框 → 最後四綠卡回復 100% 並掃出圓環與迷你柱（靜態完稿保留低調因果箭頭）。
>    - **第 8 頁（附件）**：`01 → 04` 順掃後以琥珀虛線垂直導引至底部「適用邊界」聚光橫幅。
> 3. **驗證全數通過**：`lint.py` 全 3 份範例 0 錯 0 警；`check.mjs --jpg --motion` 全 8 頁真實像素 WCAG 全過（最低 **`4.70:1`**）、**7 項動態與視覺指引實測全 ✅**；390px 手機實測全頁零 JS 錯誤、第 5→6 頁三數齊飛（`mid=3, post=0`）、聚光框與因果演變在手機尺寸肉眼清晰可辨；商務元件（`annual-section`、`progress-overview`）回歸組裝通過；已重新打包 `outputs/deck-architect.skill`（135 KB，29 檔，零 `__pycache__`）。
>
> **下一步**：請使用者於互動預覽播放器實測 Phase B.3 視覺指引升級（支援一鍵 `↺ 重播` 檢視各頁動線），確認滿意後進入 **Phase C｜第一份真實簡報端到端 PK 🎯**。
>
> 主軸文件是 `ROADMAP.md`，執行紀錄在 `LOG.md`，專案規則在根目錄 `CLAUDE.md`。

_最後更新：2026-11-24_

## 新對話先做的事

1. 確認在 `presentation-skill-generation` 分支：`git branch --show-current`。不在的話先 `git fetch origin presentation-skill-generation && git checkout presentation-skill-generation`。
2. 讀這份檔案與 `ROADMAP.md`。需要背景時，再讀 `LOG.md` 的最後幾段。
3. 守住 `CLAUDE.md` 的三條規則：
   - 每個段落結束就同步：`STATUS.md`、`LOG.md`、commit、push。
   - Stop hook 會檢查有沒有沒推的變更。
   - **所有要問使用者的問題一律用互動表單（AskUserQuestion）**。每題能單獨看懂，題目互不依賴，一題最多 4 個選項，推薦的放第一個並標「（推薦）」。
4. 驗證腳本 `scripts/check.mjs` 已支援 Playwright 與系統 Chromium CDP 自動退路（會自動帶入 `HTTPS_PROXY`），加 `--motion` 可一併執行 7 項動態與視覺指引實測。

## 階段與進度

| 階段 | 內容 | 狀態 |
|---|---|---|
| 0–1, 2a–2b | 市場研究、v1 四次真實迭代方法論、12 款風格清單、OKLCH 用色系統、首批 3 款規格與插畫 15 種畫風淺深雙底 | ✅ |
| **Phase A** | **地基對齊與輕底盤 v4**：輕底盤＋自由畫布＋商務元件、統一像素 WCAG `check.mjs`、`oklch.py --palette`、清完 11-14 待辦、首批 Style DNA | ✅ |
| **Phase A+ 補課** | **靜態美感上限重練＋協調感精修＋去小字手術**：6 頁全通過 `4.70`–`7.52:1`，定案四大視覺工藝與原則 #26（口白進講者稿、最多 2 層視覺鉤子） | ✅ |
| **Phase B 預研** | **動態技術路線研究與定案**：實查 14 個 GitHub Repo（`inputs/motion-research.md`），使用者正式定案 **方案 1｜分層混合** | ✅ 定案 |
| **Phase B / B.2 / B.3** | **反寫靜態工藝與原則 #26 ＋ 60fps 動態引擎 ＋ 視覺指引規格與原語（v4.3）**：新增 `styles/workday.md`、`references/motion-system.md`、`references/visual-guidance.md`，完成 60fps 零鎖死核心、6 種敘事切頁、三數齊飛 Magic Move、三層聚光壓暗、因果現場演變、真 SVG 描線／方向揭露／目標波紋／行進光珠與互動因果回饋，`v4-alive-demo` 8 頁靜態＋7 項動態實測全過 | ✅ |
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
| **Phase B 動態技術路線＝方案 1｜分層混合**：日常 ~11 KB 零依賴原生核心（60fps GPU 轉場＋WAAPI FLIP Magic Move＋SVG 描線流動＋互動滑桿＋離頁即停輕量 Canvas 2D），底盤預留外掛契約，旗艦簡報才按需徵詢掛載 GSAP／Motion／GLSL／Three.js | 11-23 | `inputs/motion-research.md`、`references/motion-system.md` |
| **原則 #26｜口白進講者稿，畫面只留視覺鉤子（去小字原則）**：`delivery: talk` 下每個視覺群組最多 2 層文字，禁止為了填白硬補第 3 層說明小字，口語脈絡全進講者備註 `notes` | 11-23 | `inputs/presentation-principles.md`、`SKILL.md` |
| **Phase B.3 視覺指引規範（保持單次操作翻頁不變）**：四大靜態動線原型＋三層聚光壓暗＋因果現場演變＋真描線與端點波紋時序＋互動因果回饋，演完與打斷 100% 歸零回復平衡靜態完稿 | 11-24 | `references/visual-guidance.md`、`assets/runtime.js` |

## 交付物地圖

| 路徑 | 內容 |
|---|---|
| `outputs/examples/v4-alive-demo/` | **Phase B.3 視覺指引＋60fps 全動態互動單檔示範（2026-11-24，8 頁全過）**：100% 離線單檔 `deck.html`（1.7 MB，內嵌 AI 底圖），整合 6 種敘事切頁、三數齊飛 Magic Move、24→9 因果翻轉波浪、Apple 成組真描線、紙黏土行進光珠與 3D 物件波紋、即時 ROI 試算差額回饋、Bento 聚光壓暗＋風險指向拍板實體箭頭；含 `check/report.md` 與 8 張截圖 |
| `outputs/deck-architect/` | **v4.3 現行 Skill 原始碼（29 檔，新增 `references/visual-guidance.md`，升級 60fps 視覺指引原語與 `check.mjs --motion` 7 項檢核）** |
| `outputs/deck-architect.skill` | v4.3 打包檔（135 KB，29 檔，零 `__pycache__`） |
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
