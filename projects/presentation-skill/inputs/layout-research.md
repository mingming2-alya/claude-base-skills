# 版式目錄：10 個開源 HTML／PPT 簡報 Skill 的版面配置調查

調查日期：2026-11-14。來源全部以 `git clone --depth 1` 取得，放在本機暫存區（不進 repo），只讀不執行。
本文只談「東西放在投影片的哪裡」；字體、配色、質感、動效、反模式不重複記錄。

閱讀約定

- 「欄」＝直向 column，「列」＝橫向 row。比例如 7:5 指左右欄寬比。
- 凡不是直接從檔案讀到、而是我推論的內容，一律標「推測」。
- 引文保留原文語言（多為簡體中文、英文、韓文、印尼文），不翻譯，以免失真。
- 授權：#1 是 AGPL-3.0，全篇只用自己的話描述、不引用它的程式碼、CSS 或類別名稱。其餘 9 個的 LICENSE 檔皆為 MIT（含 #10 ningzimu/codex-ppt-skill，repo 根目錄有 `LICENSE`，MIT © 2026 ningzimu），片段各 ≤10 行並附路徑。
- 10 個 repo 全部讀到，沒有無法存取的。

代號：GZ-A／GZ-B（guizang 雜誌風／瑞士風）、HS（huashu-design）、FS（frontend-slides）、BHT（beautiful-html-templates）、HPS（html-ppt-skill）、SCR（scrolline-deck）、OS（open-slide）、BM（bang-motion）、PC-紙／PC-幾何／PC-3D（paper-collage-ppt 的三套風格）、CDX（codex-ppt-skill）。

---

## 0. 一頁總覽

| # | Repo | 版式定義在哪 | 版式數 | 版式與風格的關係 | 選版式的機制 | 多樣性規則與檢查方式 |
|---|---|---|---|---|---|---|
| 1 | guizang-ppt-skill | `references/layouts.md`、`references/layouts-swiss.md`、`references/swiss-layout-lock.md` | 雜誌風 10；瑞士風 22（另有 2 個封面／收尾變體、2 個預設停用的實驗版式、1 個登記擴充） | 兩套風格各有自己的範本＋版式＋配色檔，不可混用；同一風格內多套配色共用同一批版式 | 內容意圖→版式對照表、「必須用／嚴禁用」表、依項目數（3／4／6）配對 | 7–8 頁至少 6 種、10 頁以上至少 8 種、不得連續 3 頁同結構；驗證器查「是否登記」，種類數靠人工草稿表 |
| 2 | huashu-design | `references/slide-decks.md`、`references/modules/deck.md`、`references/design-styles.md` | 無版式庫；7 種通用版式名、10 種「視覺主角」類型、20 種 PPT 風格各帶 3–5 個「母版」（合計約 69，依 ①②… 標號計數） | 每頁自由設計；母版寫在各風格條目裡（綁風格），但整份 deck 的外殼共用 | 每頁先答「form 五問」，敘事角色決定版式 | 「最多 4–5 種 layout」＋「視覺主角輪換」；以截圖邊緣指紋比對三個方向的骨架相似度 |
| 3 | frontend-slides | `STYLE_PRESETS.md`、`bold-template-pack/templates/<34>/design.md` | 無共用版式庫；12 個 preset（其中 8 個有一行 Layout 描述）、34 個 bold template 各自帶元件與版面章節 | 版式屬於風格：選定風格後由該風格的 design.md 推導所有頁型 | 無內容→版式表；只依內容密度（低／高）給方向 | 無版式多樣性規則；只要求 3 個預覽彼此不同 |
| 4 | beautiful-html-templates | `templates/<34>/template.html`（＋`design.md`、`template.json`）、`index.json` | 34 個範本、index.json 的 `slide_count` 合計 358；去重後頁型名約 50–60 個（推測） | 官方規則：每個範本是封閉系統，不可跨範本混用；但實際上有 3 組範本共用同一套頁型命名 | 先依情緒／語氣選範本，再複製範本裡最合適的那一頁 | 無 |
| 5 | html-ppt-skill | `templates/single-page/*.html`、`references/layouts.md`、`assets/base.css`、`assets/themes/*.css` | 36 個版式 × 36 個主題；另有 15 個整套範本 | 版式檔與主題檔完全分開；主題只覆寫 CSS 變數，任一主題可套任一版式 | `references/layouts.md` 的「Picking a layout」清單 | 「同一版式不得連續兩頁」；無自動檢查（推測） |
| 6 | awesome-html-scrolline-deck | `engine/beats/*.js`、`engine/constants.js`、`concepts/<6>/layout.css` | 10 種 beat 型別（另可自訂 sequence）× 7 個 slot；6 個 concept 各有自己的 layout.css | 三層分離：內容（deck.yaml）／定位（slot）／concept 包（tokens.css 只放顏色字體，layout.css 另檔） | 敘事結構→concept 對照表；逐 beat 選型別 | 同一 move 同一角色重複需標 `repeat: intended`，schema 驗證會擋；無版式層級規則 |
| 7 | open-slide | `packages/core/skills/{slide-authoring,create-slide,create-theme}/SKILL.md`、`themes/<id>.md` | 無版式庫；8 種頁面角色 | 每頁是自由撰寫的 React 元件；主題是 Markdown 文件，規定邊距、垂直節奏與固定元件位置 | 頁面角色表＋文字密度四選一＋垂直高度預算計算 | 無版式多樣性規則 |
| 8 | bang-motion | `SKILL.md`、`references/anti-ppt.md`、`references/opener-konsep.md`、`references/techniques.md` | 不是投影片 skill（動態影片）；19 種結構概念、約 29 種「呈現功能的方式」、7 個 starter | 結構（概念＋結構指紋）與外觀（風格方向）在 style brief 分兩行決定 | 概念選單表（含適用對象欄），寫 3 個候選再擇一 | 相鄰兩景的字級、進場方向、位置不得相同；結構指紋 5 項至少 3 項不同；可用 grep 檢查的結構禁令 |
| 9 | paper-collage-ppt | `references/layouts.md`、`styles/geo-collage/references/grid-layouts.md`、`styles/playful-lab-3d/references/layout-patterns.md` | 剪紙風 20、幾何風 20、頑趣 3D 8（好奇果凍 3D 未見獨立版式文件） | 每套風格有自己的版式庫；同一風格內配色可即時切換、版式不可切 | 「按內容型選版式」對照表＋容量上限 | 底色節奏（不得連續 3 頁同底色等）、不得連續 3 頁同骨架；grep 或內嵌腳本檢查 |
| 10 | codex-ppt-skill | `skills/codex-ppt/references/<12 風格>.md`、`docs/slide-generation-and-subagents.md` | 12 種風格共 35 個 layout_blueprints、73 條 layout_patterns | 每頁提示詞把 `style`（整份固定）與 `layout`（逐頁變化）分成兩個物件；blueprint 寫在風格檔內但只是候選 | 大綱階段為每頁指定版式角色與理由 | 相鄰頁不得重複同一 blueprint、不得每頁三卡；靠 brief 欄位自我宣告，無自動計數 |

---

## 1. op7418/guizang-ppt-skill（AGPL-3.0，只描述、不引用）

### 1.1 檔案

- `references/layouts.md`：雜誌風（風格 A）10 種版式。
- `references/swiss-layout-lock.md`：瑞士風（風格 B）22 種登記版式的鎖定表（編號 S01–S22）。
- `references/layouts-swiss.md`：瑞士風 22 種版式的說明（編號 P1–P22）、2 個預設停用的實驗版式（P23、P24）、決策表。
- `assets/template.html`、`assets/template-swiss.html`：兩套風格各一份範本。
- `references/gz-components.md`：另一套以元件為單位的參考，共 9 個元件（頁首頁尾、封面、大數字、引言、流程、對比、圖框、圖片網格、條目清單）。`SKILL.md` 沒有引用這份檔案。
- `scripts/validate-swiss-deck.mjs`：瑞士風驗證器。
- `docs/unification-plan.md`：作者自己的整併方案（尚未全部實作）。

注意：`swiss-layout-lock.md` 與 `layouts-swiss.md` 的編號不完全一致。鎖定表的 S09 是點陣宣言、S10 是分屏收尾；說明檔的 P9 是收尾宣言、P10 是點陣宣言。S03 在鎖定表是「雙半屏、左巨字、右灰底解釋」，說明檔的 P3 是「左側三分之一留空、中段巨字」。S05 在鎖定表叫三層，說明檔的 P5 叫三子卡。

### 1.2 雜誌風 10 種版式

1. 開場封面：暗色主視覺頁，全部內容作為一個整體垂直置中，標題用全場最大的字級，不放頁碼。
2. 章節幕封：只有一行引導小字、巨大標題、一行引語；相鄰兩幕的幕封明暗交替。
3. 數據大字報：標題在上，下方 3×2 或 4×2 的數據卡，每張卡由上到下是英文小標、大數字、註解。
4. 左文右圖：左右 7:5；左欄標題貼頂、引述塊貼底（兩端撐開）；右欄圖片貼頂，用固定比例。
5. 圖片網格：3×2 或 3×1，每格固定高度，圖說放在圖框內部底邊。
6. 兩列流水線：兩組步驟上下排列，各有組標題；每步是編號、標題、說明；一列最多 5 步；翻頁時逐步點亮。
7. 懸念問題頁：整頁只放一個問題，大量留白，手動斷行，最多再加一行點破。
8. 大引用頁：整頁只放一段放大的引文、其下一行較淡的原文、最後一列出處與日期。
9. 並列對比：左右各半；左欄整體調淡代表舊，右欄全亮代表新；兩欄都有左側直線，內部結構相同（小標、中標題、條列）。
10. 圖文混排：左右 8:4；左欄是多層文字（小標、大標、引言段、正文、引述塊）；右欄是直式 3:4 或方形圖。

附錄列出 6 種通用欄格：6:6、7:5、8:4、三等分、3×2 圖片、3×2 數據卡。

### 1.3 瑞士風 22 種登記版式（依鎖定表編號）

