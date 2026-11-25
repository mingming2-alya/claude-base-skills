# 狀態：presentation-skill（deck-architect）

> **最新接手點（2026-11-24｜Phase B.3.2 完成 ✅：語意閱讀順序重整（平板／試算）＋ 反移動球劫持視線（黏土分段軌線）＋ 規格反寫）**：
>
> 1. **兩條第一性原理新鐵律反寫入 `outputs/deck-architect/references/visual-guidance.md`（已重新打包 `outputs/deck-architect.skill`，29 檔）**：
>    - **反模式「移動球劫持視線（Motion Capture）」**：多站時間軸嚴禁放一顆連續跨站奔跑的光珠（會觸發人眼平滑追視反射而忽略文字與插畫）；改採**分段橋接軌線（Segmented Bridge Rail）**——每站停留期間留足 **0.6–0.9 秒完全靜止閱讀窗**，僅在換站瞬間用 350–380ms 鋪出前往下一站的短段連接軌線。
>    - **鐵律「內容語意順序永遠高於轉場花招」**：產品介面頁必守「怎麼算（輸入與動作）→ 預報結果 → 量化業務成效」由左至右單調推進，裝置內外左右分組一致、絕不同時搶跑；試算頁必守「左輸入條件 → 因果箭頭 → 右完整結果」，不讓前頁跨頁飛字讓右半結果搶先於左半條件出現。
> 2. **依使用者實測回饋完成 `outputs/examples/v4-alive-demo/` 三頁關鍵重構**：
>    - **第 3 頁（Apple 平板・三拍語意由左至右重整）**：平板內與外側標註全面依語意對齊——**Stage 1（`0–2.50s`）**聚光左半「怎麼算」（`降雨 80%・18°C` ＋ `建議出爐盤數` 3 張品項卡逐張從容進場 ＋ 左外標 `氣象 × 連假`、`12 分鐘確認排程`）→ **Stage 2（`2.50–4.45s`）**聚光右半「預報結果」（`4.2%` ＋ `低於 6% 紅線` ＋ `8 週走勢` 描線到端點波紋，移除無限循環移動點）→ **Stage 3（`4.45–5.85s`）**向右展開業務成效（`−63% 打烊報廢盤數`、`34 萬單店年省原料`）。同時保留第 3 ↔ 4 頁 `4.2%` 跨頁 Magic Move（由數位平板飛入黏土平板）。
>    - **第 4 頁（AI 3D 紙黏土三站・移除移動球＋分段靜讀）**：移除橫跨 1250px 的連續滑動光球，改為兩段靜謐橋接線（`seg-1`、`seg-2`）搭配 `04:00 → 12:00 → 15:30` 三拍聚光壓暗；每站落針與物件波紋後皆保留 660–740ms 完全靜止時間讓觀眾讀清標題與實體黏土物件，換站瞬間才輕柔鋪出下一段軌線。
>    - **第 6 頁（現場互動試算・純因果「左條件 → 箭頭 → 右結果」）**：第 5→6 頁切頁改為俐落 `push` 橫移（不讓右半數字搶先飛入造成左右乒乓）；**Stage 1（`0–2.10s`）**先聚光左側設定條件（`Q4 五店`、`5 家`、`4.2%`、`單店建置 12 萬｜預估總投入 60 萬`）並於此區輕示 `⇄ 拖曳試算`，此時右側整欄安靜壓暗 `0.26` → 繪出左→右因果箭頭 → **Stage 2（`2.10–4.15s`）**一次亮起右側完整試算結果（`170 萬` → 三 KPI → `269 萬 vs 99 萬` 長條圖）；且一旦使用者提早拖曳滑桿或點選情境，立即解除壓暗全頁 100% 亮顯並重算。
> 3. **驗證全數通過**：`lint.py` 0 錯 0 警；`check.mjs --jpg --motion` 全 8 頁靜態像素 WCAG 全過（最低 **`4.70:1`**）、**7 項動態與視覺指引實測全 ✅**（涵蓋第 2／3／4／6／7 共 5 頁聚光壓暗與復原零殘留、以及第 3 ↔ 4 頁 `hero-rate` 正反向 Magic Move）；逐幀實拍檢視第 3、4、6 頁各階段中場畫面與提早拖曳即時解除壓暗皆通過；互動預覽檔已同步重建並經 Chrome 實測零錯誤。
>
> **下一步**：請使用者於更新後的互動預覽播放器實測第 3、4、6 頁閱讀動線，確認滿意後進入 **Phase C｜第一份真實簡報端到端 PK 🎯**。
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
