# 動態技術路線研究：14 個簡報／動態 Skill 的 GitHub 實作拆解（2026-11-19）

> **研究動機**：在決定 `deck-architect` Phase B（注入 HTML 獨有的「活」）的技術路線之前，除了 GSAP 之外，直接透過 `gh api` 檢查本專案已收錄的 **14 個 GitHub 相關 Skill 原始碼、`package.json`、執行期檔案與授權條款**，從第一性原理整理出實際存在的技術路線、優缺點與單檔離線相容性。
>
> **授權紀律**：所有標示 **AGPL-3.0** 的專案（`op7418/guizang-ppt-skill`、`chuspeeism/dashi-ppt-skill`）僅盤點公開的技術選型與架構概念，**不複製任何程式碼或 CSS**。

---

## 一、14 個 GitHub Repo 技術棧與授權盤點（2026-11-19 實查）

| # | Repo | ⭐ | 授權 | 實際動效技術棧 | 執行環境／交付形態 | 單檔雙擊離線 | 關鍵亮點 |
|---|---|---:|---|---|---|---|---|
| 1 | `emilkowalski/skills` | 58.2k | **MIT** | CSS Transition / `@starting-style` → WAAPI → **Motion (`motion.dev`)**／手寫 Spring + Pointer Events | 設計工程師動效原則 Skill（含 `apple-design`、`animate`、`choreograph`、`animation-performance`、`gestures`） | 視實作 | 「最低成本工具階梯」、可打斷 Spring（`response` + `damping`）、速度接手與指數動量投影 `project(v, 0.998)` |
| 2 | `zarazhangrui/frontend-slides` | 32.6k | **MIT** | **純 CSS Transition** + `<deck-stage>` Web Component + 輕量原生 JS（3D Tilt Hover） | 單檔 HTML | ✅ | 零動畫依賴；非當前頁以 `visibility: hidden` 保留狀態不卸載；提供 `slidechange` 事件掛鉤 |
| 3 | `op7418/guizang-ppt-skill` | 30.2k | **AGPL-3.0**（僅學概念） | **Motion One**（本地 `motion.min.js` 64 KB + CDN 雙保險）+ **原生 WebGL GLSL Shader** | 單檔 HTML | ✅（含本地檔） | 每頁語意化動效 recipe（禁每頁通用 fade-up）；WebGL 背景僅 Hero 頁透出、30fps 上限、`B` 鍵 `body.low-power` 凍結靜態 |
| 4 | `alchaincyf/huashu-design` | 29.9k | **MIT**（貼紙另議） | **雙軌解耦**：簡報頁走純 HTML/CSS；動態片走自研零依賴 `Stage+Sprite+interpolate`（10 KB）或 **GSAP + HyperFrames** | 多檔 HTML deck / 單檔動畫 / MP4 | ✅（簡報／Stage） | **方法層與引擎層分離**；「Slow-Fast-Boom-Stop」五段節奏；40 行閉式解析彈簧 `springEase`（seek-safe、可確定性截幀） |
| 5 | `nicobailon/visual-explainer` | 11.2k | **MIT** | **純 CSS** + **SVG `pathLength="1"`** + **CSS `offset-path: path(...)`** + 原生 JS Live Model + 按需 `importmap` Three.js | 單檔 HTML | ✅（2D 全離線） | 免 DrawSVG／MotionPath 外掛就能做描線與資料點沿路徑流動；`input[type=range]` 即時重算圖表（列印自動隱藏控制項） |
| 6 | `chuspeeism/dashi-ppt-skill` | 10.9k | **AGPL-3.0**（僅看架構） | React 18 + **GSAP 3.15** + esbuild 打包 + `pptxgenjs` | Node 建置後輸出編輯器 HTML | ⚠️ 需先建置 | 偏模板編輯器路線，建置鏈較重 |
| 7 | `open-slide/open-slide` | 9.8k | **MIT** | **100% 原生 WAAPI (`el.animate()`) + 自寫 FLIP Overlay 引擎**（無 GSAP、無 Framer Motion！） | Vite + React 19 App | ❌（需 Vite） | **零外部動畫庫實現 Keynote 級 Magic Move**：量測 rect → 覆蓋層 clone → 隱藏原件 → 同步內插位置、縮放、反縮放圓角與文字／背景／SVG 色彩；離場頁鎖住 `opacity: 1` 防閃底色 |
| 8 | `lewislulu/html-ppt-skill` | 9.2k | **MIT** | **27 種純 CSS 動畫** + **20 種模組化原生 Canvas 2D 特效**（每檔 1–3 KB） | 純靜態 HTML + `assets/` | ✅ | `fx-runtime.js` 用 `MutationObserver` 監聽切頁：**進頁啟動 RAF，離頁呼叫 `stop()` 銷毀 Canvas**，零背景耗能 |
| 9 | `zarazhangrui/beautiful-html-templates` | 5.0k | **MIT** | **純 CSS** + `deck-stage.js` | 單檔 HTML | ✅ | 零依賴極簡舞台底盤 |
| 10 | `bangtutorial/bang-motion` | 2.8k | **MIT** | **GSAP 3（CDN）**（必要時搭 Three.js）+ Puppeteer 逐幀匯出 MP4 | 單檔 `index.html`（依賴 CDN） | ⚠️ 需網路載 CDN | 電影感動態圖形（明確反 PPT 淡入淡出）；全畫面為時間軸純函數，`?debug=1` 拖曳、`?clean=1` 精準出片 |
| 11 | `stackblitz/bolt-slides` | 1.2k | **MIT** | React 18 + **Framer Motion (`^11.3.0`)** | Vite + React App | ❌（需 Vite） | 宣告式 `<Build at={n}>` 逐點擊顯示（位移+微模糊）與 `<Reveal>`，內建 `isStatic` 旗標給縮圖／列印直接輸出靜態終態 |
| 12 | `borjaperfra/beatdeck` | 247 | **MIT**（已查 `LICENSE`） | **混合**：場景與元件換拍用**純 CSS Transition**；自動連續拍（打字、計數、連鎖警報）用 **GSAP 3.15 Timeline** + Canvas 2D 粒子層 | Vite + React 18 離線包 | ⚠️ 需 Vite build | **唯一鐵律「禁止疊化」**：離場快（320ms）→ 清場延遲（340ms）→ 進場慢（900ms）；每拍由 `{scene, beat, initialLive}` 確定性重建，前後跳頁或重整皆不壞 |
| 13 | `gongnyang/awesome-html-scrolline-deck` | 111 | **MIT** | **GSAP 3.15**（`CustomEase`、`Flip`、`DrawSVG`、`MorphSVG`、`SplitText`）+ **Lenis 1.3.26** 捲動 | Vite + Vanilla JS | ⚠️ 需 Vite build | 「單一舞台＋單一主時間軸＋元素交棒（handoff）」；6 套運鏡概念包（`rail`/`data`/`launch`/`zoom`/`canvas`/`kinetic`）；捲動、按鍵、MP4 畫面 100% 一致 |
| 14 | `Jane-xiaoer/paper-collage-ppt` | 70 | **MIT** | **依風格分軌**：剪紙／幾何風用**純 CSS `steps()` 定格動畫**；`haoqi-3d`／`playful-lab-3d` 用本地 **Three.js + EffectComposer** + 自寫 RAF Lerp／四元數微呼吸 | 2D 單檔 HTML；3D 需本機 HTTP（ES Modules） | ✅（2D）／⚠️（3D 需 local server） | 2D 零依賴做到強烈手作定格個性；3D 把 WebGL 當場景＋真 HTML 當 `#txt` 文字層，並以 `registerPptx3D()` 拆出透明 3D 物件匯出可編輯 PPTX；內建 `?still=1` 靜態凍結 |

