# 狀態：presentation-skill（deck-architect）

> **最新接手點（2026-11-25｜Phase C.2 v4.4 底盤引擎與 7 項按需自動注入模組完成 ✅：`deck-architect` v4.4）**：
>
> 1. **五大 v4.4 引擎能力全數實作進輕底盤（`assets/shell.css`、`assets/runtime.js`、`scripts/assemble.py`、`scripts/deck_model.py`、`scripts/lint.py`、`scripts/check.mjs`）**：
>    - **單頁明暗極性 `data-surface`（`dark` / `light` / `split` / `photo`）**：內建 `--light-*`／`--dark-*` 安全 OKLCH 退路（`deck.css` 可覆寫），並透過 `#stage[data-active-surface]` 自動同步頂／側導航與外殼反差；支援 `storyboard.yaml` 單頁 `surface:` 欄位。
>    - **三種導航模式 `nav_mode`（`top-bar` / `minimal-side` / `divider-only`）＋全模式統一自動隱藏底控膠囊**：`keynote` 預設 `divider-only`（單頁可用 `data-nav="minimal-side"` 覆寫右側章節點錨點）；底部統一提供 2px 進度條＋滑鼠移近底邊 96px 浮現、2.2 秒淡出之 `#ctrl-bar`（含頁碼、步進、`N/B/F` 快捷鈕，`?still=1` 與列印完全隱藏）。
>    - **講者可控點擊步進 `data-step`（雙軌並行）**：支援累積揭曉（`data-step="1|2|3"`）與單頁換幕退場（`data-step-only` / `data-step-hide`），步進區塊內的 `data-draw`/`data-wipe`/`data-count` 延遲至該步點擊才觸發；往回翻進前頁落於該頁終態（step N），步進中按 `←` 逐層回退；`?still=1`／`B` 鍵／列印自動展開最終態。
>    - **外連影音控制原語（`<video data-slide-video>` / `<audio data-sound-demo>`）**：`assemble.py` 絕不將大影音轉 Base64（僅內嵌 `poster` 海報圖），翻頁／靜態自動停播歸零；音檔自動渲染 36 條動態波形與 A/B 互斥播停。
>    - **HTML5 原生活產品流程輪播卡（`[data-flow-carousel]`）與 3D 照片輪播（`[data-coverflow]`）**：純 GPU 變形與互動隔離，零肥大 MP4、支援自動輪播／點擊切換／靜態展開。
> 2. **全面模組化按需自動注入（7 項可選模組，未用到 0 KB）＋ Step 1 對齊強化**：
>    - 依使用者指示盤點全部現有與新增能力，將 **7 項模組**拆成按需掃描注入（`components`、`ambient-fx`、`live-controls`、`fit`、`media`、`flow-carousel`、`coverflow`），透過 `#stage` 生命週期事件解耦，未用到即 0 KB（實測 `v4-alive-demo` 省下 **48.7 KB**、`v4-demo` 省下 **35.7 KB**、`v44-keynote-demo` 省下 **18.3 KB**）。
>    - 同步強化 `references/grill.md` 與 `templates/brief.md`：Step 1 Grill 必須把具體需求與呈現期待對齊到明確的按需模組清單，讓 Step 2／4 精準啟用不盲目堆疊。
> 3. **11 項自動實測＋三範例全綠＋重打包驗證**：
>    - `scripts/check.mjs --motion` 由 7 項擴充至 **11 項**（新增 `data-surface`、`nav_mode`/底控、`data-step`、外連影音離頁歸零與原生輪播切換），並修正隱藏祖先元素誤報小字與 `shell.css` 註解內 `*/` 截斷 reset 的關鍵 bug。
>    - 全新虛構旗艦範例 `outputs/examples/v44-keynote-demo/`（7 頁＋12.5 KB 合成 WebM＋2 支 31.3 KB 實測 WAV）`lint.py` 0 錯 0 警、`check.mjs --motion` 7 頁靜態（最低 `4.53:1`）＋全項動態全 ✅ 且逐頁目視截圖通過；既有 `v4-alive-demo`（最低 `4.70:1`）與 `v4-demo`（最低 `4.81:1`）全數零回歸通過；重打包 `outputs/deck-architect.skill`（38 檔，166.3 KB，零 `__pycache__`）。
>
> **下一步（Phase C.2 收官驗收 → Phase D）**：以升級後完整的 `deck-architect` v4.4 進行真實簡報 PK 複驗（由使用者指定題材或沿用 Phase C 案例重構驗證），確認滿意後推進 **Phase D｜補齊其餘 8 款 Style DNA 與主題智能配對**。
>
> 主軸文件是 `ROADMAP.md`，執行紀錄在 `LOG.md`，專案規則在根目錄 `CLAUDE.md`。

