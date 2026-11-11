# 競品分析報告：Lemo-Opuscar 與「AI 代理程式碼做影片」技能

> 研究日期：2026-11-11
> 研究對象：[lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar)
> 數據來源：GitHub 搜尋 API（星數、建立時間、最後推送），以及六個 repo 的原始碼與文件（本地唯讀 clone，沒有執行任何程式）

---

## 1. 摘要

- **Lemo-Opuscar 是一套策展過的影片風格庫，不是渲染引擎。** 它有 66 種風格，每種附一份 `STYLE.md` 風格提示和一支完全用程式碼做出來的示範短片。導演方法（`DIRECTOR.md`）、製作技術（`TECHNIQUE.md`）和整條本地工具鏈（逐幀渲染、Kokoro 語音、程式產生的配樂、音效、−14 LUFS 響度）都一起附上。上線 46 天拿到 14.6k 星。
- **這個賽道已經很擠。** 星數前五的同類競品是 HyperFrames（82k）、OpenMontage（79k）、video-shotcraft（18.6k）、Remotion 官方 skills（6.8k）和 OpenFilm（5.7k）。其中四個的星數高於或接近 Lemo-Opuscar。
- **Lemo-Opuscar 的護城河在三點：**
  1. 「整支片的風格」這個單位。競品給的是積木、片段配方或樣板，沒有一家提供數量相當、每種都附示範片和風格提示的風格庫。
  2. **完全本地、免金鑰、免費**的聲音管線：Kokoro 語音、Whisper 回聽校對、取樣器加合成的原創配樂、程序化音效、兩段式 loudnorm。
  3. 寫成明文的導演方法：treatment、三種結構候選、shot list、cue map，以及「至少六項中四項和示範片不同」的自查。
- **它最大的弱點：**
  - 只支援 Claude（官方明說是為 Opus 5.5 調校的）。
  - 沒有交付後的視覺編輯器。
  - 沒有品牌資產擷取（從網站或 Figma 抓色彩字型）。
  - 一支片要 30–60 分鐘和大量 token。
  - 安裝需要使用者自己裝好 Node、ffmpeg 7+ 和 Python。
- **建議的優先順序**：先補「編輯和匯出」與「多代理支援」這兩個缺口（競品已經把它們當基本配備），同時加深風格庫和聲音管線這兩個別人難以複製的優勢。詳見 §8。

---

## 2. 研究方法與競品篩選

### 2.1 搜尋方式

用 GitHub 搜尋 API 跑了 16 組關鍵字，例如 `claude code video skill`、`remotion skill claude`、`html to video agent`、`motion graphics agent skill`、`film style agent`、`explainer video skill claude`、`hyperframes`。結果依星數排序，再人工判斷每個 repo 的性質。

### 2.2 怎樣算「同性質」

同時符合以下三點：

1. **以 AI 代理的技能、外掛或代理工作流形式交付**（Claude Code、Codex 等）。
2. **核心產出是用程式碼渲染的影片**：網頁、canvas、React 或 WebGL 逐幀擷取，而不是單純包一層生成式影片 API。
3. **目標是從需求做到成片**，而不只是剪輯現有素材。

排除的類型：

- 純生成式 AI 影片包裝，例如 Higgsfield、FLUX skills。
- 純剪輯工具，例如 ffmpeg-skill、herk-edit-kit。
- awesome 清單。
- 只有幾十顆星的小型同類技能（列在 §9 供參考）。

### 2.3 入選的前五名

| # | Repo | ★ 星數 | Fork | 建立日期 | 最後推送 | 語言 | 授權 | 同性質程度* |
|---|---|---:|---:|---|---|---|---|:-:|
| — | **lemomo-ai/lemo-opuscar**（研究對象） | **14,583** | 1,761 | 2026-09-26 | 2026-11-10 | JavaScript | MIT（示範片 CC BY 4.0） | — |
| 1 | heygen-com/hyperframes | 82,432 | 7,620 | 2026-03-10 | 2026-11-11 | TypeScript | Apache-2.0 | 4/5 |
| 2 | OpenMontageInc/OpenMontage | 79,495 | 10,634 | 2026-03-29 | 2026-11-09 | Python | AGPL-3.0 | 3/5 |
| 3 | Vincentwei1021/video-shotcraft | 18,555 | 1,754 | 2026-07-19 | 2026-11-09 | TypeScript | Apache-2.0 | 3/5 |
| 4 | remotion-dev/skills | 6,811 | 736 | 2026-01-19 | 2026-11-09 | TypeScript | 未附授權檔 | 3/5 |
| 5 | openfilm/openfilm | 5,704 | 542 | 2026-10-04 | 2026-11-09 | TypeScript | MIT | 3/5 |

\*「同性質程度」指它有多直接和 Lemo-Opuscar 競爭，也就是「把一個主題交給代理，代理用程式碼做出一支有風格的完整影片」這件事。5 分代表完全同類。

