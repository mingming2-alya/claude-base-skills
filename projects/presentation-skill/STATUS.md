# 狀態：presentation-skill（deck-architect）

> 主軸文件：`ROADMAP.md`（三個支柱＋全流程＋階段）。

_最後更新：2026-11-14_

## 目前在哪

- **deck-architect v2.2**（2026-11-14）：主題從「皮」升級成「構圖」。五套主題各有自己的版面語法；大字只在標點後換行、放不下自動縮字。總覽圖在 `outputs/examples/compositions-v2.2.png`（虛構內容）。
- **真實簡報實測進行中**：全新 agent 只靠 SKILL.md 做「內部工具推廣與部署說明」，已完成 Step 2–3。使用者在關卡二退回第一版樣張（三種只差字體和顏色），已用 v2.2 重出樣張，**等使用者選風格**。真實內容只在暫存區，不進 repo。
- deck-architect v2.1（2026-11-14）：新 agent 實測回報的 7 個 bug 修正，新增 `stats` 版型、`note`、步驟 `{label, detail}`。
- deck-architect v2.0（2026-11-14）：階段 2 設計系統重建，見 ROADMAP 與 LOG。
- deck-architect v1.0（2026-11-14）：v1 四次迭代的修正全部套用完成，見下方 v1 進度。
- deck-architect v0 已完成：流程骨架、lint、HTML 簡報產生器、三種主題、樣張頁、品管腳本。原始碼在 `outputs/deck-architect/`，安裝包 `outputs/deck-architect.skill`，範例在 `outputs/examples/`。
- 專案同步規則已建立：根目錄 `CLAUDE.md`＋Stop hook（`.claude/hooks/check-sync.sh`）。

## v1 進度

- ✅ 第一次迭代（2026-11-14）：用一場 15 分鐘的副總演講比對，結論在 `inputs/v1-iteration-1-comparison.md`。聽眾、終點、人際顧慮、開場提問都對；架構候選漏掉使用者原本的框架、故事位置、結尾語氣、每章時間預算要修。
- ✅ 已套用修正（v0.1）：
  - 架構候選必含使用者既有框架
  - 序幕、轉折點、尾聲
  - `role: opener` 開場提問
  - 有人際顧慮時改用「我們」提問
  - 每章時間預算與 lint 檢查
  - Grill 預設用互動表單
- ✅ 第二次迭代（2026-11-14）：用一份內部 AI 工具的推廣與部署說明比對，結論在 `inputs/v1-iteration-2-comparison.md`。四章架構一致（使用者自帶框架），缺口集中在內容可信度：證據、限制與誠實、數據查核；另有頁數定義、短簡報自動目錄頁過多、既有框架與候選放在同一張表單。

- ✅ 已套用修正（v0.2）：
  - 表單題目不可互相依賴，既有框架單獨先問
  - 頁數含不含封面與目錄
  - 證據與限制
  - 關鍵數字查核與 `source`
  - 短簡報只插一頁目錄（`toc_mode`）
  - 頁數上限 `meta.pages`
  - 節奏基準依兩份真實成品調整為每分鐘 0.4–1 頁
- ✅ 第三次迭代（2026-11-14，**非盲測**，年度成果）：使用者先給了採用版，改用模型反向拆解，結論在 `inputs/v1-iteration-3-annual-review.md`。
  - 年初版的最上層是並列，年末版改成路徑，驗證了既有規則。
  - 新缺口：既有框架是並列時要提醒；計畫轉成果（成果語言、重排、刪減）；一頁總覽章節模式與三欄支柱版型；可點入的附件。
- ✅ 已套用修正（v0.3）：
  - 既有框架是並列時提醒並提出路徑版本
  - contexts.md「計畫轉成果」
  - `meta.format: section` 與 `layout: pillars`（欄位高低依軸向逐階）
  - 附件頁 `appendix` 與 `link`：點入、返回鈕、Esc、方向鍵返回
  - 範例 `outputs/examples/annual-section/`
- ✅ 第四次迭代（2026-11-14，盲測，定期進度回報）：結論在 `inputs/v1-iteration-4-progress-report.md`。
  - 情境與模板理解都正確。
  - 新缺口：總覽頂端摘要、`status-table` 狀態表版型、多人填寫的規範與內容 lint，以及模板要當輸入物另外提供。
- ✅ 已套用修正（v1.0）：
  - 模板當輸入物另外提供
  - 新增 `references/progress-report.md`（填寫規範可直接發給各單位）
  - `layout: status-table`：本期摘要、大類分組、共用階段欄、進度、風險燈號、需要的支援，並檢查類內排序
  - `scripts/check_reports.py`：多人填寫的 PPTX 內容檢查
  - 範例 `outputs/examples/progress-overview/`（虛構）
- **v1 四次迭代全部完成**：情境判斷四次都正確；架構在「先問、先讀既有框架」後就穩定了；缺口轉向內容品質與特定類型的版型。

## 下一步

> 主軸以 `ROADMAP.md` 為準。

1. **使用者選風格**（關卡二，v2.2 構圖樣張）。
2. 選定後確認兩個架構問題：成本那一行要多顯眼、附件頁要不要留。
3. 讓同一個 agent 接著做 Step 4–6，完成第一份真實成品；使用者拿它和當時的 Codex 版本比較。
4. 通過後階段 2 才算驗收，進入階段 3：畫面活起來（插畫流程、動態背景、元素跨頁延續、滾動數字）。
5. ROADMAP 待辦清單還有 14 項未處理。

## 待使用者決定

- 開新對話時要選 `presentation-skill-generation` 分支（使用者選了方案 A，不改 main）。
- deck-architect 未來是否要搬進 `skills/` 讓 install.sh 安裝（目前放在 `projects/`，不會被安裝）。
- git 歷史裡還留著一組沒有上下文的真實數字（兩個步驟數）。目前檔案已清除；要不要再改寫一次歷史。

## 使用者偏好

- Grill 時喜歡用**互動表單**回答問題。
- 含公司內部資訊的簡報檔**不上傳**到公開 repo，只記抽象結論。
- 三選一樣張要在**排版與呈現**上不同，只換字體和顏色不算不同。

## 已知限制

- v0 沒有正式 eval：Skill 有三個等待使用者的關卡，無人值守的子代理跑不完，驗證要靠真實使用。
- v0 沒有：PPTX 匯出、AI 生圖、獨立評審、記憶。
