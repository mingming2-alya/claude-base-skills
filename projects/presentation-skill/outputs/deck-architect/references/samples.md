# 視覺關卡指南（Gate 2a 活體比稿 → Gate 2b 定版活範本確認）

> **v5.0 第一性原理改革：為什麼「拿真實關鍵頁畫 3 風格活體比稿」勝過「看假範例盲選」？**
> 真實高難度簡報實測證明：使用者看通用假範例圖鑑（`style-library.html`）時，根本無從想像該風格套在自己「高密戰術漏斗／多組數據／教學範例」上長什麼樣，極易選錯風格導致首稿崩盤。
> 因此 v5.0 採 **「Gate 1b 文字預確認 3 個方向 → Gate 2a 同題真實內容 3 子代理並行活體比稿 → Gate 2b 定版 `deck.css` 活範本 1 輪確認沒走鐘」**：既不浪費算力畫 9 張廢稿（只畫最關鍵 1 頁 × 3 款），又能讓使用者親眼看到**自己的真實內容在靜態×動態下的極致結合與混搭可能**！

---

## 一、Gate 2a｜最關鍵 1 頁真實內容 × 3 風格並行活體比稿（⛔ 關卡 2a）

> **前置條件**：使用者已在 Gate 1b 表單簽核 `brief.md` 與 `storyboard.yaml`（含逐頁 `slide_plan`），並在最後一題確認了想看的 3 個風格方向（若使用者已明確鎖定單一風格，則改派 1 位 Builder 直接畫該風格）。

### 1. 挑對比稿靶心頁（1 頁定生死）
- 優先選 `storyboard.yaml` 標記 `signature: true`、或**全場結構密度最高、最難排的那 1 頁真實內容頁**（而非空洞的封面頁）——只要這 1 頁能排得優雅通透、動效從容不破梗，全場其餘頁面自然迎刃而解。

### 2. 並行派發 3 位乾淨上下文 Builder 子代理
為 Gate 1b 確認的 3 款風格（從 `styles/index.json` 已就緒之 `counsel`、`workday`、`apple`、`illustration` 挑選，或依使用者指定），在 `decks/<name>/samples/opt-{a,b,c}/` 各自建立迷你單頁預覽工作區，**並行派 3 位乾淨 Builder 子代理**，每位只讀：
1. 負責的那 1 款風格憲法 `styles/<id>.md`（善用該風格的 `airy` 單核留白或 `structured` 高密 Bento／畫廊雙密度語法）與 `styles/color-system.md`；
2. `references/visual-guidance.md` 與 `references/motion-system.md`（全風格統一從容慢板：`800–1,200ms` 描線生長、`220–320ms` 交錯、`data-step` 防破梗步進）；
3. 該關鍵頁的 `slide_plan`（`job`、`reveal`、`zones ≤4`、`visual_encoding`、`anchors`）與 `fragments.md` 原話；
4. 1 支最貼近該頁 `job` 的 `references/recipes/*.md` 工藝參考。

每位 Builder 產出可獨立開啟、**支援按 `→` 現場試播步進與從容慢板動效**的單頁 `deck.html`（由 `assemble.py` 組裝），並通過：
```bash
node <skill>/scripts/check.mjs decks/<name>/samples/opt-a/deck.html --jpg --motion
```
接著派 **1 位乾淨只讀 Critic 子代理**一次檢視 A/B/C 三張截圖（與 `filmstrip-s01.jpg` 分鏡條），確認零解釋贅字、零溢出、三套風格視覺個性截然不同（若有明顯瑕疵最多自修 1 輪）。

### 3. 同步驗證 3 組 OKLCH 主題配色
依 `styles/color-system.md`（支援單一主焦點色＋可選第二語意主色，亮底保持 ≥75% 溫潤中性紙面），跑腳本驗證三組配色（貼題／沉穩／外卡）：
```bash
python3 <skill>/scripts/oklch.py --palette --bg '<底色>' --focus '<貼題>,<沉穩>,<外卡>' [--alert '<警示色>']
```

### 4. ⛔ Gate 2a 表單：展示活體比稿 ＋ 給出「結合與混搭建議」
向使用者說明本關目的與驗收重點，提供 3 份活體預覽（及磁碟 `assets/style-library.html` 備查），**每套必附兩句顧問解析**：
- **內容結合亮點**：這套風格如何把您的 `slide_plan` 轉成視覺（例：「方案 A `counsel` 用溫潤畫廊紙面與三階字重把收斂漏斗排成無壓迫雜誌頁；方案 B `workday` 用左右因果 Bento 突顯分工與狀態膠囊；方案 C `apple` 用亮舞台微光艙體強化關鍵倍率」）；
- **跨風格混搭建議**：點出如何取長補短（例：「推薦以 A `counsel` 的溫潤紙面與三階襯線字重為主體，混搭 B `workday` 的雙語意進度膠囊，兼顧高階策略感與狀態辨識度」）。

用互動表單請使用者拍板：
1. **選定風格（單選 A / B / C 或指定混搭組合）**；
2. **主題配色（貼題／沉穩／外卡）與呈現規格**（`mode: light|dark`、光暗極性節奏、`nav_mode`）。

---

## 二、Gate 2b｜合成 `deck.css` 與定版活範本「沒走鐘」確認（⛔ 關卡 2b）

> **為什麼無論單選或混搭都必走這 1 輪？**
> 單選時套入正式雙極色票與導航殼層、或混搭兩套風格元素時，若直接盲展開 15 頁，一旦字重、色塊面積或步進節奏「走鐘」，全場都要重改。先花 **1 輪** 鎖死定版活範本，後續全場組裝才能一次到位！

1. **建立定版 `deck.css` 與更新 `storyboard.yaml`**：
   - 從 `templates/deck.css` 建立 `decks/<name>/deck.css`，寫入拍板的字體堆疊、經驗證的淺深雙極 OKLCH 變數（`--light-*` / `--dark-*`，含可選 `--*-accent-2`）與從容慢板參數；
   - 更新 `storyboard.yaml` 的 `meta`（`style`、`mode`、`palette`、`nav_mode`）與逐頁 `surface`／`director`。
2. **派乾淨 Builder 子代理合成定版活範本（`1–2` 張真實頁）**：
   - 若全場主頁僅 **1–2 頁**：直接完成主頁定版片段放入 `slides/`；
   - 若全場 **≥3 頁**：合成 **第 1 張（該關鍵招牌頁定版）＋ 第 2 張（`keynote` 補反極性封面或大扉頁；`briefing`/`pitch` 補另一種代表構圖頁）**放入 `slides/`；
   - 組裝預覽並通過 `check.mjs --jpg --motion`（確認 0 錯誤、步進分鏡條正常）＋ **1 輪只讀 Critic 複核**。
3. **⛔ Gate 2b 表單確認（「沒走鐘」簽核）**：
   - 展示定版活範本（靜態截圖、步進分鏡條與可點擊 `deck.html`），請使用者確認：**① 字重層次與留白呼吸、② 雙語意色與底紙面積比例、③ 按 `→` 試播的從容慢板動效節奏** 皆符合預期、完全沒走鐘。
   - 使用者點頭同意後，這 `1–2` 張 `slides/*.html` 即刻鎖定為 **Live Style Anchor（定版活範本）**，原封不動保留進正式簡報，並作為 Gate 3 所有分批 Builder 子代理的硬標竿。
