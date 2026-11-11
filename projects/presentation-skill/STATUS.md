# 狀態：presentation-skill（deck-architect）

_最後更新：2026-11-11_

## 目前在哪

- **deck-architect v0 已完成**：流程骨架、lint、HTML 簡報產生器、三種主題、樣張頁、品管腳本。原始碼在 `outputs/deck-architect/`，安裝包 `outputs/deck-architect.skill`，範例在 `outputs/examples/`。
- 專案同步規則已建立：根目錄 `CLAUDE.md`＋Stop hook（`.claude/hooks/check-sync.sh`）。

## 下一步（v1 第一次迭代）

1. 使用者挑一份**最近做過的真實簡報**，用 deck-architect 重新跑一次 Grill。
2. 比對它推薦的架構和使用者當時的做法，差異記進 LOG，修正 `references/structure.md` 的推導邏輯。
3. v1 其他項目：可編輯的 PPTX 匯出、快速模式沿用上次風格。

## 待使用者決定

- 開新對話時要選 `presentation-skill-generation` 分支（使用者選了方案 A，不改 main）。
- deck-architect 未來是否要搬進 `skills/` 讓 install.sh 安裝（目前放在 `projects/`，不會被安裝）。

## 已知限制

- v0 沒有正式 eval：Skill 有三個等待使用者的關卡，無人值守的子代理跑不完，驗證要靠真實使用。
- v0 沒有：PPTX 匯出、AI 生圖、獨立評審、記憶。
