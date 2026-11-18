# 風格意象圖（第五輪，2026-11-18）

十二款風格，三款可切換畫風。清單與調整理由在 [`inputs/style-list-v5.md`](../../inputs/style-list-v5.md)；上一輪在 [`../style-moodboard-v4/`](../style-moodboard-v4/)。

| 檔案 | 用途 |
|---|---|
| `index.html` | 審閱頁；有多種畫風的款式可點按鈕切換大圖 |
| `overview.jpg` | 十二款並排總覽（每款一張主圖） |
| `img/*.jpg` | 十八張意象圖，1920 × 1080 |
| `src/*.html` | 原始檔。文字是真文字，圖像以 HTML、CSS、SVG 繪製 |
| `src/blocks.js` | 3D 積木的等角繪製程式，`window.MATERIAL` 切換木或塑膠 |
| `render.cjs` | 渲染 `src/` 成 `img/`，並重建 `overview.jpg`；檢查文字溢出與字體載入 |
| `measure.py` | 跨款配色距離（同一款的不同畫風不比） |

新畫或重做：`01c` 霓虹、`02a` 2D 幾何、`03a` 黑白水墨、`03b` 厚油彩、`06` 顧問報告、`09` 日常工作款、`10` 攝影雜誌。其餘沿用第三、第四輪。

重繪全部：

```bash
node render.cjs
```

只重繪某幾張：

```bash
node render.cjs photo counsel
```

字體從 Google Fonts 載入，需要網路。攝影雜誌的畫面是程式模擬。