> 成長速度：Lemo-Opuscar 46 天 14.6k 星，平均每天約 317 顆。HyperFrames 246 天 82k，每天約 335 顆。OpenMontage 227 天 79k，每天約 350 顆。video-shotcraft 115 天 18.6k，每天約 161 顆。OpenFilm 38 天 5.7k，每天約 150 顆。**以日均來算，Lemo-Opuscar 和兩大龍頭同一個量級**，而且它是單人作者的專案。

---

## 3. 研究對象：Lemo-Opuscar 深度剖析

### 3.1 定位

「A toolbox of film styles made in code」：一個用程式碼做影片風格的工具箱。使用者挑一種風格（或自己做一種），帶上自己的主題，交給程式代理去導演。README 強調三點：

- 不是 awesome 清單，每支片都是作者自己和 Claude Opus 5.5 做出來的。
- 不用生成式影片，也不用素材庫影片。
- 為 Claude Opus 5.5 調校，其他模型可能做不出同樣的效果。

### 3.2 內容規模

- **66 種風格，分 11 類**：剪輯與紀實 8、實證影像 8、手繪與繪畫 8、東方傳統 4、印刷與版畫 6、圖形與排版 7、資訊與發布 8、卡通與動畫 4、遊戲 4、電影與時代 2、材質與 3D 7（`AGENTS.md` 的 style-list）。
- **每種風格是一個資料夾**（`styles/<slug>/`），內容包括：
  - `STYLE.md`：只寫風格不變的部分，約 11 節，涵蓋本質、材質渲染、色彩邏輯、字型字幕、動態、鏡頭文法、聲音調色盤、媒材特有的轉場手法、常見陷阱和可變範圍。
  - `DEMO.md`，開頭明寫「這只是一個例子，不要重用它的故事」。
  - `demo/` 示範片原始碼和一鍵 `build.sh`。
  - `style.json` 中繼資料，包括中英文名、適用場景和片長。
- **代表作**：《OPUSCAR 98》，6 分 31 秒，用 98 種風格重繪 98 部奧斯卡最佳影片，另外有一個 98 種風格的提示頁。
- **社群經營**：每到一個星數里程碑就發一支感謝短片（300、800、2k、3k、6k）。README 有簡體中文版，風格名稱中英雙語。

### 3.3 技術管線（`TECHNIQUE.md`）

```
時間軸（唯一真實來源）
 ├─ 畫面：網頁暴露 render(t)，headless Chrome 逐幀擷取，產生 video.mp4
 ├─ 語音：Kokoro（英文、離線）或 edge-tts（中文、線上），再用 faster-whisper 回聽校對
 ├─ 配樂：取樣器（freepats、salamander、vsco2ce 等）加合成，由同一條時間軸產生
 ├─ 音效：在事件時間點程序化產生
 └─ 字幕：.srt 加燒錄字幕
混音（ducking、壓縮）→ ffmpeg 兩段式 loudnorm −14 LUFS → 成片
```

- **頁面規範**：每個頁面要提供 `window.DUR`、`render(t)`、`READY`、`EV`（音效和 cue 事件）和 `TEXTS(t)`（用來檢查文字能不能讀完）。
- **確定性**：禁止 `Date.now()` 和沒有種子的隨機數，任何一幀都能單獨渲染。
- **工具**（`core/`）：
  - `still.mjs`、`video.mjs`（多 worker）、`events.mjs`
  - `readcheck.mjs`：自動檢查每段畫面文字停留的時間夠不夠讀完
  - `sheet.py`（印樣表）、`mux.sh`
  - `tts.py`、`asr_check.py`、`sampler.py`、`sfx.py`
- **分層安裝**：核心約 350 MB；語音層約 0.55 GB，外加 Whisper 模型；音樂層約 140 MB；取樣庫另外下載，每個 70–400 MB。

### 3.4 代理工作流（`AGENTS.md` 和 `DIRECTOR.md`）

1. **Brief**：只問使用者一次，內容包括主題事實、自有素材、語言、要不要先看分鏡，以及缺少的系統工具。之後不再提問。
2. **Treatment**：先列三種結構候選，選定一種，再寫 logline、對標作品（該學什麼、不該抄什麼）、shot list（每顆鏡頭寫景別、角度、運鏡和理由）、逐秒 beat sheet、cue map、聲音設計表和字幕設計。**寫完 treatment 才准打開示範片**，避免照抄示範片。
3. **Look**：用真實的繪圖程式碼畫出角色設定圖或風格幀。
4. **分鏡**：只有使用者要求時才做，並且停下來等核准。
5. **製作**：語音 → 校對 → 配樂 → 動畫 → 混音 → 渲染。
6. **自查並交付**：
   - 印樣表、0.2 秒動作條，再用原速加聲音完整看一遍。
   - 修正只做一輪。
   - 和示範片比較六項（結構、開場、招牌鏡頭、鏡頭路徑、配樂形狀、結尾），至少四項要不同。
   - 檢查響度、黑幀，以及字幕有沒有擋到主體。
   - 用 grep 確認沒有殘留 LemoLab 字樣。

