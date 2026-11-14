# 風格樣張

## 風格是什麼、不是什麼

**風格只管顏色、字體、質感、動態的手感。風格不決定東西放在哪裡。**

排版是另一件事：逐頁依內容從版型庫選（見 `layouts.md`），在關卡二的第一步就定了。所以到這一步，三個風格樣張的排版是一樣的，使用者只需要比較「感覺」。

> 教訓：曾經把排版寫進風格檔，讓每個風格有自己的版面。使用者的回饋是「排版不應該跟風格綁定」。現在風格檔只放變數。

## 為什麼用樣張

讓使用者「看」來選，而不是「描述」來選。大部分人說不出自己要什麼風格，但一眼就認得出喜歡哪個。

## 怎麼挑三個方向

- **穩健**：最符合 brief 調性、最不會出錯
- **大膽**：同樣適合內容，但更有個性、更搶眼
- **驚喜**：使用者可能沒想過、但說得出理由

三個方向要在**明暗、字體的聲音、色彩的溫度**上都拉開：通常一淺一深，再加一個質感不同的。兩個淺色、同樣用黑體的風格並排，使用者會覺得沒得選。

依**調性**挑，不要依產業挑。完整的調性資料在 `themes/index.json`（mood、formality、scheme、density、best_for、avoid_for）。

| 風格 | 調性 | 適合 | 避免用在 |
|---|---|---|---|
| `editorial` 編輯 | 知性、沉穩、雜誌感。襯線展示字、米灰紙色、故宮朱 | 年度成果、經驗分享、科普、策略說明 | 需要強烈科技感或極度活潑的場合 |
| `swiss` 瑞士 | 理性、俐落、可信。大字變細、髮絲線、克萊因藍 | 會議、提案、客戶洽談、數據與進度回報 | 情感型、需要人味的主題 |
| `midnight` 深夜 | 高級、有份量。深墨底、地平線光暈、暖金 | 發表會、活動開場、高階主管場合 | 明亮會議室長時間閱讀、資訊密度高的會議 |
| `broadsheet` 號外 | 大膽、直接、新聞感。超大粗黑體，封面與結尾整頁換成火橘 | 要被記住的提案、內部推廣、觀點分享 | 正式財報、需要低調的場合 |
| `washi` 和紙 | 溫暖、手作、有人味。楷體、和紙底、卡片是手剪的紙片、藍染靛 | 經驗分享、個人成長、科普、文化與教育 | 數據密集的會議、極度正式的場合 |

`wireframe` 不是風格：它是排版選單用的灰階，不要當成品使用。

舊名稱仍可使用：`paper` → editorial、`signal` → swiss、`ink` → midnight。

## 產生樣張

```bash
python3 <skill>/scripts/build.py decks/<name>/storyboard.yaml --samples swiss:穩健,broadsheet:大膽,washi:驚喜
```

樣張用使用者真實的標題與內容，以及已選定的排版。每個方向三張：封面、招牌頁（第一個 `point`、`number` 或 `stats` 頁）、再一頁不同版型的內容頁（有震撼頁就用震撼頁）。要換頁面就加 `--sample-pages 1,3,5`。冒號後面寫角色，會和風格的中文名稱一起顯示在樣張上。

樣張建議 3–4 頁，超過 4 頁每格會太小。要包含一頁有色塊的排法（例如對比、數字卡、橫帶），因為風格的差別在色塊上最明顯。產生後自己截圖看一次，再給使用者，請他選一個，或說明要怎麼混搭。

## 自訂風格

風格是一個 CSS 檔，**只有變數**。做法：

1. 複製最接近的風格到 `decks/<name>/theme.css`（混搭「A 的配色 + B 的字體」時，複製 A，再把字體變數換成 B 的）
2. 修改變數
3. 在 storyboard 寫 `meta.theme: ./theme.css`（相對於 storyboard 的路徑）

**不要在風格檔裡寫任何會移動東西的規則**（位置、欄數、對齊、大小）。想要不同的排法，去版型庫選，或照 `layouts.md`「新增一種排法」加進版型庫，讓每個風格都能用。