| 編號 | 名稱 | 幾何（我的描述） |
|---|---|---|
| S01 | 索引封面 | 三列橫帶，每列左邊是大編號、右邊是大標題。說明檔另有預設封面：整頁鋪滿主色、背景是字元構成的呼吸紋理、反白細字大標；以及左墨右紙對開的經典變體 |
| S02 | 縱向時間軸＋KPI | 標題靠左上；中段是直向時間軸，左側一條很窄的軸欄放圓點與虛線，右側每個節點是年份、大字數據、小標、描述；底部一列 4 個 KPI |
| S03 | 分屏陳述 | 整頁分左右兩半，左半巨字，右半灰底解釋 |
| S04 | 六格 | 標題靠左上，下方 3×2 六格，每格是圖示、編號、短標、一行描述，格間用細線 |
| S05 | 三層／三子卡 | 左側大標與描述，右側三張橫向卡由上而下堆疊 |
| S06 | KPI 塔 | 左標題右說明；下方 4 欄等分，每欄底部一根色塊，高度由數據決定，上方是圖示、巨數、標籤 |
| S07 | 橫向條形圖 | 標題靠左上，中段留空，下半部 5–10 列條形：文字標籤、細條、末端數字 |
| S08 | 雙軌對照 | 左右兩半，中間一條直向細線；兩邊各是小標、大標、說明。登記擴充：右半可換成互動地圖（點、連線、卡片） |
| S09 | 點陣宣言 | 中段三行巨字；右上角一大片圓點矩陣，左下角一片描邊圓環矩陣 |
| S10 | 分屏收尾 | 整頁分兩半，左半主色加紋理放宣言，右半白底放 3 條重點（第三條用強調色，把顏色帶到右半） |
| S11 | 橫向時間線 | 頂部是「窄欄＋寬欄」的標題區；中段一條橫向細線上均勻分布 4–7 個小方塊節點，編號在上、步驟名在下 |
| S12 | 宣言＋墨色通欄 | 上半頁左側四行大字宣言、右側短說明；下半頁是一條出血到左右與底邊的墨色橫帶，內放反白短句與一排圖示 |
| S13 | 三力 | 左側約 5/16 寬的墨色主塊（小標、四行標題、點陣裝飾），右側約 11/16 放三張橫向卡，每張有巨大編號 |
| S14 | 閉環 | 左側 4 行編號步驟，右側同心圓環圖，中央一個大字 |
| S15 | 矩陣＋巨數 | 標題靠左上；中段是固定高度的小卡矩陣（鎖定表寫 6×2，說明檔寫 4×3）；底部一個被推到最下方的巨大數字與標籤 |
| S16 | 微卡小報 | 標題靠左上，下方 3×2 微卡；每張卡主文在左上、小字在右下、中間留空；只允許一張用強調色 |
| S17 | 系統圖 | 左半標題加三段說明，右半三層同心圓加外引標籤（鎖定表另寫：上方左小標右段落、中間系統圖、底部三欄解釋） |
| S18 | Why Now | 頂部大標；中段三欄遞進（小標、標題、描述）；每欄底部一個巨大數字，最後一欄用強調色 |
| S19 | 四卡 | 頂部一條很短的強調色細線與雙行大標；下方四欄等分，每欄是編號小字、大標、段落 |
| S20 | 縱向帳單 | 4–6 列，每列用細線分隔：左巨數、中標籤、右圖示 |
| S21 | 規格表 | 左側四行大標；中間三個 KPI（頂線、數字、單位）；右下 9 根高低不一、靠底對齊的直線；底部一個巨數與標籤 |
| S22 | 圖片主視覺 | 上方約 60% 高的全寬圖，一個白底標題塊疊在圖的左上；下方約 40% 是說明文與三欄 KPI |

預設停用的實驗版式：P23（單圖與文字 5:7 或 7:5 分欄）、P24（三張同比例圖並排的證據牆）。

### 1.4 版式與風格是否分離

- 風格 A、B 各自一組「範本＋版式檔＋配色檔」，`SKILL.md` 明文規定一份 deck 只能選一套、不可混用；同名的類別在兩套範本裡意義不同。
- 同一風格內是分離的：雜誌風的配色檔列出 5 套預設色，切換方式是改根節點上的一個主題屬性；10 種版式對 5 套配色通用。瑞士風同理（強調色 4 選 1）。
- `docs/unification-plan.md` 的結論是不合併兩個範本，只共用基礎建設與變數命名契約，不共用外觀；新增主題的成本目標是「一份外觀 CSS＋一份版式文件＋一份驗證器設定」。
- `references/gz-components.md` 描述的新元件系統用三個獨立屬性標示頁面：家族（雜誌／瑞士）、媒介（投影片／卡片／網頁）、配色；並說明元件只負責版面與顏色，字級由另一組角色類別決定，因此同一段標記換媒介會自動換字級。

### 1.5 選版式的方式

- 兩張表：`SKILL.md` 的用途表，以及 `layouts-swiss.md` 末尾的「內容意圖→建議版式」索引。
- 一張禁用表：依內容資料型別列出「必須用」與「嚴禁用」。例：有真實量化數據才可用 KPI 塔、條形圖、帳單、規格表；沒有數據的概念清單禁止用條形圖（文件舉了編造百分比的反例）；4 項不可硬湊成 6 項去套六格；閉環不可用線性時間線。
- 版式分四類：通用、條件通用（項目數剛好 3／4／6）、數據專用、結構專用。
- 核心規則是先看內容形狀再選版式，不可先選版式再編內容。
- 動手前先列草稿表：頁碼→版式編號→選用理由→圖片槽位。

### 1.6 多樣性規則與檢查

- 雜誌風（以明暗主題為單位）：不得連續 3 頁以上同主題；8 頁以上必須至少各有 1 頁暗主視覺與亮主視覺；不得只有亮色正文頁；每 3–4 頁插入 1 頁主視覺頁；主視覺頁不連續超過 2 頁。檢查方式：生成後用 grep 自檢。
- 瑞士風（以版式為單位）：7–8 頁至少 6 種不同編號、10 頁以上至少 8 種；不得連續 3 頁同一主體結構；使用者說要看效果時必須涵蓋封面、收尾、至少 1 個對比或時間線、1 個結構圖、1 個圖片版式；點陣宣言的用途之一是避免連續兩頁都是極簡陳述；收尾版式每份只用 1 次。
- 驗證器實際檢查的項目：每頁是否標了登記的版式編號、是否用了實驗結構、頂部標題是否被置中、SVG 內是否有文字、圖片是否綁定槽位；若有 Playwright 再量測溢出、底部留白、導覽安全線、標題間距。我在腳本中搜尋不到計算「不同版式種類數」或「連續重複」的邏輯，所以 6／8 種與連續 3 頁的規則是靠人工草稿表把關。

---

## 2. alchaincyf/huashu-design（MIT）

### 2.1 檔案與數量

- `references/modules/deck.md`（簡報模組手冊）、`references/slide-decks.md`（架構與設計模式）、`references/design-styles.md`（PPT 風格庫 20 種，每種有樣張 `assets/style-specimens/ppt/NN-*.html`）、`references/directions.md`（三方向流程）、`references/workflow.md`（form 五問）、`scripts/design_lint.py`。
- 沒有可貼上的版式庫，每頁自由設計。文件中出現三組版式詞彙：
  - 7 種「常用 slide layouts」（`references/slide-decks.md`）：Title（純色底＋巨大標題＋副標＋作者日期）、Section divider（彩色底＋章節號＋章節標題）、Content（白底＋標題＋1–3 條）、Data（標題＋大圖表或數字＋短說明）、Image（全出血照片＋底部小圖說）、Quote（留白＋巨大引文＋出處）、Two-column（左右對比）。
  - 10 種「視覺主角」類型（同檔「出版物 grammar 模板」）：封面排版（大字＋刊頭＋直柱）、單角色肖像、多角色合影或頭像卡並排、時間軸卡片遞進、知識圖譜節點圖、Before/After 對比卡＋中間箭頭、產品 UI 截圖＋描邊裝置框、半頁大引號、真人頭像＋引言卡（2×2 或 1×4）、大字封底＋橢圓網址按鈕。
  - 20 種 PPT 風格各自的「母版」清單（3–5 個）。例：新瑞士大字報＝①大色塊章節頁一個詞②巨型數字佔半屏＋小註③左右分欄對比④全幅扁平折線或柱狀；斷言-證據＝①整句標題②標題下單圖證據③零條列；Sparkline 敘事＝①橫貫全屏的波形線②波形上的文字標註點③上下並置對照波形④全黑底孤懸一條數據線；瑞士機構極簡＝②頂部一句話標題帶＋下方三欄對仗③TAM 大數字分層④2×2 競品矩陣；研報密集＝①結論句標題＋滿頁單圖②logo 網格市場地圖。
- 出版物骨架（`references/slide-decks.md`）：頂部刊頭條與橫線、引導小字、H1、斜體英文副標、分隔線、內容區（雙欄 60/40、2×2、列表擇一）、底部「章節名＋頁碼」。

### 2.2 版式與風格是否分離

- 沒有分離成檔案。母版寫在每個風格條目的「視覺DNA」裡，是風格的一部分。
- 但流程上把「骨架」當成獨立於配色的東西來要求與檢查：
  - `references/modules/deck.md`：「三版 deck 外壳统一，只换视觉。」（外殼＝`assets/deck_index.html` 的概覽牆、翻頁、頁碼）
  - `references/directions.md`：「三版常常是同一个骨架换颜色和字重。差异要落在版式结构上，不是配色上。」方向卡有獨立一欄「骨架｜版式结构一句话」。
  - 品牌限定顏色字體時用 `--brand`，「只比骨架」。
- 風格庫定位（`references/design-styles.md`）：「这是『没思路时翻的弹药』，不是『必须从这里选』的清单。」樣張「借的是版式与气质，不是内容」。

骨架指紋（`scripts/design_lint.py`，節錄）：

```python
def layout_vector(png_bytes, w=32, h=20):
    """版式骨架：去掉颜色、只留明暗结构，再标准化——换皮不换骨的两版会高度相关。"""
    im = Image.open(io.BytesIO(png_bytes)).convert('L').filter(ImageFilter.FIND_EDGES).resize((w, h), Image.BILINEAR)
    # …（標準化成向量後回傳）

# 同檔 similar() 內的判定：
    lc = corr(a['layout'], b['layout'])
    if lc > 0.55 and not ignore_layout:
        hits.append(f'版式骨架高度相似（相关 {lc:.2f}）')
```

### 2.3 選版式

- `references/workflow.md` 的 form 五問，每頁開工前回答：敘事角色（hero／過渡／數據／引語／結尾）、觀眾距離、視覺溫度、容量估算（畫 3 個小草圖）、視覺母題。`references/modules/deck.md`：「一页一个角色，版式跟着变。」
- 數據頁（`references/modules/deck.md`）：「数据页别默认成『三个大数字＋条形图』」，先問數字之間的關係：比例（按比例縮放的實物）、變化（一條敘事曲線）、構成（拆開的整體）、對比（左右對照）、規模（一個超大物件）。
- 5 頁以上先做 2 頁代表頁（視覺結構差異最大的兩種，例如封面＋數據頁）定成 grammar，再批量。

### 2.4 多樣性規則與檢查

- `references/slide-decks.md`：「一个 deck 里最多用 4-5 种 layout。」（上限）同檔又要求「Deck 需要 intentional variety」「不要每张 slide 长一样」，並列三種節奏：顏色、密度、字級。
- 「视觉主角必须差异化」：13 頁若全是「文字＋一張截圖」太單調，每頁的視覺主角類型輪換。
- 每頁容量：「1 个核心信息 + 3-4 个辅助点 + 1 个视觉主角」，超過就拆頁。
- 檢查：`design_lint.py compare` 比的是三個方向的縮圖（色板距離、骨架相關、底色類別＋標題字體）。沒看到針對單一 deck 內各頁版式種類的自動檢查（推測：靠 polish 迴圈人工看截圖）。

---

## 3. zarazhangrui/frontend-slides（MIT）

### 3.1 檔案與數量

- `SKILL.md`、`STYLE_PRESETS.md`（12 個 preset）、`html-template.md`、`viewport-base.css`、`bold-template-pack/selection-index.json`、`bold-template-pack/templates/<34 個>/{design.md,preview.md}`。
- 沒有跨風格的版式庫。
- `STYLE_PRESETS.md` 前 8 個 preset 各有一行 Layout（原文）：
  - Bold Signal：Colored card on dark gradient. Number top-left, navigation top-right, title bottom-left.
  - Electric Studio：Split panel—white top, blue bottom. Brand marks in corners.
  - Creative Voltage：Split panels—electric blue left, dark right. Script accents.
  - Dark Botanical：Centered content on dark. Abstract soft shapes in corner.
  - Notebook Tabs：Cream paper card on dark background. Colorful tabs on right edge.
  - Pastel Geometry：White card on pastel background. Vertical pills on right edge.
  - Split Pastel：Two-color vertical split (peach left, lavender right).
  - Vintage Editorial：Centered content on cream. Abstract geometric shapes as accent.