_最後更新：2026-11-25_

## 新對話先做的事

1. 確認在 `presentation-skill-generation` 分支：`git branch --show-current`。不在的話先 `git fetch origin presentation-skill-generation && git checkout presentation-skill-generation`。
2. 讀這份檔案與 `ROADMAP.md`。需要背景時，再讀 `LOG.md` 的最後幾段。
3. 守住 `CLAUDE.md` 的三條規則：
   - 每個段落結束就同步：`STATUS.md`、`LOG.md`、commit、push。
   - Stop hook 會檢查有沒有沒推的變更。
   - **所有要問使用者的問題一律用互動表單（AskUserQuestion）**。每題能單獨看懂，題目互不依賴，一題最多 4 個選項，推薦的放第一個並標「（推薦）」。
4. 驗證腳本 `scripts/check.mjs` 已支援 Playwright 與系統 Chromium CDP 自動退路，加 `--motion` 可一併執行最多 11 項動態與 v4.4 引擎實測；執行 `lint.py` 若遇 pyenv 缺 PyYAML，改用 `/usr/bin/python3`。

## 階段與進度

| 階段 | 內容 | 狀態 |
|---|---|---|
| 0–1, 2a–2b | 市場研究、v1 四次真實迭代方法論、12 款風格清單、OKLCH 用色系統、首批 3 款規格與插畫 15 種畫風淺深雙底 | ✅ |
| **Phase A** | **地基對齊與輕底盤 v4**：輕底盤＋自由畫布＋商務元件、統一像素 WCAG `check.mjs`、`oklch.py --palette`、清完 11-14 待辦、首批 Style DNA | ✅ |
| **Phase A+ 補課** | **靜態美感上限重練＋協調感精修＋去小字手術**：6 頁全通過 `4.70`–`7.52:1`，定案四大視覺工藝與原則 #26 | ✅ |
| **Phase B 預研** | **動態技術路線研究與定案**：實查 14 個 GitHub Repo（`inputs/motion-research.md`），定案 **方案 1｜分層混合** | ✅ 定案 |
| **Phase B / B.2 / B.3** | **反寫靜態工藝與原則 #26 ＋ 60fps 動態引擎 ＋ 視覺指引規格與原語（v4.3）**：`v4-alive-demo` 8 頁靜態＋7 項動態實測全過 | ✅ |
| **Phase C.1** | **真實旗艦標竿對照 ＋ v4.4-spec 規格與 Grill v2 全面升級**：三段式舞台光譜、設計樹 Grill v2（融合 `mattpocock/skills`）、原則 #27–#30、9 份核心規格反寫並重打包 | ✅ |
| **Phase C.2** | **v4.4 底盤引擎實作 ＋ 7 項按需自動注入模組 ＋ 11 項實測驗證**：引擎、模組、虛構旗艦範例 `v44-keynote-demo`、零回歸與打包完成 ✅；待真實簡報 PK 複驗收官 | 🟡 引擎完成／待實戰 PK |
| **Phase D** | **多元風格庫全面成形**：補齊其餘 8 款 Style DNA（各含淺深規則與動效個性）、整理插畫 15 種畫風配方表、主題→風格智能配對（穩健／大膽／驚喜）與外觀帳本 | 未開始 |
| **Phase E** | **交付、修改閉環與記憶**：成品按 `E` 改字回寫、畫面上點選留言修改、雙螢幕講者模式、文字可編輯 PPTX 匯出、品味記憶與獨立評審、評估搬進 `skills/` 正式安裝 | 未開始 |

## 已經定案的事