**第一行註解要寫 `@fonts family=...`**（Google Fonts 的 family 參數），build 會自動載入這些字體。也要寫一句**色彩理由**：為什麼是這個顏色？寫不出來，代表你在套公式。

變數契約（沒有標「選用」的都要定義）：

```css
:root {
  /* 表面與文字：三階文字色在 --bg 上都要達到 4.5:1；--fg-2 在 --bg-2 上也要達到 */
  --bg: ; --bg-2: ;
  --fg: ; --fg-2: ; --fg-3: ;
  --line: ;            /* 強線（段落、表頭） */
  --line-2: ;          /* 弱線（列分隔），通常是 fg 的 12–18% 透明度 */
  /* 突出色：用途固定（重點、數字、條列記號、唯一被強調的項目） */
  --accent: ;          /* 色塊、短線 */
  --accent-text: ;     /* 重點字的顏色（在 --bg 與 --bg-2 上都要 4.5:1） */
  --accent-ink: ;      /* 放在 --accent 色塊上的文字（4.5:1） */
  /* 重點字在色塊上的顏色。重點一律用顏色表示，不畫底線，所以色塊上需要另一個顏色 */
  --em-on-accent: ;    /* 在 --accent 色塊上的重點字：要和 --accent-ink 明顯不同，且在 --accent 上 3:1 以上 */
  --em-on-ink: ;       /* 在墨色橫帶（底色是 --fg、文字是 --bg）上的重點字 */
  --shock-bg: ; --shock-fg: ; --shock-em: ;   /* 震撼頁的底色、文字、重點字 */
  /* 三種字體聲音 */
  --font-display: ; --font-quote: ; --font-number: ;
  --font-body: ;       /* 拉丁字體放前面，中文字體放後面 */
  --font-label: ;      /* 框架字：頁碼、標籤、來源 */
  --display-weight: ; --title-weight: ; --quote-weight: ; --number-weight: ; --numeral-weight: ;
  --display-tracking: ; --title-tracking: ; --label-tracking: ;   /* 中文用 0 或接近 0 */
  /* 質感 */
  --radius: ;          /* 建議 0 */
  --grain: ; --grain-blend: ;      /* 淺色 multiply .08–.13；深色 screen 或 overlay .08–.12；0 為關閉 */
  --surface: ;         /* 背景光層或紙紋，可為 none。不可以有穿過文字的線條或圖形 */
  --enter-easing: ;    /* 進場緩動，例如 cubic-bezier(.16,1,.3,1)；steps(5) 會變成逐格貼上 */
}
```

選用變數：

- `--cover-bg`、`--cover-fg`、`--cover-fg-2`、`--cover-fg-3`、`--cover-line`、`--cover-accent`：封面與結尾的環境色。`--cover-accent` 是封面上重點字的顏色，要和 `--cover-fg` 不同
- `--em-on-cover-ink`：封面與結尾的反白色塊（底色是 `--cover-fg`）上的重點字；沒寫就用 `--em-on-ink`
- `--frame`：內縮 36px 的髮絲框顏色
- 卡片表面（所有「卡片」類排法共用）：`--card-bg`、`--card-line`、`--card-tilt`（傾斜角度）、`--card-shadow`（drop-shadow）、`--card-clip`（clip-path，例如手剪的邊緣）。沒寫就是 `--bg-2` 底、細線框、不傾斜、沒有陰影

做完後，用這個風格建一次版型型錄，並跑 `check.mjs`。它會檢查每一種排法上的文字對比，對比不足的地方會逐行列出：

```bash
python3 <skill>/scripts/catalogue.py /tmp/catalogue --theme decks/<name>/theme.css
node <skill>/scripts/check.mjs /tmp/catalogue/deck.html
```

**禁用**（研究顯示這些是「AI 模板」的訊號，或是使用者明確不要的）：

- 用 Inter、Roboto、Space Grotesk、Playfair Display 當展示字
- 紫色漸層、#6366f1
- 純白 #FFF 或純黑 #000 背景
- 裝飾性陰影、圖片加粗框
- 重點字畫底線或用斜體
- 浮水印大字、穿過文字的網格線、任何壓在文字上或墊在文字後面的裝飾線條與圖形