- 34 個 bold template 的 `design.md` 前段是 YAML（colors、typography、spacing、canvas、motion、components），後段有 `## Layout` 章節（畫布、邊距階梯、頁框）。頁型散在 components 與散文裡，各範本不同。例（`bold-template-pack/templates/broadside/design.md`）：宣告型頁（cover、chapter、statement、quote、end）完全不顯示頁框；內容型頁（split、stats、list、compare、chart、diagram）保留上下兩條細線頁框。
- `bold-template-pack/templates/scatterbrain/design.md` 明寫 7 種構圖模式且「without prescribing layouts」：置中單張便利貼；2 或 3 欄便利貼格（各自微旋轉）；圖表卡＋彩色便利貼圖例；拍立得相框＋文字便利貼群；主便利貼周圍 2–4 張小便利貼的自由群聚；左右交錯節點＋虛線曲線連接的時間軸列；兩張便利貼中間夾一個墨色 versus 圓。

### 3.2 版式與風格是否分離

沒有分離，版式由風格推導。`SKILL.md` 原文：

> Preserve its fonts, palette, decorative vocabulary, spacing rhythm, grid logic, and component grammar. … Design any missing slide layouts from that system rather than importing patterns from another style.

唯一跨風格共用的是舞台規格（`selection-index.json` 的 `frontend_slides_policy`：固定 1920×1080、整體縮放、不重排）。

### 3.3 選版式

- 沒有內容→版式對照表。
- 依使用者選的密度給方向（`SKILL.md`）：低密度用更多頁、大標題、短語、statement／quote 頁；高密度用「structured grids, comparison tables, annotated diagrams, captions」。
- 預覽頁必須暗示一個可擴展到「section, content, quote, comparison, and closing slides」的系統。

### 3.4 多樣性

- 搜尋不到版式層級的多樣性規則。反模式清單有一條：「Layouts: Everything centered, generic hero sections, identical card grids」。
- 多樣性要求落在三個風格預覽之間（1 個安全 preset、至少 1 個 bold template、1 個 wildcard，必須真的不同）。
- 驗證：截圖檢查文字溢出與面板互相遮蓋。

---

## 4. zarazhangrui/beautiful-html-templates（MIT）

### 4.1 檔案與數量

- `templates/<slug>/template.html`（完整示範 deck）、`design.md`、`template.json`；根目錄 `index.json`、`AGENTS.md`。
- 34 個範本，`index.json` 的 `slide_count` 合計 358。我用正則從 template.html 抽投影片的類別名稱，部分範本抽到的頁數少於 `slide_count`、有 4 個抽不到，所以下面的頁型清單不保證完整。
- 頁型命名分成四類（事實：類別名稱；「同名即同骨架」為推測，我只逐條讀了 signal 的幾何）：
  - A 類 `slide--<型別>` 加上 `dark／light／orange` 表面修飾：broadside、grove、mat、monochrome、signal、studio、vellum。型別聯集：cover、chapter、statement、split、stats、list、quote、compare、chart、diagram、pie、pyramid、vtimeline、cycle、end，另有 editorial、dense、fullbleed（signal）、fadelist（broadside）、insights、timeline（monochrome）、text（vellum）。
  - B 類 `s-<型別>`：neo-grid-bold、pin-and-paper、pink-script、soft-editorial、stencil-tablet。型別：cover、toc／agenda、stats、features／notes／princ、chart、section、quote、cta、consult、process、matrix。
  - C 類 `s-<型別>`（展覽刊物系）：biennale-yellow、cobalt-grid、long-table、sakura-chroma。型別：cover、manifesto、index／programme／catalogue、chapter／featured／stripe、data／menu、quote、cal／table、colophon／closing。
  - 其他：`slide-<名稱>`（bold-poster、cartesian、daisy-days、retro-zine）、`layout-<名稱>`（blue-professional：cover、agenda、metrics、dashboard、split、bars、quote、timeline、detail、closing）、只有序號（block-frame、capsule、coral、playful、raw-grid、emerald-editorial）。

### 4.2 讀到的幾何

signal（`templates/signal/template.html`，A 類代表）：

- cover：內容整塊貼底（主軸靠末端），不顯示頁框。chapter、statement、quote、end：垂直置中。
- split：左右各半，圖高 55vh。list：左 2 右 3，標題在左、清單在右。compare：左右各半、面板滿高。
- stats：3 欄或 4 欄卡，數值 5.5vw。quote：引號 8vw、引文 3.6vw、最大寬 78%。
- editorial：五列結構，中段左右 1.15:0.85，右欄內再放 2×2 小數字。dense：2.4vw 結論標題下兩欄正文。
- pie：左甜甜圈、右圖例（色塊｜名稱｜數值三欄）。chart：頭部左右分置、長條貼底、基線、來源。
- pyramid：5 層置中橫帶，寬度 38%、54%、70%、86%、100%；每層左名稱、右對齊說明。
- cycle：3×3 格線，四個步驟在四角，箭頭在四邊中間格。

```css
/* templates/signal/template.html（僅列版面屬性） */
.cycle-grid { display:grid; grid-template-columns:1fr 3em 1fr; grid-template-rows:1fr 3em 1fr; align-items:center }
.pyr-level:nth-child(1) { width:38% }  /* …54%、70%、86%、100% */
.slide--list .slide-body { display:grid; grid-template-columns:2fr 3fr; align-items:center }
```

broadside 的 fadelist：上列左右分置小資訊；一組單字靠右對齊向下堆疊（每個 7.5vw）；最大的標題字 10.5vw 靠右下。design.md 稱為「three-stage fadelist treatment」。

neo-grid-bold（`templates/neo-grid-bold/template.html`，12 欄 × 8 列的馬賽克格線，每頁把面板釘在格線座標上）：

- cover：左照片佔第 1–3 欄全高；中間面板佔 4–8 欄上 5 列；標題塊佔 4–8 欄下 3 列；右照片佔 9–12 欄上 5 列；說明格佔 9–12 欄下 3 列。
- stats：強調色直條佔 1–2 欄全高；文案佔 3–6 欄；三個小數字各佔 3 欄 × 2 列；一個 240px 巨數佔 7–12 欄下 4 列。
- section：1–4 欄是 320px 巨型章號窗格；5–12 欄是 132px 標題窗格；兩個窗格內容都上下撐開。
- quote：照片佔 1–5 欄全高；引文佔 6–12 欄上 5 列；署名佔 6–9 欄下 3 列；標記佔 10–12 欄下 3 列。
- cta：標題佔 1–8 欄上 3 列；QR 佔 9–12 欄；下方三個步驟各 4 欄 × 5 列。
- toc：標題列佔上 2 列；六個項目各 4 欄 × 3 列。chart：左 5 欄標題與說明、右 7 欄圖表。consult：標題 1 列，下方三欄各 4 欄。process：節點各佔 2 欄、位於第 3–7 列橫排。

```css
/* templates/neo-grid-bold/template.html（僅列版面屬性） */
.s-stats .accent-l { grid-column:1 / span 2; grid-row:1 / span 8 }
.s-stats .copy     { grid-column:3 / span 4; grid-row:1 / span 8 }
.s-stats .stat-a   { grid-column:7 / span 3; grid-row:1 / span 2 }
.s-stats .stat-big { grid-column:7 / span 6; grid-row:5 / span 4 }
.s-stats .stat-big .v { font-size:240px }
```

cobalt-grid（`templates/cobalt-grid/template.html`，全部絕對定位）：

- cover：標題絕對定位在左上、最大寬 60%；右側一條約 32vw 寬的像素藝術欄；右緣垂直置中有一疊直書（`writing-mode:vertical-rl`）的中繼資訊；頁尾欄在左下。
- manifesto：陳述塊垂直置中、左右各 8vw 邊距、靠左對齊、字級約 6.4vw，下方署名列。
- index：頂列（標題左、標籤右、底對齊）＋ 2 欄 × 3 列項目，每項是 56px 編號欄＋文字。
- chapter：文字框靠左、垂直置中，右側留約 30vw 給藝術塊。
- data：左 0.8 份放一個約 11vw 的巨型數字、標籤、30 字元寬說明；右 1.6 份是 8 欄堆疊長條，貼底。
- quote：引文框靠左、垂直置中，右側留約 22vw 給藝術條；引文約 5.6vw。
- table：帳冊式，5 欄（76px｜0.6｜1.4｜0.7｜0.5），每列平均撐滿高度。
- colophon：標題靠右對齊、位於 28% 高度；藝術塊在左；底部 4 欄頁尾。

其他範本讀到的片段：

- long-table 的 menu：左右各留約 12vw 的窄置中欄；每列是「64px 編號｜品項＋說明｜右對齊配對標籤」，像餐廳菜單。featured：左 1.1 右 1，左欄引言與一行統計，右欄是「標籤｜靠右數值」的資訊列。cal：5 欄日程帳冊。
- sakura-chroma 的 stripe：5 條 −22° 斜向彩帶橫穿整頁（寬 160%、從 18% 到 66% 高度等距），引文疊在上面、靠左、垂直置中、最大寬 78%。catalogue：4 欄卡，卡頂一條色帶，規格列被推到卡底。
- retro-zine 的 collage：四塊絕對定位的拼貼片各據一角，寬 26–34%，旋轉 −3°、4°、2°、−5°，標題在左上。visual：全幅 SVG 背景上疊一段旋轉 −2° 的置中文字，圖說在底部置中。editorial：頁首左右分置＋兩欄正文＋首字放大。rsvp：最大寬 700px 的置中卡。numbers：3 欄置中數字。

### 4.3 版式與風格是否分離

官方規則是不分離（`AGENTS.md`）：

> **Layout grid.** The grid columns, the absolute positioning, the flex hierarchies. Don't restructure.
> **Slide-level CSS classes** (e.g. `.s-toc`, `.slide--quote`, `.layout-cover`). These carry the visual identity.
> **Don't combine layouts from different templates.** Each template is a closed visual system.

缺版式時（`AGENTS.md` §5）：用該範本的設計系統從零設計（同字體、同色板、同裝飾語彙、同間距節奏、同元件文法、同頁框、同導覽），驗收方法是把新頁夾在兩張既有頁之間看是否像同一份。

實際上 A 類 7 個範本共用同一套 `slide--<型別>` 命名，表面明暗以獨立的 `dark／light` 類別表示。這等於「同一套頁型骨架換外觀」，但 repo 沒有把它抽成共用檔（推測：各範本是複製後各自演化）。

### 4.4 選版式與多樣性

- 選的是範本，不是版式：依 `index.json` 的 mood、tone、formality、density、scheme 挑 3 個候選，各做一張封面預覽讓使用者選。
- 進入範本後：「duplicate an existing slide of the most appropriate layout and replace its content」。`slide_count` 的說明是「Hint for how many layouts the template demonstrates」。
- 沒有多樣性規則。

---

## 5. lewislulu/html-ppt-skill（MIT）

### 5.1 檔案與數量

- 36 個版式：`templates/single-page/*.html`，每個是可獨立開啟、帶示範資料的頁面；目錄在 `references/layouts.md`；總覽在 `templates/layout-showcase.html`。
- 36 個主題：`assets/themes/*.css`。
- 共用結構與變數：`assets/base.css`（257 行）。
- 15 個整套範本：`templates/full-decks/<name>/{index.html,style.css,README.md}`。

