# 三種風格樣張

## 為什麼用樣張

讓使用者「看」來選，而不是「描述」來選。大部分人說不出自己要什麼風格，但一眼就認得出喜歡哪個。

## 怎麼挑三個方向

三個方向要**真的不同**：不同的明暗、不同的字體聲音、不同的突出色用法。不要給三個只差顏色的版本。

- **穩健**：最符合 brief 調性、最不會出錯
- **大膽**：同樣適合內容，但更有個性、更搶眼
- **驚喜**：使用者可能沒想過、但說得出理由

依**調性**挑，不要依產業挑。完整的調性資料在 `themes/index.json`（mood、formality、scheme、density、best_for、avoid_for）。

| 主題 | 調性 | 適合 | 避免用在 |
|---|---|---|---|
| `editorial` 編輯 | 知性、沉穩、雜誌感。襯線展示字、米灰紙色、故宮朱 | 年度成果、經驗分享、科普、策略說明 | 需要強烈科技感或極度活潑的場合 |
| `swiss` 瑞士 | 理性、俐落、可信。大字變細、髮絲線、12 欄網格紋理、克萊因藍 | 會議、提案、客戶洽談、數據與進度回報 | 情感型、需要人味的主題 |
| `midnight` 深夜 | 高級、有份量。深墨底、地平線光暈、內縮髮絲框、暖金 | 發表會、活動開場、高階主管場合 | 明亮會議室長時間閱讀、資訊密度高的會議 |
| `broadsheet` 號外 | 大膽、直接、新聞感。超大粗黑體，封面與結尾整頁換成火橘 | 要被記住的提案、內部推廣、觀點分享 | 正式財報、需要低調的場合 |
| `washi` 和紙 | 溫暖、手作、有人味。楷體、剪紙卡片、逐格貼上的進場、藍染靛 | 經驗分享、個人成長、科普、文化與教育 | 數據密集的會議、極度正式的場合 |

舊名稱仍可使用：`paper` → editorial、`signal` → swiss、`ink` → midnight。

## 產生樣張

```bash
python3 <skill>/scripts/build.py decks/<name>/storyboard.yaml --samples swiss:穩健,broadsheet:大膽,washi:驚喜
```

樣張用使用者真實的標題與內容，每個方向三張：封面、招牌頁（第一個 `point`、`number` 或 `stats` 頁）、再一頁不同版型的內容頁（有震撼頁就用震撼頁）。要換頁面就加 `--sample-pages 1,3,5`。冒號後面寫角色，會和主題的中文名稱一起顯示在樣張上。

**三個方向要在內容頁上也看得出差別**，不只是封面。兩個淺色主題並排時，內容頁容易看起來很像；通常一淺一深再加一個質感不同的，差別最清楚。打開 `samples.html` 給使用者看，請他選一個，或說明要怎麼混搭。

## 自訂主題

主題是一個 CSS 檔，主要是變數，另可附少量招牌樣式（例如 washi 的剪紙卡片）。做法：
1. 複製最接近的主題到 `decks/<name>/theme.css`
2. 修改變數
3. 在 storyboard 寫 `meta.theme: ./theme.css`（相對於 storyboard 的路徑）

**第一行註解要寫 `@fonts family=...`**（Google Fonts 的 family 參數），build 會自動載入這些字體。也要寫一句**色彩理由**：為什麼是這個顏色？寫不出來，代表你在套公式。

變數契約（全部都要定義）：

```css
:root {
  /* 表面與文字：三階文字色在 --bg 上都要達到 4.5:1 */
  --bg: ; --bg-2: ;
  --fg: ; --fg-2: ; --fg-3: ;
  --line: ;            /* 強線（段落、表頭） */
  --line-2: ;          /* 弱線（列分隔、框架），通常是 fg 的 12–18% 透明度 */
  /* 突出色：用途固定（重點、數字、條列記號、唯一被強調的項目） */
  --accent: ;          /* 色塊、短線 */
  --accent-text: ;     /* 小字用的突出色（在 --bg 上 4.5:1） */
  --accent-ink: ;      /* 放在 --accent 色塊上的文字（4.5:1） */
  --shock-bg: ; --shock-fg: ;
  /* 三種字體聲音 */
  --font-display: ; --font-quote: ; --font-number: ;
  --font-body: ;       /* 拉丁字體放前面，中文字體放後面 */
  --font-label: ;      /* 框架字：頁尾、頁碼、標籤、來源 */
  --display-weight: ; --title-weight: ; --quote-weight: ; --number-weight: ; --numeral-weight: ;
  --display-tracking: ; --title-tracking: ; --label-tracking: ;   /* 中文用 0 或接近 0 */
  /* 質感 */
  --radius: ;          /* 建議 0 */
  --grain: ; --grain-blend: ;      /* 淺色 multiply .08–.13；深色 screen 或 overlay .08–.12；0 為關閉 */
  --ghost: ;           /* 章節浮水印透明度 .03–.05 */
  --surface: ;         /* 背景光層或紋理，可為 none */
  --enter-easing: ;    /* 進場緩動，例如 cubic-bezier(.16,1,.3,1)；steps(5) 會變成逐格貼上 */
}
```

選用變數：
- `--cover-bg`、`--cover-fg`、`--cover-fg-2`、`--cover-fg-3`、`--cover-line`、`--cover-accent`：封面與結尾的環境色
- `--frame`：內縮 36px 的髮絲框顏色

做完後用 `check.mjs` 跑一次，它會檢查文字對比，對比不足的地方會逐行列出。

**禁用**（研究顯示這些是「AI 模板」的訊號）：
- 用 Inter、Roboto、Space Grotesk、Playfair Display 當展示字
- 紫色漸層、#6366f1
- 純白 #FFF 或純黑 #000 背景
- 裝飾性陰影、圖片加粗框
