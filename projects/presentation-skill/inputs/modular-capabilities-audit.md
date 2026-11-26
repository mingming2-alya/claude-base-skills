# GitHub 簡報技能二次盤點：按需模組深化與 Nice-to-Have 漏網能力（2026-11-25）

> **盤點目的**：在 Phase C.2 完成 7 項按需自動注入模組（`components`、`ambient-fx`、`live-controls`、`fit`、`media`、`flow-carousel`、`coverflow`）後，重新透過 `gh api` 實查本專案收錄之頂尖 GitHub 簡報 Skill 原始結構與元件庫，聚焦兩件事：
> 1. 如何讓現有 7 項按需模組更全面、多元且靈活；
> 2. 除了這 7 項，還遺漏了哪些高價值 Nice-to-Have（同樣可採按需模組化注入，未用到 0 KB）。
>
> **授權紀律**：`lewislulu/html-ppt-skill`、`nicobailon/visual-explainer`、`stackblitz/bolt-slides`、`zarazhangrui/frontend-slides`、`open-slide/open-slide`、`alchaincyf/huashu-design`、`borjaperfra/beatdeck`、`Jane-xiaoer/paper-collage-ppt`、`emilkowalski/skills` 皆為 **MIT**；`op7418/guizang-ppt-skill` 為 **AGPL-3.0**（僅參考公開 README 概念，絕不複製程式碼或 CSS）。

---

## 一、現有 7 項按需模組的深化升級清單

| # | 現有模組 | 現況邊界 | GitHub 標竿參考 | 建議升級（更全面、多元、靈活） |
|---|---|---|---|---|
| 1 | **`ambient-fx`** | 僅 2 種背景（`ambient-dust`、`soft-aurora`），色彩寫死 | `lewislulu/html-ppt-skill` (MIT) 20 支獨立 Canvas 2D FX（`constellation`、`neural-net`、`data-stream`、`gradient-blob`、`orbit-ring`、`confetti-cannon`、`starfield`）＋ `guizang` 降飽和／FPS 節流概念 | **按 `data-fx="<name>"` 細粒度單支注入**（每支 ~1.5 KB），擴充至 6–8 種高品位場景（補入 `constellation` 節點連線、`data-stream` 數據光流、`orbit-ring` 軌道環、`confetti-burst` 慶祝結尾），全面改吃 CSS 變數 `--fx-color`／`--accent` 自動適配風格與明暗 |
| 2 | **`media`** | `<video>` 基本播停／靜音；`<audio>` 單條波形 | `huashu-design` (MIT) 音效回饋、`visual-explainer` (MIT) 靜態與無障礙規範 | ① `<video>` 支援 **`data-start`／`data-end` 精華片段循環**、**`data-rate` 倍速**、點擊全螢幕；② `<audio>` 新增 **`data-sound-ab` 同時間軸 A/B 無縫即時切換**（盲測降噪／音質前後對比最強載體） |
| 3 | **`flow-carousel`** | 僅「左頁籤＋右垂直卡堆疊」單一形態 | `stackblitz/bolt-slides` (MIT) `Tabs`/`Chat`/`BrowserFrame` ＋ `nicobailon/visual-explainer` (MIT) `.ve-player` 事件重播器 | 升級支援 **`data-flow-carousel="vertical|horizontal|stepper|chat"`** 四形態：垂直卡堆疊、橫向步驟滑動、**架構事件重播（步進同步點亮對應圖形節點＋播停拉桿）**、**AI 對話／Agent 串流卡片模擬**（免錄屏活演 AI 產品） |
| 4 | **`coverflow`** | 僅 3D 水平扇形 CoverFlow 單一形態 | `lewislulu` (MIT) `kenburns`/`card-flip-3d`、`bolt-slides` (MIT) `Marquee`/`Comparison` | 擴充為多形態視覺展演，或拆出獨立按需模組：**`before-after` 拖曳對比拉桿**（改版前後／實拍對比）、**`marquee` 無縫夥伴／LOGO 滾動帶**（靜態自動變整齊網格）、**`lightbox` 點擊大圖檢視** |
| 5 | **`live-controls`** | 僅 `<input type="range">` 樣式 | `visual-explainer` (MIT) Live Figure（slider + policy toggle + reset）、`bolt-slides` (MIT) `Tabs`/`Pricing` | 補齊完整現場試算控制元件：**分段切換膠囊（`data-segmented`）**、**開關切換（`data-toggle`）**、**情境預設列（`data-presets`）**、**一鍵重設基準值**，全數支援淺深極性與 `aria-pressed` |
| 6 | **`components`** | 17.6 KB 整包注入（用 1 頁目錄就載入全套表與柱） | `bolt-slides` (MIT) 細粒度元件庫、`visual-explainer` (MIT) 按標籤載入 | **按實際頁型細拆注入**（`status-table`、`pillars`、`toc`、`cmp-fallback` 各自獨立）；並增補商務／技術高頻元件：**輕量裝置框（`device-frame`：macOS／瀏覽器／手機）** |
| 7 | **`fit`** | 僅 `phrase` 與 `figure` 單純降字級 | `frontend-slides` (MIT) `noscale` 匯出鉤子 | 新增 **`data-fit="box"` 容器防爆框自適應縮放**＋ **`?noscale=1`** 1:1 原始座標模式（銜接未來 Phase E 精準截圖／PPTX 匯出） |