36 個版式（幾何取自 `references/layouts.md` 的用途說明與我讀的檔案）：

| 分組 | 版式 | 幾何 |
|---|---|---|
| 開場與轉場 | cover | 靠左、垂直置中：小標、72px 大標、引言段、一排 pill；頁首頁尾各一列左右分置 |
| | toc | 2×3 編號卡 |
| | section-divider | 全部置中：小標、112px 標題、短強調線、引言段，限寬 780px |
| 文字 | bullets | 每條包在卡片裡的條列 |
| | two-column | 概念與範例並排 |
| | three-column | 三等寬欄，各有圖示 |
| | big-quote | 置中：140px 引號、56px 斜體引文、署名，限寬 1040px |
| 數字與資料 | stat-highlight | 置中：260px 數字、其下一行、再一段引言 |
| | kpi-grid | 4 個 KPI 一列，含升降差值 |
| | table | 資料表，數字靠右 |
| | chart-bar／chart-line／chart-pie／chart-radar | Chart.js 圖表；pie 是甜甜圈＋重點卡；radar 比較 2 個產品 6 個軸 |
| 程式 | code／diff／terminal | 語法高亮、加減行 diff、終端機視窗 |
| 圖解 | flow-diagram | 5 節點加箭頭的管線，其中一個節點高亮 |
| | arch-diagram | 三層架構格 |
| | process-steps | 4 張編號步驟卡 |
| | mindmap | 中心根節點＋絕對定位的周邊節點，SVG 連線 |
| 計畫與比較 | timeline | 5 欄，一條橫線貫穿，圓點在線上，年份在點上方、文字在點下方 |
| | roadmap | 4 欄 NOW／NEXT／LATER／VISION，欄間無間隙、以框線分隔 |
| | gantt | 左 200px 標籤欄＋12 週欄，5 條軌道 |
| | comparison | Before／After 兩面板卡 |
| | pros-cons | 優缺兩張卡 |
| | todo-checklist | 勾選清單 |
| 圖片 | image-single | 一張不裁切的圖＋圖說 |
| | image-full-bleed | 圖鋪滿整頁，底部漸層，標題塊錨定左下（左 96px、底 88px），84px 標題 |
| | image-text-split | 圖與文 50/50；加 `flip` 把圖換到右邊 |
| | image-gallery | 3–6 張均等格，各有圖說 |
| | image-compare | 兩張圖並排，有標籤與一行結論 |
| | image-hero | 全出血主視覺（漸層背景） |
| | image-grid | 4 欄 × 180px 列的 bento，共 7 格，第一格佔 2×2 |
| 收尾 | cta | 大標＋按鈕 |
| | thanks | 致謝頁＋彩帶 |

### 5.2 版式與風格是否分離（本次調查中最乾淨的分離）

`SKILL.md` 原文：

> One theme file = one look. One layout file = one page type. One animation class = one entry effect.

檔案結構（`SKILL.md` 的目錄樹）：

```
assets/base.css              （變數預設值、.slide、.grid .g2 .g3 .g4、.card、.img-frame、頁首頁尾）
assets/themes/*.css          (36 token overrides, one per theme)
templates/single-page/*.html (36 layout files with demo data)
```

- 主題檔約 20 行，內容是 `:root` 變數，偶爾加一兩條元件外觀（例：`assets/themes/swiss-grid.css` 只多了卡片上下邊線與 12 欄底紋）。
- 版式專屬的 CSS 寫在該版式檔自己的 `<style>` 裡，顏色全走變數。例（`templates/single-page/timeline.html`）：

```css
.tl::before{content:"";position:absolute;left:0;right:0;top:48px;height:2px;background:var(--border)}
.tl .row{display:grid;grid-template-columns:repeat(5,1fr);gap:22px;align-items:start}
.tl .item{position:relative;padding-top:80px;text-align:center}
.tl .dot{position:absolute;top:36px;left:50%;transform:translateX(-50%);width:24px;height:24px;border-radius:50%;background:var(--accent)}
```

- 切換主題＝換一個 `<link id="theme-link">` 的 href；放映時按 T 即時輪播主題，版式不變。
- 規則（`SKILL.md`）：「Use tokens, not literal colors.」「Don't invent new layout files. Prefer composing existing ones.」
- 例外：15 個 full-deck 範本用 `.tpl-<name>` 前綴的專屬 CSS，是封閉外觀。`references/full-decks.md`：「not a mix-and-match of layouts」。

### 5.3 選版式

`references/layouts.md` 的「Picking a layout」（原文節錄）：

- Opener: `cover.html`, often followed by `toc.html`.
- Show numbers: `stat-highlight.html` (single) or `kpi-grid.html` (4-up).
- Show a diff or change: `comparison.html`, `diff.html`, `pros-cons.html`.
- Show a plan: `timeline.html`, `roadmap.html`, `gantt.html`, `process-steps.html`.
- Show one image: `image-single.html` for a screenshot/diagram (never cropped), `image-full-bleed.html` for a photo.
- Show several images: `image-gallery.html` (uniform, 3–6), or `image-grid.html` for an uneven bento arrangement.

主題另依聽眾選（`references/authoring-guide.md`：工程師、設計師、主管、消費者等各 2–3 個建議）。

### 5.4 多樣性

`references/authoring-guide.md`：

> Pick 1 layout per page from `references/layouts.md`. Don't repeat the same layout twice in a row.

deck 骨架：cover → toc → section-divider → 2–4 頁正文（重複三段）→ cta → thanks。沒看到自動檢查（推測：靠 O 鍵總覽人工看）。

---

## 6. gongnyang/awesome-html-scrolline-deck（MIT）

捲動式簡報：一個舞台、一條連續時間軸，沒有「頁」，單位是 beat（停點）。

### 6.1 檔案與數量

- 內容：`decks/<id>/deck.yaml`。
- 版面基本單位：`engine/beats/*.js` 的 10 種 beat 型別＋可自訂的 `sequence`（`docs/writing-a-deck.md`）。
- 定位：`engine/constants.js` 的 7 個 slot，或世界座標 `place.world {x,y,z,s}`。
- 外觀包：`concepts/<id>/{concept.json,tokens.css,layout.css}`，共 6 個（rail、data、launch、zoom、canvas、kinetic）。

beat 型別與組成部件（`docs/writing-a-deck.md`）：

| 型別 | 必填 | 部件 |
|---|---|---|
| text | text | block、line、word、em；size 有 xl／l／m |
| number | value、label | value、digits、unit、label、source |
| quote | text、by | block、mark、word、by |
| compare | items 2–4 個 | item、label、value、text、divider、verdict、source |
| chart | kind（bar／line／area／dot）、categories、series | plot、axis、mark、label、legend、title、dek、note、baseline、source |
| chronology | events 2 個以上 | track、event、date、title、note、media、dot、stem、counter、reel、ground、ghost、now、tick |
| photo | src、alt | frame、media、caption |
| video | src、poster、alt、mode | frame、media、caption、credit |
| prompt | text | field、char、caret、label、result |
| code | code、lang | block、line、token、caret |

slot（`engine/constants.js`，原樣節錄；x、y 是畫面比例，ax、ay 是區塊自身的錨點）：

```js
export const SLOT_DEFAULTS = Object.freeze({
  center: Object.freeze({ x: 0.5, y: 0.5, ax: 0.5, ay: 0.5 }),
  left: Object.freeze({ x: 0.0625, y: 0.5, ax: 0, ay: 0.5 }),
  right: Object.freeze({ x: 0.9375, y: 0.5, ax: 1, ay: 0.5 }),
  top: Object.freeze({ x: 0.5, y: 0.0625, ax: 0.5, ay: 0 }),
  bottom: Object.freeze({ x: 0.5, y: 0.9375, ax: 0.5, ay: 1 }),
  full: Object.freeze({ x: 0, y: 0, ax: 0, ay: 0 }),
  'lower-third': Object.freeze({ x: 0.0625, y: 0.9, ax: 0, ay: 1 }),
});
```

各 concept 的版面（`docs/concepts.md` 與 `concepts/*/layout.css`）：

- data：圖表就是舞台、相機不動。圖表 beat 是 1600×900 的框，標題與副句在框上方，右側 360px 留給線尾的名稱標籤（`concepts/data/layout.css` 註解）。
- rail：往下捲動讓時間橫向前進；捲動距離與真實日期間隔成正比；年份計數器滾動；`ground` 選項在軌道後方畫巨大的淡色年份。
- launch：暗場、相機固定；文字 beat 置中、限寬 1680 單位；數字 beat 直向置中；照片媒體放大到 122% 出血、圖說置中靠下。
- zoom：畫面上的小東西（一根長條、一個數字、一格）是下一景的入口，縮放深度＝論證深度。
- canvas：相機飛越一張大地圖，在各區降落，再拉遠看全程。
- kinetic：文字是舞台，句子被打字、倒帶、折疊。

### 6.2 版式與風格是否分離

分三層，檔案各自獨立：

1. 內容與定位（`deck.yaml`）：只寫型別、欄位、`place: { slot: center }`、move 名稱與參數。`SKILL.md` 原則 1：「내용은 beat, 움직임은 move」。
2. 顏色與字體（`concepts/<id>/tokens.css`）：`docs/concepts.md` 明列它「defines only these variables」，只有顏色、字族、字重、字級、行高。
3. 版面（`concepts/<id>/layout.css`）：`docs/concepts.md`：「optional: per-type beat layout for this concept」。檔頭註解規定所有選擇器限定在 `.sl-concept-<id>` 範圍、顏色只能用 `var(--sl-*)`、不得用 `!important`。

`concept.json` 的 `beats.allow` 限制該 concept 可用哪些 beat 型別，`slots` 可逐鍵覆寫 slot 位置。渲染器只產生帶 `data-part` 的 DOM，`transform` 屬性保留給 move。concept 之間不得互相 import（`tools/check-deps.mjs` 的規則 R4）。

所以：版面仍是 concept 專屬（layout.css 隨 concept 走），但與配色檔分檔，內容層完全不含樣式。

### 6.3 選版式

- 先依敘事結構選 concept（`SKILL.md` 的 6 列對照表：時間順序→rail、數據累積主張→data、單一產品公開→launch、從整體鑽到單一原因→zoom、在地圖上巡迴多個領域→canvas、句子即舞台→kinetic）。
- 再列 beat 清單（id、型別、一行內容、是否停點）給使用者確認。
- 停點數：每分鐘 1–2 個；「한 정지점 = 한 주장」（一個停點一個主張），文字層級最多 3 層。

### 6.4 多樣性

- 同一個 move 在同一角色用 2 次以上，必須標 `repeat: intended`，否則 `engine/deck-schema.js` 報錯「`<move> repeats as <role> without repeat: intended`」。
- 每個 concept 的 signature move 至少用 1 次。
- 相鄰兩個 beat 談同一對象時要用 `link` move 交接，不用切換。
- 這些是動作層級的規則；沒有版面層級的多樣性規則。

---

## 7. open-slide/open-slide（MIT）

### 7.1 檔案與數量