> **補充：既有本地與特殊庫**
> - **`greensock/gsap-skills`**（18.1k，Skill 文件為 MIT，已收錄於 `skills/gsap-*`）：GSAP 3.15 函式庫本身在被 Webflow 收購後已**免費開放商用**（包含所有原 Club 外掛：`Flip`、`SplitText`、`DrawSVG`、`MorphSVG`、`MotionPath`、`ScrollTrigger`），但採用 **Webflow Standard "No Charge" License（非純 MIT／OSI 授權）**，明文禁止用於打造與 Webflow 競爭的無碼視覺動畫建構工具，也不適合直接混進寬鬆開源套件任意再授權。核心約 ~35 KB gzip（未壓縮 ~70 KB），加上常用外掛約 100–160 KB。
> - **ASCII 動態專門庫**（收錄於 `research-html-slide-skills.md`）：`asciinema-player`（真文字終端播放）、`textmode.js`（WebGL2）、`emilwidlund/ASCII`（Three.js GPU 濾鏡）——僅適用於極少數終端／程式風格，不屬於通用底盤。

---

## 二、六大技術路線深度拆解

從 14 個 repo 的真實程式碼來看，HTML 簡報的動態工程並非「純 CSS vs GSAP」的二選一，而是清楚分化為 **6 條技術路線**：

