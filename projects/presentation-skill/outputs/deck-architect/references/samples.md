# 視覺關卡（Gate 2 · v4.7 風格×動態一體精準制）：融合圖鑑快選 → 單風格高工藝樣張

> **為什麼改為 3a → 3b？**
> 過去一次畫 3 款不同風格的 6–9 張樣張，不但分散火力、丟掉 2/3 的心血，還讓每張樣張容易流於平庸。
> v4.7 採 **「靜態上限 × 動態上限融合圖鑑」先選風格、再集中火力精雕 1 款真實樣張**：
> 1. **Step 3a（融合圖鑑快選）**：先讓使用者在 1920×1080 融合活體圖鑑一次體驗「視覺風格＋專屬動態物理」並挑中 1 款方向（零浪費）；
> 2. **Step 3b（單風格集中精雕 2–3 張真實樣張＋3 組 OKLCH 配色）**：100% 火力對標 Phase A+ 靜態上限與該風格 `motion_dna` 畫出 Demo 等級真實頁面；
> 3. **無縫沿用進 Step 4**：確認後的這 2–3 張樣張**直接保留為成品正式頁面**，並作為 Step 4 分批子代理的「活範本（Live Style Anchor）」。

---

## Step 3a｜風格 × 動態 DNA 融合圖鑑快選

1. 讀 `brief.md` 的 **`stage_mode`（`briefing`/`pitch`/`keynote`）**、**承重母題**與 **招牌亮點頁清單**，對照 `styles/index.json` 中 **`status: "ready"`** 的已就緒風格與其綁定之 **`motion_dna`**（目前 4 款：`workday`、`counsel`、`apple`、`illustration`）。
2. 提供互動式融合圖鑑 `assets/style-library.html`（可加 `?stage=briefing|pitch|keynote` 自動高亮該場合最推薦款式，每張皆為 1920×1080 等比活體舞台，支援淺／深切換、3 拍語意重播、直接互動與全螢幕放大）。
3. 透過互動表單請使用者**選定 1 款風格**（以及偏好的明暗策略：單一淺底／單一深底／光暗雙極；若選 `illustration` 同步點選畫風），並將最貼合 `stage_mode` 的款式放第一標「（推薦）」。

| `stage_mode` | 圖鑑優先推薦風格 | 預設明暗建議 |
|---|---|---|
| `briefing` | `workday`（日常工作款）、`counsel`（顧問報告） | 單一 `light` 或 `dark` 鎖定 |
| `pitch` | `counsel`（顧問報告）、`apple`（Apple 發表）、`workday`、`illustration` | 主調＋局部反轉 |
| `keynote` | `apple`（Apple 發表）、`illustration`（插畫場景） | `bipolar` 光暗雙極呼吸 |

---

## Step 3b｜用選定風格集中精雕 2–3 張真實樣張 ＋ 3 組 OKLCH 配色

使用者在 3a 選定風格後，**只針對這 1 款風格**集中 100% 火力製作樣張（絕不超過 3 頁）：

1. **讀入對應風格憲法、專屬動態套件與黃金工藝範本**：
   - 讀 `styles/<selected>.md`、`styles/index.json` 中該風格的 `motion_dna`（推薦原語與 `avoid_motions` 禁忌）與 `styles/color-system.md`；
   - 按 `storyboard.yaml` 招牌頁的 `director.archetype`，讀入 1–2 支對應的 **`references/recipes/*.md`** 與 **`references/modules/style-motion-kits.md`** 作為工藝基準線；
   - **融合鐵律**：先立住 1920×1080 靜態上限（空間先分群、雙欄底部基線齊平、禁為套動效降級成 Emoji 或簡陋小卡），再把該風格專屬動態寄生在原生結構上，守住 3 拍語意順序與閱讀期完全靜止（零永動）。
2. **挑選 2–3 張最有代表性的真實頁面**：
   - **第 1 張：封面**（展現字體聲音、母題與舞台第一印象）；
   - **第 2 張：核心招牌亮點頁（`signature: true`）**（直接兌現 Step 1 拍板的最強互動／圖解畫面，融合該風格專屬動態原語，拒絕簡陋方塊敷衍）；
   - **第 3 張（選填，湊滿 2–3 張）：異構圖或異極性頁**（例如 `keynote` 用來示範亮棚 vs 暗場反差，或 `briefing` 用來示範左欄風險↓拍板＋右欄健康總覽 Bento 看板）。
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
5. **親自打開 `samples/sheet.jpg` 驗收**（對比全部通過、主標題最大、去小字不回潮、視覺張力對標 Demo 水準），再用互動表單請使用者確認**「就用這組風格與配色進入完整生成」**或指定微調，**停下來等回覆**。

---

## 交接給 Step 4（零浪費活範本機制）

使用者拍板 Step 3b 後：
- 這 2–3 張已通過像素品管的真實樣張**直接轉入 `decks/<name>/slides/` 作為正式頁面**（無需重寫）；
- 同時把這 2–3 張樣張的 HTML 路徑寫入 Step 4 分批子代理的提示詞中作為 **Live Style Anchor（活範本）**，讓後面第 4–20 頁的版面呼吸、字級階層、SVG 精細度與動態手感與前 3 頁 100% 一致。