---

## 二、遺漏的高價值 Nice-to-Have（全數可採按需模組化注入）

### A. 現場演講「臨場掌控」類（最大體驗空缺）
1. **全頁縮圖總覽網格（`G` 鍵 Grid Overview）** — 參考 `bolt-slides` (MIT) / `guizang` (AGPL 概念)：Q&A 跳頁必備，按 `G` 彈出 16:9 縮圖矩陣直接點跳任一頁（~2.5 KB 零依賴）。
2. **即時白板畫筆與雷射筆（`A` 鍵 Annotate / `L` 鍵 Laser）** — 參考 `bolt-slides` (MIT `Annotator.tsx`) / `guizang` (AGPL 概念)：鎖定在 1920×1080 舞台座標系（縮放螢幕也永遠圈住同一個數字），含紅／亮色螢光筆、圈選與一鍵清除，按需載入或精簡內建（~3.5 KB）。
3. **跨分頁雙螢幕講者模式（`S` 鍵 Speaker View via `BroadcastChannel`）** — 參考 `bolt-slides` (MIT `Deck.tsx`) / `guizang` (AGPL 概念)：純原生零伺服器雙分頁同步（當前頁＋下一頁預覽＋大字備註＋碼錶計時＋步進狀態）。*（原定 Phase E，實作成本其實僅 ~4 KB。）*

### B. 視覺解說與技術說服「殺手級按需模組」
4. **文圖雙向聯動高亮（`linked-highlight`：`data-ref="id"`）** — 參考 `visual-explainer` (MIT)：游標移過／點擊左側文字術語，右側架構圖／產品剖面對應零件立即發光、配角微壓暗（~1.2 KB，技術簡報與產品拆解神技！）。
5. **Before / After 互動拖曳對比器（`compare-slider`：`data-compare-slider`）** — 拖曳中軸分割線即時對比兩張圖或雙層 HTML 畫面，靜態定格於 50%（~2 KB）。
6. **程式碼／終端機活演示視窗（`code-stage`）** — 參考 `bolt-slides` (MIT `CodeWindow`) ＋ `beatdeck` (MIT `Typewriter`)：輕量零依賴語法著色＋配合 `data-step` 逐段聚光指定行號（其餘行壓暗）＋可選終端機打字機（~3.5 KB）。
7. **微互動卡片觸感（`card-flair`：`data-tilt` / `data-spotlight-hover`）** — 參考 `frontend-slides` (MIT `TiltEffect`) ＋ `bolt-slides` (MIT `SpotlightCard` / `TiltCard`)：極克制 ≤5° 3D 微傾與游標跟隨柔光（~1.5 KB，`?still=1`／`B` 自動關閉）。
8. **大圖／架構圖現場點擊放大平移（`lightbox-zoom`：`data-zoomable`）** — 參考 `visual-explainer` (MIT)：複雜架構圖、甘特圖或實拍細節點一下全螢幕放大檢視、`Esc` 縮回（~2 KB）。

### C. 已排定於 Phase E 的閉環能力（維持原階段即可）
- 按 `E` 鍵原位改字並下載更新版 HTML（`frontend-slides` MIT）
- 畫面上點選留言回饋給 Agent（`open-slide` MIT / `visual-explainer` `ask.js`）
- 文字可編輯 PPTX 匯出（`paper-collage-ppt` / `visual-explainer` MIT）
- 旗艦按需 Three.js 3D 舞台（維持事前徵詢外掛契約）
