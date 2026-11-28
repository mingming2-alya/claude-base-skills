# 品管報告：deck.html

後端：chromium-cdp｜共 8 頁（`?still=1` 靜態定格實測），截圖在 `check/`。全簡報最低文字對比：4.70:1。

## 自動靜態檢查：全部通過

接著請逐張看截圖（含步進分鏡條），確認美感、去贅字程度、斷行與主標題階層符合預期。

## 視覺圖解密度觀測（Liveliness Telemetry · `stage_mode=pitch`）
- 視覺／圖表／互動頁佔比：**4/5（80%）**（參考基準 ≥ 55%）
- 已啟用動態與互動原語（不設湊種類配額）：**8 種**（data-wipe、data-focus-plan、data-count、data-transform-at、data-draw、data-grow、data-morph、interactive-module）
- 風格動態觀測（`apple` 招牌原語：split-mask、spotlight-sweep、depth-deck、colorize-wipe）：用到 **0/4**
- ✅ 達標：視覺圖解佔比與連續頁節奏符合場合基準。

## 動態互動檢核（`--motion`）
- ✅ 連按打斷測試（4 次／180ms）：通過（精準落於第 5 頁，無殘留 clone、壓暗與鎖死）
- ✅ WAAPI fill:forwards 防鎖死檢核（shock 黑幕中斷（第 5 頁）、iris 回翻重進（第 4 頁））：通過（零黑幕／零裁剪歸零／零殘留動畫）
- ✅ 跨頁 Magic Move（第 3 ↔ 4 頁 `hero-rate`）：通過（飛行中 clone=1，落地清理完整）
- ✅ 現場互動試算（第 6 頁滑桿）：通過（點擊不誤翻頁、即時重算數值）
- ✅ 低耗電靜態凍結（B 鍵模式）：通過（開關與還原正常）
- ✅ 附件點入與返回（第 3 頁 → `model`）：通過
- ✅ 視覺指引聚光壓暗／因果演變（第 2 頁、第 3 頁、第 4 頁、第 6 頁、第 7 頁）：通過（演繹期間明確聚焦，結束 100% 復原零殘留）
- ✅ 引導線與描繪原語檢核（9 條 SVG 描線／10 處方向揭露）：通過（零退化 SVG 縮放／零無效容器描線）
- ✅ 導航模式（top-bar｜實測 inline）與自動隱藏底控膠囊：通過（頁碼 07 / 07、浮現與自動收合正常）
- ✅ Layer 1 講者臨場工具（總覽矩陣 G（含縮圖樣式保真）、畫筆標註 A 與雷射筆 L、雙螢幕講者同步 S）：通過（快捷鍵鎖定與 Esc 層級退出正常）
- ✅ 閱讀期靜止檢核（反永動干擾／畫完就安靜）：通過
- ✅ 390px 手機縮放與控制條實測（橫向溢出 0px、舞台 390px、控制條 374px 零裁切）：通過
- ✅ 活頁列印事件測試（beforeprint / afterprint）：通過

## 可升級圖像插槽
- 第 1 頁：cover-photo
- 第 4 頁：bakery-clay
