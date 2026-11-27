# 回放 v1 四案：虛構回歸測試組

用途：檢查 deck-architect 的 Step 1a（Round 0 到關卡 1a）能不能引導使用者定下正確的架構。四案都是 v1 時期四份真實需求改寫成的虛構情境，人名、單位、數字全部虛構。結果報告見 `../v410-replay-run2.md`（第二組）；同日另一組回放的報告是 `../v1-replay-v410.md`。

## 內容

| 路徑 | 是什麼 | 測試 agent 能不能看 |
|---|---|---|
| `caseN/request.md` | 使用者的第一則訊息 | 能 |
| `caseN/attachments/` | 使用者附的檔案。案四一開始沒有附件，Round 0 要檔案時才給 | 能（案四等被要求才放進去） |
| `persona.md` | 扮演使用者的設定：每題怎麼答、哪些事被問到才說、已知正確架構、共同檢核 C1–C11 | **不能** |
| `caseN/rounds/` | v4.10 回放時每一輪的表單（agent 寫的） | 結果，不給下一次的測試 agent |
| `caseN/deck/` | v4.10 回放到關卡 1a 的 `brief.md`、`fragments.md`、問卷 | 結果，不給下一次的測試 agent |

## 怎麼重跑

1. 只把技能（`outputs/deck-architect/`）和 `caseN/request.md`、`caseN/attachments/` 複製到 repo 以外的沙盒，例如 `/tmp/replay/skill/`、`/tmp/replay/caseN/`。`persona.md` 放在沙盒外。
2. 每案派一個全新的 agent，提示詞用下面的範本。agent 不能呼叫 AskUserQuestion，改把每張表單寫成 `rounds/round-NN.md`，寫完把 `STATE` 寫成 `WAITING round-NN` 後結束回合。
3. 主對話照 `persona.md` 回答，用 SendMessage 把答案傳回去。只回答被問到的；心中的講法只有被問到才說；骨架關卡至少挑戰一次最弱的一點。
4. 每案跑到關卡 1a 拍板（`STATE` 變成 `DONE`）為止，再照 `persona.md` 的共同檢核逐項對照，記下輪數、題數、使用者糾正幾次、關卡 1a 有沒有重來。

用量提醒：四案並行很吃用量，v4.10 這次中途撞到一次 5 小時用量上限。恢復後用 SendMessage 接著跑即可，不用重開 agent；agent 若正在結束回合，訊息可能沒被讀到，要再送一次。

## 測試 agent 提示詞範本

```text
你要替一位使用者做簡報規劃，照 deck-architect 技能的流程走，從 Step 1a 開始，做到 ⛔ 關卡 1a 拿到使用者回覆為止。

【位置】
- 技能：/tmp/replay/skill/deck-architect（先讀 SKILL.md，再依它的指示讀需要的參考檔與範本）
- 你的工作區：/tmp/replay/caseN
  - 使用者的第一則訊息：request.md
  - 使用者附的檔案：attachments/（可能是空的）
  - 簡報工作目錄建在：/tmp/replay/caseN/decks/<簡短英文名>/
- 只讀技能資料夾和你自己的工作區。不要讀 /tmp/replay 底下其他資料夾，也不要讀 repo。不要上網、不要安裝套件。

【怎麼跟使用者溝通】
這個環境沒有表單工具可以直接給使用者，你也不能呼叫 AskUserQuestion 或 SendUserMessage。改用檔案轉交：
1. 技能要你用互動表單問使用者時，把這張表單寫進 rounds/round-01.md（之後依序 02、03…，一個檔案一張表單）。
2. 表單格式跟真實表單工具一樣：一張最多 4 題、一題 2–4 個選項，使用者永遠可以選「其他」自己填。每題這樣寫：
   ### Q1｜<12 字內的短標籤>
   題目全文（要能單獨看懂）
   - 單選／複選
   - A. 選項標籤：說明
   要先給使用者看的說明（例如候選比較、骨架確認單）寫在題目前面。
3. 寫完表單，把 STATE 寫成「WAITING round-01」，然後結束這一回合，最後一句回覆「WAITING round-01」。
4. 我會把使用者的回答轉給你，你接著做。

【其他】
- 能自己查的事實、讀檔、跑腳本就直接做，不要問使用者。
- 關卡 1a 的表單送出、收到使用者回覆、把結果寫進 brief.md 之後就停，不要進入 Step 1b；把 STATE 寫成「DONE」。若使用者在關卡 1a 要求修改，照技能規則修改後重送關卡 1a。
- fragments.md、brief.md、questionnaire-*.md（若有）都放在簡報工作目錄。
```
