# 模組總覽與選用決策表（Modules Catalog · v4.5 亂中有序治理）

> **核心原則**：簡報能力再多元，依然維持 **0 KB 零浪費** 與 **單一焦點紀律**。所有模組分為三層：
> - **Layer 0 核心輕底盤**（`shell.css` + `runtime.js`）：永遠載入。負責 1920×1080 舞台縮放、`data-surface` 明暗雙極、`nav_mode`、底控膠囊、6 種 60fps 切頁、Magic Move、`data-step` 雙軌步進與 Overlay 優先級註冊表（`Esc` 順序：`annotator(90) > lightbox(80) > grid(70) > appendix`）。
> - **Layer 1 講者臨場工具**（`assets/presenter/`）：依 `meta.delivery` 自動掛載（`talk`/`discuss` 預設全載；`read`/`auto` 僅載 `grid`），可用 `meta.presenter_tools: [...]` 或 `[]` 覆寫。
> - **Layer 2 按需內容模組**（`assets/components/`、`assets/modules/`、`assets/fit.js`）：由 `assemble.py` 掃描投影片 HTML 標籤自動精細注入（連 `components` 與 `ambient-fx` 都拆分到單檔級別，沒用到就是 **0 KB**）。

## 1. Layer 1：講者臨場工具（Presenter Chrome）

| 工具 ID | 快捷鍵 | 用途 | 預設啟用時機 | 詳細手冊 |
|---|---|---|---|---|
| `grid` | `G` | 16:9 縮圖矩陣，現場 Q&A 秒速非線性跳頁 | 所有 `delivery` 模式 | `references/modules/presenter-and-fx.md` |
| `annotator` | `A` / `L` / `C` | 1920×1080 鎖定座標畫筆／螢光筆（`A`）、雷射筆（`L`）、清除（`C`） | `talk`、`discuss` | `references/modules/presenter-and-fx.md` |
| `speaker` | `S` | 跨分頁雙螢幕講者控制台（當頁、下頁預覽、大字備註、計時器、遠端翻頁） | `talk`、`discuss` | `references/modules/presenter-and-fx.md` |

## 2. Layer 2：內容說服模組選用決策表（什麼時候用什麼）

| 現場說服需求 | 選用模組 | 觸發屬性 / class | 粒度與注入方式 | 深入用法手冊 |
|---|---|---|---|---|
| 進度總表、三柱總覽、自動目錄、瀏覽器／手機框 | `components` | `.status-table` / `.pillars` / `.toc-list` / `.cmp` / `.device-browser` / `.device-phone` / `.device-tablet` | **細粒度單檔注入**（只載該頁用到的 CSS） | `references/modules/media-and-gallery.md` |
| 封面或關鍵大幕低調動態氛圍 | `ambient-fx` | `data-fx="ambient-dust\|soft-aurora\|constellation\|data-stream\|orbit-ring\|confetti-burst"` | **單特效注入**（只載該 `data-fx` 對應 JS，自動讀 `--fx-color`/`--accent`） | `references/modules/presenter-and-fx.md` |
| 試算器滑桿、分段膠囊、開關、情境預設、一鍵還原 | `live-controls` | `.live-ctrl`, `input[type=range]`, `[data-segmented]`, `[data-toggle]`, `[data-presets]`, `[data-reset]` | CSS + 宣告式互動 JS | `references/modules/interactive-explainers.md` |
| 標題／大數字／區塊溢出防爆＋1:1 無縮放匯出 | `fit` | `data-fit="phrase\|figure\|box"`、URL `?noscale=1` | 純 JS | `references/modules/interactive-explainers.md` |
| 產品實錄影片（含片段循環、倍速、全螢幕）、音檔／A-B 同步切換 | `media` | `<video data-slide-video>`, `<audio data-sound-demo>`, `[data-sound-ab]` | 外部相對路徑，離頁停播歸零 | `references/modules/media-and-gallery.md` |
| 產品操作流、步驟回放、產品／AI Agent 介面對話流（含工具呼叫） | `flow-carousel` | `[data-flow-carousel="vertical\|horizontal\|stepper\|chat"]` | 4 模式合一，含節點聯動與時間軸（`chat` 用於產品／Agent UI 演示） | `references/modules/media-and-gallery.md` |
| 3D 照片牆、無縫客戶 Logo 跑馬燈、燈箱預覽 | `coverflow` | `[data-coverflow]`、`[data-cf-lightbox]`、`[data-marquee]` | GPU 3D + 靜態／列印自動轉網格 | `references/modules/media-and-gallery.md` |
| 說明文字與架構圖／流程圖雙向聯動高亮 | `linked-highlight` | `[data-ref="id"]` | Hover/Click 雙向聚焦＋其餘壓暗 | `references/modules/interactive-explainers.md` |
| 新舊 UI、降噪前後、效能優化前後拉桿對比 | `compare-slider` | `[data-compare-slider]`（內含 `[data-cs-before]` + `[data-cs-after]`） | 指標／鍵盤拖曳，靜態停 50% | `references/modules/interactive-explainers.md` |
| 技術簡報程式碼語法上色＋步進行聚焦＋終端打字 | `code-stage` | `[data-code-stage]`、`data-step-lines`、`[data-typewriter]` | 零依賴 Tokenizer，連動 `data-step` | `references/modules/interactive-explainers.md` |
| 高密圖表點擊放大燈箱、輕微 3D 傾角、游標光暈 | `visual-flair` | `[data-zoomable]`、`[data-tilt]`、`[data-spotlight-hover]` | 傾角鎖定 ≤5°，燈箱吃 Overlay 棧 | `references/modules/presenter-and-fx.md` |
| 日常看板刻度尺推進、風險卡展開聚焦 | `motion-workday` | `[data-ruler-progress]`、`[data-bento-expand]` | 綁定 `workday` 風格 DNA，未用到 0 KB | `references/modules/style-motion-kits.md` |
| 排名超車攀升、機械滾輪數字、推鏡景深聚焦 | `motion-counsel` | `[data-rank-race]`、`[data-odometer]`、`[data-rack-focus]` | 綁定 `counsel` 風格 DNA，未用到 0 KB | `references/modules/style-motion-kits.md` |
| 遮罩斬切文字、單次聚光掃字、3D 景深疊卡、黑白光掃上色 | `motion-apple` | `[data-split-mask]`、`[data-spotlight-sweep]`、`[data-depth-deck]`、`[data-colorize-wipe]` | 綁定 `apple` 風格 DNA，未用到 0 KB | `references/modules/style-motion-kits.md` |
| 立體書 3D 翻折舞台、敘事角色對話氣泡劇院 | `motion-story` | `[data-popup-fold]`、`[data-chat-replay]` | 綁定 `illustration` 風格 DNA（敘事／教學情境對話，未用到 0 KB） | `references/modules/style-motion-kits.md` |