- Skill：`packages/core/skills/slide-authoring/SKILL.md`（技術參考）、`create-slide/SKILL.md`（流程）、`create-theme/SKILL.md`（主題）。
- 投影片是 `slides/<id>/index.tsx`，匯出 `Page[]`，每頁是一個 React 元件，用 inline style 寫在固定 1920×1080 畫布上。
- 主題：`themes/<id>.md`＋`<id>.demo.tsx`；示範有 3 個（`apps/demo/themes/aero.md`、`fieldwork.md`、`pommi.md`）。
- 沒有版式庫。`create-slide/SKILL.md` 步驟 4 列了 8 種頁面角色：Cover（Title + subtitle, strong visual）、Agenda（3–5 items）、Section divider（Big label between chapters）、Content（Heading + 2–5 bullets OR heading + one visual）、Big number（One statistic the size of the canvas）、Quote、Comparison（Two-column before/after or A vs B）、Closing。

### 7.2 版式與風格是否分離

- 每頁自由撰寫。可調的設計變數 `export const design: DesignSystem = { palette, fonts, typeScale, radius }` 不含版面。
- 主題檔是純文件，但有 `## Layout` 章節，規定邊距、垂直節奏與固定元件位置；`slide-authoring/SKILL.md`：「the theme file overrides the defaults in this skill — its palette, typography, layout padding, and Title/Footer components are authoritative」。
- 例（`apps/demo/themes/fieldwork.md`）：

> Vertical rhythm: eyebrow at `top: 116`, page heading at `top: 160`, a one-line aside right-aligned at `left: 1220–1300, top: 196`, main content from `top: 330`, last content ends by ~940, footer at `top: 1000`.
> Cards: … Three across: 536 × 610 at `x = 120 / 692 / 1264`. Full-width rows: 1680 × 188, stacked 20 px apart.
> Illustrations sit right of the text block (`x ≈ 940–1080`) on a pastel backdrop circle, and never overlap type.

- 例（`apps/demo/themes/pommi.md`）：「this is a poster layout, not a flow layout」；分欄頁左欄 x=120、寬 1000，右欄從 1160–1240 到 1800，右欄常放一個 620–640px 寬、可出血到底邊的大色塊；貼紙傾斜 ±4–10°，表格與圖表保持不傾斜。

結論：主題固定「頁框與節奏」（哪裡是引導小字、標題、內容帶、頁尾），頁面內的構圖自由。

### 7.3 選版式

- 頁面角色表；開工前問文字密度（minimal 一行或一個大數字／light 標題＋2–3 條／standard／dense 多欄）。
- 垂直預算：逐項加總「字級 × 行高 × 行數＋間距」，必須塞進內容區（示例合計 816px，上限 840px）；塞不下就拆頁。
- 「Left-aligned content feels editorial; centered feels ceremonial.」

### 7.4 多樣性

沒有版式多樣性規則。相關規則只有「one idea per page」「One coherent visual direction across every page」，以及轉場必須屬於同一個家族。

---

## 8. bangtutorial/bang-motion（MIT）

這是做動態影片（opener／explainer）的 skill，文件為印尼文，核心主張是「不要像 PPT」。它沒有投影片版式，但有結構選單與可機械檢查的反模板規則，對「版式不夠多樣」直接相關。

### 8.1 檔案與數量

- `SKILL.md`（「Larangan struktural」＝結構禁令 8 條）、`references/anti-ppt.md`、`references/opener-konsep.md`、`references/techniques.md`、`assets/starter-*.html`（7 個起始檔）。
- 19 種結構概念（`references/opener-konsep.md`「Menu konsep」表）。與版面最相關的幾種：一鏡到底（文字貼在世界表面）、純字體（文字從 5 個以上方向進場）、前後對比（畫面分割，移動的分割線就是轉場）、活的數字（數字留在畫面，背後世界更換）、logo 當舞台（所有場景發生在 logo 的幾何裡）、導覽與主張交替（UI 導覽段落之間停在品牌色場上的短句）。
- 「呈現功能的方式」選單約 29 種（我數條列項），用來取代「三張功能卡並排」。例：同一句話裡換字；圖示繞產品公轉後吸入；一個容器不動、內容每 1.5 秒換一次；一個大物件置中、左右各夾一小段文字；能力標籤一排排橫向移動、方向交替；品牌字重複成外框字紋當背景。
- 10 種風格方向（`SKILL.md`「Arah gaya」表）。

### 8.2 結構與外觀是否分離

是，而且寫成規則。`SKILL.md` 的 Hukum #3 標題：「Gaya lahir dari tema, bukan dari starter, bukan dari referensi」（風格出自主題，不是 starter、不是參考）。style brief 分行填寫：

- 結構：`konsep · jumlah adegan · objek utama tiap adegan · pembuka · penutup`（概念、場景數、每景主物件、開場、收尾）＝「sidik jari struktur」（結構指紋）。
- 外觀：色板（每個顏色註明來源）、字體、背景語言等。

`references/opener-konsep.md`：「Warna baru di atas urutan adegan lama tetap template.」（舊場景順序換新顏色仍是模板。）

### 8.3 選擇機制

概念表有「Cocok untuk」（適用）欄。流程是寫 3 個候選概念，各一句含產品名的前提，依產品性質擇一：「apa yang paling meyakinkan bila DILIHAT, bukan apa yang paling mudah dibangun」（看了最有說服力的，而不是最好做的）。

### 8.4 多樣性規則與檢查

- `references/techniques.md` §1 規則 3：相鄰兩景不得在以下三項相同：字級（sm／md／lg／xl）、進場方向、位置（置中／靠近物件／左上）。規則 6：貼著物件的文字放在物件旁邊，不硬塞到物件上方置中。
- `SKILL.md` 結構禁令共 8 條（要求看程式碼而不是憑感覺），與版面相關的四條：
  - 第 1 條：3 個以上用淡入淡出切換的 `<section>`＝投影片（用 grep 計數）。
  - 第 3 條：每景的文字層級，引導小字＋標題＋內文＝3 層＝PPT；上限 2 層（一個大數字或大句子＋一個標籤）。
  - 第 5 條：所有切換都是同一種轉場＝模板。
  - 第 8 條：範本骨架，即放大後向左退出的文字、三張並排功能卡、被打字的輸入框、「鉤子→功能→功能→承諾→logo→CTA」順序，出現 2 項以上且非概念所需＝模板。
- 「典型元件」每支影片最多 2 個，且只在概念需要時用。
- 結構指紋必須與上一支不同：概念不同，或 5 項至少 3 項不同。連續兩支不得用同一列風格方向、同一種呈現功能的方式。
- `references/anti-ppt.md` 的快速校準：「這一格畫面不改就能當企業投影片嗎？能就重做。」

---

## 9. Jane-xiaoer/paper-collage-ppt（MIT）

一個 repo 內含多套風格，各有自己的版式庫。

### 9.1 剪紙風 20 種（`references/layouts.md`、`assets/template.html`）

| 編號 | 名稱 | 幾何 |
|---|---|---|
| L1 | 封面 | 剪貼字標題置中放大（約 6.2vw）；底部三層撕紙山景；不放插畫；角落有網點貼片與紙屑 |
| L2 | 章節幕封 | 墨底；5:7 兩欄；左欄一塊撕邊大色塊，內放約 9vw 的章號，上貼膠帶、微旋轉；右欄小標、大標、引言 |
| L3 | 觀點金句 | 深底；一條微旋轉、左右出血的撕紙橫帶橫貫頁面（位於 56vh）；其前方是一張置中、最大寬 64vw、兩側有訂書釘的紙片，內放金句 |
| L4 | 三卡並列 | 標題在上；三欄卡，三張的剪裁輪廓與旋轉角度都不同，分別用訂書釘、膠帶固定 |
| L5 | 左文右圖 | 兩欄；左欄標籤、大標、引言；右欄一張微旋轉的相框紙片，右上角貼膠帶，下方圖說 |
| L6 | 流程紙帶 | 深底；標題在上；三張步驟紙片橫排，之間是手繪箭頭 |
| L7 | 對比 | 左右各半；每邊是標籤、標題、一張卡；中縫正中央絕對定位一張旋轉的強調色小紙片（VS） |
| L8 | 數據大字報 | 標題在上；三欄數字紙片（數字、單位、註解），中間那張反白 |
| L9 | 清單便籤 | 深底；5:7；左欄大標；右欄三張全寬便籤直向堆疊，每張左邊手寫字、右邊說明 |
| L10 | 收束 CTA | 墨底；剪貼字置中；底部山景；一張貼膠帶的紙片放行動呼籲 |
| L11 | 目錄 | 深底；5:7；左欄標題；右欄 4 條全寬編號紙條（3–5 條可增減），各自微旋轉 |
| L12 | 時間軸 | 一條撕紙橫軸位於容器 47% 高度、左右出血；4 張節點紙片在 left 3%／28%／53%／78%，上下交替 |
| L13 | 人物團隊 | 三欄；每欄一張方形相框紙片（膠帶或訂書釘）、名字紙條、說明，置中 |
| L14 | 雙欄要點 | 標題在上；兩張並列卡，各 3 段（並列而非對立） |
| L15 | 四宮格 | 深底；2×2 四張卡，角度正負交替，各有大編號 |
| L16 | 表格 | 表頭是一條墨色紙條，資料列是各自微旋轉的紙條；欄寬 1.4:1:1；資料列 ≤4 |
| L17 | 全幅大圖 | 深底；一張 76vw 寬的相框紙片置中，上緣兩角貼膠帶；下方一列左標籤右圖說 |
| L18 | 問答 | 5:7；左欄標題；右欄 2–3 組，每組是強調色標籤（Q）＋紙片（A） |
| L19 | 進度里程碑 | 深底；3–4 條，每條上方左標題右數值，下方一條撕紙填充的進度條 |
| L20 | 圖解 | 7:5；左大圖相框；右欄標題＋3 條編號要點紙片，對應圖上位置 |

### 9.2 幾何風 20 種（`styles/geo-collage/references/grid-layouts.md`，畫布 1600×900、全部絕對定位）

| 編號 | 名稱 | 幾何 |
|---|---|---|
| G1 | 封面 | 左 58% 文字場（小標、88–96px 大標、副標、紅條、說明）；右 42% 幾何演出場，3–5 個格子咬合，含條紋塊與出血的圓 |
| G2 | 章節幕封 | 滿版彩底；單一巨型幾何（直徑 ≥550px，被邊緣切斷）；250px 章號；章名 |
| G3 | 大標題＋副文 | 頂部滿寬深色條（120px）；左側 88px 大標、紅條、一段正文（寬 ≤780px）；右側幾何組合；底部條紋出血 |
| G4 | 左文右幾何 | 左 50% 文字；右 50% 拆成 2×2 演出格，四格四色，每格一個幾何動作 |
| G5 | 三欄並列 | 三個 440px 寬的欄，每欄頂部一個不同族的幾何符號（圓／三角／拱）、標題、紅短條、說明 |
| G6 | 四宮格 | 滿版 2×2（每格 800×450）、四格四色；每格 96px 超大編號（用底色的鄰近色，當背景）、標題、紅條、說明、角落裝飾 |
| G7 | 數據 | 深底；左側條紋直帶出血；三個數字格（400×330），150px 數字、標籤、說明；最多 3 個 |
| G8 | 時間軸 | 橫向深色軸位於 y=450、兩端出血；4–5 個 60px 圓節點；節點資訊上下交替；年份用壓縮字 |
| G9 | 對比（硬對撞） | 左右各 800px，兩種氣質相反的底色；中縫放一個跨越兩邊的圓 |
| G10 | 清單 | 每列是左側 88×88 編號方塊（顏色循環）＋右側 1332px 寬資訊條；列高 88、間距 20；5 條以內 |
| G11 | 目錄 | 深底；左側紅直條出血；4 欄 × 2 列編號方塊陣（330×246），每塊是 74px 編號、標題、一行說明；章數不足時留裝飾塊、不拉伸 |
| G12 | 呼吸頁 | 滿版 3×2 幾何構成，一句金句只佔其中一格；不承載資訊 |
| G13 | 金句 | 滿版彩底；66px 引言（≤20 字）；四角出血幾何；落款 |
| G14 | 流程 | 4 個 300×300 方塊（編號、標題、說明），之間是朝右的三角箭頭；上限 4 步 |
| G15 | 團隊 | 4 個 220px 圓形頭像格，下方姓名與職稱 |
| G16 | 表格 | 66px 深色表頭條；74px 資料列交替淺色；首欄帶彩色左條；不畫格線；上限 4 欄 × 5 列 |
| G17 | 雙欄對照 | 深底；中縫一條亮色直線出血；左右各一個色塊標題條＋5 條清單 |
| G18 | 問答 | 深底；190px 的巨大 Q 字母＋42px 問題；紅分隔條；190px 的巨大 A 字母＋答案 |
| G19 | 進度比例 | 4 條 1200×62 橫向進度條；實心＝已完成、條紋＝進行中；右側超大百分比 |
| G20 | 收尾 | 深底；128px「謝謝」；落款；右側米白資訊塊（下一步、聯絡方式）；出血幾何；底部條紋 |

