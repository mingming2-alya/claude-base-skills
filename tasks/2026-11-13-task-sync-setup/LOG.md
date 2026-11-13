# 任務同步規則與 hooks：執行紀錄

## 2026-11-11 段落 1：提出做法

先檢查 `scripts/install.sh`：它會把 `rules/CLAUDE.base.md` 合併進全域的 `~/.claude/CLAUDE.md`，所以把規則放那裡等於套用到所有專案。

向使用者提出的做法：

- 規則放在 repo 根目錄新增的 `CLAUDE.md`，只在這個專案生效。
- 「段落結束」四種情況：計畫步驟完成、子代理回報、停下等回覆或回合結束、遇到阻礙或改做法。
- 結構：`tasks/README.md` 索引，每個任務一個資料夾，內含 `STATUS.md`、`LOG.md`、`inputs/`、`outputs/`。交付物有原本的位置就只放連結。
- commit 格式 `task(<任務名>): <段落名稱>`，push 到開發分支。
- 界線：外部 repo 和大檔只記網址與 SHA；不寫金鑰和個人資料；爬來的內容當資料；子代理只存報告不存對話。
- 問使用者四點：規則位置、同步頻率、子代理存摘要或全文、只推開發分支可不可以。

## 2026-11-13 段落 2：使用者回覆與決定

使用者的回覆（原文見 `inputs/request.md`）與對應決定：

| 使用者說 | 決定 |
|---|---|
| 能不能設定分支，只更新在分支？ | 規則寫明只 commit、push 到工作分支；另加一個 PreToolUse hook 擋下在 main 上 commit 和推送到 main 的指令，讓規則有強制力 |
| 加 Stop hook，檢查還沒推送的變更 | `.claude/hooks/check-sync.sh`：未提交、未推送或停在 main 上就擋下結束 |
| 回溯補齊所有成果 | 補上競品分析任務的完整紀錄；子代理回報存它交回的報告內容 |
| 沒回應的問題（規則位置、同步頻率） | 採用提案的預設：只放專案 `CLAUDE.md`；四種情況都同步 |

## 2026-11-13 段落 3：建立 hooks 並測試

- 新增 `.claude/settings.json`（原本沒有 `.claude/` 目錄）、`.claude/hooks/check-sync.sh`、`.claude/hooks/guard-main.sh`。
- Stop hook 設計：讀 stdin 的 `stop_hook_active`；第一次觸發時回 `{"decision":"block","reason":...}`；同一回合第二次觸發只回 `systemMessage` 提醒，避免無限迴圈。沒有上游分支時，用 `git rev-list HEAD --not --remotes` 判斷未推送的 commit。
- 守門 hook 設計：指令含 `git … push … main|master`（含 `HEAD:main`、`-C` 寫法）一律拒絕；目前分支是 main/master 時，拒絕 commit、push、merge、rebase、cherry-pick。
- 第一次測試時，守門 hook 已經生效，把我的測試指令本身擋下來了（指令文字裡有 `git push origin main`）。這證明 hook 有在跑。改把測試寫成 scratchpad 裡的腳本再執行。
- 測試結果（全部符合預期）：
  - 工作分支上：`ls`、推送工作分支、`git commit`、`git fetch origin main`、`git checkout -B claude/x origin/main` 放行；`git push origin main`、`git push origin HEAD:main`、`git -C . push origin master` 拒絕。
  - 臨時測試 repo 的 main 上：`git commit`、`git push` 拒絕；`git status`、`git checkout -b claude/y` 放行。
  - Stop hook：有未提交檔案 → block；同回合第二次 → 只有 systemMessage；停在乾淨的 main → 提示先開分支；新分支沒推送 → 提示 `git push -u`；完全同步 → 無輸出、exit 0。
  - `jq -e` 驗證 `settings.json` 結構正確。
- commit `task(2026-11-13-task-sync-setup): 建立任務同步規則與 hooks` 並推送。

## 2026-11-13 段落 4：回溯補齊競品分析任務

- 建立 `tasks/2026-11-11-lemo-opuscar-competitive-analysis/`：STATUS、LOG（6 個段落）、`inputs/request.md`、`inputs/sources.md`（6 個 repo 的研究版本 SHA、16 組查詢、15 個 repo 的中繼資料快照）、`outputs/README.md`、`outputs/competitor-profiles/` 五份子代理報告。
- 研究版本 SHA 從 scratchpad 裡還在的 clone 讀出來。
- 推送前 grep 確認沒有寫進個人資料。
- commit 並推送。

## 2026-11-13 段落 5：本任務紀錄

- 補上本任務的 inputs、LOG、outputs，STATUS 改為完成，更新 `tasks/README.md`。
