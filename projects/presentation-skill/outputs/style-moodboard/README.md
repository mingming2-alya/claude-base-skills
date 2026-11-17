# 風格意象圖（第三輪，2026-11-17）

十個方向各一張意象圖。清單與取捨理由在 [`inputs/style-list-v3.md`](../../inputs/style-list-v3.md)。

| 檔案 | 用途 |
|---|---|
| `index.html` | 審閱頁：每張圖附定位、適合場合、調性、色系、畫面語言、題材與來源 |
| `overview.jpg` | 十張並排總覽 |
| `img/*.jpg` | 十張意象圖，1920 × 1080 |
| `src/*.html` | 每張圖的原始檔。文字是真文字，圖像以 HTML、CSS、SVG 繪製 |
| `render.cjs` | 把 `src/` 渲染成 `img/`，同時重建 `overview.jpg`；也會檢查文字溢出與字體載入 |
| `measure.py` | 量十張的調色盤，列出兩兩最接近的配色距離 |
| `overview.html` | 產生總覽圖用的排版頁 |

重繪全部：

```bash
node render.cjs
```

只重繪某幾張，例如紙黏土與積木：

```bash
node render.cjs clay brick
```

檢查配色距離：

```bash
python3 measure.py
```

字體從 Google Fonts 載入，需要網路。本輪沒有生圖待辦。