另外有明文規範：

- **聲音**：至少兩處靜默、至少兩次聲音轉場（J-cut 或 L-cut），避免通用的鋼琴加弦樂。
- **節奏**：字幕至少停留 1.8 秒；畫面文字停留時間依字數計算，英文為字母數 ÷ 15 + 1.5 秒，中文為字數 ÷ 4.5 + 1.5 秒。
- **鏡頭**：至少四種運鏡和一個招牌鏡頭。
- **版權紅線**：參考作品只學文法。
- **地圖規範**（§13）：包含完整中國版圖等細節要求。

### 3.5 「我的風格」（`MY-STYLES.md`）

- **兩種起點**：改一個庫裡的風格，或從空白開始（由代理挑一個最接近的風格當技術基底）。
- **五步驟**：
  1. 一次一題的規劃，每題附推薦選項。改庫裡的風格時，先把各部分分成三類：可以安全改、改了會變性格、不能改。
  2. 確認改動摘要。
  3. 看風格幀，與原風格左右對照。
  4. 做一支 15–30 秒的示範片。
  5. 確認後才保存。
- 保存到 `~/lemo-my-styles/<slug>/`，結構和庫裡的風格相同，另附 `CHANGES.md`。更新和移除外掛都不會動到它。之後原風格有更新時，代理會詢問要不要合併修正。

### 3.6 安裝與相容性

- 安裝：`claude plugin marketplace add lemomo-ai/lemo-opuscar`，再 `claude plugin install lemo-opuscar@lemolab`。
- 首次使用時，用 sparse clone 把指南、`core/` 和所有 `STYLE.md` 抓到 `~/lemo-opuscar`。示範片原始碼按需下載（`setup.sh demo <slug>`）。
- 安裝流程對 Windows Git Bash 有特別處理（UTF-8 shim、MSYS 路徑轉換），而且有並行安裝鎖（issue #23）。
- 其他代理要自己複製 skill 資料夾。社群有一個 OpenCode 轉接版（instax-dutta/opencode-lemo-opuscar，2 星）。

---

## 4. 競品逐一剖析

### 4.1 HyperFrames（heygen-com/hyperframes）：82k ★，同性質程度 4/5

**定位**：「Write HTML. Render video. Built for agents.」一個 HTML 轉 MP4 的確定性渲染框架，同時也是 HeyGen 雲端 Studio 的核心。它自稱 Remotion 的 HTML 替代方案。

**怎麼運作**
- 合成檔是帶 `data-start` 和 `data-duration` 屬性的 HTML。每個場景註冊一條暫停的 GSAP、Lottie、Three.js、Anime.js 或 WAAPI 時間軸，由 Puppeteer 逐幀 seek，再交給 FFmpeg。
- monorepo 包含 cli、engine、producer、studio、player、aws-lambda、gcp-cloud-run 和 sdk。
- 安裝管道很多：Claude 外掛市集、`npx skills add`、CLI、遠端 MCP（mcp.heygen.com），以及桌面 Studio。

**內容**
- 9 個公開技能。
- 456 個註冊項：210 個 blocks、238 個 components、8 個範例。
- 7 種影片類型指南（發表、解說、音樂、資料、直式、3D、角色）。
- 13 個 frame preset。技能文件自己說這些是簡報風格，不建議當影片預設。
- 5 個「風格取樣」樣板（Collage、Finance、Kurzgesagt 式科普等）**是 Pro 付費功能**，存在伺服器上（已核對 `skills/style-sampling/SKILL.md`：「Style templates are a HyperFrames Pro feature」）。

**聲音**
- 語音：HeyGen Starfish、ElevenLabs 或本地 Kokoro。
- 配樂：主要來自 HeyGen 曲庫（1 萬首以上，需登入）或生成，本地備案是 Lyria 或 MusicGen。**文件明確不鼓勵用程式寫音樂。**
- 音效：19 個內建音效。
- 響度目標 −16 到 −14 LUFS。

**品質控管**
- 先寫 3 條故事線讓使用者挑。
- `SPEC.md` 把每個形容詞轉成具體數字，並列出禁用的預設外觀。
- `check --json` lint：檢查沒讀完的文字、死寂段落、過小的字和無聲片段。
- `snapshot --review` 會產生手機寬度的印樣表，可以交給子代理用全新的上下文複審。
- 使用者核准預覽後才渲染。

**相容性**：Claude Code、Codex、Cursor、Gemini CLI、Copilot、OpenCode 等，不綁定特定模型。

**費用**：可以免費使用，但最好的語音、配樂和素材都導向 HeyGen 登入或點數。遙測預設開啟。

