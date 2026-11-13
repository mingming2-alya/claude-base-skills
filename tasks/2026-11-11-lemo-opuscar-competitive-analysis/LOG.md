# lemo-opuscar 競品分析：執行紀錄

> 2026-11-13 依對話紀錄回溯補寫。

## 2026-11-11 段落 1：取得研究對象

- `add_repo` 回報 `lemomo-ai/lemo-opuscar` 是公開 repo，可直接匿名唯讀 clone，不需要附加到 session。
- `GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1` 到 `/home/user/lemomo-ai/lemo-opuscar`，約 108 MB，大部分是 `styleboard/img` 的圖片與示範影片素材。
- 讀了 README、SKILL.md、AGENTS.md、DIRECTOR.md、TECHNIQUE.md、MY-STYLES.md、MAINTAINING.md、setup.sh、core/README.md、watercolor 風格的 STYLE.md 與 style.json（完整清單見 `inputs/sources.md`）。
- 重點：66 種風格分 11 類；每種 = STYLE.md + 程式碼示範片；管線是 `render(t)` 逐幀渲染 + Kokoro/edge-tts + Whisper 校對 + 取樣器配樂 + 程序化音效 + −14 LUFS；導演方法寫在 DIRECTOR.md；「我的風格」存在 `~/lemo-my-styles/`；以 Claude 外掛市集安裝。
- 遇到的問題：`gh api repos/lemomo-ai/lemo-opuscar` 被拒（未附加的 repo 只能用搜尋端點），改用 `gh api search/repositories -f q=repo:...` 取中繼資料。

## 2026-11-11 段落 2：搜尋同類競品

- 跑了 16 組 GitHub 搜尋（清單見 `inputs/sources.md`），依星數排序。
- 「同性質」的定義：以代理技能／外掛形式交付、核心產出是程式碼渲染的影片、目標是從需求做到成片。
- 排除：純生成式 AI 包裝（Higgsfield、FLUX skills）、純剪輯工具（ffmpeg-skill、herk-edit-kit）、awesome 清單、星數很少的小專案。
- 入選前五：HyperFrames（82k）、OpenMontage（79k）、video-shotcraft（18.6k）、remotion-dev/skills（6.8k）、OpenFilm（5.7k）。
- 決策：nexu-io/html-video（4.8k）星數雖接近 OpenFilm，但 6 月後就沒更新，OpenFilm 又和研究對象技術路線幾乎相同，所以選 OpenFilm。

## 2026-11-11 段落 3：子代理平行深挖

- 同時派出 5 個 general-purpose 子代理，各負責一個競品，在背景執行。
- 每個子代理拿到同一份 brief：研究對象的一段摘要、要 clone 的網址和 scratchpad 路徑、「只讀不執行」、只能用搜尋端點取中繼資料，以及 12 個固定章節（中繼資料、定位、運作方式、內容規模、聲音、品質控管、客製化、相容性、需求與成本、授權、相對優劣、同性質程度 1–5 分），並要求附檔案路徑、不確定就標 unknown。
- 回報順序：HyperFrames（4/5）→ Remotion Skills（3/5）→ video-shotcraft（3/5）→ OpenMontage（3/5）→ OpenFilm（3/5）。
- 五份回報全文存在 `outputs/competitor-profiles/`。

## 2026-11-11 段落 4：抽查子代理說法

- `hyperframes/skills/style-sampling/SKILL.md` 第 16 行確實寫「Style templates are a HyperFrames Pro feature」。
- `openfilm/packages/openfilm/library/audio.json` 的 `items` 共 6,658 項，符合 1,222 首音樂 + 5,436 個音效。
- 在 video-shotcraft 的 `references/` 和 `SKILL.md` grep `tts|kokoro|edge-tts|elevenlabs` 沒有結果，符合「沒有 TTS」。
- OpenMontage `pipeline_defs/` 有 13 個檔（含 1 個測試管線），`styles/` 有 5 個 YAML，符合回報。

## 2026-11-11 段落 5：撰寫報告

- 報告用繁體中文寫在 `docs/research/lemo-opuscar-competitive-analysis.md`，共 10 節：摘要、方法、研究對象、五家競品、功能矩陣與定位地圖、SWOT、可借鏡之處、建議、其他同類專案、研究限制。
- 修正一處計算：OpenMontage 存在天數從 226 改為 227，日均約 350 顆星。
- commit `9d8837c`「docs: 新增 lemo-opuscar 競品分析報告」，推送到 `claude/competitive-analysis-report-ziex3m`（新分支，首次推送）。

## 2026-11-11 段落 6：回報使用者

- 回覆摘要存在 `outputs/README.md`。
- 提議可以把報告做成可分享的網頁，使用者尚未回覆這點。
