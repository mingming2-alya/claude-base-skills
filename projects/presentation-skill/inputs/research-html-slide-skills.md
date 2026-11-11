# 研究筆記：市面上的簡報 Skill（2026-11-09）

> 方法：GitHub 搜尋（`gh search repos`）＋兩份整理清單（ToseaAI/awesome-html-slide-skills、nickylin/awesome-html-ppt）交叉比對，再由 3 個子代理讀各 repo 的 SKILL.md 與參考檔（raw.githubusercontent.com）。星數為 2026-11-09 的數字。
> ⚡ = 跟「讓畫面活起來」直接相關。

## 起點：使用者原本用的 codex-ppt-skill（ningzimu/codex-ppt-skill，7.8k）

- 每頁都是 gpt-image 生成的一整張 16:9 圖，文字與背景一起畫出來，所以有說故事感；組裝成 PPTX，頁面元素不可編輯。
- 流程有核准關卡：大綱 → 2–3 種風格方向 → 確認生圖後端 → **一張樣張** → 全部生成（每頁一個子代理）→ QA → 講稿與 PPTX。
- 明確禁止用 HTML、python-pptx 等方式替代生圖。
- 使用者的感受：畫面是自己做不到的，但不會動；HTML 動態豐富，但畫面不夠活。

## Top 11（以 HTML 為輸出）

| # | Repo | ⭐ | 獨有亮點 |
|---|---|---|---|
| 1 | zarazhangrui/frontend-slides | 32.1k | 三選一樣張（穩健＋大膽＋驚喜），用使用者的真實標題與 logo；只問「上台講或給人讀」決定密度；內建 `E` 鍵編輯模式 |
| 2 | op7418/guizang-ppt-skill | 29.5k | ⚡ WebGL Shader 背景，一般頁蓋 78% 遮罩、Hero 頁降到 12–16%，每 3–4 頁一個 Hero；30fps、自動降解析度、凍結成靜態；⚡ 生圖先定版位再生成、留疊字空間；雙螢幕講者模式 |
| 3 | alchaincyf/huashu-design | 29.0k | 強制三方向關卡（大師視角／得獎作品／隨機風格庫各 2 個候選）；外觀帳本避免重複；⚡ 先做「探針圖」、Dashboard＋電影式疊層 |
| 4 | nicobailon/visual-explainer | 10.9k | ⚡ 會動的解說圖（事件重播、可調參數的圖）；頁面可收集讀者決策回傳 agent；每種版型有容量上限，超過就加頁不刪內容 |
| 5 | chuspeeism/dashi-ppt-skill | 10.5k | 每頁 4 個版本（3 模板＋1 agent 自訂）；產出是帶滑桿的編輯器；殘留模板文字就強制重做，最多修 2 輪 |
| 6 | open-slide/open-slide | 9.7k | ⚡ Magic Move 形變（只用於狀態延續）；在畫面上點選留言、agent 一次改完；動畫規則克制（預設無轉場、200–280ms） |
| 7 | lewislulu/html-ppt-skill | 9.0k | ⚡ 20 種 Canvas 特效（物理知識圖譜等），進頁啟動離頁停止；iframe 講者預覽 |
| 8 | zarazhangrui/beautiful-html-templates | 5.0k | 模板依「調性」分類，附 `avoid_for`；缺版型時用同一視覺語言從頭設計，不准混用 |
| 9 | arcsin1/oh-my-ppt | 2.5k | （桌面 App，不是 Skill）AI 逐頁判斷要不要主視覺、保留文字安全區；PPTX 雙向轉換 |
| 10 | bangtutorial/bang-motion | 1.9k | ⚡ 反投影片自我檢查（≥3 個淡入淡出 section 就算投影片）；背景永遠不准靜止；所有畫面是時間軸的函數，可精準匯出 MP4 |
| 11 | stackblitz/bolt-slides | 1.2k | 註記錨定在內容上，版面重排後仍圈住同一個數字；炫技版型有「入場條件」 |

（hugohe3/ppt-master 75k 星，但輸出原生 PPTX，不列入 HTML 類。）

## 跟「活」強相關的三個

| Repo | ⭐ | 獨有亮點 |
|---|---|---|
| gongnyang/awesome-html-scrolline-deck | 104 | ⚡⚡ 沒有換頁只有交棒：上一段的元素飛到下一段變成新元素；6 種概念包規定鏡頭語法；確定性時間軸，捲動、按鍵、MP4 畫面一致 |
| borjaperfra/beatdeck | 236 | ⚡ 跨場景常駐圖層；唯一的動畫規則「禁止疊化」：離場先走且快，進場後到且慢；內容稽核表證明沒有遺漏 |
| Jane-xiaoer/paper-collage-ppt | 69 | ⚡ 強制 `steps()` 逐格定格動畫；文字是內容、插畫是氣氛，拿掉插畫也要成立；先鎖配色再生圖，第一張圖鎖定為風格錨點 |

## 追加研究（2026-11-09）

**greensock/gsap-skills（18.1k）**：GSAP 官方 8 個技能（core、timeline、scrolltrigger、plugins、utils、react、frameworks、performance）。不產生簡報，而是教 agent 把動畫寫對：SplitText、DrawSVG、MorphSVG、Flip 的正確用法；每個技能都有「❌ 禁止清單」；用 `gsap.matchMedia()` 處理減少動態效果。已收錄在本 repo 的 `skills/gsap-*`。

**ASCII 動畫庫（限可放進網頁者）**：asciinema-player（2.9k，播放真文字的終端錄影）、Ascii-Motion（936，ASCII 版 After Effects，有 MCP Server、可匯出 React/HTML，MIT＋專有雙授權）、emilwidlund/ASCII（214，three.js GPU ASCII 濾鏡）。功能最完整但星數低的是 textmode.js（175，WebGL2）。

## 共通觀察

1. 「活」有三條路：背景會動、元素跨頁延續、動得有個性。
2. 好的 Skill 都在限制 AI（入場條件、反投影片檢查、禁止疊化、外觀帳本），而不是給更多選項。
3. 大部分 Skill 把力氣花在單頁好不好看，幾乎沒有人處理「思緒上的銜接」，這是 deck-architect 的切入點。