### 9.3 頑趣實驗室 3D 8 種（`styles/playful-lab-3d/references/layout-patterns.md`）

L1 Monster Ensemble（三個角色從底部或兩側探入，標題在上方 20–30%）；L2 Diagonal Tool Strike（巨型工具從邊緣斜穿頁面，標題與工具方向交叉）；L3 Single Character Manifesto（一個角色佔 45–60%，另一側只留一句大標與一段短說明）；L4 Three Worlds Comparison（三欄或三島，各對應一種角色色）；L5 Material Specimen（放大的材質樣本＋實驗標籤，「避免普通卡片网格」）；L6 Orbit Data（中心角色或概念，周圍 3–5 個數據點以軌道、視線或觸手連接）；L7 Product Stage（純色後牆＋棋盤或實驗台，產品置中，角色在側）；L8 Process Parade（四步橫向或折線路徑，每步由一個工具動作連接）。

好奇果凍 3D（`styles/haoqi-3d/`）只有 demo.html、README、匯出協定，未見獨立的版式文件。

### 9.4 版式與風格是否分離

- 每套風格一個目錄、一套版式庫。`styles/README.md`：「每套视觉风格放在独立目录中，避免 CSS、运行时和素材互相污染。」「风格必须是一套完整视觉语言，而不是只换颜色。」
- 同一風格內，配色與版式分離：剪紙風 14 套配色全部內建在範本的 `body.t1..t14`，左下角換膚面板讓觀眾即時切換；幾何風 7 套同理。`references/themes.md`：「改/加主题只动 template 的 `body.tN` 块 + 面板按钮,别的 CSS 全走 var」。
- 明確主張版式不該當成可切換的皮（`references/layouts.md`）：

> **不做观众侧版式切换**:配色是氛围可以切(换肤面板),版式是叙事结构不该切——别给 deck 加版式切换按钮

- 左右鏡像是一個類別：「所有左右布局(grid-2/grid-7-5/grid-5-7)加 `.flip` 类即整页左右镜像」。
- 幾何風新增版式的規則（`grid-layouts.md`）：「新版式必须**零新 CSS 类** —— 用现有 23 个原子拼出来」；並先確認「多数情况是内容该拆页，不是缺版式」。

### 9.5 選版式

- 剪紙風：「**按内容型选版式**:讲要点→L4/L14/L15;讲过程→L6/L12/L19;讲数据→L8/L16;讲图→L5/L17/L20;讲人→L13;答疑→L18。」敘事弧：鉤子（L1）→地圖（L11）→定調（L2）→主體→轉折（L7 或 L3）→收束（L10）。
- 幾何風：17 列的「你手上的内容→用哪个」速查表，並把相近版式的分界寫清楚（氣質對撞用 G9、同維度列表對照用 G17）。每個版式有容量上限與溢出去向：數字最多 3 個，第 4 個改用表格；流程上限 4 步，5 步以上改時間軸；時間軸節點 ≤5；目錄 8 塊上限。

### 9.6 多樣性規則與檢查

- 剪紙風（底色三檔：預設、深底紙、墨底）：「连续 3 页以上同底色不允许;8 页以上必须有 ≥1 个 `ink` 页;每 3-4 页一个深底呼吸页」。檢查：`grep 'class="slide' index.html` 後人工看（`references/checklist.md` 也列這條）。同頁內：紙片角度正負交替、同頁多張紙片的剪裁輪廓不得全同。
- 幾何風：不得連續 3 頁同底色；每 3–4 頁一個深底或滿版彩；滿版彩一份不超過 3 次；金句最多 2 頁；每 4–5 頁一頁呼吸頁。檢查：`grid-layouts.md` 內嵌一段 Python，解析 `SLIDES.push({…})` 數連續同底色。
- 頑趣 3D：「禁止连续三页使用相同骨架。」「每 3–4 页加入一页高留白 Manifesto。」「数据页之后优先安排角色页或产品舞台，避免连续信息图。」封面與結尾可重複群像但必須換站位。檢查：`references/checklist.md` 的一條勾選項。

---

## 10. ningzimu/codex-ppt-skill（MIT）

每頁是 AI 生圖產生的整張投影片圖片，所以「版式」是提示詞裡的文字規格，不是 CSS。

### 10.1 檔案與數量

- `skills/codex-ppt/references/*.md`：12 個風格參考（党政红风格、创意杂志风、复古扁平插画风、手绘技术解释风、手绘白板风、教学课件风、数据仪表盘风、清爽专业风、温暖手工风、电子墨水杂志风、科研答辩风、麦肯锡风格），每個內含一段 JSON。
- 我解析 12 個 JSON：`layout_blueprints` 合計 35 個（每風格 2–6 個），`layout_patterns` 合計 73 條。
- `docs/style-library.md`（風格檔 schema）、`docs/slide-generation-and-subagents.md`（每頁 brief 的 JSON 範本）、`docs/outline-style-and-sample.md`。

blueprint 的寫法是「區域位置＋數量＋標籤」（`references/电子墨水杂志风.md`，節錄）：

```json
{"name": "data broadsheet", "sections": [
  {"position": "center-left", "count": 1, "labels": ["huge number or keyword"]},
  {"position": "right column", "count": 3, "labels": ["supporting fact 1", "supporting fact 2", "supporting fact 3"]},
  {"position": "bottom-left", "count": 1, "labels": ["source / caveat / time range"]}]}
```

其他 blueprint 的幾何（各風格檔）：

- 创意杂志风「editorial hero spread」：左 45% 超大標題、右 55% 拼貼區、左下 3 個預告短句。「cover story grid」：頂部大標、中央兩塊、右緣 3 條短註。
- 复古扁平插画风：上三分之一全景插畫、中間大標、底部三張卡；或中央主物件、周圍 4 個標註、右下總結牌。
- 手绘技术解释风「technical before-after」：頂部標題、左 before 面板、右 after 面板、中間細箭頭、底部三格（為何重要／取捨／下一步）。「small central concept map」：左上短標題、中央小而精確的概念圖、周圍 4 個標籤、右下一句結論。
- 手绘白板风：左上手寫標題、中央 3 個步驟框與 2 個手繪箭頭、右緣一張便利貼結論。
- 数据仪表盘风：左上標題、右上 4 張 KPI 卡、中左 3 張流程卡、中右折線圖、底部甜甜圈＋長條＋表格；或中央一張大洞見卡、四周 4 個佐證指標。
- 清爽专业风「work review summary」：頂部標題；左欄 3 塊（目标、完成情况、关键结果）；右欄 2 塊（问题与风险、下一步计划）；底部一句結論。
- 科研答辩风（6 個）：例「预期成果／考核指标」＝頂部 3 個標語、中央一張大表、左欄 4 個分類；「风险分析」＝頂部論點句、中間 2×2 四類風險、底部佐證圖與結論。
- 麦肯锡风格（4 個）：封面／章節頁＝頂部小字完整標題，中央一個被重構的巨型核心字，隱喻融進字形，左右邊緣放 3 個詞；關鍵觀點頁＝字體結構佔中央 70%，右上 4 個標籤；分析頁＝中央核心結構（流程／矩陣／漏斗／價值鏈）＋左 2、右 2 輔助模組；框架頁＝主區 2×2 矩陣、座標圖或路線圖＋側欄方法論註。

### 10.2 版式與風格是否分離

- 每頁 brief 把兩者分成不同物件（`docs/slide-generation-and-subagents.md`，節錄）：

```json
"style":  { "name": "…", "deck_consistency": "same palette, typography, icon language, texture, and mood across all slides" },
"layout": {
  "role": "{cover, agenda, section divider, concept, process, comparison, timeline, data evidence, architecture, case study, summary, Q&A, etc.}",
  "intent": "{why this page uses this layout …}",
  "composition": "{specific layout for this slide}",
  "content_zones": "{title zone, body zone, visual zone, footer or callout zones}",
  "variation_rule": "… do not repeat the same blueprint on adjacent slides unless the content is part of a deliberate repeated sequence",
  "relationship_to_previous_slide": "{new layout, continuation layout, mirrored layout, or deliberate repeated sequence}" }
```

- `docs/outline-style-and-sample.md`：

> a deck should have one coherent visual identity, not one repeated composition. Treat each reference as a style system: stable palette, typography, icon language, texture, and visual mood; variable page layout chosen from the slide's content role. `layout_blueprints` are candidate starting points only. Do not apply the same blueprint to every slide.

- 核准的樣張只當風格參考（`prompts/slide-worker.md`）：「match style only, do not copy layout」。
- 限制：blueprint 仍寫在各風格檔裡，是風格專屬的候選，不是跨風格共用的版式庫。有兩個風格（党政红风格、教学课件风）的 blueprint 只寫語意區域（「primary visual field」「supporting field」），沒有具體位置。

### 10.3 選版式

大綱階段每頁要寫「Layout role and intent」（`docs/outline-style-and-sample.md` 列出：cover、agenda、section divider、concept explanation、process、comparison、timeline、data evidence、architecture、case study、summary、Q&A）。生成階段在 `layout.intent` 說明為什麼用這個版式。麦肯锡风格的 `layout_usage_rule` 另外依頁型規定密度：標題／分隔／關鍵訊息頁用一個巨型標題＋一個主隱喻＋低密度；分析／框架／流程頁用 3–6 個主模組＋一個核心結構。

### 10.4 多樣性

- 「Do not reuse the same layout on every page.」「Avoid generating every slide as the same three-card layout.」
- 相鄰頁不得重複同一 blueprint，除非是刻意的重複序列；每頁必填與上一頁的關係（新版式／延續／鏡像／刻意重複）。
- 檢查：`scripts/prepare_slide_prompts.py` 只把 layout 區塊格式化進提示詞並附上「varying layout by slide role」的提醒；我沒看到計算版式種類或相鄰重複的程式。靠 brief 欄位自我宣告與 worker 目視檢查生成圖。

---

## 11. 綜合：依內容型別列出所有不同的排法