| 決定 | 日期 | 寫在哪裡 |
|---|---|---|
| 風格清單十二款（插畫場景、積木構成、水彩水墨、Apple 發表、書卷刻本、顧問報告、孔版小誌、摩登金、日常工作款、攝影雜誌、年輕潮流、在地懷舊） | 11-18 | `inputs/style-list-v5.md`、`styles/index.json` |
| 首批四款完整 Style DNA：顧問報告、Apple 發表、插畫場景（含 15 種畫風）、日常工作款（現代 Bento） | 11-23 | `outputs/deck-architect/styles/` |
| **用色鎖規則、不鎖色碼、不放品牌色、全部風格淺深雙底** | 11-19 | 原則 #17–19、`styles/color-system.md` |
| **風格本質固定，元素、用色、介面依內容調整；變暗不等於夜晚** | 11-19 | 原則 #21–22、`styles/illustration.md` |
| **多元風格採生成式 Style DNA**，放棄原 2c 19×4 靜態排法矩陣 | 11-19 | 原則 #23、`ROADMAP.md` |
| **輕底盤、強自由混合架構＋7 項按需自動注入模組**：Thin Shell 常駐核心；7 項可選能力由 `assemble.py` 掃描注入（未用到 0 KB），Step 1 Grill 負責先把呈現期待對齊清楚 | 11-19 / 11-25 | 原則 #24、`outputs/deck-architect/scripts/assemble.py`、`references/grill.md` |
| **預設零等待全自動產出＋可選 `IMAGE_UPGRADE.md`**：每頁預留 `.asset-slot[data-slot]` 可無縫換入 AI 底圖或照片，本機圖檔自動內嵌單檔 | 11-23 | 原則 #25、`scripts/assemble.py` |
| **四大靜態視覺工藝標準＋原則 #26（含三項合法豁免）**：真實 AI 無字底圖融合、現代 Bento、數據故事化、精緻暗場；`delivery: talk` 每一般群組 ≤2 層文字（豁免：原話暗房證言、產品情感短句、活流程步進微標） | 11-23 / 11-25 | 原則 #26、`references/presentation-rules.md` |
| **Phase B 動態技術路線＝方案 1｜分層混合 ＋ Phase B.3 視覺指引規範**：60fps GPU 核心、6 種敘事切頁、三層聚光壓暗、因果現場演變、真描線／方向揭露／分段靜讀與語意順序優先 | 11-23 / 11-24 | `references/motion-system.md`、`references/visual-guidance.md` |
| **三段式舞台光譜（`stage_mode`：`briefing`/`pitch`/`keynote`）**：依場合動態決定光暗雙極、去框化比例、導航模式與戲劇層，絕不一刀切 | 11-25 | 原則 #27、`references/contexts.md`、`references/visual-guidance.md` |
| **Step 1 Grill v2（融合 `mattpocock/skills` 始祖機制）**：設計樹前沿不設輪次上限直到零靜默假設、先查事實只問決定、體感預期＋承重母題、**標準模式全面必給 1 個跳脫思維破框候選**、Grounding 著陸與說服載體辯論＋按需模組對齊 | 11-25 | 原則 #28、`references/grill.md`、`references/structure.md`、`templates/brief.md` |
| **雙軌節拍（自動指引＋講者 `data-step`）＋雙軌多媒體（外連影音＋HTML5 原生活 Demo）＋全模式自動隱藏底控膠囊**：已全面實作並由 `check.mjs --motion` 11 項實測把關 | 11-25 | 原則 #29–30、`assets/shell.css`、`assets/runtime.js`、`assets/modules/` |

## 交付物地圖

