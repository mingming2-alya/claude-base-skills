# 產出

| 檔案 | 用途 |
|---|---|
| [`CLAUDE.md`](../../../CLAUDE.md) | 專案規則：任務進度同步到 repo、只更新在工作分支、資料夾結構、界線 |
| [`.claude/settings.json`](../../../.claude/settings.json) | 註冊兩個 hook |
| [`.claude/hooks/check-sync.sh`](../../../.claude/hooks/check-sync.sh) | Stop hook：回合結束前檢查未提交、未推送的變更或停在 main |
| [`.claude/hooks/guard-main.sh`](../../../.claude/hooks/guard-main.sh) | PreToolUse hook：擋下在 main 上提交與推送到 main |
| [`tasks/README.md`](../../README.md) | 任務索引 |
| [`tasks/2026-11-11-lemo-opuscar-competitive-analysis/`](../../2026-11-11-lemo-opuscar-competitive-analysis/) | 回溯補齊的競品分析任務紀錄 |

## 注意事項

- 兩個 hook 只擋代理的操作，使用者本人在終端機裡的 git 操作不受影響。
- 需要合併進 main 時：開 PR（使用者要求才開），或由使用者自己合併。