只列幾何上彼此不同的排法；「標題在上、內容在下」這種預設排法除非有特別之處不列。

### 單一關鍵陳述

| 排法 | 來源 |
|---|---|
| 左側三分之一留空，中段一句超大細字，右下小註腳，底部一條細線 | GZ-B P3 |
| 整頁分左右兩半：左半巨字，右半灰底解釋 | GZ-B S03 |
| 三行巨字居中段；右上角大片圓點矩陣、左下角圓環矩陣作對角裝飾 | GZ-B 點陣宣言 |
| 上半頁左側四行大字＋右側短說明；下半頁一條出血到三邊的墨色橫帶放反白短句 | GZ-B S12 |
| 整頁只放一個問題，手動斷行，大量留白 | GZ-A L7 |
| 陳述塊垂直置中、左右各 8vw 邊距、靠左對齊，下方署名列 | BHT cobalt-grid manifesto |
| 一張置中的釘書紙片，後方一條左右出血、微旋轉的橫帶橫貫頁面 | PC-紙 L3 |
| 滿版彩底＋短引言＋四個角落都有出血幾何 | PC-幾何 G13 |
| 滿版 3×2 幾何構成，文字只佔其中一格 | PC-幾何 G12 |
| 頂部滿寬深色條＋左大標與一段正文＋右側幾何組合＋底部條紋出血 | PC-幾何 G3 |
| 一個角色佔 45–60%，另一側只有一句大標與短說明 | PC-3D L3 |
| 一個被重構的巨型核心字佔中央，隱喻融進字形，左右邊緣各放小詞 | CDX 麦肯锡 |
| 上列左右分置小資訊；一組單字靠右堆疊；最大標題字靠右下 | BHT broadside fadelist |
| 5 條斜向彩帶橫穿整頁，文字疊在彩帶上、靠左垂直置中 | BHT sakura-chroma stripe |
| 全幅圖形背景上疊一段旋轉 −2° 的置中文字 | BHT retro-zine visual |
| 滿版單色底＋頂天立地的反白巨字（字當圖） | HS 風格 03 母版 |
| 文字本身是舞台：句子被打字、倒帶、折疊；可放在 center、left、lower-third 等 slot | SCR kinetic、text beat |
| 一句 ≤5 個字放在中上，一個產品物件升到中央 | BM anti-ppt |

### 單一大數字

| 排法 | 來源 |
|---|---|
| 全部置中：260px 數字、其下一行、再一段說明 | HPS stat-highlight |
| 左窄欄放巨型數字、標籤、短說明；右寬欄是貼底的堆疊長條圖 | BHT cobalt-grid data |
| 左中一個巨大數字或關鍵字；右欄三條佐證；左下來源與時間範圍 | CDX 电子墨水杂志风 |
| 上方是小卡矩陣，巨數被推到頁面最底 | GZ-B S15 |
| 數字直向置中，數值、單位（小字）、標籤、來源；數字滾動進場 | SCR number beat |
| 數字留在畫面不動，背後的世界更換以帶出脈絡 | BM 概念 8 |
| 巨型數字佔半屏＋小註；或黑底一屏一個數字 | HS 風格 01、02 母版 |
| 先判斷數字關係再選形式：按比例縮放的實物、一條敘事曲線、拆開的整體、左右對照、一個超大物件 | HS deck.md |
| 「One statistic the size of the canvas」 | OS Big number |

### 多個數字／KPI

| 排法 | 來源 |
|---|---|
| 3×2 或 4×2 數據卡，卡內由上到下是小標、大數字、註解 | GZ-A L3 |
| 4 欄等分，每欄底部一根高度由數據決定的色塊，上方圖示、巨數、標籤 | GZ-B S06 |
| 直向帳單：每列以細線分隔，左巨數、中標籤、右圖示，4–6 列 | GZ-B S20 |
| 三欄遞進論點，每欄底部一個巨數，最後一欄用強調色 | GZ-B S18 |
| 左四行大標、中三個 KPI、右下 9 根靠底對齊的直線、底部一個巨數 | GZ-B S21 |
| 5–10 列橫向條形：標籤、細條、末端數字 | GZ-B S07 |
| 上方 60% 全寬圖，下方三欄 KPI | GZ-B S22 |
| 4 個 KPI 一列，各帶升降差值 | HPS kpi-grid |
| 12×8 馬賽克：左側強調色直條、文案欄、三個小數字格、右下一個跨 6 欄的 240px 巨數 | BHT neo-grid-bold stats |
| 左右 1.15:0.85，右欄內放 2×2 小數字 | BHT signal editorial |
| 深底＋左側出血條紋直帶＋三個數字格（150px 數字） | PC-幾何 G7 |
| 4 條橫向進度條，實心與條紋區分完成與進行中，右側超大百分比 | PC-幾何 G19 |
| 三張輪廓與角度各異的數字紙片，中間一張反白 | PC-紙 L8 |
| 撕紙條當進度條，上方左標題右數值 | PC-紙 L19 |
| 中心角色或概念，周圍 3–5 個數據點以軌道或視線連接 | PC-3D L6 |
| 儀表板：左上標題、右上 4 張 KPI、中左 3 張流程卡、中右折線圖、底部三個小圖表 | CDX 数据仪表盘风 |
| 中央一張大洞見卡，四周 4 個佐證指標 | CDX 数据仪表盘风 |
| 不等高卡片的 bento 格，每卡一個洞見 | HS 風格 09 母版 |

### 步驟／流程

| 排法 | 來源 |
|---|---|
| 兩組步驟上下兩列，每步是編號、標題、說明；逐步點亮 | GZ-A L6 |
| 左側大標與描述，右側三張橫向卡由上而下堆疊 | GZ-B S05 |
| 閉環：左側 4 行編號步驟，右側同心圓環 | GZ-B S14 |
| 5 個節點加箭頭的橫向管線，其中一個節點高亮 | HPS flow-diagram |
| 4 欄 NOW／NEXT／LATER／VISION，欄間無間隙 | HPS roadmap |
| 左標籤欄＋12 週欄的甘特圖，5 條軌道 | HPS gantt |
| 3×3 格線：四個步驟在四角，箭頭在四邊中間格 | BHT signal cycle |
| 5 層置中橫帶，寬度由 38% 遞增到 100%，形成金字塔 | BHT signal pyramid |
| 12 欄格線上每個節點佔 2 欄橫排 | BHT neo-grid-bold process |
| 三張微旋轉紙片，之間是手繪箭頭 | PC-紙 L6 |
| 4 個正方形方塊，之間是三角箭頭；上限 4 步 | PC-幾何 G14 |
| 四步橫向或折線路徑，每步由一個工具動作連接 | PC-3D L8 |
| 左上手寫標題、中央 3 個步驟框與手繪箭頭、右緣一張便利貼結論 | CDX 手绘白板风 |
| 中央核心結構（流程、漏斗、價值鏈），左右各 2 個輔助模組 | CDX 麦肯锡 |
| 相機飛越一張大地圖，逐區降落，最後拉遠看全程 | SCR canvas |
| 橫向客戶旅程箭頭流；分層架構盒；瀑布與金字塔 | HS 風格 12 母版 |

### 時間軸

| 排法 | 來源 |
|---|---|
| 直向：左側窄軸欄放圓點與虛線，右側每節點是年份、大字數據、小標、描述；底部一列 4 個 KPI | GZ-B S02 |
| 橫向：一條細線上均布小方塊節點，編號在上、名稱在下 | GZ-B S11 |
| 5 欄＋貫穿橫線＋線上圓點，年份在點上方、文字在點下方 | HPS timeline |
| 撕紙橫軸左右出血，節點紙片上下交替 | PC-紙 L12 |
| 深色橫軸兩端出血，圓節點，資訊上下交替 | PC-幾何 G8 |
| 直向細脊線＋圓點 | BHT signal vtimeline |
| 左右交錯的節點＋虛線曲線連接＋每列一張內容卡 | BHT scatterbrain |
| 橫向軌道：捲動距離正比於真實日期間隔；年份計數器滾動；軌道後方有巨大的淡色年份 | SCR chronology／rail |
| 5 欄日程帳冊（編號、日期、名稱、地點、標記） | BHT long-table cal、sakura-chroma cal |
| 左大區放文獻時間線或技術演進，右欄放佐證，底部結論 | CDX 科研答辩风 |
| 時間軸卡片遞進 | HS 視覺主角表 |

### 前後對比／比較

| 排法 | 來源 |
|---|---|
| 左右各半；左欄整體調淡，右欄全亮；兩欄都有左側直線 | GZ-A L9 |
| 左右兩半，中間一條直向細線先拉開 | GZ-B S08 |
| 同上，但右半換成互動地圖（點、連線、卡片） | GZ-B S08 擴充 |
| 左右各一張卡，中縫正中央一張旋轉的「VS」小紙片 | PC-紙 L7 |
| 左右兩種氣質相反的底色，中縫一個跨越兩邊的圓 | PC-幾何 G9 |
| 深底＋中縫亮色出血直線＋左右各一個色塊標題條與 5 條清單 | PC-幾何 G17 |
| 兩張便利貼，中間一個墨色 versus 圓 | BHT scatterbrain |
| 兩個滿高面板左右並排 | BHT signal compare |
| 兩張圖並排，各有標籤，底部一行結論 | HPS image-compare |
| 優缺兩卡；加減行 diff；雷達圖比較 2 個產品 6 個軸 | HPS pros-cons、diff、chart-radar |
| 三欄或三島，各用一種角色色 | PC-3D L4 |
| 頂部標題、左 before 面板、右 after 面板、中間細箭頭、底部三格（為何重要／取捨／下一步） | CDX 手绘技术解释风 |
| 2–4 個項目＋分隔線＋一句裁決 | SCR compare beat |
| 畫面分割，移動的分割線本身就是轉場，每移一次＝一個功能 | BM 概念 4 |
| 2×2 矩陣或座標圖＋側欄方法論註 | CDX 麦肯锡、HS 風格 16 |
| Before／After 對比卡＋中間箭頭 | HS 視覺主角表 |

### 引言

| 排法 | 來源 |
|---|---|
| 放大的引文、其下一行較淡的原文、一列出處與日期 | GZ-A L8 |
| 全部置中：140px 引號、56px 斜體引文、署名 | HPS big-quote |
| 垂直置中、靠左；引號 8vw、引文限寬 78% | BHT signal quote |
| 引文框靠左，右側留一條直向藝術條 | BHT cobalt-grid quote |
| 12 欄：照片佔左 5 欄全高；引文佔右上；署名佔右下左段；標記佔右下角 | BHT neo-grid-bold quote |
| 引言疊在斜向彩帶上 | BHT sakura-chroma stripe |
| 釘書紙片＋橫帶 | PC-紙 L3 |
| 半頁大引號；真人頭像＋引言卡排成 2×2 或 1×4 | HS 視覺主角表 |
| block、引號標記、逐字、署名四個部件，可放任一 slot | SCR quote beat |

### 條列

