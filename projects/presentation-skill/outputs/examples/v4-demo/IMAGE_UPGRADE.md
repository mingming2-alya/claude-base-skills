# 可選 AI 升級生圖清單（IMAGE_UPGRADE）

> 本簡報已以**零等待程式版（HTML／CSS／SVG）**完成並通過 `check.mjs` 全頁像素級對比檢查（最低對比 4.81:1），現在就能直接播放。
> 若想將第 4 頁的門市節奏插畫升級成更細膩的 AI 生圖或實體門市攝影，請將 **16:9、1920×1080 以上、無文字** 的圖檔放進 `assets/`，再執行：
>
> ```bash
> python3 ../../deck-architect/scripts/assemble.py storyboard.yaml
> node ../../deck-architect/scripts/check.mjs deck.html
> ```
>
> 系統會自動把底圖換進 `.asset-slot[data-slot="bakery-flow"]`，**保留所有 HTML 真文字層、導航與互動**，並重新驗證像素對比。

## 可升級插槽

| 頁碼 | 檔名（放 `assets/`） | 明暗 | 構圖與文字留白區 | 建議提示詞 |
|---|---|---|---|---|
| 第 4 頁 | `bakery-flow-light.png` | light | 上方 62% 留暖米紙素面（`#F1EFEA`）放主標題與三張步驟卡片；下方 38% 橫跨全幅呈現由左至右三個極簡烘焙工作站（烤爐 → 櫃檯收銀 → 新鮮麵包籃），左上柔光 | `Minimalist editorial architectural illustration of a modern bakery workflow spanning the bottom 38% of a 16:9 frame: oven station on left, clean counter POS in center, woven artisan bread basket on right, muted forest green (#0D6B4F) and warm bread tones on warm off-white paper (#F1EFEA). Upper 62% is clean uninterrupted warm paper negative space for text. Soft top-left light, flat geometric clarity, no legible text, no letters, no numbers.` |
