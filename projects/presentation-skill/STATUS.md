# 狀態：presentation-skill（deck-architect）

_最後更新：2026-11-14_

## 目前在哪

- **deck-architect v0 已完成**：流程骨架、lint、HTML 簡報產生器、三種主題、樣張頁、品管腳本。原始碼在 `outputs/deck-architect/`，安裝包 `outputs/deck-architect.skill`，範例在 `outputs/examples/`。
- 專案同步規則已建立：根目錄 `CLAUDE.md`＋Stop hook（`.claude/hooks/check-sync.sh`）。

## v1 進度

- ✅ 第一次迭代（2026-11-14）：用一場 15 分鐘的副總演講比對，結論在 `inputs/v1-iteration-1-comparison.md`。聽眾、終點、人際顧慮、開場提問都對；架構候選漏掉使用者原本的框架、故事位置、結尾語氣、每章時間預算要修。

## 下一步

1. 等使用者確認後，把第一次迭代的 5 條修正寫進 deck-architect（structure.md、grill.md、presentation-rules.md、lint.py、templates）。
2. 第二次迭代：換一種類型的真實簡報（v1 完成條件是 3 份不同類型）。
3. v1 其他項目：可編輯的 PPTX 匯出、快速模式沿用上次風格。

## 待使用者決定

- 開新對話時要選 `presentation-skill-generation` 分支（使用者選了方案 A，不改 main）。
- deck-architect 未來是否要搬進 `skills/` 讓 install.sh 安裝（目前放在 `projects/`，不會被安裝）。

## 使用者偏好

- Grill 時喜歡用**互動表單**回答問題。
- 含公司內部資訊的簡報檔**不上傳**到公開 repo，只記抽象結論。

## 已知限制

- v0 沒有正式 eval：Skill 有三個等待使用者的關卡，無人值守的子代理跑不完，驗證要靠真實使用。
- v0 沒有：PPTX 匯出、AI 生圖、獨立評審、記憶。
