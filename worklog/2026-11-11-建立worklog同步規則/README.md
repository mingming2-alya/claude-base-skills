# 建立 worklog 同步規則與 Stop hook

- **狀態**：完成
- **日期**：2026-11-11

## 目標
讓之後每個任務在段落結束時，都把狀態、執行細節、產出物、輸入物同步到這個 repo。

## 做了什麼
1. 先提出方案與待決事項跟使用者討論。
2. 依使用者決定：
   - 分支 `brainstorming-for-learning`
   - 加 Stop hook，回合結束前檢查未 commit／未推送的變更
   - 回溯補齊先前所有成果
3. 新增 `CLAUDE.md`（規則）、`.claude/settings.json` 與 `.claude/hooks/check-sync.sh`（Stop hook）、`worklog/`（含三筆回溯紀錄）。
4. Hook 以模擬輸入測試：有變更時 exit 2 擋下；`stop_hook_active=true` 時 exit 1 只提醒。

## 決策紀錄
- 規則放 repo 根目錄 `CLAUDE.md`（專案記憶），未放進 `rules/CLAUDE.base.md`，所以只在這個 repo 生效。使用者未另行指定範圍，採推薦做法。
- Hook 同一輪只擋一次，避免推送失敗時無限迴圈。
- Hook 不依賴 jq，用 exit code 與 stderr 回報，換機器也能跑。
- 規則與紀錄都在 `brainstorming-for-learning` 分支；新會話需切到此分支（或合併進 main 後）才會載入 `CLAUDE.md` 與 hook。

## 產出物
- `CLAUDE.md`
- `.claude/settings.json`、`.claude/hooks/check-sync.sh`
- `worklog/INDEX.md` 與各任務資料夾

## 輸入物
- 使用者需求：「執行到任何一個段落結束時，任務的狀態、執行細節、相關交付產出物、相關輸入物，都要同步到這個專案的repo」
- 使用者決定：分支命名 `brainstorming-for-learning`；加 Stop hook；回溯補齊。

## 下一步
- 若希望所有專案都套用，可把規則併入 `rules/CLAUDE.base.md`。
- 若希望新會話預設就載入，需把此分支合併進 main。