**相對於 Lemo-Opuscar**
- 優勢：
  - 星數約 5.6 倍，有大公司背書。
  - 完整的引擎、預覽和 Studio。
  - 大量可重用積木。
  - 支援多種代理。
  - 雲端和分散式渲染。
  - 能從網站或 Figma 擷取品牌設定。
- 劣勢：
  - 沒有免費的整片風格庫。
  - 沒有程序化配樂。
  - 商業導流明顯。
  - 有遙測。

### 4.2 OpenMontage（OpenMontageInc/OpenMontage）：79k ★，同性質程度 3/5

**定位**：「第一個開源的代理式影片製作系統」。12 條製作管線、100 多個工具、700 多份技能和知識檔。它把程式代理變成一間完整的製作公司。

**怎麼運作**
- 不是外掛，而是整個 repo：`git clone` 之後執行 `make setup`。
- 代理讀 YAML 管線定義（`pipeline_defs/`），再讀每個階段的導演技能，然後呼叫 132 個 Python 工具類別。
- 每條管線都走同樣的階段：研究 → 提案 → 腳本 → 場景規劃 → 素材 → 剪輯 → 合成。
- 渲染器可選 Remotion 或 HyperFrames。
- Backlot：本地的分鏡和核准看板。

**內容**
- 12 條管線：解說、動畫、角色動畫、電影感、紀錄蒙太奇、短片工廠、配音在地化、Podcast 再利用、螢幕示範、真人口播、虛擬主播等。其中數條標示為 beta。
- **只有 5 個 YAML 風格**：anime-ghibli、clean-professional、flat-motion-graphics、minimalist-diagram、premium-minimalist。

**聲音**
- 語音：Piper（離線、免費），另外支援 15 家以上的雲端 TTS。
- 配樂：使用者自備，或用 Pixabay、Freesound，或用 Suno、ElevenLabs、Lyria 生成。沒有程序化合成。
- 字幕：WhisperX。

**品質控管**
- 提案、腳本、場景、素材和發布各有人工核准關卡。
- 「投影片風險」檢查。
- 成片審查（ffprobe、抽幀、音量）。
- 決策日誌。
- **預算上限**：預設 10 美元，單項超過 0.5 美元要使用者核准。

**相容性**：Claude、Codex、Cursor、Copilot、Windsurf。

**費用**：**以生成式 AI 為核心**。展示片用 Veo、Kling 和 Seedance，整合 20 多家影片生成服務和 15 多家圖像生成服務，每支片約 1.3–5 美元。另外有一條免金鑰的路徑（Piper 加素材庫加 Remotion）。

**相對於 Lemo-Opuscar**
- 優勢：
  - 範疇廣得多：真實素材剪輯、配音、虛擬主播。
  - 網路研究和參考影片分析。
  - 治理機制完整：核准關卡和成本控管。
  - 支援多種代理。
- 劣勢：
  - 風格只有 5 種。
  - 高品質效果依賴付費生成服務，每次結果不同，而且要花錢。
  - 安裝很重。
  - AGPL 授權限制商業嵌入。
  - 沒有確定性的 `render(t)` 規範。

### 4.3 video-shotcraft（Vincentwei1021/video-shotcraft）：18.6k ★，同性質程度 3/5

**定位**：一個 AI 影片技能，用 Remotion 做有電影感、可再編輯的產品宣傳片。「Not a video generator」：它擷取使用者真實的產品頁面，挑選鏡頭配方，交付 MP4 和可編輯的原始碼。

**怎麼運作**
- 技術：Remotion 4 + React 19，可選 three.js。用 Puppeteer 擷取頁面，用 librosa 分析配樂節拍。
- 三種模式：Ink Press 樣板替換、自主創作（8 個階段）、引導式共創。
- 代理讀配方卡，然後複製調校好的 TSX 示範（226 個 TSX 檔）。
- SKILL.md 和 references 都用**中文**撰寫，README 有五種語言，並有 AtomGit 鏡像。

**內容**
- **124 張鏡頭配方卡、150 個變體，分 10 類**：開場、運鏡、轉場、字型、UI 進場、互動、資料、特效、節奏、結尾。
- 1 支完整樣板片。
- 8 組配色。
- 只有 1920×1080、30 fps，沒有內建直式。

**聲音**
- **沒有 TTS 和旁白**（已 grep 核對 references，找不到 TTS、Kokoro 或 ElevenLabs）。旁白交給姊妹 repo video-talkcraft。
- 配樂：5 首 Mixkit 曲目。節拍對齊誤差在 3 幀以內，並區分 kick、snare 和 hihat。
- 音效：從 Freesound 按需抓取，預設 CC0。
- 沒有 LUFS 響度標準化。

**品質控管**
- 文字方向 → HTML 風格幀 → 功能和鏡頭對照 → 分鏡 → 逐鏡 still 自查。
- **強制由一個全新上下文的子代理做終審**，清單附幀號證據。
- 判例式的美學規則集。
- CI 會跑 tsc、vitest 和冒煙渲染。

