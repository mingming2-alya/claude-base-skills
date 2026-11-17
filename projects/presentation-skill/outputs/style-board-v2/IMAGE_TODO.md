# AI 生圖代辦清單

> 用途：風格樣張板 v2 的**圖像層**。使用者自行用生圖 AI 產生這些圖，放進
> `outputs/style-board-v2/img/`，再重跑 `make_board.py`，佔位框就會自動換成真圖。
> 產生日期：2026-11-17

## 使用方式

1. 依下面每項的提示詞生圖。
2. 存成**指定的檔名**（PNG，透明背景優先）。
3. 放進 `projects/presentation-skill/outputs/style-board-v2/img/`。
4. 執行 `python3 make_board.py` → 開啟 `board.html`。

## 共通規則（所有圖都適用）

這六條來自使用者參考簡報《AI 的第三次搬家》的分析（`inputs/reference-styles.md`），
**是「背景與文字融入」的技術核心**，生圖時務必遵守：

| # | 規則 | 生圖時的具體要求 |
|---|---|---|
| 1 | **共用一個光源** | 所有物件一致「左上方打光、右下方投影」 |
| 2 | **共用一套色調** | 物件顏色取自該風格的底色色相家族，不要跳色 |
| 3 | **貼邊、中央留空** | 物件貼齊畫面邊緣或角落；**中央與文字區必須留白** |
| 4 | **柔和陰影** | 陰影無硬邊、帶模糊，與背景漫射光同一質感 |
| 5 | **物件說故事** | 物件要對應「常客／被記得」的主題，不是隨機裝飾 |
| 6 | **不要文字** | 圖上不能有任何文字（文字由 HTML 層負責） |

**通用的通用負面提示**：不要文字、不要浮水印、不要 logo、不要人物臉部特寫、
不要霓虹光、不要硬邊陰影、不要深色背景（除 `midnight`）。

---

## 第一批：`clay` 紙黏土（最優先——對應使用者最喜歡的參考）

風格世界：暖粉漸層底 + 邊緣的黏土質感 3D 物件 + 中央大面積留白。

### 1. `clay_scene.png` — 主場景圖（畫面右半）

- **尺寸**：1000 × 780 px（比例約 1.28:1）
- **放置**：`board.html` 右半 `.scene`
- **提示詞**：

> 3D clay render, soft matte plasticine texture, a warm cozy shop counter scene:
> a small wooden desk with a notebook, a name tag and a cup of tea, a gentle
> shopkeeper's welcoming gesture suggested by simple clay shapes.
> Soft diffused lighting from upper left, gentle blurred shadows falling to lower right.
> Pastel palette of warm peach, cream and soft pink, one muted sage accent.
> Rounded chunky forms, no sharp edges, no text, no faces in close-up.
> Isolated on a plain soft gradient background, generous empty space in the center.
> Cute, friendly, tactile, high-end product illustration style.

- **對應敘事**：「被記得」＝有人為你留了一張桌子。

### 2. `clay_obj_box.png` — 貼邊物件：紙箱（左下）

- **尺寸**：340 × 290 px（透明背景）
- **提示詞**：

> Single 3D clay object: a small rounded cardboard box, chunky matte plasticine
> style, warm tan and peach gradient, soft blurred shadow to the lower right,
> lighting from upper left. Isolated on transparent background, no text, no logo.

### 3. `clay_obj_ball.png` — 貼邊物件：圓形（右上）

- **尺寸**：230 × 200 px（透明背景）
- **提示詞**：

> Single 3D clay object: a soft rounded sphere, chunky matte plasticine style,
> pale pink to warm cream gradient, soft blurred shadow to the lower right,
> lighting from upper left. Isolated on transparent background, no text.

---

## 第二批：其他風格的圖像層（可延後）

這些風格的骨架目前**不依賴圖像**，但補上會更完整。優先度低於 `clay`。

### 4. `scroll_texture.png` — 紙張質感（`scroll` 書卷刻本）

- **尺寸**：1920 × 1080 px（滿版疊在底色上，透明度約 14%）
- **提示詞**：

> Seamless aged Chinese handmade paper texture, subtle fiber grain and faint
> blotches, warm ochre beige, very low contrast, no text, no borders,
> no decorative patterns. Flat scan, even lighting.

### 5. `editorial_grain.png` — 紙紋（`editorial` 編輯刊物）

- **尺寸**：1920 × 1080 px（透明度約 10%）
- **提示詞**：

> Seamless subtle uncoated paper grain texture, very fine fibers, warm off-white,
> extremely low contrast, flat scan, even lighting, no text, no pattern.

### 6. `midnight_glow.png` — 地平線光暈（`midnight` 深夜舞台）

- **尺寸**：1920 × 1080 px（透明背景，底部發光）
- **提示詞**：

> Abstract stage lighting glow, warm gold light rising from the bottom edge of
> the frame, fading smoothly upward into deep navy darkness, very soft and
> diffuse, cinematic, no objects, no text, no lens flare streaks.
> Subtle film grain. Transparent above the glow.

---

## 第三批：未來風格（清單定案後再做）

| 風格 | 需要的圖 | 提示詞方向 |
|---|---|---|
| `geo` 幾何構成 | 無需生圖 | 純 CSS 色格即可（已驗證） |
| `counsel` 顧問報告 | 無需生圖 | 圖表由 HTML/SVG 畫，資料要真 |
| `riso` 孔版小誌 | `riso_halftone.png` | 半色調網點紙質，灰白，低對比 |
| `bento` 便當格 | 無需生圖 | 卡片系統由 CSS 完成 |
| `broadsheet` 號外 | `broadsheet_noise.png` | 印刷雜訊，近黑，極低透明度 |
| `swiss` 瑞士網格 | 無需生圖 | 純幾何與字（已驗證） |

---

## 注意事項

- **生圖工具選擇**：NotebookLM 的 clay/brick 是 Google 產品內建樣式，**只學做法
  （低飽和多色粉彩、物件組合），不要直接複製其素材或提示詞**。
  建議用可商用授權的生圖服務，或本機模型。
- **一致性**：同一風格的多張圖要**同一顆種子或同一批次**產生，否則光源與色調會不一致，
  就違反規則 1 與 2，「融入」會失敗。
- **檔案大小**：單張不要超過 800 KB，總計不要超過 4 MB（repo 是公開的）。
- **授權**：若生圖服務聲明產出物可商用，請把該聲明記在這裡，方便日後查核。
