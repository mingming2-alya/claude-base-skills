# 風格意象圖（第四輪，2026-11-17）

十四款風格各一張意象圖；插畫場景與積木構成各多畫一種變體。清單與取捨理由在 [`inputs/style-list-v4.md`](../../inputs/style-list-v4.md)。上一輪的十款在 [`../style-moodboard/`](../style-moodboard/)。

| 檔案 | 用途 |
|---|---|
| `index.html` | 審閱頁：每款附一句話定位、適合場合、調性、畫面語言、題材與來源；變體以縮圖並列 |
| `overview.jpg` | 十四款並排總覽（只放每款的主圖） |
| `img/*.jpg` | 十六張意象圖，1920 × 1080 |
| `src/*.html` | 原始檔。文字是真文字，圖像以 HTML、CSS、SVG 繪製 |
| `src/blocks.js` | 積木構成兩種變體共用的等角積木繪製程式；`window.MATERIAL` 切換霧面木或亮面塑膠 |
| `render.cjs` | 把 `src/` 渲染成 `img/`，同時重建 `overview.jpg`；會檢查文字溢出與字體載入 |
| `measure.py` | 量調色盤，列出跨款最接近的配色距離（同一款的變體不比） |
| `overview.html` | 產生總覽圖用的排版頁 |

沿用上一輪的四款（書卷刻本、顧問報告、孔版小誌、摩登金）與紙黏土原樣複製進來，只改了檔名編號。

重繪全部：

```bash
node render.cjs
```

只重繪某幾張：

```bash
node render.cjs apple tech
```

檢查配色距離：

```bash
python3 measure.py
```

字體從 Google Fonts 載入，需要網路。攝影雜誌的照片是程式模擬；正式使用時換成真實照片，由使用者提供。