**編輯與擴充**
- Motion Workbench：類似 CapCut 的瀏覽器編輯器，可以改文案、顏色和時間，也能替換鏡頭。
- 匯出剪映草稿、社群發布。
- 視覺 token 強制取自產品本身的設計系統。

**相容性**：Claude Code 和 Codex。

**相對於 Lemo-Opuscar**
- 優勢：
  - 起步早兩個月，星數約 1.27 倍。
  - 動態配方庫大，有線上 Gallery 預覽。
  - 交付後可以編輯，並匯出剪映。
  - 從真實產品擷取畫面。
  - 有 CI 測試。
- 劣勢：
  - 只做產品宣傳片，而且只有橫式。
  - 沒有旁白。
  - 配樂只有 5 首。
  - 沒有響度標準。
  - 公司使用需要 Remotion 授權。
  - 部分音訊來源無法溯源。
  - 每次交付後都要求使用者標註作者、投稿展示。
- 同作者的系列作：**anything2explainer**（3.2k，主題進、旁白解說片出，最接近 Lemo-Opuscar 的主題成片定位）和 **video-talkcraft**（2.3k，旁白驅動的解說片，109 張動態卡）。三者合計約 2.4 萬星，是**最直接的家族型競爭者**。

### 4.4 Remotion Agent Skills（remotion-dev/skills）：6.8k ★，同性質程度 3/5

**定位**：Remotion 官方的最佳實務技能，教代理怎麼在 Remotion 專案裡寫影片。它是框架知識，不是風格庫。

**怎麼運作**
- 影片寫成 React 元件，所有動畫都要由 `useCurrentFrame()` 和 `interpolate()` 驅動，用 `npx remotion render` 渲染。
- 安裝：`npx skills add remotion-dev/skills`。
- 從 Remotion 主 repo 的 `packages/skills` 自動同步，推送非常頻繁。

**內容**
- 13 個技能、約 77 份規則檔，涵蓋合成、轉場、3D、Lottie、約 80 種特效、LUT 調色、去背、RTL 文字、地圖（Mapbox、Cesium）、Zod 參數化，以及 Lambda、Vercel 部署。
- 沒有命名的風格，也沒有示範片。

**聲音**
- 預設 TTS 是 ElevenLabs，需要金鑰。
- 配樂只教怎麼擺放和剪輯，不負責作曲。
- 音效：32 個託管的迷因和 UI 音效，部分授權不明。
- 字幕：本地 Whisper（WebGPU）。
- 沒有 LUFS 標準，也沒有旁白校對。

**品質控管**
- 在 Studio 用眼睛檢查，必要時渲染單幀。
- 版面規則（安全區、最小字級）。
- 沒有 treatment、shot list 或自查清單。
- **預設不渲染成片**，使用者明確要求才渲染。

**相容性**：Claude Code、Codex、Kimi Code、Cursor。

**費用**：repo 沒有附授權檔。（一般資訊，非 repo 所述：Remotion 對 3 人以上的營利公司收取公司授權費。）

**相對於 Lemo-Opuscar**
- 優勢：
  - 官方背書，框架成熟。
  - 互動式 Studio。
  - 特效和地圖很豐富。
  - 伺服器端渲染。
  - 生態系龐大。
- 劣勢：
  - 沒有風格、導演方法或聲音管線。
  - 免費本地語音不是預設。
  - 大公司使用要付費。

### 4.5 OpenFilm（openfilm/openfilm）：5.7k ★，同性質程度 3/5

**定位**：「開源 AI 影片代理：一個 HTML 檔、一個函式、一個真正的剪輯器。」它把任何程式代理變成影片代理，並附一個人和代理都能用的剪輯器。

**怎麼運作**
- 一支片是一個 `film.html`。每個 `<section>` 是一條軌道，片段可以是 iframe 頁面、影片、圖片或音訊。
- 每個鏡頭頁面暴露 `window.film.frame(t)`，同樣的 t 必須畫出同樣的畫面。**這和 Lemo-Opuscar 的 `render(t)` 幾乎一樣。**
- 用 playwright-core 加 Chromium 加 ffmpeg 渲染，支援 4K、動態模糊、alpha 通道、中斷續渲和 `--loudness=-14`。
- 安裝：`npx skills add openfilm/openfilm`，另有 Electron 桌面版。

**內容**：積木式素材庫，包括 14 個樣板（多數是素材佔位）、約 136 種文字動畫、約 130 種轉場、約 119 種特效、66 種濾鏡和約 100 個貼圖。

**聲音**
- **CC0 音庫 6,658 項**：1,222 首帶 bpm 和能量標籤的音樂，加上 5,436 個音效（已核對 `library/audio.json`）。
- **沒有本地 TTS**，語音要用 ElevenLabs、Cartesia 等付費服務。
- 本地 Whisper 產生 WebVTT。