### 誰在什麼時候決定哪些模組（主柱邊界）

| 類別 | 模組 | 什麼時候決定 | 為什麼 |
|---|---|---|---|
| **內容說服載體** | `live-controls`、`media`、`flow-carousel`、`coverflow`（照片牆、Logo 牆）、`linked-highlight`、`compare-slider`、`code-stage`、`components`（進度總表、一頁總覽、裝置框）、`visual-flair` 的 `data-zoomable`（高密圖點擊放大） | Step 1b 用白話記成說服載體，Step 2 寫進 `director.module` | 它們回答「用什麼證明這個論點」，是內容需求；Step 3a 會拿它們回頭篩風格（對照 `avoid_motions`） |
| **呈現與氛圍** | `ambient-fx`、`visual-flair` 的 `data-tilt`／`data-spotlight-hover`、4 套 `motion-*` | Step 3a 選定風格後 | 合不合適取決於風格：例如 `apple` 推薦 `ambient-fx`，`workday` 禁用 |
| **自動** | `fit` | 不需要決定 | `assemble.py` 看到 `data-fit` 就自動注入 |

## 3. 場合預算上限（`stage_mode` Budgets）

| 場合 `stage_mode` | `ambient-fx` 上限 | 允許高氛圍模組 | 推薦主力說服模組（含風格綁定動態） |
|---|---|---|---|
| `briefing`（決策匯報） | **0 頁（禁止）** | ❌ 禁 `ambient-fx`、`coverflow`、`data-tilt`、`motion-apple`（`spotlight-sweep`/`depth-deck`/`colorize-wipe`） | `components`、`motion-workday`、`motion-counsel`、`linked-highlight`、`compare-slider`、`code-stage`、`visual-flair`（僅 `data-zoomable`） |
| `pitch`（對外提案） | **最多 1 頁**（通常僅封面） | 視說服需求節制使用 | `motion-*`（依風格 DNA 注入）、`live-controls`、`flow-carousel`、`compare-slider`、`linked-highlight`、`media`、`device-frame`、`marquee` |
| `keynote`（發表會／大幕） | **最多 2 頁**（封面／震撼／收尾） | 全模組開放（守單頁單主角與風格 `avoid_motions`） | `motion-apple`/`motion-story`、`data-step`、`media`、`flow-carousel`、`coverflow`、`ambient-fx`、`compare-slider` |

## 4. ❌ 五條硬紀律（違反會由 `assemble.py` 發出 `[WARN]`）

1. **單頁單主角**：同一頁絕不同時放兩個主角級互動模組（`flow-carousel` / `coverflow` / `compare-slider` / `slide-video` / `code-stage` / `depth-deck` / `rank-race`）。
2. **三條通用契約不可破**：所有客製元件都必須讀語意色票變數（適配 `data-surface`）、帶 `.live-ctrl` 或 `registerOverlay()`（不誤翻頁）、監聽 `deck:slideleave`/`deck:still`/`deck:lowpower`（靜態／列印／低耗電乾淨定格）且不得殘留正文區永動干擾動畫。
3. **風格 × 動態不可違背 `avoid_motions`**：`assemble.py` 會自動讀 `styles/index.json` 中 `meta.style` 的 `motion_dna.avoid_motions`；跨界混用（如 `workday` 用 `spotlight-sweep`、`counsel` 用 `popup-fold`、`illustration` 用 `code-stage`）將發出 `[WARN]`。
4. **影音一律外連**：`<video>` 與 `<audio>` 永遠放 `media/` 相對路徑（只內嵌 `poster` 海報圖），禁止把大影音轉 Base64。
5. **選用白名單（可選）**：可在 `storyboard.yaml` 寫 `meta.modules: [...]` 鎖定本份簡報預期用到的模組；若投影片不小心用出白名單以外的模組，`assemble.py` 仍會注入（不中斷），但會印出 `[WARN]` 提醒同步設計決策。
