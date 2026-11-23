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
- **嚴禁文字**：畫面中不可出現可讀文字、字母或數字（所有文字皆由 HTML 層承載，便於日後修改與通過像素對比）。
- **反左右割裂構圖（關鍵！）**：撰寫生圖提示詞時，**嚴禁使用「left 60% ... right 40% ...」或「split composition」**（生圖模型會畫出僵硬的垂直拼貼分割線）。一律描述**單一連續自然空間**，用物理站位讓出文字安全區（例如 `"artisan bread positioned in the lower-right corner of a single continuous dark oak table; the expansive upper and left areas remain calm shadowed oak and soft out-of-focus dark slate wall"`）。
- **文字安全區**：標註為文字區的範圍請保持同源素面底材（不放主角或高反差雜物，不硬切白框）；深色攝影封面可由 HTML 層疊加平滑單向 scrim 確保像素 WCAG ≥ 4.5:1。
- **光源與色調**：與該風格的明暗（`light`／`dark`）及選定配色維持一致；深色版切記「變暗不等於夜晚」，非夜間題材不畫星月。

## 可升級頁面清單

| 頁碼 | 插槽檔名（放 `assets/`） | 明暗 | 構圖與文字留白區 | 建議提示詞（英文較佳，單一連續場景） |
|---|---|---|---|---|
| 第 X 頁 | `<slot>-light.jpg` | light | 下方 45% 為主體場景，上方 45% 為同材質素面留白放標題與兩層站點標 | `Single continuous wide editorial diorama, ... positioned across the lower foreground, expansive calm sunlit plaster wall across the upper area, 16:9, no legible text, no letters, no split screen` |