**品質控管**：`openfilm look`
- 用打亂的順序畫兩次印樣表，抓出不確定的頁面。
- 檢查頁面錯誤、字型載入失敗和文字超出畫面。
- `--full` 掃描閃爍、凍結幀和黑幀，`--loudness` 測量混音響度。
- 沒有 treatment 或 shot list 之類的導演方法。

**編輯**
- 瀏覽器 Studio 是完整的剪輯器：拖移、改字、修剪、調整音量和速度，並用 git 保存具名版本。
- 使用者的修改存成 overrides，代理會保留。
- **匯出 Final Cut XML、Premiere、DaVinci Resolve 和剪映。**

**相容性**：Claude Code、Codex、Copilot、Cursor、OpenCode、Qwen、Kimi、DeepSeek 等十多種代理。

**費用**：免帳號就能做片。生成式 AI 可選（自備金鑰或 OpenFilm 儲值）。

**相對於 Lemo-Opuscar**
- 優勢：
  - 真正的剪輯器，並能匯出專業剪輯軟體格式。
  - 大型免費音庫。
  - 自動化的確定性和視覺檢查。
  - 支援多種代理。
  - 桌面版內建依賴。
- 劣勢：
  - 沒有策展風格和示範片（只有 2 支範例片）。
  - 沒有導演方法。
  - 沒有免費語音。
  - 沒有程序化配樂。
- **值得注意**：它比 Lemo-Opuscar 晚 8 天上線，渲染規範幾乎一樣，而且在剪輯器和多代理這兩塊正好補上 Lemo-Opuscar 的缺口。**它是潛在威脅最大的後來者。**

---

## 5. 橫向比較

### 5.1 功能矩陣

圖例：●＝完整內建、◐＝部分或需付費、○＝沒有

| 面向 | **Lemo-Opuscar** | HyperFrames | OpenMontage | video-shotcraft | Remotion Skills | OpenFilm |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| 交付形式 | Claude 外掛 | 外掛＋CLI＋MCP＋Studio | 整個 repo | Skill | Skill | Skill＋CLI＋桌面版 |
| 渲染底層 | canvas、WebGL、`render(t)` | HTML＋GSAP 等 | Remotion 或 HyperFrames | Remotion | Remotion | HTML `frame(t)` |
| **整片風格庫** | ● 66 種，每種附示範片 | ◐ 5 種付費＋13 種簡報 preset | ◐ 5 種 YAML | ○（124 張鏡頭卡） | ○ | ○（14 個樣板） |
| 積木和元件庫 | ◐ `core/lib.js` | ● 456 項 | ● 132 個工具 | ● 150 個變體 | ● 約 80 種特效 | ● 數百項 |
| **導演方法（treatment、shot list、cue map）** | ● | ◐ 故事線＋SPEC | ● 7 階段＋核准 | ● 8 階段 | ○ | ○ |
| 自動品質檢查 | ● readcheck、ASR 校對、示範片差異 | ● check lint＋review | ● 審查＋投影片風險 | ● 子代理終審＋CI | ○（目視） | ● look（確定性、黑幀） |
| **免費本地 TTS** | ● Kokoro | ● Kokoro | ● Piper | ○ | ○（ElevenLabs） | ○ |
| 旁白回聽校對 | ● Whisper | ◐ | ◐ | ○ | ○ | ○ |
| **程序化原創配樂** | ● 取樣器＋合成 | ○（不鼓勵） | ○ | ○（5 首曲庫） | ○ | ○（6.6k 曲庫） |
| 音效 | ● 程序化 | ◐ 19 個＋搜尋 | ◐ ElevenLabs | ◐ Freesound | ◐ 32 個迷因音效 | ● 5.4k 個 CC0 |
| 響度標準化 | ● −14 LUFS 強制 | ● | ◐ 只有文件建議 | ○ | ○ | ● |
| 自訂和保存風格 | ● 我的風格 | ◐ DESIGN.md | ◐ styles/custom | ○ | ○ | ○ |
| 品牌擷取（網站、Figma） | ○ | ● | ○ | ●（產品設計系統） | ○ | ○ |
| **交付後視覺編輯器** | ○ | ● Studio | ◐ Backlot（分鏡） | ● Workbench | ● Studio | ● Studio |
| 匯出專業剪輯軟體 | ○ | ○ | ○ | ◐ 剪映 | ○ | ● FCP、Premiere、Resolve、剪映 |
| 生成式 AI 影片和圖像 | ○（刻意不用） | ◐ 付費 | ●（核心） | ○ | ○ | ◐ 可選 |
| 雲端和分散式渲染 | ○ | ● Lambda、Cloud Run | ○ | ○ | ● Lambda | ○ |
| **多代理支援** | ○ Claude 限定 | ● | ● | ◐ Claude、Codex | ● | ● |
| 需要 API 金鑰才能做出好片 | 否 | 部分 | 是（高品質路徑） | 否 | 是（TTS） | 是（語音） |
| 授權 | MIT＋CC BY | Apache-2.0 | **AGPL-3.0** | Apache-2.0（＋Remotion） | 無檔（＋Remotion） | MIT |