| 排法 | 來源 |
|---|---|
| 左 2 右 3：標題在左、清單在右，垂直置中 | BHT signal list |
| 每列是左側方形編號塊（顏色循環）＋右側長資訊條 | PC-幾何 G10 |
| 5:7：左大標，右側三張全寬便籤堆疊，每張左手寫字右說明 | PC-紙 L9 |
| 巨大的 Q 字母＋問題、分隔條、巨大的 A 字母＋答案 | PC-幾何 G18 |
| 5:7：左標題，右側多組「強調色標籤＋紙片」 | PC-紙 L18 |
| 3×2 六格，格間用細線，每格是圖示、編號、短標、一行描述 | GZ-B S04 |
| 3×2 微卡，主文在左上、小字在右下、中間留空，只有一張用強調色 | GZ-B S16 |
| 頂部一條短強調線＋四欄等分 | GZ-B S19 |
| 左側約 5/16 的墨色主塊，右側三張橫向卡各有巨大編號 | GZ-B S13 |
| 三個等寬欄，每欄頂部一個不同族的幾何符號 | PC-幾何 G5 |
| 滿版 2×2 四色格，超大編號當背景 | PC-幾何 G6 |
| 2×2 四張卡，角度正負交替 | PC-紙 L15 |
| 四塊拼貼片各據一角並旋轉 | BHT retro-zine collage |
| 主便利貼周圍 2–4 張小便利貼的自由群聚 | BHT scatterbrain |
| 窄置中欄的菜單式清單：編號｜品項＋說明｜右對齊標籤 | BHT long-table menu |
| 中央一個主物件，周圍 4 個標註，右下一塊總結牌 | CDX 复古扁平插画风、手绘白板风 |
| 每條包在卡片裡；勾選清單 | HPS bullets、todo-checklist |
| 標題＋最多 5 條、每條不得換行 | OS |
| 取代三張並排卡的做法：同句換字、圖示公轉、容器不動內容換、一個大物件左右夾小字 | BM 呈現功能選單 |

### 圖＋文

| 排法 | 來源 |
|---|---|
| 7:5 左文右圖：左欄標題貼頂、引述塊貼底；右圖貼頂 | GZ-A L4 |
| 8:4 文主圖輔：左欄多層文字，右欄直式或方形圖 | GZ-A L10 |
| 上方 60% 全寬圖，白底標題塊疊在圖的左上，下方說明與三欄 KPI | GZ-B S22 |
| 圖鋪滿整頁，底部漸層，標題塊錨定左下 | HPS image-full-bleed |
| 圖文 50/50，一個類別即可左右對調 | HPS image-text-split、PC-紙 `.flip` |
| 一張不裁切的圖＋圖說（截圖、圖解用） | HPS image-single |
| 7 格 bento，第一格佔 2×2 | HPS image-grid |
| 3×2 固定高圖框，圖說在框內底邊 | GZ-A L5 |
| 右欄一張微旋轉的相框紙片，角落貼膠帶 | PC-紙 L5 |
| 一張 76vw 寬的大相框置中，下方一列左標籤右圖說 | PC-紙 L17 |
| 7:5 左大圖，右側編號要點對應圖上位置 | PC-紙 L20 |
| 左 50% 文字，右 50% 拆成 2×2 四色格 | PC-幾何 G4 |
| 左右各半，圖高固定 55vh | BHT signal split |
| 拍立得相框在一側，文字便利貼群在另一側 | BHT scatterbrain |
| 12×8 馬賽克：兩張照片、標題塊、說明格各佔不同格線區 | BHT neo-grid-bold cover |
| 插圖放在文字右側的粉彩圓底上，不與文字重疊 | OS fieldwork 主題 |
| 右欄一個可出血到底邊的大色塊 | OS pommi 主題 |
| 照片放大到 122% 出血，圖說置中靠下 | SCR launch photo |
| 純色後牆＋實驗台，產品置中，角色在側 | PC-3D L7 |
| 放大的材質樣本＋實驗標籤 | PC-3D L5 |
| 左欄論點塊與證據塊，右半是圖版，底部一條等寬字的中繼資訊 | CDX 电子墨水杂志风 |
| 上三分之一全景插畫，中間大標，底部三張卡 | CDX 复古扁平插画风 |
| 產品 UI 截圖＋描邊裝置框 | HS 視覺主角表 |

### 表格／資料

| 排法 | 來源 |
|---|---|
| 帳冊式 5 欄表，每列平均撐滿高度 | BHT cobalt-grid table |
| 表頭是一條墨色紙條，資料列是各自微旋轉的紙條，≤4 列 | PC-紙 L16 |
| 深色表頭條＋交替淺色列＋首欄彩色左條，不畫格線，上限 4×5 | PC-幾何 G16 |
| 資料表，數字靠右 | HPS table |
| 標題是整句結論，下方獨佔一張圖，標註直接嵌在圖裡 | HS 風格 15、19 母版 |
| 左 5 欄放標題與說明，右 7 欄放圖表 | BHT neo-grid-bold chart |
| 左甜甜圈、右圖例（色塊｜名稱｜數值） | BHT signal pie、HPS chart-pie |
| 圖表框 1600×900，標題在框上方，右側留 360px 給線尾名牌，分步變形 | SCR data chart |
| 頂部 3 個標語，中央一張大表，左欄分類 | CDX 科研答辩风 |
| 橫貫全屏的波形線，標註點在線上；或上下並置兩條對照波形 | HS 風格 14 母版 |
| 多欄散文裡內嵌指標卡 | HS 風格 17 母版 |

### 封面

| 排法 | 來源 |
|---|---|
| 暗色頁，內容整體垂直置中，全場最大字級 | GZ-A L1 |
| 整頁鋪滿主色，背景是字元呼吸紋理，反白細字大標 | GZ-B 預設封面 |
| 三列橫帶，每列左大編號右大標題 | GZ-B S01 |
| 內容整塊貼底，不顯示頁框 | BHT signal、broadside cover |
| 標題在左上限寬 60%；右側一條藝術欄；右緣垂直置中一疊直書資訊；頁尾欄在左下 | BHT cobalt-grid cover |
| 12×8 馬賽克：左照片條全高、中面板、標題塊、右照片、說明格 | BHT neo-grid-bold cover |
| 暗漸層上一張色卡：編號左上、導覽右上、標題左下 | FS Bold Signal |
| 上白下藍的水平分割，四角放品牌標記 | FS Electric Studio |
| 左右雙色的垂直分割 | FS Split Pastel、Creative Voltage |
| 暗底上一張紙卡，右緣一排彩色索引標籤 | FS Notebook Tabs |
| 剪貼字置中，底部撕紙山景，不放插畫 | PC-紙 L1 |
| 左 58% 文字場，右 42% 幾何演出場（格子咬合，含出血的圓） | PC-幾何 G1 |
| 三個角色從底部或兩側探入，標題在上方 20–30% | PC-3D L1 |
| 左 45% 超大標題，右 55% 拼貼區，左下 3 個預告短句 | CDX 创意杂志风 |
| 頂部大標，中央兩塊，右緣 3 條短註 | CDX 创意杂志风 |
| 靠左垂直置中：小標、大標、引言段、一排 pill | HPS cover |
| 大字＋刊頭＋直柱 | HS 視覺主角表 |

### 章節分隔

| 排法 | 來源 |
|---|---|
| 只有一行小字、巨大標題、一行引語；相鄰幕封明暗交替 | GZ-A L2 |
| 全部置中：編號小標、112px 標題、短強調線、一句話 | HPS section-divider |
| 12 欄：左 4 欄是 320px 巨型章號窗格，右 8 欄是標題窗格 | BHT neo-grid-bold section |
| 文字框靠左垂直置中，右側留給藝術塊 | BHT cobalt-grid chapter |
| 墨底 5:7：左欄一塊撕邊大色塊放巨型章號，右欄標題 | PC-紙 L2 |
| 滿版彩底＋一個被邊緣切斷的巨型幾何＋250px 章號 | PC-幾何 G2 |
| 巨型工具從邊緣斜穿頁面，標題與工具方向交叉 | PC-3D L2 |
| 大色塊上只有一個詞 | HS 風格 01 母版 |

### 議程

| 排法 | 來源 |
|---|---|
| 2×3 編號卡 | HPS toc |
| 12 欄：標題佔上兩列，六個項目各 4 欄 × 3 列 | BHT neo-grid-bold toc |
| 頂列標題左、標籤右；下方 2 欄 × 3 列，每項是窄編號欄＋文字 | BHT cobalt-grid index |
| 4 欄目錄卡，卡頂色帶，規格列貼卡底 | BHT sakura-chroma catalogue |
| 5:7：左標題，右側 3–5 條全寬編號紙條 | PC-紙 L11 |
| 深底＋左側出血紅直條＋4×2 編號方塊陣，章數不足時留裝飾塊 | PC-幾何 G11 |
| 3–5 個項目 | OS Agenda |

GZ-A 與 GZ-B 的登記版式裡沒有專屬的議程頁。

### 結尾

| 排法 | 來源 |
|---|---|
| 整頁分兩半：左半主色放宣言，右半白底放 3 條重點，第三條用強調色 | GZ-B 收尾 |
| 問題頁當收尾 | GZ-A L7 |
| 12 欄：標題佔左 8 欄、QR 佔右 4 欄；下方三個步驟格 | BHT neo-grid-bold cta |
| 標題靠右對齊於 28% 高度，藝術塊在左，底部 4 欄頁尾 | BHT cobalt-grid colophon |
| 最大寬 700px 的置中卡 | BHT retro-zine rsvp |
| 墨底＋剪貼字＋山景＋一張貼膠帶的行動呼籲紙片 | PC-紙 L10 |
| 深底＋128px「謝謝」＋落款＋右側米白資訊塊（下一步、聯絡方式） | PC-幾何 G20 |
| 大標＋按鈕；致謝頁 | HPS cta、thanks |
| 大字封底＋橢圓網址按鈕 | HS 視覺主角表 |
| 與封面相同的角色群像，但換站位 | PC-3D |

---

## 12. 版式與風格解耦的主要模式

1. 主題只放變數、版式另成一庫（HPS）：主題檔約 20 行變數覆寫，版式檔自帶結構 CSS 且顏色全走變數；36×36 任意組合，放映時按鍵即時換主題而版式不動。
2. 同一風格家族內「配色可切、版式不可切」（PC、GZ）：配色寫成根節點上的一個類別或屬性，版式庫對該家族所有配色通用；但字體、質感、版式庫仍綁在家族上。
3. 內容、定位、配色、版面四者分檔（SCR）：內容檔只寫型別與 slot；slot 是「畫面比例座標＋區塊錨點」；配色檔只准放變數；版面另一個檔。
4. 每頁規格把 style 與 layout 拆成兩個物件（CDX）：style 整份固定，layout 逐頁依角色變化，並要填「與上一頁的關係」。
5. 共用頁型詞彙＋獨立的表面修飾（BHT 的 A 類）：頁型類別與 `dark／light` 類別分開；官方把它當封閉系統，但實質是同骨架換外觀。
6. 把「結構」當成可量測的東西來驗證（HS、BM、GZ-B）：HS 用截圖邊緣指紋比骨架相關度；BM 用五欄結構指紋與 grep 規則；GZ-B 要求每頁標註登記的版式編號並由驗證器檢查。
7. 反例（FS、OS、HS 的母版、BHT 官方規則）：版式由風格文件推導或寫在風格條目裡，換風格就換了版式。

做得最好的是 lewislulu/html-ppt-skill：解耦最徹底、檔案結構最簡單。它的弱點是 36 個版式本身偏傳統。版式詞彙最豐富的是 guizang 瑞士風（22 種）與 paper-collage 幾何風（20 種），選版式規則最完整的也是這兩者，但它們的版式都綁定自己的風格。架構最嚴謹的是 scrolline（slot 與分檔）。
