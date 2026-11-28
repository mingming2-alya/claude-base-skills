# 素材碎片簿：<簡報暫定標題>

> 從使用者說的第一句話開始收，整個 Gate 1a／1b 持續收（參考 `mattpocock/skills` `writing-fragments`，MIT）：
> - **零上下文膨脹操作法（v5.1 強制）**：主代理與偵察子代理**一律透過 `python3 <skill>/scripts/fragments.py` 操作本檔**，不在主對話裡每輪 `view_file`＋整檔覆寫（避免多輪問答產生 `O(R²)` 全文歷史副本）：
>   - 追加原話：`python3 <skill>/scripts/fragments.py add decks/<name>/fragments.md "原話想法 1" "原話想法 2"`（腳本自動重讀磁碟最新內容、保留使用者手動修改並遞增 `#n`，僅回傳 1 行確認）
>   - 檢視清單（挑重點碎片 ⭐ 前跑一次）：`python3 <skill>/scripts/fragments.py list decks/<name>/fragments.md`
>   - 標記故事種子 ⭐：`python3 <skill>/scripts/fragments.py star decks/<name>/fragments.md 1 4`
> - **什麼算一則碎片**：只收**有機會活進最終簡報裡的原料**——銳利原話、案例、場景、數字、痛點、抱怨、比喻、半成形想法或承重母題詞；**不收純流程選項與 `1A/2A` 題號代碼**。
> - **第一手來源**：Gate 1b 契約起草子代理與 Gate 2/3 Builder 子代理都會直接讀本檔，確保頁面文案保留使用者真實語氣不走味。

#1 <使用者的原話、案例、場景或半成形想法>

---

#2 <下一則獨立想法>