### 5.2 定位地圖

```
                        整片風格策展深度 高
                               ▲
                               │
                  Lemo-Opuscar ●
                    （66 種風格、導演方法、全本地聲音）
                               │
   純程式碼、確定性 ◄──────────┼──────────► 生成式 AI 和平台廣度
                               │
      video-shotcraft ●        │        ● HyperFrames（引擎＋付費樣板）
     （鏡頭配方、產品片）      │
        OpenFilm ●             │              ● OpenMontage
     （剪輯器＋積木）          │             （12 條管線、gen-AI）
     Remotion Skills ●         │
       （框架知識）            │
                               ▼
                        整片風格策展深度 低
```

**解讀**：「純程式碼」加「高風格策展深度」的象限裡，目前只有 Lemo-Opuscar 一家。競品集中在兩個方向：引擎和平台化（HyperFrames、OpenFilm、Remotion），以及生成式 AI 製作系統（OpenMontage）。video-shotcraft 在「配方」層級最接近，但只鎖定產品宣傳片。

---

## 6. Lemo-Opuscar 的 SWOT

| | |
|---|---|
| **優勢（S）** | ① 66 種整片風格，每種附示範片和原始碼，品質門檻高，展示力強（OPUSCAR 98）。② 完全本地、免金鑰、零邊際成本的聲音管線，包括語音、校對、作曲、音效和響度，這是五家競品都沒有完整做到的。③ 明文的導演方法和「不准抄示範片」的機制，讓同一個風格能產出不同的片。④ 「我的風格」把風格客製流程產品化，而且和庫的更新隔離。⑤ MIT 加 CC BY 4.0 授權寬鬆，沒有 Remotion 或 AGPL 的商業負擔。⑥ 中英雙語，對華語市場友善。⑦ 實證影像、剪輯與紀實兩類風格強調「每個數字都有來源」，在可信內容上有差異化。 |
| **劣勢（W）** | ① 只支援 Claude，並且明說為 Opus 5.5 調校，換模型可能失真。② 沒有交付後的視覺編輯器或專業剪輯軟體匯出，使用者想改一個字也得回頭請代理改。③ 沒有品牌擷取或品牌包，商業客戶要自己描述品牌。④ 每支片要 30–60 分鐘和大量 token，成本由使用者的 Claude 方案承擔。⑤ 系統依賴門檻：ffmpeg 7+（Ubuntu 24.04 內建版本太舊）、Node、Python，加上取樣庫的大量下載。⑥ 單人維護，擴張速度受限於作者。⑦ 沒有雲端或分散式渲染，3D 風格需要 GPU。⑧ 積木層較薄，代理每次都從風格示範中學技巧，不能直接拼裝。 |
| **機會（O）** | ① 競品都缺「整片風格」這個單位，可以把風格做成生態系的標準格式（例如讓 STYLE.md 能被其他引擎讀取）。② 社群已經自發做轉接（OpenCode 版），代表多代理需求存在。③ 社群投稿風格已經開始（Memphis Diorama 由 @EianLu 貢獻），可以發展成風格市集。④ 教育、科普和新聞（實證、紀實類）這類需要可信度的市場，生成式 AI 競品很難進入。⑤ 和 OpenFilm、HyperFrames 的渲染規範接近，可以考慮互通，例如把 Lemo-Opuscar 的成片匯出成 OpenFilm 的 film.html 來編輯。 |
| **威脅（T）** | ① HyperFrames 和 OpenMontage 有資本和社群的規模優勢，一旦推出免費的整片風格庫，差異化會被稀釋。② OpenFilm 的技術路線幾乎一樣，又多了剪輯器和多代理支援，是最可能直接吃掉市場的後來者。③ video-shotcraft 家族（3 個 repo、約 2.4 萬星）在主題成片和旁白解說上正面重疊，而且以中文為主，和 Lemo-Opuscar 爭同一批華語使用者。④ 風格本質是提示和程式碼，容易被複製或改寫（MIT 加 CC BY 允許這樣做）。⑤ 綁定單一模型版本，模型更新後風格可能需要重新調校。 |

---

## 7. 各競品可借鏡之處

