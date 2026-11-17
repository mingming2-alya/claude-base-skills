# 專案規則（presentation-skill-generation 分支）

這個分支是「簡報技能」專案的工作區。`main` 是鎖定版本的技能組合，**不要在 `main` 上做這個專案的工作**。

## 規則一：每個段落結束都要同步到 repo

使用者要求：**執行到任何一個段落結束時，把任務狀態、執行細節、交付產出物、相關輸入物，同步到這個 repo 的 `presentation-skill-generation` 分支。** 以後執行任何任務都要照做。

### 什麼是「段落」

完成一個有產出或有決策的步驟就算一個段落，例如：

- 一輪研究結束（例如比較市面上的簡報 Skill）
- 一份規劃或決策定案（包含使用者修正你的觀點，例如簡報心法）
- 一個版本或一個功能完成（例如 deck-architect v0）
- 使用者要求的修改完成

純粹的閒聊、問答不用同步；但只要對話中產生了**決策或使用者的偏好**，就要寫進 LOG。

### 同步什麼、放在哪裡

```
projects/<專案名>/
├── STATUS.md   # 目前狀態：做到哪、下一步、卡在哪、待使用者決定的事（每次覆寫成最新）
├── LOG.md      # 執行紀錄：日期、做了什麼、決策與理由、使用者的修正（只往下追加，不改舊紀錄）
├── inputs/     # 輸入物：使用者提供的檔案、參考資料、研究筆記
└── outputs/    # 交付物：技能原始碼、打包檔、範例產出
```

目前的專案：`projects/presentation-skill/`。

### 怎麼同步

1. 更新 `STATUS.md`，在 `LOG.md` 追加一段（日期＋段落名稱）。
2. 把新的輸入物、交付物放進 `inputs/`、`outputs/`。交付物若在 repo 外產生（例如 `/home/user/...`），複製進來。
3. commit，訊息寫清楚這個段落做了什麼。
4. `git push -u origin presentation-skill-generation`。網路錯誤時依序等 2、4、8、16 秒重試。
5. 回覆使用者時，附上這次同步了哪些檔案。

### 不要同步的東西

- 任何憑證：密碼、金鑰、Token
- 使用者的 email 等個人資訊
- 大型二進位檔（例如影片）：只在 LOG 記錄位置與用途

## 規則二：Stop hook 會檢查

`.claude/settings.json` 設了一個 Stop hook（`.claude/hooks/check-sync.sh`）。結束回合前，如果 repo 有未 commit 或未推送的變更，它會擋下來提醒你先同步。被擋下時，照「怎麼同步」做完再結束；若這次變更確實不該同步（例如暫存檔），把它加進 `.gitignore` 或刪掉。

## 規則三：問問題一律用互動表單

使用者要求（2026-11-17）：**這個專案裡，所有要問使用者的問題一律用互動表單（AskUserQuestion）問，不在回覆文字裡提問。** 包括 Grill、審閱回饋、待使用者決定的事。

- 每題都要能單獨看懂：表單打開時，使用者可能看不到前面的對話。題目和選項說明要帶上必要的脈絡，例如是哪一款風格、要看哪個檔案。
- 題目之間不可互相依賴。需要前一題答案才能問的，留到下一張表單。
- 一題最多 4 個選項，另有「其他」可以自由填寫。選項較多時拆成幾題，或分成幾張表單。
- 有推薦的選項放第一個，標「（推薦）」。

## 開新對話時

1. 確認目前在 `presentation-skill-generation` 分支（`git branch --show-current`）。不在的話先 `git fetch origin presentation-skill-generation && git checkout presentation-skill-generation`。
2. 先讀 `projects/<專案名>/STATUS.md` 接手進度，需要背景時再讀 `LOG.md`。
