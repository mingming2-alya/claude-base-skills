# 外部稽核報告逐條評估（對象：commit `c2bfaf8`，deck-architect v4.8）

- 日期：2026-11-26
- 原文：`inputs/external-audit-c2bfaf8.md`
- 方法：每條都對照原始碼；能實測的用 Playwright＋系統 Chrome 在 `outputs/examples/v48-regression/` 實跑。

## 總結

稽核共 14 條：**同意 11 條、部分同意 3 條，沒有整條不同意的**。不同意的是 2 個子主張和 1 個嚴重度判斷（見結構 3、引擎 2、引擎 5）。

其中 4 條是 v4.8 新增的 `templates/deck.css` 造成或觸發的（引擎 1、3、4，口徑 4）：色值寫成 `oklch()`、只設 `--light-*`／`--dark-*` 前綴變數、頂列留白選擇器太寬。v4.8 最終檢查漏掉的原因：回歸範例的自由畫布頁都寫了 `surface:`；內建頁退回殼層預設色時對比仍然合格；`check.mjs` 沒有「每頁底色是否來自 `deck.css`」這項檢查。

## 逐條判定

| # | 稽核主張 | 判定 | 證據與理由 |
|---|---|---|---|
| 結構 1 | Step 3b 樣張流程斷：`--sheet` 不經組裝、沒有三組配色呈現、樣張搬進 `slides/` 會汙染全域 | 同意 | `check.mjs --sheet` 直接開 `samples/*.html` 裸檔；`build_sheet()` 副標仍是 v4.0 三風格比較文案，也沒有渲染三組配色與理由的機制；`load_free_slide` 只改寫 `.slide` 與 `:root`，獨立 HTML 樣張裡的 `body{}` 會影響整份簡報。 |
| 結構 2 | 自由畫布 `slides/*.html` 不受約束檢查 | 同意 | 實測：在 `slides/*.html` 寫入地雷詞、簡體字、過場語與「你們」，`lint.py` 與 `assemble.py` 都 0 錯通過。「`storyboard.yaml` 是唯一內容來源」的說法也和現況不符，自由畫布的內文在 `slides/`。 |
| 結構 3 | 發散題標（推薦）會錨定；brief 檢查不分場合；5 章以上硬擋 | 部分同意 | ① 錨定：同意。`grill.md` 寫了「腦力激盪題的選項只是引子」，但沒寫明發散題不標（推薦）。② 依 `stage_mode` 放寬 brief 檢查：不同意。briefing 的故事種子寫「無」本來就只警告；三個候選含破框是 Phase C.1 使用者拍板的，破框是「不循規蹈矩」的落點，日常決策會議一樣受益（例：先講決策再講經過）；要輕量有快速模式。③ 章數：同意。原則寫「盡量不超過 3 個，超過用目錄」，`lint.py` 對 5 章以上直接報錯比原則嚴，改強警告較一致。 |
| 結構 4 | 圖鑑沒有主題標籤、招牌動態標籤與 `index.json` 對不上 | 同意 | `workday` 卡漏 `ruler-progress`、`apple` 卡漏 `colorize-wipe`；卡片沒有〈主題類型總表〉的主題標籤；`illustration` 活體預覽演的是光掃顯色，不是自家招牌 `popup-fold`／`chat-replay`。 |
| 引擎 1 | `meta.mode` 與配色在沒寫 `surface` 的頁面失效（P0） | 同意 | 實測：`mode: dark` 時封面、結尾等內建頁仍是殼層預設的 `#F1EFEA`／`#0D6B4F`。`shell.css` 沒有 `html[data-mode]` 對應，`templates/deck.css` 只設前綴變數。舊範例的 `deck.css` 多半直接設 `--bg` 等變數，所以 v4.8 前沒有發作。 |
| 引擎 2 | 腳本順序倒置＋首頁動態「全面啞火」（P0） | 部分同意 | 頁內腳本照 `motion-system.md` 呼叫 `window.__deck.stage` 會丟 `TypeError`：同意，屬 P1（文件寫法跑不動）。「首頁一打開完全靜止」說重了：實測直接開在第 2、3、4、6、7 頁，11 個風格原語與 `data-beat` 內容都完整可見，只是第一頁不播進場（P2）。修法也不能只換順序：改成 runtime→module→slide 後，頁內腳本會錯過第一頁的進場事件，要讓 runtime 等所有腳本載完再觸發第一頁。 |
| 引擎 3 | `fx/core.js` 讀不到 OKLCH | 同意 | `parseRgb()` 只認 hex 與 `rgb()`，遇到 `oklch()` 退回寫死的藍色（`37,99,235`／`99,179,237`）。 |
| 引擎 4 | top-bar 上邊距誤套到封面、震撼、結尾；`check.mjs` 不查導航外殼 | 同意 | v4.8 新增的 `.slide.canvas:not([data-nav])` 範圍太寬；`check.mjs` 沒有任何 `#nav`／`#tabs`／`#nav-side` 的檢查。 |
| 引擎 5 | 四個邊角細節 | 部分同意 | 同意：End 鍵跳進附件頁、講者頁總頁數含附件、keynote 的氛圍特效預算沒檢查、`delivery` 用子字串比對（寫 `ready` 會命中 `read`）。`pillars` 用了含 `unlisted` 的章節清單：同意要排除，但它只是警告，不會「逼」總覽頁劇透。縮圖刪 `id` 會破 SVG 漸層：不同意。投影片用 `visibility: hidden` 隱藏，縮圖裡的 `url(#…)` 仍會指向原頁的定義；實測刪掉 `id` 的複本漸層正常顯示，刪 `id` 反而避免重複 `id`。 |
| 口徑 1 | `outputs/style-specs/` 與 `styles/` 分叉，原則與 ROADMAP 指向舊目錄 | 同意 | `presentation-principles.md` 與 `ROADMAP.md` 仍指 `outputs/style-specs/`。 |
| 口徑 2 | 擺動聚光燈與 `.flow-token` 殘留 | 同意 | `styles/index.json:34`、`styles/apple.md:78`、`apple-kit.css:22` 仍寫擺動；`shell.css:304` 的 `.flow-token` 是 `infinite` 動畫。 |
| 口徑 3 | `counsel` 零陰影與自家套件衝突 | 同意 | `styles/counsel.md:14` 寫零陰影，`counsel-kit.css:99` 的 `[data-rack-focus]` 有外陰影。 |
| 口徑 4 | `oklch.py` 只吐 hex，範本寫 `oklch()` | 同意 | v4.8 範本造成。 |
| 口徑 5 | 3a 改做法時沒提醒清掉 Step 2 的 `module`；兩種對話動畫沒寫分工 | 同意（小） | `samples.md`「3a 之後」只寫沿用 Step 2 的 `module`；`flow-carousel="chat"` 與 `data-chat-replay` 沒寫各自適用的情境。 |
| 收口順序 | 先修 P0/P1，再處理體驗摩擦，然後真實簡報 PK | 同意 | 另外建議 `check.mjs` 新增「每頁底色來自 `deck.css`」，讓引擎 1 這類問題以後能被檢查抓到。 |

## 修法上的不同意見

- **引擎 2**：不只換腳本順序，還要讓 runtime 延後觸發第一頁，確保頁內腳本與動態套件都收得到第一頁的進場事件。
- **配色格式（引擎 3＋口徑 4）**：範本改回 `oklch.py` 產出的 `#hex`（現有檢查與特效都讀得懂），引擎另外改成由瀏覽器畫像素換算，手寫 `oklch()`／`color-mix()` 也讀得到。
- **縮圖刪 `id`**：不改。

## 待使用者決定

見 `STATUS.md`〈待使用者決定〉：修補範圍、發散題是否標（推薦）、briefing 是否放寬 brief 檢查、第一頁是否自動播進場。