| 來源 | 值得學的做法 | 對 Lemo-Opuscar 的意義 |
|---|---|---|
| HyperFrames | `SPEC.md` 把形容詞轉成數字、列禁用預設外觀；`check --json` lint；手機寬度印樣表；子代理全新上下文複審 | 可以強化 DIRECTOR.md §11 的自查，並補上直式和手機觀看的檢查 |
| HyperFrames、video-shotcraft | 從網站、Figma 或產品設計系統擷取品牌 token | 補上商業使用最常見的需求，可以併入「我的風格」流程 |
| OpenMontage | 成本預算上限和逐項核准；決策日誌 | 一支片 30–60 分鐘、token 用量高，可以加 token 預估或上限提示 |
| video-shotcraft | 強制子代理終審並附幀號證據；鏡頭卡的線上 Gallery；CI 跑冒煙渲染 | 終審獨立化可以降低自我確認偏誤；CI 可以保護 66 個示範片不被改壞 |
| OpenFilm | `look` 打亂順序渲染兩次來驗證確定性；人機共用的剪輯器；匯出 FCP、Premiere、Resolve、剪映 | 確定性驗證可以直接借用；剪輯器和匯出是補上最大缺口的方向 |
| Remotion Skills | 文件搜尋技能讓代理用最新 API；保留使用者在代理之外的修改 | 庫更新時，避免覆蓋使用者在專案中的手動修改 |

---

## 8. 建議

依「影響 ÷ 成本」排序：

1. **交付物可再編輯（補最大缺口）**
   - 短期：每支片除了 `build.sh`，再輸出一份 `content.json`（文字、顏色、時間點），讓使用者改字不用重新導演。部分場景風格已經有這個機制。
   - 中期：匯出 SRT 加分軌音訊（stems）加 FCPXML 或剪映草稿，讓使用者在熟悉的剪輯軟體裡做最後一哩。
2. **降低模型和代理綁定**
   - 正式支援 Codex 和 OpenCode（社群已經有轉接版，可以收編），附上 `.codex-plugin` 和 `AGENTS.md` 的相容說明。
   - 在 README 誠實標示每種風格在不同模型下的可重現度（例如逐風格標「已在某模型驗證」）。
3. **品牌包**：在「我的風格」加一條「從我的網站或 Logo 開始」的入口，擷取色彩、字型和 Logo，寫進 `STYLE.md` 的色彩和字型節。這會直接打開商業和行銷使用者市場。
4. **加深護城河**
   - 把聲音管線包裝成可單獨使用的子技能（例如只要旁白加配樂加混音），擴大觸及面。這是競品普遍沒有的能力。
   - 持續擴充風格，並建立社群投稿規範（已有 MAINTAINING.md，可以對外開放一個 my-style 投稿通道）。
5. **成本透明化**：Brief 階段預估片長對應的時間和 token 等級，超過 2–3 分鐘時提醒使用者（DIRECTOR.md 已有一句提醒，可以量化）。
6. **工程品質**：加一個 CI 冒煙測試，每次 PR 隨機抽幾個示範片渲染幾幀，再加上 OpenFilm 式的雙次渲染確定性驗證，保護 66 支示範片的可重現性。

---

## 9. 其他值得關注的同類專案（未入選前五）

| Repo | ★ | 說明 |
|---|---:|---|
| nexu-io/html-video | 4,827 | HTML 轉影片，可插拔渲染引擎，21 個樣板（Apache-2.0）。6 月後沒有更新 |
| Vincentwei1021/anything2explainer | 3,212 | 主題進、旁白解說片出，黑底動態圖形。video-shotcraft 的同作者，定位最接近 Lemo-Opuscar |
| mromidev/claude-animated-shorts | 2,823 | three.js＋Remotion 做病毒式動畫故事短片（2D 角色在 3D 世界） |
| Vincentwei1021/video-talkcraft | 2,261 | 旁白驅動的解說片，字級同步，109 張動態卡 |
| bangtutorial/bang-motion | 2,021 | 瀏覽器動態圖形技能：片頭、宣傳片、字卡，5 種解說風格 |
| Tejashmakwana/motionmaxxing | 1,522 | 把 AI 粗糙感的影片提升成動態設計師水準 |
| iart-ai/motion-skills | 1,331 | 50 個動態圖形技能，涵蓋字卡、資料視覺化和短影音 |
| BubbleBrainBB/BB-Video | 173 | 純程式碼做片，32 種視覺風格（白板、水墨、皮影、像素…），**模式和 Lemo-Opuscar 最像的小型跟隨者** |
| instax-dutta/opencode-lemo-opuscar | 2 | Lemo-Opuscar 的 OpenCode 轉接版，證明有多代理需求 |

---

## 10. 研究限制

- 星數和時間取自 2026-11-11 的 GitHub 搜尋 API，數字會變動。
- 所有 repo 都只讀原始碼和文件，**沒有實際安裝或做片**，所以輸出品質、耗時和穩定性沒有實測比較。
- 「同性質程度」是依本報告 §2.2 的定義主觀評分。
- Remotion 的商業授權條款不在 repo 內，本報告中的描述屬一般資訊，使用前請以 remotion.dev 官方條款為準。
- HyperFrames 的 Pro 樣板和 OpenFilm 的社群技能存在伺服器端，無法檢視內容。
