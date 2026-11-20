# 可選 AI 升級生圖清單（IMAGE_UPGRADE）

> 本簡報已以**零等待程式版（HTML／CSS／SVG）**完成並通過 `check.mjs` 對比與溢出驗證，現在就能直接播放。
> 若你想將下列插畫或攝影頁面升級成旗艦級 AI 生圖或真實照片，只需把圖檔放進 `assets/`，再執行：
>
> ```bash
> python3 <skill>/scripts/assemble.py storyboard.yaml
> node <skill>/scripts/check.mjs deck.html
> ```
>
> 系統會自動把底圖換進 `.asset-slot[data-slot="..."]`，**保留所有 HTML 真文字層、導航與動態**，並重新驗證像素級對比。

## 共同規格

- **比例與尺寸**：16:9，1920 × 1080 以上（PNG 或 JPG）。
- **嚴禁文字**：畫面中不可出現可讀文字、字母或數字（所有文字皆由 HTML 層承載）。
- **文字安全區**：標註為文字區的範圍請保持同源素面底材（不放主角或高反差雜物，不硬切白框）。
- **光源與色調**：與該風格的明暗（`light`／`dark`）及選定配色維持一致；深色版切記「變暗不等於夜晚」，非夜間題材不畫星月。

## 可升級頁面清單

| 頁碼 | 插槽檔名（放 `assets/`） | 明暗 | 構圖與文字留白區 | 建議提示詞（英文較佳） |
|---|---|---|---|---|
| 第 X 頁 | `<slot>-light.png` | light | 左上 45% 留素面底材放主標題與總結；物件從右、下、左三邊環繞 | `... 16:9, no legible text, no letters, clean negative space on upper-left ...` |