### 路線 A｜零依賴原生 Web 平台（CSS + WAAPI + 手寫 FLIP + SVG 原生能力）
- **代表**：`open-slide`、`visual-explainer`、`paper-collage-ppt`（2D）、`frontend-slides`
- **技術核心**：
  - **翻頁與入場**：瀏覽器原生 Web Animations API（`el.animate()`）與 CSS Transitions，完全走瀏覽器合成器執行緒（compositor thread），主執行緒忙碌時也不掉幀。
  - **Magic Move 跨頁形變**：`open-slide` 證明**不需要 GSAP Flip 或 Framer Motion**——約 150 行原生 JS 用 FLIP（First-Last-Invert-Play）+ 覆蓋層 clone，就能用 WAAPI 同時內插位置、縮放、反縮放圓角與文字／邊框／SVG 顏色。
  - **SVG 描線與路徑流動**：`visual-explainer` 用原生 SVG `pathLength="1"` + `stroke-dashoffset` 取代 90% 的 DrawSVG；用原生 CSS `offset-path: path('...')` 讓資料粒子沿流程圖邊線流動，取代 MotionPath 外掛。
  - **可打斷 Spring 物理**：可用 ~60–80 行純數學實現兩種彈簧——① 互動／翻頁中斷用實時阻尼彈簧積分器（讀取即時畫面位置與速度，接續目標，不鎖死按鍵）；② 進場動畫用閉式解析解（如 `huashu-design` 的 `springEase` 或現代瀏覽器 CSS `linear()` 曲線），同時具備物理手感與確定性（列印／截圖永遠停在終態）。
  - **互動圖表**：原生 `<input type="range">` / toggle 驅動純函式 `model(settings)` 重算數字與圖表，列印模式自動隱藏控制列。
- **優點**：整套引擎內嵌進單檔 HTML 僅 **~6–10 KB**，100% 離線、零 CDN、零建置、零授權爭議、列印與像素檢查最乾淨。
- **做不到的極限**：無法做「兩個頂點數完全不同的任意 SVG 形狀互相變形」（如房子變火箭）；不內建複雜多軌時間軸的影格級倒帶與 60fps MP4 錄製。

### 路線 B｜零依賴原生 ＋ 模組化 Canvas 2D 微動態層
- **代表**：`lewislulu/html-ppt-skill`、`beatdeck`（`ParticleCanvas`）
- **技術核心**：保留路線 A 的純原生頁內動畫，額外掛載極輕量（每個特效 1–3 KB）的原生 Canvas 2D 背景／物理特效（柔和流體光暈、微粒、知識圖譜力導向、數據流、星點等），並以生命週期控制器保證「**只有當前可見頁跑 RAF，切離立即 `stop()` 銷毀**」。
- **優點**：100% 離線、不引入 Three.js（省下 ~600 KB）、能替 Hero 頁與科技／插畫頁注入 CSS 難以畫出的有機動態與粒子質感。
- **代價**：必須嚴格限制使用頁數（每 3–4 頁最多 1 個 Hero 動態）並提供低功耗凍結鍵（`B` 鍵）與 `?still=1` 靜態模式，避免筆電風扇狂轉或搶走文字焦點。

### 路線 C｜Motion（`motion.dev`，原 Motion One／Framer Motion，純 MIT）
- **代表**：`emilkowalski/skills`（首推）、`guizang-ppt-skill`（Motion One 64 KB 本地檔）、`bolt-slides`（React 版 Framer Motion）
- **技術核心**：
  - `motion`（Vanilla JS API：`animate()`, `spring()`, `scroll()`, `stagger()`）底層直接優先呼叫瀏覽器 WAAPI 達成硬體加速，並在需要物理彈簧或手勢拖曳時無縫切換混合引擎。
  - 提供跟 Apple WWDC 完全對應的語意 API：`{ type: 'spring', duration: 0.4, bounce: 0 }`（預設臨界阻尼不亂彈，僅手勢甩動才開 `bounce: 0.2`）。
