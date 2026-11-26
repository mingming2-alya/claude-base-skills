# 視覺關卡（Gate 2 · 主柱 2 排版與呈現）：主題配對融合圖鑑 → 單風格極致樣張

> **為什麼採 3a → 3b？**
> 過去一次畫 3 款不同風格的 6–9 張樣張，不但分散火力、丟掉 2/3 心血，還容易每張流於平庸。
> 現行流程以「**根據不同內容主題，選擇最合適的靜態 × 動態風格極致**」為原則：
> 1. **Step 3a（主題配對 × 融合圖鑑快選）**：先依內容主題與氣質（再用場合光譜校準），讓使用者在 1920×1080 融合活體圖鑑一次體驗「靜態美感上限＋專屬動態物理」，挑中 **1 款風格（同步鎖定對應 `motion-*` 套件）**；
> 2. **Step 3b（單風格集中精雕 2–3 張極致樣張＋3 組 OKLCH 配色）**：100% 火力對標 `assets/style-library.html` 靜態上限與該風格 `motion_dna` 畫出高工藝真實頁面；
> 3. **無縫沿用進 Step 4**：確認後的這 2–3 張樣張**直接保留為成品正式頁面**，並作為 Step 4 分批子代理的「活範本（Live Style Anchor）」。

---

## Step 3a｜依內容主題 × 場合挑選「風格 × 動態 DNA」

1. 讀 `brief.md` 的 **主題類型與氣質**、**承重母題**、**說服載體清單**與 **`stage_mode`（`briefing`/`pitch`/`keynote`）**，對照 `styles/index.json` 中 **`status: "ready"`** 的已就緒風格（目前 4 款：`workday`、`counsel`、`apple`、`illustration`；其餘 8 款將於 Phase D 依序上架）。
2. **先依「內容主題與氣質」配對最契合的風格，再用 `stage_mode` 校準明暗策略與動效節制**：

| 內容主題與說服氣質（主軸） | 優先推薦風格（＋自動綁定動態套件） | 再依 `stage_mode` 校準 |
|---|---|---|
| 營運追蹤、專案群進度、例會對齊、待決拍板 | `workday`（日常工作款 ＋ `motion-workday`） | `briefing` 鎖定單一淺／深底、零舞台裝飾；`pitch` 可加局部反差 |
| 策略提案、商業比較、高階決策、前後量化成效 | `counsel`（顧問報告 ＋ `motion-counsel`） | 單一焦點色＋色塊即圖表；`pitch` 可切暗場做關鍵轉折 |
| 產品／工具發表、科技突破、大會開場、硬體／系統亮點 | `apple`（Apple 發表 ＋ `motion-apple`） | `keynote` 開光暗雙極呼吸＋高去框化；`pitch` 節制單頁光掃 |
| 知識科普、新人引導、內部宣導、故事型分享、生活／服務場景 | `illustration`（插畫場景 15 畫風 ＋ `motion-story`） | 實景優先真實無字 AI 底圖融真字；依場合選淺／深（變暗不等於夜晚） |

3. 展示互動式融合圖鑑 `assets/style-library.html`（可加 `?stage=briefing|pitch|keynote` 輔助篩選，每張皆為 1920×1080 等比活體舞台，支援淺／深切換、3 拍語意重播、直接互動與全螢幕放大）。
4. 透過互動表單請使用者**選定 1 款風格**（以及偏好的明暗策略：單一淺底／單一深底／光暗雙極；若選 `illustration` 同步點選畫風），把最貼合「內容主題 × 場合」的款式放第一標「（推薦）」。**此步驟同時定案該簡報專屬的 `motion_dna` 與 `motion-*` 套件**。

---

## Step 3b｜用選定風格集中精雕 2–3 張極致樣張 ＋ 3 組 OKLCH 配色

使用者在 3a 選定風格後，**只針對這 1 款風格**集中 100% 火力製作樣張（絕不超過 3 頁）：

1. **讀入對應風格憲法、專屬動態套件與黃金工藝範本**：
   - 讀 `styles/<selected>.md`、`styles/index.json` 中該風格的 `motion_dna`（推薦原語與 `avoid_motions` 禁忌）與 `styles/color-system.md`；
   - 按 `storyboard.yaml` 招牌頁的 `director.archetype`，讀入 1–2 支對應的 **`references/recipes/*.md`** 與 **`references/modules/style-motion-kits.md`** 作為工藝基準線；
   - **極致上限防退化鐵律**：對標 `assets/style-library.html` 的靜態美感與空間分群（雙欄底部基線齊平、一般卡片 ≤2 層文字、3 拍語意順序、畫完即靜止反永動）。**嚴禁做出「三張平庸白框配三個幾何矩形 SVG」或「用橢圓色塊假裝真實產品／插畫」的降級畫面**——需實物／插畫質感時，優先用無字 AI 底圖融真文字或高完成度資料視覺化。
2. **挑選 2–3 張最有代表性的真實頁面**：
   - **第 1 張：封面**（展現字體聲音、承重母題與舞台第一印象）；
   - **第 2 張：核心招牌亮點頁（`signature: true`）**（直接兌現 Step 1b 拍板的最強說服畫面，自然寄生該風格專屬動態原語）；
   - **第 3 張（選填，湊滿 2–3 張）：異構圖或異極性頁**（例如 `keynote` 示範亮棚 vs 暗場反差，或 `briefing` 示範左欄風險↓拍板＋右欄健康總覽 Bento 看板）。
3. **驗證 3 組 OKLCH 主題配色（貼題／沉穩／外卡）**：
   ```bash
   python3 <skill>/scripts/oklch.py --palette --bg '<底色>' --focus '<貼題>,<沉穩>,<外卡>' [--alert '<警示色>']
   ```
   主樣張套用「貼題」配色，同時在 `samples/sheet.html` 附上另外兩組配色的色票／實景對照供使用者一併定調。
4. **組裝樣張並跑像素品管**：
   ```bash
   python3 <skill>/scripts/assemble.py --sheet decks/<name>/samples --title "<簡報標題>｜選定風格真實樣張"
   node <skill>/scripts/check.mjs --sheet decks/<name>/samples
   ```
5. **親自打開 `samples/sheet.jpg` 驗收**（對比全部通過、主標題最大、去小字不回潮、視覺張力對標 `style-library.html` 水準），再用互動表單請使用者確認**「就用這組風格與配色進入完整生成」**或指定微調，**停下來等回覆**。

---

## 交接給 Step 4（零浪費活範本機制）

使用者拍板 Step 3b 後：
- 這 2–3 張已通過像素品管的真實樣張**直接轉入 `decks/<name>/slides/` 作為正式頁面**（無需重寫）；
- 同時把這 2–3 張樣張的 HTML 路徑寫入 Step 4 分批子代理的提示詞中作為 **Live Style Anchor（活範本）**，讓後面第 4–20 頁的版面呼吸、字級階層、圖解精細度與動態手感與前 3 頁 100% 一致。

