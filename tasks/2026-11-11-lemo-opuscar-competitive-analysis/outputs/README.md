# 產出

## 交付物

- **競品分析報告**：[`docs/research/lemo-opuscar-competitive-analysis.md`](../../../docs/research/lemo-opuscar-competitive-analysis.md)（commit `9d8837c`）

## 中間產出

- [`competitor-profiles/`](competitor-profiles/)：五個子代理各自交回的競品調查報告（英文原文）。報告中提到的檔案路徑是當時 scratchpad 裡的 clone，session 結束後就不存在；要重查請用 `inputs/sources.md` 裡的 commit SHA 重新 clone。

## 給使用者的最終回覆（摘要）

- 報告位置與分支。只讀原始碼和文件，沒有實測成片品質和耗時。
- Lemo-Opuscar 是策展過的影片風格庫，不是渲染引擎：66 種風格各附 STYLE.md 和示範片，加上導演方法和全本地工具鏈；上線 46 天 1.46 萬星，日均漲星速度和兩大龍頭相當。
- 前五名競品：HyperFrames 82k、OpenMontage 79k、video-shotcraft 18.6k、remotion-dev/skills 6.8k、openfilm 5.7k，各附一句差異。
- 優勢：整片風格單位、全本地免金鑰聲音管線、明文導演方法；「純程式碼加高度風格策展」目前只有它一家。
- 缺口：只支援 Claude；沒有交付後編輯器和專業剪輯軟體匯出；沒有品牌擷取；一支片 30–60 分鐘和大量 token。
- 最值得警惕：OpenFilm（技術路線相同、補上缺口）和 video-shotcraft 系列（合計約 2.4 萬星，同搶華語使用者）。
- 提議可做成可分享的網頁。