- **優點**：**純 MIT 授權**（可合法內嵌進單檔 HTML 任意再分發）；`motion/mini` 可小至 ~3.2 KB gzip，完整 Vanilla UMD 約 ~64 KB 未壓縮；生態與 `emilkowalski/skills` 的實戰範例完全對齊。
- **代價**：對簡報單檔而言仍多出 ~25–65 KB 外部程式碼與一層抽象；同樣不提供 MorphSVG 或 SplitText。

### 路線 D｜GSAP 3.15 單一時間軸與全外掛全家桶
- **代表**：`scrolline-deck`（GSAP + Lenis）、`bang-motion`（GSAP CDN）、`beatdeck`（僅自動拍用 GSAP）、`dashi-ppt-skill`
- **技術核心**：以 `gsap.timeline()` 建立可任意 `seek`、`reverse`、`kill` 的精準多軌時間軸，搭配 `Flip`、`DrawSVG`、`MorphSVG`、`SplitText`、`MotionPath`、`Observer`。
- **何時真的無可取代**（對應 `rules/CLAUDE.base.md`）：
  1. 異構 SVG 形狀變形（`MorphSVGPlugin`：不同路徑點數直接平滑變形）。
  2. 電影級多軌宣傳片／捲動敘事（`scrolline`、`bang-motion`）：所有元素必須精準綁在同一條時間軸上，支援拖曳 scrub 與 Puppeteer 60fps 逐幀匯出 MP4。
  3. 複雜文字逐字／逐行遮罩與跨螢幕 reflow 拆字（`SplitText`）。
- **代價**：
  - 核心＋常用外掛全內嵌到單檔 HTML 約 **100–160 KB**，若改用 CDN 則破壞「企業內網／會議室無網路雙擊即播」的離線承諾。
  - 非純 MIT（Webflow Standard License），不建議直接把 GSAP 程式碼靜態拷貝進開源 Skill 範本裡當預設底盤。
  - 日常週報、一頁總覽、提案簡報不需要多軌時間軸，殺雞用牛刀。

### 路線 E｜方法層與引擎層解耦的「雙後端」架構
- **代表**：`huashu-design`（MIT）、`beatdeck`（MIT）
- **技術核心**：
  - `huashu-design` 把「**動態設計品味與物理語言**」（Slow-Fast-Boom-Stop 節奏、expoOut 為主軸、禮讓觀眾停頓 300ms、結尾戛然而止不淡黑）完全獨立於「**執行後端**」。
  - 它的**簡報模組（`deck.md`）根本不用 GSAP**，只用極輕量 HTML/CSS 維持快速產出、清晰體驗與完美 PDF/PPTX 匯出；只有在製作「宣傳片／發布會影片」時才切換到重型時間軸引擎（`Stage+Sprite` 或 `GSAP+HyperFrames`）。
  - `beatdeck` 也是雙軌：頁面換拍用純 CSS Transition（快離慢進），只有多步驟自動演出才啟用 GSAP Timeline。
- **啟發**：**不要讓「日常簡報」替「旗艦電影簡報」的依賴買單，也不要讓底盤架構鎖死未來擴充旗艦動效的可能。**

### 路線 F｜WebGL / Three.js 3D 舞台與原生 GLSL Shader
- **代表**：`paper-collage-ppt`（`haoqi-3d`、`playful-lab-3d`，MIT）、`guizang-ppt-skill`（原生 GLSL 概念，AGPL）、`visual-explainer`（按需 importmap Three.js）
- **兩種細分**：
  1. **原生 WebGL2 GLSL Fragment Shader**（~3–5 KB，零 Three.js 依賴）：適合做 Apple／雜誌風／科技風的極細微流體光暈或點陣背景，配合 30fps 上限與低功耗凍結鍵。
  2. **Three.js 3D 場景**（~600 KB，MIT）：適合像 `haoqi-3d` 讓 3D 黏土物件真實懸浮、隨滑鼠微視差，上方疊**真 HTML 文字層**；甚至可用 `registerPptx3D()` 把個別 3D 物件分層匯出成可編輯 PPTX。