| 路徑 | 內容 |
|---|---|
| `outputs/deck-architect/` | **v4.4 完整版 Skill 原始碼（38 檔：核心輕底盤＋7 項 `assets/modules/` 按需注入模組＋Grill v2 規格＋11 項 `check.mjs --motion`）** |
| `outputs/deck-architect.skill` | v4.4 打包檔（166.3 KB，38 檔，零 `__pycache__`） |
| `outputs/examples/v44-keynote-demo/` | **Phase C.2 v4.4 旗艦五大新能力虛構示範**（7 頁光暗雙極＋分割＋照片、`divider-only`/`minimal-side`、`data-step` 換幕、外連 WebM/WAV 實測、`flow-carousel`、`coverflow`；最低對比 `4.53:1`，全項實測 ✅） |
| `inputs/phase-c-teardown-learnings.md` | Phase C 旗艦標竿對照與 `mattpocock/skills` 始祖回溯研究筆記（去敏版） |
| `inputs/presentation-principles.md` | 使用者的簡報原則，第 1–30 條 |
| `outputs/examples/v4-alive-demo/` | Phase B.3.2 視覺指引＋60fps 全動態互動單檔示範（v4.4 重建省 48.7 KB，8 頁全過，最低 `4.70:1`） |
| `outputs/examples/v4-visual-benchmark/` | 靜態美感上限重練標竿・去小字極致留白版（6 頁全通過） |
| `outputs/examples/v4-demo/` | Phase A 初版虛構端到端範例（v4.4 重建省 35.7 KB，8 頁全過，最低 `4.81:1`） |
| `inputs/motion-research.md` | Phase B 動態技術路線研究（14 個 GitHub Repo 實查，已定案方案 1） |
| `outputs/style-specs/`、`outputs/color-modes/`、`outputs/illustration-integration/`、`outputs/style-moodboard-v5/` | 首批風格詳規、淺深雙底配色、插畫 15 畫風融合與 12 款風格視覺錨點 |

## 待使用者決定（適時用表單確認）

- **Phase C.2 實戰 PK 複驗 vs 直接進 Phase D**：是否以升級後 `deck-architect` v4.4 立即進行真實簡報 PK 複驗，或直接推進 Phase D 補齊其餘 8 款 Style DNA。
- 埃及壁畫、瑪雅抄本是否要生圖做升級插槽實測。
- 日式留白之後要不要在 Phase D 當獨立一款。
- `deck-architect` 什麼時間點搬進 `skills/` 由 `install.sh` 全域安裝（建議 Phase C 或 E 後）。
- git 歷史殘留的一組無上下文步驟數字是否要再改寫歷史。

## 製作與驗證的眉角

- **生圖提示避坑（2026-11-20 實測）**：AI 生圖提示詞不可寫 `"left 60% ... right 40% ..."`，容易被誤解成分割雙圖（diptych）產生垂直硬接縫！改用單一連續場景空間描述即可生成無接縫攝影。
- **「零等待」不等於「廉價幾何 SVG 假裝插畫」**：插畫／黏土／攝影類風格要用真實無字 AI 底圖（或明確提示生圖）；純程式頁則靠 Bento 儀表板、實景 UI、數據單位矩陣、微光景深拉滿質感。
- **CSS 簡寫避坑**：`font:` 簡寫裡不可寫 `inherit` 當字體名（會整條失效退回 16px）；改用明確的 `font-weight`／`font-size`／`line-height` 或 `var(--font-body)`。
- **漸層字像素對比檢查**：`check.mjs` 會對漸層字加上暫時隱藏類 `.__check_hide_grad`（`opacity: 0`）再截底圖，才能量到真正的背景舞台。
- **輕底盤零權重規則**：`shell.css` 對自由畫布子元素的預設 `z-index` 使用 `:where(...)` 零權重，絕不覆寫 `.back` 或投影片自訂定位。
- **SVG `<defs>` ID 隔離**：`assemble.py` 自動替每頁 `<defs>` 內的 `id` 加上 `s{idx}_` 前綴並同步改寫 `url(#...)`／`href="#..."`，防止多頁組裝後 `clipPath`／濾鏡撞名。
- **公開 repo 去敏規則**：所有範例從零虛構；真實標竿拆解只將抽象方法論寫進 `inputs/` 與 `LOG.md`，絕不提交內部公司名、專案代號、真實數據、個人資訊或大型二進位影音檔。
- **授權與引入外部動畫庫規則**：`op7418/guizang-ppt-skill` 與 `chuspeeism/dashi-ppt-skill` 為 **AGPL-3.0**（僅學架構概念，不抄碼）；`borjaperfra/beatdeck` 已實查 `LICENSE` 確認為 **MIT**；引入 GSAP 前必依 `rules/CLAUDE.base.md` 先說明為何原生 CSS／WAAPI 做不到並經使用者同意。
