# 執行紀錄：presentation-skill

> 只往下追加，不改舊紀錄。2026-11-11 之前的段落是回溯補齊的。

## 2026-11-09｜起點：Web Based Report 與 codex-ppt-skill

- 使用者想討論 Web Based Report。實際需求：使用者一直用 codex-ppt-skill 做簡報，喜歡它圖文融為一體的說故事感；HTML 動態豐富，但畫面不夠活。
- 讀了 codex-ppt-skill：每頁是 gpt-image 生成的整張圖，文字畫在圖裡。
- 使用者附的範例 PDF 沒有傳到雲端環境，至今未取得。
- 討論：
  - 「活」可以來自會動的背景、文字參與場景、跨頁延續。
  - 轉場不是越多越好：固定語法＋少數招牌時刻。
  - 三種方向（電影、繪本、互動）依內容使用。
- 使用者表示只是 brainstorming，不是要做簡報。

## 2026-11-09｜研究市面上的簡報 Skill

- GitHub 搜尋 HTML 簡報 Skill Top 10。gh API 讀不到未掛載的 repo，改用 raw.githubusercontent.com 讀兩份 awesome 清單，交叉比對後修正為 Top 11，補進漏掉的 huashu-design、open-slide、bolt-slides。
- 3 個子代理深入研究 Top 11＋3 個「活」相關的 Skill，每個整理 1–3 個獨有亮點。
- 追加研究 greensock/gsap-skills 與 Top 3 ASCII 動畫庫。
- 產出：`inputs/research-html-slide-skills.md`

## 2026-11-09～10｜架構規劃的演變

1. **導演版**：故事、世界、鏡頭三層；8 階段 3 關卡；主角物件、分層生圖、張力曲線。
2. **對齊使用者流程**：使用者說喜歡「grill me → 三種風格樣張 → 完整生成」。改成使用者只參與三個時刻，其餘在幕後自動完成；加入 brief 檔解決「直接接續對話」的資訊流失。
3. **情境適配**：使用者問是否適用各種簡報類型（科普、分享、提案、成果、成長、開場、會議、洽談），而且這些都常做。加入 5 個維度、快速／標準／旗艦模式、依章節調整的旋鈕、可儲存的世界。
4. **自評優缺點後修正**：
   - 太複雜 → 精簡，規則交給腳本
   - 技術風險 → 先實驗、三級退路、單一 HTML 核心
   - 依賴 AI 品味 → 獨立評審、內容與引擎分離、PPTX 文字可編輯
5. **使用者質問「憑什麼讓人買單」**：
   - 結論：架構和點子都能被抄，真正的差異是越用越省事、一個 Skill 打天下、處理交付後的需求。
   - 證據比架構重要：8 種情境的成品、前後對比、時間曲線。
6. **使用者分享心法**（見 `inputs/presentation-principles.md`），兩次修正 Claude：
   - 標題只說這頁在講什麼，重點放在內容裡，不寫結論句。
   - 不寫承接、引出的過場文字，位置感靠目錄點亮和頁籤。
7. **震撼頁**：使用者說明獨立重點頁只給情緒轉折或刻意震撼（One more thing）。重點分兩級：一般重點、震撼頁。
8. **架構即目錄**：
   - 使用者指出列舉框架沒抓到核心邏輯。
   - 歸納出「起點 → 終點、一條軸、單一方向」模型。
   - 用 5 個情境題驗證並列型：使用者為了不得罪人選流程排序，並列不會出現在最上層，排序依會議性質而定。
   - 補上「價值軸／中性軸」與兩個層次。
9. 整合成定案規劃：`outputs/architecture-plan.md`

## 2026-11-10｜deck-architect v0

- 依 skill-creator 的原則撰寫：
  - SKILL.md 約 150 行，只放流程與鐵律
  - 參考檔用到才讀
  - 三個關卡明寫「停下來等使用者」並說明原因
  - 規則交給 lint
  - 內容只有一個來源 storyboard.yaml
- 實作：
  - `lint.py`：架構與呈現規則，錯誤訊息附修正方法
  - `build.py`：自動導航、依軸運鏡、震撼頁
  - `check.mjs`：Playwright 截圖，檢查溢出、字太小、主控台錯誤
  - 3 個主題：paper、signal、ink
- 測試：
  - 範例（3 章、時間軸）與 4 章距離軸（同心圓目錄）建置成功，check 無問題。
  - 故意寫錯的 storyboard 擋下 3 個錯誤（價值軸配人際顧慮、章節倒退、兩處重點）。
  - 修正：導航殘影、樣張空白（靜態模式投影片高度為 0）、引號位置、標題斷行。
- 未做正式 eval：有使用者關卡，無人值守跑不完。
- 產出：`outputs/deck-architect/`、`outputs/deck-architect.skill`、`outputs/examples/`

## 2026-11-10｜迭代預估

- 4 個大版本、約 10–15 次小迭代，完成條件見 `outputs/architecture-plan.md`。
- 建議下一步：用最近做過的真實簡報重跑 Grill，比對架構推薦。

## 2026-11-11｜建立專案同步規則

- 複製 mingming2-alya/claude-base-skills（鎖定版本的全域技能組合；含 grilling 與 gsap-* 技能）。
- 使用者要求以後每個段落結束都把狀態、執行細節、交付物、輸入物同步到 repo。
- 使用者的決定：
  - 推到 `presentation-skill-generation` 分支
  - 開新對話時自己選分支（方案 A，不改 main）
  - 加 Stop hook
  - 回溯補齊至今的所有成果
- 實作：
  - 根目錄 `CLAUDE.md`（只在本分支）
  - `.claude/settings.json`＋`.claude/hooks/check-sync.sh`：有未 commit 或未推送的變更就擋下結束；`stop_hook_active` 時放行，避免無限迴圈
  - `projects/presentation-skill/`：STATUS、LOG、inputs、outputs
- deck-architect 放在 `projects/` 而不是 `skills/`，所以 install.sh 不會把 v0 裝到全域。
- 驗證時發現 hook 的 bug：淺複製只追蹤 main，推送後本機沒有 `origin/presentation-skill-generation`，hook 誤判成「還沒推送」。修正為先看 upstream，沒有時用 `git ls-remote` 向遠端確認。已測試三種狀態：未 commit 會擋、已 commit 未推送會擋、推送後放行。