- **代價**：Three.js 體積龐大、吃 GPU、ES Modules 需本機 HTTP 伺服器；只適合作為「按需啟用的特別舞台」，絕不該進共用底盤。

---

## 三、跨 14 個 Repo 提煉的 8 條「必裝工程共識」（不限引擎）

無論 Phase B 最終採用哪一條技術路線，這 8 條在實戰 repo 中反覆驗證的工程細節都值得直接寫進 `deck-architect` 底盤契約：

1. **離場鎖住 `opacity: 1`（`open-slide`，MIT）**：跨頁交叉淡入時，舊頁不要淡到 `opacity: 0`，否則中間會閃出舞台底色；讓新頁直接覆蓋淡入（僅 `shock` 震撼幕簾才刻意過黑幕）。
2. **禁止「父層動畫＋子層 stagger」雙重進場、禁止等距 stagger（`emilkowalski/skills`，MIT）**：一個容器只進場一次；依視覺重要性拉出非等距節奏，絕不讓觀眾等動畫演完才能看字或翻頁。
3. **永遠可打斷，不鎖輸入（`emilkowalski/skills`、`beatdeck`，MIT）**：移除現有 `runtime.js` 的 `if (busy) return;` 鎖死設計！連續快按方向鍵必須立刻打斷當前轉場並從即時畫面狀態接續到下一頁，前後跳頁與重整網址 `#N` 永遠確定性落位。
4. **Magic Move 跨頁延續時長為換頁淡入的 2–4 倍（`open-slide`，MIT）**：有 `[data-morph="id"]` 配對元素時，頁面本身只做短淡入（~280–300ms）不加額外位移，把所有空間移動留給覆蓋層的形變元素（~750–860ms），畫面才不會兩股動作打架。
5. **不對稱節奏與預設零過衝（`beatdeck`、`emilkowalski/skills`、`huashu-design`，MIT）**：離場快（240–340ms）、進場穩（600–900ms，`expo-out` 或臨界阻尼彈簧 `bounce: 0`）；只有手勢／活潑插畫風格才加微彈跳（`bounce: 0.15–0.25`）或定格 `steps(5)`。
6. **原生 SVG 描線與路徑流動（`visual-explainer`，MIT）**：善用 `pathLength="1"` 與 CSS `offset-path: path(...)`，讓流程圖、折線圖、架構訊號流零依賴活起來；數據頁可放 1–3 個參數滑桿做「可互動圖表」（列印自動隱藏）。
7. **微動態背景零背景耗能＋雙重凍結（`lewislulu` MIT、`paper-collage` MIT、`guizang` 概念）**：Canvas／Shader 只在當前頁啟動、離頁即停；內建 `B` 鍵低功耗凍結模式、`?still=1` 靜態截圖參數（供 `check.mjs` 與 PDF/PPTX 匯出直接取最終穩態），以及 `prefers-reduced-motion: reduce`（保留節拍改純淡入，關閉位移與漂浮）。
8. **每頁一個語意主角動效，不千篇一律 fade-up（`huashu-design`、`guizang` 概念）**：數字頁用滾動數字、長條圖由底長起、折線描邊、流程圖逐節點點亮、插畫物件微浮動或定格落紙，其餘次要元素保持安靜。

---

## 四、對 `deck-architect` Phase B 的四條候選路線比較

對照本專案核心約束——① **單檔 `deck.html` 離線雙擊即播**、② **同時覆蓋高頻日常商務簡報與旗艦發表／故事簡報**、③ **`rules/CLAUDE.base.md`：原生能做就不無故導入重依賴，導入 GSAP 須先說明原因並經使用者同意**——四條可行路線如下：

