# Phase C 旗艦標竿對照與 `mattpocock/skills` 始祖回溯研究筆記（去敏版）

> **日期**：2026-11-25
> **來源**：
> 1. 使用者提供之 43 頁旗艦級多媒體 PPTX 標竿（含 6 支內嵌 MP4、1 支實測音檔、6 頁講者點擊懸念動畫）與 Phase C 端到端產出之 21 頁 HTML 初版對照實測（原始檔含內部資料，僅於本機研究，不進公開 repo）。
> 2. 線上查閱 `github.com/mattpocock/skills`（`main` 分支）：`skills/productivity/grilling/SKILL.md`、`skills/engineering/codebase-design/DESIGN-IT-TWICE.md`、`skills/in-progress/writing-fragments/SKILL.md`、`skills/in-progress/writing-beats/SKILL.md`、`skills/in-progress/writing-shape/SKILL.md`、`skills/productivity/writing-for-agents/SKILL.md`。

---

## 一、旗艦標竿對照的第一性原理發現

將 43 頁標竿 PPTX 逐頁渲染量測並拆解 XML 動畫／媒體，與 21 頁 Phase C HTML（WCAG 最低 `5.80:1`、零 lint 錯）並排比較後，發現兩者呈現明顯互補：

- **Phase C HTML 已建立的優勢（必保留）**：單軸收斂（43→19 頁＋2 附錄）、跨部門白話翻譯、嚴格數據口徑核對（區隔已實現與預期目標）、真實像素 WCAG 對比、零文字碰撞溢出與無拼字瑕疵（原手做 PPTX 仍可見多處數字斷行撞邊、標籤壓圖與拼寫失誤）。
- **現行 `deck-architect` v4.3 的七個結構性缺口**：
  1. **單一極性疲勞 vs 光暗雙極節奏**：HTML 全 21 頁亮度鎖在 `19.0–32.3/255`（全暗），導致連黑幕震撼頁都失去「關燈反差」；標竿 43 頁為「暗 16／亮 20／左暗右亮分割 4／滿版照片 3」，以明暗切換區隔理性展間與戲劇暗場。
  2. **萬物皆圓角卡片（Card-itis）vs 去框化編輯排版**：HTML 幾乎每頁皆為暗色圓角框甚至框中框，呈現「SaaS 監控後台感」；標竿大量使用白棚無框裸數、1px 細線規格清單、35/65 深色錨點分割與自然物象軌跡構圖（文字以極細垂線掛載於發光弧線，而非美圖上蓋三張框）。
  3. **抽象幾何 vs 實物具象化（Object Embodiment）**：對非工程聽眾而言，高精細產品爆炸／剖面圖與實體零組件照比抽象 KPI 條更具說服力；羽化融圖 Bento（軟邊漸層溶入卡片＋中央反極性 Hero 格）、全黑暗房客戶原話見證（Verbatim Theater）、團隊照片牆與無框發光信號燈皆為先前空白原型。
  4. **多媒體原語空白 vs 精準四類影音角色**：標竿 7 支媒體分工明確——①電影感世界觀開場片、②感官實證音檔（讓全場親耳驗證降噪／防漏音）、③幕後工藝實拍片、④無聲循環「活插圖」（3D CoverFlow 照片輪播＋垂直輪播產品流程動畫）。HTML5 在第④類具備不對稱反超優勢：可用 ~15 KB 原生程式渲染更銳利且可互動的活流程輪播，無需如 PPTX 般烤成 445 MB 大檔。
  5. **全自動計時演繹 vs 講者點擊懸念控場**：標竿全場僅 6 頁用文字／圖形動畫，卻筆筆致命——全部用於配合講者口白停頓的「單頁多層換幕、公式滑入補完、照片牆炸出主題、壓軸金句落幕」。一刀切鎖死自動計時會剝奪發表會講者的停頓主權。
  6. **常駐雙層頂部導航過重**：在峰會型簡報中，每頁上方雙排章節頁籤＋常駐底列把畫面框成網頁外殼；改採暗場大扉頁定位＋系列三部曲頁極簡側邊錨點更能釋放滿版舞台感。
  7. **架構過於理性單一、缺乏戲劇層**：缺少「貫穿全場的承重母題」「先具象體驗、再抽象收割（Show, Don't Tell）」「刻意不劇透的 `One More Thing` 驚喜幕」與「3-2-1 記憶倒數收斂」。

---

## 二、回溯 `mattpocock/skills` 始祖萃取之 Grill v2 設計心法

1. **Design Tree + Frontier（`grilling/SKILL.md`）**：不跑死板 1→15 線性清單，而以動態決策樹逐輪推進「前置已解鎖的前沿問題」，**不設輪次上限直到前沿清空、零靜默假設**；**查事實是 Agent 的工作，做決定才是使用者的事**（Pre-Flight 先讀完既有檔案並核對數字與資產）。
2. **Explore 先於 Exploit ＋ 承重母題詞（`writing-fragments/SKILL.md`）**：收斂結構前先挖掘情感體感預期與 1 個承重母題（Leading Motif），由它一路支撐標題、轉折與視覺。
3. **Design It Twice（`DESIGN-IT-TWICE.md`）**：用三種截然不同的約束提出本質不同物種的架構候選，**標準模式全面必給 1 個跳脫思維破框候選**，並給出有主見（Opinionated）的比較與混搭建議。
4. **Grounding ＋ Format Arguments ＋ Gap-Naming（`writing-beats`、`writing-shape`）**：確認聽眾自帶前置（Prerequisite）與須場內先著陸（Introduced）的概念順序；逐章把說服載體取捨（原話暗房 vs 摘要、實物爆炸圖 vs 卡片表、活流程 vs 靜態圖）攤開討論，缺料直接點名並定補法。
5. **Skill 撰寫紀律（`writing-for-agents/SKILL.md`）**：單一真相來源、正向引導、承重提示詞、可檢核完成門檻與持續修剪沉積。

---

## 三、定案決策（分兩輪落地）

- **本輪（v4.4-spec，規格與文件層）**：完成 `grill.md` v2、`templates/brief.md` v2、`contexts.md`（三段式舞台光譜 `briefing`/`pitch`/`keynote`）、`structure.md`、`samples.md`、`visual-guidance.md`、`presentation-rules.md`、`motion-system.md`、`SKILL.md` 與原則 #27–#30 反寫，並重新打包 `deck-architect.skill`。
- **下一輪（v4.4-engine，輕底盤引擎升級）**：於 `assets/runtime.js`、`assets/shell.css`、`scripts/assemble.py`、`scripts/check.mjs` 實作單頁極性 `data-surface`、自動隱藏底控與 `nav_mode: divider-only`、講者點擊步進 `data-step`、外連 `<video>`/`<audio>` 媒體控制器與 HTML5 原生活產品流程輪播／3D 照片輪播組件。
