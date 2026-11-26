# 品管報告：deck.html

後端：chromium-cdp｜共 9 頁（`?still=1` 靜態定格實測），截圖在 `check/`。全簡報最低文字對比：5.12:1。

## 自動靜態檢查：全部通過

接著請逐張看截圖，確認美感、去小字程度、斷行與主標題階層符合預期。

## 生動度與反單調體檢（Liveliness Audit · `stage_mode=pitch`）
- 視覺／圖表／互動頁佔比：**4/7（57%）**（標準 ≥ 55%）
- 動態與互動原語多樣性：**16 種**（ruler-progress、bento-expand、rank-race、odometer、rack-focus、data-focus-plan、data-draw、data-grow、data-count、data-step、split-mask、spotlight-sweep、depth-deck、colorize-wipe、popup-fold、chat-replay；標準 ≥ 2 種）
- 風格契合（`counsel` 招牌動態：rank-race、odometer、rack-focus）：用到 **3/3**（rank-race、odometer、rack-focus）
- ✅ 達標：視覺豐富度與節奏變化符合此場合標準。

## 動態互動檢核（`--motion`）
- ✅ 連按打斷測試（4 次／180ms）：通過（精準落於第 5 頁，無殘留 clone、壓暗與鎖死）
- ✅ 低耗電靜態凍結（B 鍵模式）：通過（開關與還原正常）
- ✅ 視覺指引聚光壓暗／因果演變（第 4 頁）：通過（演繹期間明確聚焦，結束 100% 復原零殘留）
- ✅ 引導線與描繪原語檢核（1 條 SVG 描線／0 處方向揭露）：通過（零退化 SVG 縮放）
- ✅ 單頁明暗極性 data-surface（light／split／dark）：通過（變數與舞台外殼極性同步切換）
- ✅ 導航模式（top-bar｜實測 top-bar／none）與自動隱藏底控膠囊：通過（頁碼 06 / 09、浮現與自動收合正常）
- ✅ 講者點擊步進 data-step（第 5 頁共 2 步）：通過（逐層揭曉／換幕退場／回翻落終態／靜態全展開）
- ✅ Layer 1 講者臨場工具（總覽矩陣 G、畫筆標註 A 與雷射筆 L、雙螢幕講者同步 S）：通過（快捷鍵鎖定與 Esc 層級退出正常）
- ✅ 閱讀期靜止檢核（反永動干擾／畫完就安靜）：通過
- ✅ 390px 手機縮放實測（橫向溢出 0px、舞台實寬 390px）：通過
- ✅ v4.7 風格動態套件實測（刻度尺推進（第 2 頁）、看板展開（第 2 頁）、排名超車（第 3 頁）、滾輪數字（第 3 頁）、推鏡景深（第 3 頁）、單次光掃（第 6 頁）、3D 景深疊卡（第 6 頁）、文字斬切（第 6 頁）、光掃上色（第 6 頁）、立體書翻折（第 7 頁）、對話劇院（第 7 頁））：通過（互動零誤翻、低耗電與靜態契約正常）