| 維度 | 方案 1（推薦）｜**分層混合**：零依賴原生核心 ＋ 旗艦按需外掛契約 | 方案 2｜**極簡純原生到底**（零外部動畫庫） | 方案 3｜**原生 ＋ 內嵌 Motion (`motion.dev` MIT)** | 方案 4｜**統一以 GSAP 3.15 為底盤** |
|---|---|---|---|---|
| **核心引擎** | 原生 CSS + WAAPI + 自寫輕量 Spring（~80 行）+ FLIP Magic Move（~150 行）+ SVG 原生 + 輕量 Canvas 2D 生命週期；底盤預留外掛鉤子，旗艦簡報才按需掛入 Motion / GSAP / Raw GLSL / Three.js | 同方案 1 核心，但明確不接任何外部動畫庫 | 把 `motion`（MIT）作為預設動效層內嵌，搭配自寫 FLIP Magic Move 與 Canvas 生命週期 | 全站改以 GSAP 3.15 + Flip + DrawSVG + SplitText 驅動 |
| **單檔 `deck.html` 體積增量** | 日常 **~8 KB**；旗艦按需才增重 | 永遠 **~8–10 KB** | 每份皆 **~25–65 KB** | 每份 **~100–160 KB**（或仰賴 CDN 失去離線保證） |
| **100% 離線雙擊可播** | ✅（日常與原生 GLSL 皆可；3D 例外） | ✅ | ✅（內嵌 MIT 單檔） | ⚠️ 需整包內嵌（檔案變肥）或放棄離線 |
| **可打斷 Spring + Magic Move + 動態圖表 + 互動圖** | ✅ 全部原生覆蓋（約 90% 簡報場景） | ✅ 全部原生覆蓋 | ✅ Spring 與手勢更省力，Magic Move 仍需自寫跨頁覆蓋層 | ✅ 全能，外加異構 MorphSVG 與 60fps MP4 匯出 |
| **授權風險** | **零風險**（核心全 MIT／自研；外掛按個案確認） | **零風險** | **零風險**（Motion 為純 MIT） | ⚠️ 商用免費但屬 Webflow Standard License（非純 MIT） |
| **與 `deck-architect` 定位契合度** | **最高**：落實 `huashu-design`「方法與引擎解耦」＋ `emilkowalski`「最低成本工具階梯」；日常商務輕快零負擔，旗艦發表又有無天花板擴充力 | 高：最乾淨，但未來若要做異構 SVG 變形或 60fps 影片版簡報需另外開規格 | 中高：若未來常做觸控拖曳／複雜物理手勢簡報很划算；對鍵盤簡報略微超配 | 中低：對高頻週報／一頁總覽偏重，且違反「能原生就原生」的精簡原則 |

### 建議落地策略（若採方案 1）
1. **Phase B 核心底盤（零依賴，~8 KB 內嵌）**：
   - 把 `runtime.js` 從固定 `busy` 鎖升級為**可打斷 Spring 驅動＋依軸運鏡**（對齊 `emilkowalski/skills` MIT 與 `beatdeck` 確定性狀態）。
   - 內建 **`[data-morph="id"]` Magic Move 跨頁形變**（借鏡 `open-slide` MIT 的 WAAPI FLIP 覆蓋層與離場鎖 `opacity: 1`）。
   - 內建**語意微動效原語**：滾動數字（`[data-count]`，借鏡 `scrolline` MIT）、長條升起／SVG `pathLength` 描線與 `offset-path` 流動（借鏡 `visual-explainer` MIT）、風格動效個性變數（Apple 臨界阻尼彈簧、顧問俐落 `expo-out`、插畫／剪紙 `steps(5)` 定格與微浮動）。
   - 內建**安全微動態背景生命週期**（借鏡 `lewislulu` MIT 進頁啟動／離頁銷毀）＋ **`B` 鍵低功耗凍結** ＋ **`?still=1` 靜態截圖模式** ＋ **`prefers-reduced-motion`**。
2. **旗艦按需外掛契約（不在日常簡報載入）**：
   - 底盤統一暴露 `deck:slideenter`、`deck:slideleave`、`deck:still` 事件與 `window.__deckLowPower` 狀態。
   - 僅當單份簡報明確需要「異構 SVG 變形／複雜電影時間軸（GSAP）」、「進階手勢物理（Motion MIT）」、「原生 GLSL 光影（~4 KB）」或「真實 3D 物件展示（Three.js）」時，依 `rules/CLAUDE.base.md` 先說明原因、徵得確認後單案掛載，且共用同一套 `?still=1` 與像素 WCAG 品管。
